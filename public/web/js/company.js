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


"use strict";

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
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            rtn = 0;
            alertify.error("失败" + " " + JSON.stringify(xhr));
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }

    })

    return rtn;

};