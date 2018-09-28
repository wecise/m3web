/**
 * @author: wangzd
 * @description:
 * @Date: 2018/9/20 19:07
 */

"use strict";

/*
*   Server端脚本调用
*
*       参数：
*
*/

var callFsJScript =  function(name){

    let rtn = null;

    jQuery.ajax({
        url: "/script/exec/js?input=HELLO&isfile=true",
        type: "POST",
        data: name,
        contentType: false,
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            rtn = data;

            console.log(data);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
};