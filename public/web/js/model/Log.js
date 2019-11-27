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
                            "log-graph-component",
                            "log-datatable-component",
                            "log-diagnosis-datatable-component",
                            "log-summary-component",
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

                // 仪表盘
                Vue.component("log-gauge",{
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

                // 雷达
                Vue.component("log-radar",{
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
                    //template: `<log-summary-component :id="id" :model='model'></log-summary-component>`,
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

                // 日志详情
                Vue.component("log-diagnosis-detail",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:String
                    },
                    template: `<el-container style="height: calc(100vh - 230px);">
                                    <el-main>            
                                        <form class="form-horizontal">
                                            <div class="form-group" v-for="(value,key) in model.rows[0]" style="padding: 0px 10px;margin-bottom: 1px;">
                                                <label :for="key" class="col-sm-2 control-label" style="text-align:left;">#{key}#</label>
                                                <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                    <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | handlerFormat" v-if="JSON.stringify(value).length<200">
                                                    <textarea type="text" class="form-control-bg-grey" rows="6" :placeholder="key" :value="value | handlerFormat" v-else></textarea>
                                                </div>
                                            </div>
                                        </form>
                                    </el-main>
                                </el-container>`,
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

                // 日志轨迹
                Vue.component("log-diagnosis-journal",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<el-container style="height: calc(100vh - 230px);">
                                    <el-main>
                                        <div class="block">
                                            <el-timeline>
                                                <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model.rows">
                                                    <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                                        <p>#{item.biz}# #{item.host}#</p>
                                                        <p style="font-size:12px;">#{item.msg}#</p>
                                                    </el-card>
                                                </el-timeline-item>
                                            </el-timeline>
                                        </div>
                                    </el-main>
                                </el-container>`
                })

                // 历史日志
                Vue.component("log-diagnosis-history",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            
                        }
                    },
                    template:  `<el-container style="height: calc(100vh - 230px);">
                                    <el-main style="padding:0px;">
                                        <log-diagnosis-datatable-component :id="id" :model="model"></log-diagnosis-datatable-component>
                                    </el-main>
                                </el-container>`,
                    mounted(){
                        const self = this;
                    },
                    methods: {
                        init(){    
                            const self = this;

                        }
                    }
                })
       
            });
        })

        window.addEventListener('resize', () => { 
            this.app.resizeConsole();

            // RESIZE Event Summary
            eventHub.$emit("WINDOW-RESIZE-EVENT");
        })
 
    }

    mount(el){

        let main = {
            delimiters: ['${', '}'],
            template: "#app-template",
            data: {
                // 布局
                layout:{
                    main:{
                        tabIndex: 1,
                        activeIndex: 'log-view-console',
                        tabs:[
                            {name: 'log-view-console', title:'日志列表', type: 'main'}
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
                            //{name: 'log-view-gauge', title:'仪表盘', type: 'gauge'}
                        ]
                    }
                },
                control: {
                    ifSmart: '0',
                    ifRefresh: '0'
                },
                // 搜索组件结构
                model: {
                    id: "matrix-log-search",
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
                            $("#tab-log-view-console").show();
                        }else {
                            $("#tab-log-view-console").hide();
                        }
                    },
                    immediate:true,
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
                eventHub.$on("WINDOW-RESIZE-EVENT",self.resizeConsole);
            },
            mounted(){
                $(this.$el).addClass('view-normal');
                
                // 没有详细页时，默认隐藏告警列表Title
                this.hideTabEventViewConsoleUl();

                // 维度统计
                this.toggleSummaryBySmart(this.control.ifSmart);

                // RESIZE Event Summary
                _.delay(() => {
                    this.resizeConsole();
                    eventHub.$emit("WINDOW-RESIZE-EVENT");

                    Split(['#log-view-left', '#log-view-main'], {
                        sizes: [20, 80],
                        minSize: [0, 0],
                        gutterSize: 5,
                        gutterStyle: function(dimension, gutterSize) {
                            return {
                                'display': 'none'
                            }
                        },
                        gutterAlign: 'end',
                        cursor: 'col-resize',
                        direction: 'horizontal',
                        expandToMin: true
                    });
                },2000)
            },
            methods: {
                setData(event){
                    this.model = _.extend(this.model, this.$refs.searchRef.result);
                },
                hideTabEventViewConsoleUl(){
                    const self = this;

                    if($('#tab-log-view-console').is(':visible')) {
                        $("#tab-log-view-console").hide();
                    $("#tab-log-view-console > span").hide();
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
                toggleSummaryByRefresh(evt){
                    const self = this;
                    
                    if(evt==1) {
                        window.intervalListener = setInterval(function(){
                            self.$refs.searchRef.search();
                        },5000)
                    } else {
                        clearInterval(window.intervalListener);
                    }

                    this.control.ifRefresh = evt;
                    
                    // RESIZE Event Summary
                    eventHub.$emit("WINDOW-RESIZE-EVENT");
                    // RESIZE Event Console
                    self.resizeConsole();
                },
                toggleSummaryBySmart(evt){
                    if(evt==1) {
                        $("#log-view-summary").css("height","200px").css("display","");
                    } else {
                        $("#log-view-summary").css("height","0px").css("display","none");
                    }
                    this.control.ifSmart = evt;
                    
                    // RESIZE Event Summary
                    eventHub.$emit("WINDOW-RESIZE-EVENT");
                    // RESIZE Event Console
                    this.resizeConsole();
                },
                detailAdd(event){
                    try {
                        let id = event.id;
                        if(this.layout.main.activeIndex === `diagnosis-${id}`) return false;
                        
                        // event
                        let term = encodeURIComponent(JSON.stringify(event).replace(/%/g,'%25'));
                        // 根据event获取关联信息
                        let model = fsHandler.callFsJScript("/matrix/log/diagnosis-by-id.js",term).message;
                        
                        // 添加tab
                        let detail = {title:`日志分析 ${event.id}`, name:`diagnosis-${id}`, type: 'diagnosis', child:[
                                        {title:'日志详情', name:`diagnosis-detail-${id}`, type: 'detail', model:model},
                                        {title:'日志轨迹', name:`diagnosis-journal-${id}`, type: 'journal', model:model},
                                        {title:'日志历史', name:`diagnosis-history-${id}`, type: 'history', model:model},
                                        {title:'资源信息', name:`topological-${id}`, type: 'topological'},
                                    ]};
                        this.layout.main.detail.activeIndex = _.first(detail.child).name;
                        
                        this.layout.main.tabs.push(detail);
                        this.layout.main.activeIndex = `diagnosis-${id}`;
                        
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
                },
                resizeConsole(){
                    let evwH = $(window).height();
                    let evcH = $("#log-view-container").height();
                    let evsH = $("#log-view-summary").height();
                    
                    $("#log-view-console .dataTables_scrollBody").css("max-height", evwH + "px")
                                                                    .css("max-height","-=230px")
                                                                    .css("max-height","-=" + evsH + "px")
                                                                    .css("min-height", evwH + "px")
                                                                    .css("min-height","-=230px")
                                                                    .css("min-height","-=" + evsH + "px");
                }
            }
        };

        _.delay(() => {
            this.app = new Vue(main).$mount("#app");
        },500)
    }

}