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
                            "search-preset-component",
                            "search-base-component",
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
                                                    <search-base-component :options="options" ref="searchRef" class="grid-content"></search-base-component>
                                                    <div id="search-result-content" v-if="model.message"></div>
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
                        // 搜索组件结构
                        model: {
                            id: "matrix-home",
                            filter: null,
                            term: null,
                            preset: null,
                            message: null,
                        },
                        options: {
                            // 视图定义
                            view: {
                                show: false
                            },
                            // 搜索窗口
                            window: { name:"所有", value: ""},
                            // 输入
                            term: "",
                            // 指定类
                            class: "#/matrix/devops/:",
                            // 指定api
                            api: {parent: "search",name: "searchByTerm.js"},
                            // 其它设置
                            others: {
                                // 是否包含历史数据
                                ifHistory: false,
                                // 是否包含Debug信息
                                ifDebug: false,
                                // 指定时间戳
                                forTime:  ' for vtime ',
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
                    created(){
                        
                        // 刷新应用列表
                        eventHub.$on("APP-REFRESH-EVENT",()=>{
                            this.loadApps();
                        });

                        if(!_.isEmpty(window.SignedUser_Remark)){
                            this.user.appsId = window.SignedUser_Remark.replace(/\"/g,"").split(",");
                        }

                    },
                    mounted(){
                        
                        // watch数据更新
                        this.$watch(
                            "$refs.searchRef.result",(val, oldVal) => {
                                this.setData();
                            }
                        );

                        this.$nextTick()
                            .then(()=> {
                                
                                this.init();

                                let el = document.getElementById("grid-content");
                                let sortable = Sortable.create(el,{
                                    
                                    dataIdAttr: 'data-id',
                                    onChange(evt) {
                                        
                                    }
                                });
                            })

                    },
                    methods: {
                        setData(){
                            _.extend(this.model, {message:this.$refs.searchRef.result});  
                            
                            if (_.isEmpty(this.options.term)) {
                                this.$message({
                                    type: "info",
                                    message: "请输入搜索关键字"
                                });
                                
                                return false;
                            }

                            let url = `/janesware/search?preset=${window.btoa(encodeURIComponent(JSON.stringify(this.options)))}`;
                            
                            window.open(url,"_parent");

                        },
                        init(){
                            
                            this.loadApps();

                            this.initContextMenu();
                        },
                        initContextMenu(){
                            
                            $.contextMenu("destroy").contextMenu({
                                selector: '.list-context-menu',
                                trigger: 'left',
                                autoHide: true,
                                delay: 10,
                                hideOnSecondTrigger: true,
                                build: ($trigger, e)=> {
                                    
                                    let id = e.target.attributes.getNamedItem('data-item').value;
                                    let item = _.find(this.user.appList,{id:id});
                                    
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
                                    show(opt) {
                                        let $this = this;
                                    },
                                    hide(opt) {
                                        let $this = this;
                                    }
                                }
                            });
                        },
                        loadApps() {
                            
                            let _list = omdbHandler.fetchData("#/matrix/portal/tools/: | sort by seat asc");

                            this.user.appList = _.orderBy(_list.message,["seat"],["asc"]);
                            this.user.apps = [];

                            _.forEach(this.user.appsId,(v)=>{
                                this.user.apps.push (_.find(this.user.appList,{id:v}));
                            });

                            this.user.apps = _.remove(this.user.apps,null);

                            this.user.appList = _.map(this.user.appList,(v)=>{

                                let _idx =  _.find(this.user.apps,{id:v.id});

                                if(!_.isEmpty(_idx)){
                                    v.selected = 1;
                                }else{
                                    v.selected = 0;
                                }
                                return v;
                            });

                        },
                        toogle(item) {
                            
                            let ldap = new Object();

                            ldap.action = "update";
                            ldap.class = "/matrix/ldap";
                            ldap.id = window.SignedUser_Id;

                            if(_.indexOf(this.user.appsId, item.id) > -1){
                                _.pull(this.user.appsId,item.id);
                            } else {
                                this.user.appsId.push(item.id);
                            }

                            ldap.remark = this.user.appsId.join(",");

                            let rtn = fsHandler.callFsJScript("/matrix/ldap/action.js", encodeURIComponent(JSON.stringify(ldap))).message;// omdbHandler.putDataToClass(ldap);

                            if(rtn == 1){
                                this.loadApps();
                            }

                        },
                        resetForm(){
                            
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
                        toJsonString(event) {
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
                        triggerInput(name){
                            $(this.$refs[name]).click();
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