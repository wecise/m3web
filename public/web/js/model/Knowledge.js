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
class Knowledge {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["ai-robot-component",
                            "search-preset-component",
                            "search-base-component"
                        ],function() {

            $(function() {

                moment.locale(window.MATRIX_LANG);

                // knowledge-topn
                Vue.component("knowledge-topn",{
                    delimiters: ['#{', '}#'],
                    data() {
                        return {
                            knowledge: {
                                list:[]
                            }
                        }
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-main style="padding:0px 10px; height: 100%;overflow-x:hidden;">
                                        <h5><el-link :underline="false" @click="initData">热点排名</el-link></h5>
                                        <el-timeline>
                                            <el-timeline-item
                                                v-for="(item, index) in knowledge.list"
                                                :key="item.id"
                                                :timestamp="item.vtime | formatTime" 
                                                v-if="!_.isEmpty(knowledge.list)">
                                                <el-link :underline="false" @click="onOpen(item)">
                                                    #{index+1}#. #{item.name | pickShortLabel}# <span style="font-size:8px;color:#999999;"> 阅读(#{item.rate}#)</span>
                                                </el-link>
                                            </el-timeline-item>
                                        </el-timeline>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        formatTime(item){
                            return moment(item).format("YYYY-MM-DD HH:mm:ss");
                        },
                        pickShortLabel(item){
                            return _.truncate(item, {
                                        'omission': ' ...'
                                    });
                        }
                    },
                    created(){
                        this.initData();
                    },
                    methods: {
                        initData(){
                            
                            try{
                                let rtn = fsHandler.callFsJScript("/matrix/knowledge/knowledgeListTopN.js",encodeURIComponent('')).message;
                                
                                this.$set(this.knowledge,'list', rtn);   
                            } catch(err){
                                
                            }
                            
                        },
                        onOpen(data){
                            this.$root.onOpen(data);
                        }
                    }
                
                })

                // knowledge Tree
                Vue.component("knowledge-tree",{
                    delimiters: ['#{', '}#'],
                    data() {
                        return {
                            defaultProps: {
                                children: 'children',
                                label: 'name'
                            },
                            treeData: [],
                            root: `/opt/knowledge`,
                            filterText: ""
                        }
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:30px;line-height:30px;padding:0px 10px;display:flex;">
                                        <span style="width:40%;"><h5>知识分类</h5></span>
                                        <span style="width:60%;text-align:right;">
                                            <el-button type="text" @click="initData" icon="el-icon-refresh"></el-button>
                                            <el-button type="text" @click="onNewDir({'fullname':root})" icon="el-icon-folder-add"></el-button>
                                            <el-button type="text" @click="onNewFile({'fullname':root})" icon="el-icon-plus"></el-button>
                                        </span>
                                    </el-header>
                                    <el-main style="padding:0px 10px; height: 100%;overflow-x:hidden;">
                                        <el-tree :data="treeData" 
                                                :props="defaultProps" 
                                                node-key="fullname"
                                                highlight-current="true"
                                                default-expand-all="true"
                                                @node-click="onNodeClick"
                                                :filter-node-method="onFilterNode"
                                                style="background:transparent;"
                                                ref="tree">
                                            <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                                                <span v-if="data.ftype=='dir'">
                                                    <i class="el-icon-folder" style="color:#FFC107;"></i>
                                                    <span>#{node.label | pickShortLabel}#</span>
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
                                                    <span>#{node.label | pickShortLabel}#</span>
                                                    <el-button v-show="data.show" type="text" @click.stop="onDownload(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-download"></el-button>
                                                    <el-button v-show="data.show" type="text" @click.stop="onDelete(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete"></el-button>
                                                </span>
                                            </span>   
                                        </el-tree>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickShortLabel(item){
                            return _.truncate(item, {
                                        'omission': ' ...'
                                    });
                        }
                    },
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

                            this.$confirm(`确认要删除该知识：${item.name}？`, '提示', {
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
                        onDownload(item,index){
                            let url = `/fs/${item.fullname}?type=download&issys=true`;
                            window.open(url,"_blank");
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
                            if(!data.isdir) {
                                
                                let childrenData = fsHandler.fsList(data.fullname);
                                
                                this.$set(data, 'children', childrenData);

                                // 打开操作
                                this.$root.onOpen(data);
                            } else {
                                let childrenData = fsHandler.fsList(data.fullname);

                                this.$set(data, 'children', childrenData);
                            }
                        },
                        initData(){
                            let rtn = fsHandler.callFsJScript("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root)).message;
                            
                            this.treeData = _.map(rtn,(v)=>{
                                return _.extend(v,{show:false});
                            });
                            
                            let childrenData = fsHandler.fsList(this.treeData[2].fullname);
                            this.$set(this.treeData[2], 'children', childrenData);

                            // 默认首页
                            let homeNode = _.find(this.treeData,{name: '知识通介绍.md'}) || _.find(_.flattenDeep(_.map(this.treeData,'children')),{name: '知识通介绍.md'});
                            
                            let item = _.extend(homeNode,{
                                size: _.find(fsHandler.fsList(homeNode.parent),{name: homeNode.name}).size || 0
                            });
                            
                            this.$root.model = {item:homeNode, content:fsHandler.fsContent(homeNode.parent, homeNode.name)};
                        }
                    }
                });

                // knowledge list
                Vue.component('knowledge-list',{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Array
                    },
                    data(){
                        return {
                            knowledge: {
                                list: []
                            },
                            currentItem: null
                        }
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:auto;padding:0px;display:flex;flex-wrap: wrap;align-content: flex-start;">
                                        <el-button type="default" @click="onFilter('all')" style="margin:5px;">全部(#{model.length}#)</el-button>
                                        <el-button type="default" 
                                            v-for="(item, index) in model" 
                                            :key="index" 
                                            v-if="item.ftype=='dir'" 
                                            @click="onFilter(item)" 
                                            style="margin:5px;">#{item.name}#(#{ model,item | pickCount}#)</el-button>
                                    </el-header>
                                    <el-main style="height:100%;padding:0px;">
                                        <div v-for="(item, index) in knowledge.list" :key="index" v-if="item.ftype!='dir'">
                                            <el-card v-if="item.ftype=='md'">
                                                <el-button type="text" @click="$root.onOpen(item)"><h4>#{item.name}#</h4></el-button>
                                                <p> 
                                                    <span class="el-icon-user"></span> #{item | pickAuthor}#
                                                    <el-divider direction="vertical"></el-divider>
                                                    发布于#{ item | pickTime }#
                                                    <el-divider direction="vertical"></el-divider>
                                                    <el-select
                                                        v-model="item.tags"
                                                        multiple
                                                        filterable
                                                        allow-create
                                                        default-first-option
                                                        class="el-select-tags"
                                                        placeholder="标签"
                                                        @change="onChange"
                                                        @remove-tag="onRemoveTag"
                                                        @mouseover.native="currentItem = item"
                                                        style="width:300px;">
                                                        <el-option
                                                            v-for="tag in item.tags"
                                                            :key="tag"
                                                            :label="tag"
                                                            :value="tag">
                                                        </el-option>
                                                    </el-select>
                                                    <el-divider direction="vertical"></el-divider>
                                                    阅读 ( #{item | pickRate}# )
                                                </p>
                                                <!--knowledge-view :model="{item:item, content:fsHandler.fsContent(item.parent, item.name)}"></knowledge-view-->
                                            </el-card>
                                            <el-card v-else>
                                                <el-button type="text" @click="$root.onOpen(item)"><h4>#{item.name}#</h4></el-button>
                                                <p>
                                                    <span class="el-icon-user"></span> #{item | pickAuthor}#
                                                    <el-divider direction="vertical"></el-divider>
                                                    发布于#{ item | pickTime }#
                                                    <el-divider direction="vertical"></el-divider>
                                                    <el-select
                                                        v-model="item.tags"
                                                        multiple
                                                        filterable
                                                        allow-create
                                                        default-first-option
                                                        class="el-select-tags"
                                                        placeholder="标签"
                                                        @change="onChange"
                                                        @remove-tag="onRemoveTag"
                                                        @mouseover.native="currentItem = item"
                                                        style="width:300px;">
                                                        <el-option
                                                            v-for="tag in item.tags"
                                                            :key="tag"
                                                            :label="tag"
                                                            :value="tag">
                                                        </el-option>
                                                    </el-select>
                                                    <el-divider direction="vertical"></el-divider>
                                                    阅读 ( #{item | pickRate}# )
                                                </p>
                                            </el-card>
                                            <el-divider></el-divider>
                                        </div>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickTime(item){
                            return moment(item.vtime).format("LLL");
                        },
                        pickAuthor(item){
                            try{
                                return _.attempt(JSON.parse.bind(null, item.attr)).author || "";
                            } catch(err){
                                return "";
                            }
                        },
                        pickTags(item){
    
                            if(!_.isEmpty(item.tags)){
                                return item.tags.join(",");
                            } else {
                                return "";
                            }
                        },
                        pickRate(item){
                            
                            try{
                                return _.attempt(JSON.parse.bind(null, item.attr)).rate || 0;
                            } catch(err){
                                return 0;
                            }
                        },
                        pickCount(data,item){
                            try{
                                return _.size(_.filter(data,{parent:item.fullname}));
                            } catch(err){
                                return 0;
                            }
                        }
                    },
                    watch:{
                        model(val,oldVal){
                            this.initData();
                        }
                    },
                    created(){
                        this.initData();
                    },
                    methods: {
                        initData(){
                            this.knowledge.list = _.map(this.model,(v)=>{

                                if( v.ftype == 'md' ){
                                    return _.extend(v,{content:fsHandler.fsContent(v.parent,v.name)});
                                } else {
                                    return _.extend(v,{content:''});
                                }

                            })
                        },
                        onFilter(item){
                            
                            let filtered = [];
                            
                            if( item == 'all' ){
                                filtered = this.model;
                            } else {
                                filtered = _.filter(this.model,{parent:item.fullname});
                            }
                            
                            this.knowledge.list = _.map(filtered,(v)=>{
                                
                                if( v.ftype == 'md' ){
                                    return _.extend(v,{content:fsHandler.fsContent(v.parent,v.name)});
                                } else {
                                    return _.extend(v,{content:''});
                                }
                            })
                        },
                        onChange(val){
                            let input = {action: "+", tags: val, ids: [this.currentItem.id]};
                            let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
                        },
                        onRemoveTag(val){
                            let input = {action: "-", tags: [val], ids: [this.currentItem.id]};
                            let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
                        }
    
                    }
                });

                // knowledge View
                Vue.component('knowledge-view',{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            editor: null,
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
                            mode:"view"
                        }
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:40px;line-height:40px;">
                                        <span style="font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;" v-if="!_.isEmpty(model)">
                                            #{model.item.name | pickName}#
                                        </span>
                                        <el-button type="text" icon="el-icon-s-platform" @click="mode='view'" style="margin-left:10px;float:right;"></el-button>
                                        <el-button type="text" icon="el-icon-edit" @click="mode='edit'" style="float:right;"></el-button>
                                    </el-header>
                                    <el-main style="height:100%;padding:0px;overflow:hidden;">
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
                    watch:{
                        model:{
                            handler(val,oldVal){
                                if(this.editor){
                                    this.editor.setValue(val.content);
                                    this.compiledMarkdown = marked(val.content);
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
                                this.editor = ace.edit(this.$refs.editor.$el);
                                this.editor.setOptions({
                                    //maxLines: 1000,
                                    minLines: 20,
                                    autoScrollEditorIntoView: false,
                                    enableBasicAutocompletion: false,
                                    enableLiveAutocompletion: false
                                });
                                this.editor.on("input", ()=> {
                                    this.compiledMarkdown = marked(this.editor.getValue());
                                    this.onSave();
                                });
                                this.editor.setTheme("ace/theme/tomorrow");
                                this.editor.getSession().setMode("ace/mode/markdown");
                                this.editor.renderer.setShowGutter(false);
                                
                                if(!_.isEmpty(this.model.content)){
                                    this.editor.setValue(this.model.content);
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
                        onSave: _.debounce(function(){
                                    try{
                                        let attr = null;
                                        
                                        if(_.isEmpty(data.attr)){
                                            attr = {remark: '', ctime: _.now(), author: window.SignedUser_UserName, rate:1};
                                        } else {
                                            attr = _.attempt(JSON.parse.bind(null, data.attr));
                                            if(attr.rate){
                                                _.extend(attr, {rate:attr.rate + 1});    
                                            } else {
                                                _.extend(attr, {rate:1}); 
                                            }
                                        }
                                        
                                        fsHandler.fsNew(this.model.item.ftype, this.model.item.parent, this.model.item.name, this.editor.getValue(), attr);    
                                        
                                    } catch(err){

                                    }
                                    
                                },5000)
    
                    }
                });
    
                mxKnowledge.app = new Vue({
                    delimiters: ['#{', '}#'],
                    data:{
                        model:{},
                        search: {
                            term: "",
                            result: []
                        }
                    },
                    template:   `<el-container style="height:calc(100vh - 85px);">
                                    <el-header style="height:40px;line-height:40px;padding: 0px;margin-bottom: 5px;display:flex;">
                                        <el-input placeholder="请输入搜索关键字" 
                                            v-model="search.term" 
                                            @clear="onClear"
                                            @keyup.enter.native="onSearch"
                                            clearable
                                            style="height:35px;line-height:35px;border-radius:0px;">
                                        </el-input>
                                        <el-button type="primary" icon="el-icon-search" @click="onSearch"></el-button>
                                    </el-header>
                                    <el-main style="background:#ffffff;">
                                        <el-container style="height:100%;">
                                            <el-main style="padding:0px;overflow:hidden;" ref="mainView">
                                                <knowledge-list :model="search.result" ref="viewListRef" v-if="!_.isEmpty(search.result)"></knowledge-list>
                                                <div v-else>
                                                    <h4>很抱歉，没有找到与 #{search.term}# 相关的记录。</h4>
                                                    <p>温馨提示：  
                                                    请检查您的输入是否正确
                                                    如有任何意见或建议，请及时反馈给我们。
                                                     </p>
                                                </div>
                                            </el-main>
                                            <el-aside style="width:300px;overflow:hidden;background:#f2f3f5;margin:-20px -20px 0 0;" ref="leftView">
                                                <el-container style="height:100%;">
                                                    <el-header style="height:200px;line-height:200px;padding:0px;">
                                                        <knowledge-topn ref="topn"></knowledge-topn>
                                                    </el-header>
                                                    <el-main style="padding:0px;">
                                                        <knowledge-tree ref="tree"></knowledge-tree>
                                                    </el-main>
                                                </el-container>
                                            </el-aside>
                                        </el-container>
                                    </el-main>
                                </el-container>`,
                    watch: {
                        'search.term':function(val,oldVal){
                            if(_.isEmpty(val)){
                                this.onClear();
                            }
                        }
                    },
                    mounted() {
                        this.onSearch();
                    },
                    methods: {
                        onSearch(){
                            try{
                                let rtn = fsHandler.callFsJScript("/matrix/knowledge/searchByTerm.js",encodeURIComponent(this.search.term)).message;
                                
                                if(_.isEmpty(rtn)){
                                    this.search.result = [];
                                } else {
                                    this.search.result = rtn;
                                }
                                
                            } catch(err){
                                this.search.result = [];
                            }
                        },
                        onClear(){
                            this.search.term = "";
                            this.onSearch();
                        },
                        onOpen(data){
                            try{
                                if(_.includes(['md','txt'],data.ftype)){
                                    
                                    let wnd = maxWindow.winApp(data.name, `<div id="mdView"></div>`, null,null);
                                    new Vue({
                                        data: {
                                            model: null
                                        },
                                        template: `<el-container style="width:100%;height:100%;">
                                                        <el-main style="overflow:hidden;padding:0px;">
                                                            <knowledge-view :model="model" ref="viewRef"></knowledge-view>
                                                        </el-main>
                                                    </el-container>`,
                                        created(){
                                            this.model = {item:data, content:fsHandler.fsContent(data.parent, data.name)};
                                        }
                                    }).$mount("#mdView");
                                    
                                } else if(_.includes(['pdf'],data.ftype)){
                                    let contents = `<section class="is-vertical el-container" style="width:100%;height:100%;">
                                                        <main class="el-main" style="overflow:hidden;padding:0px;">
                                                            <iframe src="/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}" style="width: 100%;height: 100%;" frameborder="0"></iframe>
                                                        </main>
                                                    </section>`;

                                    let wnd = maxWindow.winApp(data.name, contents, null,null);
                                } else if(_.includes(['png','gif','jpg','jpeg'],data.ftype)){
                                    let contents = `<section class="is-vertical el-container" style="width:100%;height:100%;">
                                                        <main class="el-main" style="overflow:hidden;text-align:center;padding:100px;background:#333333;">
                                                            <div class="el-image" style="width: 100px; height: 100px;padding:50px;">
                                                                <img src="/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}" class="el-image__inner el-image__preview">
                                                            </div>
                                                        </main>
                                                    </section>`;
                                    let wnd = maxWindow.winApp(data.name, contents, null,null);
                                } else if(_.includes(['mov','mp3','mp4','wav','swf'],data.ftype)){
                                    let contents = `<section class="is-vertical el-container" style="width:100%;height:100%;">
                                                        <main class="el-main" style="overflow:hidden;padding:0px;">
                                                            <video src="/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}" width="100%" height="100%" 
                                                                controls="controls" autoplay
                                                                style="background-image: url(/fs/assets/images/files/png/matrix.png?type=open&issys=true);
                                                                        background-repeat: no-repeat;
                                                                        background-position-x: center;
                                                                        background-position-y: center;">
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        </main>
                                                    </section>`;

                                    let wnd = maxWindow.winApp(data.name, contents, null,null);
                                } else {
                                    let url = `/fs/${data.fullname}?type=download&issys=true`;
                                    window.open(url,"_blank");
                                }
                            } catch(err){

                            } finally{
                                // 更新rate
                                try{
                                    let attr = null;
                                    
                                    if(_.isEmpty(data.attr)){
                                        attr = {remark: '', ctime: _.now(), author: window.SignedUser_UserName, rate:1};
                                    } else {
                                        attr = _.attempt(JSON.parse.bind(null, data.attr));
                                        if(attr.rate){
                                            _.extend(attr, {rate:attr.rate + 1});    
                                        } else {
                                            _.extend(attr, {rate:1}); 
                                        }
                                    }
                                    
                                    fsHandler.fsUpdateAttr(data.parent,data.name,attr);
                                    
                                } catch(err){

                                }
                            }

                        }
                    }
                }).$mount("#app");

            })

        })

    }

}

let mxKnowledge = new Knowledge();
mxKnowledge.init();