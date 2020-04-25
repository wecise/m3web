/*
 *Copyright (c) 20015-2022, Wecise Ltd
 *
 *      __  __   ____
 *     |  \/  | |__ /
 *     | \  / |  |_ \
 *     | |\/| | |___/
 *     | |  | |
 *     |_|  |_|
 *
 *
 */
class Analysis {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["ai-robot-component",
                            "search-preset-component",
                            "search-base-component",
                            "search-base-ext-component",
                            "topological-graph-component"
                        ],function() {

            $(function() {

                // 事件
                Vue.component("search-event",{
                    delimiters: ['#{', '}#'],
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            options: {
                                // 视图定义
                                view: {
                                    eidtEnable: false,
                                    show: false,
                                    value: "all"
                                },
                                // 搜索窗口
                                window: { name:"所有", value: ""},
                                // 输入
                                term: "",
                                // 指定类
                                class: "#/matrix/devops/event:",
                                // 指定api
                                api: {parent: "event",name: "event_list.js"},
                                // 其它设置
                                others: {
                                    // 是否包含历史数据
                                    ifHistory: false,
                                    // 是否包含Debug信息
                                    ifDebug: false,
                                    // 指定时间戳
                                    forTime:  ' for vtime ',
                                }
                            },
                            result: [
                                
                            ],
                            control:{
                                ifFullScreen: false,
                                minus: false
                            }
                        }
                    },
                    template:   `<el-container style="height:100%;background:#fff;">
                                    <el-header style="height:40px;line-height:40px;display:flex;flex-wrap:nowrap;">
                                        <span style="font-size:15px;width:5%;">#{model.title}#</span>
                                        <span style="width:80%;">
                                            <search-base-ext-component :options="options" ref="searchRef"></search-base-ext-component>
                                        </span>
                                        <span style="width:15%;text-align:right;"> 
                                            <el-button type="text" icon="el-icon-minus" @click="control.minus=!control.minus"></el-button>
                                            <el-button type="text" :icon="control.ifFullScreen | pickScreenStyle" @click="onFullScreen"></el-button>
                                            <el-button type="text" icon="el-icon-close"></el-button>
                                        </span>
                                    </el-header>
                                    <el-container style="border-top:1px solid #ddd;height:calc(100% - 40px);" v-if="!control.minus">
                                        <el-main :style="result | pickMainStyle" ref="mainView">
                                            <el-row :gutter="20">
                                                <el-col :span="8" v-for="item in model.rows" :key="item.id">
                                                    <el-card :style="item | pickBgStyle" >
                                                        <span class="el-icon-warning" :style="item | pickStyle"></span>
                                                        <p>服务器:#{item.host}#</p>
                                                        <p>IP地址:#{item.ip}#</p>
                                                        <p>告警时间：#{moment(item.vtime).format("LLL")}#</p>
                                                        <p>告警内容：#{item.msg}#</p>
                                                        <el-button type="text" @click="onClick(item)">详细</el-button>
                                                    </el-card>
                                                </el-col>
                                            </el-row>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    filters:{
                        pickMainStyle(item){
                            if(_.isEmpty(item)){
                                return `height:100%;`;
                            } else {
                                return `background:#ddd;height:100%;`
                            }
                        },
                        pickScreenStyle(evt){
                            if(evt){
                                return `el-icon-copy-document`;
                            } else {
                                return `el-icon-full-screen`;
                            }
                        },
                        pickBgStyle(item){
                            let hexToRgba = function(hex, opacity) {
                                var RGBA = "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt( "0x" + hex.slice(5, 7)) + "," + opacity + ")";
                                return {
                                    red: parseInt("0x" + hex.slice(1, 3)),
                                    green: parseInt("0x" + hex.slice(3, 5)),
                                    blue: parseInt("0x" + hex.slice(5, 7)),
                                    rgba: RGBA
                                }
                            };
                            let rgbaColor = hexToRgba(mx.global.register.event.severity[item.severity][2],0.1).rgba;
                            return `background:linear-gradient(to top, ${rgbaColor}, rgb(255,255,255));border: 1px solid rgb(247, 247, 247);border-radius: 5px;box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;line-height:1.5;margin-bottom:10px;`;
                        },
                        pickStyle(item) {
                            return `color:${mx.global.register.event.severity[item.severity][2]};font-size:40px;float:right;`;
                        }
                    },
                    methods: {
                        onFullScreen(){
                            if (screenfull.isEnabled) {
                                if(this.control.ifFullScreen){
                                    screenfull.exit(this.$el);
                                    this.control.ifFullScreen = false;   
                                } else {
                                    screenfull.request();
                                    this.control.ifFullScreen = true;
                                }   
                            }
                        }
                    }
                })

                // 性能 曲线
                Vue.component("curve-chart",{
                    delimiters: ['#{','}#'],
                    props: {
                        title: String,
                        model: Object,
                        height: String,
                    },
                    template: `<div :style="'width:100%;background:#f7f7f7;height:'+height"></div>`,
                    data(){
                        return {
                            chart: null,
                            type: "nearest1hour",
                            legendData: ['max','min','value'],
                            colors: ["#F58080", "#47D8BE", "#F9A589"],
                            option: {
                                title: {
                                    text: "",
                                    left: 'center',
                                    textStyle: {
                                        fontSize: '14px',
                                        color: '#999'
                                    }
                                },
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    color: [],
                                    data: [],
                                    left: 'center',
                                    bottom: 'bottom'
                                },
                                grid: {
                                    top: 'middle',
                                    left: '3%',
                                    right: '4%',
                                    bottom: '3%',
                                    height: '80%',
                                    containLabel: true
                                },
                                xAxis: {
                                    type: 'category',
                                    data: [],
                                    axisLine: {
                                        lineStyle: {
                                            color: "#999"
                                        }
                                    }
                                },
                                yAxis: {
                                    type: 'value',
                            
                                    splitLine: {
                                        lineStyle: {
                                            type: 'dashed',
                                            color: '#DDD'
                                        }
                                    },
                                    axisLine: {
                                        show: false,
                                        lineStyle: {
                                            color: "#333"
                                        },
                                    },
                                    nameTextStyle: {
                                        color: "#999"
                                    },
                                    splitArea: {
                                        show: false
                                    }
                                },
                                series: []
                            }
                        }
                    },
                    created(){
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);

                        this.option.title.text=this.title;

                        this.initData();
                        
                    },
                    mounted(){
                        this.chart = echarts.init(this.$el);
                        this.chart.setOption(this.option);
                    },
                    methods:{
                        initData(){
                            let rtn = fsHandler.callFsJScript("/matrix/analysis/performance.js", encodeURIComponent(this.model.id)).message;
                            let sData = _.sortBy(rtn.rows[this.type].baseline,['vtime'],['asc']);
                            _.extend(this.option.legend,{data:this.legendData, color:this.colors});
                            _.extend(this.option.xAxis, {data: _.map(sData,(v)=>{
                                return moment(v.vtime).format("HH:MM");
                            })})
                            console.log(this.option.xAxis)
                            _.extend(this.option, {
                                series: _.map(['max','min','value'],(v,index)=>{
                                    return {
                                        name: '响应时间',
                                        type: 'line',
                                        data: _.map(sData,v),
                                        lineStyle: {
                                            normal: {
                                                width: 1,
                                                color: {
                                                    type: 'linear',
                            
                                                    colorStops: [{
                                                            offset: 0,
                                                            color: this.colors[index] // 0% 处的颜色
                                                        },
                                                        {
                                                            offset: 0.4,
                                                            color: '#F9A589' // 100% 处的颜色
                                                        }, {
                                                            offset: 1,
                                                            color: '#F9A589' // 100% 处的颜色
                                                        }
                                                    ],
                                                    globalCoord: false // 缺省为 false
                                                },
                                                shadowColor: 'rgba(249,165,137, 0.5)',
                                                shadowBlur: 10,
                                                shadowOffsetY: 7
                                            }
                                        },
                                        itemStyle: {
                                            normal: {
                                                color: this.colors[index],
                                                borderWidth: 5,
                                                borderColor: this.colors[index]
                                            }
                                        },
                                        smooth: true
                                    }
                                })
                            })

                        },
                        checkChart(){
                            if(this.$el){
                                this.chart.resize();
                            } else {
                                setTimeout(this.checkChart, 50);
                            }
                        }
                    }
                })

                // 性能
                Vue.component("search-performance",{
                    delimiters: ['#{', '}#'],
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            options: {
                                // 视图定义
                                view: {
                                    eidtEnable: false,
                                    show: false,
                                    value: "all"
                                },
                                // 搜索窗口
                                window: { name:"所有", value: ""},
                                // 输入
                                term: "",
                                // 指定类
                                class: "#/matrix/devops/performance:",
                                // 指定api
                                api: {parent: "event",name: "event_list.js"},
                                // 其它设置
                                others: {
                                    // 是否包含历史数据
                                    ifHistory: false,
                                    // 是否包含Debug信息
                                    ifDebug: false,
                                    // 指定时间戳
                                    forTime:  ' for vtime ',
                                }
                            },
                            result: [
                                
                            ],
                            control:{
                                ifFullScreen: false
                            }
                        }
                    },
                    template:   `<el-container style="height:100%;background:#fff;">
                                    <el-header style="height:40px;line-height:40px;display:flex;flex-wrap:nowrap;">
                                        <span style="font-size:15px;width:5%;">#{model.title}#</span>
                                        <span style="width:80%;">
                                            <search-base-ext-component :options="options" ref="searchRef"></search-base-ext-component>
                                        </span>
                                        <span style="width:15%;text-align:right;"> 
                                            <el-button type="text" icon="el-icon-minus"></el-button>
                                            <el-button type="text" icon="el-icon-full-screen"></el-button>
                                            <el-button type="text" icon="el-icon-close"></el-button>
                                        </span>
                                    </el-header>
                                    <el-container style="border-top:1px solid #ddd;height:calc(100% - 40px);">
                                        <el-main :style="result | pickMainStyle" ref="mainView">
                                            <el-row :gutter="20">
                                                <el-col :span="8" v-for="item in model.rows" :key="item.id">
                                                    <curve-chart :title="item | pickTitle" :model="item" height="180px"></curve-chart>
                                                    <el-button type="text" @click="onClick(item)">详细</el-button>
                                                </el-col>
                                            </el-row>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    filters:{
                        pickTitle(item){
                            return `${item.host} / ${item.inst} / ${item.param}`;
                        },
                        pickMainStyle(item){
                            if(_.isEmpty(item)){
                                return `height:100%;`;
                            } else {
                                return `background:#ddd;height:100%;`
                            }
                        },
                        pickScreenStyle(evt){
                            if(evt){
                                return `el-icon-copy-document`;
                            } else {
                                return `el-icon-full-screen`;
                            }
                        },
                        pickBgStyle(item){
                            let hexToRgba = function(hex, opacity) {
                                var RGBA = "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt( "0x" + hex.slice(5, 7)) + "," + opacity + ")";
                                return {
                                    red: parseInt("0x" + hex.slice(1, 3)),
                                    green: parseInt("0x" + hex.slice(3, 5)),
                                    blue: parseInt("0x" + hex.slice(5, 7)),
                                    rgba: RGBA
                                }
                            };
                            let rgbaColor = hexToRgba(mx.global.register.event.severity[item.severity][2],0.1).rgba;
                            return `background:linear-gradient(to top, ${rgbaColor}, rgb(255,255,255));border: 1px solid rgb(247, 247, 247);border-radius: 5px;box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;line-height:1.5;margin-bottom:10px;`;
                        },
                        pickStyle(item) {
                            return `color:${mx.global.register.event.severity[item.severity][2]};font-size:40px;float:right;`;
                        }
                    },
                    methods: {
                        onFullScreen(){
                            if (screenfull.isEnabled) {
                                if(this.control.ifFullScreen){
                                    screenfull.exit(this.$el);
                                    this.control.ifFullScreen = false;   
                                } else {
                                    screenfull.request();
                                    this.control.ifFullScreen = true;
                                }   
                            }
                        }
                    }
                })

                // 实体
                Vue.component("search-entity",{
                    delimiters: ['#{', '}#'],
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            options: {
                                // 视图定义
                                view: {
                                    eidtEnable: false,
                                    show: false,
                                    value: "all"
                                },
                                // 搜索窗口
                                window: { name:"所有", value: ""},
                                // 输入
                                term: "",
                                // 指定类
                                class: "#/matrix/entity:",
                                // 指定api
                                api: {parent: "entity",name: "entity_list.js"},
                                // 其它设置
                                others: {
                                    // 是否包含历史数据
                                    ifHistory: false,
                                    // 是否包含Debug信息
                                    ifDebug: false,
                                    // 指定时间戳
                                    forTime:  ' for vtime ',
                                }
                            },
                            result: [
                                
                            ],
                            control:{
                                ifFullScreen: false
                            }
                        }
                    },
                    template:   `<el-container style="height:100%;background:#fff;">
                                    <el-header style="height:40px;line-height:40px;display:flex;flex-wrap:nowrap;">
                                        <span style="font-size:15px;width:5%;">#{model.title}#</span>
                                        <span style="width:80%;">
                                            <search-base-ext-component :options="options" ref="searchRef"></search-base-ext-component>
                                        </span>
                                        <span style="width:15%;text-align:right;"> 
                                            <el-button type="text" icon="el-icon-minus"></el-button>
                                            <el-button type="text" icon="el-icon-full-screen"></el-button>
                                            <el-button type="text" icon="el-icon-close"></el-button>
                                        </span>
                                    </el-header>
                                    <el-container style="border-top:1px solid #ddd;height:calc(100% - 40px);">
                                        <el-main style="height:100%;" ref="mainView">
                                            <el-row :gutter="20">
                                                <el-col :span="6" :key="item.id" v-for="item in model.rows" v-if="model.rows">
                                                    <el-button type="default" 
                                                        style="max-width: 20em;width: 20em;height:auto;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
                                                        @click="forward(item)">
                                                        <el-image style="width:64px;margin:5px;" :src="item | pickIcon"></el-image>
                                                        <div>
                                                            <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">名称：#{item.name}#</p>
                                                            <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">ID：#{item.id}#</p>
                                                            <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">创建时间：#{moment(item.vtime).format("YYYY-MM-DD hh:mm:ss")}#</p>
                                                            <!--p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">标签：<input type="text" class="tags" name="tags" :value="item|pickTags"></p-->
                                                        </div>
                                                    </el-button>
                                                </el-col>
                                            </el-row>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    filters: {
                        pickIcon(item){
                            try{
                                let ftype = _.last(item.class.split("/"));
                                return `${window.ASSETS_ICON}/entity/png/${ftype}.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                            }
                            catch(error){
                                return `${window.ASSETS_ICON}/entity/png/matrix.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                            }

                        }
                    },
                    methods:{
                        forward(item){
                            let url = `/matrix/entity?term=${window.btoa(encodeURIComponent(item.id))}`;
                            window.open(url,'_blank');
                        }
                    }
                })

                //  变更单
                Vue.component("search-change",{
                    delimiters: ['#{', '}#'],
                    props:{
                        model:Object
                    },
                    data(){
                        return {
                            options: {
                                // 视图定义
                                view: {
                                    eidtEnable: false,
                                    show: false,
                                    value: "all"
                                },
                                // 搜索窗口
                                window: { name:"所有", value: ""},
                                // 输入
                                term: "",
                                // 指定类
                                class: "#/matrix/devops/change:",
                                // 指定api
                                api: {parent: "event",name: "event_list.js"},
                                // 其它设置
                                others: {
                                    // 是否包含历史数据
                                    ifHistory: false,
                                    // 是否包含Debug信息
                                    ifDebug: false,
                                    // 指定时间戳
                                    forTime:  ' for vtime ',
                                }
                            },
                            result: [
                                
                            ],
                            control:{
                                ifFullScreen: false
                            }
                        }
                    },
                    template:   `<el-container style="height:100%;background:#fff;">
                                    <el-header style="height:40px;line-height:40px;display:flex;flex-wrap:nowrap;">
                                        <span style="font-size:15px;width:5%;">#{model.title}#</span>
                                        <span style="width:80%;">
                                            <search-base-ext-component :options="options" ref="searchRef"></search-base-ext-component>
                                        </span>
                                        <span style="width:15%;text-align:right;"> 
                                            <el-button type="text" icon="el-icon-minus"></el-button>
                                            <el-button type="text" icon="el-icon-full-screen"></el-button>
                                            <el-button type="text" icon="el-icon-close"></el-button>
                                        </span>
                                    </el-header>
                                    <el-container style="border-top:1px solid #ddd;">
                                        <el-main :style="result | pickMainStyle" ref="mainView">
                                            <el-row :gutter="20">
                                                <el-col :span="8" v-for="item in model.rows" :key="item.id">
                                                    <el-card :style="item | pickBgStyle" >
                                                        <span class="el-icon-warning" :style="item | pickStyle"></span>
                                                        <p>服务器:#{item.host}#</p>
                                                        <p>IP地址:#{item.ip}#</p>
                                                        <p>告警时间：#{moment(item.vtime).format("LLL")}#</p>
                                                        <p>告警内容：#{item.msg}#</p>
                                                        <el-button type="text" @click="onClick(item)">详细</el-button>
                                                    </el-card>
                                                </el-col>
                                            </el-row>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    filters:{
                        pickMainStyle(item){
                            if(_.isEmpty(item)){
                                return `height:100%;`;
                            } else {
                                return `background:#ddd;height:100%;`
                            }
                        },
                        pickScreenStyle(evt){
                            if(evt){
                                return `el-icon-copy-document`;
                            } else {
                                return `el-icon-full-screen`;
                            }
                        },
                        pickBgStyle(item){
                            let hexToRgba = function(hex, opacity) {
                                var RGBA = "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt( "0x" + hex.slice(5, 7)) + "," + opacity + ")";
                                return {
                                    red: parseInt("0x" + hex.slice(1, 3)),
                                    green: parseInt("0x" + hex.slice(3, 5)),
                                    blue: parseInt("0x" + hex.slice(5, 7)),
                                    rgba: RGBA
                                }
                            };
                            let rgbaColor = hexToRgba(mx.global.register.event.severity[item.severity][2],0.1).rgba;
                            return `background:linear-gradient(to top, ${rgbaColor}, rgb(255,255,255));border: 1px solid rgb(247, 247, 247);border-radius: 5px;box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;line-height:1.5;margin-bottom:10px;`;
                        },
                        pickStyle(item) {
                            return `color:${mx.global.register.event.severity[item.severity][2]};font-size:40px;float:right;`;
                        }
                    },
                    methods: {
                        onFullScreen(){
                            if (screenfull.isEnabled) {
                                if(this.control.ifFullScreen){
                                    screenfull.exit(this.$el);
                                    this.control.ifFullScreen = false;   
                                } else {
                                    screenfull.request();
                                    this.control.ifFullScreen = true;
                                }   
                            }
                        }
                    }
                })

                //  图
                Vue.component("search-graph",{
                    delimiters: ['#{', '}#'],
                    props:{
                        model:Object
                    },
                    data(){
                        return {
                            options: {
                                // 视图定义
                                view: {
                                    eidtEnable: false,
                                    show: false,
                                    value: "all"
                                },
                                // 搜索窗口
                                window: { name:"所有", value: ""},
                                // 输入
                                term: "",
                                // 指定类
                                class: "#/matrix/:",
                                // 指定api
                                api: {parent: "event",name: "event_list.js"},
                                // 其它设置
                                others: {
                                    // 是否包含历史数据
                                    ifHistory: false,
                                    // 是否包含Debug信息
                                    ifDebug: false,
                                    // 指定时间戳
                                    forTime:  ' for vtime ',
                                }
                            },
                            result: [
                                
                            ],
                            control:{
                                ifFullScreen: false
                            },
                            graph:null
                        }
                    },
                    template:   `<el-container style="height:100%;background:#fff;">
                                    <el-header style="height:40px;line-height:40px;display:flex;flex-wrap:nowrap;">
                                        <span style="font-size:15px;width:5%;">#{model.title}#</span>
                                        <span style="width:80%;">
                                            <search-base-ext-component :options="options" ref="searchRef"></search-base-ext-component>
                                        </span>
                                        <span style="width:15%;text-align:right;"> 
                                            <el-button type="text" icon="el-icon-minus"></el-button>
                                            <el-button type="text" icon="el-icon-full-screen"></el-button>
                                            <el-button type="text" icon="el-icon-close"></el-button>
                                        </span>
                                    </el-header>
                                    <el-container style="border-top:1px solid #ddd;height:calc(100% - 40px);">
                                        <el-main :style="result | pickMainStyle" ref="mainView">
                                            <div ref="graph"></div>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    filters:{
                        pickMainStyle(item){
                            if(_.isEmpty(item)){
                                return `height:100%;`;
                            } else {
                                return `background:#ddd;height:100%;`
                            }
                        }
                    },
                    watch: {
                        'model.rows':{
                            handler(val,oldVal){
                                this.graph.graphScript = {value: `match (${val}) - [*1] -> ()`};
                                this.graph.search(this.graph.graphScript[0].value);
                            }
                        }
                    },
                    mounted(){
                        this.$nextTick().then(()=>{
                            this.init();
                        })
                    },
                    methods: {
                        init(){
                            this.graph = new Topological();
                            this.graph .init();
                            this.graph .graphScript = {value: `match (${this.model.rows}) - [*1] -> ()`};
                            this.graph .mount(this.$refs.graph);
                            
                        },
                        onFullScreen(){
                            if (screenfull.isEnabled) {
                                if(this.control.ifFullScreen){
                                    screenfull.exit(this.$el);
                                    this.control.ifFullScreen = false;   
                                } else {
                                    screenfull.request();
                                    this.control.ifFullScreen = true;
                                }   
                            }
                        }
                    }
                })


                this.app = new Vue({
                    delimiters: ['#{', '}#'],
                    data:{
                        options: {
                            // 视图定义
                            view: {
                                eidtEnable: false,
                                show: false,
                                value: "all"
                            },
                            // 搜索窗口
                            window: { name:"所有", value: ""},
                            // 输入
                            term: "",
                            // 指定类
                            class: "#/matrix/:",
                            // 指定api
                            api: {parent: "analysis",name: "searchByTerm.js"},
                            // 其它设置
                            others: {
                                // 是否包含历史数据
                                ifHistory: false,
                                // 是否包含Debug信息
                                ifDebug: false,
                                // 指定时间戳
                                forTime:  ' for vtime ',
                            }
                        },
                        result: [
                            {id:_.now(),type:"event",title: "事件",model:[]},
                            {id:_.now(),type:"performance",title: "性能",model:[]},
                            {id:_.now(),type:"entity",title: "实体",model:[]}
                        ],
                        model:{}
                    },
                    template:   `<el-container id="content" class="content" style="height:calc(100vh - 80px);padding:10px!important;">
                                    <el-header style="height:40px;line-height:40px;padding: 0px;border: 1px solid #ddd;">
                                        <search-base-component :options="options" ref="searchRef"></search-base-component>
                                    </el-header>
                                    <el-main style="border-top:2px solid #ddd;background:#f7f7f7;border:1px solid #ddd;" ref="mainView">
                                        
                                        <div class="grid-stack">
                                            <div class="grid-stack-item"
                                                data-gs-auto-position="true"
                                                data-gs-width="12" data-gs-height="8"
                                                v-for="child in result"> 
                                                <div class="grid-stack-item-content" style="left:0px;border:1px solid #dddddd;overflow:hidden;">
                                                    <component :is="'search-'+child.type" :model="child" :key="child.id"></component>
                                                </div>
                                            </div>
                                        </div>

                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickScreenStyle(evt){
                            if(evt){
                                return `el-icon-copy-document`;
                            } else {
                                return `el-icon-full-screen`;
                            }
                        }
                    },
                    mounted() {
                        this.$nextTick().then(()=>{
                            // 数据设置
                            this.setData();

                            // watch数据更新
                            this.$watch(
                                "$refs.searchRef.result",(val, oldVal) => {
                                    this.setData();
                                }
                            );

                            // Drag View
                            _.delay(()=>{
                                let grid = GridStack.init({
                                    resizable: {
                                        handles: 'e, se, s, sw, w'
                                    },
                                });
                                grid.on('gsresizestop', function(event, elem) {
                                    eventHub.$emit("WINDOW-RESIZE-EVENT");
                                });
                            },500)
                        })
                    },
                    methods: {
                        setData(){
                            _.extend(this.model, {message:this.$refs.searchRef.result});
                            
                            this.result = [];
                            
                            this.result = _.filter(_.map(this.model.message.data,(v,k)=>{
                                let show = false;
                                if('search-'+k in this.$options.components && !_.isEmpty(v.rows)){
                                    show = true;
                                }
                                return {id: objectHash.sha1(k), type: k, title: v.title, rows: v.rows, show: show};
                            }),{show:true});

                            console.table(this.result)

                        }
                    }
                }).$mount("#app");

            })

        })

    }

}