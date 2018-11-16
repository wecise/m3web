/*
        ####### ### #       #######     #####  #     #  #####  ####### ####### #     #
        #        #  #       #          #     #  #   #  #     #    #    #       ##   ##
        #        #  #       #          #         # #   #          #    #       # # # #
        #####    #  #       #####       #####     #     #####     #    #####   #  #  #
        #        #  #       #                #    #          #    #    #       #     #
        #        #  #       #          #     #    #    #     #    #    #       #     #
        #       ### ####### #######     #####     #     #####     #    ####### #     #

 */

"use strict";

/*
*   文件系统
*
*   检查是否存在
*
*   参数：
*
*
*/
var fsCheck = function(path, name){
    let rtn = false;

    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}?type=check`;

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
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
var fsNew = function(ftype, path, name, content, attr){
    let rtn = 0;

    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}`;

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
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
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("创建成功 " + name + " " + moment().format("LLL"));
            } else {
                rtn = 0;
                alertify.error("创建失败 " + name + " " + moment().format("LLL"));
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
*   获取文件列表
*
*   参数：
*       父目录
*       文件名称
*/
var fsList = function(path){
    let rtn = null;
    let _issys = false;
    let parent = path.replace(/\/\//g,'/');

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
        _issys = true;
    }

    jQuery.ajax({
        url: '/fs' + parent,
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
var fsDelete = function(path,name){
    let rtn = 0;
    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}`;

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
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
var fsContent = function(path,name){
    let rtn = null;

    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}`;

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
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
var fsRename = function(srcpath,dstpath){
    let rtn = 0;

    let _issys = false;

    if(_.startsWith(dstpath,'/extend') || _.startsWith(dstpath,'/script') || _.startsWith(dstpath,'/app') || _.isEqual(dstpath,'/')){
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
            } else {
                rtn = 0;
                alertify.error("编辑失败" + " " + data.message);
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
var fsCopy = function(srcpath,dstpath){
    let rtn = 0;

    let _issys = false;

    // Root
    srcpath = srcpath.replace(/\/\//g,'/');
    dstpath = dstpath.replace(/\/\//g,'/');

    if(_.startsWith(dstpath,'/extend') || _.startsWith(dstpath,'/script') || _.startsWith(dstpath,'/app') || _.isEqual(dstpath,'/')){
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
var fsMove = function(srcpath,dstpath){
    let rtn = 0;

    let _issys = false;

    // Root
    srcpath = srcpath.replace(/\/\//g,'/');
    dstpath = dstpath.replace(/\/\//g,'/');

    if(_.startsWith(dstpath,'/extend') || _.startsWith(dstpath,'/script') || _.startsWith(dspath,'/app') || _.isEqual(dstpath,'/')){
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
                alertify.success("移动成功" + " " + srcpath);
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
*   更新属性
*
*
*/
var fsUpdateAttr = function(path, name, attr) {
    let rtn = 0;

    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}?type=attr`;

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.startsWith(parent,'/app') || _.isEqual(parent,'/')){
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
            } else {
                rtn = 0;
                alertify.error("编辑失败" + " " + parent + "/" + name);
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
*   创建临时文件
*
*
*/
var fsTemp = function(ftype, name, content, attr){
    let rtn = null;


    let _tmp = fsNew(ftype, '/home/temp', name, content, attr);

    if(_tmp === 1){
        rtn = `/home/temp/${name}`;
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
var fsZip = function(srcpath){
    let rtn = 0;

    let _issys = false;

    let _srcpath = srcpath.replace(/\/\//g,'/');

    if(_.startsWith(_srcpath,'/extend') || _.startsWith(_srcpath,'/script') || _.startsWith(_srcpath,'/app') || _.isEqual(_srcpath,'/')){
        _issys = true;
    }

    let fm = new FormData();
    fm.append("srcpath", _srcpath);

    let stringToArrayBuffer = function (str) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);

        for (var i=0, strLen=str.length; i<strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }

        return buf;
    };

    let xhr = new XMLHttpRequest();
    let params = fm;

    xhr.open('POST', `/fs/export?issys=${_issys}`, false);

    xhr.onload = function() {

        if (xhr.status === 200) {
            let a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response);
            // Give filename you wish to download
            a.download = "temp.zip";
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
        } else {
            console.log('Something bad happen!\n(' + xhr.status + ') ' + xhr.statusText);
        }
    };






    xhr.send(params);



    var form = new FormData();
    form.append("srcpath", _srcpath);

    /*jQuery.ajax({
        url: `/fs/export?issys=${_issys}`,
        type: 'POST',
        processData: false,
        contentType: false,
        mimeType: 'multipart/form-data',
        data: form,
        async:true,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, textStatus, xhr) {

            ifSignIn(data);

            /!*let filename = "";
            let disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                    try {
                        let isFileSaverSupported = !!new Blob;
                        console.log(typeof data,_.size(data))
                        var zip = new JSZip();
                        zip.generateAsync({type:"blob"}).then(function(zip) {
                            saveAs(zip, filename);
                        });

                    } catch (e) {

                    }

                }
            }*!/

            var filename = "";
            var disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
            }

            var type = xhr.getResponseHeader('Content-Type');
            var blob = new Blob([data], { type: type });

            console.log(blob)

            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                window.navigator.msSaveBlob(blob, filename);
            } else {
                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);

                if (filename) {
                    // use HTML5 a[download] attribute to specify filename
                    var a = document.createElement("a");
                    // safari doesn't support this yet
                    if (typeof a.download === 'undefined') {
                        window.location = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                    }
                } else {
                    window.location = downloadUrl;
                }

                console.log(downloadUrl)

                setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
            }


        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            alertify.log("导出失败");
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON);
        }
    })*/

    return rtn;
};


/*
*   文件系统
*
*   解压zip
*
*
*/
var fsUnZip = function(srcpath, zippack){
    let rtn = 0;

    let _issys = false;

    let _srcpath = srcpath.replace(/\/\//g,'/');

    if(_.startsWith(_srcpath,'/extend') || _.startsWith(_srcpath,'/script') || _.startsWith(_srcpath,'/app') || _.isEqual(_srcpath,'/')){
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
        async:false,
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


var genFsUrl = function(item,cfg){

    let app = function(ext,action){
        let list = {
                    "imap":  {
                        "edit": "/web/vendor/mxgraph/graph/index.html",
                        "run": "/janesware/imap"
                    },
                    "iflow": {
                        "edit": "/web/vendor/mxgraph/graph/index.html",
                        "run": "/janesware/iflow"
                    },
                    "ishow": {
                        "edit": "/web/vendor/mxgraph/graph/index.html",
                        "run": "/janesware/ishow"
                    }
        };
        return list[ext][action];
    };

    let _cfg = _.extend({ header:false, sidebar:false, footbar:false },cfg);

    let url = app(item.ftype,item.action) + `?item=${window.btoa(encodeURIComponent(JSON.stringify(item)))}&cfg=${window.btoa(encodeURIComponent(JSON.stringify(_cfg)))}`;

    return url;
};