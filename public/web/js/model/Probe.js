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
class Probe extends Matrix {

    constructor() {
        super();

        this.app = null;
    }

    init() {

        // 集成接入
        let cfg = mx.urlParams['cfg'] ? _.attempt(JSON.parse.bind(null, decodeURIComponent(mx.urlParams['cfg']))) : null;

        _.delay(function(){
            if(cfg){ 
                _.forEach(cfg,function(v,k){
                    $(`#${k}`).hide();
                    $(`#${k}-bg`).hide();
    
                    if(k==='tabs'){
                        let i = 0;
                        _.forEach(v,function(item){
                            if(item){
                                $($("#probe-tabs-ul").children()[i]).css("display","");
                                $($("#probe-tabs-div").children()[i]).css("display","");
                            } else {
                                $($("#probe-tabs-ul").children()[i]).css("display","none");
                                $($("#probe-tabs-div").children()[i]).css("display","none");
                            }
                            i = i+1;
                        })
                        
                        $("#probe-tabs-ul > li").removeClass("active")
                        $("#probe-tabs-div > div").removeClass("active")

                        $($("#probe-tabs-ul").children()[_.indexOf(v,true)]).addClass("active")
                        $($("#probe-tabs-div").children()[_.indexOf(v,true)]).addClass("active")
                    }
                })
    
                _.delay(function(){
                    $('#content.content').addClass('content-expand');
                },1000)
            } else {
                $('#content.content').removeClass('content-expand');
            }
        },500)

        // 组件实例化
        VueLoader.onloaded(["ai-robot-component",
            "entity-tree-component",
            "probe-tree-component",
            "probe-dropdown-tree-component",
            "probe-card-component",
            "probe-list-datatables-component",
            "policy-list-datatables-component",
            "log-list-datatables-component",
            "script-datatable"], function () {
            
            // 探针管理
            Vue.component("probe-manage",{
                delimiters: ['#{', '}#'],
                props: {
                    model: Object
                },
                data(){
                    return {
                        dt:{
                            rows:[],
                            columns: [],
                            selected: []
                        },
                        info: []
                    }
                },
                template:   `<el-container style="width:100%;height:100%;">
                                <el-header style="height:30px;line-height:30px;">
                                    <el-tooltip content="切换视图" open-delay="500" placement="top">
                                        <el-button type="text" icon="el-icon-s-fold" @click="onToggle"></el-button>
                                    </el-tooltip>
                                    <el-tooltip content="刷新" open-delay="500" placement="top">
                                        <el-button type="text" icon="el-icon-refresh" @click="eventHub.$emit('PROBE-REFRESH-EVENT', ['probe'])"></el-button>
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
                                </el-header>   
                                <el-main style="width:100%;padding:0px;">
                                    <el-table
                                        :data="dt.rows"
                                        highlight-current-row="true"
                                        style="width: 100%;"
                                        :row-class-name="rowClassName"
                                        :header-cell-style="headerRender"
                                        @row-dblclick="onRowDblclick"
                                        @row-contextmenu="onRowContextmenu"
                                        @selection-change="onSelectionChange"
                                        @current-change="onCurrentChange"
                                        ref="table">
                                        <!--el-table-column type="selection" align="center"></el-table-column--> 
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
                                        <el-table-column label="操作" width="100" fixed="right">
                                            <template slot-scope="scope" v-if="scope.row.iszabbix == 1">
                                                <el-tooltip content="启动" open-delay="500">
                                                    <el-button type="text" icon="el-icon-video-play"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="停止" open-delay="500">
                                                    <el-button type="text" icon="el-icon-video-pause"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="重启" open-delay="500">
                                                    <el-button type="text" icon="el-icon-refresh"></el-button>
                                                </el-tooltip>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-main>
                                <el-footer  style="height:30px;line-height:30px;">
                                    #{ info.join(' &nbsp; | &nbsp;') }#
                                </el-footer>
                            </el-container>`,
                watch: {
                    model: {
                        handler(val,oldVal){
                            this.initData();
                            this.layout();
                        },
                        deep:true,
                        immediate:true
                    },
                    dt: {
                        handler(val,oldVal){
                            this.info = [];
                            this.info.push(`共 ${this.dt.rows.length} 项`);
                            this.info.push(`已选择 ${this.dt.selected.length} 项`);
                            this.info.push(moment().format("YYYY-MM-DD HH:MM:SS.SSS"));
                        },
                        deep:true,
                        immediate:true
                    }
                },
                mounted(){
                    
                },
                methods: {
                    layout(){
                        let doLayout = ()=>{
                            if($(".el-table-column--selection",this.$el).is(':visible')){
                                _.delay(()=>{
                                    this.$refs.table.doLayout();
                                },1000)
                            } else {
                                setTimeout(doLayout,50);
                            }
                        }
                        doLayout();
                    },
                    initData(){
                        const self = this;
                        
                        let init = function(){
                            
                            _.extend(self.dt, {columns: _.map(self.model.columns, function(v){
                                
                                if(_.isUndefined(v.visible)){
                                    _.extend(v, { visible: true });
                                }

                                if(!v.render){
                                    return v;
                                } else {
                                    return _.extend(v, { render: eval(v.render) });
                                }
                                
                            })});

                            _.extend(self.dt, {rows: self.model.rows});
                        };

                        _.delay(()=>{
                            init();
                        },1000)
                        
                    },
                    rowClassName({row, rowIndex}){
                        return `row-${rowIndex}`;
                    },
                    headerRender({ row, column, rowIndex, columnIndex }){
                        if (rowIndex === 0) {
                            //return 'text-align:center;';
                        }
                    },
                    onSelectionChange(val) {
                        this.dt.selected = [val];
                    },
                    onCurrentChange(val){
                        this.dt.selected = [val];
                    },
                    onRowContextmenu(row, column, event){
                        
                    },
                    onRowDblclick(row, column, event){
                        
                    },
                    onExport(type){
                
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
                    onToggle(){
                        this.$root.$refs.probeView.onToggle();
                    }
                }
            })

            // 脚本管理
            Vue.component("script-manage",{
                delimiters: ['#{', '}#'],
                props: {
                    model: Object
                },
                data(){
                    return {
                        dt:{
                            rows:[],
                            columns: [],
                            selected: []
                        },
                        servers: {
                            list: [],
                        },
                        info: []
                    }
                },
                template:   `<el-container style="width:100%;height:100%;">
                                <el-header style="height:30px;line-height:30px;">
                                    <el-tooltip content="切换视图" open-delay="500" placement="top">
                                        <el-button type="text" icon="el-icon-s-fold" @click="onToggle"></el-button>
                                    </el-tooltip>
                                    <!--el-tooltip content="下发脚本" delay-time="500" placement="top">
                                        <el-button type="text" icon="el-icon-download" @click="scriptDeploy"></el-button>
                                    </el-tooltip-->
                                    <!--el-tooltip content="编辑脚本" delay-time="500" placement="top">
                                        <el-button type="text" icon="el-icon-edit-outline" @click="scriptUpdate"></el-button>
                                    </el-tooltip-->
                                    <!--el-tooltip content="删除未下发脚本" delay-time="500" placement="top">
                                        <el-button type="text" icon="el-icon-delete" @click="scriptDelete"></el-button>
                                    </el-tooltip-->
                                    <el-tooltip content="刷新" delay-time="500" placement="top">
                                        <el-button type="text" icon="el-icon-refresh" @click="scriptRefresh"></el-button>
                                    </el-tooltip>
                                    <el-tooltip content="导出" delay-time="500" placement="top">
                                        <el-dropdown @command="onExport">
                                            <span class="el-dropdown-link">
                                                <i class="el-icon-download el-icon--right" style="font-size:15px;"></i>
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
                                    <el-divider direction="vertical"></el-divider>
                                    <el-tooltip content="上传脚本" delay-time="500" placement="top">
                                        <el-dropdown>
                                            <span class="el-dropdown-link">
                                                <i class="el-icon-upload el-icon--right" style="font-size:15px;color:#67c23a;"></i>
                                            </span>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item @click.native="scriptUpload">通用脚本</el-dropdown-item>
                                                <el-dropdown-item @click.native="scriptUpload" divided>Zabbix脚本</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </el-tooltip>
                                </el-header>   
                                <el-main style="width:100%;padding:0px;">
                                    <el-table
                                        :data="dt.rows"
                                        highlight-current-row="true"
                                        style="width: 100%"
                                        :row-class-name="rowClassName"
                                        :header-cell-style="headerRender"
                                        @row-dblclick="onRowDblclick"
                                        @row-contextmenu="onRowContextmenu"
                                        @selection-change="onSelectionChange"
                                        @current-change="onCurrentChange"
                                        ref="table">
                                        <!--el-table-column type="selection" align="center"></el-table-column--> 
                                        <el-table-column label="下发状态" width="90" prop="status">
                                            <template slot-scope="scope">
                                                <el-button type="success" @click="onToogleExpand(scope.row)" v-if="scope.row.status == 1">已下发 ></el-button>
                                                <el-button type="warning" v-else>未下发</el-button>
                                            </template>
                                        </el-table-column>
                                        <el-table-column type="expand" width="1">
                                            <template slot-scope="props">
                                                <el-container>
                                                    <el-main>
                                                        <el-transfer
                                                            :titles="['服务器列表', '已下发服务器']"
                                                            :button-texts="['取消下发', '下发']"
                                                            :data="servers.list"
                                                            v-model="props.row.selected"
                                                            :props="{
                                                                key: 'host',
                                                                label: 'host'
                                                            }">
                                                        </el-transfer>
                                                    </el-main>
                                                </el-container>
                                            </template>
                                        </el-table-column>
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
                                        <el-table-column label="操作" width="130" fixed="right">
                                            <template slot-scope="scope">
                                                <el-tooltip content="下发" open-delay="500">
                                                    <el-button type="text" icon="el-icon-download"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="编辑" open-delay="500">
                                                    <el-button type="text" icon="el-icon-edit-outline"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="删除" open-delay="500">
                                                    <el-button type="text" icon="el-icon-delete" @click="onDelete(scope.row,scope.$index)"></el-button>
                                                </el-tooltip>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-main>
                                <el-footer  style="height:30px;line-height:30px;">
                                    #{ info.join(' &nbsp; | &nbsp;') }#
                                </el-footer>
                            </el-container>`,
                filters: {
                    
                },
                watch: {
                    'model.rows': {
                        handler(val,oldVal){
                            if(val !== oldVal){
                                this.dt.rows = [];
                                this.initData();
                            }
                            this.layout();
                        },
                        deep:true
                    },
                    dt: {
                        handler(val,oldVal){
                            this.info = [];
                            this.info.push(`共 ${this.dt.rows.length} 项`);
                            this.info.push(`已选择 ${this.dt.selected.length} 项`);
                            this.info.push(moment().format("YYYY-MM-DD HH:MM:SS.SSS"));
                        },
                        deep:true,
                        immediate:true
                    }
                },
                created(){
                    this.getServerList();
                },
                mounted(){
                    this.$nextTick(()=>{
                        this.layout();
                    })
                },
                methods: {
                    layout(){
                        let doLayout = ()=>{
                            if($(".el-table-column--selection",this.$el).is(':visible')){
                                _.delay(()=>{
                                    this.$refs.table.doLayout();
                                },1000)
                            } else {
                                setTimeout(doLayout,50);
                            }
                        }
                        doLayout();
                    },
                    initData(){
                        const self = this;
                        
                        let init = function(){
                            
                            _.extend(self.dt, {columns: _.map(self.model.columns, (v)=>{
                                
                                if(_.isUndefined(v.visible)){
                                    _.extend(v, { visible: true });
                                }

                                if(!v.render){
                                    return v;
                                } else {
                                    return _.extend(v, { render: eval(v.render) });
                                }
                                
                            })});

                            _.extend(self.dt, {rows: self.model.rows});

                        };

                        _.delay(()=>{
                            init();
                        },1000)
                        
                    },
                    rowClassName({row, rowIndex}){
                        return `row-${rowIndex}`;
                    },
                    headerRender({ row, column, rowIndex, columnIndex }){
                        if (rowIndex === 0) {
                            //return 'text-align:center;';
                        }
                    },
                    getServerList(){
                        let rtn = fsHandler.callFsJScript("/matrix/probe/getServerList.js",null).message;
                        this.$set(this.servers,'list', rtn);
                    },
                    onSelectionChange(val) {
                        this.dt.selected = val;
                    },
                    onCurrentChange(val){
                        this.dt.selected = [val];
                    },
                    onRowContextmenu(row, column, event){
                        
                    },
                    onRowDblclick(row, column, event){
                        
                    },
                    onExport(type){
                
                        let options = {
                            csvEnclosure: '',
                            csvSeparator: ', ',
                            csvUseBOM: true,
                            ignoreColumn: [0,1],
                            fileName: `tableExport_${moment().format("YYYY-MM-DD HH:MM:SS")}`,
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
                    onToggle(){
                        this.$root.$refs.scriptView.onToggle();
                    },
                    onToogleExpand(row){
                        this.$refs.table.toggleRowExpansion(row)
                    },
                    onDelete(row,index){
                        
                        this.$confirm('确定删除选定的脚本?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                            }).then(() => {

                                let rtn = scriptHandler.depotDelete(row.name); 

                                if(rtn === 1) {
                                    this.$message({
                                        type: "success",
                                        message: "删除成功！"
                                    })
                                    eventHub.$emit("PROBE-REFRESH-EVENT", ['script']);
                                } else {
                                    this.$message({
                                        type: "error",
                                        message: "删除失败：" + result.message
                                    })
                                }
                                
                            }).catch(() => {
                                wnd.close();
                            })      

                    },
                    scriptDeploy(){
                        const self = this;

                        let wnd = maxWindow.winProbe( `<i class="fas fa-plus-circle"></i> 下发`, `<div id="script-deploy-container"></div>`, null, 'script-container');

                        let wizard = {
                            delimiters: ['#{', '}#'],
                            data: {
                                model: {
                                    script: {},
                                    servers: [],
                                },
                                activeName: 'first'
                            },
                            template:   `<el-container style="height:100%;">
                                            <el-main style="height:100%;overflow:hidden;">
                                                <el-tabs v-model="activeName" type="border-card">
                                                    <el-tab-pane name="first" style="height:100%;">
                                                        <div slot="label">
                                                            <i class="header-icon el-icon-upload"></i> 选择脚本
                                                        </div>
                                                        <el-container style="height:calc(100% - 80px);">
                                                            <el-main style="height:100%;padding:0px;">
                                                                <el-form label-position="left" label-width="120px">
                                                                    <el-form-item label="脚本名称">
                                                                        <el-input v-model="model.script.name" required="required" ></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本版本">
                                                                        <el-input type="number" v-model="model.script.version" required="required" step="0.1"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="执行命令">
                                                                        <el-input v-model="model.script.command"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本说明">
                                                                        <el-input type="textarea" :row="6" v-model="model.script.remark"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="添加标签">
                                                                        <el-tag
                                                                            v-for="tag in model.script.tags"
                                                                            :key="tag"
                                                                            closable>
                                                                            #{tag}#
                                                                        </el-tag>
                                                                    </el-form-item>
                                                                </el-form>
                                                            </el-main>
                                                        </el-container>
                                                    </el-tab-pane>
                                                    <el-tab-pane name="second">
                                                        <div slot="label">
                                                            <i class="header-icon el-icon-s-platform"></i> 选择下发目标，开始下发
                                                        </div>
                                                        <el-container>
                                                            <el-header style="height:40px;line-height:40px;text-align:right;">
                                                                <el-button type="primary" @click="onDeploy">下发并退出</el-button>    
                                                            </el-header>
                                                            <el-main style="padding:0px;">
                                                                <script-datatable :model="model.servers" ref="scriptServerRef"></script-datatable>
                                                            </el-main>
                                                        </el-container>
                                                    </el-tab-pane>
                                                </el-tabs>
                                            </el-main>
                                        </el-container>`,
                            created(){
                                this.model.script = _.first(self.dt.selected);
                                this.loadServer();
                            },
                            mounted(){
                                this.$nextTick(()=> {
                                    this.tagInput();
                                    $(this.$el).find("li").on("click",()=>{
                                        eventHub.$emit("COMPONENT-REDRAW-EVENT");
                                    })
                                })
                            },
                            methods: {
                                loadServer(){
                                    let conf = fsHandler.callFsJScript("/matrix/probe/probe_summary_script_conf.js", mx.urlParams['userid']).message;
                                    this.model.servers = conf.servers;  
                                },
                                tagInput: function(className,container, tags){
                                    const me = this

                                    me.model.handler.tagify = $(me.$el).find(".tags").tagify()
                                        .on("add",function(event, tagName){
                                            me.model.item.tags = tagName.value;
                                        })
                                        .on("remove",function(event,tagName){
                                            me.model.item.tags = tagName.value;
                                        });

                                },
                                onDeploy(){
                                
                                    this.$confirm('确定下发该脚本?', '提示', {
                                        confirmButtonText: '需要',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                        }).then(() => {

                                            let result = null;
                                            
                                            _.forEach(self.dt.selected,(v)=>{
            
                                                let depot = _.extend({},{depots: v.name, versions: v.version, hosts: _.map(this.$refs.scriptServerRef.dt.selected,'host') });

                                                let rtn = scriptHandler.depotDeploy(depot);

                                                if(rtn === 1) {
                                                    result = null;
                                                } else {
                                                    result = rtn;
                                                }

                                            })   
                                            if(result == null){
                                                this.$message({
                                                    type: "success",
                                                    message: "下发成功！"
                                                })
                                                eventHub.$emit("PROBE-REFRESH-EVENT", ['script']);
                                            } else{
                                                this.$message({
                                                    type: "error",
                                                    message: "下发失败：" + result.message
                                                })
                                            }
                                            
                                        }).catch(() => {
                                            wnd.close();
                                        })
                                }
                            }
                        };

                        new Vue(wizard).$mount("#script-deploy-container");
                    },
                    scriptRefresh(){
                        this.$root.$refs.scriptView.getScriptList();
                    },
                    scriptUpload(){
                        let wnd = maxWindow.winProbe( `<i class="fas fa-plus-circle"></i> 上传`, `<div id="script-add-container"></div>`, null, 'script-container');

                        let conf = fsHandler.callFsJScript("/matrix/probe/probe_summary_script_conf.js", mx.urlParams['userid']).message;
                        
                        let wizard = {
                            delimiters: ['#{', '}#'],
                            data: {
                                model: {
                                    item: {
                                        name: null,
                                        version: 1.0,
                                        remark: null,
                                        uploadfile: null,
                                        tags: ['SCRIPT'],
                                        servers: conf.servers,
                                        command: null,
                                        wnd: wnd
                                    },
                                    handler: {
                                        tagify: null
                                    }
                                },
                                fileList: [],
                                activeName: 'first'
                            },
                            template:   `<el-container style="height:100%;">
                                            <el-main style="height:100%;overflow:hidden;">
                                                <el-tabs v-model="activeName" type="border-card">
                                                    <el-tab-pane name="first" style="height:100%;">
                                                        <div slot="label">
                                                            <i class="header-icon el-icon-upload"></i> 选择脚本，上传到脚本库
                                                        </div>
                                                        <el-container style="height:calc(100% - 80px);">
                                                            <el-header style="height:40px;line-height:40px;text-align:right;">
                                                                <el-button type="primary" @click="save">上传</el-button>    
                                                            </el-header>
                                                            <el-main style="height:100%;">
                                                                <el-form label-position="left" label-width="120px">
                                                                    <el-form-item>
                                                                        <el-upload
                                                                            :on-preview="handlePreview"
                                                                            :on-remove="handleRemove"
                                                                            :on-change="onFileChange"
                                                                            :before-remove="beforeRemove"
                                                                            :file-list="fileList"
                                                                            :limit="1"
                                                                            multiple="false"
                                                                            :auto-upload="false">
                                                                            <el-button size="mini" type="success">点击上传脚本</el-button>
                                                                            <div slot="tip" class="el-upload__tip">只能上传脚本文件</div>
                                                                            </el-upload>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本名称">
                                                                        <el-input v-model="model.item.name" required="required" ></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本版本">
                                                                        <el-input type="number" v-model="model.item.version" required="required" step="0.1"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="执行命令">
                                                                        <el-input v-model="model.item.command"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本说明">
                                                                        <el-input type="textarea" :row="6" v-model="model.item.remark"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="添加标签">
                                                                        <el-tag
                                                                            v-for="tag in model.item.tags"
                                                                            :key="tag"
                                                                            closable>
                                                                            #{tag}#
                                                                        </el-tag>
                                                                    </el-form-item>
                                                                </el-form>
                                                            </el-main>
                                                        </el-container>
                                                    </el-tab-pane>
                                                    <el-tab-pane name="second">
                                                        <div slot="label">
                                                            <i class="header-icon el-icon-s-platform"></i> 如果需要下发，选择下发目标，开始下发
                                                        </div>
                                                        <el-container>
                                                            <el-header style="height:40px;line-height:40px;text-align:right;">
                                                                <el-button type="primary" @click="onDeploy">下发并退出</el-button>    
                                                            </el-header>
                                                            <el-main>
                                                                <script-datatable :model="model.item.servers" ref="scriptUploadServerRef"></script-datatable>
                                                            </el-main>
                                                        </el-container>
                                                    </el-tab-pane>
                                                </el-tabs>
                                            </el-main>
                                        </el-container>`,
                            mounted(){
                                this.$nextTick(()=> {
                                    this.tagInput();
                                    $(this.$el).find("li").on("click",()=>{
                                        eventHub.$emit("COMPONENT-REDRAW-EVENT");
                                    })
                                })
                            },
                            methods: {
                                tagInput: function(className,container, tags){
                                    const me = this

                                    me.model.handler.tagify = $(me.$el).find(".tags").tagify()
                                        .on("add",function(event, tagName){
                                            me.model.item.tags = tagName.value;
                                        })
                                        .on("remove",function(event,tagName){
                                            me.model.item.tags = tagName.value;
                                        });

                                },
                                save(){
                                    
                                    let result = scriptHandler.depotAdd(this.model.item);

                                    if(result == 1){
                                        
                                        this.$message({
                                            type: "success",
                                            message: "上传成功！"
                                        })

                                        this.$confirm('是否需要下发该脚本?', '提示', {
                                            confirmButtonText: '需要',
                                            cancelButtonText: '取消',
                                            type: 'warning'
                                            }).then(() => {
                                                this.activeName = 'second';    
                                            }).catch(() => {
                                                wnd.close();
                                            });

                                        eventHub.$emit("PROBE-REFRESH-EVENT", ['script']);
                                    } else{
                                        this.$message({
                                            type: "error",
                                            message: "上传失败：" + result.message
                                        })
                                    }
                                    
                                },
                                onFileChange(file, fileList) {
                                    
                                    this.model.item.name = _.head(file.raw.name.split("."));
                                    
                                    this.model.item.uploadfile = file.raw;

                                },
                                onDeploy(){
                                
                                    this.$confirm('确定下发该脚本?', '提示', {
                                        confirmButtonText: '需要',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                        }).then(() => {

                                            let depot = _.extend({},{depots: this.model.item.name, versions: this.model.item.version, hosts: _.map(this.$refs.scriptUploadServerRef.dt.selected,'host') });

                                            let result = scriptHandler.depotDeploy(depot);

                                            if(result == null){
                                                this.$message({
                                                    type: "success",
                                                    message: "下发成功！"
                                                })
                                                eventHub.$emit("PROBE-REFRESH-EVENT", ['script']);
                                            } else{
                                                this.$message({
                                                    type: "error",
                                                    message: "下发失败：" + result.message
                                                })
                                            }
                                            
                                        }).catch(() => {
                                            wnd.close();
                                        })
                                },
                                handleRemove(file, fileList) {
                                    console.log(file, fileList);
                                },
                                handlePreview(file) {
                                    console.log(file);
                                },
                                beforeRemove(file, fileList) {
                                    return this.$confirm(`确定移除 ${ file.name }？`);
                                }
                            }
                        };

                        new Vue(wizard).$mount("#script-add-container");
                    },
                    scriptUpdate(){

                        const self = this;

                        let wnd = maxWindow.winProbe( `<i class="fas fa-plus-circle"></i> 编辑`, `<div id="script-update-container"></div>`, null, 'script-container');

                        let conf = fsHandler.callFsJScript("/matrix/probe/probe_summary_script_conf.js", mx.urlParams['userid']).message;
                        
                        let wizard = {
                            delimiters: ['#{', '}#'],
                            data: {
                                model: {
                                    item: {
                                        name: null,
                                        version: null,
                                        remark: null,
                                        uploadfile: null,
                                        tags: ['SCRIPT'],
                                        servers: conf.servers,
                                        command: null,
                                        wnd: wnd
                                    },
                                    handler: {
                                        tagify: null
                                    }
                                },
                                fileList: [],
                                activeName: 'first'
                            },
                            template:   `<el-container style="height:100%;">
                                            <el-main style="height:100%;overflow:hidden;">
                                                <el-tabs v-model="activeName" type="border-card">
                                                    <el-tab-pane name="first" style="height:100%;">
                                                        <div slot="label">
                                                            <i class="header-icon el-icon-upload"></i> 选择脚本，上传到脚本库
                                                        </div>
                                                        <el-container style="height:calc(100% - 80px);">
                                                            <el-header style="height:40px;line-height:40px;text-align:right;">
                                                                <el-button type="primary" @click="save">上传</el-button>    
                                                            </el-header>
                                                            <el-main style="height:100%;">
                                                                <el-form label-position="left" label-width="120px">
                                                                    <el-form-item>
                                                                        <el-upload
                                                                            :on-preview="handlePreview"
                                                                            :on-remove="handleRemove"
                                                                            :on-change="onFileChange"
                                                                            :before-remove="beforeRemove"
                                                                            :file-list="fileList"
                                                                            :limit="1"
                                                                            multiple="false"
                                                                            :auto-upload="false">
                                                                            <el-button size="mini" type="success">点击上传脚本</el-button>
                                                                            <div slot="tip" class="el-upload__tip">只能上传脚本文件</div>
                                                                            </el-upload>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本名称">
                                                                        <el-input v-model="model.item.name" required="required" disabled></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本版本">
                                                                        <el-input type="number" v-model="model.item.version" required="required" step="0.1"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="执行命令">
                                                                        <el-input v-model="model.item.command"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本说明">
                                                                        <el-input type="textarea" :row="6" v-model="model.item.remark"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="添加标签">
                                                                        <el-tag
                                                                            v-for="tag in model.item.tags"
                                                                            :key="tag"
                                                                            closable>
                                                                            #{tag}#
                                                                        </el-tag>
                                                                    </el-form-item>
                                                                </el-form>
                                                            </el-main>
                                                        </el-container>
                                                    </el-tab-pane>
                                                    <el-tab-pane name="second" style="display:none;">
                                                        <div slot="label">
                                                            <i class="header-icon el-icon-s-platform"></i> 如果需要下发，选择下发目标，开始下发
                                                        </div>
                                                        <el-container>
                                                            <el-header style="height:40px;line-height:40px;text-align:right;">
                                                                <el-button type="primary" @click="onDeploy">下发并退出</el-button>    
                                                            </el-header>
                                                            <el-main>
                                                                <script-datatable :model="model.item.servers" ref="scriptUpdateServerRef"></script-datatable>
                                                            </el-main>
                                                        </el-container>
                                                    </el-tab-pane>
                                                </el-tabs>
                                            </el-main>
                                        </el-container>`,
                            created(){
                                _.extend(this.model, {item: self.dt.selected[0]});
                                _.extend(this.model.item, {servers:conf.servers});
                                this.fileList.push({
                                        status: "ready",
                                        name: this.model.item.name,
                                        size: 0,
                                        percentage: 0,
                                        uid: _.now(),
                                        raw: null
                                    }
                                );
                            },
                            mounted(){
                                this.$nextTick(()=> {
                                    this.tagInput();
                                    $(this.$el).find("li").on("click",()=>{
                                        eventHub.$emit("COMPONENT-REDRAW-EVENT");
                                    })
                                })
                            },
                            methods: {
                                tagInput: function(className,container, tags){
                                    const me = this

                                    me.model.handler.tagify = $(me.$el).find(".tags").tagify()
                                        .on("add",function(event, tagName){
                                            me.model.item.tags = tagName.value;
                                        })
                                        .on("remove",function(event,tagName){
                                            me.model.item.tags = tagName.value;
                                        });

                                },
                                save(){
                                    
                                    let result = scriptHandler.depotUpdate(this.model.item);

                                    if(result == 1){
                                        
                                        this.$message({
                                            type: "success",
                                            message: "更新成功！"
                                        })

                                        this.$confirm('是否需要下发该脚本?', '提示', {
                                            confirmButtonText: '需要',
                                            cancelButtonText: '取消',
                                            type: 'warning'
                                            }).then(() => {
                                                this.activeName = 'second';    
                                            }).catch(() => {
                                                wnd.close();
                                            });

                                        eventHub.$emit("PROBE-REFRESH-EVENT", ['script']);
                                    } else{
                                        this.$message({
                                            type: "error",
                                            message: "更新失败：" + result.message
                                        })
                                    }
                                    
                                },
                                onFileChange(file, fileList) {
                                    
                                    this.model.item.name = _.head(file.raw.name.split("."));
                                    
                                    this.model.item.uploadfile = file.raw;

                                },
                                onDeploy(){
                                
                                    this.$confirm('确定下发该脚本?', '提示', {
                                        confirmButtonText: '需要',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                        }).then(() => {

                                            let depot = _.extend({},{depots: this.model.item.name, versions: this.model.item.version, hosts: _.map(this.$refs.scriptUpdateServerRef.dt.selected,'host') });

                                            let result = scriptHandler.depotDeploy(depot);

                                            if(result == null){
                                                this.$message({
                                                    type: "success",
                                                    message: "下发成功！"
                                                })
                                                eventHub.$emit("PROBE-REFRESH-EVENT", ['script']);
                                            } else{
                                                this.$message({
                                                    type: "error",
                                                    message: "下发失败：" + result.message
                                                })
                                            }
                                            
                                        }).catch(() => {
                                            wnd.close();
                                        })
                                },
                                handleRemove(file, fileList) {
                                    console.log(file, fileList);
                                },
                                handlePreview(file) {
                                    console.log(file);
                                },
                                beforeRemove(file, fileList) {
                                    return this.$confirm(`确定移除 ${ file.name }？`);
                                }
                            }
                        };

                        new Vue(wizard).$mount("#script-update-container");
                    }
                }
            })

            Vue.component("probe-view", {
                props: {
                    model: Object
                },
                data(){
                    return {
                        splitInst: null
                    }
                },
                template: `<el-container style="height:calc(100vh - 145px);">
                                <el-aside style="background:#f7f7f7;width:20%;" ref="leftView">
                                    <entity-tree-component id="probe-tree" :model="{parent:'/probe',name:'probe_tree_data.js',domain:'probe'}" ref="tagTree"></entity-tree-component>
                                </el-aside>
                                <el-main style="padding:0px;width:80%;" ref="mainView">
                                    <el-container style="height:100%;">
                                        <el-header style="height:120px;padding:0px;">
                                            <probe-card-component :model="model.summary"></probe-card-component>
                                        </el-header>
                                        <el-main style="padding:0px;">
                                            <probe-manage :model="model.list"></probe-manage>
                                        </el-main>
                                    </el-container>
                                </el-main>
                            </el-container>`,
                mounted(){
                    this.$nextTick().then(()=>{
                        this.initSplitH();
                    })   
                },
                methods: {
                    initSplitH(){
                        this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                            sizes: [20, 80],
                            minSize: [0, 0],
                            gutterSize: 5,
                            gutterAlign: 'end',
                            cursor: 'col-resize',
                            direction: 'horizontal',
                            expandToMin: true
                        });
                        _.delay(()=>{
                            $(this.$refs.leftView.$el).toggle();
                        },10)
                    },
                    onToggle(){
                        $(this.$refs.leftView.$el).toggle();
                    }
                }
            });

            Vue.component("policy-view", {
                props: {
                    model: Object
                },
                template: `<el-container style="height:calc(100vh - 140px);">
                                <el-aside style="width:200px;margin:-15px -10px -15px -15px;">
                                    <probe-tree-component id="policy-tree" :model="{parent:'/probe',name:'policy_tree_data.js',domain:'policy'}"></-tree-component>
                                </el-aside>
                                <el-main class="policy-container" style="padding:0px;">
                                    <!--h4 class="page-header"><i class="fas fa-angle-right"></i> 策略管理</h4 class="page-header"-->
                                    <policy-list-datatables-component :model="model" id="policy-list-table"></policy-list-datatables-component>
                                </el-main>
                            </el-container>`
            });

            Vue.component("log-view", {
                props: {
                    model: Object
                },
                template: `<el-container style="height:calc(100vh - 140px);">
                                <el-aside style="width:200px;margin:-15px -10px -15px -15px;">
                                    <probe-tree-component id="log-tree" :model="{parent:'/probe',name:'log_tree_data.js',domain:'log'}"></-tree-component>
                                </el-aside>
                                <el-main class="log-container" style="padding:0px;">
                                    <!--h4 class="page-header"><i class="fas fa-angle-right"></i> 日志管理</h4 class="page-header"-->
                                    <log-list-datatables-component :model="model" id="log-list-table"></log-list-datatables-component>
                                </el-main>
                            </el-container>`
            });

            Vue.component("script-view", {
                data(){
                    return {
                        model: {},
                        splitInst: null
                    }
                },
                template: `<el-container style="height:calc(100vh - 145px);width:100%;">
                                <el-aside ref="leftView" style="background:#f7f7f7;">
                                    <entity-tree-component id="script-tree" :model="{parent:'/probe',name:'script_tree_data.js',domain:'script'}" ref="tagTree"></entity-tree-component>
                                </el-aside>
                                <el-main style="padding:0px;width:100%;" ref="mainView">
                                    <el-container style="height:100%;">
                                        <el-main style="padding:0px;width:100%;">
                                            <script-manage :model="model.list" ref="scriptManageRef" v-if="!_.isEmpty(model.list.rows)"></script-manage>
                                        </el-main>
                                    </el-container>
                                </el-main>
                            </el-container>`,
                created(){
                    this.getScriptList();
                },
                mounted(){
                    this.$nextTick().then(()=>{
                        
                        let init = ()=>{
                            if($(this.$refs.scriptManageRef.$el).is(':visible')){
                                this.getScriptList();
                                this.initSplitH();
                            } else {
                                setTimeout(init,50);
                            }
                        }
                        init();
                    })   
                },
                methods: {
                    initSplitH(){
                        this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                            sizes: [20, 80],
                            minSize: [0, 0],
                            gutterSize: 5,
                            gutterAlign: 'end',
                            cursor: 'col-resize',
                            direction: 'horizontal',
                            expandToMin: true
                        });
                        _.delay(()=>{
                            $(this.$refs.leftView.$el).toggle();
                        },10)
                    },
                    // 获取所有脚本列表
                    getScriptList(){
                        this.model = fsHandler.callFsJScript("/matrix/probe/getScriptList.js",null).message;
                    },
                    onToggle(){
                        $(this.$refs.leftView.$el).toggle();
                    }
                }
            });

            $(function () {

                this.app = new Vue({
                    delimiters: ['${', '}'],
                    template: ` <el-container style="background:#ffffff;">
                                    <el-main style="padding:0px;overflow:hidden;">
                                        <el-tabs v-model="tabs.activeName" type="border-card">
                                            <el-tab-pane label="探针列表" name="probe">
                                                <probe-view :model="probe" ref="probeView"></probe-view>
                                            </el-tab-pane>
                                            <!--el-tab-pane label="策略管理" name="policy">
                                                <policy-view :model="policy"></policy-view>
                                            </el-tab-pane-->
                                            <!--el-tab-pane label="日志配置" name="log">
                                                <log-view :model="log"></log-view>
                                            </el-tab-pane-->
                                            <el-tab-pane label="脚本管理" name="script" lazy>
                                                <script-view ref="scriptView"></script-view>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    data: {
                        probe: {},
                        policy: {},
                        log: {},
                        tabs:{
                            activeName: 'probe',
                        }
                    },
                    created() {
                        eventHub.$on("PROBE-REFRESH-EVENT", this.getProbeList);
                    },
                    mounted() {
                        this.$nextTick(()=> {
                            this.getProbeList();
                            _.delay(()=> {
                                this.initPlug();
                            }, 1000)
                        })
                    },
                    methods: {
                        initPlug() {
                            /* toggle tab trigger Echart resize */
                            $("a[data-toggle='tab']").on("shown.bs.tab", ()=> {
                                eventHub.$emit("COMPONENT-REDRAW-EVENT", null);
                            })
                        },
                        getProbeList() {
                            this.probe = fsHandler.callFsJScript(`/matrix/probe/getProbeList.js`, '').message;
                        }
                    }
                }).$mount("#app");

            });

        })
    }
}

let probe = new Probe();
probe.init();