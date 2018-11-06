/*

        ######  ####### #       ###  #####  #     #
        #     # #     # #        #  #     #  #   #
        #     # #     # #        #  #         # #
        ######  #     # #        #  #          #
        #       #     # #        #  #          #
        #       #     # #        #  #     #    #
        #       ####### ####### ###  #####     #
*/

"use strict";

/*
*  策略管理
*
*  Add Cmd Policy
*
*  var data = {
                  "name": "test",
                  "command": "test.sh",
                  "depotname": "test",
                  "depotversion": "1.1",
                  "ctype": 0,
                  "interval": 10,
                  "unit": "second",
                  "rule": "/matrix/rules/test",
                  "hosts": [
                    "mxsvr221"
                  ],
                  "split": true,
                  "delimiter": "\n",
                  "delimitereol":false,
                  "tags": [
                    "test"
                  ],
                  "attrs": {}
                };
*
* */
var cmdPolicyAdd = function(event) {

    let rtn = null;

    jQuery.ajax({
        url: '/monitoring/policy',
        dataType: 'json',
        type: 'POST',
        processData: false,
        data: event,
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
*  策略管理
*
*  Add Log Policy
*
*  var data = {
                  "name": "testlog",
                  "rule": "/matrix/rules/log/etcd",
                  "dir": "/opt/matrix/var/logs/etcd",
                  "match": "out.log",
                  "delimiter": "\n",
                  "delimitereol": false,
                  "hosts": [
                    "mxsvr221"
                  ],
                  "tags": [
                    "test"
                  ],
                  "attrs": {}
                };
*
* */
var logPolicyAdd = function(event) {

    let rtn = null;

    jQuery.ajax({
        url: '/monitoring/policy/log',
        dataType: 'json',
        type: 'POST',
        processData: false,
        data: event,
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
*  策略管理
*
*  Deploy Policy
*
*
*
*/
var policyDeploy = function(event) {
    let rtn = 1;

    jQuery.ajax({
        url: '/monitoring/policy/deploy/test',
        dataType: 'json',
        type: 'POST',
        processData: false,
        contentType: false,
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
*  策略管理
*
*  Undeploy Policy
*
* */
var ruleDelete = function(event) {
    let rtn = 1;

    jQuery.ajax({
        url: '/monitoring/policy/undeploy/test',
        dataType: 'json',
        type: 'POST',
        processData: false,
        contentType: false,
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
*  策略管理
*
*  Get policy extend
*
* */
var policyExtendList = function() {
    let rtn = null;

    jQuery.ajax({
        url: '/monitoring/policy/extend/matrix/rules/test',
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
*  策略管理
*
*   Update policy extend
*   ltsv detail http://ltsv.org/
*   ltsv delimiter: \t
*
*   event = 'key:mxsvr201 val:127.0.0.1'
*
* */
var policyExtendUpdate = function(event) {
    let rtn = 0;

    jQuery.ajax({
        url: '/monitoring/policy/extend/matrix/rules/test',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: event,
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