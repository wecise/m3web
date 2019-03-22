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
class Event extends Matrix {

    constructor() {
        super();

        // 运行模式定义
        window.EVENT_VIEW_LIST = ['view-normal','view-tags','view-fullscreen'];
        window.EVENT_VIEW = 'view-normal';
        
        this.app = null;
        this.detail = null;
    }

    init() {

        VueLoader.onloaded(["ai-robot-component",
                            "event-graph-component",
                            "event-datatable-component",
                            "event-diagnosis-datatable-component",
                            "event-summary-component",
                            "search-preset-component",
                            "search-base-component",
                            "probe-tree-component",
                            "vue-timeline-component"],function() {
            $(function() {

                // 时间轴
                Vue.component("event-timeline",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<div class="block"><el-timeline>
                                    <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model">
                                        <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                            <h4>#{item.value}#</h4>
                                            <p>#{item.biz}# #{item.host}#</p>
                                            <p>#{item.msg}#</p>
                                        </el-card>
                                    </el-timeline-item>
                                </el-timeline></div>`
                })

                // 告警雷达
                Vue.component("event-view-radar",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            progress:[]
                        }
                    },
                    //template: `<event-summary-component :id="id" :model='model'></event-summary-component>`,
                    template:   `<div>
                                    <div class="progress" 
                                         v-for="pg in progress" 
                                         style="padding-left: 80px;overflow: hidden;height: 24px;margin-bottom: 5px;background-color: rgb(245, 245, 245);border-radius: 4px;transition: width .6s ease;">
                                        <label style="padding: 3px 5px;position: absolute;left: 10px;">#{pg.name}#</label>
                                        <el-tooltip placement="top" v-for="item in pg.child">
                                            <div slot="content">#{item.title}#</div>
                                            <div class="progress-bar animated fadeInLeft" 
                                                :id="item.id"
                                                role="progressbar" 
                                                aria-valuemin="0" 
                                                :aria-valuenow="item.width" 
                                                aria-valuemax="100" 
                                                :style="'width:'+item.width+'%;background:'+item.color + ';padding:3px;cursor: pointer;'" 
                                                @click="search(item.expression)">
                                                <div v-if="pg.child.length < 20">
                                                    #{item.name}#
                                                </div>
                                            </div>
                                        </el-tooltip>
                                    </div>
                                </div>`,
                    watch:{
                        model:{
                            handler(val,oldVal){
                                this.initData();
                            },
                            deep:true
                        }
                    },
                    mounted(){
                    },
                    methods: {
                        initData(){
                            
                            this.progress = _.map(this.model.summary.radar,function(v,k){
                                let className = k.split("_")[0];
                                let title = k.split("_")[1];
                                let sum = _.sum(_.map(v,function(s){return s[1];}));
                                let pgs = _.map(v,function(val){
                                    let name = '其它';
                                    if(val[0]){
                                        name = val[0];
                                    }
                                    
                                    return {id:objectHash.sha1(name+val+_.now()), 
                                            name: name, 
                                            value: val[1],
                                            expression:  className==='vtime'?`at ${moment(name).format("YYYY-MM-DD HH:mm:SS")} within 15minutes for ${className}`:`${className}=${name}`,
                                            title: `按${title}分析 \n\n ${name}: ${val[1]}`,
                                            width: val[1]/sum * 100, 
                                            color: _.sample(['#ff0000','#ffd700','#666666','#00ffff','#40e0d0','#ff7373','#d3ffce','#3399ff','#000080','#66cccc','#a0db8e','#794044','#6897bb','#cc0000'])
                                        }
                                })
                                return {name: title, class:className, child: pgs, sum: sum}
                            });
                        },
                        search(event){
                            this.$root.options.term = event;
                            this.$root.$refs.searchRef.search();
                        }
                    }
                });

                // 告警统计
                Vue.component("event-view-pie",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            circles:[]
                        }
                    },
                    template:   `<div style="height:200px;">
                                    <el-progress type="circle" :percentage="item.percent" v-for="item in circles"></el-progress>
                                    <!--Circle
                                        dashboard
                                        :percent="item.percent"
                                        v-for="item in circles">
                                        <div>
                                            <h1>#{item.count}#</h1>
                                            <p>#{item.name}#</p>
                                            <span>
                                                总数
                                                <i>#{item.count}#</i>
                                            </span>
                                        </div>
                                    </Circle-->
                                </div>`,
                    watch:{
                        model:{
                            handler(val,oldVal){
                                this.initData();
                            },
                            deep:true
                        }
                    },
                    mounted(){
                        _.delay(function(){
                            this.initData();
                        },1000)
                    },
                    methods: {
                        initData(){
                            const self = this;
                            
                            self.circles = [];
                            _.forEach(self.model.summary.pie,function(v,k){
                                _.forEach(v,function(val){
                                    self.circles.push({
                                            dimension: k,
                                            id:objectHash.sha1(k+val+_.now()), 
                                            name: val[0], 
                                            count: val[1],
                                            sum: _.sum(_.map(v,function(s){return s[1];})),
                                            percent: val[1]/180*100,
                                            color: _.sample(['#ff0000','#ffd700','#666666','#00ffff','#40e0d0','#ff7373','#d3ffce','#3399ff','#000080','#66cccc','#a0db8e','#794044','#6897bb','#cc0000'])
                                        });
                                })
                            });
                            console.log(self.circles)
                        },
                        search(event){
                            this.$root.options.term = event;
                            this.$root.$refs.searchRef.search();
                        }
                    }
                });

                // 告警详情
                Vue.component("event-view-detail",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:String
                    },
                    template: `<form class="form-horizontal" style="height:50vh;overflow-x: hidden;overflow-y: auto;">
                                    <div class="form-group" v-for="(value,key) in model.rows[0]" style="padding: 0px 10px;margin-bottom: 1px;">
                                        <label :for="key" class="col-sm-2 control-label" style="text-align:left;">#{key}#</label>
                                        <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                            <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value">
                                        </div>
                                    </div>
                                </form>`,
                    mounted(){
                        
                    }
                });

                // 仪表盘
                Vue.component("gauge-component",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data:function(){
                        return {
                            gaugePS: null
                        }
                    },
                    template: ` <div style="width:100%;">
                                    <canvas :id="'gauge-'+id"></canvas>
                                    <p>#{model.host}#/<small>#{model.param}#</small></p>
                                </div>`,
                    mounted:function(){
                        const self = this;
                        self.init();
                    },
                    methods: {
                        init: function(){
                            let self = this;
                            
                            self.gaugePS = new RadialGauge({
                                renderTo: `gauge-${self.id}`,
                                width: 200,
                                height: 200,
                                units: 'PS',
                                minValue: 0,
                                maxValue: 100,
                                majorTicks: [
                                    '0',
                                    '10',
                                    '20',
                                    '30',
                                    '40',
                                    '50',
                                    '60',
                                    '70',
                                    '80',
                                    '90',
                                    '100'
                                ],
                                minorTicks: 2,
                                ticksAngle: 270,
                                startAngle: 45,
                                strokeTicks: true,
                                highlights  : [
                                    { from : 50,  to : 80, color : '#ffff00' },
                                    { from : 80, to : 100, color : 'rgba(225, 7, 23, 0.75)' }
                                ],
                                valueInt: 1,
                                valueDec: 0,
                                colorPlate: "#fff",
                                colorMajorTicks: "#686868",
                                colorMinorTicks: "#686868",
                                colorTitle: "#000",
                                colorUnits: "#000",
                                colorNumbers: "#686868",
                                valueBox: true,
                                colorValueText: "#000",
                                colorValueBoxRect: "#fff",
                                colorValueBoxRectEnd: "#fff",
                                colorValueBoxBackground: "#fff",
                                colorValueBoxShadow: false,
                                colorValueTextShadow: false,
                                colorNeedleShadowUp: true,
                                colorNeedleShadowDown: false,
                                colorNeedle: "rgba(200, 50, 50, .75)",
                                colorNeedleEnd: "rgba(200, 50, 50, .75)",
                                colorNeedleCircleOuter: "rgba(200, 200, 200, 1)",
                                colorNeedleCircleOuterEnd: "rgba(200, 200, 200, 1)",
                                borderShadowWidth: 0,
                                borders: true,
                                borderInnerWidth: 0,
                                borderMiddleWidth: 0,
                                borderOuterWidth: 5,
                                colorBorderOuter: "#fafafa",
                                colorBorderOuterEnd: "#cdcdcd",
                                needleType: "arrow",
                                needleWidth: 2,
                                needleCircleSize: 7,
                                needleCircleOuter: true,
                                needleCircleInner: false,
                                animationDuration: 1500,
                                animationRule: "dequint",
                                fontNumbers: "Verdana",
                                fontTitle: "Verdana",
                                fontUnits: "Verdana",
                                fontValue: "Led",
                                fontValueStyle: 'italic',
                                fontNumbersSize: 20,
                                fontNumbersStyle: 'italic',
                                fontNumbersWeight: 'bold',
                                fontTitleSize: 24,
                                fontUnitsSize: 22,
                                fontValueSize: 50,
                                animatedValue: true
                            });
                            self.gaugePS.draw();
                            self.gaugePS.value = self.model.value || 0;
                        }
                    }
                    
                });
                
                // 告警分析
                Vue.component("event-diagnosis",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data:function(){
                        return {
                            
                        }
                    },
                    template: ` <section class="event-diagnosis">
                                    <ul class="nav nav-tabs">
                                        <li class="active"><a href="#event-diagnosis-detail">告警详情</a></li>
                                        <li class=""><a href="#event-diagnosis-journal">告警轨迹</a></li>
                                        <li class=""><a href="#event-diagnosis-history">历史相关告警</a></li>
                                        <li class=""><a href="#event-diagnosis-dimension">维度关联性告警</a></li>
                                        <li class=""><a href="#event-diagnosis-probability">概率相关性告警</a></li>
                                    </ul>
                                    <div class="content">
                                        <el-row>
                                            <el-col :span="24">
                                                <el-card class="box-card" shadow="always">
                                                    <div slot="header" class="clearfix">
                                                        <span id="event-diagnosis-detail">告警详情</span>
                                                        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                                    </div>
                                                    <event-view-detail :id="id + '-detail'" :model="model.event"></event-view-detail>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="24">
                                                <el-card class="box-card" shadow="always">
                                                    <div slot="header" class="clearfix">
                                                        <span id="event-diagnosis-journal">告警轨迹</span>
                                                        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                                    </div>
                                                    <event-timeline :id="id + '-journal'" :model="model.journal.rows"></event-timeline>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="24">
                                                <el-card class="box-card" shadow="always">
                                                    <div slot="header" class="clearfix">
                                                        <span id="event-diagnosis-history">历史相关告警</span>
                                                        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                                    </div>
                                                    <event-diagnosis-datatable-component :id="id + '-history'" :model="model.history"></event-diagnosis-datatable-component>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="24">
                                                <el-card class="box-card" shadow="always">
                                                    <div slot="header" class="clearfix">
                                                        <span id="event-diagnosis-dimension">维度关联性告警</span>
                                                        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                                    </div>
                                                    <event-diagnosis-datatable-component :id="id + '-dimension'" :model="model.history"></event-diagnosis-datatable-component>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="24">
                                                <el-card class="box-card" shadow="always">
                                                    <div slot="header" class="clearfix">
                                                        <span id="event-diagnosis-probability">概率相关性告警</span>
                                                        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                                    </div>
                                                    <event-diagnosis-datatable-component :id="id + '-probability'" :model="model.history"></event-diagnosis-datatable-component>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                    </div>
                                </section>`,
                    mounted:function(){
                        this.init();
                    },
                    methods: {
                        init: function(){
                            const self = this;
                            
                            $(self.$el).find("ul>li").click(function(e){
                                $(self.$el).find("li.active").removeClass("active");
                                $(e.target).closest("li").addClass("active");
                                $("#content.content").css("padding-top","60px!important;");
                            })
                            
                        }
                    }
                    
                });
                
                event.app = {
                    delimiters: ['${', '}'],
                    template: "#app-template",
                    data: {
                        // 布局
                        layout:{
                            main:{
                                tabIndex: 1,
                                activeIndex: 'event-view-console',
                                tabs:[
                                    {name: 'event-view-console', title:'告警列表', type: 'main'}
                                ],
                                detail: {
                                    model: [],
                                    tabIndex: 1,
                                    activeIndex: '1',
                                }
                            },
                            summary: {
                                tabIndex: 1,
                                activeIndex: 'event-view-radar',
                                tabs:[
                                    {name: 'event-view-radar', title:'告警雷达', type: 'radar'},
                                    {name: 'event-view-pie', title:'告警统计', type: 'pie'}
                                ]
                            }
                        },
                        control: {
                            ifSmart: '1',
                        },
                        // 搜索组件结构
                        model: {
                            id: "matrix-event-search",
                            filter: null,
                            term: null,
                            preset: null,
                            message: null,
                        },
                        options: {
                            // 搜索窗口
                            name:"所有", value: "",
                            // 输入
                            term: "",
                            // 指定类
                            class: "#/matrix/devops/event/:",
                            // 指定api
                            api: "event",
                            // 时间窗口
                            range: { from: "", to: ""},
                            // 其它设置
                            others: {
                                // 是否包含历史数据
                                ifHistory: false,
                                // 是否包含Debug信息
                                ifDebug: false,
                                // 指定时间戳
                                forTime:  ' for vtime ',
                            }
                        }
                    },
                    watch:{
                        'layout.main.tabs':{
                            handler(val,oldVal){
                                if(val.length > 1){
                                    $("#tab-event-view-console").show();
                                }else {
                                    $("#tab-event-view-console").hide();
                                }
                            },
                            deep:true
                        }
                    },
                    filters: {
                        pickTitle(item,model,index){
                            try {
                                let count = 0;
                                count = model[item.type].rows.length;
                                
                                let badge = 0;
                                let severity = 0;
                                try{
                                    severity = _.maxBy(model[item.type].rows,'severity').severity;
                                } catch(error){
                                    severity = 0;
                                }
                                
                                badge = severity>=5?`<span style="color:#FF0000;">${count}</span>`:severity>=4?`<span style="color:#FFDC00;">${count}</span>`:count;
                                
                                return `${item.title} ${badge}`;

                            } catch(error){
                                return `${item.title} 0`;
                            }
                        }
                    },
                    created(){
                        // 接收搜索数据
                        eventHub.$on(`SEARCH-RESPONSE-EVENT-${this.model.id}`, this.setData);
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT",event.resizeEventConsole);
                    },
                    mounted(){
                        $(this.$el).addClass('view-normal');
                        
                        // 没有详细页时，默认隐藏告警列表Title
                        this.hideTabEventViewConsoleUl();
                        
                    },
                    methods: {
                        setData(event){
                            this.model = _.extend(this.model, this.$refs.searchRef.result);
                        },
                        hideTabEventViewConsoleUl(){
                            const self = this;

                            if($('#tab-event-view-console').is(':visible')) {
                                $("#tab-event-view-console").hide();
                            $("#tab-event-view-console > span").hide();
                            } else {
                                setTimeout(self.hideTabEventViewConsoleUl, 50);
                            }   
                        },
                        // 切换运行模式
                        toggleModel(event){
                            $(this.$el).removeClass(window.EVENT_VIEW);
                            $(this.$el).addClass(event);
                            window.EVENT_VIEW = event;
                        },
                        toggleSummaryView(evt){
                            if(evt==1) {
                                $("#event-view-summary").css("height","200px").css("display","");
                            } else {
                                $("#event-view-summary").css("height","0px").css("display","none");
                            }
                            this.control.ifSmart = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Event Console
                            event.resizeEventConsole();
                        },
                        detailAdd(event){
                            try {
                                let id = event.id;
                                if(this.layout.main.activeIndex === `detail-${id}`) return false;
                                
                                // event
                                let term = encodeURIComponent(JSON.stringify(event));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript('/event/diagnosis-by-id.js',term).message;
                                
                                // 添加tab
                                this.layout.main.detail.activeIndex = `diagnosis-${id}`;
                                let detail = {title:`告警分析 ${event.id}`, name:`detail-${id}`, type: 'detail', child:[
                                                {title:'告警分析', name:`diagnosis-${id}`, type: 'diagnosis', model:model},
                                                // {title:'告警轨迹', name:`journal-${id}`, type: 'journal'},
                                                // {title:'历史告警', name:`historyEvent-${id}`, type: 'historyEvent'},
                                                // {title:'维度关联性告警', name:`associationEvent-${id}`, type: 'associationEvent'},
                                                // {title:'概率相关性告警', name:`probabilityEvent-${id}`, type: 'probabilityEvent'},
                                                // {title:'性能', name:`performance-${id}`, type: 'performance'},
                                                // {title:'日志', name:`log-${id}`, type: 'log'},
                                                // {title:'配置', name:`config-${id}`, type: 'config'},
                                                // {title:'工单', name:`ticket-${id}`, type: 'ticket'},
                                                // {title:'原始报文', name:`raw-${id}`, type: 'raw'},
                                                {title:'资源信息', name:`topological-${id}`, type: 'topological'},
                                            ]};
                                
                                this.layout.main.tabs.push(detail);
                                this.layout.main.activeIndex = `detail-${id}`;
                                
                            } catch(error){
                                this.layout.main.tabs = [];
                            }
                        },
                        detailRemove(targetName) {
                            let tabs = this.layout.main.tabs;
                            let activeIndex = this.layout.main.activeIndex;
                            if (activeIndex === targetName) {
                              tabs.forEach((tab, index) => {
                                if (tab.name === targetName) {
                                  let nextTab = tabs[index + 1] || tabs[index - 1];
                                  if (nextTab) {
                                    activeIndex = nextTab.name;
                                  }
                                }
                              });
                            }
                            
                            this.layout.main.activeIndex = activeIndex;
                            this.layout.main.tabs = tabs.filter(tab => tab.name !== targetName);

                        }
                    }
                };
                new Vue(event.app).$mount("#app");    
            });
        })

        window.addEventListener('resize', () => { 
            event.resizeEventConsole();
        })

        
    }

    resizeEventConsole(){
        let evwH = $(window).height();
        let evcH = $("#event-view-container").height();
        let evsH = $("#event-view-summary").height();
        
        $("#event-view-console .dataTables_scrollBody").css("max-height", evwH + "px")
                                                        .css("max-height","-=260px")
                                                        .css("max-height","-=" + evsH + "px");
    }

    graphNav(id){
        return {
            delimiters: ['${', '}'],
            el: '#' + id,
            template: `<probe-tree-component id="event-detail-graph-tree" :model="{parent:'/event',name:'event_tree_data.js',domain:'event'}"></probe-tree-component>`,
            data: {
                id: id
            },
            mounted: function () {
                const self = this;

                self.$nextTick(function () {

                })
            }
        };
    }

    graph(id){
        return {
            delimiters: ['${', '}'],
            el: '#' + id,
            template: `<event-graph-component :id="id" :graphData="model"></event-graph-component>`,
            data: {
                id: id,
                model: fsHandler.callFsJScript('/event/event_detail_graph.js', null).message.data[0].graph
            },
            mounted: function () {
                const self = this;

                self.$nextTick(function () {

                })
            }
        };
    }

    performance(id){
        return {
            delimiters: ['${', '}'],
            el: '#' + id,
            template: `<div id="performance">
                        <event-diagnosis-datatable-component :id="id" :type="model"></event-diagnosis-datatable-component>
                       </div>`,
            data: {
                id: id,
                model: 'performance'
            }
        };
    }

    log(id){
        return {
            delimiters: ['${', '}'],
            el: '#' + id,
            template: `<div id="log">
                            <event-diagnosis-datatable-component :id="id" :type="model"></event-diagnosis-datatable-component>
                        </div>`,
            data: {
                id: id,
                model: 'log'
            }
        };
    }

    config(id){
        return {
            delimiters: ['${', '}'],
            el: '#' + id,
            template: `<div id="config">
                            <event-diagnosis-datatable-component :id="id" :type="model"></event-diagnosis-datatable-component>
                        </div>`,
            data: {
                id: id,
                model: 'config'
            }
        };
    }

    ticket(id){
        return {
            delimiters: ['${', '}'],
            el: '#' + id,
            template: `<div id="ticket">
                            <event-diagnosis-datatable-component :id="id" :type="model"></event-diagnosis-datatable-component>
                       </div>`,
            data: {
                id: id,
                model: 'ticket'
            }
        };
    }

    checkContainer(){
        if($('#event-view-container').is(':visible')) {
            event.layout();
        } else {
            setTimeout(event.checkContainer, 50);
        }
    }



}

let event = new Event();
event.init();