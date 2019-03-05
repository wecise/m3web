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
class Log extends Matrix {

    constructor() {
        super();
    }

    init() {
        VueLoader.onloaded(["vue-editor-component",
            "vue-entity-heatmap-component",
            "vue-entity-tree-component",
            "vue-echart-timeline-component",
            "vue-search-preset-component",
            "vue-search-input-component",
            "vue-bootstrap-table",
            "vue-common-form-component",
            "vue-object-detail-component",
            "vue-ci-tags-component",
            "ai-robot-component"], function () {

            let RENDER_BY_LUA = `| lua msg=<lua>
                                        if "shell"==src then
                                          return "<pre style='border:0px;'>"..string.gsub(msg, "UN", "<kbd style='background-color:#4AB93D;'>".."%1".."</kbd>").."</pre>" 
                                        end
                                      </lua>
                            | lua msg=<lua> 
                                        if "shell"==src then
                                          return "<pre style='border:0px;'>"..string.gsub(msg, "DN", "<kbd style='background-color:#ff0000;'>".."%1".."</kbd>").."</pre>" 
                                        end
                                      </lua>`;

            /**
             * @author cnwangzd
             * @todo
             */
            $(function () {

                $(".current-active-item").html(`<a class="active item" href="/janesware/log"><i class="fa fa-file-code-o"></i> &nbsp;{{.i18n.Tr .ActiveView }}</a>`);

                var appVue = new Vue({
                    delimiters: ['${', '}'],
                    el: "#app",
                    template: "#app-template",
                    data: {
                        search: {
                            mark: {
                                words: [],
                                options: {
                                    element: "mark",
                                    separateWordSearch: true
                                }
                            },
                            filter: [],
                            params: {
                                at: '#',
                                class: '/matrix/devops/log/',
                                subclass: ':',
                                top: 'top 200',
                                lua: RENDER_BY_LUA
                            },
                            filter: [],
                            input: {
                                type: {type: "log", quick: ""},
                                term: ""
                            },
                            preset: {},
                            regexp: {
                                top: /top (\d+(\.\d)*)/gmi,
                                undefined: /undefined/g,
                                doubleGrep: /\|(\s+(\|))/g,

                            },
                            result: {
                                data: [],
                                columns: [],
                                options: {
                                    classes: "table table-no-bordered",
                                    pageSize: "30",
                                    pageList: "[15,30,45,60]",
                                    detailView: false,
                                    buttonsAlign: "right",
                                    locale: '{{.Lang}}',
                                    search: true,
                                    toolbar: "#custom-toolbar1",
                                },
                            },
                            currentTimer: null
                        },
                        summary: {
                            bySeverity: [],
                            byHost: [],
                            data: {
                                list: [],
                                scale: {},
                                param: ""
                            },
                            filter: []
                        },
                        target: "#dataTable",
                        preconfig: {},
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
                                default: {name: 'm', title: 'Monitoring Mode', icon: 'fa fa-tachometer'},
                                list: [
                                    {name:'d', title:'Diagnosis Mode', icon: 'fas fa-desktop'},
                                    {name:'o', title:'Operation Mode', icon: 'fas fa-laptop'},
                                    {name:'m', title:'Monitoring Mode', icon: 'fas fa-tachometer-alt'},
                                ]
                            }
                        }
                    },
                    watch: {
                        'summary.data.list': {
                            handler: function (val, oldVal) {
                                let self = this;

                                self.summaryEvent(val);
                            },
                            deep: true
                        },
                        'search.mark.words': {
                            handler: function (val, oldVal) {
                                let self = this;

                                _.delay(function () {

                                    $("table tr td:last-child").unmark({
                                        done: function () {
                                            $("table tr td:last-child").mark(val, self.search.mark.options);
                                        }
                                    });

                                }, 1000)
                            },
                            deep: true
                        },
                        'summary.filter': {
                            handler: function (val, oldVal) {
                                let self = this;

                                if (!_.isEmpty(val)) {
                                    $(".chart-panel").find(".btn-return").remove();
                                    $(".chart-panel").append(`<a href="javascript:void(0)" 
                                                             class="btn btn-xs btn-default btn-return" 
                                                             style="position: relative; right: -10px; top: -130px; float: right;">
                                                             <i class="fa fa-close"></i>
                                                          </a>`);
                                    $(".chart-panel .btn-return").click(function (event) {
                                        // reset search
                                        self.summary.filter = [];
                                        self.search.preset.default = {
                                            "name": "Nearest 1 day",
                                            value: " | nearest 1 day ",
                                            scale: {
                                                'scale': 'day',
                                                'step': 4,
                                                'title': 'Day',
                                                'pattern': 'LT',
                                                'filter': 'YYYY/MM/DD HH'
                                            }
                                        };
                                        self.onSearch();
                                    })
                                } else {
                                    $(".chart-panel").find(".btn-return").remove();
                                }
                            },
                            deep: true
                        }

                    },
                    created: function () {
                        let self = this;

                        eventHub.$on('preset-selected-event', self.setPresetDefault);

                        eventHub.$on("input-term-event", self.setSearchTerm);
                        eventHub.$on("input-reset-event", self.setSearchReset);
                        eventHub.$on("quick-update-event", self.initFilter);

                        self.defaultSearch();
                    },
                    mounted: function () {
                        let self = this;

                        self.$nextTick(function () {

                            self.onSearch();

                            self.initPlugin();

                        })
                    },
                    methods: {
                        initPlugin: function () {
                            let self = this;

                            $(self.target).on('click-row.bs.table', function (e, row, $element) {
                                $('.info').removeClass('info');
                                $($element).addClass('info');
                            });

                            $("a[data-toggle='tab']").on("shown.bs.tab", function () {
                                eventHub.$emit("chart-resize-event", null);
                            });

                            $(document).keypress(function (event) {
                                var keycode = (event.keyCode ? event.keyCode : event.which);
                                if (keycode == 13) {
                                    self.onSearch();
                                } else if (keycode == 27) {
                                    self.setSearchReset();
                                    self.onSearch();
                                }
                            })

                            self.initFilter();

                            /* copy selected word to search */
                            self.copyWordToSearch();

                            /* cron to refresh */
                            self.crontab.main.sched = later.parse.text('every 30 min');
                            self.crontab.main.timer = later.setInterval(self.onSearch, self.crontab.main.sched);

                            self.crontab.currentTimer.sched = later.parse.text('every 1 sec');
                            self.crontab.currentTimer.timer = later.setInterval(self.refreshCurrentTimer, self.crontab.currentTimer.sched);

                        },
                        defaultSearch: function () {
                            let self = this;
                            let _tmp = localStorage.getItem("search-open-log");

                            if (!_.isEmpty(_tmp)) {
                                let _searchObject = _.attempt(JSON.parse.bind(null, _tmp));

                                self.search.preset = _searchObject.preset;
                                self.search.input.term = _searchObject.id;

                                localStorage.setItem("search-open-log", "");
                            }

                        },
                        setPresetDefault: function (event) {
                            let self = this;

                            self.search.preset = event;
                        },
                        setSearchReset: function () {
                            let self = this;
                            let _param = self.search.params.at + self.search.params.class + self.search.params.subclass;
                            let _preset = self.search.preset.default;

                            _param = _param + _preset.value + self.search.preset.others.forTime + " | " + self.search.params.top;

                            self.setSearchTerm("");
                            self.searchHandler(_param, null);
                        },
                        setSearchTerm: function (term) {
                            let self = this;

                            self.search.input.term = term;
                        },
                        summaryEvent: function (event) {
                            let self = this;
                            var byName = "";
                            var bySeverity = {};

                            // For Gauge & Severity Btn
                            self.summary.byHost = [];
                            self.summary.bySeverity = [];

                            byGroupName = window.GLOBAL_OBJECT.company.object.log.preconfig.host[0];
                            bySeverity = window.GLOBAL_OBJECT.company.object.log.preconfig.severity;

                            let groupByHost = _.omit(_.groupBy(_.cloneDeep(event), byGroupName), ['undefined', '']);
                            let groupBySeverity = _.omit(_.groupBy(_.cloneDeep(event), bySeverity.name[0]), ['undefined', '']);

                            _.forEach(groupByHost, function (v, k) {

                                let groupBySeverity = _.omit(_.groupBy(v, bySeverity.name[0]), ['undefined', '']);

                                _.forEach(groupBySeverity, function (val, key) {
                                    let t = {};
                                    t.name = k;
                                    t.length = val.length;
                                    t.severity = key;
                                    t.color = bySeverity.level[key] ? bySeverity.level[key].color : bySeverity.level["other"].color;

                                    self.summary.byHost.push(t);
                                })
                            });

                            _.forEach(groupBySeverity, function (v, k) {

                                let s = {};
                                s.name = bySeverity.level[k] ? bySeverity.level[k].name : bySeverity.level["other"].name;
                                s.count = v.length;
                                s.severity = k;
                                s.color = bySeverity.level[k] ? bySeverity.level[k].color : bySeverity.level["other"].color;

                                self.summary.bySeverity.push(s);
                            });

                            self.summary.byHost = _.omit(_.groupBy(self.summary.byHost, 'name'), ['undefined', '']);
                        },
                        onSearch: function () {
                            let self = this;
                            let _param = "";
                            let _preset = self.search.preset.default;
                            let _ifDebug = self.search.preset.others.ifDebug ? "debug> " : "";

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
                        initSearchBar: function () {
                            let self = this;

                            $search = $(".searchinput input");
                            $search.off("keyup drop").on("keyup drop", function (event) {

                                clearTimeout(timeoutId); // doesn't matter if it's 0
                                timeoutId = setTimeout(function () {
                                    if (_.trim($search.val()).length > 0) {
                                        self.onSearch(" | " + _.trim($search.val()));
                                    } else {
                                        self.onSearch(_.trim($search.val()));
                                    }
                                }, 500);
                            });
                        },
                        filterDataTable: function (event) {
                            let self = this;

                            var tt = [];
                            _.forEach(self.search.result.data, function (v, k) {
                                var tmp = moment(v.ctime).format(self.search.default.scale.pattern);
                                if (tmp == event) {
                                    tt.push(v);
                                }
                            })
                            self.search.result.data = [];
                            self.search.result.data = tt;
                        },
                        searchHandler: function (param, func) {
                            let self = this;
                            let _list = omdbHandler.fetchData(param);

                            if (_.isEmpty(_list.message)) {
                                self.search.result.data = [];
                                self.summary.data.list = self.search.result.data;
                                return false;
                            }

                            var cols = [];

                            cols = window.GLOBAL_OBJECT.company.object.log.columns;
                            self.preconfig = window.GLOBAL_OBJECT.company.object.log.preconfig;

                            let tmp = _list.meta.columns[_.keys(_list.meta.classes)[0]];
                            if (!_.isEmpty(tmp)) {
                                _.forEach(tmp, function (v) {
                                    var fIndex = _.findIndex(cols, {field: v});
                                    if (fIndex == -1) {
                                        cols.push({field: v, title: _.startCase(_.camelCase(v)), visible: false});
                                    }
                                });
                            }

                            self.search.result.columns = window.GLOBAL_OBJECT.company.object.log.columns;//cols;
                            self.search.result.data = _list.message;

                            self.summary.data.list = self.search.result.data;
                            self.summary.data.scale = self.search.preset.scale;

                            self.search.mark.words = _.map(_list.meta.words, function (v) {
                                return v.replace(/\*/g, "");
                            });
                            self.toggle.top = false;
                            self.toggleTop();

                            _.delay(function () {
                                self.toggleDefault();
                            }, 500);

                        },
                        setFilterBySeverity: function (event) {
                            let self = this;
                            let s = {};
                            let obj = $(".event-severity-btn ." + event);
                            let _class = obj.attr("class");
                            let _severity = obj.data("value");

                            s.name = window.GLOBAL_OBJECT.company.object.log.preconfig.severity.name[0];
                            s.value = _severity;
                            s.type = "match";

                            if (_class.indexOf("active") != -1) {
                                self.summary.filter = _.values(_.omitBy(self.summary.filter, s));
                            } else {
                                self.summary.filter.push(s);
                            }
                        },
                        setupFilter: function (cond) {
                            let self = this;

                            self.summary.filter = [];

                            if (_.findIndex(self.summary.filter, cond) != -1) {
                                self.summary.filter = _.values(_.omitBy(self.summary.filter, cond));
                            } else {
                                self.summary.filter.push(cond);
                            }
                        },
                        getCustomDateTime: function (datetime, cond) {
                            let self = this;

                            if (cond === 'L') {
                                return datetime.split("T")[0];
                            } else if (cond === 'LT') {
                                return datetime.substring(0, 13);
                            } else if (cond === 'LTS') {
                                return datetime.substring(0, 16);
                            }
                        },
                        setFilterParamByTime: function (event) {
                            let self = this;

                            let _time = {};

                            _time.name = window.GLOBAL_OBJECT.company.object.log.preconfig.time[0];
                            _time.value = self.getCustomDateTime(event.time, event.pattern);
                            _time.type = "contains";

                            self.setupFilter(_time);

                            console.log(JSON.stringify(self.summary.filter));
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
                        toggleDefault: function () {
                            let self = this;

                            $(".fixed-table-body").css({
                                "height": "-moz-calc(100vh - 305px)",
                                "height": "-webkit-calc(100vh - 305px)",
                                "height": "calc(100vh - 305px)"
                            });
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

                                $(".log-search").css({"display": "none"});

                                $(".fixed-table-body").css({
                                    "height": "-moz-calc(100vh - 175px)",
                                    "height": "-webkit-calc(100vh - 175px)",
                                    "height": "calc(100vh - 175px)"
                                });

                                toggleFullScreen();

                            } else {
                                $(".navbar-fixed-top").css({"display": ""});
                                $("#page-container").css({"padding-top": "54px"});
                                $(".log-search").css({"display": ""});

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


                        },
                        initFilter: function () {
                            let self = this;

                            let _tmp = localStorage.getItem(window.GLOBAL_OBJECT.company.name + "_quick_list_log");
                            if (!_.isNull(_tmp)) {
                                self.search.filter = _.map(_.attempt(JSON.parse.bind(null, _tmp)), function (v) {
                                    return {name: v.name, value: v.value};
                                });
                            }
                        },
                        getSelectionText: function () {
                            var selectedText = ""
                            if (window.getSelection) { // all modern browsers and IE9+
                                selectedText = window.getSelection().toString()
                            }
                            return selectedText;
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
            })

            function formaterDate(value, row, index) {
                return moment(value).format('YYYY-MM-DD HH:mm:ss');
            }
        })
    }
}

let log = new Log();
log.init();