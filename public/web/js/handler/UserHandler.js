/*

        #     #  #####  ####### ######       ##        #####  ######  ####### #     # ######
        #     # #     # #       #     #     #  #      #     # #     # #     # #     # #     #
        #     # #       #       #     #      ##       #       #     # #     # #     # #     #
        #     #  #####  #####   ######      ###       #  #### ######  #     # #     # ######
        #     #       # #       #   #      #   # #    #     # #   #   #     # #     # #
        #     # #     # #       #    #     #    #     #     # #    #  #     # #     # #
         #####   #####  ####### #     #     ###  #     #####  #     # #######  #####  #

 */

class UserHandler{
    constructor(){

    }

    ifSignIn(event) {
        if (event.status == 'signin'){
            window.location.href = event.message;
            return false;
        }
    }

    /* 
        用户列表
    */
    userList(event) {
        let rtn = null;

        jQuery.ajax({
            url: '/admin/users',
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {
                fullname: event || "/"
            },
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseText);
            }

        })

        return rtn;

    };

    
    /* 
        用户添加
    */
    userAdd(event,token) {
        let rtn = 0;

        jQuery.ajax({
            url: '/admin/users/new',
            dataType: 'json',
            type: 'POST',
            processData: false,
            contentType: 'application/json; charset=utf-8',
            async: false,
            data: JSON.stringify(event),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-Csrf-Token", token);
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
                // 初始化新用户文件系统
                if(event.otype == 'usr'){
                    userHandler.userFsInit(event.username);
                }
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("用户添加成功" + " " + moment().format("LLL"));
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                return 0;
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseText);
            }

        })

        return rtn;

    };
    
    /* 
        用户删除
    */
    userDelete(event) {
        let rtn = 0;

        jQuery.ajax({
            url: `/admin/users/${event}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend: function (xhr) {
                // Pace.restart();
            },
            complete: function (xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                return 0;
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseText);
            }

        })

        return rtn;

    };
    
    
    /*
    *  认证管理
    *
    */
    signIn(keyspace, username, password) {
        let rtn = null;

        jQuery.ajax({
            url: "/user/signin",
            dataType: 'json',
            type: 'POST',
            async: false,
            data: {
                company: keyspace,
                username: username,
                password: password
            },
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {
                rtn = data;
            },
            error: function(xhr, textStatus, errorThrown) {
            }
        });
        return rtn;
    };

    /*
    *  用户管理
    *
    */
    ldapMaintain(event) {
        let rtn = 1;

        jQuery.ajax({
            url: "/mxobject/search",
            dataType: 'json',
            type: 'POST',
            async: false,
            data: {
                cond: `call user ` + JSON.stringify(event),
                meta: true
            },
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + moment().format("LLL"));
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };

    /* 用户文件系统初始化 */
    userFsInit(newUsername) {
        
        try{

            if(newUsername == 'admin'){
                
                return;

            } else {

                // 检查当前用户FS是否存在
                let home = ["","home"].join("/");
                let check = fsHandler.fsCheck(home,newUsername);
                // 如果不存在，进行初始化
                if(!check){
                    fsHandler.fsCopy("/home/admin/etc", [home,newUsername].join("/"));
                    fsHandler.fsCopy("/home/admin/Documents/template", [home,newUsername,'Documents'].join("/"));
                    fsHandler.fsCopy("/home/admin/Documents/history", [home,newUsername,'Documents'].join("/"));
                }
            }

        } catch(err){
            console.log(err)
        } 
    };
}

var userHandler = new UserHandler();