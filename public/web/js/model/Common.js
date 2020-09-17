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

Vue.directive('focus', {
    // 当被绑定的元素插入到DOM中时
    update: function (el, binding, vnode, oldVnode) {
        // 聚焦元素
        el.focus();
    }
});

/* Common App Deploy */
Vue.component("mx-app-deploy",{
    delimiters: ['#{', '}#'],
    props:{
        model: Object
    },
    data(){
        return {
            app: {
                activeTab: "app",
                cnname: "",
                enname: "",
                seat: 0,
                url: "",
                icon: "",
                target: "_blank",
                selected: 1,
                groups: {
                    list: [],
                    default: null
                },
                url: "",
                icon: {
                    value: '',
                    list: []
                }                                
            }
        }
    },
    template:  `<el-container>
                    <el-main>
                        <el-tabs v-model="app.activeTab" ref="tabs">
                            <el-tab-pane name="app">
                                <span slot="label">
                                    <i class="el-icon-s-platform"></i> 应用信息
                                </span>
                                <el-container style="height:100%;">
                                    <el-main style="height:100%;overflow:auto;padding:10px 0px;">
                                        <el-form ref="form" :model="app" label-width="80px">
                                            <el-form-item label="中文名">
                                                <el-input v-model="app.cnname"></el-input>
                                            </el-form-item>
                                            <el-form-item label="英文名称">
                                                <el-input v-model="app.enname"></el-input>
                                            </el-form-item>
                                            <el-form-item label="应用地址" v-if="_.isEmpty(model.item)">
                                                <el-input v-model="app.url" placeholder="应用地址:http://www.baidu.com"></el-input>
                                            </el-form-item>
                                            <el-form-item label="图标选择">
                                                <el-button type="text" @click="app.activeTab='icon'">
                                                    <el-avatar shape="square" fit="fill" size="100" :src="app.icon.value"></el-avatar>
                                                </el-button>
                                            </el-form-item>
                                            <el-form-item label="打开方式"">
                                                <el-radio-group v-model="app.target">
                                                    <el-radio label="_blank" style="margin-left: 20px;">打开新窗口</el-radio>
                                                    <el-radio label="_parent" style="margin-left: 20px;">当前窗口打开</el-radio>
                                                </el-radio-group>
                                            </el-form-item>
                                            <el-form-item label="应用分组">
                                                <el-radio-group v-model="app.groups.default">
                                                    #{app.groups.default.group}#
                                                    <el-radio :label="item" v-for="item in app.groups.list" style="margin-left: 20px;">#{item.title}#</el-radio>
                                                </el-radio-group>
                                            </el-form-item>
                                        </el-form> 
                                    </el-main>
                                    <el-footer style="height:40px;line-height:40px;text-align:right;">
                                        <el-button type="defult" @click="model.show = false;">关闭</el-button>
                                        <el-button type="primary" @click="onSaveAppDeploy">发布应用</el-button>
                                    </el-footer>
                                </el-container>
                            </el-tab-pane>
                            <el-tab-pane name="icon">
                                <span slot="label">
                                    <i class="el-icon-picture"></i> 选择图标
                                </span>
                                <el-container style="height:100%;">
                                    <el-main style="height:300px;overflow:auto;padding:10px 0px;">
                                        <el-radio-group v-model="app.icon.value">
                                            <el-radio :label="'/fs'+icon.parent+'/'+icon.name+'?type=download&issys='+window.SignedUser_IsAdmin" 
                                                v-model="app.icon.value"  
                                                v-for="icon in app.icon.list"
                                                :ref="'radio_'+icon.id"
                                                style="margin-left: 20px;">
                                                <el-button type="default" style="border: unset;width:100px;height:120px;margin:5px;padding:0px;cursor:pointer;" @click="onTriggerRadioClick(icon)"> 
                                                    <el-image :src="icon | pickIcon" fit="fill" 
                                                    style="width:48px;filter:grayscale(100%) brightness(45%) sepia(100%) hue-rotate(-180deg) saturate(700%) contrast(0.8);">
                                                    </el-image> 
                                                </el-button>
                                            </el-radio>
                                        </el-radio-group>
                                    </el-main>
                                    <el-footer style="height:30px;line-height:30px;text-align:center;">
                                        <el-button type="text" @click="app.activeTab='app'">返回</el-button>  
                                    </el-footer>
                                </el-container>
                            </el-tab-pane>
                        </el-tabs>
                    </el-main>
                </el-container>`,
    filters:{
        pickIcon(icon) {
            return `/fs${icon.parent}/${icon.name}?type=download&issys=${window.SignedUser_IsAdmin}`;
        }
    },
    mounted(){
        this.$nextTick().then(()=> {
            if(this.model.item){
                this.app.cnname = _.head(this.model.item.name.split("."));
                this.app.enname = _.head(this.model.item.name.split("."));
                this.app.url = `/fs${[this.model.item.parent, this.model.item.name].join("/")}?issys=true&type=open&issys=${window.SignedUser_IsAdmin}`;
            }
            this.app.seat = _.random(100, 10000);

            this.app.groups.list = fsHandler.callFsJScript("/matrix/apps/appList.js",null).message.groups;
            this.app.groups.default = _.first(this.app.groups.list);

            this.app.icon.list = fsHandler.fsList(`${window.ASSETS_ICON}/apps/png`);
            this.app.icon.value = `${window.ASSETS_ICON}/apps/png/creative.png?type=download&issys=${window.SignedUser_IsAdmin}`;
            
        })
    },
    methods: {
        onTriggerRadioClick(item){
            this.$refs['radio_'+item.id][0].$el.click();
        },
        onSaveAppDeploy(){
                    
            let check = fsHandler.callFsJScript("/matrix/apps/app_exist_check.js",encodeURIComponent(JSON.stringify(this.app.cnname))).message;;

            if(check==1){
                this.$message({
                    type: "info",
                    message:"应用已经发布，请确认!"
                });
                return false;
            }

            _.extend(this.app,{ icon: this.app.icon.value.replace(/\/fs\/assets\/images\/apps\/png\//,'').replace(/\?type=download&issys=true/,'') } );
            _.extend(this.app.groups, { group: this.app.groups.default.name} );
            let rtn = fsHandler.callFsJScript("/matrix/apps/app.js",encodeURIComponent(JSON.stringify(this.app)));

            if( _.lowerCase(rtn.status) == "ok"){
                
                this.$notify({
                    title: this.app.groups.default.name,
                    message: '应用发布成功',
                    position: 'top-left'
                });
                
                eventHub.$emit("APP-REFRESH-EVENT");

                this.model.show = false;   

            }
        }
    }
})

/* Common editor */
Vue.component("mx-editor",{
    delimiters: ['#{', '}#'],
    props:{
        model: String,
        cHeight: String
    },
    computed:{
        cStyle(){
            return `width:100%;height:${this.cHeight};border:1px solid #f2f2f2;`;
        }
    },
    template:  `<div :style="cStyle" ref="editor"></div>`,
    mounted(){
        this.$nextTick().then(()=> {
            this.init();
        })
    },
    methods: {
        init(){
            let editor = ace.edit(this.$refs.editor);
            editor.setOptions({
                maxLines: Infinity,
                minLines: 6,
                autoScrollEditorIntoView: true,
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: false
            });
            
            editor.getSession().setMode("ace/mode/sh");
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setUseSoftTabs(true);
            editor.getSession().setTabSize(2);
            editor.getSession().setUseWrapMode(false);
            editor.renderer.setShowGutter(true);
            editor.setValue(this.model);

            editor.focus(); 
            let row = editor.session.getLength() - 1;
            let column = editor.session.getLine(row).length;
            editor.gotoLine(row + 1, column);
        }
    }
})


 /* Common FS Editor */
Vue.component("mx-fs-editor",{
    delimiters: ['#{', '}#'],
    props: {
        model: Object,
        root: String,
        winContainer: Object
    },
    data(){
        return {
            tabs: {
                list:[],
                activeIndex: '',
                activeNode: null
            },
            tree: {
                root: "/"
            },
            file: {
                dialogSaveAs:{
                    title: "另存为",
                    content: "",
                    visible: false
                }
            }
        }
    },
    template:  `<el-container style="height: 100%;">
                    <el-header style="height:30px;line-height:30px;background-color:#f2f2f2;border-bottom:1px solid #ddd;">
                        <el-dropdown style="padding-right: 10px;cursor:pointer;" trigger="click">
                            <span class="el-dropdown-link">
                                文件
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                
                                <el-dropdown-item @click.native="onNewProject">新建项目</el-dropdown-item>
                                <el-dropdown-item @click.native="onNewFile">新建文件</el-dropdown-item>

                                <el-dropdown-item @click.native="onReload" divided>打开</el-dropdown-item>
                                <el-dropdown-item @click.native="onReload">重打开</el-dropdown-item>
                                
                                <el-dropdown-item @click.native="onSave" divided>保存  ctrl+s</el-dropdown-item>
                                <el-dropdown-item @click.native="file.dialogSaveAs.visible=true">另存为</el-dropdown-item>

                                <el-dropdown-item @click.native="onCloseTab" divided>关闭当前页</el-dropdown-item>
                                <el-dropdown-item @click.native="onCloseWin">关闭窗口</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                        <el-dropdown style="padding-right: 10px;cursor:pointer;" trigger="click">
                            <span class="el-dropdown-link">
                                编辑
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item @click.native="onUndo">撤销</el-dropdown-item>
                                <el-dropdown-item @click.native="onUndo">重做</el-dropdown-item>
                                <el-dropdown-item :class="'copy-'+tabs.activeIndex" @click="onCopy" divided>复制</el-dropdown-item>
                                <el-dropdown-item @click.native="onPaste">粘贴</el-dropdown-item>
                                <el-dropdown-item @click.native="onSelect">选择</el-dropdown-item>
                                <el-dropdown-item @click.native="onRemove" divided>清除</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                        
                        <el-dropdown style="padding-right: 10px;cursor:pointer;" trigger="click">
                            <span class="el-dropdown-link">
                                运行
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item @click.native="onSaveAndPlay">运行</el-dropdown-item>
                                <el-dropdown-item @click.native="onSaveAndPlay" divided>预览</el-dropdown-item>
                                <el-dropdown-item @click.native="onSaveAndPlay" divided>日志</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>   

                        <!--el-dropdown style="padding-right: 10px;cursor:pointer;" trigger="click">
                            <span class="el-dropdown-link">
                                发布
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item @click.native="onDeploy">发布为应用</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown-->    
                        
                        <el-tooltip content="主题" open-delay="500">
                            <el-button type="text" :class="'editor-select-theme-'+tabs.activeIndex" v-show="!_.isEmpty(tabs.list)" style="float:right;"><i class="fas fa-tshirt"></i> 主题</el-button>
                        </el-tooltip>

                        <!-- 保存窗口 -->
                        <el-dialog :title="file.dialogSaveAs.title" :visible.sync="file.dialogSaveAs.visible">
                            <mx-fs-saveas :dfsRoot="tree.root" ftype="xml" ref="dfsSaveas"></mx-fs-saveas>
                            <div slot="footer" class="dialog-footer">
                                <el-button @click="file.dialogSaveAs.visible = false">取 消</el-button>
                                <el-button type="primary" @click="onFileSaveAs">另存为</el-button>
                            </div>
                        </el-dialog>
                    </el-header>
                    <el-container style="height: 100%;min-height:300px;border-top:1px solid #fff;">
                        <el-aside style="background-color:#f2f2f2;width:200px;overflow:hidden;" ref="leftView">
                            <mx-fs-tree :root="tree.root" v-if="!_.isEmpty(tabs.activeNode)"></mx-fs-tree>
                        </el-aside>
                        <el-main style="padding:0px;overflow:hidden;" ref="mainView">
                            <el-card v-if="_.isEmpty(tabs.list)">
                                <h1>欢迎使用${MATRIX_TITLE} 在线编辑器</h1>
                                <el-button type="default" @click="onNewProject">新建文件夹</el-button>
                                <el-button type="default" @click="onNewFile">新建文件</el-button>
                            </el-card>
                            <el-tabs v-model="tabs.activeIndex" type="border-card" 
                                    style="height:100%;" 
                                    closable 
                                    @tab-click="onTabClick"
                                    @tab-remove="tabRemove" v-else>
                                <el-tab-pane
                                    :key="item.name"
                                    v-for="(item, index) in tabs.list"
                                    :label="item.title"
                                    :name="item.name"
                                    style="height:100%;">
                                    <span slot="label">
                                        <i class="fas fa-code" style="color:rgb(64, 158, 255);"></i> #{item.model.name}#
                                        <el-dropdown trigger="click">
                                            <span class="el-dropdown-link">
                                                <i class="el-icon-arrow-down"></i>
                                            </span>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item @click.native="onFormat">格式化</el-dropdown-item>
                                                <el-dropdown-item @click.native="tabClose(0,item)" divided>关闭</el-dropdown-item>
                                                <el-dropdown-item @click.native="tabClose(1,item)">关闭其它标签页</el-dropdown-item>
                                                <el-dropdown-item @click.native="tabClose(2,item)">关闭右侧标签页</el-dropdown-item>
                                                <el-dropdown-item divided>
                                                    <p style="margin:0px;">所在目录：#{item.model.parent}#</p>
                                                    <p style="margin:0px;">文件类型：#{item.model.ftype}#</p>
                                                    <p style="margin:0px;">文件大小：#{mx.bytesToSize(item.model.size)}#</p>
                                                    <p style="margin:0px;">创建时间：#{moment(item.model.vtime).format("LLL")}#</p>
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </span>
                                    <fs-editor-view :id="item.name" :item="item.model" ref="editor"></fs-editor-view>
                                </el-tab-pane>
                            </el-tabs>
                        </el-main>
                    </el-container>
                    <el-footer style="height:30px;line-height:30px;background:#f6f6f6;" class="draggable"> 
                        <span>#{moment().format(mx.global.register.format)}#</span>
                    </el-footer>
                </el-container>`,
    created() {
        this.tree.root = this.root;
    },
    watch:{
        'tabs.activeIndex':{
            handler(val,oldVal){
                // 默认展开节点
                if(!_.isEmpty(this.tabs.list)){
                    this.tabs.activeNode = _.find(this.tabs.list,{name:val}).model || null;
                }
            }
        }
    },
    mounted() {
        
        _.delay(()=>{
            
            this.tabAdd(this.model);

            _.delay(()=>{
                Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                    sizes: [20, 80],
                    minSize: [0, 0],
                    gutterSize: 5,
                    cursor: 'col-resize',
                    direction: 'horizontal',
                });
            },500)
            
        },50)
    },
    methods: {
        onTabClick(tab){
            //this.tabs.activeNode = _.find(this.tabs.list,{name:val});
        },
        tabClose(key,tab){
            
            if(key === 0){
                this.tabRemove(tab.name);
            } else if( key === 1 ){
                let others = _.xor(this.tabs.list,[tab]);
                _.forEach(others,(v)=>{
                    this.tabRemove(v.name);
                })
            } else {
                let others = this.tabs.list.slice(_.indexOf(this.tabs.list,tab) + 1, this.tabs.list.length);
                _.forEach(others,(v)=>{
                    this.tabRemove(v.name);
                })
            }
        },
        tabAdd(item){
            
            try {
                let pID = objectHash.sha1([item.parent,item.name].join("/"));
                
                // 已经打开
                if(_.find(this.tabs.list,{name:pID})){
                    this.tabs.activeIndex = pID;
                    return false;
                }
                
                // 添加tab
                this.tabs.list.push({name: pID, title: [item.parent,item.name].join("/"), model: _.extend(item,{output:null})})
                this.tabs.activeIndex = _.last(this.tabs.list).name;
                _.delay(()=>{
                    this.initTheme();
                },500)
                

            } catch(error){
                this.tabs.list = [];
            } 
            
        },
        tabRemove(targetName){
            try{
                let tabs = this.tabs.list;
                let activeIndex = this.tabs.activeIndex;
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
                
                this.tabs.list = tabs.filter(tab => tab.name !== targetName);
                this.tabs.activeIndex = activeIndex;
                
            } catch(err){
                
            }
        },
        load(){
            eventHub.$emit("FS-NODE-LOAD-EVENT");
        },
        onNewProject(){
            fileSystem.fileNewTo(this.tree.root,window.fsSelectedItem,this.load);
        },
        onNewFile(){
            let node = _.find(this.tabs.list,{name:this.tabs.activeIndex}).model;
            fileSystem.fileNew(node.parent,this.load);
        },
        onCloseTab(){
            if(!_.isEmpty(this.tabs.activeIndex)){
                
                // 检查是否做过修改
                
                this.tabRemove(this.tabs.activeIndex);
            }
        },
        onCloseWin(){
            // 检查是否做过修改

            this.winContainer.close();
        },
        onReload(){
            let node = _.find(this.tabs.list,{name:this.tabs.activeIndex}).model;
            let editor = ace.edit('editor-' + this.tabs.activeIndex);
            let rtn = fsHandler.fsContent(node.parent,node.name);

            if(editor){
                editor.setValue(rtn);
            }
        },
        onUndo(){
            let editor = ace.edit('editor-'+this.tabs.activeIndex);
            editor.undo();
        },
        onRedo(){
            let editor = ace.edit('editor-'+this.tabs.activeIndex);
            editor.redo();
        },
        onCopy(){
            const me = this;
            let editor = ace.edit('editor-'+this.tabs.activeIndex);
            new Clipboard(`.copy-%{this.tabs.activeIndex}`, {
                text: function(trigger) {
                    me.$message("已复制");
                    return editor.getValue();
                }
            });
        },
        onFormat(){
            let editor = ace.edit('editor-'+this.tabs.activeIndex);
            let content = editor.getValue();
            let IsJsonString = function(str) {
                try {
                    JSON.parse(str);
                } catch (e) {
                    return false;
                }
                return true;
            };
            
            if(IsJsonString(content)){
                editor.setValue(JSON.stringify(JSON.parse(content),null,2));
            }
        },
        onFileSaveAs(){
                    
            let editor = ace.edit('editor-'+this.tabs.activeIndex);
            let content = editor.getValue();
            let attr = {remark: '', ctime: _.now(), author: window.SignedUser_UserName};
            let ftype = this.tabs.activeNode.ftype;
            let parent = this.$refs.dfsSaveas.node.fullname;
            let name = this.$refs.dfsSaveas.node.name;
            
            let rtn = fsHandler.fsNew(ftype, this.tabs.activeNode.parent, this.tabs.activeNode.name, content, attr);
            if(rtn == 1){
                this.$message({
                    type:"success",
                    message: "另存成功！"
                })
            }

            this.file.dialogSaveAs.visible = false; 
        },
        onPaste(){
            document.execCommand("paste");
            this.$message("已粘贴");
        },
        onSelect(){
            let editor = ace.edit('editor-'+this.tabs.activeIndex);
            editor.selection.selectAll();
        },
        onRemove(){
            let editor = ace.edit('editor-'+this.tabs.activeIndex);
            if(editor){
                editor.setValue();
                this.$message("已清空");
            }
        },
        onSave(){
            let me = this;
            let editor = ace.edit('editor-'+this.tabs.activeIndex);
            let sc = editor.getValue();

            if(_.isEmpty(editor.getValue())){
                return false;
            }

            // save
            let sRtn = fsHandler.fsNew(this.tabs.activeNode.ftype, this.tabs.activeNode.parent, this.tabs.activeNode.name, sc, _.attempt(JSON.parse.bind(null, this.tabs.activeNode.attr)));

            if(sRtn == 0){
                this.$message("请确认脚本！");
                return false;
            }

            editor.session.getUndoManager().markClean();
            //self.updateToolbar();
        },
        onSaveAs(){
            let me = this;
            let editor = ace.edit('editor-'+this.tabs.activeIndex);
            let sc = editor.getValue();

            if(_.isEmpty(editor.getValue())){
                return false;
            }

            // save
            let sRtn = fsHandler.fsNew(this.tabs.activeNode.ftype, this.tabs.activeNode.parent, this.tabs.activeNode.name, sc, _.attempt(JSON.parse.bind(null, this.tabs.activeNode.attr)));

            if(sRtn == 0){
                this.$message("请确认脚本！");
                return false;
            }

            editor.session.getUndoManager().markClean();
            //self.updateToolbar();
        },
        onSaveAndPlay(){
            
            // 先保存
            // this.onSave();

            _.delay(()=>{
                // 后运行 depend ftype: js/html
                if(_.includes(['html','html'],this.tabs.activeNode.ftype)){
                    eventHub.$emit(`FS-EDITOR-RUN-EVENT-${this.tabs.activeIndex}`, `/fs${[this.tabs.activeNode.parent,this.tabs.activeNode.name].join("/")}?issys=true&type=open`);
                    _.forEach(this.tabs.list,(v)=>{
                        if(v.name == this.tabs.activeIndex){
                            _.extend(v.model,{output: `/fs${[this.tabs.activeNode.parent,this.tabs.activeNode.name].join("/")}?issys=true&type=open`});
                        }
                    })
                } else {

                    try {
                        
                        let rtn = fsHandler.callFsJScript([this.tabs.activeNode.parent, this.tabs.activeNode.name].join("/").replace(/\/script\//g, "/"), '');
                        
                        _.forEach(this.tabs.list,(v)=>{
                            if(v.name == this.tabs.activeIndex){
                                _.extend(v.model,{output:rtn});
                            }
                        })
                        
                    } catch(err) {
                        console.log(err)
                        _.extend(_.find(this.tabs.list,{name:this.tabs.activeIndex}).model, {output:err});
                    }
                }
            },500)
            
            // $(".fas.fa-play.fa-spin").removeClass("fa-spin");
        },
        onDeploy(){
            
        },
        initTheme(){
            
            let id = this.tabs.activeIndex;
            
            $.contextMenu({
                selector: `.editor-select-theme-${id}`,
                trigger: 'left',
                callback: function (key, options) {
                    if(key !== 'bright' && key !== 'dark'){
                        let editor = ace.edit('editor-'+id);
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
        }
    } 
})

/* Common Fs Open */
Vue.component("mx-fs-open",{
    delimiters: ['#{', '}#'],
    props:{
        dfsRoot:String
    },
    data(){
        return {
            classList: [],
            defaultProps: {
                children: 'children',
                label: 'alias'
            },
            node: {},
            form: {
                name: "",
                attr: ""
            }
        }
    },
    template: `<el-container>
                    <el-header style="height:60px;line-height:60px;background-color:#f2f2f2;padding:10px;">
                        <el-form ref="form" :model="form" label-width="80px">
                            <el-form-item label="选择目录：">
                                <el-input v-model="node.fullname" v-if="!_.isEmpty(node.fullname)"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-header>
                    <el-main style="padding:10px 0px;height:260px;">
                        <el-tree v-if="!_.isEmpty(classList)"
                            :data="classList"
                            node-key="id"
                            :default-expanded-keys="[_.first(classList).id]"
                            :props="defaultProps"
                            @node-click="onNodeClick"
                            accordion="true"
                            style="background-color:transparent;">
                            <span slot-scope="{ node, data }">
                                <span class="el-icon-files"></span>
                                <span>#{ data.name }#</span>
                            </span>
                        </el-tree>
                    </el-main>
                </el-container>`,
    created(){
        this.classList = fsHandler.callFsJScript("/matrix/fs/fs_list.js",encodeURIComponent(JSON.stringify({path:this.dfsRoot,onlyDir:false, ftype:['xml','imap']}))).message;
        // 默认创建目录
        _.extend(this.node,{fullname: this.dfsRoot});
    },
    methods:{
        onNodeClick(node){
            this.node = node;
        },
        onCancel(){
            
        },
        onOpen(){
            
        }
    }
})

/* Common Fs SaveAs */
Vue.component("mx-fs-saveas",{
    delimiters: ['#{', '}#'],
    props:{
        dfsRoot:String,
        ftype: String
    },
    data(){
        return {
            classList: [],
            defaultProps: {
                children: 'children',
                label: 'alias'
            },
            node: {
                parent: "",
                name: "新建_"+_.now()
            },
            form: {
                name: "",
                attr: ""
            }
        }
    },
    computed: {
        fileName(){
            return [this.node.name,this.ftype].join(".");
        }
    },
    template: `<el-container>
                    <el-header style="height:120px;line-height:120px;padding:10px;">
                        <el-form ref="form" :model="form" label-width="80px">
                            <el-form-item label="文件名称">
                                <el-input v-model="node.name"></el-input>
                            </el-form-item>
                            <el-form-item label="选择目录">
                                <el-input v-model="node.fullname" v-if="!_.isEmpty(node.fullname)"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-header>
                    <el-main style="padding:10px 0px;height:260px;background:#f6f6f6;">
                        <el-tree v-if="!_.isEmpty(classList)"
                            :data="classList"
                            node-key="id"
                            :default-expanded-keys="[_.first(classList).id]"
                            :props="defaultProps"
                            @node-click="onNodeClick"
                            accordion="true"
                            style="background-color:transparent;">
                            <span slot-scope="{ node, data }">
                                <span class="el-icon-files"></span>
                                <span>#{ data.name }#</span>
                            </span>
                        </el-tree>
                    </el-main>
                </el-container>`,
    created(){
        this.initTreeData();

        // 默认创建目录
        this.$set(this.node,'fullname',this.dfsRoot);
    },
    methods:{
        initTreeData(){
            this.classList = fsHandler.callFsJScript("/matrix/fs/fs_list.js",encodeURIComponent(JSON.stringify({path:this.dfsRoot,onlyDir:true}))).message;
        },
        onNodeClick(node){
            this.node = node;
        },
        onCancel(){
            
        },
        onOpen(){
            
        }
    }
})


/* Common Fs Info */
Vue.component("mx-fs-info",{
    delimiters: ['#{', '}#'],
    props: {
        node:Object,
        winContainer:Object
    },
    template:   `<el-container style="height:100%;">
                    <el-main style="height:100%;display:grid;">
                        <el-tabs v-model="activeName" type="border-card">
                            <el-tab-pane label="管理" name="config">
                                <el-form label-width="80px" style="height:100%;">
                                    <el-form-item label="名称">
                                        <el-input v-model="model.name"></el-input>
                                    </el-form-item>

                                    <el-form-item label="备注">
                                        <el-input type="textarea" v-model="model.attr.remark"></el-input>
                                    </el-form-item>

                                    <el-form-item label="创建时间">
                                        <el-input :value="model.ctime | toLocalTime" disabled></el-input>
                                    </el-form-item>

                                    <el-form-item label="更新时间">
                                        <el-input :value="model.mtime | toLocalTime" disabled></el-input>
                                    </el-form-item>

                                    <el-form-item label="目录">
                                        <el-input v-model="model.parent" disabled></el-input>
                                    </el-form-item>

                                    <el-form-item label="类型">
                                        <el-input v-model="model.ftype" disabled></el-input>
                                    </el-form-item>

                                    <el-form-item label="大小">
                                        <el-input :value="mx.bytesToSize(model.size)" disabled></el-input>
                                    </el-form-item>

                                    <el-form-item label="作者">
                                        <el-input v-model="model.attr.author" disabled></el-input>
                                    </el-form-item>
                                    
                                    <el-form-item label="图标">
                                        <el-button @click="activeName='icon'">
                                            <el-image :src="icon.value" style="width:64px;" ></el-image>
                                        </el-button>
                                    </el-form-item>
                                    
                                    <el-form-item label="标签">
                                        <mx-tag domain='files' :model.sync="model.tags" :id="model.id" limit="4"></mx-tag>
                                    </el-form-item>

                                </el-form>
                                
                            </el-tab-pane>
                            <el-tab-pane label="图标" name="icon">
                                <el-radio-group v-model="icon.value" style="display:flex;flex-wrap:wrap;align-content:flex-start;" @change="onIconChange">
                                    <el-button type="default" 
                                        style="width:8em;max-width:8em;height:90px;height:auto;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);" v-for="icon in icon.list" :key="icon.id">
                                        <el-radio :label="icon | pickIcon">
                                            <el-image :src="icon | pickIcon" style="max-width: 55px;min-width: 55px;"></el-image>
                                            <span slot="label">#{icon.id}#</span>
                                        </el-radio>
                                    </el-button>
                                </el-radio-group> 
                            </el-tab-pane>
                        </el-tabs>    
                    </el-main>
                    <el-footer style="line-height:60px;text-align:center;">
                        <el-button type="success" @click="apply">应用</el-button>
                        <el-button type="primary" @click="save">确定</el-button>
                        <el-button type="default" @click="close">取消</el-button>
                    </el-footer>
                </el-container>`,
    data(){
        return{
            model: {
                name: "",
                attr: {
                    remark: ""
                },
                tags: []
            },
            icon: {
                    value: `${window.ASSETS_ICON}/files/png/${this.node.ftype}.png?type=download&issys=${window.SignedUser_IsAdmin}`,
                    list: []
            },
            attr:{
                remark: "", 
                ctime: _.now(),
                author: window.SignedUser_UserName,
                icon: ""
            },
            activeName: 'config'
        }
    },
    created(){
        
        try{
            // 初始化model
            _.extend(this.model,this.node);

            // 初始化attr
            if(_.isEmpty(this.model.attr)){
                _.extend(this.model, {attr:this.attr});   
            } else {
                _.extend(this.model, {attr: JSON.parse(this.model.attr)});   
            }

            // 如果属性没有icon定义，默认根据ftype文件类型显示
            let icon = JSON.parse(this.model.attr).icon;
            if(!_.isEmpty(icon)){
                this.icon.value = icon;
            }
        } catch(err){

        }
        
        // 初始化图片列表
        this.icon.list = fsHandler.fsList('/assets/images/files/png');
    },
    filters: {
        pickIcon(item) {
            return `/fs${item.parent}/${item.name}?type=open&issys=${window.SignedUser_IsAdmin}`;
        },
        toLocalTime(value) {
            return moment(value).format(mx.global.register.format);
        }
    },
    methods: {
        load(){
            eventHub.$emit("FS-NODE-LOAD-EVENT");
        },
        apply(){
            this.saveAttr();
        },
        save(){
            this.saveAttr();

            this.winContainer.close();
        },
        close(){
            this.winContainer.close();
        },
        onIconChange(val){
            this.activeName = 'config';
        },
        saveName(){
            
            let _old = this.node.parent + "/" + this.node.name;
            let _new = this.node.parent + "/" + this.model.name;


            let _check = fsHandler.fsCheck( this.node.parent, this.model.name);
            if(_check) {
                this.$message({
                    type: "info",
                    message: "文件已存在，请确认！"
                });
                return false;
            }
            
            if(_check.status == 'error') {
                this.$message({
                    type: "error",
                    message: _check.message
                });
                return false;
            }

            let _rtn = fsHandler.fsRename(_old, _new);

            if(_rtn == 1){
                
                this.load();

                this.$message({
                    type: "success",
                    message: "重命名成功！"
                })
            }else {
                this.$message({
                    type: "error",
                    message: _rtn.message
                })
            }
        },
        saveAttr(){
            
            _.extend(this.model.attr, {icon: this.icon.value});

            let _rtn = fsHandler.fsUpdateAttr(this.node.parent, this.node.name, this.model.attr);
            
            if(_rtn == 1){
                this.load();
                
                if(this.model.name != this.node.name){
                    this.saveName();
                }
            } else {
                this.$message({
                    type: "error",
                    message: _rtn.message
                })
            }
        }
    }
})


/* Common Fs Tree */
Vue.component("mx-fs-tree",{
    delimiters: ['#{', '}#'],
    props: {
        root: String
    },
    data(){
        return {
            defaultProps: {
                children: 'children',
                label: 'name'
            },
            treeData: [],
            filterText: ""
        }
    },
    template:   `<el-container style="height:100%;">
                    <el-header style="height:40px;line-height:40px;padding:0px 10px;">
                        <el-input v-model="filterText" 
                            placeholder="搜索" size="mini"
                            clearable></el-input>
                    </el-header>
                    <el-main style="padding:0px 10px; height: 100%;">
                        <el-tree :data="treeData" 
                                :props="defaultProps" 
                                node-key="fullname"
                                highlight-current
                                default-expand-all
                                auto-expand-parent
                                @node-click="onNodeClick"
                                :filter-node-method="onFilterNode"
                                :expand-on-click-node="false"
                                style="background:transparent;"
                                ref="tree">
                            <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                                <span v-if="data.ftype=='dir'">
                                    <i class="el-icon-folder" style="color:#FFC107;"></i>
                                    <span>#{node.label}#</span>
                                    <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;">
                                        <span class="el-dropdown-link">
                                            <i class="el-icon-more el-icon--right"></i>
                                        </span>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item @click.native="onDelete(data,$event)" icon="el-icon-delete">删除</el-dropdown-item>
                                            <el-dropdown-item @click.native="onNodeClick(data)"icon="el-icon-refresh">刷新</el-dropdown-item>
                                            <el-dropdown-item @click.native="onNewFile(data,$event)"icon="el-icon-plus">新建文件</el-dropdown-item>
                                            <el-dropdown-item @click.native="onNewDir(data,$event)"icon="el-icon-folder-add">新建目录</el-dropdown-item>
                                            <el-dropdown-item @click.native="onUpload(data,$event)"icon="el-icon-upload">上传</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </span>
                                <span v-else>
                                    <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i>
                                    <span>#{node.label}#</span>
                                    <el-button v-show="data.show" type="text" @click.stop="onDelete(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete"></el-button>
                                </span>
                            </span>  
                        </el-tree>
                    </el-main>
                </el-container>`,
    watch: {
        filterText(val) {
            if(_.isEmpty(val)){
                this.onInit();
            } else {
                this.$refs.tree.filter(val);
            }
        }
    },
    created(){
        this.onInit();
    },
    methods: {
        onMouseEnter(item){
            this.$set(item, 'show', true)
        },
        onMouseLeave(item){
            this.$set(item, 'show', false)
        },
        onRefresh(item,index){
            let childrenData = fsHandler.fsList(item.fullname);

            this.$set(data, 'children', childrenData);
        },
        onNewDir(item,index){
            this.$prompt('请输入目录名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(({ value }) => {
                if(_.isEmpty(value)){
                    this.$message({
                        type: 'warning',
                        message: '请输入目录名称！'
                    });
                    return false;
                }

                let _attr = {remark: '', ctime: _.now(), author: this.signedUserName, rate: 0};

                let rtn = fsHandler.fsNew('dir', item.fullname, value, null, _attr);
                
                if(rtn == 1){
                    this.$message({
                        type: "success",
                        message: "新建目录成功！"
                    })
                    _.delay(()=>{
                        this.initData();
                    },500)
                } else {
                    this.$message({
                        type: "error",
                        message: "新建目录失败，" + rtn.message
                    })
                }
                
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: '取消输入'
                });       
              });
            
        },
        onNewFile(item,index){
            this.$prompt('请输入文件名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(({ value }) => {
                if(_.isEmpty(value)){
                    this.$message({
                        type: 'warning',
                        message: '请输入名称！'
                    });
                    return false;
                }

                let _attr = {remark: '', ctime: _.now(), author: this.signedUserName, rate: 0};

                let rtn = fsHandler.fsNew('md', item.fullname, [value,'md'].join("."), null, _attr);
                
                if(rtn == 1){
                    this.$message({
                        type: "success",
                        message: "新建成功！"
                    })
                    _.delay(()=>{
                        this.initData();
                    },500)
                } else {
                    this.$message({
                        type: "error",
                        message: "新建失败，" + rtn.message
                    })
                }
                
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: '取消输入'
                });       
              });
        },
        onDelete(item,index){

            this.$confirm(`确认要删除该目录或文件：${item.name}？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                
                let rtn = fsHandler.fsDelete(item.parent,item.name);
                
                if(rtn == 1){
                    this.$messsage({
                        type: "success",
                        message: "删除成功！"
                    })
                    
                    _.delay(()=>{
                        this.initData();
                    },1000)
                    
                } else {
                    this.$messsage({
                        type: "error",
                        message: "删除失败！"
                    })
                }

            }).catch(() => {
                
            });
        },
        onUpload(item,index){

            let wnd = null;
            let wndID = `jsPanel-upload-${objectHash.sha1(item.id)}`;

            try{
                if(jsPanel.activePanels.getPanel(wndID)){
                    jsPanel.activePanels.getPanel(wndID).close();
                }
            } catch(error){

            }
            finally{
                wnd = maxWindow.winUpload('文件上传', `<div id="${wndID}"></div>`, null, null);
            }
            
            new Vue({
                delimiters: ['#{', '}#'],
                template:   `<el-container>
                                <el-main>
                                    <el-upload drag
                                        multiple
                                        show-file-list="false"
                                        :action="upload.url"
                                        :on-success="onSuccess"
                                        :on-remove="onRemove"
                                        list-type="text"
                                        name="uploadfile">
                                        <i class="el-icon-upload"></i>
                                    </el-upload>
                                </el-main>
                                <el-footer>
                                    <i class="fas fa-clock"></i> 上传文件：#{upload.fileList.length}# 
                                </el-footer>
                            </el-container>`,
                data: {
                    upload: {
                        url: `/fs/${item.fullname}?issys=true`,
                        fileList: []
                    }
                },
                created(){
                    
                },
                methods: {
                    beforeUpload(file){
                        
                    },
                    onSuccess(res,file,FileList){
                        this.upload.fileList = FileList;
                    },
                    onRemove(file, fileList) {
                        let rtn = fsHandler.fsDelete(item.fullname,file.name);
                    },
                    onPreview(file) {
                        console.log(file);
                    }
                }
            }).$mount(`#${wndID}`);
            
        },  
        onFilterNode:_.debounce(function(value, data) {
            if (!value) return true;
            try{
                let rtn = fsHandler.callFsJScript("/matrix/fs/getFsByTerm.js", encodeURIComponent(value)).message;
                this.treeData = rtn;
            } catch(err){
                this.treeData = [];
            }
        },1000),
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let rtn = _.map(fsHandler.fsList(data.fullname),(v)=>{
                        return _.extend(v,{show:false});
                    });

                    let childrenData = _.sortBy(rtn,'fullname');

                    this.$set(data, 'children', childrenData);

                    eventHub.$emit("FS-FORWARD-EVENT", data, data.fullname);
                    
                }

                window.FS_TREE_DATA = this.$refs.tree.data;

            } catch(err){

            }

        },
        onInit(){
            if(window.FS_TREE_DATA){
                this.treeData = window.FS_TREE_DATA;//fsHandler.callFsJScript("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root)).message;
            } else {
                this.treeData = fsHandler.callFsJScript("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root)).message;
            }
        }
    }
})

