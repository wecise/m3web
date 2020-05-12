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
                        
                        let rtn = fsHandler.callFsJScript("/matrix/config/log-by-name.js", encodeURIComponent(this.id)).message;
                        this.rows = rtn.rows;
                        this.columns = _.map(rtn.columns,function(v){
                                            if(v.render){
                                                v.render = eval(v.render);
                                            }
                                            return v;
                                        });
                        
                        // 更新DataTable
                        eventHub.$on("CONFIG-LOG-UPDATE-EVENT",()=>{
                            let rtn = fsHandler.callFsJScript("/matrix/config/log-by-name.js", encodeURIComponent(this.id)).message;
                            this.rows = rtn.rows;
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
                            let act = fsHandler.callFsJScript("/matrix/config/action-by-delete.js",encodeURIComponent(JSON.stringify(item))).message;
                            _.delay(()=>{
                                let rtn = fsHandler.callFsJScript("/matrix/config/log-by-name.js", encodeURIComponent(this.id)).message;
                                this.rows = rtn.rows;
                            })
                        },
                        onLoad(){
                            let rtn = fsHandler.callFsJScript("/matrix/config/log-by-name.js", encodeURIComponent(this.id)).message;
                            this.rows = rtn.rows;
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
                            mode: fsHandler.callFsJScript("/matrix/config/modeList.js",null).message
                        }
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
                            let rtn = fsHandler.callFsJScript("/matrix/config/forwardDebug.js",term);
                            if(rtn.status = 'ok'){
                                eventHub.$emit("CONFIG-LOG-UPDATE-EVENT");
                            }
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
                        
                        let rtn = fsHandler.callFsJScript("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).message;
                        this.rows = rtn.rows;
                        this.columns = _.map(rtn.columns,function(v){
                                            if(v.render){
                                                v.render = eval(v.render);
                                            }
                                            return v;
                                        });
                        
                        // 更新DataTable
                        eventHub.$on("CONFIG-LOG-UPDATE-EVENT",()=>{
                            let rtn = fsHandler.callFsJScript("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).message;
                            this.rows = rtn.rows;
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
                            const self = this;

                            alertify.confirm(`确认要删除下列数据?<br><br>
                                            ${_.map(self.selectedRows,'id').join("<br><br>")}`, function (e) {
                                if (e) {
                                    let item = {class:"/matrix/", ids: _.map(self.selectedRows,'id').join("', '"), ifDeleteVersionData: self.ifDeleteVersionData};
                                    let act = fsHandler.callFsJScript("/matrix/config/action-by-delete.js",encodeURIComponent(JSON.stringify(item))).message;
                                    _.delay(()=>{
                                        let rtn = fsHandler.callFsJScript("/matrix/config/data-by-name.js", encodeURIComponent(self.model.name)).message;
                                        self.rows = rtn.rows;
                                    })
                                } else {
                                    
                                }
                            });
                        },
                        onLoad(){
                            let rtn = fsHandler.callFsJScript("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).message;
                            this.rows = rtn.rows;
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
                                        <div class="config-status-footer" :id="'statusBar-'+id" style="line-height: 30px;padding: 0px 15px;background: rgb(246, 246, 246);"></div>
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
                                let snippetText = fsHandler.callFsJScript("/matrix/config/snippets.js",term).message;
                                snippetManager.register(snippetText, self.mode);
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
                        removeNode: function() {
                            let self = this;
                            let _key = self.etcd.key;
    
                            swal({
                                title: _key,
                                text: 'Are you sure,delete it?',
                                type: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, delete it!'
                            }).then((result) => {
                                if (result.value) {
                                    jQuery.ajax({
                                        url: '/config/del',
                                        type: 'POST',
                                        dataType: 'json',
                                        data: {
                                            key:_key
                                        },
                                        complete: function(xhr, textStatus) {
                                            //called when complete
                                        },
                                        success: function(data, textStatus, xhr) {
    
                                            swal("Deleted!", self.etcd.key, "success");
                                            
                                            eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", _key);
                                        },
                                        error: function(xhr, textStatus, errorThrown) {
                                            //called when there is an error
                                        }
                                    })
                                }
                            })
                        },
                        saveNode: function(){
                            let self = this;
                            var key = self.etcd.key;
                            var value = self.editor.getValue();
                            var ttl = self.etcd.ttl;
                            
                            jQuery.ajax({
                                url: '/config/set',
                                type: 'POST',
                                dataType: 'json',
                                data: {
                                    key,
                                    value,
                                    ttl
                                },
                                complete: function(xhr, textStatus) {
                                    //called when complete
                                },
                                success: function(data, textStatus, xhr) {
    
                                    swal("success!", self.etcd.key, "success");
                                    
                                    eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", key);
                                },
                                error: function(xhr, textStatus, errorThrown) {
                                    //called when there is an error
                                }
                            })
                        },
                        debug: function () {
                            let self = this;
                            
                            mxLog.consoleName = 'M³ Debug Console' + " Trigger";
                            mxLog.show();
    
                            let debugMe = function () {
    
                                let _param = "#/matrix/consolelog/rule: | sort vtime asc  | top 100";
                                
                                mxLog.write("");
    
                                jQuery.ajax({
                                    url: '/mxobject/search',
                                    type: 'POST',
                                    dataType: 'json',
                                    data: { 
                                        cond: _param, 
                                        flag: false 
                                    },
                                    beforeSend:function(xhr){ 
                                    },
                                    complete: function(xhr, textStatus) {
                                        //func.call();
                                    },
                                    success: function(data, textStatus, xhr) {
                                        
                                        if(_.isEmpty(data.message)) {
                                          return false;
                                        }
    
                                        let _tmp = _.map(data.message,_.partialRight(_.pick, ['vtime','msg']));
                                        _.forEach(_tmp,function(v,index) {
                                            mxLog.writeln("["+moment(v.vtime).format("LLL")+"] " + v.msg); 
                                        });
                                    },
                                    error: function(xhr, textStatus, errorThrown) {
                                        mxLog.warn(errorThrown);
                                    }
                                })   
                            }
    
                            debugMe();
                            let _sched = later.parse.text('every 15 sec');
                            let _timer = later.setInterval(debugMe, _sched);
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
                    template:   `<el-container style="height: calc(100vh - 85px);background-color:#f6f6f6;">
                                    <el-header style="height: 30px;line-height: 30px;background:transparent;border-bottom:1px solid #dddddd; padding: 0px 10px;">
                                        <el-dropdown placement="top-start" trigger="click">
                                            <el-tooltip content="文件" open-delay="500">
                                                <el-button type="text" icon="el-icon-menu"></el-button>
                                            </el-tooltip>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item>
                                                    <label for="auto-file-upload" class="custom-file-upload" style="border: 1px dashed rgb(204, 204, 204);display: inline-block;padding: 6px 12px;cursor: pointer;">
                                                        <i class="fas fa-file-import"></i> 导入
                                                    </label>
                                                    <input id="auto-file-upload" type="file" @change="configImport" required="required" style="display:none;" />
                                                </el-dropdown-item>
                                                <el-dropdown-item>
                                                    <el-button type="text" @click="configExport"><i class="fas fa-file-export"></i> 导出</el-button>
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                        <el-button-group>
                                            <el-tooltip content="新增" open-delay="500">
                                                <el-button type="text" @click="configNew" icon="el-icon-plus"></el-button>
                                            </el-tooltip>
                                            <el-tooltip content="删除" open-delay="500">
                                                <el-button type="text" @click="configDelete" v-show="!_.isEmpty(configTabs.tabs)" icon="el-icon-delete"></el-button>
                                            </el-tooltip>
                                            <el-tooltip content="保存" open-delay="500">
                                                <el-button type="text" @click="configUpdate" v-show="!_.isEmpty(configTabs.tabs)" icon="el-icon-position"></el-button>
                                            </el-tooltip>
                                            <!--el-button type="text" @click="configDegug" v-show="!_.isEmpty(configTabs.tabs)" icon="fas fa-tv"></el-button-->
                                        </el-button-group>
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
                                            <el-main style="padding:0px;" ref="mainView">                            
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
                                            </e-main>
                                        </el-container>
                                    </el-main>
                                    <el-footer style="height: 30px;line-height: 30px;padding: 0 10px;">
                                        <i class="fas fa-user"></i> #{window.SignedUser_UserName}#    <i class="fas fa-clock"></i> #{moment().format("LLL")}# </Footer>
                                    </el-footer>     
                                </el-container>`,
                    data: {
                        splitInst: null,
                        configTabs: {
                            tabs:[],
                            activeIndex: '',
                        },
                        configTreeNodes:{},
                        configTreeSelectedNode:{},

                    },
                    created() {
                        eventHub.$on("CONFIG-TREE-CLICK-EVENT", this.configOpen);
                    },
                    mounted() {
                        
                        this.$nextTick(()=>{
                            if(window.SignedUser_IsAdmin && window.COMPANY_OSPACE=='matrix'){
                                this.configTreeNodes = configHandler.configGet("/");
                            } else {
                                this.configTreeNodes = configHandler.configGet("/"+window.COMPANY_OSPACE);
                            }

                            this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                                sizes: [20, 80],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal'
                            });
                        })
                        
                    },
                    methods: {
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
                            const self = this;

                            let file = event.target.files[0];

                            alertify.confirm(`确认要导入配置?<br><br>
                                                文件名称：${file.name}<br><br>
                                                修改时间：${file.lastModifiedDate}<br><br>
                                                文件大小：${mx.bytesToSize(file.size)}`, function (e) {
                                if (e) {
                                    let rtn = configHandler.configImport(file,null);

                                    if(rtn === 1){
                                        eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", '/');
                                    }
                                } else {
                                    
                                }
                            });
                        },
                        configExport(){
                            const self = this;

                            if(!self.configTreeSelectedNode.key){
                                alertify.log("请选择需要导出的节点!");
                                return false;
                            }

                            alertify.confirm(`确认要导出 ${self.configTreeSelectedNode.key} 下的配置?`, function (e) {
                                if (e) {
                                    let rtn = configHandler.configExport(self.configTreeSelectedNode.key);
                                } else {
                                    
                                }
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
                            const self = this;

                            let wnd = null;
                            try{
                                if(jsPanel.activePanels.getPanel('jsPanel-configNew')){
                                    jsPanel.activePanels.getPanel('jsPanel-configNew').close();
                                }
                            }catch(error){
            
                            }
                            finally{
                                wnd = maxWindow.winConfig('新增', '<div id="config-new-window"></div>', null,null);
                            }

                            new Vue({
                                delimiters: ['#{', '}#'],
                                template:   `<el-container style="height:100%;">
                                                <el-main style="padding:0px 20px;height:100%;overflow:auto;">
                                                    <el-form label-width="80">
                                                        <el-form-item label="位置" prop="parent">
                                                            <el-input v-model="parent" placeholder="位置" :disabled="true"></el-input>
                                                        </el-form-item>
                                                        <el-form-item label="名称" prop="name">
                                                            <el-input v-model="name" placeholder="节点名称" autofocus="true"></el-input>
                                                        </el-form-item>
                                                        <el-form-item :label="formItem.ifDir?'目录':'节点'">
                                                            <el-switch v-model="formItem.ifDir" active-color="#13ce66">
                                                                <span slot="true">是</span>
                                                                <span slot="false">否</span>
                                                            </el-switch>
                                                        </el-form-item>
                                                        <el-form-item label="TTL" prop="ttl">
                                                            <el-input v-model="formItem.ttl" placeholder="TTL"></el-input>
                                                        </el-form-item>
                                                        <el-form-item label="值" prop="value">
                                                            <el-input v-model="formItem.value" type="textarea" placeholder="输入值。。。"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-main>
                                                <el-footer style="text-align:right;">
                                                    <el-button type="default" @click="cancel">取消</el-button>
                                                    <el-button type="primary" @click="save">保存</el-button>
                                                </el-footer>
                                            </el-container>`,
                                data: {
                                    parent: '',
                                    name: '',
                                    formItem: {
                                        key: '',
                                        value: '',
                                        ttl: null,
                                        ifDir: true,
                                    }
                                },
                                mounted(){
                                    const me = this;
                                    
                                    // 初始化位置
                                    me.parent = self.configTreeSelectedNode.key || '/';
                                },
                                methods: {
                                    save(){
                                        const me = this;

                                        me.formItem.key = [me.parent, me.name].join("/").replace(/\/\//g,'/');
                                        
                                        alertify.confirm(`确认要添加以下配置?<br><br>
                                            位置：${me.formItem.key}<br><br>
                                            值：${_.truncate(me.formItem.value)}<br><br>
                                            TTL：${me.formItem.ttl}<br><br>`, function (e) {
                                            if (e) {
                                                let rtn = configHandler.configAdd(me.formItem);
                                                if(rtn == 1){
                                                    me.$message({
                                                        type: "success",
                                                        message: "保存成功！"
                                                    })
                                                    eventHub.$emit("CONFIG-TREE-REFRESH-EVENT",me.formItem.key);
                                                    me.cancel();
                                                }
                                            }  else {
                                                me.$message({
                                                    type: "error",
                                                    message: "保存失败：" + rtn
                                                })
                                            }
                                        });

                                    },
                                    cancel(){
                                        wnd.close();
                                    }
                                }
                            }).$mount("#config-new-window");
                        },
                        configUpdate(){
                            
                            let item = {};
                            item.key = _.find(this.configTabs.tabs,{name:this.configTabs.activeIndex}).model.key;
                            
                            let id = objectHash.sha1(this.configTabs.activeIndex);
                            let editor = ace.edit(this.$refs[`configManageRef${id}`][0].$refs.editorContainer);
                            item.value = editor.getValue();
                            
                            item.ttl = _.find(this.configTabs.tabs,{name:this.configTabs.activeIndex}).model.ttl;

                            alertify.confirm(`确认要更新以下配置?<br><br>
                                位置：${item.key}<br><br>
                                值：${_.truncate(item.value)}<br><br>
                                TTL：${item.ttl}<br><br>`,  (e)=>{
                                if (e) {
                                    let rtn = configHandler.configAdd(item);
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
                                } else {
                                    
                                }
                            });
                        },
                        configDelete(){
                            const self = this;

                            let item = self.configTreeSelectedNode;

                            alertify.confirm(`确认要删除以下配置?<br><br>
                                位置：${item.key}<br><br>
                                值：${_.truncate(item.value)}<br><br>
                                TTL：${item.ttl}<br><br>`, function (e) {
                                if (e) {
                                    let rtn = configHandler.configDelete(item);
                                    
                                    if(rtn == 1){
                                        // 刷新Tree
                                        eventHub.$emit("CONFIG-TREE-REFRESH-EVENT",item.key);
                                        // 关闭Tab
                                        self.configClose(item.key);
                                        // 重置选择
                                        self.configTreeSelectedNode = null;

                                    }
                                } else {
                                    
                                }
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