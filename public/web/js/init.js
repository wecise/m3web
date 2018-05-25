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

};

var initPlugIn = function () {

    let _theme = localStorage.getItem("MATRIX_THEME");

    toggleTheme(_theme);
};

/*
*  FullScreen Util
*
*/
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
};

/*
*  皮肤切换
*
* */

var MATRIX_THEME = "LIGHT";

var toggleTheme = function(event){

    if(event == 'LIGHT'){

        $(".navbar.navbar-default.navbar-fixed-top").css({
                                                            "backgroundColor": "rgb(33, 149, 244)",
            
                                                        });

        $(".layer.btn.btn-primary").css({
                                            "backgroundColor": "rgb(33, 149, 244)"
                                        });

        $(".layer > .dropdown > a").css({
                                            "color": "rgb(110, 180, 236)"
                                        });

        $(".layer > .dropdown > a i").css({
            "color": "rgba(255,255,255,0.5)"
        });

        $(".layer a").css({
            "color": "rgb(255,255,255)"
        });

        $(".row-fluid .btn.btn-primary").css({
                                        "backgroundColor": "rgb(33, 149, 244)",
                                        "borderColor": "rgb(255, 255, 255)"
                                });


        $(".navbar.navbar-default.navbar-fixed-bottom").show(500);
    } else if (event == 'DARK'){

        $(".navbar.navbar-default.navbar-fixed-top").css({
                                                            "backgroundColor": "rgb(90, 90, 90)",

                                                        });

        $(".layer.btn.btn-primary").css({
            "backgroundColor": "rgb(90, 90, 90)"
        });

        $(".layer > .dropdown > a").css({
            "color": "rgb(255,255,255)"
        });

        $(".layer > .dropdown > a i").css({
            "color": "rgba(255,255,255,0.5)"
        });

        $(".layer a").css({
            "color": "rgb(255,255,255)"
        });

        $(".row-fluid .btn.btn-primary").css({
            "backgroundColor": "rgb(90, 90, 90)",
            "borderColor": "rgb(90,90,90)"
        });


        $(".navbar.navbar-default.navbar-fixed-bottom").hide(500);
    }

    localStorage.setItem("MATRIX_THEME",event);

};

/*
*
*
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
};

/*
*
*
*
* */
var pathNameGet = function () {
    let _rtn = null;

    let path = window.location.pathname;
    _rtn = path.split("/").pop();

    return _rtn;
}