/* Common Fs Tree For Select */
Vue.component("mx-fs-tree-select",{
    delimiters: ['#{', '}#'],
    props: {
        selected:Array,
        root: String
    },
    data(){
        return {
            defaultProps: {
                children: 'children',
                label: 'name'
            },
            treeData: [],
            filterText: ""
        }
    },
    template:   `<el-container style="height:100%;">
                    <el-header style="height:40px;line-height:40px;padding:0px 10px;">
                        <el-input v-model="filterText" 
                            placeholder="搜索" size="mini"
                            clearable></el-input>
                    </el-header>
                    <el-main style="padding:0px 10px; height: 100%;">
                        <el-tree :data="treeData" 
                                :props="defaultProps" 
                                node-key="fullname"
                                highlight-current
                                default-expand-all
                                auto-expand-parent
                                :default-checked-keys="selected"
                                @node-click="onNodeClick"
                                @check-change="onCheckChange"
                                :filter-node-method="onFilterNode"
                                style="background:transparent;"
                                show-checkbox
                                ref="tree">
                            <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                                <span v-if="data.ftype=='dir'">
                                    <i class="el-icon-folder" style="color:#FFC107;"></i>
                                    <span>#{node.label}#</span>
                                </span>
                                <span v-else>
                                    <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i>
                                    <span>#{node.label}#</span>
                                </span>
                            </span>  
                        </el-tree>
                    </el-main>
                </el-container>`,
    watch: {
        filterText(val) {
            if(_.isEmpty(val)){
                this.onInit();
            } else {
                this.$refs.tree.filter(val);
            }
        }
    },
    created(){
        this.onInit();
    },
    methods: {
        onMouseEnter(item){
            this.$set(item, 'show', true)
        },
        onMouseLeave(item){
            this.$set(item, 'show', false)
        },
        onRefresh(item,index){
            let childrenData = fsHandler.fsList(item.fullname);

            this.$set(data, 'children', childrenData);
        },
        onNewDir(item,index){
            this.$prompt('请输入目录名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(({ value }) => {
                if(_.isEmpty(value)){
                    this.$message({
                        type: 'warning',
                        message: '请输入目录名称！'
                    });
                    return false;
                }

                let _attr = {remark: '', ctime: _.now(), author: this.signedUserName, rate: 0};

                let rtn = fsHandler.fsNew('dir', item.fullname, value, null, _attr);
                
                if(rtn == 1){
                    this.$message({
                        type: "success",
                        message: "新建目录成功！"
                    })
                    _.delay(()=>{
                        this.initData();
                    },500)
                } else {
                    this.$message({
                        type: "error",
                        message: "新建目录失败，" + rtn.message
                    })
                }
                
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: '取消输入'
                });       
              });
            
        },
        onNewFile(item,index){
            this.$prompt('请输入文件名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then(({ value }) => {
                if(_.isEmpty(value)){
                    this.$message({
                        type: 'warning',
                        message: '请输入名称！'
                    });
                    return false;
                }

                let _attr = {remark: '', ctime: _.now(), author: this.signedUserName, rate: 0};

                let rtn = fsHandler.fsNew('md', item.fullname, [value,'md'].join("."), null, _attr);
                
                if(rtn == 1){
                    this.$message({
                        type: "success",
                        message: "新建成功！"
                    })
                    _.delay(()=>{
                        this.initData();
                    },500)
                } else {
                    this.$message({
                        type: "error",
                        message: "新建失败，" + rtn.message
                    })
                }
                
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: '取消输入'
                });       
              });
        },
        onDelete(item,index){

            this.$confirm(`确认要删除该目录或文件：${item.name}？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                
                let rtn = fsHandler.fsDelete(item.parent,item.name);
                
                if(rtn == 1){
                    this.$messsage({
                        type: "success",
                        message: "删除成功！"
                    })
                    
                    _.delay(()=>{
                        this.initData();
                    },1000)
                    
                } else {
                    this.$messsage({
                        type: "error",
                        message: "删除失败！"
                    })
                }

            }).catch(() => {
                
            });
        },
        onUpload(item,index){

            let wnd = null;
            let wndID = `jsPanel-upload-${objectHash.sha1(item.id)}`;

            try{
                if(jsPanel.activePanels.getPanel(wndID)){
                    jsPanel.activePanels.getPanel(wndID).close();
                }
            } catch(error){

            }
            finally{
                wnd = maxWindow.winUpload('文件上传', `<div id="${wndID}"></div>`, null, null);
            }
            
            new Vue({
                delimiters: ['#{', '}#'],
                template:   `<el-container>
                                <el-main>
                                    <el-upload drag
                                        multiple
                                        show-file-list="false"
                                        :action="upload.url"
                                        :on-success="onSuccess"
                                        :on-remove="onRemove"
                                        list-type="text"
                                        name="uploadfile">
                                        <i class="el-icon-upload"></i>
                                    </el-upload>
                                </el-main>
                                <el-footer>
                                    <i class="fas fa-clock"></i> 上传文件：#{upload.fileList.length}# 
                                </el-footer>
                            </el-container>`,
                data: {
                    upload: {
                        url: `/fs/${item.fullname}?issys=true`,
                        fileList: []
                    }
                },
                created(){
                    
                },
                methods: {
                    beforeUpload(file){
                        
                    },
                    onSuccess(res,file,FileList){
                        this.upload.fileList = FileList;
                    },
                    onRemove(file, fileList) {
                        let rtn = fsHandler.fsDelete(item.fullname,file.name);
                    },
                    onPreview(file) {
                        console.log(file);
                    }
                }
            }).$mount(`#${wndID}`);
            
        },  
        onFilterNode:_.debounce(function(value, data) {
            if (!value) return true;
            try{
                let rtn = fsHandler.callFsJScript("/matrix/fs/getFsByTerm.js", encodeURIComponent(value)).message;
                this.treeData = rtn;
            } catch(err){
                this.treeData = [];
            }
        },1000),
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let rtn = _.map(fsHandler.fsList(data.fullname),(v)=>{
                        return _.extend(v,{show:false});
                    });

                    let childrenData = _.sortBy(rtn,'fullname');

                    this.$set(data, 'children', childrenData);

                    eventHub.$emit("FS-FORWARD-EVENT", data, data.fullname);
                    
                }

                window.FS_TREE_DATA = this.$refs.tree.data;

            } catch(err){

            }

        },
        onCheckChange(data, checked, indeterminate){
            this.$emit('update:selected', {data: this.$refs.tree.getCheckedKeys(),checked:checked});
        },
        onInit(){
            if(window.FS_TREE_DATA){
                this.treeData = window.FS_TREE_DATA;//fsHandler.callFsJScript("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root)).message;
            } else {
                this.treeData = fsHandler.callFsJScript("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root)).message;
            }
        }
    }
})

