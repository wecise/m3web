/*
        ####### ### #       #######     #####  #     #  #####  ####### ####### #     #
        #        #  #       #          #     #  #   #  #     #    #    #       ##   ##
        #        #  #       #          #         # #   #          #    #       # # # #
        #####    #  #       #####       #####     #     #####     #    #####   #  #  #
        #        #  #       #                #    #          #    #    #       #     #
        #        #  #       #          #     #    #    #     #    #    #       #     #
        #       ### ####### #######     #####     #     #####     #    ####### #     #

 */

class Fss {

    constructor() {
    }
    
    init() {
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
        let rtn = false;

        let parent = path.replace(/\/\//g,'/');
        let _url = `/fs${parent}/${name}?type=check`;

        /*if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
            _url += '&issys=true';
        }*/

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

                ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = data.message;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
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
        let rtn = 0;

        let parent = path.replace(/\/\//g,'/');
        let _url = `/fs${parent}/${name}`;

        /*if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
            _url += '?issys=true';
        }*/

        if(window.SignedUser_IsAdmin){
            _url += '?issys=true';
        }

        console.log(_url)

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
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("创建成功 " + name + " " + moment().format("LLL"));
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("创建失败 " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
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

        /*if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
            _issys = true;
        }*/

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
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                ifSignIn(data);

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
        let rtn = 0;
        let parent = path.replace(/\/\//g,'/');
        let _url = `/fs${parent}/${name}`;

        /*if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
            _url += '?issys=true';
        }*/

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
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {

                ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("删除成功" + " " + name);
                } else {
                    rtn = 0;
                    alertify.error("删除失败" + " " + name);
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

        /*if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
            _url += '?issys=true';
        }*/

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
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                ifSignIn(data);

                if (_.isEmpty(data.message)) return false;

                rtn = data.message;

            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
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
        let rtn = 0;

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
            url: '/fs/rename',
            type: 'POST',
            dataType: 'json',
            async:false,
            data: {
                srcpath: srcpath,
                dstpath: dstpath,
                issys: _issys
            },
            beforeSend: function (xhr) {
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("编辑成功" + " " + srcpath);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("编辑失败" + " " + xhr.responseJSON.message);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
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
            url: '/fs/copy',
            type: 'POST',
            dataType: 'json',
            async:false,
            data: {
                srcpath: srcpath,
                dstpath: dstpath,
                issys: window.SignedUser_IsAdmin
            },
            beforeSend: function (xhr) {
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                ifSignIn(data);

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

        /*if(_.startsWith(dstpath,'/extend') || _.startsWith(dstpath,'/script') || _.startsWith(dstpath,'/app') || _.isEqual(dstpath,'/')){
            _issys = true;
        }*/

        if(window.SignedUser_IsAdmin){
            _issys = true;
        }

        jQuery.ajax({
            url: '/fs/move',
            type: 'POST',
            dataType: 'json',
            async:false,
            data: {
                srcpath: srcpath,
                dstpath: dstpath,
                issys: _issys
            },
            beforeSend: function (xhr) {
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                ifSignIn(data);

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
        let rtn = 0;

        let parent = path.replace(/\/\//g,'/');
        let _url = `/fs${parent}/${name}?type=attr`;

        /*if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
            _url += '&issys=true';
        }*/

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
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("编辑成功" + " " + parent + "/" + name);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("编辑失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
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


        let _tmp = fsNew(ftype, '/temp', name, content, attr);

        if(_tmp === 1){
            rtn = `/temp/${name}`;
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

        if(window.SignedUser_IsAdmin){
            _issys = true;
        }

        let form = new FormData();
        form.append("srcpath", _srcpath);

        jQuery.ajax({
            url: `/fs/export?issys=${_issys}`,
            type: 'POST',
            dataType: 'binary',
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            data: form,
            async: true,
            beforeSend: function (xhr) {
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                ifSignIn(data);

                let header = xhr.getResponseHeader('Content-Disposition');

                let blob = new Blob([atob(data)], {type: "application/zip;charset=utf-8"});
                FileSaver.saveAs(blob, header.split("=")[1]);

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.log("导出失败 " + xhr.responseJSON);
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON);
            }
        });

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

        /*if(_.startsWith(_srcpath,'/extend') || _.startsWith(_srcpath,'/script') || _.startsWith(_srcpath,'/app') || _.isEqual(_srcpath,'/')){
            _issys = true;
        }*/

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
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, textStatus, xhr) {

                ifSignIn(data);

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

    genFsUrl(item,cfg,data){

        let app = function(ext,action){
            let list = {
                        "imap":  {
                            "edit": "/web/creative/graph/index.html",
                            "run": "/janesware/imap"
                        },
                        "iflow": {
                            "edit": "/web/creative/graph/index.html",
                            "run": "/janesware/iflow"
                        },
                        "ishow": {
                            "edit": "/web/creative/graph/index.html",
                            "run": "/janesware/ishow"
                        },
                        "md": {
                            "edit": "/janesware/md",
                            "run": "/janesware/md"
                        }
            };
            return list[ext][action];
        };

        let _cfg = _.extend({ header:false, sidebar:false, footbar:false },cfg);

        let _data = (data!=null)?`&data=${window.btoa(encodeURIComponent(data))}`:'';

        let url = app(item.ftype,item.action) + `?item=${window.btoa(encodeURIComponent(JSON.stringify(item)))}&cfg=${window.btoa(encodeURIComponent(JSON.stringify(_cfg)))}${_data}`;

        return url;
    };
}

let fs = new Fss();
fs.init();