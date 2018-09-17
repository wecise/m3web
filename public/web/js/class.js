
/*
        #######            #     #####   #####
        #       #         # #   #     # #     #
        #       #        #   #  #       #
        #       #       #     #  #####   #####
        #       #       #######       #       #
        #     # #       #     # #     # #     #
         #####  ####### #     #  #####   #####
 */

"use strict";

/*
*   类管理
*
*   树
*
*
* */
var classList = function(event){
    let rtn = null;
    let loading = null;

    jQuery.ajax({
        url: "/mxobject/schema/class/list",
        dataType: 'json',
        type: 'GET',
        data: {
            id: event
        },
        async: false,
        beforeSend:function(xhr){
            loading = layer.load(2, {
                shade: [0.1,'#ccc'],
                time: 30*1000
            });
        },
        complete: function(xhr, textStatus) {
            layer.close(loading);
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if (!_.isEmpty(data.message)){
                rtn = data.message;
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            layer.close(loading);
            console.log(errorThrown);
        }
    })
    return rtn;
};

/*
*   类管理
*
*   新建
*
*
* */
var classNew = function (event) {
    let rtn = 0;

    jQuery.ajax({
        url: "/mxobject/schema/class",
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {
            classinfo: JSON.stringify(event)
        },
        success: function (data, status) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("Success" + " " + event.name + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("Failed" + " " + event.name + " " + moment().format("LLL"));
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            alertify.error("Failed" + " " + event.name + " " + moment().format("LLL"));
            mxLog.warn("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });
    return rtn;
}


/*
*   类管理
*
*   删除
*
*
* */
var classDelete = function(event){
    let rtn = 0;

    jQuery.ajax({
        url: "/mxobject/schema/class?cid=" + event,
        dataType: 'json',
        type: 'DELETE',
        async: false,
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("Success" + " " + event + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("Failed" + " " + event + " " + moment().format("LLL"));
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
*   获取类的信息并生成tree
*
*       参数：
*           ftype
*           parent
*           field
*/
var fetchSubClass = function(parent){
    let rtn = null;

    let _cond = {
        ftype: "class",
        parent: parent
    };

    jQuery.ajax({
        url: "/mxobject/search",
        dataType: 'json',
        type: 'POST',
        async: false,
        data: {
            cond: `call tree ` + JSON.stringify(_cond),
            meta: true
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if (_.isEmpty(data.message)) return false;

            rtn = data.message[0].tree;

        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
}

/*
*   获取当前class属性
*
*       参数：
*           class
*/
var fetchClass = function (param) {
    let rtn = null;

    jQuery.ajax({
        url: '/mxobject/schema/class',
        type: 'GET',
        dataType: 'json',
        async: false,
        data: {
            class: param
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
        }
    });

    return rtn;
};
