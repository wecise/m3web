
/*
        #####  ######  ####### #    #
        #     # #     # #     # #   #
        #       #     # #     # #  #
        #  #### ######  #     # ###
        #     # #   #   #     # #  #
        #     # #    #  #     # #   #
         #####  #     # ####### #    #
 */

class BaseLineHandler {

    constructor(){
    }

    /*
    *  BaseLine列表
    *
    */
    baseLineList(event) {
        let rtn = null;

        jQuery.ajax({
            url: "/baseline",
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

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
    *   BaseLine 生成Job
    *
    */
   baseLineToJob(event) {
        let rtn = 1;

        jQuery.ajax({
            url: "/baseline",
            dataType: 'json',
            contentType: 'json',
            type: 'POST',
            async: false,
            data: JSON.stringify(event),
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                alertify.error("失败" + " " + xhr.responseText)
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        });
        return rtn;
    };

    /*
    *  BaseLine 删除
    *
    */
   baseLineDelete(event) {
        let rtn = 1;

        jQuery.ajax({
            url: `/baseline/${event}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                alertify.error("失败" + " " + xhr.responseText)
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };
}

var baseLineHandler = new BaseLineHandler();