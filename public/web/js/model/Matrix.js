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
class Matrix {

    constructor() {

        this.GLOBAL = null;

        this.name = 'M³ Platform';
        this.version = '0.8';
        this.theme = 'DARK';

        this.username = window.SignedUser_UserName;
        this.fullname = window.SignedUser_FullName;
        this.isadmin = window.SignedUser_IsAdmin;
        this.remark = window.SignedUser_Remark;

        this.companyName = window.COMPANY_NAME;
        this.companyLogo = window.COMPANY_LOGO;
        this.companyTitle = window.COMPANY_TITLE;

        this.currentUserTemplate = null;
        this.searchJson = null;

        this.urlParams = (function(url){
                            var result = new Object();
                            var idx = url.lastIndexOf('?');

                            if (idx > 0)
                            {
                                var params = url.substring(idx + 1).split('&');

                                for (var i = 0; i < params.length; i++)
                                {
                                    idx = params[i].indexOf('=');

                                    if (idx > 0)
                                    {
                                        result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
                                    }
                                }
                            }
                            return result; 
                        })(window.location.href);
    }

    init() {
        mx.global();
        mx.setLogo();
        mx.setFavIcon();
        mx.setTitle();
        mx.setTheme();
        
        document.addEventListener('DOMContentLoaded', function(){
            // 全文搜索实例
            mx.search();
            // Robot实例
            mx.robot();
            // API菜单实例
            mx.footerApiContextMenu();
            // 工具提示实例
            mx.toolTip()
            // 模式监控
            mx.viewListen();
            // Alert设置
            mx.mxAlert();
            // 加载当前用户模板
            mx.setCurrentUserTemplate();

            document.addEventListener('click', function (event) {

                // If the clicked element doesn't have the right selector, bail
                if (!event.target.matches('.click-me')) return;

                // Don't follow the link
                event.preventDefault();

                // Log the clicked element in the console
                console.log(event.target,event);

            }, false);

            _.delay(function(){
                //mx.handleDraggablePanel();
                // mx.handleLocalStorage();
                // mx.handleResetLocalStorage();
                //mx.handleSlimScroll();
                mx.handleSidebarMenu();
                // mx.handleMobileSidebarToggle();
                mx.handleSidebarMinify();
                // mx.handleMobileSidebar();
                // mx.handleThemePageStructureControl();
                // mx.handleThemePanelExpand();
                mx.handleAfterPageLoadAddClass();
                mx.handlePanelAction();
                mx.handleWinAction();
                // mx.handelTooltipPopoverActivation();
                mx.handleScrollToTopButton();
                mx.handlePageContentView();
                mx.handleIEFullHeightContent();
                // mx.handleUnlimitedTabsRender();
            },1000)

        }, false);

        console.log(`%c产品：${mx.name}`, "color:red")
        console.log(`%c版本：${mx.version}`, "color:red")
        console.log("%c唯简科技：http://wecise.com", "color:red")
        console.log("%cBug提交：mailto://wangzd@wecise.com?subject=Bug", "color:red")

    }

    // 单位转换
    bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    // 设置Logo
    setLogo(){
        $("#company_logo").ready(function(){
            $("#company_logo").attr("src", mx.companyLogo);
        })
    }

    // 设置Fav
    setFavIcon(){
        $("#favicon").attr("href", mx.companyLogo);
    }

    // 设置Title
    setTitle(){
        document.title = mx.companyTitle;
    }

    // 设置主题
    setTheme(){
        
        $("body").ready(function(){
            let allClassName = _.keys(mx.global.register.theme).join(" ");
            $("body").removeClass(allClassName);
            $("body").addClass(mx.global.register.theme.default);
        })
        
    }

    // 设置当前用户template
    setCurrentUserTemplate(){
        try{
            let parent = `/etc/template`;

            let temp = fsHandler.fsContent(parent,'template.json');
            
            mx.currentUserTemplate = _.attempt(JSON.parse.bind(null, temp));

            mx.searchJson = new JsSearch.Search('name');
            mx.searchJson.addIndex('name');
            //mx.searchJson.addIndex('title');
            //mx.searchJson.addIndex('template')

            let templates = _.map(mx.currentUserTemplate,function(v){
                let t = fsHandler.fsContent(parent,`${v.name}.json`);
                return _.merge(v,{template: t});
            })
            mx.searchJson.addDocuments(templates);
        } catch(err){

        }
    }

