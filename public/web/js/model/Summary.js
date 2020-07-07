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
class Summary {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["ai-robot-component"
                        ],function() {

            $(function() {

                // 大号数字 单值
                Vue.component("larger-number",{
                    delimiters: ['#{', '}#'],
                    props:{
                        title:String,
                        value: Number,
                        unit:String
                    },
                    data(){
                        return {
                            valueTween: 0
                        }
                    },
                    template:   `<div style="height:100%;padding:20px;text-align: center;background:#f7f7f7;margin:5px;">
                                    <span style="color:rgb(153, 153, 153);">#{title}#</span>
                                    <h1 style="font-size:32px;">#{valueTween}# <span style="color:rgb(153, 153, 153);font-size:x-small;">#{unit}#</span></h1>
                                </div>`,
                    watch: {
                        value: {
                            handler:function(newValue,oldValue) {
                                TweenLite.to(this.$data, 1, { valueTween: newValue });
                            },
                            immediate:true
                        }
                    }
                })

                // 大号数字 多值
                Vue.component("larger-muiltnumber",{
                    delimiters: ['#{', '}#'],
                    props:{
                        title:Array,
                        value: Array,
                        unit: Array
                    },
                    template:   `<div style="height:100%;padding:20px;text-align: center;background:#f7f7f7;margin:5px;">
                                    <span style="color:rgb(153, 153, 153);">#{title[0]}#</span>
                                    <h1 style="font-size:32px;margin:5px;">#{value[0]}# <span style="color:rgb(153, 153, 153);font-size:x-small;">#{unit[0]}#</span></h1>
                                    <span style="color:rgb(153, 153, 153);">#{title[1]}#</span>
                                    <h1 style="font-size:32px;margin:5px;">#{value[1]}# <span style="color:rgb(153, 153, 153);font-size:x-small;">#{unit[1]}#</span></h1>
                                    
                                </div>`
                })

                // 大号数字 单值 多列样式
                Vue.component("larger-column-number",{
                    delimiters: ['#{', '}#'],
                    props:{
                        title:String,
                        value: Number,
                        unit:String
                    },
                    data(){
                        return {
                            valueTween: 0
                        }
                    },
                    template:   `<div style="height:100%;text-align: center;background:#f7f7f7;">
                                    <span style="color:rgb(153, 153, 153);">#{title}#</span>
                                    <h1 style="font-size:32px;">#{valueTween}# <span style="color:rgb(153, 153, 153);font-size:x-small;">#{unit}#</span></h1>
                                </div>`,
                    watch: {
                        value: {
                            handler:function(newValue,oldValue) {
                                TweenLite.to(this.$data, 1, { valueTween: newValue });
                            },
                            immediate:true
                        }
                    }
                })

                // 曲线 byday
                Vue.component("curve-chart-byday",{
                    delimiters: ['#{','}#'],
                    props: {
                        model:Object,
                        title: String,
                        height: String,
                    },
                    template: `<div style="width:100%;background:#f7f7f7;height:100%;"></div>`,
                    data(){
                        return {
                            chart: null,
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
                            },
                            colors: ["#F58080", "#47D8BE", "#F9A589", "#FF0000"],
                            kpi: ['span_avg','span_max','span_min','throughput']
                        }
                    },
                    watch: {
                        model:{
                            handler(val,oldVal){
                                this.addData(val);
                            },
                            deep:true
                        }
                    },
                    created(){
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);

                        this.initData();
                        this.option.title.text=this.title;

                    },
                    mounted(){
                        this.chart = echarts.init(this.$el);
                        this.chart.setOption(this.option);
                        _.delay(()=>{
                            this.checkChart();
                        },1000)
                    },
                    methods:{
                        initData(){
                            // legend
                            this.option.legend.color = this.colors;
                            this.option.legend.data = this.kpi;
                            // xAxis
                            this.option.xAxis.data.push(moment().format("HH:mm:ss"));
                            // series
                            this.option.series = _.map(this.kpi,(v,index)=>{
                                
                                return {
                                            name: v,
                                            type: 'line',
                                            data: [this.model[v]],
                                            color: this.colors[index],
                                            top: '10%',
                                            bottomo: '30%',
                                            areaStyle: {
                                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                                    offset: 0,
                                                    color: this.colors[index]
                                                }, {
                                                    offset: 1,
                                                    color: '#fff'
                                                }])
                                            },
                                            lineStyle: {
                                                normal: {
                                                    width: .5,
                                                    color: {
                                                        type: 'linear',
                                
                                                        colorStops: [{
                                                            offset: 0,
                                                            color: '#FFCAD4' // 0% 处的颜色
                                                        }, {
                                                            offset: 0.4,
                                                            color: '#F58080' // 100% 处的颜色
                                                        }, {
                                                            offset: 1,
                                                            color: '#F58080' // 100% 处的颜色
                                                        }],
                                                        globalCoord: false // 缺省为 false
                                                    },
                                                    shadowColor: 'rgba(245,128,128, 0.5)',
                                                    shadowBlur: 10,
                                                    shadowOffsetY: 7
                                                }
                                            },
                                            itemStyle: {
                                                normal: {
                                                    color: this.colors[index],
                                                    borderWidth: 1,
                                                    /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                    shadowBlur: 100,*/
                                                    borderColor: this.colors[index]
                                                }
                                            },
                                            smooth: true
                                        };
                            })
                            
                        },
                        addData(val){
                            // xAxis
                            this.option.xAxis.data.push(moment().format("HH:mm:ss"));
                            // series
                            _.forEach(this.kpi,(v,index)=>{
                                this.option.series[index].data.push(val[v]);
                            })
                            this.chart.setOption(this.option);
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

                // 曲线 byapi
                Vue.component("curve-chart-byapi",{
                    delimiters: ['#{','}#'],
                    props: {
                        model:Object,
                        title: String,
                        height: String,
                    },
                    template: `<div :style="'width:100%;background:#f7f7f7;height:'+height"></div>`,
                    data(){
                        return {
                            chart: null,
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
                            },
                            colors: ["#F58080", "#47D8BE", "#F9A589", "#FF0000"],
                            kpi: ['span_avg','span_max','span_min','volume']
                        }
                    },
                    watch: {
                        model:{
                            handler(val,oldVal){
                                this.addData(val);
                            },
                            deep:true
                        }
                    },
                    created(){
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);

                        this.initData();
                        this.option.title.text=this.title;

                    },
                    mounted(){
                        this.chart = echarts.init(this.$el);
                        this.chart.setOption(this.option);
                        _.delay(()=>{
                            this.checkChart();
                        },1000)
                    },
                    methods:{
                        initData(){
                            // legend
                            this.option.legend.color = this.colors;
                            this.option.legend.data = _.map(this.kpi,(v)=>{
                                return this.model[v].title;
                            });
                            // xAxis
                            this.option.xAxis.data.push(moment().format("HH:mm:ss"));
                            // series
                            this.option.series = _.map(this.kpi,(v,index)=>{
                                
                                return {
                                            name: this.model[v].title,
                                            type: 'line',
                                            data: [this.model[v].value],
                                            color: this.colors[index],
                                            top: '10%',
                                            bottomo: '30%',
                                            areaStyle: {
                                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                                    offset: 0,
                                                    color: this.colors[index]
                                                }, {
                                                    offset: 1,
                                                    color: '#fff'
                                                }])
                                            },
                                            lineStyle: {
                                                normal: {
                                                    width: .5,
                                                    color: {
                                                        type: 'linear',
                                
                                                        colorStops: [{
                                                            offset: 0,
                                                            color: '#FFCAD4' // 0% 处的颜色
                                                        }, {
                                                            offset: 0.4,
                                                            color: '#F58080' // 100% 处的颜色
                                                        }, {
                                                            offset: 1,
                                                            color: '#F58080' // 100% 处的颜色
                                                        }],
                                                        globalCoord: false // 缺省为 false
                                                    },
                                                    shadowColor: 'rgba(245,128,128, 0.5)',
                                                    shadowBlur: 10,
                                                    shadowOffsetY: 7
                                                }
                                            },
                                            itemStyle: {
                                                normal: {
                                                    color: this.colors[index],
                                                    borderWidth: 1,
                                                    /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                    shadowBlur: 100,*/
                                                    borderColor: this.colors[index]
                                                }
                                            },
                                            smooth: true
                                        };
                            })
                            
                        },
                        addData(val){
                            // xAxis
                            this.option.xAxis.data.push(moment().format("HH:mm:ss"));
                            // series
                            _.forEach(this.kpi,(v,index)=>{
                                this.option.series[index].data.push(val[v].value);
                            })
                            this.chart.setOption(this.option);
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

                // 饼图
                Vue.component("pie-chart",{
                    delimiters: ['#{','}#'],
                    props: {
                        model:Object,
                        title: String,
                        height: String
                    },
                    template: `<div style="'width:100%;background:#f7f7f7;height:100%;"></div>`,
                    data(){
                        return {
                            
                            chart:null,
                            option:{
                                title: {
                                    text: "",
                                    left: 'center',
                                    textStyle: {
                                        fontSize: '14px',
                                        color: '#999'
                                    }
                                },
                                color:[],
                                tooltip: {
                                    trigger: 'item',
                                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                                },
                                legend: {
                                    orient: "vartical",
                                    x: "left",
                                    top: "center",
                                    left: "55%",
                                    bottom: "0%",
                                    data: [],
                                    itemWidth: 8,
                                    itemHeight: 8,
                                    itemGap :16,
                                    formatter :function(name){
                                        return ''+name
                                    }
                                },
                                series: [{
                                    type: 'pie',
                                    clockwise: false, //饼图的扇区是否是顺时针排布
                                    minAngle: 2, //最小的扇区角度（0 ~ 360）
                                    radius: ["50%", "70%"],
                                    center: ["30%", "50%"],
                                    avoidLabelOverlap: false,
                                    
                                    label: {
                                        normal: {
                                            show: false,
                                            position: 'center',
                                            formatter: '{text|{b}}\n{c} ({d}%)',
                                            rich: {
                                                text: {
                                                    color: "#666",
                                                    fontSize: 14,
                                                    align: 'center',
                                                    verticalAlign: 'middle',
                                                    padding: 8
                                                },
                                                value: {
                                                    color: "#8693F3",
                                                    fontSize: 14,
                                                    align: 'bottom',
                                                    verticalAlign: 'middle',
                                                },
                                            }
                                        },
                                        emphasis: {
                                            show: true,
                                            textStyle: {
                                                fontSize: 24,
                                            }
                                        }
                                    },
                                    data: []
                                }],
                            },
                            colors: ["#8d7fec", "#5085f2","#e75fc3","#f87be2","#f2719a","#fca4bb","#f59a8f","#fdb301","#57e7ec","#cf9ef1"]
                        }
                    },
                    created(){
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);

                        _.extend(this.option,{
                            color: this.colors});
                        _.extend(this.option.legend,{data: _.keys(this.model)});
                        _.extend(this.option.series[0],{data: _.map(this.model,(v,k)=>{
                            return {name:k, value:v.volume.value};
                        })});

                        this.option.title.text=this.title;
                    },
                    mounted(){
                        this.chart = echarts.init(this.$el);
                        this.chart.setOption(this.option);
                        _.delay(()=>{
                            this.checkChart();
                        },1000)
                    },
                    methods:{
                        checkChart(){
                            if(this.$el){
                                this.chart.resize();
                            } else {
                                setTimeout(this.checkChart, 50);
                            }
                        }
                    }
                })

