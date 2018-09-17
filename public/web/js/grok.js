
/*
        #####  ######  ####### #    #
        #     # #     # #     # #   #
        #       #     # #     # #  #
        #  #### ######  #     # ###
        #     # #   #   #     # #  #
        #     # #    #  #     # #   #
         #####  #     # ####### #    #
 */

"use strict";

/*
*  Grok解析规则列表
*
*/
var grokList = function (event) {
    let rtn = null;

    jQuery.ajax({
        url: "/pattern",
        dataType: 'json',
        type: 'GET',
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function (data, status) {

            ifSignIn(data);

            if (data.status == "ok"){
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
*  Grok解析规则列表
*
*/
var grokNew = function (event) {
    let rtn = 1;

    var form = new FormData();
    form.append("eg", event.eg);
    form.append("pattern", event.pattern);

    jQuery.ajax({
        url: "/pattern/" + event.name,
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
                swal("Success!","","success");
            } else {
                rtn = 0;
                swal("Failed!",data.message,"warning");
            }

        },
        error: function(xhr, textStatus, errorThrown){
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            return 0;
        }
    });
    return rtn;
};

/*
*  Grok解析规则列表
*
*/
var grokDelete = function (event) {
    let rtn = 1;

    jQuery.ajax({
        url: `/pattern/${event.name}`,
        dataType: 'json',
        type: 'DELETE',
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