/*
        ####### ######        # #######  #####  #######    ######     #    #######    #
        #     # #     #       # #       #     #    #       #     #   # #      #      # #
        #     # #     #       # #       #          #       #     #  #   #     #     #   #
        #     # ######        # #####   #          #       #     # #     #    #    #     #
        #     # #     # #     # #       #          #       #     # #######    #    #######
        #     # #     # #     # #       #     #    #       #     # #     #    #    #     #
        ####### ######   #####  #######  #####     #       ######  #     #    #    #     #
 */

"use strict";

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
            rtn = {message:[],status:"error"};
            alertify.error("失败" + " " + moment().format("LLL") + " " +  xhr.responseText);
            mxLog.warn("["+ moment().format("LLL")+"] [" + xhr.status + "] " + JSON.stringify(xhr.responseJSON));
        }
    });

    return rtn;
};