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
    }

    init() {
        VueLoader.onloaded(["ai-robot-component",
                            "event-datatable-component",
                            "event-summary-component",
                            "search-preset-component",
                            "search-base-component",
                            "probe-tree-component"],function() {
            $(function() {

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

                // 告警主视图
                Vue.component("event-view",{
                    delimiters: ['${', '}'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template: "#event-view-template",
                    data:function(){
                        return {
                            summaryView: "event-view-radar"
                        }
                    },
                    methods: {
                        // 切换运行模式
                        toggleModel: function(event){
                            $(this.$el).removeClass(window.EVENT_VIEW);
                            $(this.$el).addClass(event);
                            window.EVENT_VIEW = event;
                        },
                        toggleSummary(view){
                            if (view) {
                                this.summaryView = view;
                            } else {
                                this.summaryView = 'event-view-radar';
                            }
                        }
                    }
                });

                let app = new Vue({
                    delimiters: ['${', '}'],
                    el: "#app",
                    template: "#app-template",
                    data: {
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
                        },
                        currentView: "event-view"
                    },
                    created: function(){
                        // 接收搜索数据
                        eventHub.$on(`SEARCH-RESPONSE-EVENT-${this.model.id}`, this.setData);
                    },
                    mounted: function(){

                    },
                    methods: {
                        setData(event){
                            this.model = _.extend(this.model, this.$refs.searchRef.result);
                        }
                    }
                });

            });
        })
    }
}

let event = new Event();
event.init();