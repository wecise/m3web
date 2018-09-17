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

/*
        ######  ######  ####### ######  #######
        #     # #     # #     # #     # #
        #     # #     # #     # #     # #
        ######  ######  #     # ######  #####
        #       #   #   #     # #     # #
        #       #    #  #     # #     # #
        #       #     # ####### ######  #######
 */

"use strict";

/*
*   获取 Host List
*
*   参数：
*
*
*/
var getProbeHostList = function(){
    let rtn = null;

    jQuery.ajax({
        url: "/host?tag=linux&status=true",
        type: "GET",
        dataType: "json",
        contentType: 'application/json',
        async:false,
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
*   更新 Host
*
*   参数：
*
    host = {
        "host": "string",
        "iplist": ["string"...],
        "isagent": 0 | 1,
        "domain": "string",
        "hostgroups": ["string"...],
        "sert": "string",
        "secret": "string",
        "config": {"cpu":"80%", "status":"ok"}
    }
*/


var updateProbeHost = function(host){
    let rtn = 0;

    jQuery.ajax({
        url: "/host",
        type: "POST",
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(host),
        async:false,
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("更新成功 " + host.name + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("更新失败 " + host.name + " " + moment().format("LLL"));
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
*   获取 Host By Name
*
*   参数：
*
*
*/
var getProbeHost = function(name){
    let rtn = null;

    jQuery.ajax({
        url: `/host/${name}`,
        type: "GET",
        dataType: "json",
        contentType: 'application/json',
        async:false,
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
*   删除 Host By Name
*
*   参数：
*
*
*/
var deleteProbeHost = function(name){
    let rtn = 0;

    jQuery.ajax({
        url: `/host/${name}`,
        type: "GET",
        dataType: "json",
        contentType: 'application/json',
        async:false,
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("删除成功 " + host.name + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("删除失败 " + host.name + " " + moment().format("LLL"));
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};