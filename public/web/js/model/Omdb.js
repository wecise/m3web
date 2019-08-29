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

        // 日志控制台
        Vue.component("omdb-log-console", {
            delimiters: ['#{', '}#'],
            props:{
                id: String,
                model: Object
            },
            template:   `<div :class="'log-console '+ theme" style="height:100%;">
                            <div class="logToolBar">
                                <div class="btn-group" role="group" aria-label="...">
                                    <a href="javascript:void(0);" class="btn btn-sm btn-primary toggle" @click="toggleTheme" title="切换主题" data-tooltip="tooltip"><i class="fas fa-sun"></i></a>
                                    <a href="javascript:void(0);" class="btn btn-sm btn-primary copy" @click="copyIt" title="复制" data-tooltip="tooltip"><i class="fa fa-copy"></i></a>
                                    <a href="javascript:void(0);" class="btn btn-sm btn-primary clear" @click="clearIt" title="清空" data-tooltip="tooltip"><i class="fa fa-trash"></i></a>
                                    <a href="javascript:void(0);" class="btn btn-sm btn-primary debug" @click="debugIt" title="调试" data-tooltip="tooltip"><i class="fa fa-desktop"></i></a>
                                </div>
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
                        self.append(_.last(val).level, _.last(val).msg);
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
                                        <el-input v-model="formModel.alias"></el-input>
                                    </el-form-item>
                                    <el-form-item label="备注">
                                        <el-input v-model="formModel.remedy"></el-input>
                                    </el-form-item>
                                </el-form>
                                <el-tabs v-model="tabs.activeName" type="card" tab-position="left" @tab-click="onClick" style="border-top:1px solid #dddddd;">
                                    <el-tab-pane name="columns">
                                        <span slot="label"><i class="fas fa-columns"></i> 属性</span>
                                        <omdb-class-datatables-component :id="id" :bid="id"
                                                                        :dataset="dtModel.datatable.dataset"
                                                                        :columns="dtModel.datatable.columns"
                                                                        :options="dtModel.datatable.options"
                                                                        contextmenu="null"
                                                                        :result="dtModel.result">
                                        </omdb-class-datatables-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="keys">
                                        <span slot="label"><i class="fas fa-key"></i> 主键</span>
                                        <omdb-editor-base-component :id="id+'-keys'" :bid="id+'-keys'"
                                                                    :model="keysModel"
                                                                    showToolsBar="true"
                                                                    showStatusBar="true">
                                        </omdb-editor-base-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="indexes">
                                        <span slot="label"><i class="fas fa-indent"></i> 索引</span>
                                        <omdb-editor-base-component :id="id+'-indexes'" :bid="id+'-indexes'"
                                                                    :model="indexesModel"
                                                                    showToolsBar="true"
                                                                    showStatusBar="true">
                                        </omdb-editor-base-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="subClass">
                                        <span slot="label"><i class="fas fa-cube"></i> 子类</span>
                                        <omdb-editor-base-component :id="id+'-subClass'" :bid="id+'-subClass'"
                                                                    :model="subClassModel"
                                                                    showToolsBar="true"
                                                                    showStatusBar="true">
                                        </omdb-editor-base-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="options">
                                        <span slot="label"><i class="fas fa-cog"></i> 设置</span>
                                        <omdb-editor-base-component :id="id+'-options'" :bid="id+'-options'"
                                                                    :model="optionsModel"
                                                                    showToolsBar="true"
                                                                    showStatusBar="true">
                                        </omdb-editor-base-component>
                                    </el-tab-pane>
                                    <el-tab-pane name="ddl">
                                        <span slot="label"><i class="fas fa-table"></i> DDL</span>
                                        <omdb-editor-base-component :id="id+'-ddl'" :bid="id+'-ddl'"
                                                                    :model="ddlModel"
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
                    dtModel: {
                        datatable: {
                            dataset: [],
                            columns: [],
                            options: {
                                info:true,
                                pageing:true,
                                scrollY: 'calc(100vh - 350px)',
                                searching: false,
                                rowCallback: function( row, data ) {
                                    if( data.icon === "parent" ) {
                                        $('td', row).css('background-color', '#f9f9f9');
                                    }
                                }
                            }
                        },
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
                const self = this;
                
                // columns
                self.initColumns();

                // keys
                self.initKeys();

                // form
                self.initForm();
            },
            mounted() {
                const self = this;
            },
            methods: {
                initColumns(){
                    const self = this;

                    if(!_.isEmpty(self.model.node.fieldsObj) && !_.isEmpty(self.model.pnode.fieldsObj)) {

                        let _node = _.cloneDeep(self.model.node.fieldsObj);
                        let _pnode = _.cloneDeep(self.model.pnode.fieldsObj);
        
                        if(self.model.node.fieldsObj == self.model.pnode.fieldsObj) {
                            self.dtModel.datatable.dataset = _.map(self.model.node.fieldsObj, function (v) {
                                return _.merge(v, {icon: 'parent'});
                            });
                        } else {
                            let _diff =  _.differenceWith(self.model.node.fieldsObj, self.model.pnode.fieldsObj, function(v1,v2){return v1.name === v2.name;});
        
                            if(_.isEmpty(_diff)){
                                self.dtModel.datatable.dataset = _.map(_node, function (v) {
                                    return _.merge(v, {icon: 'parent'});
                                });
        
                            } else {
                                self.dtModel.datatable.dataset = _.concat(_.map(_pnode,function(v){return _.merge(v, {icon: 'parent'});}), _.map(_diff,function(v){return _.merge(v, {icon: 'child'});}));
                            }
                        }
                    } else{
                        self.dtModel.datatable.dataset = _.map(self.model.node.fieldsObj, function (v) {
                            return _.merge(v, {icon: 'parent'});
                        });
                    }
        
                    self.dtModel.datatable.dataset = _.map(_.uniqBy(self.dtModel.datatable.dataset,'name'),function(v){
                        if(_.indexOf(self.model.node.keys,v.name) > -1){
                            _.extend(v,{iskey:1});
                        }
                        return v;
                    });
    
                    self.dtModel.datatable.columns = [
                                                {"field": "id", render: function (data, type, row, meta) {
                                                        return meta.row + meta.settings._iDisplayStart + 1;
                                                    }
                                                },
                                                {"field": "icon", "title": "Inherit", render: function (data, type, row) {
                                                        return `<img src="${window.ASSETS_ICON}/tools/png/${data}.png?type=download&issys=${window.SignedUser_IsAdmin}" style="width:22px;height:22px;">`;
                                                    }
                                                },
                                                {"field": "name", "title": "Name"},
                                                {"field": "title", "title": "Title"},
                                                {"field": "colname", "title": "ColName", visible: false},
                                                {"field": "ftype", "title": "Ftype",render: function (data, type, row) {
                                                        return data==='smallint'?'enum':data;
                                                    }
                                                },
                                                {"field": "loption", "title": "Loption"},
                                                {"field": "fparam", "title": "Fparam"},
                                                {"field": "isindex", "title": "Index",render: function (data, type, row) {
                                                        return data===1?'是':'否';
                                                    }
                                                },
                                                {"field": "iskey", "title": "Primary Key",render: function (data, type, row) {
                                                        return data===1?'是':'否';
                                                    }
                                                },
                                                {"field": "note", "title": "Note"},
                                                {"field": "mtime", "title": "Mtime",render: function (data, type, row) {
                                                        return moment(data).format("LLL");
                                                    }
                                                },
                                                {"field": "class", "title": "Class", "visible": false},
                                                {"field": "dispname", "title": "Dispname", "visible": false},
                                                {"field": "tags", "title": "Tags", "visible": false},
                                                {"field": "isrel", "title": "Rel", "visible": false},
                                                {"field": "btype", "title": "Btype", "visible": false}
                                            ];
    
                    self.dtModel.datatable.columns = _.uniqBy(self.dtModel.datatable.columns, 'field');
    
                    self.dtModel.result = self.model.node;
                    
                    _.delay(()=>{
                        eventHub.$emit(`LAYOUT-DATATABLE-RESIZE-EVENT`);
                    },1500)
                },
                initKeys: function(){
                    const self = this;

                    let rtn = omdbHandler.classList(-1)[0];
                    self.dtModel.keys = _.sortBy(_.keys(rtn));
                },
                initForm(){
                    this.formModel = this.model.node;
                },
                onClick(tab, event){
                    const self = this;
                    
                    if(tab.name == 'keys'){
                        self.keysModel.newInput = self.model.node.keys.join(",\n");
                    } else if(tab.name == 'indexes'){
                        self.indexesModel.newInput = _.map(_.filter(self.model.node.fieldsObj,function(v){return v.isindex == 1;}),'name').join(",\n");
                    } else if(tab.name == 'subClass'){
                        self.subClassModel.newInput = self.model.node.child.join(",\n");
                    } else if(tab.name == 'options'){
                        let options = "";
                        _.forEach(self.dtModel.keys,function(v){

                            if(_.includes(v,'time')) {
                                options += `#${_.startCase(v)}\n${v}=${moment(self.model.node[v]).format("LLL")}`;
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
    
                            options += `\n\n#${_.startCase(v)}\n${v}=${_value}`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                        })
                        self.optionsModel.newInput = options;
                    } else if(tab.name == 'ddl'){
                        self.ddlModel.newInput = omdbHandler.classToDDL(self.model.node.name);
                    }
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
            template: `<omdb-output-datatables-component :id="id" :bid="id"
                                                        :dataset="datatable.dataset"
                                                        :columns="datatable.columns"
                                                        :options="datatable.options"
                                                        contextmenu="null"
                                                        :result="result"></omdb-output-datatables-component>`,
            data(){
                return {
                    datatable: {
                        dataset: [],
                        columns: [],
                        options: {
                            info:true,
                            pageing: false,
                            scrollY: '148px',
                            searching: false,
                        }
                    },
                    result: []
                }
            },
            watch: {
                model:{
                    handler: function(val,oldVal){
                        this.datatable.dataset = val.data;
                    },
                    deep:true
                }
            },
            created(){
                const self = this;

                if(!_.isEmpty(self.model)) {
                    self.datatable.dataset = self.model.data;
                    self.datatable.columns = self.model.columns[_.keys(self.model.columns)[0]];
                    self.result = self.model;
                }

            },
            mounted() {
                const self = this;
                self.init();
            },
            methods: {
                init(){
                    const self = this;

                    if(!_.isEmpty(self.model)) {
                        self.datatable.dataset = self.result.data;//[_.keys(self.result.columns)[0]];
                        self.datatable.columns = self.result.columns[_.keys(self.result.columns)[0]];
                    } else {
                        self.datatable.dataset = [];
                        self.datatable.columns = [];
                    }

                },
                setData(event){
                    const self = this;

                    self.datatable.dataset = event.data;//[_.keys(event.columns)[0]] || [];
                    self.datatable.columns = event.columns[_.keys(event.columns)[0]] || [];
                    self.result = event;

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
                            <el-header :id="id+'-header'" style="padding:0px;height:50vh;">
                                <omdb-editor-component :id="id" :bid="id"
                                                        :model="editorModel"
                                                        showToolsBar="true"
                                                        showStatusBar="true"></omdb-editor-component>
                            </el-header>
                            <el-main :id="id+'-main'" style="padding:0px;height:30vh;overflow:hidden;">
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
            watch: {
                model: {
                    handler:function(val,oldVal){
                        console.log(2,val)
                    },
                    deep:true
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
                initKeys: function(){
                    const self = this;

                    let rtn = omdbHandler.classList(-1)[0];
                    self.keys = _.sortBy(_.keys(rtn));
                },
                layout(){
                    const self = this;
                    
                    self.main.splitInst = Split([`#${self.id+'-header'}`, `#${self.id+'-main'}`], {
                        sizes: [50, 50],
                        minSize: [0, 0],
                        gutterSize: 3,
                        cursor: 'col-resize',
                        direction: 'vertical',
                        onDragEnd:function(sizes) {
                            eventHub.$emit(`LAYOUT-DATATABLE-RESIZE-EVENT`,sizes[1]);
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

                        console.log(targetName,self.main.tabs)
                        
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
                                    <el-aside :id="id+'-aside'">
                                        <el-container>
                                            <el-header style="height:29px;line-height:29px;padding:0 5px;border-bottom:1px solid #dddddd;">
                                                <h5><i class="fas fa-cubes"></i> 对象管理</h5>
                                            </el-header>
                                            <el-main style="padding:0px;height:80vh;border-top:1px solid #ffffff;">
                                                <omdb-class-tree-component :id="id+'-class-tree'"></omdb-class-tree-component>
                                            </el-main>
                                            <el-footer style="height:30px;line-height:30px;padding:0 5px;">
                                            ${window.COMPANY_OSPACE} | ${window.SignedUser_UserName} | #{moment().format("LLL")}#
                                            </el-footer>
                                        </el-container>
                                    </el-aside>
                                    <el-main :id="id+'-main'" style="padding:0px;">
                                        <el-tabs v-model="main.activeIndex" type="border-card" closable @tab-remove="mainTabsRemove" @tab-click="mainTabsClick">
                                            <el-tab-pane
                                                :key="item.name"
                                                v-for="(item, index) in main.tabs"
                                                :name="item.name">
                                                <span slot="label">#{item.title}#</span>
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

                            self.splitInst = Split([`#${this.id}-aside`, `#${this.id}-main`], {
                                sizes: [20, 80],
                                minSize: [0, 0],
                                gutterSize: 3,
                                cursor: 'col-resize',
                                direction: 'horizontal',
                            });
                        },
                        mainTabsClick(tab, event) {
                            
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
                                    classList: fsHandler.callFsJScript("/entity/entity_class.js",encodeURIComponent("/")).message,
                                    defaultProps: {
                                        children: 'children',
                                        label: 'alias'
                                    },
                                    model: {
                                        ifData: false, 
                                        limit: 0,
                                        recursive: true,
                                        filetype: 'mql',
                                        template: true,
                                        class: selectedNode,
                                        ignoreClass: ''
                                    }
                                },
                                template: `<el-container style="height:100%;">
                                                <el-header style="height: 35px;line-height: 35px;padding: 0 5px;background: #f6f6f6;">
                                                    <el-switch v-model="model.ifData" active-text="导出数据" active-color="#13ce66" style="background: #f7f7f7;"></el-switch>
                                                    <el-switch v-model="model.filetype" 
                                                                active-text="导出MQL" inactive-text="导出Excel"
                                                                active-color="#13ce66"
                                                                active-value="mql" inactive-value="xlsx"
                                                                style="background: #f7f7f7;"></el-switch>
                                                </el-header>
                                                <el-main style="padding:10px;">
                                                    <el-tree
                                                        :data="classList"
                                                        show-checkbox
                                                        node-key="alias"
                                                        :default-expanded-keys="[_.first(classList).id]"
                                                        :default-checked-keys="[model.class]"
                                                        :default-expanded-keys="[model.class]"
                                                        :props="defaultProps"
                                                        check-on-click-node="true"
                                                        @node-click="onNodeClick"
                                                        style="background-color:transparent;">
                                                    </el-tree>
                                                </el-main>
                                                <el-footer style="height:40px;line-height:40px;text-align:right;">
                                                    <label style="float:left;">导出：#{model.class}#</label>
                                                    <el-button type="default" @click="onCancel">取消</el-button>
                                                    <el-button type="primary" @click="onExport">导出</el-button>
                                                </el-footer>
                                            </el-container>`,
                                methods:{
                                    onNodeClick(node){
                                        this.model.class = node.alias;
                                    },
                                    onCancel(){
                                        wnd.close();
                                    },
                                    onExport(){
                                        if(this.model.ifData){
                                            this.model.limit = -1;
                                        } else {
                                            this.model.limit = 0;
                                        }
                                        omdbHandler.classDataExport(this.model);
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