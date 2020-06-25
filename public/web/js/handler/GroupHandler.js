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
                return xhr.responseJSON;
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
        let rtn = null;

        jQuery.ajax({
            url: '/group',
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json',
            async: false,
            data: event,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error: function(xhr, textStatus, errorThrown) {
                return xhr.responseJSON;
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
        let rtn = null;

        jQuery.ajax({
            url: `/group/${event.gtype}/${event.name}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                rtn = data;
            },
            error: function(xhr, textStatus, errorThrown){
                return xhr.responseJSON;
            }
        });
        return rtn;
    };

}

var groupHandler = new GroupHandler();