/* Common Entity new */
Vue.component("mx-entity-new",{
    data(){
        return{
            classList: fsHandler.callFsJScript("/matrix/entity/entity_class.js",encodeURIComponent("/matrix/entity")).message,
            defaultProps: {
                children: 'children',
                label: 'alias'
            },
            model: {
                selectedNode: {},
                node: {},
                form: {
                    id: "",
                    name: "",
                    class: ""
                }
            }
        }
    },
    template: `<el-container style="height:100%;max-height:50vh;background:#ffffff;">
                    <el-aside style="background: transparent;width:200px;" ref="leftView">
                        <el-container>
                            <el-header style="height:30px;line-height:30px;padding: 0px 10px;">
                                选择类
                            </el-header>
                            <el-main style="padding:0px;">
                                <el-tree
                                    ref="entityTree"
                                    :data="classList"
                                    node-key="id"
                                    accordion
                                    @node-click="onNodeClick"
                                    :props="defaultProps"
                                    style="background-color:transparent;">
                                </el-tree>
                            </el-main>
                        </el-container>
                    </el-aside>
                    <el-container ref="container">
                        <el-main style="padding:10px;">
                            <el-form ref="form" label-width="100px">
                                <el-form-item label="Class">
                                    <el-input v-model="model.form.class"></el-input>
                                </el-form-item>
                                <el-form-item label="ID">
                                    <el-input v-model="model.form.id"></el-input>
                                </el-form-item>
                                <el-form-item label="Name">
                                    <el-input v-model="model.form.name"></el-input>
                                </el-form-item>
                            </el-form>
                            <!--el-form ref="form" :model="model.form" label-width="100px">
                                <el-form-item :label="item.dispname" v-for="item in model.form" style="margin:5px 0px;">
                                    <el-date-picker type="datetime" v-model="item.value" v-if="item.type==='date'"></el-date-picker>
                                    <el-input type="number" v-model="item.value" v-if="item.type==='smallint'" ></el-input>
                                    <el-input type="string" v-model="item.value" v-if="item.type==='varchar'"></el-input>
                                    <el-input type="textarea" v-model="item.value" v-if="item.type==='map'" show-word-limit></el-input>
                                    <el-input type="textarea" v-model="item.value" v-if="item.type==='list'" show-word-limit></el-input>
                                    <el-input type="textarea" v-model="item.value" v-if="item.type==='set'" show-word-limit></el-input>
                                </el-form-item>
                            </el-form-->
                        </el-main>
                        <el-footer style="height:40px;line-height:40px;text-align:right;">
                            <el-button type="default" @click="onCancel">取消</el-button>
                            <el-button type="primary" @click="onSave">提交</el-button>
                        </el-footer>
                    </el-container>
                </el-container>`,
    filters:{
        format(item){
            return JSON.stringify(item.value,null,2);
        }
    },
    mounted(){
        _.delay(()=>{
            Split([this.$refs.leftView.$el, this.$refs.container.$el], {
                sizes: [20, 80],
                minSize: [0, 0],
                gutterSize: 5,
                gutterStyle: function(dimension, gutterSize) {
                    return {
                        'display': 'none'
                    }
                },
                cursor: 'col-resize',
                direction: 'horizontal',
            });
        },1000)
    },
    methods:{
        onNodeClick(node){
            this.model.selectedNode = node;
            this.model.node = fsHandler.callFsJScript("/matrix/entity/entity_class_by_cid.js",encodeURIComponent(node.id)).message;

            this.model.form.class = node.class;
            _.extend(this.model.form,{id:_.last(node.class.split("/"))+":"});
        },
        onCancel(){
            this.$parent.$parent.$parent.$parent.entity.newDialog.show = false;
        },
        onSave(){
            
            if(_.isEmpty(this.model.form.class) || _.isEmpty(this.model.form.id)){
                this.$message({
                    type: "info",
                    message: "请输入实体信息！"
                });
                return false;
            }

            if(_.indexOf(this.model.form.id,":") == -1){
                this.$message({
                    type: "info",
                    message: "请确认ID命名规则：【class:node】"
                });
                return false;
            }

            if(_.endsWith(this.model.form.id,":")){
                this.$message({
                    type: "info",
                    message: "请确认ID命名规则：【class:node】"
                });
                return false;
            }

            _.extend(this.model.form, {type: "new"});

            let rtn = fsHandler.callFsJScript("/matrix/graph/entity-action.js",encodeURIComponent(JSON.stringify(this.model.form)));
            
            if(rtn.status == 'ok'){
                this.$message({
                    type: "success",
                    message: "实体插入成功！"
                })
                this.$parent.$parent.$parent.$parent.entity.newDialog.show = false;
                // 实体新建成功
                eventHub.$emit("ENTITY-ADD-EVENT",this.model.form);
            } else {
                this.$message({
                    type: "error",
                    message: "实体插入失败 " + rtn.message
                })
            }
        }
    }
})

