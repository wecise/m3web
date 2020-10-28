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
class Pipe {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["pipe-design",
                            "mx-tag",
                            "mx-tag-tree"
                            ],()=> {

            $(function() {

                /* 日志查看 */
                Vue.component("log-console",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            dt: {
                                rows: []
                            }
                        }
                    },
                    template:   `<el-container>
                                    <el-main>
                                        <el-table
                                            :data="dt.rows" style="width: 100%" height="250">
                                            <el-table-column prop="vtime" label="时间" width="150"></el-table-column>
                                            <el-table-column prop="msg" label="摘要" width="120"></el-table-column>
                                            <el-table-column prop="severity" label="级别" width="120"></el-table-column>
                                        </el-table>
                                    </el-main>
                                </el-container>`
                })

                /* 监控台 */
                Vue.component("monitor-console",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            dt: {
                                rows: []
                            }
                        }
                    },
                    template:   `<el-container>
                                    <el-main>
                                        <el-table
                                            :data="dt.rows" style="width: 100%" height="250">
                                            <el-table-column prop="vtime" label="时间" width="150"></el-table-column>
                                            <el-table-column prop="msg" label="摘要" width="120"></el-table-column>
                                            <el-table-column prop="severity" label="级别" width="120"></el-table-column>
                                        </el-table>
                                    </el-main>
                                </el-container>`
                })

                /* 接入设计 */
                Vue.component("pipe-design",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            editor: null,
                            control: {
                                split: null,
                                log: {
                                    show: false
                                },
                                monitor: {
                                    show: false
                                } 
                            },
                            console: {
                                tabs: [],
                                activeName: "log"
                            }
                        }
                    },
                    template:   `<el-container style="height: calc(100% - 70px);">
                                    <el-header style="height:50px;line-height:50px;">
                                        <el-dropdown>
                                            <el-button type="text" icon="el-dropdown-link">
                                                编辑 <i class="el-icon-arrow-down el-icon--right"></i>
                                            </el-button>
                                            <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item>日志</el-dropdown-item>
                                            <el-dropdown-item divided>REST</el-dropdown-item>
                                            <el-dropdown-item divided>文件</el-dropdown-item>
                                            <el-dropdown-item disabled divided>数据库</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-dropdown>
                                            <el-button type="text" icon="el-dropdown-link">
                                                数据源<i class="el-icon-arrow-down el-icon--right"></i>
                                            </el-button>
                                            <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item>日志</el-dropdown-item>
                                            <el-dropdown-item divided>REST</el-dropdown-item>
                                            <el-dropdown-item divided>文件</el-dropdown-item>
                                            <el-dropdown-item disabled divided>数据库</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-dropdown>
                                            <el-button type="text" icon="el-dropdown-link">
                                                处理规则<i class="el-icon-arrow-down el-icon--right"></i>
                                            </el-button>
                                            <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item>日志</el-dropdown-item>
                                            <el-dropdown-item divided>REST</el-dropdown-item>
                                            <el-dropdown-item divided>文件</el-dropdown-item>
                                            <el-dropdown-item disabled divided>数据库</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-dropdown>
                                            <el-button type="text" icon="el-dropdown-link">
                                                导出规则<i class="el-icon-arrow-down el-icon--right"></i>
                                            </el-button>
                                            <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item>日志</el-dropdown-item>
                                            <el-dropdown-item divided>REST</el-dropdown-item>
                                            <el-dropdown-item divided>文件</el-dropdown-item>
                                            <el-dropdown-item disabled divided>数据库</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-dropdown>
                                            <el-button type="text" icon="el-dropdown-link">
                                                视图 <i class="el-icon-arrow-down el-icon--right"></i>
                                            </el-button>
                                            <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item @click.native="control.log.show = !control.log.show">日志</el-dropdown-item>
                                            <el-dropdown-item @click.native="control.monitor.show = !control.monitor.show"divided>监控</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </el-header>
                                    <el-main style="border:1px solid #dddddd;padding:0px;">
                                        <el-container style="width:100%;height:100%;position: relative;" ref="container">
                                            <el-header style="height:35px;line-height: 35px;padding:0px;position: relative;display:none;">
                                                
                                            </el-header>
                                            <el-main :id="model.id" ref="graphContainer" 
                                                style="width:100vw;height:100vh;min-width:100vw;position:releative;overflow:hidden;padding:0px;">
                                            </el-main>
                                        </el-container>
                                    </el-main>
                                    <el-footer v-if="control.log.show || control.monitor.show" style="height: 200px;padding: 0px;">
                                        <el-tabs v-model="console.activeName" closable @tab-remove="onRemoveConsoleTab">
                                            <el-tab-pane label="日志" name="log" v-if="control.log.show">
                                                <log-console></log-console>
                                            </el-tab-pane>
                                            <el-tab-pane label="监控" name="monitor" v-if="control.monitor.show">
                                                <monitor-console></monitor-console>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-footer>
                                </el-container>`,
                    mounted(){
                        this.init();
                    },
                    methods:{
                        // 初始化图容器
                        init() {
                            
                            if (!mxClient.isBrowserSupported()){
                                mxUtils.error('Browser is not supported!', 200, false);
                            } else {
                                
                                let container = document.getElementById(this.$refs.graphContainer.$el.id);
                                
                                // Workaround for Internet Explorer ignoring certain CSS directives
                                if (mxClient.IS_QUIRKS) {
                                    document.body.style.overflow = 'hidden';
                                    new mxDivResizer(container);
                                }

                                // 初始化Graph
                                let editor = new mxEditor();
                                let graph = new mxGraph(container);

                                // Sets the graph container and configures the editor
                                editor.setGraphContainer(container);


                                // 鼠标框选
                                new mxRubberband(editor.graph);

                                // Sets global styles
                                var style = graph.getStylesheet().getDefaultEdgeStyle();
                                style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
                                style[mxConstants.STYLE_ROUNDED] = true;
                                style[mxConstants.EDGE_SELECTION_STROKEWIDTH] = 3;
                                style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'transparent';
                                style[mxConstants.STYLE_LABEL_PADDING] = 5;
                                style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'backcolor';

                                style = graph.getStylesheet().getDefaultVertexStyle();
                                style[mxConstants.STYLE_FILLCOLOR] = '#2f8ee7';
                                style[mxConstants.STYLE_FONTCOLOR] = '#333333';
                                style[mxConstants.STYLE_FONTSIZE] = '14';
                                style[mxConstants.STYLE_SHAPE] = 'swimlane';
                                style[mxConstants.STYLE_SPACING] = '10';
                                style[mxConstants.STYLE_STARTSIZE] = 30;
                                style[mxConstants.STYLE_GRADIENTCOLOR] = '#419efe';
                                style[mxConstants.VERTEX_SELECTION_STROKEWIDTH] = 3;
                                style[mxConstants.VERTEX_SELECTION_COLOR] = '#ff0000';

                                this.initGraph(editor,graph);
                            }
                        },
                        // 初始化画布
                        initGraph(editor,graph){
                            
                            graph.getModel().beginUpdate();
                            
                            try{
                                let parent = graph.getDefaultParent();
                                let v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
                                let v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
                                let e1 = graph.insertEdge(parent, null, '', v1, v2);
                                
                            }
                            finally {
                                graph.getModel().endUpdate();    

                            }
                        },
                        onRemoveConsoleTab(targetName){
                            this.control[targetName].show = !this.control[targetName].show;
                        }
                    }
                })

                Vue.component("pipe-list",{
                    delimiters: ['#{', '}#'],
                    props: {
                        
                    },
                    data() {
                        return {
                            dt:{
                                rows:[],
                                columns: [],
                                selected: [],
                                pagination:{
                                    pageSize: 10,
                                    currentPage: 1
                                }
                            },
                            info: [],
                            dfs: {
                                root: `/home/${window.SignedUser_UserName}/Documents/pipe`,
                                path: `/home/${window.SignedUser_UserName}/Documents/pipe`
                            },
                            showView: 'table',
                            control: {
                                tagTree: {
                                    show: false
                                }
                            },
                            main: {
                                tabs: [],
                                activeName: "table-view"
                            }
                        }
                    },
                    watch: {
                        dt: {
                            handler(val,oldVal){
                                this.info = [];
                                this.info.push(`共 ${this.dt.rows.length} 项`);
                                this.info.push(`已选择 ${this.dt.selected.length} 项`);
                                this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
                            },
                            deep:true,
                            immediate:true
                        }
                    },
                    computed: {
                        fullname(){
                            return _.concat([""],_.xor(this.dfs.root.split("/"), this.dfs.path.split("/")));
                        }
                    },
                    template:   `<el-container style="height: calc(100% - 85px);background:#ffffff;">
                                    <el-main style="overflow:hidden;padding:0px;">
                                        <el-tabs v-model="main.activeName" type="border-card" class="animated fadeInLeft" closable @tab-remove="onRemoveMainTab">
                                            <el-tab-pane label="规则列表" name="table-view">
                                                <el-container style="height: calc(100% - 60px);">
                                                    <el-aside width="200px" style="background: #f2f2f2;" ref="leftView" v-show="control.tagTree.show">
                                                        <mx-tag-tree :model="{parent:'/pipe',name:'pipe_tree_data.js',domain:'pipe'}" :fun="onRefreshByTag" ref="tagTree"></mx-tag-tree>
                                                    </el-aside>
                                                    <el-container ref="mainView">
                                                        <el-header style="height:35px;line-height:35px;">
                                                            <el-row>
                                                                <el-col :span="12">
                                                                    <el-breadcrumb separator=">">
                                                                        <el-breadcrumb-item>
                                                                            <el-button type="text" @click="onForward(dfs.root)"><i class="el-icon-s-home"></i> 组</el-button>
                                                                        </el-breadcrumb-item>
                                                                        <el-breadcrumb-item  v-for="(item,index) in fullname" v-if="index > 0">
                                                                            <el-button type="text" @click="onForward(fullname.slice(0,index+1).join('/'))">#{item}#</el-button>
                                                                        </el-breadcrumb-item>
                                                                    </el-breadcrumb>
                                                                </el-col>
                                                                <el-col :span="12" style="text-align:right;">
                                                                    <el-tooltip content="切换视图" open-delay="500" placement="top">
                                                                        <el-button type="text" icon="el-icon-s-fold" @click="onTogglePanel"></el-button>
                                                                    </el-tooltip>
                                                                    <el-tooltip content="格子视图" placement="top">
                                                                        <el-button type="text" @click="showView='grid'" icon="el-icon-picture">
                                                                        </el-button>
                                                                    </el-tooltip>
                                                                    <el-tooltip content="表格视图" placement="top">
                                                                        <el-button type="text" @click="showView='table'" icon="el-icon-menu">
                                                                        </el-button>
                                                                    </el-tooltip>
                                                                    <el-tooltip content="新建接入组" open-delay="500" placement="top">
                                                                        <el-button type="text" icon="el-icon-folder-add" @click="onNewGroup(null,null)" style="padding-left:5px;"></el-button>
                                                                    </el-tooltip>
                                                                    <el-tooltip content="新建接入" open-delay="500" placement="top">
                                                                        <el-button type="text" icon="el-icon-plus" @click="onNewPipe(null,null)" style="padding-left:5px;"></el-button>
                                                                    </el-tooltip>
                                                                    <el-tooltip content="刷新" open-delay="500" placement="top">
                                                                        <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
                                                                    </el-tooltip>
                                                                    <el-tooltip content="导出" delay-time="500">
                                                                        <el-dropdown @command="onExport">
                                                                            <span class="el-dropdown-link">
                                                                                <i class="el-icon-download el-icon--right"></i>
                                                                            </span>
                                                                            <el-dropdown-menu slot="dropdown">
                                                                                <el-dropdown-item command="csv">CSV</el-dropdown-item>
                                                                                <el-dropdown-item command="json">JSON</el-dropdown-item>
                                                                                <!--el-dropdown-item command="pdf">PDF</el-dropdown-item-->
                                                                                <el-dropdown-item command="png">PNG</el-dropdown-item>
                                                                                <!--el-dropdown-item command="sql">SQL</el-dropdown-item-->
                                                                                <el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
                                                                            </el-dropdown-menu>
                                                                        </el-dropdown>
                                                                    </el-tooltip>
                                                                </el-col>
                                                            </el-row>
                                                        </el-header>   
                                                        <el-main v-if="showView=='table'">
                                                            <el-table
                                                                :data="dt.rows.slice((dt.pagination.currentPage - 1) * dt.pagination.pageSize,dt.pagination.currentPage * dt.pagination.pageSize)"
                                                                highlight-current-row="true"
                                                                stripe
                                                                style="width: 100%;"
                                                                :row-class-name="rowClassName"
                                                                :header-cell-style="headerRender"
                                                                ref="table">
                                                                <el-table-column type="selection" align="center" width="55"></el-table-column> 
                                                                <el-table-column
                                                                    sortable 
                                                                    show-overflow-tooltip
                                                                    v-for="(item,index) in dt.columns"
                                                                    :key="index"
                                                                    :prop="item.field"
                                                                    :label="item ? item.title : ''"
                                                                    :width="item.width"
                                                                    v-if="item.visible">
                                                                        <template slot-scope="scope">
                                                                            <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                                                                v-if="typeof item.render === 'function'">
                                                                            </div>
                                                                            <div v-else>
                                                                                #{scope.row[item.field]}#
                                                                            </div>
                                                                        </template>
                                                                </el-table-column>
                                                                <el-table-column label="标签" prop="tags" width="200">
                                                                    <template slot-scope="scope">
                                                                        <mx-tag domain='pipe' :model.sync="scope.row.tags" :id="scope.row.id" limit="1"></mx-tag>
                                                                    </template>
                                                                </el-table-column>
                                                                <el-table-column label="操作" width="160">
                                                                    <template slot-scope="scope">
                                                                        <el-tooltip content="新建接入组" open-delay="500" placement="top">
                                                                            <el-button type="text" @click="onNewGroup(scope.row, scope.$index)" icon="el-icon-folder-add"></el-button>
                                                                        </el-tooltip>
                                                                        <el-tooltip content="新建接入" open-delay="500" placement="top">
                                                                            <el-button type="text" @click="onNewPipe(scope.row, scope.$index)" icon="el-icon-plus"></el-button>
                                                                        </el-tooltip>
                                                                        <el-tooltip content="编辑接入" open-delay="500" placement="top">
                                                                            <el-button type="text" icon="el-icon-edit"  @click="onUpdatePipe(scope.row,scope.$index)" v-if="scope.row.ftype!=='dir'"></el-button>
                                                                        </el-tooltip>
                                                                        <el-tooltip content="删除接入" open-delay="500" placement="top">
                                                                            <el-button type="text" @click="onDeletePipe(scope.row, scope.$index)" icon="el-icon-delete"></el-button>
                                                                        </el-tooltip>
                                                                    </template>
                                                                </el-table-column>
                                                            </el-table>
                                                        </el-main>
                                                        <el-main v-else>
                                                            <el-checkbox-group v-model="dt.selected" class="pipe-grid-node">
                                                                <el-button type="default" 
                                                                        style="max-width: 12em;width: 12em;height:110px;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
                                                                        @dblclick.native="onForward(item.fullname)"
                                                                        @click="onTriggerClick(item)"
                                                                        :key="item.id"
                                                                        v-for="item in dt.rows">
                                                                        <i class="el-icon-folder" style="font-size:48px;margin:5px;color:#FF9800;" v-if="item.ftype=='dir'"></i>
                                                                        <i class="el-icon-cpu" style="font-size:48px;margin:5px;color:#FF9800;" v-else></i>
                                                                        <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:center;">
                                                                            #{item.name}#
                                                                        </p>
                                                                        <el-checkbox :label="item" :ref="'checkBox_'+item.id"></el-checkbox>
                                                                </el-button>
                                                            </el-checkbox-group>
                                                        </el-main>
                                                        <el-footer style="height:30px;line-height:30px;">
                                                            <el-pagination
                                                                @size-change="onPageSizeChange"
                                                                @current-change="onCurrentPageChange"
                                                                :page-sizes="[10, 15, 20]"
                                                                :page-size="dt.pagination.pageSize"
                                                                :total="dt.rows.length"
                                                                layout="total, sizes, prev, pager, next"
                                                                v-if="showView=='table'">
                                                            </el-pagination>
                                                            <span v-else>#{ info.join(' &nbsp; | &nbsp;') }#</span>
                                                        </el-footer>
                                                    </el-container>
                                                </el-container>
                                            </el-tab-pane>
                                            <el-tab-pane :key="tab.id" :name="tab.name"  v-for="tab in main.tabs">
                                                <span slot="label">
                                                    <i class="el-icon-files" style="color:rgb(64, 158, 255);"></i> #{tab.name}#
                                                    <el-dropdown trigger="click">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-arrow-down"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item @click.native="onTabClose(0,tab)" divided>关闭</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onTabClose(1,tab)">关闭其它标签页</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onTabClose(2,tab)">关闭右侧标签页</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                    </el-dropdown>
                                                </span>
                                                <pipe-design :model="tab"></pipe-design>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                   
                                </el-container>`,
                    created(){
                        this.initData();

                        // 默认边栏显示状态
                        this.control.tagTree.show = (localStorage.getItem("PIPE-TAG-TREE-IFSHOW") == 'true');
                    },
                    mounted(){
                        // 初始化分隔栏
                        this.initSplit();
                    },
                    methods: {
                        rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0) {
                                //return 'text-align:center;';
                            }
                        },
                        onPageSizeChange(val) {
                            this.dt.pagination.pageSize = val;
                        },
                        onCurrentPageChange(val) {
                            this.dt.pagination.currentPage = val;
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
                        onTogglePanel(){
							this.control.tagTree.show = !this.control.tagTree.show;

                            localStorage.setItem("PIPE-TAG-TREE-IFSHOW",this.control.tagTree.show);
						},
                        onRefreshByTag(){

                        },
                        onTriggerClick(item){
                            this.$refs['checkBox_'+item.id][0].$el.click();
                        },
                        initData(){
                            fsHandler.callFsJScriptAsync("/matrix/pipe/getPipeList.js").then((val)=>{
                                let rtn = val.message;

                                this.dt.rows = rtn.rows;
                            
                                _.extend(this.dt, {columns: _.map(rtn.columns, (v)=>{
                                                        
                                    if(_.isUndefined(v.visible)){
                                        _.extend(v, { visible: true });
                                    }

                                    if(!v.render){
                                        return v;
                                    } else {
                                        return _.extend(v, { render: eval(v.render) });
                                    }
                                    
                                })});
                            }); 
                        },
                        onForward(fullname){
                            this.dt.rows = fsHandler.callFsJScript("/matrix/pipe/getChildPipeList.js", encodeURIComponent(fullname) ).message;
                            
                            if(fullname){
                                this.dfs.path = fullname;//_.concat([""],_.xor(this.dfs.root.split("/"), fullname.split("/")));
                                this.fullname = _.concat([""],_.xor(this.dfs.root.split("/"), this.dfs.path.split("/")))
                            } else {
                                this.dfs.path = [this.dfs.root];
                            }
                        },
                        onRefresh(){
                            this.initData();
                        },
                        onExport(){
                            let options = {
								csvEnclosure: '',
								csvSeparator: ', ',
								csvUseBOM: true,
								ignoreColumn: [0,1],
								fileName: `tableExport_${moment().format("YYYY-MM-DD HH:mm:ss")}`,
								type: type,
							};
	
							if(type === 'png'){
								//$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
								$(this.$refs.table.$el.querySelector("table.el-table__body")).tableExport(options);
							} else if(type === 'pdf'){
								_.extend(options, {
									jspdf: {orientation: 'l',
											format: 'a3',
											margins: {left:10, right:10, top:20, bottom:20},
											autotable: {styles: {fillColor: 'inherit', 
																	textColor: 'inherit'},
														tableWidth: 'auto'}
									}
								});
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							} else {
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							}
                        },
                        onNewGroup(row,index){

                            let ftype = "dir";
                            let parent = this.dfs.root;
                            let content = null;
                            let attr = {remark: ''}; 

                            this.$prompt('请输入接入组名称', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消'
                              }).then(({ value }) => {

                                if(_.isEmpty(value)){
                                    this.$message({
                                        type: 'info',
                                        message: '请输入接入组名称！'
                                    });
                                    return false;
                                }

                                fsHandler.fsNewAsync(ftype, parent, value, content, attr).then( (rtn)=>{
                                    if(rtn == 1){
                                        this.$message({
                                            type: 'success',
                                            message: '新建接入组成功: ' + value
                                        });
                                        this.initData();
                                    } else {
                                        this.$message({
                                            type: 'error',
                                            message: '新建接入组失败 ' + rtn
                                        });
                                        this.initData();
                                        return false;
                                    }
                                });
                              }).catch(() => {
                                
                              });
                        },
                        onNewPipe(row,index){
                            
                            let ftype = "json";
                            let parent = this.dfs.root;
                            let content = null;
                            let attr = {remark: ''};                            

                            if(row){
                                parent = row.fullname;
                            }

                            this.$prompt('请输入接入名称', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消'
                              }).then(({ value }) => {
                                
                                if(_.isEmpty(value)){
                                    this.$message({
                                        type: 'info',
                                        message: '请输入接入名称！'
                                    });
                                    return false;
                                }
                                
                                fsHandler.fsNewAsync(ftype, parent, value, content, attr).then( (rtn)=>{
                                    if(rtn == 1){
                                        this.$message({
                                            type: 'success',
                                            message: '新建接入成功: ' + value
                                        });
                                        this.initData();
                                    } else {
                                        this.$message({
                                            type: 'error',
                                            message: '新建接入失败: ' + rtn
                                        });
                                        this.initData();
                                        return false;
                                    }
                                } );
                                
                              }).catch(() => {
                                
                              });
                        },
                        onDeletePipe(row,index){
                            this.$confirm(`确认要删除规则：${row.name}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
								fsHandler.callFsJScriptAsync("/matrix/pipe/deletePipeById.js", encodeURIComponent(row.id)).then( (rtn)=>{
                                    if( rtn.status == 'ok' ){
                                        this.$message({
                                            type: "success",
                                            message: "删除成功！"
                                        });        

                                        this.dt.rows.splice(index, 1);

                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "删除失败：" + rtn.message
                                        });        
                                    }
                                } );
								
                            }).catch(() => {
                                this.$message({
									type: "info",
									message: "取消删除操作！"
								});
							});
                        },
                        // 标签操作 
                        onTabClose(key,tab){
                            
                            if(key === 0){
                                this.onRemoveMainTab(tab.name);
                            } else if( key === 1 ){
                                let others = _.xor(this.main.tabs,[tab]);
                                _.forEach(others,(v)=>{
                                    this.onRemoveMainTab(v.name);
                                })
                            } else {
                                let others = this.main.tabs.slice(_.indexOf(this.main.tabs,tab) + 1, this.main.tabs.length);
                                _.forEach(others,(v)=>{
                                    this.onRemoveMainTab(v.name);
                                })
                            }
                        },
                        // 编辑规则
                        onUpdatePipe(row,index){
                            if( _.find(this.main.tabs,{id: row.id}) ){
                                this.main.activeName = row.name;    
                            } else {
                                this.main.activeName = row.name;
                                this.main.tabs.push(row);
                            }

                        },
                        // 关闭编辑规则
                        onRemoveMainTab(targetName){
                            try{                                
                                
                                let tabs = this.main.tabs;
                                let activeName = this.main.activeName;

                                if (activeName === targetName) {
                                    tabs.forEach((tab, index) => {
                                        if (tab.name === targetName) {
                                            let nextTab = tabs[index + 1] || tabs[index - 1];
                                            if (nextTab) {
                                                activeName = nextTab.name;
                                            }
                                        }
                                    });
                                }
                                
                                this.main.tabs = tabs.filter(tab => tab.name !== targetName);
                                
                                if(this.main.tabs.length == 0){
                                    this.main.activeName = "table-view";    
                                } else {
                                    this.main.activeName = activeName;
                                }
                                
                            } catch(err){
                                
                            } 
                        }
                    }
                })

            })

        })

    }

    mount(el){
        
        let main = {
            delimiters: ['#{', '}#'],
            template:   `<pipe-list ref="pipeRef"></pipe-list>`
        };

        // mount
        _.delay(() => {
            this.app = new Vue(main).$mount(el);
        },500)
    }
    
}