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
                                    <div class="config-status-footer" :id="'statusBar-'+id" style="line-height: 30px;padding: 0px 15px;background: rgb(246, 246, 246);"></div>
                                </div>`,
                    data() {
                        return {
                            editor: Object,
                            etcd: {
                                key: null,
                                value: null,
                                ttl: null,
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
                    template:   `<div class="layout">
                                    <Layout>
                                        <Header>
                                            <ButtonGroup>
                                                <Button type="text" size="small" @click="configNew"><i class="fas fa-plus"></i> 新增</Button>
                                                <Button type="text" size="small" @click="configUpdate" v-show="!_.isEmpty(configTabs.tabs)"><i class="fas fa-save"></i> 保存</Button>
                                                <Button type="text" size="small" @click="configDelete" v-show="!_.isEmpty(configTabs.tabs)"><i class="fas fa-trash"></i> 删除</Button>
                                                <Button type="text" size="small" @click="configDegug" v-show="!_.isEmpty(configTabs.tabs)"><i class="fas fa-tv"></i> 调试</Button>
                                                <Button type="text" size="small" :class="'editor-select-theme-'+objectHash.sha1(configTabs.activeIndex)" v-show="!_.isEmpty(configTabs.tabs)"><i class="fas fa-tshirt"></i> 主题</Button>
                                            </ButtonGroup>
                                            <Dropdown placement="top-start">
                                                <Button type="text" size="small" v-show="!_.isEmpty(configTabs.tabs)"><i class="fas fa-boxes"></i> 模板</Button>
                                                <DropdownMenu slot="list">
                                                    <DropdownItem>屏蔽规则</DropdownItem>
                                                    <DropdownItem>过滤规则</DropdownItem>
                                                    <DropdownItem>压缩规则</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                            <Dropdown placement="top-start">
                                                <Button type="text" size="small" v-show="!_.isEmpty(configTabs.tabs)"><i class="fas fa-grip-vertical"></i> 插入</Button>
                                                <DropdownMenu slot="list">
                                                    <DropdownItem>属性</DropdownItem>
                                                    <DropdownItem>函数</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </Header>
                                        <Content>
                                            <Split v-model="split1">
                                                <div slot="left" style="height: 100%;overflow: auto;">
                                                    <config-tree-component id="config-tree" :zNodes="configTreeNodes"></config-tree-component>
                                                </div>
                                                <div slot="right">
                                                    <el-container>
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
                                        </Content>
                                        <Footer style="padding-top: 20px!important;"><i class="fas fa-user"></i> #{window.SignedUser_UserName}#    <i class="fas fa-clock"></i> #{moment().format("LLL")}# </Footer>
                                    </Layout>     
                                </div>`,
                    data: {
                        split1: 0.2,
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
                            const self = this;
                            
                            self.configTreeSelectedNode = treeNode;

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

                                self.initTheme();
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
                        initTheme: function(){
                            const self = this;
                            let id = objectHash.sha1(self.configTabs.activeIndex);
            
                            $.contextMenu({
                                selector: `.editor-select-theme-${id}`,
                                trigger: 'left',
                                callback: function (key, options) {
                                    if(key !== 'bright' && key !== 'dark'){
                                        let editor = ace.edit('editor-' + self.configTabs.activeIndex);
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
                                template:   `<Form :label-width="80" style="padding:30px 30px 0px 0px;">
                                                <FormItem label="位置" prop="parent">
                                                    <Input v-model="parent" placeholder="位置"></Input>
                                                    <!--dropdown-tree-component id="config-select-parent" v-model="parent" ref="refConfigParent"></dropdown-tree-component-->
                                                </FormItem>
                                                <FormItem label="名称" prop="name">
                                                    <Input v-model="name" placeholder="节点名称"></Input>
                                                </FormItem>
                                                <FormItem :label="formItem.ifDir?'目录':'节点'">
                                                    <i-switch v-model="formItem.ifDir" size="small">
                                                        <span slot="true">是</span>
                                                        <span slot="false">否</span>
                                                    </i-switch>
                                                </FormItem>
                                                <FormItem label="TTL" prop="ttl">
                                                    <Input v-model="formItem.ttl" placeholder="TTL"></Input>
                                                </FormItem>
                                                <FormItem label="值" prop="value">
                                                    <Input v-model="formItem.value" type="textarea" :autosize="{minRows: 1,maxRows: 3}" placeholder="输入值。。。"></Input>
                                                </FormItem>
                                                <FormItem style="text-align:right;">
                                                    <Button type="primary" @click="save">保存</Button>
                                                    <Button @click="cancel" style="margin-left: 8px">取消</Button>
                                                </FormItem>
                                            </Form>`,
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
                                        
                                        alertify.confirm(`确认要新增以下配置?<br><br>
                                            位置：${me.formItem.key}<br><br>
                                            值：${_.truncate(me.formItem.value)}<br><br>
                                            TTL：${me.formItem.ttl}<br><br>`, function (e) {
                                            if (e) {
                                                let rtn = configHandler.configAdd(me.formItem);
                                                if(rtn == 1){
                                                    eventHub.$emit("CONFIG-TREE-REFRESH-EVENT",me.formItem.key);
                                                    me.cancel();
                                                }
                                            } else {
                                                
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
                            const self = this;

                            let item = {};
                            item.key = self.configTreeSelectedNode.key;
                            
                            let editor = ace.edit('editor-' + self.configTabs.activeIndex);
                            item.value = editor.getValue();
                            
                            item.ttl = self.configTreeSelectedNode.ttl || null;

                            alertify.confirm(`确认要更新以下配置?<br><br>
                                位置：${item.key}<br><br>
                                值：${_.truncate(item.value)}<br><br>
                                TTL：${item.ttl}<br><br>`, function (e) {
                                if (e) {
                                    let rtn = configHandler.configAdd(item);
                                    if(rtn == 1){
                                        eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", item.key);
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
                                        self.configClose(item.tId);
                                        // 重置选择
                                        self.configTreeSelectedNode = null;

                                    }
                                } else {
                                    
                                }
                            });
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