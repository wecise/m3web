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

                let main = {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container style="padding:3em 0;">
                                    <el-main style="padding:0px;">
                                        <el-row type="flex" justify="center" style="padding:20px 0px;">
                                            <el-col :span="18">
                                                <div class="grid-content">
                                                    <div class="input-group">
                                                        <input class="form-control search" type="text" placeholder="搜索" @click="hideSearch" style="border: 1px solid #b6c2ca;">
                                                        <div class="input-group-btn">
                                                            <vue-search-preset-component id="home-vue-search-preset" :preset="search.preset"></vue-search-preset-component>
                                                        </div>
                                                        <div class="input-group-btn">
                                                            <button type="button" class="btn btn-primary" @click="onSearch"><i class="fa fa-search" style="font-size:20px;"></i></button>
                                                        </div>
                                                    </div>
                                                    <div class="collapse collapseShowresult" id="search-result-panel" v-on:blur="hideSearch">
                                                        <div id="search-result-content"></div>
                                                    </div>
                                                </div>
                                            </el-col>
                                        </el-row>
                                        
                                        <el-row type="flex" justify="center" style="height: calc(100vh - 215px);">
                                            <el-col :span="18"> 
                                                <div class="grid-content" id="grid-content">
                                                    <div class="layer btn btn-primary animated flipInX" v-for="item in user.apps">
                                                        <a :href="item.url" :target="item.target" style="color:#ffffff;">
                                                            <div class="tile_name">
                                                                <img style="width:30px" :src="item.icon | pickIcon"></img>
                                                                <p class="small">#{item.cnname}#</p>
                                                            </div>
                                                        </a>
                                                        <div class="list-context-menu" :data-item="item.id">
                                                            <i class="fa fa-angle-down"></i>
                                                        </div>
                                                    </div>
                                                    <a class="layer btn btn-primary" href="javascript:void(0);" style="background-color:#e9eaf0;padding: 24px 25px;border: none;margin-left: 5px;min-width: 110px;" @click="dialogFormVisible = true">
                                                        <span class="fa fa-plus" style="font-size: 20px;"></span>
                                                    </a>
                                                </div>
                                            </el-col>
                                        </el-row>
                                        
                                        <el-dialog title="应用" :visible.sync="dialogFormVisible" width="60%">
                                            <el-button :target="item.target" type="primary" v-for="item in user.appList" @click="triggerInput(item.name)">
                                                <img :src="item.icon | pickIcon" style="width:28px;"></img>
                                                <p class="small">
                                                    #{item.cnname}#
                                                </p>
                                                <p>
                                                    <input type="checkbox" :ref="item.name" v-model='item.selected' @click="toogle(item)">
                                                </p>
                                            </el-button>
                                        </el-dialog>
                                        
                                    </el-main>
                            
                                </el-container>`,
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
                        },
                        dialogFormVisible: false
                    },
                    filters:{
                        pickIcon:function(icon){
                            return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
                        }
                    },
                    created: function(){
                        const self = this;

                        // 刷新应用列表
                        eventHub.$on("APP-REFRESH-EVENT",()=>{
                            this.loadApps();
                        });

                        eventHub.$on('preset-selected-event', self.setPresetDefault);

                        if(!_.isEmpty(window.SignedUser_Remark)){
                            self.user.appsId = window.SignedUser_Remark.replace(/\"/g,"").split(",");
                        }

                    },
                    mounted: function(){
                        const self = this;

                        self.$nextTick()
                            .then(function () {
                                self.init();
                                self.initPlugIn();

                                let el = document.getElementById("grid-content");
                                let sortable = Sortable.create(el,{
                                    
                                    dataIdAttr: 'data-id',
                                    onChange(evt) {
                                        
                                    }
                                });
                            })

                    },
                    methods: {
                        init: function() {
                            const self = this;

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
                            const self = this;

                            self.loadApps();

                            self.initContextMenu();

                            //App.init();
                        },
                        initContextMenu(){
                            const self = this;
        
                            $.contextMenu({
                                selector: '.list-context-menu',
                                trigger: 'left',
                                autoHide: true,
                                delay: 10,
                                hideOnSecondTrigger: true,
                                build: function($trigger, e) {
                                    
                                    let id = e.target.attributes.getNamedItem('data-item').value;
                                    let item = _.find(self.user.appList,{id:id});
                                    
                                    return {
                                        callback: function(key, opt) {
                                            
                                            if(_.includes(key,"walking")){
                                                sideBar.appRunning(item);
                                            } else if(_.includes(key,"running")){
                                                sideBar.appRunningPlus(item);
                                            } else if(_.includes(key,"uninstall")){
                                                sideBar.appUninstall(item);
                                            } else if(_.includes(key,"home")){
                                                sideBar.appAsHome(item);
                                            } else if(_.includes(key,"share")){
                                                sideBar.appShare(item);
                                            }
                                        },
                                        items: {
                                            "m10_walking": {
                                                "name": "当前窗口运行",
                                                "icon": "fas fa-walking"
                                            },
                                            "m20_running": {
                                                "name": "打开新窗口运行",
                                                "icon": "fas fa-running"
                                            },
                                            "m30":"----------",
                                            "m40_home": {
                                                name: '设为首页', 
                                                icon: "fas fa-home"
                                            },
                                            "m50":"----------",
                                            "m60_uninstall": {
                                                "name": "卸载应用",
                                                "icon": "fas fa-trash"
                                            },
                                            "m70":"----------",
                                            "m80_share": {
                                                "name": "分享",
                                                "icon": "fas fa-share"
                                            }
                                        }
                                    }
                                },
                                events: {
                                    show: function(opt) {
                                        let $this = this;
                                    },
                                    hide: function(opt) {
                                        let $this = this;
                                    }
                                }
                            });
                        },
                        setPresetDefault: function(event){
                            const self = this;

                            self.search.preset = event;
                        },
                        nowSearch: function(term) {
                            const self = this;
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
                                delimiters: ['#{', '}#'],
                                el: "#search-result-content",
                                template:   `<div>
                                                <div class="row search-result-row" 
                                                    v-for="item in model">
                                                    <div class="col-lg-4">
                                                        结果
                                                        <p>#{item.name}#</p>
                                                    </div>
                                                    <div class="col-lg-2">
                                                        数量
                                                        <p>#{item.count}#</p>
                                                    </div>
                                                    <div class="col-lg-5">
                                                        时间分布
                                                        <p>#{item.from}# - #{item.to}#</p>
                                                    </div>
                                                    <div>
                                                        <a href="#" class="btn btn-xs btn-default btn-copy" @click="copyToClipBoard" alt="拷贝到剪切板" title="拷贝到剪切板" style="height: 22px;"><i class="fa fa-clipboard"></i></a>
                                                    </div>
                                                    <div class="col-lg-12" style="display:none;">
                                                        <div class="panel">
                                                            <div class="panel-body">
                                                            #{JSON.stringify(item.list)}#
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`,
                                data: {
                                    model:[],
                                },
                                mounted: function(){
                                    const self = this;

                                    self.$nextTick(function(){
                                        self.init();
                                    })
                                },
                                watch: {
                                    model: {
                                        handler: function(val,oldVal){
                                            const self = this;

                                            if(_.isEmpty(val)){

                                            }
                                        },
                                        deep:true
                                    }
                                },
                                methods: {
                                    init: function(){
                                        const self = this;
                                        var _groupByClass = _.omit(_.groupBy(result.message,'class'),["undefined",""]);

                                        self.model = _.map(_groupByClass, function(v,k){
                                            let _minTime = moment(_.minBy(v,'vtime')['vtime']).format('LLL');
                                            let _maxTime = moment(_.maxBy(v,'vtime')['vtime']).format('LLL');
                                            return {name: k, count: v.length, from:_minTime, to:_maxTime, list: v};
                                        });
                                    },
                                    copyToClipBoard: function() {
                                        const self = this;
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
                            const self = this;
                            let _term = _.trim($(".search").val());

                            if (_term.length < 1) {
                                alertify.log("请输入搜索关键字");
                                $(".search").focus();
                                return false;
                            }

                            let url = `/janesware/search?term=${window.btoa(encodeURIComponent(JSON.stringify({
                                            cond:_term,
                                            preset:self.search.preset
                                        })))}`;
                            
                            window.open(url,"_parent");
                        },
                        loadApps: function() {
                            const self = this;

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
                            const self = this;
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
                            const self = this;

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
                            const self = this;

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
                                    const self = this;

                                },
                                mounted: function(){
                                    const self = this;

                                    self.$nextTick(function () {
                                        _.delay(function(){
                                            self.model.newInput = GLOBAL_CONFIG.global.help.join("\n");
                                        },500)
                                    })
                                }
                            });
                        },
                        triggerInput: function(name){
                            const self = this;

                            $(self.$refs[name]).click();
                        }
                    }
                };
                
                this.app = new Vue(main).$mount("#app");
            })
        })
    }
}

let mxHome = new Home();
mxHome.init();