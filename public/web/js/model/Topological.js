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
                                            <el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f7f7f7;" >
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
                                    <el-button slot="append" icon="el-icon-close" @click="onRemove(model.id)"></el-button>
                                </el-autocomplete>
                            </el-header>
                            <el-main v-if="edge.show" style="padding:10px;background:#f6f6f6;">
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
                                        <el-input-number v-model="edge.edgeStep" :min="0"></el-input-number>
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
                            <el-button slot="append" icon="el-icon-plus" @click="onNew"></el-button>
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
                                <div style="padding:0px 10px;">
                                    <el-tooltip content="路劲查询" open-delay="500" placement="top">
                                        <el-button type="primary" @click="onSearch" style="float:right;">
                                            <el-image src="/fs/assets/images/tools/png/path-white.png?type=open&issys=true" style="width:16px;"></el-image>
                                        </el-button>
                                    </el-tooltip> 
                                </div>
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
        // 图搜索高级面板
        Vue.component("topological-graphAdv",{
            delimiters: ['#{', '}#'],
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
                                <div style="margin-top:-1px;width:88%;">
                                    <el-radio-group v-model="type">
                                        <el-radio-button label="all">全路径</el-radio-button>
                                        <el-radio-button label="short">最短路径</el-radio-button>
                                        <el-radio-button label="long">最长路径</el-radio-button>
                                        <el-radio-button label="">关键路径</el-radio-button>
                                    </el-radio-group>
                                </div>
                                <div>
                                    <el-divider direction="vertical"></el-divider>
                                </div>
                                <el-button type="default"
                                    @click="$parent.$parent.onToggleView('topological-search-toolbar-graph')" 
                                    @keyup.enter.native="$parent.$parent.search"
                                    style="width:15%;">
                                    <i class="el-icon-close" style="font-size:14px;font-weight: 900;"></i>
                                </el-button>
                            </el-header>
                            <el-main ref="mainView" style="border-top:1px solid #419efe;padding:0px;width:30vw;">
                                <topological-path class="graphAction" :model="$parent.$parent.mainView.path.model" :pathType="type" ref="pathRef"></topological-path>
                            </el-main>
                            <el-footer style="height:30px;line-height:30px;padding:0 5px;color:#999;">
                                
                            </el-footer>
                        </div>`
        })

        Vue.component("topological-search-toolbar-graph",{
            delimiters: ['${', '}'],
            template:   `<div>
                            <el-header style="width:100%;display:flex;height:35px;line-height:35px;padding:0px 0px 0px 10px;">
                                <el-button type="text" icon="el-icon-d-arrow-left" @click="$parent.$parent.control.show=false"></el-button>
                                <el-input placeholder="选择实体" style="width:100%;" disabled></el-input>
                                <el-button type="default" @click="$parent.$parent.onToggleView('topological-search-toolbar-path')" @keyup.enter.native="$parent.$parent.search" style="margin-left:-1px;">
                                    <el-image src="/fs/assets/images/tools/png/path-blue.png?type=open&issys=true" style="width:16px;"></el-image>
                                </el-button>
                                <el-button type="default" 
                                    @click="$parent.$parent.onToggleView('topological-search-toolbar-graphAdv')" style="margin-left:-1px;">
                                    高级
                                </el-button>
                                <el-button type="primary" @click="onSearch" 
                                    @keyup.enter.native="onSearch" style="margin-left:-1px;">
                                    <i class="el-icon-search" style="font-weight: 900;font-size:14px;"></i>
                                </el-button>
                            </el-header>
                            <el-main ref="mainView" style="width:30vw;padding:0px;border-top:1px solid #f7f7f7;">
                                <topological-graph class="graphAction" :model="$parent.$parent.mainView.search.model" ref="searchRef"></topological-graph>
                            </el-main>
                            <el-footer style="height:30px;line-height:30px;padding:0 5px;color:#999;">
                                
                            </el-footer>
                        </div>`,
                        created(){
                            console.log(this.$parent.$parent.control.show)
                        },
            methods: {
                onSearch(){
                    this.$refs.searchRef.onSearch();
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
                                <el-button type="text" icon="el-icon-d-arrow-left"  @click="$parent.$parent.control.show=false"></el-button>
                                <el-input placeholder="图查询语句" style="width:100%;" disabled></el-input>
                                <el-button type="default" @click="$parent.$parent.onToggleView('topological-search-toolbar-path')" @keyup.enter.native="$parent.$parent.search" style="margin-left:-1px;">
                                    <el-image src="/fs/assets/images/tools/png/path-blue.png?type=open&issys=true" style="width:16px;"></el-image>
                                </el-button>
                                <el-button type="default"
                                    @click="$parent.$parent.onToggleView('topological-search-toolbar-graph')" 
                                    style="margin-left:-1px;">
                                    <i class="el-icon-search" style="font-weight: 900;"></i>
                                </el-button>
                                <el-button type="primary" @click="onSearch('')" 
                                    @keyup.enter.native="onSearch('')" style="margin-left:-1px;">
                                    高级
                                </el-button>
                            </el-header>
                            <el-main ref="mainView" style="border-top:1px solid #f7f7f7;width:30vw;height:calc(100vh - 190px);">
                                <el-row style="padding-bottom:5px;">
                                    <el-col :span="24">
                                        <el-input
                                            type="textarea" :rows="4"
                                            v-model="$parent.$parent.term"
                                            placeholder="图搜索"
                                            @clear="$parent.$parent.onClear"
                                            style="width:100%;"
                                            clearable
                                            ref="graphSearch">
                                        </el-input>
                                    </el-col>
                                </el-row>
                                <el-divider content-position="left">历史</el-divider>
                                <el-row style="padding-top:5px;">
                                    <el-col :span="24" v-for="item in history" style="display:flex;flex-wrap:nowrap;">
                                        <el-popover
                                            placement="top-start"
                                            width="200"
                                            trigger="hover"
                                            :content="item.value"
                                            open-delay="1000"
                                            style="width:85%;">
                                            <el-button slot="reference" @click="onSearch(item.value)" style="margin-top:5px;color:#777;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width:100%;text-align:left;">
                                                #{item.value}#
                                            </el-button>
                                        </el-popover>
                                        <el-button
                                            type="text"
                                            icon="el-icon-close"
                                            style="width:15%;text-align:right;color:#999;"
                                            @click="onDeleteHistory(item)">
                                        </el-button>
                                    </el-col>
                                </el-row>
                                <!--topological-graphAdv class="graphAction" :model="$parent.$parent.mainView.search.model" ref="searchRef"></topological-graphAdv-->
                            </el-main>
                            <el-footer style="height:30px;line-height:30px;padding:0 5px;color:#999;">
                                
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
                onDeleteHistory(item){
                    try{
                        let term = _.extend(item, {action:"delete"});
                        fsHandler.callFsJScript("/matrix/graph/history-action.js",encodeURIComponent(JSON.stringify(term))).message;
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
            template:   `<el-container style="100%;">
                            <el-button type="text" icon="el-icon-d-arrow-right" @click="control.show=!control.show" v-show="control.show==false" style="width:30px;"></el-button>
                            <component v-bind:is="currentView" class="animated fadeIn" v-show="control.show==true"></component>
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
                    }
                }
            },
            created(){
                
                // 更新选择列表
                eventHub.$on("GRAPH-VIEW-SEARCH-UPDATE-EVENT", term => {
                    this.term = term;
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
                                    <el-select v-model="edges.value" placeholder="选择关系类型" v-if="key==='type'">
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
                }
            }
        });

        // 实体事件
        Vue.component("entity-diagnosis-event",{
            delimiters: ['#{', '}#'],
            props: {
                model: Object
            },
            template:   `<el-container style="height: calc(100vh - 120px);">
                            <el-main style="padding:10px;">
                                <el-card :style="item | pickBgStyle" 
                                    v-for="item in model.rows" :key="item.id">
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
            methods: {
                onClick(item){
                    let term = item.id;
                    let url = `/janesware/event?term=${window.btoa(encodeURIComponent(term))}`;
                    window.open(url,'_blank');
                }
            }
        })

        // 实体分析-性能 历史曲线图表
        Vue.component('performance-history-chart', {
            template: `<div style="width:100%;height:200px;" ref="chartContainer"></div>`,
            props:{
                model:Object,
                config: Object
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
            created(){
                // 接收窗体RESIZE事件
                eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);
            },
            mounted() {
                this.init();
            },
            watch: {
                model: {
                    handler: function (val,oldVal) {
                        
                    },
                    deep:true
                }
            },
            methods: {
                init(){
                    this.initData();
                    this.chart = echarts.init(this.$el);
                    this.chart.setOption(this.option);
                },
                initData(){
                    const self = this;
                    
                    // 取实时数据的time作为xAxis
                    this.option.xAxis.data = _.map(this.model.value.reverse(),function(v){
                        return moment(v[mx.global.register.performance.chart.time]).format(self.config.step);
                    });
                    
                    this.option.series = _.map(this.config.type,function(v){
                        
                        if(v=='value'){
                            return {    
                                name: v,
                                data: _.map(self.model.value.reverse(), v),
                                type: 'line',
                                smooth: true,
                                color: mx.global.register.performance.chart.color[v],
                                markLine: {
                                    data: [{
                                        type: 'average',
                                        name: '平均值'
                                    }]
                                }
                            }
                        } else {
                            if(!_.isEmpty(self.model.baseline)) {
                                return  {
                                    name: v,
                                    data: _.map(self.model.baseline.reverse(), v=='avg'?'value':v),
                                    type: 'line',
                                    smooth: true,
                                    color: mx.global.register.performance.chart.color[v]
                                }
                            }
                        }
                        
                    });
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
                model:Object
            },
            data(){
                return {
                    baseLine: {
                        type: {
                            value: [],
                            list: [{
                                value: 'week',
                                label: '周基线'
                              }, {
                                value: 'month',
                                label: '月基线'
                              }]
                        }
                    },
                    trends: []
                }
            },
            template: `<el-container style="height: calc(100vh - 120px);">
                            <!--el-header style="height: 30px;padding: 5px;line-height: 20px;">
                                <el-select v-model="baseLine.type.value" placeholder="选择基线" class="el-select">
                                    <el-option
                                    v-for="item in baseLine.type.list"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-header-->
                            <el-main style="padding:10px 0px;">
                                <div class="grid-stack">
                                    <div class="grid-stack-item"
                                        data-gs-auto-position="true"
                                        data-gs-width="12" data-gs-height="3"
                                        v-for="item,index in model.trends">
                                            <div class="grid-stack-item-content" style="border:1px solid #f7f7f7;border-radius:5px;box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                                <el-card class="box-card" style="width: 100%;height:100%;overflow:hidden;" >
                                                    <div slot="header" class="clearfix" style="padding:5px;">
                                                        <span>#{item.param.param}#  历史性能 <small>#{item.title}#</small></span>
                                                        <el-tooltip :content="item.detail">
                                                            <span class="fas fa-question-circle"></span>
                                                        </el-tooltip>    
                                                        <!--el-tooltip content="设置">
                                                            <a href="javascript:void(0);" class="btn btn-link" style="float: right; padding: 3px 0"><i class="fas fa-cog"></i></a>
                                                        </el-tooltip-->
                                                    </div>
                                                    <performance-history-chart  :model="model.rows[item.value]" 
                                                                                :config="item.config"></performance-history-chart>
                                                </el-card>
                                            </div>
                                    </div>
                                </div>
                                
                            
                            </el-main>
                        </el-container>`,
            mounted(){
                _.delay(()=>{
                    $('.grid-stack').gridstack();
                    $('.grid-stack').on('gsresizestop', function(event, elem) {
                        eventHub.$emit("WINDOW-RESIZE-EVENT");
                    });
                },500)
            },
            methods: {
                
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
                                            <el-image style="width:34px;height:34px;margin:5px;" :src="item | pickIcon"></el-image>
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
                    let command = JSON.parse(cmd);
                    this.model = _.orderBy(this.model,[command.prop],[command.type]);
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
                openIt(item, path){
                    const self = this;
    
                    if(typeof(item) === 'string' || item.ftype === 'dir'){
                        self.rootPath = path.replace(/\/\//g,'/');
                        return;
                    }
    
                    if(!_.isEmpty(item)){
    
                        if(_.includes(['png','jpg','jpeg','gif'], item.ftype)) {
    
    
                            let contents = `<img src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}" class="preview-img-responsive center-block" alt="Image">`;
                            let _wnd = maxWindow.winApp(item.name, contents, null,null);
    
                        } else if(_.includes(['mov','mp4','avi'], item.ftype)) {
    
                            let contents = `<div class="embed-responsive embed-responsive-16by9">
                                                <video src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}" controls="controls" autoplay>
                                                    your browser does not support the video tag
                                                </video>
                                            </div>
                                            `;
    
                            let _wnd = maxWindow.winApp(item.name, contents, null,null);
    
                        } else if(_.includes(['pdf'], item.ftype)) {
    
                            let contents = `<div class="embed-responsive embed-responsive-16by9">
                                                <iframe class="embed-responsive-item" src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}"></iframe>
                                            </div>`;
    
                            let _wnd = maxWindow.winApp(item.name, contents, null,null);
    
                        } else if(_.includes(['pptx','ppt'], item.ftype)) {
    
                            window.open(`/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}`, "_blank");
    
                        } else if(_.includes(['js','ltsv','txt','csv','html'], item.ftype)) {
    
                           self.editIt(item);
    
                        } else if(_.includes(['swf'], item.ftype)) {
                            let contents = `<div class="embed-responsive embed-responsive-16by9">
                                                <video src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}" width="100%" height="100%" controls="controls" autoplay>
                                                    Your browser does not support the video tag.
                                                </video>
                                            </div>`;
    
                            let _wnd = maxWindow.winApp(item.name, contents, null,null);
                        } else if(_.includes(['imap','iflow', 'ishow'], item.ftype)) {
                            _.merge(item,{action:'run'});
                            let url = fsHandler.genFsUrl(item,null,null);
                            window.open(url,'_blank');
                        } else if(_.includes(['md'], item.ftype)){
                            _.merge(item,{action:'run'});
    
                            let url = fsHandler.genFsUrl(item,{ header:true, sidebar:true, footbar:true },null);
    
                            window.open(url,'_blank');
                        }
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
                                <el-input v-model="term" clearable placeholder="实体关键字" @blur="searchByTerm" style="margin-bottom:10px;height:32px;">
                                    <template slot="prepend">搜索实体</template>
                                    <el-button slot="append" icon="el-icon-search" @click="searchByTerm" @keyup.enter.native="searchByTerm"></el-button>
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
            template:   `<el-tabs v-model="activeIndex" type="border-card" closable @tab-remove="diagnosisRemove" style="height:100%;">
                            <el-tab-pane :label="item.title" v-for="item in tabs" :key="item.name" :name="item.name" lazy=true style="height:100%;">
                                <el-tabs v-if="item.child" v-model="subIndex" class="entity-diagnosis-tabs" tab-position="left">
                                    <el-tab-pane v-for="it in item.child" :key="it.name" :name="it.name" lazy=true>
                                        <span slot="label">
                                            <el-tooltip :content="it | pickTitle" open-delay="500" placement="left-start">
                                                <el-image :src="it | pickImage" style="width:16px;height:16px;filter: brightness(0.5);"></el-image><!--i class="el-icon-menu"></i-->
                                            </el-tooltip>
                                        </span>
                                        <entity-diagnosis-profile :id="item.name" :model="model[it.type]" v-if="it.type === 'profile'"></entity-diagnosis-profile>
                                        
                                        <el-table-component :model="it.model[it.type]" v-if=" _.includes(['ticket'],it.type) "></el-table-component>

                                        <entity-diagnosis-event :model="it.model[it.type]" v-if=" _.includes(['event','log'],it.type) "></entity-diagnosis-event>

                                        <entity-diagnosis-performance :model="it.model[it.type]" v-if="it.type === 'history'"></entity-diagnosis-performance>
                                        
                                        <diagnosis-base-table :model="it.model[it.type]" v-if=" _.includes(['element'],it.type) "></diagnosis-base-table>

                                        <entity-diagnosis-file :id="it.name" :model="it.model[it.type]" :node="item.node" v-if="it.type === 'file'"></entity-diagnosis-file>
                                        
                                    </el-tab-pane>
                                </el-tabs>
                            </el-tab-pane>
                        </el-tabs>`,
            data(){
                return {
                    tabs:   [],
                    activeIndex: '',
                    subIndex: '',
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
                tabs:function(val,oldVal){
                    if(val.length > 0){
                        this.$root.$data.splitInst.setSizes([0,70,30]);
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
                                type: node.class,
                                class: `/${node.class}`
                            });
                            
                            self.model = fsHandler.callFsJScript("/matrix/graph/diagnosis-by-edge-id.js", encodeURIComponent(JSON.stringify(_.omit(node,'cell')))).message;
                        } else {
                            // node
                            self.model = fsHandler.callFsJScript("/matrix/graph/diagnosis-by-id.js", encodeURIComponent(JSON.stringify(_.omit(node,'cell')))).message;
                        }

                        
                        let id = objectHash.sha1(node);

                        // 检查是否已打开
                        let name = `diagnosis-${id}`;
                        let find = _.find(self.tabs,{name: name});
                        if(find){
                            self.diagnosisRemove(name);
                        }

                        let tab = {
                            title: node.value || node.id, name: `diagnosis-${id}`, type: 'diagnosis', node: node, child:_.map(self.model.template,function(v){
                                return _.extend(v, {name:`diagnosis-${v.name}-${id}`, model: self.model});
                            })};

                        self.activeIndex = tab.name;
                        self.tabs.push(tab);
                        self.subIndex = _.first(tab.child).name;

                    } catch(err){
                        console.log(err)
                    } finally{
                        let graph = this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.graph;
                        //graph.getView().setTranslate(20,20);//将画布放到容器中间
                        // 访问过的节点高亮
                        var highlight = new mxCellHighlight(graph, '#2790e1', 1);
                        highlight.highlight(graph.view.getState(node.cell));
                    }
                    
                },
                diagnosisRemove(targetName) {
                        
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
                            "topological-graph-component",
                            "omdb-path-datatables-component",
                            "event-datatable-component",
                            "event-diagnosis-datatable-component",
                            "event-summary-component",
                            "search-preset-component",
                            "search-base-component",
                            "entity-tree-component"],function() {
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
            template:   `<el-container style="background: transparent;height: 100%;">
                            <el-aside style="background-color:transparent;border:1px solid #ddd;border-right:unset;" class="topological-view-edges" ref="left">
                                <graph-view-edges ref="graphEdgesRef"></graph-view-edges>
                            </el-aside>
                            <el-container :style="containerHeight" ref="main">
                                <graph-view-container ref="graphViewRef"></graph-view-container>
                            </el-container>
                            <el-aside style="height:calc(100vh - 85px);overflow:hidden;background:transparent;border:1px solid #ddd;border-left:unset;" class="topological-view-diagnosis" ref="right">
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
                }
            },
            computed:{
                containerHeight: function(){
                    if(_.endsWith(window.location.pathname,"_link")){
                        return "height: calc(100vh - 10px)";
                    } else {
                        return "height: calc(100vh - 85px)";
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
                        }
                    });
                },1500)
                
            },
            methods: {
                setData(event){
                    this.model = _.extend(this.model, this.$refs.searchRef.result);
                },
                cellSelect(cell){
                    let graph = this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.graph;
                    
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


