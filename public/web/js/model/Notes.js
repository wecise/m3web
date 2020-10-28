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
class Notes {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["ai-robot-component"
                        ],function() {

            $(function() {

                // Notes Tree
                Vue.component("notes-tree",{
                    delimiters: ['#{', '}#'],
                    props: {
                        defaultNote: Array
                    },
                    data() {
                        return {
                            defaultProps: {
                                children: 'children',
                                label: 'name'
                            },
                            treeData: [],
                            root: "/assets/documents",
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
                                                highlight-current="true"
                                                default-expand-all="true"
                                                @node-click="onNodeClick"
                                                :filter-node-method="onFilterNode"
                                                :expand-on-click-node="false"
                                                style="background:transparent;"
                                                ref="tree">
                                            <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                                                <span v-if="data.ftype=='dir'">
                                                    <i class="el-icon-folder" style="color:#FFC107;"></i>
                                                    <el-tooltip placement="top" open-delay="500" :content="node.label">
                                                        <span>#{node.label | pickShortLabel}#</span>
                                                    </el-tooltip>
                                                    <el-dropdown v-show="data.show && mxAuth.isAdmin" style="float:right;width:14px;margin:0 5px;" trigger="click">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-more el-icon--right" style="color:#000000;"></i>
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
                                                    <el-tooltip placement="top" open-delay="500" :content="node.label">
                                                        <span>#{node.label | pickShortLabel}#</span>
                                                    </el-tooltip>
                                                    <el-button v-show="data.show" type="text" @click.stop="onDownload(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-download"></el-button>
                                                    <el-button v-show="data.show && mxAuth.isAdmin" type="text" @click.stop="onDelete(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete"></el-button>
                                                </span>
                                            </span> 
                                        </el-tree>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickShortLabel(item){
                            return _.truncate(item, {
                                        'length': 16,
                                        'omission': ' ...'
                                    });
                        }
                    },
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
                            
                            this.$set(item, 'children', childrenData);
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

                                let _attr = {remark: '', rate: 0};
                
                                let rtn = fsHandler.fsNew('dir', item.fullname, value, null, _attr);
                                
                                if(rtn == 1){
                                    this.$message({
                                        type: "success",
                                        message: "新建目录成功！"
                                    })

                                    // 刷新
                                    this.onRefresh(item,index);

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
                            this.$prompt('请输入知识文件名称', '提示', {
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

                                let _attr = {remark: '', rate: 0};

                                let content = fsHandler.callFsJScript("/matrix/knowledge/getDefaultContent.js",null).message;
                
                                let rtn = fsHandler.fsNew('md', item.fullname, [value,'md'].join("."), content, _attr);
                                
                                if(rtn == 1){
                                    this.$message({
                                        type: "success",
                                        message: "新建成功！"
                                    })

                                    // 刷新
                                    this.onRefresh(item,index);

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
                            const self = this;

                            this.$confirm(`确认要删除该知识：${item.name}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
                                let rtn = fsHandler.fsDelete(item.parent,item.name);
                                
                                if(rtn == 1){
                                    this.$message({
                                        type: "success",
                                        message: "删除成功！"
                                    })
                                    
                                    // 刷新
                                    try{
                                        let childrenData = fsHandler.fsList(item.parent);
                                        let parent = this.$refs.tree.getNode(item.parent)
                                        this.$set(parent.data, 'children', childrenData);
                                    } catch(err){
                                        this.initData();
                                    }
                                    
                                    

                                } else {
                                    this.$message({
                                        type: "error",
                                        message: "删除失败！"
                                    })
                                }

                            }).catch((err) => {
                                console.log(err)
                            });
                        },
                        onUpload(item,index){
                            const self = this;

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
                                                        :data="upload.ifIndex"
                                                        :on-success="onSuccess"
                                                        :on-error="onError"
                                                        :before-upload="onBeforeUpload"
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
                                        fileList: [],
                                        ifIndex: {index:true}
                                    }
                                },
                                created(){
                                    
                                },
                                methods: {
                                    onBeforeUpload(file){
                                        
                                    },
                                    onSuccess(res,file,FileList){
                                        this.upload.fileList = FileList;
                                        
                                        _.forEach(FileList,(v)=>{
                                            try{
                                                
                                                let attr = {remark: '', rate:0};
                                                fsHandler.fsUpdateAttr(item.parent, v.name, attr);

                                            } catch(err){
                                                let attr = {remark: '', rate:0};
                                                fsHandler.fsUpdateAttr(item.parent, v.name, attr);
                                            }
                                        })

                                        // 刷新
                                        self.onRefresh(item,index);

                                    },
                                    onError(res,file,FileList){
                                        

                                    },
                                    onRemove(file, fileList) {
                                        fsHandler.fsDeleteAsync(item.fullname,file.name).then( (rtn)=>{
                                            if(rtn == 1){
                                                // 刷新
                                                self.onRefresh(item,index);
                                            }
                                        } );
                                        
                                    },
                                    onPreview(file) {
                                        console.log(file);
                                    }
                                }
                            }).$mount(`#${wndID}`);
                            
                        },
                        onDownload(item,index){
                            let url = `/fs/${item.fullname}?type=download&issys=true`;
                            window.open(url,"_blank");
                        },
                        onFilterNode:_.debounce(function(value, data) {
                            if (!value) return true;

                            try{
                                fsHandler.callFsJScriptAsync("/matrix/fs/getFsByTerm.js", encodeURIComponent(value)).then( (rtn)=>{
                                    this.treeData = rtn.message;
                                } );
                                
                            } catch(err){
                                this.treeData = [];
                            }

                        },1000),
                        onNodeClick(data){
                            if(!data.isdir) {
                                
                                fsHandler.fsListAsync(data.fullname).then( (rtn)=>{
                                    this.$set(data, 'children', rtn);

                                    let content = fsHandler.fsContent(data.parent, data.name);
                                    this.$root.model = {item:data, content: content};
                                } );
                                
                            } else {
                                fsHandler.fsListAsync(data.fullname).then( (rtn)=>{
                                    this.$set(data, 'children', rtn);
                                } );
                            }
                        },
                        onInit(){

                            fsHandler.callFsJScriptAsync("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root)).then( (rtn)=>{
                                
                                this.treeData = rtn.message; 
                                
                                fsHandler.fsListAsync(this.treeData[2].fullname).then( (val)=>{
                                    
                                    this.$set(this.treeData[2], 'children', val);

                                    // 默认首页
                                    let homeNode = null;
                                    let content = null;
                                    if(_.isEmpty(this.defaultNote)){
                                        homeNode = _.find(_.flattenDeep(_.map(this.treeData,'children')),{name: '系统介绍.md'});
                                        _.extend(homeNode,{
                                            size: _.find(fsHandler.fsList(homeNode.parent),{name: homeNode.name}).size || 0
                                        });
                                        content = fsHandler.fsContent(homeNode.parent, homeNode.name);
                                    } else {
                                        content = fsHandler.fsContent(this.defaultNote[0], this.defaultNote[1]);
                                        homeNode = _.find(fsHandler.fsList(this.defaultNote[0]),{name: this.defaultNote[1]});
                                        _.extend(homeNode,{
                                            size: _.find(fsHandler.fsList(homeNode.parent),{name: homeNode.name}).size || 0
                                        });
                                    }
                                    
                                    this.$root.model = {item:homeNode, content: content};

                                } );
                            });
                        }
                    }
                });

                // Notes View
                Vue.component('notes-view',{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:40px;line-height:40px;">
                                        <span style="font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;" v-if="!_.isEmpty(model)">
                                            #{model.item.name | pickName}#
                                        </span>
                                        <el-tooltip content="保存" open-delay="800">
                                            <el-button type="text" icon="el-icon-position" @click="onSaveNow" style="margin-left:10px;float:right;" :loading="tip.loading">
                                                <span style="padding-left:20px;font-size:12px;" v-if="tip.loading">#{tip.message}#</span>
                                            </el-button>
                                        </el-tooltip>
                                        <el-tooltip content="预览模式" open-delay="800">
                                            <el-button type="text" icon="el-icon-s-platform" @click="mode='view'" style="margin-left:10px;float:right;"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="编辑模式" open-delay="800">
                                            <el-button type="text" icon="el-icon-edit" @click="mode='edit'" style="float:right;"></el-button>
                                        </el-tooltip>
                                        
                                        <el-button icon="el-icon-share" type="text" class="copy" style="margin-left:10px;float:right;" @click="onShareUrl"></el-button>
                                        
                                    </el-header>
                                    <el-main style="height:100%;overflow:hidden;">
                                        <el-container style="height:100%;">
                                            <el-aside style="width:50%;" ref="editor">
                                            </el-aside>
                                            <el-main style="width:50%;height:100%;" ref="content" v-html="compiledMarkdown">
                                            </el-main>
                                        </el-container>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickName(name){
                            try{
                                return _.head(name.split(".md"));
                            } catch(err){
                                return name;
                            }
                        }
                    },
                    data(){
                        return {
                            editor: {
                                inst:  null,
                                ignore: false,
                                changed: false
                            },
                            splitInst: null,
                            compiledMarkdown: "",
                            mdOption: {
                                renderer: new marked.Renderer(),
                                gfm: true,
                                tables: true,
                                breaks: false,
                                pedantic: false,
                                sanitize: false,
                                smartLists: true,
                                smartypants: false
                            },
                            mode:"view",
                            tip: {
                                message: "",
                                loading: false
                            }
                        }
                    },
                    watch:{
                        model:{
                            handler(val,oldVal){
                                
                                if(_.isEmpty(val)) return false;

                                if(this.editor.inst){
                                    
                                    this.editor.ignore = true;
                                    this.editor.inst.setValue(val.content);
                                    this.editor.ignore = false;

                                    this.mdOption.renderer.code = function (code, language) {
                                        if(language == 'mermaid')
                                            return '<pre class="mermaid">'+code+'</pre>';
                                        else
                                            return '<pre><code>'+code+'</code></pre>';
                                    };
                                    this.compiledMarkdown = marked(val.content,{ renderer: this.mdOption.renderer });
                                    mermaid.init();
                                }
                            },
                            deep:true
                        },
                        mode:{
                            handler(val,oldVal){
                                if(val === 'view'){
                                    $(this.$refs.editor.$el).hide();
                                    //this.splitInst.setSizes([0, 100]);
                                } else {
                                    $(this.$refs.editor.$el).show();
                                    //this.splitInst.setSizes([50, 50]);
                                }
                            }
                        }
                    },
                    mounted(){
                        this.$nextTick(()=>{
                            //this.initSplit();
                            this.initEditor();
                            $(this.$refs.editor.$el).hide();
                        })
                    },
                    methods: {
                        initEditor(){
                            try{
                                // Editor
                                this.editor.inst = ace.edit(this.$refs.editor.$el);
                                this.editor.inst.setOptions({
                                    //maxLines: 1000,
                                    minLines: 20,
                                    autoScrollEditorIntoView: false,
                                    enableBasicAutocompletion: false,
                                    enableLiveAutocompletion: false
                                });
                                this.editor.inst.on("input", ()=> {
                                    
                                    if(this.editor.changed) {
                                        this.editor.changed = false;
                                    }

                                });
                                this.editor.inst.on('change', ()=> {

                                    if (!this.editor.ignore) {
                                        this.editor.changed = true;

                                        this.mdOption.renderer.code = function (code, language) {
                                            if(language == 'mermaid')
                                                return '<pre class="mermaid">'+code+'</pre>';
                                            else
                                                return '<pre><code>'+code+'</code></pre>';
                                        };
                                        
                                        this.compiledMarkdown = marked(this.editor.inst.getValue(),{ renderer: this.mdOption.renderer });
                                        mermaid.init();
    
                                        this.onSave();
                                    }
                                });
                                this.editor.inst.setTheme("ace/theme/tomorrow");
                                this.editor.inst.getSession().setMode("ace/mode/markdown");
                                this.editor.inst.renderer.setShowGutter(false);
                                
                                if(!_.isEmpty(this.model.content)){
                                    this.editor.ignore = true;
                                    this.editor.inst.setValue(this.model.content);
                                    this.editor.ignore = false;
                                }
                            } catch(err){
                                console.log(err)
                            }

                        },
                        initSplit(){
                            if(!this.splitInst){
                                this.splitInst = Split([this.$refs.editor.$el, this.$refs.content.$el], {
                                    sizes: [0, 100],
                                    minSize: [0, 0],
                                    gutterSize: 5,
                                    cursor: 'col-resize',
                                    direction: 'horizontal',
                                    expandToMin: true
                                });
                            }
                        },
                        onShareUrl(){
                            
                            var clipboard = new Clipboard('.copy', {
                                text: (trigger)=>{
                                    
                                    this.$message({
                                        type: "info",
                                        message: "已复制！"
                                    });
                                    
                                    let url = `${window.location.origin}/matrix/notes?parent=${encodeURIComponent(this.model.item.parent)}&name=${ encodeURIComponent(this.model.item.name)}`;
                                    return url;
                                }
                            });
                            _.delay(()=>{
                                clipboard.destroy();
                            },1000)
                            
                            
                        },
                        onSave: _.debounce(function(){
                                    const self = this;
                                    self.tip.loading = true;
                                    self.onSaveNow();
                                },2000),
                        onSaveNow(){
                            
                            this.tip.loading = true;
                            this.tip.message = "更新中...";

                            let attr = {remark: '', ctime: _.now(), author: window.SignedUser_UserName};
                            fsHandler.fsNewAsync(this.model.item.ftype, this.model.item.parent, this.model.item.name, this.editor.inst.getValue(), attr).then( (rtn) => {
                                if(rtn == 1){
                                    this.tip.message = "更新成功";
                                } else {
                                    this.tip.message = "更新失败";
                                }

                                setTimeout(()=>{
                                    this.tip.message = "";
                                    this.tip.loading = false;
                                },1000)
                            });
                        }
    
                    }
                });
    
                mxNotes.app = new Vue({
                    delimiters: ['${', '}'],
                    data:{
                        model: null,
                        defaultNote : []
                    },
                    created(){
                        // 接收参数
                        if(mx.urlParams['parent'] && mx.urlParams['name']){
                            this.defaultNote = [decodeURIComponent(mx.urlParams['parent']),decodeURIComponent(mx.urlParams['name'])];
                        } 
                    },
                    template:   `<el-container style="height:calc(100vh - 85px);background:#ffffff;">
                                    <el-main style="padding:0px;overflow:hidden;" ref="mainView">
                                        <notes-view :model="model" ref="viewRef"></notes-view>
                                    </el-main>
                                    <el-aside style="width:20em;overflow:hidden;background:#f7f7f7;" ref="leftView">
                                        <notes-tree :defaultNote="defaultNote" ref="treeRef"></notes-tree>
                                    </el-aside>
                                </el-container>`
                }).$mount("#app");

            })

        })

    }

}

let mxNotes = new Notes();
mxNotes.init();