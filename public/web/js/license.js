/*

        #       ###  #####  ####### #     #  #####  #######
        #        #  #     # #       ##    # #     # #
        #        #  #       #       # #   # #       #
        #        #  #       #####   #  #  #  #####  #####
        #        #  #       #       #   # #       # #
        #        #  #     # #       #    ## #     # #
        ####### ###  #####  ####### #     #  #####  #######
*/

"use strict";

/*
*  License管理
*
*  Import license
*
*   var form = new FormData();
    form.append("uploadfile", "wecise.lic");
*
* */
var licenseImport = function() {

    let rtn = 0;

    jQuery.ajax({
        url: '/license/import',
        dataType: 'json',
        type: 'POST',
        async: false,
        data: form,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
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
        error: function (xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
};


/*
*  License管理
*
*  View license
*
*
*/
var licenseView = function(event) {
    let rtn = null;

    jQuery.ajax({
        url: '/license/info/wecise',
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
