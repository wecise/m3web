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
class Performance extends Matrix {

    constructor() {
        super();

    }

    init() {
        VueLoader.onloaded(["vue-editor-component",
            "vue-entity-tree-component",
            "vue-search-preset-component",
            "vue-search-input-component",
            "vue-bootstrap-table",
            "vue-gauge-radial-component",
            "vue-gauge-linear-component",
            "vue-common-form-component",
            "vue-object-detail-component",
            "vue-ci-tags-component",
            "ai-robot-component"], function () {

            var current_class_path = "/matrix/devops/performance";

            $(function () {

                $(".current-active-item").html(`<a class="active item" href="/janesware/performance"><i class="fa fa-signal"></i> &nbsp;{{.i18n.Tr .ActiveView }}</a>`);


                var appVue = new Vue({
                    delimiters: ['${', '}'],
                    el: "#app",
                    template: "#app-template",
                    data: {
                        search: {
                            filter: [],
                            params: {
                                at: '#',
                                class: '/matrix/devops/performance/',
                                subclass: ':',
                                top: 'top 200',
                                lua: ""
                            },
                            input: {
                                type: {type: "performance", quick: ""},
                                term: ""
                            },
                            preset: {},
                            regexp: {
                                top: /top (\d+(\.\d)*)/gmi,
                                undefined: /undefined/g,
                                doubleGrep: /\|(\s+(\|))/g,

                            },
                            result: {
                                dataList: [],
                                data: [],
                                columns: [],
                                options: {
                                    classes: "table table-striped",
                                    toolbar: "#custom-toolbar1",
                                    detailView: false,
                                    search: true,
                                    pageSize: "60",
                                    pageList: "[15,30,45,60]",
                                    locale: '{{.Lang}}'
                                },
                                gauge: {
                                    groupby: [],
                                    list: [],
                                    selected: {}
                                }
                            },
                            currentTimer: null
                        },
                        target: "#dataTable",
                        crontab: {
                            main: {
                                sched: Object,
                                timer: Object
                            },
                            currentTimer: {
                                sched: Object,
                                timer: Object
                            }
                        },
                        toggle: {
                            left: false,
                            top: true,
                            mode: {
                                default: {name:'m', title:'Monitoring Mode', icon: 'fas fa-tachometer'},
                                list:[
                                    {name:'d', title:'Diagnosis Mode', icon: 'fas fa-desktop'},
                                    {name:'o', title:'Operation Mode', icon: 'fas fa-laptop'},
                                    {name:'m', title:'Monitoring Mode', icon: 'fas fa-tachometer-alt'},
                                ]
                            }
                        }
                    },
                    created: function () {
                        let self = this;

                        self.defaultSearch();

                        eventHub.$on('preset-selected-event', self.setPresetDefault);
                        eventHub.$on("input-term-event", self.setSearchTerm);
                        eventHub.$on("input-reset-event", self.setSearchReset);

                    },
                    mounted: function () {
                        let self = this;

                        self.$nextTick(function () {

                            self.onSearch();

                            self.initPlugin();

                        })
                    },
                    watch: {
                        'search.result.data': {
                            handler: function (val, oldVal) {
                                let self = this;

                                $(self.target).bootstrapTable('load', val);

                                self.groupBy(val);

                                self.setGauge();
                            },
                            deep: true
                        },
                        'search.result.gauge.list': {
                            handler: function (val, oldVal) {
                                let self = this;

                                $('.selectpicker').selectpicker('refresh');
                            },
                            deep: true
                        }
                    },
                    methods: {
                        initPlugin: function () {
                            let self = this;

                            $("a[data-toggle='tab']").on("shown.bs.tab", function () {
                                eventHub.$emit("chart-resize-event", null);
                            })

                            $(document).keypress(function (event) {
                                var keycode = (event.keyCode ? event.keyCode : event.which);
                                if (keycode == 13) {
                                    self.onSearch();
                                } else if (keycode == 27) {
                                    self.setSearchReset();
                                    self.onSearch();
                                }
                            })

                            /* cron to refresh */
                            self.crontab.main.sched = later.parse.text('every 30 min');
                            self.crontab.main.timer = later.setInterval(self.onSearch, self.crontab.main.sched);

                            self.crontab.currentTimer.sched = later.parse.text('every 1 sec');
                            self.crontab.currentTimer.timer = later.setInterval(self.refreshCurrentTimer, self.crontab.currentTimer.sched);


                            self.initFilter();

                            /* copy selected word to search */
                            self.copyWordToSearch();

                            App.init();

                        },
                        defaultSearch: function () {
                            let self = this;
                            let _tmp = localStorage.getItem("search-open-performance");

                            if (!_.isEmpty(_tmp)) {
                                let _searchObject = _.attempt(JSON.parse.bind(null, _tmp));

                                self.search.preset = _searchObject.preset;
                                self.search.input.term = _searchObject.id;

                                localStorage.setItem("search-open-performance", "");
                            }

                        },
                        setPresetDefault: function (event) {
                            let self = this;

                            self.search.preset = event;
                        },
                        onSearch: function () {
                            let self = this;
                            let _param = "";
                            let _preset = null;
                            let _ifDebug = "";

                            if(!_.isEmpty(self.search.preset)){
                                _preset = self.search.preset.default;
                                _ifDebug = self.search.preset.others.ifDebug ? "debug> " : "";
                            }

                            if (!_.isEmpty(self.search.input.term)) {

                                let _top = self.search.input.term.match(self.search.regexp.top);

                                if (!_.isEmpty(_top)) {
                                    self.search.params.top = _.last(_top);
                                }

                                _param = self.search.params.at + self.search.params.class + self.search.params.subclass + " | " + self.search.input.term;
                            } else {
                                _param = self.search.params.at + self.search.params.class + self.search.params.subclass;
                            }

                            if (!_.isEmpty(_preset)) {
                                _param = _param + _preset.value + self.search.fortime;
                            } else {
                                _param = _param + _preset.value;
                            }
                            _param = _param + " | " + self.search.params.top;

                            _param = _ifDebug + _param.replace(self.search.regexp.undefined, "").replace(self.search.regexp.doubleGrep, " | ");

                            self.searchHandler(_param, null);
                        },
                        setSearchReset: function () {
                            let self = this;
                            let _param = self.search.params.at + self.search.params.class + self.search.params.subclass;
                            let _preset = self.search.preset.default;

                            self.search.params.top = 'top 200';
                            _param = _param + _preset.value + self.search.preset.others.forTime + " | " + self.search.params.top;

                            self.setSearchTerm("");
                            self.searchHandler(_param, null);
                        },
                        setSearchTerm: function (term) {
                            let self = this;

                            self.search.input.term = term;
                        },
                        filterByTimeLine: function (event) {
                            let self = this;

                            self.search.result.data = _.filter(self.search.result.dataList, function (d) {
                                var time = moment(d.ctime).format("YYYY-MM-DD HH");
                                var tmp = moment.duration(moment(time).diff(event)).asMinutes();

                                if (tmp < 15 && tmp >= 0) {
                                    return d;
                                }
                            })
                        },
                        initTempTable: function () {
                            let self = this;
                            let param = editor.getValue();
                            let cols = [];
                            let _list = fetchData(param);
                            let _data = _list.message;

                            $("#tempDataTable").bootstrapTable('destroy');

                            $.map(_data[0], function (k, v) {

                                var col = v;

                                cols.push({
                                    field: col,
                                    title: col,
                                    sortable: true
                                })

                            });

                            $("#tempDataTable").bootstrapTable({columns: cols});

                            $("#tempDataTable").bootstrapTable('load', _data);
                        },
                        searchHandler: function (param, func) {
                            let self = this;
                            let _list = fetchData(param);

                            if (_.isEmpty(_list.message)) {
                                self.search.result.columns = [];
                                self.search.result.data = [];
                                _.delay(self.setGauge, 500);
                                return false;
                            }

                            let cols = [];

                            cols = window.GLOBAL_OBJECT.company.object.performance.columns || window.GLOBAL_CONFIG.keyspace.wecise.performance['/matrix/devops/performance'].columns;

                            self.preconfig = window.GLOBAL_OBJECT.company.object.performance.preconfig || window.GLOBAL_CONFIG.keyspace.wecise.performance['/matrix/devops/performance'].preconfig;

                            let tmp = _list.meta.columns[_.keys(_list.meta.classes)[0]];

                            if (!_.isEmpty(tmp)) {
                                _.forEach(tmp, function (v) {
                                    var fIndex = _.findIndex(cols, {field: v});
                                    if (fIndex == -1) {
                                        cols.push({field: v, title: _.upperFirst(v), visible: false});
                                    }
                                });
                            }

                            if (_.isEmpty(_.find(cols, {
                                field: "state",
                                checkbox: "true"
                            }))) {
                                cols.unshift({
                                    field: "state",
                                    checkbox: "true"
                                });
                            }

                            self.search.result.columns = cols;
                            self.search.result.data = _list.message;
                            _.delay(self.setGauge, 500);
                        },
                        toggleTop: function () {
                            let self = this;

                            if (self.toggle.top) {

                                $(".event-top").slideDown(500);
                                $(".event-top").css("display", "");

                                $(".toggle-top").removeClass("fa-caret-right");
                                $(".toggle-top").addClass("fa-caret-down");

                                $(".fixed-table-body").css({
                                    "height": "-moz-calc(100vh - 440px)",
                                    "height": "-webkit-calc(100vh - 440px)",
                                    "height": "calc(100vh - 440px)"
                                });

                                self.toggle.top = false;

                            } else {

                                $(".event-top").slideUp(500, function () {
                                    $(".event-top").css("display", "none");

                                    $(".toggle-top").removeClass("fa-caret-down");
                                    $(".toggle-top").addClass("fa-caret-right");

                                    $(".fixed-table-body").css({
                                        "height": "-moz-calc(100vh - 305px)",
                                        "height": "-webkit-calc(100vh - 305px)",
                                        "height": "calc(100vh - 305px)"
                                    });

                                    self.toggle.top = true;

                                })
                            }

                            eventHub.$emit("chart-resize-event", null);
                        },
                        toggleLeft: function () {
                            let self = this;

                            if (self.toggle.left) {

                                $("#nav").hide();

                                $("#mainview").removeClass("col-lg-10");
                                $("#mainview").addClass("col-lg-12");
                                //$("#content").find(".panel-default").css("border-left","1px #ddd solid");

                                $(".navtoggle").removeClass("fa fa-caret-left");
                                $(".navtoggle").addClass("fa fa-caret-right");

                                self.toggle.left = false;
                            } else {
                                $("#nav").slideDown(500);
                                $("#nav").show();

                                $("#mainview").removeClass("col-lg-12");
                                $("#mainview").addClass("col-lg-10");
                                //$("#content").find(".panel-default").css("border-left","2px #ddd dotted");

                                $(".navtoggle").removeClass("fa fa-caret-right");
                                $(".navtoggle").addClass("fa fa-caret-left");

                                self.toggle.left = true;
                            }
                        },
                        toggleMode: function () {
                            let self = this;
                            let _default = _.head(self.toggle.mode.list);
                            let _head = _.nth(self.toggle.mode.list, 1);

                            if (_default.name == 'd') {
                                $(".navbar-fixed-top").css({"display": "none"});
                                $("#page-container").css({"padding-top": "0px"});

                                $(".fixed-table-body").css({
                                    "height": "-moz-calc(100vh - 250px)",
                                    "height": "-webkit-calc(100vh - 250px)",
                                    "height": "calc(100vh - 250px)"
                                });

                            } else if (_default.name == 'o') {

                                $(".performance-search").css({"display": "none"});

                                $(".fixed-table-body").css({
                                    "height": "-moz-calc(100vh - 175px)",
                                    "height": "-webkit-calc(100vh - 175px)",
                                    "height": "calc(100vh - 175px)"
                                });

                                toggleFullScreen();

                            } else {
                                $(".navbar-fixed-top").css({"display": ""});
                                $("#page-container").css({"padding-top": "54px"});
                                $(".performance-search").css({"display": ""});

                                $(".fixed-table-body").css({
                                    "height": "-moz-calc(100vh - 305px)",
                                    "height": "-webkit-calc(100vh - 305px)",
                                    "height": "calc(100vh - 305px)"
                                });
                            }

                            $(".toggle-mode").removeClass(_default.icon);
                            $(".toggle-mode").addClass(_head.icon);
                            $(".toggle-mode").attr("title", _head.title);

                            self.toggle.mode.list.push(self.toggle.mode.list.shift());
                        },
                        toggleFilter: function (filter) {
                            let self = this;

                            self.setSearchTerm(" | " + filter);
                            self.onSearch();
                        },
                        initFilter: function () {
                            let self = this;

                            let _tmp = localStorage.getItem(window.GLOBAL_OBJECT.company.name + "_quick_list_performance");
                            if (!_.isNull(_tmp)) {
                                self.search.filter = _.map(_.attempt(JSON.parse.bind(null, _tmp)), function (v) {
                                    return {name: v.name, value: v.value};
                                });
                            }
                        },
                        topN: function () {
                            let self = this;

                            eventHub.$emit("input-set-event", "inst=cpu* | param=usedpercent | sort value desc | top 10");

                            self.onSearch();
                        },
                        shareIt: function () {
                            let self = this;
                            var term = ` inst=cpu* | param=usedpercent | top 5  | sort value desc | value > 1 | lua value=<lua>return "<pre class='pull-right'  style='color:#3dad00;font-size:22px'><b>" .. string.format("%.2f",_value).. "%</b>&nbsp;<hr><label style='font-size:14px;'>接收人：</label><input class='form-control'><hr><button class='btn btn-xs btn-success' onclick='javascript:alert(111)'>发送</button></pre>"</lua>`;

                            $(".searchinput").find("input").val(term);
                            self.onSearch();
                        },
                        openDashBoardModal: function () {
                            let self = this;
                            var selected = $(self.target).bootstrapTable('getSelections');

                            if (_.isEmpty(selected)) {
                                swal("Please select kpi to generate DashBoard!", "", "info");
                                return false;
                            } else {
                                $('#addDashBoardModal').modal('show')
                            }
                        },
                        saveDashboard: function (ifOpen) {
                            let self = this;
                            var modal = $("#addDashBoardModal");
                            var name = modal.find('#title').val() + ".ishow";//"dashboard_" + Math.floor(_.now() / 1000);
                            //var title = modal.find('#title').val();
                            if (_.isEmpty(name)) {
                                swal("视图标题不能空！", "", "warning");
                                modal.find('#title').setFocus();
                                return false;
                            }

                            var tags = modal.find("#tags").tagsinput('items');
                            var ispublic = $("#ispublic input:radio:checked").val();
                            var skin = $('input[name=radioTheme]:checked').val();
                            var type = $('input[name=radioType]:checked').val();

                            var data = new Object();
                            data.class = '/matrix/dashboard';
                            data.name = name;
                            data.title = title;
                            data.tag = {
                                //"_all": JSON.stringify(tags)
                            };
                            data.star = 0;
                            data.username = '{{.SignedUser.UserName}}';
                            data.ispublic = ispublic;

                            var options = $.map($(self.target).bootstrapTable('getSelections'), function (row) {
                                var o = new Object();
                                o.option = {
                                    title: {
                                        text: row.host,
                                    },
                                    series: {
                                        type: type
                                    }
                                };
                                o.col = 6;
                                o.param = "id=" + row.id + " | top 14440 ";//nearest 1day " + window.GLOBAL_OBJECT.company.object.performance.preconfig.time[0];
                                o.id = _.random(_.now()) + "";
                                return JSON.stringify(o);
                            });

                            data.portlet = options;
                            data.theme = new Array(skin);

                            jQuery.ajax({
                                url: '/fs/home/dashboard/' + name,
                                type: 'PUT',
                                //contentType: "application/text; charset=utf-8",
                                data: {
                                    type: 'file',
                                    data: JSON.stringify(data),
                                    attr: ""
                                },
                                beforeSend: function (xhr) {
                                },
                                complete: function (xhr, textStatus) {
                                },
                                success: function (data, textStatus, xhr) {

                                    modal.modal("hide");

                                    _.delay(function () {
                                        if (ifOpen) {

                                            let _obj = {};

                                            _obj.name = name;
                                            _obj.parent = "/home/dashboard";
                                            _obj.fsExtension = name.split(".")[1] || "ishow";

                                            localStorage.setItem("dashboard-object", JSON.stringify(_obj));

                                            window.open(
                                                "/janesware/" + _obj.fsExtension,
                                                "_blank"
                                            );
                                        }
                                    }, 1000);

                                },
                                error: function (xhr, textStatus, errorThrown) {
                                }
                            })
                        },
                        groupBy: function (event) {
                            let self = this;

                            self.search.result.gauge.groupby = _.omit(_.groupBy(event, "host"), ["undefined", ""]);
                        },
                        setGauge: function () {
                            let self = this;
                            let host = window.GLOBAL_OBJECT.company.object.performance.preconfig.host[0];

                            self.search.result.gauge.list = _.omit(_.groupBy(_.sortBy(_.map(_.cloneDeep(self.search.result.data), function (v, k) {
                                var regex = /<b[^>]*>.*\/b>/i;
                                let m;
                                if ((m = regex.exec(v.value)) !== null) {
                                    m.forEach((match, groupIndex) => {
                                        v.value = match.replace(/<b>/, "").replace(/<\/b>/, "");
                                    });
                                }
                                return v;
                            }), host), host), ["undefined", ""]);

                            _.forEach(_.keys(self.search.result.gauge.list), function (k) {
                                $(".selectpicker.performance-kpi." + k).on("changed.bs.select", function (e) {
                                    self.search.result.gauge.selected["gauge_" + k] = $(this).selectpicker('val');
                                    self.onSearch();
                                });
                            })
                        },
                        getSelectionText: function(){
                            let selectedText = "";

                            if (window.getSelection){ // all modern browsers and IE9+
                                selectedText = window.getSelection().toString();
                            }
                            return selectedText;
                        },
                        copyWordToSearch: function (argument) {
                            let self = this;

                            $("table").mouseup(function(){
                                var selected = self.getSelectionText();
                                if (selected.length > 0){
                                    if (_.isEmpty(self.search.input.term)){
                                        self.search.input.term = selected;
                                    } else {
                                        self.search.input.term += selected;
                                    }
                                }
                            })
                        },
                        refreshCurrentTimer: function () {
                            let self = this;

                            self.search.currentTimer = moment().format("LL") + " " + moment().format("LTS");
                        }
                    }
                })
            });

            /**
             * @author cnwangzd
             * @todo 工具栏级别过滤
             */
            $('.selectpicker.param').on('changed.bs.select', function (e) {
                var selected = $(this).val();
            });

            function formaterDate(value, row, index) {
                return moment(value).format('YYYY-MM-DD HH:mm:ss');
            }
        })
    }
}

let performance = new Performance();
performance.init();