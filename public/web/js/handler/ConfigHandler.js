
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
                // Pace.restart();
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
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        });
        return rtn;
    };

    async configGetAsync(event) {
        let rtn = null;

        try{
            await jQuery.ajax({
                url: '/config/get',
                type: 'GET',
                dataType: 'json',
                async: true,
                data: {
                    key: event
                },
                beforeSend(xhr) {
                    
                },
                complete(xhr, textStatus) {
                },
                success(data, textStatus, xhr) {
                    
                    userHandler.ifSignIn(data);

                    if(!_.isEmpty(data.message)){
                        let tmp = JSON.stringify(data.message).replace(new RegExp('"dir":true', 'gm'), '"isParent":true,"dir":true');
                        rtn = _.attempt(JSON.parse.bind(null, tmp));
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
    *  Config Add ETCD
    *
    */
   configAdd(event) {
        let rtn = null;

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
                // Pace.restart();
            },
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
        });
        return rtn;
    };

    async configAddAsync(event) {
        let rtn = null;

        try{
            await jQuery.ajax({
                url: '/config/set',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    key:event.key,
                    ttl: event.ttl,
                    value: event.value
                },
                beforeSend(xhr) {
                    
                },
                complete(xhr, textStatus) {
                },
                success(data, textStatus, xhr) {
                    
                    userHandler.ifSignIn(data);

                    if( _.lowerCase(data.status) == "ok"){
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
            beforeSend: function(xhr) {
                // Pace.restart();
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
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        })
        return rtn;
    }

    async configDeleteAsync(event) {
        let rtn = null;

        try{
            await jQuery.ajax({
                url: '/config/del',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    key: event.key
                },
                beforeSend(xhr) {
                },
                complete(xhr, textStatus) {
                },
                success(data, textStatus, xhr) {

                    userHandler.ifSignIn(data);

                    if( _.lowerCase(data.status) == "ok"){
                        rtn = 1;
                    }
            
                },
                error(xhr, textStatus, errorThrown) {
                    rtn = xhr.responseText;
                }
            })
        } catch(err){
            
        }
        return rtn;
    }

    /*
    *  Config Export From ETCD
    *
    */
    configExport(key,el) {
        
        let fileName = `ETCD${key}_${moment().format("YYYY-MM-DD_HH:mm:SS")}.json`;

        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `/config/export?key=${key}`, true);
            xhr.setRequestHeader("Content-type","text/json");
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var blob = new Blob([xhr.response], {type: "octet/stream"});
                    saveAs(blob, fileName);
                    el.$message({
                        type: "success",
                        message: "配置导出成功 " + fileName
                    })  
                }
            }
            xhr.responseType = "arraybuffer";
            xhr.send();
        } catch(err){
            
        }
        
    }

    /*
    *  Config Import Into ETCD
    *
    */
    configImport(file,key) {
        let rtn = 0;

        let fm = new FormData();
        fm.append("uploadfile", file);
        //fm.append("key", key);

        jQuery.ajax({
            url: '/config/import',
            type: 'POST',
            dataType: 'json',
            async: false,
            data: fm,
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            beforeSend: function(xhr) {
                // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("导入成功：" + file.name + " " + moment().format("LLL"));
                }
        
            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("导入失败：" + file.name + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        })
        return rtn;
    }

}

var configHandler = new ConfigHandler();