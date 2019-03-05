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

                // 告警雷达
                Vue.component("event-view-radar",{
                    delimiters: ['${', '}'],
                    props: {
                        id: String
                    },
                    template: "#event-view-radar-template",
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
                                        <h5 id="event-diagnosis-detail">告警详情</h5>
                                        <p>
                                            <event-view-detail :id="id + '-detail'" :model="model.event"></event-view-detail>
                                        </p>
                                        <h5 id="event-diagnosis-journal">告警轨迹</h5>
                                        <p style="height:50vh;overflow:auto;">
                                            <vue-timeline-component :id="id + '-journal'" :model="model.journal.rows"></vue-timeline-component>
                                        </p>
                                        <h5 id="event-diagnosis-history">历史相关告警</h5>
                                        <p>
                                            <event-diagnosis-datatable-component :id="id + '-history'" :model="model.historyEvent"></event-diagnosis-datatable-component>
                                        </p>
                                        <h5 id="event-diagnosis-dimension">维度关联性告警</h5>
                                        <p>
                                            <event-diagnosis-datatable-component :id="id + '-dimension'" :model="model.historyEvent"></event-diagnosis-datatable-component>
                                        </p>
                                        <h5 id="event-diagnosis-probability">概率相关性告警</h5>
                                        <p>
                                            <event-diagnosis-datatable-component :id="id + '-probability'" :model="model.historyEvent"></event-diagnosis-datatable-component>
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
                                console.log(1,$("#content.content").css("padding-top"));
                                $("#content.content").css("padding-top","60px!important;");
                                console.log(2,$("#content.content").css("padding-top"));
                            })
                            
                        }
                    }
                    
                });
                

                event.app = new Vue({
                    delimiters: ['${', '}'],
                    el: "#app",
                    template: "#app-template",
                    data: {
                        // 布局
                        layout:{
                            main:{
                                index: 0,
                                tabs:[
                                    {title:'告警列表', type: 'main'}
                                ],
                                detail: {
                                    model: [],
                                    index: 0
                                }
                            },
                            summary: {
                                index: 0,
                                tabs:[
                                    {title:'告警雷达', type: 'radar'},
                                    {title:'时间序列', type: 'timeline'}
                                ]
                            }
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
                            term: "柜面",
                            // 指定类
                            class: "#/matrix/devops/event/:",
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
                    created: function(){
                        // 接收搜索数据
                        eventHub.$on(`SEARCH-RESPONSE-EVENT-${this.model.id}`, this.setData);
                    },
                    mounted: function(){
                        $(this.$el).addClass('view-normal');
                        $(this.$el).find("ul.nav-tabs").addClass("nav-tabs-bottom-1px");
                    },
                    methods: {
                        setData(event){
                            this.model = _.extend(this.model, this.$refs.searchRef.result);
                        },
                        // 切换运行模式
                        toggleModel: function(event){
                            $(this.$el).removeClass(window.EVENT_VIEW);
                            $(this.$el).addClass(event);
                            window.EVENT_VIEW = event;
                        },
                        close(index){
                            this.layout.main.tabs.splice(index, 1);
                            this.layout.main.detail.model.splice(this.layout.main.index - 1, 1);
                            if (this.layout.main.index === this.layout.main.tabs.length && this.layout.main.index > 0) {
                                --this.layout.main.index
                            }
                        },
                        detail: function(event){
                            try {
                                // event
                                let term = encodeURIComponent(JSON.stringify(event));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript('/event/diagnosis-by-id.js',term).message;
                                
                                // 详情数据
                                this.layout.main.detail.model.push(model);
                                // 添加tab
                                let id = event.id;
                                this.layout.main.tabs.push( {title:`告警分析 ${event.id}`, type: 'detail', child:[
                                                                {title:'告警分析', id:`diagnosis-${id}`, type: 'diagnosis'},
                                                                // {title:'告警轨迹', id:`journal-${id}`, type: 'journal'},
                                                                // {title:'历史告警', id:`historyEvent-${id}`, type: 'historyEvent'},
                                                                // {title:'维度关联性告警', id:`associationEvent-${id}`, type: 'associationEvent'},
                                                                // {title:'概率相关性告警', id:`probabilityEvent-${id}`, type: 'probabilityEvent'},
                                                                // {title:'性能', id:`performance-${id}`, type: 'performance'},
                                                                // {title:'日志', id:`log-${id}`, type: 'log'},
                                                                // {title:'配置', id:`config-${id}`, type: 'config'},
                                                                // {title:'工单', id:`ticket-${id}`, type: 'ticket'},
                                                                // {title:'原始报文', id:`raw-${id}`, type: 'raw'},
                                                                {title:'资源信息', id:`topological-${id}`, type: 'topological'},
                                                            ]});
                                
                                this.layout.main.tabs.index = this.layout.main.detail.model.length - 1;
                                $(this.$el).find("ul.nav-tabs").addClass("nav-tabs-bottom-1px");
                            } catch(error){
                                this.layout.main.detail.model = [];
                            }

                            // let detail = new Vue({
                            //     delimiters: ['#{', '}#'],
                            //     template: ` <tabs v-model="index">
                            //                     <tab :title="item | pickTitle" v-for="item in tabs" :key="item.id" html-title>
                            //                         <event-diagnosis-datatable-component :id="item.id" :model="model[index][item.type]"></event-diagnosis-datatable-component>
                            //                     </tab>
                            //                 </tabs>`,
                            //     data: {
                            //         tabs: tabTemp,
                            //         index: 0,
                            //         model: [fsHandler.callFsJScript('/topological/diagnosis.js',event.host).message]
                            //     },
                            //     filters: {
                            //         pickTitle(event){
                            //             const self = this;
                            //             let count = 0;
                            //             try {
                            //                 count = this.model[this.index][event.type].rows.length;
                            //             } catch(error){
                                            
                            //             }
                
                            //             let badge = '0';
                            //             try {
                            //                 let severity = _.maxBy(this.model[this.index][event.type].rows,'severity').severity;
                            //                 badge = severity>=5?`<span style="color:#FF0000;">${count}</span>`:severity>=4?`<span style="color:#FFDC00;">${count}</span>`:0;
                            //             } catch(error){}
                                        
                            //             return `${event.title} ${badge}`;
                            //         }
                            //     },
                            //     mounted(){
                            //         $(this.$el).find("ul.nav-tabs").addClass("nav-tabs-bottom-1px");
                            //     },
                            //     methods:{
                            //         onChange(index) {  
                            //         }
                            //     }
                            // }).$mount(`#event-association`);
                           
                            // 生成tab页的唯一ID
                            // let id = objectHash.sha1(row);
                            // let elId = `event-detail-${id}`;

                            // $(".event-ul").find(".active").removeClass("active");
                            // $(".event-ul").append(`<li class="active">
                            //                            <a href="#${elId}" role="tab" data-toggle="tab" title="告警详情" data-tooltip="tooltip">
                            //                             告警详情 ${row.id || row.host}  
                            //                             <span class="fas fa-times" style="cursor:pointer;padding-left:5px;" data-id="${elId}"></span>
                            //                            </a>
                            //                        </li>`)
                            //     .on("click", "span", function () {
                            //         var anchor = $(this).siblings('a');
                            //         $(anchor.attr('href')).remove();
                            //         $(this).parent().remove();

                            //         $(`.event-ul li`).children('a').first().click();

                            //         let id = $(this).data("id");
                            //         $(`#${id}`).remove();
                            //         $(`a[href="#${id}"]`).remove();
                            //         $(`.event-div`).children("div").first().addClass("active");

                            //     });

                            // $(".event-div").find(".active").removeClass("active");
                            // $(".event-div").append(`<div id="${elId}"></div>`).ready(function(){

                            //     // 动态生成组件
                            //     let view = {
                            //         delimiters: ['#{', '}#'],
                            //         el: `#${elId}`,
                            //         template: fsHandler.callFsJScript('/event/event_ui.js', null).message.eventDetail,
                            //         data: {
                            //             id: elId,
                            //             model: row
                            //         },
                            //         mounted:function(){
                            //             const self = this;

                            //             $(this.$el).closest("div .container-fluid").attr("id",`${elId}`);
                            //             $(this.$el).addClass("tab-pane fade in active");
                            //         },
                            //         destroyed: function () {
                            //             $(this.$el).off();
                            //         }
                            //     };

                            //     // 告警详情页实例化
                            //     new Vue(view);

                            //     _.delay(function(){
                            //         let ui = ['graphNav','performance','log','config','ticket'];

                            //         // 告警管理拓扑页实例化
                            //         let graphElId = `${elId}-graph`;
                            //         $(`#${elId} .graph`).attr("id", graphElId);
                            //         //$(`#${elId}`).addClass("tab-pane fade in active");

                            //         new Vue(event.graph(graphElId));

                            //         // 告警关联数据页实例化
                            //         mx.tabs("event-detail-data");
                            //         _.forEach(ui,function(v,index){
                            //             let cid = `${elId}-${v}`;
                            //             $(`#${elId} .${v}`).attr("id", cid);
                            //             new Vue(event[v](cid));
                            //         })

                            //         // 增加tab active
                            //         $(".tab-content.event-detail-data-content").children().addClass("tab-pane fade in")
                            //         $(".tab-content.event-detail-data-content").children().first().addClass("active");

                            //     },50)


                            //     mx.handleDraggablePanel();
                            //     //mx.handleLocalStorage();
                            //     //mx.handleResetLocalStorage();
                            //     //mx.handleSlimScroll();
                            //     mx.handleSidebarMenu();
                            //     // mx.handleMobileSidebarToggle();
                            //     mx.handleSidebarMinify();
                            //     // mx.handleMobileSidebar();
                            //     // mx.handleThemePageStructureControl();
                            //     // mx.handleThemePanelExpand();
                            //     mx.handleAfterPageLoadAddClass();
                            //     mx.handlePanelAction();
                            //     mx.handelTooltipPopoverActivation();
                            //     mx.handleScrollToTopButton();
                            //     mx.handlePageContentView();
                            //     mx.handleIEFullHeightContent();
                            // })


                        }
                    }
                });

            });
        })
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

}

let event = new Event();
event.init();