/*
*
*      __  __   ____
*    |  \/  | |__ /
*    | \  / |  |_ \
*    | |\/| | |___/
*    | |  | |
*    |_|  |_|
*
*
*/
class SideBar {

    constructor() {
        this.app = null;
        this.topbar = null;
    }

    // 左边栏切换
    toggleSideBar(){

        let page = mx.getPage();

        let index = 1;

        if(localStorage.getItem('PAGE_SIDEBAR_STATUS')){
            index = _.last(localStorage.getItem('PAGE_SIDEBAR_STATUS').split("_"));
        }

        if(index == 0){
            $(".sidebar-toggle-play").addClass("toggle animated flash");
            $("#sidebar").css('display','none');
            $("#sidebar-bg").css('display','none');

            $("#content").css("margin-left","0px");

            $("#content.content.toggle").on('click',function(e){
                e.preventDefault();
                sideBar.toggleSideBar();
            })

            index = 1;

        } else {
            $(".sidebar-toggle-play").removeClass("toggle animated flash");
            $("#sidebar").css('display','');
            $("#sidebar-bg").css('display','');

            var a = "page-sidebar-minified",
                t = "#page-container";
            $(t).hasClass(a) ? ($(t).removeClass(a), $(t).hasClass("page-sidebar-fixed") && (generateSlimScroll($('#sidebar [data-scrollbar="true"]')), $("#sidebar [data-scrollbar=true]").trigger("mouseover"), $("#sidebar [data-scrollbar=true]").stop(), $("#sidebar [data-scrollbar=true]").css("margin-top", "0"))) : ($(t).addClass(a), /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? ($('#sidebar [data-scrollbar="true"]').css("margin-top", "0"), $('#sidebar [data-scrollbar="true"]').css("overflow", "visible")) : ($(t).hasClass("page-sidebar-fixed") && ($('#sidebar [data-scrollbar="true"]').slimScroll({
                destroy: !0
            }), $('#sidebar [data-scrollbar="true"]').removeAttr("style")), $("#sidebar [data-scrollbar=true]").trigger("mouseover"))), $(window).trigger("resize")

            if($(t).hasClass(a)){
                $("#content").css("margin-left","60px");
            } else {
                $("#content").css("margin-left","220px");
            }

            index = 0;

        }

        localStorage.setItem('PAGE_SIDEBAR_STATUS',`${page}_${index}`);

        // container layout resize trigger child component redraw
        eventHub.$emit("LAYOUT-RESIZE-EVENT");

        eventHub.$emit("DATATABLE-RESIZE-EVENT");

    };

