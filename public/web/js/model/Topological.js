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
class Topological {
    
    constructor() {

        this.app = null;
        this.graphScript = null;

        this.URL_PARAMS_ITEM = null;
        this.URL_PARAMS_CFG = null;
        this.URL_PARAMS_GRAPH = null;
    }
    
    init() {
        const inst = this;

        moment.locale(window.MATRIX_LANG);

        // Table组件 单选
        Vue.component("el-table-component",{
            delimiters: ['#{', '}#'],
            props: {
                model: Object,
                expandColumn: Boolean
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
            watch: {
                model: {
                    handler(val,oldVal){
                        this.initData();
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
            template:   `<el-container style="height:100%;">
                            <el-header style="height:30px;line-height:30px;">
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
                            <el-main style="padding:0px;">
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
                                    <el-table-column type="expand">
                                        <template slot-scope="props">
                                            <el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f2f3f5;" >
                                                <el-form-item v-for="v,k in props.row" :label="k">
                                                    <el-input v-model="v"></el-input>
                                                </el-form-item>
                                            </el-form>
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
                                </el-table>
                            </el-main>
                            <el-footer  style="height:30px;line-height:30px;">
                                #{ info.join(' &nbsp; | &nbsp;') }#
                            </el-footer>
                        </el-container>`,
            mounted(){

            },
            directives: {
                'table': function (el, binding) {
                  if (binding.value) {
                    el.focus()
                  }
                }
            },
            methods: {
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
                    const self = this;
                    
                    $.contextMenu( 'destroy' ).contextMenu({
                        selector: `.${column.id}`,
                        trigger: "right",
                        autoHide: true,
                        delay: 5,
                        hideOnSecondTrigger: true,
                        className: `animated slideIn ${column.id}`,
                        build: function($trigger, e) {
            
                            return {
                                callback: function(key, opt) {
                                    
                                    if(_.includes(key,'diagnosis')) {
                                        self.$root.detailAdd(row);
                                    } else if(_.includes(key,'action')) {
                                        // 增加操作类型
                                        let action = _.last(key.split("_"));
                                        self.$root.action({list: [row], action:action});
                                    } else if(_.includes(key,'ticket')){
                                        alertify.confirm(`确定生成工单<br><br>
                                                            告警ID：${row.id}<br><br>
                                                            实体ID：${row.entity}<br><br>
                                                            模板ID：b223c78b-3107-11e6-8487-446d577ed81c<br><br>
                                                            告警摘要：${row.msg}<br><br>
                                                            告警时间：${moment(row.vtime).format("LLL")}<br><br>`, function (e) {
                                            if (e) {
                                                try{
                                                    let rtn = fsHandler.callFsJScript("/matrix/readysoft/eventToTicket.js", encodeURIComponent(JSON.stringify(row).replace(/%/g,'%25'))).message.data;
                                                    if(rtn.data.success == 1){
                                                        self.options.term = row.id;
                                                        self.$refs.searchRef.search();
                                                        alertify.success(`创建工单成功! <br><br>
                                                                    工单单号：${rtn.data.ticket_number}`)
                                                    }
                                                }catch(err){
                                                    alertify.error(`创建工单失败，请确认！ <br><br>
                                                                    ${rtn}<br><br>
                                                                    ${err}`)
                                                }
                                            } else {
                                                
                                            }
                                        });
                                    }
                                },
                                items: self.$root.model.message.contextMenu.event
                            }
                        },
                        events: {
                            show(opt) {
        
                                let $this = this;
                                _.delay(()=>{
                                    new Vue(mx.tagInput(`${column.id}_single_tags`, `.${column.id} input`, row, self.$root.$refs.searchRef.search));
                                },50)
                            }
                        }
                    });
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
                    
                }
            }
        })
        
        // 拓扑分析输入组件
        Vue.component("topological-analysis-input",{
            delimiters: ['#{', '}#'],
            props: {
                model: Object
            },
            template:  `<el-container>
                            <el-header style="height:30px;ling-height:30px;padding:0px;">
                                <el-autocomplete placeholder="请输入实体" 
                                                v-model="model.id" 
                                                :fetch-suggestions="querySearchAsync"
                                                @select="handleSelect"
                                                :trigger-on-focus="false"
                                                style="width:100%;"
                                                class="topological-analysis-input">
                                    <el-button slot="prepend" icon="el-icon-menu" class="handleSort input-el-button"></el-button>
                                    <el-button slot="append" icon="el-icon-arrow-down"  @click="edge.show = !edge.show" v-if="edge.show"></el-button>
                                    <el-button slot="append" icon="el-icon-arrow-right" @click="edge.show = !edge.show" v-else></el-button>
                                    <el-button slot="append" icon="el-icon-postcard" @click="onDiagnosis(model)"></el-button>
                                    <el-button slot="append" @click="onRemove(model.id)">
                                        <i class="el-icon-circle-close" style="font-size:16px;font-weight:600;"></i>
                                    </el-button>
                                </el-autocomplete>
                            </el-header>
                            <el-main v-if="edge.show" style="padding:10px;background:#f2f3f5;">
                                <el-form label-width="50px" label-position="top" class="topological-analysis-form">
                                    <el-form-item label="关系" style="font-weight:noomal;">
                                        <el-select v-model="edge.edgeType" placeholder="请选择关系类型">
                                            <el-option
                                                v-for="item in edge.list"
                                                :key="item.name"
                                                :label="item.remedy"
                                                :value="item.name">
                                                <span style="float: left">#{ item.remedy }#</span>
                                                <span style="float: right; color: #8492a6; font-size: 13px">#{ item.name }#</span>
                                            </el-option>
                                        </el-select>
                                        <el-popover
                                            placement="top-start"
                                            width="200"
                                            trigger="hover"
                                            content="实体连接关系选择">
                                            <span slot="reference" class="el-icon-question" style="float:right;"></span>
                                        </el-popover>
                                    </el-form-item>
                                    <el-form-item label="几跳" style="font-weight:normal;">
                                        <el-input-number v-model="edge.edgeStep" :min="1"></el-input-number>
                                        <el-popover
                                            placement="top-start"
                                            width="200"
                                            trigger="hover"
                                            content="实体连接层级设置，实体直接连接为1跳，间接连接为2跳，以此类推。">
                                            <span slot="reference" class="el-icon-question" style="float:right;"></span>
                                        </el-popover>
                                    </el-form-item>
                                    <el-form-item label="自定义" style="font-weight:normal;">
                                        <el-input type="textarea" :rows=3 v-model="edge.edgeCustom" @blur="onBlur" clearable></el-input>
                                        <el-popover
                                            placement="top-start"
                                            width="200"
                                            trigger="hover"
                                            content="请参考图查询文档，自定义关系类型及实体连接层级设置，举例：[:connect*1]">
                                            <span slot="reference" class="el-icon-question" style="float:right;"></span>
                                        </el-popover>
                                    </el-form-item>
                                </el-form>
                            </el-main>
                        </el-container>`,
            data(){
                return {
                    entity: {
                        list: [],
                        timeout:  null,
                    },
                    edge: {
                        show: false,
                        list: fsHandler.callFsJScript("/matrix/graph/edges.js",null).message,
                        edgeType: "*",
                        edgeStep: 0,
                        edgeCustom: ""
                    }
                }
            },
            watch:{
                'edge.edgeCustom':function(val,oldVal){
                    this.edge.edgeType = val.split("*")[0].replace(/:/,"");
                    this.edge.edgeStep = val.split("*")[1];
                }
            },
            methods:{
                onBlur(){
                    this.edge.edgeType = this.edge.edgeCustom?this.edge.edgeCustom.split("*")[0].replace(/:/,""):"*";
                    this.edge.edgeStep = this.edge.edgeCustom?this.edge.edgeCustom.split("*")[1]:0;
                },
                onDiagnosis(node){
                    const self = this;

                    inst.app.$refs.graphDiagnosisRef.diagnosisAdd( node );
                },
                onRemove(id){
                    const self = this;
                    self.$parent.$parent.$parent.trace.nodes.splice(_.findIndex(self.$parent.$parent.$parent.trace.nodes,{id:id}),1);
                },
                querySearchAsync(term, cb) {
                    
                    try{
                        if(_.isEmpty(term)){
                            return false;
                        }
    
                        let entitys = fsHandler.callFsJScript("/matrix/graph/entity-search-by-term.js",encodeURIComponent(term)).message;
                        
                        let results = term ? entitys.filter(this.createStateFilter(term)) : entitys;
                
                        clearTimeout(this.entity.timeout);
                        this.entity.timeout = setTimeout(() => {
                          cb(results);
                        }, 3000 * Math.random()); 
                    } catch(err){

                    }
                    
                },
                createStateFilter(term) {
                    return (state) => {
                      return (state.value.toLowerCase().indexOf(term.toLowerCase()) === 0);
                    };
                },
                handleSelect(item) {
                    console.log(item);
                }
            }
        })

        // 拓扑分析新增输入组件
        Vue.component("topological-analysis-new-input",{
            delimiters: ['#{', '}#'],
            template:  `<el-autocomplete placeholder="请输入实体" 
                                        v-model="newModel.id" 
                                        class="input-with-select topological-analysis-input"
                                        :fetch-suggestions="querySearchAsync"
                                        :trigger-on-focus="false"
                                        @select="handleSelect"
                                        @keyup.enter.native="onNew">
                            <template slot="prepend">
                                <i class="el-icon-place"></i>
                            </template>
                            <el-button slot="append" @click="onNew">
                                <i class="el-icon-circle-plus-outline" style="font-size:16px;font-weight:600;color:green;"></i>
                            </el-button>
                        </el-input>`,
            data(){
                return {
                    newModel: {
                        id: "",
                        value: ""
                    },
                    entity: {
                        list: [],
                        timeout:  null
                    }
                }
            },
            methods:{
                onNew(){
                    const self = this;
                    
                    let id = this.newModel.id && this.newModel.id.trim()
                    if (!id) {
                        return;
                    }
                    self.$parent.$parent.$parent.trace.nodes.push({
                        id: this.newModel.id,
                        cell: {edge:false}
                    })
                    this.newModel.id = "";
                    
                },
                querySearchAsync(term, cb) {
                    
                    if(_.isEmpty(term)){
                        return false;
                    }

                    let entitys = fsHandler.callFsJScript("/matrix/graph/entity-search-by-term.js",encodeURIComponent(term)).message;
                    
                    let results = term ? entitys.filter(this.createStateFilter(term)) : entitys;
                    
                    clearTimeout(this.entity.timeout);
                    this.entity.timeout = setTimeout(() => {
                      cb(results);
                    }, 50 * Math.random());
                },
                createStateFilter(term) {
                    return (state) => {
                        return (state.value.toLowerCase().indexOf(term.toLowerCase()) === 0);
                    };
                },
                handleSelect(item) {
                    this.onNew();
                }
            }
        })

        // 路径搜索面板
        Vue.component("topological-path",{
            delimiters: ['#{', '}#'],
            props: {
                pathType: String
            },
            template:  `<el-container>
                            <el-header style="height:100%;line-height:100%;padding:10px;display:flex;flex-direction: column;">
                                <div ref="topologicalAnalysisInputList">    
                                    <topological-analysis-input v-for="item in _.uniqBy(trace.nodes,'id')" :model="item" :data-id="item.id" :ref="item.id"></topological-analysis-input>
                                </div>
                                <topological-analysis-new-input></topological-analysis-new-input>
                            </el-header>
                            <el-main style="padding:0px 10px;" class="topological-analysis">
                                <el-table :data="trace.paths.rows" 
                                        ref="multipleTable"
                                        tooltip-effect="dark"
                                        @selection-change="onSelectionChange"
                                        style="width: 100%"
                                        v-if="trace.paths.rows.length > 0">
                                    <el-table-column type="expand">
                                        <template slot-scope="props">
                                          <el-form>
                                            <el-form-item v-for="v,k in _.omit(props.row,['num','class'])">
                                                <template slot="label">
                                                    <i class="el-icon-place" style="color: #67c239;"></i>
                                                </template>
                                                <span>#{ v }#</span>
                                            </el-form-item>
                                          </el-form>
                                        </template>
                                    </el-table-column>
                                    <el-table-column type="selection" width="55"></el-table-column>
                                    <el-table-column :prop="col.data" :label="col.title" v-for="col in trace.paths.columns"></el-table-column>
                                </el-table>
                            </el-main>
                        </el-container>`,
            data(){
                return {
                    trace: {
                        newItem: {
                            id: "",
                            type: "",
                            value: ""
                        },
                        nodes: [],
                        paths: {
                            rows: [], 
                            columns: []
                        },
                        selectedPaths: []
                    }
                }
            },
            created(){
                eventHub.$on("TOPOLOGICAL-ANALYISS-TRACE",this.setTrace);
            },
            mounted(){
                
                _.delay(()=>{
                    let sortable = Sortable.create(this.$refs.topologicalAnalysisInputList,{
                        handle: ".handleSort",
                        dataIdAttr: 'data-id',
                        onChange(evt) {
                            let nodes = _.cloneDeep(this.trace.nodes);
                            this.trace.nodes = _.map(sortable.toArray(),(v)=>{
                                return _.find(nodes,{id:v});
                            });
                        }
                    });
                },1000)
            },
            methods:{
                setTrace(node){
                    this.trace.nodes.push(node);
                },
                onSearch(){
                   
                    if(this.trace.nodes.length < 2){
                        this.$message("请选择节点！");
                        return false;
                    }
                    let term = {
                                pathType: this.pathType,
                                nodes: _.map(this.trace.nodes,(v)=>{
                                    return _.extend(_.omit(v,["cell"]),{ edgeProperty: _.omit(this.$refs[v.id][0].edge,["list","show"]) });
                                })
                            };
                    
                    let rtn = null;
                    let rows = [];
                    let cols = [];

                    try{

                        rtn = fsHandler.callFsJScript("/matrix/graph/paths-by-id.js",encodeURIComponent(JSON.stringify(term))).message.result.data[0].graph;

                        if(!_.isEmpty(rtn.paths)){
                            _.forEach(rtn.paths,function(v,index){
                                rows.push( _.merge({num:`路径${++index}`,class:"path"},v));
                            })
                            cols = _.concat([{data:"num",title:"序号"}],_.map(rtn.pathtags,function(v){ return {data:v,title:v}}));
                        }

                        _.extend(this.trace.paths, {rows: rows,  columns: cols});

                    } catch(err){
                        _.extend(this.trace.paths, {rows: rows,  columns: cols});
                    }
                    
                },
                onSelectionChange(val){
                    this.trace.selectedPaths = val;
                    inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.addPath(val);
                }
            }
        })
        // 图搜索面板
        Vue.component("topological-graph",{
            delimiters: ['#{', '}#'],
            template:  `<el-container>
                            <el-header style="height:100%;line-height:100%;padding:10px;display:flex;flex-direction: column;">
                                <div ref="topologicalAnalysisInputList" style="height:100%;">    
                                    <topological-analysis-input 
                                        v-for="item in _.uniqBy(trace.nodes,'id')" 
                                        :model="item" 
                                        :data-id="item.id" 
                                        :ref="item.id"
                                        style="height:100%;"></topological-analysis-input>
                                </div>
                                <topological-analysis-new-input></topological-analysis-new-input>
                            </el-header>
                            <el-footer style="padding:0px 10px;height:40px;line-height:40px;">
                                <el-tooltip content="图查询" open-delay="500" placement="top">
                                    <el-button type="primary" @click="onSearch" style="float:right;" icon="el-icon-search"></el-button>
                                </el-tooltip> 
                            </el-footer>
                        </el-container>`,
            data(){
                return {
                    trace: {
                        newItem: {
                            id: "",
                            type: "",
                            value: ""
                        },
                        nodes: [],
                        paths: {
                            rows: [], 
                            columns: []
                        },
                        selectedPaths: []
                    }
                }
            },
            created(){
                eventHub.$on("TOPOLOGICAL-ANALYISS-TRACE",this.setTrace);
            },
            mounted(){
                
                _.delay(()=>{
                    let sortable = Sortable.create(this.$refs.topologicalAnalysisInputList,{
                        handle: ".handleSort",
                        dataIdAttr: 'data-id',
                        onChange(evt) {
                            let nodes = _.cloneDeep(this.trace.nodes);
                            this.trace.nodes = _.map(sortable.toArray(),(v)=>{
                                return _.find(nodes,{id:v});
                            });
                        }
                    });
                },1000)
            },
            methods:{
                setTrace(node){
                    this.trace.nodes = [];
                    this.trace.nodes.push(node);
                },
                onSearch(){
                    if(this.trace.nodes.length < 1){
                        this.$message("请选择节点！");
                        return false;
                    }
                    let term = _.map(this.trace.nodes,(v)=>{
                        return _.extend(_.omit(v,["cell"]),{ edgeProperty: _.omit(this.$refs[v.id][0].edge,["list","show"]) });
                    });

                    let rtn = fsHandler.callFsJScript("/matrix/graph/graph-by-id.js",encodeURIComponent(JSON.stringify(term))).message;
                    
                    inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.graphData = rtn.result.data[0].graph;
                    inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.$refs.graphViewSearch.term = rtn.mql;
                    
                },
                onSelectionChange(val){
                    this.trace.selectedPaths = val;
                    inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.addPath(val);
                }
            }
        })
        
        Vue.component("topological-search-toolbar-path",{
            delimiters: ['#{', '}#'],
            data(){
                return {
                    type: 'all'
                }
            },
            template:   `<div>
                            <el-header style="height:32px;line-height:32px;padding:0px;display:flex;">
                                <el-button type="text" icon="el-icon-arrow-left"  @click="$parent.$parent.control.show=false" style="width:8%;"></el-button>
                                <div style="margin-top:-1px;width:84%;">
                                    <el-radio-group v-model="type">
                                        <el-radio-button label="all">全路径</el-radio-button>
                                        <el-radio-button label="short">最短路径</el-radio-button>
                                        <el-radio-button label="long">最长路径</el-radio-button>
                                        <el-radio-button label="">关键路径</el-radio-button>
                                    </el-radio-group>
                                </div>
                                <div>
                                    <el-divider direction="vertical" style="margin:0;"></el-divider>
                                </div>
                                <el-button type="default"
                                    @click="$parent.$parent.onToggleView('topological-search-toolbar-graph')" 
                                    style="width:8%;padding:0px;margin-left:-8px;">
                                    <i class="el-icon-close" style="font-size:14px;font-weight: 900;"></i>
                                </el-button>
                                <el-tooltip content="路劲查询" open-delay="500" placement="top">
                                    <el-button type="primary"
                                        @click="search"
                                        style="width: 40px;
                                                height: 34px;
                                                padding: 0px;
                                                position: absolute;
                                                right: -41px;
                                                top: -1px;">
                                        <i class="el-icon-search" style="font-size:14px;font-weight: 900;"></i>
                                    </el-button>
                                </el-tooltip>
                            </el-header>
                            <el-main ref="mainView" style="border-top:1px solid #419efe;padding:0px;width:30vw;">
                                <topological-path class="graphAction" :model="$parent.$parent.mainView.path.model" :pathType="type" ref="pathRef"></topological-path>
                            </el-main>
                            <el-footer style="height:30px;line-height:30px;padding:0 5px;color:#999;">
                                
                            </el-footer>
                        </div>`,
            methods:{
                search(){
                    this.$refs.pathRef.onSearch();
                }
            }
        })

        Vue.component("topological-search-toolbar-graph",{
            delimiters: ['#{', '}#'],
            data(){
                return {
                    search:{
                        term: "",
                        result: null,
                        selected: null
                    },
                    entity: {
                        list: [],
                        timeout:  null
                    },
                    file: {
                        show: false
                    }
                }
            },
            template:   `<div>
                            <el-header style="width:100%;display:flex;height:35px;line-height:35px;padding:0px 0px 0px 10px;">
                                <el-button type="text" icon="el-icon-arrow-left" @click="$parent.$parent.control.show=false"></el-button>
                                <el-input v-model="search.term" placeholder="搜索实体、活动关键字" style="width:100%;"
                                    @blur="onSearchEntity"
                                    @clear="onClear"
                                    @focus="file.show=false"
                                    @keyup.enter.native="onSearchEntity" 
                                    clearable
                                    autofocus>
                                    <template slot="prepend">
                                        <el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
                                            <el-tooltip content="选则实体类" open-delay="500">
                                                <el-button type="text" size="mini">
                                                    <i class="el-icon-office-building" style="font-size:16px;"></i>
                                                </el-button>
                                            </el-tooltip>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item>
                                                    <template scope="scope">
                                                        <mx-entity-tree root="/matrix/entity" ref="entityTree"></mx-entity-tree>
                                                    </template>
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </template>
                                </el-input>
                                <el-button type="default" @click="$parent.$parent.onToggleView('topological-search-toolbar-path')"  style="margin-left:-1px;">
                                    <el-image src="/fs/assets/images/tools/png/path-blue.png?type=open&issys=true" style="width:16px;"></el-image>
                                </el-button>
                                <el-button type="default" 
                                    @click="$parent.$parent.onToggleView('topological-search-toolbar-graphAdv')" style="margin-left:-1px;">
                                    高级
                                </el-button>
                                <el-button type="primary" 
                                    @click="onSearchEntity" 
                                    @focus.native="file.show=false"
                                    style="margin-left:-1px;">
                                    <i class="el-icon-search" style="font-weight: 900;font-size:14px;"></i>
                                </el-button>
                                <el-dropdown trigger="click">
                                    <span class="el-dropdown-link">
                                        <el-button type="text" icon="el-icon-folder-opened" style="font-weight: 900;font-size:14px;padding:10px;">
                                        </el-button>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item @click.native="$parent.$parent.onFileNew">新建</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.file.dialogOpen.visible=true" divided>打开</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.file.dialogOpenTo.visible=true">打开到</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onFileSave" divided>保存</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.file.dialogSaveAs.visible=true">另存为</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onSaveAsPdf">另存为PDF</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.classDataImport" divided  v-if="$parent.$parent.allow">导入</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.classDataExport('/matrix/entity')" v-if="$parent.$parent.allow">导出</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onFileDelete" divided>删除</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onFilePrint" divided>打印</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onFileClose" divided>关闭</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </el-header>
                            <el-main ref="fileView" style="width:30vw;height:40vh;padding:10px;border-top:1px solid #409EFF;" v-if="file.show">
                                
                            </el-main>
                            <el-main ref="mainView" style="width:30vw;height:40vh;padding:0px;border-top:1px solid #409EFF;" v-show="!_.isEmpty(search.result)" v-else>
                                <div class="div-hover-effect" style="display:flex;padding:10px;cursor:pointer;" 
                                    v-for="item in search.result"
                                    @click="onSelect(item)"
                                    draggable="true" 
                                    @dragstart="onDragStart(item,$event)"
                                    @dragend="onDragEnd($event)">
                                    <el-image :src="item | pickIcon" style="width:15%;height:15%;max-width:48px;min-width:48px;" slot="suffix"></el-image>
                                    <div style="height:48px;line-height:48px;width:80%;padding-left:10px;">#{ item.value }#</span></div>
                                    <el-tooltip content="拖动到画布" open-delay="500">
                                        <el-button type="text" icon="el-icon-menu" style="padding-left:10px;cursor:pointer;">
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip content="实体分析" open-delay="500">
                                        <el-button type="text" icon="el-icon-postcard" style="padding-left:10px;cursor:pointer;" @click="onDiagnosis(item)">
                                        </el-button>
                                    </el-tooltip>
                                </div>
                            </el-main>
                            <el-footer ref="footerView" style="width:30vw;padding:0px;border-top:1px solid #409EFF;height:auto;" v-if="!_.isEmpty(search.selected)">
                                <topological-graph class="graphAction" :model="$parent.$parent.mainView.search.model" ref="searchRef"></topological-graph>
                            </el-footer>
                        </div>`,
            filters: {
                pickIcon(item){
                    let icon = _.last(item.class.split("/"));
                    return `/fs/assets/images/entity/png/${icon}.png?type=open&issys=true`;
                }
            },
            watch: {
                'search.term':function(val,oldVal){
                    if(_.isEmpty(val)){
                        this.onClear();
                    }
                }
            },
            created(){
                eventHub.$on("MX-ENTITY-TREE-NODE", (data)=>{
                    this.search.term = data.alias;
                    this.onSearchEntity();
                });
            },
            methods: {
                onDragStart(item,event){
                    event.dataTransfer.setData("Text",JSON.stringify(item));
                },
                onDragEnd(event){
                    
                },
                onSearch(){
                    this.$refs.searchRef.onSearch();
                },
                onSelect(item){
                    
                    this.search.selected = item;

                    _.delay(()=>{
                        this.$refs.searchRef.setTrace(item);
                    },50)

                    // 定位cell
                    inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.onPosition(item.id);
                                        
                },
                onClear(){
                    this.search.selected = null;
                    this.search.result = null;
                },
                onSearchEntity() {
                    
                    try{
                        if(_.isEmpty(this.search.term)){
                            return false;
                        }
    
                        let entitys = fsHandler.callFsJScript("/matrix/graph/entity-search-by-term.js",encodeURIComponent(this.search.term)).message;
                        
                        if(_.isEmpty(entitys)){
                            this.$message({
                                type: "info",
                                message: "没有匹配数据！"
                            })

                            this.search.result = [];

                            return false;
                        }

                        this.search.result = entitys;

                        this.search.result = _.map(this.search.result,(v)=>{
                            return _.extend(v,{cell: {edge:false}});
                        })
                
                    } catch(err){
                        console.log(err)
                    }
                    
                },
                createStateFilter(term) {
                    return (state) => {
                      return (state.value.toLowerCase().indexOf(term.toLowerCase()) === 0);
                    };
                },
                onDiagnosis(node){
                    const self = this;

                    inst.app.$refs.graphDiagnosisRef.diagnosisAdd( node );
                }
            }
        })

        Vue.component("topological-search-toolbar-graphAdv",{
            delimiters: ['#{', '}#'],
            data(){
                return {
                    history: null
                }
            },
            template:   `<div style="height:100%;">
                            <el-header style="width:100%;display:flex;height:35px;line-height:35px;padding:0px 0px 0px 10px;">
                                <el-button type="text" icon="el-icon-arrow-left"  @click="$parent.$parent.control.show=false"></el-button>
                                <el-input placeholder="图查询语句" style="width:100%;" disabled></el-input>
                                <el-button type="default" @click="$parent.$parent.onToggleView('topological-search-toolbar-path')" style="margin-left:-1px;">
                                    <el-image src="/fs/assets/images/tools/png/path-blue.png?type=open&issys=true" style="width:16px;"></el-image>
                                </el-button>
                                <el-button type="default"
                                    @click="$parent.$parent.onToggleView('topological-search-toolbar-graph')" 
                                    style="margin-left:-1px;">
                                    <i class="el-icon-search" style="font-weight: 900;"></i>
                                </el-button>
                                <el-button type="primary" @click="onSearch('')" style="margin-left:-1px;">
                                    <i class="el-icon-search"></i> <span>高级</span>
                                </el-button>
                                <el-dropdown trigger="click">
                                    <span class="el-dropdown-link">
                                        <el-button type="text" icon="el-icon-folder-opened" style="font-weight: 900;font-size:14px;padding:10px;">
                                        </el-button>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item @click.native="$parent.$parent.onFileNew">新建</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.file.dialogOpen.visible=true" divided>打开</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.file.dialogOpenTo.visible=true">打开到</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onFileSave" divided>保存</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.file.dialogSaveAs.visible=true">另存为</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onSaveAsPdf">另存为PDF</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.classDataImport" divided v-if="$parent.$parent.allow">导入</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.classDataExport('/matrix/entity')" v-if="$parent.$parent.allow">导出</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onFileDelete" divided>删除</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onFilePrint" divided>打印</el-dropdown-item>
                                        <el-dropdown-item @click.native="$parent.$parent.onFileClose" divided>关闭</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </el-header>
                            <el-main ref="mainView" 
                                style="border-top:1px solid #409EFF;width:30vw;height:50vh;overflow:hidden;padding:0px 20px;">
                                <el-row style="padding: 20px 0;">
                                    <el-col :span="24">
                                        <el-input
                                            type="textarea" :rows="4"
                                            v-model="$parent.$parent.term"
                                            placeholder="图搜索"
                                            @clear="$parent.$parent.onClear"
                                            @keyup.enter.native="onSearch('')" 
                                            style="width:100%;"
                                            clearable
                                            ref="graphSearch">
                                        </el-input>
                                    </el-col>
                                </el-row>
                                <el-divider content-position="left">历史</el-divider>
                                <el-row style="height: calc(100% - 130px);overflow: auto;margin-top: 10px;">
                                    <el-col :span="24" v-for="item in history" style="display:flex;flex-wrap:nowrap;">
                                        <el-popover
                                            placement="top-start"
                                            width="200"
                                            trigger="hover"
                                            :content="item.value"
                                            open-delay="1000"
                                            style="width:90%;">
                                            <el-button slot="reference" @click="onSearch(item.value)" style="margin-top:5px;color:#777;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:100%;text-align:left;">
                                                #{item.value}#
                                            </el-button>
                                        </el-popover>
                                        <span style="width:10%;">
                                            <el-tooltip content="设置为默认图例" open-delay="500">
                                                <el-button
                                                    type="text"
                                                    icon="el-icon-s-platform"
                                                    style="width:15%;text-align:right;color:#999;"
                                                    @click="onSetDefault(item)">
                                                </el-button>
                                            </el-tooltip>
                                            <el-tooltip content="删除历史" open-delay="500">
                                                <el-button
                                                    type="text"
                                                    icon="el-icon-close"
                                                    style="width:15%;text-align:right;color:#999;"
                                                    @click="onDeleteHistory(item)">
                                                </el-button>
                                            </el-tooltip>
                                        </span>
                                    </el-col>
                                </el-row>
                                
                            </el-main>
                            <el-footer style="height:30px;line-height:30px;padding:0 5px;color:#999999;">
                                <el-button type="text" icon="el-icon-delete" @click="onDeleteAllHistory">清空历史</el-button>
                                <el-button type="text" icon="el-icon-s-platform" @click="onSetDefault({value:''})">取消默认图例</el-button>
                            </el-footer>
                        </div>`,
            created(){
                this.loadHistory();
            },
            methods: {
                loadHistory(){
                    try{
                        this.history = fsHandler.callFsJScript("/matrix/graph/loadConfig.js","history").message;
                    } catch(err){

                    }
                },
                onSearch(term){
                    if(_.isEmpty(term)){
                        this.$parent.$parent.search();
                    } else {
                        this.$parent.$parent.term = term;
                        this.$parent.$parent.search();
                    }
                },
                onSetDefault(item){
                    let term = {key: "topological.default.match", value:item.value };
                    let rtn = fsHandler.callFsJScript("/matrix/system/global-update.js",encodeURIComponent(JSON.stringify(term)));
                    if(rtn.status=='ok'){
                        this.$message({
                            type: "success",
                            message: "已设为默认图例"
                        })
                    }
                },
                onDeleteHistory(item){
                    try{
                        let term = _.extend(item, {action:"delete"});
                        fsHandler.callFsJScript("/matrix/graph/history-action.js",encodeURIComponent(JSON.stringify(term))).message;
                    }catch(err){

                    } finally{
                        this.loadHistory();
                    }
                },
                onDeleteAllHistory(){
                    try{
                        _.forEach(this.history,(v)=>{
                            let term = _.extend(v, {action:"delete"});
                            fsHandler.callFsJScript("/matrix/graph/history-action.js",encodeURIComponent(JSON.stringify(term))).message;
                        })
                    }catch(err){

                    } finally{
                        this.loadHistory();
                    }
                }
            }
        })

        // 拓扑分析搜索框 newest!
        Vue.component("topological-search-toolbar",{
            delimiters: ['${', '}'],
            template:   `<el-container style="height:100%;">
                            <el-button type="text" icon="el-icon-arrow-right" @click="control.show=!control.show" v-show="control.show==false" style="width:30px;"></el-button>
                            <component v-bind:is="currentView" class="animated fadeIn" v-show="control.show==true"></component>
                            <!-- 打开窗口 -->
                            <el-dialog :title="file.dialogOpen.title" 
                                    :visible.sync="file.dialogOpen.visible"
                                    modal="false">
                                <mx-fs-open dfsRoot="/home/admin/Documents/graph" ref="dfsOpen" v-if="file.dialogOpen.visible"></mx-fs-open>
                                <div slot="footer" class="dialog-footer">
                                    <el-button @click="file.dialogOpen.visible = false">取 消</el-button>
                                    <el-button type="primary" @click="onFileOpen(false)">打 开</el-button>
                                </div>
                            </el-dialog>
                            <!-- 打开到窗口 -->
                            <el-dialog :title="file.dialogOpenTo.title" :visible.sync="file.dialogOpenTo.visible">
                                <mx-fs-open dfsRoot="/home/admin/Documents/graph" ref="dfsOpen" v-if="file.dialogOpenTo.visible"></mx-fs-open>
                                <div slot="footer" class="dialog-footer">
                                    <el-button @click="file.dialogOpenTo.visible = false">取 消</el-button>
                                    <el-button type="primary" @click="onFileOpenTo(false)">打 开 到</el-button>
                                </div>
                            </el-dialog>
                            <!-- 保存窗口 -->
                            <el-dialog :title="file.dialogSaveAs.title" :visible.sync="file.dialogSaveAs.visible">
                                <mx-fs-saveas dfsRoot="/home/admin/Documents/graph" ftype="imap" ref="dfsSaveas"></mx-fs-saveas>
                                <div slot="footer" class="dialog-footer">
                                    <el-button @click="file.dialogSaveAs.visible = false">取 消</el-button>
                                    <el-button type="primary" @click="onFileSaveAs">保存</el-button>
                                </div>
                            </el-dialog>
                        </el-container>`,
            data(){
                return{
                    value: "",
                    terms: [],
                    term: "",
                    defaultTitle: {
                        title: "name",
                        list: null
                    },
                    mainView: {
                        path: {
                            model: {}
                        },
                        search: {
                            model: {}
                        }
                    },
                    currentView: "topological-search-toolbar-graph",
                    control: {
                        path:{
                            show:false
                        },
                        graph:{
                            show:false
                        },
                        show: true
                    },
                    file: {
                        doc:null,
                        dialogOpen:{
                            title: "打开",
                            content: "",
                            visible: false
                        },
                        dialogOpenTo:{
                            title: "打开到",
                            content: "",
                            visible: false
                        },
                        dialogSaveAs:{
                            title: "另存为",
                            content: "",
                            visible: false
                        }
                    },
                    allow: mx.allow()
                }
            },
            created(){
                
                // 更新选择列表
                eventHub.$on("GRAPH-VIEW-SEARCH-UPDATE-EVENT", term => {
                    this.term = _.trim(term);
                });

                // 初始化图搜索脚本
                this.terms = _.union(inst.graphScript, this.loadDefaultTerm());
                // 默认选择第一条
                this.term = _.first(this.terms).value;

                // url传入搜索脚本进行搜索
                let term = null;
                try {
                    term = decodeURIComponent(window.atob(mx.urlParams['term'] || ''));
                    if(term){
                        this.term = term;
                    }
                } catch(err){
                }
                
            },
            mounted(){
                this.search();
            },
            methods:{
                onToggleView(view){
                    this.currentView = view;
                },
                search(){
                    this.$root.$refs.graphViewRef.search( encodeURIComponent(this.term) );

                    //加入搜索历史
                    this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.history.push({id:objectHash.sha1(this.term), term:this.term, time: _.now()});
                    
                    _.delay(()=>{
                        _.extend(this.defaultTitle, this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.default);
                    },1500)
                },
                loadHistory(){
                    return fsHandler.callFsJScript("/matrix/graph/loadConfig.js","history").message;
                },
                onFetchSuggestions(queryString, cb) {
                    var terms = this.loadHistory();
                    var results = queryString ? terms.filter(this.createFilter(queryString)) : terms;
                    // 调用 callback 返回建议列表的数据
                    cb(results);
                },
                createFilter(queryString) {
                    return (term) => {
                      return (term.value.indexOf(queryString) === 0);
                    };
                },
                loadDefaultTerm() {
                    let step = !_.isEmpty(this.step)?this.step:'';
                    return [
                            { value: mx.global.register.topological.default.match},
                        ];
                },
                onPath(){
                    this.control.path.show = !this.control.path.show;
                },
                onActionChange(val){
                    if(val == 'path'){
                        this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.path();
                    } else if(val == 'edit'){
                        this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.editIt();
                    } else if(val == 'saveas'){
                        this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.saveas();
                    } else {
                        this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.newNode();
                    }
                    
                },
                onNodeTitleChange(val){
                    this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.default.title = val;
                    this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.reload();
                },
                onSelect(item) {
                    this.term = item.value;
                    this.search();
                },
                onClear(item) {
                    this.term = "";
                    this.search();
                },
                onFileNew(){
                    this.deleteCells(true);
                    this.file.doc = null;
                },
                onFileOpen(auto){
                    try{
                        
                        let editor = inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.model.editor;

                        // 选择文件打开
                        if(!auto){
                            this.file.doc = this.$refs.dfsOpen.node;
                        }
                        
                        let xml = fsHandler.fsContent(this.file.doc.parent, this.file.doc.name);
                        let doc = mxUtils.parseXml(xml);
                        let codec = new mxCodec(doc);
                        codec.decode(doc.documentElement, editor.graph.getModel());
                    } catch(err){
                        console.error(err);
                    } finally {
                        this.file.dialogOpen.visible = false;
                        inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.toCenter();
                    }
                    
                },
                onFileOpenTo(auto){
                    // 新建图
                    let graph = new mxGraph();
                    let parent = graph.getDefaultParent();
                    
                    try{
                        
                        

                        // 选择文件打开
                        if(!auto){
                            this.file.doc = this.$refs.dfsOpen.node;
                        }
                        
                        let xml = fsHandler.fsContent(this.file.doc.parent, this.file.doc.name);
                        let doc = mxUtils.parseXml(xml);
                        let codec = new mxCodec(doc);
                        codec.decode(doc.documentElement, graph.getModel());

                        // 合并到当前图
                        let editor = inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.model.editor;
                        editor.graph.getModel().mergeChildren(graph.getModel().getRoot().getChildAt(0), editor.graph.getDefaultParent());

                        // Executes the layout handler
                        _.delay(()=>{
                            inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.executeLayout();
                        },500)
                    } catch(err){
                        console.error(err);
                    } finally {
                        this.file.dialogOpenTo.visible = false;
                    }
                    
                },
                onFileSave(){
                    if(this.file.doc){
                        let editor = inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.model.editor;
                        let enc = new mxCodec(mxUtils.createXmlDocument());
                        let node = enc.encode(editor.graph.getModel());
                        let xml = mxUtils.getPrettyXml(node);
                        let attr = _.extend(this.file.doc, {});
                        let rtn = fsHandler.fsNew('file',this.file.doc.parent, this.file.doc.name, xml, attr);
                        if(rtn == 1){
                            this.$message({
                                type:"success",
                                message: "保存成功！"
                            })
                        }
                    } else {
                        this.file.dialogSaveAs.visible = true;
                    }
                },
                onFileSaveAs(){
                    
                    let editor = inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.model.editor;

                    let enc = new mxCodec(mxUtils.createXmlDocument());
                    let node = enc.encode(editor.graph.getModel());
                    let xml = mxUtils.getPrettyXml(node);
                    let attr = {};
                    
                    let parent = this.$refs.dfsSaveas.node.fullname;
                    let name = this.$refs.dfsSaveas.fileName;
                    let rtn = fsHandler.fsNew('file',parent, name, xml, attr);
                    if(rtn == 1){
                        this.$message({
                            type:"success",
                            message: "保存成功！"
                        })
                        
                        this.file.doc = {parent:parent, name:name, fullname: [parent,name].join("/")};
                    }
    
                    this.file.dialogSaveAs.visible = false;
                },
                onSaveAsPdf(){
                    mxUtils.printScreen(inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.model.editor.graph);
                },
                onFileClose(){
                    this.deleteCells(true);
                    this.file.doc = null;
                },
                onFilePrint(){
                    inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.model.editor.execute('print');
                },
                onFileDelete(){
                    if(this.file.doc){
    
                        this.$confirm(`确认要删除该设计文档：${this.file.doc.name}？`, '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            let rtn = fsHandler.fsDelete(this.file.doc.parent,this.file.doc.name);
        
                            if (rtn == 1){
                                this.$message({
                                    type: "success",
                                    message: "删除成功！"
                                });
                                this.deleteCells(true);
                                this.file.doc = null;
                                localStorage.setItem("CLASS-DESIGN-OPEN-FILE",'');
                                this.summaryInfo();
                            } else {
                                this.$message({
                                    type: "error",
                                    message: "删除失败 " + rtn.message
                                })
                            } 
                        }).catch(() => {
                            
                        });
                    }
                },
                deleteCells(includeEdges){
                    
                    // Cancels interactive operations
                    let editor = inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.model.editor;
                    let graph = editor.graph;
                    graph.escape();
                    //var cells = graph.getDeletableCells(graph.getSelectionCells());
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
                classDataExport(selectedNode){
                    const me = this;
                    let wnd = null;

                    try{
                        if(jsPanel.activePanels.getPanel('jsPanel-class-template')){
                            jsPanel.activePanels.getPanel('jsPanel-class-template').close();
                        }
                    } catch(error){

                    }
                    finally{
                        wnd = maxWindow.winClassTemplate('导出数据结构', `<div id="class-template-export"></div>`, null, null, null);
                    }

                    new Vue({
                        delimiters: ['#{', '}#'],
                        data:{
                            classList: fsHandler.callFsJScript("/matrix/omdb/getClassListForTree.js",encodeURIComponent(selectedNode)).message,
                            defaultProps: {
                                children: 'children',
                                label: 'class'
                            },
                            model: {
                                ifData: false, 
                                ifAllData: false,
                                limit: 10,
                                recursive: true,
                                filetype: 'mql',
                                template: true,
                                class: '',
                                ignoreClass: '/matrix/filesystem'
                            }
                        },
                        watch: {
                            'model.ifData':function(val,oldVal){
                                if(!val){
                                    this.model.limit = 0;
                                }
                            },
                            'model.ifAllData':function(val,oldVal){
                                if(val){
                                    this.model.limit = -1;
                                }
                            }
                        },
                        template: `<el-container style="height:100%;">
                                        <el-header style="height:auto;line-height:40px;min-height:40px;background: #f2f3f5;">
                                            <el-checkbox v-model="model.ifData" label="导出数据"></el-checkbox>
                                            <p v-if="model.ifData">
                                                <el-radio-group v-model="model.ifAllData">
                                                    <el-radio :label="true" border>导出所有数据</el-radio>
                                                    <el-radio :label="false" border>导出部分数据</el-radio>
                                                </el-radio-group>
                                                <el-input-number v-model="model.limit" v-if="!model.ifAllData && model.ifData != -1" style="width:30%;margin-left:10px;"></el-input-number>  
                                            </p>
                                        </el-header>
                                        <el-main style="padding:10px;">
                                            <el-tree
                                                :data="classList"
                                                ref="classTree"
                                                show-checkbox
                                                node-key="class"
                                                check-strictly="true"
                                                :default-expanded-keys="[_.first(classList).id]"
                                                :default-expanded-keys="[model.class]"
                                                :props="defaultProps"
                                                check-on-click-node="true"
                                                style="background-color:transparent;">
                                            </el-tree>
                                        </el-main>
                                        <el-footer style="line-height:60px;text-align:center;">
                                            <el-button type="default" @click="onCancel">取消</el-button>
                                            <el-button type="primary" @click="onExport('mql')">导出MQL</el-button>
                                            <el-button type="primary" @click="onExport('xlsx')">导出Excel</el-button>
                                        </el-footer>
                                    </el-container>`,
                        created(){
                            if(!_.isEmpty(selectedNode)){
                                this.model.class = selectedNode;
                            }
                        },
                        mounted(){
                            let allNodes = fsHandler.callFsJScript("/matrix/omdb/getClassList.js",encodeURIComponent(this.model.class)).message;
                            this.$refs.classTree.setCheckedKeys(allNodes);
                        },
                        methods:{
                            onCancel(){
                                wnd.close();
                            },
                            onExport(type){

                                this.model.filetype = type;

                                //获取所有Class
                                let allNodes = fsHandler.callFsJScript("/matrix/omdb/getClassList.js",encodeURIComponent(this.model.class)).message;
                                //checked Class
                                let checkedClass = _.map(this.$refs.classTree.getCheckedNodes(),'class');
                                
                                // 交集
                                _.extend(this.model, {ignoreClass: _.concat(this.model.ignoreClass,_.xor(allNodes,checkedClass)) } );

                                if(this.model.ifData){
                                    //this.model.limit = -1;
                                    this.model.template = false;
                                } else {
                                    this.model.template = true;
                                   // this.model.limit = 0;
                                }
                                let rtn = omdbHandler.classDataExport(this.model);
                                this.$message({
                                    type: "info",
                                    message: "导出操作将提交至后台，请稍后。。。"
                                })
                                if(rtn == 1){
                                    wnd.close();
                                }
                            }
                        }
                    }).$mount("#class-template-export");
                },
                classDataImport(){
                    const me = this;
                    let wnd = null;

                    try{
                        if(jsPanel.activePanels.getPanel('jsPanel-class-template')){
                            jsPanel.activePanels.getPanel('jsPanel-class-template').close();
                        }
                    } catch(error){

                    }
                    finally{
                        wnd = maxWindow.winClassTemplate('导入数据结构', `<div id="class-template-import"></div>`, null, null, null);
                    }

                    new Vue({
                        delimiters: ['#{', '}#'],
                        data:{
                            fileList: [],
                            rtnInfo: null
                        },
                        template: `<el-container style="height:100%;">
                                        <el-main style="padding:10px;">
                                            <div v-if="!_.isEmpty(rtnInfo)">
                                                <el-button type="text" icon="el-icon-close" @click="clearInfo"></el-button>
                                                <section>
                                                    <code>#{rtnInfo.message.join(",")}#</code>
                                                </section>
                                            </div>
                                            <el-upload
                                                class="upload-demo"
                                                drag
                                                :auto-upload="false"
                                                :on-change="onChange"
                                                :file-list="fileList"
                                                v-else>
                                                <i class="el-icon-upload"></i>
                                                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                                                <div class="el-upload__tip" slot="tip">只能上传Mql/Excel文件</div>
                                            </el-upload>
                                        </el-main>
                                        <el-footer style="line-height:60px;text-align:center;">
                                            <el-button type="default" @click="onCancel">取消</el-button>
                                            <el-button type="primary" @click="onImport">导入</el-button>
                                        </el-footer>
                                    </el-container>`,
                        methods:{
                            onChange(file) {
                                this.fileList = [file.raw];
                            },
                            onCancel(){
                                wnd.close();
                            },
                            onImport(){
                                this.rtnInfo = JSON.parse(omdbHandler.classDataImport(this.fileList[0]));
                                this.$message({
                                    type: "info",
                                    message: "导入操作将提交至后台，请稍后。。。"
                                })
                            },
                            clearInfo(){
                                this.rtnInfo = null;
                            }
                        }
                    }).$mount("#class-template-import");
                }
            }
        })

        // 实体管理
        Vue.component("graph-view-manager",{
            delimiters: ['${', '}'],
            props: {
                id: String
            },
            template: ` <div style="display:flex;">
                            <el-tooltip content="新增实体" open-delay="500">
                                <a href="javascript:void(0);" class="btn btn-link" disabled><i class="fas fa-plus"></i></a>
                            </el-tooltip>  
                            <el-tooltip content="删除实体" open-delay="500">
                                <a href="javascript:void(0);" class="btn btn-link" disabled><i class="fas fa-minus"></i></a>
                            </el-tooltip>    
                        </div>`,
            data(){
                return{
                    
                }
            },
            mounted(){
                
            },
            methods:{
                
            }
        })

        // 实体分析 - Form类型
        Vue.component("entity-diagnosis-form",{
            delimiters: ['#{', '}#'],
            props: {
                model:Object
            },
            data(){
                return {
                    edges: {
                        value: "",
                        list: fsHandler.callFsJScript("/matrix/graph/edges.js",null).message
                    }
                }
            },
            template:   `<el-card :body-style="{ padding: '10px' }" v-show="model.rows.length">
                            <el-image style="width: 100px; height: 100px" :src="model | pickIcon" fit="scale-down" @error="onErrorPickIcon"></el-image>
                            <el-form label-position="left" label-width="80px" class="form-no-border">
                                <el-form-item :label="key" v-for="(value,key) in model.rows[0]" style="margin-bottom: 10px;">
                                    <el-select v-model="value" placeholder="选择关系类型" @change="onEdgeChange" v-if="key==='value'">
                                        <el-option v-for="item in edges.list" 
                                            :key="item.name"
                                            :value="item.name"
                                            :label="item.remedy"></el-option>
                                    </el-select>
                                    <el-input type="text" :value="value"  v-else></el-input>
                                </el-form-item>
                            </el-form>
                        </el-card>`,
            filters: {
                pickIcon(evt){
                    try {
                        return `/fs/assets/images/entity/png/${_.last(evt.rows[0].class.split("/"))}.png?issys=true&type=download`;
                    } catch(err){
                        return `/fs/assets/images/entity/png/matrix.png?issys=true&type=download`;
                    }
                    
                }
            },
            created(){
                this.edges.value = this.model.rows[0].type;
            },
            methods:{
                onErrorPickIcon(e){
                    _.extend(this.model.rows[0],{class:"/matrix"});
                },
                onEdgeChange(value){
                    let id = this.model.rows[0].id;
                    let oldValue = this.model.rows[0].value;
                    inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.updateEntityEdgeTypeHandler(id,value,oldValue);
                }
            }
        });

        // 实体分析 - List类型
        Vue.component("entity-diagnosis-list",{
            delimiters: ['#{', '}#'],
            props: {
                model: Object
            },
            data(){
                return {
                    
                }
            },
            computed:{
                metaColumns(){
                    try{
                        return this.model.columns;
                    } catch(err){
                        return [];
                    }
                }
            },
            template:   `<el-container style="height: calc(100vh - 140px);">
                            <el-main style="padding:10px;">
                                <el-card v-for="item in model.rows" :key="item.id"
                                    v-if="model.rows"
                                    style="background: linear-gradient(to top, rgba(247,247,247, 1), rgb(255, 255, 255));
                                        border: 1px solid rgb(247, 247, 247);
                                        border-radius: 5px;
                                        box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
                                        line-height: 1.5;">
                                    <el-form label-position="right" label-width="120px">
                                        <el-form-item v-for="v,k in item" :label="k,metaColumns | pickTitle" :key="k">
                                            <el-input :type="k,metaColumns | pickType" :value="moment(v).format(mx.global.register.format)"  v-if="pickFtype(k) == 'timestamp'"></el-input>
                                            <el-input :type="k,metaColumns | pickType" :value="moment(v).format('YYYY-MM-DD')"  v-else-if="pickFtype(k) == 'date'"></el-input>
                                            <el-input :type="k,metaColumns | pickType" :rows="6" :value="arrayToCsv(v)"  v-else-if="pickFtype(k) == 'bucket'"></el-input>
                                            <el-input :type="k,metaColumns | pickType" :rows="6" :value="JSON.stringify(v,null,4)"  v-else-if="_.includes(['map','set','list'],pickFtype(k))"></el-input>
                                            <el-input :type="k,metaColumns | pickType" :value="v"  v-else></el-input>
                                        </el-form-item>
                                    </el-form>
                                </el-card>
                                <el-divider><i class="el-icon-arrow-down"></i></el-divider>
                            </el-main>
                        </el-container>`,
            filters: {
                pickTitle(key,columns){
                    
                    try{
                        return _.find(columns,{name:key}).title;
                    } catch(err){
                        return key;
                    }

                },
                pickType(key,columns){
                    let rtn = 'text';
                    try{
                        let type = _.find(columns,{name:key}).type;
                        if(_.includes(['map','list','set','bucket'],type)){
                            rtn = 'textarea';
                        }
                    } catch(err){
                        rtn = 'input';
                    }

                    return rtn;
                }
            },
            methods: {
                pickFtype(key){
                            
                    let rtn = 'string';
                    try{
                        rtn = _.find(this.metaColumns,{name:key}).type;
                    } catch(err){
                        return rtn;
                    }
                    return rtn;
                }
            }
        })

        // 实体分析-详情
        Vue.component("entity-diagnosis-profile",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model:Object
            },
            data(){
                return {
                    edges: {
                        value: "",
                        list: fsHandler.callFsJScript("/matrix/graph/edges.js",null).message
                    }
                }
            },
            template:   `<el-card :body-style="{ padding: '10px' }" v-show="model.rows.length">
                            <el-image style="width: 100px; height: 100px" :src="model | pickIcon" fit="scale-down" @error="onErrorPickIcon"></el-image>
                            <el-form label-position="left" label-width="80px" class="form-no-border">
                                <el-form-item :label="key" v-for="(value,key) in model.rows[0]" style="margin-bottom: 10px;">
                                    <el-select v-model="value" placeholder="选择关系类型" @change="onEdgeChange" v-if="key==='value'">
                                        <el-option v-for="item in edges.list" 
                                            :key="item.name"
                                            :value="item.name"
                                            :label="item.remedy"></el-option>
                                    </el-select>
                                    <el-input type="text" :placeholder="key" :value="value" disabled v-else></el-input>
                                </el-form-item>
                            </el-form>
                        </el-card>`,
            filters: {
                pickIcon(evt){
                    try {
                        return `/fs/assets/images/entity/png/${_.last(evt.rows[0].class.split("/"))}.png?issys=true&type=download`;
                    } catch(err){
                        return `/fs/assets/images/entity/png/matrix.png?issys=true&type=download`;
                    }
                    
                }
            },
            created(){
                this.edges.value = this.model.rows[0].type;
            },
            methods:{
                onErrorPickIcon(e){
                    _.extend(this.model.rows[0],{class:"/matrix"});
                },
                onEdgeChange(value){
                    let id = this.model.rows[0].id;
                    let oldValue = this.model.rows[0].value;
                    inst.app.$refs.graphViewRef.$refs.graphViewContainerInst.updateEntityEdgeTypeHandler(id,value,oldValue);
                }
            }
        });

        // 实体事件
        Vue.component("entity-diagnosis-alert",{
            delimiters: ['#{', '}#'],
            props: {
                model: Object
            },
            data(){
                return {
                    result: null,
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
                        // 指定类
                        class: "#/matrix/devops/alert/:",
                        // 指定api
                        api: {parent: "event",name: "event_list.js"},
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
            template:   `<el-container style="height: calc(100vh - 120px);">
                            <el-header style="height: 42px;line-height: 42px;margin: 10px;padding: 0px 1px;background: #ddd;">
                                <search-base-component :options="options" ref="searchRef" class="grid-content"></search-base-component>
                            </el-header>
                            <el-main style="padding:10px;">
                                <!--form-card-component 
                                    :term="item.id" cHeight="20" style="width:auto;height:auto;"
                                    v-for="item in result.rows" :key="item.id"
                                    v-if="result.rows">></form-card-componetn-->
                                <el-card :style="item | pickBgStyle" 
                                    v-for="item in result.rows" :key="item.id"
                                    v-if="result.rows">
                                    <span class="el-icon-warning" :style="item | pickStyle"></span>
                                    <p>服务器:#{item.host}#</p>
                                    <p>IP地址:#{item.ip}#</p>
                                    <p>告警时间：#{moment(item.vtime).format("LLL")}#</p>
                                    <p>告警内容：#{item.msg}#</p>
                                    <el-button type="text" @click="onClick(item)">详细</el-button>
                                </el-card>
                            </el-main>
                        </el-container>`,
            filters: {
                pickBgStyle(item){
                    let hexToRgba = function(hex, opacity) {
                        var RGBA = "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt( "0x" + hex.slice(5, 7)) + "," + opacity + ")";
                        return {
                            red: parseInt("0x" + hex.slice(1, 3)),
                            green: parseInt("0x" + hex.slice(3, 5)),
                            blue: parseInt("0x" + hex.slice(5, 7)),
                            rgba: RGBA
                        }
                    };
                    let rgbaColor = hexToRgba(mx.global.register.event.severity[item.severity][2],0.1).rgba;
                    return `background:linear-gradient(to top, ${rgbaColor}, rgb(255,255,255));border: 1px solid rgb(247, 247, 247);border-radius: 5px;box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;line-height:1.5;`;
                },
                pickStyle(item) {
                    return `color:${mx.global.register.event.severity[item.severity][2]};font-size:40px;float:right;`;
                }
            },
            created(){
                this.result = this.model;
            },
            mounted(){
                // watch数据更新
                this.$watch(
                    "$refs.searchRef.result",(val, oldVal) => {
                        this.setData();
                    }
                );
            },
            methods: {
                onClick(item){
                    let term = item.id;
                    let url = `/matrix/event?term=${window.btoa(encodeURIComponent(term))}`;
                    window.open(url,'_blank');
                },
                setData(){
                    if(_.isEmpty(this.$refs.searchRef.options.term)){
                        this.$set(this.result,'rows',[]);    
                    } else {
                        this.result = this.$refs.searchRef.result;
                    }
                }
            }
        })

        // 实体日志
        Vue.component("entity-diagnosis-log",{
            delimiters: ['#{', '}#'],
            props: {
                model: Object,
                entity: Object
            },
            data(){
                return {
                    editor:null,
                    dt:{
                        rows: [],
                        selected: []
                    },
                    options: {
                        entity: "",
                        // 搜索窗口
                        window: { name:"所有", value: [moment().add(-1,'hour').format('YYYY-MM-DD HH:mm'),moment().format('YYYY-MM-DD HH:mm')]},
                        // 输入
                        term: "",
                        // 指定类
                        class: "",
                        // 指定api
                        api: {parent: "log",name: "searchLogByTerm.js"},
                        files:{
                            value: [],
                            list: []
                        },
                        pagination: {
                            offset: 1,
                            limit: 10,
                            total: 0
                        }
                    },
                    fileTree:{
                        value: [],
                        data:[],
                        defaultProps: {
                            children: 'children',
                            label: 'label'
                        }
                    },
                    control: {
                        ifFullScreen:false,
                        ifTable: true
                    }
                }
            },
            template:   `<el-container style="height: calc(100vh - 130px);">
                            <el-header style="height: 42px;line-height: 42px;margin: 10px;padding: 0px 1px;background: #ddd;">
                                <search-log-component :options="options" ref="searchRef" class="grid-content"></search-log-component>
                            </el-header>
                            <el-main style="margin:0 10px;padding:0px;width:96%;height:100%;border:1px solid #dddddd;" ref="main">
                                <el-container style="height:100%;width:100%;">
                                    <el-header style="height:41px;line-height:41px;background:#ffffff;text-align:right;border-bottom: 1px solid #ddd;display:flex;padding:0 5px;">
                                        <span style="width:25%;text-align:left;color:#999999;">#{options.window.value | pickTimeRange}#</span>
                                        <span style="width:75%;">
                                            <el-select 
                                                v-model="options.files.value" 
                                                multiple
                                                collapse-tags
                                                style="margin-left: 20px;"
                                                placeholder="请选择日志文件"
                                                @change="onFileChange">
                                                <el-option
                                                    v-for="item in options.files.list"
                                                    :key="item.label"
                                                    :label="item.label"
                                                    :value="item.label">
                                                </el-option>
                                            </el-select>
                                            <el-tooltip content="切换视图" open-delay="500" placement="top-start">
                                                <el-button type="text" :icon="control.ifTable | pickShowStyle" 
                                                            @click="control.ifTable = !control.ifTable" style="width:18px;height:auto;">
                                                </el-button>
                                            </el-tooltip>
                                            <el-tooltip content="全屏显示" open-delay="500" placement="top-start">
                                                <el-button type="text" :icon="control.ifFullScreen | pickScreenStyle" 
                                                            @click="onFullScreen" style="width:18px;height:auto;">
                                                </el-button>
                                            </el-tooltip>
                                        </span>
                                    </el-header>
                                    <el-main style="padding:0px;height:100%;overflow:hidden;">
                                        <el-container style="height:100%;" v-show="!control.ifTable">
                                            <el-container style="width:100%;height:100%;">
                                                <el-main style="padding:0px;width:100%;height:100%;" ref="editor"></el-main>
                                            </el-container>
                                        </el-container>
                                        <el-container style="height:100%;" v-show="control.ifTable">
                                            <el-main style="padding:0px;width:100%;height:100%;overflow:hidden;">
                                                <el-table
                                                    :data="dt.rows"
                                                    highlight-current-row
                                                    style="width: 100%"
                                                    class="table">
                                                    <el-table-column
                                                        prop="time"
                                                        label="时间戳"
                                                        width="92">
                                                    </el-table-column>
                                                    <el-table-column
                                                        prop="msg"
                                                        label="事件">
                                                        <template slot-scope="scope">
                                                            <div style="color:rgba(0,0,0,0.5)">#{scope.row.file}#</div>
                                                            <div v-html='markByTerm(scope.row.msg)'></div>
                                                        </template>
                                                    </el-table-column>
                                                    <el-table-column
                                                        align="left"
                                                        width="55">
                                                        <template slot-scope="scope">
                                                            <el-tooltip content="查看上下文" open-delay="500" placement="top-start">
                                                                <el-button type="text" icon="el-icon-tickets"></el-button>
                                                            </el-tooltip>
                                                        </template>
                                                    </el-table-column>
                                                </el-table>
                                                </template>
                                            </el-main>
                                            <el-footer style="height:30px;line-height:30px;">
                                                <div class="block">
                                                    <el-pagination
                                                        @size-change="onSizeChange"
                                                        @current-change="onCurrentChange"
                                                        :current-page.sync="options.pagination.offset"
                                                        :page-sizes="[10, 20, 30, 50]"
                                                        :page-size="options.pagination.limit"
                                                        layout="total, prev, pager, next, sizes"
                                                        :total="options.pagination.total">
                                                    </el-pagination>
                                                </div>
                                            </el-footer>
                                        </el-container>
                                    </el-main>
                                </el-container>
                            </el-main>
                        </el-container>`,
            filters: {
                pickScreenStyle(evt){
                    if(evt){
                        return `el-icon-full-screen`;
                    } else {
                        return `el-icon-copy-document`;
                    }
                },
                pickShowStyle(evt){
                    if(evt){
                        return `el-icon-s-grid`;
                    } else {
                        return `el-icon-tickets`;
                    }
                },
                pickTimeRange(evt){
                    try{
                        return [moment(evt[0]).format('YYYY-MM-DD HH:mm:ss'),moment(evt[1]).format('YYYY-MM-DD HH:mm:ss')].join(" - ");
                    } catch(err){
                        return "";
                    }
                }
            },
            watch:{
                'options.pagination.total'(val,oldVal){
                    //重新搜索后，定位到第一页
                    this.$set(this.options.pagination, 'offset', 1);
                    this.$refs.searchRef.search();
                }
            },
            created(){
                this.$set(this.options,'entity',this.entity.id);
            },
            mounted(){
                this.$nextTick(()=>{
                    
                    this.init();

                    // 首次搜索
                    // this.$refs.searchRef.search();

                    // watch数据更新
                    this.$watch(
                        "$refs.searchRef.result",(val, oldVal) => {
                            this.onSetData(val);
                        }
                    );
                })
            },
            methods: {
                markByTerm(str){
                    let finalStr = str;
                    let term = this.options.term.split(",");
                    
                    _.forEach(term,(v)=>{
                        
                        if(_.isEmpty(v)) return;

                        let reg = new RegExp(v, 'gim');
                        finalStr = finalStr.replace(reg, function(s){ return '<mark style="padding:3px;">'+s+'</mark>'; });
                    })

                    return finalStr;
                },
                arrayToJson(data){
                    
                    this.$set(this.dt,'rows',[]);

                    _.forEach(data, (v, index)=> {
                        
                        let valid = (new Date(v[0])).getTime() > 0;
                        let time = "";

                        if(valid){
                            time = moment(v[0]).format(mx.global.register.format);
                        }
                        console.log(v.slice(3), v )
                        this.dt.rows.push( {index: index+1, time: time, msg: v.slice(3).join(", "), file:v[1], num:v[2]} );
                    });
                    
                },
                arrayToCsv(data){
                    
                    let lineArray = [];
                    _.forEach(data, (infoArray, index)=> {
                        let valid = (new Date(infoArray[0])).getTime() > 0;
                        
                        if(valid){
                            this.$set(infoArray, 0, moment(infoArray[0]).format(mx.global.register.format));
                        }

                        let line = infoArray.join(", ");
                        lineArray.push(line);
                    });
                    
                    return lineArray.join("\n");
                    
                },
                init(){
                    this.editor = ace.edit(this.$refs.editor.$el);
                    this.editor.setOptions({
                        // maxLines: 1000,
                        // minLines: 20,
                        autoScrollEditorIntoView: true,
                        enableBasicAutocompletion: true,
                        enableSnippets: true,
                        enableLiveAutocompletion: false
                    });
                    
                    this.editor.getSession().setMode("ace/mode/text");
                    this.editor.setTheme("ace/theme/chrome");
                    this.editor.getSession().setUseSoftTabs(true);
                    this.editor.getSession().setTabSize(2);
                    this.editor.getSession().setUseWrapMode(false);
                    this.editor.renderer.setShowGutter(true);

                    
                    this.onSetData(this.model);

                },
                onSizeChange(val) {
                    console.log(`每页 ${val} 条`);
                    this.$set(this.options.pagination,'limit',val);
                    this.$refs.searchRef.search();
                },
                onCurrentChange(val) {
                    console.log(`当前页: ${val}`);
                    this.$refs.searchRef.search();
                },
                onSetData(data){
                    
                    // 记录总数
                    this.$set(this.options.pagination, 'total', data.count);

                    let value = this.arrayToCsv(data.rows[0].logs);

                    // ediotr
                    if(this.editor){
                        this.editor.setValue(value);
                    }

                    // rows
                    this.arrayToJson(data.rows[0].logs);

                    // fileTree
                    let files = _.uniqBy(_.map(data.rows[0].logs,(v)=>{return {label:v[1], children:[]};}),'label');
                    let values = _.map(files,'label');
                    this.$set(this.options.files,'list', files);
                    this.$set(this.options.files,'value', values);

                    // // mark && highlight
                    // _.delay(()=>{
                    //     window.$ctx = $(".el-table table");   
                    //     window.$ctx.unmark({
                    //         done: ()=>{
                    //             window.$ctx.mark(this.options.term.split(","), {});
                    //         }
                    //     });
                    // },5000)
                      
                },
                onNodeClick(){

                },
                onFullScreen(){
                    
                    if(this.control.ifFullScreen){
                        this.$root.$data.splitInst.setSizes([0,55,45]);
                        this.control.ifFullScreen = false;   
                        this.$refs.main.$el.style.width = "96%";
                    } else {
                        this.$root.$data.splitInst.setSizes([0,0,100]);
                        this.control.ifFullScreen = true;
                        this.$refs.main.$el.style.width = "98%";
                    }   
                },
                onFileChange(val){
                    // 一键搜索结构
                    let term = {
                        entity: this.options.entity,
                        files: val,
                        find: this.options.term,
                        time: this.options.window.value,
                        pagination: [this.options.pagination[0] * this.options.pagination[1],this.options.pagination[1]]
                    };

                    // 搜索
                    let rtn = fsHandler.callFsJScript(`/matrix/${this.options.api.parent}/searchLogByFile.js`, encodeURIComponent(JSON.stringify(term))).message;

                    // 结果
                    this.onSetData(rtn);
                }
            }
        })

        // 实体分析-性能 历史曲线图表
        Vue.component('performance-history-chart', {
            template: `<div style="width:100%;height:200px;" ref="chartContainer"></div>`,
            props:{
                model:Object
            },
            data(){
                return {
                    chart: null,
                    option: {
                        tooltip: {
                            trigger: 'axis'
                        },
                        toolbox: {
                            show: false,
                            feature: {
                                dataZoom: {},
                                dataView: {readOnly: false},
                                magicType: {type: ['line', 'bar']},
                                restore: {},
                                saveAsImage: {}
                            }
                        },
                        grid: {
                            top: '10%',
                            left: '3%',
                            right: '4%',
                            bottom: '20%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            data: []
                        },
                        yAxis: {
                            type: 'value'
                        },
                        series: []
                    }                            
                }
            },
            watch: {
                model:{
                    handler(val,oldVal){
                        this.initData();
                    },
                    deep:true
                }
            },
            created(){
                
                // 初始化数据
                this.initData();

                // 接收窗体RESIZE事件
                eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);
            },
            mounted() {
                this.init();
            },
            methods: {
                init(){
                    this.chart = echarts.init(this.$el);
                    this.chart.setOption(this.option);
                },
                initData(){
                    
                    let term = encodeURIComponent( JSON.stringify(this.model) );
                    let rtn = fsHandler.callFsJScript("/matrix/performance/searchPerformanceByTerm.js",term).message;
                    
                    //取实时数据的time作为xAxis
                    this.option.xAxis.data = _.map(rtn.reverse(),(v)=>{
                        return moment(v[0]).format('YY-MM-DD HH:mm');
                    });
                    
                    this.option.series = [{
                        name: this.model.bucket + ' ' + this.model.key,
                        data: _.map(rtn.reverse(),(v)=>{ return v[1];}),
                        type: 'line',
                        smooth:true,
                        color: 'rgba(108, 212, 11, 1)',
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgba(108, 212, 11, .5)'
                                }, {
                                    offset: 1,
                                    color: 'rgba(108, 212, 11, .1)'
                                }])
                            }
                        }
                    }];

                    if(this.$refs.chartContainer){
                        this.chart.setOption(this.option);
                    }
                    console.log(this.model, this.model.bucket + ' ' + this.model.key, this.option)
                },
                checkChart(){
                    if(this.$refs.chartContainer){
                        this.chart.resize();
                    } else {
                        setTimeout(this.checkChart, 50);
                    }
                }
            }
        })
        // 实体分析-性能
        Vue.component("entity-diagnosis-performance",{
            delimiters: ['#{', '}#'],
            props: {
                model:Object,
                entity: Object
            },
            data(){
                return {
                    kpi: {
                        list: [],
                        time: [moment().add(-1,'hour').format('yyyy-MM-dd HH:mm'),moment().format('yyyy-MM-dd HH:mm')],
                        options: {
                            shortcuts:[
                                {
                                    text: '最近15分钟',
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(start.getTime() - 900 * 1000);
                                        picker.$emit('pick', [start, end]);
                                    }
                                }, {
                                    text: '最近30分钟',
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(start.getTime() - 1800 * 1000);
                                        picker.$emit('pick', [start, end]);
                                    }
                                }, {
                                    text: '最近一小时',
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(start.getTime() - 3600 * 1000 * 1);
                                        picker.$emit('pick', [start, end]);
                                    }
                                }, {
                                    text: '最近一天',
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(start.getTime() - 3600 * 1000 * 24);
                                        picker.$emit('pick', [start, end]);
                                    }
                                }, {
                                    text: '最近七天',
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                        picker.$emit('pick', [start, end]);
                                    }
                                }
                        ]}
                    }
                }
            },
            template: `<el-container style="height: calc(100vh - 120px);">
                            <el-header style="height: 42px;line-height: 42px;margin: 10px;padding: 0px 1px;background: #ddd;display:flex;">
                                <div style="width:9%;">
                                    <el-popover
                                        placement="bottom-end"
                                        trigger="click"
                                        popper-class="info-popper"
                                        :popper-options="{
                                            boundariesElement:'body'
                                        }"
                                        @show="onShowDatePicker">
                                        <el-date-picker
                                            v-model="kpi.time"
                                            :picker-options="kpi.options"
                                            type="datetimerange"
                                            value-format="timestamp"
                                            range-separator="至"
                                            start-placeholder="开始日期"
                                            end-placeholder="结束日期"
                                            ref="datePicker">
                                        </el-date-picker>
                                        <el-button slot="reference" icon="el-icon-timer" style="height:42px;margin-left:-1px;width:100%;"></el-button>
                                    </el-popover>         
                                </div>    
                                <div style="width: 91.5%;margin-left: -1px;">
                                    <mx-classkeys-number-string-cascader 
                                        :root="entityClass" 
                                        :value="null" 
                                        multiplenable="true" 
                                        :entitys="[entity.id]" ref="bucketKeys"></mx-classkeys-number-string-cascader>
                                </div>           
                            </el-header>
                            
                            <el-main style="padding:10px;">
                                <!--div class="grid-stack">
                                    <div class="grid-stack-item"
                                        data-gs-auto-position="true"
                                        data-gs-width="12" data-gs-height="3"
                                        v-for="item,index in kpi.list"
                                        :key="index">
                                            <div class="grid-stack-item-content" style="border:1px solid #f2f3f5;border-radius:5px;box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                                <el-card class="box-card" style="width: 100%;height:100%;overflow:hidden;" >
                                                    <div slot="header" class="clearfix" style="padding:5px;">
                                                        <span>#{item.bucket}# <small>#{item.key}#</small></span>
                                                    </div>
                                                    <performance-history-chart  :model="item"></performance-history-chart>
                                                </el-card>
                                            </div>
                                    </div>
                                </div-->

                                <el-card class="box-card" 
                                    style="width: 100%;height:200px;overflow:hidden;box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)" 
                                    v-for="item,index in kpi.list"
                                    :key="index">
                                    <div slot="header" class="clearfix" style="padding:5px;">
                                        <span>#{item.bucket}# / <small>#{item.key}#</small></span>
                                    </div>
                                    <performance-history-chart  :model="item"></performance-history-chart>
                                </el-card>
                            
                            </el-main>
                        </el-container>`,
            created(){
                
            },
            watch: {
                'kpi.time'(val,oldVal){
                    _.forEach(this.kpi.list,(v)=>{
                        this.$set(v,'time',val);
                    })
                    console.log(this.kpi.list)
                }
            },
            computed:{
                entityClass(){
                    return fsHandler.callFsJScript("/matrix/graph/getClassNameById.js", encodeURIComponent(this.entity.id)).message;
                }
            },
            mounted(){
               
                // watch数据更新
                this.$watch(
                    "$refs.bucketKeys.selected",{
                        handler:(val, oldVal) => { 
                            
                            this.kpi.list = _.map(val,(v)=>{
                                return {id: this.entity.id, class:this.entityClass, bucket: v[0], key: v[1], time: this.kpi.time};
                            })

                            // _.delay(()=>{
                            //     let grid = GridStack.initAll({
                            //         resizable: {
                            //             handles: 'e, se, s, sw, w'
                            //         },
                            //     });
                            //     grid.on('gsresizestop', function(event, elem) {
                            //         eventHub.$emit("WINDOW-RESIZE-EVENT");
                            //     });
                            // },1500)

                            console.log(this.kpi.list)
                        },
                        deep:true
                    }
                );

                

            },
            methods: {
                onShowDatePicker(){
                    this.$refs.datePicker.focus();
                }
            }
        });

        // 实体分析-笔记
        Vue.component("entity-diagnosis-notes",{
            delimiters: ['#{', '}#'],
            props: {
                model:Object
            },
            data(){
                return {
                    noteList: [],
                    note: {   
                        parent: "",
                        name: "",
                        ftype: "md",
                        item: "",
                        content: ""
                    }
                }
            },
            template: `<el-container style="height: calc(100vh - 120px);">
                            <el-header style="height: 30px;text-align: right;line-height: 30px;padding-right: 40px;">
                                <el-tooltip content="新建" open-delay="500">
                                    <el-button type="text" icon="el-icon-plus" @click="onAddNote"></el-button>
                                </el-tooltip>
                            </el-header>
                            <el-main style="padding-top:0px;display:flex;flex-wrap:wrap;align-content:flex-start;">
                                <md-editor-component :model="{item:item,content:item.content}" 
                                    style="width:25em;height:25em;margin:10px;"
                                    v-for="item in noteList"></md-editor-component>
                            </el-main>
                        </el-container>`,
            created(){
                // 初始化备注列表
                this.initNoteList();

                // 根据实体ID定义该实体note存储位置
                this.note.parent = "/storage/entity/notes/" + this.model.node.id;

                // 删除后刷新列表
                eventHub.$on("ENTITY-NOTE-DELETE-EVENT",this.initNoteList);
            },
            mounted(){
                this.initNote();
            },
            methods: {
                initNoteList(){
                    let temp = fsHandler.callFsJScript("/matrix/notes/noteAction.js",encodeURIComponent(this.model.node.id)).message; 
                    this.noteList = _.orderBy(temp,['vtime'],['desc']);
                },
                initNote(){
                    // 文件存在
                    try{
                        let rtn = fsHandler.fsCheck(this.note.parent,this.note.name); 
                        if(!rtn){
                            //this.newNote();
                        } else {
                            this.note.content = fsHandler.fsContent(this.note.parent,this.note.name); 
                        }
                    } 
                    // 文件不存在则新建一个
                    catch(err){
                        console.log(err)
                    }
                },
                newNote(){
                    let attr = {remark: '', author: window.SignedUser_UserName};
                    let rtn = fsHandler.fsNew(this.note.ftype, this.note.parent, this.note.name, this.model.title, attr);
                    this.note.content = this.model.title;
                },
                onAddNote(){
                    this.note.name = "note_" + moment().format("LLL")+".md";
                    this.noteList.unshift(this.note);
                }
            }
        });

        // 实体分析-文件
        Vue.component("entity-diagnosis-file",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model:Object,
                node: Object
            },
            data(){
                return {
                    selectedItem:[]
                }
            },
            template:   `<el-container :id="id" style="height: calc(100vh - 120px);">
                            <el-header style="height:30px;line-height:30px;padding:0px 10px;text-align:right;">
                                
                                <el-tooltip content="排序" placement="top">
                                    <el-dropdown @command="onOrderCommand">
                                        <span class="el-dropdown-link">
                                        <el-button type="text" icon="el-icon-sort"></el-button>
                                        </span>
                                        <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item command='{"prop":"name","type":"asc"}'>按名称升序</el-dropdown-item>
                                        <el-dropdown-item command='{"prop":"name","type":"desc"}'>按名称降序</el-dropdown-item>
                                        <el-dropdown-item command='{"prop":"vtime","type":"asc"}'>按时间升序</el-dropdown-item>
                                        <el-dropdown-item command='{"prop":"vtime","type":"desc"}'>按时间降序</el-dropdown-item>
                                        <el-dropdown-item command='{"prop":"ftype","type":"asc"}'>按类型排序</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </el-tooltip>
                                <el-tooltip content="上传文件">
                                    <el-button type="text" class="fileinput-button" icon="el-icon-upload" @click="fileUpload">
                                    </el-button>
                                </el-tooltip>    
                            </el-header>
                            <el-main style="padding:10px;height:100%;">
                                <el-checkbox-group v-model="selectedItem" v-if="model && model.rows" class="fs-view-node">
                                    <el-button type="default" 
                                            style="max-width: 12em;width: 12em;height:110px;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
                                            @dblclick.native="openIt(item, item.parent+'/'+item.name)"
                                            v-for="item in model.rows">
                                            <div style="position: relative;right: -40px;">    
                                                <el-dropdown trigger="hover" placement="top-start" @command="onMenuCommand">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-arrow-down el-icon--right"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item :command="{fun:menuItem.fun,param:item,type:menuItem.type?menuItem.type:false}" v-for="menuItem in getMenuModel(item)">
                                                                #{menuItem.name}#
                                                            </el-dropdown-item>
                                                        </el-dropdown-menu>
                                                </el-dropdown>
                                            </div>
                                            <el-image style="width:34px;height:34px;margin:5px;" :src="item | pickIcon">
                                                <div slot="error" class="image-slot">
                                                    <i class="el-icon-tickets" style="font-size: 36px;color: #419efe;"></i>
                                                </div>
                                            </el-image>
                                            <div>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:center;">
                                                    #{item.name}#
                                                </p>
                                            </div>
                                            <el-checkbox :label="item.id"></el-checkbox>
                                    </el-button>
                                </el-checkbox-group>
                            </el-main>
                        </el-container>`,
            filters: {
                pickIcon(item){

                    // extend || ...
                    if( item.fullname === '/extend' ){
                        return `${window.ASSETS_ICON}/files/png/dir-lock.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                    } else {
                        try{
                            if(_.includes(['png','jpeg'],item.ftype)){
                                return `/fs${item.parent}/${item.name}?type=open&issys=${window.SignedUser_IsAdmin}`;    
                            } else {
                                return _.attempt(JSON.parse.bind(null, item.attr)).icon || `${window.ASSETS_ICON}/files/png/${item.ftype}.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                            }
                        }
                        catch(error){
                            return `${window.ASSETS_ICON}/files/png/${item.ftype}.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                        }
                    }
                }
            },
            methods: {
                reloadData(event){
                    this.model = event['file'];
                },
                onMenuCommand(cmd){
                    
                    if(!cmd.type){
                        this[cmd.fun](cmd.param);
                    } else {
                        this[cmd.fun](cmd.param,cmd.type);
                    }
                    
                },
                getMenuModel(item){
                    // 根据文件类型返回右键菜单
                    let model = {
                        "js": [
                            { name: "下载", icon: "fas fa-download", fun: "downloadIt", type: true },
                            { name: "编辑/运行", icon: "fas fa-play", fun: "editIt" },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ],
                        "html": [
                            { name: "发布应用", icon: "fab fa-codepen", fun: "deployIt" },
                            { name: "下载", icon: "fas fa-download", fun: "downloadIt", type: true },
                            { name: "编辑", icon: "fas fa-edit", fun: "editIt" },
                            { name: "运行", icon: "fas fa-play", fun: "runHtml" },
                            { name: "运行链接", icon: "fas fa-map-marker-alt", fun: "copyUrl" },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ],
                        "htm": [
                            { name: "发布应用", icon: "fab fa-codepen", fun: "deployIt" },
                            { name: "下载", icon: "fas fa-download", fun: "downloadIt", type: true },
                            { name: "编辑", icon: "fas fa-edit", fun: "editIt" },
                            { name: "运行", icon: "fas fa-play", fun: "runHtml" },
                            { name: "运行链接", icon: "fas fa-map-marker-alt", fun: "copyUrl" },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ],
                        "md":[
                            { name: "下载", icon: "fas fa-download", fun: "downloadIt", type: true },
                            { name: "编辑", icon: "fas fa-edit", fun: "editIt" },
                            { name: "打开", icon: "fas fa-play", fun: "openIt", type: null },
                            { name: "打开链接", icon: "fas fa-map-marker-alt", fun: "copyUrl" },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ],
                        "json":[
                            { name: "下载", icon: "fas fa-download", fun: "downloadIt", type: true },
                            { name: "编辑", icon: "fas fa-edit", fun: "editIt" },
                            { name: "打开", icon: "fas fa-play", fun: "openIt", type: true },
                            { name: "打开链接", icon: "fas fa-map-marker-alt", fun: "copyUrl" },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ],
                        "imap":[
                            { name: "下载", icon: "fas fa-download", fun: "downloadIt", type: true },
                            { name: "编辑", icon: "fas fa-edit", fun: "editIt" },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ],
                        "ishow":[
                            { name: "下载", icon: "fas fa-download", fun: "downloadIt", type: true },
                            { name: "编辑", icon: "fas fa-edit", fun: "editIt" },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ],
                        "iflow":[
                            { name: "下载", icon: "fas fa-download", fun: "downloadIt", type: true },
                            { name: "编辑", icon: "fas fa-edit", fun: "editIt" },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ],
                        "dir": [
                            { name: "打开", icon: "fas fa-folder-open", fun: "openIt" },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ],
                        "normal": [
                            { name: "打开", icon: "fas fa-folder-open", fun: "openIt" },
                            { name: "下载", icon: "fas fa-download", fun: "downloadIt", type: true },
                            { name: "删除", icon: "fas fa-trash", fun: "deleteIt", type: true },
                            { name: "共享", icon: "fas fa-share-square", fun: "shareIt" },
                            { name: "属性", icon: "fas fa-info", fun: "info" }
                        ]
                    };

                    try{
                        if(model[item.ftype]){
                            return model[item.ftype];
                        } else {
                            return model["normal"];
                        }
                    } catch(err){
                        return model["normal"];
                    } finally{
                        
                    }

                },
                deleteIt(event, prompt) {
                    const self = this;
    
                    if(_.includes(['app','extend','assets','opt','script'],event.name)){
                        alertify.error("系统目录，不允许删除!");
                        return false;
                    }
    
                    if(_.isEmpty(event)) {
                        alertify.log("选择需要删除的对象！");
                        return false;
                    }
    
                    if(prompt){

                        alertify.confirm(`确定要删除 ${event.name} 文件?`,  (e)=> {
                            if (e) {
                                let rtn = fsHandler.fsDelete(event.parent,event.name);
                                
                                if (rtn == 1){
                                    let fs = {class: event.class, id:event.id, name: event.name, file: `${event.parent}/${event.name}`};
                                    this.updateEntity(fs,"-");

                                    this.$message({
                                        type: "success",
                                        message: "删除成功！"
                                    })
                                } else {
                                    this.$message({
                                        type: "error",
                                        message: "删除失败 " + rtn.message
                                    })
                                }  
                            } else {
                                
                            }
                        });
                    } else {
                        let rtn = fsHandler.fsDelete(event.parent,event.name);
    
                        if (rtn == 1){
                            this.$message({
                                type: "success",
                                message: "删除成功！"
                            })
                        } else {
                            this.$message({
                                type: "error",
                                message: "删除失败 " + rtn.message
                            })
                        }  
                    }
                },                     
                downloadIt(item, prompt) {
                    let self = this;
    
                    if(item.ftype == 'dir'){
                        let rtn = fsHandler.fsList(item.parent);
                    } else {
                        let _url = `/fs/${item.parent}/${item.name}?type=download&issys=${window.SignedUser_IsAdmin}`.replace(/\/\//g,'/');
                        let _target = '_blank';
                        window.open(_url, _target);
                    }
                },
                onOrderCommand(cmd){
                    try {
                        let command = _.attempt(JSON.parse.bind(null, cmd));
                        this.model.rows = _.orderBy(this.model.rows,[command.prop],[command.type]);
                    } catch(err){
                        
                    }
                },
                fileUpload(){
                    const self = this;

                    let wnd = null;
                    let wndID = `jsPanel-upload-${objectHash.sha1(self.node.id)}`;

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
                                                :data="{index:true}"
                                                :action="upload.url"
                                                :on-success="onSuccess"
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
                                url: `/fs/storage/entity/files/${self.node.id}?issys=true`,
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
                                self.updateEntity(file.raw,"+");
                            },
                            onRemove(file, fileList) {
                                console.log(file, fileList);
                            },
                            onPreview(file) {
                                console.log(file);
                            }
                        }
                    }).$mount(`#${wndID}`);
                    
                },  
                // 上传完毕，更新/matrix/entity   
                updateEntity(event,action){
                    let id = this.node.id;
                    let fs = {action: action, class: `/matrix/entity/${this.node.id.split(":")[0]}`, id:id, name: event.name, file: `/storage/entity/files/${this.node.id}/${event.name}`};
                    let rtn = fsHandler.callFsJScript("/matrix/graph/update-files-by-id.js", encodeURIComponent(JSON.stringify(fs))).message;
                    _.delay(()=>{ this.reload() },1000);
                },                     
                openIt(data, path){
                    
                    try{
                        if(_.includes(['md','txt'],data.ftype)){
                            
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
                                                    <span><i class="el-icon-user"></i> #{item | pickAuthor}#</span>
                                                    <el-divider direction="vertical"></el-divider>
                                                    发布于 #{ item | pickTime }#
                                                </el-footer>
                                            </el-container>`,
                                filters:{
                                    pickTime(item){
        
                                        try{
                                            let ctime = item.ctime;//_.attempt(JSON.parse.bind(null, item.attr)).ctime || item.vtime;
                                            return moment(ctime).format(mx.global.register.format);
                                        } catch(err){
                                            return moment(item.vtime).format(mx.global.register.format);
                                        }
                                    },
                                    pickAuthor(item){
                                        try{
                                            return _.attempt(JSON.parse.bind(null, item.attr)).author || window.SignedUser_UserName;
                                        } catch(err){
                                            return window.SignedUser_UserName;
                                        }
                                    },
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
                                                    <span><i class="el-icon-user"></i> #{item | pickAuthor}#</span>
                                                    <el-divider direction="vertical"></el-divider>
                                                    发布于 #{ item | pickTime }#
                                                </el-footer>
                                            </el-container>`,
                                filters:{
                                    pickTime(item){
        
                                        try{
                                            let ctime = item.ctime;//_.attempt(JSON.parse.bind(null, item.attr)).ctime || item.vtime;
                                            return moment(ctime).format(mx.global.register.format);
                                        } catch(err){
                                            return moment(item.vtime).format(mx.global.register.format);
                                        }
                                    },
                                    pickAuthor(item){
                                        try{
                                            return _.attempt(JSON.parse.bind(null, item.attr)).author || window.SignedUser_UserName;
                                        } catch(err){
                                            return window.SignedUser_UserName;
                                        }
                                    },
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
                                                    <span><i class="el-icon-user"></i> #{item | pickAuthor}#</span>
                                                    <el-divider direction="vertical"></el-divider>
                                                    发布于 #{ item | pickTime }#
                                                </el-footer>
                                            </el-container>`,
                                filters:{
                                    pickTime(item){
        
                                        try{
                                            let ctime = item.ctime;//_.attempt(JSON.parse.bind(null, item.attr)).ctime || item.vtime;
                                            return moment(ctime).format(mx.global.register.format);
                                        } catch(err){
                                            return moment(item.vtime).format(mx.global.register.format);
                                        }
                                    },
                                    pickAuthor(item){
                                        try{
                                            return _.attempt(JSON.parse.bind(null, item.attr)).author || window.SignedUser_UserName;
                                        } catch(err){
                                            return window.SignedUser_UserName;
                                        }
                                    },
                                },
                                created(){
                                    this.model = {item:data, content:fsHandler.fsContent(data.parent, data.name)};
                                }
                            }).$mount("#movView");

                        } else {
                            let url = `/fs/${data.fullname}?type=download&issys=true`;
                            window.open(url,"_blank");
                        }
                    } catch(err){

                    } finally{
                        
                    }
    
                },
                info(node){
                    
                    let win = maxWindow.winInfo("属性",'<div id="fs-info"></div>',null, this.$root.$el);
    
                    new Vue({
                        delimiters: ['#{', '}#'],
                        data:{
                            model:node,
                            win: win
                        },
                        template:   `<mx-fs-info :node="model" :winContainer="win"></mx-fs-info>`,
                    }).$mount("#fs-info");
                    
                },  
                reload(){
                    const self = this;
                    
                    try {
                        let id = this.node.id;
                        let value = this.node.value;
                        let model = null;
                        
                        // edge
                        if(this.node.cell.edge){
                            model = fsHandler.callFsJScript("/matrix/graph/diagnosis-by-edge-id.js", encodeURIComponent(JSON.stringify(_.omit(this.node,'cell')))).message;
                        } 
                        // node
                        else {
                            model = fsHandler.callFsJScript("/matrix/graph/diagnosis-by-id.js", encodeURIComponent(JSON.stringify(_.omit(this.node,'cell')))).message;
                        }
                        // 更新当前数据
                        _.extend(this.model, model['file']);

                        // 更新父-父-父数据
                        _.extend(this.$parent.$parent.$parent.model,model);
                        
                    } catch(error){
                       //console.log(_.now(),error)
                    }
                }
            }
        })

        // 拓扑分析树
        Vue.component("graph-view-nav",{
            delimiters: ['${', '}'],
            props:{
                id: String
            },
            template: `<entity-tree-component :id="'graph-tree-'+id" :model="{parent:'/event',name:'event_tree_data.js',domain:'event'}"></entity-tree-component>`
        })

        //edges关系维护
        Vue.component("edges-maintain",{
            delimiters: ['#{', '}#'],
            props:{
                parent: Object,
                type: String,
                model: Object
            },
            data() {
                return {
                    term: "",
                    list: [],
                    selected: []
                };
            },
            template:   `<el-container style="height:calc(100vh - 150px);">
                            <el-main style="height:100%;overflow:hidden;">
                                <el-input v-model="term" clearable placeholder="实体关键字" 
                                    @blur="searchByTerm" 
                                    @keyup.enter.native="searchByTerm" 
                                    style="margin-bottom:10px;height:32px;">
                                    <template slot="prepend">搜索实体</template>
                                    <el-button slot="append" icon="el-icon-search" @click="searchByTerm"></el-button>
                                </el-input>
                                <el-transfer v-model="selected" 
                                :titles="['实体列表',type]"
                                :button-texts="['取消关系', '创建关系']"
                                :data="list"
                                @change="updateEdges"
                                class="edge-main-panel"></el-transfer>
                            </el-main>
                        </el-container>`,
            created(){
                
                try{
                    this.list = _.map(this.model.value,(v)=>{
                        return {key: v, label: v, disabled: 0};
                    })
                    
                    this.selected = _.map(this.list,'key');
                } catch(err){
                    this.selected = [];
                }
                
            },
            mounted(){
               
                
            },
            methods: {
                searchByTerm(){

                    
                        let rtn = fsHandler.callFsJScript("/matrix/graph/entity-search-by-term.js",encodeURIComponent(this.term)).message;

                        
                        //如果已有选择
                        if(this.selected.length){
                            _.merge(this.list,_.map(rtn,(v)=>{
                                return {key: v.id, label: v.name, class:v.class, disabled: 0};
                            }))
                        } else {
                            this.list = _.map(rtn,(v)=>{
                                return {key: v.id, label: v.name, class:v.class, disabled: 0};
                            })
                        } 
                    
                    
                    
                },
                updateEdges(value, direction, movedKeys) {
                    
                    let edges = {id:this.parent.id, type:this.type, action:direction=='right'?"+":"-", value:_.map(movedKeys,(v) => {
                                    return _.find(this.list,{key:v});
                                })};
                    
                    // 更新关系
                    let rtn = fsHandler.callFsJScript("/matrix/graph/edges-action.js",encodeURIComponent(JSON.stringify(edges))).message;

                    // 更新图
                    if(direction=='right'){
                        // 新建Edge
                        this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.addEdge(edges.id, edges.value);
                    } else {
                        // 删除Edge
                        this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.removeEdge(edges.id, edges.value);
                    }
                    
                }
            }
        })

        // 拓扑分析基本组件
        // 列表形式
        // 部件
        Vue.component("diagnosis-base-table",{
            delimiters: ['#{', '}#'],
            props: {
                model:Object
            },
            template:  `<el-table :data="model.rows" 
                            highlight-current-row
                            style="width: 100%">
                            <el-table-column v-for="item in model.template" :prop="item.data" :label="item.title"></el-table-column>
                        </el-table>`

        })

        // 拓扑分析图 局部组件
        Vue.component("graph-view-container",{
            delimiters: ['${', '}'],
            data(){
                return {
                    model: null
                }
            },
            template: `<topological-graph-component :graphData="model" ref="graphViewContainerInst"></topological-graph-component>`,
            methods:{
                search(term){
                    try {
                        
                        // 根据文件获取图
                        if( !_.isEmpty(inst.URL_PARAMS_ITEM) ){
                            this.model = fsHandler.fsContent(inst.URL_PARAMS_ITEM.parent, inst.URL_PARAMS_ITEM.name);
                        } else {
                            this.model = fsHandler.callFsJScript("/matrix/graph/graph_service.js", term).message[0].graph;
                        }

                    } catch(err) {
                        this.$message({
                            type: "error",
                            message: "图查询失败，请确认语法！" + err
                        });
                        this.model = {};
                    }
                    
                }
            }
        })

        // 拓扑分析节点信息 局部组件
        Vue.component("graph-view-diagnosis",{
            delimiters: ['#{', '}#'],
            props: {
                
            },
            template:   `<el-tabs v-model="activeIndex" 
                                type="border-card" 
                                closable 
                                @tab-remove="diagnosisRemove" 
                                style="height:100%;">
                            <el-tab-pane :label="item.title" v-for="item in tabs.list" :key="item.name" :name="item.name" lazy style="height:100%;">
                                <el-tabs 
                                    v-model="item.subIndex" 
                                    class="entity-diagnosis-tabs" 
                                    tab-position="left"
                                    v-if="item.child">
                                    <el-tab-pane v-for="it in item.child" :key="it.name" :name="it.name" lazy>
                                        <span slot="label">
                                            <el-tooltip :content="it | pickTitle" open-delay="500" placement="left-start">
                                                <el-image src="/fs/assets/images/tools/png/add.png?issys=true&type=open" style="width:20px;height:20px;filter: brightness(0.5);" v-if="it.type=='new'"></el-image>
                                                <el-image :src="it | pickImage" style="width:20px;height:20px;filter: brightness(0.5);" v-else></el-image>
                                            </el-tooltip>
                                        </span>
                                        
                                        <entity-diagnosis-alert :model="it.model[it.data]" v-if="it.type === 'alert' "></entity-diagnosis-alert>

                                        <entity-diagnosis-performance :model="it.model[it.data]" :entity="item.node" v-if="it.type === 'performance'"></entity-diagnosis-performance>

                                        <entity-diagnosis-log :model="it.model[it.data]" :entity="item.node" v-if="it.type === 'log'"></entity-diagnosis-log>

                                        <entity-diagnosis-notes :model="item" v-if="it.type === 'notes'"></entity-diagnosis-notes>

                                        <entity-diagnosis-file :id="it.name" :model="it.model[it.data]" :node="item.node" v-if="it.type === 'file'"></entity-diagnosis-file>

                                        <entity-diagnosis-form :model="it.model[it.data]" v-if="it.type === 'form'"></entity-diagnosis-form>

                                        <entity-diagnosis-list :model="it.model[it.data]" v-if="it.type === 'list'"></entity-diagnosis-list>
                                        
                                        <entity-diagnosis-profile :id="item.name" :model="it.model[it.data]" v-if="it.type === 'profile'"></entity-diagnosis-profile>

                                        <div v-if="it.type === 'new'"></div>
                                        
                                    </el-tab-pane>
                                </el-tabs>
                            </el-tab-pane>
                        </el-tabs>`,
            data(){
                return {
                    tabs: {
                        list:[],
                        subIndex: ''
                    },
                    activeIndex: '',
                    model: null
                }
            },
            filters: {
                pickTitle(event){
                    
                    try {
                        let count = 0;
                        
                        count = _.size(event.model[event.type].rows);
                        
                        return `${event.title} ${count}`;
                    } catch(err){
                        return `${event.title} 0`;
                    }
                },
                pickImage(item){
                    try{
                        return `/fs/assets/images/apps/png/${item.icon}.png?type=open&issys=true`;
                    } catch(err){
                        return `/fs/assets/images/apps/png/app.png?type=open&issys=true`;
                    }
                }
            },
            watch: {
                'tabs.list':function(val,oldVal){
                    if(val.length > 0){
                        this.$root.$data.splitInst.setSizes([0,55,45]);
                        $(".gutter").show();
                    } else {
                        this.$root.$data.splitInst.setSizes([0,100,0]);
                        $(".gutter").hide();
                    }
                }
            },
            created(){
            },
            mounted(){ 
            },
            methods:{
                diagnosisAdd(node){
                    const self = this;
                    
                    try{
                        if(node.cell.edge){
                            // 构建 edge 属性
                            _.extend(node,{
                                type: node.type,
                                class: `/${node.id}`
                            });
                            self.model = fsHandler.callFsJScript("/matrix/graph/diagnosis-by-edge-id.js", encodeURIComponent(JSON.stringify(_.omit(node,'cell')))).message;
                        } else {
                            // node
                            self.model = fsHandler.callFsJScript("/matrix/graph/diagnosis-by-id.js", encodeURIComponent(JSON.stringify(_.omit(node,'cell')))).message;
                        }

                        
                        let id = objectHash.sha1(node);

                        // 检查是否已打开
                        let name = `diagnosis-${id}`;
                        let find = _.find(self.tabs.list,{name: name});
                        if(find){
                            self.diagnosisRemove(name);
                        }

                        let child = _.map(self.model.template,(v)=>{
                                        return _.extend(v, {name:`diagnosis-${v.name}-${id}`, model: self.model, data:v.name});
                                    });
                        let subIndex = _.head(child).name;
                        let tab = {
                                title: node.value || node.id, name: `diagnosis-${id}`, type: 'diagnosis', node: node, child: child, subIndex: subIndex
                            };

                        self.activeIndex = tab.name;
                        self.tabs.list.push(tab);
                        
                    } catch(err){
                        console.log("diagnosisAdd: " + err)
                    } finally{
                        let graph = this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.editor.graph;
                        
                        // 访问过的节点高亮
                        var highlight = new mxCellHighlight(graph, '#2790e1', 2);
                        highlight.highlight(graph.view.getState(node.cell));
                        
                        // 隐藏工具栏
                        this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.control.toolbar.show = false;
                    }
                    
                },
                diagnosisRemove(targetName) {
                        
                    try{
                        let tabs = this.tabs.list;
                        let activeIndex = this.activeIndex;
                        if (activeIndex === targetName) {
                        tabs.forEach((tab, index) => {
                            if (tab.name === targetName) {
                            let nextTab = tabs[index + 1] || tabs[index - 1];
                            if (nextTab) {
                                activeIndex = nextTab.name;
                            }
                            }
                        });
                        }
                        
                        this.tabs.list = tabs.filter(tab => tab.name !== targetName);
                        this.activeIndex = activeIndex;
                        this.tabs.subIndex = _.first(_.last(this.tabs.list).child).name;
                    } catch(err){
                        
                    } finally{
                        // 隐藏工具栏
                        this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.control.toolbar.show = true;
                    }
                    
                    
                }
            }
        })

        // 节点关系维护 局部组件
        Vue.component("graph-view-edges",{
            delimiters: ['#{', '}#'],
            props: {
                
            },
            template:   `<el-tabs v-model="activeIndex" type="board-card" closable @tab-remove="edgesTabRemove" class="topological-view-edges-tabs">
                            <el-tab-pane :label="item.title" v-for="item in tabs" :key="item.name" :name="item.name">
                                <el-tabs v-if="item.child" v-model="subIndex" class="el-tabs-bottom-line">
                                    <el-tab-pane :label="it | pickTitle" v-for="it in item.child" :key="it.name" :name="it.name">
                                        <edges-maintain :parent="node" :type="it.type" :model="it.model"></edges-maintain>    
                                    </el-tab-pane>
                                </el-tabs>
                            </el-tab-pane>
                        </el-tabs>`,
            data(){
                return {
                    tabs:   [],
                    activeIndex: '',
                    subIndex: '',
                    node: null,
                    model: null
                }
            },
            filters: {
                pickTitle(event){
                    
                    try {
                        let count = 0;
                        count = event.model.value.length;
                        
                        return `${event.title} ${count}`;
                    } catch(err){
                        return `${event.title} 0`;
                    }
                }
            },
            watch: {
                tabs:function(val,oldVal){
                    if(val.length > 0){
                        this.$root.$data.splitInst.setSizes([30,70,0]);
                        $(".gutter").show();
                    } else {
                        this.$root.$data.splitInst.setSizes([0,100,0]);
                        $(".gutter").hide();
                    }
                }
            },
            created(){
            },
            mounted(){ 
            },
            methods:{
                edgesTabAdd(node){
                    const self = this;

                    try{
                        self.node = node;

                        let id = node.id;

                        // 检查是否已打开
                        let name = `edges-${id}`;
                        let find = _.find(self.tabs,{name: name});
                        if(find){
                            self.activeIndex = name;
                            self.subIndex = _.first(find.child).name;  
                            return false;  
                        }

                        let tab = fsHandler.callFsJScript("/matrix/graph/edges-list.js",encodeURIComponent(JSON.stringify(_.omit(node,'cell')))).message;
                        
                        self.activeIndex = tab.name;
                        self.tabs.push(tab);
                        self.subIndex = _.first(tab.child).name;
                    } catch(err){
                        console.log(err)
                    }
                    
                },
                edgesTabRemove(targetName) {
                        
                    try{
                        let tabs = this.tabs;
                        let activeIndex = this.activeIndex;
                        if (activeIndex === targetName) {
                        tabs.forEach((tab, index) => {
                            if (tab.name === targetName) {
                            let nextTab = tabs[index + 1] || tabs[index - 1];
                            if (nextTab) {
                                activeIndex = nextTab.name;
                            }
                            }
                        });
                        }
                        
                        this.tabs = tabs.filter(tab => tab.name !== targetName);
                        this.activeIndex = activeIndex;
                        this.subIndex = _.first(_.last(this.tabs).child).name;
                    } catch(err){
                        
                    }
                    
                    
                }
            }
        })

        VueLoader.onloaded(["ai-robot-component",
                            "topological-timeline",
                            "topological-timeline-mini",
                            "topological-timeline-chart",
                            "topological-graph-component",
                            "omdb-path-datatables-component",
                            "event-datatable-component",
                            "event-diagnosis-datatable-component",
                            "event-summary-component",
                            "search-preset-component",
                            "search-base-component",
                            "search-log-component",
                            "entity-tree-component",
                            "md-editor-component",
                            "form-component",
                            "form-card-component"],function() {
            $(function() {

            
            })
        })
    }

    // 图挂载
    mount(el){
        const inst = this;
        
        let randomId = objectHash.sha1(el + _.now());

        let main =  {
            delimiters: ['${', '}'],
            template:   `<el-container style="background: transparent;height: 100%;"  v-show="control.show">
                            <el-aside style="width:0px;background-color:#FFF;border:1px solid #ddd;border-left:unset;border-right:unset;" class="topological-view-edges" ref="left">
                                <graph-view-edges ref="graphEdgesRef"></graph-view-edges>
                            </el-aside>
                            <el-container :style="containerHeight" ref="main">
                                <graph-view-container ref="graphViewRef"></graph-view-container>
                            </el-container>
                            <el-aside style="width:0px;height:calc(100vh - 85px);overflow:hidden;background:#FFF;border:1px solid #ddd;border-left:unset;" class="topological-view-diagnosis" ref="right">
                                <graph-view-diagnosis ref="graphDiagnosisRef"></graph-view-diagnosis>
                            </el-aside>
                        </el-container>`,
            data: {
                id: randomId,
                splitInst: null,
                model: null,
                paths: {
                    ports: [],
                    list: []
                },
                control:{
                    show: false
                }
            },
            computed:{
                containerHeight: function(){
                    if(_.endsWith(window.location.pathname,"_link")){
                        return "height: calc(100vh - 10px);width:100%;";
                    } else {
                        return "height: calc(100vh - 85px);width:100%;";
                    }
                    
                }
            },
            created(){
                
                try {
                    
                    if(!_.isEmpty(mx.urlParams['item'])){
                        inst.URL_PARAMS_ITEM = window.URL_PARAMS_ITEM = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['item']))));
                        inst.graphScript = [ { value: `${inst.URL_PARAMS_ITEM.fullname}` } ];
                    }
                    
                    if(!_.isEmpty(mx.urlParams['data'])) {
                        inst.graphScript = [{value:decodeURIComponent(window.atob(mx.urlParams['data']))}];
                    }
                    
                    if(!_.isEmpty(mx.urlParams['cfg'])){
                        inst.URL_PARAMS_CFG = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['cfg']))));
                    }

                    if(!_.isEmpty(mx.urlParams['graph'])){
                        inst.URL_PARAMS_GRAPH = window.URL_PARAMS_GRAPH = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['graph']))));
                    }
                    
                    
                    let init = (function(){
            
                        _.forEach(inst.URL_PARAMS_CFG,function(v,k){
                            
                            if("false" == String(v)){
                                $(`#${k}`).remove();
                                $(".page-header-fixed").css({
                                    "paddingTop": "0px"
                                })
                                $(".page-sidebar-minified .sidebar-bg").css({
                                    "width": "0px"
                                })
                                $(".page-sidebar-minified .content").css({
                                    "marginLeft": "0px"
                                })
                                $("body").css({
                                    "background": "transparent"
                                })
                            }
                        })
            
                    })();
                } catch(err){
                    // inst.URL_PARAMS_ITEM = null;
                    // inst.URL_PARAMS_CFG = null;
                    // inst.graphScript = null;
                    // inst.URL_PARAMS_GRAPH = null;
                }


                setTimeout(() => {
                    this.control.show = true;
                }, 1000);
            },
            mounted(){
                _.delay(()=>{
                    this.splitInst = Split([this.$refs.left.$el, this.$refs.main.$el,this.$refs.right.$el], {
                        sizes: [0, 100, 0],
                        minSize: [0, 0, 0],
                        cursor: 'col-resize',
                        direction: 'horizontal',
                        gutterSize: 5,
                        gutterStyle: function(dimension, gutterSize) {
                            return {
                                'display': 'none'
                            }
                        },
                        onDragEnd: function(sizes) {
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                        }
                    });
                },1500)
                
            },
            methods: {
                setData(event){
                    this.model = _.extend(this.model, this.$refs.searchRef.result);
                },
                cellSelect(cell){
                    let graph = this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.editor.graph;
                    
                    if (cell != null){
						var overlays = graph.getCellOverlays(cell);
						
						if (overlays == null) {
							// Creates a new overlay with an image and a tooltip
							var overlay = new mxCellOverlay(new mxImage('/fs/assets/images/files/png/check.png?type=open&issys=true', 16, 16),'Overlay tooltip');

							// Installs a handler for clicks on the overlay							
							overlay.addListener(mxEvent.CLICK, function(sender, evt2)
							{
								
							});
							
							// Sets the overlay for the cell in the graph
							graph.addCellOverlay(cell, overlay);
						} else {
							graph.removeCellOverlays(cell);
						}
                    }

                    let callbackFun = function(){
                        eventHub.$emit("TOPOLOGICAL-ANALYSIS-CALLBACK");
                    };

                    try {
                        if( window.jsPanel.activePanels.getPanel(`jsPanel-graphAction`) ){
                            window.jsPanel.activePanels.getPanel(`jsPanel-graphAction`).show();
                        }
                    } catch(err){
                        
                        window.topologicalAnalysisWnd = maxWindow.winGraphAction("", `<div id="topological-analysis-container" style="width:100%;height:100%;"></div>`, null, this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.$refs.container.$el, callbackFun);
                    
                        new Vue({
                            delimiters: ['#{', '}#'],
                            template: `<topological-path class="graphAction" :model="model"></topological-path>`,
                            data: {
                                model: {}
                            },
                            created(){
                                _.extend(this.model, {id:cell.getId(),value: cell.getValue(),cell: cell});
                            }
                        }).$mount("#topological-analysis-container")
                    }
                    
                    
                },
                edgesSearch(node,step){
                    let term = "";
                    if(node.direction=="out"){
                        term = `match ('${node.node.id}') - [*${node.step}] -> ()`;
                    } else{
                        term = `match ('${node.node.id}') <- [*${node.step}] - ()`;
                    }
                    
                    //this.$root.$refs.graphViewRef.term.push(term);
                    this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.$refs.graphViewSearch.term = term;
                    this.$root.$refs.graphViewRef.search( encodeURIComponent(term) );
                    //加入搜索历史
                    this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.history.push({id:objectHash.sha1(term),term:term, time: _.now()});

                }
            },
            destroyed: function () {
                $(this.$el).off();
            }
        };
        
        // mount
        _.delay(() => {
            this.app = new Vue(main).$mount(el);
        },50)

    }

    // 图更新
    search(term){
        this.app.$refs.graphViewRef.search( encodeURIComponent(term) );

        // 更新选择列表
        eventHub.$emit("GRAPH-VIEW-SEARCH-UPDATE-EVENT",term);
    }

    // 销毁
    destroy(){
        $(this.app.$el).remove();
        this.app = null;
    }

}