/* Common Entity Tree */
Vue.component("mx-entity-tree",{
    delimiters: ['#{', '}#'],
    props: {
        root: String
    },
    data(){
        return {
            treeData: [],
            defaultProps: {
                children: 'children',
                label: 'alias'
            },
            filterText: ""
        }
    },
    template:   `<el-container style="height:60vh;">
                    <el-header style="height:40px;line-height:40px;padding:0px 10px;">
                        <el-input v-model="filterText" 
                            placeholder="搜索" size="mini"
                            clearable></el-input>
                    </el-header>
                    <el-main style="padding:0px 10px; height: 100%;">
                        <el-tree :data="treeData" 
                                :props="defaultProps" 
                                node-key="id"
                                highlight-current
                                default-expand-all
                                auto-expand-parent
                                @node-click="onNodeClick"
                                :filter-node-method="onFilterNode"
                                style="background:transparent;"
                                ref="tree">
                            <span slot-scope="{ node, data }" style="width:100%;">
                                <span v-if="data">
                                    <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i> #{ node.label }#
                                </span>
                                <span v-else>
                                    <i class="el-icon-folder" style="color:#ffa500;"></i> #{ node.label }#
                                </span>
                            </span>
                        </el-tree>
                    </el-main>
                </el-container>`,
    watch: {
        filterText(val) {
            if(_.isEmpty(val)){
                this.initData();
            } else {
                this.$refs.tree.filter(val);
            }
        }
    },
    created(){
        this.initData();
    },
    methods: {
        initData(){
            this.treeData = fsHandler.callFsJScript("/matrix/entity/entity_class.js",encodeURIComponent(this.root)).message;
        },
        onFilterNode:_.debounce(function(value, data) {
            if (!value) return true;
            try{
                let rtn = fsHandler.callFsJScript("/matrix/graph/entity-search-by-term.js",encodeURIComponent(value)).message;
                this.treeData = _.map(rtn,(v)=>{
                    return _.extend(v,{ children:[], alias:_.last(v.class.split("/"))});
                });
            } catch(err){
                this.treeData = [];
            }
        },1000),
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let childrenData = _.sortBy(fsHandler.fsList(data.fullname),'fullname');

                    this.$set(data, 'children', childrenData);

                    eventHub.$emit("FS-FORWARD-EVENT", data, data.fullname);
                    
                }

                window.FS_TREE_DATA = this.$refs.tree.data;

                eventHub.$emit("MX-ENTITY-TREE-NODE",data);

            } catch(err){

            }

        }
    }
})

