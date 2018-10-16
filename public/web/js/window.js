
/*
        #     # ### #     # ######  ####### #     #
        #  #  #  #  ##    # #     # #     # #  #  #
        #  #  #  #  # #   # #     # #     # #  #  #
        #  #  #  #  #  #  # #     # #     # #  #  #
        #  #  #  #  #   # # #     # #     # #  #  #
        #  #  #  #  #    ## #     # #     # #  #  #
         ## ##  ### #     # ######  #######  ## ##
 */

"use strict";

/*
*  新建一个窗体
*  参数：
*   size: 大小 [mini,small,large]
*   title: 标题
*   template: 模板（Vue渲染用）
*/
var newWindow = function (type, title, template, position) {
    let win = null;
    let w = $( window ).width();//document.body.clientWidth;
    let h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);

    let wW = $( window ).width()*2.2/3;
    let hH = $( window ).height()*2.5/3;
    let lrwh = [(w-wW)/2, (h-hH)/2, wW, hH];


    if(type === 'fsupload'){

        lrwh[2] = $( window ).width()*0.60;
        lrwh[3] = $( window ).height()*0.60;

        win = $.jsPanel({
            id: 'jsPanel-'+title,
            headerTitle: title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            show: 'animated fadeInDownBig',
            headerRemove:  false,
            theme:          'filledlight',
            content:        template,
            container: 'body',
            dragit: {
                containment: 'parent',
            },
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                    "overflow": "auto"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;

    }

    if(type === 'fsmodal'){

        lrwh[2] = $( window ).width()*0.50;
        lrwh[3] = $( window ).height()*0.50;

        win = $.jsPanel({
            id: 'jsPanel-'+title,
            paneltype: 'modal',
            headerTitle: title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            show: 'animated fadeInDownBig',
            headerRemove:  true,
            theme:          'filledlight',
            content:        template,
            callback:       function(){
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;

    }

    if(type === 'toolbars'){

        win = $.jsPanel({
            theme:          'filledlight',
            contentSize:    {width: 35, height: 230},
            position: {
                left: position[0],
                top:  position[1]
            },
            headerRemove:  true,
            dragit:         {handles: 'div.jsPanel-content'},
            content:        template,
            callback:       function(){


            }
        });

        return win;

    }

    if(type === 'cmd'){

        lrwh[2] = $( window ).width()*0.4;
        lrwh[3] = $( window ).height()*0.125;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: {
                my: "left-top",
                at: "right-bottom",
                of: $(position),
                offsetX: 10,
            },
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            dragit: {
                containment: 'parent',
            },
            content:        template,
            callback:       function(){
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'fsedit'){

        let _tmp = _.attempt(JSON.parse.bind(null, localStorage.getItem("WINDOW-FSEDIT-POSITION")));

        let _position = { my: "center", at: "center" };

        if(!_.isEmpty(_tmp)){
            _position = _tmp;
        }

        lrwh[2] = $( window ).width()*0.6;
        lrwh[3] = 480;//$( window ).height()*0.55;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: _position,
            container: 'body',
            headerControls: { controls: '' },
            headerRemove:  false,
            content:        template,
            dragit: {
                drag: function (panel, position) {
                    localStorage.setItem("WINDOW-FSEDIT-POSITION",JSON.stringify(position));
                }
            },
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'fsapp'){
        lrwh[2] = $( window ).width()*0.55;
        lrwh[3] = $( window ).height()*0.55;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            container: 'body',
            headerControls: { controls: '' },
            headerRemove:  false,
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'fsrobot'){

        let _tmp = _.attempt(JSON.parse.bind(null, localStorage.getItem("WINDOW-ROBOT-POSITION")));

        let _position = { top: 60, right: 160 };

        if(!_.isEmpty(_tmp)){
            _position = _tmp;
        }

        lrwh[2] = $( window ).width()*0.3;
        lrwh[3] = $( window ).height()*0.7;

        win = $.jsPanel({
            id: 'jsPanel-robot',
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: _position,
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            dragit: {
                drag: function (panel, position) {
                    console.log(111,position)
                    localStorage.setItem("WINDOW-ROBOT-POSITION",JSON.stringify(position));
                }
            },
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-hdr").css({
                    "background-color": "rgb(255,255,255)",
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(255,255,255)",
                    "background-image": "none",
                    "min-height": "28px",
                    "border": "1px solid rgb(221, 221, 221)",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                    "border-top": "none"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'fsentity'){
        lrwh[2] = $( window ).width()*0.55;
        lrwh[3] = $( window ).height()*0.55;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            container: 'body',
            headerControls: { controls: '' },
            headerRemove:  false,
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                    "overflow": "auto"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px",
                    "font-family": "inherit"
                });

            }
        });

        return win;
    }

    if(type === 'small'){
        lrwh[2] = $( window ).width()*0.55;
        lrwh[3] = $( window ).height()*0.55;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'large'){
        lrwh[2] = $( window ).width()*0.7;
        lrwh[3] = $( window ).height()*0.8;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            dragit: {
                containment: 'parent',
            },
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'properties'){

        let _tmp = _.attempt(JSON.parse.bind(null, localStorage.getItem("WINDOW-PROPERTIES-POSITION")));

        let _position = { top: 60, left: 60 };

        if(!_.isEmpty(_tmp)){
            _position = _tmp;
        }

        lrwh[2] = 300;//$( window ).width()*0.2;
        lrwh[3] = 340;//$( window ).height()*0.55;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: _position,
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            dragit: {
                drag: function (panel, position) {
                    localStorage.setItem("WINDOW-PROPERTIES-POSITION",JSON.stringify(position));
                }
            },
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    if(type === 'fsinfo'){

        let _tmp = _.attempt(JSON.parse.bind(null, localStorage.getItem(_.upperCase(type)+"-WINDOW-POSITION")));

        let _position = { top: 10, left: 60 };

        if(!_.isEmpty(_tmp)){
            _position = _tmp;
        }

        lrwh[2] = 400;//$( window ).width()*0.25;
        lrwh[3] = 600;//$( window ).height()* 0.85 > 600 ? 620: $( window ).height()* 0.85;

        win = $.jsPanel({
            theme:          'filledlight',
            headerTitle:   title,
            contentSize:    {width: lrwh[2], height: lrwh[3]},
            position: _position,
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            dragit: {
                drag: function (panel, position) {
                    console.log(panel,position)
                    localStorage.setItem(_.upperCase(type)+"-WINDOW-POSITION",JSON.stringify(position));
                }
            },
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "background-color": "rgb(238, 238, 238)",
                    "background-image": "linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224))",
                    "background-repeat": "repeat-x",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                    "overflow": "hidden"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }


    if(type === 'appsbox'){
        lrwh[2] = $( window ).width()*0.8/3;
        lrwh[3] = $( window ).height()*2.0/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }

    if(type === 'robot'){
        lrwh[2] = $( window ).width()*0.8/3;
        lrwh[3] = $( window ).height()*2.25/2.7;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }


    /*if(type === 'narrow'){
        lrwh[2] = $( window ).width()*0.6/3;
        lrwh[3] = $( window ).height()*1.45/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }*/

    if(type === 'mini'){
        lrwh[2] = $( window ).width()*0.7/3;
        lrwh[3] = $( window ).height()*0.8/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }

    if(type === 'small'){
        lrwh[2] = $( window ).width()*1.5/3;
        lrwh[3] = $( window ).height()*1.8/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }

    if(type === 'middle'){
        lrwh[2] = $( window ).width()*1.8/3;
        lrwh[3] = $( window ).height()*2.0/3;

        let _position = localStorage.getItem(_.upperCase(type+"_window_position"));

        if(!_.isEmpty(_position)){
            let _p = _.attempt(JSON.parse.bind(null, _position));
            lrwh[0] = _p.x || (w-wW)/2;
            lrwh[1] = _p.y || (h-hH)/2;
        }
    }

    let tb = document.createElement('div');
    console.log(title, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true)
    $(tb).append(template);
    win = new mxWindow(title, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
    win.hide();
    $("div.mxWindow").addClass("animated fadeIn");
    win.show();
    win.setMaximizable(true);
    win.setResizable(true);
    win.setClosable(true);
    win.setVisible(true);

    win.addListener(mxEvent.MAXIMIZE, function(event){
        _.delay(function(){
            eventHub.$emit("win-resize-event",null);
        },100);
    });

    win.addListener(mxEvent.MINIMIZE, function(event){
        _.delay(function(){
            eventHub.$emit("win-resize-event",null);
        },100);
    });

    win.addListener(mxEvent.NORMALIZE, function(event){
        _.delay(function(){
            eventHub.$emit("win-resize-event",null);
        },100);
    });

    win.addListener(mxEvent.CLOSE, function(event){
        _.delay(function(){
            eventHub.$emit("win-close-event",null);
        },100);
    });

    win.addListener(mxEvent.MOVE_END, function(event){
        console.log(win.getX(),win.getY())
        localStorage.setItem(_.upperCase(type+"_window_position"),JSON.stringify({x: win.getX(),y:win.getY()}));
    });

    return win;
};


$(document).on('jspanelstatuschange', function (event, id) {
    eventHub.$emit("WINDOW-STATUS-CHANGE-EVENT",null);
});