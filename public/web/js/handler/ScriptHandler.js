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
        fm.append("command", event.command);
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
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    

                    // Audit
                    auditLogHandler.writeLog("collection:rule", "Upload: " + event.name + " " + event.version, 0);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
                // Audit
                auditLogHandler.writeLog("collection:rule", "Upload: " + event.name + " " + event.version, 1);
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
                    
                    // Audit
                    auditLogHandler.writeLog("collection:rule", "Delete: " + name, 0);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
                // Audit
                auditLogHandler.writeLog("collection:rule", "Delete: " + name, 1);
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
        form.append("command", event.command);
        if(!_.isEmpty(event.uploadfile)){
            form.append("uploadfile", event.uploadfile);
        }
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
                    
                    // Audit
                    auditLogHandler.writeLog("collection:rule", "Update: " + event.name + " " + event.version, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
                // Audit
                auditLogHandler.writeLog("collection:rule", "Update: " + event.name + " " + event.version, 1);
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
            beforeSend(xhr){
            },
            complete(xhr, textStatus) {
            },
            success(data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    
                    rtn = data.message;

                    // Audit
                    //auditLogHandler.writeLog("collection:rule", "Get info: " + event.name + " " + event.version, 0);
                }

            },
            error(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;

                // Audit
                //auditLogHandler.writeLog("collection:rule", "Get info: " + event.name + " " + event.version, 1);
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

                    // Audit
                    //auditLogHandler.writeLog("collection:rule", "List", 0);
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
                // Audit
                //auditLogHandler.writeLog("collection:rule", "List", 1);
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
    async depotDeploy(event) {
        let rtn = null;
    
        try {

            var form = new FormData();
            _.forEach(event.hosts,(v)=>{
                form.append("hosts", v);
            })

            form.append("depots", event.name);
            form.append("command", event.command);
            form.append("versions", event.version);

            await jQuery.ajax({
                url: '/monitoring/deploy',
                dataType: 'json',
                type: 'POST',
                async: true,
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
                        
                        // Audit
                        auditLogHandler.writeLog("collection:rule", "Deploy: " + event.name + " " + event.version, 0);
                    }
    
                },
                error: function(xhr, textStatus, errorThrown){
                    rtn = xhr.responseText;
                    // Audit
                    auditLogHandler.writeLog("collection:rule", "Deploy: " + event.name + " " + event.version, 1);
                }
            });

        } catch (err) {
            
        }

        return rtn;
    }


    /*
    *  脚本管理
    *
    *   Deploy depot
    *
    *
    * */
   async depotUnDeploy(event) {
        let rtn = null;
        try {
            var form = new FormData();
            form.append("hosts", event.hosts);
            form.append("depots", event.name);
            form.append("versions", event.version);

            await jQuery.ajax({
                url: '/monitoring/undeploy',
                dataType: 'json',
                type: 'POST',
                async: true,
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
                        
                        // Audit
                        auditLogHandler.writeLog("collection:rule", "Undeploy: " + event.name + " " + event.version, 0);
                    }
                },
                error: function(xhr, textStatus, errorThrown){
                    rtn = xhr.responseText;
                    // Audit
                    auditLogHandler.writeLog("collection:rule", "Undeploy: " + event.name + " " + event.version, 1);
                }
            });
        } catch(err){
            
        }

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

                    // Audit
                    //auditLogHandler.writeLog("collection:rule", "Get file by name: " + event.name + " " + event.version, 0);
                }
            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
                // Audit
                //auditLogHandler.writeLog("collection:rule", "Get file by name: " + event.name + " " + event.version, 1);
            }
        });

        return rtn;
    };

    /*
    *  脚本内容
    *
    *   Update depot file content to new Version
    *
    *
    * */
    updateDepotFileContent(event) {
        let rtn = null;

        let url = '/monitoring/depot/file/';
        let form = new FormData();
        form.append("name", event.name);
        form.append("version", event.version); // Old version
        form.append("newVersion", event.newVersion) // new version
        form.append("remark", event.remark);
        form.append("filepath", event.filepath); // relative path
        form.append("content", event.content)
        form.append("type", "M") // type: M | A | D
        _.forEach(event.tags,(v)=>{
            form.append("tags", v);
        })

        jQuery.ajax({
            url: url,
            dataType: 'json',
            type: 'PUT',
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            async: false,
            data: form,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
                
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;

                    // Audit
                    auditLogHandler.writeLog("collection:rule", "Update file: " + event.name + " " + event.version, 0);
                }
            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
                // Audit
                auditLogHandler.writeLog("collection:rule", "Update file: " + event.name + " " + event.version, 1);
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

                    // Audit
                    auditLogHandler.writeLog("collection:rule", "Compare file: " + event.name + " " + event.versions.join(","), 0);
                }
            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
                // Audit
                auditLogHandler.writeLog("collection:rule", "Compare file: " + event.name + " " + event.versions.join(","), 1);
            }
        });

        return rtn;
    };

    
    /* 
        Deploy depot to zabbix agent
    */
   async deployToZabbixAgent(depot){
        let rtn = null;
        
        try{
            let form = new FormData();
            _.forEach(depot.hosts,(v)=>{
                form.append('hosts', v);
            })
            form.append('name',  depot.name);
            form.append('version', depot.version);
            form.append('key', depot.key);
            form.append('command', depot.command);

            await jQuery.ajax({
                url: '/monitoring/zabbix/deploy',
                type: "POST",
                dataType: 'json',
                processData: false,
                contentType: false,
                mimeType: 'multipart/form-data',
                data: form,
                async: true,
                complete: function(xhr, textStatus) {
                    
                },
                success: function(data, textStatus, xhr) {

                    userHandler.ifSignIn(data);

                    if( _.lowerCase(data.status) == "ok"){
                        rtn = 1;

                        // Audit
                        auditLogHandler.writeLog("collection:rule", "Deploy for zabbix agent: " + depot.name + " " + depot.version, 0);
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    rtn =  xhr.responseText;
                    // Audit
                    auditLogHandler.writeLog("collection:rule", "Deploy for zabbix agent: " + depot.name + " " + depot.version, 1);
                }
            })
        } catch(err){

        }

        return rtn;
    };

    /*
        Undeploy depot to zabbix agent
    */
   async unDeployToZabbixAgent(depot){
        let rtn = null;
        
        try{
            let form = new FormData();
            
            _.forEach(depot.hosts,(v)=>{
                form.append('hosts', v);
            })
            form.append('name', depot.name);
            form.append('version', depot.version);

            await jQuery.ajax({
                url: '/monitoring/zabbix/undeploy',
                type: "POST",
                dataType: 'json',
                processData: false,
                contentType: false,
                mimeType: 'multipart/form-data',
                data: form,
                async: true,
                complete: function(xhr, textStatus) {
                    
                },
                success: function(data, textStatus, xhr) {

                    userHandler.ifSignIn(data);

                    if( _.lowerCase(data.status) == "ok"){
                        rtn = 1;

                        // Audit
                        auditLogHandler.writeLog("collection:rule", "Undeploy for zabbix agent: " + depot.name + " " + depot.version, 0);
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    rtn = xhr.responseText;
                    // Audit
                    auditLogHandler.writeLog("collection:rule", "Undeploy for zabbix agent: " + depot.name + " " + depot.version, 1);
                }
            })
        } catch(err){

        }

        return rtn;
    };

    /*  
        Start Stop Restart zabbix agent
    */
   async zabbixAgentAction(depot){
        let rtn = null;
        try{
            let form = new FormData();
            _.forEach(depot.hosts,(v)=>{
                form.append('hosts', v);
            })

            await jQuery.ajax({
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
                    
                    // Audit
                    auditLogHandler.writeLog("Sccollection:ruleript", depot.action + " for zabbix agent: " + depot.hosts.join(", "), 0);

                    rtn = data;
                },
                error: function(xhr, textStatus, errorThrown) {
                    // Audit
                    auditLogHandler.writeLog("collection:rule", depot.action + " for zabbix agent: " + depot.hosts.join(", "), 1);

                    rtn = xhr.responseText;
                }
            })
        } catch(err){

        }

        return rtn;
        
    }; 
}

var scriptHandler = new ScriptHandler();