                mxSummary.app = new Vue({
                    delimiters: ['#{', '}#'],
                    data:{
                        title: ['占用空间','磁盘使用率'],
                        value: [300,40],
                        unit: ['TB','%'],
                        control: {
                            show: false
                        },
                        model: null
                    },
                    template:   `<el-container id="content" class="content" style="height:calc(100vh - 80px);">
                                    
                                    <el-main style="padding:10px 0px;" ref="mainView">
                                        
                                        <el-button type="text" icon="el-icon-plus" style="position:absolute;z-index:1000;top:55px;right:25px;" @click="control.show=!control.show"></el-button>
                                        
                                        <div class="d-none d-md-block" style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);background:#f7f7f7;height:75vh;position:absolute;top:60px;left:70px;z-index:100;" v-show="control.show">
                                            
                                            <div class="newWidget grid-stack-item" data-gs-width="2" data-gs-height="2">
                                                <div class="grid-stack-item-content">
                                                    <div>
                                                        <el-image src="/fs/assets/images/product_screenshot/new.png?type=open&issys=true" style="width:200px;"></el-image>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="font-size: 18px;padding: 0px 20px;">数据概览</div>
                                        <div class="grid-stack grid-container" data-gs-animate="yes" style="background:#f7f7f7;margin:0 20px;">
                                            <div class="grid-stack-item" data-gs-width="2" data-gs-height="2">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <larger-number title="数据吞吐量"
                                                        :value="model.byDay.throughput"
                                                        unit="条/秒">
                                                    </larger-number>
                                                </div>
                                            </div>
                                            <div class="grid-stack-item" data-gs-width="2" data-gs-height="2">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <larger-number title="数据响应时间(avg)"
                                                        :value="model.byDay.span_avg"
                                                        unit="毫秒">
                                                    </larger-number>
                                                </div>
                                            </div>

                                            <div class="grid-stack-item" data-gs-width="2" data-gs-height="2">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <larger-number title="数据响应时间(max)"
                                                        :value="model.byDay.span_max"
                                                        unit="毫秒">
                                                    </larger-number>
                                                </div>
                                            </div>

                                            <div class="grid-stack-item" data-gs-width="2" data-gs-height="2">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <larger-number title="数据响应时间(min)"
                                                        :value="model.byDay.span_min"
                                                        unit="毫秒">
                                                    </larger-number>
                                                </div>
                                            </div>
                                            <div class="grid-stack-item" data-gs-width="2" data-gs-height="2">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <larger-number title="数据总量(当日)"
                                                        :value="model.byDay.all_volume | pickValue"
                                                        :unit="model.byDay.all_volume | pickUnit">
                                                    </larger-number>
                                                </div>
                                            </div>
                                            <!--div class="grid-stack-item" data-gs-width="2" data-gs-height="2">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <larger-number title="磁盘大小"
                                                        :value="model.byDay.disk_volume | pickValue"
                                                        :unit="model.byDay.disk_volume | pickUnit">
                                                    </larger-number>
                                                </div>
                                            </div-->
                                            <div class="grid-stack-item" data-gs-width="2" data-gs-height="2">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <larger-number title="磁盘利用率"
                                                        :value="model.byDay.disk_volume_percent | pickValue"
                                                        unit="%">
                                                    </larger-number>
                                                </div>
                                            </div>
                                            <div class="grid-stack-item" data-gs-width="6" data-gs-height="3">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <pie-chart title="当日" :model="model.byApi" height="160px"></pie-chart>
                                                </div>
                                            </div>
                                            <div class="grid-stack-item" data-gs-width="6" data-gs-height="3">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <curve-chart-byday title="当日趋势" height="160px" :model="model.byDay" ref="curveChart"></curve-chart-byday>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style="font-size: 18px;padding: 0px 20px;">按接口统计</div>
                                        
                                        <div class="grid-stack grid-container" 
                                            data-gs-animate="yes" 
                                            v-for="(item,api) in model.byApi" 
                                            style="background:#f7f7f7;margin:0px 20px;border-top:1px solid #fff;" >
                                            <div class="grid-stack-item" data-gs-width="12" data-gs-height="3">
                                                <div class="grid-stack-item-content" style="overflow:hidden;">
                                                    <h5 style="margin:0px;padding:10px 20px;">#{_.upperCase(api)}#</h5>
                                                    <el-row :gutter="0" style="display:flex;align-items:center;">
                                                        <el-col :span="3">
                                                            <larger-column-number :title="item.volume.title"
                                                                :value="item.volume.value"
                                                                unit="笔/秒">
                                                            </larger-column-number>
                                                        </el-col>
                                                        <el-col :span="3" v-for="kpi in item.summary">
                                                            <larger-column-number :title="kpi.title,api|pickTitle"
                                                                :value="kpi.value"
                                                                unit="毫秒">
                                                            </larger-column-number>
                                                        </el-col>
                                                        <el-col :span="12">
                                                            <curve-chart-byapi title="当日趋势" height="180px" :model="model.byApi[api]" ref="curveChart"></curve-chart-byapi>
                                                        </el-col>
                                                    </el-row>
                                                </div>
                                            </div>
                                        </div>
                                       
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickValue(val){
                            return mx.bytesToSize(val).split(" ")[0];
                        },
                        pickUnit(val){
                            return mx.bytesToSize(val).split(" ")[1];
                        },
                        pickTitle(title,api){
                            return `${title}`;
                        }
                    },
                    created(){
                        
                        this.initData();

                        setInterval(()=>{
                            this.initData();
                        },3000)
                    },
                    mounted() {
                        this.$nextTick().then(()=>{
                            this.init();
                        })
                    },
                    methods: {
                        initData(){
                            this.model = fsHandler.callFsJScript("/matrix/summary/getSummary.js",null).message;
                        },
                        init(){
                            
                            let grid = GridStack.initAll({
                                resizable: {
                                    handles: 'e, se, s, sw, w'
                                },
                                float: true,
                                acceptWidgets: '.newWidget'
                            });
                            grid[0].on('gsresizestop', (event, elem)=> {
                                eventHub.$emit("WINDOW-RESIZE-EVENT");
                            });
                            grid[1].on('gsresizestop', (event, elem)=> {
                                eventHub.$emit("WINDOW-RESIZE-EVENT");
                            });

                            $('.newWidget').draggable({
                                revert: 'invalid',
                                scroll: false,
                                appendTo: 'body',
                                helper: 'clone'
                            });

                        }
                    }
                }).$mount("#app");

            })

        })

    }

}