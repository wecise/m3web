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
                            "vue-timeline-component"],function() {
            $(function() {

                // LogList Table组件
                Vue.component("el-loglist-component",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            dt:{
                                rows:[],
                                columns: [],
                                selected: []
                            },
                            info: []
                        }
                    },
                    watch: {
                        model: {
                            handler(val,oldVal){
                                this.initData();
                            },
                            deep:true,
                            immediate:true
                        },
                        dt: {
                            handler(val,oldVal){
                                this.info = [];
                                this.info.push(`共 ${this.dt.rows.length} 项`);
                                this.info.push(`已选择 ${this.dt.selected.length} 项`);
                                this.info.push(moment().format("YYYY-MM-DD HH:MM:SS.SSS"));
                            },
                            deep:true,
                            immediate:true
                        }
                    },
                    template:   `<el-container class="animated fadeIn" style="height:calc(100vh - 145px);">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-tooltip content="运行模式切换" open-delay="500" placement="top">
                                            <el-button type="text" @click="onToggle" icon="el-icon-notebook-2"></el-button>
                                        </el-tooltip>
                                        <el-tooltip :content="mx.global.register.event.status[item][1]" open-delay="500" placement="top" v-for="item in model.actions" v-if="model.actions">
                                            <el-button type="text" @click="onAction(item)" :icon="mx.global.register.event.status[item][2]"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="导出" delay-time="500">
                                            <el-dropdown @command="onExport">
                                                <span class="el-dropdown-link">
                                                    <i class="el-icon-download el-icon--right"></i>
                                                </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item command="csv">CSV</el-dropdown-item>
                                                    <el-dropdown-item command="json">JSON</el-dropdown-item>
                                                    <!--el-dropdown-item command="pdf">PDF</el-dropdown-item-->
                                                    <el-dropdown-item command="png">PNG</el-dropdown-item>
                                                    <!--el-dropdown-item command="sql">SQL</el-dropdown-item-->
                                                    <el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </el-tooltip>
                                    </el-header>   
                                    <el-main style="padding:0px;">
                                        <el-table
                                            :data="dt.rows"
                                            highlight-current-row="true"
                                            style="width: 100%"
                                            :row-class-name="rowClassName"
                                            :header-cell-style="headerRender"
                                            @row-dblclick="onRowContextmenu"
                                            @row-contextmenu="onRowContextmenu"
                                            @row-click="onRowContextmenu"
                                            @selection-change="onSelectionChange"
                                            ref="table">
                                            <el-table-column type="selection" align="center"></el-table-column> 
                                            <el-table-column type="expand">
                                                <template slot-scope="props">
                                                    <el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f7f7f7;" >
                                                        <el-form-item v-for="v,k in props.row" :label="k">
                                                            <el-input v-model="v"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </template>
                                            </el-table-column>
                                            <el-table-column :prop="item.field" 
                                                :label="item.title" 
                                                sortable 
                                                show-overflow-tooltip
                                                :formatter="item.render" 
                                                v-for="item in dt.columns"
                                                :width="item.width"
                                                v-if="item.visible">
                                            </el-table-column>
                                        </el-table>
                                    </el-main>
                                    <el-footer  style="height:30px;line-height:30px;">
                                        #{ info.join(' &nbsp; | &nbsp;') }#
                                    </el-footer>
                                </el-container>`,
                    mounted(){

                    },
                    methods: {
                        initData(){
                            const self = this;
                            
                            let init = function(){
                                
                                _.extend(self.dt, {columns: _.map(self.model.template, function(v){
                                    
                                    if(_.isUndefined(v.visible)){
                                        _.extend(v, { visible: true });
                                    }

                                    if(!v.render){
                                        return v;
                                    } else {
                                        return _.extend(v, { render: eval(v.render) });
                                    }
                                    
                                })});

                                _.extend(self.dt, {rows: self.model.rows});
                                    
                            };

                            if(self.model && $("table",self.$el).is(':visible')){
                                init();
                            } else {
                                setTimeout(init,50);
                            }
                            
                        },
                        rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0) {
                                //return 'text-align:center;';
                            }
                        },
                        onSelectionChange(val) {
                            this.dt.selected = val;
                        },
                        onAction(evt){
                            if(_.isEmpty(this.dt.selected)){
                                this.$message({
                                    type: "info",
                                    message: "请选择事件！"
                                });
                                return false;
                            }

                            this.$root.action( {list: this.dt.selected, action:evt});
                        },
                        onToggle(){
                            this.$root.toggleModel(_.without(['view-normal','view-tags'],window.EVENT_VIEW).join(""));
                        },
                        onRowContextmenu(row, column, event){
                            const self = this;

                            $.contextMenu( 'destroy' ).contextMenu({
                                selector: `.${column.id}`,
                                trigger: "right",
                                autoHide: true,
                                delay: 5,
                                hideOnSecondTrigger: true,
                                className: `animated slideIn ${column.id}`,
                                build: function($trigger, e) {
                                    
                                    return {
                                        callback: function(key, opt) {
                                            
                                            if(_.includes(key,'diagnosis')) {
                                                self.$root.detailAdd(row);
                                            } else if(_.includes(key,'action')) {
                                                // 增加操作类型
                                                let action = _.last(key.split("_"));
                                                self.$root.action({list: [row], action:action});
                                            } else if(_.includes(key,'ticket')){
                                                alertify.confirm(`确定生成工单<br><br>
                                                                    告警ID：${row.id}<br><br>
                                                                    实体ID：${row.entity}<br><br>
                                                                    模板ID：b223c78b-3107-11e6-8487-446d577ed81c<br><br>
                                                                    告警摘要：${row.msg}<br><br>
                                                                    告警时间：${moment(row.vtime).format("LLL")}<br><br>`, function (e) {
                                                    if (e) {
                                                        try{
                                                            let rtn = fsHandler.callFsJScript("/matrix/readysoft/eventToTicket.js", encodeURIComponent(JSON.stringify(row).replace(/%/g,'%25'))).message.data;
                                                            if(rtn.data.success == 1){
                                                                self.options.term = row.id;
                                                                self.$refs.searchRef.search();
                                                                alertify.success(`创建工单成功! <br><br>
                                                                            工单单号：${rtn.data.ticket_number}`)
                                                            }
                                                        }catch(err){
                                                            alertify.error(`创建工单失败，请确认！ <br><br>
                                                                            ${rtn}<br><br>
                                                                            ${err}`)
                                                        }
                                                    } else {
                                                        
                                                    }
                                                });
                                            }
                                        },
                                        items: self.model.contextMenu.log
                                    }
                                },
                                events: {
                                    show(opt) {
                
                                        let $this = this;
                                        _.delay(()=>{
                                            new Vue(mx.tagInput(`${column.id}_single_tags`, `.${column.id} input`, row, self.$root.$refs.searchRef.search));
                                        },50)
                                    }
                                }
                            });
                        },
                        onExport(type){
                    
                            let options = {
                                csvEnclosure: '',
                                csvSeparator: ', ',
                                csvUseBOM: true,
                                ignoreColumn: [0,1],
                                fileName: `tableExport_${moment().format("YYYY-MM-DD HH:MM:SS")}`,
                                type: type,
                            };
        
                            if(type === 'png'){
                                //$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
                                $(this.$refs.table.$el.querySelector("table.el-table__body")).tableExport(options);
                            } else if(type === 'pdf'){
                                _.extend(options, {
                                    jspdf: {orientation: 'l',
                                            format: 'a3',
                                            margins: {left:10, right:10, top:20, bottom:20},
                                            autotable: {styles: {fillColor: 'inherit', 
                                                                    textColor: 'inherit'},
                                                        tableWidth: 'auto'}
                                    }
                                });
                                $(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
                            } else {
                                $(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
                            }
                            
                        }
                    }
                })

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
                                        "/matrix/"+self.forward,
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
                    template: `<el-container style="height: calc(100vh - 190px);">
                                    <el-main>            
                                        <el-form label-width="120px" class="form-no-border">
                                            <el-form-item :label="key" v-for="(value,key) in model.rows[0]" style="margin-bottom: 10px;">
                                                <el-input :value="value | handlerFormat" disabled v-if="JSON.stringify(value).length<200"></el-input>
                                                <el-input type="textarea" :rows="6" :value="value | handlerFormat" disabled v-else></el-input>
                                            </el-form-item>
                                        </el-form>
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
                    template:   `<el-container style="height: calc(100vh - 190px);">
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
                        model: Object
                    },
                    data(){
                        return {
                            
                        }
                    },
                    template:  `<el-container style="height: calc(100vh - 190px);">
                                    <el-main style="padding:0px;">
                                        <el-loglist-component :model="model"></el-loglist-component>
                                    </el-main>
                                </el-container>`,
                    mounted(){
                        
                    },
                    methods: {
                        
                    }
                })
       
            });
        })

        window.addEventListener('resize', () => { 
            // RESIZE Event Summary
            eventHub.$emit("WINDOW-RESIZE-EVENT");
        })
 
    }

    mount(el){

        let main = {
            delimiters: ['#{', '}#'],
            template:   `<main id="content" class="content">
                            <el-container>
                                <el-header style="height: 40px;line-height: 40px;padding: 0px;">
                                    <search-base-component :options="options"
                                                        ref="searchRef"
                                                        class="grid-content"></search-base-component>
                                </el-header>
                                <el-main id="log-view-container" style="padding: 5px 0px 0px 0px;">
                                    <el-tabs v-model="layout.main.activeIndex" class="grid-content" type="border-card" closable @tab-remove="detailRemove">
                                        <el-tab-pane v-for="(item,index) in layout.main.tabs" :key="item.name" :label="item.title" :name="item.name" lazy=true>
                                            <div v-if="item.type==='main'">
                                                <div class="log-view-summary-control">
                                                    <el-tooltip :content="control.ifRefresh==1?'自动刷新启用中':'自动刷新关闭中'" placement="top" open-delay="500">
                                                        <div>
                                                            #{control.ifRefresh==1?'自动刷新':'自动刷新'}#
                                                            <el-switch
                                                            v-model="control.ifRefresh"
                                                            active-color="#13ce66"
                                                            inactive-color="#dddddd"
                                                            active-value="1"
                                                            inactive-value="0"
                                                            @change="toggleSummaryByRefresh">
                                                            </el-switch>
                                                        </div>
                                                    </el-tooltip>
                                                    <el-tooltip :content="control.ifSmart==1?'智能分析启用中':'智能分析关闭中'" placement="top" open-delay="500">
                                                        <div>
                                                            #{control.ifSmart==1?'智能分析':'智能分析'}#
                                                            <el-switch
                                                            v-model="control.ifSmart"
                                                            active-color="#13ce66"
                                                            inactive-color="#dddddd"
                                                            active-value="1"
                                                            inactive-value="0"
                                                            @change="toggleSummaryBySmart">
                                                            </el-switch>
                                                        </div>
                                                    </el-tooltip>
                                                </div>
                                                <el-container id="log-view-summary">
                                                    <el-main>
                                                        <el-tabs v-model="layout.summary.activeIndex" type="border" class="el-tabs-bottom-line">
                                                            <el-tab-pane v-for="(item,index) in layout.summary.tabs" :key="item.name" :label="item.title" :name="item.name">
                                                                <div v-if="item.type=='radar'">
                                                                    <log-radar id="log-radar" :model='model.message'></log-radar>
                                                                </div>
                                                                <div v-if="item.type=='gauge'">
                                                                    <log-gauge id="log-gauge"></log-gauge>
                                                                </div>
                                                            </el-tab-pane>
                                                        </el-tabs>
                                                    </el-main>
                                                </el-container>
                                                <el-container id="log-view-console">
                                                    <el-aside class="tree-view" style="background-color:#f6f6f6;" ref="leftView">
                                                        <entity-tree-component id="log-tree" :model="{parent:'/log',name:'log_tree_data.js',domain:'log'}" ref="tagTree"></entity-tree-component>
                                                    </el-aside>
                                                    <el-main class="table-view" style="padding:5px;" ref="mainView">
                                                        <el-loglist-component :model="model.message"></el-loglist-component>
                                                    </el-main>
                                                </el-container>
                                            </div>
                                            <div v-if="item.type==='diagnosis'">
                                                <el-tabs v-model="layout.main.detail.activeIndex" style="background:#ffffff;" class="el-tabs-bottom-line">
                                                    <el-tab-pane v-for="it in item.child" :key="it.name" :label="it.title" :name="it.name" lazy=true>
                                                        <div v-if="it.type==='detail'">
                                                            <log-diagnosis-detail :id="it.name+'-detail'" :model="it.model.log"></log-diagnosis-detail>
                                                        </div>
                                                        <div v-if="it.type==='journal'">
                                                            <log-diagnosis-journal :id="it.name+'-journal'" :model="it.model.journal"></log-diagnosis-journal>
                                                        </div>
                                                        <div v-if="it.type==='history'">
                                                            <log-diagnosis-history :model="it.model.history"></log-diagnosis-history>
                                                        </div>
                                                        <div v-else>
                                                            <!-- <log-diagnosis-datatable-component :id="it.name" :model="it.model[it.type]"></log-diagnosis-datatable-component> -->
                                                        </div>
                                                    </el-tab-pane>
                                                </el-tabs>
                                            </div>
                                        </tab>
                                    </el-tabs>
                                </el-main>
                            </el-container>
                        </main>`,
            data: {
                id: _.now(),
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
                    // 视图定义
                    view: {
                        show: false
                    },
                    // 搜索窗口
                    window: { name:"所有", value: ""},
                    // 输入
                    term: "",
                    // 指定类
                    class: "#/matrix/devops/log/:",
                    // 指定api
                    api: {parent: "log",name: "log_list.js"},
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
            },
            mounted(){
                // 数据设置
                this.setData();

                // watch数据更新
                this.$watch(
                    "$refs.searchRef.result",(val, oldVal) => {
                        this.setData();
                    }
                );

                $(this.$el).addClass('view-normal');
                
                // 没有详细页时，默认隐藏告警列表Title
                this.hideTabEventViewConsoleUl();

                // 维度统计
                this.toggleSummaryBySmart(this.control.ifSmart);

                // RESIZE Event Summary
                _.delay(() => {
                    eventHub.$emit("WINDOW-RESIZE-EVENT");

                    Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
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
                setData(){
                    _.extend(this.model, {message:this.$refs.searchRef.result});
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
                }
            }
        };

        _.delay(() => {
            this.app = new Vue(main).$mount("#app");
        },500)
    }

}