    // 切换主题
    toggleTheme(theme){
        
        let allClassName = _.keys(mx.global.register.theme).join(" ");
        $("body").removeClass(allClassName);
        $("body").addClass(theme);
        
    }

    // 语言
    mxLang() {
        return 'zh_CN';// ['zh_CN','en_EG']
    }


    // alertify setup
   mxAlert(){
        alertify.set({ labels : { ok: "确认", cancel: "取消" } });
   }

    // 打标签
    tagInput( className, container, row, fn){

        let tag = {
            el: container,
            template: `<input class="${className}" name='tags' placeholder='' :value='value|pickTags' autofocus>`,
            data: {
                tagify: null,
                value: row.tags
            },
            filters: {
                pickTags: function(item){
                    if(item){
                        return item.join(",") || [];
                    } else {
                        return null;
                    }
                }
            },
            mounted: function(){

                let me = this;
                let input = document.querySelector(`.${className}`);

                // init Tagify script on the above inputs
                me.tagify = new Tagify(input, { whitelist : [], blacklist : [] });

                me.tagify.on('add', me.onAddTag)
                    .on('remove', me.onRemoveTag);

            },
            methods: {

                onAddTag: function(event){


                    let input = {class: row.class, action: "+", tag: event.detail.value, id: row.id};
                    let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));

                    if(rtn.status == 'ok'){
                        fn();
                    }

                },
                onRemoveTag: function(event){

                    let input = {class: row.class, action: "-", tag: event.detail.value, id: row.id};
                    let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));

