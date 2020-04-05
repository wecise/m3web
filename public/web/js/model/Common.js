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
            }
        }
    },
    template:  `<el-container style="height: 100%;">
                    <el-header style="height:30px;line-height:30px;background-color:#f6f6f6;border-bottom:1px solid #ddd;">
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
                                <el-dropdown-item @click.native="onSaveAs">另存为</el-dropdown-item>

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
                    </el-header>
                    <el-container style="height: 100%;min-height:300px;border-top:1px solid #fff;">
                        <el-aside style="background-color:#f6f6f6;width:200px;overflow:hidden;" ref="leftView">
                            <devops-tree-component :root="tree.root" :defaultExpandedKeys="[tabs.activeNode.fullname]" v-if="!_.isEmpty(tabs.activeNode)"></devops-tree-component>
                        </el-aside>
                        <el-main style="padding:0px;overflow:hidden;" ref="mainView">
                            <el-tabs v-model="tabs.activeIndex" type="border-card" 
                                    style="height:100%;" 
                                    closable 
                                    @tab-click="onTabClick"
                                    @tab-remove="tabRemove">
                                <el-tab-pane
                                    :key="item.name"
                                    v-for="(item, index) in tabs.list"
                                    :label="item.title"
                                    :name="item.name"
                                    style="height:100%;">
                                    <span slot="label">
                                        <i class="fas fa-code" style="color:rgb(64, 158, 255);"></i> #{item.title}#
                                        <el-dropdown trigger="click">
                                            <span class="el-dropdown-link">
                                                <i class="el-icon-arrow-down"></i>
                                            </span>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item @click.native="tabClose(0,item)">关闭</el-dropdown-item>
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
                </el-container>`,
    created() {
        this.tree.root = this.root;
    },
    watch:{
        'tabs.activeIndex':{
            handler(val,oldVal){
                // 默认展开节点
                this.tabs.activeNode = _.find(this.tabs.list,{name:val}).model || null;
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
                this.tabRemove(this.tabs.activeIndex);
            }
        },
        onCloseWin(){
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
            
            // $(".fas.fa-play").addClass("fa-spin");

            // 先保存
            this.onSave();

            _.delay(()=>{
                // 后运行 depend ftype: js/html
                if(_.includes(['html','html'],this.tabs.activeNode.ftype)){
                    eventHub.$emit(`FS-EDITOR-RUN-EVENT-${this.tabs.activeIndex}`, `/fs${[this.tabs.activeNode.parent,this.tabs.activeNode.name].join("/")}?issys=true&type=open`);
                } else {

                    try {
                        let rtn = fsHandler.callFsJScript([this.tabs.activeNode.parent, this.tabs.activeNode.name].join("/").replace(/\/script/g, ""), '');
                        _.extend(_.find(this.tabs.list,{name:this.tabs.activeIndex}).model, {output:rtn});
                        
                        //eventHub.$emit(`FS-EDITOR-RUN-EVENT-${this.tabs.activeIndex}`, rtn);
                    } catch(err) {
                        //eventHub.$emit(`FS-EDITOR-RUN-EVENT-${this.tabs.activeIndex}`, err);
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
                    <el-header style="height:60px;line-height:60px;background-color:#f6f6f6;padding:10px;">
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
        this.classList = fsHandler.callFsJScript("/matrix/fs/fs_list.js",encodeURIComponent(JSON.stringify({path:this.dfsRoot,onlyDir:false, ftype:['xml']}))).message;
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
        dfsRoot:String
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
                name: "新建_"+_.now()+".xml"
            },
            form: {
                name: "",
                attr: ""
            }
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
        _.extend(this.node,{fullname: this.dfsRoot});
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

                                    <el-form-item label="更新时间">
                                        <el-input :value="model.attr.ctime | toLocalTime" disabled></el-input>
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
                                </div>    
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
                }
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
            return moment(value).format("YYYY-MM-DD HH:MM:SS");
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
            treeData: []
        }
    },
    template:   `<el-container style="height:100%;">
                    <el-header style="height:40px;line-height:40px;padding:0px 10px;">
                        <el-input placeholder="搜索" size="mini"></el-input>
                    </el-header>
                    <el-main style="padding:0px 10px; height: 100%;">
                        <el-tree :data="treeData" 
                                :props="defaultProps" 
                                node-key="fullname"
                                highlight-current="true"
                                @node-click="handleNodeClick"
                                @node-contextmenu="handleNodeContextMenu"
                                style="background:transparent;">
                            <span slot-scope="{ node, data }" style="width:100%;">
                                <span v-if="data.ftype!=='dir'">
                                    <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i> #{ node.label }#
                                </span>
                                <span v-else>
                                    <i class="el-icon-folder" style="color:#ffa500;"></i> #{ node.label }#
                                </span>
                            </span>
                        </el-tree>
                    </el-main>
                </el-container>`,
    created(){
        this.onInit();
    },
    methods: {
        handleNodeContextMenu(event,data,node,el){
            this.onInitContextMenu();
        },
        handleNodeClick(data){
            if(data.ftype !=='dir') {
                let item = {
                                alias: data.alias,
                                children: data.children,
                                ftype: data.ftype,
                                fullname: data.fullname,
                                id: data.id,
                                name: data.name,
                                parent: data.parent,
                                size: _.find(fsHandler.fsList(data.parent),{name: data.name}).size || 0
                            };
                eventHub.$emit("FS-NODE-OPENIT-EVENT", item, data.parent);
            } else {

                let _root = data.parent + "/" + data.name;
                let _rtn = fsHandler.fsList(_root);

                eventHub.$emit("FS-FORWARD-EVENT", data, _root);
            }
        },
        onInit(){
            this.treeData = fsHandler.callFsJScript("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root)).message;
        },
        onClick(event, treeId, treeNode) {
            const self = this;

            if(treeNode.ftype !=='dir') {
                eventHub.$emit("FS-NODE-OPENIT-EVENT", treeNode,treeNode.parent);
            } else {

                let _root = treeNode.parent + "/" + treeNode.name;
                let _rtn = fsHandler.fsList(_root);

                eventHub.$emit("FS-FORWARD-EVENT", treeNode,_root);

                self.treeObj.removeChildNodes(treeNode);

                if(!_.isEmpty(_rtn)) {

                    let _nodes = _.map(_rtn,function(v,k){
                                            let _type = "dir";

                                            if(!_.isEmpty(v.ftype)){
                                                _type = v.ftype;
                                            }

                                            return _.merge(v, { pId: 1, isParent: v.isdir, title: v.name, type: _type, size: v.size});
                                });

                    // append sub nodesGr
                    self.treeObj.addNodes(treeNode, _.sortBy(_nodes,[v => v.title.toLowerCase()], ['asc']));

                }
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
            // let mql =   _.concat(["INSERT INTO", this.model.selectedNode.class],_.map(this.model.node,function(v){
            //                     if(v.type == 'int'){
            //                         return `${v.name}='${v.value}'`;
            //                     } else if(v.type == 'map' || v.type == 'list' || v.type == 'set'){
            //                         return `${v.name}='${v.value}'`;
            //                     } else {
            //                         return `${v.name}='${v.value}'`;
            //                     }
            //             }).join(", ")).join(" ");
            // console.log(mql)

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
            console.log(rtn,this.$parent.$parent.$parent.$parent.entity.newDialog.show)
            if(rtn.status == 'ok'){
                this.$message({
                    type: "success",
                    message: "实体插入成功！"
                })
                this.$parent.$parent.$parent.$parent.entity.newDialog.show = false;
            } else {
                this.$message({
                    type: "error",
                    message: "实体插入失败 " + rtn.message
                })
            }
        }
    }
})

