var eventHub = new Vue();

var GLOBAL_OBJECT=  {
                        company: {
                            name: "",
                            global: {},
                            dimension: [],
                            object: {
                                event: {},
                                syslog: {},
                                journal: {},
                                raw: {},
                                log: {},
                                performance: {},
                                tickets: {},
                                change: {},
                            }
                        }
                    };

var init =  function(){
                
                GLOBAL_OBJECT.company.global = GLOBAL_CONFIG.global.timeline_scale;
                GLOBAL_OBJECT.company.name = localStorage.getItem("uname");// `{{.SignedUser.Company.OSpace}}`;
                if (_.isEmpty(GLOBAL_OBJECT.company.name )){
                    GLOBAL_OBJECT.company.name = 'wecise';
                }

                GLOBAL_OBJECT.company.name = GLOBAL_OBJECT.company.name.replace(/"/g,"");
                let _name = GLOBAL_OBJECT.company.name;
                GLOBAL_OBJECT.company.dimension = GLOBAL_CONFIG.keyspace[_name].dimension;
                
                _.forEach(_.keys(GLOBAL_OBJECT.company.object),function(v){
                    if(!_.isEmpty(GLOBAL_CONFIG.keyspace[_name])){
                        GLOBAL_OBJECT.company.object[v] = GLOBAL_CONFIG.keyspace[_name][v][GLOBAL_CONFIG.keyspace[_name][v].name];
                    } else {
                        GLOBAL_OBJECT.company.object[v] = [];
                    }
                })
               
                //console.log(23, GLOBAL_OBJECT.company.dimension)
            };


/*
 * 
 */

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
}

/*
 *  For: Load Function  
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
 *  For: Get Url Params 
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


var fetchFileFromFS = function(parent,name){
    let rtn = null;

    jQuery.ajax({
        url: '/fs' + parent + "/" + name,
        type: 'GET',
        contentType: "application/text; charset=utf-8",
        dataType: 'text json',
        data: {
            type: 'file'
        },
        beforeSend: function (xhr) {
        },
        complete: function (xhr, textStatus) {
        },
        success: function (data, textStatus, xhr) {
            if (_.isEmpty(data.message)) return false;

            rtn = data.message;
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    })
    return rtn;
};

var fetchData = function (param) {
    let rtn = null;

    jQuery.ajax({
        url: '/mxobject/search',
        type: 'POST',
        dataType: 'json',
        async:false,
        data: {
            cond: param
        },
        beforeSend: function(xhr) {
        },
        complete: function(xhr, textStatus) {
        },
        success: function(data, textStatus, xhr) {
            console.log(data, textStatus, xhr)
            rtn = data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;
}

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
            rtn = data.data;
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
        }
    });

    return rtn;

}


/*
 *  For: Wait Function  
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
}

function showtooltip(e){
    var evt = e || event
    clearTimeout(hidetooltiptimer)
    tooltip.style.left = evt.pageX - 10 + 'px'
    tooltip.style.top = evt.pageY + 15 + 'px'
    tooltip.style.opacity = 1
    hidetooltiptimer = setTimeout(function(){
        tooltip.style.opacity = 0
    }, 50)
}

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
}

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
}

var handleBootstrapWizards = function() {
    "use strict";
    $("#wizard").bwizard()
};
var FormWizard = function() {
    "use strict";
    return {
        init: function() {
            handleBootstrapWizards()
        }
    }
}();

init();

_.delay(function () {
    //copyBoard();
},5000)