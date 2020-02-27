/*

         #####   #####  #     # ####### ######  #     # #       #######     #####  ######  ####### #     # ######
        #     # #     # #     # #       #     # #     # #       #          #     # #     # #     # #     # #     #
        #       #       #     # #       #     # #     # #       #          #       #     # #     # #     # #     #
         #####  #       ####### #####   #     # #     # #       #####      #  #### ######  #     # #     # ######
              # #       #     # #       #     # #     # #       #          #     # #   #   #     # #     # #
        #     # #     # #     # #       #     # #     # #       #          #     # #    #  #     # #     # #
         #####   #####  #     # ####### ######   #####  ####### #######     #####  #     # #######  #####  #
*/

class GroupHandler {
    constructor(){

    }

    /*
    *  调度器组管理
    *
    *  group list
    *
    *
    */
    serverGroupList() {
        let rtn = null;

        jQuery.ajax({
            url: '/group',
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

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
    *  调度器组管理
    *  add group
    *   data: {
    *          "name": "string",
    *          "gtype": "string", // group | proxy
    *          "hosts": [
    *            {
    *             "host": "string",
    *              "proxy": "string",
    *              "port": "string",
    *              "username":"string",
    *              "password":"string"
    *            }
    *          ]
    *        }
    *
    */
    serverGroupNew(event) {
        let rtn = 1;

        jQuery.ajax({
            url: '/group',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: event,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + moment().format("LLL"));
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
    *  调度器组管理
    *  delete group
    *
    * */
    serverGroupDelete(event) {
        let rtn = 1;

        jQuery.ajax({
            url: '/group/group/test',
            dataType: 'json',
            type: 'DELETE',
            data: event,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) === "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
                }
            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                alertify.error("失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };

}

var groupHandler = new GroupHandler();