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
            i18n,
            delimiters: ['#{', '}#'],
            data: {
                model: [],
                selectedApps: [],
                term: null,
                group: [
                        {name:'IT运维',url:'', cnname:'IT运维', enname:'ITSM', target:'', icon: 'fas fa-star', count: 15},
                        {name:'供销存管理',url:'', cnname:'供销存管理', enname:'ERP', target:'', icon: '', count: 0},
                        {name:'财务管理',url:'', cnname:'财务管理', enname:'Finance', target:'', icon: '', count: 0},
                        {name:'OA应用',url:'', cnname:'OA应用', enname:'OA', target:'', icon: '', count: 0},
                        {name:'平台应用',url:'', cnname:'平台应用', enname:'Plat', target:'', icon: '', count: 0},
                        {name:'应用管理',url:'', cnname:'应用管理', enname:'App', target:'', icon: '', count: 0},
                        {name:'数据接入',url:'', cnname:'数据接入', enname:'Data INPUT', target:'', icon: '', count: 0},
                        {name:'数据处理',url:'', cnname:'数据处理', enname:'Data KEEP', target:'', icon: '', count: 0},
                        {name:'数据分析',url:'', cnname:'数据分析', enname:'Analysis', target:'', icon: '', count: 0},
                        {name:'仪表盘',url:'', cnname:'仪表盘', enname:'Dashboard', target:'', icon: '', count: 0},
                        {name:'资产管理',url:'', cnname:'资产管理', enname:'Asset', target:'', icon: '', count: 0},
                        {name:'政务应用',url:'', cnname:'政务应用', enname:'Govemment', target:'', icon: '', count: 0},
                        {name:'开发者应用',url:'', cnname:'开发者应用', enname:'Developer', target:'', icon: '', count: 0}
                    ],
                checkList: [],
                apps: {}
            },
            template: ` <el-container style="height:100%;width:100%;" class="sidebar-container">
                            <el-header style="height:40px;line-height:40px;border-bottom:1px solid #ddd;" ref="header">
                                <el-input :placeholder="$t('sideBar.menu.placeholder')" v-model="term" style="width:80%;"></el-input>
                                <el-button type="text" @click="onClose" style="float:right;font-size:14px;" icon="el-icon-close"></el-button>
                            </el-header>
                            <el-main style="padding:0px;">
                                <el-container style="height:100%;">
                                    <el-main style="padding:10px;height:100%;overflow:auto;display:flex;flex-wrap:wrap;align-content: flex-start;">
                                        <el-button type="default" :key="item.id" v-for="item in model" style="border: unset;width:100px;height:120px;margin:5px;padding:0px;cursor:pointer;"> 
                                            <el-image :src="_.find(model,{id:item.id}).icon | pickIcon" fit="fill" style="width:48px;filter:grayscale(100%) brightness(45%) sepia(100%) hue-rotate(-180deg) saturate(700%) contrast(0.8);">
                                            </el-image> 
                                            <p style="padding: 5px 0px;">
                                                <span v-if="window.MATRIX_LANG == 'zh-CN'">
                                                    #{_.truncate(_.find(model,{id:item.id}).cnname,{'length': 6})}#
                                                </span>
                                                <span v-else>
                                                    #{_.truncate(_.find(model,{id:item.id}).enname,{'length': 6})}#
                                                </span>
                                                <el-dropdown @command="onAppCommand" trigger="hover" placement="top-end" style="color:rgba(255,255,255,.5);">
                                                    <span class="el-dropdown-link">
                                                        <i class="el-icon-arrow-down el-icon--right" style="color:#333;"></i>
                                                    </span>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item disabled>
                                                            <span v-if="window.MATRIX_LANG == 'zh-CN'">
                                                                #{item.cnname}#
                                                            </span>
                                                            <span v-else>
                                                                #{item.enname}#
                                                            </span>
                                                        </el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'walking',data:item}" divided>#{ $t('sideBar.actions.open') }#</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'running',data:item}">#{ $t('sideBar.actions.openNew') }#</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'home',data:item}" divided>#{ $t('sideBar.actions.setHome') }#</el-dropdown-item>
                                                        <el-dropdown-item divided disabled>#{ $t('sideBar.menu.groupTitle') }#</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'groupAction', targetGroup: groupItem.name, data:item}" v-for="groupItem in _.xor(apps.template,[item])">
                                                            <template v-if="groupItem.title">
                                                            #{ $t('sideBar.actions.moveTo') }#【#{groupItem.title}#】
                                                            </template>
                                                        </el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'groupAction', targetGroup: '', data:item}">#{ $t('sideBar.actions.moveToDesktop') }#</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'uninstall',data:item}" divided>#{ $t('sideBar.actions.uninstall') }#</el-dropdown-item>
                                                        <el-dropdown-item :command="{cmd:'share',data:item}" divided>#{ $t('sideBar.actions.share') }#</el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                            </p>
                                        </el-button>
                                    </el-main>
                                    <el-aside style="width:200px;border-left: 1px solid rgb(221, 221, 221);padding: 10px;overflow:hidden;">
                                        <ul class="animated fadeIn" style="list-style: none;">
                                            <li v-for="(item,index) in group" :class="index<group.length - 1?'slot-li-divider':''" style="margin:5px 0px;">
                                                <el-link href="javascript:void(0);" :target="item.target" :title="item.cnname">
                                                    <span v-if="window.MATRIX_LANG == 'zh-CN'">
                                                        #{_.truncate(item.cnname, {'length': 12})}#  
                                                    </span>
                                                    <span v-else>
                                                        #{_.truncate(item.enname, {'length': 12})}#  
                                                    </span>    
                                                    <span class="badge" style="background-color:transparent;color:#999;">#{item.count}#</span>
                                                </el-link>
                                                <span :class="item.icon" style="color:#fba729;"></span> 
                                            </li>
                                        </ul>
                                    </el-aside>
                                </el-container>
                            </el-main>
                            <el-footer style="height:40px;line-height:40px;">
                                <el-link href="/matrix/system" target="_blank" icon="el-icon-edit">#{ $t('sideBar.actions.newApp') }#</el-link>
                                <el-link href="http://${window.COMPANY_WEBSITE}#appstore" target="_blank" type="primary" icon="el-icon-view" style="margin-left:20px;">
                                    #{window.COMPANY_NAME}# #{ $t('sideBar.menu.appStore') }#
                                </el-link>
                            </el-footer>
                        </el-container>`,
            filters:{
                pickIcon(icon){
                    return `${window.ASSETS_ICON}/apps/png/${icon}?type=open&issys=${window.SignedUser_IsAdmin}`;
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
            i18n,
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
                                <div style="width:88%;">
                                    <el-link href="/" :underline="false">
                                        <img id="company_logo" src="">
                                        <span style="color:#ffffff;">#{mxTitle}#</span>
                                    </el-link>
                                </div>
                                <div id="ai-robot" style="width:6%;"></div>
                                <div style="width:6%;">
                                    <el-menu :default-active="activeIndex" 
                                            class="topbar-el-menu" 
                                            mode="horizontal" 
                                            @select="onSelect"
                                            menu-trigger="hover">
                                        <el-submenu index="2">
                                            <template slot="title">
                                                <i class="el-icon-user-solid" style="color:#ffffff;"></i> #{window.SignedUser_UserName}#
                                            </template>
                                            <el-menu-item index="user">
                                                <template slot="title">
                                                    <i class="el-icon-user"></i>
                                                    <span slot="title">#{ $t('topBar.menu.userInfo') }#</span>
                                                </template>
                                            </el-menu-item>
                                            <el-menu-item index="system" divided v-if="mxAuth.isAdmin">
                                                <template slot="title">
                                                    <i class="el-icon-setting"></i>
                                                    <span slot="title">#{ $t('topBar.menu.systemMain') }#</span>
                                                </template>
                                            </el-menu-item>
                                            <el-menu-item index="files" v-if="mxAuth.isAdmin">
                                                <template slot="title">
                                                    <i class="el-icon-folder-opened"></i>
                                                    <span slot="title">#{ $t('topBar.menu.myFiles') }#</span>
                                                </template>
                                            </el-menu-item>
                                            <el-menu-item index="home" v-if="mxAuth.isAdmin">
                                                <template slot="title">
                                                    <i class="el-icon-s-home"></i>
                                                    <span slot="title">#{ $t('topBar.menu.defaultHome') }#</span>
                                                </template>
                                            </el-menu-item>
                                            <el-menu-item index="signout" divided>
                                                <template slot="title">
                                                    <i class="el-icon-switch-button"></i>
                                                    <span slot="title">#{ $t('topBar.menu.signOut') }#</span>
                                                </template>
                                            </el-menu-item>
                                        </el-submenu>
                                    </el-menu>
                                </div>
                            </el-header>
                        </el-container>`,
            mounted(){
                this.defaultActive = window.location.pathname;
            },
            filters:{
                pickIcon:function(icon){
                    return `${window.ASSETS_ICON}/apps/png/${icon}?type=open&issys=${window.SignedUser_IsAdmin}`;
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
                        window.open('/matrix/'+key,"_blank");
                    }
                }
            }
        }
    };

    // 底边栏
    footBar(){
        
        return{
            i18n,
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
                                    <el-dropdown-item>#{ $t('footBar.menu.name') }#：#{company.name}#</el-dropdown-item>
                                    <el-dropdown-item>#{ $t('footBar.menu.application') }#：#{company.ospace}#</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>

                            <el-link :href="company.website" target="_blank" :underline="false" style="font-size:12px;">
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
            i18n,
            delimiters: ['#{', '}#'],
            data: {
                model: null,
                preFixIcon: `${window.ASSETS_ICON}/apps/png/`,
                postFixIcon: `?type=open&issys=${window.SignedUser_IsAdmin}`,
                isCollapse: true,
                defaultActive: '/matrix/home',
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
                                    <i :class="isCollapse?'el-icon-s-unfold':'el-icon-s-fold'" style="width:16px;color:#fff;"></i>
                                </el-menu-item>
                                <el-menu-item index="apps" v-if="window.COMPANY_NAME == 'wecise'">
                                    <img :src="preFixIcon+'app.png'+postFixIcon" style="width:16px;"></img> 
                                    <span style="padding-left:5px;" slot="title">#{ $t('sideBar.menu.application') }#</span>
                                </el-menu-item>
                                <el-menu-item index="/">
                                    <img :src="preFixIcon+'home.png'+postFixIcon" style="width:16px;"></img>
                                    <span style="padding-left:5px;" slot="title">#{ $t('sideBar.menu.home') }#</span>
                                </el-menu-item>
                                
                                <!-- 有模板情况-->
                                <el-submenu :index="item.name" v-for="item in model.template" v-show="sideBarStatus === 0">
                                    <template slot="title">
                                        <img :src="item.icon | pickIcon" style="width:16px;"></img>
                                        <span style="padding-left:5px;font-size:12px;">#{ $t('home.group')[item.name] }#【#{item.groups.length}#】</span>
                                    </template>
                                    
                                    <el-menu-item-group>
                                        <span slot="title" style="font-size:12px;">#{ $t('home.group')[item.name] }#【#{item.groups.length}#】</span>
                                        <el-menu-item :class="subItem.status" :index="subItem.url" v-for="subItem in item.groups">
                                            <img :src="subItem.icon | pickIcon" style="width:16px;"></img>
                                            <span slot="title">
                                                <span style="padding-left:5px;" v-if="window.MATRIX_LANG == 'zh-CN'">#{subItem.cnname}#</span>
                                                <span style="padding-left:5px;" v-else>#{subItem.enname}#</span>
                                                <el-tooltip content="在新窗口中打开" open-delay="500"  placement="right-start">
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
                                        <span>#{ $t('sideBar.menu.application') }#</span>
                                    </template>

                                    <el-menu-item-group>
                                        <span slot="title">#{ $t('sideBar.menu.application') }#</span>
                                        <el-menu-item :class="item.status" :index="item.url" v-for="item in model.list">
                                            <img :src="item.icon | pickIcon" style="width:16px;"></img>
                                            <span slot="title">
                                                <span style="padding-left:5px;" v-if="window.MATRIX_LANG == 'zh-CN'">#{item.cnname}#</span>
                                                <span style="padding-left:5px;" v-else>#{item.enname}#</span>
                                                <el-tooltip content="在新窗口中打开" open-delay="500"  placement="right-start">
                                                    <el-button type="text" icon="el-icon-position" @click.stop.prevent="onClick(item.url)" style="float:right;transform:scale(0.6);color:#ffffff;"></el-button>
                                                </el-tooltip>
                                            </span>
                                        </el-menu-item>
                                    </el-menu-item-group>
                                </el-submenu>

                                <!-- 没有模板情况，且菜单项数量没超过阈值-->
                                <el-menu-item :class="item.status" :index="item.url" v-for="item in model.list" v-show="sideBarStatus === 2">
                                    <img :src="item.icon | pickIcon" style="width:16px;"></img>
                                    <span slot="title">
                                        <span style="padding-left:5px;" v-if="window.MATRIX_LANG == 'zh-CN'">#{item.cnname}#</span>
                                        <span style="padding-left:5px;" v-else>#{item.enname}#</span>
                                        <el-tooltip content="在新窗口中打开" open-delay="500"  placement="right-start">
                                            <el-button type="text" icon="el-icon-position" @click.stop.prevent="onClick(item.url)" style="float:right;transform:scale(0.6);color:#ffffff;"></el-button>
                                        </el-tooltip>
                                    </span>
                                </el-menu-item>

                                <!-- 没有分组的应用-->
                                <el-menu-item :class="item.status" :index="item.url" v-for="item in model.appListUnGrouped">
                                    <img :src="item.icon | pickIcon" style="width:16px;"></img>
                                    <span slot="title">
                                        <span style="padding-left:5px;" v-if="window.MATRIX_LANG == 'zh-CN'">#{item.cnname}#</span>
                                        <span style="padding-left:5px;" v-else>#{item.enname}#</span>
                                        <el-tooltip content="在新窗口中打开" open-delay="500"  placement="right-start">
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
                    return `${window.ASSETS_ICON}/apps/png/${icon}?type=open&issys=${window.SignedUser_IsAdmin}`;
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

     // Robot
     robot(){

        try{
            if(!mx.global.register.robot.enable) return false;
        } catch(err){
            return false;
        }
        

        $.get(`${window.ASSETS_ICON}/robot/svg/robot.svg?type=open&issys=${window.SignedUser_IsAdmin}`,function(svg){

            $("#ai-robot").empty();

            $("#ai-robot").append(`<div style="cursor: pointer;" class="animated fadeIn">
                                ${svg}
                             </div>`).find('svg').click(function(){

                if($("#jsPanel-robot")){
                    $("#jsPanel-robot").remove();
                }

                let win = maxWindow.winRobot('∵', '<div class="animated slideInDown" id="robot-active-win"></div>', null,null);

                let robotVue = {
                    template: '<ai-robot-component id="THIS-IS-ROBOT"></ai-robot-component>',
                    mounted: function () {

                        this.$nextTick(function () {


                        })
                    }
                };

                new Vue(robotVue).$mount("#robot-active-win");
            });

            let getStatus = function(){
                try{
                    let count = fsHandler.callFsJScript("/matrix/ai/status.js",'aiStatusGet').message.count;
                    if(count < 1){
                        $("#ai-robot span").remove();
                    } else {
                        $("#ai-robot span").remove();
                        $("#ai-robot div").first().append(`<span class="animated fadeIn" style="margin:10px -10px;background:#ff0000;border-radius:15px;width:10px;height:10px;"></span>`);
                    }
                } catch(err){

                }
            }
            getStatus();
            if(_.includes(['matrix'],window.COMPANY_OSPACE)){
                setInterval(getStatus, mx.global.register.robot.interval);
            }

        },'text');
    }

    init(){
        this.topbar = new Vue(this.topBar()).$mount("#header");
        this.app = new Vue(this.sideMenu()).$mount("#aside");
        this.footbar = new Vue(this.footBar()).$mount("#footer");
        this.robot();
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

        const h = this.$createElement;
        this.$msgbox({
                title: `确定要卸载该应用`, 
                message: h('span', null, [
                    h('p', null, `应用名称：${event.cnname}`),
                    h('p', null, `地址：${event.url}`)
                ]),
                showCancelButton: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
        }).then(() => {

            let rtn = fsHandler.callFsJScript("/matrix/apps/app_delete.js",encodeURIComponent(JSON.stringify(event)));
            eventHub.$emit("APP-REFRESH-EVENT");

        }).catch(() => {
                
        }); 

    }

}

var sideBar = new SideBar();

document.addEventListener('DOMContentLoaded', function(){
    sideBar.init();
}, false);