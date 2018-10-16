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

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.isEqual(parent,'/')){
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

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.isEqual(parent,'/')){
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

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.isEqual(parent,'/')){
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

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.isEqual(parent,'/')){
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

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.isEqual(parent,'/')){
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

    if(_.startsWith(dstpath,'/extend') || _.startsWith(dstpath,'/script') || _.isEqual(dstpath,'/')){
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

    if(_.startsWith(dstpath,'/extend') || _.startsWith(dstpath,'/script') || _.isEqual(dstpath,'/')){
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
            } else {
                rtn = 0;
                alertify.error("复制失败" + " " + srcpath);
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
*   更新属性
*
*
*/
var fsUpdateAttr = function(path, name, attr) {
    let rtn = 0;

    let parent = path.replace(/\/\//g,'/');
    let _url = `/fs${parent}/${name}?type=attr`;

    if(_.startsWith(parent,'/extend') || _.startsWith(parent,'/script') || _.isEqual(parent,'/')){
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

    let _srcpath = srcpath.replace(/\/\//g,'/');

    let fm = new FormData();

    fm.append("srcpath",_srcpath);

    jQuery.ajax({
        url: '/fs/export?issys=true',
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
        type: 'POST',
        data: fm,
        async:false,
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, textStatus, xhr) {

            ifSignIn(data);

            download(data, `fs${srcpath.replace(/\//g,'_')}.zip`, "application/zip");

            if( _.lowerCase(data.status) == "ok"){
                rtn = 1;
                alertify.success("打包成功" + srcpath);
            } else {
                rtn = 0;
                alertify.error("打包失败" + srcpath);
            }

        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON);
        }
    })

    return rtn;
};


/*
*   文件系统
*
*   解压zip
*
*
*/
var fsUnZip = function(zippack){
    let rtn = 0;

    let _srcpath = srcpath.replace(/\/\//g,'/');

    jQuery.ajax({
        url: '/fs/export?issys=true',
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
        dataType: 'json',
        type: 'POST',
        data: {
            uploadfile: zippack
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
                alertify.success("解压成功" + srcpath);
            } else {
                rtn = 0;
                alertify.error("解压失败" + srcpath);
            }

        },
        error: function(xhr, textStatus, errorThrown) {
            rtn = 0;
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })

    return rtn;
};