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
                            "search-base-component",
                            "mx-tag",
                            "mx-tag-tree"
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
                            },
                            timer: null
                        }
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:35px;line-height:35px;padding:0px 10px;">
                                        <h5>
                                            <el-link :underline="false" @click="initData" style="color:#000000;">热点排名</el-link>
                                        </h5>
                                    </el-header>
                                    <el-main style="padding:0px 10px; height: 100%;overflow-x:hidden;display: flex;
                                                    flex-wrap: wrap;
                                                    overflow: auto;
                                                    align-content: flex-start;">
                                        <el-tooltip placement="top" open-delay="800" :content="item.name" 
                                            v-for="(item, index) in knowledge.list"
                                            :key="item.id"
                                            v-if="!_.isEmpty(knowledge.list)">
                                            <el-button type="text" 
                                                @click="onOpen(item)" 
                                                style="height:30px;color:#555555;width: 100%;text-align: left;margin-left: 10px;">
                                                #{index+1}#. #{item.name | pickShortLabel}# <span style="font-size:8px;color:#999999;"> 阅读(#{item.rate}#)</span>
                                            </el-button>
                                        </el-tooltip>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        formatTime(item){
                            return moment(item).format("YYYY-MM-DD HH:mm:ss");
                        },
                        pickShortLabel(item){
                            return _.truncate(item, {
                                        'length': 20,
                                        'omission': ' ...'
                                    });
                        }
                    },
                    created(){
                        this.initData();

                        this.timer = setInterval(()=>{
                                        this.initData();
                                    },30 * 1000);
                    },
                    methods: {
                        initData(){
                            
                            fsHandler.callFsJScriptAsync("/matrix/knowledge/knowledgeListTopN.js",encodeURIComponent('')).then((rtn)=>{
                                this.$set(this.knowledge,'list', rtn.message);
                            })
                            
                        },
                        onOpen(data){
                            this.$root.onOpen(data);
                        }
                    },
                    beforeDestroy() {
                        clearInterval(this.timer);
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
                                    <el-header style="height:35px;line-height:35px;padding:0px 10px;display:flex;background:#f2f2f2;">
                                        <span style="width:40%;"><h5 style="color:#000000;">知识分类</h5></span>
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
                                                :default-expand-all="true"
                                                @node-click="onNodeClick"
                                                :filter-node-method="onFilterNode"
                                                :expand-on-click-node="false"
                                                style="background:transparent;"
                                                ref="tree">
                                            <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                                                <span v-if="data.ftype=='dir'">
                                                    <i class="el-icon-folder" style="color:#FFC107;"></i>
                                                    <el-tooltip placement="top" open-delay="800" :content="node.label">
                                                        <span>#{node.label | pickShortLabel}# 
                                                            <span v-if="data.children">(#{data.children.length}#)</span>
                                                        </span>
                                                    </el-tooltip>
                                                    <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;" trigger="click">
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
                                                    <el-tooltip placement="top" open-delay="800" :content="node.label">
                                                        <span>#{node.label | pickShortLabel}#</span>
                                                    </el-tooltip>
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
                                        'length': 16,
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
                            
                            if(_.isEmpty(index)){
                                this.initData();
                            } else {
                                fsHandler.fsListAsync(item.fullname).then((rtn)=>{
                                    this.$set(item, 'children', rtn);
                                });
                            }
                        
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
                
                                fsHandler.fsNewAsync('dir', item.fullname, value, null, _attr).then((rtn)=>{
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
                                });
                                
                                
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

                                fsHandler.callFsJScriptAsync("/matrix/knowledge/getDefaultContent.js",null).then((rtn)=>{
                                    let content = rtn.message;

                                    fsHandler.fsNewAsync('md', item.fullname, [value,'md'].join("."), content, _attr).then((rt)=>{
                                        if(rt == 1){
                                            this.$message({
                                                type: "success",
                                                message: "新建成功！"
                                            })
    
                                            // 刷新
                                            this.onRefresh(item,index);
    
                                        } else {
                                            this.$message({
                                                type: "error",
                                                message: "新建失败，" + rt.message
                                            })
                                        }
                                    });
                                
                                });
                
                                
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
								
                                fsHandler.fsDeleteAsync(item.parent,item.name).then((rtn)=>{
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
                                });
                                

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
                                        url: `/fs${item.fullname}?issys=true`,
                                        fileList: [],
                                        ifIndex: {index:true}
                                    }
                                },
                                methods: {
                                    onBeforeUpload(file){
                                        
                                    },
                                    onSuccess(res,file,FileList){
                                        this.upload.fileList = FileList;
                                        
                                        _.forEach(FileList,(v)=>{
                                            let attr = {remark: '', rate:0};
                                            fsHandler.fsUpdateAttrAsync(item.parent, v.name, attr);
                                        })

                                        // 刷新
                                        self.onRefresh(item,index);

                                        this.$message({
                                            type: "success",
                                            dangerouslyUseHTMLString: true,
                                            message: `上传成功！`
                                        })

                                    },
                                    onError(res,file,FileList){
                                        this.$message({
                                            type: "error",
                                            dangerouslyUseHTMLString: true,
                                            message: `上传失败，请确认！`
                                        })
                                    },
                                    onRemove(file, fileList) {
                                        fsHandler.fsDeleteAsync(item.fullname,file.name).then((rtn)=>{
                                            if(rtn == 1){
                                                // 刷新
                                                self.onRefresh(item,index);
                                            }
                                        });
                                        
                                    },
                                    onPreview(file) {
                                        
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
                                fsHandler.callFsJScriptAsync("/matrix/fs/getFsByTerm.js", encodeURIComponent(value)).then((rtn)=>{
                                    this.treeData = rtn.message;
                                });
                            } catch(err){
                                this.treeData = [];
                            }
                        },1000),
                        onNodeClick(data){
                            
                            try{
                                // 文件
                                if(!data.isdir) {
                                    
                                    // 打开操作
                                    this.$root.onOpen(data);

                                } 
                                // 目录
                                else {
                                    fsHandler.fsListAsync(data.fullname).then((rtn)=>{
                                        this.$set(data, 'children', rtn);
                                    });
                                }
                            } catch(err){
                                console.log(err)
                            }
                        },
                        initData(){
                            fsHandler.callFsJScriptAsync("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root)).then((rt)=>{
                                let rtn = rt.message;

                                this.treeData = _.map(rtn,(v)=>{
                                    return _.extend(v,{show:false});
                                });
                                
                                try{
                                    // let childrenData = fsHandler.fsList(this.treeData[2].fullname);
                                    // this.$set(this.treeData[2], 'children', childrenData);
    
                                    // 默认首页
                                    let homeNode = _.find(this.treeData,{name: '知识通介绍.md'}) || _.find(_.flattenDeep(_.map(this.treeData,'children')),{name: '知识通介绍.md'});
                                    
                                    let item = _.extend(homeNode,{
                                        size: _.find(fsHandler.fsList(homeNode.parent),{name: homeNode.name}).size || 0
                                    });
                                    
                                    this.$root.model = {item:homeNode, content:fsHandler.fsContent(homeNode.parent, homeNode.name)};
    
                                } catch(err){
                                    this.$root.model = null;
                                }
                            });
                            
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
                            }
                        }
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:auto;padding:0px;display:flex;flex-wrap: wrap;align-content: flex-start;">
                                        <el-button type="default" @click="onFilter('all')" style="margin:5px;">全部(#{model.length}#)</el-button>
                                        <el-button type="default" 
                                            v-for="(item, key) in _.groupBy(model,'parent')" 
                                            :key="key" 
                                            @click="onFilter(key)" 
                                            style="margin:5px;">#{ key | pickParentName}#(#{ _.size(item) }#)</el-button>
                                    </el-header>
                                    <el-main style="height:100%;padding:0px;">
                                        <div v-for="(item, index) in knowledge.list" :key="index" v-if="item.ftype!='dir'">
                                            <el-card v-if="item.ftype=='md'">
                                                <el-button type="text" @click="$root.onOpen(item)"><h4>#{item.name}#</h4></el-button>
                                                <div style="display: flex;
                                                            height: auto;
                                                            line-height: 40px;
                                                            padding: 0px 20px 0 0;"> 
                                                    <div style="width:90%;display: -webkit-box;">
                                                        <span><i class="el-icon-user"></i> #{item.author}#</span>
                                                        <el-divider direction="vertical"></el-divider>
                                                        编辑于  #{ item | pickTime }#
                                                        <el-divider direction="vertical"></el-divider>
                                                        位置 #{ item.parent }#
                                                        <el-divider direction="vertical"></el-divider>
                                                        <i class="el-icon-price-tag" style="color:#409eff;"></i>
                                                        <mx-tag domain='knowledge' :model.sync="item.tags" :id="item.id" limit="4" ></mx-tag>
                                                    </div>
                                                    <div style="width:10%;text-align:right;">
                                                        阅读 ( #{item | pickRate}# )
                                                    </div>
                                                </div>
                                            </el-card>
                                            <el-card v-else>
                                                <el-button type="text" @click="$root.onOpen(item)"><h4>#{item.name}#</h4></el-button>
                                                <div style="display: flex;
                                                            height: auto;
                                                            line-height: 40px;
                                                            padding: 0px 20px 0 0;"> 
                                                    <div style="width:90%;display: -webkit-box;">
                                                        <span><i class="el-icon-user"></i> #{item.author}#</span>
                                                        <el-divider direction="vertical"></el-divider>
                                                        编辑于 #{ item | pickTime }#
                                                        <el-divider direction="vertical"></el-divider>
                                                        位置 #{ item.parent }#
                                                        <el-divider direction="vertical"></el-divider>
                                                        <i class="el-icon-price-tag" style="color:#409eff;"></i>
                                                        <mx-tag domain='knowledge' :model.sync="item.tags" :id="item.id" limit="4" ></mx-tag>
                                                    </div>
                                                    <div style="width:10%;text-align:right;">
                                                        阅读 ( #{item | pickRate}# )
                                                    </div>
                                                </div>
                                            </el-card>
                                            <el-divider></el-divider>
                                        </div>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickTime(item){
                            
                            try{
                                let mtime = item.mtime;
                                return moment(mtime).format(mx.global.register.format);
                            } catch(err){
                                return moment(item.vtime).format(mx.global.register.format);
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
                        pickParentName(parent){
                            try{
                                return _.last(parent.split("/"));
                            } catch(err){
                                return parent;
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
                            let getRate = function(item){
                                try{
                                    return _.attempt(JSON.parse.bind(null, item.attr)).rate || 0;
                                } catch(err){
                                    return 0;
                                }
                            };

                            this.knowledge.list = _.orderBy(_.map(this.model,(v)=>{
                                
                                if( v.ftype == 'md' ){
                                    //return _.extend(v,{content:fsHandler.fsContent(v.parent,v.name)});
                                    return _.extend(v,{content:'', rate: getRate(v)});
                                } else {
                                    return _.extend(v,{content:'', rate: getRate(v)});
                                }

                            }),['rate'],['desc'])
                        },
                        onFilter(item){
                            
                            let filtered = [];
                            
                            if( item == 'all' ){
                                filtered = this.model;
                            } else {

                                filtered = _.filter(this.model,{parent:item});
                            }
                            
                            this.knowledge.list = _.map(filtered,(v)=>{
                                
                                if( v.ftype == 'md' ){
                                    return _.extend(v,{content:fsHandler.fsContent(v.parent,v.name)});
                                } else {
                                    return _.extend(v,{content:''});
                                }
                            })
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
                            mode:"view",
                            tip: {
                                message: "",
                                loading: false
                            }
                        }
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
                                    this.editor.setValue(val.content,1);
                                    
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
                                    let editor = ace.edit(this.$refs.editor.$el);
                                    editor.focus(); 
                                    let row = editor.session.getLength() - 1;
                                    let column = editor.session.getLine(row).length;
                                    editor.gotoLine(row + 1, column);

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
                                    this.mdOption.renderer.code = function (code, language) {
                                        if(language == 'mermaid')
                                            return '<pre class="mermaid">'+code+'</pre>';
                                        else
                                            return '<pre><code>'+code+'</code></pre>';
                                    };
                                    this.compiledMarkdown = marked(this.editor.getValue(),{ renderer: this.mdOption.renderer });
                                    mermaid.init();
                                    this.onSave();
                                });
                                this.editor.setTheme("ace/theme/tomorrow");
                                this.editor.getSession().setMode("ace/mode/markdown");
                                this.editor.renderer.setShowGutter(false);
                                this.editor.focus(); //To focus the ace editor
                                let row = this.editor.session.getLength() - 1;
                                let column = this.editor.session.getLine(row).length;
                                this.editor.gotoLine(row + 1, column);
                                
                                if(!_.isEmpty(this.model.content)){
                                    this.editor.setValue(this.model.content,1);
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
                        onSaveNow(){
                            this.tip.loading = true;
                            this.tip.message = "更新中...";

                            try{
                                let attr = null;
                                
                                if(_.isEmpty(this.model.item.attr)){
                                    attr = {remark: '', rate:1};
                                } else {
                                    attr = _.attempt(JSON.parse.bind(null, this.model.item.attr));
                                    if(attr.rate){
                                        _.extend(attr, {rate:attr.rate + 1});    
                                    } else {
                                        _.extend(attr, {rate:1}); 
                                    }
                                }
                                
                                fsHandler.fsNewAsync(this.model.item.ftype, this.model.item.parent, this.model.item.name, this.editor.getValue(), attr).then( (rtn)=>{
                                    if(rtn == 1){
                                        this.tip.message = "更新成功";
                                    } else {
                                        this.tip.message = "更新失败";
                                    }
    
                                    setTimeout(()=>{
                                        this.tip.message = "";
                                        this.tip.loading = false;
                                    },1000)
                                } );
                                
                            } catch(err){

                            }
                            
                        },
                        onSave: _.debounce(function(){
                                    const self = this;
                                    self.tip.loading = true;
                                    self.onSaveNow();
                                },3000)
    
                    }
                });
    
                mxKnowledge.app = new Vue({
                    delimiters: ['#{', '}#'],
                    data:{
                        model:{},
                        search: {
                            term: "",
                            result: [],
                            loading: true
                        }
                    },
                    template:   `<el-container style="height:calc(100vh - 85px);">
                                    <el-header style="height:40px;line-height:40px;padding: 0px;margin-bottom: 5px;display:flex;">
                                        <el-input placeholder="请输入搜索关键字" 
                                            v-model="search.term" 
                                            v-loading="search.loading"
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
                                            <el-aside style="width:300px;overflow:hidden;background:#f2f2f2;margin:-20px -20px 0 0;" ref="leftView">
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
                                fsHandler.callFsJScriptAsync("/matrix/knowledge/searchByTerm.js",encodeURIComponent(this.search.term)).then((rt)=>{
                                    let rtn = rt.message;
                                    
                                    if(_.isEmpty(rtn)){
                                        this.search.result = [];
                                    } else {
                                        this.search.result = rtn;
                                    }
                                });
                                
                            } catch(err){
                                this.search.result = [];
                            } finally {
                                this.search.loading = false;
                            }
                        },
                        onClear(){
                            this.search.term = "";
                            this.onSearch();
                        },
                        onOpen(data){
                            try{
                                if(_.includes(['md','txt','log'],data.ftype)){
                                    
                                    let wnd = null;

                                    try{
                                        if(jsPanel.activePanels.getPanel(`jsPanel-${data.name}`)){
                                            jsPanel.activePanels.getPanel(`jsPanel-${data.name}`).close();
                                        }
                                    } catch(error){

                                    }
                                    finally{
                                        wnd = maxWindow.winApp(data.name, `<div id="mdView"></div>`, null,null);
                                    }

                                    new Vue({
                                        delimiters: ['#{', '}#'],
                                        data: {
                                            model: null,
                                            item: data
                                        },
                                        template: `<el-container style="width:100%;height:100%;">
                                                        <el-main style="overflow:hidden;padding:0px;">
                                                            <knowledge-view :model="model" ref="viewRef" v-if="!_.isEmpty(model)"></knowledge-view>
                                                        </el-main>
                                                        <el-footer style="height:30px;line-height:30px;">
                                                            <span><i class="el-icon-user"></i> #{item.author}#</span>
                                                            <el-divider direction="vertical"></el-divider>
                                                            编辑于 #{ item | pickTime }#
                                                        </el-footer>
                                                    </el-container>`,
                                        filters:{
                                            pickTime(item){
                
                                                try{
                                                    let mtime = item.mtime;
                                                    return moment(mtime).format(mx.global.register.format);
                                                } catch(err){
                                                    return moment(item.vtime).format(mx.global.register.format);
                                                }
                                            }
                                        },
                                        created(){
                                            this.model = {item:data, content:fsHandler.fsContent(data.parent, data.name)};
                                        }
                                    }).$mount("#mdView");
                                    
                                } else if(_.includes(['pdf'],data.ftype)){
                                    let contents = `<section class="is-vertical el-container" style="width:100%;height:100%;">
                                                        <main class="el-main" style="overflow:hidden;padding:0px;">
                                                            <iframe src="/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}" style="width: 100%;height: 100%;" frameborder="0"></iframe>
                                                        </main>
                                                        <footer class="el-footer" style="height:30px;line-height:30px;"></footer>
                                                    </section>`;

                                    let wnd = maxWindow.winApp(data.name, contents, null,null);
                                } else if(_.includes(['png','gif','jpg','jpeg'],data.ftype)){
                                    
                                    let wnd = maxWindow.winApp(data.name, `<div id="picView"></div>`, null,null);
                                    new Vue({
                                        delimiters: ['#{', '}#'],
                                        data: {
                                            item: data,
                                            loading: true,
                                            url: `/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}`,
                                            srcList: [`/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}`]
                                        },
                                        template: `<el-container style="width:100%;height:100%;">
                                                        <el-main style="overflow:hidden;background:#333333;">
                                                            <el-image 
                                                                v-loading="loading"
                                                                style="width: 100%; height: 100%"
                                                                :src="url" 
                                                                :preview-src-list="srcList"
                                                                @load="loading=false"
                                                                @error="loading=false">
                                                            </el-image>
                                                        </el-main>
                                                        <el-footer style="height:30px;line-height:30px;">
                                                            <span><i class="el-icon-user"></i> #{item.author}#</span>
                                                            <el-divider direction="vertical"></el-divider>
                                                            编辑于 #{ item | pickTime }#
                                                        </el-footer>
                                                    </el-container>`,
                                        filters:{
                                            pickTime(item){
                
                                                try{
                                                    let mtime = item.mtime;
                                                    return moment(mtime).format(mx.global.register.format);
                                                } catch(err){
                                                    return moment(item.vtime).format(mx.global.register.format);
                                                }
                                            }
                                        },
                                        created(){
                                            this.model = {item:data, content:fsHandler.fsContent(data.parent, data.name)};
                                        }
                                    }).$mount("#picView");

                                } else if(_.includes(['mov','mp3','mp4','wav','swf'],data.ftype)){
                                    
                                    let wnd = maxWindow.winApp(data.name, `<div id="movView"></div>`, null,null);

                                    new Vue({
                                        delimiters: ['#{', '}#'],
                                        data: {
                                            item: data,
                                            url: `/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}`
                                        },
                                        template: `<el-container style="width:100%;height:100%;">
                                                        <el-main style="overflow:hidden;background:#333333;">
                                                            <video :src="url" width="100%" height="100%" 
                                                                controls="controls" autoplay
                                                                style="background-image: url(/fs/assets/images/files/png/matrix.png?type=open&issys=true);
                                                                        background-repeat: no-repeat;
                                                                        background-position-x: center;
                                                                        background-position-y: center;">
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        </el-main>
                                                        <el-footer style="height:30px;line-height:30px;">
                                                            <span><i class="el-icon-user"></i> #{item.author}#</span>
                                                            <el-divider direction="vertical"></el-divider>
                                                            编辑于 #{ item | pickTime }#
                                                        </el-footer>
                                                    </el-container>`,
                                        filters:{
                                            pickTime(item){
                
                                                try{
                                                    let mtime = item.mtime;
                                                    return moment(mtime).format(mx.global.register.format);
                                                } catch(err){
                                                    return moment(item.vtime).format(mx.global.register.format);
                                                }
                                            }
                                        },
                                        created(){
                                            this.model = {item:data, content:fsHandler.fsContent(data.parent, data.name)};
                                        }
                                    }).$mount("#movView");

                                } else {
                                    let url = `/fs${data.fullname}?type=download&issys=true`;
                                    window.open(url,"_blank");
                                }
                            } catch(err){

                            } finally{
                                // 更新rate
                                try{
                                    let attr = null;
                                    
                                    if(_.isEmpty(data.attr)){
                                        attr = {remark: '', rate:1};
                                    } else {
                                        attr = _.attempt(JSON.parse.bind(null, data.attr));
                                        if(attr.rate){
                                            _.extend(attr, {rate:attr.rate + 1});    
                                        } else {
                                            _.extend(attr, {rate:1}); 
                                        }
                                    }
                                    
                                    fsHandler.fsUpdateAttrAsync(data.parent,data.name,attr).then((rtn)=>{
                                        this.onSearch();
                                    });
                                    
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