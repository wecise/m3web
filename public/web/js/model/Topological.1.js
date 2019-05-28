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
class Topological {
    
    constructor() {
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
                    template: `<el-container>
                                    <el-header>
                                            <div class="panel panel-default graphContainer" data-sortable-id="ui-modal-notification-10">
                                                <div class="panel-heading">
                                                    <div class="panel-heading-btn">
                                                        <a href="javascript:;" class="btn btn-xs btn-icon" data-click="panel-expand"><i class="fa fa-expand"></i></a>
                                                        <!--<a href="javascript:;" class="btn btn-xs btn-icon" data-click="panel-reload"><i class="fa fa-sync-alt"></i></a>-->
                                                        <a href="javascript:;" class="btn btn-xs btn-icon" data-click="panel-collapse"><i class="fa fa-minus"></i></a>
                                                        <!--<a href="javascript:;" class="btn btn-xs btn-icon" data-click="panel-remove"><i class="fa fa-times"></i></a>-->
                                                    </div>
                                                    <h4 class="panel-title">拓扑分析</h4>
                                                </div>
                                                <div class="panel-body">
                                                    <div style="width: 18vw;padding: 10px 0;display:none;">
                                                        <div class="graphNav"></div>
                                                    </div>
                                                    <div style="width: 100%; height:100%;">
                                                        <div class="graph"></div>
                                                    </div>
                                                </div>
                                            </div>
                                    </el-header>
                                    <el-main>
                                        <div class="panel panel-default association" data-sortable-id="ui-modal-notification-30">
                                            <div class="panel-heading">
                                                <div class="panel-heading-btn">
                                                    <a href="javascript:;" class="btn btn-xs btn-icon" data-click="panel-expand"><i class="fa fa-expand"></i></a>
                                                    <a href="javascript:;" class="btn btn-xs btn-icon" data-click="panel-collapse"><i class="fa fa-minus"></i></a>
                                                </div>
                                                <h4 class="panel-title">关联信息</h4>
                                            </div>
                                            <div id="graph-association" class="panel-body">
                                                <div style="width: 100%; height:50vh;">
                                                    <div class="graph-association"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </el-main>
                                </el-container>`,
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
                            let model = fsHandler.callFsJScript('/topological/diagnosis.js', encodeURIComponent(term)).message || [];
                            
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
                                <!--input id="topological-graph-advanced-input" class="form-control-transparent" type="text" placeholder="搜索...">
                                <typeahead v-model="advanced.input" target="#topological-graph-advanced-input" force-select :data="advanced.data" item-key="value"/-->
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
                        options: fsHandler.callFsJScript('/graph/edges.js',null).message
                    },
                    step: {
                        selected: [],
                        options: _.map(Array(10),function(v,index){let n = index+1; return {value: n, label: n+'跳'};})
                    },
                    input: ""
                },
                // mode advanced
                advanced: {
                    input: "",
                    data: null
                },
                // term for search
                term: {
                        value: 'match ("biz:查账系统")-[*]->("esx:esx1") return name,status'
                    }
            },
            watch:{
                'advanced.input':{
                    handler:function(val,oldVal){
                        if(val === oldVal) return false;
                        _.extend(this.term, val['value']?{value: val.value}:{value:val});
                        console.log(2,this.term)
                    },
                    deep:true
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

                this.advanced.data = this.loadCache();
            },
            methods:{
                search(){
                    this.cache();
                    eventHub.$emit("TOPOLOGICAL-TERM-EVENT",{value: encodeURIComponent(this.term.value)});
                },
                loadCache(){
                    let name = 'TOPOLOGICAL_GRAPH_SEARCH_CACHE.txt';

                    // load
                    return _.attempt(JSON.parse.bind(null, fsHandler.fsContent(`/${window.SignedUser_UserName}/temp`, name)));
                },
                cache(){
                    let preContent = this.loadCache();
                    console.log(preContent)
                    // merge && save
                    let name = 'TOPOLOGICAL_GRAPH_SEARCH_CACHE.txt';
                    let content = JSON.stringify(_.merge(preContent,this.term));
                    let ftype = "txt";
                    let attr = {remark: "", ctime: _.now(), author: window.SignedUser_UserName, type: ftype};
                    let rtn = fsHandler.fsNew(ftype, `/${window.SignedUser_UserName}/temp`, name, content, attr);
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
            created(){
                eventHub.$on("TOPOLOGICAL-TERM-EVENT", this.search);   
            },
            mounted() {
                this.search();
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
                        this.model = fsHandler.callFsJScript('/graph/graph_service.js', defaultTerm).message[0].graph;
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
                template: ` <tabs v-model="index">
                                <template slot="nav-right">
                                    <a href="javascript:void(0);" class="btn btn-xs btn-default" style="cursor:pointer;" @click="close(index)">
                                        <span class="fas fa-times"></span>
                                    </a>
                                </template>
                                <tab :title="item.title" v-for="item in tabs" :key="item.id" html-title>
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
                    model: [fsHandler.callFsJScript('/topological/diagnosis.js',event.value).message]
                },
                filters: {
                    pickTitle(event){
                        const self = this;
                        
                        try {
                            let count = 0;
                            count = topological.graphAssociation.$data.model[topological.graphAssociation.$data.index][event.type].rows.length;

                            let badge = 0;
                            let severity = _.maxBy(topological.graphAssociation.$data.model[topological.graphAssociation.$data.index][event.type].rows,'severity').severity;
                            badge = severity>=5?`<span style="color:#FF0000;">${count}</span>`:severity>=4?`<span style="color:#FFDC00;">${count}</span>`:count;

                            return `${event.title} ${badge}`;
                        } catch(error){
                            return `${event.title} 0`;
                        }
                    }
                },
                mounted(){
                    this.init();
                },
                methods:{
                    init(){
                        $(this.$el).find("ul.nav-tabs").addClass("nav-tabs-bottom-1px");
                    },
                    close(index){
                        this.tabs.splice(index, 1);
                        this.model.splice(index, 1);
                        // select prev tab if the closed tab is the last one
                        if (this.index === this.tabs.length && this.index > 0) {
                            --this.index
                        }
                    }
                }
            }).$mount(".graph-association");
        } else {
            let check = _.find(topological.graphAssociation.$data.tabs,{title:event.value});
            if(!check){
                topological.graphAssociation.$data.tabs.push(tabTemp);
                topological.graphAssociation.$data.index = topological.graphAssociation.$data.tabs.length - 1;
                topological.graphAssociation.$data.model[topological.graphAssociation.$data.index] = fsHandler.callFsJScript('/topological/diagnosis.js',event.value).message;
                _.delay(function(){
                    topological.graphAssociation.$data.subIndex = _.findIndex(tabTemp.child,{type:event.type});
                    $(topological.graphAssociation.$el).find("ul.nav-tabs").addClass("nav-tabs-bottom-1px");
                },50)
            }
        }
    
        document.location.href = "#graph-association";
        $("#content.content").css("padding-top","35px");
        mx.windowResize();
    }

}

let topological = new Topological();
topological.init();