/* Common Class Tree */
Vue.component("mx-class-tree",{
    delimiters: ['#{', '}#'],
    props: {
        root: String
    },
    data(){
        return {
            treeData: [],
            selected: null,
            defaultProps: {
                children: 'children',
                label: 'alias'
            },
            filterText: ""
        }
    },
    template:   `<el-container style="height:60vh;">
                    <el-header style="height:40px;line-height:40px;padding:0px 10px;">
                        <el-input v-model="filterText" 
                            placeholder="搜索" size="mini"
                            clearable></el-input>
                    </el-header>
                    <el-main style="padding:0px 10px; height: 100%;">
                        <el-tree :data="treeData" 
                                :props="defaultProps" 
                                node-key="id"
                                highlight-current
                                default-expand-all
                                auto-expand-parent
                                @node-click="onNodeClick"
                                @check-change="onCheckChange"
                                :filter-node-method="onFilterNode"
                                style="background:transparent;"
                                ref="tree">
                            <span slot-scope="{ node, data }" style="width:100%;">
                                <span v-if="data">
                                    <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i> #{ node.label }#
                                </span>
                                <span v-else>
                                    <i class="el-icon-folder" style="color:#ffa500;"></i> #{ node.label }#
                                </span>
                            </span>
                        </el-tree>
                    </el-main>
                </el-container>`,
    watch: {
        filterText(val) {
            if(_.isEmpty(val)){
                this.initData();
            } else {
                this.$refs.tree.filter(val);
            }
        }
    },
    created(){
        this.initData();
    },
    methods: {
        initData(){
            this.treeData = fsHandler.callFsJScript("/matrix/entity/entity_class.js",encodeURIComponent(this.root)).message;
        },
        onCheckChange(val){
            this.selected = val;
        },
        onFilterNode:_.debounce(function(value, data) {
            if (!value) return true;
            try{
                let rtn = fsHandler.callFsJScript("/matrix/graph/entity-search-by-term.js",encodeURIComponent(value)).message;
                this.treeData = _.map(rtn,(v)=>{
                    return _.extend(v,{ children:[], alias:_.last(v.class.split("/"))});
                });
            } catch(err){
                this.treeData = [];
            }
        },1000),
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let childrenData = _.sortBy(fsHandler.fsList(data.fullname),'fullname');

                    this.$set(data, 'children', childrenData);

                    eventHub.$emit("FS-FORWARD-EVENT", data, data.fullname);
                    
                }

            } catch(err){

            } finally{
                this.selected = data;
            }

        }
    }
})



