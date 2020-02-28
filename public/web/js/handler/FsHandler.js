/*
        ####### ### #       #######     #####  #     #  #####  ####### ####### #     #
        #        #  #       #          #     #  #   #  #     #    #    #       ##   ##
        #        #  #       #          #         # #   #          #    #       # # # #
        #####    #  #       #####       #####     #     #####     #    #####   #  #  #
        #        #  #       #                #    #          #    #    #       #     #
        #        #  #       #          #     #    #    #     #    #    #       #     #
        #       ### ####### #######     #####     #     #####     #    ####### #     #

 */

class FsHandler {

    constructor(){

    }

    /*
    *   文件系统
    *
    *   检查是否存在
    *
    *   参数：
    *
    *
    */
    fsCheck(path, name){
        let rtn = null;

        let parent = path.replace(/\/\//g,'/');
        let _url = `/fs${parent}/${name}?type=check`;

        if(window.SignedUser_IsAdmin){
            _url += '&issys=true';
        }

        jQuery.ajax({
            url: _url,
            type: 'GET',
            dataType: "json",
            data: {},
            async:false,
            beforeSend: function(xhr) {
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = data.message;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn=xhr.responseJSON;
            }
        })

        return rtn;
    };

    /*
    *   文件系统
    *
    *   提交到
    *
    *   参数：
    *       文件名称
    *       扩展名
    *
    */
    fsNew(ftype, path, name, content, attr){
        let rtn = null;

        let parent = path.replace(/\/\//g,'/');
        let _url = `/fs${parent}/${name}`;

        if(window.SignedUser_IsAdmin){
            _url += '?issys=true';
        }

        let fm = new FormData();

        fm.append("data", content);
        fm.append("type", ftype);
        fm.append("attr", JSON.stringify(attr));

        jQuery.ajax({
            url: _url,
            type: 'PUT',
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data;',
            dataType: "json",
            data: fm,
            async:false,
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
                rtn = xhr.responseJSON;
            }
        })

        return rtn;
    };


    /*
    *   文件系统
    *
    *   获取文件列表
    *
    *   参数：
    *       父目录
    *       文件名称
    */
    fsList(path){
        let rtn = null;
        let _issys = false;
        let parent = path.replace(/\/\//g,'/');

        if(window.SignedUser_IsAdmin){
            _issys = true;
        }

        let url = `/fs${parent}`.replace(/\/fs\/fs/,"/fs");

        jQuery.ajax({
            url: url,
            type: 'GET',
            dataType: 'text json',
            contentType: "application/text; charset=utf-8",
            data: {
                type: 'dir',
                issys: _issys
            },
            async:false,
            beforeSend: function(xhr) {
                // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if (_.isEmpty(data.message)) return false;

                rtn = data.message;

            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON);
            }
        });

        return rtn;
    };

    /*
    *   文件系统
    *
    *   删除
    *
    *   参数：
    *       文件名称
    *       扩展名
    *
    */
    fsDelete(path,name){
        let rtn = null;
        let parent = path.replace(/\/\//g,'/');
        let _url = `/fs${parent}/${name}`;

        if(window.SignedUser_IsAdmin){
            _url += '?issys=true';
        }

        jQuery.ajax({
            url: _url,
            type: 'DELETE',
            dataType: 'text json',
            contentType: "application/text; charset=utf-8",
            async: false,
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
                rtn = xhr.responseJSON;
            }
        })

        return rtn;
    };


    /*
    *   文件系统
    *
    *   获取文件内容
    *
    *      参数：
    *           父目录
    *           文件名称
    */
    fsContent(path,name){
        let rtn = null;

        let parent = path.replace(/\/\//g,'/');
        let _url = `/fs${parent}/${name}`;

        if(window.SignedUser_IsAdmin){
            _url += '?issys=true';
        }

        jQuery.ajax({
            url: _url,
            type: 'GET',
            contentType: "application/text; charset=utf-8",
            dataType: 'text json',
            async:false,
            data: {
                type: 'file'
            },
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if (_.isEmpty(data.message)) return false;

                rtn = data.message;

            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseText);
            }
        })

        return rtn;
    };
    

