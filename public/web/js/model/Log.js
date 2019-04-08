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
class Log extends Matrix {

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

                Vue.component('bootstrap-table-search', {
                    template: `<table></table>`,
                    props:{
                        columns: Array,
                        data: Array,
                        options: Object,
                        forward: String
                    },
                    mounted: function () {
                        let self = this;

                        self.$nextTick(function () {
                            $(self.$el).bootstrapTable(_.extend({
                                                    data: self.data,
                                                    columns: self.columns
                                                }, self.options));

                            $(self.$el).on('dbl-click-row.bs.table', function (e, row, $element) {
                                
                                // Search For
                                localStorage.setItem("search-open-"+self.forward,JSON.stringify({
                                                                                id: row.id,
                                                                                preset:appVue.search.preset
                                                                            })
                                                    );
                                window.open(
                                        "/janesware/"+self.forward,
                                        "_blank"
                                    );
                            });

                            $(self.$el).on('click-row.bs.table', function (e, row, $element) {
                                $('.info').removeClass('info');
                                $($element).addClass('info');
                            });
                        })
                    },
                    watch: {
                        data: {
                            handler: function (val,oldVal) {
                                let self = this;
                                
                                var cols= $(self.$el).bootstrapTable('getVisibleColumns');
                                
                                if(_.isEmpty(cols)){ // table null
                                    $(self.$el).bootstrapTable('destroy').bootstrapTable(_.extend({
                                                            data: val,
                                                            columns: self.columns
                                                        }, self.options));
                                } else {
                                    $(self.$el).bootstrapTable('load',val);
                                    $(self.$el).bootstrapTable('refreshOptions',self.options);
                                }
                            },
                            deep:true
                        }
                    }
                }); 

                // 时间轴
                Vue.component("event-view-timeline",{
                    delimiters: ['${', '}'],
                    props: {
                        id: String
                    },
                    template: "#event-view-timeline-template"
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
                Vue.component("event-view-detail",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:String
                    },
                    template: `<form class="form-horizontal">
                                    <div class="form-group" v-for="(value,key) in model.rows[0]" style="padding: 0px 10px;margin-bottom: 1px;">
                                        <label :for="key" class="col-sm-2 control-label" style="text-align:left;">#{key}#</label>
                                        <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                            <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | handlerFormat" v-if="JSON.stringify(value).length<200">
                                            <textarea type="text" class="form-control-bg-grey" rows="6" :placeholder="key" :value="value | handlerFormat" v-else></textarea>
                                        </div>
                                    </div>
                                </form>`,
                    filters:{
                        handlerFormat(evt){
                            // 2019-03-13T21:35:31.678Z
                            // 检查是否是UTC格式
                            if(_.indexOf(evt,'T') === 10 && _.indexOf(evt,'Z') === 23){
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
                                        <li class="active"><a href="#event-diagnosis-detail">日志详情</a></li>
                                        <li class=""><a href="#event-diagnosis-journal">轨迹</a></li>
                                        <li class=""><a href="#event-diagnosis-history">历史</a></li>
                                    </ul>
                                    <div class="content">
                                        <h5 id="event-diagnosis-detail">详情</h5>
                                        <p>
                                            <event-view-detail :id="id + '-detail'" :model="model.log"></event-view-detail>
                                        </p>
                                        <h5 id="event-diagnosis-journal">轨迹</h5>
                                        <p>
                                            <vue-timeline-component :id="id + '-journal'" :model="model.journal.rows"></vue-timeline-component>
                                        </p>
                                        <h5 id="event-diagnosis-history">历史</h5>
                                        <p>
                                            <event-diagnosis-datatable-component :id="id + '-history'" :model="model.history"></event-diagnosis-datatable-component>
                                        </p>
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
                
                maxLog.app = {
                    delimiters: ['${', '}'],
                    template: "#app-template",
                    data: {
                        // 布局
                        layout:{
                            main:{
                                tabIndex: 1,
                                activeIndex: 'event-view-console',
                                tabs:[
                                    {name: 'event-view-console', title:'日志列表', type: 'main'}
                                ],
                                detail: {
                                    model: [],
                                    tabIndex: 1,
                                    activeIndex: '1',
                                }
                            },
                            summary: {
                                tabIndex: 1,
                                activeIndex: 'log-view-radar',
                                tabs:[
                                    {name: 'log-view-radar', title:'雷达', type: 'radar'},
                                    {name: 'log-view-gauge', title:'仪表盘', type: 'gauge'}
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
                            class: "#/matrix/devops/log/:",
                            // 指定api
                            api: "log",
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
                        eventHub.$on("WINDOW-RESIZE-EVENT",maxLog.resizeEventConsole);
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
                            maxLog.resizeEventConsole();
                        },
                        detailAdd(event){
                            try {
                                let id = event.id;
                                if(this.layout.main.activeIndex === `detail-${id}`) return false;
                                
                                // event
                                let term = encodeURIComponent(JSON.stringify(event));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript('/log/diagnosis-by-id.js',term).message;
                                
                                // 添加tab
                                this.layout.main.detail.activeIndex = `diagnosis-${id}`;
                                let detail = {title:`日志分析 ${event.id}`, name:`detail-${id}`, type: 'detail', child:[
                                                {title:'日志分析', name:`diagnosis-${id}`, type: 'diagnosis', model:model},
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
                new Vue(maxLog.app).$mount("#app");    
            });
        })

        window.addEventListener('resize', () => { 
            maxLog.resizeEventConsole();
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
            maxLog.layout();
        } else {
            setTimeout(maxLog.checkContainer, 50);
        }
    }



}

let maxLog = new Log();
maxLog.init();