/* Common Class Muilt Select Tree */
Vue.component("mx-class-muilt-tree",{
    delimiters: ['#{', '}#'],
    props: {
        root: String
    },
    data(){
        return {
            treeData: [],
            selected: null,
            defaultProps: {
                children: 'children',
                label: 'alias'
            },
            filterText: ""
        }
    },
    template:   `<el-container style="height:60vh;">
                    <el-header style="height:40px;line-height:40px;padding:0px 10px;">
                        <el-input v-model="filterText" 
                            placeholder="搜索" size="mini"
                            clearable></el-input>
                    </el-header>
                    <el-main style="padding:0px 10px; height: 100%;">
                        <el-tree :data="treeData" 
                                :props="defaultProps" 
                                node-key="id"
                                show-checkbox
                                highlight-current
                                default-expand-all
                                auto-expand-parent
                                @node-click="onNodeClick"
                                @check-change="onCheckChange"
                                :filter-node-method="onFilterNode"
                                style="background:transparent;"
                                ref="tree">
                            <span slot-scope="{ node, data }" style="width:100%;">
                                <span v-if="data">
                                    <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i> #{ node.label }#
                                </span>
                                <span v-else>
                                    <i class="el-icon-folder" style="color:#ffa500;"></i> #{ node.label }#
                                </span>
                            </span>
                        </el-tree>
                    </el-main>
                </el-container>`,
    watch: {
        filterText(val) {
            if(_.isEmpty(val)){
                this.initData();
            } else {
                this.$refs.tree.filter(val);
            }
        }
    },
    created(){
        this.initData();
    },
    methods: {
        initData(){
            this.treeData = fsHandler.callFsJScript("/matrix/entity/entity_class.js",encodeURIComponent(this.root)).message;
        },
        onCheckChange(val){
            this.selected = this.$refs.tree.getCheckedNodes();
        },
        onFilterNode:_.debounce(function(value, data) {
            if (!value) return true;
            try{
                let rtn = fsHandler.callFsJScript("/matrix/graph/entity-search-by-term.js",encodeURIComponent(value)).message;
                this.treeData = _.map(rtn,(v)=>{
                    return _.extend(v,{ children:[], alias:_.last(v.class.split("/"))});
                });
            } catch(err){
                this.treeData = [];
            }
        },1000),
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let childrenData = _.sortBy(fsHandler.fsList(data.fullname),'fullname');

                    this.$set(data, 'children', childrenData);

                    eventHub.$emit("FS-FORWARD-EVENT", data, data.fullname);
                    
                }

            } catch(err){

            }

        }
    }
})

/* Common Class Select Cascader */
Vue.component("mx-class-cascader",{
    delimiters: ['#{', '}#'],
    props: {
        root: String,
        multiplenable: {
            default:false,
            type:Boolean
        },
        value: Object
    },
    data(){
        return {
            options: [],
            defaultProps: {
                multiple: false
            },
            selected: null
        }
    },
    template:   `<el-cascader
                    v-model="value"
                    :options="options"
                    :props="defaultProps"
                    @change="onChange"
                    clearable
                    style="width:100%;"
                    ref="cascader">
                    <template slot-scope="{ node, data }">
                        <span>#{ data.label }#</span>
                        <span v-if="!node.isLeaf"> (#{ data.children.length }#) </span>
                    </template>
                </el-cascader>`,
    created(){
        this.defaultProps.multiple = this.multiplenable;
        this.initData();
    },
    methods: {
        initData(){
            this.options = fsHandler.callFsJScript("/matrix/ai/getClassList.js",encodeURIComponent(this.root)).message;
        },
        onChange(val){
            this.selected = val;
        },
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let childrenData = _.sortBy(fsHandler.fsList(data.fullname),'fullname');

                    this.$set(data, 'children', childrenData);
                    
                }

            } catch(err){

            }

        }
    }
})


/* Common Class Keys All Select Cascader By ClassName */
Vue.component("mx-classkeys-all-cascader",{
    delimiters: ['#{', '}#'],
    props: {
        root: String,
        multiplenable: {
            default:false,
            type:Boolean
        },
        value: Object
    },
    data(){
        return {
            options: [],
            defaultProps: {multiple: false },
            selected: null
        }
    },
    template:   `<el-cascader
                    :value="value"
                    :options="options"
                    :props="defaultProps"
                    @change="onChange"
                    collapseTags
                    clearable
                    filterable
                    style="width:100%;">
                    <template slot-scope="{ node, data }">
                        <span>#{ data.label }#</span>
                        <span v-if="!node.isLeaf"> (#{ data.children.length }#) </span>
                        <span style="color:#999999;font-size:10px;text-align:right;" v-else>#{ data.ftype }#</span>
                    </template>
                </el-cascader>`,
    watch:{
        root(val,oldVal){
            this.initData();
        }
    },
    created(){
        this.defaultProps.multiple = this.multiplenable;
        this.initData();
    },
    methods: {
        initData(){
            this.options = fsHandler.callFsJScript("/matrix/ai/baseline/getClassAllKeysByClassName.js",encodeURIComponent(this.root)).message;
        },
        onChange(val){
            this.selected = val;
        },
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let childrenData = _.sortBy(fsHandler.fsList(data.fullname),'fullname');

                    this.$set(data, 'children', childrenData);
                    
                }

            } catch(err){

            }

        }
    }
})