    /*
    *   文件系统
    *
    *   更改文件名
    *
    *
    */
    fsRename(srcpath,dstpath){
        let rtn = null;

        let _issys = false;

        /*if(_.startsWith(dstpath,'/extend') || _.startsWith(dstpath,'/script') || _.startsWith(dstpath,'/app') || _.isEqual(dstpath,'/')){
            _issys = true;
        }*/

        if(window.SignedUser_IsAdmin){
            _issys = true;
        }

        // Root
        srcpath = srcpath.replace(/\/\//g,'/');
        dstpath = dstpath.replace(/\/\//g,'/');

        if(_.lastIndexOf(srcpath,"/") === 0){
            _issys = true;
        }

        jQuery.ajax({
            url: `/fs/rename?issys=${_issys}`,
            type: 'POST',
            dataType: 'json',
            async:false,
            data: {
                srcpath: srcpath,
                dstpath: dstpath
            },
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseJSON;
            }
        })

        return rtn;
    };

    /*
    *   文件系统
    *
    *   复制文件
    *
    *
    */
    fsCopy(srcpath,dstpath){
        let rtn = 0;

        let _issys = false;

        // Root
        srcpath = srcpath.replace(/\/\//g,'/');
        dstpath = dstpath.replace(/\/\//g,'/');

        /*if(_.startsWith(dstpath,'/extend') || _.startsWith(dstpath,'/script') || _.startsWith(dstpath,'/app') || _.isEqual(dstpath,'/')){
            _issys = true;
        }*/

        if(window.SignedUser_IsAdmin){
            _issys = true;
        }

        jQuery.ajax({
            url: `/fs/copy?issys=${_issys}`,
            type: 'POST',
            dataType: 'json',
            async:false,
            data: {
                srcpath: srcpath,
                dstpath: dstpath
            },
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("复制成功" + " " + srcpath);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("复制失败" + " " + xhr.responseJSON);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        })

        return rtn;
    };


    /*
    *   文件系统
    *
    *   移动文件
    *
    *
    */
    fsMove(srcpath,dstpath){
        let rtn = 0;

        let _issys = false;

        // Root
        srcpath = srcpath.replace(/\/\//g,'/');
        dstpath = dstpath.replace(/\/\//g,'/');

        if(window.SignedUser_IsAdmin){
            _issys = true;
        }
        
        jQuery.ajax({
            url: `/fs/move?issys=${_issys}`,
            type: 'POST',
            dataType: 'json',
            async: false,
            data: {
                srcpath: srcpath,
                dstpath: dstpath
            },
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("移动失败" + " " + xhr.responseJSON);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        })

        return rtn;
    };


    /*
    *   文件系统
    *
    *   更新属性
    *
    *
    */
    fsUpdateAttr(path, name, attr) {
        let rtn = null;

        let parent = path.replace(/\/\//g,'/');
        let _url = `/fs${parent}/${name}?type=attr`;

        if(window.SignedUser_IsAdmin){
            _url += '&issys=true';
        }

        jQuery.ajax({
            url: _url,
            dataType: 'json',
            type: 'PUT',
            data: {
                attr: JSON.stringify(attr)
            },
            async:false,
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseJSON;
            }
        })

        return rtn;
    };

    /*
    *   文件系统
    *
    *   创建临时文件
    *
    *
    */
    fsTemp(ftype, name, content, attr){
        let rtn = null;

        let _tmp = fsHandler.fsNew(ftype, `/home/${window.SignedUser_UserName}/temp`, name, content, attr);

        if(_tmp === 1){
            rtn = `/home/${window.SignedUser_UserName}/temp/${name}`;
        }

        return rtn;
    };


    /*
    *   文件系统
    *
    *   打包zip
    *
    *
    */
    fsZip(srcpath){
        let rtn = 0;

        let _issys = false;

        let _srcpath = srcpath.replace(/\/\//g,'/');

        let fileName = `${window.location.host}_${window.COMPANY_OSPACE}_${_.last(srcpath.split("/"))}_${moment().format("YYYY-MM-DD HH:mm:SS")}.zip`;

        if(window.SignedUser_IsAdmin){
            _issys = true;
        }

        // Pace.restart();

        try {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", `/fs/export?issys=${_issys}&srcpath=${_srcpath}`, true);
            xhr.setRequestHeader("Content-type","application/zip");
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
    *   文件系统
    *
    *   解压zip
    *
    *
    */
    fsUnZip(srcpath, zippack){
        let rtn = 0;

        let _issys = false;

        let _srcpath = srcpath.replace(/\/\//g,'/');

        if(window.SignedUser_IsAdmin){
            _issys = true;
        }

        var form = new FormData();
        form.append("uploadfile", zippack); // file

        jQuery.ajax({
            url: `/fs/import?issys=${_issys}`,
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            dataType: 'json',
            type: 'POST',
            data: form,
            async: true,
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("解压成功" + srcpath);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("解压失败" + xhr);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON);
            }
        })

        return rtn;
    };

    /*
    *   文件系统
    *
    *   文件解析
    *
    *
    */
    fsParse(rule, file){
        let rtn = 0;

        let _issys = false;

        if(window.SignedUser_IsAdmin){
            _issys = true;
        }

        var form = new FormData();
        form.append("uploadfile", zippack); // file

        jQuery.ajax({
            url: `/action/parsefile?$issys=${_issys}`,
            dataType: 'json',
            type: 'GET',
            data: {
                rule:'/matrix/devops/event', 
                filename:'/home/admin/test.csv'
            },
            async: true,
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("文件解析成功" + srcpath);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("文件解析失败" + xhr);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON);
            }
        })

        return rtn;
    };

    genFsUrl(item,cfg,data){

        let app = function(ext,action){
            let list = _.groupBy(mx.global.register.file,'value');
            return list[ext][0][action];
        };

        let _cfg = _.extend({ header:false, sidebar:false, footbar:false },cfg);

        let _data = (data!=null)?`&data=${window.btoa(encodeURIComponent(data))}`:'';

        let url = app(item.ftype,item.action) + `?item=${window.btoa(encodeURIComponent(JSON.stringify(item)))}&cfg=${window.btoa(encodeURIComponent(JSON.stringify(_cfg)))}${_data}`;

        return url;
    };

    /*
    *   Server端脚本调用
    *
    *       参数：
    *
    */
    callFsJScript(name,term){

        let rtn = null;

        // 打标签
        if(_.endsWith(name,'tag_service.js')){
            let system = window.location.pathname.replace(/\/janesware\//,'');
            term = encodeURIComponent(JSON.stringify(_.merge(JSON.parse(decodeURIComponent(term)), {
                system:system,
                user:window.SignedUser_UserName
            })));
        }

        jQuery.ajax({
            url: `/script/exec/js?input=${term}&isfile=true`,
            type: "POST",
            data: name,
            async: false,
            dataType: 'json',
            contentType: false,
            beforeSend: function(xhr) {
                // 忽略
                if(!_.includes(term,'aiStatusGet')){
                    // Pace.restart();
                }
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

    callFsJScriptAsync(name,term){

        let rtn = null;

        // 打标签
        if(_.endsWith(name,'tag_service.js')){
            let system = window.location.pathname.replace(/\/janesware\//,'');
            term = encodeURIComponent(JSON.stringify(_.merge(JSON.parse(decodeURIComponent(term)), {
                system:system,
                user:window.SignedUser_UserName
            })));
        }

        jQuery.ajax({
            url: `/script/exec/js?input=${term}&isfile=true`,
            type: "POST",
            data: name,
            async: true,
            dataType: 'json',
            contentType: false,
            beforeSend: function(xhr) {
                // 忽略
                if(!_.includes(term,'aiStatusGet')){
                    // Pace.restart();
                }
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
    *   获取一个文件内容
    *
    *       参数：
    *          url
    */
    fetchFile(url) {

        let rtn = null;

        jQuery.ajax({
            url: url,
            async:false,
            beforeSend: function(xhr) {
                // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                userHandler.ifSignIn(data);

                rtn = data.data;
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;

    };
}

var fsHandler = new FsHandler();