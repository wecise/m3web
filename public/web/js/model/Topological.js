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
class Topological extends Event {

    constructor() {
        super();
    }

    init() {

        VueLoader.onloaded(["ai-robot-component",
                            "event-graph-component",
                            "event-datatable-component",
                            "event-diagnosis-datatable-component",
                            "event-summary-component",
                            "search-preset-component",
                            "search-base-component",
                            "probe-tree-component"],function() {
            $(function() {

                var app = new Vue({
                    delimiters: ['${', '}'],
                    template: callFsJScript('/topological/ui.js', null).message.layout,
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
                        count: {
                            event: 0,
                            performance: 0,
                            log: 0,
                            config: 0,
                            ticket: 0
                        }
                    },
                    created: function(){
                        // 接收搜索数据
                        eventHub.$on(`SEARCH-RESPONSE-EVENT-${this.model.id}`, this.setData);
                        // 
                        eventHub.$on(`GRAPH-DIAGNOSIS-TERM-EVENT`, this.detail);
                    },
                    mounted: function(){
                        this.graph();
                        this.detail('wecise');
                    },
                    methods: {
                        setData(event){
                            this.model = _.extend(this.model, this.$refs.searchRef.result);
                        },
                        graph(){
                            _.delay(function(){
                                let ui = ['graphNav','graph'];
                                _.forEach(ui,function(v,index){
                                    // 根据class设置组件id
                                    $(`.${v}`).attr("id", v);
                                   _.delay(function(){
                                        // 组件实例化并挂载dom
                                        new Vue(topological[v](`topological-data-${v}`)).$mount(`#${v}`);
                                   },50)
                                })
                            },50)
                        },
                        // 详情页
                        detail(term){
                            const self = this;
                            
                            // 根据graph节点搜索关联数据
                            let model = callFsJScript('/topological/diagnosis.js', encodeURIComponent(term)).message || [];
                            
                            // 重绘detail页面
                            _.delay(function(){
                                let ui = ['event','performance','config','ticket','log'];
                                _.forEach(ui,function(v,index){
                                    
                                    // count
                                    self.count[v] = model[v].rows.length || 0;

                                    // 数据为空 不显示
                                    if(!model[v].rows || !model[v].columns) {
                                        // 已实例化： 删除-->重新实例化
                                        if($(`.${v}`).children().length) $(`.${v}`).empty();
                                        
                                        // 根据class设置组件id
                                        $(`.${v}`).attr('id',v);

                                        return;
                                    }
                                
                                    // 已实例化： 删除-->重新实例化
                                    if($(`.${v}`).children().length) $(`.${v}`).empty();
                                    
                                    // 根据class设置组件id
                                    $(`.${v}`).attr('id',v);
                                    // 挂载dom el
                                    let elId = `${v}-${_.now()}`;
                                    $(`.${v}`).append(`<div id="${elId}"></div>`);
                                    
                                   _.delay(function(){
                                        // 组件实例化并挂载dom
                                        new Vue(topological[v](`topological-data-${v}`, model[v])).$mount(`#${elId}`);
                                   },500)
                                    
                                })
                            },50)

                        }
                    }
                }).$mount("#app");

            });
        })
    }
    graphNav(id){
        return {
            delimiters: ['${', '}'],
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
            template: `<event-graph-component :id="id" :graphData="model"></event-graph-component>`,
            data: {
                id: id,
                model: callFsJScript('/event/event_detail_graph.js', null).message.data[0].graph
            },
            mounted: function () {
                const self = this;

                self.$nextTick(function () {

                })
            }
        };
    }

    event(id,model){
        return {
            delimiters: ['${', '}'],
            template: `<event-diagnosis-datatable-component :id="id" :model="model"></event-diagnosis-datatable-component>`,
            data: {
                id: id,
                model: model,
            }
        };
    }

    performance(id,model){
        return {
            delimiters: ['${', '}'],
            template: `<event-diagnosis-datatable-component :id="id" :model="model"></event-diagnosis-datatable-component>`,
            data: {
                id: id,
                model: model,
            }
        };
    }

    log(id,model){
        return {
            delimiters: ['${', '}'],
            template: `<event-diagnosis-datatable-component :id="id" :model="model"></event-diagnosis-datatable-component>`,
            data: {
                id: id,
                model: model,
            }
        };
    }

    config(id,model){
        return {
            delimiters: ['${', '}'],
            template: `<event-diagnosis-datatable-component :id="id" :model="model"></event-diagnosis-datatable-component>`,
            data: {
                id: id,
                model: model,
            }
        };
    }

    ticket(id,model){
        return {
            delimiters: ['${', '}'],
            template: `<event-diagnosis-datatable-component :id="id" :model="model"></event-diagnosis-datatable-component>`,
            data: {
                id: id,
                model: model,
            }
        };
    }

}

let topological = new Topological();
topological.init();