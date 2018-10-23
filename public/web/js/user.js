/*

        #     #  #####  ####### ######       ##        #####  ######  ####### #     # ######
        #     # #     # #       #     #     #  #      #     # #     # #     # #     # #     #
        #     # #       #       #     #      ##       #       #     # #     # #     # #     #
        #     #  #####  #####   ######      ###       #  #### ######  #     # #     # ######
        #     #       # #       #   #      #   # #    #     # #   #   #     # #     # #
        #     # #     # #       #    #     #    #     #     # #    #  #     # #     # #
         #####   #####  ####### #     #     ###  #     #####  #     # #######  #####  #

 */

"use strict";



/*
*  认证管理
*
*/
/*
var signIn = function(keyspace, username, password) {
    let rtn = null;

    jQuery.ajax({
        url: "/user/signin",
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {
            company: keyspace,
            username: username,
            password: password
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {
            rtn = data;
        },
        error: function(xhr, textStatus, errorThrown) {
        }
    });
    return rtn;
}('wecise','admin','admin');
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