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
                    data() {
                        return {
                            defaultProps: {
                                children: 'children',
                                label: 'name'
                            },
                            treeData: [],
                            root: "/assets/documents",
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
                                this.$root.model = {item:item, content:fsHandler.fsContent(data.parent, data.name)};
                            } else {
                                let root = data.parent + "/" + data.name;
                                let rtn = fsHandler.fsList(root);
                            }
                        },
                        onInit(){
                            this.treeData = fsHandler.callFsJScript("/matrix/devops/getFsForTree.js", encodeURIComponent(this.root)).message;
                            
                            // 默认首页
                            let homeNode = _.find(_.flattenDeep(_.map(this.treeData,'children')),{name: '系统介绍.md'});
                            
                            let item = {
                                alias: homeNode.alias,
                                children: homeNode.children,
                                ftype: homeNode.ftype,
                                fullname: homeNode.fullname,
                                id: homeNode.id,
                                name: homeNode.name,
                                parent: homeNode.parent,
                                size: _.find(fsHandler.fsList(homeNode.parent),{name: homeNode.name}).size || 0
                            };
                            this.$root.model = {item:homeNode, content:fsHandler.fsContent(homeNode.parent, homeNode.name)};
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
                                            #{model.item.name}#
                                        </span>
                                        <el-button type="text" icon="el-icon-s-platform" @click="mode='view'" style="margin-left:10px;float:right;"></el-button>
                                        <el-button type="text" icon="el-icon-edit" @click="mode='edit'" style="float:right;"></el-button>
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
                                console.log(11,this.$refs.editor.$el,this.$refs.content.$el)
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
                                    let attr = {remark: '', ctime: _.now(), author: window.SignedUser_UserName};
                                    let rtn = fsHandler.fsNew(this.model.item.ftype, this.model.item.parent, this.model.item.name, this.editor.getValue(), attr);
                                },5000)
    
                    }
                });
    
                mxNotes.app = new Vue({
                    delimiters: ['${', '}'],
                    data:{
                        model:{}
                    },
                    template:   `<el-container style="height:calc(100vh - 85px);background:#ffffff;">
                                    <el-main style="padding:0px;overflow:hidden;" ref="mainView">
                                        <notes-view :model="model" ref="viewRef"></notes-view>
                                    </el-main>
                                    <el-aside style="width:240px;overflow:hidden;background:#f7f7f7;" ref="leftView">
                                        <notes-tree ref="treeRef"></notes-tree>
                                    </el-aside>
                                </el-container>`,
                    mounted() {
                        
                    }
                }).$mount("#app");

            })

        })

    }

}

let mxNotes = new Notes();
mxNotes.init();