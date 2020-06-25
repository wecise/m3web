/*
*Copyright (c) 20015-2022, Wecise Ltd
*
*        #     # ### #     # ######  ####### #     #
*        #  #  #  #  ##    # #     # #     # #  #  #
*        #  #  #  #  # #   # #     # #     # #  #  #
*        #  #  #  #  #  #  # #     # #     # #  #  #
*        #  #  #  #  #   # # #     # #     # #  #  #
*        #  #  #  #  #    ## #     # #     # #  #  #
*         ## ##  ### #     # ######  #######  ## ##
*
*  新建窗体
*  参数：
*   size: 大小 [mini,small,large]
*   title: 标题
*   template: 模板（Vue渲染用）
*/

class Window {
    constructor() {
        this.width = $(window).width();//document.body.clientWidth;
        this.height = $(window).height();//(document.body.clientHeight || document.documentElement.clientHeight);

        this.wW = this.width * 0.7;
        this.hH = this.height * 0.7;
        this.lrwh = [(this.width - this.wW)/2, (this.height - this.hH)/2, this.wW, this.hH];
        this.theme = {dark: 'rgb(37, 45, 71)', light:'rgb(255,255,255)', grey: 'rgb(247,247,247)'};
    }

    init(){
        $(document).on('jspanelstatuschange',(event, id)=>{
            let status = $('#' + id).data('status');
            if(status == 'closed'){
                eventHub.$emit("WIN-CLOSE-EVENT",null);
            }
            eventHub.$emit("WINDOW-STATUS-CHANGE-EVENT",null);

        });
    }

