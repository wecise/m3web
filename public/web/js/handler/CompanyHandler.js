/*
*        #####  ####### #     # ######     #    #     # #     #
        #     # #     # ##   ## #     #   # #   ##    #  #   #
        #       #     # # # # # #     #  #   #  # #   #   # #
        #       #     # #  #  # ######  #     # #  #  #    #
        #       #     # #     # #       ####### #   # #    #
        #     # #     # #     # #       #     # #    ##    #
         #####  ####### #     # #       #     # #     #    #
*
* */


class CompanyHandler{
    constructor(){

    }

    /*
    *  公司管理
    *
    *  添加
    *
    */

    companyNew(event){
        let rtn = 0;

        jQuery.ajax({
            url: '/companys',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: event,
            beforeSend: function (xhr) {
                Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("失败" + " " + xhr.responseText);
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
            }

        })

        return rtn;

    };


    /*
    *  公司管理
    *
    *  获取
    *
    *
    */
    companyGet(name) {
        let rtn = null;

        jQuery.ajax({
            url: `/companys/${name}`,
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend: function (xhr) {
                Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
            }

        })

        return rtn;

    };


    /*
    *  公司管理
    *
    *  列表
    *
    */
    companyList() {
        let rtn = null;

        jQuery.ajax({
            url: '/companys',
            dataType: 'json',
            type: 'GET',
            async: false,
            beforeSend: function (xhr) {
                Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
            }

        })

        return rtn;

    };


    /*
    *  公司管理
    *
    *  删除
    *
    */
    companyDelete(name) {
        let rtn = 0;

        jQuery.ajax({
            url: `/companys/${name}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend: function (xhr) {
                Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("失败" + " " + xhr.responseJSON.error);
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
            }

        })

        return rtn;

    };


    /*
    *  公司管理
    *
    *  更新
    *
    */
    companyUpdate(com) {
        let rtn = 0;

        jQuery.ajax({
            url: '/companys',
            dataType: 'json',
            processData: false,
            contentType: 'application/json; charset=utf-8',
            type: 'PUT',
            async: false,
            data: JSON.stringify(com),
            beforeSend: function (xhr) {
                Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("失败" + " " + JSON.stringify(xhr));
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
            }

        })

        return rtn;

    };
}

var companyHandler = new CompanyHandler();