/* Common Class Keys Number Select Cascader By ClassName */
Vue.component("mx-classkeys-number-cascader",{
    delimiters: ['#{', '}#'],
    props: {
        root: String,
        multiplenable: {
            default:false,
            type:Boolean
        },
        value: Object
    },
    data(){
        return {
            options: [],
            defaultProps: {multiple: false },
            selected: null
        }
    },
    template:   `<el-cascader
                    :value="value"
                    :options="options"
                    :props="defaultProps"
                    @change="onChange"
                    collapseTags
                    clearable
                    filterable
                    style="width:100%;">
                    <template slot-scope="{ node, data }">
                        <span>#{ data.label }#</span>
                        <span v-if="!node.isLeaf"> (#{ data.children.length }#) </span>
                        <span style="color:#999999;font-size:10px;text-align:right;" v-else>#{ data.ftype }#</span>
                    </template>
                </el-cascader>`,
    watch:{
        root(val,oldVal){
            this.initData();
        }
    },
    created(){
        this.defaultProps.multiple = this.multiplenable;
        this.initData();
    },
    methods: {
        initData(){
            this.options = fsHandler.callFsJScript("/matrix/ai/baseline/getClassNumberKeysByClassName.js",encodeURIComponent(this.root)).message;
        },
        onChange(val){
            this.selected = val;
        },
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let childrenData = _.sortBy(fsHandler.fsList(data.fullname),'fullname');

                    this.$set(data, 'children', childrenData);
                    
                }

            } catch(err){

            }

        }
    }
})

/* Common Class Keys Number & String Select Cascader By ClassName */
Vue.component("mx-classkeys-number-string-cascader",{
    delimiters: ['#{', '}#'],
    props: {
        root: String,
        multiplenable: {
            default:false,
            type:Boolean
        },
        value: Object,
        entity: Object
    },
    data(){
        return {
            options: [],
            defaultProps: {multiple: false },
            selected: null
        }
    },
    template:   `<el-cascader
                    :value="value"
                    :options="options"
                    :props="defaultProps"
                    @change="onChange"
                    collapseTags
                    clearable
                    filterable
                    style="width:100%;"
                    @blur="onBlur"
                    ref="cascader">
                    <template slot-scope="{ node, data }">
                        <span>#{ data.label }#</span>
                        <span v-if="!node.isLeaf"> (#{ data.children.length }#) </span>
                        <span style="color:#999999;font-size:10px;text-align:right;" v-else>#{ data.ftype }#</span>
                    </template>
                </el-cascader>`,
    watch:{
        root(val,oldVal){
            this.initData();
        }
    },
    created(){
        this.defaultProps.multiple = this.multiplenable;
        this.initData();
    },
    methods: {
        initData(){
            
            let term = {
                class: this.root,
                entity: this.entity.id
            };
            this.options = fsHandler.callFsJScript("/matrix/ai/baseline/getClassNumberStringKeysByClassName.js",encodeURIComponent(JSON.stringify(term))).message;
        },
        onChange(val){
            this.selected = { bucketKeys:val, options: this.options};
        },
        onBlur(){
            $(this.$refs.cascader.$el).hide();
        }
    }
})

/* Common Class Keys String Select Cascader By ClassName */
Vue.component("mx-classkeys-string-cascader",{
    delimiters: ['#{', '}#'],
    props: {
        root: String,
        multiplenable: {
            default:false,
            type:Boolean
        },
        value: Object
    },
    data(){
        return {
            options: [],
            defaultProps: {multiple: false },
            selected: null
        }
    },
    template:   `<el-cascader
                    :value="value"
                    :options="options"
                    :props="defaultProps"
                    @change="onChange"
                    collapseTags
                    clearable
                    filterable
                    style="width:100%;">
                    <template slot-scope="{ node, data }">
                        <span>#{ data.label }#</span>
                        <span v-if="!node.isLeaf"> (#{ data.children.length }#) </span>
                        <span style="color:#999999;font-size:10px;text-align:right;" v-else>#{ data.ftype }#</span>
                    </template>
                </el-cascader>`,
    watch:{
        root(val,oldVal){
            this.initData();
        }
    },
    created(){
        this.defaultProps.multiple = this.multiplenable;
        this.initData();
    },
    methods: {
        initData(){
            this.options = fsHandler.callFsJScript("/matrix/ai/baseline/getClassStringKeysByClassName.js",encodeURIComponent(this.root)).message;
        },
        onChange(val){
            this.selected = val;
        },
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let childrenData = _.sortBy(fsHandler.fsList(data.fullname),'fullname');

                    this.$set(data, 'children', childrenData);
                    
                }

            } catch(err){

            }

        }
    }
})

/* Common Class -> Entity */
Vue.component("mx-class-entity-select",{
    delimiters: ['#{', '}#'],
    props: {
        root: String,
        multiplenable: {
            default:false,
            type:Boolean
        },
        value: []
    },
    data(){
        return {
            entity: {
                list: [],
                selected: []
            }
        }
    },
    template:   `<el-transfer
                    filterable
                    :filter-method="onFilter"
                    filter-placeholder="请输入实体关键字"
                    v-model="entity.selected"
                    :data="entity.list"
                    :titles="['可选', '已选']"
                    style="background:#f2f2f2;padding:20px;">
                </el-transfer>`,
    created(){
        this.$set(this.entity,'selected',this.value);
    },
    mounted(){
        this.initData();
    },
    methods: {
        initData(){
            let term = encodeURIComponent(JSON.stringify({class: this.root, term:''}));
            this.entity.list = fsHandler.callFsJScript("/matrix/ai/baseline/getEntityListByClassName.js",term).message;
        },
        onFilter(query, item) {
            return item.value.indexOf(query) > -1;
        }
    }
})

/* Common Server Transfer */
Vue.component("mx-server-transfer",{
    delimiters: ['#{', '}#'],
    props: {
        model: Array
    },
    data(){
        return {
            serverList: [],
            selected: []
        }
    },
    template:   `<el-transfer 
                    filterable
                    :filter-method="onFilterMethod"
                    filter-placeholder="请输入关键字"
                    v-model="selected" 
                    :data="serverList"
                    :titles="['所有服务器', '已选择服务器']"
                    :button-texts="['取消', '选择']"
                    @change="onChange"
                    ref="transfer"></el-transfer>`,
    mounted(){
        this.initData();
    },
    methods: {
        initData(){
            this.serverList = fsHandler.callFsJScript("/matrix/ai/getServerList.js",null).message;

            this.selected =  _.map(this.model,'host');
            
        },
        onFilterMethod(query, item){
            return item.value.indexOf(query) > -1;
        },
        onChange(value, direction, movedKeys){
            console.log(value,direction,movedKeys)
        }
    }

})

