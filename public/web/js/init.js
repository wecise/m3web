/*
*
*      __  __   ____
*    |  \/  | |__ /
*    | \  / |  |_ \
*    | |\/| | |___/
*    | |  | |
*    |_|  |_|
*
*
*/

"use strict";


/*
        #     # ####### #     # #######
        #     # #     # ##   ## #
        #     # #     # # # # # #
        ####### #     # #  #  # #####
        #     # #     # #     # #
        #     # #     # #     # #
        #     # ####### #     # #######
 */

/*
*   设置Home
*
*   参数：
*       home.html
*
*/
var setDefaultHome = function(name,token){
    let rtn = null;

    jQuery.ajax({
        url: "/user/settings/home",
        type: "POST",
        dataType: "json",
        data: {
            home: name,
            _csrf: token
        },
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            rtn = data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};


/*
        #     # ####### ### #        #####
        #     #    #     #  #       #     #
        #     #    #     #  #       #
        #     #    #     #  #        #####
        #     #    #     #  #             #
        #     #    #     #  #       #     #
         #####     #    ### #######  #####
 */



var getPage = function(){
    let path = window.location.pathname;
    let page = path.split("/").pop();
    return page;
};

var getLicense = function(){

    let _config = _.attempt(JSON.parse.bind(null, `{{.config}}`));

    if(_.isEmpty(_config)){
        $(".license").html("");
    } else {
        $(".license").html(_config.license);
    }
};


var renameKey = function(obj, key, newKey) {

    if(_.includes(_.keys(obj), key)) {
        obj[newKey] = _.clone(obj[key], true);

        delete obj[key];
        delete obj['enum'];
        //delete obj['type'];
    }

    return obj;
};


var columnsParse = function(meta){
    let _columns = null;

    // *

    if(_.isEmpty(meta)) {
        return _columns;
    }

    // meta
    _.forEach(meta.columns, function(v,k){
        _.forEach(v,function(val,key){
            renameKey(val, 'name', 'field');
        })
    })

    return meta.columns;

};




var loadLogo = function () {
    let _logo = '{{.logo}}';

    _logo = _logo.replace(/"/g,"");

    jQuery.ajax({
        url: '/fs/' + _logo,
        type: 'GET',
        contentType: "application/text; charset=utf-8",
        dataType: 'text json',
        data: {
            type: 'file'
        },
        beforeSend:function(xhr){
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            if( _.isEmpty(data.message) ) return false;

        },
        error: function(xhr, textStatus, errorThrown) {
        }
    });
};

/*
*
*
* */
var pathNameGet = function () {
    let _rtn = null;

    let path = window.location.pathname;
    _rtn = path.split("/").pop();

    return _rtn;
}

/*
 *  Load Function
 *
 */
var loadResource = function(filename, filetype, id){

    if (filetype == "js"){
        var fileref = document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    } else if (filetype == "template"){
        var fileref = document.createElement('script')
        fileref.setAttribute("type","text/x-template")
        fileref.setAttribute("id", id)
        $.get( filename, function( data ) {
            $(fileref).html(data);
        });
    } else if (filetype == "css"){
        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref != "undefined"){
        console.log(fileref)
        document.getElementsByTagName("head")[0].appendChild(fileref)
    }
}

/*
 *  Get Url Params
 *
 */
var urlParams = (function(url)
{
    var result = new Object();
    var idx = url.lastIndexOf('?');

    if (idx > 0)
    {
        var params = url.substring(idx + 1).split('&');

        for (var i = 0; i < params.length; i++)
        {
            idx = params[i].indexOf('=');

            if (idx > 0)
            {
                result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
            }
        }
    }

    return result;
})(window.location.href);

var bytesToSize = function(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

/*
*   获取一个文件内容
*
*       参数：
*          url
*/
var fetchFile = function (url) {

    let rtn = null;

    jQuery.ajax({
        url: url,
        async:false,
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {

            ifSignIn(data);

            rtn = data.data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;

};



/*
 *  Wait Function  
 *  参数：
 *    ms
 */
var wait = function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
};

var tooltip, // global variables oh my! Refactor when deploying!
    hidetooltiptimer

function createtooltip(){ // call this function ONCE at the end of page to create tool tip object
    tooltip = document.createElement('div')
    tooltip.style.cssText =
        'position:absolute; background:black; color:white; padding:4px;z-index:10000;'
        + 'border-radius:2px; font-size:12px;box-shadow:3px 3px 3px rgba(0,0,0,.4);'
        + 'opacity:0;transition:opacity 0.3s'
    tooltip.innerHTML = 'Copied...'
    document.body.appendChild(tooltip)
};

function showtooltip(e){
    var evt = e || event
    clearTimeout(hidetooltiptimer)
    tooltip.style.left = evt.pageX - 10 + 'px'
    tooltip.style.top = evt.pageY + 15 + 'px'
    tooltip.style.opacity = 1
    hidetooltiptimer = setTimeout(function(){
        tooltip.style.opacity = 0
    }, 50)
};

function copySelectionText(){
    var copysuccess // var to check whether execCommand successfully executed
    try{
        copysuccess = document.execCommand("copy") // run command to copy selected text to clipboard
    } catch(e){
        copysuccess = false
    }
    return copysuccess
}

function getSelectionText(){
    var selectedText = ""
    if (window.getSelection){ // all modern browsers and IE9+
        selectedText = window.getSelection().toString()
    }
    return selectedText
};

var copyBoard = function () {
    createtooltip() // create tooltip by calling it ONCE per page. See "Note" below
    var buddhaquote = document.getElementsByTagName('body')[0];
    buddhaquote.addEventListener('mouseup', function(e){
        var selected = getSelectionText() // call getSelectionText() to see what was selected
        if (selected.length > 0){ // if selected text length is greater than 0
            var copysuccess = copySelectionText() // copy user selected text to clipboard
            showtooltip(e)
        }
    }, false)
};

var FormWizard = function(id) {
    "use strict";
    return {
        init: function(id) {
            handleBootstrapWizards(id)
        }
    }
}();

var handleBootstrapWizards = function(id) {
    "use strict";
    $("#" + id).bwizard()
};


var vwTOpx = function (value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var result = (x*value)/100;

    return result;
};

var vhTOpx = function (value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var result = (y*value)/100;

    return result;
};

var pxTOvw = function (value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var result = (100*value)/x;

    return result;
};

var pxTOvh = function (value) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var result = (100*value)/y;

    return result;
};


var syntaxHighlight = function(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 4);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n\t/g,' ');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
};

/*
*  alertify setup
* */
alertify.set({ labels : { ok: "确认", cancel: "取消" } });
