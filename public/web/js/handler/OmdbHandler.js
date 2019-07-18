/*
        ####### ######        # #######  #####  #######    ######     #    #######    #
        #     # #     #       # #       #     #    #       #     #   # #      #      # #
        #     # #     #       # #       #          #       #     #  #   #     #     #   #
        #     # ######        # #####   #          #       #     # #     #    #    #     #
        #     # #     # #     # #       #          #       #     # #######    #    #######
        #     # #     # #     # #       #     #    #       #     # #     #    #    #     #
        ####### ######   #####  #######  #####     #       ######  #     #    #    #     #
 */

class OmdbHandler {
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
        
        Pace.restart();

        jQuery.ajax({
            url: "/mxobject/schema/class/list",
            dataType: 'json',
            type: 'GET',
            data: {
                id: event
            },
            async: false,
            beforeSend:function(xhr){
                Pace.restart();
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
    classListField(event){
        let rtn = null;
        
        Pace.restart();

        jQuery.ajax({
            url: "/mxobject/schema/class/fields?id="+event,
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend:function(xhr){
                Pace.restart();
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
                Pace.restart();
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
                Pace.restart();
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
                Pace.restart();
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
                Pace.restart();
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
                Pace.restart();
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
                Pace.restart();
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
                Pace.restart();
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
                Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseJSON;
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
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
                Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                // MQL for CRUD
                if(_.lowerCase(data.status) == "ok"){
                    rtn = data;
                    alertify.success("成功" + " " + moment().format("LLL"));
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
                alertify.error("失败" + " " + moment().format("LLL") + " " +  xhr.responseText);
            }
        });

        return rtn;
    };

    /*
    *   类数据导出
    *
    * */
    classDataExport(event){
        let rtn = null;

        let fileName = `${window.location.host}_${window.COMPANY_OSPACE}_${_.last(event.split("/"))}_${moment().format("YYYY-MM-DD HH:mm:SS")}.mql`;

        Pace.restart();

        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `/mxobject/export?recursive=true&class=${encodeURIComponent(event)}&limit=-1`, true);
            xhr.setRequestHeader("Content-type","text/csv");
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var blob = new Blob([xhr.response], {type: "octet/stream"});
                    saveAs(blob, fileName);
                    alertify.success("导出成功" + " " + fileName);
                    rtn = 1;
                }
            }
            xhr.responseType = "arraybuffer";
            xhr.send();
        } catch(err){
            
        }
        return rtn;
    };

    /*
    *   类数据导入
    *
    * */
   classDataImport(file){
        let rtn = 0;

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
            beforeSend:function(xhr){
                Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("导入成功" + " " + file.name + " " + moment().format("LLL"));
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("导入失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        })
        return rtn;
    };


    /*
    *   类数据导出为excel
    *
    * */
    classTemplateExportToExcel(event){
        let rtn = null;

        let fileName = `${window.location.host}_${window.COMPANY_OSPACE}_实体模板_${moment().format("YYYY-MM-DD HH:mm:SS")}.xlsx`;

        Pace.restart();

        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `/mxobject/export?recursive=true&filetype=xlsx&templdate=true&class=${event}`, true);
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "*/*");
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var blob = new Blob([xhr.response], {type: "application/vnd.ms-excel"});
                    saveAs(blob, fileName);
                    alertify.success("导出成功" + " " + fileName);
                    rtn = 1;
                }
            }
            xhr.responseType = "arraybuffer";
            xhr.send();
        } catch(err){
            
        }
        return rtn;

    }
     /*
    *   类数据从excel导入
    *
    * */
    classDataImportFromExcel(file){
    
        let rtn = null;

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
            beforeSend:function(xhr){
                Pace.restart();
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
        })
        return rtn;
        
    }

}

var omdbHandler = new OmdbHandler();