/* Common Job Group & Server Transfer */
Vue.component("mx-job-group",{
    delimiters: ['#{', '}#'],
    props: {
        value: String
    },
    data(){
        return {
            dt: {
                rows:[],
                columns: [
                            {field:"name", title: "组名称", width: 160},
                            {field:"gtype", title: "类型", width: 160},
                            {field:"hosts", title: "服务器", visible:false}
                        ],
                selected: [],
            },
            group: {
                "name": "",
                "gtype":"group",
                "hosts": []
            }
        }
    },
    template:   `<el-container style="height: calc(100% - 20px);">
                    <el-header style="height:40px;line-height:40px;">
                        <el-tooltip content="刷新">
                            <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
                        </el-tooltip>
                        <el-tooltip content="新建">
                            <el-button type="text" icon="el-icon-plus" @click="onNew"></el-button>
                        </el-tooltip>
                    </el-header>
                    <el-main style="height:100%;padding:0px;">
                        <el-table
                            :data="dt.rows"
                            :row-class-name="rowClassName"
                            @selection-change="onSelectionChange"
                            border
                            style="width: 100%"
                            ref="table">
                            <el-table-column type="selection" width="55"></el-table-column> 
                            <el-table-column 
                                node-key="id"
                                :label="item.title" 
                                :prop="item.field" 
                                :formatter="item.render" 
                                v-for="item in dt.columns"
                                v-if="item.visible">
                                <template slot-scope="scope">
                                    #{scope.row[item.field]}#
                                </template>	
                            </el-table-column>
                            <el-table-column type="expand" label="服务器" width="300">
                                <template slot-scope="scope">
                                    <mx-server-transfer :model="scope.row.hosts"></el-transfer>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作">
                                <template slot-scope="scope">
                                    <el-button type="text" icon="el-icon-delete"  @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-main>
                </el-container>`,
    created(){
        this.initData();
        
        this.group.hosts = _.map(fsHandler.callFsJScript("/matrix/ai/getServerList.js",null).message,(v)=>{
            return {host:v.host};
        });
    },
    methods: {
        rowClassName({row, rowIndex}){
            return `row-${rowIndex}`;
        },
        initData(){

            let rtn = groupHandler.serverGroupList().message;
            
            this.$set(this.dt,'rows', rtn);
            
            this.$set(this.dt,'columns', _.map(this.dt.columns, (v)=>{
                    
                if(_.isUndefined(v.visible)){
                    _.extend(v, { visible: true });
                }

                if(!v.render){
                    return v;
                } else {
                    return _.extend(v, { render: eval(v.render) });
                }
                
            }));

            _.delay(()=>{
                this.onToggleSelection(_.filter(this.dt.rows,{name:this.value}));
            },500)
            
        },
        onSelectionChange(val){
            this.dt.selected = val;
        },
        onToggleSelection(rows) {
            
            if (rows) {
                _.forEach(rows,(row) => {
                    this.$refs.table.toggleRowSelection(row);
                });
            } else {
                this.$refs.table.clearSelection();
            }
        },
        onRefresh(){
            this.initData();
        },
        onNew(){
            this.$prompt('请输入名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
              }).then(({ value }) => {

                if(_.isEmpty(value)){
                    this.$message({
                        type: "info",
                        message: "请输入名称"
                    })
                    return false;
                }

                this.$set(this.group,'name',value);
                
                let rtn = groupHandler.serverGroupNew(JSON.stringify(this.group));
            
                if(rtn.status == 'ok'){
                    
                    this.$message({
                        type: "success",
                        message: "新建成功！"
                    })
                    _.delay((v)=>{
                        this.initData();
                    },500)
                    
                } else {
                    this.$message({
                        type: "error",
                        message: "新建失败，" + rtn.message
                    })
                }
              }).catch(() => {
                
              });
            
        },
        onDelete(index, row){
            this.$confirm(`确认要该组：${row.name}？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
            }).then(() => {
                
                let rtn = groupHandler.serverGroupDelete(row);
                
                if (rtn.status == 'ok'){
                    this.$message({
                        type: "success",
                        message: "删除成功！"
                    });
                    _.delay((v)=>{
                        this.initData();
                    },500)
                } else {
                    this.$message({
                        type: "error",
                        message: "删除失败 " + rtn.message
                    })
                } 
            }).catch(() => {
                
            }); 
        }
    }
})

/* Common Job Cron */
Vue.component("mx-job-cron",{
    delimiters: ['#{', '}#'],
    props: {
        value: String
    },
    data(){
        return {
            cron: [],
            human: "",
            options: { 
                locale: window.MATRIX_LANG.replace(/-/,'_'),
                use24HourTimeFormat: true 
            },
            defaultCron:{
                List: [],
                value: "",
                cron: ""
            }
        }
    },
    template:   `<el-container style="height: calc(100% - 20px);">
                    <el-header>
                        <h3>定时设置</h3>
                        <el-row :gutter="5">
                            <el-col :span="3">
                                秒
                            </el-col>
                            <el-col :span="3">
                                分钟
                            </el-col>
                            <el-col :span="3">
                                小时
                            </el-col>
                            <el-col :span="3">
                                日
                            </el-col>
                            <el-col :span="3">
                                月
                            </el-col>
                            <el-col :span="3">
                                周
                            </el-col>
                            <el-col :span="3">
                                年
                            </el-col>
                        </el-row>
                        <el-row :gutter="5">
                            <el-col :span="3">
                                <el-input v-model="cron[0]" @change="onChange"></el-input>
                            </el-col>
                            <el-col :span="3">
                                <el-input v-model="cron[1]" @change="onChange"></el-input>
                            </el-col>
                            <el-col :span="3">
                                <el-input v-model="cron[2]" @change="onChange"></el-input>
                            </el-col>
                            <el-col :span="3">
                                <el-input v-model="cron[3]" @change="onChange"></el-input>
                            </el-col>
                            <el-col :span="3">
                                <el-input v-model="cron[4]" @change="onChange"></el-input>
                            </el-col>
                            <el-col :span="3">
                                <el-input v-model="cron[5]" @change="onChange"></el-input>
                            </el-col>
                            <el-col :span="3">
                                <el-input v-model="cron[6]" @change="onChange"></el-input>
                            </el-col>
                        </el-row>
                    </el-header>
                    <el-main style="height:100%;width:87.5%;padding-top: 40px;">
                        <h3>定时说明</h3>#{this.cron.join(" ")}#
                        <el-input v-model="human"></el-input>

                        <h3>常用Cron示例</h3>
                        <el-input placeholder="选择示例" v-model="defaultCron.cron">
                            <el-select slot="prepend" 
                                v-model="defaultCron.value" 
                                placeholder="选择示例" 
                                @change="onSetDefaultCron">
                                <el-option v-for="item in defaultCron.list"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                            <el-button slot="append" @click="onSetCron">设置</el-button>
                        </el-input>
                    </el-main>
                </el-container>`,
    watch: {
        cron:function(val){
            this.onCronstrue();
        }
    },
    mounted(){
        this.initData();
    },
    methods: {
        initData(){
            if(!_.isEmpty(this.value)){
                this.cron = this.value.split(" ").slice(1);
            } else {
                this.cron = ['5', '*',  '*',  '*',  '*',  '*', '*'];
            }

            this.onCronstrue();

            this.defaultCron.list = fsHandler.callFsJScript("/matrix/ai/getDefaultCronList.js",null).message;
        },
        onCronstrue(){
            let cronstrue = window.cronstrue;
            this.human = cronstrue.toString(this.cron.join(" "),this.options);
        },
        onChange(val){
            this.onCronstrue();
        },
        onSetDefaultCron(value){
            this.defaultCron.cron = value.split(" ");
        },
        onSetCron(){
            this.cron = this.defaultCron.cron;
        }
    }
})

/* Common Entity -> Class -> Keys Select Cascader */
Vue.component("mx-entity-class-keys-cascader",{
    delimiters: ['#{', '}#'],
    props: {
        root: String,
        multiplenable: {
            default:false,
            type:Boolean
        },
        value: Object
    },
    data(){
        return {
            
            search:{
                term: "",
                result: null,
                selected: null
            },
            entity: {
                list: [],
                timeout:  null
            }
        }
    },
    template:   `<el-container>
                    <el-header style="width:100%;display:flex;height:35px;line-height:35px;padding:0px;">
                        <el-input v-model="search.term" placeholder="搜索实体、活动关键字" style="width:100%;"
                            @blur="onSearchEntityByClass"
                            @clear="onClear"
                            @keyup.enter.native="onSearchEntityByClass" 
                            clearable
                            autofocus>
                            <template slot="prepend">
                                <el-dropdown trigger="click" placement="top-end">
                                    <el-tooltip content="选则实体类" open-delay="500">
                                        <el-button type="text" size="mini">
                                            <i class="el-icon-office-building" style="font-size:16px;"></i>
                                        </el-button>
                                    </el-tooltip>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item>
                                            <template scope="scope">
                                                <mx-entity-tree root="/matrix/entity" ref="entityTree"></mx-entity-tree>
                                            </template>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                            <el-input-number 
                                v-model="value.hidden" :min="0" controls-position="right" 
                                slot="append"
                                @change="onHiddenChange"></el-input-number>
                        </el-input>
                    </el-header>
                    
                    <el-main style="width:60vw;height:40vh;padding:0px;margin:5px 0px;background: #f2f2f2;border-top:1px solid #dddddd;" 
                        v-if="!_.isEmpty(search.result)"
                        ref="mainView">
                        <div class="div-hover-effect" style="display:flex;padding:10px;cursor:pointer;width:100%;" 
                            :key="item.id"
                            v-for="item in search.result">
                            <div style="height:48px;line-height:48px;width:35%;padding-left:10px;">#{ item.value }#</span></div>
                            <div style="height:48px;line-height:48px;width:50%;">
                                <mx-classkeys-number-cascader :root="item.class" :value="item" multiplenable="true" :key="item.id" :ref="item.id"></mx-classkeys-number-cascader> 
                            </div>
                            <el-tooltip content="作为输入指标加入计算模型" open-delay="500">
                                <el-button type="text" @click="onInputAdd(item)">
                                    <i class="el-icon-plus"></i> 输入
                                </el-button>
                            </el-tooltip>
                            <el-tooltip content="作为输出指标加入计算模型" open-delay="500">
                                <el-button type="text" @click="onOutputAdd(item)">
                                    <i class="el-icon-plus"></i> 输出
                                </el-button>
                            </el-tooltip>
                        </div>
                    </el-main>
                    
                </el-container>`,
    filters: {
        pickIcon(item){
            try{
                let icon = _.last(item.class.split("/"));
                return `/fs/assets/images/entity/png/${icon}.png?type=open&issys=true`;
            } catch(err){
                return `/fs/assets/images/entity/png/matrix.png?type=open&issys=true`;
            }
            
        }
    },
    created(){
        
        eventHub.$on("MX-ENTITY-TREE-NODE", (data)=>{
            this.search.term = data.class;
            this.onSearchEntityByClass();
        });
    },
    methods: {
        initData(){
            this.options = fsHandler.callFsJScript("/matrix/ai/getClassList.js",encodeURIComponent(this.root)).message;
        },
        onInputAdd(item){
            
            this.search.result = [];
            
            let perfs = _.map(this.$refs[item.id][0].selected,(v)=>{
                return _.concat(['input',item.class,item.id],v).join(":");
            })
            let val = { entity: item.id, perfs: perfs, type: 'input'};
            let inst = this.$root.$refs.aiSetup.$refs.aiSetupInst[0];
            this.$set(inst.graph,'input',val);
            console.log(val)
        },
        onOutputAdd(item){
            
            this.search.result = [];

            let perfs = _.map(this.$refs[item.id][0].selected,(v)=>{
                return _.concat(['output',item.class,item.id],v).join(":");
            })
            let val = { entity: item.id, perfs: perfs, type: 'output'};
            let inst = this.$root.$refs.aiSetup.$refs.aiSetupInst[0];
            this.$set(inst.graph,'output',val);
            console.log(val)

        },
        onHiddenChange(val){
            let inst = this.$root.$refs.aiSetup.$refs.aiSetupInst[0];
            this.$set(inst.graph,'hidden',val);
        },
        onChange(val){
            this.selected = val;
            this.findClass(this.options,_.last(val));
        },
        findClass(arr,name){
            
            let rt = _.find(arr,{class:name});
            
            if(rt){
                let keys = fsHandler.callFsJScript("/matrix/ai/baseline/getClassNumberKeysByClassName.js",encodeURIComponent(rt.class)).message;
                if(!_.isEmpty(keys)){
                    this.$set(rt,'children',keys);
                }
            } else {
                _.forEach(arr,(v)=>{
                    if(v.children){
                        this.findClass(v.children,name);
                    }
                })
            }
        },
        onNodeClick(data){
            try{

                if(!data.isdir) {
                    eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

                } else {

                    let childrenData = _.sortBy(fsHandler.fsList(data.fullname),'fullname');

                    this.$set(data, 'children', childrenData);
                    
                }

            } catch(err){

            }

        },
        onClear(){
            this.search.selected = null;
            this.search.result = null;
        },
        onSearchEntity() {
            
            try{
                if(_.isEmpty(this.search.term)){
                    return false;
                }

                let entitys = fsHandler.callFsJScript("/matrix/graph/entity-search-by-term.js",encodeURIComponent(this.search.term)).message;
                
                this.search.result = entitys;

                this.search.result = _.map(this.search.result,(v)=>{
                    return _.extend(v,{cell: {edge:false}});
                })
        
            } catch(err){
                console.log(err)
            }
            
        },
        onSearchEntityByClass() {
            
            try{
                if(_.isEmpty(this.search.term)){
                    return false;
                }

                let entitys = fsHandler.callFsJScript("/matrix/graph/entitySearchByClass.js",encodeURIComponent(this.search.term)).message;
                
                this.search.result = entitys;

                this.search.result = _.map(this.search.result,(v)=>{
                    return _.extend(v,{cell: {edge:false}});
                })
        
            } catch(err){
                console.log(err)
            }
            
        }
    }
})

