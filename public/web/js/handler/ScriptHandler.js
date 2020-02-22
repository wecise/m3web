/*

        #####   #####  ######  ### ######  #######
        #     # #     # #     #  #  #     #    #
        #       #       #     #  #  #     #    #
         #####  #       ######   #  ######     #
              # #       #   #    #  #          #
        #     # #     # #    #   #  #          #
         #####   #####  #     # ### #          #
*/

class ScriptHandler {
    
    constructor() {
        
    }

    /*
    *  脚本管理
    *
    *  Add depot
    *
    * */
    depotAdd(event) {

        let rtn = null;

        var fm = new FormData();
        fm.append("name", event.name);
        fm.append("version", event.version);
        fm.append("remark", event.remark);
        fm.append("uploadfile", event.uploadfile);
        fm.append("tags", event.tags);

        jQuery.ajax({
            url: '/monitoring/depot',
            dataType: 'json',
            type: 'POST',
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            data: fm,
            async: false,
            beforeSend: function (xhr) {
                Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseJSON;
            }
        });
        return rtn;
    };


    /*
    *  脚本管理
    *
    *  Delete depot
    *
    * */
    depotDelete(name) {

        let rtn = null;

        jQuery.ajax({
            url: `/monitoring/depot/${name}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend: function (xhr) {
                Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseJSON;
            }
        });
        return rtn;
    };


    /*
    *  脚本管理
    *
    *  Update depot
    *
    *
    */
    depotUpdate(event) {
        let rtn = 1;

        let fm = new FormData();
        _.map(event,function(v,k){
            fm.append(k, v);    
        })

        jQuery.ajax({
            url: '/monitoring/depot?overwrite=true',
            dataType: 'json',
            type: 'PUT',
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            data: fm,
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("更新成功" + " " + data.message);
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                alertify.error("更新失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };

    /*
    *  脚本管理
    *
    *  Get depot
    *
    * */
    depotGet(event) {
        let rtn = null;

        jQuery.ajax({
            url: `/monitoring/depot/${event.name}?version=${event.version}`,
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

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

    /*
    *  脚本管理
    *
    *  Get depot list
    *
    * */
    depotList() {
        let rtn = null;

        jQuery.ajax({
            url: '/monitoring/depot',
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
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
    *  脚本管理
    *
    *   Deploy depot
    *
    *
    * */
    depotDeploy(event) {
        let rtn = null;

        var form = new FormData();

        _.forEach(event.hosts,(v)=>{
            form.append("hosts", v);
        })

        form.append("depots", event.depots);
        form.append("versions", event.versions);

        jQuery.ajax({
            url: '/monitoring/deploy',
            dataType: 'json',
            type: 'POST',
            async: false,
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            data: form,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseJSON;
            }
        });

        return rtn;
    };


    /*
    *  脚本管理
    *
    *   Deploy depot
    *
    *
    * */
    depotUnDeploy(event) {
        let rtn = 0;

        var form = new FormData();
        form.append("hosts", event.hosts);
        form.append("depots", event.depots);
        form.append("versions", event.versions);

        jQuery.ajax({
            url: '/monitoring/undeploy',
            dataType: 'json',
            type: 'POST',
            async: false,
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            data: form,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                if( _.lowerCase(data.status) == "ok"){
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

var scriptHandler = new ScriptHandler();

