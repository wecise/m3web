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

"use strict";

var eventHub = new Vue();


var GLOBAL_OBJECT=  {
    company: {
        name: "",
        global: {},
        dimension: [],
        object: {
            event: {},
            syslog: {},
            journal: {},
            raw: {},
            log: {},
            performance: {},
            tickets: {},
            change: {},
        }
    }
};

var GLOBAL_PARAMS_FUNC = function(){
    let _input = document.createElement("input");

    _input.id = 'hidden_input';
    _input.type = "hidden";
    _input.value = `{{.SignedUser.Company.OSpace}}`;

    document.body.appendChild(_input);

    _.delay(function(){
        console.log(document.getElementById("hidden_input").value);
    },5000);

};

var init =  function(){

    GLOBAL_OBJECT.company.global = GLOBAL_CONFIG.global.timeline_scale;
    GLOBAL_OBJECT.company.name = localStorage.getItem("uname");// `{{.SignedUser.Company.OSpace}}`;
    if (_.isEmpty(GLOBAL_OBJECT.company.name )){
        GLOBAL_OBJECT.company.name = 'wecise';
    }

    GLOBAL_OBJECT.company.name = GLOBAL_OBJECT.company.name.replace(/"/g,"");
    let _name = GLOBAL_OBJECT.company.name;

    GLOBAL_OBJECT.company.dimension = GLOBAL_CONFIG.keyspace['wecise'].dimension;

    if(GLOBAL_CONFIG.keyspace[_name]){
        GLOBAL_OBJECT.company.dimension = GLOBAL_CONFIG.keyspace[_name].dimension;
    }

    _.forEach(_.keys(GLOBAL_OBJECT.company.object),function(v){
        if(!_.isEmpty(GLOBAL_CONFIG.keyspace[_name])){
            GLOBAL_OBJECT.company.object[v] = GLOBAL_CONFIG.keyspace[_name][v][GLOBAL_CONFIG.keyspace[_name][v].name];
        } else {
            GLOBAL_OBJECT.company.object[v] = [];
        }
    })

};


/*
* 	全文搜索
*
* */
var searchVue = {

    el: '#search-bar',
	data: {
    	term: null,
		preset: {"default":{"name":"最近 1天","value":" | nearest 1 day ","scale":{"scale":"day","step":4,"title":"Day","pattern":"LT","filter":"YYYY/MM/DD HH"}},"nearest":[{"name":"最近 30秒","value":" | nearest 30 seconds ","scale":{"scale":"second","step":7,"title":"Second","pattern":"LTS","filter":"YYYY/MM/DD HH:mm:ss"}},{"name":"最近 1分钟","value":" | nearest 1 minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"最近 5","value":" | nearest 5 minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"最近 10","value":" | nearest 10 minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"最近 15分钟","value":" | nearest 15 minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"最近 30分钟","value":" | nearest 30 minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"最近 1小时","value":" | nearest 1 hour ","scale":{"scale":"hour","step":5,"title":"Hour","pattern":"LT","filter":"YYYY/MM/DD HH:mm"}},{"name":"最近 2小时","value":" | nearest 2 hour ","scale":{"scale":"hour","step":5,"title":"Hour","pattern":"LT","filter":"YYYY/MM/DD HH"}},{"name":"最近 8小时","value":" | nearest 8 hour ","scale":{"scale":"hour","step":5,"title":"Hour","pattern":"LT","filter":"YYYY/MM/DD HH"}},{"name":"最近 1天","value":" | nearest 1 day ","scale":{"scale":"day","step":4,"title":"Day","pattern":"L","filter":"YYYY/MM/DD HH"}}],"realtime":[{"name":"30秒","value":" | within 30seconds ","scale":{"scale":"second","step":7,"title":"Second","pattern":"LTS","filter":"YYYY/MM/DD HH:mm:ss"}},{"name":"1分钟","value":" | within 1minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"5分钟","value":" | within 5minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"10分钟","value":" | within 10minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"15分钟","value":" | within 15minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"30分钟","value":" | within 30minutes ","scale":{"scale":"minute","step":6,"title":"Minute","pattern":"LTS","filter":"YYYY/MM/DD HH:mm"}},{"name":"1小时","value":" | within 1hour ","scale":{"scale":"hour","step":5,"title":"Hour","pattern":"LT","filter":"YYYY/MM/DD HH:mm"}},{"name":"2小时","value":" | within 2hour ","scale":{"scale":"hour","step":5,"title":"Hour","pattern":"LT","filter":"YYYY/MM/DD HH"}},{"name":"8小时","value":" | within 8hour ","scale":{"scale":"hour","step":5,"title":"Hour","pattern":"LT","filter":"YYYY/MM/DD HH"}},{"name":"1天","value":" | within 1day ","scale":{"scale":"day","step":4,"title":"Day","pattern":"LT","filter":"YYYY/MM/DD HH"}},{"name":"1月","value":" | within 1month ","scale":{"scale":"month","step":2,"title":"Month","pattern":"L","filter":"YYYY/MM/DD HH"}},{"name":"所有","value":"","scale":{"scale":"year","step":1,"title":"Year","pattern":"L","filter":"YYYY/MM/DD HH"}}],"relative":[{"name":"今天","value":" | today ","scale":{"scale":"day","step":4,"title":"Day","pattern":"LT","filter":"YYYY/MM/DD HH"}},{"name":"昨天","value":" | yesterday ","scale":{"scale":"day","step":4,"title":"Day","pattern":"LT","filter":"YYYY/MM/DD HH"}},{"name":"本周","value":" | week ","scale":{"scale":"week","step":3,"title":"Week","pattern":"L","filter":"YYYY/MM/DD"}},{"name":"上周","value":" | last week ","scale":{"scale":"week","step":3,"title":"Week","pattern":"L","filter":"YYYY/MM/DD"}},{"name":"本月","value":" | month ","scale":{"scale":"month","step":2,"title":"Month","pattern":"L","filter":"YYYY/MM/DD"}},{"name":"上个月","value":" | last month ","scale":{"scale":"month","step":2,"title":"Month","pattern":"L","filter":"YYYY/MM/DD"}},{"name":"今年","value":" | year ","scale":{"scale":"year","step":1,"title":"Year","pattern":"L","filter":"YYYY/MM"}},{"name":"去年","value":" | last year ","scale":{"scale":"year","step":1,"title":"Year","pattern":"L","filter":"YYYY/MM"}}],"range":{"from":"","to":""},"others":{"ifHistory":false,"ifDebug":false,"forTime":" for vtime "}},
	},
    template: `<form class="navbar-form full-width topbar">
					<div class="form-group">
						<input type="text" class="form-control" placeholder="搜索" v-model="term">
						<button class="btn btn-search" @click="onSearch" @keyup.13="onSearch"><i class="fa fa-search"></i></button>
					</div>
				</form>`,
    mounted:function(){
        let me = this;

        me.$nextTick(function() {

        })
    },
	methods:{
        onSearch: function() {

            if (_.isEmpty(this.term)) {
                alertify.log("请输入搜索关键字");
                $(self.$el).find("input").focus();
                return false;
            }

            localStorage.setItem("search-object",JSON.stringify({
                    cond: this.term,
                    preset: this.preset
                })
            );
            window.open(
                "/janesware/search",
                "_blank"
            );
        }
	}

};

/*
* App box
*
* */
var appBox = {
	delimiters: ['#{', '}#'],
	el: '#nav-menu-level1',
	data: {
		model: null
	},
	template: `<ul class="dropdown-menu top-bar animated fadeInDown nav-menu-level1">
					<li>
						<a href="/">
							<i class="fa fa-home fa-3x"></i> <p>首页</p>
						</a>
					</li>
					<!--<li role="separator" class="divider"></li>-->
					<li v-for="(item,index) in model" :class="index<model.length - 1?'slot-li-divider':''">
						<a href="javascript:void(0);" :target="item.target" @click="triggerInput(item.name)">
							<i :class="item.icon + ' fa-3x'"></i> 
							<p><input type="checkbox" :ref="item.name" v-model='item.selected' @click="toogle(item)"> #{item.cnname}#</p>
						</a>
					</li>
				</ul>`,
	created: function(){
		let _list = fetchData("#/matrix/portal/tools/: | sort by seat asc");
		this.model = _list.message;
		this.model.push({icon:'fa fa-plus', url:'/janesware/system?view=app', cnname:'应用管理', enname: 'App Console', target: '_parent'});
	},
	mounted: function () {
		this.$nextTick(function () {
			//$(".slot-li-divider").after(`<li role="separator" class="divider"></li>`);
		})
	},
    methods: {
        toggle: function(item){

        },
        triggerInput: function(name){
            let self = this;

            $(self.$refs[name]).click();
        }
    }

};

/*
*	Sidebar config
*
* */
let sideMenu = {
    delimiters: ['#{', '}#'],
    el: '#sidebar-menu',
    data: {
        model: null
    },
    template: `<ul class="nav animated bounceIn">
                        <li class="dropdown top-bar">
							<a  class="dropdown-toggle" 
								href="{{AppSubUrl}}/"  
								data-toggle="dropdown" 
								role="button" 
								aria-haspopup="true" 
								aria-expanded="false"
								title="应用">
								<i class="fa fa-th fa-2x"></i> <span class="nav-label">应用</span>
							</a>
							<div id="nav-menu-level1">
							</div>
						</li>
                        <li>
                            <a href="/" title="首页">
                                <i class="fas fa-home fa-2x"></i> <span class="nav-label">首页</span>
                            </a>
                        </li>
                        <li v-for="(item,index) in model" :class="item.status">
                            <a :href="item.url" :target="item.target" :title="item.cnname">
                                <i :class="item.icon + ' fa-2x'"></i> <span class="nav-label">#{item.cnname}#</span>
                            </a>
                        </li>
                    </ul>`,
    created: function(){
        let _list = fetchData("#/matrix/portal/tools/: | sort by seat asc");
        this.model = _.map(_list.message,function(v){
            let _page = _.last(getPage().split("/"));

            if(_.endsWith(v.url,_page)){
                return _.merge(v, {status: "active"});
            }

            return _.merge(v, {status: ""});
        });
    },
    mounted: function () {

        this.$nextTick(function () {
            //$(".slot-li-divider").after(`<li role="separator" class="divider"></li>`);
        })
    },
	methods: {

	}
};

/*
*  Sidebar 切换
*
* */
var toggleSideBar = function(){

    let page = getPage();

    let index = 1;

    if(localStorage.getItem('PAGE_SIDEBAR_STATUS')){
        index = _.last(localStorage.getItem('PAGE_SIDEBAR_STATUS').split("_"));
    }

    if(index == 0){
        $("#sidebar").css('display','none');
        $("#sidebar-bg").css('display','none');

        $("#content").css("margin-left","0px");

        index = 1;

    } else {
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

    // Emit container layout resize event
    eventHub.$emit("CONTAINER-LAYOUT-RESIZE-EVENT");

};


/*	Robot
*
*
 */
var robot = function(){

    $.get('/web/assets/images/robot.svg',function(svg){

        $("#ai-robot").empty();

        $("#ai-robot").append(`<div style="position: absolute;right:30px;top: -10px;cursor: pointer;" class="animated fadeIn">
                                ${svg}
                             </div>
                             <span class="badge badge-danger" style="margin: 15px 15px;">5</span>`).find('svg').click(function(){

            if($("#jsPanel-robot")){
                $("#jsPanel-robot").remove();
            }

            let win = newWindow("fsrobot", "∵", '<div class="animated slideInDown" id="robot-active-win"></div>', null);

            let robotVue = {
                el: '#robot-active-win',
                template: '<ai-robot-component id="THIS-IS-ROBOT"></ai-robot-component>',
                mounted: function () {

                    this.$nextTick(function () {


                    })
                }
            };

            new Vue(robotVue);
        });

    },'text');
};


/*
*  Theme toggle
*
* */
var MATRIX_THEME = "LIGHT";

var toggleTheme = function(event){

    if(event == 'LIGHT'){

        $(".navbar.navbar-default.navbar-fixed-top").css({
            "backgroundColor": "rgb(33, 149, 244)",
        });

        $("#sidebar").css({
            "backgroundColor": "rgb(33, 149, 244)!important",
        });

        $("#sidebar-bg").css({
            "backgroundColor": "rgb(33, 149, 244)!important",
        });

    	$(".sidebar-toggle i").css({
            "color": "rgb(166, 211, 248)"
        });

        $(".layer.btn.btn-primary").css({
            "backgroundColor": "rgb(33, 149, 244)"
        });

        $(".layer > .dropdown > a").css({
            "color": "rgb(110, 180, 236)"
        });

        $(".layer > .dropdown > i").css({
            "color": "rgba(255,255,255,0.5)"
        });

        $(".layer a").css({
            "color": "rgb(255,255,255)"
        });

        $(".row .btn.btn-primary").css({
            "backgroundColor": "rgb(33, 149, 244)",
            "borderColor": "rgba(0, 0, 0, 0)"
        });

        $(".navbar.navbar-default.navbar-fixed-bottom").css("background-color","rgb(240, 243, 244)");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("span").css("color","#333333");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("a").css("color","#333333");

    } else if (event == 'DARK'){

        $(".navbar.navbar-default.navbar-fixed-top").css({
            "backgroundColor": "rgb(90, 90, 90)",
        });

        $("#sidebar").css({
            "backgroundColor": "rgb(90, 90, 90)!important",
        });

        $("#sidebar-bg").css({
            "backgroundColor": "rgb(90, 90, 90)!important",
        });

        $(".sidebar-toggle i").css({
            "color": "rgb(141, 146, 151)"
    	});

        $(".layer.btn.btn-primary").css({
            "backgroundColor": "rgb(90, 90, 90)"
        });

        $(".layer > .dropdown > a").css({
            "color": "rgb(255,255,255)"
        });

        $(".layer > .dropdown > i").css({
            "color": "rgba(255,255,255,0.5)"
        });

        $(".layer a").css({
            "color": "rgb(255,255,255)"
        });

        $(".row .btn.btn-primary").css({
            "backgroundColor": "rgb(90, 90, 90)",
            "borderColor": "rgb(90,90,90)"
        });

        $(".navbar.navbar-default.navbar-fixed-bottom").css("background-color","rgb(90, 90, 90)");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("span").css("color","#f9f9f9");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("a").css("color","#f9f9f9");
    }

    localStorage.setItem("MATRIX_THEME",event);

};


/* init ext
*
* */
var initPlugIn = function () {

    // Theme
    let _theme = localStorage.getItem("MATRIX_THEME");
    toggleTheme(_theme);

    _.delay(function(){
        new Vue(sideMenu);
        new Vue(appBox);
        new Vue(searchVue);

        robot();

    },1000)


};


/* init
*
* */

init();

initPlugIn();
