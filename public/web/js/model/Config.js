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
class Config {

    constructor() {
        this.app = null;
    }

    init() {
        VueLoader.onloaded(["ai-robot-component","dropdown-tree-component"], function () {

            
            $(function () {
                
                Vue.component('config-tree-component',{
                    delimiters: ['${', '}'],
                    template: '<ul class="ztree" :id="id" style="overflow:auto;"></ul>',
                    props: {
                        id: String,
                        zNodes: Object,
                    },
                    data: function(){
                        return {
                            zTree: Object,
                            setting: {
                                edit: {
                                    enable: false
                                },
                                callback: {
                                    
                                },
                                data: {
                                    simpleData: {
                                        enable: true
                                    },
                                    key: {
                                        name: "key",
                                        children: "nodes"
                                    }
                                },
                                view: {
                                    showTitle: true,
                                    addDiyDom: this.addCountDom,
                                    removeHoverDom: this.removeHoverDom,
                                }
                            },
                            selectedNodeName: ""
                        }
                    },
                    created: function(){
                        const self = this;
    
                        eventHub.$on("CONFIG-TREE-REFRESH-EVENT",self.refresh);
                    },
                    mounted: function() {
                        const self = this;
    
                        self.$nextTick(function(){
                            self.setting.callback.onClick = self.zTreeOnClick;
                            self.setting.callback.onExpand = self.zTreeOnExpand;
                            //self.setting.view.addDiyDom = self.addDiyDom;
                        })
                    },
                    watch: {
                        setting: function(val){
                            const self = this;
    
                            self.zTree = $.fn.zTree.init($(self.$el), val, self.zNodes);
                        },
                        zNodes: function(val,oldVal){
                            const self = this;
    
                            $.fn.zTree.init($(self.$el), self.setting, val);
                            self.zTree = $.fn.zTree.getZTreeObj(self.id);
                            var nodes = self.zTree.getNodes();
                            if (nodes.length > 0) {
                                self.zTree.expandNode(nodes[0], true, false, true);
                            }
                        }
                    },
                    methods: {
                        zTreeOnExpand: function (event, treeId, treeNode) {
                            if (treeNode.dir) {
                                treeNode.isParent = true;
                            } else {
                                treeNode.isParent = false;
                            }
                        },
                        zTreeOnClick: function (event, treeId, treeNode, clickFlisParentag) {
                            
                            const self = this;

                            self.$root.configTreeSelectedNode = treeNode;

                            let node = self.zTree.getSelectedNodes();
                            
                            //$("[title='" + self.selectedNodeName + "']").removeClass('curSelectedNode');
                            self.selectedNodeName = treeNode.key;

                            let rtn = configHandler.configGet(treeNode.key);
                            if(rtn){
                                self.zTree.removeChildNodes(node[0]);
                                self.zTree.addNodes(treeNode, rtn.nodes);
                            }


                            // 右键菜单
                            let sObj = $("#" + treeNode.tId + "_span");
                            let scObj = $("#" + treeNode.tId + "_a").find(".count");
                            
                            if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;

                            let addStr = `<div class="well config-toolbars" id="toolbars_${treeNode.tId}" >
                                                <span class="button class add" id="addBtn_${treeNode.tId}" title="新建" ></span>
                                                <span class="button class edit" id="editBtn_${treeNode.tId}" title="编辑" ></span>
                                                <span class="button class remove" id="removeBtn_${treeNode.tId}" title="删除"  ></span>
                                        </div>`;

                            if(scObj.length > 0){
                                scObj.after(addStr);
                            } else {
                                sObj.after(addStr);
                            }

                            // add
                            let btnAdd = $("#addBtn_"+treeNode.tId);
                            if (btnAdd) btnAdd.bind("click", function(event){

                                event.stopPropagation();
                                event.preventDefault();

                                /**
                                 * @todo  新建键值
                                 */
                                self.$root.configNew();

                            });

                            // edit
                            let btnEdit = $("#editBtn_"+treeNode.tId);
                            if (btnEdit) btnEdit.bind("click", function(event){

                                event.stopPropagation();
                                event.preventDefault();

                                /**
                                 * @todo  赋键值
                                 */
                                eventHub.$emit('CONFIG-TREE-CLICK-EVENT', treeNode);

                            });

                            // remove
                            let btnRemove = $("#removeBtn_"+treeNode.tId);
                            if (btnRemove) btnRemove.bind("click", function(event){

                                event.stopPropagation();
                                event.preventDefault();

                                /**
                                 * @todo  删除键值
                                 */
                                self.$root.configDelete();

                            });
                        },
                        refresh: function () {
                            let self = this;
    
                            var treeObj = $.fn.zTree.getZTreeObj(self.id);
                            var sNodes = treeObj.getSelectedNodes();
    
                            if (sNodes.length > 0) {
                                var pNode = sNodes[0].getParentNode() || sNodes[0];
                                
                                jQuery.ajax({
                                    url: '/config/get',
                                    type: 'GET',
                                    dataType: 'json',
                                    data: {
                                        key: pNode.key
                                    },
                                    beforeSend: function(xhr) {
                                    },
                                    complete: function(xhr, textStatus) {
                                    },
                                    success: function(data, textStatus, xhr) {
                                        /**
                                         * @todo  刷新当前节点结构
                                         */
                                        self.zTree.removeChildNodes(pNode);
                                        var rtn = JSON.parse(JSON.stringify(data).replace(new RegExp('"dir":true', 'gm'), '"isParent":true,"dir":true'));
                                        self.zTree.addNodes(pNode, eval(rtn.message.nodes));
                                        /**
                                         * @todo  选中当前节点
                                         */
                                        $("[title='" + self.selectedNodeName + "']").addClass('curSelectedNode');
                                    },
                                    error: function(xhr, textStatus, errorThrown) {
                                    }
                                })
                            } 
                        },
                        addDiyDom: function (treeId, treeNode) {
                            let self = this;
                            let aObj = $("#" + treeNode.tId + "_a");
                            
                            if (treeNode.isParent){
                                let str = "<span>["+treeNode.nodes.length+"]</span>";
                                aObj.append(str);
                            } 
                        },
                        addCountDom: function (treeId, treeNode) {
                            const self = this;
                            let aObj = $("#" + treeNode.tId + "_a");

                            if (treeNode.isParent){
                                try{
                                    let str = `<span class='${treeNode.name} count' style='color:rgb(160,160,160);'>(${treeNode.nodes.length})</span>`;
                                    aObj.append(str);
                                } catch(err){
                                    let str = `<span class='${treeNode.name} count' style='color:rgb(160,160,160);'>(0)</span>`;
                                    aObj.append(str);
                                }
                                
                            }
                        },
                        removeHoverDom: function (treeId, treeNode) {
                            $("#toolbars_"+treeNode.tId).unbind().remove();
                        }
                    }
                })

                // 日志
                Vue.component('config-log-console',{
                    delimiters: ['${', '}'],
                    props: {
                        //规则名称
                        id: String   
                    },
                    template:   `<el-container>
                                    <el-header style="height:30px;line-height:30px;padding:0px;">
                                        <el-tooltip content="清空" open-delay="500" placement="top">
                                            <el-button type="text" @click="onReset"><i class="fas fa-trash"></i></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="重新加载" open-delay="500" placement="top">
                                            <el-button type="text" @click="onLoad"><i class="fas fa-sync"></i></el-button>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main>
                                        <el-table :data="rows" style="width: 100%" max-height="200" stripe :default-sort="{prop: 'vtime', order: 'descending'}" 
                                                :row-class-name="rowClassName"
                                                :header-cell-style="headerRender"
                                                @selection-change="handleSelectionChange">
                                            <el-table-column type="selection" width="55"></el-table-column>                                                
                                            <el-table-column :label="item.title" 
                                                            :prop="item.data" 
                                                            v-for="(item,index) in columns" 
                                                            :formatter="item.render" 
                                                            sortable 
                                                            :width="item.width"
                                                            v-if="item.visible">
                                            </el-table-column>
                                            <!--el-table-column align="right">
                                                <template slot="header" slot-scope="scope">
                                                    <el-input size="mini" placeholder="输入关键字搜索"/>
                                                </template>
                                            </el-table-column-->
                                        </el-table>
                                    </el-main>
                                </el-container>`,
                    data(){
                        return {
                            rows: [],
                            columns: [],
                            selectedRows: [],
                            ifDeleteVersionData: false
                        }
                    },
                    created(){
                        
                        fsHandler.callFsJScriptAsync("/matrix/config/log-by-name.js", encodeURIComponent(this.id)).then( (val)=>{
                            let rtn = val.message;

                            this.rows = rtn.rows;
                            this.columns = _.map(rtn.columns,function(v){
                                                if(v.render){
                                                    v.render = eval(v.render);
                                                }
                                                return v;
                                            });
                        } );
                        
                        
                        // 更新DataTable
                        eventHub.$on("CONFIG-LOG-UPDATE-EVENT",()=>{
                            fsHandler.callFsJScriptAsync("/matrix/config/log-by-name.js", encodeURIComponent(this.id)).then( (val)=>{
                                let rtn = val.message;
                                this.rows = rtn.rows;
                            } );
                        })
                    },
                    methods:{
                        rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0) {
                                //return 'text-align:center;';
                            }
                        },
                        onReset(){
                            let item = {class:"/matrix/consolelog/", ids: _.map(this.selectedRows,'id').join("', '"), ifDeleteVersionData: self.ifDeleteVersionData}
                            fsHandler.callFsJScriptAsync("/matrix/config/action-by-delete.js",encodeURIComponent(JSON.stringify(item))).then( ()=>{
                                fsHandler.callFsJScriptAsync("/matrix/config/log-by-name.js", encodeURIComponent(this.id)).then( (val)=>{
                                    let rtn = val.message;
                                    this.rows = rtn.rows;
                                } );
                            } );
                        },
                        onLoad(){
                            fsHandler.callFsJScriptAsync("/matrix/config/log-by-name.js", encodeURIComponent(this.id)).then( (val)=>{
                                let rtn = val.message;
                                this.rows = rtn.rows;
                            } );
                        },
                        handleSelectionChange(val) {
                            this.selectedRows = val;
                        }
                    }
                })

                // 调试
                Vue.component('config-debug-console',{
                    delimiters: ['#{', '}#'],
                    props: {
                        rule: String
                    },
                    template:   `<el-container>
                                    <el-header style="height:30px;line-height:30px;text-align:right;">
                                        <el-tooltip content="重置测试内容" open-delay="500">
                                            <el-button type="text" @click="onReset" icon="el-icon-refresh"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="发送测试内容" open-delay="500">
                                            <el-button type="text" @click="onSubmit" icon="el-icon-s-promotion"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="文件类型" open-delay="500">
                                            <el-dropdown @command="onHandleCommand" trigger="click" style="margin-left:10px;">
                                                <span class="el-dropdown-link">
                                                    <i class="el-icon-document"></i>
                                                </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item :command="item.name" v-for="item in mode">#{item.name}#</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main>
                                        <pre ref="debugEditor" style="min-height:18vh;"></pre>
                                    </el-main>
                                </el-container>`,
                    data(){
                        return {
                            editor: null,
                            mode: null
                        }
                    },
                    created(){
                        fsHandler.callFsJScriptAsync("/matrix/config/modeList.js",null).then( (rtn)=>{
                            this.mode = rtn.message;
                        } );
                    },
                    mounted: function() {
                        this.initEditor();
                    },
                    methods:{
                        initEditor(){
                            const self = this;

                            //初始化对象
                            self.editor = ace.edit(this.$refs.debugEditor);

                            //设置风格和语言（更多风格和语言，请到github上相应目录查看）
                            self.editor.setTheme("ace/theme/tomorrow");
                            self.editor.session.setMode("ace/mode/json");

                            //字体大小
                            self.editor.setFontSize(12);

                            //自动换行,设置为off关闭
                            self.editor.setOption("wrap", "free")

                            //启用提示菜单
                            ace.require("ace/ext/language_tools");
                            self.editor.setOptions({
                                enableBasicAutocompletion: true,
                                enableSnippets: true,
                                enableLiveAutocompletion: true
                            });

                            self.editor.getSession().on('change', function() {
                                //self.debug = self.getValue();
                                //self.editor.resize();
                            });
                            
                        },
                        onReset(){
                            this.editor.setValue("");
                            this.editor.resize();
                        },
                        onSubmit(){
                            let debug = this.editor.getValue();
                            
                            if( this.editor.getSelectedText().length > 0 ) {
                                debug = this.editor.getSelectedText();
                            }

                            if(debug.length < 1){
                                this.$message({
                                    type:"info",
                                    message: "请输入调试信息"
                                })
                                return false;
                            }

                            let term = encodeURIComponent(JSON.stringify(_.extend({},{rule:this.rule, term: debug})));
                            fsHandler.callFsJScriptAsync("/matrix/config/forwardDebug.js",term).then( (rtn)=>{
                                if(rtn.status = 'ok'){
                                    eventHub.$emit("CONFIG-LOG-UPDATE-EVENT");
                                }
                            } );
                            
                        },
                        onHandleCommand(cmd){
                            this.editor.session.setMode("ace/mode/"+cmd);
                        }
                    }
                })

                // 数据
                Vue.component('config-data-console',{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        //class名称
                        model: Object
                    },
                    template:   `<el-container>
                                    <el-header style="height:30px;line-height:30px;padding:0px;">
                                        <el-tooltip content="清空" open-delay="500">
                                            <el-button type="text" @click="onReset"><i class="fas fa-trash"></i></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="重新加载" open-delay="500">
                                            <el-button type="text" @click="onLoad"><i class="fas fa-sync"></i></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="默认只删除对象数据，勾选此项同时删除版本数据。" open-delay="500">
                                            <el-checkbox v-model="ifDeleteVersionData" style="height: 35px;line-height: 35px;float:right;">删除版本数据</el-checkbox>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main>
                                        <el-table :data="rows" 
                                                style="width: 100%" 
                                                height="100%"
                                                stripe 
                                                :default-sort="{prop: 'vtime', order: 'descending'}" 
                                                :row-class-name="rowClassName"
                                                :header-cell-style="headerRender"
                                                @selection-change="handleSelectionChange"
                                                fit="true">
                                            <el-table-column type="selection" width="55"></el-table-column>
                                            <el-table-column :label="item.title" 
                                                            :prop="item.data" 
                                                            v-for="item in columns" 
                                                            :formatter="item.render"
                                                            v-if="item.visible">
                                            </el-table-column>
                                            <!--el-table-column align="right">
                                                <template slot="header" slot-scope="scope">
                                                    <el-input size="mini" placeholder="输入关键字搜索"/>
                                                </template>
                                            </el-table-column-->
                                        </el-table>
                                    </el-main>
                                </el-container>`,
                    data(){
                        return {
                            rows: [],
                            columns: [],
                            selectedRows: [],
                            ifDeleteVersionData: false
                        }
                    },
                    created(){
                        
                        fsHandler.callFsJScriptAsync("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).then( (val)=>{
                            let rtn = val.message;

                            this.rows = rtn.rows;
                            this.columns = _.map(rtn.columns,function(v){
                                                if(v.render){
                                                    v.render = eval(v.render);
                                                }
                                                return v;
                                            });
                        } );

                        // 更新DataTable
                        eventHub.$on("CONFIG-LOG-UPDATE-EVENT",()=>{
                            fsHandler.callFsJScriptAsync("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).then( (val)=>{
                                let rtn = val.message;
                                this.rows = rtn.rows;
                            } );
                        })
                    },
                    methods:{
                        rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0 && columnIndex !== 0) {
                                //return 'text-align:right;';
                            }
                        },
                        onReset(){
                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要删除下列数据`, 
                                    message: h( 'span', null, _.map(this.selectedRows, (v)=>{ return h('p',null, v.id); }) ),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                let item = {class:"/matrix/", ids: _.map(this.selectedRows,'id').join("', '"), ifDeleteVersionData: this.ifDeleteVersionData};
                                fsHandler.callFsJScriptAsync("/matrix/config/action-by-delete.js",encodeURIComponent(JSON.stringify(item))).then( (val)=>{
                                    fsHandler.callFsJScript("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).then( (val)=>{
                                        let rtn = val.message;
                                        this.rows = rtn.rows;
                                    } );
                                } )

                            }).catch(() => {
                                    
                            }); 
                            
                        },
                        onLoad(){
                            fsHandler.callFsJScript("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).then( (val)=>{
                                let rtn = val.message;
                                this.rows = rtn.rows;
                            } );
                        },
                        handleSelectionChange(val) {
                            this.selectedRows = val;
                        }
                    }
                })
    
                Vue.component('config-manage',{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template: ` <el-container style="height:calc(100vh - 174px);">
                                    <el-main ref="mainView">
                                        <div class="config-value" ref="editorContainer" :model="model" style="border:none;border-top:1px solid #f5f5f5;border-bottom:1px solid #f5f5f5;height:100%"></div>
                                        <div class="config-status-footer" :id="'statusBar-'+id" style="line-height: 30px;padding: 0px 15px;background: #f2f2f2;"></div>
                                    </el-main>
                                    <el-footer style="padding:0px;height:200px;" ref="footerView">
                                        <el-tabs v-model="debug.tabs.activeIndex" type="border-card" closable @tab-remove="logClose" @tab-click="handleClick">
                                            <el-tab-pane name="log" style="padding:10px;">
                                                <span slot="label">日志 <i class="el-icon-date"></i></span>
                                                <config-log-console :id="id" :model="classModel" v-if="!_.isEmpty(id)" ref="configLogConsoleRef"></config-log-console> 
                                            </el-tab-pane>
                                            <el-tab-pane label="测试" name="debug" style="padding:10px;">
                                                <config-debug-console :rule="id"></config-debug-console>
                                            </el-tab-pane>
                                            <el-tab-pane label="数据" name="data" style="padding:10px;">
                                                <config-data-console :id="id" :model="classModel"></config-data-console>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-footer>
                                </el-container>`,
                    data() {
                        return {
                            editor: Object,
                            mode: "toml",
                            etcd: {
                                key: null,
                                value: null,
                                ttl: null,
                                isDir: true
                            },
                            breadcrumb: [],
                            cid: "",
                            splitInst: null,
                            ifLog: false,
                            debug:{
                                tabs: {
                                    list: [],
                                    activeIndex: 'log'
                                }
                            },
                            classModel: {}
                        }
                    },
                    watch: {
                        ifLog: {
                            handler:function(val,oldVal){
                                if(val){
                                    this.splitInst.setSizes([50,50]);
                                } else {
                                    this.splitInst.setSizes([100,0]);
                                }
                            }
                        }
                    },
                    created(){
                        
                        if(_.startsWith(this.model.key,"/matrix/rules")){
                            this.mode = "lua";
                        }
                        this.cid = objectHash.sha1(this.id);
                        try{
                            let name = _.trim(_.split(_.first(this.model.value.match(/^--class.*/mgi)),"=",2)[1]);
                            _.extend(this.classModel, {name:name});
                        } catch(err){
                            _.extend(this.classModel, {name:""});
                        }
                        
                    },
                    mounted(){
                        
                        // 选择节点
                        if(_.has(this.model,'key')){
                            this.initEditer();

                            this.splitInst = Split([this.$refs.mainView.$el, this.$refs.footerView.$el], {
                                sizes: [100, 0],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'vertical',
                            });
                        }
                        
                    },
                    methods: {
                        initEditer(){
                            const self = this;
                            
                            self.langTools = ace.require("ace/ext/language_tools");
                            self.editor = ace.edit(this.$refs.editorContainer);
                            ace.require('ace/ext/settings_menu').init(self.editor);
                            let StatusBar = ace.require("ace/ext/statusbar").StatusBar;
                            let statusBar = new StatusBar(self.editor, document.getElementById(`statusBar-${self.id}`));
    
                            self.editor.setOptions({
                                minLines: 10,
                                autoScrollEditorIntoView: true,
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true
                            });
                            self.editor.commands.addCommands([{
                                name: "showSettingsMenu",
                                bindKey: {
                                    win: "Ctrl-9",
                                    mac: "Command-9"
                                },
                                exec: function(editor) {
                                    self.editor.showSettingsMenu();
                                },
                                readOnly: true
                            }]);
                            self.editor.$blockScrolling = Infinity;
                            self.editor.setTheme("ace/theme/tomorrow");
                            self.editor.getSession().setMode(`ace/mode/${this.mode}`);
                            self.editor.getSession().setTabSize(2);
                            self.editor.getSession().setUseWrapMode(true);

                            self.editor.on('mousemove', function() {
                                self.editor.resize();
                            });

                            /* 根据mode获取snippets */
                            try{
                                let snippetManager = ace.require("ace/snippets").snippetManager;
                                let className = _.trim(_.split(_.first(self.model.value.match(/^--class.*/mgi)),"=",2)[1]);    
                                let term = encodeURIComponent(JSON.stringify( {mode:self.mode, class:className} ));
                                
                                fsHandler.callFsJScriptAsync("/matrix/config/snippets.js",term).then( (val)=>{
                                    let snippetText = val.message;
                                    snippetManager.register(snippetText, self.mode);
                                } );
                            } catch(err){

                            }
                            
                            // Add commands
                            self.editor.commands.addCommand(
                                {
                                    name: "save",
                                    bindKey: {
                                        mac: "cmd-S", 
                                        win: "ctrl-S",
                                        sender: 'editor|cli'
                                    },
                                    exec: function(env, args, request) {
                                        self.$root.configUpdate();
                                    }
                                },
                                {    
                                    name: "fullscreen",   
                                    bindKey: {
                                        win: "ctrl-enter", 
                                        mac: "cmd-enter",
                                        sender: 'editor|cli'
                                    },   
                                    exec: function(editor) {        
                                        var vp = cantkGetViewPort();        
                                        if(editor.isFullScreen) {            
                                            div.style.width = editorW + "px";            
                                            div.style.height = editorH + "px";            
                                            div.style.position = "absolute";           
                                            div.style.left = editorX + "px";            
                                            div.style.top = (scrollTop + editorY) + "px";            
                                            editor.resize();            
                                            editor.isFullScreen = false;            
                                            document.body.style.overflow = "auto";        
                                        } else {            
                                            div.style.width = vp.width+ "px";            
                                            div.style.height = vp.height+ "px";            
                                            div.style.position = "absolute";            
                                            div.style.left = 0 + "px";            
                                            div.style.top = (scrollTop + 0) + "px";            
                                            editor.resize();            
                                            editor.isFullScreen = true;            
                                            document.body.style.overflow = "hidden";        
                                        }    
                                    }
                                }
                            );

                            // Customer Auto Completer
                            let customerCompleter = {
                                getCompletions(editor, session, pos, prefix, callback) {
                                     
                                    if (prefix.length === 0) { callback(null, []); return };

                                    let templates = mx.searchJson.search(prefix);

                                    if(_.isEmpty(templates)) return;

                                    callback(null, _.uniqBy(_.map(templates,function(v) {
                                        return {
                                            name: v.name,
                                            score: 1000,
                                            meta: v.title,
                                            caption: v.title,
                                            value: v.template,
                                            className: "btn btn-danger"
                                        }
                                    }),'name'));

                                }
                            };

                            self.langTools.addCompleter(customerCompleter);
                            
                            // 设置value
                            if(_.has(this.model,'value')){
                                // 判断是否为JSON 格式化用
                                if(_.first(this.model.value) === "{" && _.last(this.model.value) === "}"){
                                    self.etcd.value = JSON.stringify(JSON.parse(this.model.value),null,2);
                                } else {
                                    self.etcd.value = this.model.value;
                                }
                                
                            } else {
                                self.etcd.value = "";
                            }
                            self.setEditor();
                        },
                        setEditor: function() {
                            const self = this;
                            
                            // breadcrumb
                            self.breadcrumb = [];
                            self.breadcrumb = _.has(this.model,'key')?this.model.key.split("/"):[];
                            // key
                            self.etcd.key = _.has(this.model,'key')?this.model.key:[];

                            // 如果value is null
                            if(!this.etcd.value) return false;
                            self.editor.setValue(this.etcd.value);
                            self.editor.setValue(self.editor.getValue(), 1);
                            /*self.editor.getSession().on('change', function() {
                                $(".config-editor-save").css("display", "");
                            });*/
                        },
                        addNode:function() {
                            let self = this;
    
                            this.etcd.key = $("#config_key").val();
                            this.etcd.value = self.editor.getValue();
                            this.etcd.ttl = $("#config_ttl").val();
                            this.etcd.isDir = $('input[type=checkbox]').is(':checked');
                            
                            let rtn = configHandler.configAdd(this.etcd);
                            if(rtn === 1){
                                self.$message({
                                    type: "success",
                                    message: "添加成功！"
                                })
                                eventHub.$emit("CONFIG-TREE-REFRESH-EVENT",key);
                            } else {
                                self.$message({
                                    type: "error",
                                    message: "添加失败：" + rtn
                                })
                            }
                        },
                        logClose(){
                            this.splitInst.setSizes([100,0]);
                        },
                        handleClick(tab,event){
                            eventHub.$emit("CONFIG-LOG-UPDATE-EVENT");
                        }
                    }
                })
    
                let main = {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container style="height: calc(100vh - 85px);background-color:#f2f2f2;">
                                    <el-header style="height: 35px;line-height: 35px;background:transparent;border-bottom:1px solid #dddddd; padding: 0px 10px;">
                                        <el-dropdown placement="top-start" trigger="click">
                                            <el-tooltip content="文件" open-delay="500">
                                                <el-button type="text" icon="el-icon-menu"></el-button>
                                            </el-tooltip>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item>
                                                    <label for="auto-file-upload" class="custom-file-upload" style="display: inline-block;padding: 6px 12px;cursor: pointer;">
                                                        <i class="el-icon-download"></i> 导入
                                                    </label>
                                                    <input id="auto-file-upload" type="file" @change="configImport" required="required" style="display:none;" />
                                                </el-dropdown-item>
                                                <el-dropdown-item>
                                                    <el-button type="text" @click="configExport"><i class="el-icon-upload2"></i> 导出</el-button>
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    
                                        <!--el-tooltip content="新增" open-delay="500">
                                            <el-button type="text" @click="configNew"><i class="el-icon-plus" style="color:#000000;font-size:15px;"><i></el-button>
                                        </el-tooltip-->
                                        <!--el-tooltip content="删除" open-delay="500">
                                            <el-button type="text" @click="configDelete" v-show="!_.isEmpty(configTabs.tabs)"><i class="el-icon-delete" style="color:#ff0000;font-size:15px;"><i></el-button>
                                        </el-tooltip-->
                                        <el-tooltip content="保存" open-delay="500">
                                            <el-button type="text" @click="configUpdate" v-show="!_.isEmpty(configTabs.tabs)"><i class="far fa-save" style="color:#009688;font-size:15px;"><i></el-button>
                                        </el-tooltip>
                                        <!--el-button type="text" @click="configDegug" v-show="!_.isEmpty(configTabs.tabs)" icon="fas fa-tv"></el-button-->
                                    
                                        <!--el-dropdown placement="top-start" trigger="click">
                                            <el-tooltip content="模板" open-delay="500">
                                                <el-button type="text" v-show="!_.isEmpty(configTabs.tabs)" icon="fas fa-boxes"></el-button>
                                            </el-tooltip>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item>屏蔽规则</el-dropdown-item>
                                                <el-dropdown-item>过滤规则</el-dropdown-item>
                                                <el-dropdown-item>压缩规则</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                        <el-dropdown placement="top-start" trigger="click">
                                            <el-tooltip content="插入" open-delay="500">    
                                                <el-button type="text" v-show="!_.isEmpty(configTabs.tabs)" icon="fas fa-grip-vertical"></el-button>
                                                </el-tooltip>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item>属性</el-dropdown-item>
                                                <el-dropdown-item>函数</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown-->
                                        <el-tooltip content="主题" open-delay="500">
                                            <el-button type="text" 
                                                :class="'editor-select-theme-'+objectHash.sha1(configTabs.activeIndex)" 
                                                v-show="!_.isEmpty(configTabs.tabs)" 
                                                icon="fas fa-tshirt"
                                                style="float:right;"></el-button>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main style="padding:0px;border-top:1px solid #ffffff;background: #ffffff;">
                                        <el-container style="height:100%;">
                                            <el-aside style="background-color:#f6f6f6!important;overflow:hidden;" ref="leftView">
                                                <config-tree-component id="config-tree" :zNodes="configTreeNodes" style="height: calc(100vh - 150px);"></config-tree-component>
                                            </el-aside>
                                            <el-main style="padding:0px;position: relative;" ref="mainView">                            
                                                <el-tabs v-model="configTabs.activeIndex" type="border-card" closable @tab-remove="configClose" @tab-click="configToggle">
                                                    <el-tab-pane :key="item.name" :name="item.name" v-for="item in configTabs.tabs">
                                                        <span slot="label" v-if="item.dir">
                                                            <i class="fas fa-folder" style="color:rgb(64, 158, 255);"></i> #{item.title}#
                                                            <el-dropdown trigger="click">
                                                                <span class="el-dropdown-link">
                                                                    <i class="el-icon-arrow-down"></i>
                                                                </span>
                                                                <el-dropdown-menu slot="dropdown">
                                                                    <el-dropdown-item @click.native="configCopy(item.name)" :class="'copy'+objectHash.sha1(item.name)">复制</el-dropdown-item>
                                                                    <el-dropdown-item divided @click.native="configDegug(item.name)">调试</el-dropdown-item>
                                                                    <el-dropdown-item @click.native="tabClose(0,item)" divided>关闭</el-dropdown-item>
                                                                    <el-dropdown-item @click.native="tabClose(1,item)">关闭其它标签页</el-dropdown-item>
                                                                    <el-dropdown-item @click.native="tabClose(2,item)">关闭右侧标签页</el-dropdown-item>
                                                                </el-dropdown-menu>
                                                            </el-dropdown>
                                                        </span>
                                                        <span slot="label" v-else>
                                                            <i class="fas fa-file-invoice" style="color:rgb(64, 158, 255);"></i> #{item.title}#
                                                            <el-dropdown trigger="click">
                                                                <span class="el-dropdown-link">
                                                                    <i class="el-icon-arrow-down"></i>
                                                                </span>
                                                                <el-dropdown-menu slot="dropdown">
                                                                    <!--el-dropdown-item @click.native="configCopy(item.name)" :class="'copy'+objectHash.sha1(item.name)">复制</el-dropdown-item-->
                                                                    <el-dropdown-item @click.native="configDegug(item.name)">调试</el-dropdown-item>
                                                                    <el-dropdown-item @click.native="tabClose(0,item)" divided>关闭</el-dropdown-item>
                                                                    <el-dropdown-item @click.native="tabClose(1,item)">关闭其它标签页</el-dropdown-item>
                                                                    <el-dropdown-item @click.native="tabClose(2,item)">关闭右侧标签页</el-dropdown-item>
                                                                </el-dropdown-menu>
                                                            </el-dropdown>
                                                        </span>
                                                        <config-manage :id="item.name" :model="item.model" :ref="'configManageRef'+objectHash.sha1(item.name)"></config-manage>
                                                    </el-tab-pane>
                                                </el-tabs>
                                                <object data="/fs/assets/images/files/svg/configWorld.svg?type=open&issys=true" 
                                                    type="image/svg+xml" style="position: absolute;width:40vw;height:40vh;background: #ffffff;top:22.5%;left:20%;"
                                                    v-show="_.isEmpty(configTabs.tabs)"></object>
                                            </e-main>
                                        </el-container>
                                    </el-main>
                                    <el-footer style="height: 30px;line-height: 30px;padding: 0 10px;">
                                        <i class="el-icon-user"></i> #{window.SignedUser_UserName}#    <i class="el-icon-timer"></i> #{moment().format(mx.global.register.format)}# </Footer>
                                    </el-footer>
                                    <el-dialog title="新增配置" :visible.sync="dialog.configNew.show" v-if="dialog.configNew.show" destroy-on-close="true">
                                        <el-container>
                                            <el-main style="padding:0px 20px;height:100%;overflow:auto;">
                                                <el-form label-width="80">
                                                    <el-form-item label="位置" prop="parent">
                                                        <el-input v-model="dialog.configNew.parent" placeholder="位置" :disabled="true"></el-input>
                                                    </el-form-item>
                                                    <el-form-item label="名称" prop="name">
                                                        <el-input v-model="dialog.configNew.name" placeholder="配置名称" autofocus="true"></el-input>
                                                    </el-form-item>
                                                    <el-form-item :label="dialog.configNew.formItem.ifDir?'目录':'配置'">
                                                        <el-switch v-model="dialog.configNew.formItem.ifDir" active-color="#13ce66">
                                                            <span slot="true">是</span>
                                                            <span slot="false">否</span>
                                                        </el-switch>
                                                    </el-form-item>
                                                    <el-form-item label="TTL" prop="ttl">
                                                        <el-input v-model="dialog.configNew.formItem.ttl" placeholder="TTL"></el-input>
                                                    </el-form-item>
                                                    <el-form-item label="值" prop="value">
                                                        <el-input v-model="dialog.configNew.formItem.value" type="textarea" placeholder="配置内容"></el-input>
                                                    </el-form-item>
                                                </el-form>
                                            </el-main>
                                            <el-footer style="text-align:right;">
                                                <el-button type="default" @click="dialog.configNew.show = false;">取消</el-button>
                                                <el-button type="primary" @click="onConfigSave" :loading="dialog.configNew.loading">提交</el-button>
                                            </el-footer>
                                        </el-container>
                                    </el-dialog> 
                                </el-container>`,
                    data: {
                        splitInst: null,
                        configTabs: {
                            tabs:[],
                            activeIndex: '',
                        },
                        configTreeNodes:{},
                        configTreeSelectedNode:{},
                        dialog:{
                            configNew: {
                                show: false,
                                parent: '',
                                name: '',
                                formItem: {
                                    key: '',
                                    value: '',
                                    ttl: null,
                                    ifDir: true,
                                },
                                loading: false
                            }
                        }
                    },
                    created() {
                        eventHub.$on("CONFIG-TREE-CLICK-EVENT", this.configOpen);
                    },
                    mounted() {
                        
                        this.$nextTick(()=>{

                            this.initData();

                            this.initSplit();
                        })
                        
                    },
                    methods: {
                        initData(){
                            if(window.SignedUser_IsAdmin && window.COMPANY_OSPACE=='matrix'){
                                configHandler.configGetAsync("/").then( (rtn)=>{
                                    this.configTreeNodes = rtn;
                                } );
                            } else {
                                configHandler.configGetAsync("/"+window.COMPANY_OSPACE).then( (rtn)=>{
                                    this.configTreeNodes = rtn;
                                } );
                            }
                        },
                        initSplit(){
                            this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                                sizes: [20, 80],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal'
                            });
                        },
                        tabClose(key,tab){
                            const self = this;

                            if(key === 0){
                                self.configClose(tab.name);
                            } else if( key === 1 ){
                                let others = _.xor(self.configTabs.tabs,[tab]);
                                _.forEach(others,(v)=>{
                                    self.configClose(v.name);
                                })
                            } else {
                                let others = self.configTabs.tabs.slice(_.indexOf(self.configTabs.tabs,tab) + 1, self.configTabs.tabs.length);
                                _.forEach(others,(v)=>{
                                    self.configClose(v.name);
                                })
                            }
                        },
                        configImport(event){
                            
                            let file = event.target.files[0];
                            const h = this.$createElement;

                            this.$msgbox({
                                    title: `确认要导入配置`, 
                                    message: h('span', null, [
                                        h('p', null, `文件名称：${file.name}`),
                                        h('p', null, `修改时间：${file.lastModifiedDate}`),
                                        h('p', null, `文件大小：${mx.bytesToSize(file.size)}`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                let rtn = configHandler.configImport(file,null);

                                if(rtn == 1){
                                    eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", '/');
                                }

                            }).catch(() => {
                                    
                            }); 
                                        
                        },
                        configExport(){
                            
                            if(!this.configTreeSelectedNode.key){
                                this.$message({
                                    type: "info",
                                    message: "请选择需要导出的节点!"
                                })
                                return false;
                            }

                            this.$confirm(`确认要导出 ${this.configTreeSelectedNode.key} 下的配置?`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
                                configHandler.configExport(this.configTreeSelectedNode.key,this);
                                
                            }).catch(() => {
                                
                            });

                        },
                        configOpen(treeNode){
                            
                            this.configTreeSelectedNode = treeNode;

                            try {
                                let id = treeNode.key;//tId;
                                //if(this.configTabs.activeIndex === id) return false;
                                // 已经打开
                                if(_.find(this.configTabs.tabs,{name:id})){
                                    this.configTabs.activeIndex = id;
                                    return false;
                                }
                                
                                // 添加tab
                                this.configTabs.activeIndex = id;
                                this.configTabs.tabs.push({dir: treeNode.dir, title: treeNode.key, name: id, type: 'config', model: treeNode});                                

                                this.initTheme();
                            } catch(error){
                                this.configTabs.tabs = [];
                            }
                        },
                        configClose(targetName){
                            let tabs = this.configTabs.tabs;
                            let activeIndex = this.configTabs.activeIndex;
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
                            
                            this.configTabs.activeIndex = activeIndex;
                            this.configTabs.tabs = tabs.filter(tab => tab.name !== targetName);
                        },
                        configToggle(targetName){
                            //this.configTabs.activeIndex = targetName.index;
                        },
                        initTheme: function(){
                            let id = objectHash.sha1(this.configTabs.activeIndex);
                            
                            $.contextMenu({
                                selector: `.editor-select-theme-${id}`,
                                trigger: 'left',
                                callback: (key, options)=> {
                                    if(key !== 'bright' && key !== 'dark'){
                                        let editor = ace.edit(this.$refs[`configManageRef${id}`][0].$refs.editorContainer);
                                        editor.setTheme("ace/theme/"+key);
                                        localStorage.setItem(`editor-select-theme-${id}`,key);
                                    }
                                },
                                items: {
                                    "bright": { name: "亮色", items: {
                                            "chrome": { name: "chrome"},
                                            "clouds": { name: "clouds"},
                                            "crimson_editor": { name: "crimson_editor"},
                                            "dawn": { name: "dawn"},
                                            "dreamweaver": { name: "dreamweaver"},
                                            "eclipse": { name: "eclipse"},
                                            "github": { name: "github"},
                                            "iplastic": { name: "iplastic"},
                                            "solarized_light": { name: "solarized_light"},
                                            "textmate": { name: "textmate"},
                                            "tomorrow": { name: "tomorrow"},
                                            "xcode": { name: "xcode"},
                                            "kuroir": { name: "kuroir"},
                                            "katzenmilch": { name: "katzenmilch"},
                                            "sqlserver": { name: "sqlserver"}
                                        }
                                    },
                                    "dark": { name: "暗色", items: {
                                            "ambiance": { name: "ambiance"},
                                            "chaos": { name: "chaos"},
                                            "clouds_midnight": { name: "clouds_midnight"},
                                            "dracula": { name: "dracula"},
                                            "cobalt": { name: "cobalt"},
                                            "gruvbox": { name: "gruvbox"},
                                            "gob": { name: "gob"},
                                            "idle_fingers": { name: "idle_fingers"},
                                            "kr_theme": { name: "kr_theme"},
                                            "merbivore": { name: "merbivore"},
                                            "merbivore_soft": { name: "merbivore_soft"},
                                            "mono_industrial": { name: "mono_industrial"},
                                            "monokai": { name: "monokai"},
                                            "pastel_on_dark": { name: "pastel_on_dark"},
                                            "solarized_dark": { name: "solarized_dark"},
                                            "terminal": { name: "terminal"},
                                            "tomorrow_night": { name: "tomorrow_night"},
                                            "tomorrow_night_blue": { name: "tomorrow_night_blue"},
                                            "tomorrow_night_bright": { name: "tomorrow_night_bright"},
                                            "tomorrow_night_eighties": { name: "tomorrow_night_eighties"},
                                            "twilight": { name: "twilight"},
                                            "vibrant_ink": { name: "vibrant_ink"}
                                        }
                                    }
                                }
                            });
                        },
                        configNew(){

                            // 初始化位置
                            this.dialog.configNew.parent = this.configTreeSelectedNode.key || '/';

                            this.dialog.configNew.show = true;

                        },
                        onConfigSave(){
                            

                            if(_.isEmpty(this.dialog.configNew.name)){
                                this.$message({
                                    type: "warning",
                                    message: "配置名称不能为空！"
                                })
                                return false;
                            }

                            this.dialog.configNew.loading = true;
                            
                            this.dialog.configNew.formItem.key = [this.dialog.configNew.parent, this.dialog.configNew.name].join("/").replace(/\/\//g,'/');
                            
                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要添加以下配置`, 
                                    message: h('span', null, [
                                        h('p', null, `位置：${this.dialog.configNew.formItem.key}`),
                                        h('p', null, `值：${_.truncate(this.dialog.configNew.formItem.value)}`),
                                        h('p', null, `TTL：${ this.dialog.configNew.formItem.ttl ? this.dialog.configNew.formItem.ttl : ''}`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                configHandler.configAddAsync(this.dialog.configNew.formItem).then( (rtn)=>{
                                    if(rtn == 1){
                                        this.$message({
                                            type: "success",
                                            message: "保存成功！"
                                        })
                                        
                                        eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", this.dialog.configNew.formItem.key);
                                        
                                        this.dialog.configNew.show = false;

                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "保存失败：" + rtn
                                        })
                                    }

                                    this.dialog.configNew.loading = false;
                                } );

                            }).catch(() => {
                                this.dialog.configNew.loading = false;
                            }); 

                        },
                        configUpdate(){
                            
                            let item = {};
                            item.key = _.find(this.configTabs.tabs,{name:this.configTabs.activeIndex}).model.key;
                            
                            let id = objectHash.sha1(this.configTabs.activeIndex);
                            let editor = ace.edit(this.$refs[`configManageRef${id}`][0].$refs.editorContainer);
                            item.value = editor.getValue();
                            
                            item.ttl = _.find(this.configTabs.tabs,{name:this.configTabs.activeIndex}).model.ttl;


                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要更新以下配置`, 
                                    message: h('span', null, [
                                        h('p', null, `位置：${item.key}`),
                                        h('p', null, `值：${_.truncate(item.value)}`),
                                        h('p', null, `TTL：${ _.isUndefined(item.ttl) ? '' : item.ttl }`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                configHandler.configAddAsync(item).then( (rtn)=>{
                                    if(rtn == 1){
                                        this.$message({
                                            type: "success",
                                            message: "更新成功！"
                                        })
                                        eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", item.key);
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "更新失败：" + rtn
                                        })
                                    }
                                } );

                            }).catch(() => {
                                    
                            }); 
                            
                        },
                        configDelete(){
                            
                            let item = this.configTreeSelectedNode;

                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要删除以下配置`, 
                                    message: h('span', null, [
                                        h('p', null, `位置：${item.key}`),
                                        h('p', null, `值：${_.truncate(item.value)}`),
                                        h('p', null, `TTL：${  _.isUndefined(item.ttl) ? '' : item.ttl }`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                configHandler.configDeleteAsync(item).then( (rtn)=>{
                                    if(rtn == 1){
                                        // 刷新Tree
                                        eventHub.$emit("CONFIG-TREE-REFRESH-EVENT",item.key);
                                        // 关闭Tab
                                        this.configClose(item.key);
                                        // 重置选择
                                        this.configTreeSelectedNode = null;
    
                                    }
                                } );

                            }).catch(() => {
                                    
                            }); 

                        },
                        configCopy(item){
                            new Clipboard(`.copy${objectHash.sha1(item)}`, {
                                text: (trigger)=> {
                                    this.$message("已复制");
                                    let id = objectHash.sha1(this.configTabs.activeIndex);
                                    let editor = ace.edit(this.$refs[`configManageRef${id}`][0].$refs.editorContainer);
                                    return editor.getValue();
                                }
                            });
                        },
                        configDegug(item){
                            let name = objectHash.sha1(item);
                            this.$refs[`configManageRef${name}`][0].ifLog = !this.$refs[`configManageRef${name}`][0].ifLog;
                        }
                    }
                };

                this.app = new Vue(main).$mount("#app");
            })

        })
    }
}