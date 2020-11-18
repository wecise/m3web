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
                                            <el-table-column prop="msg" label="摘要"></el-table-column>
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
                                            <el-table-column prop="msg" label="摘要"></el-table-column>
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
                            layout: {
                                default: "tree_horizontal",
                                inst: null,
                                edgeStyle: 4
                            },
                            control: {
                                split: null,
                                log: {
                                    show: false
                                },
                                monitor: {
                                    show: false
                                },
                                outline: {
                                    show: false
                                }
                            },
                            console: {
                                tabs: [],
                                activeName: "log"
                            },
                            dialog:{
                                cellSetup: {
                                    show: false
                                }
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
                                            <el-dropdown-item @click.native="onSave">保存</el-dropdown-item>
                                            <el-dropdown-item @click.native="onSave">另存为</el-dropdown-item>
                                            <el-dropdown-item  @click.native="onDeleate" divided>删除</el-dropdown-item>
                                            <el-dropdown-item  @click.native="onClose" divided>关闭</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-tooltip content="数据源" open-delay="800" placement="top">
                                            <el-popover
                                                title="选择数据源"
                                                placement="right-start"
                                                trigger="click"
                                                :popper-options="{ boundariesElement: 'body', gpuAcceleration: false }"
                                                @show="onSideBarShow(config['source'],'sourceBar')"
                                                popper-class="info-popper"
                                                style="width:auto;">
                                                <el-container style="height:12em;">
                                                    <el-main style="display:flex;" ref="sourceBar">
                                                        
                                                    </el-main>
                                                </el-container>
                                                <el-button slot="reference" type="text">数据源</el-button>
                                            </el-popover>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-tooltip content="数据转换" open-delay="800" placement="top">
                                            <el-popover
                                                title="选择数据转换"
                                                placement="right-start"
                                                width="400"
                                                trigger="click"
                                                :popper-options="{ boundariesElement: 'body', gpuAcceleration: false }"
                                                @show="onSideBarShow(config['covert'],'covertBar')"
                                                popper-class="info-popper">
                                                <el-container>
                                                    <el-main ref="covertBar">
                                                        
                                                    </el-main>
                                                </el-container>
                                                <el-button slot="reference" type="text">数据转换</el-button>
                                            </el-popover>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-tooltip content="数据操作" open-delay="800" placement="top">
                                            <el-popover
                                                title="选择数据操作"
                                                placement="right-start"
                                                width="400"
                                                trigger="click"
                                                :popper-options="{ boundariesElement: 'body', gpuAcceleration: false }"
                                                @show="onSideBarShow(config['operate'],'operateBar')"
                                                popper-class="info-popper">
                                                <el-container>
                                                    <el-main ref="operateBar">
                                                        
                                                    </el-main>
                                                </el-container>
                                                <el-button slot="reference" type="text">数据操作</el-button>
                                            </el-popover>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-tooltip content="定时器" open-delay="800" placement="top">
                                            <el-popover
                                                title="选择定时器"
                                                placement="right-start"
                                                width="400"
                                                trigger="click"
                                                :popper-options="{ boundariesElement: 'body', gpuAcceleration: false }"
                                                @show="onSideBarShow(config['cron'],'cronBar')"
                                                popper-class="info-popper">
                                                <el-container>
                                                    <el-main ref="cronBar">
                                                        
                                                    </el-main>
                                                </el-container>
                                                <el-button slot="reference" type="text">定时器</el-button>
                                            </el-popover>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <el-dropdown>
                                            <el-button type="text" icon="el-dropdown-link">
                                                视图 <i class="el-icon-arrow-down el-icon--right"></i>
                                            </el-button>
                                            <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item @click.native="onToggleView('log')">日志</el-dropdown-item>
                                            <el-dropdown-item @click.native="onToggleView('monitor')" divided>监控</el-dropdown-item>
                                            <el-dropdown-item @click.native="onToggleView('outline')" divided>预览</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                        
                                        <div ref="toolbar">
                                            
                                            <el-tooltip content="保存" open-delay="800" placement="top">
                                                <el-button type="text" @click="onSave">
                                                    <span class="far fa-save" style="font-size:14px;"><span>
                                                </el-button>
                                            </el-tooltip>
                                            
                                            <el-tooltip content="放大" open-delay="800" placement="top">
                                                <el-button type="text"  @click="onZoomIn">
                                                    <i class="el-icon-zoom-in" style="font-size:14px;">
                                                </el-button>
                                            </el-tooltip>
                                            
                                            <el-tooltip content="缩小" open-delay="800" placement="top">
                                                <el-button type="text"  @click="onZoomOut">
                                                    <i class="el-icon-zoom-out" style="font-size:14px;">
                                                </el-button>
                                            </el-tooltip>
                                            
                                            <el-tooltip content="自适应大小"" open-delay="800" placement="top">
                                                <el-button type="text"  @click="onFit">
                                                    <i class="el-icon-rank" style="font-size:14px;">
                                                </el-button>
                                            </el-tooltip>

                                            <el-tooltip content="收起所有" open-delay="800" placement="top">
                                                <el-button type="text" @click="editor.execute('collapseAll')">
                                                    <i class="el-icon-menu" style="font-size:14px;">
                                                </el-button>
                                            </el-tooltip>
                                            
                                            <el-tooltip content="展开所有" open-delay="800" placement="top">
                                                <el-button type="text" @click="editor.execute('expandAll')">
                                                    <i class="el-icon-s-grid" style="font-size:14px;">
                                                </el-button>
                                            </el-tooltip>
                                            
                                            <el-tooltip content="执行" open-delay="800" placement="top">
                                                <el-button type="text" @click="onExecute">
                                                    <span class="el-icon-caret-right" style="font-size:14px;color:#8BC34A;"></span>
                                                </el-button>
                                            </el-tooltip>
                                        </div>

                                    </el-header>
                                    <el-main :id="model.id" ref="graphContainer" 
                                        style="width:100vw;height:100vh;min-width:100vw;position:releative;overflow:hidden;padding:0px;">
                                    </el-main>
                                    <div ref="outlineContainer"
                                        style="position:absolute;overflow:hidden;top:20px;right:20px;width:200px;height:140px;background:transparent;box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);"
                                        v-show="control.outline.show">
                                    </div>
                                    <el-footer v-if="control.log.show || control.monitor.show" style="height: 200px;padding: 0px;">
                                        <el-tabs v-model="console.activeName" closable @tab-remove="onRemoveConsoleTab" type="border-card">
                                            <el-tab-pane label="日志" name="log" v-if="control.log.show">
                                                <log-console></log-console>
                                            </el-tab-pane>
                                            <el-tab-pane label="监控" name="monitor" v-if="control.monitor.show">
                                                <monitor-console></monitor-console>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-footer>
                                    <el-dialog title="属性" :visible.sync="dialog.cellSetup.show" v-if="dialog.cellSetup.show" width="40vw">
                                        <el-container style="width:100%;height:100%">
                                            <el-main style="padding:0px;overflow:hidden;">
                                                <div v-html="dialog.cellSetup.content"></div>
                                            </el-main>
                                        </el-container>
                                    </el-dialog>
                                </el-container>`,
                    created(){
                        // 初始化配置
                        this.onInitConfig();
                    },
                    mounted(){
                        
                        // 初始化画布
                        let container = this.$refs.graphContainer.$el;
                        let outline = this.$refs.outlineContainer.$el;
                        this.init(container,outline);

                        // 初始化滚轮图缩放事件监听
                        //this.addScrollListener(container, this.wheelHandle);
                    },
                    methods:{
                        // 初始化图容器
                        init(container, outline) {
                            
                            if (!mxClient.isBrowserSupported()){
                                mxUtils.error('Browser is not supported!', 200, false);
                            } else {
                                
                                // Workaround for Internet Explorer ignoring certain CSS directives
                                if (mxClient.IS_QUIRKS) {
                                    document.body.style.overflow = 'hidden';
                                    new mxDivResizer(container);
                                    new mxDivResizer(outline);
                                }

                                // 初始化Graph
                                this.editor = new mxEditor();
                                var graph = this.editor.graph;
                                var model = graph.getModel();

                                // Disables some global features
                                graph.setConnectable(true);
                                graph.setCellsDisconnectable(false);
                                graph.setCellsCloneable(false);
                                graph.swimlaneNesting = false;
                                graph.dropEnabled = true;
                                // 容器大小自适应 
                                graph.setResizeContainer(false);


                                // Clones the source if new connection has no target
                                graph.connectionHandler.setCreateTarget(true);
                                
                                // Forces use of default edge in mxConnectionHandler
                                graph.connectionHandler.factoryMethod = null;

                                // Only tables are resizable
                                graph.isCellResizable = function(cell) {
                                    return this.isSwimlane(cell);
                                };
                                
                                
                                // Disable highlight of cells when dragging from toolbar
                                graph.setDropEnabled(true);

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

                                // 首先禁用浏览器右键菜单
                                mxEvent.disableContextMenu(this.$el);
                                // 右键菜单
                                graph.popupMenuHandler.factoryMethod = (menu, cell, evt)=>{
                                    this.createPopupMenu(this.editor, graph, menu, cell, evt);
                                };

                                // 鼠标框选
                                new mxRubberband(graph);

                                // Adds all required styles to the graph (see below)
                                this.configureStylesheet(graph);

                                // Defines Delete action
                                this.editor.addAction('deleteAll',(editor,cell)=>{
                                    this.onDeleteAllCells(true);
                                })
                                
                                // 图事件绑定
                                this.initGraphEvent(graph);

                                // 加载图内容
                                this.initGraph(graph);

                            }
                        },
                        // 图事件绑定
                        initGraphEvent(graph){
                            // ADD_CELLS
                            graph.addListener(mxEvent.ADD_CELLS, (sender, evt)=> {
                                    
                                let parent = evt.getProperty("parent");
                    
                                if (parent != null) {
                                    // 生成一个配置实例
                                    this.newInstance(this.model, parent.getId());
                                }

                                evt.consume();
                            });

                            // 节点双节事件
                            graph.dblClick = (evt, cell)=> {
                                // Do not fire a DOUBLE_CLICK event here as mxEditor will
                                // consume the event and start the in-place editor.
                                console.log(cell, this)
                                if (!mxEvent.isConsumed(evt) && cell != null) {
                                    
                                    this.dialog.cellSetup.show = true;
                                    this.dialog.cellSetup.content = graph.convertValueToString(cell);

                                }
                                // Disables any default behaviour for the double click
                                mxEvent.consume(evt);
                            };

                        },
                        // 加载画布内容
                        initGraph(graph){
                            let term = encodeURIComponent(JSON.stringify( this.model ));

                            fsHandler.callFsJScriptAsync("/matrix/pipe/getPipeContentByName.js", term).then( (rtn)=>{
                                let doc = mxUtils.parseXml(rtn.message);
                                let codec = new mxCodec(doc);
                                codec.decode(doc.documentElement, graph.getModel());
                            } )
                        
                        },
                        // 初始化菜单项目
                        onInitConfig(){
                            fsHandler.callFsJScriptAsync("/matrix/pipe/getConfigList.js").then( (rtn)=>{
                                this.config = rtn.message;
                            } );
                        },
                        // 初始化滚轮图缩放
                        addScrollListener(element, wheelHandle) {
                            if (typeof element != 'object') return;
                            if (typeof wheelHandle != 'function') return;
            
                            // 监测浏览器
                            if (typeof arguments.callee.browser == 'undefined') {
                                var user = navigator.userAgent;
                                var b = {};
                                b.opera = user.indexOf("Opera") > -1 && typeof window.opera == "object";
                                b.khtml = (user.indexOf("KHTML") > -1 || user.indexOf("AppleWebKit") > -1 || user.indexOf("Konqueror") > -1) && !b.opera;
                                b.ie = user.indexOf("MSIE") > -1 && !b.opera;
                                b.gecko = user.indexOf("Gecko") > -1 && !b.khtml;
                                arguments.callee.browser = b;
                            }
                            if (element == window)
                                element = document;
                            if (arguments.callee.browser.ie)
                                element.attachEvent('onmousewheel', wheelHandle);
                            else
                                element.addEventListener(arguments.callee.browser.gecko ? 'DOMMouseScroll' : 'mousewheel', wheelHandle, false);
                        },
                        // 初始化滚轮图缩放
                        wheelHandle(e) {
                            var upcheck;
            
                            if (e.wheelDelta) {
                                upcheck = e.wheelDelta > 0 ? 1 : 0;
                            } else {
                                upcheck = e.detail < 0 ? 1 : 0;
                            }
                            if (upcheck) {
                                this.editor.graph.zoomIn();
                            }
                            else {
                                this.editor.graph.zoomOut();
                            }
            
                            if (window.event) {
                                e.returnValue = false;
                                window.event.cancelBubble = true;
                            } else {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        },
                        // 图视图切换  日志、监控、预览
                        onToggleView(view){
                            
                            if(view == 'outline'){

                                this.control.outline.show = !this.control.outline.show;

                                if(this.control.outline.show){
                                    new mxOutline(this.editor.graph, this.$refs.outlineContainer);
                                }

                            } else {
                                this.control[view].show = !this.control[view].show;
                                this.console.activeName = view;
                            }
                        },
                        // 右键菜单
                        createPopupMenu(editor, graph, menu, cell, evt) {
                            if (cell != null) {

                                menu.addItem('删除', null, function(){
                                    editor.execute('delete', cell);
                                });
                                menu.addSeparator();
                            }

                            menu.addItem('撤销', null, function(){
                                editor.execute('undo', cell);
                            });
                            
                            menu.addItem('重做', null, function(){
                                editor.execute('redo', cell);
                            });

                            menu.addSeparator();

                            menu.addItem('清空', null, function(){
                                editor.execute('deleteAll');
                            });
                            
                            menu.addSeparator();
                                 
                            var submenuLayout = menu.addItem('布局', null, null);

                            var submenuLayoutHierarchical = menu.addItem('分层布局', null, null,submenuLayout);
                            menu.addItem('上下', null, ()=>{
                                this.layout.default = 'hierarchical_vertical';
                                this.executeLayout();
                            }, submenuLayoutHierarchical);
                            menu.addItem('左右', null, ()=>{
                                this.layout.default = 'hierarchical_horizontal';
                                this.executeLayout();
                            }, submenuLayoutHierarchical);
            
                            
                            var submenuLayoutTree = menu.addItem('树形布局', null, null,submenuLayout);

                            menu.addItem('上下', null, ()=>{
                                this.layout.default = 'tree_vertical';
                                this.executeLayout();
                            }, submenuLayoutTree);
                            menu.addItem('左右', null, ()=>{
                                this.layout.default = 'tree_horizontal';
                                this.executeLayout();
                            }, submenuLayoutTree);

                            menu.addItem('随机布局', null, ()=>{
                                this.layout.default = 'organic';
                                this.executeLayout();
                            }, submenuLayout);
                            menu.addItem('圆形布局', null, ()=>{
                                this.layout.default = 'circle';
                                this.executeLayout();
                            }, submenuLayout);
                        },
                        // 图布局
                        executeLayout(){
                            let graph = this.editor.graph;
                            let parent = graph.getDefaultParent();
                            let layout = this.layout;
                            
                            // 布局定义
                            if(layout.default === 'hierarchical_vertical'){
                                // Layout hierarchical
                                graph.getModel().beginUpdate();
                                try {
                                    layout.inst = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_NORTH);
                                    layout.inst.edgeStyle = layout.edgeStyle;
                                    layout.inst.intraCellSpacing = 80;
                                    layout.inst.interRankCellSpacing = 80;
                                    
                                    var selectionCells = graph.getSelectionCells();
                                    layout.inst.execute(parent, null);//selectionCells.length == 0 ? null : selectionCells);
            
                                } catch (e) {
                                    throw e;
                                } finally {
                                    var morph = new mxMorphing(graph);  
                                    morph.addListener(mxEvent.DONE, function(){  
                                        graph.getModel().endUpdate();  
                                    });  
                                        
                                    morph.startAnimation();  
                                }
                                
                            } else if(layout.default === 'hierarchical_horizontal'){
                                // Layout hierarchical
                                graph.getModel().beginUpdate();
                                try {
                                    layout.inst = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
                                    layout.inst.edgeStyle = layout.edgeStyle;
                                    layout.inst.intraCellSpacing = 80;
                                    layout.inst.interRankCellSpacing = 80;
                                    
                                    var selectionCells = graph.getSelectionCells();
                                    layout.inst.execute(parent, null);// selectionCells.length == 0 ? null : selectionCells);
                                } catch (e) {
                                    throw e;
                                } finally {
                                    var morph = new mxMorphing(graph);  
                                    morph.addListener(mxEvent.DONE, function(){  
                                        graph.getModel().endUpdate();  
                                    });  
                                        
                                    morph.startAnimation();  
                                }
                                
                            } else if(layout.default === 'organic'){
                                // Layout Organic
                                graph.getModel().beginUpdate();
                                try {
                                    layout.inst = new mxFastOrganicLayout(graph);
                                    layout.inst.forceConstant = 140;
                                    //layout.inst.execute(parent);
            
                                    var selectionCells = graph.getSelectionCells();
                                    layout.inst.execute(parent,null);// selectionCells.length == 0 ? null : selectionCells);
                                } catch (e) {
                                    throw e;
                                } finally {
                                    graph.getModel().endUpdate();
                                }
                                
                            } else if(layout.default === 'tree_vertical'){
                                /* Layout tree vertical */
                                graph.getModel().beginUpdate();
                                try {
                                    var tmp = graph.getSelectionCell();
                                    var roots = null;
                                    var cells = [tmp];
                                    
                                    if ( tmp == null || graph.getModel().getChildCount(tmp) == 0 ) {
                                        if (graph.getModel().getEdgeCount(tmp) == 0){
                                            roots = graph.findTreeRoots(parent);
                                        }
                                    } else {
                                        roots = graph.findTreeRoots(tmp);
                                    }
            
                                    if ( roots != null && roots.length > 0 ) {
                                        cells = roots;
                                    }
                                    
                                    if( cells.length > 0 ) {
                                        _.forEach(cells,(v)=>{
                                            layout.inst = new mxCompactTreeLayout(graph, false);
                                            layout.inst.edgeRouting = false;
                                            layout.inst.levelDistance = 30;
                                            layout.inst.execute(parent, v);
                                        })
                                    }
            
                                } catch (e) {
                                    throw e;
                                } finally {
                                    var morph = new mxMorphing(graph);  
                                    morph.addListener(mxEvent.DONE, function(){  
                                        graph.getModel().endUpdate();  
                                    });  
                                        
                                    morph.startAnimation();  
                                }
                            } else if(layout.default === 'tree_horizontal'){
                                /* Layout tree horizontal */
                                graph.getModel().beginUpdate();
                                try {
                                    var tmp = graph.getSelectionCell();
                                    var roots = null;
                                    var cells = [tmp];
                                    
                                    if (tmp == null || graph.getModel().getChildCount(tmp) == 0){
                                        if (graph.getModel().getEdgeCount(tmp) == 0){
                                            roots = graph.findTreeRoots(parent);
                                        }
                                    } else {
                                        roots = graph.findTreeRoots(tmp);
                                    }
            
                                    if (roots != null && roots.length > 0){
                                        cells = roots;
                                    }
                                    
                                    if( cells.length > 0 ) {
                                        _.forEach(cells,(v)=>{
                                            layout.inst = new mxCompactTreeLayout(graph, true);
                                            layout.inst.edgeRouting = false;
                                            layout.inst.levelDistance = 30;
                                            layout.inst.execute(parent, v);
                                        })
                                    }
                                    
                                } catch (e) {
                                    throw e;
                                } finally {
                                    var morph = new mxMorphing(graph);  
                                    morph.addListener(mxEvent.DONE, function(){  
                                        graph.getModel().endUpdate();  
                                    });  
                                        
                                    morph.startAnimation();  
                                }
                            } else {
                                /* Layout Circle */
                                graph.getModel().beginUpdate();
                                try {
                                    layout.inst = new mxCircleLayout(graph);
                                    //layout.inst.execute(parent);
                                    var selectionCells = graph.getSelectionCells();
                                    layout.inst.execute(parent, null);//selectionCells.length == 0 ? null : selectionCells);
                                } catch (e) {
                                    throw e;
                                } finally {
                                    graph.getModel().endUpdate();
                                }
                            }
                            
                            // 缓存最后一次布局
                            localStorage.setItem("PIPE-GRAPH-LAYOUT",layout.default);
            
                            
                        },            
                        // 图节点样式
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
                        // 关闭调试、日志
                        onRemoveConsoleTab(targetName){
                            this.control[targetName].show = !this.control[targetName].show;
                        },
                        // 加载可拖拽项目
                        onSideBarShow(item,sidebar){
                            let graph = this.editor.graph;
                            let sourcebar = this.$refs[sidebar].$el;
                            
                            $(sourcebar).empty();

                            _.forEach(item, (v)=>{
                                this.addSidebarIcon(
                                    graph, 
                                    sourcebar,
                                    `<h1 style="margin:0px;">${v.fileContent.title}</h1><img src="${v.fileContent.icon.url}" style="width:38px;padding:10px;"></img>`,
                                    v.fileContent.icon.url || '/static/assets/images/graph/pipe/matrix.png',
                                    v);
                            })
                        },
                        // 添加菜单项
                        addSidebarIcon(graph, sidebar, label, image, data){
                            
                            // Function that is executed when the image is dropped on
                            // the graph. The cell argument points to the cell under
                            // the mousepointer if there is one.
                            var funct = function(graph, evt, cell, x, y){
                                var parent = graph.getDefaultParent();
                                var model = graph.getModel();
                                
                                var v1 = null;
                                
                                // 节点ID
                                console.log(data)
                                var source = data.fullname.replace(/.json/,'');
                                var id = [source, `${_.now()}`].join(":");
                                
                                model.beginUpdate();
                                try {
                                    // NOTE: For non-HTML labels the image must be displayed via the style
                                    // rather than the label markup, so use 'image=' + image for the style.
                                    // as follows: v1 = graph.insertVertex(parent, null, label,
                                    // pt.x, pt.y, 120, 120, 'image=' + image);
                                    v1 = graph.insertVertex(parent, id, label, x, y, 120, 120);
                                    v1.setConnectable(false);
                                    
                                    // Presets the collapsed size
                                    v1.geometry.alternateBounds = new mxRectangle(0, 0, 120, 40);
                                                        
                                    // Adds the ports at various relative locations
                                    var port = graph.insertVertex(v1, null, '配置', 0, 0.25, 16, 16,
                                            'port;image=/static/assets/images/graph/tools/gear.png;align=right;imageAlign=right;spacingRight=18', true);
                                    port.geometry.offset = new mxPoint(-6, -8);
                        
                                    var port = graph.insertVertex(v1, null, '输入', 0, 0.75, 16, 16,
                                            'port;image=/static/assets/images/graph/pipe/input.png;align=right;imageAlign=right;spacingRight=18', true);
                                    port.geometry.offset = new mxPoint(-6, -4);
                                    
                                    var port = graph.insertVertex(v1, null, '关闭', 1, 0.25, 16, 16,
                                            'port;image=/static/assets/images/graph/tools/close.png;spacingLeft=18', true);
                                    port.geometry.offset = new mxPoint(-8, -8);

                                    var port = graph.insertVertex(v1, null, '输出', 1, 0.75, 16, 16,
                                            'port;image=/static/assets/images/graph/pipe/output.png;spacingLeft=18', true);
                                    port.geometry.offset = new mxPoint(-8, -4);

                                } finally {
                                    model.endUpdate();
                                }
                                
                                graph.setSelectionCell(v1);
                            }
                            
                            // Creates the image which is used as the sidebar icon (drag source)
                            var btn = document.createElement('button');
                            btn.className = 'el-button--default el-button--small el-button';  
                            btn.style.margin = '10px';
                            btn.style.padding = '10px';
                            btn.title = '拖拽到画图进行设计';


                            var img = document.createElement('img');
                            img.setAttribute('src', image);
                            img.style.width = '34px';
                            img.style.height = '34px';
                            btn.appendChild(img);

                            var p = document.createElement('p');
                            var t = document.createTextNode(data.fileContent.title);
                            p.appendChild(t);
                            btn.appendChild(p);


                            sidebar.appendChild(btn);
                            
                            var dragElt = document.createElement('div');
                            dragElt.style.border = 'dashed black 1px';
                            dragElt.style.width = '60px';
                            dragElt.style.height = '60px';
                                                
                            // Creates the image which is used as the drag icon (preview)
                            var ds = mxUtils.makeDraggable(img, graph, funct, dragElt, 0, 0, true, true);
                            ds.setGuidesEnabled(true);
                        },
                        // 图保存
                        onSave(){
                            console.log(this.model);
                            
                            let encoder = new mxCodec();
                            let node = encoder.encode(this.editor.graph.getModel());
                            let content = mxUtils.getPrettyXml(node);
                            let term = encodeURIComponent(JSON.stringify( { content:content, model:this.model } ));
                                
                            fsHandler.callFsJScriptAsync("/matrix/pipe/savePipe.js", term).then( (rtn)=>{
                                this.$message({
                                    type: "success",
                                    message: "保存成功"
                                })
                            } );
                        },
                        // 图另存为
                        onSaveAs(){

                        },
                        // 图某节点删除
                        onDelete(){

                        },
                        // 图所有节点删除
                        onDeleteAllCells(includeEdges){
                
                            // Cancels interactive operations
                            let graph = this.editor.graph;
                            graph.escape();
                            
                            let cells = graph.getChildVertices(graph.getDefaultParent());
                            if (cells != null && cells.length > 0){
                                var parents = graph.model.getParents(cells);
                                graph.removeCells(cells, includeEdges);
                                
                                // Selects parents for easier editing of groups
                                if (parents != null){
                                    var select = [];
                                    
                                    for (var i = 0; i < parents.length; i++){
                                        if (graph.model.contains(parents[i]) &&
                                            (graph.model.isVertex(parents[i]) ||
                                            graph.model.isEdge(parents[i]))){
                                            select.push(parents[i]);
                                        }
                                    }
                                    graph.setSelectionCells(select);
                                }
                            }
                        },
                        // 图关闭
                        onClose(){

                        },
                        // 图运行
                        onExecute(){

                        },
                        // 图放大
                        onZoomIn(){
                            this.editor.graph.zoomIn();
                        },
                        // 图缩小
                        onZoomOut(){
                            this.editor.graph.zoomOut();
                        },
                        // 图自适应大小
                        onFit(){
                            this.editor.execute("fit");
                        },
                        // 生成配置实例
                        newInstance(model, id){
                            let term = encodeURIComponent( JSON.stringify( { model:model, id:id } ) );
                            fsHandler.callFsJScriptAsync("/matrix/pipe/newInstance.js", term);
                        },
                        // 删除配置实例
                        deleteInstance(id){
                            fsHandler.callFsJScriptAsync("/matrix/pipe/deleteInstance.js", encodeURIComponent(id));
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
                            },
                            splitInst: null
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
                            
                            fsHandler.callFsJScriptAsync("/matrix/pipe/getPipeList.js").then( (val)=>{
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