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
        #####  ###  #####  #     #    ### #     #
        #     #  #  #     # ##    #     #  ##    #
        #        #  #       # #   #     #  # #   #
         #####   #  #  #### #  #  #     #  #  #  #
              #  #  #     # #   # #     #  #   # #
        #     #  #  #     # #    ##     #  #    ##
         #####  ###  #####  #     #    ### #     #

 */

var ifSignIn = function (event) {
    if (event.status == 'signin'){
        window.location.href = event.message;
        return false;
    }
};

/*
        #     # ####### #     # #######
        #     # #     # ##   ## #
        #     # #     # # # # # #
        ####### #     # #  #  # #####
        #     # #     # #     # #
        #     # #     # #     # #
        #     # ####### #     # #######
 */

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
        ####### ### #       #######     #####  #     #  #####  ####### ####### #     #
        #        #  #       #          #     #  #   #  #     #    #    #       ##   ##
        #        #  #       #          #         # #   #          #    #       # # # #
        #####    #  #       #####       #####     #     #####     #    #####   #  #  #
        #        #  #       #                #    #          #    #    #       #     #
        #        #  #       #          #     #    #    #     #    #    #       #     #
        #       ### ####### #######     #####     #     #####     #    ####### #     #

 */


/*
*   文件系统
*
*   检查是否存在
*
*   参数：
*
*
*/
var fsCheck = function(path, name){
    let rtn = false;

    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}?type=check`;

    if(_.startsWith(parent,'/extend') || _.isEqual(parent,'/')){
        _url += '&issys=true';
    }

    jQuery.ajax({
        url: _url,
        type: 'GET',
        dataType: "json",
        data: {},
        async:false,
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = data.message;
            }

        },
        error: function(xhr, textStatus, errorThrown) {
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
var fsNew = function(ftype, path, name, content, attr){
    let rtn = 0;

    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}`;

    if(_.startsWith(parent,'/extend') || _.isEqual(parent,'/')){
        _url += '?issys=true';
    }

    let fm = new FormData();

    fm.append("data", content);
    fm.append("type", ftype);
    fm.append("attr", JSON.stringify(attr));

    jQuery.ajax({
        url: _url,
        type: 'PUT',
        processData: false,
        contentType: false,
        mimeType: 'multipart/form-data;',
        dataType: "json",
        data: fm,
        async:false,
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("创建成功 " + name + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("创建失败 " + name + " " + moment().format("LLL"));
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
var fsList = function(path){
    let rtn = null;
    let _issys = false;
    let parent = path.replace(/\/\//g,'/');

    if(_.startsWith(parent,'/extend') || _.isEqual(parent,'/')){
        _issys = true;
    }

    jQuery.ajax({
        url: '/fs' + parent,
        type: 'GET',
        dataType: 'text json',
        contentType: "application/text; charset=utf-8",
        data: {
            type: 'dir',
            issys: _issys
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
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON);
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
var fsDelete = function(path,name){
    let rtn = 0;
    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}`;

    if(_.startsWith(parent,'/extend') || _.isEqual(parent,'/')){
        _url += '?issys=true';
    }

    jQuery.ajax({

        url: _url,
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
var fsContent = function(path,name){
    let rtn = null;

    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}`;

    if(_.startsWith(parent,'/extend') || _.isEqual(parent,'/')){
        _url += '?issys=true';
    }

    jQuery.ajax({
        url: _url,
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
*   文件系统
*
*   更改文件名
*
*
*/
var fsRename = function(srcpath,dstpath){
    let rtn = 0;

    let _issys = false;

    if(_.startsWith(dstpath,'/fs/extend') || _.isEqual(dstpath,'/')){
        _issys = true;
    }


    jQuery.ajax({
        url: '/fs/rename',
        type: 'POST',
        dataType: 'json',
        async:false,
        data: {
            srcpath: srcpath,
            dstpath: dstpath,
            issys: _issys
        },
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("编辑成功" + " " + srcpath);
            } else {
                rtn = 0;
                alertify.error("编辑失败" + " " + data.message);
            }

        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            alertify.error("编辑失败" + " " + xhr.responseJSON.message);
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};

/*
*   文件系统
*
*   复制文件
*
*
*/
var fsCopy = function(srcpath,dstpath){
    let rtn = 0;

    let _issys = false;

    if(_.startsWith(dstpath,'/fs/extend') || _.isEqual(dstpath,'/')){
        _issys = true;
    }

    jQuery.ajax({
        url: '/fs/copy',
        type: 'POST',
        dataType: 'json',
        async:false,
        data: {
            srcpath: srcpath,
            dstpath: dstpath,
            issys: _issys
        },
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("复制成功" + " " + srcpath);
            } else {
                rtn = 0;
                alertify.error("复制失败" + " " + srcpath);
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
*   更新属性
*
*
*/
var fsUpdateAttr = function(path, name, attr) {
    let rtn = 0;

    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}?type=attr`;

    if(_.startsWith(parent,'/extend') || _.isEqual(parent,'/')){
        _url += '&issys=true';
    }

    jQuery.ajax({
        url: _url,
        dataType: 'json',
        type: 'PUT',
        data: {
            attr: JSON.stringify(attr)
        },
        async:false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("编辑成功" + " " + parent + "/" + name);
            } else {
                rtn = 0;
                alertify.error("编辑失败" + " " + parent + "/" + name);
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
*   创建临时文件
*
*
*/
var fsTemp = function(ftype, name, content, attr){
    let rtn = null;


    let _tmp = fsNew(ftype, '/home/temp', name, content, attr);

    if(_tmp === 1){
        rtn = `/home/temp/${name}`;
    }

    return rtn;
};


/*
        #######            #     #####   #####
        #       #         # #   #     # #     #
        #       #        #   #  #       #
        #       #       #     #  #####   #####
        #       #       #######       #       #
        #     # #       #     # #     # #     #
         #####  ####### #     #  #####   #####
 */

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
        async: false,
        data: {
            classinfo: JSON.stringify(event)
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("Success" + " " + event.name + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("Failed" + " " + event.name + " " + moment().format("LLL"));
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            alertify.error("Failed" + " " + event.name + " " + moment().format("LLL"));
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
            cond: `call tree ` + JSON.stringify(_cond),
            meta: true
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
         #####  #######    #    ######   #####  #     #
        #     # #         # #   #     # #     # #     #
        #       #        #   #  #     # #       #     #
         #####  #####   #     # ######  #       #######
              # #       ####### #   #   #       #     #
        #     # #       #     # #    #  #     # #     #
         #####  ####### #     # #     #  #####  #     #

 */

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
            cond: param,
            meta: true
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
            mxLog.writeln("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};


/*
        ####### ######        # #######  #####  #######    ######     #    #######    #
        #     # #     #       # #       #     #    #       #     #   # #      #      # #
        #     # #     #       # #       #          #       #     #  #   #     #     #   #
        #     # ######        # #####   #          #       #     # #     #    #    #     #
        #     # #     # #     # #       #          #       #     # #######    #    #######
        #     # #     # #     # #       #     #    #       #     # #     #    #    #     #
        ####### ######   #####  #######  #####     #       ######  #     #    #    #     #
 */

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
            mql: param,
            meta: true
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            // MQL for CRUD
            if(_.lowerCase(data.status) == "ok"){
                alertify.success("成功" + " " + moment().format("LLL"));
                rtn = data;
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = xhr.responseJSON;
            mxLog.warn("["+ moment().format("LLL")+"] [" + xhr.status + "] " + JSON.stringify(xhr.responseJSON));
        }
    });

    return rtn;
};



/*
              # ####### ######
              # #     # #     #
              # #     # #     #
              # #     # ######
        #     # #     # #     #
        #     # #     # #     #
         #####  ####### ######

* */

/*
*   作业管理
*
*   获取作业
*
*
*/
var jobContextGet = function (key,prefix) {
    let rtn = null;

    jQuery.ajax({
        url: `/job/context/${key}`,
        dataType: 'json',
        type: 'GET',
        async:false,
        data: {
            prefix: prefix
        },
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
*   作业管理
*
*   作业状态
*
*
*/
var jobContextSetup = function (key,name,value) {
    let rtn = 1;

    jQuery.ajax({
        url: `/job/context/${key}`,
        dataType: 'json',
        type: 'PUT',
        async:false,
        data: {
            name:name,
            value: value
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
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
*   作业管理
*
*   重置作业
*
*
*/
var jobContextReset = function (key) {
    let rtn = 1;

    jQuery.ajax({
        url: `/job/context/${key}?clear=true`,
        dataType: 'json',
        type: 'DELETE',
        async:false,
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
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*   作业管理
*
*   执行作业
*
*       参数：
*           receive_output： false【等待执行】 true【立即执行】 default：false
*           param：cmd
*/
var callJob = function (cmd,host) {
    let rtn = null;
    let event = `{"cmd": "${cmd}", "HOST!": "${host}", "timeout": 5}`;
    
    jQuery.ajax({
        url: '/job/remote_remote_command@system/common',
        dataType: 'json',
        type: 'GET',
        async:false,
        data: {
            receive_output: true,
            param: event
        },
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

var callBobJob = function (cmd,host) {
    let rtn = null;
    let event = `{"cmd": "${cmd}", "HOST!": "${host}", "timeout": 6000}`;

    jQuery.ajax({
        url: '/job/remote_wincall@system/common',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: {
            receive_output: true,
            param: event
        },
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

        ####### ######  ###  #####   #####  ####### ######
           #    #     #  #  #     # #     # #       #     #
           #    #     #  #  #       #       #       #     #
           #    ######   #  #  #### #  #### #####   ######
           #    #   #    #  #     # #     # #       #   #
           #    #    #   #  #     # #     # #       #    #
           #    #     # ###  #####   #####  ####### #     #

 */

/*
*  触发器管理
*
*  列表
*/

var triggerList = function(event){
    let rtn = null;

    jQuery.ajax({
        url: '/mxobject/trigger?class=' + event,
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if (_.isEmpty(data.message)) return rtn;

            rtn = data.message;

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};

/*
*  触发器管理
*
*  添加
*/
var triggerNew = function(event){
    let rtn = 1;

    jQuery.ajax({
        url: '/mxobject/trigger',
        dataType: 'json',
        type: 'PUT',
        async: false,
        data: event,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

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
    });

    return rtn;
};

/*
*  触发器管理
*
*  删除
*/

var triggerDelete = function(event,name){
    let rtn = 1;

    jQuery.ajax({
        url: `/mxobject/trigger?class=${event}&name=${name}`,
        dataType: 'json',
        type: 'DELETE',
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

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
    });

    return rtn;
};


/*

        #     #  #####  ####### ######       ##        #####  ######  ####### #     # ######
        #     # #     # #       #     #     #  #      #     # #     # #     # #     # #     #
        #     # #       #       #     #      ##       #       #     # #     # #     # #     #
        #     #  #####  #####   ######      ###       #  #### ######  #     # #     # ######
        #     #       # #       #   #      #   # #    #     # #   #   #     # #     # #
        #     # #     # #       #    #     #    #     #     # #    #  #     # #     # #
         #####   #####  ####### #     #     ###  #     #####  #     # #######  #####  #

 */

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
            cond: `call user ` + JSON.stringify(event),
            meta: true
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
};


/*
*        #####  ####### #     # ######     #    #     # #     #
        #     # #     # ##   ## #     #   # #   ##    #  #   #
        #       #     # # # # # #     #  #   #  # #   #   # #
        #       #     # #  #  # ######  #     # #  #  #    #
        #       #     # #     # #       ####### #   # #    #
        #     # #     # #     # #       #     # #    ##    #
         #####  ####### #     # #       #     # #     #    #
*
* */

/*
*  公司管理
*
*  添加
*
*/

var companyNew = function(event){
    let rtn = 0;

    jQuery.ajax({
        url: '/companys',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: event,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
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
        error: function (xhr, textStatus, errorThrown) {
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }

    })

    return rtn;

};


/*
*  公司管理
*
*  获取
*
*
*/

var companyGet = function(name) {
    let rtn = null;

    jQuery.ajax({
        url: `/companys/${name}`,
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            rtn = data;

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }

    })

    return rtn;

};


/*
*  公司管理
*
*  列表
*
*/

var companyList = function() {
    let rtn = null;

    jQuery.ajax({
        url: '/companys',
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            rtn = data;

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }

    })

    return rtn;

};


/*
*  公司管理
*
*  删除
*
*/
var companyDelete = function(name) {
    let rtn = 0;

    jQuery.ajax({
        url: `/companys/${name}`,
        dataType: 'json',
        type: 'DELETE',
        async: false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
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
        error: function (xhr, textStatus, errorThrown) {
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }

    })

    return rtn;

};


/*
*  公司管理
*
*  更新
*
*/
var companyUpdate = function(com) {
    let rtn = 0;

    jQuery.ajax({
        url: '/companys',
        dataType: 'json',
        contentType: 'application/json',
        type: 'PUT',
        async: false,
        data: JSON.stringify(com),
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
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
        error: function (xhr, textStatus, errorThrown) {
            alertify.error("失败" + " " + JSON.stringify(xhr));
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }

    })

    return rtn;

};



/*

         #####   #####  #     # ####### ######  #     # #       #######     #####  ######  ####### #     # ######
        #     # #     # #     # #       #     # #     # #       #          #     # #     # #     # #     # #     #
        #       #       #     # #       #     # #     # #       #          #       #     # #     # #     # #     #
         #####  #       ####### #####   #     # #     # #       #####      #  #### ######  #     # #     # ######
              # #       #     # #       #     # #     # #       #          #     # #   #   #     # #     # #
        #     # #     # #     # #       #     # #     # #       #          #     # #    #  #     # #     # #
         #####   #####  #     # ####### ######   #####  ####### #######     #####  #     # #######  #####  #
*/

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

        ######  #     # #       #######
        #     # #     # #       #
        #     # #     # #       #
        ######  #     # #       #####
        #   #   #     # #       #
        #    #  #     # #       #
        #     #  #####  ####### #######
*/

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

        ######  ######  ####### ######  #######
        #     # #     # #     # #     # #
        #     # #     # #     # #     # #
        ######  ######  #     # ######  #####
        #       #   #   #     # #     # #
        #       #    #  #     # #     # #
        #       #     # ####### ######  #######
*/

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
        #####  ######  ####### #    #
        #     # #     # #     # #   #
        #       #     # #     # #  #
        #  #### ######  #     # ###
        #     # #   #   #     # #  #
        #     # #    #  #     # #   #
         #####  #     # ####### #    #
 */

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
           #    ######  ######      #####  ####### #     # ####### ####### #     # #######
          # #   #     # #     #    #     # #     # ##    #    #    #        #   #     #
         #   #  #     # #     #    #       #     # # #   #    #    #         # #      #
        #     # ######  ######     #       #     # #  #  #    #    #####      #       #
        ####### #       #          #       #     # #   # #    #    #         # #      #
        #     # #       #          #     # #     # #    ##    #    #        #   #     #
        #     # #       #           #####  ####### #     #    #    ####### #     #    #
 */

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

 */
var layoutIt = function(type){
    let _rtn = null;

    let config = {
        settings:{
            showPopoutIcon: false,
            showCloseIcon: false
        },
        content: [{
            type: 'row',
            content:[
                {
                    type: 'stack',
                    width: 20,
                    content:[{
                        type: 'component',
                        componentName: 'omdbComponent',
                        title:'对象管理',
                        isClosable: false,
                        componentState: {
                            id: 'omdb-class-tree',
                            name: 'omdb-class-tree'
                        }
                    }]
                },
                {
                    type: 'column',
                    content:[{
                        type: 'component',
                        componentName: 'omdbComponent',
                        title:'查询',
                        componentState: {
                            id: 'omdb-query-console',
                            name: 'omdb-query-console'
                        }
                    },{
                        type: 'component',
                        componentName: 'omdbComponent',
                        title:'输出',
                        componentState: {
                            id: 'omdb-query-output',
                            name: 'omdb-query-output'
                        }
                    }]
                }
            ]
        }]
    };

    let myLayout = new GoldenLayout( config );

    myLayout.registerComponent( 'omdbComponent', function( container, componentState ){
        console.log(componentState);
        container.getElement().html(`<div id="` + componentState.id + `"></div>`);
    });

    myLayout.init();

}


/*
        #     # ### #     # ######  ####### #     #
        #  #  #  #  ##    # #     # #     # #  #  #
        #  #  #  #  # #   # #     # #     # #  #  #
        #  #  #  #  #  #  # #     # #     # #  #  #
        #  #  #  #  #   # # #     # #     # #  #  #
        #  #  #  #  #    ## #     # #     # #  #  #
         ## ##  ### #     # ######  #######  ## ##
 */

/*
*  新建一个窗体
*  参数：
*   size: 大小 [mini,small,large]
*   title: 标题
*   template: 模板（Vue渲染用）
*/
var newWindow = function (type, title, template, position) {
    let win = null;
    let w = $( window ).width();//document.body.clientWidth;
    let h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);

    let wW = $( window ).width()*2.2/3;
    let hH = $( window ).height()*2.5/3;
    let lrwh = [(w-wW)/2, (h-hH)/2, wW, hH];


    if(type === 'fsupload'){

        lrwh[2] = $( window ).width()*0.60;
        lrwh[3] = $( window ).height()*0.60;

        win = $.jsPanel({
            id: 'jsPanel-'+title,
            headerTitle: title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            show: 'animated fadeInDownBig',
            headerRemove:  false,
            theme:          'filledlight',
            content:        template,
            container: 'body',
            dragit: {
                containment: 'parent',
            },
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                    "overflow": "auto"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;

    }

    if(type === 'fsmodal'){

        lrwh[2] = $( window ).width()*0.50;
        lrwh[3] = $( window ).height()*0.50;

        win = $.jsPanel({
            id: 'jsPanel-'+title,
            paneltype: 'modal',
            headerTitle: title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            show: 'animated fadeInDownBig',
            headerRemove:  true,
            theme:          'filledlight',
            content:        template,
            callback:       function(){
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;

    }

    if(type === 'toolbars'){

        win = $.jsPanel({
                theme:          'filledlight',
                contentSize:    {width: 35, height: 230},
                position: {
                    left: position[0],
                    top:  position[1]
                },
                headerRemove:  true,
                dragit:         {handles: 'div.jsPanel-content'},
                content:        template,
                callback:       function(){


                }
            });

        return win;

    }

    if(type === 'cmd'){

        lrwh[2] = $( window ).width()*0.4;
        lrwh[3] = $( window ).height()*0.125;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: {
                my: "left-top",
                at: "right-bottom",
                of: $(position),
                offsetX: 10,
            },
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            dragit: {
                containment: 'parent',
            },
            content:        template,
            callback:       function(){
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'fsapp'){
        lrwh[2] = $( window ).width()*0.55;
        lrwh[3] = $( window ).height()*0.55;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            container: 'body',
            headerControls: { controls: '' },
            headerRemove:  false,
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'small'){
        lrwh[2] = $( window ).width()*0.55;
        lrwh[3] = $( window ).height()*0.55;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'large'){
        lrwh[2] = $( window ).width()*0.7;
        lrwh[3] = $( window ).height()*0.8;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            dragit: {
                containment: 'parent',
            },
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'properties'){

        let _tmp = _.attempt(JSON.parse.bind(null, localStorage.getItem("WINDOW-PROPERTIES-POSITION")));

        let _position = { top: 60, left: 60 };

        if(!_.isEmpty(_tmp)){
            _position = _tmp;
        }

        lrwh[2] = 300;//$( window ).width()*0.2;
        lrwh[3] = 340;//$( window ).height()*0.55;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: _position,
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            dragit: {
                drag: function (panel, position) {
                    localStorage.setItem("WINDOW-PROPERTIES-POSITION",JSON.stringify(position));
                }
            },
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'fsinfo'){

        let _tmp = _.attempt(JSON.parse.bind(null, localStorage.getItem(_.upperCase(type)+"-WINDOW-POSITION")));

        let _position = { top: 10, left: 60 };

        if(!_.isEmpty(_tmp)){
            _position = _tmp;
        }

        lrwh[2] = 400;//$( window ).width()*0.25;
        lrwh[3] = 600;//$( window ).height()* 0.85 > 600 ? 620: $( window ).height()* 0.85;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: _position,
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            dragit: {
                drag: function (panel, position) {
                    console.log(panel,position)
                    localStorage.setItem(_.upperCase(type)+"-WINDOW-POSITION",JSON.stringify(position));
                }
            },
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                    "overflow": "hidden"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }


    if(type === 'appsbox'){
        lrwh[2] = $( window ).width()*0.8/3;
        lrwh[3] = $( window ).height()*2.0/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }

    if(type === 'robot'){
        lrwh[2] = $( window ).width()*0.8/3;
        lrwh[3] = $( window ).height()*2.25/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }


    /*if(type === 'narrow'){
        lrwh[2] = $( window ).width()*0.6/3;
        lrwh[3] = $( window ).height()*1.45/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }*/

    if(type === 'mini'){
        lrwh[2] = $( window ).width()*0.7/3;
        lrwh[3] = $( window ).height()*0.8/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }

    if(type === 'small'){
        lrwh[2] = $( window ).width()*1.5/3;
        lrwh[3] = $( window ).height()*1.8/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }

    if(type === 'middle'){
        lrwh[2] = $( window ).width()*1.8/3;
        lrwh[3] = $( window ).height()*2.0/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }

    let tb = document.createElement('div');
    console.log(title, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true)
    $(tb).append(template);
    win = new mxWindow(title, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
    win.hide();
    $("div.mxWindow").addClass("animated fadeIn");
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

    win.addListener(mxEvent.CLOSE, function(event){
        _.delay(function(){
            eventHub.$emit("win-close-event",null);
        },100);
    });

    win.addListener(mxEvent.MOVE_END, function(event){
        console.log(win.getX(),win.getY())
        localStorage.setItem(_.upperCase(type+"_window_position"),JSON.stringify({x: win.getX(),y:win.getY()}));
    });

    return win;
};


var newWindows = function(event, type, theme, title, content){
    let win = null;

    let w = $( window ).width();
    let h = $( window ).height();
    let wW = $( window ).width()*2.2/3;
    let hH = $( window ).height()*2.5/3;

    if(type === 'cmd'){
        wW = $( window ).width()*0.8/3;
        hH = $( window ).height()*1.8/3;
    }

    if(type === 'appsbox'){
        wW = $( window ).width()*0.8/3;
        hH = $( window ).height()*2.0/3;
    }

    if(type === 'robot'){
        wW = $( window ).width()*0.8/3;
        hH = $( window ).height()*2.1/3;
    }

    if(type === 'fsinfo'){
        wW = $( window ).width()*0.6/3;
        hH = $( window ).height()*2.2/3;
    }

    if(type === 'narrow'){
        wW = $( window ).width()*0.6/3;
        hH = $( window ).height()*1.45/3;
    }

    if(type === 'mini'){
        wW = $( window ).width()*0.7/3;
        hH = $( window ).height()*0.8/3;
    }

    if(type === 'small'){
        wW = $( window ).width()*1.5/3;
        hH = $( window ).height()*1.8/3;
    }

    if(type === 'middle'){
        wW = $( window ).width()*1.8/3;
        hH = $( window ).height()*2.0/3;
    }

    let lrwh = [(w-wW)/2, (h-hH)/2, wW, hH];
    let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

    if(!_.isEmpty(_position)){
        let _p = _.attempt(JSON.parse.bind(null, _position));
        lrwh[0] = _p.x || (w-wW)/2;
        lrwh[1] = _p.y || (h-hH)/2;
    }

    win = $.jsPanel({
                position: {
                    at: "body",
                    of: event.target,
                    offsetX: 100,
                },
                theme:       theme,
                headerControls: { iconfont: "font-awesome" },
                contentSize: {width: lrwh[2], height: lrwh[3]},
                headerTitle: title,
                content:     content,
                callback:    function () {

                    $(".jsPanel-headerbar").css({
                            "backgroundColor": "rgb(249, 249, 249)",
                            "borderColor": "rgb(236, 236, 236)",
                            "backgroundImage": "linear-gradient(180deg, rgb(249, 249, 249), rgb(224, 224, 224))",
                            "backgroundRepeat": "repeat-x"
                    });

                    $(".jsPanel-content").css({
                       "border-top": "1px solid #ddd"
                    });

                    return win;
                }
            });

};

/*
*       #     # ####### ######      #####  #######  #####  #    # ####### #######
        #  #  # #       #     #    #     # #     # #     # #   #  #          #
        #  #  # #       #     #    #       #     # #       #  #   #          #
        #  #  # #####   ######      #####  #     # #       ###    #####      #
        #  #  # #       #     #          # #     # #       #  #   #          #
        #  #  # #       #     #    #     # #     # #     # #   #  #          #
         ## ##  ####### ######      #####  #######  #####  #    # #######    #
*
* */

var checkWebSocket = function(){
    if ("WebSocket" in window) {
        alertify.error("您的浏览器不支持 WebSocket!");
        return false;
    }
};

var webSocketNew = function(url){
    let ws = null;

    if(!_.isEmpty(url)){
        ws = new WebSocket(url);
    } else {
        ws = new WebSocket(`ws://${document.location.host}/websocket/event`);
    }

    return ws;

};


var webSocketClose = function (ws) {
    ws.close(1000, 'close');
    alertify.log('连接已关闭');
};

/*
        #     # ####### ### #        #####
        #     #    #     #  #       #     #
        #     #    #     #  #       #
        #     #    #     #  #        #####
        #     #    #     #  #             #
        #     #    #     #  #       #     #
         #####     #    ### #######  #####
 */

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

var getPage = function(){
    let path = window.location.pathname;
    let page = path.split("/").pop();
    return page;
};

var getLicense = function(){

    let _config = _.attempt(JSON.parse.bind(null, `{{.config}}`));

    if(_.isEmpty(_config)){
        $(".license").html("");
    } else {
        $(".license").html(_config.license);
    }
};


var renameKey = function(obj, key, newKey) {

    if(_.includes(_.keys(obj), key)) {
        obj[newKey] = _.clone(obj[key], true);

        delete obj[key];
        delete obj['enum'];
        //delete obj['type'];
    }

    return obj;
};


var columnsParse = function(meta){
    let _columns = null;

    // *

    if(_.isEmpty(meta)) {
        return _columns;
    }

    // meta
    _.forEach(meta.columns, function(v,k){
        _.forEach(v,function(val,key){
            renameKey(val, 'name', 'field');
        })
    })

    return meta.columns;

};

var initPlugIn = function () {

    // Theme
    let _theme = localStorage.getItem("MATRIX_THEME");

    toggleTheme(_theme);


    // Robot
    $(".ai.ai-robot").removeClass("ai-robot");

    if(_.includes(['home',''],getPage())){
        $(".ai").addClass("ai-robot");
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


var vwTOpx = function (value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var result = (x*value)/100;

    return result;
};

var vhTOpx = function (value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var result = (y*value)/100;

    return result;
};

var pxTOvw = function (value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var result = (100*value)/x;

    return result;
};

var pxTOvh = function (value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var result = (100*value)/y;

    return result;
};


var syntaxHighlight = function(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 4);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n\t/g,' ');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

/*

       #    ###    ######  ####### ######  ####### #######
      # #    #     #     # #     # #     # #     #    #
     #   #   #     #     # #     # #     # #     #    #
    #     #  #     ######  #     # ######  #     #    #
    #######  #     #   #   #     # #     # #     #    #
    #     #  #     #    #  #     # #     # #     #    #
    #     # ###    #     # ####### ######  #######    #
 */
var robot = function(){

    $(".ai-robot").html(`<div style="position: absolute;right:0px;top: -38px;cursor: pointer;" class="animated bounceInLeft">
                            <img src="/web/assets/images/robot.svg" style="width:120px;height:120px;transform: scale(0.5);">
                         </div>`).click(function(){
        let _win = null;

        _win = localStorage.getItem("mx-window");

        if(!_.isEmpty(_win)){
            $(".mxWindow").remove();
        }

        _win = newWindow("robot", "∵", '<div class="animated slideInDown" id="robot-active-win"></div>', null);
        _win.setMaximizable(false);

        let _robotVue = new Vue({
            el: '#robot-active-win',
            template: '<vue-ai-robot-component id="THIS-IS-ROBOT"></vue-ai-robot-component>',
            mounted:function(){
                let me = this;

                me.$nextTick(function() {

                })
            }
        });
    });
};

var appsBox = function(){
    $(".apps-box").html(`<div style="position:absolute;right:10px;top:65px;z-index:100;">
                            <i class="fa fa-th fa-2x" style="color:rgb(182, 194, 202);cursor:pointer;"></i>
                          </div>`).click(function(){
        let _win = null;

        _win = localStorage.getItem("mx-window");

        if(!_.isEmpty(_win)){
            $(".mxWindow").remove();
        }

        _win = newWindow("appsbox","∷", '<div class="animated slideInDown" id="apps-box-win"></div>',null);
        _win.setMaximizable(false);

        let _robotVue = new Vue({
            el: '#apps-box-win',
            template: '<vue-apps-box-component id="THIS-IS-MY-APPS"></vue-apps-box-component>',
            mounted:function(){
                let me = this;

                me.$nextTick(function() {

                })
            }
        });
    });
}

var license = function(){

};


init();

initPlugIn();

_.delay(function () {
    //copyBoard();
    robot();
    //GLOBAL_PARAMS_FUNC();
    //appsBox();
},5000)