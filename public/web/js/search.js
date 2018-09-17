/*
         #####  #######    #    ######   #####  #     #
        #     # #         # #   #     # #     # #     #
        #       #        #   #  #     # #       #     #
         #####  #####   #     # ######  #       #######
              # #       ####### #   #   #       #     #
        #     # #       #     # #    #  #     # #     #
         #####  ####### #     # #     #  #####  #     #

 */

"use strict";

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