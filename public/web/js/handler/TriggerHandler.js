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

                

                if (_.isEmpty(data.message)) return rtn;

                rtn = data.message;

            },
            error: function(xhr, textStatus, errorThrown){
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;
    };

    async triggerListAsync(className){

        let rtn = null;

        try{
            await jQuery.ajax({
                url: `/mxobject/trigger?class=${encodeURIComponent(className)}`,
                dataType: 'json',
                type: 'GET',
                async: true,
                beforeSend(xhr){
                },
                complete(xhr, textStatus) {
                },
                success(data, status) {

                    

                    if (_.isEmpty(data.message)) return rtn;

                    rtn = data.message;

                },
                error(xhr, textStatus, errorThrown){
                    rtn = xhr.responseText;
                }
            });
        } catch(err){

        }

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

    async triggerNewAsync(event){
        let rtn = null;

        try{
            await jQuery.ajax({
                url: '/mxobject/trigger',
                type: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                async: true,
                data: JSON.stringify(event),
                beforeSend(xhr){
                },
                complete(xhr, textStatus) {
                },
                success(data, status) {

                    

                    if( _.lowerCase(data.status) === "ok"){
                        rtn = 1;
                    }

                },
                error(xhr, textStatus, errorThrown) {
                    rtn = xhr.responseText;
                }
            });
        } catch(err){
            
        }

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

    async triggerDeleteAsync(className,name){
        let rtn = null;

        try{
            await jQuery.ajax({
                    url: `/mxobject/trigger?class=${encodeURIComponent(className)}&name=${name}`,
                    dataType: 'json',
                    type: 'DELETE',
                    async: true,
                    beforeSend:function(xhr){
                    },
                    complete: function(xhr, textStatus) {
                    },
                    success: function (data, status) {

                        

                        if( _.lowerCase(data.status) === "ok"){
                            rtn = 1;
                        }

                    },
                    error: function(xhr, textStatus, errorThrown) {
                        rtn = xhr.responseText;
                    }
                });
        } catch(err){
                
        }

        return rtn;
    };

}

var triggerHandler = new TriggerHandler();

