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
                            "search-base-ext-component"
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
                                            <el-button type="text" :icon="control.ifFullScreen | pickScreenStyle" @click="onFullScreen"></el-button>
                                            <el-button type="text" icon="el-icon-close"></el-button>
                                        </span>
                                    </el-header>
                                    <el-container style="border-top:1px solid #ddd;height:calc(100% - 40px);">
                                        <el-main :style="result | pickMainStyle" ref="mainView">
                                            <!--template v-for="child in result">
                                                <component :is="'search-'+model.type" :model="child" :key="child.id"></component>
                                            </template-->
                                            <el-card :style="item | pickBgStyle" 
                                                v-for="item in model.rows" :key="item.id">
                                                <span class="el-icon-warning" :style="item | pickStyle"></span>
                                                <p>服务器:#{item.host}#</p>
                                                <p>IP地址:#{item.ip}#</p>
                                                <p>告警时间：#{moment(item.vtime).format("LLL")}#</p>
                                                <p>告警内容：#{item.msg}#</p>
                                                <el-button type="text" @click="onClick(item)">详细</el-button>
                                            </el-card>
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
                                            <!--template v-for="child in result">
                                                <component :is="'search-'+model.type" :model="child" :key="child.id"></component>
                                            </template-->
                                            <el-card :style="item | pickBgStyle" 
                                                v-for="item in model.rows" :key="item.id">
                                                <span class="el-icon-warning" :style="item | pickStyle"></span>
                                                <p>服务器:#{item.host}#</p>
                                                <p>IP地址:#{item.ip}#</p>
                                                <p>实例：#{item.inst}#</p>
                                                <p>参数：#{item.param}#</p>
                                                <p>值：#{item.value}#</p>
                                                <p>采集时间：#{moment(item.vtime).format("LLL")}#</p>
                                                <el-button type="text" @click="onClick(item)">详细</el-button>
                                            </el-card>
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
                                    <el-container style="border-top:1px solid #ddd;">
                                        <el-main style="padding:20px 0px;" ref="mainView">
                                            <el-button type="default" 
                                                style="max-width: 20em;width: 20em;height:auto;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
                                                @click="forward(item)"
                                                v-for="item in model.rows" v-if="model.rows">
                                                <el-image style="width:64px;margin:5px;" :src="item | pickIcon"></el-image>
                                                <div>
                                                    <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">名称：#{item.name}#</p>
                                                    <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">ID：#{item.id}#</p>
                                                    <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">创建时间：#{moment(item.vtime).format("YYYY-MM-DD hh:mm:ss")}#</p>
                                                    <!--p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">标签：<input type="text" class="tags" name="tags" :value="item|pickTags"></p-->
                                                </div>
                                            </el-button>
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
                            let url = `/janesware/entity?term=${window.btoa(encodeURIComponent(item.id))}`;
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
                                            <!--template v-for="child in result">
                                                <component :is="'search-'+model.type" :model="child" :key="child.id"></component>
                                            </template-->
                                            <el-card :style="item | pickBgStyle" 
                                                v-for="item in model.rows" :key="item.id">
                                                <span class="el-icon-warning" :style="item | pickStyle"></span>
                                                <p>服务器:#{item.host}#</p>
                                                <p>IP地址:#{item.ip}#</p>
                                                <p>告警时间：#{moment(item.vtime).format("LLL")}#</p>
                                                <p>告警内容：#{item.msg}#</p>
                                                <el-button type="text" @click="onClick(item)">详细</el-button>
                                            </el-card>
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

                this.app = new Vue({
                    delimiters: ['${', '}'],
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
                            class: "#/matrix/devops/:",
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
                                    <el-main style="background:#ddd;border-top:2px solid #ddd;" ref="mainView">
                                        
                                        <template v-for="child in result">
                                            <component :is="'search-'+child.type" :model="child" :key="child.id" v-if="child.show"></component>
                                            <el-divider v-if="child.show"></el-divider>
                                        </template>

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
                        })
                    },
                    methods: {
                        setData(){
                            _.extend(this.model, {message:this.$refs.searchRef.result});
                            
                            this.result = _.map(this.model.message.data,(v,k)=>{
                                let show = false;
                                if('search-'+k in this.$options.components && !_.isEmpty(v.rows)){
                                    show = true;
                                }
                                return {id: objectHash.sha1(k), type: k, title: v.title, rows: v.rows, show: show};
                            })

                            console.log(this.result)

                        }
                    }
                }).$mount("#app");

            })

        })

    }

}