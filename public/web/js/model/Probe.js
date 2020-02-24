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
            "probe-manage",
            "script-manage",
            "script-datatable"], function () {

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
                        this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                            sizes: [0, 100],
                            minSize: [0, 0],
                            gutterSize: 5,
                            gutterAlign: 'end',
                            cursor: 'col-resize',
                            direction: 'horizontal',
                            expandToMin: true
                        });
                    })   
                },
                methods: {
                    onToggle(){
                        if(this.splitInst.getSizes()[0] == 0){
                            this.splitInst.setSizes([20,80]);
                        } else {
                            this.splitInst.setSizes([0,100]);
                        }
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
                props: {
                    model: Object
                },
                data(){
                    return {
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
                mounted(){
                    this.$nextTick().then(()=>{
                        this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                            sizes: [0, 100],
                            minSize: [0, 0],
                            gutterSize: 5,
                            gutterAlign: 'end',
                            cursor: 'col-resize',
                            direction: 'horizontal',
                            expandToMin: true
                        });
                    })   
                },
                methods: {
                    onToggle(){
                        if(this.splitInst.getSizes()[0] == 0){
                            this.splitInst.setSizes([20,80]);
                        } else {
                            this.splitInst.setSizes([0,100]);
                        }
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
                                            <el-tab-pane label="脚本管理" name="script">
                                                <script-view :model="script" ref="scriptView"></script-view>
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