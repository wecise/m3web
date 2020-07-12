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
        _.forEach(event.tags,(v)=>{
            fm.append("tags", v);
        })

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
                // Pace.restart();
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
                rtn = xhr.responseText;
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
                // Pace.restart();
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
                rtn = xhr.responseText;
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
        let rtn = null;

        var form = new FormData();
        form.append("name", event.name);
        form.append("version", event.version);
        form.append("remark", event.remark);
        form.append("uploadfile", event.uploadfile);
        _.forEach(event.tags,(v)=>{
            form.append("tags", v);
        })

        jQuery.ajax({
            url: '/monitoring/depot?overwrite=true',
            dataType: 'json',
            type: 'PUT',
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            data: form,
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
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

        let url = "";

        // 获取脚本信息
        if(event.version){
            url = `/monitoring/depot/${event.name}?version=${event.version}`;
        } 
        // 获取脚本所有版本
        else {
            url = `/monitoring/depot/${event.name}`;
        }

        jQuery.ajax({
            url: url,
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
                rtn = xhr.responseText;
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
                rtn = xhr.responseText;
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

        form.append("depots", event.name);
        form.append("command", event.command);
        form.append("versions", event.version);

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

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
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
        let rtn = null;

        var form = new FormData();
        form.append("hosts", event.hosts);
        form.append("depots", event.name);
        form.append("versions", event.version);

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

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }
            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
            }
        });

        return rtn;
    };

    /*
    *  脚本内容
    *
    *   Get depot file content
    *
    *
    * */
    getDepotFileContent(event) {
        let rtn = null;

        let url = `/monitoring/depot/file/${event.name}?version=${event.version}&filepath=${event.path}`;

        jQuery.ajax({
            url: url,
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
                rtn = xhr.responseText;
            }
        });

        return rtn;
    };

    /*
    *  多版本脚本内容对比
    *
    *   Compare depot file content
    *
    *
    * */
    compareDepotFiles(event) {
        let rtn = null;

        let url = `/monitoring/depot/diff/${event.name}?version=${event.versions[0]}&compareVersion=${event.versions[1]}`;

        jQuery.ajax({
            url: url,
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
                rtn = xhr.responseText;
            }
        });

        return rtn;
    };

    
    /* 
        Deploy depot to zabbix agent
    */
    deployToZabbixAgent(depot){
        let rtn = null;
        
        let form = new FormData();
        _.forEach(depot.hosts,(v)=>{
            form.append('hosts', v);
        })
        form.append('name',  depot.name);
        form.append('version', depot.version);
        form.append('key', depot.key);
        form.append('command', depot.command);

        jQuery.ajax({
            url: '/monitoring/zabbix/deploy',
            type: "POST",
            dataType: 'json',
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            data: form,
            async:false,
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                rtn =  xhr.responseText;
            }
        })
        return rtn;
    };

    /*
        Undeploy depot to zabbix agent
    */
    unDeployToZabbixAgent(depot){
        let rtn = null;
        
        let form = new FormData();
        
        _.forEach(depot.hosts,(v)=>{
            form.append('hosts', v);
        })
        form.append('name', depot.name);
        form.append('version', depot.version);

        jQuery.ajax({
            url: '/monitoring/zabbix/undeploy',
            type: "POST",
            dataType: 'json',
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            data: form,
            async:false,
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        })
        return rtn;
    };

    /*  
        Start Stop Restart zabbix agent
    */
    zabbixAgentAction(depot){
        
        let form = new FormData();
        _.forEach(depot.hosts,(v)=>{
            form.append('hosts', v);
        })

        jQuery.ajax({
            url: `/monitoring/zabbix/${depot.action}`,
            type: "POST",
            dataType: 'json',
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            data: form,
            async:true,
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);
                
                return data;
            },
            error: function(xhr, textStatus, errorThrown) {
                return xhr.responseText;
            }
        })
        
    }; 
}

var scriptHandler = new ScriptHandler();

