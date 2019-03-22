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
        VueLoader.onloaded(["ai-robot-component"], function () {

            
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
                            self.setting.view.addDiyDom = self.addDiyDom;
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
                            let node = self.zTree.getSelectedNodes();
                            
                            $("[title='" + self.selectedNodeName + "']").removeClass('curSelectedNode');
                            self.selectedNodeName = treeNode.key;
                            
                            let rtn = configHandler.configGet(treeNode.key);
                            if(rtn){
                                self.zTree.removeChildNodes(node[0]);
                                self.zTree.addNodes(treeNode, rtn.nodes);
                                /**
                                 * @todo  赋键值
                                 */
                                eventHub.$emit('CONFIG-TREE-CLICK-EVENT', treeNode);
                            }
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
                        }
                    }
                })
    
                Vue.component('config-manage',{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template: ` <div>
                                    <div class="config-value" :id="'editor-'+id" :model="model" style="border:none;border-top:1px solid #f5f5f5;border-bottom:1px solid #f5f5f5;"></div>
                                    <div class="config-status-footer" :id="'statusBar-'+id"></div>
                                </div>`,
                    data() {
                        return {
                            editor: Object,
                            etcd: {
                                key: null,
                                value: null,
                                ttl: -1,
                                isDir: true
                            },
                            breadcrumb: [],
                        }
                    },
                    mounted(){
                        // 选择节点
                        if(_.has(this.model,'key')){
                            this.initEditer();
                        }
                    },
                    created(){
                        const self = this;
    
                        //eventHub.$on("CONFIG-TREE-CLICK-EVENT", self.setEditor);
                    },
                    methods: {
                        initEditer(){
                            const self = this;
                            
                            self.editor = ace.edit('editor-'+self.id);
                            ace.require('ace/ext/settings_menu').init(self.editor);
                            let StatusBar = ace.require("ace/ext/statusbar").StatusBar;
                            let statusBar = new StatusBar(self.editor, document.getElementById(`statusBar-${self.id}`));
    
                            self.editor.setOptions({
                                minLines: 10,
                                autoScrollEditorIntoView: true,
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
                            self.editor.getSession().setMode("ace/mode/toml");
                            self.editor.getSession().setTabSize(2);
                            self.editor.getSession().setUseWrapMode(true);

                            
                            // 设置value
                            self.etcd.value = _.has(this.model,'value')?this.model.value:"";
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
                                eventHub.$emit("CONFIG-TREE-REFRESH-EVENT",key);
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
                        }
                    }
                })
    
                maxConfig.app = {
                    delimiters: ['#{', '}#'],
                    template:   `<div id="content" class="content">
                                    <el-container style="height: 88vh;border: 1px solid rgb(238, 238, 238);background-color:rgb(255, 255, 255);width: 100%;">
                                        
                                            <Split v-model="split1">
                                                <div slot="left">
                                                    <config-tree-component id="config-tree" :zNodes="configTreeNodes"></config-tree-component>
                                                </div>
                                                <div slot="right">
                                                    <el-container>
                                                        <el-header style="text-align: right; font-size: 12px;height:30px;">
                                                            <el-row type="flex" class="row-bg" justify="space-around">
                                                                <el-col :span="18"><div class="grid-content bg-purple">
                                                                    
                                                                </div></el-col>
                                                                <el-col :span="6"><div class="grid-content bg-purple-light">
                                                                    <div class="btn-group">
                                                                        <a class="btn btn-xs btn-link" data-target="#configAddModal" title="新增目录或节点" data-toggle="modal">
                                                                            <i class="fa fa-plus"></i>
                                                                            新增&nbsp;
                                                                        </a>
                                                                        <a  href="#"
                                                                            class="btn btn-xs btn-link config-editor-save"
                                                                            title="保存新增目录或节点"
                                                                            @click="configSave"
                                                                            style="display:;">
                                                                            <i class="fa fa-save"></i> 保存
                                                                        </a>
                                                                        <a href="#" class="btn btn-xs btn-link" readonly @click="configDelete" title="删除目录或节点">
                                                                            <i class="fa fa-trash"></i>
                                                                            删除&nbsp;
                                                                        </a>
                                                                        <a href="javascript:void(0)" @click="configDegug" class="btn btn-xs btn-link">
                                                                            <i class="fas fa-tv"></i>
                                                                        </a>
                                                                    </div>
                                                                </div></el-col>
                                                            </el-row>
                                                        </el-header>
                                                        <el-main>
                                                            <el-tabs v-model="configTabs.activeIndex" type="border-card" closable @tab-remove="configClose">
                                                                <el-tab-pane :key="item.name" :name="item.name" v-for="item in configTabs.tabs">
                                                                    <span slot="label" v-if="item.dir">
                                                                        <i class="fas fa-folder" style="color:rgb(64, 158, 255);"></i> #{item.title}#
                                                                    </span>
                                                                    <span slot="label" v-else>
                                                                        <i class="fas fa-file-invoice" style="color:rgb(64, 158, 255);"></i> #{item.title}#
                                                                    </span>
                                                                    <config-manage :id="item.name" :model="item.model"></config-manage>
                                                                </el-tab-pane>
                                                            </el-tabs>
                                                        </el-main>
                                                    </el-container>
                                                </div>
                                            </Split>
                                            
                                        </el-aside>
                                        
                                    </el-container>
                                </div>`,
                    data: {
                        split1: 0.2,
                        configTabs: {
                            tabs:[],
                            activeIndex: '',
                        },
                        configTreeNodes:{}
                    },
                    created() {
                        eventHub.$on("CONFIG-TREE-CLICK-EVENT", this.configOpen);
                    },
                    mounted() {
                        const self = this;

                        self.$nextTick(function(){
                            if(window.SignedUser_IsAdmin && window.COMPANY_OSPACE=='matrix'){
                                this.configTreeNodes = configHandler.configGet("/");
                            } else {
                                this.configTreeNodes = configHandler.configGet("/"+window.COMPANY_OSPACE);
                            }
                        })
                    },
                    methods: {
                        configOpen(treeNode){
                            
                            try {
                                let id = treeNode.tId;
                                //if(this.configTabs.activeIndex === id) return false;
                                // 已经打开
                                if(_.find(this.configTabs.tabs,{name:id})){
                                    this.configTabs.activeIndex = id;
                                    return false;
                                }
                                
                                // 添加tab
                                this.configTabs.activeIndex = id;
                                this.configTabs.tabs.push({dir: treeNode.dir, title: treeNode.key, name: id, type: 'config', model: treeNode});                                
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
                        configSave(){

                        },
                        configDelete(){

                        },
                        configDegug(){

                        }
                    }
                };
                new Vue(maxConfig.app).$mount("#app");
            })

        })
    }
}

let maxConfig = new Config();
maxConfig.init();