/**
 *
 *    #     # ####### #     # #     #
 *    ##   ## #       ##    # #     #
 *    # # # # #       # #   # #     #
 *    #  #  # #####   #  #  # #     #
 *    #     # #       #   # # #     #
 *    #     # #       #    ## #     #
 *    #     # ####### #     #  #####
 */

class MaxEchart {
    constructor() {

    }

    init() {
        
        Vue.component('max-echart-pie',{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template: `<div :id="id" style="width:100%;height:13em;"></div>`,
            data(){
                return {
                    chart: null,
                    option: {
                        series: [{
                            color:["#20a0ff","#f9f9f9"],
                            name: '统计',
                            type: 'pie',
                            radius: ['100%', '90%'],
                            avoidLabelOverlap: false,
                            label: {
                                normal: {
                                    show: true,
                                    position: 'center'
                                },
                                emphasis: {
                                    show: true,
                                    textStyle: {
                                        fontSize: '12',
                                        fontWeight: 'bold'
                                    }
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            },
                            data: [{
                                    value: 0,
                                    name: '',
                                    label: {
                                        normal: {
                                            textStyle: {
                                                fontSize: '20',
                                                fontWeight: 'bold'
                                            }
                                        }
                                    },
                                },
                                {
                                    value: 0,
                                    name: '',
                                    label: {
                                        normal: {
                                            textStyle: {
                                                fontSize: '12',
                                                color:'#333',
                                                fontWeight: 'bold'
                                            },
                                            padding: [140, 0, 0, 0]
                                        }
                                    }
                                }
                            ]
                        }]
                    }
                }
            },
            watch:{
                model: {
                    handler(val,oldVal){
                        this.chart = echarts.init(this.$el);
                        this.option = _.extend(this.option,val);
                        this.chart.setOption(this.option);
                    },
                    deep:true
                }
            },
            created(){
                // 接收窗体RESIZE事件
                eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);
            },
            mounted() {
                const self = this;

                self.$nextTick(function () {
                    self.init();
                });
            },
            methods: {
                init(){
                    this.chart = echarts.init(this.$el);
                    this.option = _.extend(this.option,this.model);
                    this.chart.setOption(this.option);
                    this.checkChart();
                },
                initData(){
                    this.option.series[0].color[0] = this.model.color;
                    this.option.series[0].data[0].value = _.round(this.model.percent,0);
                    this.option.series[0].data[0].name = _.round(this.model.percent,0) + "%";
                    this.option.series[0].data[1].value = _.round(100 - Number(this.model.percent),0);
                    this.option.series[0].data[1].name = this.model.name + " " + this.model.count + "/" + this.model.sum;
                },
                checkChart(){
                    const self = this;

                    if(self.chart.id){
                        self.chart.resize();
                    } else {
                        setTimeout(self.checkChart, 50);
                    }
                }
            }
        })

        Vue.component('max-echart-pie-group',{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template: `<div :id="id" style="width:155px;height:12em;margin:0 5px 0 0;cursor:pointer;" @mouseover="mouseOver($event)" @mouseout="mouseOut($event)"></div>`,
            data(){
                return {
                    chart: null,
                    option: {
                        backgroundColor: '#fff',
                        tooltip: {
                            trigger: 'item',
                            position: function (point, params, dom, rect, size) {
                                return dom='body';
                            },
                            formatter: "{a} <br/>{b}: {c} ({d}%)",
                        },
                        title: [],
                        series: []
                    }
                }
            },
            watch:{
                model: {
                    handler(val,oldVal){
                        const self = this;

                        console.log(23434,self.model)
                        // const self = this;

                        // if(self.chart){
                        //     self.chart = null;
                        //     $(self.$el).empty();
                        // }
                        // self.init();
                    },
                    deep:true
                }
            },
            created(){
                // 接收窗体RESIZE事件
                eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);
            },
            mounted() {
                const self = this;

                self.$nextTick(function () {
                    self.init();
                });
            },
            methods: {
                init(){
                    this.chart = echarts.init(this.$el);
                    this.initData();
                    this.checkChart();
                },
                initData(){
                    const self = this;

                    // 重置
                    self.option.tooltip = {};
                    self.option.title = {};
                    self.option.series = [];

                    self.option.tooltip = _.extend(self.option.tooltip,{
                                        trigger: 'item',
                                        formatter: `业务：{a} <br/>
                                                    数量：{c} <br/>
                                                    占比：${self.model.percent}%`,
                                        position: function (point, params, dom, rect, size) {
                                            return dom='body';
                                        }
                                    });

                    self.option.title = {
                        text: self.model.name,
                        left: '49%',
                        top: '86%',
                        textAlign: 'center',
                        textStyle: {
                            fontSize: '12',
                            color: '#687284',
                            fontWeight: '400',
                        }
                    };

                    self.option.series.push({
                        name: self.model.name,
                        type: 'pie',
                        radius: ['45', '55'],
                        center: ['50%', '50%'],
                        hoverAnimation: false,
                        label: {
                            normal: {
                                position: 'center'
                            },
                        },
                        data: [{
                                value: self.model.count,
                                name: self.model.name,
                                itemStyle: {
                                    normal: {
                                        color: self.model.color,
                                    }
                                },
                                label: {
                                    normal: {
                                        show: false,
                                    }
                                }
                            },
                            {
                                value: 100 - self.model.count,
                                name: '占位',
                                tooltip: {
                                    show: false
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#edf1f4',
                                    }
                                },
                                label: {
                                    normal: {
                                        formatter: self.model.count + '',
                                        textStyle: {
                                            fontSize: 36,
                                            color: self.model.color
                                        }
                                    },
            
                                }
                            }
                        ]
                    })
                    
                    self.chart.setOption(self.option);
                },
                checkChart(){
                    const self = this;

                    if(self.chart.id){
                        self.chart.resize();
                    } else {
                        setTimeout(self.checkChart, 50);
                    }
                },
                mouseOver(event){
                    $(this.$el).removeClass("el-card");
                    $(this.$el).addClass("el-card");
                },
                mouseOut(item){
                    $(this.$el).removeClass("el-card");
                }
            }
        })
    }

}

let maxEchart = new MaxEchart();
maxEchart.init();