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

            }, false);

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

    fullScreenByEl(el) {
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
            return false;
        } else {
            el.requestFullscreen();
            return true;
        }

    }

    // 全屏控制 扩展
    fullScreen(mode) {
        if ( mode ) {
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
