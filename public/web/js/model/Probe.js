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
            "probe-tree-component",
            "probe-dropdown-tree-component",
            "probe-card-component",
            "probe-list-datatables-component",
            "policy-list-datatables-component",
            "log-list-datatables-component",
            "script-list-datatables-component"], function () {

            Vue.component("probe-view", {
                props: {
                    model: Object
                },
                template: `<el-container style="height:calc(100vh - 140px);">
                                <el-aside style="width:200px;margin:-15px -10px -15px -15px;">
                                    <probe-tree-component id="probe-tree" :model="{parent:'/probe',name:'probe_tree_data.js',domain:'probe'}"></probe-tree-component>
                                </el-aside>
                                <el-main class="probe-container" style="padding:0px;">
                                    <!--h4 class="page-header"><i class="fas fa-angle-right"></i> 探针列表</h4 class="page-header"-->
                                    <el-container>
                                        <el-header style="height:120px;padding:0px;">
                                            <probe-card-component :model="model.summary"></probe-card-component>
                                        </el-header>
                                        <el-main style="padding:0px;">
                                            <probe-list-datatables-component :model="model" id="probe-list-table"></probe-list-datatables-component>
                                        </el-main>
                                    </el-container>
                                </el-main>
                            </el-container>`
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
                template: `<el-container style="height:calc(100vh - 140px);">
                                <el-aside style="width:200px;margin:-15px -10px -15px -15px;">
                                    <probe-tree-component id="script-tree" :model="{parent:'/probe',name:'script_tree_data.js',domain:'script'}"></-tree-component>
                                </el-aside>
                                <el-main class="script-container" style="padding:0px;">
                                    <!--h4 class="page-header"><i class="fas fa-angle-right"></i> 脚本管理</h4 class="page-header"-->
                                    <script-list-datatables-component :model="model" id="script-list-table"></script-list-datatables-component>
                                </el-main>
                            </el-container>`
            });

            $(function () {

                this.app = new Vue({
                    delimiters: ['${', '}'],
                    template: ` <el-container style="background:#ffffff;">
                                    <el-main style="padding:0 10px;overflow:hidden;">
                                        <el-tabs v-model="tabs.activeName" class="el-tabs-bottom-line">
                                            <el-tab-pane label="探针列表" name="probe">
                                                <probe-view :model="probe"></probe-view>
                                            </el-tab-pane>
                                            <el-tab-pane label="策略管理" name="policy">
                                                <policy-view :model="policy"></policy-view>
                                            </el-tab-pane>
                                            <el-tab-pane label="日志配置" name="log">
                                                <log-view :model="log"></log-view>
                                            </el-tab-pane>
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
                    created: function () {
                        eventHub.$on("PROBE-REFRESH-EVENT", this.initData);
                    },
                    mounted: function () {
                        let self = this;

                        self.$nextTick(function () {

                            self.init();

                            _.delay(function () {
                                self.initPlug();
                            }, 3000)
                        })
                    },
                    methods: {
                        init: function () {
                            let self = this;

                            self.initData(['probe', 'policy', 'script', 'log']);
                        },
                        initPlug: function () {
                            let self = this;

                            /* toggle tab trigger Echart resize */
                            $("a[data-toggle='tab']").on("shown.bs.tab", function () {
                                eventHub.$emit("COMPONENT-REDRAW-EVENT", null);
                            })
                        },
                        initData: function (event) {
                            let self = this;

                            _.forEach(event, function (v) {
                                window[v] = fsHandler.callFsJScript(`/probe/probe_summary_by_${v}.js`, '');

                                if (window[v].status == 'ok') {
                                    self[v] = window[v].message;
                                } else {
                                    self[v] = [];
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