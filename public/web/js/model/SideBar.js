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
                    ],
                checkList: []
            },
            template: ` <el-container style="height:100%;width:100%;">
                            <el-header style="height:40px;line-height:40px;border-bottom:1px solid #ddd;" ref="header">
                                <el-input placeholder="请输入关键词" v-model="term" style="width:80%;border:unset;"></el-input>
                                <el-button type="text" @click="onClose" style="float:right;font-size:14px;" icon="el-icon-close"></el-button>
                            </el-header>
                            <el-main style="padding:0px;">
                                <el-container style="height:100%;">
                                    <el-main style="padding:0px;height:100%;overflow:auto;">
                                        <el-checkbox-group v-model="checkList" ref="checkbox" style="display:flex;flex-wrap:wrap;" @change="onChange">
                                            <el-checkbox :label="item" :key="item" v-for="item in _.map(model,'id')" :data-item="item">
                                                <el-image :src="_.find(model,{id:item}).icon | pickIcon" fit="fill" style="width:48px;filter:grayscale(100%) brightness(45%) sepia(100%) hue-rotate(-180deg) saturate(700%) contrast(0.8);">
                                                </el-image> 
                                                <p>
                                                    #{_.truncate(_.find(model,{id:item}).cnname,{'length': 6})}#
                                                </p>
                                            </el-checkbox>
                                        </el-checkbox-group>
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
                pickIcon:function(icon){
                    return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
                }
            },
            created: function(){
                eventHub.$on("APP-REFRESH-EVENT",this.refresh);
                this.init();
            },
            mounted() {
                this.contextMenu(".el-checkbox-group > label");
                this.initStyle();
            },
            methods: {
                init(){
                    let rtn = fsHandler.callFsJScript("/matrix/user/user.js",window.SignedUser_UserName).message;
                    
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
                onChange(evt){
                    
                    let ldap = new Object();
                    ldap.class = "/matrix/ldap";
                    ldap.fullname = window.SignedUser_FullName;
                    ldap.remark = evt.join(",");

                    let _rtn = omdbHandler.putDataToClass(ldap);

                    if(_rtn == 1){
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
            template:   `<el-menu :default-active="defaultActive"
                                mode="vertical"
                                @select="onSelect"
                                @open="onOpen" 
                                @close="onClose" 
                                :collapse="isCollapse"
                                class="el-menu-vertical-sidebar"
                                background-color="transparent"
                                text-color="#fff"
                                active-text-color="#ffd04b"
                                style="height:100vh;overflow-y:auto;float:left;">
                            <el-menu-item index="toggle">
                                <img :src="preFixIcon+'toggle-left.png'+postFixIcon" style="width:17px;"></img>
                                <span slot="title">切换</span>
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
                                        <span slot="title">#{item.cnname}#</span>
                                    </el-menu-item>
                                </el-menu-item-group>
                            </el-submenu>

                            <!-- 没有模板情况，且菜单项数量没超过阈值-->
                            <el-menu-item :class="item.status" :index="item.url" v-for="item in model.list" v-show="sideBarStatus === 2">
                                <img :src="item.icon | pickIcon" style="width:17px;"></img>
                                <span slot="title">#{item.cnname}#</span>
                            </el-menu-item>

                        </el-menu>`,
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
                        template: rtn.template
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
                    this.isCollapse=!this.isCollapse;
                    
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
        this.app = new Vue(this.sideMenu()).$mount("#sidebar-menu");
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