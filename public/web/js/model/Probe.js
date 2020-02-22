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
            "script-manage",
            "script-datatable"], function () {

            // Table组件 单选
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
                template:   `<el-container style="width:100%;height:100%;">
                                <el-header style="height:30px;line-height:30px;">
                                    <el-tooltip content="刷新" open-delay="500" placement="top">
                                        <el-button type="text" icon="el-icon-refresh" @click="eventHub.$emit('PROBE-REFRESH-EVENT', ['script'])"></el-button>
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

            Vue.component("probe-view", {
                props: {
                    model: Object
                },
                template: `<el-container style="height:calc(100vh - 145px);">
                                <el-aside ref="leftView" style="background:#f7f7f7;">
                                    <entity-tree-component id="probe-tree" :model="{parent:'/probe',name:'probe_tree_data.js',domain:'probe'}" ref="tagTree"></entity-tree-component>
                                </el-aside>
                                <el-main style="padding:0px;" ref="mainView">
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
                        Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                            sizes: [20, 80],
                            minSize: [0, 0],
                            gutterSize: 5,
                            gutterAlign: 'end',
                            cursor: 'col-resize',
                            direction: 'horizontal',
                            expandToMin: true
                        });
                    })   
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
                props: {
                    model: Object
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
                mounted(){
                    this.$nextTick().then(()=>{
                        Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                            sizes: [20, 80],
                            minSize: [0, 0],
                            gutterSize: 5,
                            gutterAlign: 'end',
                            cursor: 'col-resize',
                            direction: 'horizontal',
                            expandToMin: true
                        });
                    })   
                }
            });

            $(function () {

                this.app = new Vue({
                    delimiters: ['${', '}'],
                    template: ` <el-container style="background:#ffffff;">
                                    <el-main style="padding:0px;overflow:hidden;">
                                        <el-tabs v-model="tabs.activeName" type="border-card">
                                            <el-tab-pane label="探针列表" name="probe">
                                                <probe-view :model="probe"></probe-view>
                                            </el-tab-pane>
                                            <!--el-tab-pane label="策略管理" name="policy">
                                                <policy-view :model="policy"></policy-view>
                                            </el-tab-pane-->
                                            <!--el-tab-pane label="日志配置" name="log">
                                                <log-view :model="log"></log-view>
                                            </el-tab-pane-->
                                            <el-tab-pane label="脚本管理" name="script">
                                                <script-view :model="script"></script-view>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    data: {
                        probe: {},
                        policy: {},
                        log: {},
                        script: {},
                        tabs:{
                            activeName: 'probe',
                        }
                    },
                    created() {
                        eventHub.$on("PROBE-REFRESH-EVENT", this.initData);
                    },
                    mounted() {
                        this.$nextTick(()=> {
                            this.init();
                            _.delay(()=> {
                                this.initPlug();
                            }, 3000)
                        })
                    },
                    methods: {
                        init() {
                            //this.initData(['probe', 'policy', 'script', 'log']);
                            this.initData(['probe', 'script']);
                        },
                        initPlug() {
                            /* toggle tab trigger Echart resize */
                            $("a[data-toggle='tab']").on("shown.bs.tab", ()=> {
                                eventHub.$emit("COMPONENT-REDRAW-EVENT", null);
                            })
                        },
                        initData(event) {
                            _.forEach(event, (v)=> {
                                window[v] = fsHandler.callFsJScript(`/matrix/probe/probe_summary_by_${v}.js`, '');

                                if (window[v].status == 'ok') {
                                    this[v] = window[v].message;
                                } else {
                                    this[v] = [];
                                }
                            })

                        }
                    }
                }).$mount("#app");

            });

        })
    }
}

let probe = new Probe();
probe.init();