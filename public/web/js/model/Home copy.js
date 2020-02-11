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
                                            <el-col :span="18" style="display:flex;flex-wrap:wrap;align-content: flex-start;" class="col-button"> 
                                                <el-button type="primary" 
                                                    class="animated flipInX" 
                                                    v-for="item in user.apps" 
                                                    @click="open(item.url,item.target)"
                                                    style="max-width: 120px;width: 120px;background:#333333;margin: 5px;">
                                                    <el-image style="width:30px;margin:5px;" :src="item.icon | pickIcon"></el-image>
                                                    <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">#{item.cnname}#</p>
                                                    <div class="list-context-menu" :data-item="item.id" style="position:absolute;right:5px;top:5px;">
                                                        <i class="fas fa-angle-down" style="color:rgba(255,255,255,0.6);"></i>
                                                    </div>
                                                </el-button>
                                                <el-button type="default"  @click.native="dialogFormVisible = true" style="max-width: 120px;width: 120px;background: rgba(255,255,255,0.3);margin: 5px;">
                                                    <span class="fas fa-plus" style="font-size: 20px;"></span>
                                                </el-button>
                                            </el-col>
                                        </el-row>
                                        
                                        <el-dialog title="应用" :visible.sync="dialogFormVisible" width="60%">
                                            <el-button type="primary" v-for="item in user.appList" @click="triggerInput(item.name)">
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

                                _.delay(()=>{
                                    let el = $(".col-button",this.$el)[0];
                                    let sortable = Sortable.create(el,{

                                        onChange(evt) {
                                            
                                        }
                                    });
                                },1000)
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
                        open(url,target){
                            window.open(url,target);
                        },
                        initContextMenu(){
                            
                            $.contextMenu("destroy").contextMenu({
                                selector: '.list-context-menu',
                                trigger: 'hover',
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