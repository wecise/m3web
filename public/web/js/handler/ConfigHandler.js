
/*
        #####  ######  ####### #    #
        #     # #     # #     # #   #
        #       #     # #     # #  #
        #  #### ######  #     # ###
        #     # #   #   #     # #  #
        #     # #    #  #     # #   #
         #####  #     # ####### #    #
 */

class ConfigHandler {
    constructor(){

    }

    /*
    *  Config From ETCD
    *
    */
    configGet(event) {
        let rtn = null;

        jQuery.ajax({
            url: '/config/get',
            type: 'GET',
            dataType: 'json',
            async: false,
            data: {
                key: event
            },
            beforeSend: function(xhr) {
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {
                
                userHandler.ifSignIn(data);

                if(!_.isEmpty(data.message)){
                    let tmp = JSON.stringify(data.message).replace(new RegExp('"dir":true', 'gm'), '"isParent":true,"dir":true');
                    rtn = _.attempt(JSON.parse.bind(null, tmp));
                }
                
            },
            error: function(xhr, textStatus, errorThrown) {
            }
        });
        return rtn;
    };

    /*
    *  Config Add ETCD
    *
    */
   configAdd(event) {
        let rtn = 0;

        jQuery.ajax({
            url: '/config/set',
            type: 'POST',
            dataType: 'json',
            async: false,
            data: {
                key:event.key,
                ttl: event.ttl,
                value: event.value
            },
            beforeSend: function(xhr) {
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {
                
                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("添加成功：" + event.key + " " + moment().format("LLL"));
                }
                
            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("添加失败：" + event.key + " " + xhr.responseText);
            }
        });
        return rtn;
    };

    /*
    *  Config Delete ETCD
    *
    */
    configDelete(event) {
        let rtn = 0;

        jQuery.ajax({
            url: '/config/del',
            type: 'POST',
            dataType: 'json',
            async: false,
            data: {
                key: event.key
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("删除成功：" + event.key + " " + moment().format("LLL"));
                }
        
            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("删除失败：" + event.key + " " + xhr.responseText);
            }
        })
        return rtn;
    }

}

var configHandler = new ConfigHandler();