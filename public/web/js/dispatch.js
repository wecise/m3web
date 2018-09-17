/*

        #####  #  ####  #####    ##   #####  ####  #    #
        #    # # #      #    #  #  #    #   #    # #    #
        #    # #  ####  #    # #    #   #   #      ######
        #    # #      # #####  ######   #   #      #    #
        #    # # #    # #      #    #   #   #    # #    #
        #####  #  ####  #      #    #   #    ####  #    #

*/

"use strict";

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