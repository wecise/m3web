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

        // 应用盒子
        this.appBox = {
            delimiters: ['#{', '}#'],
            el: '#nav-menu-level1',
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
            template: ` <div class="container-fluid">
                            <div class="row">
                                <div class="col-lg-12">
                                    <div class="input-group full-width topbar" style="margin:0;width:100%;">
                                        <input type="text" class="form-control-transparent" placeholder="请输入关键词" v-model="term">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-9">
                                    <ul class="top-bar animated fadeInDown nav-menu-level1">
                                        <!--li>
                                            <a href="/" title="首页" data-tooltip="tooltip">
                                                <img src="${window.ASSETS_ICON}/apps/png/home.png?type=download&issys=${window.SignedUser_IsAdmin}"></img> <p>首页</p>
                                            </a>
                                        </li-->
                                        <li v-for="(item,index) in model" :class="index<model.length - 1?'slot-li-divider':''">
                                            <a href="javascript:void(0);" :target="item.target" @click="triggerInput($event,item.name)" :title="item.cnname" data-tooltip="tooltip">
                                                <img :src="item.icon | pickIcon" style="width:48px;"></img> 
                                                <p>
                                                    <input type="checkbox" :ref="item.name" v-model='item.selected' @click="toggle(item)"> #{_.truncate(item.cnname, {'length': 6})}#
                                                </p>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/janesware/system?view=app"  title="应用管理" data-tooltip="tooltip">
                                                <i class="fas fa-plus fa-3x"></i> <p>应用管理</p>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div class="col-lg-3" style="border-left: 1px solid #ddd;">
                                    <ul class="animated fadeIn" style="list-style: none;">
                                        <li v-for="(item,index) in group" :class="index<group.length - 1?'slot-li-divider':''" style="margin:5px 0px;">
                                            <a href="javascript:void(0);" :target="item.target" :title="item.cnname" data-tooltip="tooltip">
                                                #{_.truncate(item.cnname, {'length': 6})}#  
                                                <span class="badge" style="background-color:transparent;color:#999;">#{item.count}#</span>
                                            </a>
                                            <span :class="item.icon" style="color:#fba729;"></span> 
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-12">
                                    <a href="http://wecise.com#appstore" target="_blank">唯简企业应用商店</a>
                                </div>
                            </div>
                        </div>`,
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

                }
            }

        };

        // 左边栏盒子应用
        this.sideMenu = {
            delimiters: ['#{', '}#'],
            el: '#sidebar-menu',
            data: {
                model: null,
                preFixIcon: `${window.ASSETS_ICON}/apps/png/`,
                postFixIcon: `?type=download&issys=${window.SignedUser_IsAdmin}`
            },
            template: `<ul class="nav animated bounceIn">
                        <li class="dropdown top-bar">
                            <a class="sidebar-toggle" href="javascript:sideBar.toggleSideBar();" data-tooltip="tooltip" title="切换导航栏">
                                <img :src="preFixIcon+'toggle-left.png'+postFixIcon" style="width:17px;"></img> <span class="nav-label">切换</span>
                            </a>
                        </li>
                        <li class="dropdown top-bar">
                            <a  href="javascript:void(0);"  
                                title="应用"
                                data-tooltip="tooltip"
                                @click="initWnd">
                                <img :src="preFixIcon+'app.png'+postFixIcon" style="width:17px;"></img> <span class="nav-label">应用</span>
                            </a>
                        </li>
                        <li>
                            <a href="/" title="首页" data-tooltip="tooltip">
                                <img :src="preFixIcon+'home.png'+postFixIcon" style="width:17px;"></img> <span class="nav-label">首页</span>
                            </a>
                        </li>
                        <li v-for="(item,index) in model" :class="item.status">
                            <a :href="item.url" :target="item.target" :title="item.cnname" data-tooltip="tooltip">
                                <img :src="item.icon | pickIcon" style="width:17px;"></img> <span class="nav-label">#{item.cnname}#</span>
                            </a>
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
                        new Vue(sideBar.appBox);
                    }, 50);

                },
                refresh: function(){
                    this.init();
                }
            }
        };
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

    init(){
        new Vue(sideBar.sideMenu);
    }

}

let sideBar = new SideBar();

document.addEventListener('DOMContentLoaded', function(){
    sideBar.init();
}, false);