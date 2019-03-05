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
class Omdb extends Matrix {

    constructor() {
        super();
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
                        let self = this;

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
                        let self = this;

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


                        }
                    }
                };
            };

            let queryConsole = function(id, bid, template, event){

                let _readOnly = false;
                let _diff = null;

                if(!_.isEmpty(event.model.pnode)){
                    if(event.model.node.fieldsObj && event.model.pnode.fieldsObj) {
                        _diff = _.differenceBy(event.model.node.fieldsObj, event.model.pnode.fieldsObj, 'name');
                        event.model.node["fieldsObj"] = _.uniqBy(_diff,'name');
                    }
                }

                if(event.model.pattern === 'ddl') {
                    _readOnly = true;
                }

                return {

                    delimiters: ['${', '}'],
                    el: '#' + id,
                    template: `#query-console-template`,
                    data: {
                        id: id,
                        bid: bid,
                        model: {
                            oldInput: "",
                            newInput: "",
                            mode: "mql",
                            theme: "tomorrow",
                            printMargin: false,
                            readOnly: _readOnly,
                        },
                        keys: []
                    },
                    created: function(){
                        let self = this;

                        self.initKeys();
                    },
                    mounted: function () {
                        let self = this;

                        self.$nextTick(function () {
                            self.init();
                        })
                    },
                    methods: {
                        init: function(){
                            let self = this;

                            if(_.isEmpty(event.model.node)) return false;

                            let colms = _.without(event.model.node.fields,"_tokens") || event.model.node.fields;

                            let cls = "";
                            if(_.isEmpty(colms)){
                                cls = "*";
                            } else {
                                cls = colms.join(",");
                            }
                            let mql = "";

                            if(event.model.pattern === 'data') {
                                mql = `SELECT\n\t ${cls} \nFROM\n\t ${event.model.node.name} limit 50`;
                            } else if(event.model.pattern === 'select') {
                                mql = "SELECT\n\t " + cls + "\nFROM\n\t " + event.model.node.name;
                            } else if(event.model.pattern === 'insert') {
                                mql = "INSERT INTO " + event.model.node.name + "\n" + _.map(event.model.node.fields, function(v){return `${v}=''`;}).join(", ") + ";";
                            } else if(event.model.pattern === 'update') {
                                mql = "UPDATE " + event.model.node.name + "\nSET " + _.map(event.model.node.fields,function(v){return v+"=''";}).join(",") + "\nWHERE ";
                            } else if(event.model.pattern === 'delete') {
                                mql = "DELETE FROM\n\t " + event.model.node.name;
                            } else if(event.model.pattern === 'ddl') {

                                mql = "#DDL\nCREATE CLASS IF NOT EXISTS " + event.model.node.name + " (\n\t" + _.map(event.model.node.fieldsObj, function(v){ return `${v.name}  ${v.ftype}  '${v.title}'`;}).join(",\n\t") + "\n\tindexes(" + _.map(_.filter(event.model.node.fieldsObj,function(v){return v.isindex == 1;}),'name').join(",") + ")\n\tkeys(" + event.model.node.keys.join(",") + ")\n);";

                                _.forEach(self.keys,function(v){

                                    if(_.includes(v,'time')) {
                                        mql += `\n\n#${_.startCase(v)}\n${v}=${moment(event.model.node[v]).format("LLL")}`;
                                        return;
                                    }

                                    let _value = event.model.node[v];

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

                            } else if(event.model.pattern === 'create-class') {
                                let _rand = _.now();
                                mql = `CREATE CLASS IF NOT EXISTS  ${event.model.node.name}/new_${_rand}();`;
                                mql = _.replace(mql, "//", "/");
                            } else if(event.model.pattern === 'drop-class') {
                                mql = "DROP CLASS " + event.model.node.name + ";";
                            } else if(event.model.pattern === 'alter') {
                                mql = `#设置类属性`;

                                let _keys = _.remove(self.keys, function(v){
                                    return !_.includes(['cid','pid','fields','keys','mtime','fieldsObj','child', 'loption', 'subclass','vtimebase','tags', 'name'],v)
                                })

                                _.forEach(_keys,function(v){
                                    let _value = event.model.node[v];

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
                                        mql += `\n\n#${_.startCase(v)}\nALTER CLASS ${event.model.node.name} SET ${v}='${_value}';`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                                    } else {
                                        mql += `\n\n#${_.startCase(v)}\nALTER CLASS ${event.model.node.name} SET ${v}=${_value};`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                                    }
                                })
                            } else if(event.model.pattern === 'alter-add-column') {
                                mql = "ALTER CLASS " + event.model.node.name + " ADD COLUMN column_name type;\n\n";
                            } else if(event.model.pattern === 'alter-drop-column') {
                                mql = "ALTER CLASS " + event.model.node.name + " DROP COLUMN column_name;\n\n";
                            } else if(event.model.pattern === 'alter-add-index') {
                                mql = "ALTER CLASS " + event.model.node.name + " ADD INDEX index_name type;\n\n";
                            } else if(event.model.pattern === 'alter-drop-index') {
                                mql = "ALTER CLASS " + event.model.node.name + " DROP INDEX index_name type;\n\n";
                            } else if(event.model.pattern === 'alter-add-key') {
                                mql = "ALTER CLASS " + event.model.node.name + " ADD KEY key_name;\n\n";
                            } else if(event.model.pattern === 'alter-drop-key') {
                                mql = "ALTER CLASS " + event.model.node.name + " DROP KEY key_name;\n\n";
                            } else if(event.model.pattern === 'g') {  // edge  query
                                mql = `g.V(" ").In("${event.model.node.title}").All();`;
                            } else if(event.model.pattern === 'create-edge-type') {  // edge  new edge type
                                mql = `CREATE EDGE TYPE  type_name type_remedy;`;
                            } else if(event.model.pattern === 'drop-edge-type') {  // edge drop edge type
                                mql = `DROP EDGE TYPE ${event.model.node.title};`;
                            } else if(event.model.pattern === 'edge-insert') {  // edge  create
                                mql = `INSERT INTO class_name id="",${event.model.node.title}=[""];`;
                            } else if(event.model.pattern === 'edge-update') {  // edge  update
                                mql = `UPDATE class_name SET ${event.model.node.title}='' WHERE ID='';`;
                            } else if(event.model.pattern === 'edge-g') {  // edge query all
                                mql = GLOBAL_CONFIG.global.gremlin;
                            }

                            self.model.newInput = mql;
                        },
                        initKeys: function(){
                            let self = this;

                            let _rtn = omdbHandler.classList(-1);
                            self.keys = _.sortBy(_.keys(_.attempt(JSON.parse.bind(null, _rtn))[0]));
                        },
                        dropClass: function(){
                            let self = this;


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

            let graph = function(id, bid, node){

                let _data = {nodes:[], edges:[], paths: [], pathtags:[]};

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
                        let self = this;

                        //eventHub.$on(`NEW-QUERY-RESULT-TRIGGER-EVENT-${bid}`, self.setData);
                    },
                    mounted: function () {
                        let self = this;

                        self.$nextTick(function () {
                            self.init();
                        })
                    },
                    methods: {
                        init: function(){
                            let self = this;


                        },
                        setData: function(event){
                            let self = this;

                            self.model = event.data;
                        }
                    }
                };
            };

            let logConsole = function(id, bid, template, model){

                return {

                    delimiters: ['${', '}'],
                    el: '#' + id,
                    template: `#${template}-template`,
                    data: {
                        id: id,
                        bid: bid,
                        model: [],
                        theme: 'light',
                        debug: {
                            mql: [],
                            flag: [],
                            crontab: {
                                sched: '30 second',
                                timer: null
                            }
                        }
                    },
                    watch: {
                        'debug.mql': {
                            handler: function(val,oldVal){
                                let self = this;

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
                        let self = this;

                        eventHub.$on("LOG-CONSOLE-APPEND-EVENT", self.append);
                    },
                    mounted: function () {
                        let self = this;

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
                            let self = this;

                            self.model.push(self.log('info','加载完成'));

                            self.theme = localStorage.getItem("LOG-CONSOLE-THEME");

                        },
                        initPlugin: function(){
                            let self = this;

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
                            let self = this;

                            self.debugIt(self.debug.mql);
                        },
                        debugs: function(key){
                            let self = this;

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
                            let self = this;
                            let _log = null;

                            _log = self.log(level, event);

                            self.model.unshift(_log);

                            // $(".log-console-content").scrollTop(function() { return this.scrollHeight; });

                        },
                        log: function(level, event){
                            let self = this;
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
                            let self = this;

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
                            let self = this;

                            self.model = [];

                        },
                        debugIt: function(event){
                            let self = this;

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
                            let self = this;

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

            let appVue = new Vue({
                delimiters: ['${', '}'],
                el: '#app',
                data: {
                    layout: null,
                    id: null,
                    config: {
                        settings:{
                            showPopoutIcon: false,
                            showCloseIcon: false,
                            selectionEnabled: false,
                            constrainDragToContainer: false
                        },
                        dimensions:{
                            borderWidth:3
                        },
                        content: [{
                            type: 'row',
                            content:[
                                {
                                    type: 'stack',
                                    width: 18,
                                    content:[{
                                        id: 'class-tree',
                                        type: 'component',
                                        componentName: 'omdbComponent',
                                        title:`<i class="fas fa-sitemap"></i> 对象管理`,
                                        isClosable: false,
                                        componentState: {
                                            id: 'class-tree',
                                            type: 'class-tree',
                                            pattern: null,
                                            model: { pattern: '', node: null, pnode: null }
                                        }
                                    }]
                                },
                                {
                                    type: 'stack',
                                    content: [
                                        {
                                            type: 'column',
                                            title: '<i class="fas fa-laptop-code"></i> 查询',
                                            content:[{
                                                type: 'component',
                                                title: '',
                                                id: 'layout_search_no_header',
                                                componentName: 'omdbComponent',
                                                componentState: {
                                                    id: `div_query_000000`,
                                                    bid: `batch_000000`,
                                                    type: 'query-console',
                                                    model: { pattern: '', node: null, pnode: null }
                                                }
                                            },
                                                {
                                                    type: 'stack',
                                                    activeItemIndex: 1,
                                                    content: [
                                                        {
                                                            type: 'component',
                                                            title: `<i class="fas fa-newspaper"></i> 日志`,
                                                            componentName: 'omdbComponent',
                                                            componentState: {
                                                                id: `div_log_000000`,
                                                                bid: `batch_000000`,
                                                                type: 'log-console',
                                                                model: null
                                                            }
                                                        },
                                                        {
                                                            type: 'component',
                                                            title: `<i class="fas fa-list-alt"></i> 结果`,
                                                            componentName: 'omdbComponent',
                                                            componentState: {
                                                                id: `div_output_000000`,
                                                                bid: `batch_000000`,
                                                                type: 'output-console',
                                                                model: null
                                                            }
                                                        }]
                                                }]
                                        }]
                                }
                            ]
                        }]
                    }

                },
                created: function(){
                    let self = this;

                    eventHub.$on("OMDB-CLASS-TRIGGER-EVENT",self.addStackFromTree);
                    eventHub.$on("QUERY-RESULT-TRIGGER-EVENT", self.addStackFromQuery);

                    eventHub.$on("LAYOUT-RESIZE-EVENT",self.resizeLayout);
                },
                mounted: function() {
                    let self = this;

                    self.$nextTick(function() {
                        setTimeout(function () {
                            self.init();
                        });
                    })
                },
                methods: {
                    init: function(){
                        let self = this;

                        self.layout = new GoldenLayout(self.config, self.$el);

                        self.layout.registerComponent('omdbComponent', function (container, state) {

                            // console.log(state)

                        });


                        self.layout.on( 'stackCreated', function( stack ){

                            try {
                                if(stack.config.content[0].id === 'layout_search_no_header') {

                                    $(stack.element[0].childNodes[0]).remove();//css("display","none");

                                    _.delay(function(){
                                        //console.log($(stack.element[0])[0].style.height,$(stack.element[0])[0])
                                        self.resizeLayout();
                                    },1000)

                                }
                            }catch(error){

                            }

                        });

                        self.layout.on( 'itemCreated', function( item ){
                            // console.log('item',item.config)

                        });

                        self.layout.on( 'columnCreated', function( column ){
                            //console.log('column',column)

                        });

                        self.layout.on( 'componentCreated', function( component ){

                            let _state = component.config;
                            let _id = _state.componentState.id;
                            let _bid = _state.componentState.bid;

                            let html = `<div id="${_id}"></div>`;
                            let _comp = null;

                            component.container.getElement().html(html);

                            if(_state.componentState.type === 'class-tree'){

                                _comp = classTree(_id, _bid, _state.componentState.type, _state.componentState);

                            } else if(_state.componentState.type === 'class-edit'){

                                _comp = classEdit(_id, _bid, _state.componentState.type, _state.componentState);

                            } else if(_state.componentState.type === 'query-console'){

                                _comp = queryConsole(_id, _bid, _state.componentState.type, _state.componentState);

                            } else if(_state.componentState.type === 'output-console'){

                                _comp = outPut(_id, _bid, _state.componentState.model);


                            } else if(_state.componentState.type === 'text-console'){

                                _comp = textConsole(_id, _bid, _state.componentState.model);

                            } else if(_state.componentState.type === 'graph'){

                                _comp = graph(_id, _bid, _state.componentState.model);


                            } else if(_state.componentState.type === 'log-console'){

                                _comp = logConsole(_id, _bid, _state.componentState.type, _state.componentState);


                            } else if(_state.componentState.type === 'trigger-console'){

                                _comp = triggerConsole(_id, _bid, _state.componentState.model.node);

                            }

                            setTimeout(function(){
                                new Vue(_comp);
                            });

                            component.container.on('resize',function(event) {

                                // container height
                                window.layout_container_layoutHeight =  component.container.layoutManager.height - 80 - 20;
                                // container_top height
                                window.layout_container_topHeight =  window.layout_container_layoutHeight - component.container.height;
                                // container_bottom height
                                window.layout_container_bottomHeight =  component.container.height;

                                //console.log(_id, component.container.layoutManager.height, component.container.height, component.container.layoutManager.height - component.container.height)
                                // console.log(_id, window.layout_container_layoutHeight, window.layout_container_topHeight, window.layout_container_bottomHeight)
                                // container change trigger datatable redraw
                                eventHub.$emit(`LAYOUT-DATATABLE-RESIZE-EVENT-${_id}`, { container:window.layout_container_layoutHeight, top:window.layout_container_topHeight, bottom:window.layout_container_bottomHeight  });
                            });


                        });

                        //  Initialize GL
                        self.layout.init();

                        //  Update GL on window resize
                        window.addEventListener('resize', function () { self.layout.updateSize(); });

                    },
                    resetLayout: function () {
                        localStorage.removeItem('savedState');
                        window.location.reload(true);
                    },
                    resizeLayout: function(){
                        let self = this;

                        self.layout.updateSize();
                    },
                    addStackFromTree: function( event ) {
                        let self = this;

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

                    },
                    addStackFromQuery: function( event ) {
                        let self = this;

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
                                    model: null
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
                        },500)

                    }
                }
            });

        })
    }
}

let omdb = new Omdb();
omdb.init();