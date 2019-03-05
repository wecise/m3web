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

class  WebSocket {
    constructor(){

    }

    checkWebSocket(){
        if ("WebSocket" in window) {
            alertify.error("您的浏览器不支持 WebSocket!");
            return false;
        }
    };
    
    webSocketNew(url){
        let ws = null;
    
        if(!_.isEmpty(url)){
            ws = new WebSocket(url);
        } else {
            ws = new WebSocket(`ws://${document.location.host}/websocket/event`);
        }
    
        return ws;
    
    };
    
    
    webSocketClose (ws) {
        ws.close(1000, 'close');
        alertify.log('连接已关闭');
    };
}

var mxWebSocket = new WebSocket();