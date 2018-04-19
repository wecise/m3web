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

var init =  function(){
                
                GLOBAL_OBJECT.company.global = GLOBAL_CONFIG.global.timeline_scale;
                GLOBAL_OBJECT.company.name = localStorage.getItem("uname");// `{{.SignedUser.Company.OSpace}}`;
                if (_.isEmpty(GLOBAL_OBJECT.company.name )){
                    GLOBAL_OBJECT.company.name = 'wecise';
                }

                GLOBAL_OBJECT.company.name = GLOBAL_OBJECT.company.name.replace(/"/g,"");
                let _name = GLOBAL_OBJECT.company.name;
                GLOBAL_OBJECT.company.dimension = GLOBAL_CONFIG.keyspace[_name].dimension;
                
                _.forEach(_.keys(GLOBAL_OBJECT.company.object),function(v){
                    if(!_.isEmpty(GLOBAL_CONFIG.keyspace[_name])){
                        GLOBAL_OBJECT.company.object[v] = GLOBAL_CONFIG.keyspace[_name][v][GLOBAL_CONFIG.keyspace[_name][v].name];
                    } else {
                        GLOBAL_OBJECT.company.object[v] = [];
                    }
                })
               
                //console.log(23, GLOBAL_OBJECT.company.dimension)
            };

/*
*  FullScreen Util
* */
var toggleFullScreen = function () {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
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

/*
 * 
 */

var loadLogo = function () {
    let _logo = '{{.logo}}';
    
    _logo = _logo.replace(/"/g,"");

    jQuery.ajax({
        url: '/fs/' + _logo,
        type: 'GET',
        contentType: "application/text; charset=utf-8",
        dataType: 'text json',
        data: {
          type: 'file'
        },
        beforeSend:function(xhr){ 
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {
            
            if( _.isEmpty(data.message) ) return false;
            
        },
        error: function(xhr, textStatus, errorThrown) {
        }
    });
}

/*
 *  For: Load Function  
 */
var loadResource = function(filename, filetype, id){

    if (filetype == "js"){
        var fileref = document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    } else if (filetype == "template"){
        var fileref = document.createElement('script')
        fileref.setAttribute("type","text/x-template")
        fileref.setAttribute("id", id)
        $.get( filename, function( data ) {
            $(fileref).html(data);
        });
    } else if (filetype == "css"){ 
        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    } 
    if (typeof fileref != "undefined"){
        console.log(fileref)
        document.getElementsByTagName("head")[0].appendChild(fileref)
    }
}

/*
 *  For: Get Url Params 
 */
var urlParams = (function(url)
{
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

var ifSignIn = function (event) {
    if (event.status == 'signin'){
        window.location.href = event.message;
        return false;
    }
};


/*
* 设置Home
* 参数：
*   home.html
*/
var setDefaultHome = function(name,token){
    let rtn = null;

    jQuery.ajax({
        url: "/user/settings/home",
        type: "POST",
        dataType: "json",
        data: {
            home: name,
            _csrf: token
        },
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {
            rtn = data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};

/*
* 提交到文件系统
* 参数：
*   文件名称
*   扩展名
* */
var putToFS = function(type, name, content){
    let rtn = null;

    let fm = new FormData();

    fm.append("data", content);
    fm.append("attr", JSON.stringify({
                'content': content, 'pic': ''
            }));
    fm.append("type", "file");

    console.log(content, JSON.stringify(fm))

    jQuery.ajax({
        url: "/fs/home/creative/" + name,
        type: 'PUT',
        processData: false,
        contentType: false,
        mimeType: 'multipart/form-data',
        dataType: "json",
        data: fm,
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {
            console.log(JSON.stringify(data))
            rtn = data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};


/*
* 获取文件列表
* 参数：
*   父目录
*   文件名称
* */
var fetchListFromFS = function(parent){
    let rtn = null;
    
    jQuery.ajax({
        url: '/fs/home/' + parent,
        type: 'GET',
        dataType: 'text json',
        contentType: "application/text; charset=utf-8",
        async:false,
        data: {
            type: 'dir'
        },
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {
            
            ifSignIn(data);

            if (_.isEmpty(data.message)) return false;

            rtn = data.message;

        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
* 获取文件内容从文件系统
* 参数：
*   父目录
*   文件名称
* */
var fetchFileFromFS = function(parent,name){
    let rtn = null;

    jQuery.ajax({
        url: '/fs' + parent + "/" + name,
        type: 'GET',
        contentType: "application/text; charset=utf-8",
        dataType: 'text json',
        async:false,
        data: {
            type: 'file'
        },
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, textStatus, xhr) {
console.log('/fs' + parent + "/" + name, JSON.stringify(data))
            ifSignIn(data);

            if (_.isEmpty(data.message)) return false;

            rtn = data.message;

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};


/*
*  获取当前class属性
*  参数：
*   class
* */
var fetchClass = function (param) {
    let rtn = null;

    jQuery.ajax({
        url: '/mxobject/schema/class',
        type: 'GET',
        dataType: 'json',
        async:false,
        data: {
            class: param
        },
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            rtn = data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};


/*
*  一键搜索
*  参数：
*       cond：一键搜索语法及搜索关键字
* */
var fetchData = function (param) {
    let rtn = null;

    jQuery.ajax({
        url: '/mxobject/search',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            cond: param
        },
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            console.log(param, data)

            rtn = data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};

/*
* 执行MQL
* 参数：
*   mql
* */
var fetchDataByMql = function (param) {

    let rtn = null;

    jQuery.ajax({
        url: "/mxobject/list/sql",
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {
            ctype:"obj",
            sql: param
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            console.log(param, data)

            // MQL for CRUD
            if(data.message == "OK"){
                swal("Success!","","success");
            }

            rtn = data;

        },
        error: function(xhr, textStatus, errorThrown){
            mxLog.warn("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};


/*
* 获取一个文件内容
* 参数：
*   url
* */
var fetchFile = function (url) {

    let rtn = null;

    jQuery.ajax({
        url: url,
        async:false,
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            rtn = data.data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;

};

/*
* 执行作业
*
* 参数：
*   receive_output： false【等待执行】 true【立即执行】 default：false
 *  param：cmd
 *  timeout： default：5 second
* */
var callJob = function () {

    let event = '{"cmd":"df -h","HOST!":"wecise"}';

    jQuery.ajax({
        url: '/job/remote_command@system/common',
        dataType: 'json',
        type: 'GET',
        data: {
            receive_output: true,
            param: event,
            timeout: 5
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            console.log(data)

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
};



var putDataByMql = function (event) {

    let _mql = `INSERT JSON '` + JSON.stringify(event) + `'`;

    console.log(_mql)

    jQuery.ajax({
        url: "/mxobject/list/sql",
        dataType: 'json',
        type: 'POST',
        data: {
            ctype:"obj",
            sql: _mql
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if (data.status == "ok"){
                swal("Success!","","success");
            }

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
};

/*
*  用户管理
*
*/
var ldapAdd = function (event) {
    let rtn = null;

    jQuery.ajax({
        url: "/admin/users",
        dataType: 'json',
        type: 'POST',
        async: false,
        data: event,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if (data.status == "ok"){
                swal("Success!","","success");
            }

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
}

var newWindow = function (size, title, template) {
    var win;
    var w = $( window ).width();//document.body.clientWidth;
    var h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);
    var wW = $( window ).width()*2.2/3;
    var hH = $( window ).height()*2.5/3;

    if(size=='small'){
        wW = $( window ).width()*1.5/3;
        hH = $( window ).height()*1.8/3;
    }

    var lrwh = [(w-wW)/2, (h-hH)/2, wW, hH];
    var tb = document.createElement('div');

    $(tb).append(template);
    win = new mxWindow(title, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
    win.setMaximizable(true);
    win.setResizable(true);
    win.setClosable(true);
    win.setVisible(true);

    win.addListener(mxEvent.MAXIMIZE, function(event){
        _.delay(function(){
            eventHub.$emit("win-resize-event",null);
        },100);
    });

    win.addListener(mxEvent.MINIMIZE, function(event){
        _.delay(function(){
            eventHub.$emit("win-resize-event",null);
        },100);
    });

    win.addListener(mxEvent.NORMALIZE, function(event){
        _.delay(function(){
            eventHub.$emit("win-resize-event",null);
        },100);
    });

    return win;
}


/*
 *  For: Wait Function  
 */
var wait = function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
};

var tooltip, // global variables oh my! Refactor when deploying!
    hidetooltiptimer

function createtooltip(){ // call this function ONCE at the end of page to create tool tip object
    tooltip = document.createElement('div')
    tooltip.style.cssText =
        'position:absolute; background:black; color:white; padding:4px;z-index:10000;'
        + 'border-radius:2px; font-size:12px;box-shadow:3px 3px 3px rgba(0,0,0,.4);'
        + 'opacity:0;transition:opacity 0.3s'
    tooltip.innerHTML = 'Copied...'
    document.body.appendChild(tooltip)
}

function showtooltip(e){
    var evt = e || event
    clearTimeout(hidetooltiptimer)
    tooltip.style.left = evt.pageX - 10 + 'px'
    tooltip.style.top = evt.pageY + 15 + 'px'
    tooltip.style.opacity = 1
    hidetooltiptimer = setTimeout(function(){
        tooltip.style.opacity = 0
    }, 50)
}

function copySelectionText(){
    var copysuccess // var to check whether execCommand successfully executed
    try{
        copysuccess = document.execCommand("copy") // run command to copy selected text to clipboard
    } catch(e){
        copysuccess = false
    }
    return copysuccess
}

function getSelectionText(){
    var selectedText = ""
    if (window.getSelection){ // all modern browsers and IE9+
        selectedText = window.getSelection().toString()
    }
    return selectedText
}

var copyBoard = function () {
    createtooltip() // create tooltip by calling it ONCE per page. See "Note" below
    var buddhaquote = document.getElementsByTagName('body')[0];
    buddhaquote.addEventListener('mouseup', function(e){
        var selected = getSelectionText() // call getSelectionText() to see what was selected
        if (selected.length > 0){ // if selected text length is greater than 0
            var copysuccess = copySelectionText() // copy user selected text to clipboard
            showtooltip(e)
        }
    }, false)
}

var handleBootstrapWizards = function() {
    "use strict";
    $("#wizard").bwizard()
};
var FormWizard = function() {
    "use strict";
    return {
        init: function() {
            handleBootstrapWizards()
        }
    }
}();

init();

_.delay(function () {
    //copyBoard();
},5000)