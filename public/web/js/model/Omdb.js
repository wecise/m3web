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
class Omdb{

    constructor() {
        this.app = null;
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
                const self = this;

                eventHub.$on("LAYOUT-RESIZE-TRIGGER-EVENT", self.setScrollY);

                eventHub.$on(`QUERY-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
                eventHub.$on(`NEW-QUERY-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
            },
            mounted: function() {
                const self = this;

                self.$nextTick(function() {
                    self.init();
                })
            },
            methods: {
                init: function(){
                    const self = this;

                    if(!_.isEmpty(node)) {
                        self.model.dataset = self.result.data[_.keys(self.result.columns)[0]];
                        self.model.columns = self.result.columns[_.keys(self.result.columns)[0]];
                    } else {
                        self.model.dataset = [];
                        self.model.columns = [];
                    }

                },
                setData: function(event){
                    const self = this;

                    self.model.dataset = event.data[_.keys(event.columns)[0]] || [];
                    self.model.columns = event.columns[_.keys(event.columns)[0]] || [];
                    self.result = event;

                },
                setScrollY: function(event){
                    const self = this;

                    self.model.options.scrollY = event.scrollY;
                }
            }
        };
    }

    init() {
        const odb = this;

        // ClassList Table组件
        Vue.component("omdb-classlist-component",{
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
            template:   `<el-container class="animated fadeIn" style="height:calc(100vh - 295px);">
                            <el-header style="height:30px;line-height:30px;">
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
                            <el-main style="padding:0px;height:100%;">
                                <el-table
                                    :data="dt.rows"
                                    highlight-current-row="true"
                                    style="width: 100%"
                                    :row-class-name="rowClassName"
                                    :header-cell-style="headerRender"
                                    @row-contextmenu="onRowContextmenu"
                                    @selection-change="onSelectionChange"
                                    @expand-change="onExpandChange"
                                    stripe
                                    ref="table">
                                    <el-table-column type="selection" align="center"></el-table-column> 
                                    <el-table-column type="expand">
                                        <template slot-scope="props">
                                            
                                            <el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f7f7f7;" >
                                                <el-form-item v-for="v,k in _.find(dt.rows,{name:props.row.name})" :label="k">
                                                    <el-select v-model="v" v-if="k==='class'">
                                                        <el-option
                                                            v-for="item in v"
                                                            :key="item"
                                                            :label="item"
                                                            :value="item">
                                                        </el-option>
                                                    </el-select>
                                                    <el-select v-model="v" v-else-if="k==='dispname'">
                                                        <el-option
                                                            v-for="(val,key) in v"
                                                            :key="key"
                                                            :label="val"
                                                            :value="val">
                                                            <span style="float: left">#{ val }#</span>
                                                            <span style="float: right; color: #8492a6; font-size: 13px">#{ key }#</span>
                                                        </el-option>
                                                    </el-select>
                                                    <el-select v-model="v" v-else-if="k==='tags'">
                                                        <el-option
                                                            v-for="(val,key) in v"
                                                            :key="key"
                                                            :label="val"
                                                            :value="val">
                                                            <el-tag style="float: left">#{ val }#</el-tag>
                                                            <span style="float: right; color: #8492a6; font-size: 13px">#{ key }#</span>
                                                        </el-option>
                                                    </el-select>
                                                    <el-input type="textarea" autosize v-model="v" v-else-if="k==='note'"></el-input>
                                                    <el-image :src="'${window.ASSETS_ICON}/tools/png/'+v+'.png?type=open&issys=${window.SignedUser_IsAdmin}'" v-else-if="k==='icon'" style="width:64px;"></el-image>
                                                    <el-input v-model="v" v-else></el-input>
                                                </el-form-item>
                                            </el-form>

                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        sortable 
                                        show-overflow-tooltip
                                        v-for="(item,index) in dt.columns"
                                        :key="index"
                                        :prop="item.field"
                                        :label="item ? item.title : ''"
                                        :width="item.width"
                                        v-if="item.visible">
                                            <template slot-scope="scope">
                                                <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                                    v-if="typeof item.render === 'function'">
                                                </div>
                                                <div v-else>
                                                    #{scope.row[item.field]}#
                                                </div>
                                            </template>
                                    </el-table-column>
                                </el-table>
                            </el-main>
                            <el-footer  style="height:30px;line-height:30px;">
                                #{ info.join(' &nbsp; | &nbsp;') }#
                            </el-footer>
                        </el-container>`,
            mounted(){
                this.initData();
            },
            methods: {
                initData(){
                    _.extend(this.dt,this.model);
                    _.map(this.dt.columns,(v)=>{
                        if(_.isUndefined(v.visible)){
                            _.extend(v, { visible: true });
                        }
                        return v;
                    })
                },
                rowClassName({row, rowIndex}){
                    return `row-${rowIndex}`;
                },
                headerRender({ row, column, rowIndex, columnIndex }){
                    if (rowIndex === 0) {
                        //return 'text-align:center;';
                    }
                },
                onExpandChange(val){
                    
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
                                items: self.model.contextMenu
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

        // 日志控制台
        Vue.component("omdb-log-console", {
            delimiters: ['#{', '}#'],
            props:{
                id: String,
                model: Object
            },
            template:   `<div :class="'log-console '+ theme" style="height:100%;">
                            <div class="logToolBar">
                                <el-button type="text" class="toggle" @click="toggleTheme" title="切换主题" ><i class="fas fa-sun"></i></el-button>
                                <el-button type="text" class="copy" @click="copyIt" title="复制"><i class="fa fa-copy"></i></el-button>
                                <el-button type="text" class="clear" @click="clearIt" title="清空"><i class="fa fa-trash"></i></el-button>
                                <el-button type="text" class="debug" @click="debugIt" title="调试"><i class="fa fa-desktop"></i></el-button>
                            </div>
                            <div contenteditable="true" :class="'log-console-content '+ theme" v-if="!_.isEmpty(log.msg)">
                                <p v-for="item in log.msg"> [#{item[0]}#] [<span :class="'log-severity '+item[1]">#{item[1]}#</span>] <span v-if="_.isEmpty(item[2].content)">#{item[2].short}#</span><span v-else><a data-toggle="collapse" :href="'#'+item[2].id" aria-expanded="false" :aria-controls="item[2].id">#{item[2].short}#</a><span class="collapse animated fadeInUp" :id="item[2].id">#{item[2].content}#</span></span>
                                </p>
                            </div>
                        </div>`,
            data(){
                return {
                    log: {
                        msg: []
                    },
                    theme: 'light',
                    debug: {
                        mql: [],
                        flag: [],
                        crontab: {
                            sched: '30 second',
                            timer: null
                        }
                    }
                }
            },
            watch: {
                'debug.mql': {
                    handler: function(val,oldVal){
                        const self = this;

                        if(val !== oldVal){
                            self.debugIt(val);
                        }

                        if(_.isEmpty(val)){
                            self.debug.crontab.sched = null;
                            self.debug.crontab.timer = null;
                        } else {
                            self.debug.crontab.sched = later.parse.text(`every ${self.debug.crontab.sched}`);
                            self.debug.crontab.timer = later.setInterval(self.refresh, self.debug.crontab.sched);
                        }
                    },
                    deep:true
                },
                model: {
                    handler:function(val,oldVal){
                        const self = this;
                        // 追加
                        if(!_.isEmpty(val)){
                            self.append(_.last(val).level, _.last(val).msg);
                        }
                    },
                    deep:true,
                    immediate:true
                }
            },
            created: function(){
                
            },
            mounted: function () {
                const self = this;

                self.$nextTick(function () {
                    self.init();
                    self.initPlugin();
                })
            },
            filters: {
                format: function(value){
                    return value.join('\n\n');
                }
            },
            methods: {
                init(){
                    const self = this;

                    self.theme = localStorage.getItem("LOG-CONSOLE-THEME");

                },
                initPlugin(){
                    const self = this;

                    $(self.$el).contextMenu({
                        selector: 'a.debug',
                        trigger: 'left',
                        build: function($trigger, e) {

                            $(".context-menu-input-refresh").eq(3).prop('selected', true);

                            let _items = {
                                "trigger": {
                                    name: "调式触发器", type: "checkbox", selected: false
                                },
                                "scriptjs": {
                                    name: "调式脚本", type: "checkbox", selected: false
                                },
                                "itil": {
                                    name: "调式流程", type: "checkbox", selected: false
                                },
                                "rule": {
                                    name: "调式规则", type: "checkbox", selected: false
                                },
                                "webcontext": {
                                    name: "调式缓存", type: "checkbox", selected: false
                                },
                                "scriptlua": {
                                    name: "调式脚本Lua", type: "checkbox", selected: false
                                },
                                "refresh": {
                                    name: "刷新时间",
                                    type: 'select',
                                    options: {1: '5 second', 2: '15 second', 3: '30 second', 4: '1 mins'},
                                    selected: 3,
                                    events: {
                                        change: function (e) {
                                            self.debug.crontab.sched = e.target.options[e.target.selectedIndex].label;
                                        }
                                    }
                                }
                            };

                            if(!_.isEmpty(self.debug.flag)){
                                _.forEach(self.debug.flag,function(v,k){
                                    _items[v].selected = true;
                                })
                            }

                            return {
                                items: _items
                            }
                        },
                        events: {
                            show: function(opt) {
                                let $this = this;

                                $.contextMenu.setInputValues(opt, $this.data());

                            },
                            hide: function(opt) {
                                let $this = this;

                                $.contextMenu.getInputValues(opt, $this.data());

                                self.debugs($this.data());


                            }
                        }
                    });
                },
                refresh(){
                    const self = this;

                    self.debugIt(self.debug.mql);
                },
                debugs(key){
                    const self = this;

                    self.debug.mql = [];
                    self.debug.flag = [];

                    _.forEach(key, function(v,k){
                        if(k !== 'contextMenu' && v != false){
                            self.debug.mql.push(`#/matrix/consolelog/${k}: | nearest 1 day | sort ctime desc`);
                            self.debug.flag.push(k);
                        }
                    });

                },
                append(level, event){
                    const self = this;
                    let _log = null;

                    _log = self.logFormat(level, event);

                    self.log.msg.unshift(_log);

                },
                logFormat(level, event){
                    const self = this;
                    let _content = event;

                    if(typeof(event) === 'object'){
                        _content = JSON.stringify(event);
                    }

                    let _short = _.truncate(_content, {
                        'length': 130,
                        'separator': ' ',
                        'omission': ''
                    });

                    let _id = objectHash.sha1(level + _content + _.now());

                    return [moment().format("YYYY-MM-DD HH:mm:ss:SSS"), _.upperCase(level), {id:_id, short: _short, content: _content.replace(_short,'')}];
                },
                copyIt(event){
                    const self = this;

                    new Clipboard(".copy", {
                        text: function(trigger) {
                            alertify.log("已复制");
                            let _rtn = _.map(self.log.msg,function(v){
                                return [v[0],v[1],v[2].short + v[2].content];
                            });
                            return _rtn.join("\n");
                        }
                    });

                },
                clearIt(){
                    const self = this;

                    self.log.msg = [];

                },
                debugIt(event){
                    const self = this;

                    _.forEach(event,function(v){
                        let _list = omdbHandler.fetchData(v);

                        _.forEach(_list.message,function(v){

                            let _content = `[${v.name}] [${v.class}] ${v.msg}`;

                            let _short = _.truncate(_content, {
                                'length': 130,
                                'separator': ' ',
                                'omission': ''
                            });

                            let _id = objectHash.sha1(v.level + _content + _.now());

                            let _log = [moment(v.ctime).format("YYYY-MM-DD HH:mm:ss:SSS"), _.upperCase(v.level), {id:_id, short: _short, content: _content.replace(_short,'')}];

                            self.log.msg.unshift(_log);
                        })
                    })

                },
                toggleTheme(){
                    const self = this;

                    if(self.theme === 'light') {

                        $(self.$el).removeClass("light");
                        $(self.$el).addClass("dark");

                        $(self.$el).find(".light").addClass("dark");
                        $(self.$el).find(".light").removeClass("light");

                        self.theme = 'dark';

                    } else {

                        $(self.$el).removeClass("dark");
                        $(self.$el).addClass("light");

                        $(self.$el).find(".dark").addClass("light");
                        $(self.$el).find(".dark").removeClass("dark");

                        self.theme = 'light';
                    }

                    localStorage.setItem("LOG-CONSOLE-THEME", self.theme);

                }
            }
            
        })

        // Trigger
        Vue.component("omdb-trigger-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template: `<omdb-trigger-editor-component :id="id"
                                                        :className="model.node.name"
                                                        :model="editor"
                                                        showToolsBar="true"
                                                        showStatusBar="false"></omdb-trigger-editor-component>`,
            data(){
                return {
                    editor: {
                        mode: "lua",
                        theme: "tomorrow",
                        readOnly: false,
                    }
                }
            },
            created(){
                
            }
            
        })

        // JSON输出控制台
        Vue.component("omdb-query-output-json-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template: `<el-container style="height: 100%;">
                            <el-header style="height:30px;line-height:30px;background: #f6f6f6;">
                                <el-button-group>
                                    <el-tooltip content="复制" placement="bottom" open-delay="500">
                                        <el-button type="text" icon="fas fa-copy" class="btn-copy"></el-button>
                                    </el-tooltip>
                                </el-button-group>
                            </el-header>
                            <el-main style="padding:0px;height:100%;">
                                <pre style="background:transparent;border:none;">#{JSON.stringify(model,null,4).replace(/   /g, ' ')}#</pre>
                            </el-main>
                        </el-container>`,
            data(){
                return {

                }
            },
            created: function(){
                const self = this;

            },
            mounted: function() {
                const self = this;

                new Clipboard('.el-button.btn-copy',{
                    text: function(trigger) {
                        self.$message('已复制');
                        return JSON.stringify(self.model,null,4).replace(/   /g, ' ');
                    }
                });
            },
            methods: {
                init: function(){
                    const self = this;

                    if(!_.isEmpty(content)) {
                        self.model = content;
                    } else {
                        self.model = '';
                    }

                },
                setData: function(event){
                    const self = this;
                    self.model = event.data;
                }
            }
        })

        // 文本输出控制台
        Vue.component("omdb-query-output-text-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Array
            },
            template:   `<el-container>
                            <el-main>
                                <p>
                                    <div v-for="item in model">
                                        <div v-for="(v,k) in item">
                                            <dt>#{k}#：#{v}#</dt>
                                        </div>
                                    </div>
                                </p>
                                <p>输出时间：#{moment().format("LLL")}#</p>
                            </el-main>
                        </el-container>`,
            data(){
                return {

                }
            }  
        })

        // 类编辑控制台 
        Vue.component("omdb-class-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template:   `<el-container style="height: calc(100vh - 110px);">
                            <el-main style="padding:0px;overflow:hidden;background:#f6f6f6;">
                                <el-form label-width="80px" :model="formModel" style="width:70%;padding: 10px 0px;">
                                    <el-form-item label="类名称">
                                        <el-input v-model="formModel.name" :disabled="true"></el-input>
                                    </el-form-item>
                                    <el-form-item label="类别名">
                                        <el-input v-model="formModel.alias">
                                            <el-button slot="append" icon="fas fa-save" @click="onUpdate('alias')"></el-button>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="备注">
                                        <el-input v-model="formModel.remedy">
                                            <el-button slot="append" icon="fas fa-save" @click="onUpdate('remedy')"></el-button>
                                        </el-input>
                                    </el-form-item>
                                </el-form>
                                <el-tabs v-model="tabs.activeName" type="card" tab-position="left" @tab-click="onClick" style="border-top:1px solid #dddddd;">
                                    <el-tab-pane name="columns">
                                        <span slot="label"><i class="fas fa-columns"></i> 属性</span>
                                        <omdb-classlist-component :model="dt"></omdb-classlist-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="keys">
                                        <span slot="label"><i class="fas fa-key"></i> 主键</span>
                                        <omdb-editor-base-component :model="keysModel"
                                                                    showToolsBar="true"
                                                                    showStatusBar="true">
                                        </omdb-editor-base-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="indexes">
                                        <span slot="label"><i class="fas fa-indent"></i> 索引</span>
                                        <omdb-editor-base-component :model="indexesModel"
                                                                    showToolsBar="true"
                                                                    showStatusBar="true">
                                        </omdb-editor-base-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="subClass">
                                        <span slot="label"><i class="fas fa-cube"></i> 子类</span>
                                        <omdb-editor-base-component :model="subClassModel"
                                                                    showToolsBar="true"
                                                                    showStatusBar="true">
                                        </omdb-editor-base-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="options">
                                        <span slot="label"><i class="fas fa-cog"></i> 设置</span>
                                        <omdb-editor-base-component :model="optionsModel"
                                                                    showToolsBar="true"
                                                                    showStatusBar="true">
                                        </omdb-editor-base-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="ddl">
                                        <span slot="label"><i class="fas fa-table"></i> DDL</span>
                                        <omdb-editor-base-component :model="ddlModel"
                                                                    showToolsBar="true"
                                                                    showStatusBar="true">
                                        </omdb-editor-base-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="trigger">
                                        <span slot="label"><i class="fas fa-stopwatch"></i> 触发器</span>
                                        <omdb-trigger-console :id="id+'-trigger'" :model="model"></omdb-trigger-console>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-main>
                        </el-container>`,
            data(){
                return {
                    tabs:{
                        activeName: 'columns'
                    },
                    dt: {
                        rows: [],
                        columns: [],
                        result: {},
                        keys: [],
                    },
                    formModel: {},
                    keysModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    },
                    indexesModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    },
                    subClassModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    },
                    optionsModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    },
                    ddlModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    }
                }
            },
            created(){
                // columns
                this.initColumns();

                // keys
                this.initKeys();

                // form
                this.initForm();
            },
            mounted() {
                
            },
            methods: {
                initColumns(){
                    
                    if(!_.isEmpty(this.model.node.fieldsObj) && !_.isEmpty(this.model.pnode.fieldsObj)) {

                        let _node = _.cloneDeep(this.model.node.fieldsObj);
                        let _pnode = _.cloneDeep(this.model.pnode.fieldsObj);
        
                        if(this.model.node.fieldsObj == this.model.pnode.fieldsObj) {
                            this.dt.rows = _.map(this.model.node.fieldsObj, (v)=>{
                                return _.merge(v, {icon: 'parent'});
                            });
                        } else {
                            let _diff =  _.differenceWith(this.model.node.fieldsObj, this.model.pnode.fieldsObj, (v1,v2)=>{return v1.name === v2.name;});
        
                            if(_.isEmpty(_diff)){
                                this.dt.rows = _.map(_node, (v)=> {
                                    return _.merge(v, {icon: 'parent'});
                                });
        
                            } else {
                                this.dt.rows = _.concat(_.map(_pnode,(v)=>{return _.merge(v, {icon: 'parent'});}), _.map(_diff,(v)=>{return _.merge(v, {icon: 'child'});}));
                            }
                        }
                    } else{
                        this.dt.rows = _.map(this.model.node.fieldsObj, (v)=> {
                            return _.merge(v, {icon: 'parent'});
                        });
                    }
        
                    this.dt.rows = _.map(_.uniqBy(this.dt.rows,'name'),(v)=>{
                        if(_.indexOf(this.model.node.keys,v.name) > -1){
                            _.extend(v,{iskey:1});
                        }
                        return v;
                    });
    
                    this.dt.columns = [
                                        {"field": "id", title:"序号", width: 80, render: function(row,column,cellValue,index) {
                                                return index + 1;
                                            }
                                        },
                                        {"field": "icon", "title": "继承", width: 120, render: function(row,column,cellValue,index) {
                                                return `<img src="${window.ASSETS_ICON}/tools/png/${cellValue}.png?type=open&issys=${window.SignedUser_IsAdmin}" style="width:22px;height:22px;">`;
                                            }
                                        },
                                        {"field": "name", "title": "属性", width: 120},
                                        {"field": "colname", "title": "列属性", width: 120, visible: false},
                                        {"field": "title", "title": "标题", width: 120},
                                        {"field": "ftype", "title": "类型", width: 80, render: function(row,column,cellValue,index) {
                                                return cellValue==='smallint'?'enum':cellValue;
                                            }
                                        },
                                        {"field": "loption", "title": "Loption", width: 120},
                                        {"field": "fparam", "title": "Fparam", width: 160},
                                        {"field": "isindex", "title": "索引", width: 80, render: function (row,column,cellValue,index) {
                                                return cellValue===1?'是':'否';
                                            }
                                        },
                                        {"field": "iskey", "title": "主键", width: 120, render: function (row,column,cellValue,index) {
                                                return cellValue===1?'是':'否';
                                            }
                                        },
                                        {"field": "note", "title": "备注", width: 80},
                                        {"field": "mtime", "title": "时间", width: 160, render: function (row,column,cellValue,index) {
                                                return moment(cellValue).format("YYYY-MM-DD HH:MM:SS.SSS");
                                            }
                                        },
                                        {"field": "class", "title": "类", width: 80, "visible": false},
                                        {"field": "dispname", "title": "显示名称", width: 80, "visible": false},
                                        {"field": "tags", "title": "标签", width: 80, "visible": false},
                                        {"field": "isrel", "title": "Rel", width: 80, "visible": false},
                                        {"field": "btype", "title": "Btype", width: 80, "visible": false}
                                    ];
    
                    this.dt.columns = _.uniqBy(this.dt.columns, 'field');
                                    
                    this.dt.result = this.model.node;
                    
                    _.delay(()=>{
                        eventHub.$emit(`LAYOUT-DATATABLE-RESIZE-EVENT`);
                    },1500)
                },
                initKeys: function(){
                    let rtn = omdbHandler.classList(-1)[0];
                    this.dt.keys = _.sortBy(_.keys(rtn));
                },
                initForm(){
                    this.formModel = this.model.node;
                },
                onClick(tab, event){
                    const self = this;
                    const splitTab = "\t| ";
                    const endWord = "\n";
                    const spaceWord = function(n){return n<=20?_.fill(Array(20 - n)," ").join(""):"" ;};
                    const headerWord = _.fill(Array(100),"-").join("");

                    if(tab.name == 'keys'){
                        self.keysModel.newInput = _.concat([`Name${spaceWord(4)}${splitTab}Type`,headerWord],_.map(self.model.node.keys,function(v){
                            return `${v}${spaceWord(v.length)}${splitTab}Primary Key`;
                        })).join(endWord);
                    } else if(tab.name == 'indexes'){
                        self.indexesModel.newInput = _.concat([`Name${spaceWord(4)}${splitTab}Query`,headerWord],_.map(_.filter(self.model.node.fieldsObj,function(v){
                            return v.isindex == 1;
                        }),function(w){
                            return `${w.name}${spaceWord(w.name.length)}${splitTab}CREATE INDEX ${w.name} ON ${window.COMPANY_OSPACE}(${w.name});`;
                        })).join(endWord);
                    } else if(tab.name == 'subClass'){
                        self.subClassModel.newInput = _.concat([`Name[${self.model.node.child.length}]`,headerWord],_.map(self.model.node.child,function(v){
                            return `${v}`;
                        })).join(endWord);
                    } else if(tab.name == 'options'){
                        self.dt.keys = _.without(self.dt.keys,'child','fields');
                        self.optionsModel.newInput = _.concat([`Name${spaceWord(4)}${splitTab}Value`,headerWord],_.map(self.dt.keys,function(v){
                            let value = self.model.node[v];

                            if(v === 'mtime'){
                                value = moment(self.model.node[v]).format("LLL");
                            } else if(v === 'keymethod'){
                                if(self.model.node[v] === 1){
                                    value = 'uuid';
                                } else {
                                    value = 'md5';
                                }
                            }
                            
                            return `${v}${spaceWord(v.length)}${splitTab}${value}`;
                        })).join(endWord);;
                    } else if(tab.name == 'ddl'){
                        self.ddlModel.newInput = omdbHandler.classToDDL(self.model.node.name);
                    }
                },
                onUpdate(column){
                    let item = {action:'update', class: this.formModel.name, name: column, value: this.formModel[column]};
                    let rtn = fsHandler.callFsJScript("/matrix/omdb/updateClass.js",encodeURIComponent(JSON.stringify(item))).message;
                }
            }  
        })

        // 图谱控制台
        Vue.component("omdb-graph-console",{
            delimiters: ['${', '}'],
            props: {
                id: String,
                model: Object
            },
            template: `<omdb-graph-component :id="id" :bid="id" :graphData="graphModel"></omdb-graph-component>`,
            data(){
                return {
                    graphModel: {},
                }
            },
            watch: {
                model:{
                    handler: function(val,oldVal){
                        this.init();
                    },
                    deep:true
                }
            },
            created(){
                this.init();
            },
            mounted() {
                const self = this;

                self.$nextTick(function () {
                    self.init();
                })
            },
            methods: {
                init(){
                    const self = this;

                    _.extend(self.graphModel, {nodes: self.model.nodes || [], edges: self.model.edges || [], paths: self.model.paths || [], pathtags: self.model.pathtags || [], diff: self.model.diff || [] } );

                }
            }
        })

        // 查询输出控制台
        Vue.component("omdb-query-output-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template:   `<el-container style="height:calc(100% - 30px);">
                            <el-header style="height:30px;line-height:30px;">
                                <el-tooltip content="删除" delay-time="500">
                                    <el-button type="text" @click="onDelete" icon="el-icon-delete"></el-button>
                                </el-tooltip>
                                <el-tooltip content="导出" delay-time="500">
                                    <el-dropdown @command="onExport">
                                        <span class="el-dropdown-link">
                                            <i class="el-icon-download el-icon--right"></i>
                                        </span>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item command="csv">CSV</el-dropdown-item>
                                            <el-dropdown-item command="json">JSON</el-dropdown-item>
                                            <el-dropdown-item command="png">PNG</el-dropdown-item>
                                            <el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </el-tooltip>

                            </el-header>
                            <el-main style="height:100%;padding:0px;">
                                <el-table :data="dt.rows" 
                                    stripe
                                    style="width: 100%;"
                                    height="100%"
                                    :row-class-name="rowClassName"
                                    :header-cell-style="headerRender"
                                    @row-dblclick="rowDblclick"
                                    @selection-change="onSelectionChange"
                                    fit="true"
                                    size="mini"
                                    ref="table">
                                    
                                    <el-table-column type="index" label="序号" sortable align="center">
                                        <template slot-scope="scope">
                                            <div style="width:100%; text-align: center;"> <b> #{scope.$index + 1}# </b> </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column type="selection" align="center">
                                    </el-table-column>                                                
                                    <el-table-column type="expand" label="详细" align="center" >
                                        <template slot-scope="props">
                                            <el-form style="width: 100%;padding:10px 20px;" label-position="left" class="omdb-table-data-expand">
                                                <el-form-item v-for="v,k in props.row" :label="k">
                                                    <el-input :type="k | pickType" v-model="v" :disabled="true" v-if="_.includes(['class','ctime', 'day','id','name', 'vtime'],k)"></el-input>
                                                    <el-input :type="k | pickType" v-model="v" :disabled="false" v-else></el-input>
                                                </el-form-item>
                                            </el-form>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :prop="item.field"  
                                            show-overflow-tooltip="true" 
                                            sortable
                                            resizable
                                            :formatter="item.render"
                                            v-for="item in dt.columns"
                                            min-width="180">
                                        <template slot-scope="scope" slot="header">
                                            <span> #{item.field}# 
                                                <el-popover
                                                    placement="top-start"
                                                    width="100"
                                                    trigger="hover"
                                                    :content="item.type">
                                                    <code slot="reference" style="color: #333;background-color: #f7f7f7;">#{item.type.substr(0,1)}#</code>
                                                </el-popover>
                                            </span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-main>
                            <el-footer  style="height:30px;line-height:30px;">
                                #{ info.join(' &nbsp; | &nbsp;') }#
                            </el-footer>
                        </el-container>`,
            data(){
                return {
                    dt: {
                        rows: [],
                        columns: [],
                        selected: [],
                    },
                    info: []
                }
            },
            filters: {
                pickType(key){
                    let rtn = 'text';
                    try{
                        let type = _.find(this.dt.columns,{field:key}).type;
                        if(type === 'text'){
                            rtn = 'textarea';
                        }
                    } catch(err){
                        rtn = 'input';
                    }

                    return rtn;
                }
            },
            watch: {
                dt:{
                    handler: function(val,oldVal){
                        this.info = [];
                        this.info.push(`共 ${val.rows.length} 项`);
                        this.info.push(`已选择 ${val.selected.length} 项`);
                        this.info.push(moment().format("YYYY-MM-DD HH:MM:SS.SSS"));
                    },
                    deep:true
                }
            },
            created(){
                const self = this;

                if(!_.isEmpty(self.model)) {
                    self.dt.rows = self.model.data;
                    self.dt.columns = _.map(self.model.columns[_.keys(self.model.columns)[0]],(v)=>{
                        //  msg
                        if(_.includes(['msg'],v.field)){
                            return _.extend(v,{render: function(row, column, cellValue, index){
                                        return  _.truncate(cellValue, {'length': 100});
                                    }});
                        }

                        //  data & time render
                        if(_.includes(['day'],v.field)){
                            return _.extend(v,{render: function(row, column, cellValue, index){
                                        return moment(cellValue).format("YYYY-MM-DD");
                                    }});
                        }

                        if(_.includes(['vtime','mtime','ctime','stime','etime'],v.field)){
                            return _.extend(v,{render: function(row, column, cellValue, index){
                                        return moment(cellValue).format("YYYY-MM-DD HH:mm:ss.SSS");
                                    }});
                        }

                        if(_.includes(['map','set','list'],v.type) || typeof(data) === 'object'){
                            return _.extend(v,{render: function(row, column, cellValue, index){
                                        if(_.isNull(cellValue) || _.isEmpty(cellValue)) {
                                            return '';
                                        } else{
                                            return JSON.stringify(cellValue,null,2);
                                        }
                                    }});
                        }

                        return v;
                    });
                }
            },
            mounted(){
                this.info.push(`共 ${this.dt.rows.length} 项`);
            },
            methods: {
                rowClassName({row, rowIndex}){
                    return `row-${rowIndex}`;
                },
                headerRender({ row, column, rowIndex, columnIndex }){
                    if (rowIndex === 0) {
                        return 'text-align:center;';
                    }
                },
                rowDblclick(row, column, event){
                    
                },
                onSelectionChange(val) {
                    this.dt.selected = val;
                },
                onUpdate(row){
                    let cx = { columns:_.map(this.dt.columns,(v)=>{ return { [v.field]:v.type }; }), row: row };
                    //let rtn = fsHandler.callFsJScript("/matrix/omdb/dataUpdate.js",encodeURIComponent)
                },
                onDelete(){
                    
                    if(_.isEmpty(this.dt.selected)) {
                        this.$message({
                            message: '请选择删除数据！',
                            type: 'info'
                        });
                        return false;
                    }

                    let ids = _.map(this.dt.selected,"id");

                    this.$confirm(`确定删除数据？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let rtn = fsHandler.callFsJScript("/matrix/omdb/dataDelete.js", encodeURIComponent(JSON.stringify(ids)));
                        this.dt.rows = _.xor(this.dt.rows, this.dt.selected);
                        this.dt.selected = [];
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        }); 
                    }).catch(() => {
                        
                    });
                },
                onExport(type){
                    
                    let options = {
                        csvEnclosure: '',
                        csvSeparator: ', ',
                        csvUseBOM: true,
                        ignoreColumn: [0,1,2],
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

        
        // 查询控制台
        Vue.component("omdb-query-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template: `<el-container style="height:calc(100vh - 110px);">
                            <el-header style="padding:0px;height:40%;" ref="topView">
                                <omdb-editor-component :id="id" :bid="id"
                                                        :model="editorModel"
                                                        showToolsBar="true"
                                                        showStatusBar="true"></omdb-editor-component>
                            </el-header>
                            <el-main style="padding:0px;height:60%;overflow:hidden;" ref="mainView">
                                <el-tabs v-model="main.activeIndex" type="border-card" closable @tab-remove="mainTabsRemove" @tab-click="mainTabsClick"  style="height:100%;">
                                    <el-tab-pane
                                        :key="item.name"
                                        v-for="(item, index) in main.tabs"
                                        :name="item.name"
                                        style="height:100%;">
                                        <span slot="label"><i class="fas fa-list-alt"></i> #{item.title}#</span>
                                        <omdb-log-console :id="id+'-log-'+item.name" :model="item.model" v-if="item.type=='omdb-log-console'" :ref="'omdbQueryLogRef-'+id"></omdb-log-console>
                                        <omdb-query-output-console :id="id+'-output-'+item.name" :model="item.model" v-if="item.type=='omdb-query-output-console'" :ref="'omdbQueryOutputRef-'+id"></omdb-query-output-console>
                                        <omdb-graph-console :id="id+'-graph-'+item.name" :model="item.model" v-if="item.type=='omdb-query-graph-console'"  :ref="'omdbQueryGraphRef-'+id"></omdb-graph-console>
                                        <omdb-query-output-json-console :id="id+'-output-json-'+item.name" :model="item.model" v-if="item.type=='omdb-query-output-json-console'"  :ref="'omdbQueryOutputJsonRef-'+id"></omdb-class-console>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-main>
                        </el-container>`,
            data(){
                return {
                    main: {
                        tabs: [
                                {title: '日志', name: `log`, type: 'omdb-log-console', model: []}
                            ],
                        activeIndex: 'log',
                        splitInst: null
                    },
                    editorModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: false,
                    },
                    keys: []
                }
            },
            created: function(){
                const self = this;

                let _diff = null;
                
                if(!_.isEmpty(self.model.pnode)){
                    if(self.model.node.fieldsObj && self.model.pnode.fieldsObj) {
                        _diff = _.differenceBy(self.model.node.fieldsObj, self.model.pnode.fieldsObj, 'name');
                        self.model.node["fieldsObj"] = _.uniqBy(_diff,'name');
                    }
                }

                if(self.model.pattern === 'ddl') {
                    self.editorModel.readOnly = true;
                }

                self.initKeys();
            },
            mounted: function () {
                const self = this;

                self.$nextTick(function () {
                    self.init();
                })
            },
            methods: {
                init: function(){
                    const self = this;

                    /* layout */
                    _.delay(()=>{
                        self.layout();
                    },1000)

                    if(_.isEmpty(self.model.node)) return false;

                    let colms = _.without(self.model.node.fields,"_tokens") || self.model.node.fields;

                    let cls = "";
                    if(_.isEmpty(colms)){
                        cls = "*";
                    } else {
                        cls = colms.join(",");
                    }
                    let mql = "";

                    if(self.model.pattern === 'data') {
                        mql = `SELECT\n\t ${cls} \nFROM\n\t ${self.model.node.name} limit 50`;
                    } else if(self.model.pattern === 'select') {
                        mql = "SELECT\n\t " + cls + "\nFROM\n\t " + self.model.node.name;
                    } else if(self.model.pattern === 'select-edge') {
                        mql = "SELECT\n\t " + cls + "\nFROM\n\t " + self.model.node.name.split("[")[0];
                    } else if(self.model.pattern === 'insert') {
                        mql = "INSERT INTO " + self.model.node.name + "\n" + _.map(self.model.node.fields, function(v){return `${v}=''`;}).join(", ") + ";";
                    } else if(self.model.pattern === 'update') {
                        mql = "UPDATE " + self.model.node.name + "\nSET " + _.map(self.model.node.fields,function(v){return v+"=''";}).join(",") + "\nWHERE ";
                    } else if(self.model.pattern === 'delete') {
                        mql = "DELETE FROM\n\t " + self.model.node.name;
                    } else if(self.model.pattern === 'ddl') {

                        mql = "#DDL\nCREATE CLASS IF NOT EXISTS " + self.model.node.name + " (\n\t" + _.map(self.model.node.fieldsObj, function(v){ return `${v.name}  ${v.ftype}  '${v.title}'`;}).join(",\n\t") + "\n\tindexes(" + _.map(_.filter(self.model.node.fieldsObj,function(v){return v.isindex == 1;}),'name').join(",") + ")\n\tkeys(" + self.model.node.keys.join(",") + ")\n);";

                        _.forEach(self.keys,function(v){

                            if(_.includes(v,'time')) {
                                mql += `\n\n#${_.startCase(v)}\n${v}=${moment(self.model.node[v]).format("LLL")}`;
                                return;
                            }

                            let _value = self.model.node[v];

                            if(_value === 1){
                                _value = true;
                            } else if(_value === 0){
                                _value = false;
                            }

                            if(v === 'keymethod'){
                                if(_value === 1){
                                    _value = 'uuid';
                                } else {
                                    _value = 'md5';
                                }
                            }

                            mql += `\n\n#${_.startCase(v)}\n${v}=${_value}`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                        })

                    } else if(self.model.pattern === 'create-class') {
                        let _modelName = `new_${_.now()}`
                        mql = `CREATE CLASS IF NOT EXISTS  ${self.model.node.name}/${_modelName}(\n\tfield1\tdate\t"日期",\n\tfield2\ttimestamp\t"时间戳",\n\tfield3\tint\t     "整形值",\n\tfield4\tfloat\t"浮点值",\n\tfield5\tenum {\n\t"1000":["item1", "item1描述"],\n\t"1001":["item2", "item2描述"]}\t"枚举值",\n\tfield6\tvarchar\t"字符串",\n\tkeys(field1,field2,field3,field4,field6),\n\tindex(field1,field2,field3,field4,field6)\n)with ttl=366 day , autosearch=true , alias='${_modelName}', nickname='${_modelName}';`;
                        mql = _.replace(mql, "//", "/");
                    } else if(self.model.pattern === 'drop-class') {
                        mql = "DROP CLASS IF EXISTS " + self.model.node.name + ";";
                    } else if(self.model.pattern === 'alter') {
                        mql = `#设置类属性`;

                        let _keys = _.remove(self.keys, function(v){
                            return !_.includes(['cid','pid','fields','keys','mtime','fieldsObj','child', 'loption', 'subclass','vtimebase','tags', 'name'],v)
                        })

                        _.forEach(_keys,function(v){
                            let _value = self.model.node[v];

                            if(_value === 1){
                                _value = true;
                            } else if(_value === 0){
                                _value = false;
                            }

                            if(v === 'keymethod'){
                                if(_value === 1){
                                    _value = 'uuid';
                                } else {
                                    _value = 'md5';
                                }
                            }

                            if(_.includes(['alias','keymethod','remedy'],v)){
                                mql += `\n\n#${_.startCase(v)}\nALTER CLASS ${self.model.node.name} SET ${v}='${_value}';`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                            } else {
                                mql += `\n\n#${_.startCase(v)}\nALTER CLASS ${self.model.node.name} SET ${v}=${_value};`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                            }
                        })
                    } else if(self.model.pattern === 'alter-add-column') {
                        mql = "ALTER CLASS " + self.model.node.name + " ADD COLUMN column_name type;\n\n";
                    } else if(self.model.pattern === 'alter-drop-column') {
                        mql = "ALTER CLASS " + self.model.node.name + " DROP COLUMN column_name;\n\n";
                    } else if(self.model.pattern === 'alter-add-index') {
                        mql = "ALTER CLASS " + self.model.node.name + " ADD INDEX index_name type;\n\n";
                    } else if(self.model.pattern === 'alter-drop-index') {
                        mql = "ALTER CLASS " + self.model.node.name + " DROP INDEX index_name type;\n\n";
                    } else if(self.model.pattern === 'alter-add-key') {
                        mql = "ALTER CLASS " + self.model.node.name + " ADD KEY key_name;\n\n";
                    } else if(self.model.pattern === 'alter-drop-key') {
                        mql = "ALTER CLASS " + self.model.node.name + " DROP KEY key_name;\n\n";
                    } else if(self.model.pattern === 'g') {  // edge  query
                        mql = `g.V(" ").In("${self.model.node.title}").All();`;
                    } else if(self.model.pattern === 'create-edge-type') {  // edge  new edge type
                        mql = `CREATE EDGE TYPE  type_name 'type_remedy';`;
                    } else if(self.model.pattern === 'drop-edge-type') {  // edge drop edge type
                        mql = `DROP EDGE TYPE ${self.model.node.title};`;
                    } else if(self.model.pattern === 'edge-insert') {  // edge  create
                        mql = `INSERT INTO class_name id="",${self.model.node.title}=[""];`;
                    } else if(self.model.pattern === 'edge-update') {  // edge  update
                        mql = `UPDATE class_name SET ${self.model.node.title}='' WHERE ID='';`;
                    } else if(self.model.pattern === 'edge-g') {  // edge query all
                        mql = GLOBAL_CONFIG.global.gremlin;
                    }

                    self.editorModel.newInput = mql;
                },
                initKeys(){
                    let rtn = omdbHandler.classList(-1)[0];
                    this.keys = _.sortBy(_.keys(rtn));
                },
                layout(){
                    
                    let sizes = [40,60];
                    
                    this.main.splitInst = Split([this.$refs.topView.$el, this.$refs.mainView.$el], {
                        sizes: sizes,
                        minSize: [0, 0],
                        gutterSize: 5,
                        cursor: 'col-resize',
                        direction: 'vertical',
                        onDragEnd:function(sz) {
                            localStorage.setItem(`OMDB-SPLIT-SIZES-${_.upperCase(self.id)}`,sz);
                            eventHub.$emit(`LAYOUT-DATATABLE-RESIZE-EVENT`,sz[1]);
                        }
                    });
                },
                logAppend(level,list){
                    const self = this;
                    
                    let log = _.find(self.main.tabs,{name:'log'});
                    
                    if(_.isEmpty(log)){
                        self.main.tabs.push({title: '日志', name: `log`, type: 'omdb-log-console', model: []});
                        log = _.find(self.main.tabs,{name:'log'});   
                    }
                    
                    log.model.push({level:level,msg:list});
                },
                mainTabsClick(tab, event) {

                },
                mainTabsAdd(node){
                    const self = this;
                    
                    // 已经打开
                    if(_.find(self.main.tabs,{name: node.name})){
                        self.mainTabsRemove(node.name);

                        _.delay(()=>{
                            self.main.tabs.push(node);
                            self.main.activeIndex = node.name;
                        },50)
                    } else {
                        self.main.tabs.push(node);
                        self.main.activeIndex = node.name;
                    }

                    _.delay(()=>{
                        eventHub.$emit("LAYOUT-DATATABLE-RESIZE-EVENT",self.main.splitInst.getSizes()[1]);
                    },500)

                    

                },
                mainTabsRemove(targetName){
                    const self = this;
                    
                    try{
                        let tabs = self.main.tabs;
                        let activeIndex = self.main.activeIndex;
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
                        
                        self.main.tabs = tabs.filter(tab => tab.name !== targetName);
                        self.main.activeIndex = activeIndex;
                        
                    } catch(err){
                        
                    } 
                }
            }
        })

        VueLoader.onloaded([
            "omdb-path-datatables-component",
            "omdb-output-datatables-component",
            "omdb-class-datatables-component",
            "omdb-class-tree-component",
            "omdb-editor-component",
            "omdb-editor-base-component",
            "omdb-graph-component",
            "omdb-trigger-editor-component",
            "ai-robot-component"], function() {
    

            $(function() {

                odb.app = new Vue({
                    delimiters: ['#{', '}#'],
                    template:   `<el-container style="calc(100vh - 140px);">
                                    <el-aside style="overflow:hidden;height:100%;" ref="leftView">
                                        <el-container style="height:100%;">
                                            <el-header style="height:29px;line-height:29px;padding:0 5px;border-bottom:1px solid #dddddd;display:flex;">
                                                <h4 style="width:70%;font-size:12px;margin:0px;">
                                                    <i class="fas fa-cubes"></i> 对象管理 [${window.COMPANY_OSPACE}]
                                                </h4>
                                                <el-dropdown style="width: 50%;text-align: right;font-size:12px;">
                                                    <span class="el-dropdown-link">
                                                        <i class="fas fa-angle-down"></i>
                                                    </span>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item @click.native="classDataExport('/matrix')"><i class="fas fa-file-export"></i> 导出</el-dropdown-item>
                                                        <el-dropdown-item @click.native="classDataImport"><i class="fas fa-file-import"></i> 导入</el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                            </el-header>
                                            <el-main style="padding:0px;height:calc(100vh - 108px);overflow:hidden;border-top:1px solid #ffffff;">
                                                <omdb-class-tree-component :id="id+'-class-tree'"></omdb-class-tree-component>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-main style="padding:0px;overflow:hidden;" ref="mainView">
                                        <el-tabs v-model="main.activeIndex" type="border-card" closable @tab-remove="mainTabsRemove" @tab-click="mainTabsClick">
                                            <el-tab-pane
                                                :key="item.name"
                                                v-for="(item, index) in main.tabs"
                                                :name="item.name">
                                                <span slot="label">
                                                    #{item.title}#
                                                    <el-dropdown trigger="click">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-arrow-down"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item @click.native="mainTabsClose(0,item)">关闭</el-dropdown-item>
                                                            <el-dropdown-item @click.native="mainTabsClose(1,item)">关闭其它标签页</el-dropdown-item>
                                                            <el-dropdown-item @click.native="mainTabsClose(2,item)">关闭右侧标签页</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                    </el-dropdown>
                                                </span>
                                                
                                                <omdb-query-console :id="id+'-query-'+item.name" :model="item.model" v-if="item.type=='omdb-query-console'" :ref="'omdbQueryConsoleRef-'+id+'-query-'+item.name"></omdb-query-console>
                                                <omdb-trigger-console :id="id+'-trigger-'+item.name" :model="item.model" v-if="item.type=='omdb-trigger-console'"></omdb-trigger-console>
                                                <omdb-class-console :id="id+'-class-'+item.name" :model="item.model" v-if="item.type=='omdb-class-console'"  :ref="'omdbClassRef-'+id+'-class-'+item.name""></omdb-class-console>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    data: {
                        id: 'omdb',
                        main: {
                            tabs: [
                                    {title: '查询', name: `query`, type: 'omdb-query-console', model: {node:null, pnode:null, pattern: 'select'}}
                                ],
                            activeIndex: 'query'
                        }
                    },
                    mounted() {
                        const self = this;
    
                        self.$nextTick(function() {
                            self.init();
                        })
                    },
                    methods: {
                        init(){

                            this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                                sizes: [20, 80],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal',
                            });
                        },
                        mainTabsClick(tab, event) {
                            
                        },
                        mainTabsClose(key,tab){
                            const self = this;

                            if(key === 0){
                                self.mainTabsRemove(tab.name);
                            } else if( key === 1 ){
                                let others = _.xor(self.main.tabs,[tab]);
                                _.forEach(others,(v)=>{
                                    self.mainTabsRemove(v.name);
                                })
                            } else {
                                let others = self.main.tabs.slice(_.indexOf(self.main.tabs,tab) + 1, self.main.tabs.length);
                                _.forEach(others,(v)=>{
                                    self.mainTabsRemove(v.name);
                                })
                            }
                        },
                        mainTabsAdd(node){
                            const self = this;
                            
                            // 已经打开
                            if(_.find(self.main.tabs,{name:node.name})){
                                self.main.activeIndex = node.name;
                                return false;
                            }

                            self.main.tabs.push(_.extend(node,{ name: [node.name,node.model.pattern].join("-"), title: [node.title,node.model.pattern].join("-") }));
                            self.main.activeIndex = node.name;
                        },
                        mainTabsRemove(targetName){
                            const self = this;

                            try{
                                let tabs = this.main.tabs;
                                let activeIndex = this.main.activeIndex;
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
                                
                                this.main.tabs = tabs.filter(tab => tab.name !== targetName);
                                this.main.activeIndex = activeIndex;
                                
                            } catch(err){
                                
                            } finally{
                                
                            }
                        },
                        classDataExport(selectedNode){
                            const me = this;
                            let wnd = null;

                            try{
                                if(jsPanel.activePanels.getPanel('jsPanel-class-template')){
                                    jsPanel.activePanels.getPanel('jsPanel-class-template').close();
                                }
                            } catch(error){

                            }
                            finally{
                                wnd = maxWindow.winClassTemplate('导出数据结构', `<div id="class-template-export"></div>`, null, null, null);
                            }

                            new Vue({
                                delimiters: ['#{', '}#'],
                                data:{
                                    classList: fsHandler.callFsJScript("/matrix/omdb/getClassListForTree.js",encodeURIComponent(selectedNode)).message,
                                    defaultProps: {
                                        children: 'children',
                                        label: 'class'
                                    },
                                    model: {
                                        ifData: false, 
                                        ifAllData: false,
                                        limit: 10,
                                        recursive: true,
                                        filetype: 'mql',
                                        template: true,
                                        class: '',
                                        ignoreClass: '/matrix/filesystem'
                                    }
                                },
                                watch: {
                                    'model.ifData':function(val,oldVal){
                                        if(!val){
                                            this.model.limit = 0;
                                        }
                                    },
                                    'model.ifAllData':function(val,oldVal){
                                        if(val){
                                            this.model.limit = -1;
                                        }
                                    }
                                },
                                template: `<el-container style="height:100%;">
                                                <el-header style="height:auto;line-height:40px;min-height:40px;background: #f6f6f6;">
                                                    <el-checkbox v-model="model.ifData" label="导出数据"></el-checkbox>
                                                    <p v-if="model.ifData">
                                                        <el-radio-group v-model="model.ifAllData">
                                                            <el-radio :label="true" border>导出所有数据</el-radio>
                                                            <el-radio :label="false" border>导出部分数据</el-radio>
                                                        </el-radio-group>
                                                        <el-input-number v-model="model.limit" v-if="!model.ifAllData && model.ifData != -1" style="width:30%;margin-left:10px;"></el-input-number>  
                                                    </p>
                                                </el-header>
                                                <el-main style="padding:10px;">
                                                    <el-tree
                                                        :data="classList"
                                                        ref="classTree"
                                                        show-checkbox
                                                        node-key="class"
                                                        check-strictly="true"
                                                        :default-expanded-keys="[_.first(classList).id]"
                                                        :default-expanded-keys="[model.class]"
                                                        :props="defaultProps"
                                                        check-on-click-node="true"
                                                        style="background-color:transparent;">
                                                    </el-tree>
                                                </el-main>
                                                <el-footer style="height:40px;line-height:40px;text-align:right;">
                                                    <el-button type="default" @click="onCancel">取消</el-button>
                                                    <el-button type="primary" @click="onExport('mql')">导出MQL</el-button>
                                                    <el-button type="primary" @click="onExport('xlsx')">导出Excel</el-button>
                                                </el-footer>
                                            </el-container>`,
                                created(){
                                    if(!_.isEmpty(selectedNode)){
                                        this.model.class = selectedNode;
                                    }
                                },
                                mounted(){
                                    let allNodes = fsHandler.callFsJScript("/matrix/omdb/getClassList.js",encodeURIComponent(this.model.class)).message;
                                    this.$refs.classTree.setCheckedKeys(allNodes);
                                },
                                methods:{
                                    onCancel(){
                                        wnd.close();
                                    },
                                    onExport(type){

                                        this.model.filetype = type;

                                        //获取所有Class
                                        let allNodes = fsHandler.callFsJScript("/matrix/omdb/getClassList.js",encodeURIComponent(this.model.class)).message;
                                        //checked Class
                                        let checkedClass = _.map(this.$refs.classTree.getCheckedNodes(),'class');
                                        
                                        // 交集
                                        _.extend(this.model, {ignoreClass: _.concat(this.model.ignoreClass,_.xor(allNodes,checkedClass)) } );

                                        if(this.model.ifData){
                                            //this.model.limit = -1;
                                            this.model.template = false;
                                        } else {
                                            this.model.template = true;
                                           // this.model.limit = 0;
                                        }
                                        let rtn = omdbHandler.classDataExport(this.model);
                                        this.$message({
                                            type: "info",
                                            message: "导出操作将提交至后台，请稍后。。。"
                                        })
                                        if(rtn == 1){
                                            wnd.close();
                                        }
                                    }
                                }
                            }).$mount("#class-template-export");
                        },
                        classDataImport(){
                            const me = this;
                            let wnd = null;

                            try{
                                if(jsPanel.activePanels.getPanel('jsPanel-class-template')){
                                    jsPanel.activePanels.getPanel('jsPanel-class-template').close();
                                }
                            } catch(error){

                            }
                            finally{
                                wnd = maxWindow.winClassTemplate('导入数据结构', `<div id="class-template-import"></div>`, null, null, null);
                            }

                            new Vue({
                                delimiters: ['#{', '}#'],
                                data:{
                                    fileList: [],
                                    rtnInfo: null
                                },
                                template: `<el-container style="height:100%;">
                                                <el-main style="padding:10px;">
                                                    <div v-if="!_.isEmpty(rtnInfo)">
                                                        <el-button type="text" icon="el-icon-close" @click="clearInfo"></el-button>
                                                        <section>
                                                            <code>#{rtnInfo.message.join(",")}#</code>
                                                        </section>
                                                    </div>
                                                    <el-upload
                                                        class="upload-demo"
                                                        drag
                                                        :auto-upload="false"
                                                        :on-change="onChange"
                                                        :file-list="fileList"
                                                        v-else>
                                                        <i class="el-icon-upload"></i>
                                                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                                                        <div class="el-upload__tip" slot="tip">只能上传Mql/Excel文件</div>
                                                    </el-upload>
                                                </el-main>
                                                <el-footer style="height:40px;line-height:40px;text-align:right;">
                                                    <el-button type="default" @click="onCancel">取消</el-button>
                                                    <el-button type="primary" @click="onImport">导入</el-button>
                                                </el-footer>
                                            </el-container>`,
                                methods:{
                                    onChange(file) {
                                        this.fileList = [file.raw];
                                    },
                                    onCancel(){
                                        wnd.close();
                                    },
                                    onImport(){
                                        this.rtnInfo = JSON.parse(omdbHandler.classDataImport(this.fileList[0]));
                                        this.$message({
                                            type: "info",
                                            message: "导入操作将提交至后台，请稍后。。。"
                                        })
                                    },
                                    clearInfo(){
                                        this.rtnInfo = null;
                                    }
                                }
                            }).$mount("#class-template-import");
                        }
                    }
                }).$mount("#app");

            })

        })
    }
}

let omdb = new Omdb();
omdb.init();