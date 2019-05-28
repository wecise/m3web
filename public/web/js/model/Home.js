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
class Home extends Matrix {

    constructor() {
        super();

        this.app = null;
    }

    init() {
        VueLoader.onloaded(["vue-editor-component",
            "vue-search-preset-component",
            "ai-robot-component"],function() {

            $(function() {

                var timeoutId = 0;

                mxHome.app = {
                    delimiters: ['#{', '}#'],
                    template: '#app-template',
                    data: {
                        search: {
                            input: {
                                type: {type:"home",quick: ""},
                                term: ""
                            },
                            preset: {},
                            regexp: {
                                top: /top (\d+(\.\d)*)/gmi,
                                undefined:  /undefined/g,
                                doubleGrep: /\|(\s+(\|))/g,

                            }
                        },
                        user: {
                            appsId: [],
                            apps: [],
                            appList: []
                        },
                        path: {
                            view: "event.html",
                            _csrf: "{{.CsrfToken}}"
                        }
                    },
                    filters:{
                        pickIcon:function(icon){
                            return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
                        }
                    },
                    created: function(){
                        let self = this;

                        eventHub.$on('preset-selected-event', self.setPresetDefault);

                        if(!_.isEmpty(window.SignedUser_Remark)){
                            self.user.appsId = window.SignedUser_Remark.replace(/\"/g,"").split(",");
                        }

                    },
                    mounted: function(){
                        let self = this;


                        self.$nextTick()
                            .then(function () {
                                self.init();
                                self.initPlugIn();
                            })

                    },
                    methods: {
                        init: function() {
                            let self = this;

                            let $search = $(".search");
                            $search.off("keyup drop").on("keyup drop", function(event) {

                                clearTimeout(timeoutId);
                                timeoutId = setTimeout(function() {
                                    let term = _.trim($search.val());

                                    if(!_.isEmpty(term)){
                                        self.nowSearch(term);
                                    }

                                }, 500);
                            })
                        },
                        initPlugIn: function(){
                            let self = this;

                            self.loadApps();

                            self.initContextMenu();

                            //App.init();
                        },
                        initContextMenu: function(){
                            let self = this;

                            $.contextMenu({
                                selector: '.list-context-menu',
                                trigger: 'left',
                                build: function($trigger, e) {
                                    // this callback is executed every time the menu is to be shown
                                    // its results are destroyed every time the menu is hidden
                                    // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                                    let _item = e.target.attributes.getNamedItem('data-item').value;

                                    return {

                                        items: {
                                            "default": {name: '设为首页', icon: "fas fa-home", callback: function(key, opt) {
                                                    mx.setDefaultHome('janesware/' + _item.split("/")[2], self.path._csrf);
                                                }
                                            }
                                        }
                                    };
                                }
                            });

                        },
                        setPresetDefault: function(event){
                            let self = this;

                            self.search.preset = event;
                        },
                        nowSearch: function(term) {
                            let self = this;
                            let _param = "";
                            let _preset = self.search.preset.default;
                            let _ifHistory = self.search.preset.others.ifHistory?"":"#";
                            let _ifDebug = self.search.preset.others.ifDebug?"debug> ":"";
                            let _forTime = self.search.preset.others.forTime;

                            if(_.isEmpty(_preset)){
                                _param = term;
                            } else {
                                _param = term + _preset.value;
                            }

                            _param = _ifDebug + _ifHistory + _param;// + _forTime;

                            let _list = omdbHandler.fetchData(_param);
                            if(_.isEmpty(_list.message)){
                                $("#search-result-panel").fadeOut(500);
                                $("#search-result-panel").hide();
                                return false;
                            }

                            self.searchResult(_list);

                            $("#search-result-panel").fadeIn(500);
                            $("#search-result-panel").show();

                        },
                        searchResult: function(result){
                            var self = this;

                            $("#search-result-panel").empty();
                            $("#search-result-panel").append(`<div id="search-result-content"></div>`);

                            var resultVue = new Vue({
                                delimiters: ['${', '}'],
                                el: "#search-result-content",
                                template: "#search-result-content-template",
                                data: {
                                    model:[],
                                },
                                mounted: function(){
                                    let self = this;

                                    self.$nextTick(function(){
                                        self.init();
                                    })
                                },
                                watch: {
                                    model: {
                                        handler: function(val,oldVal){
                                            let self = this;

                                            if(_.isEmpty(val)){

                                            }
                                        },
                                        deep:true
                                    }
                                },
                                methods: {
                                    init: function(){
                                        let self = this;
                                        var _groupByClass = _.omit(_.groupBy(result.message,'class'),["undefined",""]);

                                        self.model = _.map(_groupByClass, function(v,k){
                                            let _minTime = moment(_.minBy(v,'vtime')['vtime']).format('LLL');
                                            let _maxTime = moment(_.maxBy(v,'vtime')['vtime']).format('LLL');
                                            return {name: k, count: v.length, from:_minTime, to:_maxTime, list: v};
                                        });
                                    },
                                    copyToClipBoard: function() {
                                        let self = this;
                                        var clipboard = new Clipboard('.btn-copy', {
                                            text: function() {
                                                return self.model.list;
                                            }
                                        });

                                        clipboard.on('success', function(e) {
                                            alertify.log("已复制 " + e);
                                        });

                                        clipboard.on('error', function(e) {
                                            alertify.log(e);
                                        });
                                    }
                                }
                            });
                        },
                        hideSearch: function(){
                            $("#search-result-panel").hide();
                        },
                        onSearch: function() {
                            let self = this;
                            let _term = _.trim($(".search").val());

                            if (_term.length < 1) {
                                alertify.log("请输入搜索关键字");
                                $(".search").focus();
                                return false;
                            }

                            localStorage.setItem("search-object",JSON.stringify({
                                    cond:_term,
                                    preset:self.search.preset
                                })
                            );
                            window.open(
                                "/janesware/search",
                                "_parent"
                            );
                        },
                        loadApps: function() {
                            let self = this;

                            let _list = omdbHandler.fetchData("#/matrix/portal/tools/: | sort by seat asc");

                            self.user.appList = _.orderBy(_list.message,["seat"],["asc"]);
                            self.user.apps = [];

                            _.forEach(self.user.appsId,function(v){
                                self.user.apps.push (_.find(self.user.appList,{id:v}));
                            });

                            self.user.apps = _.remove(self.user.apps,null);

                            self.user.appList = _.map(self.user.appList,function(v){

                                let _idx =  _.find(self.user.apps,{id:v.id});

                                if(!_.isEmpty(_idx)){
                                    v.selected = 1;
                                }else{
                                    v.selected = 0;
                                }
                                return v;
                            });

                        },
                        toogle: function(item) {
                            let self = this;
                            let ldap = new Object();

                            ldap.class = "/matrix/ldap";
                            ldap.fullname = window.SignedUser_FullName;

                            if(_.indexOf(self.user.appsId, item.id) > -1){
                                _.pull(self.user.appsId,item.id);
                            } else {
                                self.user.appsId.push(item.id);
                            }

                            ldap.remark = self.user.appsId.join(",");

                            let _rtn = omdbHandler.putDataToClass(ldap);

                            if(_rtn == 1){
                                self.loadApps();
                            }

                        },
                        resetForm: function(){
                            let self = this;

                            var elements = $("form").find( "input,select,textarea" );
                            for( var i = 0; i < elements.length; ++i ) {
                                var element = elements[i];
                                var id = element.id;
                                var value = element.value;

                                if( id ) {
                                    $(id).val("");
                                }
                            }
                        },
                        toJsonString: function(event) {
                            var obj = {};
                            var elements = $("form."+event).find( "input,select,textarea" );

                            for( var i = 0; i < elements.length; ++i ) {
                                var element = elements[i];
                                var id = element.id;
                                var value = element.value;

                                if( id ) {
                                    if( id === "groups" ){
                                        obj[id] = { id:value } ;
                                    } else {
                                        obj[id] = value;
                                    }
                                }
                            }
                            return obj;
                        },
                        openHelpPanel: function(){
                            let self = this;

                            var w = $( window ).width();
                            var h = $( window ).height();
                            var wW = $( window ).width()*2/3;
                            var hH = $( window ).height()*1.5/3;
                            var lrwh = [10, 148, wW, hH];//[(w-wW)/3.1, (h-hH)/3, wW, hH];
                            var tb = document.createElement('div');

                            $(tb).append(`  <div id="editor-keywords"></div>`
                            );
                            self.win = new mxWindow("How to Search", tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
                            self.win.setMaximizable(true);
                            self.win.setResizable(true);
                            self.win.setClosable(true);
                            self.win.setVisible(true);

                            var helpVue = new Vue({
                                el: "#editor-keywords",
                                template: `<vue-editor-component id="help-editor" :model="model"></vue-editor-component>`,
                                data: {
                                    model:{
                                        oldInput: "",
                                        newInput: "",
                                        mode: "toml",
                                        theme: "tomorrow",
                                        printMargin: false,
                                        readOnly: true
                                    }
                                },
                                created: function(){
                                    let self = this;

                                },
                                mounted: function(){
                                    let self = this;

                                    self.$nextTick(function () {
                                        _.delay(function(){
                                            self.model.newInput = GLOBAL_CONFIG.global.help.join("\n");
                                        },500)
                                    })
                                }
                            });
                        },
                        triggerInput: function(name){
                            let self = this;

                            $(self.$refs[name]).click();
                        }
                    }
                };
                
                new Vue(mxHome.app).$mount("#app");
            })
        })
    }
}

let mxHome = new Home();
mxHome.init();