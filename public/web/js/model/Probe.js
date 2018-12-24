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
    }

    init() {
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
                template: `<div class="row">
                            <div class="col-lg-2">
                                <probe-tree-component id="probe-tree" :model="{parent:'/probe',name:'probe_tree_data.js',domain:'probe'}"></probe-tree-component>
                            </div>

                            <div class="col-lg-10 probe-container">
                                <h4 class="page-header"><i class="fas fa-angle-right"></i> 探针列表</h4 class="page-header">
                                <probe-card-component :model="model.summary"></probe-card-component>
                                <probe-list-datatables-component :model="model" id="probe-list-table"></probe-list-datatables-component>
                            </div>
                        </div>`
            });

            Vue.component("policy-view", {
                props: {
                    model: Object
                },
                template: `<div class="row">
                            <div class="col-lg-2">
                                <probe-tree-component id="policy-tree" :model="{parent:'/probe',name:'policy_tree_data.js',domain:'policy'}"></-tree-component>
                            </div>

                            <div class="col-lg-10 policy-container">
                                <h4 class="page-header"><i class="fas fa-angle-right"></i> 策略管理</h4 class="page-header">
                                <policy-list-datatables-component :model="model" id="policy-list-table"></policy-list-datatables-component>
                            </div>
                        </div>`
            });

            Vue.component("log-view", {
                props: {
                    model: Object
                },
                template: `<div class="row">
                          <div class="col-lg-2">
                            <probe-tree-component id="log-tree" :model="{parent:'/probe',name:'log_tree_data.js',domain:'log'}"></-tree-component>
                          </div>

                          <div class="col-lg-10 log-container">
                            <h4 class="page-header"><i class="fas fa-angle-right"></i> 日志管理</h4 class="page-header">
                            <log-list-datatables-component :model="model" id="log-list-table"></log-list-datatables-component>
                          </div>
                       </div>`
            });

            Vue.component("script-view", {
                props: {
                    model: Object
                },
                template: `<div class="row">
                            <div class="col-lg-2">
                                <probe-tree-component id="script-tree" :model="{parent:'/probe',name:'script_tree_data.js',domain:'script'}"></-tree-component>
                            </div>
                            <div class="col-lg-10 script-container">
                                <h4 class="page-header"><i class="fas fa-angle-right"></i> 脚本管理</h4 class="page-header">
                                <script-list-datatables-component :model="model" id="script-list-table"></script-list-datatables-component>
                            </div>
                        </div>`
            });

            $(function () {

                var appVue = new Vue({
                    delimiters: ['${', '}'],
                    el: "#app",
                    template: "#app-template",
                    data: {
                        probe: {},
                        policy: {},
                        log: {},
                        script: {}
                    },
                    created: function () {
                        let self = this;

                        eventHub.$on("PROBE-REFRESH-EVENT", self.initData);
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
                                window[v] = callFsJScript(`/probe/probe_summary_by_${v}.js`, '');

                                if (window[v].status == 'ok') {
                                    self[v] = window[v].message;
                                } else {
                                    self[v] = [];
                                }
                            })

                        }
                    }
                })

            });

        })
    }
}

let probe = new Probe();
probe.init();