    // 应用盒子
    appBox(){
        
        const inst = this;
        return {
            delimiters: ['#{', '}#'],
            data: {
                model: [],
                selectedApps: [],
                term: null,
                group: [
                        {name:'IT运维',url:'', cnname:'IT运维', target:'', icon: 'fas fa-star', count: 15},
                        {name:'供销存管理',url:'', cnname:'供销存管理', target:'', icon: '', count: 0},
                        {name:'财务管理',url:'', cnname:'财务管理', target:'', icon: '', count: 0},
                        {name:'OA应用',url:'', cnname:'OA应用', target:'', icon: '', count: 0},
                        {name:'平台应用',url:'', cnname:'平台应用', target:'', icon: '', count: 0},
                        {name:'应用管理',url:'', cnname:'应用管理', target:'', icon: '', count: 0},
                        {name:'数据接入',url:'', cnname:'数据接入', target:'', icon: '', count: 0},
                        {name:'数据处理',url:'', cnname:'数据处理', target:'', icon: '', count: 0},
                        {name:'数据分析',url:'', cnname:'数据分析', target:'', icon: '', count: 0},
                        {name:'仪表盘',url:'', cnname:'仪表盘', target:'', icon: '', count: 0},
                        {name:'资产管理',url:'', cnname:'资产管理', target:'', icon: '', count: 0},
                        {name:'政务应用',url:'', cnname:'政务应用', target:'', icon: '', count: 0},
                        {name:'开发者应用',url:'', cnname:'开发者应用', target:'', icon: '', count: 0}
                    ],
                checkList: [],
                apps: {}
            },
            template: ` <el-container style="height:100%;width:100%;" class="sidebar-container">
                            <el-header style="height:40px;line-height:40px;border-bottom:1px solid #ddd;" ref="header">
                                <el-input placeholder="请输入关键词" v-model="term" style="width:80%;"></el-input>
                                <el-button type="text" @click="onClose" style="float:right;font-size:14px;" icon="el-icon-close"></el-button>
                            </el-header>
                            <el-main style="padding:0px;">
                                <el-container style="height:100%;">
                                    <el-main style="padding:10px;height:100%;overflow:auto;display:flex;flex-wrap:wrap;">
                                        <el-button type="default" :key="item.id" v-for="item in model" style="border: unset;width:100px;height:120px;margin:5px;padding:0px;cursor:pointer;"> 
                                            <el-image :src="_.find(model,{id:item.id}).icon | pickIcon" fit="fill" style="width:48px;filter:grayscale(100%) brightness(45%) sepia(100%) hue-rotate(-180deg) saturate(700%) contrast(0.8);">
                                            </el-image> 
                                            <p style="padding: 5px 0px;">
                                                #{_.truncate(_.find(model,{id:item.id}).cnname,{'length': 6})}#
                                                <el-dropdown @command="onAppCommand" trigger="hover" placement="top-end" style="color:rgba(255,255,255,.5);">
                                                    <span class="el-dropdown-link">
                                                        <i class="el-icon-arrow-down el-icon--right" style="color:#333;"></i>
                                                    </span>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item disabled>#{item.cnname}#</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'walking',data:item}" divided>当前窗口运行</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'running',data:item}">打开新窗口运行</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'home',data:item}" divided>设为首页</el-dropdown-item>
                                                        <el-dropdown-item divided disabled>分组</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'groupAction', targetGroup: groupItem.name, data:item}" v-for="groupItem in _.xor(apps.template,[item])">
                                                            <template v-if="groupItem.title">
                                                                移到【#{groupItem.title}#】组
                                                            </template>
                                                        </el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'groupAction', targetGroup: '', data:item}">移到桌面</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'uninstall',data:item}" divided>卸载应用</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'share',data:item}" divided>分享</el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                            </p>
                                        </el-button>
                                    </el-main>
                                    <el-aside style="width:200px;border-left: 1px solid rgb(221, 221, 221);padding: 10px;overflow:hidden;">
                                        <ul class="animated fadeIn" style="list-style: none;">
                                            <li v-for="(item,index) in group" :class="index<group.length - 1?'slot-li-divider':''" style="margin:5px 0px;">
                                                <el-link href="javascript:void(0);" :target="item.target" :title="item.cnname">
                                                    #{_.truncate(item.cnname, {'length': 6})}#  
                                                    <span class="badge" style="background-color:transparent;color:#999;">#{item.count}#</span>
                                                </el-link>
                                                <span :class="item.icon" style="color:#fba729;"></span> 
                                            </li>
                                        </ul>
                                    </el-aside>
                                </el-container>
                            </el-main>
                            <el-footer style="height:40px;line-height:40px;">
                                <el-link href="/janesware/system" target="_blank" icon="el-icon-edit">发布新应用</el-link>
                                <el-link href="http://wecise.com#appstore" target="_blank" type="primary" icon="el-icon-view" style="margin-left:20px;">
                                    唯简企业应用商店
                                </el-link>
                            </el-footer>
                        </el-container>`,
            filters:{
                pickIcon(icon){
                    return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
                }
            },
            created(){
                eventHub.$on("APP-REFRESH-EVENT",this.refresh);
                this.init();
            },
            mounted() {
                
            },
            methods: {
                init(){
                    let rtn = fsHandler.callFsJScript("/matrix/user/user.js",window.SignedUser_UserName).message;
                    this.apps = rtn;
                    
                    // appIds
                    this.selectedApps = rtn.appIds;
                    this.checkList = [];
                    this.model = _.map(rtn.appList,(v)=>{
                        if(_.includes(rtn.appIds,v.id)){
                            v.selected = 1;
                            this.checkList.push(v.id);
                        }
                        return v;
                    });

                },
                initStyle(){

                    if(this.$refs.checkbox.$el.querySelectorAll("label")) {

                        _.forEach(this.$refs.checkbox.$el.querySelectorAll("label:not(.el-checkbox__input)"),(v)=>{
                            v.style.width = "100px";
                            v.style.height = "120px";
                            v.style.display = "flex";
                            v.style.flexFlow = "column-reverse";
                            v.style.margin = "5px";
                            v.style.padding = "10px";
                            v.style.cursor = "pointer";

                            v.querySelectorAll("label > .el-checkbox__input")[0].style.textAlign = "center";

                            v.querySelectorAll("label > .el-checkbox__label")[0].style.textAlign = "center";
                            v.querySelectorAll("label > .el-checkbox__label")[0].style.paddingLeft = "0px";

                            v.addEventListener("mouseover",(evt)=>{
                                evt.target.style.boxShadow = "0 2px 12px 0 rgba(0, 0, 0, 0.1)";
                            })
    
                            v.addEventListener("mouseout",(evt)=>{
                                evt.target.style.boxShadow = "unset";
                            })
                        }) 

                        this.$refs.header.$el.querySelector("input").style.border="unset";

                    } else {
                        setTimeout(this.initStyle, 50);
                    }
                    
                },
                refresh: function(){
                    this.model = [];
                    this.init();
                },
                onAppCommand(item){
                    if(item.cmd === "walking"){
                        sideBar.appRunning(item.data);
                    } else if(item.cmd === "running"){
                        sideBar.appRunningPlus(item.data);
                    } else if(item.cmd === "uninstall"){
                        sideBar.appUninstall(item.data);
                    } else if(item.cmd === "home"){
                        sideBar.appAsHome(item.data);
                    } else if(item.cmd === "share"){
                        sideBar.appShare(item.data);
                    } else if(item.cmd === "groupAction"){
                        _.extend(item.data.groups,{group: item.targetGroup });
                        this.toggleGroup(item.data);
                    }
                },
                toggleGroup(item){
                    let rtn = fsHandler.callFsJScript("/matrix/apps/app.js",encodeURIComponent(JSON.stringify(item)));
                    if( _.lowerCase(rtn.status) == "ok"){
                        eventHub.$emit("APP-REFRESH-EVENT");
                    }
                },
                onChange(evt){
                    
                    let ldap = new Object();
                    ldap.action = "update";
                    ldap.class = "/matrix/ldap";
                    ldap.id = window.SignedUser_Id;
                    ldap.remark = evt.join(",");

                    let rtn = fsHandler.callFsJScript("/matrix/ldap/action.js", encodeURIComponent(JSON.stringify(ldap))).message;// omdbHandler.putDataToClass(ldap);

                    if(rtn == 1){
                        this.init();
                        eventHub.$emit("APP-REFRESH-EVENT");
                    }
                },
                onClose(){
                    try{
                        window.jsPanel.activePanels.getPanel("jsPanel-apps").close();
                    }catch(err){

                    }
                },
                contextMenu(el){
                    const self = this;

                    $.contextMenu("destroy").contextMenu({
                        selector: el,
                        trigger: 'right',
                        autoHide: true,
                        delay: 10,
                        hideOnSecondTrigger: true,
                        build: function($trigger, e) {
                            
                            let item = null;
                            try{
                                let id = e.target.attributes.getNamedItem('data-item').value;
                                item = _.find(self.model,{id:id});

                                return {
                                    callback: function(key, opt) {
                                        if(_.includes(key,"walking")){
                                            inst.appRunning(item);
                                        } else if(_.includes(key,"running")){
                                            inst.appRunningPlus(item);
                                        } else if(_.includes(key,"uninstall")){
                                            inst.appUninstall(item);
                                        } else if(_.includes(key,"home")){
                                            inst.appAsHome(item);
                                        } else if(_.includes(key,"share")){
                                            inst.appShare(item);
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
                                            "name": '设为首页', 
                                            "icon": "fas fa-home"
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
                            } catch(err){
                                return [];
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
                }
            }
        }
    }

    // 顶边栏
    topBar(){
        
        return{
            delimiters: ['#{', '}#'],
            data: {
                activeIndex: '1',
                mxTitle: window.MATRIX_TITLE,
                menu: {
                    user:'{{.i18n.Tr "your_profile"}}'
                }
            },
            template:   `<el-container style="position:fixed;z-index:20;top:0;left:0;width:100%;background:rgb(37, 45, 71);" id="header">
                            <el-header style="padding:0px 0px 0px 10px;height:50px;line-height:50px;display:flex;">
                                <div style="width:80%;">
                                    <el-link href="/" :underline="false">
                                        <img id="company_logo" src="">
                                        <span style="color:#ffffff;">#{mxTitle}#</span>
                                    </el-link>
                                </div>
                                <div id="ai-robot" style="width:8%;"></div>
                                <div style="width:12%;">
                                    <el-menu :default-active="activeIndex" class="topbar-el-menu" mode="horizontal" @select="onSelect">
                                        <el-submenu index="2">
                                            <template slot="title">
                                                #{window.SignedUser_UserName}#
                                            </template>
                                            <el-menu-item index="user">
                                                <template slot="title">
                                                    <i class="el-icon-user"></i>
                                                    <span slot="title">用户</span>
                                                </template>
                                            </el-menu-item>
                                            <el-menu-item index="system" divided>系统管理</el-menu-item>
                                            <el-menu-item index="files">我的文件</el-menu-item>
                                            <el-menu-item index="home">默认首页</el-menu-item>
                                            <el-menu-item index="signout" divided>注销</el-menu-item>
                                        </el-submenu>
                                    </el-menu>
                                </div>
                            </el-header>
                        </el-container>`,
            created(){
                
            },
            mounted(){
                this.defaultActive = window.location.pathname;
            },
            filters:{
                pickIcon:function(icon){
                    return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
                }
            },
            methods: {
                init(){
                    

                },
                onSelect(key, keyPath) {
                    if(key==='home'){
                        sideBar.appAsHome({url:'/home'});
                    } else if(key==='signout'){
                        window.open(`/user/logout/${window.COMPANY_NAME}`,'_parent');
                    } else if(key==='fullscreen'){
                        //mx.fullScreen();
                    }
                    else {
                        window.open('/janesware/'+key,"_blank");
                    }
                }
            }
        }
    };

    // 底边栏
    footBar(){
        
        return{
            delimiters: ['#{', '}#'],
            data: {
                appVersion: window.APP_VERSION,
                api: {
                    value: "",
                    list: []
                },
                lang: {
                    name: window.LANG_NAME,
                    list: window.LANG_LIST.slice(1).slice(0,-1).slice(1).slice(0,-1).split('} {'),
                    lang: window.LANG
                },
                company: {
                    name: window.COMPANY_NAME,
                    ospace: window.COMPANY_OSPACE,
                    fullName: window.COMPANY_FULLNAME,
                    website: window.COMPANY_WEBSITE
                }
            },
            template:   `<footer id="footer"
                                style="position:fixed;
                                bottom: 0px;
                                right: 10px;
                                height: 30px;
                                line-height: 30px;
                                display: none;">
                            
                            <el-link style="font-size: 12px;margin-right:5px;">
                                <i class="fas fa-copyright"></i> 2018 #{appVersion}#
                            </el-link>
                            
                            <el-dropdown @command="onApiCommand" style="font-size: 12px;margin-right:5px;cursor:pointer;">
                                <span class="el-dropdown-link">
                                    <i class="el-icon-tickets el-icon--right"></i> API
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item :command="item.url" v-for="item in api.list">#{item.name}#</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>

                            <el-dropdown @command="onLangCommand" style="font-size: 12px;margin-right:5px;cursor:pointer;">
                                <span class="el-dropdown-link">
                                    <i class="el-icon-s-home el-icon--right"></i> #{lang.name}#
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item :command="item.value" v-for="item in language">#{item.name}#</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>

                            <el-dropdown style="font-size: 12px;margin-right:5px;cursor:pointer;">
                                <span class="el-dropdown-link">
                                    <i class="el-icon-coin el-icon--right"></i> #{company.name}#
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item>名称：#{company.name}#</el-dropdown-item>
                                    <el-dropdown-item>应用：#{company.ospace}#</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>

                            <el-link :href="'http://'+company.website" target="_blank" :underline="false" style="font-size:12px;">
                                <i class="el-icon-user el-icon--right"></i> #{company.fullName}#
                            </el-link>
                            
                        </footer>`,
            computed:{
                language:function(){
                    try{
                        return _.map(this.lang.list,(v)=>{
                            return {name:v.split(" ")[1], value: v.split(" ")[0]};
                        });
                    }catch(err){
                        return [{name: '简体中文', value: 'zh_CN'}];
                    }
                }
            },
            created(){
                // API菜单
                this.api.list = _.map(fsHandler.callFsJScript('/matrix/footer/api_contextmenu.js', null).message,(v,k)=>{
                    return {name: v.name, url: k, icon: v.icon};
                });
            },
            methods: {
                onLangCommand(cmd) {
                    window.location.href=`?lang=${cmd}`;
                },
                onApiCommand(cmd){
                    window.open(cmd,"_blank");
                }
            }
        }
    };

    // 左边栏盒子应用
    sideMenu(){
        const inst = this;

        return{
            delimiters: ['#{', '}#'],
            data: {
                model: null,
                preFixIcon: `${window.ASSETS_ICON}/apps/png/`,
                postFixIcon: `?type=open&issys=${window.SignedUser_IsAdmin}`,
                isCollapse: true,
                defaultActive: '/janesware/home',
                appConfig: [],
                sideBarStatus: 2
            },
            template:   `<aside id="aside"><div id="sidebar" class="sidebar animated fadeInLeft" style="display:none;">
                            <el-menu :default-active="defaultActive"
                                    mode="vertical"
                                    @select="onSelect"
                                    @open="onOpen" 
                                    @close="onClose" 
                                    :collapse="isCollapse"
                                    :collapse-transition="false"
                                    class="el-menu-vertical-sidebar"
                                    background-color="transparent"
                                    text-color="#fff"
                                    active-text-color="#ffd04b"
                                    style="height:100vh;width:100%;overflow-y:auto;float:left;">
                                <el-menu-item index="toggle" style="display:">
                                    <i :class="isCollapse?'el-icon-s-unfold':'el-icon-s-fold'" style="width:17px;color:#fff;"></i>
                                </el-menu-item>
                                <el-menu-item index="apps">
                                    <img :src="preFixIcon+'app.png'+postFixIcon" style="width:17px;"></img> 
                                    <span slot="title">应用</span>
                                </el-menu-item>
                                <el-menu-item index="/">
                                    <img :src="preFixIcon+'home.png'+postFixIcon" style="width:17px;"></img>
                                    <span slot="title">首页</span>
                                </el-menu-item>
                                
                                <!-- 有模板情况-->
                                <el-submenu :index="item.name" v-for="item in model.template" v-show="sideBarStatus === 0">
                                    <template slot="title">
                                        <img :src="item.icon | pickIcon" style="width:17px;"></img>
                                        <span>#{item.title}#</span>
                                    </template>
                                    
                                    <el-menu-item-group>
                                        <span slot="title">#{item.title}#</span>
                                        <el-menu-item :class="subItem.status" :index="subItem.url" v-for="subItem in item.groups">
                                            <img :src="subItem.icon | pickIcon" style="width:17px;"></img>
                                            <span slot="title">
                                                #{subItem.cnname}#
                                                <el-tooltip content="在新窗口中打开">
                                                    <el-button type="text" icon="el-icon-position" @click.stop.prevent="onClick(subItem.url)" style="float:right;transform:scale(0.6);color:#ffffff;"></el-button>
                                                </el-tooltip>
                                            </span>
                                            <!--object ><a :href="subItem.url" target="_blank"><i class="fas fa-plus" style="color:#f7f7f7;transform: scale(.5);float:right;"></i></a></object-->
                                        </el-menu-item>
                                    <el-menu-item-group>
                                </el-submenu>

                                <!-- 没有模板情况，且菜单项数量超过阈值-->
                                <el-submenu index="appList" v-show="sideBarStatus === 1">
                                    <template slot="title">
                                        <i class="fas fa-cubes" style="color:#ffffff;font-size:18px;"></i>
                                        <span>应用</span>
                                    </template>

                                    <el-menu-item-group>
                                        <span slot="title">应用</span>
                                        <el-menu-item :class="item.status" :index="item.url" v-for="item in model.list">
                                            <img :src="item.icon | pickIcon" style="width:17px;"></img>
                                            <span slot="title">
                                                #{item.cnname}#
                                                <el-tooltip content="在新窗口中打开">
                                                    <el-button type="text" icon="el-icon-position" @click.stop.prevent="onClick(item.url)" style="float:right;transform:scale(0.6);color:#ffffff;"></el-button>
                                                </el-tooltip>
                                            </span>
                                        </el-menu-item>
                                    </el-menu-item-group>
                                </el-submenu>

                                <!-- 没有模板情况，且菜单项数量没超过阈值-->
                                <el-menu-item :class="item.status" :index="item.url" v-for="item in model.list" v-show="sideBarStatus === 2">
                                    <img :src="item.icon | pickIcon" style="width:17px;"></img>
                                    <span slot="title">
                                        #{item.cnname}#
                                        <el-tooltip content="在新窗口中打开">
                                            <el-button type="text" icon="el-icon-position" @click.stop.prevent="onClick(item.url)" style="float:right;transform:scale(0.6);color:#ffffff;"></el-button>
                                        </el-tooltip>
                                    </span>
                                </el-menu-item>

                                <!-- 没有分组的应用-->
                                <el-menu-item :class="item.status" :index="item.url" v-for="item in model.appListUnGrouped">
                                    <img :src="item.icon | pickIcon" style="width:17px;"></img>
                                    <span slot="title">
                                        #{item.cnname}#
                                        <el-tooltip content="在新窗口中打开">
                                            <el-button type="text" icon="el-icon-position" @click.stop.prevent="onClick(item.url)" style="float:right;transform:scale(0.6);color:#ffffff;"></el-button>
                                        </el-tooltip>
                                    </span>
                                </el-menu-item>

                            </el-menu>
                        </div>
                        </aside>`,
            created(){
                this.init();
                eventHub.$on("APP-REFRESH-EVENT",this.refresh);
            },
            mounted(){
                this.defaultActive = window.location.pathname;
            },
            filters:{
                pickIcon:function(icon){
                    return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
                }
            },
            methods: {
                init: function(){
                    let rtn = fsHandler.callFsJScript("/matrix/user/user.js",window.SignedUser_UserName).message;
                    
                    this.model = {
                        list: _.map(rtn.appListSelected,function(v){
                                let _page = _.last(mx.getPage().split("/"));

                                if(_.endsWith(v.url,_page)){
                                    return _.merge(v, {status: "active"});
                                }

                                return _.merge(v, {status: ""});
                            }),
                        template: rtn.template,
                        appListUnGrouped: rtn.appListUnGrouped
                    };

                    this.setStatus();

                },
                setStatus(){
                    // 有模板情况
                    if(!_.isEmpty(this.model.template)){
                        this.sideBarStatus = 0;
                    } 
                    // 没有模板情况
                    else{
                        // 菜单项超过阈值
                        if(this.model.list.length > mx.global.register.sidebar.menuCollapse){
                            this.sideBarStatus = 1;
                        }
                        // 菜单项没有超过阈值
                        else {
                            this.sideBarStatus = 2;
                        }
                    }
                },
                initWnd: function(){

                    setTimeout(() => {
                        this.wnd = maxWindow.winApps(`应用市场`, `<div id="nav-menu-level1" style="width:100%;height:100%;"></div>`, null, 'apps-container');
                        inst.app = new Vue(inst.appBox()).$mount("#nav-menu-level1");
                    }, 50);

                },
                refresh: function(){
                    this.init();
                },
                onToggle(){
                    console.log(1,this.isCollapse)
                    this.isCollapse = !this.isCollapse;
                    console.log(2,this.isCollapse)
                    
                    $(".sidebar-toggle-play").removeClass("toggle animated flash");
                    $("#sidebar").css('display','');
                    $("#sidebar-bg").css('display','');

                    var a = "page-sidebar-minified",
                        t = "#page-container";
                    $(t).hasClass(a) ? ($(t).removeClass(a), $(t).hasClass("page-sidebar-fixed") && (generateSlimScroll($('#sidebar [data-scrollbar="true"]')), $("#sidebar [data-scrollbar=true]").trigger("mouseover"), $("#sidebar [data-scrollbar=true]").stop(), $("#sidebar [data-scrollbar=true]").css("margin-top", "0"))) : ($(t).addClass(a), /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? ($('#sidebar [data-scrollbar="true"]').css("margin-top", "0"), $('#sidebar [data-scrollbar="true"]').css("overflow", "visible")) : ($(t).hasClass("page-sidebar-fixed") && ($('#sidebar [data-scrollbar="true"]').slimScroll({
                        destroy: !0
                    }), $('#sidebar [data-scrollbar="true"]').removeAttr("style")), $("#sidebar [data-scrollbar=true]").trigger("mouseover"))), $(window).trigger("resize")
    
                    if(this.isCollapse){
                        $("#content").css("margin-left","60px");
                    } else {
                        $("#content").css("margin-left","220px");
                    }
                    // container layout resize trigger child component redraw
                    eventHub.$emit("LAYOUT-RESIZE-EVENT");
            
                    eventHub.$emit("DATATABLE-RESIZE-EVENT");
                },
                onSelect(index,indexPath){
                    if(index == 'toggle'){
                        this.onToggle();
                    } else if(index == 'apps'){
                        this.initWnd();
                    } else {
                        window.open(index,'_parent');
                    }
                },
                onClick(url){
                    window.open(url,'_blank')
                },
                onOpen(key, keyPath) {
                    console.log(key, keyPath);
                },
                onClose(key, keyPath) {
                    console.log(key, keyPath);
                }
            }
        }
    };

    init(){
        this.topbar = new Vue(this.topBar()).$mount("#header");
        this.app = new Vue(this.sideMenu()).$mount("#aside");
        this.footbar = new Vue(this.footBar()).$mount("#footer");
    }

    appRunning(event){
        const wndID = "jsPanel-apps";
        try{
            if(jsPanel.activePanels.getPanel(wndID)){
                jsPanel.activePanels.getPanel(wndID).close();
            }
        } catch(error){

        }
        window.open(event.url,"_parent");
    }

    appRunningPlus(event){
        const wndID = "jsPanel-apps";
        
        try{
            if(jsPanel.activePanels.getPanel(wndID)){
                jsPanel.activePanels.getPanel(wndID).close();
            }
        } catch(error){

        }
        
        let win = window.open(event.url, "_blank");
        win.focus();
    }

    appAsHome(item){
        let rtn = null;

        jQuery.ajax({
            url: "/user/settings/home",
            type: "POST",
            dataType: "json",
            data: {
                home: item.url.split("").slice(1,item.url.length).join(""),
                _csrf: window.CsrfToken
            },
            beforeSend: function(xhr) {
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                sideBar.app.$message("首页已设置为：" + item.url);

                rtn = data;
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        })
        return rtn;
    }

    appShare(item){
        const self = this;

        let wnd = null;

        try{
            if(jsPanel.activePanels.getPanel('jsPanel-appShare')){
                jsPanel.activePanels.getPanel('jsPanel-appShare').close();
            }
        }catch(error){

        }
        finally{
            wnd = maxWindow.winAppShare( `<i class="fas fa-share"></i> 分享`, `<div id="app-share-container"></div>`, null, 'content');
        }
    
        let main = {
            template:`<el-container>
                        <el-main style="padding:20px;">
                            <el-form label-width="100px">
                                <el-form-item label="应用名称">
                                    <el-input v-model="form.name" :disable="true"></el-input>
                                </el-form-item>
                                <el-form-item label="显示设置">
                                    <el-switch v-model="form.header" 
                                        active-color="#13ce66"
                                        inactive-color="#dddddd"
                                        active-text="topBar"
                                        active-value="true"
                                        inactive-value="false"></el-switch>
                                
                                    <el-switch v-model="form.sidebar"
                                        active-color="#13ce66"
                                        inactive-color="#dddddd"
                                        active-text="leftBar"
                                        active-value="true"
                                        inactive-value="false"></el-switch>
                                
                                    <el-switch v-model="form.footer"
                                        active-color="#13ce66"
                                        inactive-color="#dddddd"
                                        active-text="bottomBar"
                                        active-value="true"
                                        inactive-value="false"></el-switch>
                                </el-form-item>
                                <el-form-item label="请求设置" style="margin-bottom:10px;">
                                    <el-input type="textarea" v-model="form.requestStr" :rows="3"></el-input>
                                </el-form-item>
                                <el-form-item label="分享地址" style="margin-bottom:10px;">
                                    <el-input type="textarea" v-model="form.url" :rows="4"></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-tooltip content="创建">
                                        <a href="javascript:void(0);" class="btn btn-xs btn-success" @click="genShareUrl"><i class="fas fa-save fa-fw"></i> 创建</a>
                                    </el-tooltip>
                                    <el-tooltip content="取消">
                                        <a href="javascript:void(0);" class="btn btn-xs btn-default" @click="closeMe" ><i class="fas fa-plus fa-fw"></i> 取消</a>
                                    </el-tooltip>
                                </el-form-item>
                            </el-form>
                        </el-main>
                    </el-container>`,
            data: {
                form: {
                    name: "",
                    header: false,
                    sidebar: false,
                    footer: false,
                    requestStr: "",
                    data: "",
                    url: ""
                }
            },
            created() {
                this.form.name = item.cnname;
            },
            methods: {
                genShareUrl(){

                    let itemStr = null;

                    let configStr = window.btoa(encodeURIComponent(JSON.stringify({ 
                        "header":this.form.header, 
                        "sidebar":this.form.sidebar, 
                        "sidebar-bg": this.form.sidebar, 
                        "footer": this.form.footer})));
                    
                    let requestStr = window.btoa(encodeURIComponent(this.form.requestStr));

                    let graphStr = window.btoa(encodeURIComponent(JSON.stringify({title: "name"})));

                    this.form.url = `${window.location.origin}${item.url}?item=null&cfg=${configStr}&data=${requestStr}&graph=${graphStr}`;

                },
                closeMe(){
                    wnd.close();
                }
            }
        };
        
        new Vue(main).$mount("#app-share-container");
    }

    appInstall(event){

    }

    appUninstall(event){

        
        alertify.confirm(`确定要卸载该应用？<br><br>
                        应用名称：${event.cnname}<br><br>
                        地址：${event.url}<br><br>`, function (e) {
            if (e) {
                let rtn = fsHandler.callFsJScript("/matrix/apps/app_delete.js",encodeURIComponent(JSON.stringify(event)));
                eventHub.$emit("APP-REFRESH-EVENT");
            } else {
                
            }
        });

    }

}

var sideBar = new SideBar();

document.addEventListener('DOMContentLoaded', function(){
    sideBar.init();
}, false);