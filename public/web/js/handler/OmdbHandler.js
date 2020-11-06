/*
        ####### ######        # #######  #####  #######    ######     #    #######    #
        #     # #     #       # #       #     #    #       #     #   # #      #      # #
        #     # #     #       # #       #          #       #     #  #   #     #     #   #
        #     # ######        # #####   #          #       #     # #     #    #    #     #
        #     # #     # #     # #       #          #       #     # #######    #    #######
        #     # #     # #     # #       #     #    #       #     # #     #    #    #     #
        ####### ######   #####  #######  #####     #       ######  #     #    #    #     #
 */

class OmdbHandler  {

    constructor(){

    }

    /*
    *   类管理
    *
    *   树
    *
    *
    * */
    classList(event){
        let rtn = null;
        
        // Pace.restart();

        jQuery.ajax({
            url: "/mxobject/schema/class/list",
            dataType: 'json',
            type: 'GET',
            data: {
                id: event
            },
            async: false,
            beforeSend:function(xhr){
                
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if (!_.isEmpty(data.message)){
                    rtn = data.message;
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        })
        return rtn;
    };

    async classListAsync(event){
        let rtn = null;
        
        try{

            await jQuery.ajax({
                url: "/mxobject/schema/class/list",
                dataType: 'json',
                type: 'GET',
                data: {
                    id: event
                },
                async: true,
                beforeSend(xhr){
                    
                },
                complete(xhr, textStatus) {
                },
                success(data, textStatus, xhr) {

                    userHandler.ifSignIn(data);

                    if (!_.isEmpty(data.message)){
                        rtn = data.message;
                    }
                },
                error(xhr, textStatus, errorThrown) {
                    rtn = xhr.responseText;
                }
            })
        } catch(err){

        }

        return rtn;
    };

    /*
    *   类管理
    *
    *   树
    *
    *
    * */
    classListField(event){
        let rtn = null;
        
        // Pace.restart();

        jQuery.ajax({
            url: "/mxobject/schema/class/fields?id="+event,
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if (!_.isEmpty(data.message)){
                    rtn = data.message;
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        })
        return rtn;
    };

    /*
    *   类管理
    *
    *   树
    *
    *
    * */
    classTree(event){
        let rtn = null;
        
        jQuery.ajax({
            url: "/mxobject/schema/class/tree",
            dataType: 'json',
            type: 'GET',
            data: {
                id: event
            },
            async: false,
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if (!_.isEmpty(data.message)){
                    rtn = data.message;
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        })
        return rtn;
    };

    /*
    *   类管理
    *
    *   树 迭代实现 不建议使用
    *
    *
    * */
    classAllList(cid,data){
        
        var rtn = omdbHandler.classList(cid)[0];
        
        if(rtn.child){
            
            data.push(rtn);

            _.forEach(rtn.child, function(v){
                omdbHandler.classAllList(v,data);
            })

        } else {
            data.push(rtn);
        }
    }
   
    /*
    *   类管理
    *
    *   新建
    *
    *
    * */
    classNew(event) {
        let rtn = 0;

        jQuery.ajax({
            url: "/mxobject/schema/class",
            dataType: 'json',
            type: 'POST',
            async: false,
            data: {
                classinfo: JSON.stringify(event)
            },
            beforeSend:function(xhr){
                
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("Success" + " " + event.name + " " + moment().format("LLL"));
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("Failed" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        });
        return rtn;
    }


    /*
    *   类管理
    *
    *   删除
    *
    *
    * */
    classDelete(event){
        let rtn = 0;

        jQuery.ajax({
            url: "/mxobject/schema/class?cid=" + event,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("Success" + " " + event + " " + moment().format("LLL"));
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("Failed" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        })
        return rtn;
    };

    /*
    *   获取类的信息并生成tree
    *
    *       参数：
    *           ftype
    *           parent
    *           field
    */
    fetchSubClass(parent){
        let rtn = null;

        let cond = `#${parent}/ | print id,class,alias`;

        jQuery.ajax({
            url: "/mxobject/search",
            dataType: 'json',
            type: 'POST',
            async: false,
            data: {
                cond: cond,
                meta: true
            },
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if (_.isEmpty(data.message)) return false;

                rtn = data.message[0].tree;

            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        });

        return rtn;
    }

    /*
    *   获取当前class属性
    *
    *       参数：
    *           class
    */
    fetchClass(param) {
        let rtn = null;

        jQuery.ajax({
            url: '/mxobject/schema/class',
            type: 'GET',
            dataType: 'json',
            async: false,
            data: {
                class: param
            },
            beforeSend: function(xhr) {
                // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                rtn = data;
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;
    };

    /*
    *   对象数据管理
    *
    *       参数：
    *           data：更新JSON
    *           ctype: insert/update
    */
    putDataToClass(param) {
        let rtn = 0;


        jQuery.ajax({
            url: '/mxobject/actiontoclass',
            type: 'POST',
            dataType: 'json',
            async: false,
            data: {
                data: JSON.stringify(param),
                ctype: "insert"
            },
            beforeSend: function(xhr) {
                // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) === "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + moment().format("LLL"));
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
    *  调用MQL，不建议使用！！！
    *
    *    参数：
    *      mql
    */
    putDataByMql(event) {
        let rtn = 0;
        let _mql = `INSERT JSON '` + JSON.stringify(event) + `'`;

        jQuery.ajax({
            url: "/mxobject/mql",
            dataType: 'json',
            type: 'POST',
            async: false,
            data: {
                mql: _mql
            },
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("插入成功" + " " + moment().format("LLL"));
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                alertify.error("插入失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;
    };

    /*
    *   一键搜索
    *
    *       参数：
    *           cond：一键搜索语法及搜索关键字
    */
    fetchData(param) {
        let rtn = null;

        jQuery.ajax({
            url: '/mxobject/search',
            type: 'POST',
            dataType: 'json',
            async: false,
            data: {
                cond: param,
                meta: true
            },
            beforeSend: function(xhr) {
                // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        });

        return rtn;
    };

    /*
    *   执行MQL
    *
    *       参数：
    *           mql
    */
    fetchDataByMql(param) {

        let rtn = null;
        
        jQuery.ajax({
            url: "/mxobject/mql",
            dataType: 'json',
            type: 'POST',
            async: false,
            data: {
                mql: param,
                meta: true
            },
            beforeSend:function(xhr){
                
            },
            complete: function(xhr, textStatus) {
                auditLogHandler.writeLog("omdb:console", "Execute mql: " + param, 0);
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                // MQL for CRUD
                if(_.lowerCase(data.status) == "ok"){
                    rtn = data;
                }

            },
            error: function(xhr, textStatus, errorThrown){
                
                if(xhr.status){
                    rtn = xhr.responseJSON;
                } else{
                    $("body").css("opacity",'.3');
                    alert("Internal Server Error（500)");
                }

                auditLogHandler.writeLog("omdb:console", "Execute mql: " + param, 1);
            }
        });

        return rtn;
    };

    async fetchDataByMqlAsync(param) {

        let rtn = null;
        
        try {
            await jQuery.ajax({
                url: "/mxobject/mql",
                dataType: 'json',
                type: 'POST',
                async: true,
                data: {
                    mql: param,
                    meta: true
                },
                beforeSend(xhr){
                    
                },
                complete(xhr, textStatus) {
                    
                },
                success(data, status) {

                    userHandler.ifSignIn(data);

                    // MQL for CRUD
                    if(_.lowerCase(data.status) == "ok"){
                        rtn = data;

                        auditLogHandler.writeLog("omdb:console", "Execute mql: " + param, 0);
                    }

                },
                error(xhr, textStatus, errorThrown){
                    
                    if(xhr.status){
                        rtn = xhr.responseJSON;
                    } else{
                        $("body").css("opacity",'.3');
                        alert("Internal Server Error（500)");
                    }

                    auditLogHandler.writeLog("omdb:console", "Execute mql: " + param, 1);
                }
            });
        } catch(err){

        }

        return rtn;
    };

    /*
    *   导出DDL
    *
    *       参数：
    *           mql
    */
   async classToDDLAsync(param) {

    let rtn = null;
    try{
        await jQuery.ajax({
            url: `/mxobject/export?recursive=false&filetype=mql&class=${encodeURIComponent(param)}&limit=0`,
            dataType: 'json',
            type: 'GET',
            async: true,
            beforeSend(xhr){
                // Pace.restart();
            },
            complete(xhr, textStatus) {
                auditLogHandler.writeLog("omdb:console", "Export ddl: " + param, 0);
            },
            success(data, status) {

                userHandler.ifSignIn(data);

                if(_.lowerCase(data.status) == "ok"){
                    rtn = data;
                }

            },
            error(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
                auditLogHandler.writeLog("omdb:console", "Export ddl: " + param, 1);
            }
        });
    } catch(err){

    }

    return rtn;
};



    /*
    *   类数据导出
    *
    * */
    classDataExport(event){
        let rtn = 1;

        let fileName = `${window.location.host}_${window.COMPANY_OSPACE}_${_.last(event.class.split("/"))}_${moment().format("YYYY-MM-DD HH:mm:SS")}.${event.filetype}`;

        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `/mxobject/export?recursive=true&relation_defined=${event.ifRelation}&filetype=${event.filetype}&template=${event.template}&class=${encodeURIComponent(event.class)}&ignoreclass=${encodeURIComponent(event.ignoreClass)}&limit=${event.limit}`, true);
            xhr.setRequestHeader("Content-type","text/csv");
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var blob = new Blob([xhr.response], event.filetype=='mql'?{type: "octet/stream"}:{type: "application/vnd.ms-excel"});
                    saveAs(blob, fileName);
                    alertify.success("导出成功" + " " + fileName);
                    auditLogHandler.writeLog("omdb:console", "Export class data: " + event.class, 0);
                }
            }
            xhr.responseType = "arraybuffer";
            xhr.send();
        } catch(err){
            rtn = 0;
            auditLogHandler.writeLog("omdb:console", "Export class data: " + event.class, 1);
        }

        return rtn;
    };

    async classDataExportAsync(event){
        let rtn = null;

        await axios.get(`/mxobject/export?recursive=true&relation_defined=${event.ifRelation}&filetype=${event.filetype}&template=${event.template}&class=${encodeURIComponent(event.class)}&ignoreclass=${encodeURIComponent(event.ignoreClass)}&limit=${event.limit}`,{
            headers: {
                "Content-type":"text/csv",
                "Access-Control-Allow-Origin":"*"
            },
            responseType:"arraybuffer"
        })
        .then((response)=> {
            let blob = new Blob([response.data], event.filetype=='mql'?{type: "octet/stream"}:{type: "application/vnd.ms-excel"});
            let fileName = `${window.location.host}_${window.COMPANY_OSPACE}_${_.last(event.class.split("/"))}_${moment().format("YYYY-MM-DD HH:mm:SS")}.${event.filetype}`;

            saveAs(blob, fileName);

            rtn = 1;

            // audit log
            auditLogHandler.writeLog("omdb:console", "Export class data: " + event.class, 0);
        })
        .catch((error)=> {
            rtn = error;
            // audit log
            auditLogHandler.writeLog("omdb:console", "Export class data: " + event.class, 1);
        });

        return rtn;
    };

    /*
    *   类数据导入
    *
    * */
   classDataImport(file){
        let rtn = null;

        try{
            let fm = new FormData();
            fm.append("uploadfile", file);

            jQuery.ajax({
                url: '/mxobject/import',
                dataType: 'json',
                type: 'POST',
                data: fm,
                mimeType: "multipart/form-data",
                async: false,
                processData:false,
                contentType: false,
                beforeSend(xhr){
                    
                },
                complete(xhr, textStatus) {
                },
                success(data, textStatus, xhr) {

                    userHandler.ifSignIn(data);

                    if( _.lowerCase(data.status) == "ok"){
                        rtn = 1;
                        
                        // audit log
                        auditLogHandler.writeLog("omdb:console", "Import class data: " + file.name, 0);
                    }

                },
                error(xhr, textStatus, errorThrown) {
                    rtn = xhr.responseText;

                    // audit log
                    auditLogHandler.writeLog("omdb:console", "Import class data: " + file.name, 1);
                }
            })
        } catch(err){

        }

        return rtn;
    };

    async classDataImportAsync(file){
        let rtn = null;

        try{
            let fm = new FormData();
            fm.append("uploadfile", file);

            await jQuery.ajax({
                url: '/mxobject/import',
                dataType: 'json',
                type: 'POST',
                data: fm,
                mimeType: "multipart/form-data",
                async: true,
                processData:false,
                contentType: false,
                beforeSend(xhr){
                    
                },
                complete(xhr, textStatus) {
                },
                success(data, textStatus, xhr) {

                    userHandler.ifSignIn(data);

                    if( _.lowerCase(data.status) == "ok"){
                        rtn = 1;
                        
                        // audit log
                        auditLogHandler.writeLog("omdb:console", "Import class data: " + file.name, 0);
                    }

                },
                error(xhr, textStatus, errorThrown) {
                    rtn = xhr.responseText;

                    // audit log
                    auditLogHandler.writeLog("omdb:console", "Import class data: " + file.name, 1);
                }
            })
        } catch(err){

        }

        return rtn;
    };

}

var omdbHandler = new OmdbHandler();