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
            "probe-card-component"], function () {
            
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
                        info: [],
                        loading: false
                    }
                },
                template:   `<el-container style="width:100%;height:100%;">
                                <el-header style="height:30px;line-height:30px;">
                                    <el-tooltip content="切换视图" open-delay="500" placement="top">
                                        <el-button type="text" icon="el-icon-s-fold" @click="onToggle"></el-button>
                                    </el-tooltip>
                                    <el-tooltip content="刷新" open-delay="500" placement="top">
                                        <el-button type="text" icon="el-icon-refresh" @click="$root.getProbeList"></el-button>
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
                                        v-loading="loading"
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
                                        <el-table-column label="标签" prop="tags">
                                            <template slot-scope="scope">
                                                <el-select
                                                    v-model="scope.row.tags"
                                                    multiple
                                                    filterable
                                                    allow-create
                                                    default-first-option
                                                    class="el-select-tags"
                                                    placeholder="标签"
                                                    @change="onTagChange($event,scope.row)"
                                                    @remove-tag="onTagRemove($event,scope.row)">
                                                    <el-option
                                                        v-for="tag in scope.row.tags"
                                                        :key="tag"
                                                        :label="tag"
                                                        :value="tag">
                                                    </el-option>
                                                </el-select>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="Toe探针" width="120">
                                            <template slot-scope="scope">
                                                <el-tooltip content="启动" open-delay="500" v-if="scope.row.agentstatus.toe == '1'">
                                                    <el-button type="success">
                                                        <i class="el-icon-video-play"></i> 启动中
                                                    </el-button>
                                                </el-tooltip>
                                                <el-tooltip content="停止" open-delay="500" v-else>
                                                    <el-button type="danger">
                                                        <i class="el-icon-video-pause"></i> 停止中
                                                    </el-button>
                                                </el-tooltip>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="Zabbix探针" width="120">
                                            <template slot-scope="scope" v-if="scope.row.iszabbix == 1">
                                                <el-tooltip content="启动中，点击停止" open-delay="500" v-if="scope.row.agentstatus.zabbix == '1'">
                                                    <el-button type="success" @click="onStop(scope.row,scope.$index)">
                                                        <i class="el-icon-video-pause"></i> 启动中
                                                    </el-button>
                                                </el-tooltip>
                                                <el-tooltip content="停止中，点击启动" open-delay="500" v-else>
                                                    <el-button type="danger" @click="onStart(scope.row,scope.$index)">
                                                        <i class="el-icon-video-play"></i> 停止中
                                                    </el-button>
                                                </el-tooltip>
                                                <!--el-tooltip content="重启" open-delay="500">
                                                    <el-button type="text" icon="el-icon-refresh" @click="onRestart(scope.row,scope.$index)"></el-button>
                                                </el-tooltip-->
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
                                    this.$refs.table.setCurrentRow(this.dt.rows[0]);
                                    //this.$refs.table.doLayout();
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
                    onTagChange(val,row){
                        let input = {action: "+", tags: val, ids: [row.id]};
                        let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
                    },
                    onTagRemove(val,row){
                        let input = {action: "-", tags: [val], ids: [row.id]};
                        let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
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
                    },
                    onStart(row,index){
                        
                        this.$confirm(`确认要启动：${row.host} 上的Zabbix Agent？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                        }).then(() => {
                            
                            try{

                                let params = {action: 'start', hosts: [row.host]};
                                let rtn = scriptHandler.zabbixAgentAction(params);
                                
                                this.$message({
                                    type: "info",
                                    message: "启动中，请稍候。。。"
                                });
                                
                                _.delay(()=>{
                                    this.$root.getProbeList();
                                },6000)

                            } catch(err){
                                this.$message({
                                    type: "error",
                                    duration: 6000,
                                    message: "启动失败 " + err
                                })
                            }
                             
                        }).catch(() => {
                            
                        }); 
                    },
                    onStop(row,index){
                        this.$confirm(`确认要停止：${row.host} 上的Zabbix Agent？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                        }).then(() => {
                            
                            try{
                                let params = {action: 'stop', hosts: [row.host]};
                                let rtn = scriptHandler.zabbixAgentAction(params);

                                this.$message({
                                    type: "info",
                                    message: "停止中，请稍候。。。"
                                });

                                _.delay(()=>{
                                    this.$root.getProbeList();
                                },6000)
                            } catch(err){

                            }

                        }).catch(() => {
                            
                        }); 
                    },
                    onRestart(row,index){
                        this.$confirm(`确认要重启：${row.host} 上的Zabbix Agent？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                        }).then(() => {
                            
                            try{
                                let params = {action: 'restart', hosts: [row.host]};
                                let rtn = scriptHandler.zabbixAgentAction(params);

                                this.$message({
                                    type: "info",
                                    message: "重启中，请稍候。。。"
                                });

                                _.delay(()=>{
                                    this.$root.getProbeList();
                                },6000)
                            } catch(err){

                            }

                        }).catch(() => {
                            
                        }); 
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
                                <el-header style="height:35px;line-height:35px;">
                                    <el-tooltip content="切换视图" open-delay="500" placement="top">
                                        <el-button type="text" icon="el-icon-s-fold" @click="onToggle"></el-button>
                                    </el-tooltip>
                                    <el-tooltip content="刷新" delay-time="500" placement="top">
                                        <el-button type="text" icon="el-icon-refresh" @click="onScriptRefresh"></el-button>
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
                                        <el-button type="default" @click.native="onScriptUpload">
                                            <i class="el-icon-plus"></i> 脚本上传
                                        </el-button>
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
                                        @expand-change="onExpandChange"
                                        ref="table"
                                        v-if="!_.isEmpty(dt.rows)">
                                        <!--el-table-column type="selection" align="center"></el-table-column--> 
                                        <el-table-column label="下发状态" width="120" prop="status">
                                            <template slot-scope="scope">
                                                <el-button type="success" @click="onToogleExpand(scope.row)" v-if="scope.row.status == 1">已下发 ></el-button>
                                                <el-button type="warning" @click="onToogleExpand(scope.row)" v-else>未下发</el-button>
                                            </template>
                                        </el-table-column>
                                        <el-table-column type="expand" width="0">
                                            <template slot-scope="props">
                                                <el-container style="width:90%;height:100%;background: #f2f3f5;">
                                                    <el-main style="height:100%;padding:0px;">
                                                        <el-tabs v-model="props.row.activeTab" tab-position="left" @tab-click="((tab,event)=>{ onTabClick(tab,event,props.row)})">
                                                            <el-tab-pane name="script">
                                                                <span slot="label"><i class="el-icon-tickets"></i> 脚本信息</span>
                                                                <el-form label-position="left" label-width="120px" style="background: #ffffff;padding: 10px 20px;">
                                                                    <el-form-item style="text-align:right;" v-if="props.row.status==0">
                                                                        <el-button icon="el-icon-position" type="success" @click="onScriptUpdate(props.row)">更新脚本</el-button>    
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本文件" v-if="props.row.status==0">
                                                                        <el-upload
                                                                            :on-change="((file, fileList)=>{ onFileChange(file, fileList, props.row)})"
                                                                            :file-list="props.row.fileList"
                                                                            :limit="1"
                                                                            multiple="false"
                                                                            :auto-upload="false"
                                                                            style="padding:10px;background:#f2f3f5;border:1px dashed #ddd;">
                                                                            <div slot="tip" class="el-upload__tip">只能上传脚本文件</div>
                                                                            <el-button icon="el-icon-upload2" type="default">点击上传脚本</el-button>
                                                                        </el-upload>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本文件" v-else>
                                                                        <el-button type="default" style="padding:10px;" v-for="item in props.row.fileList" style="box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);">
                                                                            <i class="el-icon-document" style="font-size:48px;"></i>
                                                                            <span style="text-align:left;">
                                                                                <p>文件名称：#{item.files[0].name}#</p>
                                                                                <p>上传时间：#{item.files[0].modtime}#</p>
                                                                                <p>文件大小：#{item.files[0].size | pickSize}#</p>
                                                                            </span>
                                                                        </el-button>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本库名称">
                                                                        <el-input v-model="props.row.name" required="required" disabled></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本版本">
                                                                        <el-input-number v-model="props.row.version" required="required" :precision="1" :step="0.1"></el-input-number>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本说明">
                                                                        <el-input type="textarea" :row="6" v-model="props.row.remark"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="添加标签">
                                                                        <el-select
                                                                            v-model="props.row.tags"
                                                                            multiple
                                                                            filterable
                                                                            allow-create
                                                                            default-first-option
                                                                            class="el-select-tags"
                                                                            placeholder="标签"
                                                                            @change="onTagChange($event,props.row)"
                                                                            @remove-tag="onTagRemove($event,props.row)">
                                                                            <el-option
                                                                                v-for="tag in props.row.tags"
                                                                                :key="tag"
                                                                                :label="tag"
                                                                                :value="tag">
                                                                            </el-option>
                                                                        </el-select>
                                                                    </el-form-item>
                                                                <el-form>
                                                            </el-tab-pane>
                                                            
                                                            <el-tab-pane name="setup">
                                                                <span slot="label"><i class="el-icon-setting"></i> 下发设置</span>
                                                                <el-form label-position="left" label-width="120px" style="background: #ffffff;padding: 10px 20px;min-height:200px;">
                                                                    <el-form-item label="执行命令">
                                                                        <pre :ref="'commandRef'+props.row.id" style="width:100%;height:200px;border:1px solid #dddddd;"></pre>
                                                                        <!--el-input
                                                                            placeholder="command"
                                                                            v-model="props.row.command">
                                                                        </el-input-->                                                  
                                                                    </el-form-item>
                                                                    <el-form-item label="Key">
                                                                        <el-input
                                                                            placeholder="key"
                                                                            v-model="props.row.zabbixKey">
                                                                        </el-input>                                                  
                                                                    </el-form-item>
                                                                    <!--el-form-item label="Config">
                                                                        <el-input type="textarea" rows="6"
                                                                            placeholder="Config"
                                                                            :value="props.row.zabbix | pickZabbixConfig">
                                                                        </el-input>                                                  
                                                                    </el-form-item-->
                                                                <el-form>
                                                            </el-tab-pane>

                                                            <el-tab-pane name="servers">
                                                                <span slot="label"><i class="el-icon-monitor"></i> 下发对象</span>
                                                                <el-form label-position="left" label-width="120px" style="background: #ffffff;padding: 10px 20px;">
                                                                    <el-form-item label="选择服务器">
                                                                        <el-transfer
                                                                            :titles="['服务器列表', '已下发服务器']"
                                                                            :button-texts="['取消下发', '下发']"
                                                                            :data="servers.list"
                                                                            v-model="props.row.selected"
                                                                            :props="{
                                                                                key: 'host',
                                                                                label: 'host'
                                                                            }"
                                                                            @change="((value, direction, movedKeys)=>{ onScriptDeployOrUndeploy(value, direction, movedKeys, props.row) })">
                                                                            <span slot-scope="{ option }">#{ option.host }# - #{ option.iszabbix | pickZabbix }#</span>
                                                                        </el-transfer>
                                                                    </el-form-item>
                                                                <el-form>
                                                            </el-tab-pane>
                                                        </el-tabs>
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
                                        <el-table-column label="标签" prop="tags" width="200">
                                            <template slot-scope="scope">
                                                <el-select
                                                    v-model="scope.row.tags"
                                                    multiple
                                                    filterable
                                                    allow-create
                                                    default-first-option
                                                    class="el-select-tags"
                                                    placeholder="标签"
                                                    @change="onTagChange($event,scope.row)"
                                                    @remove-tag="onTagRemove($event,scope.row)">
                                                    <el-option
                                                        v-for="tag in scope.row.tags"
                                                        :key="tag"
                                                        :label="tag"
                                                        :value="tag">
                                                    </el-option>
                                                </el-select>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" width="130">
                                            <template slot-scope="scope">
                                                <el-tooltip content="编辑脚本、下发脚本" open-delay="500" placement="top">
                                                    <el-button type="text" icon="el-icon-download" @click="onToogleExpand(scope.row)"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="删除脚本" open-delay="500" placement="top">
                                                    <el-button type="text" icon="el-icon-delete" @click="onScriptDelete(scope.row,scope.$index)"></el-button>
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
                    pickZabbix(val){
                        return val == 1 ? 'Zabbix' : '';
                    },
                    pickSize(val){
                        return mx.bytesToSize(val);
                    },
                    pickZabbixConfig(val){
                        try{
                            return JSON.stringify(val,null,2);
                        } catch(err){
                            return val;
                        }
                    }
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
                    // 获取脚本详细信息
                    onExpandChange(row,expandedRows){
                        try{

                            // 获取脚本文件信息
                            let rtn = scriptHandler.depotGet(row);
                            _.extend(row, { activeTab: 'script', fileList: rtn.files } );

                            // 初始化命令编辑器
                            _.delay(()=>{
                                let editor = ace.edit(this.$refs['commandRef'+row.id]);
                                editor.setOptions({
                                    // maxLines: 1000,
                                    minLines: 20,
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
                                editor.setValue(row.command);
                            },1000)

                        } catch(err){
                            _.extend(row, { activeTab: 'script', fileList: [] } );
                        } 
                    },
                    onTagChange(val,row){
                        let input = {action: "+", tags: val, ids: [row.id]};
                        let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
                    },
                    onTagRemove(val,row){
                        let input = {action: "-", tags: [val], ids: [row.id]};
                        let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
                    },
                    // 上传文件
                    onFileChange(file, fileList,row) {
                                    
                        this.$set(row, 'uploadfile', file.raw);

                    },
                    onTabClick(tab, event, row){
                        this.$set(row,'activeTab', tab.name);
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
                    // 脚本删除
                    onScriptDelete(row,index){
                        
                        if(row.status == 1){
                            
                            this.$message({
                                type: "warning",
                                message: "脚本已下发，不能删除！如要删除，请先在【下发对象】中取消下发。"
                            })

                            return false;
                        }

                        this.$confirm('确定删除选定的脚本?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                            }).then(() => {

                                let rtn = scriptHandler.depotDelete(row.name); 

                                if(rtn == 1) {
                                    this.$message({
                                        type: "success",
                                        message: "删除成功！"
                                    })
                                    this.onScriptRefresh();
                                } else {
                                    this.$message({
                                        type: "error",
                                        duration: 6000,
                                        message: "删除失败：" + rtn
                                    })
                                }
                                
                            }).catch(() => {
                                wnd.close();
                            })      

                    },
                    // 脚本下发、取消下发
                    onScriptDeployOrUndeploy(value, direction, movedKeys, row){
                        
                        let rtn = null;

                        // 取消下发
                        if(direction == 'left'){
                            let params = {
                                hosts: movedKeys,
                                name: row.name,
                                version: row.version,
                            }

                            if( _.indexOf(row.tags,'zabbix') != -1 || _.indexOf(row.tags,'ZABBIX') != -1 ){
                                scriptHandler.unDeployToZabbixAgent(params);
                            }

                            this.$message({
                                type: "info",
                                message: "取消下发执行中，请稍候。。。"
                            })

                            _.delay(()=>{
                                
                                rtn = scriptHandler.depotUnDeploy(params);

                                if(rtn == 1){    
                                    
                                    this.$message({
                                        type: "success",
                                        message: "取消下发成功！"
                                    })

                                    this.onTagChange(['未下发'],row);
                                    this.onTagRemove('已下发',row);
                                    this.onScriptRefresh();

                                } else {
                                    this.$message({
                                        type: "error",
                                        duration: 6000,
                                        message: "取消下发失败 " + rtn
                                    })

                                }
                            },2000)
                            
                        } 
                        // 下发
                        else {

                            
                            let editor = ace.edit(this.$refs['commandRef'+row.id]);
                            this.$set(row,'command', _.trim(editor.getValue()));

                            if(_.isEmpty(row.command)){
                            
                                this.$message({
                                    type: "warning",
                                    message: "脚本执行命令不能为空！"
                                })
                                this.$set(row,'selected',[]);
                                return false;
                            }

                            if(_.isEmpty(row.zabbixKey)){
                                this.$message({
                                    type: "warning",
                                    message: "请输入zabbix key！"
                                })
                                this.$set(row,'selected',[]);
                                return false;
                            }

                            let params = {
                                hosts: movedKeys,
                                name: row.name,
                                version: row.version,
                                key: row.zabbixKey,
                                command: row.command
                            }

                            rtn = scriptHandler.depotDeploy(params);

                            this.$message({
                                type: "info",
                                message: "下发执行中，请稍候。。。"
                            })

                            _.delay(()=>{
                                if(rtn == 1){
                                
                                    this.$message({
                                        type: "success",
                                        message: "下发成功！"
                                    })
                                    
                                    if( _.indexOf(row.tags,'zabbix') != -1 || _.indexOf(row.tags,'ZABBIX') != -1 ){
                                        scriptHandler.deployToZabbixAgent(params);
                                    }
    
                                    this.onTagChange(['已下发'],row);
                                    this.onTagRemove('未下发',row);
                                    this.onScriptRefresh();
    
                                } else {
                                    this.$message({
                                        type: "error",
                                        duration: 6000,
                                        message: "下发失败 " + rtn
                                    })
                                    this.$set(row,'selected',[]);
                                }
                            },3000)
                            
                        }
                    },
                    // 脚本上传
                    onScriptUpload(){
                        const self = this;

                        let wnd = maxWindow.winProbe( `<i class="el-icon-document-add"></i> 脚本上传`, `<div id="script-upload-container"></div>`, null, 'body');

                        new Vue({
                            delimiters: ['#{', '}#'],
                            data: {
                                model: {
                                    item: {
                                        name: "",
                                        version: 1,
                                        remark: "",
                                        uploadfile: null,
                                        tags: ['script','zabbix'],
                                        command: "",
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
                                                                <el-button type="success" icon="el-icon-upload2" @click="onSave">上传到脚本库</el-button>    
                                                            </el-header>
                                                            <el-main style="height:100%;">
                                                                <el-form label-position="left" label-width="120px">
                                                                    <el-form-item label-width="0px" style="border:1px dashed #dddddd;padding:10px;">
                                                                        <el-upload
                                                                            :on-change="onFileChange"
                                                                            :before-remove="beforeRemove"
                                                                            :file-list="fileList"
                                                                            :limit="1"
                                                                            multiple="false"
                                                                            :auto-upload="false">
                                                                            <el-button icon="el-icon-plus" type="default">选择脚本</el-button>
                                                                            <div slot="tip" class="el-upload__tip">支持上传单个脚本文件、支持zip格式脚本压缩包</div>
                                                                            </el-upload>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本库名称">
                                                                        <el-input v-model="model.item.name" required="required" ></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="脚本版本">
                                                                        <el-input-number v-model="model.item.version" required="required" :precision="1" :step="0.1"></el-input-number>
                                                                    </el-form-item>
                                                                    <!--el-form-item label="执行命令">
                                                                        <el-input v-model="model.item.command"></el-input>
                                                                    </el-form-item-->
                                                                    <el-form-item label="脚本说明">
                                                                        <el-input type="textarea" :row="6" v-model="model.item.remark"></el-input>
                                                                    </el-form-item>
                                                                    <el-form-item label="添加标签">
                                                                        <el-select
                                                                            v-model="model.item.tags"
                                                                            multiple
                                                                            filterable
                                                                            allow-create
                                                                            default-first-option
                                                                            class="el-select-tags"
                                                                            placeholder="标签"
                                                                            @change="onTagChange($event,scope.row)"
                                                                            @remove-tag="onTagRemove($event,scope.row)">
                                                                            <el-option
                                                                                v-for="tag in model.item.tags"
                                                                                :key="tag"
                                                                                :label="tag"
                                                                                :value="tag">
                                                                            </el-option>
                                                                        </el-select>
                                                                    </el-form-item>
                                                                </el-form>
                                                            </el-main>
                                                        </el-container>
                                                    </el-tab-pane>
                                                </el-tabs>
                                            </el-main>
                                        </el-container>`,
                            mounted(){
                                this.$nextTick(()=> {
                                    
                                })
                            },
                            methods: {
                                onTagChange(val,row){
                                    let input = {action: "+", tags: val, ids: [row.id]};
                                    let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
                                },
                                onTagRemove(val,row){
                                    let input = {action: "-", tags: [val], ids: [row.id]};
                                    let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
                                },
                                onSave(){
                                    
                                    if(_.isEmpty(this.model.item.uploadfile)){
                            
                                        this.$message({
                                            type: "warning",
                                            message: "请选择上传脚本文件！"
                                        })
            
                                        return false;
                                    }

                                    if(_.isEmpty(this.model.item.name)){
                            
                                        this.$message({
                                            type: "warning",
                                            message: "脚本库名称不能为空！"
                                        })
            
                                        return false;
                                    }

                                    let rtn = scriptHandler.depotAdd(this.model.item);

                                    if(rtn == 1){
                                        
                                        this.$message({
                                            type: "success",
                                            message: "上传成功！"
                                        })

                                        self.onScriptRefresh();

                                        wnd.close();

                                    } else{
                                        this.$message({
                                            type: "error",
                                            duration: 6000,
                                            message: "上传失败：" + rtn
                                        })
                                    }
                                    
                                },
                                onFileChange(file, fileList) {
                                    
                                    this.model.item.name = _.head(file.raw.name.split("."));
                                    
                                    this.model.item.uploadfile = file.raw;

                                },
                                beforeRemove(file, fileList) {
                                    return this.$confirm(`确定移除 ${ file.name }？`);
                                }
                            }
                        }).$mount("#script-upload-container");
                    },
                    // 脚本刷新
                    onScriptRefresh(){
                        this.$root.$refs.scriptView.getScriptList();
                    },
                    // 脚本更新
                    onScriptUpdate(row){

                        console.log(11,row)
                        if(_.isEmpty(row.uploadfile)){
                            
                            this.$message({
                                type: "warning",
                                message: "请选择上传脚本文件！"
                            })

                            return false;
                        }

                        let rtn = scriptHandler.depotUpdate(row);

                        if(rtn == 1){
                            
                            this.$message({
                                type: "success",
                                message: "更新成功！"
                            })

                            this.onScriptRefresh();
                            
                        } else{
                            this.$message({
                                type: "error",
                                duration: 6000,
                                message: "更新失败：" + rtn
                            })
                        }
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
                                            <script-manage :model="model.list" ref="scriptManageRef"></script-manage>
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
                                            <el-tab-pane label="脚本管理" name="script" lazy>
                                                <script-view ref="scriptView"></script-view>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    data: {
                        probe: {},
                        tabs:{
                            activeName: 'probe',
                        }
                    },
                    created(){
                        
                    },
                    mounted() {
                        this.$nextTick(()=> {
                            this.getProbeList();
                        })
                    },
                    methods: {
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