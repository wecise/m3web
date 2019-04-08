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
        let loading = null;

        jQuery.ajax({
            url: "/mxobject/schema/class/list",
            dataType: 'json',
            type: 'GET',
            data: {
                id: event
            },
            async: false,
            beforeSend:function(xhr){
                loading = layer.load(2, {
                    shade: [0.1,'#ccc'],
                    time: 30*1000
                });
            },
            complete: function(xhr, textStatus) {
                layer.close(loading);
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if (!_.isEmpty(data.message)){
                    rtn = data.message;
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                layer.close(loading);
                console.log(errorThrown);
            }
        })
        return rtn;
    };

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
                mxLog.warn("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
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
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
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

        let _cond = {
            ftype: "class",
            parent: parent
        };

        jQuery.ajax({
            url: "/mxobject/search",
            dataType: 'json',
            type: 'POST',
            async: false,
            data: {
                cond: `call tree ` + JSON.stringify(_cond),
                meta: true
            },
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if (_.isEmpty(data.message)) return false;

                rtn = data.message[0].tree;

            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
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

        jQuery.ajax({
            url: '/mxobject/export?recursive=true&class=' + encodeURIComponent(event),
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);
                
                if( _.lowerCase(data.status) == "ok"){
                    rtn = data;
                    alertify.success("导出成功" + " " + event + " " + moment().format("LLL"));
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = null;
                alertify.error("导出失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        })
        return rtn;
    };

    /*
    *   类数据导出
    *
    * */
   classDataImport(event){
        let rtn = 0;

        let fm = new FormData();
        fm.append("uploadfile", event);

        jQuery.ajax({
            url: '/mxobject/import',
            dataType: 'json',
            type: 'POST',
            data: fm,
            mimeType: "multipart/form-data",
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("导入成功" + " " + event + " " + moment().format("LLL"));
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("导入失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        })
        return rtn;
    };

}

var omdbHandler = new OmdbHandler();