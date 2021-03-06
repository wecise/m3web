/*

        ######  #     # #       #######
        #     # #     # #       #
        #     # #     # #       #
        ######  #     # #       #####
        #   #   #     # #       #
        #    #  #     # #       #
        #     #  #####  ####### #######
*/

class RuleHandler{
    constructor(){

    }

    /*
    *  规则管理
    *
    *  Rule List
    *
    * */
    ruleList() {

        let rtn = null;

        jQuery.ajax({
            url: '/mxobject/rule?class=' + encodeURIComponent('/matrix/devops/event'),
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
    *  规则管理
    *
    *  Rule New
    *
    *  data: {key:'/matrix/rules/event', script:'...'}
    *
    */
    ruleNew(event) {
        let rtn = 1;

        jQuery.ajax({
            url: '/mxobject/rule',
            dataType: 'json',
            type: 'PUT',
            data: event,
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

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

    /*
    *  规则管理
    *
    *  Rule Delete
    *
    * */
    ruleDelete(event) {
        let rtn = 1;

        jQuery.ajax({
            url: '/mxobject/rule?key=' + encodeURIComponent('/matrix/rules/event'),
            dataType: 'json',
            type: 'DELETE',
            data: event,
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

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
}

var ruleHandler = new RuleHandler();