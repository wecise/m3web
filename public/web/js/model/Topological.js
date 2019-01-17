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
        this.app = null;
        this.graphAssociation = null;
    }
    
    path(id, bid, node){

        let _dataset = [];
        let _columns = [];
        let _node = {};

        if(!_.isEmpty(node)) {
            _dataset = node.data[_.keys(node.columns)[0]];
            _columns = node.columns[_.keys(node.columns)[0]];
            _node = node;
        }

        _columns.unshift({"field": "num", "title": "", render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }
        });

        return {

            delimiters: ['${', '}'],
            el: '#' + id,
            template: `<omdb-path-datatables-component :id="id" :bid="bid"
                                                        :dataset="model.dataset"
                                                        :columns="model.columns"
                                                        :options="model.options"
                                                        contextmenu="null"
                                                        :result="result"></omdb-path-datatables-component>`,
            data: {
                id: id,
                bid: bid,
                model: {
                    dataset: _dataset,
                    columns: _columns,
                    options: {
                        info:false,
                        scrollY: '25vh',
                        searching: false,
                    }
                },
                result: _node
            },
            created: function(){
                let self = this;

                eventHub.$on("LAYOUT-RESIZE-TRIGGER-EVENT", self.setScrollY);

                eventHub.$on(`QUERY-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
                eventHub.$on(`NEW-QUERY-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
            },
            mounted: function() {
                let self = this;

                self.$nextTick(function() {
                    self.init();
                })
            },
            methods: {
                init: function(){
                    let self = this;

                    if(!_.isEmpty(node)) {
                        self.model.dataset = self.result.data[_.keys(self.result.columns)[0]];
                        self.model.columns = self.result.columns[_.keys(self.result.columns)[0]];
                    } else {
                        self.model.dataset = [];
                        self.model.columns = [];
                    }

                },
                setData: function(event){
                    let self = this;

                    self.model.dataset = event.data[_.keys(event.columns)[0]] || [];
                    self.model.columns = event.columns[_.keys(event.columns)[0]] || [];
                    self.result = event;

                },
                setScrollY: function(event){
                    let self = this;

                    self.model.options.scrollY = event.scrollY;
                }
            }
        };
    };

    init() {
        VueLoader.onloaded(["ai-robot-component",
                            "topological-graph-component",
                            "omdb-path-datatables-component",
                            "event-datatable-component",
                            "event-diagnosis-datatable-component",
                            "event-summary-component",
                            "search-preset-component",
                            "search-base-component",
                            "probe-tree-component"],function() {
            $(function() {

                topological.app = new Vue({
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
                    },
                    mounted: function(){
                        this.style();
                        this.graph();
                    },
                    methods: {
                        style(){
                            $("#footer .navbar-nav > li > a").css({
                                "textShadow": "unset",
                                "color": "rgb(79, 112, 171)",
                            });
                        },
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
    
    searchBar(){
        return {
            delimiters: ['${', '}'],
            template: ` <div class="input-group">
                            
                            <span class="input-group-btn" style="width:8rem;">
                                <multi-select v-model="type.selected" :options="type.options" :limit="1" size="sm" data-tooltip="tooltip" title="选择类型"  placeholder="搜索" />
                            </span>
                            
                            <div class="animated fadeIn" v-if="type.selected[0]==='advanced'">
                                <input type="text" class="form-control-transparent"  placeholder="搜索语法" v-model="advanced.input">
                            </div>
                            <div class="input-group animated fadeIn" v-else>
                                <input type="text" class="form-control-transparent"  placeholder="节点">
                                <span class="input-group-btn" style="width:6rem;">
                                    <multi-select v-model="normal.rel.selected" :options="normal.rel.options" label-key="remedy" value-key="name" size="sm" data-tooltip="tooltip" title="选择关系" placeholder="关系" collapse-selected />
                                </span>
                                <span class="input-group-btn" style="width:6rem;">
                                    <multi-select v-model="normal.step.selected" :options="normal.step.options" :limit="1" size="sm" data-tooltip="tooltip" title="选择几跳"  placeholder="跳" />
                                </span>
                                <input type="text" class="form-control-transparent"  placeholder="节点">
                            </div>

                            <span class="input-group-btn">
                                <a href="javascript:void(0);" class="btn btn-sm btn-primary" @click="search">搜索</a>
                            </span>
                        </div>`,
            data: {
                // select gen term's mode
                type:{
                    selected: ['advanced'],
                    options: [
                            {value:'normal',label:'条件式搜索'},
                            {value:'advanced',label:'高级搜索'}
                        ]
                },
                // mode normal
                normal: {
                    rel:{
                        selected: [],
                        options: callFsJScript('/graph/edges.js',null).message
                    },
                    step: {
                        selected: [],
                        options: _.map(Array(10),function(v,index){let n = index+1; return {value: n, label: n+'跳'};})
                    },
                    input: ""
                },
                // mode advanced
                advanced: {
                    input: ""
                },
                // term for search
                term: {
                        value: 'match ("biz:查账系统")-[*]->("esx:esx1") return name,status'
                    }
            },
            watch:{
                'advanced.input':function(val,oldVal){
                    if(val === oldVal) return false;
                    _.extend(this.term,{value: encodeURIComponent(val)});
                }
            },
            mounted(){
                const self = this;
                $(document).keypress(function(event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == 13) {
                        self.search();
                    }
                })
            },
            methods:{
                search(){
                    eventHub.$emit("TOPOLOGICAL-TERM-EVENT",this.term);
                }
            }
        };
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
            template: `<topological-graph-component :id="id" :graphData="model"></topological-graph-component>`,
            data: {
                id: id,
                model: {}
            },
            mounted() {
                const self = this;
                this.search();
                eventHub.$on("TOPOLOGICAL-TERM-EVENT", self.search);
            },
            methods:{
                search(term){
                    const self = this;

                    // 获取默认搜索条件
                    let defaultTerm = topological.searchBar().data.term.value;

                    if(term){
                        defaultTerm = term.value;
                    }

                    // 重置关联信息
                    if(topological.graphAssociation){
                        topological.graphAssociation.$data.tabs = [];
                    }

                    try {
                        this.model = callFsJScript('/graph/graph_service.js', defaultTerm).message[0].graph;
                    } catch(error) {
                        alertify.error("图查询失败，请确认语法！"+error);
                        this.model = {};
                    }
                    
                }
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

    toggleTheme(){
        let theme = localStorage.getItem("TOPOLOGICAL-GRAPH-THEME");

        if(theme === 'dark'){
            $(topological.app.$el).find(".panel").removeClass("panel-inverse");
            $(topological.app.$el).find(".panel").addClass("panel-default");
            $("body").css("background","#EBEBF3");
            theme = 'light';
        } else {
            $(topological.app.$el).find(".panel").removeClass("panel-default");
            $(topological.app.$el).find(".panel").addClass("panel-inverse");
            $("body").css("background","#000000");
            theme = 'dark';
        }

        localStorage.setItem("TOPOLOGICAL-GRAPH-THEME",theme);
    }

    association(event){
        // 新关联信息准备
        let id = objectHash.sha1(event);
        let tabTemp =  {title:event.value, type: 'tab',child:[
                            {title:'事件', id:`event-${id}`, type: 'event'},
                            {title:'性能', id:`performance-${id}`, type: 'performance'},
                            {title:'日志', id:`log-${id}`, type: 'log'},
                            {title:'配置', id:`config-${id}`, type: 'config'},
                            {title:'工单', id:`ticket-${id}`, type: 'ticket'},
                            {title:'原始报文', id:`raw-${id}`, type: 'raw'},
                            {title:'事件记录', id:`journal-${id}`, type: 'journal'}
                        ]};

        if(!topological.graphAssociation){
            topological.graphAssociation = new Vue({
                delimiters: ['#{', '}#'],
                template: ` <tabs @change="onChange" v-model="index">
                                <tab :title="item.title" v-for="item in tabs" :key="item.id">
                                    <tabs v-if="item.child" v-model="secIndex">
                                        <tab :title="it | pickTitle" v-for="it in item.child" :key="it.id" html-title>
                                            <event-diagnosis-datatable-component :id="it.id" :model="model[index][it.type]"></event-diagnosis-datatable-component>
                                        </tab>
                                    </tabs>
                                </tab>
                            </tabs>`,
                data: {
                    tabs: [tabTemp],
                    index: 0,
                    secIndex: _.findIndex(tabTemp.child,{type:event.type}),
                    model: [callFsJScript('/topological/diagnosis.js',event.value).message]
                },
                filters: {
                    pickTitle(event){
                        const self = this;
                        let count = 0;
                        try {
                            count = topological.graphAssociation.$data.model[topological.graphAssociation.$data.index][event.type].rows.length;
                            
                        } catch(error){
                            
                        }

                        let badge = '0';
                        try {
                            let severity = _.maxBy(topological.graphAssociation.$data.model[topological.graphAssociation.$data.index][event.type].rows,'severity').severity;
                            badge = severity>=5?`<span style="color:#FF0000;">${count}</span>`:severity>=4?`<span style="color:#FFDC00;">${count}</span>`:0;
                        } catch(error){}
                        
                        return `${event.title} ${badge}`;
                    }
                },
                mounted(){
                    $(this.$el).find("ul.nav-tabs").addClass("nav-tabs-bottom-2px");
                },
                methods:{
                    onChange(index) {
                        
                    }
                }
            }).$mount(".graph-association");
        } else {
            let check = _.find(topological.graphAssociation.$data.tabs,{title:event.value});
            if(!check){
                topological.graphAssociation.$data.tabs.push(tabTemp);
                topological.graphAssociation.$data.index = topological.graphAssociation.$data.tabs.length - 1;
                topological.graphAssociation.$data.model[topological.graphAssociation.$data.index] = callFsJScript('/topological/diagnosis.js',event.value).message;
                _.delay(function(){
                    topological.graphAssociation.$data.subIndex = _.findIndex(tabTemp.child,{type:event.type});
                    $(topological.graphAssociation.$el).find("ul.nav-tabs").addClass("nav-tabs-bottom-2px");
                },500)
            }
        }

        document.location.href = "#graph-association";
        $("#content.content").css("padding-top","35px");
        mx.windowResize();
    }

}

let topological = new Topological();
topological.init();