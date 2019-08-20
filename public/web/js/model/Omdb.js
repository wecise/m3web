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

        //function(id, bid, template, model)
        Vue.component("omdb-log-console",{
            delimiters: ['#{', '}#'],
            props:{
                id: String,
                model: Array
            },
            template:   `<div :class="'log-console '+ theme">
                            <div class="logToolBar">
                                <div class="btn-group" role="group" aria-label="...">
                                    <a href="javascript:void(0);" class="btn btn-sm btn-primary toggle" @click="toggleTheme" title="切换主题" data-tooltip="tooltip"><i class="fas fa-sun"></i></a>
                                    <a href="javascript:void(0);" class="btn btn-sm btn-primary copy" @click="copyIt" title="复制" data-tooltip="tooltip"><i class="fa fa-copy"></i></a>
                                    <a href="javascript:void(0);" class="btn btn-sm btn-primary clear" @click="clearIt" title="清空" data-tooltip="tooltip"><i class="fa fa-trash"></i></a>
                                    <a href="javascript:void(0);" class="btn btn-sm btn-primary debug" @click="debugIt" title="调试" data-tooltip="tooltip"><i class="fa fa-desktop"></i></a>
                                </div>
                            </div>
                            <div contenteditable="true" :class="'log-console-content '+ theme" v-if="!_.isEmpty(model)">
                                <p v-for="item in model"> [#{item[0]}#] [<span :class="'log-severity '+item[1]">#{item[1]}#</span>] <span v-if="_.isEmpty(item[2].content)">#{item[2].short}#</span><span v-else><a data-toggle="collapse" :href="'#'+item[2].id" aria-expanded="false" :aria-controls="item[2].id">#{item[2].short}#</a><span class="collapse animated fadeInUp" :id="item[2].id">#{item[2].content}#</span></span>
                                </p>
                            </div>
                        </div>`,
            data(){
                return {
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
                }
            },
            created: function(){
                const self = this;

                eventHub.$on("LOG-CONSOLE-APPEND-EVENT", self.append);
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
                init: function(){
                    const self = this;

                    self.model.push(self.log('info','加载完成'));

                    self.theme = localStorage.getItem("LOG-CONSOLE-THEME");

                },
                initPlugin: function(){
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
                refresh: function(){
                    const self = this;

                    self.debugIt(self.debug.mql);
                },
                debugs: function(key){
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
                append: function(level, event){
                    const self = this;
                    let _log = null;

                    _log = self.log(level, event);

                    self.model.unshift(_log);

                    // $(".log-console-content").scrollTop(function() { return this.scrollHeight; });

                },
                log: function(level, event){
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
                copyIt: function(event){
                    const self = this;

                    new Clipboard(".copy", {
                        text: function(trigger) {
                            alertify.log("已复制");
                            let _rtn = _.map(self.model,function(v){
                                return [v[0],v[1],v[2].short + v[2].content];
                            });
                            return _rtn.join("\n");
                        }
                    });

                },
                clearIt: function(){
                    const self = this;

                    self.model = [];

                },
                debugIt: function(event){
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

                            self.model.unshift(_log);
                        })
                    })

                },
                toggleTheme: function(){
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

        Vue.component("omdb-query-console",{
            delimiters: ['${', '}'],
            props: {
                id: String,
                node: Object
            },
            template: `<el-container style="height:calc(100vh - 110px);">
                            <el-header :id="id+'-header'" style="padding:0px;">
                                <omdb-editor-component :id="id" :bid="id"
                                :model="model"
                                showToolsBar="true"
                                showStatusBar="true"></omdb-editor-component>
                            </el-header>
                            <el-main :id="id+'-main'" style="padding:0px;">
                                <el-tabs v-model="main.activeIndex" type="border-card">
                                    <el-tab-pane
                                        :key="item.name"
                                        v-for="(item, index) in main.tabs"
                                        :label="item.title"
                                        :name="item.name">
                                        <omdb-log-console :id="id+'-log-'+item.name" :node="item.model"></omdb-log-console>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-main>
                        </el-container>`,
            data(){
                return {
                    main: {
                        tabs: [
                                {title: '日志', name: `log`, type: 'omdb-log-console', model: {node:null, pnode:null, pattern: null}}
                            ],
                        activeIndex: 'log'
                    },
                    model: {
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

                if(!_.isEmpty(self.node.pnode)){
                    if(self.node.node.fieldsObj && self.node.pnode.fieldsObj) {
                        _diff = _.differenceBy(self.node.node.fieldsObj, self.node.pnode.fieldsObj, 'name');
                        self.node.node["fieldsObj"] = _.uniqBy(_diff,'name');
                    }
                }

                if(self.node.pattern === 'ddl') {
                    self.model.readOnly = true;
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
                    Split([`#${self.id+'-header'}`, `#${self.id+'-main'}`], {
                        sizes: [60, 40],
                        minSize: [0, 0],
                        gutterSize: 5,
                        cursor: 'col-resize',
                        direction: 'vertical',
                    });

                    if(_.isEmpty(self.node.node)) return false;

                    let colms = _.without(self.node.node.fields,"_tokens") || self.node.node.fields;

                    let cls = "";
                    if(_.isEmpty(colms)){
                        cls = "*";
                    } else {
                        cls = colms.join(",");
                    }
                    let mql = "";

                    if(self.node.pattern === 'data') {
                        mql = `SELECT\n\t ${cls} \nFROM\n\t ${self.node.node.name} limit 50`;
                    } else if(self.node.pattern === 'select') {
                        mql = "SELECT\n\t " + cls + "\nFROM\n\t " + self.node.node.name;
                    } else if(self.node.pattern === 'select-edge') {
                        mql = "SELECT\n\t " + cls + "\nFROM\n\t " + self.node.node.name.split("[")[0];
                    } else if(self.node.pattern === 'insert') {
                        mql = "INSERT INTO " + self.node.node.name + "\n" + _.map(self.node.node.fields, function(v){return `${v}=''`;}).join(", ") + ";";
                    } else if(self.node.pattern === 'update') {
                        mql = "UPDATE " + self.node.node.name + "\nSET " + _.map(self.node.node.fields,function(v){return v+"=''";}).join(",") + "\nWHERE ";
                    } else if(self.node.pattern === 'delete') {
                        mql = "DELETE FROM\n\t " + self.node.node.name;
                    } else if(self.node.pattern === 'ddl') {

                        mql = "#DDL\nCREATE CLASS IF NOT EXISTS " + self.node.node.name + " (\n\t" + _.map(self.node.node.fieldsObj, function(v){ return `${v.name}  ${v.ftype}  '${v.title}'`;}).join(",\n\t") + "\n\tindexes(" + _.map(_.filter(self.node.node.fieldsObj,function(v){return v.isindex == 1;}),'name').join(",") + ")\n\tkeys(" + self.node.node.keys.join(",") + ")\n);";

                        _.forEach(self.keys,function(v){

                            if(_.includes(v,'time')) {
                                mql += `\n\n#${_.startCase(v)}\n${v}=${moment(self.node.node[v]).format("LLL")}`;
                                return;
                            }

                            let _value = self.node.node[v];

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

                    } else if(self.node.pattern === 'create-class') {
                        let _rand = _.now();
                        mql = `CREATE CLASS IF NOT EXISTS  ${self.node.node.name}/new_${_rand}();`;
                        mql = _.replace(mql, "//", "/");
                    } else if(self.node.pattern === 'drop-class') {
                        mql = "DROP CLASS IF NOT EXISTS " + self.node.node.name + ";";
                    } else if(self.node.pattern === 'alter') {
                        mql = `#设置类属性`;

                        let _keys = _.remove(self.keys, function(v){
                            return !_.includes(['cid','pid','fields','keys','mtime','fieldsObj','child', 'loption', 'subclass','vtimebase','tags', 'name'],v)
                        })

                        _.forEach(_keys,function(v){
                            let _value = self.node.node[v];

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
                                mql += `\n\n#${_.startCase(v)}\nALTER CLASS ${self.node.node.name} SET ${v}='${_value}';`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                            } else {
                                mql += `\n\n#${_.startCase(v)}\nALTER CLASS ${self.node.node.name} SET ${v}=${_value};`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                            }
                        })
                    } else if(self.node.pattern === 'alter-add-column') {
                        mql = "ALTER CLASS " + self.node.node.name + " ADD COLUMN column_name type;\n\n";
                    } else if(self.node.pattern === 'alter-drop-column') {
                        mql = "ALTER CLASS " + self.node.node.name + " DROP COLUMN column_name;\n\n";
                    } else if(self.node.pattern === 'alter-add-index') {
                        mql = "ALTER CLASS " + self.node.node.name + " ADD INDEX index_name type;\n\n";
                    } else if(self.node.pattern === 'alter-drop-index') {
                        mql = "ALTER CLASS " + self.node.node.name + " DROP INDEX index_name type;\n\n";
                    } else if(self.node.pattern === 'alter-add-key') {
                        mql = "ALTER CLASS " + self.node.node.name + " ADD KEY key_name;\n\n";
                    } else if(self.node.pattern === 'alter-drop-key') {
                        mql = "ALTER CLASS " + self.node.node.name + " DROP KEY key_name;\n\n";
                    } else if(self.node.pattern === 'g') {  // edge  query
                        mql = `g.V(" ").In("${self.node.node.title}").All();`;
                    } else if(self.node.pattern === 'create-edge-type') {  // edge  new edge type
                        mql = `CREATE EDGE TYPE  type_name 'type_remedy';`;
                    } else if(self.node.pattern === 'drop-edge-type') {  // edge drop edge type
                        mql = `DROP EDGE TYPE ${self.node.node.title};`;
                    } else if(self.node.pattern === 'edge-insert') {  // edge  create
                        mql = `INSERT INTO class_name id="",${self.node.node.title}=[""];`;
                    } else if(self.node.pattern === 'edge-update') {  // edge  update
                        mql = `UPDATE class_name SET ${self.node.node.title}='' WHERE ID='';`;
                    } else if(self.node.pattern === 'edge-g') {  // edge query all
                        mql = GLOBAL_CONFIG.global.gremlin;
                    }

                    self.model.newInput = mql;
                },
                initKeys: function(){
                    const self = this;

                    let rtn = omdbHandler.classList(-1)[0];
                    console.log(rtn, _.sortBy(_.keys(rtn)))
                    self.keys = _.sortBy(_.keys(rtn));
                },
                dropClass: function(){
                    const self = this;


                }
            }
        })

        VueLoader.onloaded([
            "omdb-path-datatables-component",
            "omdb-output-datatables-component",
            "omdb-class-datatables-component",
            "omdb-class-tree-component",
            "omdb-editor-component",
            "omdb-graph-component",
            "omdb-trigger-editor-component",
            "ai-robot-component"], function() {

            let classTree = function(id, bid, template, event){

                return {
                    delimiters: ['${', '}'],
                    el: '#' + id,
                    template: `#${template}-template`,
                    data: {
                        id: id,
                    },
                    mounted: function() {
                        const self = this;

                        self.$nextTick(function() {
                            $(self.$el).click(function(){
                                self.click();
                            })
                        })
                    },
                    methods: {
                        click: function(){

                        }
                    }
                };
            };

            let classEdit = function(id, bid, template, event){

                let _dataset = [];
                let _columns = [];

                _columns = [
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
                
                if(!_.isEmpty(event.model.node.fieldsObj) && !_.isEmpty(event.model.pnode.fieldsObj)) {

                    let _node = _.cloneDeep(event.model.node.fieldsObj);
                    let _pnode = _.cloneDeep(event.model.pnode.fieldsObj);

                    if(event.model.node.fieldsObj == event.model.pnode.fieldsObj) {
                        _dataset = _.map(event.model.node.fieldsObj, function (v) {
                            return _.merge(v, {icon: 'parent'});
                        });
                    } else {
                        let _diff =  _.differenceWith(event.model.node.fieldsObj, event.model.pnode.fieldsObj, function(v1,v2){return v1.name === v2.name;});

                        if(_.isEmpty(_diff)){
                            _dataset = _.map(_node, function (v) {
                                return _.merge(v, {icon: 'parent'});
                            });

                        } else {
                            _dataset = _.concat(_.map(_pnode,function(v){return _.merge(v, {icon: 'parent'});}), _.map(_diff,function(v){return _.merge(v, {icon: 'child'});}));
                        }
                    }
                } else{
                    _dataset = _.map(event.model.node.fieldsObj, function (v) {
                        return _.merge(v, {icon: 'parent'});
                    });
                }

                _dataset = _.map(_.uniqBy(_dataset,'name'),function(v){
                    if(_.indexOf(event.model.node.keys,v.name) > -1){
                        _.extend(v,{iskey:1});
                    }
                    return v;
                });

                _columns = _.uniqBy(_columns, 'field');

                return {

                    delimiters: ['${', '}'],
                    el: '#' + id,
                    template: `#${template}-template`,
                    data: {
                        id: id,
                        bid: bid,
                        model: {
                            dataset: _dataset,
                            columns: _columns,
                            options: {
                                info:true,
                                scrollY: '282px',
                                searching: false,
                                rowCallback: function( row, data ) {
                                    if( data.icon === "parent" ) {
                                        $('td', row).css('background-color', '#f9f9f9');
                                    }
                                }
                            }
                        },
                        result: event.model.node
                    },
                    created: function(){
                        const self = this;

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


                        }
                    }
                };
            };

            

            let outPutByJson = function(id, bid, json){

                let content = null;

                if(!_.isEmpty(json)) {
                    content = json.data;
                }

                return {

                    delimiters: ['#{', '}#'],
                    el: '#' + id,
                    template: `<el-container style="height: 48vh;">
                                    <el-main style="padding:0px;">
                                        <pre style="background:transparent;border:none;">#{JSON.stringify(model,null,4).replace(/   /g, ' ')}#</pre>
                                    </el-main>
                                </el-container>`,
                    data: {
                        id: id,
                        bid: bid,
                        model: null
                    },
                    created: function(){
                        const self = this;

                        eventHub.$on(`QUERY-JSON-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
                        eventHub.$on(`NEW-QUERY-JSON-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
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
                };
            };

            let outPut = function(id, bid, node){

                //if(_.isEmpty(node)) return false;
                
                let _dataset = [];
                let _columns = [];
                let _node = {};

                if(!_.isEmpty(node)) {
                    _dataset = node.data;//[_.keys(node.columns)[0]];
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
                    template: `#output-console-template`,
                    data: {
                        id: id,
                        bid: bid,
                        model: {
                            dataset: _dataset,
                            columns: _columns,
                            options: {
                                info:true,
                                scrollY: '148px',
                                searching: false,
                            }
                        },
                        result: _node
                    },
                    created(){
                        const self = this;

                        eventHub.$on("LAYOUT-RESIZE-TRIGGER-EVENT", self.setScrollY);

                        eventHub.$on(`QUERY-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
                        eventHub.$on(`NEW-QUERY-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
                    },
                    mounted() {
                        const self = this;

                        self.$nextTick(function() {
                            self.init();
                        })
                    },
                    methods: {
                        init(){
                            const self = this;

                            if(!_.isEmpty(node)) {
                                self.model.dataset = self.result.data;//[_.keys(self.result.columns)[0]];
                                self.model.columns = self.result.columns[_.keys(self.result.columns)[0]];
                            } else {
                                self.model.dataset = [];
                                self.model.columns = [];
                            }

                        },
                        setData(event){
                            const self = this;

                            self.model.dataset = event.data;//[_.keys(event.columns)[0]] || [];
                            self.model.columns = event.columns[_.keys(event.columns)[0]] || [];
                            self.result = event;

                        },
                        setScrollY(event){
                            const self = this;

                            self.model.options.scrollY = event.scrollY;
                        }
                    }
                };
            };

            let graph = function(id, bid, node){

                let _data = {nodes:[], edges:[], paths: [], pathtags:[], diff:{}};

                if(!_.isEmpty(node)){
                    _data.nodes = node.nodes;
                };

                if(!_.isEmpty(node.edges)){
                    _data.edges = node.edges;
                };

                if(!_.isEmpty(node.paths)){
                    _data.paths = node.paths;
                };

                if(!_.isEmpty(node.pathtags)){
                    _data.pathtags = node.pathtags;
                };

                if(!_.isEmpty(node.diff)){
                    _data.diff = node.diff;
                };

                return {

                    delimiters: ['${', '}'],
                    el: '#' + id,
                    template: '#graph-template',
                    data: {
                        id: id,
                        bid: bid,
                        model: _data,
                    },
                    created: function(){
                        const self = this;

                        //eventHub.$on(`NEW-QUERY-RESULT-TRIGGER-EVENT-${bid}`, self.setData);
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


                        },
                        setData: function(event){
                            const self = this;

                            self.model = event.data;
                        }
                    }
                };
            };

            

            let textConsole = function(id, bid, model){

                return {

                    delimiters: ['${', '}'],
                    el: '#' + id,
                    template: `#text-console-template`,
                    data: {
                        id: id,
                        bid: bid,
                        output: model
                    }
                };
            };

            let triggerConsole = function(id, bid, node){

                let _readOnly = false;

                return {
                    delimiters: ['${', '}'],
                    el: '#' + id,
                    template: "#trigger-template",
                    data: {
                        id: id,
                        className: node,
                        editor: {
                            mode: "lua",
                            theme: "tomorrow",
                            readOnly: _readOnly,
                        }
                    }
                };
            };

            $(function() {

                // 主管理页 包括：查询 日志 结果
                Vue.component("omdb-main-view",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            // 布局
                            layout:{
                                tabIndex: 1,
                                activeIndex: '1',
                                tabs:[
                                    {name: 'event-view-console', title:'日志', type: 'main'}
                                ]
                            },
                            splitUpBottom: 0.5
                        }
                    },
                    template:   `<el-container style="height: 75vh;">
                                    
                                    <el-main>
                                        <Split v-model="splitUpBottom">
                                            <div slot="top">
                                                
                                            </div>
                                            <div slot="bottom">
                                                
                                            </div>
                                        </Split>
                                    </el-main>
                                    
                                </el-container>`
                })
                
                odb.app = new Vue({
                    delimiters: ['#{', '}#'],
                    template:   `<el-container style="calc(100vh - 140px);">
                                    <el-aside :id="id+'-aside'">
                                        <omdb-class-tree-component :id="id+'-class-tree'"></omdb-class-tree-component>
                                    </el-aside>
                                    <el-main :id="id+'-main'" style="padding:0px;">
                                        <el-tabs v-model="main.activeIndex" type="border-card">
                                            <el-tab-pane
                                                :key="item.name"
                                                v-for="(item, index) in main.tabs"
                                                :label="item.title"
                                                :name="item.name">
                                                <omdb-query-console :id="id+'-'+item.name" :node="item.model"></omdb-query-console>
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
                    created: function(){
                        const self = this;
    
                        eventHub.$on("OMDB-CLASS-TRIGGER-EVENT",self.addStackFromTree);
                        eventHub.$on("QUERY-RESULT-TRIGGER-EVENT", self.addStackFromQuery);
                        eventHub.$on("QUERY-JSON-RESULT-TRIGGER-EVENT", self.addStackFromQuery);
                    },
                    mounted: function() {
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
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal',
                            });
                        },
                        addStackFromTree( event ) {
                            const self = this;

                            try{
                                let _bid = `batch_${_.now()}`;
    
                                let newItemConfig = {
                                    type: 'column',
                                    title: `<i class="fas fa-laptop-code"></i> ${event.title}`,
                                    content:[{
                                        type: 'component',
                                        height:50,
                                        title: `<i class="fas fa-laptop-code"></i> ${event.title}`,
                                        id: 'layout_search_no_header',
                                        componentName: 'omdbComponent',
                                        componentState: {
                                            id: `div_query_${_.now()}`,
                                            bid: _bid,
                                            type: event.type,
                                            model: event.model
                                        }
                                    },{
                                        type: 'stack',
                                        height:50,
                                        activeItemIndex: 1,
                                        content: [{
                                            type: 'component',
                                            title: `<i class="fas fa-newspaper"></i> 日志`,
                                            componentName: 'omdbComponent',
                                            componentState: {
                                                id: `div_log_${_.now()}`,
                                                bid: _bid,
                                                type: 'log-console',
                                                model: null
                                            }
                                        },{
                                            type: 'component',
                                            title: `<i class="fas fa-list-alt"></i> 结果`,
                                            componentName: 'omdbComponent',
                                            componentState: {
                                                id: `div_output_${_.now()}`,
                                                bid: _bid,
                                                type: 'output-console',
                                                model: null
                                            }
                                        }]
                                    }]
                                };
        
                                if(_.includes(['trigger-console','class-edit'],event.type)){
                                    newItemConfig = {
                                        type: 'column',
                                        title: `<i class="fas fa-table"></i> ${event.title}`,
                                        content:[{
                                            type: 'component',
                                            title: event.title,
                                            id: 'layout_search_no_header',
                                            height:55,
                                            componentName: 'omdbComponent',
                                            componentState: {
                                                id: `div_query_${_.now()}`,
                                                bid: _bid,
                                                type: event.type,
                                                model: event.model
                                            }
                                        },{
                                            type: 'stack',
                                            height:45,
                                            content: [{
                                                type: 'component',
                                                title: `<i class="fas fa-newspaper"></i> 日志`,
                                                componentName: 'omdbComponent',
                                                componentState: {
                                                    id: `div_log_${_.now()}`,
                                                    bid: _bid,
                                                    type: 'log-console',
                                                    model: null
                                                }
                                            }]
                                        }]
                                    };
                                }
        
                                if(_.size($(`li[title="${event.title}"]`)) > 0 ){
                                    //return false;
                                }
        
                                self.layout.root.contentItems[0].contentItems[1].addChild(newItemConfig);

                            } catch(err){

                            }
    
                        },
                        addStackFromQuery( event ) {
                            const self = this;
                            
                            try {

                                let _bid = `batch_${_.now()}`;
    
                                if(event.type == "table-update"){
                                    let newItemConfig =  {
                                        type: 'component',
                                        title: `<i class="fas fa-list-alt"></i> 结果_${moment().format("LT")}`,
                                        componentName: 'omdbComponent',
                                        componentState: {
                                            id: `div_output_${_.now()}`,
                                            bid: event.bid,
                                            type: 'output-console',
                                            model: event.model
                                        }
                                    };
                                    self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].removeChild(self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].contentItems[1]);
                                    self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].addChild(newItemConfig);
                                }

                                if(event.type == "json-update"){
                                    let newItemConfig =  {
                                        type: 'component',
                                        title: `<i class="fas fa-list-alt"></i> 结果_${moment().format("LT")}`,
                                        componentName: 'omdbComponent',
                                        componentState: {
                                            id: `div_output_${_.now()}`,
                                            bid: event.bid,
                                            type: 'output-json-console',
                                            model: event.model
                                        }
                                    };
                                    self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].removeChild(self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].contentItems[1]);
                                    self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].addChild(newItemConfig);
                                }
        
                                if(event.type == "graph-update"){
        
                                    let newItemConfig =  {
                                        type: 'component',
                                        title: `<i class="fas fa-list-alt"></i> 结果_${moment().format("LT")}`,
                                        componentName: 'omdbComponent',
                                        componentState: {
                                            id: `div_output_${_.now()}`,
                                            bid: event.bid,
                                            type: 'graph',
                                            model: event.data
                                        }
                                    };
        
                                    self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].removeChild(self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].contentItems[1]);
                                    self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].addChild(newItemConfig);
        
                                }
        
                                if(event.type == "text-console"){
        
                                    let newItemConfig =  {
                                        type: 'component',
                                        title: `<i class="fas fa-list-alt"></i> 结果_${moment().format("LT")}`,
                                        componentName: 'omdbComponent',
                                        componentState: {
                                            id: `div_output_${_.now()}`,
                                            bid: event.bid,
                                            type: 'text-console',
                                            model: event.data
                                        }
                                    };
                                    self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].removeChild(self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].contentItems[1]);
                                    self.layout.root.contentItems[0].contentItems[1].getActiveContentItem().contentItems[1].addChild(newItemConfig);
                                }
        
                                _.delay(function(){
                                    eventHub.$emit(`NEW-QUERY-RESULT-TRIGGER-EVENT-${event.bid}`, event);
                                    eventHub.$emit(`NEW-QUERY-JSON-RESULT-TRIGGER-EVENT-${event.bid}`, event);
                                },500)

                            } catch (err){

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
                                        class: selectedNode
                                    }
                                },
                                template: `<el-container style="height:100%;">
                                                <el-header style="height: 45px;line-height: 45px;padding: 0 5px;">
                                                    <el-switch v-model="model.ifData" active-text="导出数据" style="background: #f7f7f7;"></el-switch>
                                                    <el-switch v-model="model.filetype" 
                                                                active-text="导出MQL" inactive-text="导出Excel"
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