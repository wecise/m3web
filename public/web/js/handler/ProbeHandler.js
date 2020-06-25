/*
        ######  ######  ####### ######  #######
        #     # #     # #     # #     # #
        #     # #     # #     # #     # #
        ######  ######  #     # ######  #####
        #       #   #   #     # #     # #
        #       #    #  #     # #     # #
        #       #     # ####### ######  #######
 */

class ProbeHandler {

    constructor() {

    }

    /*
    *   获取 Host List
    */
    getProbeHostList(){
        let rtn = null;

        jQuery.ajax({
            url: "/host?tag=linux&status=true",
            type: "GET",
            dataType: "json",
            contentType: 'application/json',
            async:false,
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                rtn = data;
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        })
        return rtn;
    };


    /*
    *   更新 Host
    *
    *   参数：
    *
        host = {
            "host": "string",
            "iplist": ["string"...],
            "isagent": 0 | 1,
            "domain": "string",
            "hostgroups": ["string"...],
            "sert": "string",
            "secret": "string",
            "config": {"cpu":"80%", "status":"ok"}
        }
    */
    updateProbeHost(host){
        let rtn = 0;

        jQuery.ajax({
            url: "/host",
            type: "POST",
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(host),
            async:false,
            beforeSend: function(xhr) {
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("更新成功 " + host.name + " " + moment().format("LLL"));
                } else {
                    rtn = 0;
                    alertify.error("更新失败 " + host.name + " " + moment().format("LLL"));
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
    *   获取 Host By Name
    */
    getProbeHost(name){
        let rtn = null;

        jQuery.ajax({
            url: `/host/${name}`,
            type: "GET",
            dataType: "json",
            contentType: 'application/json',
            async:false,
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                rtn = data;
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        })
        return rtn;
    };

    /*
    *   删除 Host By Name
    */
    deleteProbeHost(name){
        let rtn = 0;

        jQuery.ajax({
            url: `/host/${name}`,
            type: "GET",
            dataType: "json",
            contentType: 'application/json',
            async:false,
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("删除成功 " + host.name + " " + moment().format("LLL"));
                } else {
                    rtn = 0;
                    alertify.error("删除失败 " + host.name + " " + moment().format("LLL"));
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
        Deploy depot to zabbix agent
    */
    deployToZabbixAgent(depot){
        let rtn = null;
        
        let form = new FormData();
        form.append('hosts', depot.hosts);
        form.append('name',  depot.name);
        form.append('version', depot.version);
        form.append('key', depot.key);
        form.append('command', depot.commmand);

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
                return xhr.responseText;
            }
        })
        return rtn;
    };
    
    /*
        Undeploy depot to zabbix agent
    */
    deployToZabbixAgent(depot){
        let rtn = null;
        
        let form = new FormData();
        form.append('hosts', depot.hosts);
        form.append('depots', depot.depots);
        form.append('versions', depot.version);

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
                return xhr.responseText;
            }
        })
        return rtn;
    };
    
    /*  
        Start Stop Restart zabbix agent
    */
    zabbixAgentAction(depot){
        let rtn = null;
        
        let form = new FormData();
        form.append('hosts', depot.hosts);

        jQuery.ajax({
            url: `/monitoring/zabbix/${deopt.action}`,
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
                return xhr.responseText;
            }
        })
        return rtn;
    }; 

}

var probeHandler = new ProbeHandler();
