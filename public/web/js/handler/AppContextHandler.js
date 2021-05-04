/*
           #    ######  ######      #####  ####### #     # ####### ####### #     # #######
          # #   #     # #     #    #     # #     # ##    #    #    #        #   #     #
         #   #  #     # #     #    #       #     # # #   #    #    #         # #      #
        #     # ######  ######     #       #     # #  #  #    #    #####      #       #
        ####### #       #          #       #     # #   # #    #    #         # #      #
        #     # #       #          #     # #     # #    ##    #    #        #   #     #
        #     # #       #           #####  ####### #     #    #    ####### #     #    #
 */

class AppContextHandler {
    
    constructor(){

    }

    /*
    *   全局缓存
    *
    *   AppContext Get
    *
    *
    * */
    appContextGet(event) {
        let rtn = null;

        jQuery.ajax({
            url: `/appcontext/${event}`,
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                

                if( _.lowerCase(data.status) == "ok"){
                    rtn = data;
                    alertify.success("成功" + " " + data.message);
                } else {
                    alertify.error("失败" + " " + data.message);
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = null;
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };

    /*
    *   全局缓存
    *
    *   AppContext et
    *
    *
    * */
    appContextSet(event,context) {
        let rtn = 1;

        jQuery.ajax({
            url: `/appcontext/${event}`,
            dataType: 'json',
            contentType: false,
            type: 'POST',
            async: false,
            data: JSON.stringify(context),
            beforeSend:function(xhr){
                // // Pace.restart();
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
                } else {
                    rtn = 0;
                    alertify.error("失败" + " " + data.message);
                }

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };


    /*
    */
    layoutIt(type){
        let _rtn = null;

        let config = {
            settings:{
                showPopoutIcon: false,
                showCloseIcon: false
            },
            content: [{
                type: 'row',
                content:[
                    {
                        type: 'stack',
                        width: 20,
                        content:[{
                            type: 'component',
                            componentName: 'omdbComponent',
                            title:'对象管理',
                            isClosable: false,
                            componentState: {
                                id: 'omdb-class-tree',
                                name: 'omdb-class-tree'
                            }
                        }]
                    },
                    {
                        type: 'column',
                        content:[{
                            type: 'component',
                            componentName: 'omdbComponent',
                            title:'查询',
                            componentState: {
                                id: 'omdb-query-console',
                                name: 'omdb-query-console'
                            }
                        },{
                            type: 'component',
                            componentName: 'omdbComponent',
                            title:'输出',
                            componentState: {
                                id: 'omdb-query-output',
                                name: 'omdb-query-output'
                            }
                        }]
                    }
                ]
            }]
        };

        let myLayout = new GoldenLayout( config );

        myLayout.registerComponent( 'omdbComponent', function( container, componentState ){
            container.getElement().html(`<div id="` + componentState.id + `"></div>`);
        });

        myLayout.init();

    }
}

var appContextHandler = new AppContextHandler();