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
class Job extends Matrix {

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

                Vue.component('performance-history-chart', {
                    template: `<div :id="id" style="width:100%;height:200px;"></div>`,
                    props:{
                        id:String,
                        model:Object
                    },
                    data(){
                        return {
                            chart: null,
                            option: {
                                tooltip: {
                                    trigger: 'axis'
                                },
                                xAxis: {
                                    type: 'category',
                                    data: []
                                },
                                yAxis: {
                                    type: 'value'
                                },
                                series: [{
                                    data: [],
                                    type: 'line',
                                    smooth: true
                                }]
                            }                            
                        }
                    },
                    created(){
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);
                    },
                    mounted() {
                        this.init();
                    },
                    watch: {
                        model: {
                            handler: function (val,oldVal) {
                                
                            },
                            deep:true
                        }
                    },
                    methods: {
                        init(){
                            this.initData();
                            this.chart = echarts.init(this.$el);
                            this.chart.setOption(this.option);
                        },
                        initData(){
                            const self = this;
                            this.option.xAxis.data = [];
                            this.option.series[0].data = [];
                            _.forEach(this.model.reverse(),function(v){
                                self.option.xAxis.data.push(moment(v.vtime).format("YY-MM-DD HH:mm:SS"));
                                self.option.series[0].data.push(v.value);
                            });
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
                }); 

                // 雷达
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

                // 详情
                Vue.component("performance-view-detail",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    template: `<el-row :gutter="10">
                                    <el-col :xs="12" :sm="10" :md="6" :lg="6" :xl="10">
                                        <div class="grid-content" style="text-align:center;">
                                            <img src="/fs/assets/images/entity/png/linux.png?issys=true&type=download" class="image">
                                            <p><h3>#{model.rows.host}#</h3></p>
                                        </div>
                                    </el-col>
                                    <el-col :xs="12" :sm="14" :md="18" :lg="18" :xl="14">
                                        <div class="grid-content">
                                            <form class="form-horizontal" style="height:50vh;overflow-x: hidden;overflow-y: auto;">
                                                <!-- 有模板 -->
                                                <div class="form-group" v-for="item in model.template" style="padding: 0px 10px;margin-bottom: 1px;" v-if="model.template">
                                                    <label :for="item.title" class="col-sm-2 control-label" style="text-align:left;">#{item.title}#</label>
                                                    <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                        <div v-if="item.data==='value' && model.rows[item.data] <= 100">
                                                            <progress :value="model.rows[item.data]" max="100"></progress> <b style="font-size:12px;">#{model.rows[item.data]}#%</b>
                                                        </div>
                                                        <div v-else-if="item.data==='value' && model.rows[item.data] > 100">
                                                            <input type="text" class="form-control-bg-grey" :placeholder="item.data" :value="model.rows[item.data] | mx.bytesToSize">
                                                        </div>
                                                        <div v-else>
                                                            <input type="text" class="form-control-bg-grey" :placeholder="item.data" :value="model.rows[item.data] | handlerFormat">
                                                        </div>
                                                    </div>
                                                </div>
                                                <!-- 没有模板 -->
                                                <div class="form-group" v-for="(value,key) in model.rows" style="padding: 0px 10px;margin-bottom: 1px;" v-else>
                                                    <label :for="key" class="col-sm-2 control-label" style="text-align:left;">#{key}#</label>
                                                    <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                        <div v-if="key==='value' && value <= 100">
                                                            <progress :value="value" max="100"></progress> <b style="font-size:12px;">#{value}#%</b>
                                                        </div>
                                                        <div v-else-if="key==='value' && value > 100">
                                                            <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | mx.bytesToSize">
                                                        </div>
                                                        <div v-else>
                                                            <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | handlerFormat">
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </el-col>
                                </el-row>`,
                    filters:{
                        handlerFormat(evt){
                            // 2019-03-13T21:35:31.678Z
                            // 检查是否是UTC格式
                            if(_.indexOf(evt,'T') === 10 && (_.indexOf(evt,'Z') === 23 || _.indexOf(evt,'Z') === 19) ){
                                return moment(evt).format("LLL");
                            } else {
                                return evt;
                            }
                        }
                    },
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
                            gauge: [
                                {host:'wecise',inst:'',param:'', value:25,status:'success', showText:false},
                                {host:'wecise',inst:'',param:'', value:80,status:'success', showText:false},
                                {host:'wecise',inst:'',param:'', value:100,status:'success', showText:false},
                                {host:'wecise',inst:'',param:'', value:50,status:'text', showText:false},
                                {host:'wecise',inst:'',param:'', value:100,status:'exception', showText:false},
                                {host:'wecise',inst:'',param:'', value:75,status:'success', showText:false}
                            ]
                        }
                    },
                    template: ` <el-row :gutter="0">
                                    <el-col :span="3" v-for="item in gauge">
                                        <div class="grid-content" style="text-align: center;">
                                            <el-progress type="circle" :percentage="item.value" :status="item.status"></el-progress>
                                            <p>#{item.host}#</p>
                                        </div>
                                    </el-col>
                                </el-row>`,
                    mounted:function(){
                        this.init();
                    },
                    methods: {
                        init: function(){
                            const self = this;
                        
                        }
                    }
                    
                });

                // 执行命令时间轴
                Vue.component("cmds-timeline",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<div class="block"><el-timeline>
                                    <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model">
                                        <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                            <h4>名称：#{item.name}#</h4>
                                            <p><code>命令：#{item.cmd}#</code></p>
                                            <p>位置：#{item.dir}#</p>
                                            <p>源：#{item.source}#</p>
                                            <p>服务器：#{item.host}#</p>
                                            <p>进程ID：#{item.pid}#</p>
                                            <p>RUNID：#{item.runid}#</p>
                                            <p>SID：#{item.sid}#</p>
                                            <p>状态：#{item.stauts}#</p>
                                            <p>类型：#{item.type}#</p>
                                            <p>开始时间：#{moment(item.stime).format("LLL")}#  结束时间：#{moment(item.etime).format("LLL")}#</p>
                                            <p>命令：#{item.cmds}#</p>
                                            <p>输出：#{item.output}#</p>
                                            <p>错误：#{item.err}#</p>
                                            <p>代码：#{item.code}#</p>
                                        </el-card>
                                    </el-timeline-item>
                                </el-timeline></div>`
                })

                // 时间轴
                Vue.component("performance-timeline",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<div class="block"><el-timeline>
                                    <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model">
                                        <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                            <h4>#{item.name}#</h4>
                                            <p>状态：#{item.stauts}#  类型：#{item.type}#</p>
                                            <p>开始时间：#{moment(item.stime).format("LLL")}#  结束时间：#{moment(item.etime).format("LLL")}#</p>
                                            <p>命令：#{item.cmds}#</p>
                                        </el-card>
                                    </el-timeline-item>
                                </el-timeline></div>`
                })
                
                // 分析
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
                                        <li class="active"><a href="#event-diagnosis-detail">作业详情</a></li>
                                        <li class=""><a href="#event-diagnosis-journal">作业轨迹</a></li>
                                        <li class=""><a href="#event-diagnosis-cmds">执行命令</a></li>
                                    </ul>
                                    <div class="content">
                                        <el-row>
                                            <el-col :span="24">
                                                <el-card class="box-card" shadow="always">
                                                    <div slot="header" class="clearfix">
                                                        <span id="event-diagnosis-detail">作业详情</span>
                                                        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                                    </div>
                                                    <performance-view-detail :id="id + '-detail'" :model="model.detail"></performance-view-detail>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="24">
                                                <el-card class="box-card">
                                                    <div slot="header" class="clearfix">
                                                        <span id="event-diagnosis-journal">作业轨迹
                                                            <small>#{moment(_.head(model.journal.rows).vtime).format("LLL")}# - #{moment(_.last(model.journal.rows).vtime).format("LLL")}#</small>
                                                        </span>
                                                        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                                    </div>
                                                    <performance-timeline :id="id + '-journal'" :model="model.journal.rows"></performance-timeline>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="24">
                                                <el-card class="box-card">
                                                    <div slot="header" class="clearfix">
                                                        <span id="event-diagnosis-cmds">执行命令
                                                            <small>#{moment(_.head(model.cmds.rows).vtime).format("LLL")}# - #{moment(_.last(model.cmds.rows).vtime).format("LLL")}#</small>
                                                        </span>
                                                        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                                    </div>
                                                    <cmds-timeline :id="id + '-cmds'" :model="model.cmds.rows"></cmds-timeline>
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
                
                maxJob.app = {
                    delimiters: ['${', '}'],
                    template: "#app-template",
                    data: {
                        // 布局
                        layout:{
                            main:{
                                tabIndex: 1,
                                activeIndex: 'event-view-console',
                                tabs:[
                                    {name: 'event-view-console', title:'性能列表', type: 'main'}
                                ],
                                detail: {
                                    model: [],
                                    tabIndex: 1,
                                    activeIndex: '1',
                                }
                            },
                            summary: {
                                tabIndex: 1,
                                activeIndex: 'performance-view-radar',
                                tabs:[
                                    {name: 'performance-view-radar', title:'雷达', type: 'radar'},
                                    {name: 'performance-view-gauge', title:'仪表盘', type: 'gauge'}
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
                            class: "#/matrix/jobs/:",
                            // 指定api
                            api: "job",
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
                        eventHub.$on("WINDOW-RESIZE-EVENT",maxJob.resizeEventConsole);
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
                            maxJob.resizeEventConsole();
                        },
                        detailAdd(event){
                            try {
                                let id = event.id;
                                if(this.layout.main.activeIndex === `detail-${id}`) return false;
                                
                                // event
                                let term = encodeURIComponent(JSON.stringify(event));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript('/job/diagnosis-by-id.js',term).message;
                                
                                // 添加tab
                                this.layout.main.detail.activeIndex = `diagnosis-${id}`;
                                let detail = {title:`作业分析 ${event.name}`, name:`detail-${id}`, type: 'detail', child:[
                                                {title:'作业分析', name:`diagnosis-${id}`, type: 'diagnosis', model:model},
                                                // {title:'告警轨迹', name:`journal-${id}`, type: 'journal'},
                                                // {title:'历史告警', name:`historyEvent-${id}`, type: 'history'},
                                                // {title:'维度关联性告警', name:`associationEvent-${id}`, type: 'associationEvent'},
                                                // {title:'概率相关性告警', name:`probabilityEvent-${id}`, type: 'probabilityEvent'},
                                                // {title:'性能', name:`performance-${id}`, type: 'performance'},
                                                // {title:'日志', name:`log-${id}`, type: 'log'},
                                                // {title:'配置', name:`config-${id}`, type: 'config'},
                                                // {title:'工单', name:`ticket-${id}`, type: 'ticket'},
                                                // {title:'原始报文', name:`raw-${id}`, type: 'raw'},
                                                //{title:'资源信息', name:`topological-${id}`, type: 'topological'},
                                            ]};
                                
                                this.layout.main.tabs.push(detail);
                                this.layout.main.activeIndex = `detail-${id}`;
                                
                            } catch(error){
                                this.layout.main.tabs = [];
                            }
                        },
                        detailRemove(targetName) {
                            console.log(targetName)
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
                new Vue(maxJob.app).$mount("#app");    
            });
        })

        window.addEventListener('resize', () => { 
            maxJob.resizeEventConsole();
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
            template: `<probe-tree-component id="event-detail-graph-tree" :model="{parent:'/job',name:'job_tree_data.js',domain:'job'}"></probe-tree-component>`,
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
                model: fsHandler.callFsJScript('/job/job_detail_graph.js', null).message.data[0].graph
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
            maxJob.layout();
        } else {
            setTimeout(maxJob.checkContainer, 50);
        }
    }



}

let maxJob = new Job();
maxJob.init();