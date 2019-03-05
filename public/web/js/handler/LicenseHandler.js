/*

        #       ###  #####  ####### #     #  #####  #######
        #        #  #     # #       ##    # #     # #
        #        #  #       #       # #   # #       #
        #        #  #       #####   #  #  #  #####  #####
        #        #  #       #       #   # #       # #
        #        #  #     # #       #    ## #     # #
        ####### ###  #####  ####### #     #  #####  #######
*/

class LicenseHandler {
    constructor(){

    }

    /*
    *  License管理
    *
    *  Import license
    *
    *   var form = new FormData();
        form.append("uploadfile", "wecise.lic");
    *
    * */
    licenseImport(event) {

        let rtn = 0;

        var fm = new FormData();
        fm.append("uploadfile", event);

        jQuery.ajax({
            url: '/license/import',
            dataType: 'json',
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            type: 'POST',
            data: fm,
            async: false,
            beforeSend: function (xhr) {
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.log("导入成功" + " " + data.message);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("导入失败" + " " + xhr.responseJSON.error);
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };


    /*
    *  License管理
    *
    *  View license
    *
    *
    */
    licenseView(event) {
        let rtn = null;

        jQuery.ajax({
            url: '/license/info/wecise',
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = data.message;
                }

            },
            error: function(xhr, textStatus, errorThrown){
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };
}

var licenseHandler = new LicenseHandler();
