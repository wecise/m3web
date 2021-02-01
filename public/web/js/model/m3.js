/**
 * Copyright (c) 2020, Wecise
 * All rights reserved.
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.m3 = global.m3 || {})));
}(this, (function (exports) {
    'use strict';

    var version = "1.0.0";

    /**
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category 
     * @param 
     * @returns 
     * @example
     *
     */
    var init = function () {

    };

    function ajax(opts) {
        var xhr = new XMLHttpRequest(),
          type = opts.type || 'GET',
          url = opts.url,
          params = opts.data,
          dataType = opts.dataType || 'json';
      
        type = type.toUpperCase();
      
        if (type === 'GET') {
          params = (function(obj){
            var str = '';
      
            for(var prop in obj){
              str += prop + '=' + obj[prop] + '&'
            }
            str = str.slice(0, str.length - 1);
            return str;
          })(opts.data);
          url += url.indexOf('?') === -1 ? '?' + params : '&' + params;
        }
      
        xhr.open(type, url);
      
        if (opts.contentType) {
          xhr.setRequestHeader('Content-type', opts.contentType);
        }
      
        xhr.send(params ? params : null);
      
        //return promise
        return new Promise(function (resolve, reject) {
          //onload are executed just after the sync request is comple，
          //please use 'onreadystatechange' if need support IE9-
          xhr.onload = function () {
            if (xhr.status === 200) {
              var result;
              try {
                result = JSON.parse(xhr.response);
              } catch (e) {
                result = xhr.response;
              }
              resolve(result);
            } else {
              reject(xhr.response);
            }
          };
          
        });
    };

    /* 
     *  sessionid for M3 platform
    */
    var sessionid = "";

    /* 
     *  connect to M3 platform and return sessionid 
    */
    var connect = function (url, port, company, username, password) {
        let opts = {url: `/user/signin?company=${company}&username=${username}&password=${password}`}
        ajax(opts).then( (rtn)=>{
            sessionid = rtn.message;
        } ).catch( (err)=>{
            console.log(err)
        });
    };

    /* 
     *  Call a serverJS interface for M3 platform
     */
    var callFS = function(fileName, input){
        let opts = {url: `/script/exec/js?filepath=${fileName}&input=${input}&isfile=true`};
        ajax(opts).then( (rtn)=>{
            console.log(rtn)
        } ).catch( (err)=>{
            console.log(err)
        });
    };

    var global = function(){

    };

    var topBar = function () {

    };

    var leftBar = function () {

    };

    var rightBar = function () {

    };

    var footBar = function () {

    };


    var request = function(url, callback) {
        var request,
            event = dispatch("beforesend", "progress", "load", "error"),
            mimeType,
            headers = map$1(),
            xhr = new XMLHttpRequest,
            user = null,
            password = null,
            response,
            responseType,
            timeout = 0;
      
        // If IE does not support CORS, use XDomainRequest.
        if (typeof XDomainRequest !== "undefined"
            && !("withCredentials" in xhr)
            && /^(http(s)?:)?\/\//.test(url)) xhr = new XDomainRequest;
      
        "onload" in xhr
            ? xhr.onload = xhr.onerror = xhr.ontimeout = respond
            : xhr.onreadystatechange = function(o) { xhr.readyState > 3 && respond(o); };
      
        function respond(o) {
          var status = xhr.status, result;
          if (!status && hasResponse(xhr)
              || status >= 200 && status < 300
              || status === 304) {
            if (response) {
              try {
                result = response.call(request, xhr);
              } catch (e) {
                event.call("error", request, e);
                return;
              }
            } else {
              result = xhr;
            }
            event.call("load", request, result);
          } else {
            event.call("error", request, o);
          }
        }
      
        xhr.onprogress = function(e) {
          event.call("progress", request, e);
        };
      
        request = {
          header: function(name, value) {
            name = (name + "").toLowerCase();
            if (arguments.length < 2) return headers.get(name);
            if (value == null) headers.remove(name);
            else headers.set(name, value + "");
            return request;
          },
      
          // If mimeType is non-null and no Accept header is set, a default is used.
          mimeType: function(value) {
            if (!arguments.length) return mimeType;
            mimeType = value == null ? null : value + "";
            return request;
          },
      
          // Specifies what type the response value should take;
          // for instance, arraybuffer, blob, document, or text.
          responseType: function(value) {
            if (!arguments.length) return responseType;
            responseType = value;
            return request;
          },
      
          timeout: function(value) {
            if (!arguments.length) return timeout;
            timeout = +value;
            return request;
          },
      
          user: function(value) {
            return arguments.length < 1 ? user : (user = value == null ? null : value + "", request);
          },
      
          password: function(value) {
            return arguments.length < 1 ? password : (password = value == null ? null : value + "", request);
          },
      
          // Specify how to convert the response content to a specific type;
          // changes the callback value on "load" events.
          response: function(value) {
            response = value;
            return request;
          },
      
          // Alias for send("GET", …).
          get: function(data, callback) {
            return request.send("GET", data, callback);
          },
      
          // Alias for send("POST", …).
          post: function(data, callback) {
            return request.send("POST", data, callback);
          },
      
          // If callback is non-null, it will be used for error and load events.
          send: function(method, data, callback) {
            xhr.open(method, url, true, user, password);
            if (mimeType != null && !headers.has("accept")) headers.set("accept", mimeType + ",*/*");
            if (xhr.setRequestHeader) headers.each(function(value, name) { xhr.setRequestHeader(name, value); });
            if (mimeType != null && xhr.overrideMimeType) xhr.overrideMimeType(mimeType);
            if (responseType != null) xhr.responseType = responseType;
            if (timeout > 0) xhr.timeout = timeout;
            if (callback == null && typeof data === "function") callback = data, data = null;
            if (callback != null && callback.length === 1) callback = fixCallback(callback);
            if (callback != null) request.on("error", callback).on("load", function(xhr) { callback(null, xhr); });
            event.call("beforesend", request, xhr);
            xhr.send(data == null ? null : data);
            return request;
          },
      
          abort: function() {
            xhr.abort();
            return request;
          },
      
          on: function() {
            var value = event.on.apply(event, arguments);
            return value === event ? request : value;
          }
        };
      
        if (callback != null) {
          if (typeof callback !== "function") throw new Error("invalid callback: " + callback);
          return request.get(callback);
        }
      
        return request;
    };

    var type = function(defaultMimeType, response) {
        return function(url, callback) {
          var r = request(url).mimeType(defaultMimeType).response(response);
          if (callback != null) {
            if (typeof callback !== "function") throw new Error("invalid callback: " + callback);
            return r.get(callback);
          }
          return r;
        };
    };

    var html = type("text/html", function (xhr) {
        return document.createRange().createContextualFragment(xhr.responseText);
    });

    var json = type("application/json", function (xhr) {
        return JSON.parse(xhr.responseText);
    });

    var text = type("text/plain", function (xhr) {
        return xhr.responseText;
    });

    var xml = type("application/xml", function (xhr) {
        var xml = xhr.responseXML;
        if (!xml) throw new Error("parse error");
        return xml;
    });



    exports.init = init;
    exports.html = html;
    exports.json = json;
    exports.text = text;
    exports.xml = xml;
    exports.version = version;
    exports.connect = connect;
    exports.callFS = callFS;

    Object.defineProperty(exports, '__esModule', { value: true });

})))