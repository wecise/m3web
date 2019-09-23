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
class Performance extends Matrix {

    constructor() {
        super();

        // 运行模式定义
        window.EVENT_VIEW_LIST = ['view-normal','view-tags','view-fullscreen'];
        window.EVENT_VIEW = 'view-normal';
        
        this.app = null;
        this.detail = null;
    }

    init() {
        
        const performance = this;

        VueLoader.onloaded(["ai-robot-component",
                            "performance-datatable-component",
                            "performance-diagnosis-datatable-component",
                            "search-preset-component",
                            "search-base-component"],function() {
            $(function() {

                Vue.component('performance-history-chart', {
                    template: `<div :id="id" style="width:100%;height:280px;"></div>`,
                    props:{
                        id:String,
                        model:Object,
                        config: Object
                    },
                    data(){
                        return {
                            chart: null,
                            option: {
                                tooltip: {
                                    trigger: 'axis'
                                },
                                toolbox: {
                                    show: true,
                                    feature: {
                                        dataZoom: {},
                                        dataView: {readOnly: false},
                                        magicType: {type: ['line', 'bar']},
                                        restore: {},
                                        saveAsImage: {}
                                    }
                                },
                                xAxis: {
                                    type: 'category',
                                    data: []
                                },
                                yAxis: {
                                    type: 'value'
                                },
                                series: []
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
                            
                            // 取实时数据的time作为xAxis
                            this.option.xAxis.data = _.map(this.model.value.reverse(),function(v){
                                return moment(v[mx.global.register.performance.chart.time]).format(self.config.step);
                            });
                            
                            this.option.series = _.map(this.config.type,function(v){
                                
                                if(v=='value'){
                                    return {    
                                        name: v,
                                        data: _.map(self.model.value.reverse(), v),
                                        type: 'line',
                                        smooth: true,
                                        color: mx.global.register.performance.chart.color[v],
                                        markLine: {
                                            data: [{
                                                type: 'average',
                                                name: '平均值'
                                            }]
                                        }
                                    }
                                } else {
                                    if(!_.isEmpty(self.model.baseline)) {
                                        return  {
                                            name: v,
                                            data: _.map(self.model.baseline.reverse(), v=='avg'?'value':v),
                                            type: 'line',
                                            smooth: true,
                                            color: mx.global.register.performance.chart.color[v]
                                        }
                                    }
                                }
                                
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
                Vue.component("performance-view-radar",{
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
                    template:   `<div>
                                    <div class="progress" 
                                         v-for="pg in progress" 
                                         style="padding-left: 80px;overflow: hidden;height: 24px;margin-bottom: 5px;background-color: rgb(245, 245, 245);border-radius: 4px;transition: width .6s ease;">
                                        <label style="padding: 3px 5px;position: absolute;left: 10px;">#{pg.name}#</label>
                                        <el-tooltip placement="top" v-for="item in pg.child" open-delay="500">
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
                                            color: _.sample(_.map(mx.global.register.color.summary,'color'))
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

                // 性能详情
                Vue.component("performance-diagnosis-detail",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    template: `<el-container style="height: calc(100vh - 200px);">
                                    <el-main><el-row :gutter="10">
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
                                                            <input type="text" class="form-control-bg-grey" :placeholder="item.data" :value="model.rows[item.data]" v-if="window.COMPANY_OSPACE=='sucdt'">
                                                            <input type="text" class="form-control-bg-grey" :placeholder="item.data" :value="model.rows[item.data] | mx.bytesToSize" v-else>
                                                            <!--progress :value="model.rows[item.data]" max="100"></progress> <b style="font-size:12px;">#{model.rows[item.data]}#%</b-->
                                                        </div>
                                                        <div v-else-if="item.data==='value' && model.rows[item.data] > 100">
                                                            <input type="text" class="form-control-bg-grey" :placeholder="item.data" :value="model.rows[item.data]" v-if="window.COMPANY_OSPACE=='sucdt'">
                                                            <input type="text" class="form-control-bg-grey" :placeholder="item.data" :value="model.rows[item.data] | mx.bytesToSize" v-else>
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
                                                            <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value" v-if="window.COMPANY_OSPACE=='sucdt'">
                                                            <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | mx.bytesToSize" v-else>
                                                            <!--progress :value="value" max="100"></progress> <b style="font-size:12px;">#{value}#%</b-->
                                                        </div>
                                                        <div v-else-if="key==='value' && value > 100">
                                                            <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value" v-if="window.COMPANY_OSPACE=='sucdt'">
                                                            <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | mx.bytesToSize" v-else>
                                                        </div>
                                                        <div v-else>
                                                            <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | handlerFormat">
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </el-col>
                                    </el-row>
                                    </el-main>
                                </el-container>`,
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

                // 历史性能
                Vue.component("performance-diagnosis-history",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    data(){
                        return {
                            baseLine: {
                                type: {
                                    value: [],
                                    list: [{
                                        value: 'week',
                                        label: '周基线'
                                      }, {
                                        value: 'month',
                                        label: '月基线'
                                      }]
                                }
                            },
                            trends: []
                        }
                    },
                    template: `<el-container style="height: calc(100vh - 200px);">
                                    <el-header style="height: 30px;
                                                        padding: 0px 10px;
                                                        line-height: 20px;">
                                        <el-select v-model="baseLine.type.value" placeholder="选择基线" class="el-select">
                                            <el-option
                                            v-for="item in baseLine.type.list"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value">
                                            </el-option>
                                        </el-select>
                                    </el-header>
                                    <el-main style="padding:10px 0px;">
                                        <div class="grid-stack">
                                            <div class="grid-stack-item"
                                                data-gs-auto-position="true"
                                                data-gs-width="6" data-gs-height="4"
                                                v-for="item,index in model.trends">
                                                    <div class="grid-stack-item-content" style="border:1px solid #dddddd;">
                                                        <el-card class="box-card" style="width: 100%;height:100%;" >
                                                            <div slot="header" class="clearfix">
                                                                <span>历史性能 <small>#{item.title}#</small></span>
                                                                <el-tooltip :content="item.detail">
                                                                    <span class="fas fa-question-circle"></span>
                                                                </el-tooltip>    
                                                                <el-tooltip content="设置">
                                                                    <a href="javascript:void(0);" class="btn btn-link" style="float: right; padding: 3px 0"><i class="fas fa-cog"></i></a>
                                                                </el-tooltip>
                                                            </div>
                                                            <performance-history-chart :id="id + 'performance-history-chart-' + item.value" 
                                                                                        :model="model.rows[item.value]" 
                                                                                        :config="item.config"></performance-history-chart>
                                                        </el-card>
                                                    </div>
                                            </div>
                                        </div>
                                        
                                    
                                    </el-main>
                                </el-container>`,
                    mounted(){
                        _.delay(()=>{
                            $('.grid-stack').gridstack();
                            $('.grid-stack').on('gsresizestop', function(event, elem) {
                                eventHub.$emit("WINDOW-RESIZE-EVENT");
                            });
                        },500)
                    },
                    methods: {
                        
                    }
                });

                // 性能轨迹
                Vue.component("performance-diagnosis-journal",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    template: `<el-container style="height: calc(100vh - 200px);">
                                    <el-main><el-card class="box-card">
                                        <div slot="header" class="clearfix">
                                            <h4>
                                                #{moment(_.head(model.rows).vtime).format("LLL")}# - #{moment(_.last(model.rows).vtime).format("LLL")}#
                                            </h4>
                                            <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                        </div>
                                        <performance-timeline :id="id + '-journal'" :model="model.rows"></performance-timeline>
                                    </el-card>
                                    </el-main>
                                </el-container>`,
                    mounted(){
                    }
                });

                // 仪表盘
                Vue.component("performance-gauge",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data:function(){
                        return {
                            gauge: []
                        }
                    },
                    template: ` <div style="width: 100%;height:200px;float: left;display: flex;flex-wrap: wrap;">
                                    <div v-for="(group,key) in _.groupBy(gauge,'host')" style="width: 100%;height:auto;float: left;display: flex;flex-wrap: wrap;border-bottom: 1px solid #ddd;">
                                        <h5>#{key}#</h5>
                                        <max-echart-pie-performance :id="'guage-'+objectHash.sha1(item)" :model="item" v-for="item in group"></max-echart-pie-performance>
                                    </div>
                                </div>`,
                    watch:{
                        model:{
                            handler(val,oldVal){
                                const self = this;

                                self.initData();
                            },
                            deep:true
                        }
                    },
                    mounted:function(){
                        this.initData();
                    },
                    methods: {
                        initData: function(){
                            const self = this;
                            
                            if(!self.model || !self.model.rows) return false;
                            self.gauge = [];
                            _.forEach(self.model.rows,function(v){
                                if(_.endsWith(v.param,'usedpercent')) {
                                    self.gauge.push(v);
                                }
                            });
                            
                            self.gauge = _.orderBy(self.gauge,['host','inst','param'],['asc','asc','asc'])
                        }
                    }
                    
                });

                // 时间轴
                Vue.component("performance-timeline",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<div class="block"><el-timeline>
                                    <el-timeline-item :timestamp="moment(item.ctime).format(mx.global.register.performance.time.format)" placement="top" v-for="item in model">
                                        <el-card style="box-shadow: 0 0px 2px 0 rgba(0, 0, 0, 0.1);">
                                            <div style="padding: 5px;">
                                                <h3>#{item.value}#</h3>
                                                <div class="bottom clearfix">
                                                    <time class="time" style="font-size:12px;">采集时间：#{moment(item.ctime).format(mx.global.register.performance.time.format)}#</time><br>
                                                    <time class="time" style="font-size:12px;">入库时间：#{moment(item.vtime).format(mx.global.register.performance.time.format)}#</time>
                                                </div>
                                            </div>    
                                        </el-card>
                                    </el-timeline-item>
                                </el-timeline></div>`
                })

                // 资源信息
                Vue.component("performance-diagnosis-topological",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            splitInst: null
                        }
                    },
                    template:  `<el-container style="height: calc(100vh - 200px);">
                                    <el-aside class="split" :id="id+'-topological-view-left'">
                                        
                                    </el-aside>
                                    <el-container class="split" :id="id+'-topological-view-right'">
                                        <el-main style="padding:0px;">
                                            <div :id="'topological-app-'+id"></div>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    mounted(){
                        this.init();
                    },
                    methods: {
                        init(){
                            let mxTopological = new Topological();
                            mxTopological.init();
                            mxTopological.graphScript = _.map([this.model.rows],function(v){
                                return {value: `match () - [*1] -> ("${v.entity}") - [*1] -> ()`};
                            });
                            mxTopological.mount(`#topological-app-${this.id}`);
                            
                            _.delay(()=>{
                                mxTopological.app.contextMenu();
                            },500)

                            this.splitInst = Split([`#${this.id}-topological-view-left`, `#${this.id}-topological-view-right`], {
                                sizes: [0, 100],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal',
                            });
                        }
                    }
                })
                
                let main = {
                    delimiters: ['${', '}'],
                    template: "#app-template",
                    data: {
                        // 布局
                        layout:{
                            main:{
                                tabIndex: 1,
                                activeIndex: 'performance-view-console',
                                tabs:[
                                    {name: 'performance-view-console', title:'性能列表', type: 'main'}
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
                            ifSmart: '0',
                            ifRefresh: '0',
                        },
                        // 搜索组件结构
                        model: {
                            id: "matrix-performance-search",
                            filter: null,
                            term: null,
                            preset: null,
                            message: null,
                        },
                        options: {
                            // 搜索窗口
                            name:"所有", value: "",
                            // 输入
                            term: "top 500",
                            // 指定类
                            class: "#/matrix/devops/performance/:",
                            // 指定api
                            api: "performance",
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
                                    $("#tab-performance-view-console").show();
                                }else {
                                    $("#tab-performance-view-console").hide();
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
                        // 初始化term
                        try{
                            let term = decodeURIComponent(window.atob(mx.urlParams['term']));
                            this.options.term = term;
                        } catch(err){

                        }
                        
                        // 接收搜索数据
                        eventHub.$on(`SEARCH-RESPONSE-EVENT-${this.model.id}`, this.setData);
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT",performance.resizeEventConsole);
                    },
                    mounted(){
                        const self = this;
                        
                        $(this.$el).addClass('view-normal');
                        
                        // 没有详细页时，默认隐藏告警列表Title
                        this.hideTabEventViewConsoleUl();

                        // 维度统计
                        this.toggleSummaryBySmart(this.control.ifSmart);

                        // 窗口Resize
                        _.delay(function(){
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");

                            Split(['#performance-view-left', '#performance-view-main'], {
                                sizes: [20, 80],
                                minSize: [0, 0],
                                gutterSize: 5,
                                gutterAlign: 'end',
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true
                            });
                        },2000);

                        // Document mouse listener
                        $(document).click(function(evt) {
                            if($(evt.target).is(".performance-view-summary-control-refresh .el-switch__core")){
                                evt.preventDefault();
                                self.control.ifRefresh = '0';
                            }
                         });
                        
                    },
                    methods: {
                        setData(event){
                            this.model = _.extend(this.model, this.$refs.searchRef.result);
                        },
                        hideTabEventViewConsoleUl(){
                            const self = this;

                            if($('#tab-performance-view-console').is(':visible')) {
                                $("#tab-performance-view-console").hide();
                            $("#tab-performance-view-console > span").hide();
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
                        toggleSummaryBySmart(evt){
                            if(evt==1) {
                                $("#performance-view-summary").css("height","200px").css("display","");
                            } else {
                                $("#performance-view-summary").css("height","0px").css("display","none");
                            }
                            this.control.ifSmart = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Event Console
                            performance.resizeEventConsole();
                        },
                        toggleSummaryByRefresh(evt){
                            const self = this;
                            
                            if(evt==1) {
                                window.intervalListener = setInterval(function(){
                                    self.$refs.searchRef.search();
                                },mx.global.register.interval)
                            } else {
                                clearInterval(window.intervalListener);
                            }

                            this.control.ifRefresh = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Event Console
                            performance.resizeEventConsole();
                        },
                        detailAdd(event){
                            try {
                                let id = event.id;
                                if(this.layout.main.activeIndex === `diagnosis-${id}`) return false;
                                
                                // event
                                let term = encodeURIComponent(JSON.stringify(event).replace(/%/g,'%25'));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript("/matrix/performance/diagnosis-by-id.js",term).message;
                                
                                // 添加tab
                                let detail = {title:`性能分析 ${event.host}/${event.inst}/${event.param}`, name:`diagnosis-${id}`, type: 'diagnosis', child:[
                                                {title:'性能详情', name:`diagnosis-detail-${id}`, type: 'detail', model:model},
                                                {title:'历史性能', name:`diagnosis-history-${id}`, type: 'history', model:model},
                                                {title:'性能轨迹', name:`diagnosis-journal-${id}`, type: 'journal', model:model},
                                                {title:'资源信息', name:`diagnosis-topological-${id}`, type: 'topological', model:model}
                                            ]};
                                
                                this.layout.main.tabs.push(detail);
                                this.layout.main.activeIndex = `diagnosis-${id}`;
                                this.layout.main.detail.activeIndex = _.first(detail.child).name;
                                
                            } catch(error){
                                this.layout.main.tabs = [];
                            }
                        },
                        detailRemove(targetName) {
                            
                            try{
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
                                this.layout.main.detail.activeIndex = _.first(_.last(this.layout.main.tabs).child).name;

                                _.delay(function(){
                                    // RESIZE Event Summary
                                    eventHub.$emit("WINDOW-RESIZE-EVENT");
                                    // RESIZE Event Console
                                    performance.resizeEventConsole();
                                },500)
                            } catch(err){

                            }

                        },
                        toggle(){
                            _.delay(function(){
                                // 窗体RESIZE事件
                                eventHub.$emit("WINDOW-RESIZE-EVENT");
                            },500)
                        },
                        contextMenu(tId,inst,items,fun){
                            const self = this;

                            $.contextMenu({
                                selector: `#${tId} tr td:not(:nth-child(1))`,
                                trigger: 'right',
                                autoHide: true,
                                delay: 5,
                                hideOnSecondTrigger: true,
                                className: `animated slideIn ${tId} context-menu-list`,
                                build: function($trigger, e) {
                    
                                    return {
                                        callback: function(key, opt) {
                                            
                                            if(_.includes(key,'diagnosis')) {
                                                self.detailAdd(inst.selectedRows);
                                            } else if(_.includes(key,'action')) {
                                                // 增加操作类型
                                                let action = _.last(key.split("_"));
                                                self.action({list: [inst.selectedRows], action:action});
                                            }
                                        },
                                        items: items
                                    }
                                },
                                events: {
                                    show: function(opt) {
                    
                                        let $this = this;
                                        _.delay(function(){
                                            new Vue(mx.tagInput(`${tId}_single_tags`, `.${tId} input`, inst.selectedRows, fun));
                                        },50)
                                    },
                                    hide: function(opt) {
                    
                                        let $this = this;
                    
                                    }
                                }
                            });
                        }

                    }
                };
                
                this.app = new Vue(main).$mount("#app");    
            });
        })

        window.addEventListener('resize', () => { 
            performance.resizeEventConsole();

            // RESIZE Event Summary
            eventHub.$emit("WINDOW-RESIZE-EVENT");
        })

        
    }

    resizeEventConsole(){
        let evwH = $(window).height();
        let evcH = $("#performance-view-container").height();
        let evsH = $("#performance-view-summary").height();
        
        $("#performance-view-console .dataTables_scrollBody").css("max-height", evwH + "px")
                                                        .css("max-height","-=230px")
                                                        .css("max-height","-=" + evsH + "px")
                                                        .css("min-height", evwH + "px")
                                                        .css("min-height","-=230px")
                                                        .css("min-height","-=" + evsH + "px");
    }

}