                    if(rtn.status == 'ok'){
                        fn();
                    }

                }

            }
        };

        return tag;
    }

    // 全文搜索配置
    search(){
        let search = {
            data: {
                options:{
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
                }
            },
            template: `<div style="padding:10px;">
                            <el-input v-model="options.term" autofocuse @click="onSearch" @keyup.13="onSearch" placeholder="搜索"></el-input>
                        </div>`,
            mounted(){
                $("input",this.$el).css({
                    "background":"transparent",
                    "color":"#ffffff"
                });
            },
            methods:{
                onSearch: function() {

                    if(_.isEmpty(this.options.term)) {
                        this.$message({
                            type: "info",
                            message: "请输入搜索关键字"
                        });
                        
                        return false;
                    }

                    let url = `/janesware/search?preset=${window.btoa(encodeURIComponent(JSON.stringify(this.options)))}`;
                    
                    window.open(url,"_parent");
                    
                }
            }

        };

        //new Vue(search).$mount("#search-bar");
    }

    // Robot
    robot(){

        try{
            if(!mx.global.register.robot.enable) return false;
        } catch(err){
            return false;
        }
        

        $.get(`${window.ASSETS_ICON}/robot/svg/robot.svg?type=download&issys=${window.SignedUser_IsAdmin}`,function(svg){

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
                        $("#ai-robot div").first().append(`<span class="animated fadeIn" style="margin:15px 0;background:#ff0000;border-radius:15px;padding:3px 8px;color:#ffffff;">${count}</span>`);
                    }
                } catch(err){

                }
            }

            if(_.includes(['matrix'],window.COMPANY_OSPACE)){
                setInterval(getStatus, mx.global.register.robot.interval);
            }

        },'text');
    }

    // 获取当前页
    getPage(){
        let path = window.location.pathname;
        let page = path.split("/").pop();
        $("body").addClass(`page-${page}`);
        return page;
    }

    getLicense(){

        let _config = _.attempt(JSON.parse.bind(null, `{{.config}}`));
    
        if(_.isEmpty(_config)){
            $(".license").html("");
        } else {
            $(".license").html(_config.license);
        }
    }

    renameKey(obj, key, newKey) {

        if(_.includes(_.keys(obj), key)) {
            obj[newKey] = _.clone(obj[key], true);
    
            delete obj[key];
            delete obj['enum'];
            //delete obj['type'];
        }
    
        return obj;
    }
    
    
    columnsParse(meta){
        let _columns = null;
    
        // *
    
        if(_.isEmpty(meta)) {
            return _columns;
        }
    
        // meta
        _.forEach(meta.columns, function(v,k){
            _.forEach(v,function(val,key){
                mx.renameKey(val, 'name', 'field');
            })
        })
    
        return meta.columns;
    
    }

    sanitizeData(arr) {
        let newKey;
        _.forEach(arr,function(item) {
            for(var key in item) {
                newKey = key.replace(/\./g, '&#46;');
                if (key != newKey) {
                    item[newKey]=item[key];
                    delete item[key];
                }     
            }    
        })    
        return arr;
    }            
    
    sanitizeColumns(arr,column) {
        let dataProp;
        arr.forEach(function(item) {
            dataProp = item[column].replace(/\./g, '\\.');
            item[column] = dataProp;
        })
        return arr;
    }   
    
    jsonToTable(data) {
        
        // EXTRACT VALUE FOR HTML HEADER. 
        // ('Book ID', 'Book Name', 'Category' and 'Price')
        var col = [];
        for (var i = 0; i < data.length; i++) {
            for (var key in data[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");

        var tr = table.insertRow(-1); 

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < data.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = data[i][col[j]];
            }
        }

        return $(table).html();
    }

    // API菜单
    footerApiContextMenu(){

        let open = function(url){ window.open(url,"_blank");};
        let rtn = fsHandler.callFsJScript('/matrix/footer/api_contextmenu.js', null).message || [];
        
        contextMenu.build('api-contextmenu', {select:'footer-button-group', items: rtn, handle: open});
    }

    // 工具提示
    toolTip(){
        $("a[data-tooltip='tooltip']").tooltip({
            container: 'body',
            trigger : 'hover',
            template: `<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>`
        });
        $("div[data-tooltip='tooltip']").tooltip({
            container: 'body',
            trigger : 'hover',
            template: `<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>`
        });
        $("li[data-tooltip='tooltip']").tooltip({
            container: 'body',
            trigger : 'hover',
            template: `<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>`
        });
    }

    // 全屏控制
    fullScreen() {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    handleSlimScroll() {
        "use strict";
        $("[data-scrollbar=true]").each(function() {
            mx.generateSlimScroll($(this))
        })
    }

    generateSlimScroll(e) {
        var a = $(e).attr("data-height");
        a = a ? a : $(e).height();
        var t = {
            height: a,
            alwaysVisible: !0
        };
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? ($(e).css("height", a), $(e).css("overflow-x", "scroll")) : $(e).slimScroll(t)
    }

    tabs(containerClass){
        $(`.nav-tabs.${containerClass}-ul`).on("click", "a", function (e) {
            e.preventDefault();
            if (!$(this).hasClass('add-tab')) {
                $(this).tab('show');
            }
        })
            .on("click", "span", function () {
                var anchor = $(this).siblings('a');
                $(anchor.attr('href')).remove();
                $(this).parent().remove();
                $(`.nav-tabs.${containerClass}-ul li`).children('a').first().click();
            });

        $(`.${containerClass}-ul .add-tab`).click(function (e) {
            e.preventDefault();
            var id = $(`.nav-tabs.${containerClass}-ul`).children().length;
            var tabId = `tab_${id}`;
            $(this).closest('li').before(`<li role="presentation"><a href="#${tabId}" aria-controls="${tabId}" role="tab" data-toggle="tab">${tabId}</a><span class="fas fa-times"></span></li>`);
            $(`.tab-content.${containerClass}-content`).append(`<div class="tab-pane" id="${tabId}">${id}</div>`);
            $(`.nav-tabs.${containerClass}-ul li:nth-child(${id}) a`).click();
        });
    }

    handleBootstrapWizards(id) {
        $("#" + id).bwizard()
    }

    handleSidebarMenu() {
        "use strict";
        $(".sidebar .nav > .has-sub > a").click(function() {
            var e = $(this).next(".sub-menu"),
                a = ".sidebar .nav > li.has-sub > .sub-menu";
            0 === $(".page-sidebar-minified").length && ($(a).not(e).slideUp(250, function() {
                $(this).closest("li").removeClass("expand")
            }), $(e).slideToggle(250, function() {
                var e = $(this).closest("li");
                $(e).hasClass("expand") ? $(e).removeClass("expand") : $(e).addClass("expand")
            }))
        }), $(".sidebar .nav > .has-sub .sub-menu li.has-sub > a").click(function() {
            if (0 === $(".page-sidebar-minified").length) {
                var e = $(this).next(".sub-menu");
                $(e).slideToggle(250)
            }
        })
    }

    handleMobileSidebarToggle() {
        var e = !1;
        $(".sidebar").on("click touchstart", function(a) {
            0 !== $(a.target).closest(".sidebar").length ? e = !0 : (e = !1, a.stopPropagation())
        }), $(document).on("click touchstart", function(a) {
            0 === $(a.target).closest(".sidebar").length && (e = !1), a.isPropagationStopped() || e === !0 || ($("#page-container").hasClass("page-sidebar-toggled") && (e = !0, $("#page-container").removeClass("page-sidebar-toggled")), $("#page-container").hasClass("page-right-sidebar-toggled") && (e = !0, $("#page-container").removeClass("page-right-sidebar-toggled")))
        }), $("[data-click=right-sidebar-toggled]").click(function(a) {
            a.stopPropagation();
            var t = "#page-container",
                i = "page-right-sidebar-collapsed";
            i = $(window).width() < 979 ? "page-right-sidebar-toggled" : i, $(t).hasClass(i) ? $(t).removeClass(i) : e !== !0 ? $(t).addClass(i) : e = !1, $(window).width() < 480 && $("#page-container").removeClass("page-sidebar-toggled")
        }), $("[data-click=sidebar-toggled]").click(function(a) {
            a.stopPropagation();
            var t = "page-sidebar-toggled",
                i = "#page-container";
            $(i).hasClass(t) ? $(i).removeClass(t) : e !== !0 ? $(i).addClass(t) : e = !1, $(window).width() < 480 && $("#page-container").removeClass("page-right-sidebar-toggled")
        })
    }

    handleSidebarMinify() {
        $("[data-click=sidebar-minify]").click(function(e) {
            e.preventDefault();
            var a = "page-sidebar-minified",
                t = "#page-container";
            $(t).hasClass(a) ? ($(t).removeClass(a), $(t).hasClass("page-sidebar-fixed") && (generateSlimScroll($('#sidebar [data-scrollbar="true"]')), $("#sidebar [data-scrollbar=true]").trigger("mouseover"), $("#sidebar [data-scrollbar=true]").stop(), $("#sidebar [data-scrollbar=true]").css("margin-top", "0"))) : ($(t).addClass(a), /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? ($('#sidebar [data-scrollbar="true"]').css("margin-top", "0"), $('#sidebar [data-scrollbar="true"]').css("overflow", "visible")) : ($(t).hasClass("page-sidebar-fixed") && ($('#sidebar [data-scrollbar="true"]').slimScroll({
                destroy: !0
            }), $('#sidebar [data-scrollbar="true"]').removeAttr("style")), $("#sidebar [data-scrollbar=true]").trigger("mouseover"))), $(window).trigger("resize")
        })
    }

    handlePageContentView() {
        "use strict";
        $.when($("#page-loader").addClass("hide")).done(function() {
            $("#page-container").addClass("in")
        })
    }

    handlePanelAction() {
        "use strict";
        $("[data-click=panel-remove]").hover(function() {
            $(this).tooltip({
                title: "删除",
                placement: "bottom",
                trigger: "hover",
                container: "body"
            }), $(this).tooltip("show")
        }), $("[data-click=panel-remove]").click(function(e) {
            e.preventDefault(), $(this).tooltip("destroy"), $(this).closest(".panel").remove()
        }), $("[data-click=panel-collapse]").hover(function() {
            $(this).tooltip({
                title: "最小化 / 最大化",
                placement: "bottom",
                trigger: "hover",
                container: "body"
            }), $(this).tooltip("show")
        }), $("[data-click=panel-collapse]").click(function(e) {
            e.preventDefault(), $(this).closest(".panel").find(".panel-body").slideToggle()
        }), $("[data-click=panel-reload]").hover(function() {
            $(this).tooltip({
                title: "刷新",
                placement: "bottom",
                trigger: "hover",
                container: "body"
            }), $(this).tooltip("show")
        }), $("[data-click=panel-reload]").click(function(e) {
            e.preventDefault();
            var a = $(this).closest(".panel");
            if (!$(a).hasClass("panel-loading")) {
                var t = $(a).find(".panel-body"),
                    i = '<div class="panel-loader"><span class="spinner-small"></span></div>';
                $(a).addClass("panel-loading"), $(t).prepend(i), setTimeout(function() {
                    $(a).removeClass("panel-loading"), $(a).find(".panel-loader").remove()
                }, 2e3)
            }
        }), $("[data-click=panel-expand]").hover(function() {
            $(this).tooltip({
                title: "最大化 / 收起",
                placement: "bottom",
                trigger: "hover",
                container: "body"
            }), $(this).tooltip("show")
        }), $("[data-click=panel-expand]").click(function(e) {
            e.preventDefault();
            var a = $(this).closest(".panel"),
                t = $(a).find(".panel-body"),
                i = 40;
            if (0 !== $(t).length) {
                var n = $(a).offset().top,
                    o = $(t).offset().top;
                i = o - n
            }
            if ($("body").hasClass("panel-expand") && $(a).hasClass("panel-expand")) {
                $("body, .panel").removeClass("panel-expand"),
                $(".panel").removeAttr("style"), $(t).removeAttr("style");
            } else if ($("body").addClass("panel-expand"), $(this).closest(".panel").addClass("panel-expand"), 0 !== $(t).length && 40 != i) {
                var l = 40;
                $(a).find(" > *").each(function() {
                    var e = $(this).attr("class");
                    "panel-heading" != e && "panel-body" != e && (l += $(this).height() + 30)
                }), 40 != l && $(t).css("top", 40 + "px")
            }
            
            $(window).trigger("resize")
            mx.windowResize()
            
        })
    }

    handleWinAction() {
        "use strict";
        $("[data-click=win-collapse]").click(function(e) {
            alert(1)
            e.preventDefault(), $(this).closest(".win.box-card").slideToggle()
        }), $("[data-click=win-expand]").click(function(e) {
            e.preventDefault();
            var a = $(this).closest(".win.box-card"),
                i = 40;
            if (0 !== $(a).length) {
                var n = $(a).offset().top,
                    o = $(a).offset().top;
                i = o - n
            }
            if ($("body").hasClass("win-expand") && $(a).hasClass("win-expand")) {
                $("body, .win").removeClass("panwinel-expand"),
                $(".win").removeAttr("style"), $(t).removeAttr("style");
            } else if ($("body").addClass("win-expand"), $(this).closest(".win").addClass("win-expand"), 0 !== $(t).length && 40 != i) {
                var l = 40;
                $(a).find(" > *").each(function() {
                    var e = $(this).attr("class");
                    "el-card__header" != e && "box-card" != e && (l += $(this).height() + 30)
                }), 40 != l && $(t).css("top", 40 + "px")
            }
            
            $(window).trigger("resize")
            mx.windowResize()
            
        })
    }

    handleDraggablePanel() {
        "use strict";
        var e = $(".panel").parent("[class*=col]"),
            a = ".panel-heading",
            t = ".row > [class*=col]";
        $(e).sortable({
            handle: a,
            connectWith: t,
            stop: function(e, a) {
                a.item.find(".panel-title").append('<i class="fa fa-refresh fa-spin m-l-5" data-id="title-spinner"></i>'), mx.handleSavePanelPosition(a.item)
            }
        })
    }

    /* handelTooltipPopoverActivation() {
        "use strict";
        $("[data-toggle=tooltip]").tooltip(), $("[data-toggle=popover]").popover()
    } */

    handleScrollToTopButton() {
        "use strict";
        $(document).scroll(function() {
            var e = $(document).scrollTop();
            e >= 200 ? $("[data-click=scroll-top]").addClass("in") : $("[data-click=scroll-top]").removeClass("in")
        }), $("[data-click=scroll-top]").click(function(e) {
            e.preventDefault(), $("html, body").animate({
                scrollTop: $("body").offset().top
            }, 500)
        })
    }

    handleThemePageStructureControl() {
        if ($.cookie && $.cookie("theme")) {
            0 !== $(".theme-list").length && ($(".theme-list [data-theme]").closest("li").removeClass("active"), $('.theme-list [data-theme="' + $.cookie("theme") + '"]').closest("li").addClass("active"));
            var e = "assets/css/theme/" + $.cookie("theme") + ".css";
            $("#theme").attr("href", e)
        }
        $.cookie && $.cookie("sidebar-styling") && 0 !== $(".sidebar").length && "grid" == $.cookie("sidebar-styling") && ($(".sidebar").addClass("sidebar-grid"), $('[name=sidebar-styling] option[value="2"]').prop("selected", !0)), $.cookie && $.cookie("header-styling") && 0 !== $(".header").length && "navbar-inverse" == $.cookie("header-styling") && ($(".header").addClass("navbar-inverse"), $('[name=header-styling] option[value="2"]').prop("selected", !0)), $.cookie && $.cookie("content-gradient") && 0 !== $("#page-container").length && "enabled" == $.cookie("content-gradient") && ($("#page-container").addClass("gradient-enabled"), $('[name=content-gradient] option[value="2"]').prop("selected", !0)), $.cookie && $.cookie("content-styling") && 0 !== $("body").length && "black" == $.cookie("content-styling") && ($("body").addClass("flat-black"), $('[name=content-styling] option[value="2"]').prop("selected", !0)), $(".theme-list [data-theme]").live("click", function() {
            var e = "assets/css/theme/" + $(this).attr("data-theme") + ".css";
            $("#theme").attr("href", e), $(".theme-list [data-theme]").not(this).closest("li").removeClass("active"), $(this).closest("li").addClass("active"), $.cookie("theme", $(this).attr("data-theme"))
        }), $(".theme-panel [name=header-styling]").live("change", function() {
            var e = 1 == $(this).val() ? "navbar-default" : "navbar-inverse",
                a = 1 == $(this).val() ? "navbar-inverse" : "navbar-default";
            $("#header").removeClass(a).addClass(e), $.cookie("header-styling", e)
        }), $(".theme-panel [name=sidebar-styling]").live("change", function() {
            2 == $(this).val() ? ($("#sidebar").addClass("sidebar-grid"), $.cookie("sidebar-styling", "grid")) : ($("#sidebar").removeClass("sidebar-grid"), $.cookie("sidebar-styling", "default"))
        }), $(".theme-panel [name=content-gradient]").live("change", function() {
            2 == $(this).val() ? ($("#page-container").addClass("gradient-enabled"), $.cookie("content-gradient", "enabled")) : ($("#page-container").removeClass("gradient-enabled"), $.cookie("content-gradient", "disabled"))
        }), $(".theme-panel [name=content-styling]").live("change", function() {
            2 == $(this).val() ? ($("body").addClass("flat-black"), $.cookie("content-styling", "black")) : ($("body").removeClass("flat-black"), $.cookie("content-styling", "default"))
        }), $(".theme-panel [name=sidebar-fixed]").live("change", function() {
            1 == $(this).val() ? (2 == $(".theme-panel [name=header-fixed]").val() && (alert("Default Header with Fixed Sidebar option is not supported. Proceed with Fixed Header with Fixed Sidebar."), $('.theme-panel [name=header-fixed] option[value="1"]').prop("selected", !0), $("#header").addClass("navbar-fixed-top"), $("#page-container").addClass("page-header-fixed")), $("#page-container").addClass("page-sidebar-fixed"), $("#page-container").hasClass("page-sidebar-minified") || generateSlimScroll($('.sidebar [data-scrollbar="true"]'))) : ($("#page-container").removeClass("page-sidebar-fixed"), 0 !== $(".sidebar .slimScrollDiv").length && ($(window).width() <= 979 ? $(".sidebar").each(function() {
                if (!$("#page-container").hasClass("page-with-two-sidebar") || !$(this).hasClass("sidebar-right")) {
                    $(this).find(".slimScrollBar").remove(), $(this).find(".slimScrollRail").remove(), $(this).find('[data-scrollbar="true"]').removeAttr("style");
                    var e = $(this).find('[data-scrollbar="true"]').parent(),
                        a = $(e).html();
                    $(e).replaceWith(a)
                }
            }) : $(window).width() > 979 && ($('.sidebar [data-scrollbar="true"]').slimScroll({
                destroy: !0
            }), $('.sidebar [data-scrollbar="true"]').removeAttr("style"))), 0 === $("#page-container .sidebar-bg").length && $("#page-container").append('<div class="sidebar-bg"></div>'))
        }), $(".theme-panel [name=header-fixed]").live("change", function() {
            1 == $(this).val() ? ($("#header").addClass("navbar-fixed-top"), $("#page-container").addClass("page-header-fixed"), $.cookie("header-fixed", !0)) : (1 == $(".theme-panel [name=sidebar-fixed]").val() && (alert("Default Header with Fixed Sidebar option is not supported. Proceed with Default Header with Default Sidebar."), $('.theme-panel [name=sidebar-fixed] option[value="2"]').prop("selected", !0), $("#page-container").removeClass("page-sidebar-fixed"), 0 === $("#page-container .sidebar-bg").length && $("#page-container").append('<div class="sidebar-bg"></div>')), $("#header").removeClass("navbar-fixed-top"), $("#page-container").removeClass("page-header-fixed"), $.cookie("header-fixed", !1))
        })
    }

    handleThemePanelExpand() {
        $('[data-click="theme-panel-expand"]').live("click", function() {
            var e = ".theme-panel",
                a = "active";
            $(e).hasClass(a) ? $(e).removeClass(a) : $(e).addClass(a)
        })
    }

    handleAfterPageLoadAddClass() {
        0 !== $("[data-pageload-addclass]").length && $(window).load(function() {
            $("[data-pageload-addclass]").each(function() {
                var e = $(this).attr("data-pageload-addclass");
                $(this).addClass(e)
            })
        })
    }

    handleSavePanelPosition(e) {
        "use strict";
        if (0 !== $(".ui-sortable").length) {
            var a = [],
                t = 0;
            $.when($(".ui-sortable").each(function() {
                var e = $(this).find("[data-sortable-id]");
                if (0 !== e.length) {
                    var i = [];
                    $(e).each(function() {
                        var e = $(this).attr("data-sortable-id");
                        i.push({
                            id: e
                        })
                    }), a.push(i)
                } else a.push([]);
                t++
            })).done(function() {
                var t = window.location.href;
                t = t.split("?"), t = t[0], localStorage.setItem(t, JSON.stringify(a)), $(e).find('[data-id="title-spinner"]').delay(500).fadeOut(500, function() {
                    $(this).remove()
                })
            })
        }
    }

    handleLocalStorage() {
        "use strict";
        if ("undefined" != typeof Storage) {
            var e = window.location.href;
            e = e.split("?"), e = e[0];
            var a = localStorage.getItem(e);
            if (a) {
                a = JSON.parse(a);
                var t = 0;
                $(".panel").parent('[class*="col-"]').each(function() {
                    var e = a[t],
                        i = $(this);
                    e && $.each(e, function(e, a) {
                        var t = '[data-sortable-id="' + a.id + '"]';
                        if (0 !== $(t).length) {
                            var n = $(t).clone();
                            $(t).remove(), $(i).append(n)
                        }
                    }), t++
                })
            }
        } else alert("Your browser is not supported with the local storage")
    }

    handleResetLocalStorage() {
        "use strict";
        $("[data-click=reset-local-storage]").live("click", function(e) {
            e.preventDefault();
            var a = '<div class="modal fade" data-modal-id="reset-local-storage-confirmation">    <div class="modal-dialog">        <div class="modal-content">            <div class="modal-header">                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>                <h4 class="modal-title"><i class="fa fa-refresh m-r-5"></i> Reset Local Storage Confirmation</h4>            </div>            <div class="modal-body">                <div class="alert alert-info m-b-0">Would you like to RESET all your saved widgets and clear Local Storage?</div>            </div>            <div class="modal-footer">                <a href="javascript:;" class="btn btn-sm btn-white" data-dismiss="modal"><i class="fa fa-close"></i> No</a>                <a href="javascript:;" class="btn btn-sm btn-inverse" data-click="confirm-reset-local-storage"><i class="fa fa-check"></i> Yes</a>            </div>        </div>    </div></div>';
            $("body").append(a), $('[data-modal-id="reset-local-storage-confirmation"]').modal("show")
        }), $('[data-modal-id="reset-local-storage-confirmation"]').live("hidden.bs.modal", function() {
            $('[data-modal-id="reset-local-storage-confirmation"]').remove()
        }), $("[data-click=confirm-reset-local-storage]").live("click", function(e) {
            e.preventDefault();
            var a = window.location.href;
            a = a.split("?"), a = a[0], localStorage.removeItem(a), window.location.href = document.URL
        })
    }

    handleIEFullHeightContent() {
        var e = window.navigator.userAgent,
            a = e.indexOf("MSIE ");
        (a > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) && $('.vertical-box-row [data-scrollbar="true"][data-height="100%"]').each(function() {
            var e = $(this).closest(".vertical-box-row"),
                a = $(e).height();
            $(e).find(".vertical-box-cell").height(a)
        })
    }

    /*handleUnlimitedTabsRender() {
        function e(e, a) {
            var t = (parseInt($(e).css("margin-left")), $(e).width()),
                i = $(e).find("li.active").width(),
                n = a > -1 ? a : 150,
                o = 0;
            if ($(e).find("li.active").prevAll().each(function() {
                    i += $(this).width()
                }), $(e).find("li").each(function() {
                    o += $(this).width()
                }), i >= t) {
                var l = i - t;
                o != i && (l += 40), $(e).find(".nav.nav-tabs").animate({
                    marginLeft: "-" + l + "px"
                }, n)
            }
            i != o && o >= t ? $(e).addClass("overflow-right") : $(e).removeClass("overflow-right"), i >= t && o >= t ? $(e).addClass("overflow-left") : $(e).removeClass("overflow-left")
        }

        function a(e, a) {
            var t = $(e).closest(".tab-overflow"),
                i = parseInt($(t).find(".nav.nav-tabs").css("margin-left")),
                n = $(t).width(),
                o = 0,
                l = 0;
            switch ($(t).find("li").each(function() {
                $(this).hasClass("next-button") || $(this).hasClass("prev-button") || (o += $(this).width())
            }), a) {
                case "next":
                    var s = o + i - n;
                    n >= s ? (l = s - i, setTimeout(function() {
                        $(t).removeClass("overflow-right")
                    }, 150)) : l = n - i - 80, 0 != l && $(t).find(".nav.nav-tabs").animate({
                        marginLeft: "-" + l + "px"
                    }, 150, function() {
                        $(t).addClass("overflow-left")
                    });
                    break;
                case "prev":
                    var s = -i;
                    n >= s ? ($(t).removeClass("overflow-left"), l = 0) : l = s - n + 80, $(t).find(".nav.nav-tabs").animate({
                        marginLeft: "-" + l + "px"
                    }, 150, function() {
                        $(t).addClass("overflow-right")
                    })
            }
        }

        function t() {
            $(".tab-overflow").each(function() {
                var a = $(this).width(),
                    t = 0,
                    i = $(this),
                    n = a;
                $(i).find("li").each(function() {
                    var e = $(this);
                    t += $(e).width(), $(e).hasClass("active") && t > a && (n -= t)
                }), e(this, 0)
            })
        }
        $('[data-click="next-tab"]').live("click", function(e) {
            e.preventDefault(), a(this, "next")
        }), $('[data-click="prev-tab"]').live("click", function(e) {
            e.preventDefault(), a(this, "prev")
        }), $(window).resize(function() {
            $(".tab-overflow .nav.nav-tabs").removeAttr("style"), t()
        }), t()
    },*/
    handleMobileSidebar() {
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && $("#page-container").hasClass("page-sidebar-minified") && ($('#sidebar [data-scrollbar="true"]').css("overflow", "visible"), $('.page-sidebar-minified #sidebar [data-scrollbar="true"]').slimScroll({
            destroy: !0
        }), $('.page-sidebar-minified #sidebar [data-scrollbar="true"]').removeAttr("style"), $(".page-sidebar-minified #sidebar [data-scrollbar=true]").trigger("mouseover"));
        var e = 0;
        $(".page-sidebar-minified .sidebar [data-scrollbar=true] a").live("touchstart", function(a) {
            var t = a.originalEvent.touches[0] || a.originalEvent.changedTouches[0],
                i = t.pageY;
            e = i - parseInt($(this).closest("[data-scrollbar=true]").css("margin-top"))
        }), $(".page-sidebar-minified .sidebar [data-scrollbar=true] a").live("touchmove", function(a) {
            if (a.preventDefault(), /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                var t = a.originalEvent.touches[0] || a.originalEvent.changedTouches[0],
                    i = t.pageY,
                    n = i - e;
                $(this).closest("[data-scrollbar=true]").css("margin-top", n + "px")
            }
        }), $(".page-sidebar-minified .sidebar [data-scrollbar=true] a").live("touchend", function() {
            var a = $(this).closest("[data-scrollbar=true]"),
                t = $(window).height();
            e = $(a).css("margin-top");
            var i = 0;
            $(".sidebar").find(".nav").each(function() {
                i += $(this).height()
            });
            var n = -parseInt(e) + $(".sidebar").height();
            if (n >= i) {
                var o = t - i;
                $(a).animate({
                    marginTop: o + "px"
                })
            } else parseInt(e) >= 0 && $(a).animate({
                marginTop: "0px"
            });
            return !0
        })
    }

    //初始化全局配置
    global(){
        
        jQuery.ajax({
            url: `/script/exec/js?input=null&isfile=true`,
            type: "POST",
            async: false,
            data: "/matrix/utils/global.js",
            dataType: 'json',
            contentType: false,
            beforeSend: function(xhr) {
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {
                mx.global = data.message;
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log(xhr.responseText);
            }
        })
        
    }

    // 全屏监听
    viewListen(){
        $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function(e){
            if(!window.screenTop && !window.screenY) {
                $("body").addClass("view-fullscreen");
            } else {
                $("body").removeClass("view-fullscreen");
            }
        });
    }

    // Window RESIZE事件
    windowResize(){
        eventHub.$emit("WINDOW-RESIZE-EVENT");
    }

}

let mx = new Matrix();

mx.init();
