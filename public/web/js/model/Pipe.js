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
                            config: null,
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
                                    <el-header style="height:auto;padding:0px;">
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
                                        <el-dropdown v-if="config">
                                            <el-button type="text" icon="el-dropdown-link">
                                                数据源<i class="el-icon-arrow-down el-icon--right"></i>
                                            </el-button>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item :key="item.id" v-for="(item,idx) in config['source']" :divided="idx>0?true:false" 
                                                    @click.native="onInitLogSourceBar(item)">
                                                    #{item.fileContent.title}#
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-dropdown v-if="config">
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
                                        <el-dropdown v-if="config">
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
                                        <div style="overflow:hidden;width:100%;height: auto;padding: 20px;" ref="sidebar"></div>
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
                    created(){
                        // 初始化配置
                        this.onInitConfig();
                    },
                    mounted(){
                        // 初始化画布
                        this.init();
                    },
                    methods:{
                        // 初始化图容器
                        init() {
                            
                            if (!mxClient.isBrowserSupported()){
                                mxUtils.error('Browser is not supported!', 200, false);
                            } else {
                                
                                let container = document.getElementById(this.$refs.graphContainer.$el.id);
                                let sidebar = document.getElementById(this.$refs.sidebar);
                                
                                // Workaround for Internet Explorer ignoring certain CSS directives
                                if (mxClient.IS_QUIRKS) {
                                    document.body.style.overflow = 'hidden';
                                    new mxDivResizer(container);
                                    new mxDivResizer(sidebar);
                                }

                                // 初始化Graph
                                this.editor = new mxEditor();
                                var graph = this.editor.graph;
                                var model = graph.getModel();

                                // Disable highlight of cells when dragging from toolbar
                                graph.setDropEnabled(false);

                                // Uses the port icon while connections are previewed
                                graph.connectionHandler.getConnectImage = function(state)
                                {
                                    return new mxImage(state.style[mxConstants.STYLE_IMAGE], 16, 16);
                                };

                                // Centers the port icon on the target port
                                graph.connectionHandler.targetConnectImage = true;

                                // Does not allow dangling edges
                                graph.setAllowDanglingEdges(false);

                                // Sets the graph container and configures the editor
                                this.editor.setGraphContainer(container);

                                var group = new mxCell('Group', new mxGeometry(), 'group');
                                group.setVertex(true);
                                group.setConnectable(false);
                                this.editor.defaultGroup = group;
                                this.editor.groupBorderSize = 20;

                                // Disables drag-and-drop into non-swimlanes.
                                graph.isValidDropTarget = function(cell, cells, evt)
                                {
                                    return this.isSwimlane(cell);
                                };
                                
                                // Disables drilling into non-swimlanes.
                                graph.isValidRoot = function(cell)
                                {
                                    return this.isValidDropTarget(cell);
                                }

                                // Does not allow selection of locked cells
                                graph.isCellSelectable = function(cell)
                                {
                                    return !this.isCellLocked(cell);
                                };

                                // Returns a shorter label if the cell is collapsed and no
                                // label for expanded groups
                                graph.getLabel = function(cell)
                                {
                                    var tmp = mxGraph.prototype.getLabel.apply(this, arguments); // "supercall"
                                    
                                    if (this.isCellLocked(cell))
                                    {
                                        // Returns an empty label but makes sure an HTML
                                        // element is created for the label (for event
                                        // processing wrt the parent label)
                                        return '';
                                    }
                                    else if (this.isCellCollapsed(cell))
                                    {
                                        var index = tmp.indexOf('</h1>');
                                        
                                        if (index > 0)
                                        {
                                            tmp = tmp.substring(0, index+5);
                                        }
                                    }
                                    
                                    return tmp;
                                }

                                // Disables HTML labels for swimlanes to avoid conflict
                                // for the event processing on the child cells. HTML
                                // labels consume events before underlying cells get the
                                // chance to process those events.
                                //
                                // NOTE: Use of HTML labels is only recommended if the specific
                                // features of such labels are required, such as special label
                                // styles or interactive form fields. Otherwise non-HTML labels
                                // should be used by not overidding the following function.
                                // See also: configureStylesheet.
                                graph.isHtmlLabel = function(cell)
                                {
                                    return !this.isSwimlane(cell);
                                }

                                // Enables new connections
                                graph.setConnectable(true);

                                // 鼠标框选
                                new mxRubberband(graph);
                                
                                // Adds all required styles to the graph (see below)
				                this.configureStylesheet(graph);
                            }
                        },
                        configureStylesheet(graph){
                            var style = new Object();
                            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
                            style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
                            style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
                            style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
                            style[mxConstants.STYLE_GRADIENTCOLOR] = '#41B9F5';
                            style[mxConstants.STYLE_FILLCOLOR] = '#8CCDF5';
                            style[mxConstants.STYLE_STROKECOLOR] = '#1B78C8';
                            style[mxConstants.STYLE_FONTCOLOR] = '#000000';
                            style[mxConstants.STYLE_ROUNDED] = true;
                            style[mxConstants.STYLE_OPACITY] = '80';
                            style[mxConstants.STYLE_FONTSIZE] = '12';
                            style[mxConstants.STYLE_FONTSTYLE] = 0;
                            style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
                            style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
                            graph.getStylesheet().putDefaultVertexStyle(style);

                            // NOTE: Alternative vertex style for non-HTML labels should be as
                            // follows. This repaces the above style for HTML labels.
                            /*var style = new Object();
                            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
                            style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
                            style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
                            style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
                            style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER;
                            style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
                            style[mxConstants.STYLE_SPACING_TOP] = '56';
                            style[mxConstants.STYLE_GRADIENTCOLOR] = '#7d85df';
                            style[mxConstants.STYLE_STROKECOLOR] = '#5d65df';
                            style[mxConstants.STYLE_FILLCOLOR] = '#adc5ff';
                            style[mxConstants.STYLE_FONTCOLOR] = '#1d258f';
                            style[mxConstants.STYLE_FONTFAMILY] = 'Verdana';
                            style[mxConstants.STYLE_FONTSIZE] = '12';
                            style[mxConstants.STYLE_FONTSTYLE] = '1';
                            style[mxConstants.STYLE_ROUNDED] = '1';
                            style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
                            style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
                            style[mxConstants.STYLE_OPACITY] = '80';
                            graph.getStylesheet().putDefaultVertexStyle(style);*/

                            style = new Object();
                            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
                            style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
                            style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
                            style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
                            style[mxConstants.STYLE_FILLCOLOR] = '#FF9103';
                            style[mxConstants.STYLE_GRADIENTCOLOR] = '#F8C48B';
                            style[mxConstants.STYLE_STROKECOLOR] = '#E86A00';
                            style[mxConstants.STYLE_FONTCOLOR] = '#000000';
                            style[mxConstants.STYLE_ROUNDED] = true;
                            style[mxConstants.STYLE_OPACITY] = '80';
                            style[mxConstants.STYLE_STARTSIZE] = '30';
                            style[mxConstants.STYLE_FONTSIZE] = '16';
                            style[mxConstants.STYLE_FONTSTYLE] = 1;
                            graph.getStylesheet().putCellStyle('group', style);
                            
                            style = new Object();
                            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
                            style[mxConstants.STYLE_FONTCOLOR] = '#774400';
                            style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
                            style[mxConstants.STYLE_PERIMETER_SPACING] = '6';
                            style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
                            style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
                            style[mxConstants.STYLE_FONTSIZE] = '10';
                            style[mxConstants.STYLE_FONTSTYLE] = 2;
                            style[mxConstants.STYLE_IMAGE_WIDTH] = '16';
                            style[mxConstants.STYLE_IMAGE_HEIGHT] = '16';
                            graph.getStylesheet().putCellStyle('port', style);
                            
                            style = graph.getStylesheet().getDefaultEdgeStyle();
                            style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
                            style[mxConstants.STYLE_STROKEWIDTH] = '2';
                            style[mxConstants.STYLE_ROUNDED] = true;
                            style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
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
                        // 初始化菜单项目
                        onInitConfig(){
                            fsHandler.callFsJScriptAsync("/matrix/pipe/getConfigList.js").then( (rtn)=>{
                                this.config = rtn.message;
                            } );
                        },
                        // 关闭调试、日志
                        onRemoveConsoleTab(targetName){
                            this.control[targetName].show = !this.control[targetName].show;
                        },
                        // 加载数据源可拖拽项目
                        onInitLogSourceBar(item){
                            
                            var graph = this.editor.graph;
                            var sidebar = this.$refs.sidebar;

                            this.addSidebarIcon(graph, sidebar,
                                `<h1 style="margin:0px;">日志</h1>
                                <span class="el-icon-document" style="font-size:32px;"></span>
                                <p>${item.name}</p>`,
                                '/static/assets/images/graph/tools/gear.png');
                        },
                        // 添加菜单项
                        addSidebarIcon(graph, sidebar, label, image){
                            // Function that is executed when the image is dropped on
                            // the graph. The cell argument points to the cell under
                            // the mousepointer if there is one.
                            var funct = function(graph, evt, cell, x, y){
                                var parent = graph.getDefaultParent();
                                var model = graph.getModel();
                                
                                var v1 = null;
                                
                                model.beginUpdate();
                                try {
                                    // NOTE: For non-HTML labels the image must be displayed via the style
                                    // rather than the label markup, so use 'image=' + image for the style.
                                    // as follows: v1 = graph.insertVertex(parent, null, label,
                                    // pt.x, pt.y, 120, 120, 'image=' + image);
                                    v1 = graph.insertVertex(parent, null, label, x, y, 120, 120);
                                    v1.setConnectable(false);
                                    
                                    // Presets the collapsed size
                                    v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
                                                        
                                    // Adds the ports at various relative locations
                                    var port = graph.insertVertex(v1, null, '配置', 0, 0.25, 16, 16,
                                            'port;image=/static/assets/images/graph/tools/gear.png;align=right;imageAlign=right;spacingRight=18', true);
                                    port.geometry.offset = new mxPoint(-6, -8);
                        
                                    var port = graph.insertVertex(v1, null, '输入', 0, 0.75, 16, 16,
                                            'port;image=/static/assets/images/graph/tools/group.png;align=right;imageAlign=right;spacingRight=18', true);
                                    port.geometry.offset = new mxPoint(-6, -4);
                                    
                                    var port = graph.insertVertex(v1, null, '新建', 1, 0.25, 16, 16,
                                            'port;image=/static/assets/images/graph/tools/plus.png;spacingLeft=18', true);
                                    port.geometry.offset = new mxPoint(-8, -8);

                                    var port = graph.insertVertex(v1, null, '复制', 1, 0.75, 16, 16,
                                            'port;image=/static/assets/images/graph/tools/copy.png;spacingLeft=18', true);
                                    port.geometry.offset = new mxPoint(-8, -4);

                                } finally {
                                    model.endUpdate();
                                }
                                
                                graph.setSelectionCell(v1);
                            }
                            
                            // Creates the image which is used as the sidebar icon (drag source)
                            var img = document.createElement('img');
                            img.setAttribute('src', image);
                            img.style.width = '24px';
                            img.style.height = '24px';
                            img.title = 'Drag this to the diagram to create a new vertex';
                            sidebar.appendChild(img);
                            
                            var dragElt = document.createElement('div');
                            dragElt.style.border = 'dashed black 1px';
                            dragElt.style.width = '60px';
                            dragElt.style.height = '60px';
                                                
                            // Creates the image which is used as the drag icon (preview)
                            var ds = mxUtils.makeDraggable(img, graph, funct, dragElt, 0, 0, true, true);
                            ds.setGuidesEnabled(true);
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
                                                                        <el-button type="text" @click="onTogglePanel">
                                                                            <span :class="control.tagTree.show?'el-icon-s-fold':'el-icon-s-unfold'" style="font-size:17px;"></span>
                                                                        </el-button>
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
                                                                ref="table"
                                                                v-if="!_.isEmpty(dt.rows)">
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
                                                            <div style="background:#ffffff;padding:20px;height:100%;display:block;text-align:center;" v-else>
                                                                <h2 style="margin: 0px 0px 40px 0px;">欢迎使用接入管理</h2>
                                                                <p>
                                                                    <el-button style="width:100px;height:90px;">
                                                                        <i class="el-icon-office-building" style="font-size:48px;"></i> <p>数据接入</p>
                                                                    </el-button>
                                                                    
                                                                    <el-button style="width:100px;height:90px;">
                                                                        <i class="el-icon-postcard" style="font-size:48px;"></i> <p>流程设计</p>
                                                                    </el-button>
                                                                
                                                                    <el-button style="width:100px;height:90px;">
                                                                        <i class="el-icon-s-data" style="font-size:48px;"></i> <p>执行监控</p>
                                                                    </el-button>
                                                                
                                                                    <el-button style="width:100px;height:90px;">
                                                                        <i class="el-icon-money" style="font-size:48px;"></i> <p>输出管理</p>
                                                                    </el-button>
                                                                </p>
                                                                <object data="/fs/assets/images/files/svg/configWorld.svg?type=open&issys=true" 
                                                                    type="image/svg+xml" style="width:40vw;height:40vh;background: #ffffff;">
                                                                </object>
                                                                <p>
                                                                    如有任何意见或建议，请及时反馈给我们。
                                                                    <el-link href="mailto:m3@wecise.com">Email：m3@wecise.com</el-link>
                                                                </p>
                                                            </div>
                                                        </el-main>
                                                        <el-main v-else>
                                                            <el-checkbox-group v-model="dt.selected" class="pipe-grid-node" v-if="!_.isEmpty(dt.rows)">
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
                                                            <div style="background:#ffffff;padding:20px;height:100%;display:block;text-align:center;" v-else>
                                                                <h2 style="margin: 0px 0px 40px 0px;">欢迎使用接入管理</h2>
                                                                <p>
                                                                    <el-button style="width:100px;height:90px;">
                                                                        <i class="el-icon-office-building" style="font-size:48px;"></i> <p>数据接入</p>
                                                                    </el-button>
                                                                    
                                                                    <el-button style="width:100px;height:90px;">
                                                                        <i class="el-icon-postcard" style="font-size:48px;"></i> <p>流程设计</p>
                                                                    </el-button>
                                                                
                                                                    <el-button style="width:100px;height:90px;">
                                                                        <i class="el-icon-s-data" style="font-size:48px;"></i> <p>执行监控</p>
                                                                    </el-button>
                                                                
                                                                    <el-button style="width:100px;height:90px;">
                                                                        <i class="el-icon-money" style="font-size:48px;"></i> <p>输出管理</p>
                                                                    </el-button>
                                                                </p>
                                                                <object data="/fs/assets/images/files/svg/configWorld.svg?type=open&issys=true" 
                                                                    type="image/svg+xml" style="width:40vw;height:40vh;background: #ffffff;">
                                                                </object>
                                                                <p>
                                                                    如有任何意见或建议，请及时反馈给我们。
                                                                    <el-link href="mailto:m3@wecise.com">Email：m3@wecise.com</el-link>
                                                                </p>
                                                            </div>
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