    winUpload(title, template, position, container) {

        this.lrwh[2] = this.width * 0.6;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            id: `jsPanel-upload-${objectHash.sha1(title)}`,
            headerTitle: title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            show: 'animated fadeInDownBig',
            headerControls: { maximize: 'remove' },
            headerRemove:  false,
            theme:          maxWindow.theme.dark,
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
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none",
                    "overflow":"auto"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });
                
            },
            footerToolbar: function (footer) {
                return `<div id="jsPanel-upload-footer-${objectHash.sha1(title)}"></div>`;
            }
        });

        return win;

    }

    winModal(title, template, position, container) {

        this.lrwh[2] = this.width * 0.5;
        this.lrwh[3] = this.width * 0.5;

        let win = $.jsPanel({
            id: 'jsPanel-'+title,
            paneltype: 'modal',
            headerTitle: title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            show: 'animated fadeInDownBig',
            headerRemove:  true,
            theme:          maxWindow.theme.dark,
            content:        template,
            callback:       function(){
                $(".jsPanel-headerbar",this).css({
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

    winToolBars(title, template, position, container){

        let win = $.jsPanel({
            theme:          maxWindow.theme.dark,
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

    winCmd(title, template, position, container){

        this.lrwh[2] = this.width * 0.4;
        this.lrwh[3] = this.height * 0.125;

        let win = $.jsPanel({
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
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

    winConfig(title, template, position, container){

        this.lrwh[2] = this.width * 0.4;
        this.lrwh[3] = this.height * 0.56;

        let win = $.jsPanel({
            id: 'jsPanel-configNew',
            theme:        maxWindow.theme.dark,
            headerTitle:  title,
            contentSize:  {width: this.lrwh[2], height: this.lrwh[3]},
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

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winEditor(title, template, position, container){

        let id = `jsPanel-editor`;

        this.lrwh[2] = this.width * 0.85;
        this.lrwh[3] = this.height * 0.7;

        let win = $.jsPanel({
            id: id,
            theme:          maxWindow.theme.dark,
            headerTitle:   `<img src="${window.ASSETS_ICON}/apps/png/matrix.png?type=download&issys=${window.SignedUser_IsAdmin}" style="width:12px;"></img> ${title}`,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: "center 0 0",
            container: 'body',
            headerControls: { controls: '' },
            headerRemove:  false,
            content:        template,
            onresized: function(){
                eventHub.$emit("WINDOW-STATUS-CHANGE-EVENT");
            },
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate!important",
                    "z-index": "2000"
                });
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none",
                    "overflow":"hidden"
                });

                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3",this).css({
                    "font-size": "12px"
                });
                $(".jsPanel .jsPanel-ftr",this).css({
                    "border-top": "unset"
                });
                

            },
            onclosed: function(){
                window.editorApp = null;
            },
            /* footerToolbar: function (footer) {
                return `<div style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            } */
        });

        return win;
    }

    winApp(title, template, position, container){

        this.lrwh[2] = this.width * 0.55;
        this.lrwh[3] = this.height * 0.55;

        let win = $.jsPanel({
            id: `jsPanel-${title}`,
            theme:        maxWindow.theme.dark,
            headerTitle:  title,
            contentSize:  {width: this.lrwh[2], height: this.lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            container: 'body',
            headerControls: { controls: '' },
            headerRemove:  false,
            content:        template,
            draggable: {
                handle:  "div.jsPanel-hdr, div.jsPanel-ftr,header.jsPanel-control,.el-header,.el-footer",
                opacity: 0.8
            },
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "none",
                    "overflow": "hidden auto"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px",
                    "height": "20px",
                    "line-height": "20px"
                });

            }
        });

        return win;
    }

    winNewFile(title, template, position, container){

        this.lrwh[2] = this.width * 0.35;
        this.lrwh[3] = this.height * 0.47;

        let win = $.jsPanel({
            id: 'jsPanel-fileNew',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: "center 0 0",
            maximizedMargin: [100, 100, 100, 100],
            container: 'body',
            headerControls: { maximize: 'remove',minimize: 'remove' },
            headerRemove:  false,
            content:        template,
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    // "border": "1px solid rgb(221, 221, 221)",
                    // "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    // "border": "1px solid #dddddd",
                    "border-top": "none"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;">创建：${window.SignedUser_UserName}  | ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winFileAction(title, template, position, container){

        let _position = "center 0 0";

        this.lrwh[2] = this.width * 0.35;
        this.lrwh[3] = this.height * 0.47;

        let win = $.jsPanel({
            id: 'jsPanel-fileAction',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: _position,
            maximizedMargin: [100, 100, 100, 100],
            container: 'body',
            headerControls: { maximize: 'remove',minimize: 'remove' },
            headerRemove:  false,
            content:        template,
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "10000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    // "border": "1px solid rgb(221, 221, 221)",
                    // "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    // "border": "1px solid #dddddd",
                    "border": "unset"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });
                $(".jsPanel .jsPanel-ftr").css({
                    "border": "unset"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;">创建：${window.SignedUser_UserName}  | ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winRobot(title, template, position, container){

        this.lrwh[2] = this.width * 0.6;
        this.lrwh[3] = this.height * 0.7;

        let win = $.jsPanel({
            id: 'jsPanel-robot',
            //theme:          maxWindow.theme.dark,
            theme: "none",
            headerTitle:   'AI 运维',
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: "center 0 0",
            container: 'body',
            headerControls: {  },
            headerRemove:  true,
            content:        template,
            draggable: {
                handle:  "div.jsPanel-hdr, div.jsPanel-ftr,header.jsPanel-control,div.el-tabs__header.is-left",
                opacity: 0.8
            },
            callback: function(){
                
                $(".jsPanel",this).css({
                    "z-index": "1000"
                });
                
                $("#jsPanel-robot-min",this).parent().addClass("jsPanel-btn jsPanel-btn-maximize");
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    // "border": "1px solid rgb(221, 221, 221)",
                    // "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    // "border": "1px solid #dddddd",
                    "border-top": "none"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });

                $(".jsPanel-controlbar .jsPanel-btn",this).css({
                    "color": "#333333"
                });

                $(".jsPanel-titlebar h3",this).css({
                    "font-size": "12px",
                    "width": "70px",
                    "margin": "0px",
                    "background": "#242c46",
                    "height": "32px",
                    "padding": "10px 0px 0px 10px",
                    "color": "#fff!important"
                });

            }
        });

        return win;
    }

    winApps(title, template, position, container){

        this.lrwh[2] = this.width * 0.7;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            id: 'jsPanel-apps',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: {
                left: 60,
                top: 50,
            },
            //container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  true,
            content:        template,
            dragit: {
                drag: function (panel, position) {

                }
            },
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
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
                    "font-size": "12px",
                });

                /* $(".jsPanel-hdr").css({
                    "background-color": "#ffffff!important"
                }); */

                // this.mouseleave(function(){
                //     win.close();
                // })

            }
        });

        return win;
    }

    winEntity(title, template, position, container){

        this.lrwh[2] = this.width * 0.5;
        this.lrwh[3] = this.height * 0.7;

        let win = $.jsPanel({
            id: 'jsPanel-entity',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: {my: "right-top", at: "right-top"},
            container: 'body',
            headerControls: { maximize: 'remove' },
            headerRemove:  false,
            content:        template,
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winEntityInfo(title, template, position, container){

        this.lrwh[2] = this.width * 0.3;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            id: 'jsPanel-entity-info',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: "center 0 0",
            container: 'body',
            headerControls: { maximize: 'remove' },
            headerRemove:  false,
            content:        template,
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                
                $(".jsPanel-titlebar h3",this).css({
                    "font-size": "12px"
                });

            }
        });

        return win;
    }

    winEntityTemplate(title, template, position, container){

        this.lrwh[2] = this.width * 0.37;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            id: 'jsPanel-entity-template',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: "center 0 0",
            container: 'body',
            headerControls: { maximize: 'remove' },
            headerRemove:  false,
            content:        template,
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winEntityNew(title, template, position, container){

        this.lrwh[2] = this.width * 0.7;
        this.lrwh[3] = this.height * 0.7;

        let win = $.jsPanel({
            id: 'jsPanel-entityNew',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: "center 0 0",
            container: 'body',
            headerControls: { maximize: 'remove' },
            headerRemove:  false,
            content:        template,
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winClassTemplate(title, template, position, container){

        this.lrwh[2] = this.width * 0.6;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            id: 'jsPanel-class-template',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: "center 0 0",
            container: 'body',
            headerControls: {  },
            headerRemove:  false,
            content:        template,
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winGraphAction(title, template, position, container, fun){

        let _position = {
                            my: "left-top",
                            at: "left-top",
                            of: container,
                            offsetX: -1,
                            offsetY: 35
                        };

        this.lrwh[2] = $(container).width() * 0.3;//"30em";//this.width * 0.2;
        this.lrwh[3] = $(container).height() * 0.8;//this.height * 0.55;

        let win = $.jsPanel({
            id: 'jsPanel-graphAction',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: _position,
            headerControls: { maximize: 'remove' },
            headerRemove:  true,
            container: container,
            content:        template,
            callback: function(panel){

                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none",
                    "overflow":"auto"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

                $(".jsPanel-ftr a.btn-close",this).click(function(){
                    fun();
                    win.close();
                })

                $(".jsPanel-ftr a.btn-colspan",this).click(function(){
                    win.hide();
                })

            },
            footerToolbar: function (footer) {
                return `<div style="width:100%;text-align:center;"><a href="javascript:void(0);" class="btn-close el-button el-button--small el-button-default">关闭</a><a href="javascript:void(0);" class="btn-colspan el-button el-button--small el-button-default">收起</a></div>`;
            }
        });

        return win;
    }

    winGraphEdgeAction(title, template, position, container, fun){

        let _position = {
                            my: "left-top",
                            at: "left-top",
                            of: container,
                            offsetX: 0,
                            offsetY: 0
                        };

        this.lrwh[2] = $(container).width() * 0.3;//"30em";//this.width * 0.2;
        this.lrwh[3] = $(container).height() * 0.8;//this.height * 0.55;

        let win = $.jsPanel({
            id: 'jsPanel-graphEdgeAction',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: _position,
            headerControls: { maximize: 'remove' },
            headerRemove:  true,
            container: container,
            content:        template,
            callback: function(panel){

                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none",
                    "overflow":"auto"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

                $(".jsPanel-ftr a.btn-close",this).click(function(){
                    fun();
                    win.close();
                })

                $(".jsPanel-ftr a.btn-colspan",this).click(function(){
                    win.hide();
                })

            }
        });

        return win;
    }

    winPaths(title, template, position, container){

        let pos = localStorage.getItem("WINDOW_PATHS_POSITION");

        this.lrwh[2] = this.width * 0.5;
        this.lrwh[3] = this.height * 0.3;

        let win = $.jsPanel({
            id: 'jsPanel-paths',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: _.extend({my: "right-top", at: "right-top"},pos),
            container: 'body',
            headerControls: { maximize: 'remove' },
            headerRemove:  false,
            content:        template,
            dragit: {
                drag: function (panel, position) {
                    localStorage.setItem("WINDOW_PATHS_POSITION",JSON.stringify(position));
                }
            },
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none",
                    "overflow":"auto"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winProbe(title, template, position, container){

        let _position = { top: 0, right: 0 };

        this.lrwh[2] = this.width * 0.6;
        this.lrwh[3] = this.height * 0.8;

        let win = $.jsPanel({
            id: `jsPanel-${container}`,
            theme:          maxWindow.theme.light,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            //position: _position,
            //container: $(`.${container}`),
            position: {
                my: "center",
                at: "center"
            },
            container: "body",
            headerControls: { },
            headerRemove:  false,
            content:        template,
            draggable: {
                disabled:  false
            },
            callback: function(){
                $(".jsPanel").addClass("animated fadeInDown");

                $(".jsPanel").css({
                    "top":"55px",
                    "box-shadow":"0 2px 12px 0 rgba(0, 0, 0, 0.1)"
                });
                $(".jsPanel-hdr",this).css({
                    "background-color": "#ffffff!important;"
                });
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border": "none",
                });
                $(".jsPanel-content",this).css({
                    "border": "none",
                    "overflow": "hidden"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "16px",
                    "color": "#333333!important;"
                });

            }
        });

        return win;
    }

    winDeployApp(title, template, position, container){

        let _position = { my: "center", at: "center" };

        this.lrwh[2] = this.width * 0.5;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            id: 'jsPanel-deploy',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: _position,
            container: '#content',//$(`.${container}`),
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            draggable: {
                disabled:  false
            },
            callback: function(){

                this.addClass("animated fadeInDown");
                
                $(".jsPanel").css({
                    "position":"absolute",
                    "z-index": "10001"
                });

                this.find(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                });
                this.find(".jsPanel-content",this).css({
                    "border": "none",
                    "overflow": "hidden"
                });

                this.find(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                this.find(".jsPanel-titlebar h3").css({
                    "font-size": "12px",
                });

            }
        });

        return win;
    }

    winFile(title, template, position, container){

        this.lrwh[2] = this.width * 0.7;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            dragit: {
                containment: 'parent',
            },
            content:        template,
            callback:       function(){
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "unset",
                    "overflow": "hidden"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });
                $(".jsPanel .jsPanel-ftr").css({
                    "border": "unset"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winDir(title, template, position, container){

        this.lrwh[2] = this.width * 0.5;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            dragit: {
                containment: 'parent',
            },
            content:        template,
            callback:       function(){
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "unset",
                    "overflow": "hidden"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });
                $(".jsPanel .jsPanel-ftr").css({
                    "border": "unset"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winProperties(title, template, position, container){

        let _tmp = _.attempt(JSON.parse.bind(null, localStorage.getItem("WINDOW-PROPERTIES-POSITION")));

        let _position = { top: 60, left: 60 };

        if(!_.isEmpty(_tmp)){
            _position = _tmp;
        }

        this.lrwh[2] = 350;//this.width * 0.4; //$( window ).width()*0.2;
        this.lrwh[3] = 400;//this.height * 0.6; //$( window ).height()*0.55;

        let win = $.jsPanel({
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
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

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winRule(title, template, position, container){

        position = {
            my: 'center',
            at: 'center',
            of: 'window'
        };

        this.lrwh[2] = this.width * 0.4;
        this.lrwh[3] = this.height * 0.5;

        let win = $.jsPanel({
            theme:         maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: position,
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
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                    "overflow": "hidden",
                    "padding": "15px 15px 20px 15px"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winInfo(title, template, position, container){

        this.lrwh[2] = this.width * 0.34;
        this.lrwh[3] = this.height * 0.7;

        let win = $.jsPanel({
            id: "jsPanel-fsInfo",
            theme:         maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: { top: 60, left: 80 },
            container: container,
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "1px solid #dddddd",
                    "overflow": "hidden"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3",this).css({
                    "font-size": "12px"
                });

                $(".jsPanel-hdr",this).css({
                    "background-color": "rgb(37, 45, 71)!important"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winGraphPath(title, template, position, container, fn){

        this.lrwh[2] = this.width * 0.35;
        this.lrwh[3] = this.height * 0.3;

        let win = $.jsPanel({
            id: `jsPanel-${title}`,
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position:    'right-top DOWN -5 5',
            container: container,
            headerControls: { controls: '' },
            headerRemove:  false,
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "11000"
                });
                $(".jsPanel-headerbar",this).css({
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

                fn();

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winTopological(id, title, template, position, container, fn){

        let _position = { top: 0, right: 0 };

        this.lrwh[2] = $(container).width();
        this.lrwh[3] = this.height;

        let win = $.jsPanel({
            id: `jsPanel-${id}`,
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position:   _position,
            container: container,
            headerControls: { controls: '' },
            headerRemove:  false,
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "left":"70px",
                    "top":"60px",
                    "box-shadow":"none"
                });
                $(".jsPanel-headerbar",this).css({
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

                fn();

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winAssociation(id, title, template, position, container, fn){

        this.lrwh[2] = $(container).width();
        this.lrwh[3] = this.height/3;

        let win = $.jsPanel({
            id: `jsPanel-${id}`,
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position:   {
                        my: 'left-bottom',
                        at: 'left-bottom',
                        offsetY: 25,
                        offsetX: 65},
            container: container,
            headerControls: { controls: '' },
            headerRemove:  false,
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "box-shadow":"none",
                    "border":"none"
                });
                $(".jsPanel-headerbar",this).css({
                    "background": "rgb(250, 250, 250)",
                    "min-height": "28px"
                });
                $(".jsPanel-content",this).css({
                    "border": "unset",
                    "overflow": "hidden"
                });
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

                fn();

            },
            footerToolbar: function (footer) {
                //return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winPerformance(title, template, position, container){

        this.lrwh[2] = this.width * 0.7;
        this.lrwh[3] = this.height * 0.8;

        let win = $.jsPanel({
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: {
                my: 'center',
                at: 'center',
                of: 'window'
            },
            container: 'body',
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            dragit: {
                containment: 'parent',
            },
            content:        template,
            callback:       function(){
                $(".jsPanel").css({
                    "position":"absolute",
                    "z-index": "10000"
                });
                $(".jsPanel-headerbar",this).css({
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

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winAppShare(title, template, position, container){

        let _position = { my: "center", at: "center" };

        this.lrwh[2] = this.width * 0.55;
        this.lrwh[3] = this.height * 0.5;

        let win = $.jsPanel({
            id: 'jsPanel-appShare',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: _position,
            container: 'body',//$(`.${container}`),
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            draggable: {
                disabled:  false
            },
            callback: function(){

                this.addClass("animated fadeInDown");
                
                $(".jsPanel").css({
                    "position":"absolute",
                    "z-index": "10001"
                });

                this.find(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                });
                this.find(".jsPanel-content",this).css({
                    "border": "none",
                    "overflow": "auto"
                });

                this.find(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                this.find(".jsPanel-titlebar h3").css({
                    "font-size": "12px",
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winCompany(title, template, position, container){

        let _position = { my: "center", at: "center" };

        this.lrwh[2] = this.width * 0.5;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            id: 'jsPanel-company',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: _position,
            container: '#content',//$(`.${container}`),
            headerControls: { controls: 'closeonly' },
            headerRemove:  false,
            content:        template,
            draggable: {
                disabled:  false
            },
            callback: function(){

                this.addClass("animated fadeInDown");
                
                $(".jsPanel").css({
                    "position":"absolute",
                    "z-index": "10001"
                });

                this.find(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                });
                this.find(".jsPanel-content",this).css({
                    "border": "none",
                    "overflow": "hidden"
                });

                this.find(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                this.find(".jsPanel-titlebar h3").css({
                    "font-size": "12px",
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

    winUser(title, template, position, container){

        this.lrwh[2] = this.width * 0.4;
        this.lrwh[3] = this.height * 0.6;

        let win = $.jsPanel({
            id: 'jsPanel-user',
            theme:          maxWindow.theme.dark,
            headerTitle:   title,
            contentSize:    {width: this.lrwh[2], height: this.lrwh[3]},
            position: { my: "center", at: "center" },
            container: 'body',
            headerControls: { maximize: 'remove' },
            headerRemove:  false,
            content:        template,
            callback: function(){
                $(".jsPanel").css({
                    "position":"absoulate",
                    "z-index": "1000"
                });
                
                $(".jsPanel-headerbar",this).css({
                    "min-height": "28px",
                    "border-bottom": "none"
                });
                $(".jsPanel-content",this).css({
                    "border-top": "none"
                });
                
                $(".jsPanel-titlebar",this).css({
                    "min-height": "28px"
                });
                
                $(".jsPanel-titlebar h3").css({
                    "font-size": "12px"
                });

            },
            footerToolbar: function (footer) {
                return `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> ${moment().format(mx.global.register.format)}</div>`;
            }
        });

        return win;
    }

}

let maxWindow = new Window();
maxWindow.init();
