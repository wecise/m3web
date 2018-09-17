/*
*       #     # ####### ######      #####  #######  #####  #    # ####### #######
        #  #  # #       #     #    #     # #     # #     # #   #  #          #
        #  #  # #       #     #    #       #     # #       #  #   #          #
        #  #  # #####   ######      #####  #     # #       ###    #####      #
        #  #  # #       #     #          # #     # #       #  #   #          #
        #  #  # #       #     #    #     # #     # #     # #   #  #          #
         ## ##  ####### ######      #####  #######  #####  #    # #######    #
*
* */

"use strict";

var checkWebSocket = function(){
    if ("WebSocket" in window) {
        alertify.error("您的浏览器不支持 WebSocket!");
        return false;
    }
};

var webSocketNew = function(url){
    let ws = null;

    if(!_.isEmpty(url)){
        ws = new WebSocket(url);
    } else {
        ws = new WebSocket(`ws://${document.location.host}/websocket/event`);
    }

    return ws;

};


var webSocketClose = function (ws) {
    ws.close(1000, 'close');
    alertify.log('连接已关闭');
};