/*
 *  Load Function
 *
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
 *  Get Url Params
 *
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
*   设置Home
*
*   参数：
*       home.html
*
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

            ifSignIn(data);

            rtn = data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};

/*
*   类管理
*
*   树
*
*
* */
var classList = function(event){
    let rtn = null;
    let loading = null;


    jQuery.ajax({
        url: "/mxobject/schema/class/list",
        dataType: 'json',
        type: 'GET',
        data: {
            id: event
        },
        async: false,
        beforeSend:function(xhr){
            loading = layer.load(2, {
                shade: [0.1,'#ccc'],
                time: 30*1000
            });
        },
        complete: function(xhr, textStatus) {
            layer.close(loading);
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if (!_.isEmpty(data.message)){
                rtn = data.message;
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            layer.close(loading);
            console.log(errorThrown);
        }
    })
    return rtn;
};

/*
*   类管理
*
*   新建
*
*
* */
var classNew = function (event) {
    let rtn = 0;

    jQuery.ajax({
        url: "/mxobject/schema/class",
        dataType: 'json',
        type: 'POST',
        data: {
            classinfo: JSON.stringify(event)
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("Success" + " " + event.class + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("Failed" + " " + event.class + " " + moment().format("LLL"));
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            alertify.error("Failed" + " " + event.class + " " + moment().format("LLL"));
            mxLog.warn("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
}


/*
*   类管理
*
*   删除
*
*
* */
var classDelete = function(event){
    let rtn = 0;

    jQuery.ajax({
        url: "/mxobject/schema/class?cid=" + event,
        dataType: 'json',
        type: 'DELETE',
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("Success" + " " + event + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("Failed" + " " + event + " " + moment().format("LLL"));
            }

        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};

/*
*   文件系统
*
*   提交到
*
*   参数：
*       文件名称
*       扩展名
*
*/
var fsNew = function(type, name, content){
    let rtn = 0;

    let fm = new FormData();

    fm.append("data", content);
    fm.append("attr", JSON.stringify({
                'content': content, 'pic': ''
            }));
    fm.append("type", "file");

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

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("Success" + " " + name + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("Failed" + " " + name + " " + moment().format("LLL"));
            }

        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};


/*
*   文件系统
*
*   获取文件列表
*
*   参数：
*       父目录
*       文件名称
*/
var fsList = function(parent){
    let rtn = null;
    
    jQuery.ajax({
        url: '/fs/home/' + parent,
        type: 'GET',
        dataType: 'text json',
        contentType: "application/text; charset=utf-8",
        data: {
            type: 'dir'
        },
        async:false,
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
*   文件系统
*
*   删除
*
*   参数：
*       文件名称
*       扩展名
*
*/
var fsDelete = function(parent,name){
    let rtn = 0;

    jQuery.ajax({

        url: '/fs' + parent + '/' + name,
        type: 'DELETE',
        dataType: 'text json',
        contentType: "application/text; charset=utf-8",
        async: false,
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("删除成功" + " " + name);
            } else {
                rtn = 0;
                alertify.error("删除失败" + " " + name);
            }

        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};


/*
*   文件系统
*
*   获取文件内容
*
*      参数：
*           父目录
*           文件名称
*/
var fsContent = function(parent,name){
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
*   获取类的信息并生成tree
*
*       参数：
*           ftype
*           parent
*           field
*/
var fetchSubClass = function(parent){
    let rtn = null;

    let _cond = {   
                    ftype: "class",
                    parent: parent
                };

    jQuery.ajax({
        url: "/mxobject/search",
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {
          cond: `call tree ` + JSON.stringify(_cond)
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if (_.isEmpty(data.message)) return false;

            rtn = data.message[0].tree;

        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
}

/*
*   获取当前class属性
*
*       参数：
*           class
*/
var fetchClass = function (param) {
    let rtn = null;

    jQuery.ajax({
        url: '/mxobject/schema/class',
        type: 'GET',
        dataType: 'json',
        async: false,
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
*   一键搜索
*
*       参数：
*           cond：一键搜索语法及搜索关键字
*/
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

            rtn = data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};

/*
*   对象数据管理
*
*       参数：
*           data：更新JSON
*           ctype: insert/update
*/
var putDataToClass = function (param) {
    let rtn = 0;


    jQuery.ajax({
        url: '/mxobject/actiontoclass',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            data: JSON.stringify(param),
            ctype: "insert"
        },
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {
             
            ifSignIn(data);

            if( _.lowerCase(data.status) === "ok"){
                rtn = 1;
                alertify.success("成功" + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("失败" + " " + moment().format("LLL"));
            }

        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};

/*
*   执行MQL
*
*       参数：
*           mql
*/
var fetchDataByMql = function (param) {

    let rtn = null;

    jQuery.ajax({
        url: "/mxobject/mql",
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {
           mql: param
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            // MQL for CRUD
            if(_.lowerCase(data.message) == "ok"){
                alertify.success("成功" + " " + moment().format("LLL"));
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
*  调用MQL，不建议使用！！！
*
*    参数：
*      mql
*/
var putDataByMql = function (event) {
    let rtn = 1;
    let _mql = `INSERT JSON '` + JSON.stringify(event) + `'`;

    jQuery.ajax({
        url: "/mxobject/mql",
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {
            mql: _mql
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("成功" + " " + moment().format("LLL"));
            } else {
                rtn = 0;
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};

/*
*   获取一个文件内容
*
*       参数：
*          url
*/
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
*   执行作业
*
*       参数：
*           receive_output： false【等待执行】 true【立即执行】 default：false
*           param：cmd
*/
var callJob = function (cmd,host) {
    let rtn = null;
    let event = '{"cmd": "' + cmd + '","HOST!": "'+host+'", "timeout": 5}';
    
    jQuery.ajax({
        url: '/job/remote_command@system/common',
        dataType: 'json',
        type: 'GET',
        async:false,
        data: {
            receive_output: true,
            param: event
        },
        timeout: 3000,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if (_.isEmpty(data.message)) return rtn;

            rtn = data;

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};




/*
*  用户管理
*
*/
var ldapMaintain = function (event) {
    let rtn = 1;
    
    jQuery.ajax({
        url: "/mxobject/search",
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {
            cond: `call user ` + JSON.stringify(event)
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("成功" + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("失败" + " " + moment().format("LLL"));
            }

        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
}

/*
*  Grok解析规则列表
*
*/
var grokList = function (event) {
    let rtn = null;
    
    jQuery.ajax({
        url: "/pattern",
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);
            
            if (data.status == "ok"){
                rtn = data;
            }
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
*  Grok解析规则列表
*
*/
var grokNew = function (event) {
    let rtn = 1;

    var form = new FormData();
    form.append("eg", event.eg);
    form.append("pattern", event.pattern);
    
    jQuery.ajax({
        url: "/pattern/" + event.name,
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

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                swal("Success!","","success");
            } else {
                rtn = 0;
                swal("Failed!",data.message,"warning");
            }

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            return 0;
        }
    });
    return rtn;
};


/*
*  调度器组管理
*
*  group list
*
*
*/
var serverGroupList = function () {
    let rtn = null;

    jQuery.ajax({
        url: '/group',
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = data;
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*  调度器组管理
*  add group
*   data: {
*          "name": "string",
*          "gtype": "string", // group | proxy
*          "hosts": [
*            {
*             "host": "string",
*              "proxy": "string",
*              "port": "string",
*              "username":"string",
*              "password":"string"
*            }
*          ]
*        }
*
*/
var serverGroupNew = function(event) {
    let rtn = 1;

    jQuery.ajax({
        url: '/group',
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

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("成功" + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("失败" + " " + moment().format("LLL"));
            }

        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
*  调度器组管理
*  delete group
*
* */
var serverGroupDelete = function(event) {
    let rtn = 1;

    jQuery.ajax({
        url: '/group/group/test',
        dataType: 'json',
        type: 'DELETE',
        data: event,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) === "ok"){
                rtn = 1;
                alertify.success("成功" + " " + data.message);
            } else {
                rtn = 0;
                alertify.error("失败" + " " + data.message);
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*  探针管理
*  Agent list
*
*
*/
var agentList = function () {
    let rtn = null;

    jQuery.ajax({
        url: '/monitoring',
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) === "ok"){
                rtn = data;
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
*  规则管理
*
*  Rule List
*
* */
var ruleList = function() {

    let rtn = null;

    jQuery.ajax({
        url: '/mxobject/rule?class=' + encodeURIComponent('/matrix/devops/event'),
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = data;
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*  规则管理
*
*  Rule New
*
*  data: {key:'/matrix/rules/event', script:'...'}
*
*/
var ruleNew = function(event) {
    let rtn = 1;

    jQuery.ajax({
        url: '/mxobject/rule',
        dataType: 'json',
        type: 'PUT',
        data: event,
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("成功" + " " + data.message);
            } else {
                rtn = 0;
                alertify.error("失败" + " " + data.message);
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
*  规则管理
*
*  Rule Delete
*
* */
var ruleDelete = function(event) {
    let rtn = 1;

    jQuery.ajax({
        url: '/mxobject/rule?key=' + encodeURIComponent('/matrix/rules/event'),
        dataType: 'json',
        type: 'DELETE',
        data: event,
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("成功" + " " + data.message);
            } else {
                rtn = 0;
                alertify.error("失败" + " " + data.message);
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
*  探针管理
*
*  Agent list
*
*/
var agentList = function () {
    let rtn = null;

    jQuery.ajax({
        url: '/monitoring',
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = data;
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*  探针管理
*
*  Agent New
*
*    var form = new FormData();
*    form.append("uploadbin", "test.sh");
*    form.append("uploadconf", "test.conf");
*
*/
var agentNew = function(event) {
    let rtn = 1;

    jQuery.ajax({
        url: '/monitoring/test',
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

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("成功" + " " + data.message);
            } else {
                rtn = 0;
                alertify.error("失败" + " " + data.message);
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
*  探针管理
*
*  Agent Dispatch
*
*    var form2 = new FormData();
*    form2.append("command", "./test.sh test");
*    form2.append("cron", "0/30 * * * * * *");
*    form2.append("hosts", "mxsvr201");
*    form2.append("hosts", "mxsvr221");
*    form2.append("rule", "/matrix/rules/performance");
*    form2.append("env", "TESTENV=testenv");
*    form2.append("env", "TESTENV=testenv2");
* */
var agentDispatch = function(key,content) {
    let rtn = null;

    jQuery.ajax({
        dataType: 'json',
        url: `/monitoring/release/${key}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content),
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = data;
                alertify.success("成功" + " " + moment().format("LLL"));
            } else {
                alertify.error("失败" + " " + moment().format("LLL"));
            }

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*  Grok解析规则列表
*
*/
var grokDelete = function (event) {
    let rtn = 1;
    
    jQuery.ajax({
        url: `/pattern/${event.name}`,
        dataType: 'json',
        type: 'DELETE',
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("成功" + " " + data.message);
            } else {
                rtn = 0;
                alertify.error("失败" + " " + data.message);
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*   全局缓存
*
*   AppContext Get
*
*
* */
var appContextGet = function (event) {
    let rtn = null;

    jQuery.ajax({
        url: `/appcontext/${event}`,
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = data;
                alertify.success("成功" + " " + data.message);
            } else {
                alertify.error("失败" + " " + data.message);
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = null;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
*   全局缓存
*
*   AppContext et
*
*
* */
var appContextSet = function (event,context) {
    let rtn = 1;

    jQuery.ajax({
        url: `/appcontext/${event}`,
        dataType: 'json',
        contentType: false,
        type: 'POST',
        async: false,
        data: JSON.stringify(context),
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("成功" + " " + data.message);
            } else {
                rtn = 0;
                alertify.error("失败" + " " + data.message);
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*  新建一个窗体
*  参数：
*   size: 大小 [mini,small,large]
*   title: 标题
*   template: 模板（Vue渲染用）
*/
var newWindow = function (size, title, template) {
    var win;
    var w = $( window ).width();//document.body.clientWidth;
    var h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);
    var wW = $( window ).width()*2.2/3;
    var hH = $( window ).height()*2.5/3;

    if(size === 'mini'){
        wW = $( window ).width()*0.7/3;
        hH = $( window ).height()*0.8/3;
    }

    if(size === 'small'){
        wW = $( window ).width()*1.5/3;
        hH = $( window ).height()*1.8/3;
    } 

    if(size === 'middle'){
        wW = $( window ).width()*1.8/3;
        hH = $( window ).height()*2.0/3;
    }

    var lrwh = [(w-wW)/2, (h-hH)/2, wW, hH];
    var tb = document.createElement('div');
    
    $(tb).append(template);
    win = new mxWindow(title, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
    win.hide();
    $("div.mxWindow").addClass("animated fadeInRight");
    win.show();
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
};

var newWindow = function (size, title, template, position) {
    var win;
    var w = $( window ).width();//document.body.clientWidth;
    var h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);
    var wW = $( window ).width()*2.2/3;
    var hH = $( window ).height()*2.5/3;

    if(size === 'mini'){
        wW = $( window ).width()*0.7/3;
        hH = $( window ).height()*0.8/3;
    }

    if(size === 'small'){
        wW = $( window ).width()*1.5/3;
        hH = $( window ).height()*1.8/3;
    }

    if(size === 'middle'){
        wW = $( window ).width()*1.8/3;
        hH = $( window ).height()*2.0/3;
    }

    var lrwh = [(w-wW)/2, (h-hH)/2, wW, hH];

    if(!_.isEmpty(position)){
        lrwh[0] = position.x;
        lrwh[1] = position.y;
    }

    var tb = document.createElement('div');

    $(tb).append(template);
    win = new mxWindow(title, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
    win.hide();
    $("div.mxWindow").addClass("animated fadeInRight");
    win.show();
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
};


/*
 *  Wait Function  
 *  参数：
 *    ms
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
};

function showtooltip(e){
    var evt = e || event
    clearTimeout(hidetooltiptimer)
    tooltip.style.left = evt.pageX - 10 + 'px'
    tooltip.style.top = evt.pageY + 15 + 'px'
    tooltip.style.opacity = 1
    hidetooltiptimer = setTimeout(function(){
        tooltip.style.opacity = 0
    }, 50)
};

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
};

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
};

var FormWizard = function(id) {
    "use strict";
    return {
        init: function(id) {
            handleBootstrapWizards(id)
        }
    }
}();

var handleBootstrapWizards = function(id) {
    "use strict";
    $("#" + id).bwizard()
};


init();

initPlugIn();

_.delay(function () {
    //copyBoard();
},5000)