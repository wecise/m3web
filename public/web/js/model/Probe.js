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
                            "mx-tag",
                            "mx-tag-tree"], function () {
            
            
            // 传输组件
            Vue.component("mx-transfer",{
                delimiters: ['#{', '}#'],
                props: {
                    template: Object,
                    row: Object,
                    list: Array,
                    model: Array,
                    prop: {
                        key: String,
                        label: Array,
                        title: Array,
                    },
                    titles: Array,
                    buttonTexts: Array
                },
                data(){
                    return {
                        all: {
                            list: [],
                            term: ""
                        },
                        source: {
                            rows:[],
                            selected: []
                        },
                        target:{
                            rows: [],
                            selected: [],
                            term: ""
                        }
                    }
                },
                template:   `<el-row>
                                <el-col :span="10">
                                    <el-container style="border:1px solid #dddddd;height:45vh;">
                                        <el-header style="height: 40px;line-height: 40px;background: #f2f2f2;">#{titles[0]}# #{source.selected.length}#/#{source.rows.length}#</el-header>
                                        <el-main style="overflow:hidden;">
                                            <el-input v-model="all.term" 
                                                @input="onSearchAllList" 
                                                @clear="onSearchAllList" 
                                                placeholder="关键字" 
                                                clearable suffix-icon="el-icon-search"
                                                class="mx-transfer-search">
                                            </el-input>
                                            <el-table ref="source"
                                                :data="source.rows"
                                                style="width: 100%"
                                                @selection-change="onSourceSelectionChange">
                                                <el-table-column type="selection" width="55"></el-table-column>
                                                <el-table-column :label="prop.title[0]">
                                                    <template slot-scope="scope">
                                                        #{scope.row[prop.label[0]]}#
                                                        <span v-if="scope.row.iszabbix == 1"> - #{ scope.row.iszabbix | pickZabbix }# </span>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column :label="prop.title[1]" width="120">
                                                    <template slot-scope="scope">
                                                        #{scope.row[prop.label[1]].join(", ")}#
                                                    </template>
                                                </el-table-column>
                                                <el-table-column width="80">
                                                    <template slot-scope="scope">
                                                        <el-popover
                                                            placement="right-start"
                                                            :title="scope.row.host"
                                                            width="350px"
                                                            trigger="click"
                                                            popper-class="dataTablePopper"
                                                            :popper-options="{ boundariesElement: 'body' }">
                                                            <el-container>
                                                                <el-main>
                                                                    <el-row>
                                                                        <el-col :span="8">
                                                                            <p v-for="v,k in scope.row.config" v-if="!_.includes(k,'usedpercent')">
                                                                                <span v-if="template[k].unit=='number'">#{template[k].title}#: #{mx.bytesToSize(v)}#</span>
                                                                                <span v-else>#{template[k].title}#: #{v}#</span>
                                                                            </p>
                                                                        </el-col>
                                                                        <el-col :span="16" style="display:flex;border-left:1px solid #dddddd;padding:0px 20px;">
                                                                            <div v-for="v,k in scope.row.config" v-if="_.includes(k,'usedpercent')" style="margin:5px;text-align: center;">
                                                                                <el-progress type="circle" :percentage="v"></el-progress>
                                                                                <p>#{template[k].title}#</p>
                                                                            </div>
                                                                        </el-col>
                                                                    </el-row>
                                                                </el-main>
                                                            </el-container>
                                                            <el-button slot="reference" type="text" icon="el-icon-postcard"></el-button>
                                                        </el-popover>
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </el-main>
                                    </el-container>
                                </el-col>
                                <el-col :span="4" style="text-align: center;padding-top: 5em;">
                                    <p><el-button type="primary" ref="toRightButton" :disabled="_.isEmpty(source.selected)" @click="onToRight">#{buttonTexts[0]}#</el-button></p>
                                    <p><el-button type="primary" ref="toLeftButton" :disabled="_.isEmpty(target.selected)" @click="onToLeft">#{buttonTexts[1]}#</el-button></p>
                                    <p><el-button type="default" ref="toLeftButton" :disabled="_.isEmpty(source.selected) && _.isEmpty(target.selected)" @click="onReset">#{buttonTexts[2]}#</el-button></p>
                                </el-col>
                                <el-col :span="10">
                                    <el-container style="border:1px solid #dddddd;height:45vh;">
                                        <el-header style="height: 40px;line-height: 40px;background: #f2f2f2;">#{titles[1]}# #{target.selected.length}#/#{target.rows.length}#</el-header>
                                        <el-main style="overflow:hidden;">
                                            <el-input v-model="target.term" 
                                                @input="onSearchAllList" 
                                                @clear="onSearchAllList" 
                                                placeholder="关键字" 
                                                clearable suffix-icon="el-icon-search"
                                                class="mx-transfer-search">
                                            </el-input>
                                            <el-table ref="target"
                                                :data="target.rows"
                                                style="width: 100%"
                                                @selection-change="onTargetSelectionChange">
                                                <el-table-column type="selection" width="55"></el-table-column>
                                                <el-table-column :label="prop.title[0]">
                                                    <template slot-scope="scope">
                                                        #{scope.row[prop.label[0]]}#
                                                        <span v-if="scope.row.iszabbix == 1"> - #{ scope.row.iszabbix | pickZabbix }# </span>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column :label="prop.title[1]" width="120">
                                                    <template slot-scope="scope">
                                                        #{scope.row[prop.label[1]].join(", ")}#
                                                    </template>
                                                </el-table-column>
                                                <el-table-column width="80">
                                                    <template slot-scope="scope">
                                                        <el-popover
                                                            placement="left-start"
                                                            :title="scope.row.host"
                                                            width="350px"
                                                            trigger="click"
                                                            popper-class="dataTablePopper"
                                                            :popper-options="{ boundariesElement: 'body' }">
                                                            <el-container>
                                                                <el-main>
                                                                    <el-row>
                                                                        <el-col :span="8">
                                                                            <p v-for="v,k in scope.row.config" v-if="!_.includes(k,'usedpercent')">
                                                                                <span v-if="template[k].unit=='number'">#{template[k].title}#: #{mx.bytesToSize(v)}#</span>
                                                                                <span v-else>#{template[k].title}#: #{v}#</span>
                                                                            </p>
                                                                        </el-col>
                                                                        <el-col :span="16" style="display:flex;border-left:1px solid #dddddd;padding:0px 20px;">
                                                                            <div v-for="v,k in scope.row.config" v-if="_.includes(k,'usedpercent')" style="margin:5px;text-align: center;">
                                                                                <el-progress type="circle" :percentage="v"></el-progress>
                                                                                <p>#{template[k].title}#</p>
                                                                            </div>
                                                                        </el-col>
                                                                    </el-row>
                                                                </el-main>
                                                            </el-container>
                                                            <el-button slot="reference" type="text" icon="el-icon-postcard"></el-button>
                                                        </el-popover>
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </el-main>
                                    </el-container>
                                </el-col>
                            </el-row>`,
                filters: {
                    pickZabbix(val){
                        return val == 1 ? 'Zabbix' : '';
                    }
                },
                watch: {
                    model(val,oldVal){
                        // target
                        this.setTargetData();
                        // source
                        this.setSourceData();
                    }
                },
                mounted(){
                    this.setAllList();
                },
                methods: {
                    setAllList(){
                        if(!_.isEmpty(this.list)){
                            // all
                            this.all.list = this.list;
                            // target
                            this.setTargetData();
                            // source
                            this.setSourceData();
                        }
                    },
                    setTargetData(){
                        // target
                        if(!_.isEmpty(this.model)){
                            this.target.rows = _.filter(this.list, (v)=>{
                                if(_.includes(this.model, v.host)){
                                    return v;
                                }
                            })
                        } else {
                            this.target.rows = [];
                        }
                    },
                    setSourceData(){
                        // source
                        this.source.rows = _.difference(this.all.list, this.target.rows);
                    },
                    onSearchAllList: _.debounce(function(){
                        let rtn = null;

                        if(_.isEmpty(this.all.term)){
                            this.all.list = fsHandler.callFsJScript("/matrix/depot/getServerList.js").message.rows;
                            
                        } else {
                            this.all.list = fsHandler.callFsJScript("/matrix/depot/getServerList.js", encodeURIComponent(this.all.term) ).message.rows;
                        }

                        // 赋值给source
                        this.setSourceData();
                    },500),
                    onSourceSelectionChange(val){
                        this.source.selected = val;
                    },
                    onTargetSelectionChange(val){
                        this.target.selected = val;
                    },
                    onToRight(){
                        this.$emit('update:change', { value:null, direction: 'right', movedKeys: this.source.selected } );
                    },
                    onToLeft(){
                        this.$emit('update:change', { value:null, direction: 'left', movedKeys: this.target.selected } );
                    },
                    onReset(){
                        this.$refs.source.clearSelection();
                        this.$refs.target.clearSelection();
                    }
                }
            })

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
                            selected: [],
                            pagination:{
                                pageSize: 10,
                                currentPage: 1
                            }
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
                                </el-header>   
                                <el-main style="width:100%;padding:0px;">
                                    <el-table
                                        :data="dt.rows.slice((dt.pagination.currentPage - 1) * dt.pagination.pageSize,dt.pagination.currentPage * dt.pagination.pageSize)"
                                        highlight-current-row="true"
                                        stripe
                                        style="width: 100%;"
                                        :row-class-name="rowClassName"
                                        :header-cell-style="headerRender"
                                        @row-dblclick="onRowDblclick"
                                        @row-contextmenu="onRowContextmenu"
                                        @selection-change="onSelectionChange"
                                        @current-change="onCurrentChange"
                                        v-loading="loading"
                                        ref="table"
                                        v-if="!_.isEmpty(dt.rows)">
                                        <!--el-table-column type="selection" align="center"></el-table-column--> 
                                        <el-table-column width="120">
                                            <template slot-scope="scope" v-if="!_.isEmpty(scope.row.depot)">
                                                <el-button type="success" @click="onToogleExpand(scope.row)" :loading="scope.row.loading">查看脚本
                                                    <span class="el-icon-arrow-down" v-if="scope.row.expand"></span>
                                                    <span class="el-icon-arrow-right" v-else></span>
                                                </el-button>
                                            </template>
                                        </el-table-column>
                                        <el-table-column type="expand" width="0">
                                            <template slot-scope="scope">
                                                <el-container style="width:90%;height:100%;min-height:40vh;background: #f2f2f2;">
                                                    <el-main style="height:100%;">
                                                        <el-button type="default" v-for="(item,key) in scope.row.depots" 
                                                                style="position:relative;box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);max-width: 12em;width: 12em;height:110px;margin:5px;">
                                                            <i class="el-icon-document" style="font-size:48px;color:#f8a502;"></i>
                                                            <span style="text-align:center;">
                                                                <p>#{item.name}#</p>
                                                            </span>
                                                            <el-dropdown style="position:absolute;right:5px;top:5px;">
                                                                <span class="el-dropdown-link">
                                                                    <i class="el-icon-arrow-down el-icon--right"></i>
                                                                </span>
                                                                <el-dropdown-menu slot="dropdown">
                                                                    <el-dropdown-item>
                                                                        <span style="text-align:left;">
                                                                            <p>脚本库名称：#{item.name}#</p>
                                                                            <p>下发版本：#{item.version}#</p>
                                                                            <p>备注：#{item.remark}#</p>
                                                                        </span>
                                                                    </el-dropdown-item>
                                                                </el-dropdown-menu>
                                                            </el-dropdown>
                                                        </el-button>
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
                                                <mx-tag domain='probe' :model.sync="scope.row.tags" :id="scope.row.id" limit="1"></mx-tag>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="Toe探针" width="120">
                                            <template slot-scope="scope">
                                                <el-tooltip content="启动" open-delay="500" v-if="!_.isEmpty(scope.row.agentstatus) && scope.row.agentstatus.toe == '1'">
                                                    <el-button type="text">
                                                        启动中
                                                    </el-button>
                                                </el-tooltip>
                                                <el-tooltip content="停止" open-delay="500" v-else>
                                                    <el-button type="text">
                                                        停止中
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
                                    <!--#{ info.join(' &nbsp; | &nbsp;') }#-->
                                    <el-pagination
                                        @size-change="onPageSizeChange"
                                        @current-change="onCurrentPageChange"
                                        :page-sizes="[10, 15, 20]"
                                        :page-size="dt.pagination.pageSize"
                                        :total="dt.rows.length"
                                        layout="total, sizes, prev, pager, next">
                                    </el-pagination>
                                </el-footer>
                            </el-container>`,
                filters:{
                    pickDatetime(item){
                        return moment(item).format(mx.global.register.format);      
                    }
                },
                watch: {
                    'model.rows': {
                        handler(val,oldVal){
                            if(val !== oldVal){
                                //this.dt.rows = [];
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
                            this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
                        },
                        deep:true,
                        immediate:true
                    }
                },
                mounted(){
                    
                },
                methods: {
                    onPageSizeChange(val) {
                        this.dt.pagination.pageSize = val;
                    },
                    onCurrentPageChange(val) {
                        this.dt.pagination.currentPage = val;
                    },
                    layout(){
                        let doLayout = ()=>{
                            if($(".el-table-column--selection",this.$el).is(':visible')){
                                _.delay(()=>{
                                    //this.$refs.table.setCurrentRow(this.dt.rows[0]);
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

                            _.forEach(self.dt.rows,(v)=>{
                                self.$set(v, 'expand', false);
                            })
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
                    onRefresh(){
                        this.$root.$refs.probeView.options.term = "";
                        this.$root.$refs.probeView.$refs.searchRef.search();
                    },
                    onToogleExpand(row,index){

                        if(row.expand){
                            this.$refs.table.toggleRowExpansion(row,false);
                            this.$set(row, 'expand', !row.expand);
                            return false;
                        }

                        this.$set(row,'loading',true);

                        _.forEach(this.dt.rows,(item) => {
                            if (row.id != item.id) {
                                this.$set(item, 'expand', false);
                                this.$refs.table.toggleRowExpansion(item, false);
                            }
                        })

                        const self = this;
                        var loadData = function(){
                           try{
                                // 根据depot名称列表，获取脚本信息
                                let depots = {};
                                _.forEach(row.depot,(v,k)=>{
                                    let value = JSON.parse(v);
                                    let versions = _.map(value,'version');
                                    let scriptObj = _.map(versions,(val)=>{
                                        return scriptHandler.depotGet({name:k,version:val});
                                    })
                                    _.extend(depots, {[k]:scriptObj[0]});
                                })

                                self.$set(row, 'depots', depots);
                            } catch(err){
                                console.log(err)
                            } finally {
                                _.extend(row, { activeTab: 'probe' } );
                            }
                        };

                        loadData();

                        if( !_.isUndefined(row.depots) ){
                            _.delay(()=>{
                                this.$refs.table.toggleRowExpansion(row);
                                this.$set(row,'loading',false);
                                this.$set(row, 'expand', !row.expand);
                            },500)
                        } else {
                            setTimeout( loadData, 50 );
                        }

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
                            selected: [],
                            pagination:{
                                pageSize: 10,
                                currentPage: 1
                            }
                        },
                        servers: {
                            list: [],
                            lTerm: "",
                            rTerm: "",
                        },
                        versionTree:{
                            props: {
                                label: 'version',
                                children: ''
                            },
                            compareArr:[],
                            dialog: {
                                fileUpdate: false
                            }
                        },
                        info: [],
                        dialog: {
                            scriptDeploy: {
                                show: false,
                                rows: [],
                                script: {},
                                zabbix: false
                            },
                            scriptUnDeploy: {
                                show: false,
                                rows: [],
                                script: {},
                                zabbix: false
                            }
                        }
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
                                <el-main style="width:100%;padding:0px;overflow:hidden;">
                                    <el-table
                                        :data="dt.rows.slice((dt.pagination.currentPage - 1) * dt.pagination.pageSize,dt.pagination.currentPage * dt.pagination.pageSize)"
                                        highlight-current-row="true"
                                        style="width: 100%"
                                        :row-class-name="rowClassName"
                                        :header-cell-style="headerRender"
                                        @row-click="onRowClick"
                                        @row-contextmenu="onRowContextmenu"
                                        @selection-change="onSelectionChange"
                                        @current-change="onCurrentChange"
                                        ref="table"
                                        v-if="!_.isEmpty(dt.rows)">
                                        <el-table-column type="selection" align="center"></el-table-column> 
                                        <el-table-column label="脚本库名称" prop="name" width="200" sortable></el-table-column>
                                        <el-table-column label="下发脚本版本" prop="version" width="120" sortable></el-table-column>
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
                                        <el-table-column label="下发状态" width="120" prop="status">
                                            <template slot-scope="scope">
                                                <el-button type="success" @click="onToogleExpand(scope.row,scope.$index)" :loading="scope.row.loading" v-if="scope.row.status == 1">已下发 
                                                    <span class="el-icon-arrow-down" v-if="scope.row.expand"></span>
                                                    <span class="el-icon-arrow-right" v-else></span>
                                                </el-button>
                                                <el-button type="warning" @click="onToogleExpand(scope.row,scope.$index)" :loading="scope.row.loading" v-else>未下发
                                                    <span class="el-icon-arrow-down" v-if="scope.row.expand"></span>
                                                    <span class="el-icon-arrow-right" v-else></span>
                                                </el-button>
                                            </template>
                                        </el-table-column>
                                        <el-table-column type="expand" width="0">
                                            <template slot-scope="props">
                                                <el-container style="width:90%;height:100%;min-height:40vh;background: #ffffff;">
                                                    <el-aside style="width:200px;background: #f2f2f2;">
                                                        <el-container style="height:100%;">
                                                            <el-header style="height:40px;line-height:40px;">
                                                                <h4 style="margin:0px;">版本历史</h4>
                                                            </el-header>
                                                            <el-main style="padding:0px;height:100%;overflow:hidden;">
                                                                <el-tree
                                                                    highlight-current="true"
                                                                    :data="props.row.versionObj"
                                                                    :props="versionTree.props"
                                                                    node-key="version"
                                                                    accordion
                                                                    show-checkbox
                                                                    @node-click="((node)=>{ onFileVersionClick(node,props.row)})"
                                                                    @check-change="onFileVersionCheckChange"
                                                                    style="background:transparent;height:100%;"
                                                                    ref="tree">
                                                                    <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onFileTreeMouseEnter(data)" @mouseleave="onFileTreeMouseLeave(data)">
                                                                        <span>
                                                                            <i class="el-icon-folder" style="color:#FFC107;"></i>
                                                                            <span>#{node.label}#</span>
                                                                            <span v-if="data.ifDeployed" class="el-icon-download" style="float:right;padding:10px;">已下发</span>
                                                                        </span>
                                                                    </span>  
                                                                </el-tree>
                                                            </el-main>
                                                            <el-footer style="height:40px;line-height:40px;" v-if="versionTree.compareArr.length == 2">
                                                                <el-button type="text" icon="el-icon-money" @click="onFileVersionCompare">版本比对</el-button>
                                                            </el-footer>
                                                        <el-container>
                                                    </el-aside>
                                                    <el-container style="height:100%;">
                                                        <el-main style="height:100%;padding:0px;">
                                                            <el-tabs v-model="props.row.activeTab" tab-position="top" @tab-click="((tab,event)=>{ onTabClick(tab,event,props.row)})">
                                                                <el-tab-pane name="title" disabled>
                                                                    <span slot="label" style="color:#333333;"><i class="el-icon-document"></i> 选择版本：#{ props.row.selectedVersion }#</span>
                                                                </el-tab-pane>
                                                                <el-tab-pane name="script">
                                                                    <span slot="label">
                                                                        <i class="el-icon-tickets"></i> 脚本文件
                                                                    </span>
                                                                    <el-dialog title="脚本库更新" :visible.sync="versionTree.dialog.fileUpdate">
                                                                        <el-form>
                                                                            <el-form-item label="脚本库版本">
                                                                                <el-input v-model="props.row.version" autocomplete="off"></el-input>
                                                                            </el-form-item>
                                                                            <el-form-item label="脚本库说明" prop="remark">
                                                                                <el-input type="textarea" :row="6" v-model="props.row.remark"></el-input>
                                                                            </el-form-item>
                                                                            <el-form-item label="添加标签" prop="tags">
                                                                                <mx-tag domain='script' :model.sync="props.row.tags" :id="props.row.id" limit="1"></mx-tag>
                                                                            </el-form-item>
                                                                        </el-form>
                                                                        <div slot="footer" class="dialog-footer">
                                                                            <el-button @click="versionTree.dialog.fileUpdate = false">取 消</el-button>
                                                                            <el-button type="primary" @click="onScriptUpdate(props.row)">更 新</el-button>
                                                                        </div>
                                                                    </el-dialog>
                                                                    <div style="display:flex;" v-if="props.row.status==0">
                                                                        <el-button type="default" v-for="item in props.row.fileObj[props.row.selectedVersion]['files']" style="position:relative;box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);max-width: 12em;width: 12em;height:110px;margin:5px;">
                                                                            <i class="el-icon-document" style="font-size:48px;color:#f8a502;"></i>
                                                                            <span style="text-align:center;">
                                                                                <p>#{item.name}#</p>
                                                                            </span>
                                                                            <el-dropdown style="position:absolute;right:5px;top:5px;">
                                                                                <span class="el-dropdown-link">
                                                                                    <i class="el-icon-arrow-down el-icon--right"></i>
                                                                                </span>
                                                                                <el-dropdown-menu slot="dropdown">
                                                                                    <el-dropdown-item @click.native="onFileEditor(item, props.row)">编辑</el-dropdown-item>
                                                                                    <!--el-dropdown-item @click.native.stop="onFileDelete(item, props.row)" divided>删除</el-dropdown-item-->
                                                                                    <el-dropdown-item divided>
                                                                                        <span style="text-align:left;">
                                                                                            <p>文件名称：#{item.name}#</p>
                                                                                            <p>上传时间：#{item.modtime}#</p>
                                                                                            <p>文件大小：#{item.size | pickSize}#</p>
                                                                                        </span>
                                                                                    </el-dropdown-item>
                                                                                </el-dropdown-menu>
                                                                            </el-dropdown>
                                                                        </el-button>
                                                                        <el-upload
                                                                            :on-change="((file, fileList)=>{ onFileChange(file, fileList, props.row)})"
                                                                            :limit="1"
                                                                            multiple="false"
                                                                            :auto-upload="false"
                                                                            style="position: relative;border:1px solid #dddddd;background:rgba(255,255,255,.3);max-width: 12em;width: 12em;height:110px;margin:5px;padding:10px;">
                                                                            <div slot="tip" class="el-upload__tip">限定脚本、ZIP文件</div>
                                                                            <el-button type="text">
                                                                                <i class="el-icon-plus" style="font-size:48px;color:rgba(0,0,0,.2);"></i>
                                                                            </el-button>
                                                                        </el-upload>
                                                                    </div>
                                                                    <div v-else>
                                                                        <el-button type="default" v-for="item in props.row.fileObj[props.row.selectedVersion]['files']" style="position:relative;box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);max-width: 12em;width: 12em;height:110px;margin:5px;"
                                                                            @dblclick.native="onFileEditor(item,props.row)">
                                                                            <i class="el-icon-document" style="font-size:48px;color:#f8a502;"></i>
                                                                            <span style="text-align:center;">
                                                                                <p>#{item.name}#</p>
                                                                            </span>
                                                                            <el-dropdown style="position:absolute;right:5px;top:5px;">
                                                                                <span class="el-dropdown-link">
                                                                                    <i class="el-icon-arrow-down el-icon--right"></i>
                                                                                </span>
                                                                                <el-dropdown-menu slot="dropdown">
                                                                                    <el-dropdown-item @click.native="onFileEditor(item,props.row)">编辑</el-dropdown-item>
                                                                                    <el-dropdown-item divided>
                                                                                        <span style="text-align:left;">
                                                                                            <p>文件名称：#{item.name}#</p>
                                                                                            <p>上传时间：#{item.modtime}#</p>
                                                                                            <p>文件大小：#{item.size | pickSize}#</p>
                                                                                        </span>
                                                                                    </el-dropdown-item>
                                                                                </el-dropdown-menu>
                                                                            </el-dropdown>
                                                                        </el-button>
                                                                    </div>
                                                                </el-tab-pane>
                                                                
                                                                <el-tab-pane name="setup">
                                                                    <span slot="label"><i class="el-icon-setting"></i> 下发设置</span>
                                                                    <el-form label-position="top" label-width="120px" style="background: #ffffff;padding: 10px 20px;min-height:200px;">
                                                                        <el-form-item label="执行命令">
                                                                            <el-tooltip content="更新命令" open-delay="500">
                                                                                <el-button type="primary" @click="onScriptCommandUpdate(props.row)" icon="el-icon-refresh" style="float:right;"></el-button>
                                                                            </el-tooltip>
                                                                            <pre :ref="'commandRef'+props.row.id" style="width:100%;height:200px;border:1px solid #dddddd;"></pre>
                                                                        </el-form-item>
                                                                        <el-form-item label="Key">
                                                                            <el-input
                                                                                placeholder="key"
                                                                                v-model="props.row.zabbixKey">
                                                                            </el-input>                                                  
                                                                        </el-form-item>
                                                                    <el-form>
                                                                </el-tab-pane>

                                                                <el-tab-pane name="servers">
                                                                    <span slot="label"><i class="el-icon-monitor"></i> 下发对象</span>
                                                                    <el-form label-position="top" label-width="120px" style="background: #ffffff;padding: 10px 20px;">
                                                                        <el-form-item label="选择服务器">
                                                                            <mx-transfer 
                                                                                :list="servers.list.rows"
                                                                                :template="servers.list.template"
                                                                                :model="props.row.fileObj[props.row.selectedVersion]['deployedServers']"
                                                                                :titles="['服务器列表', '已下发服务器']"
                                                                                :buttonTexts="['开始下发', '取消下发','取消选择']"
                                                                                :prop="{
                                                                                    key: 'host',
                                                                                    label: ['host','iplist'],
                                                                                    title: ['服务器','IP']
                                                                                }"
                                                                                @update:change="((data)=>{ onScriptDeployOrUndeploy(data.value, data.direction, data.movedKeys, props.row) })"
                                                                                :ref="'mxTransfer'+props.row.id">
                                                                            </mx-transfer>
                                                                        </el-form-item>
                                                                    <el-form>
                                                                    <el-dialog :title="'下发脚本: ' + dialog.scriptDeploy.script.name + '-' + dialog.scriptDeploy.script.selectedVersion" 
                                                                        :visible.sync="dialog.scriptDeploy.show"
                                                                        :close-on-press-escape="false"
                                                                        :close-on-click-modal="false">
                                                                        <el-container>
                                                                            <el-main style="padding:0px;">
                                                                                <el-table
                                                                                    :data="dialog.scriptDeploy.rows"
                                                                                    style="width: 100%"
                                                                                    max-height="350">
                                                                                    <el-table-column type="index"></el-table-column>
                                                                                    <el-table-column prop="host"
                                                                                        label="服务器"
                                                                                        width="180">
                                                                                    </el-table-column>
                                                                                    <el-table-column
                                                                                        label="下发状态">
                                                                                        <template slot-scope="scope">
                                                                                            <el-button type="primary" :loading="scope.row.loading" v-if="scope.row.status == 0">准备</el-button>
                                                                                            <el-button type="warning" :loading="scope.row.loading" v-else-if="scope.row.status == 1">正在下发</el-button>
                                                                                            <el-button type="success" :loading="scope.row.loading" v-else-if="scope.row.status == 2">下发成功</el-button>
                                                                                            <el-button type="danger" :loading="scope.row.loading" v-else-if="scope.row.status == 3">下发失败</el-button>
                                                                                        </template>
                                                                                    </el-table-column>
                                                                                    <el-table-column
                                                                                        prop="msg"
                                                                                        label="消息">
                                                                                    </el-table-column>
                                                                                    <el-table-column fixed="right" label="操作" width="80">
                                                                                        <template slot-scope="scope">
                                                                                            <el-button @click.native.prevent="dialog.scriptDeploy.rows.splice(scope.$index, 1);" type="text" icon="el-icon-delete"></el-button>
                                                                                        </template>
                                                                                    </el-table-column>
                                                                                </el-table>
                                                                            </el-main>
                                                                            <el-footer style="line-height:60px;">
                                                                                <el-checkbox v-model="dialog.scriptDeploy.zabbix" border>Zabbix探针</el-checkbox>
                                                                            </el-footer>
                                                                        </el-container>
                                                                        <div slot="footer" class="dialog-footer">
                                                                            <el-button @click="dialog.scriptDeploy.show = false">取 消</el-button>
                                                                            <el-button type="primary" @click="onScriptDeployHandler(dialog.scriptDeploy)">下 发</el-button>
                                                                        </div>
                                                                    </el-dialog>
                                                                    <el-dialog :title="'取消下发脚本: ' + dialog.scriptUnDeploy.script.name + '-' + dialog.scriptUnDeploy.script.selectedVersion" 
                                                                        :visible.sync="dialog.scriptUnDeploy.show"
                                                                        :close-on-press-escape="false"
                                                                        :close-on-click-modal="false">
                                                                        <el-container>
                                                                            <el-main style="padding:0px;">
                                                                                <el-table
                                                                                    :data="dialog.scriptUnDeploy.rows"
                                                                                    style="width: 100%"
                                                                                    max-height="350">
                                                                                    <el-table-column type="index"></el-table-column>
                                                                                    <el-table-column prop="host"
                                                                                        label="服务器"
                                                                                        width="180">
                                                                                    </el-table-column>
                                                                                    <el-table-column
                                                                                        label="取消下发状态">
                                                                                        <template slot-scope="scope">
                                                                                            <el-button type="primary" :loading="scope.row.loading" v-if="scope.row.status == 0">准备</el-button>
                                                                                            <el-button type="warning" :loading="scope.row.loading" v-else-if="scope.row.status == 1">正在取消下发</el-button>
                                                                                            <el-button type="success" :loading="scope.row.loading" v-else-if="scope.row.status == 2">取消下发成功</el-button>
                                                                                            <el-button type="danger" :loading="scope.row.loading" v-else-if="scope.row.status == 3">取消下发失败</el-button>
                                                                                        </template>
                                                                                    </el-table-column>
                                                                                    <el-table-column
                                                                                        prop="msg"
                                                                                        label="消息">
                                                                                    </el-table-column>
                                                                                    <el-table-column fixed="right" label="操作" width="80">
                                                                                        <template slot-scope="scope">
                                                                                            <el-button @click.native.prevent="dialog.scriptUnDeploy.rows.splice(scope.$index, 1);" type="text" icon="el-icon-delete"></el-button>
                                                                                        </template>
                                                                                    </el-table-column>
                                                                                </el-table>
                                                                            </el-main>
                                                                            <el-footer style="line-height:60px;">
                                                                                <el-checkbox v-model="dialog.scriptUnDeploy.zabbix" border>Zabbix探针</el-checkbox>
                                                                            </el-footer>
                                                                        </el-container>
                                                                        <div slot="footer" class="dialog-footer">
                                                                            <el-button @click="dialog.scriptUnDeploy.show = false">取 消</el-button>
                                                                            <el-button type="primary" @click="onScriptUnDeployHandler(dialog.scriptUnDeploy)">取消下发</el-button>
                                                                        </div>
                                                                    </el-dialog>
                                                                </el-tab-pane>
                                                            </el-tabs>
                                                        </el-main>
                                                    </el-container>
                                                </el-container>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="标签" prop="tags" width="200">
                                            <template slot-scope="scope">
                                                <mx-tag domain='script' :model.sync="scope.row.tags" :id="scope.row.id" limit="1"></mx-tag>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" width="130">
                                            <template slot-scope="scope">
                                                <el-tooltip content="编辑脚本、下发脚本" open-delay="500" placement="top">
                                                    <el-button type="text" icon="el-icon-setting" @click="onToogleExpand(scope.row,scope.$index)" :loading="scope.row.loading"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="删除脚本库" open-delay="500" placement="top">
                                                    <el-button type="text" icon="el-icon-delete" @click="onScriptDelete(scope.row,scope.$index)" v-if="scope.row.status==0"></el-button>
                                                </el-tooltip>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-main>
                                <el-footer style="height:30px;line-height:30px;">
                                    <!--#{ info.join(' &nbsp; | &nbsp;') }#-->
                                    <el-pagination
                                        @size-change="onPageSizeChange"
                                        @current-change="onCurrentPageChange"
                                        :page-sizes="[10, 15, 20]"
                                        :page-size="dt.pagination.pageSize"
                                        :total="dt.rows.length"
                                        layout="total, sizes, prev, pager, next">
                                    </el-pagination>
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
                    },
                    pickFiles(row){
                        try{
                            return _.find(row.fileObj, {version: row.selectedVersion}).files;
                        } catch(err){
                            return [];
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
                            this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
                        },
                        deep:true,
                        immediate:true
                    },
                    'versionTree.compareArr'(val,oldVal){
                        if(_.isEmpty(val) && this.$refs.tree){
                            this.$refs.tree.setCheckedNodes([]);
                        }
                    }
                },
                created(){
                    // 初始化服务器列表
                    this.getServerList();
                },
                mounted(){
                    this.$nextTick(()=>{
                        this.layout();
                    })
                },
                methods: {
                    onPageSizeChange(val) {
                        this.dt.pagination.pageSize = val;
                    },
                    onCurrentPageChange(val) {
                        this.dt.pagination.currentPage = val;
                    },
                    layout(){
                        let doLayout = ()=>{
                            if($(".el-table-column--selection",this.$el).is(':visible')){
                                _.delay(()=>{
                                    //this.$refs.table.setCurrentRow(this.dt.rows[0]);
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

                            _.forEach(self.dt.rows,(v)=>{
                                self.$set(v, 'expand', false);
                            })

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
                        let rtn = fsHandler.callFsJScript("/matrix/depot/getServerList.js").message;
                        this.$set(this.servers,'list', rtn);
                    },
                    pickFiles(row){
                        
                        try{
                            return _.find(row.fileObj, {version: row.selectedVersion}).files;
                        } catch(err){
                            return [];
                        }
                    },
                    // 脚本过滤 根据标签名
                    onFilterBytag(tag){
                        this.dt.rows = _.map(this.model.rows,(v)=>{
                            return _.includes(v.tags,tag);
                        })
                    },
                    // 脚本版本树
                    onFileTreeMouseEnter(item){
                        this.$set(item, 'show', true)
                    },
                    // 脚本版本树
                    onFileTreeMouseLeave(item){
                        this.$set(item, 'show', false)
                    },
                    // 脚本版本点击
                    onFileVersionClick(node,row){
                        this.$set(row, 'selectedVersion', node.version);
                    },
                    // 脚本版本队列
                    onFileVersionCheckChange(data, checked, indeterminate){
                        
                        this.versionTree.compareArr = this.$refs.tree.getCheckedNodes();
                        
                        if(this.versionTree.compareArr.length > 2){
                            this.versionTree.compareArr = this.versionTree.compareArr.slice(1);
                        }

                        this.$refs.tree.setCheckedNodes(this.versionTree.compareArr);

                        
                    },
                    // 脚本版本对比
                    onFileVersionCompare(){
                        const self = this;

                        let wnd = null;
                        let wndId = 'jsPanel-editor-mini';

                        try {
                            if(jsPanel.activePanels.getPanel(wndId)){
                                jsPanel.activePanels.getPanel(wndId).close();
                            }
                        } catch(error){

                        }
                        finally{
                            wnd = maxWindow.winEditorMini('版本比对', `<div id="${wndId}-compare"></div>`, null, null);

                            $(document).on('jspanelstatuschange', (event, id)=> {
                                if( id === "jsPanel-editor-mini" ) {
                                    var status = $('#' + id).data('status') || 'closed';
                                    if(status == 'closed'){
                                        this.versionTree.compareArr = [];
                                    }
                                }
                            });
                        }
                        
                        new Vue({
                            i18n,
                            delimiters: ['#{', '}#'],
                            template:   `<el-container style="width:100%;height:100%;">
                                            <el-container>
                                                <el-main>
                                                    <el-header style="height:40px;line-height:40px;">
                                                        <el-tooltip content="刷新" delay-time="500" placement="top">
                                                            <el-button type="text" icon="el-icon-refresh" @click="depotCompareContent"></el-button>
                                                        </el-tooltip>
                                                    </el-header>
                                                    <el-main style="width:100%;height:100%;">
                                                        <div style="width:100%;height:100%;" ref="editor"></div>
                                                    </el-main>
                                                </el-main>
                                            </el-container>
                                            <el-aside v-if="control.show">

                                            </el-aside>
                                        </el-container>`,
                            data: {
                                editor: null,
                                content: "",
                                control: {
                                    show: false
                                }
                            },
                            created(){
                                this.depotCompareContent();
                            },
                            mounted(){
                                this.initEdiotr();
                            },
                            methods: {
                                depotCompareContent(){
                                    let name = _.map(self.versionTree.compareArr,'name')[0];
                                    let versions = _.map(self.versionTree.compareArr, 'version');
                                    let param = {name:name, versions:versions };
                                    
                                    this.content = JSON.stringify(scriptHandler.compareDepotFiles(param),null,2);

                                    if(this.editor){
                                        this.editor.setValue(this.content,1);
                                    }
                                },
                                initEdiotr(){
                                    try{
                                        // Editor
                                        this.editor = ace.edit(this.$refs.editor);
                                        this.editor.setOptions({
                                            //maxLines: 1000,
                                            minLines: 20,
                                            autoScrollEditorIntoView: false,
                                            enableBasicAutocompletion: false,
                                            enableLiveAutocompletion: false
                                        });
                                        this.editor.getSession().setMode("ace/mode/sh");
                                        this.editor.setTheme("ace/theme/chrome");
                                        this.editor.renderer.setShowGutter(false);
                                        this.editor.focus(); //To focus the ace editor
                                        let row = this.editor.session.getLength() - 1;
                                        let column = this.editor.session.getLine(row).length;
                                        this.editor.gotoLine(row + 1, column);
                                        
                                        if(!_.isEmpty(this.content)){
                                            this.editor.setValue(this.content,1);
                                        }
                                    } catch(err){
                                        console.log(err)
                                    }
                                }
                            }
                        }).$mount(`#${wndId}-compare`);
                    },
                    // 脚本删除
                    onFileDelete(file,row){
                        try{
                            let files = _.find(row.fileObj, {version: row.selectedVersion}).files;
                            
                        } catch(err){
                            console.log(err)
                        }
                    },
                    // 脚本编辑
                    onFileEditor(file, row){
                        
                        let wnd = null;
                        let wndId = 'jsPanel-editor-mini';

                        try{
                            if(jsPanel.activePanels.getPanel(wndId)){
                                jsPanel.activePanels.getPanel(wndId).close();
                            }
                        } catch(error){

                        }
                        finally{
                            wnd = maxWindow.winEditorMini('脚本编辑', `<div id="${wndId}-editor"></div>`, null, null);
                        }
                        
                        new Vue({
                            i18n,
                            delimiters: ['#{', '}#'],
                            data: {
                                editor: null,
                                row: null,
                                fileContent: "",
                                control: {
                                    form: {
                                        show: false
                                    }
                                }
                            },
                            template:   `<el-container style="width:100%;height:100%;">
                                            <el-container style="width:100%;height:100%;">
                                                <el-main style="height:100%;padding:0px;overflow:hidden;">
                                                    <el-header style="height:40px;line-height:40px;">
                                                        <el-tooltip content="刷新" delay-time="500" placement="top">
                                                            <el-button type="text" icon="el-icon-refresh" @click="getFileContent"></el-button>
                                                        </el-tooltip>
                                                        <el-tooltip content="提交" delay-time="500" placement="top">
                                                            <el-button type="text" icon="el-icon-position" @click="control.form.show = true"></el-button>
                                                        </el-tooltip>
                                                    </el-header>
                                                    <el-main style="width:100%;height:100%;">
                                                        <div style="width:100%;height:100%;" ref="editor"></div>
                                                    </el-main>
                                                </el-main>
                                            </el-container>
                                            <el-asie style="width:40%;" v-if="control.form.show">
                                                <el-container style="width:100%;height:100%;">
                                                    <el-main style="height:100%;">
                                                        <el-form>
                                                            <el-form-item label="脚本库名称">
                                                                <el-input v-model="row.name" autocomplete="off" disabled></el-input>
                                                            </el-form-item>
                                                            <el-form-item label="脚本库版本">
                                                                <el-input v-model="row.newVersion" autocomplete="off"></el-input>
                                                            </el-form-item>
                                                            <el-form-item label="脚本库说明" prop="remark">
                                                                <el-input type="textarea" :row="6" v-model="row.remark"></el-input>
                                                            </el-form-item>
                                                            <el-form-item label="添加标签" prop="tags">
                                                                <mx-tag domain='script' :model.sync="row.tags" :id="row.id" limit="1"></mx-tag>
                                                            </el-form-item>
                                                            <el-form-item>
                                                                <el-button @click="control.form.show = false">取 消</el-button>
                                                                <el-button type="primary" @click="onUpdateFileContent">更 新</el-button>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-main>
                                                </el-container>
                                            </el-asie>
                                        </el-container>`,
                            created(){
                                // 初始化row
                                this.row = row;
                                this.$set(this.row, 'newVersion', row.version);
                                
                                // 初始化文件内容
                                this.getFileContent();
                            },
                            mounted(){
                                this.initEdiotr();
                            },
                            methods: {
                                getFileContent(){
                                    let param = {name:row.name, version:row.selectedVersion, path: file.path };
                                    this.fileContent = scriptHandler.getDepotFileContent(param);
                                    if(this.editor){
                                        this.editor.setValue(this.fileContent,1);
                                    }
                                },
                                initEdiotr(){
                                    try{
                                        // Editor
                                        this.editor = ace.edit(this.$refs.editor);
                                        this.editor.setOptions({
                                            //maxLines: 1000,
                                            minLines: 20,
                                            autoScrollEditorIntoView: false,
                                            enableBasicAutocompletion: false,
                                            enableLiveAutocompletion: false
                                        });
                                        this.editor.getSession().setMode("ace/mode/sh");
                                        this.editor.setTheme("ace/theme/chrome");
                                        this.editor.renderer.setShowGutter(false);
                                        this.editor.focus(); //To focus the ace editor
                                        let row = this.editor.session.getLength() - 1;
                                        let column = this.editor.session.getLine(row).length;
                                        this.editor.gotoLine(row + 1, column);
                                        
                                        if(!_.isEmpty(this.fileContent)){
                                            this.editor.setValue(this.fileContent,1);
                                        }
                                    } catch(err){
                                        console.log(err)
                                    }
                                },
                                onUpdateFileContent(){
                                    
                                    if(this.row.version == this.row.newVersion) {
                                        this.$message({
                                            type: "info",
                                            message: "请输入新版本号，示例：1.0.0"
                                        })
                                        return false;
                                    }
                                    
                                    const h = this.$createElement;
                                    
                                    this.$msgbox({
                                            title: "确认要更新该脚本！",
                                            showCancelButton: true,
                                            confirmButtonText: '确定',
                                            cancelButtonText: '取消'
                                    }).then(() => {
                                        
                                        this.$set(this.row, 'content', this.editor.getValue());
                                        this.$set(this.row, 'filepath', file.path);
                                        this.$set(this.row, 'newVersion', this.row.newVersion);
                                        this.$set(this.row, 'type', 'M');

                                        let rtn = scriptHandler.updateDepotFileContent(this.row);

                                        if(rtn == 1){
                                            _.delay(()=>{
                                                this.$message({
                                                    type:"success",
                                                    message: "文件更新成功！"
                                                })
                                                this.control.form.show = false;
                                                wnd.close();
                                            },500)    
                                        } else {
                                            this.$message({
                                                type:"error",
                                                message: "文件更新失败：" + rtn
                                            })
                                            return false;
                                        }
                                        
                                        
                                    }).catch(()=>{

                                    });
                                    
                                }
                            }
                        }).$mount(`#${wndId}-editor`);
                    },
                    // 获取脚本详细信息
                    onToogleExpand(row,rowIndex){
                        
                        if(row.expand){
                            this.$refs.table.toggleRowExpansion(row,false);
                            this.$set(row, 'expand', !row.expand);
                            return false;
                        }

                        this.$set(row,'loading',true);

                        _.forEach(this.dt.rows,(item) => {
                            if (row.id != item.id) {
                                this.$set(item, 'expand', false);
                                this.$refs.table.toggleRowExpansion(item, false);
                            }
                        })

                        const self = this;
                        var loadData = function(){
                            
                            try {
                                // 重置比对队列
                                self.versionTree.compareArr = [];
    
                                // 获取脚本文件信息
                                let rtn = scriptHandler.depotGet(row);
                                _.extend(row, { activeTab: 'script' } );
    
                                // 获取所有版本号
                                let versions = scriptHandler.depotGet({name:row.name,version:null}).versions;
                                   
                                // 获取每个版本的信息
                                let versionObj = {};
                                _.forEach(versions,(val)=>{
                                    let ifDeployed = false;
                                    let term = {name:row.name, version:val};
                                    
                                    // 查询该版本是否是下发版本
                                    ifDeployed = fsHandler.callFsJScript("/matrix/depot/getScriptDeployVersion.js", encodeURIComponent(JSON.stringify(term))).message;
    
                                    // 如果是下发版本，获取下发服务器信息
                                    let v = {};
                                    if(ifDeployed){
                                        v[val] = _.extend({ show:false, ifDeployed: ifDeployed, deployedServers: row.selected }, scriptHandler.depotGet({name:row.name,version:val}));
                                    } else {
                                        v[val] = _.extend({ show:false, ifDeployed: ifDeployed, deployedServers: [] }, scriptHandler.depotGet({name:row.name,version:val}));
                                    }
                                    _.extend(versionObj, v);
                                })
    
                                // 脚本文件各版本的文件对象
                                // 当前版本对应的文件列表、文件内容、下发命令、key、服务器
                                self.$set(row, 'fileObj', versionObj);
                                self.$set(row, 'versionObj', _.values(versionObj));
                                self.$set(row, 'selectedVersion', row.version);
    
                                // 初始化命令编辑器
                                _.delay(()=>{
                                    
                                    let editor = ace.edit(self.$refs['commandRef'+row.id]);
                                    
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
                                },2000)
    
                            } catch(err){
                                console.error(err)
                                _.extend(row, { activeTab: 'script' } );
                            } 
                        };
                        
                        loadData();

                        if( !_.isUndefined(row.fileObj) ){
                            _.delay(()=>{
                                self.$refs.table.toggleRowExpansion(row);
                                self.$set(row,'loading',false);
                                self.$set(row, 'expand', !row.expand);
                            },1000)
                        } else {
                            setTimeout( loadData, 50 );
                        }

                        
                    },
                    // 上传文件
                    onFileChange(file, fileList, row) {
                                    
                        this.$set(row, 'uploadfile', file.raw);
                        
                        this.$set(row, 'fileList', [file.raw]);

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
                    onRowClick(row, column, event){
                        
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
                        this.$root.$refs.scriptView.onToggle();
                    },
                    // Tag Action
                    tagAdd(tag, row){
                        try{      
                            
                            let term = {action: "+", domain: "script", ids:[row.id], tags: [tag]};
                            
                            fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(term)));

							eventHub.$emit("TAG-TREE-REFRESH");
							
						} catch(err){
							console.error(err);
						}
                    },
                    tagDelete(tag, row){
                        try{      
                            
                            let term = {action: "-", domain: "script", ids:[row.id], tags: [tag]};
                            
                            fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(term)));

							eventHub.$emit("TAG-TREE-REFRESH");
							
						} catch(err){
							console.error(err);
						}
                    },
                    // 脚本刷新
                    onScriptRefresh(){
                        this.initData();
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

                        this.$confirm('确定删除选定的脚本库?', '提示', {
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

                            this.dialog.scriptUnDeploy.show = true;
                            
                            
                            // 取消下发服务器列表
                            this.dialog.scriptUnDeploy.script = row;
                            this.dialog.scriptUnDeploy.rows = _.map(movedKeys,(v)=>{
                                return { host:v.host, status: 0, loading: false};
                            })

                            if( _.indexOf(row.tags,'zabbix') != -1 || _.indexOf(row.tags,'ZABBIX') != -1 ){
                                this.dialog.scriptUnDeploy.zabbix = true;
                            }

                            
                        } 
                        // 下发
                        else {
                            
                            // 检查当前脚本是否已有下发版本
                            // 下发的版本可以追加下发对象
                            if( row.status == 1 ) {
                                let deployedVersion = _.find(row.versionObj,{ifDeployed:true}).version;
                                if( row.selectedVersion != deployedVersion ){
                                    this.$message({
                                        type: "warning",
                                        message: `该脚本【${deployedVersion}】已下发，请确认！如果需要下发其它版本，请先取消当前版本的下发！`
                                    })
                                    return false;
                                }
                            }

                            this.dialog.scriptDeploy.show = true;
                            let editor = ace.edit(this.$refs['commandRef'+row.id]);
                            this.$set(row,'command', _.trim(editor.getValue()));

                            if(_.isEmpty(row.zabbixKey)){
                                this.$message({
                                    type: "warning",
                                    message: "请输入zabbix key！"
                                })
                                return false;
                            }

                            // 下发服务器列表
                            this.dialog.scriptDeploy.script = row;
                            this.dialog.scriptDeploy.rows = _.map(movedKeys,(v)=>{
                                return { host:v.host, status: 0, loading: false};
                            })

                            if( _.indexOf(row.tags,'zabbix') != -1 || _.indexOf(row.tags,'ZABBIX') != -1 ){
                                this.dialog.scriptDeploy.zabbix = true;
                            }
                            
                        }

                    },
                    onScriptDeployHandler(items){
                         
                        _.forEach(items.rows,(item)=>{

                            // 下发开始
                            item.loading = true;
                            item.status = 1;

                            // 一台一台下发
                            let params = {
                                hosts: [item.host],
                                name: items.script.name,
                                version: items.script.selectedVersion,
                                key: items.script.zabbixKey,
                                command: items.script.command
                            }
                            
                            _.delay(()=>{
                                    
                                if(items.zabbix){
                                    scriptHandler.deployToZabbixAgent(params);
                                } else {
                                    
                                    scriptHandler.depotDeploy(params).then( (rtn) => {
                                        
                                        // 下发成功
                                        if(rtn == 1){
                                            // 重置状态
                                            item.status = 2;
                                            items.script.fileObj[items.script.selectedVersion]['deployedServers'].push(item.host);
                                            items.script.status = 1;

                                            // 重置数据
                                            let hostObj = _.find(this.$refs[`mxTransfer${items.script.id}`].source.rows, {host: item.host});
                                            this.$refs[`mxTransfer${items.script.id}`].source.rows = _.difference(this.$refs[`mxTransfer${items.script.id}`].source.rows, [hostObj]);
                                            this.$refs[`mxTransfer${items.script.id}`].target.rows.push(hostObj);
                                            
                                            // 重置标签
                                            this.tagAdd('已下发', items.script);
                                            this.tagDelete('未下发', items.script);
                                        } 
                                        // 下发失败
                                        else{
                                            // 重置状态
                                            item.status = 3;
                                            item.msg = rtn;
                                        }
                                        // 重置状态
                                        item.loading = false;
                                    })
                                }
    
                            },500)

                        })
                    },
                    onScriptUnDeployHandler(items){
                        
                        var status = 1;
                        var overStatus = [];
                        _.forEach(items.rows,(item,index)=>{

                            // 取消下发开始
                            item.loading = true;
                            item.status = 1;

                            // 一台一台取消下发
                            let params = {
                                hosts: [item.host],
                                name: items.script.name,
                                version: items.script.selectedVersion
                            }
                            
                            _.delay(()=>{
                                if(items.zabbix){

                                    scriptHandler.unDeployToZabbixAgent(params)
                                    
                                } else {
                                    scriptHandler.depotUnDeploy(params).then( (rtn) => {
                                        // 取消下发成功
                                        if(rtn == 1){
                                            item.status = 2;
                                            items.script.fileObj[items.script.selectedVersion]['deployedServers'] = _.difference(items.script.fileObj[items.script.selectedVersion]['deployedServers'], [item.host]);
                                            status = 0;
                                            overStatus[index] = 1;

                                            // 重置数据
                                            let hostObj = _.find(this.$refs[`mxTransfer${items.script.id}`].target.rows, {host: item.host});
                                            this.$refs[`mxTransfer${items.script.id}`].target.rows = _.difference(this.$refs[`mxTransfer${items.script.id}`].target.rows, [hostObj]);
                                            this.$refs[`mxTransfer${items.script.id}`].source.rows.push(hostObj);
                                        } 
                                        // 取消下发失败
                                        else{
                                            item.status = 3;
                                            overStatus[index] = 0;
                                            item.msg = rtn;
                                        }
                                        item.loading = false;
                                    })
                                }
                            },500)

                        })

                        _.delay(()=>{
                            this.$set(items.script,'status',status);
                            if(items.script.status == 0){
                                this.tagAdd('未下发', items.script);
                                this.tagDelete('已下发', items.script);
                            }
                        }, 500 * items.rows.length + 500)
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
                                        version: '1.0.0',
                                        remark: "",
                                        uploadfile: null,
                                        tags: [],
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
                            template:   `<el-container style="height:calc(100% - 80px);padding:20px;">
                                            <el-header style="height:40px;line-height:40px;text-align:right;padding:0px;">
                                                <el-button type="success" icon="el-icon-upload2" @click="onSave">上传到脚本库</el-button>    
                                            </el-header>
                                            <el-main style="height:100%;">
                                                <el-form label-position="left" label-width="120px" ref="form">
                                                    <el-form-item label-width="0px" style="border:1px dashed #dddddd;padding:10px;" required>
                                                        <el-upload
                                                            :on-change="onFileChange"
                                                            :before-remove="onBeforeRemove"
                                                            :file-list="fileList"
                                                            :limit="1"
                                                            multiple="false"
                                                            :auto-upload="false">
                                                            <el-button icon="el-icon-plus" type="default">选择脚本</el-button>
                                                            <div slot="tip" class="el-upload__tip">支持上传单个脚本文件、支持zip格式脚本压缩包</div>
                                                            </el-upload>
                                                    </el-form-item>
                                                    <el-form-item label="脚本库名称" required>
                                                        <el-input v-model="model.item.name"></el-input>
                                                    </el-form-item>
                                                    <el-form-item label="脚本库版本" required>
                                                        <el-input v-model="model.item.version"></el-input>
                                                    </el-form-item>
                                                    <el-form-item label="执行命令">
                                                        <el-input type="textarea" :row="6" v-model="model.item.command"></el-input>
                                                    </el-form-item>
                                                    <el-form-item label="脚本库说明" required>
                                                        <el-input type="textarea" :row="6" v-model="model.item.remark"></el-input>
                                                    </el-form-item>
                                                    <el-form-item label="添加标签">
                                                        <mx-tag domain='script' :model.sync="model.item.tags" id="null" limit="8"></mx-tag>
                                                    </el-form-item>
                                                </el-form>
                                            </el-main>
                                        </el-container>`,
                            mounted(){
                                this.$nextTick(()=> {
                                    
                                })
                            },
                            methods: {
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

                                    if(_.isEmpty(this.model.item.version)){
                                        
                                        this.$message({
                                            type: "warning",
                                            message: "脚本库版本不能为空！"
                                        })
            
                                        return false;
                                    } else {
                                        let flag = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(this.model.item.version);
                                        if( !flag ){
                                            this.$message({
                                                type: "warning",
                                                message: "请确认脚本库版本号格式，示例：1.0.0"
                                            }) 
                                            return false;
                                        }
                                    }

                                    if(_.isEmpty(this.model.item.remark)){
                                        this.$message({
                                            type: "warning",
                                            message: "请输入脚本库说明！"
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
                                    
                                    try{
                                        if (_.includes(mx.global.register.probe.upload.blackList,file.raw.type)) {
                                            this.$message.warning('上传文件不能是图片或者媒体文件!');
                                            this.fileList = [];
                                            return false;
                                        }
    
                                        this.model.item.name = _.head(file.raw.name.split("."));
                                        
                                        this.model.item.uploadfile = file.raw;
                                    } catch(err){

                                    }

                                },
                                onBeforeRemove(file, fileList) {
                                    return this.$confirm(`确定移除 ${ file.name }？`);
                                }
                            }
                        }).$mount("#script-upload-container");
                    },
                    // 脚本刷新
                    onScriptRefresh(){
                        this.$root.$refs.scriptView.getScriptList();
                    },
                    // 脚本命令更新
                    onScriptCommandUpdate(row){
                        
                        let editor = ace.edit(this.$refs['commandRef'+row.id]);
                        this.$set(row,'command', _.trim(editor.getValue()));

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
                                message: "更新失败：" + rtn
                            })
                        }

                    },
                    // 脚本更新
                    onScriptUpdate(row){

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

                        this.versionTree.dialog.fileUpdate = false;
                    }
                }
            })

            Vue.component("probe-view", {
                delimiters: ['#{', '}#'],
                data(){
                    return {
                        model: {},
                        splitInst: null,
                        options: {
                            // 视图定义
                            view: {
                                eidtEnable: false,
                                show: false,
                                value: "all"
                            },
                            // 搜索窗口
                            window: { name:"所有", value: ""},
                            // 输入
                            term: "",
                            autoSearch: true,
                            // 指定类
                            class: "#/matrix/system/hostinfo:",
                            // 指定api
                            api: {parent: "probe",name: "getProbeList.js"},
                            // 其它设置
                            others: {
                                // 是否包含历史数据
                                ifHistory: false,
                                // 是否包含Debug信息
                                ifDebug: false,
                                // 指定时间戳
                                forTime:  ' for vtime ',
                            }
                        }
                    }
                },
                template: `<el-container style="height:calc(100vh - 145px);">
                                <el-aside style="background:#f2f2f2;width:20%;margin: -10px 0px -10px -10px;" ref="leftView">
                                    <mx-tag-tree :model="{parent:'/probe',name:'probe_tree_data.js',domain:'probe'}" :fun="onRefreshByTag" ref="probeTagTree"></mx-tag-tree>
                                </el-aside>
                                <el-main style="padding:0px;width:80%;height:100%;overflow:hidden;" ref="mainView">
                                    <el-container style="height:100%;display:block;">
                                        <el-header style="height:auto;padding:5px;display:flex;" v-if="!_.isEmpty(model)">
                                            <!--el-button type="primary" v-for="item in model.summary"
                                                style="max-width: 25%;width: 20%;height:auto;min-height:90px;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);">
                                                <h3>#{item.name}#</h3>
                                                <p>
                                                    #{item.count}#
                                                </p>
                                            </el-button-->
                                            <el-button type="defult" v-for="item in model.summary" 
                                                style="max-width: 20em;width: 20em;height:auto;min-height:90px;border-radius: 10px!important;margin: 5px;border: unset;background:#f2f2f2;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);">
                                                <span style="display:flex;">
                                                    <span style="width:30%;border-radius:30px;background:#409EFF;">
                                                        <h3>
                                                            <el-popover
                                                                placement="top-start"
                                                                trigger="hover"
                                                                :content="item.count+' '+item.unit">
                                                                <el-button type="text" slot="reference" style="padding:0px;"><h3 style="margin:5px 0px;color:#ffffff;">#{item.name}#</h3></el-button>
                                                            </el-popover>
                                                        </h3>
                                                    </span>
                                                    <span style="width:70%;text-align:right;">
                                                        <h2>
                                                            #{item.count}#
                                                        </h2>
                                                        <el-progress :percentage="item.percent"></el-progress>
                                                    </span>
                                                </span>
                                            </el-button>
                                        </el-header>
                                        <el-main style="padding:10px;height:100%;overflow:hidden;">
                                            <el-container style="height: calc(100% - 85px);">
                                                <el-header class="probe-view-header" style="height: 40px;line-height: 40px;padding: 0px;background: #dddddd;display: inline-table;">
                                                    <search-base-component :options="options"
                                                                        ref="searchRef"
                                                                        class="grid-content"></search-base-component>
                                                </el-header>
                                                <el-main style="padding:10px 0px;">
                                                    <probe-manage :model="model.list" ref="probeManageRef"></probe-manage>
                                                </el-main>
                                            </el-container>
                                        </el-main>
                                    </el-container>
                                </el-main>
                            </el-container>`,
                mounted(){
                    this.$nextTick().then(()=>{
                        let init = ()=>{
                            if($(this.$refs.probeManageRef.$el).is(':visible')){
                                this.initSplitH();
                            } else {
                                setTimeout(init,50);
                            }
                        }
                        init();

                        // 数据设置
                        this.setData();

                        // watch数据更新
                        this.$watch(
                            "$refs.searchRef.result",(val, oldVal) => {
                                this.setData();
                            }
                        );
                    })   
                },
                methods: {
                    setData(){
                        this.$set(this, 'model', this.$refs.searchRef.result);
                    },
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
                    },
                    onRefreshByTag(tag){
                        this.options.term = `tags=${tag}`;
                        this.$refs.searchRef.search();
                    }
                }
            });

            Vue.component("script-view", {
                data(){
                    return {
                        model: {},
                        splitInst: null,
                        options: {
                            // 视图定义
                            view: {
                                eidtEnable: false,
                                show: false,
                                value: "all"
                            },
                            // 搜索窗口
                            window: { name:"所有", value: ""},
                            // 输入
                            term: "",
                            autoSearch: true,
                            // 指定类
                            class: "#/matrix/system/depot:",
                            // 指定api
                            api: {parent: "depot",name: "getScriptList.js"},
                            // 其它设置
                            others: {
                                // 是否包含历史数据
                                ifHistory: false,
                                // 是否包含Debug信息
                                ifDebug: false,
                                // 指定时间戳
                                forTime:  ' for vtime ',
                            }
                        }
                    }
                },
                template: `<el-container style="height:calc(100vh - 145px);width:100%;">
                                <el-aside ref="leftView" style="background:#f2f2f2;margin: -10px 0px -10px -10px;">
                                    <mx-tag-tree :model="{parent:'/depot',name:'script_tree_data.js',domain:'script'}" :fun="onRefreshByTag" ref="scriptTagTree"></mx-tag-tree>
                                </el-aside>
                                <el-main style="padding:10px 10px 0px 10px;width:100%;overflow:hidden;" ref="mainView">
                                    <el-container style="height:100%;">
                                        <el-header class="job-view-header" style="height: 40px;line-height: 40px;padding: 0px;">
                                            <search-base-component :options="options"
                                                                ref="searchRef"
                                                                class="grid-content"></search-base-component>
                                        </el-header>
                                        <el-main style="padding:10px 0 0 0;width:100%;overflow:hidden;">
                                            <script-manage :model="model.list" ref="scriptManageRef"></script-manage>
                                        </el-main>
                                    </el-container>
                                </el-main>
                            </el-container>`,
                mounted(){
                    this.$nextTick().then(()=>{
                        
                        let init = ()=>{
                            if($(this.$refs.scriptManageRef.$el).is(':visible')){
                                this.initSplitH();
                            } else {
                                setTimeout(init,50);
                            }
                        }
                        init();

                        // 数据设置
                        this.setData();

                        // watch数据更新
                        this.$watch(
                            "$refs.searchRef.result",(val, oldVal) => {
                                this.setData();
                            }
                        );
                    })   
                },
                methods: {
                    setData(){
                        this.$set(this.model, 'list', this.$refs.searchRef.result.list);
                    },
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
                        
                    },
                    // 获取所有脚本列表
                    getScriptList(){
                        this.$refs.searchRef.search();
                    },
                    onRefreshByTag(tag){
                        this.options.term = `tags=${tag}`;
                        this.$refs.searchRef.search();
                    },
                    onToggle(){
                        $(this.$refs.leftView.$el).toggle();
                    }
                }
            });

            Vue.component("job-view",{
                template:   `<div ref="jobView" v-loading="loading" style="height: 100vh;"></div>`,
                data(){
                    return {
                        loading: true
                    }
                },
                mounted(){
                    _.delay(()=>{

                        let maxJob = new Job();
                        maxJob.init();
                        maxJob.mount(this.$refs.jobView,210);
                        
                        _.delay(()=>{
                            //成功回调函数停止加载
                            this.loading = false;
                        },2000)

                    },500)
                }
            })

        })
    }

    mount(el){
        let main = {
            delimiters: ['#{', '}#'],
            template:   `<el-container style="background:#ffffff;">
                            <el-main style="padding:0px;overflow:hidden;">
                                <el-tabs v-model="tabs.activeName" type="border-card">
                                    <el-tab-pane label="探针列表" name="probe">
                                        <probe-view ref="probeView"></probe-view>
                                    </el-tab-pane>
                                    <el-tab-pane label="脚本管理" name="script" lazy>
                                        <script-view ref="scriptView"></script-view>
                                    </el-tab-pane>
                                    <el-tab-pane label="执行控制台" name="job" lazy>
                                        <job-view ref="jobView"></job-view>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-main>
                        </el-container>`,
            data: {
                tabs:{
                    activeName: 'probe',
                }
            }
        };
        
        _.delay(()=>{
            this.app = new Vue(main).$mount(el);
        },50)
        
    }
}