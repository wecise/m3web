/*

        ####### ######  ###  #####   #####  ####### ######
           #    #     #  #  #     # #     # #       #     #
           #    #     #  #  #       #       #       #     #
           #    ######   #  #  #### #  #### #####   ######
           #    #   #    #  #     # #     # #       #   #
           #    #    #   #  #     # #     # #       #    #
           #    #     # ###  #####   #####  ####### #     #

 */

class TriggerHandler {
    constructor(){

    }

    /*
    *  触发器管理
    *
    *  列表
    */
    triggerList(className){
        let rtn = null;

        jQuery.ajax({
            url: `/mxobject/trigger?class=${encodeURIComponent(className)}`,
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if (_.isEmpty(data.message)) return rtn;

                rtn = data.message;

            },
            error: function(xhr, textStatus, errorThrown){
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;
    };

    /*
    *  触发器管理
    *
    *  添加
    */
    triggerNew(event){
        let rtn = 0;

        jQuery.ajax({
            url: '/mxobject/trigger',
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            async: false,
            data: JSON.stringify(event),
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) === "ok"){
                    rtn = 1;
                    alertify.success(`${event.name}： 保存成功 ${moment().format("LLL")}`);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;
    };

    /*
    *  触发器管理
    *
    *  删除
    */
    triggerDelete(className,name){
        let rtn = 0;

        jQuery.ajax({
            url: `/mxobject/trigger?class=${encodeURIComponent(className)}&name=${name}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) === "ok"){
                    rtn = 1;
                    alertify.success(`${event.name}： 删除成功 ${moment().format("LLL")}`);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;
    };

}

var triggerHandler = new TriggerHandler();
