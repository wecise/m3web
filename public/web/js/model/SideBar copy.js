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
                    ]
            },
            template: ` <el-container>
                            <el-header style="height:30px;line-height:30px;">
                                <input type="text" class="form-control-transparent" placeholder="请输入关键词" v-model="term">
                            </el-header>
                            <el-main style="padding:0px;">
                                <el-container>
                                    <el-main style="padding:0px;">
                                        <ul class="top-bar animated fadeInDown nav-menu-level1">
                                            <!--li>
                                                <a href="/" title="首页">
                                                    <img src="${window.ASSETS_ICON}/apps/png/home.png?type=download&issys=${window.SignedUser_IsAdmin}"></img> <p>首页</p>
                                                </a>
                                            </li-->
                                            <li v-for="(item,index) in model" :class="index<=model.length - 1?'slot-li-divider':''" :data-item="item.id" @click="triggerInput($event,item.name)">
                                                <a href="javascript:void(0);" :target="item.target" :title="item.cnname" :ref="item.id">
                                                    <img :src="item.icon | pickIcon" style="width:48px;filter:grayscale(100%) brightness(45%) sepia(100%) hue-rotate(-180deg) saturate(700%) contrast(0.8);"></img> 
                                                    <p>
                                                        <input type="checkbox" :ref="item.name" v-model='item.selected' @click="toggle(item)"> #{_.truncate(item.cnname, {'length': 6})}#
                                                    </p>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="/janesware/system?view=app"  title="应用管理">
                                                    <i class="fas fa-plus fa-3x"></i> <p>应用管理</p>
                                                </a>
                                            </li>
                                        </ul>
                                    </el-main>
                                    <el-aside style="width:200px;border-left: 1px solid rgb(221, 221, 221);padding: 10px;">
                                        <ul class="animated fadeIn" style="list-style: none;">
                                            <li v-for="(item,index) in group" :class="index<group.length - 1?'slot-li-divider':''" style="margin:5px 0px;">
                                                <a href="javascript:void(0);" :target="item.target" :title="item.cnname">
                                                    #{_.truncate(item.cnname, {'length': 6})}#  
                                                    <span class="badge" style="background-color:transparent;color:#999;">#{item.count}#</span>
                                                </a>
                                                <span :class="item.icon" style="color:#fba729;"></span> 
                                            </li>
                                        </ul>
                                    </el-aside>
                                </el-container>
                            </el-main>
                            <el-footer>
                                <a href="http://wecise.com#appstore" target="_blank">唯简企业应用商店</a>
                            </el-footer>
                        </el-container>`,
            filters:{
                pickIcon:function(icon){
                    return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
                }
            },
            created: function(){
                this.init();
                eventHub.$on("APP-REFRESH-EVENT",this.refresh);
            },
            mounted() {
                this.contextMenu('li.slot-li-divider');
            },
            methods: {
                init: function(){
                    let _list = omdbHandler.fetchData("#/matrix/portal/tools/: | sort by seat asc");
                    let user = window.SignedUser_UserName;//$("#signed-user-name").val();

                    this.selectedApps = fsHandler.callFsJScript("/user/user.js",user).message.split(",");
                    let _selectedApps = this.selectedApps;

                    this.model = _.map(_list.message,function(v){
                        if(_.includes(_selectedApps,v.id)){
                            v.selected = 1;
                        }
                        return v;
                    });

                },
                refresh: function(){
                    this.model = [];
                    this.init();
                },
                toggle: function(item){

                    let ldap = new Object();
                    ldap.class = "/matrix/ldap";
                    ldap.fullname = window.SignedUser_FullName;

                    if(_.indexOf(this.selectedApps, item.id) > -1){
                        _.pull(this.selectedApps,item.id);
                    } else {
                        this.selectedApps.push(item.id);
                    }

                    ldap.remark = this.selectedApps.join(",");

                    let _rtn = omdbHandler.putDataToClass(ldap);

                    if(_rtn == 1){
                        this.init();
                        eventHub.$emit("APP-REFRESH-EVENT");
                    }
                },
                triggerInput: function(event,name){
                    event.stopPropagation();
                    event.preventDefault();
                    $(this.$refs[name]).click();
                },
                onSearch(){

                },
                contextMenu(el){
                    const self = this;

                    $.contextMenu({
                        selector: el,
                        trigger: 'right',
                        autoHide: true,
                        delay: 10,
                        hideOnSecondTrigger: true,
                        build: function($trigger, e) {
                            
                            let id = e.target.attributes.getNamedItem('data-item').value;
                            let item = _.find(self.model,{id:id});
                            
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
                                    "m10_running": {
                                        "name": "当前窗口运行",
                                        "icon": "fas fa-walking"
                                    },
                                    "m20_running-plus": {
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

    // 左边栏盒子应用
    sideMenu(){
        const inst = this;

        return{
            delimiters: ['#{', '}#'],
            data: {
                model: null,
                preFixIcon: `${window.ASSETS_ICON}/apps/png/`,
                postFixIcon: `?type=open&issys=${window.SignedUser_IsAdmin}`,
                isCollapse: true
            },
            template:   `<el-menu default-active="1-4-1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse">
                            <el-menu-item index="0" @click="sideBar.toggleSideBar()">
                                <img :src="preFixIcon+'toggle-left.png'+postFixIcon" style="width:17px;"></img>
                                <span slot="title">切换</span>
                            </el-menu-item>
                            <el-menu-item index="0" @click="sideBar.toggleSideBar()">
                                <img :src="preFixIcon+'toggle-left.png'+postFixIcon" style="width:17px;"></img>
                                <span slot="title">切换</span>
                            </el-menu-item>
                            <el-submenu index="1">
                                <template slot="title">
                                    <i class="el-icon-location"></i>
                                    <span slot="title">导航一</span>
                                </template>
                                <el-menu-item-group>
                                    <span slot="title">分组一</span>
                                    <el-menu-item index="1-1">选项1</el-menu-item>
                                    <el-menu-item index="1-2">选项2</el-menu-item>
                                </el-menu-item-group>
                                <el-menu-item-group title="分组2">
                                    <el-menu-item index="1-3">选项3</el-menu-item>
                                </el-menu-item-group>
                                <el-submenu index="1-4">
                                    <span slot="title">选项4</span>
                                    <el-menu-item index="1-4-1">选项1</el-menu-item>
                                </el-submenu>
                            </el-submenu>
                            <el-menu-item index="2">
                                <i class="el-icon-menu"></i>
                                <span slot="title">导航二</span>
                            </el-menu-item>
                            <el-menu-item index="3" disabled>
                                <i class="el-icon-document"></i>
                                <span slot="title">导航三</span>
                            </el-menu-item>
                            <el-menu-item index="4">
                                <i class="el-icon-setting"></i>
                                <span slot="title">导航四</span>
                            </el-menu-item>
                        </el-menu>
                        <ul class="nav animated bounceIn">
                        <li class="dropdown top-bar">
                            <el-tooltip content="切换导航栏" placement="right" open-delay="500">
                                <a class="sidebar-toggle" href="javascript:sideBar.toggleSideBar();">
                                    <img :src="preFixIcon+'toggle-left.png'+postFixIcon" style="width:17px;"></img> <span class="nav-label">切换</span>
                                </a>
                            </el-tooltip>
                        </li>
                        <li class="dropdown top-bar">
                            <el-tooltip content="应用" placement="right" open-delay="500">
                                <a  href="javascript:void(0);"  
                                    @click="initWnd">
                                    <img :src="preFixIcon+'app.png'+postFixIcon" style="width:17px;"></img> <span class="nav-label">应用</span>
                                </a>
                            </el-tooltip>
                        </li>
                        <li>
                            <el-tooltip content="首页" placement="right" open-delay="500">
                                <a href="/">
                                    <img :src="preFixIcon+'home.png'+postFixIcon" style="width:17px;"></img> <span class="nav-label">首页</span>
                                </a>
                            </el-tooltip>
                        </li>
                        <li v-for="(item,index) in model" :class="item.status">
                            <el-tooltip :content="item.cnname" placement="right" open-delay="500">
                                <a :href="item.url" :target="item.target">
                                    <img :src="item.icon | pickIcon" style="width:17px;"></img> <span class="nav-label">#{item.cnname}#</span>
                                </a>
                            </el-tooltip>
                        </li>
                    </ul>`,
            created: function(){
                this.init();
                eventHub.$on("APP-REFRESH-EVENT",this.refresh);
            },
            filters:{
                pickIcon:function(icon){
                    return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
                }
            },
            methods: {
                init: function(){
                    let user = window.SignedUser_UserName;
                    let selectedApps = fsHandler.callFsJScript("/user/user.js",user).message.replace(/,/g,";");
                    let _list = omdbHandler.fetchData(`#/matrix/portal/tools/: | ${selectedApps}| sort by seat asc`);
                    this.model = _.map(_list.message,function(v){
                        let _page = _.last(mx.getPage().split("/"));

                        if(_.endsWith(v.url,_page)){
                            return _.merge(v, {status: "active"});
                        }

                        return _.merge(v, {status: ""});
                    });
                },
                initWnd: function(){

                    setTimeout(() => {
                        let wnd = maxWindow.winApps(`应用市场`, `<div id="nav-menu-level1" style="width:100%;height:100%;"></div>`, null, 'apps-container');
                        inst.app = new Vue(inst.appBox()).$mount("#nav-menu-level1");
                    }, 50);

                },
                refresh: function(){
                    this.init();
                },
                handleOpen(key, keyPath) {
                    console.log(key, keyPath);
                },
                handleClose(key, keyPath) {
                    console.log(key, keyPath);
                }
            }
        }
    };

    init(){
        new Vue(this.sideMenu()).$mount("#sidebar-menu");
    }

    appRunning(event){
        window.open(event.url,"_parent");
    }

    appRunningPlus(event){
        let win = window.open(event.url, '_blank');
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
                let rtn = fsHandler.callFsJScript("/apps/app_delete.js",encodeURIComponent(JSON.stringify(event)));
                eventHub.$emit("APP-REFRESH-EVENT");
            } else {
                
            }
        });

    }

}

let sideBar = new SideBar();

document.addEventListener('DOMContentLoaded', function(){
    sideBar.init();
}, false);