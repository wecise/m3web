/*

        ####### ######  ###  #####   #####  ####### ######
           #    #     #  #  #     # #     # #       #     #
           #    #     #  #  #       #       #       #     #
           #    ######   #  #  #### #  #### #####   ######
           #    #   #    #  #     # #     # #       #   #
           #    #    #   #  #     # #     # #       #    #
           #    #     # ###  #####   #####  ####### #     #

 */

"use strict";

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