/*

        #####   #####  ######  ### ######  #######
        #     # #     # #     #  #  #     #    #
        #       #       #     #  #  #     #    #
         #####  #       ######   #  ######     #
              # #       #   #    #  #          #
        #     # #     # #    #   #  #          #
         #####   #####  #     # ### #          #
*/

"use strict";

/*
*  脚本管理
*
*  Add depot
*
* */
var depotAdd = function(event) {

    let rtn = 0;

    var  fm = new FormData();
    fm.append("name", event.name);
    fm.append("version", event.version);
    fm.append("remark", event.remark);
    fm.append("uploadfile", event.uploadfile);
    fm.append("tags", event.tags);

    jQuery.ajax({
        url: '/monitoring/depot',
        dataType: 'json',
        type: 'POST',
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
        data: fm,
        async: false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("脚本添加成功" + " " + data.message);
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            rtn = 0;
            alertify.error("脚本添加失败" + " " + xhr.responseJSON.message);
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.message);
        }
    });
    return rtn;
};


/*
*  脚本管理
*
*  Delete depot
*
* */
var depotDelete = function(name) {

    let rtn = 0;

    jQuery.ajax({
        url: `/monitoring/depot/${name}`,
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
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            rtn = 0;
            alertify.error("删除失败" + " " + xhr.responseJSON.message);
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*  脚本管理
*
*  Update depot
*
*
*/
var depotUpdate = function(event) {
    let rtn = 1;

    var form = new FormData();
    form.append("name", "test");
    form.append("version", "1.1");
    form.append("remark", "This is test script");
    form.append("uploadfile", "test.sh");
    form.append("tags", "test");
    form.append("tags", "linux");


    jQuery.ajax({
        url: '/monitoring/depot?overwrite=true',
        dataType: 'json',
        type: 'PUT',
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
        data: form,
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
*  脚本管理
*
*  Get depot
*
* */
var depotGet = function(event) {
    let rtn = null;

    jQuery.ajax({
        url: '/monitoring/depot/test?version=1.0',
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
                rtn = data.message;
            }

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};

/*
*  脚本管理
*
*  Get depot list
*
* */
var depotList = function() {
    let rtn = null;

    jQuery.ajax({
        url: '/monitoring/depot',
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
            }

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};


/*
*  脚本管理
*
*   Deploy depot
*
*
* */
var depotDeploy = function(event) {
    let rtn = 0;

    var form = new FormData();

    _.forEach(event.hosts,function(v){
        form.append("hosts", v);
    })

    form.append("depots", event.depots);
    form.append("versions", event.versions);

    jQuery.ajax({
        url: '/monitoring/deploy',
        dataType: 'json',
        type: 'POST',
        async: false,
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
        data: form,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("脚本部署成功" + " " + data.message);
            }

        },
        error: function(xhr, textStatus, errorThrown){
            rtn = 0;
            alertify.error("脚本部署失败" + " " + xhr.responseText);
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};


/*
*  脚本管理
*
*   Deploy depot
*
*
* */
var depotUnDeploy = function(event) {
    let rtn = 0;

    var form = new FormData();
    form.append("hosts", "mxsvr221");
    form.append("depots", "test");
    form.append("versions", "1.0");

    jQuery.ajax({
        url: '/monitoring/undeploy',
        dataType: 'json',
        type: 'POST',
        async: false,
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
        data: form,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

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