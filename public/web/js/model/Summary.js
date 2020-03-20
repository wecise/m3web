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
                    template:   `<div style="height:115px;padding:20px;text-align: center;background:#f7f7f7;margin:5px;">
                                    <span style="color:rgb(153, 153, 153);">#{title}#</span>
                                    <h1 style="font-size:32px;">#{value}# <span style="color:rgb(153, 153, 153);font-size:x-small;">#{unit}#</span></h1>
                                </div>`
                })

                // 大号数字 多值
                Vue.component("larger-muiltnumber",{
                    delimiters: ['#{', '}#'],
                    props:{
                        title:Array,
                        value: Array,
                        unit: Array
                    },
                    template:   `<div style="height:115px;padding:20px;text-align: center;background:#f7f7f7;margin:5px;">
                                    <span style="color:rgb(153, 153, 153);">#{title[0]}#</span>
                                    <h1 style="font-size:32px;margin:5px;">#{value[0]}# <span style="color:rgb(153, 153, 153);font-size:x-small;">#{unit[0]}#</span></h1>
                                    <span style="color:rgb(153, 153, 153);">#{title[1]}#</span>
                                    <h1 style="font-size:32px;margin:5px;">#{value[1]}# <span style="color:rgb(153, 153, 153);font-size:x-small;">#{unit[1]}#</span></h1>
                                    
                                </div>`
                })

                // 曲线
                Vue.component("curve-chart",{
                    delimiters: ['#{','}#'],
                    props: {
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
                                    color: ["#F58080", "#47D8BE", "#F9A589"],
                                    data: ['吞吐量', '吞吐率', '响应时间'],
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
                                    data: [100,200,20,30,60,89],
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
                                series: [{
                                        name: '吞吐量',
                                        type: 'line',
                                        data: [800,900,220,130,660,289],
                                        color: "#F58080",
                                        top: '10%',
                                        bottomo: '20%',
                                        lineStyle: {
                                            normal: {
                                                width: 1,
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
                                                color: '#F58080',
                                                borderWidth: 5,
                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                shadowBlur: 100,*/
                                                borderColor: "#F58080"
                                            }
                                        },
                                        smooth: true
                                    },
                                    {
                                        name: '吞吐率',
                                        type: 'line',
                                        data: [23,68,11,22,23,56],
                                        lineStyle: {
                                            normal: {
                                                width: 1,
                                                color: {
                                                    type: 'linear',
                            
                                                    colorStops: [{
                                                            offset: 0,
                                                            color: '#AAF487' // 0% 处的颜色
                                                        },
                                                        {
                                                            offset: 0.4,
                                                            color: '#47D8BE' // 100% 处的颜色
                                                        }, {
                                                            offset: 1,
                                                            color: '#47D8BE' // 100% 处的颜色
                                                        }
                                                    ],
                                                    globalCoord: false // 缺省为 false
                                                },
                                                shadowColor: 'rgba(71,216,190, 0.5)',
                                                shadowBlur: 10,
                                                shadowOffsetY: 7
                                            }
                                        },
                                        itemStyle: {
                                            normal: {
                                                color: '#AAF487',
                                                borderWidth: 5,
                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                shadowBlur: 100,*/
                                                borderColor: "#AAF487"
                                            }
                                        },
                                        smooth: true
                                    },
                                    {
                                        name: '响应时间',
                                        type: 'line',
                                        data: [125,568,25,36,784,56],
                                        lineStyle: {
                                            normal: {
                                                width: 1,
                                                color: {
                                                    type: 'linear',
                            
                                                    colorStops: [{
                                                            offset: 0,
                                                            color: '#F6D06F' // 0% 处的颜色
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
                                                color: '#F6D06F',
                                                borderWidth: 5,
                                                /*shadowColor: 'rgba(72,216,191, 0.3)',
                                                shadowBlur: 100,*/
                                                borderColor: "#F6D06F"
                                            }
                                        },
                                        smooth: true
                                    }
                                ]
                            }
                        }
                    },
                    created(){
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);

                        this.option.title.text=this.title;
                    },
                    mounted(){
                        this.chart = echarts.init(this.$el);
                        this.chart.setOption(this.option);
                    },
                    mothods:{
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
                        title: String,
                        height: String
                    },
                    template: `<div :style="'width:100%;background:#f7f7f7;height:'+height"></div>`,
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
                            colors: ["#8d7fec", "#5085f2","#e75fc3","#f87be2","#f2719a","#fca4bb","#f59a8f","#fdb301","#57e7ec","#cf9ef1"],
                            ydata: [{
                                name: '事件',
                                value: 18
                            },
                            {
                                name: '性能',
                                value: 16
                            },
                            {
                                name: '配置',
                                value: 15
                            },
                            {
                                name: '日志',
                                value: 14
                            },
                            {
                                name: '工单',
                                value: 14
                            },
                            {
                                name: '索引',
                                value: 14
                            },
                            {
                                name: '系统日志',
                                value: 14
                            },
                            {
                                name: '其它',
                                value: 14
                            }],
                            xdata: ['事件', "性能", "配置", "日志", "工单", "索引", "系统日志","其它"]
                        }
                    },
                    created(){
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);

                        _.extend(this.option,{
                            color: this.colors});
                        _.extend(this.option.legend,{data: this.xdata});
                        _.extend(this.option.series[0],{data: this.ydata});

                        this.option.title.text=this.title;
                    },
                    mounted(){
                        this.chart = echarts.init(this.$el);
                        this.chart.setOption(this.option);
                    },
                    mothods:{
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
                    delimiters: ['${', '}'],
                    data:{
                        title: ['占用空间','磁盘使用率'],
                        value: [300,40],
                        unit: ['TB','%'],
                    },
                    template:   `<el-container id="content" class="content" style="height:calc(100vh - 80px);">
                                    <el-main style="padding:0px 20px;" ref="mainView">
                                        <el-row :gutter="10">
                                            <el-col :span="24" style="padding:0 20px;">
                                                <h3 style="color:#999;">数据统计</h3>
                                            </el-col>
                                        </el-row>    
                                        <el-row :gutter="10">
                                            <el-col :span="4">
                                                <larger-number title="数据吞吐率"
                                                    value="2000"
                                                    unit="条/秒">
                                                </larger-number>
                                            </el-col>
                                            <el-col :span="4">
                                                <larger-number title="数据总量(当日)"
                                                    value="32"
                                                    unit="TB">
                                                </larger-number>
                                            </el-col>
                                            <el-col :span="4">
                                                <larger-muiltnumber 
                                                    :title="title"
                                                    :value="value"
                                                    :unit="unit">
                                                </larger-muiltnumber>
                                            </el-col>
                                            <el-col :span="6">
                                                <pie-chart title="所有" height="160px"></pie-chart>
                                            </el-col>
                                            <el-col :span="6">
                                                <pie-chart title="当日" height="160px"></pie-chart>
                                            </el-col>
                                        </el-row>
                                        <el-row :gutter="10">
                                            <el-col :span="24" style="padding:0 20px;">
                                                <h3 style="color:#999;">数据接入统计</h3>
                                            </el-col>
                                        </el-row>    
                                        <el-row :gutter="10">
                                            <el-col :span="6">
                                                <curve-chart title="事件数据" height="220px"></curve-chart>
                                            </el-col>
                                            <el-col :span="6">
                                                <curve-chart title="性能数据" height="220px"></curve-chart>
                                            </el-col>
                                            <el-col :span="6">
                                                <curve-chart title="日志数据" height="220px"></curve-chart>
                                            </el-col>
                                            <el-col :span="6">
                                                <curve-chart title="配置数据" height="220px"></curve-chart>
                                            </el-col>
                                        </el-row>
                                        <el-row :gutter="10">
                                            <el-col :span="24" style="padding:0 20px;">
                                                <h3 style="color:#999;">数据访问统计</h3>
                                            </el-col>
                                        </el-row>    
                                        <el-row :gutter="10">
                                            <el-col :span="12" style="display:flex;flex-wrap:wrap;">
                                                <curve-chart title="按应用" height="200px"></curve-chart>
                                            </el-col>
                                            <el-col :span="12" style="display:flex;flex-wrap:wrap;">
                                                <curve-chart title="按接口" height="200px"></curve-chart>
                                            </el-col>
                                        </el-row>
                                  
                                    </el-main>
                                </el-container>`,
                    mounted() {
                        this.$nextTick().then(()=>{
                            
                        })
                    }
                }).$mount("#app");

            })

        })

    }

}