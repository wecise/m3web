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
                rtn = xhr.responseText;
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
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }

        })

        return rtn;

    };

    /* 
        用户更新
    */
    userUpdate(event,token) {
        let rtn = 0;

        let form = new FormData();
        form.append("email", event.email);
        form.append("active", event.isactive);

        jQuery.ajax({
            url: `/admin/users/${event.id}`,
            dataType: 'json',
            type: 'POST',
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            async: false,
            data: form,
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
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }

        })

        return rtn;

    };
    
    /* 
        用户删除
    */
    userDelete(event) {
        let rtn = null;

        jQuery.ajax({
            url: `/admin/users/${event}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend: function (xhr) {
                
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
                rtn = xhr.responseText;
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
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
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

    /* Add group permissions */
    addGroupPermissions(event) {
        let rtn = null;


        jQuery.ajax({
            url: "/admin/perms/group",
            dataType: 'json',
            type: 'POST',
            async: false,
            data: { name:  event.name, parent: event.parent, member: event.member },
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {
                
                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Delete group permissions */
    deleteGroupPermissions(event,token) {
        let rtn = null;
        
        jQuery.ajax({
            url: `/admin/perms/group/${event.id}`,
            dataType: 'json',
            type: 'DELETE',
            processData: false,
            contentType: false,
            async: false,
            beforeSend:function(xhr){
                xhr.setRequestHeader("X-Csrf-Token", token);
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {
                
                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Update group permissions */
    updateGroupPermissions(event) {
        let rtn = null;


        jQuery.ajax({
            url: `/admin/perms/group`,
            dataType: 'json',
            type: 'PUT',
            contentType: "application/json; charset=utf-8",
            async: false,
            data: JSON.stringify({name:event.name, parent:event.parent, member:event.member}),
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Get group permissions list by parent */
    getGroupPermissionsByParent(event) {
        let rtn = null;


        jQuery.ajax({
            url: `/admin/perms/group?parent=${event.parent}`,
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
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Get group permissions list by parent */
    getGroupPermissionsById(event) {
        let rtn = null;

        jQuery.ajax({
            url: `/admin/perms/group/${event.id}`,
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
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Add api permissions */
    addApiPermissions(event) {
        let rtn = null;

        let form = new FormData();
        form.append("name", event.name);
        _.forEach(event.pprefix, (v)=>{
            form.append("path", v);
        })

        jQuery.ajax({
            url: `/admin/perms/api`,
            dataType: 'json',
            type: 'POST',
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            async: false,
            data: form,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Delete api permissions */
    deleteApiPermissions(event) {
        let rtn = null;

        jQuery.ajax({
            url: `/admin/perms/api/${event.name}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Update api permissions */
    UpdateApiPermissions(event) {
        let rtn = null;

        let form = new FormData();
        _.forEach(event.pprefix, (v)=>{
            form.append("path", v);
        })

        jQuery.ajax({
            url: `/admin/perms/api/${event.name}`,
            dataType: 'json',
            type: 'PUT',
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            async: false,
            data: form,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Get api permissions List*/
    getApiPermissions() {
        let rtn = null;

        jQuery.ajax({
            url: `/admin/perms/api`,
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
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Get api permissions List By name */
    getApiPermissionsByName(event) {
        let rtn = null;

        jQuery.ajax({
            url: `/admin/perms/api/${event.name}`,
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
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

     /* Set api permissions groups */
     setApiPermissionsGroups(event) {
        let rtn = null;

        let form = new FormData();

        _.forEach(event.roleGroups, (v)=>{
            form.append("group", v);
        })

        jQuery.ajax({
            url: `/admin/perms/api/${event.name}/group`,
            dataType: 'json',
            type: 'PUT',
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            async: false,
            data: form,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Set api permissions groups */
    deleteApiPermissionsGroups(event) {
        let rtn = null;

        let groups = _.map(event.roleGroups, (v)=>{
            return `group=${v}`;
        }).join("&");

        jQuery.ajax({
            url: `/admin/perms/api/${event.name}/group?${groups}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
            }
        });
        return rtn;
    };

    /* Refresh App Cache When CURD for /matrix/portal/tools */
    refreshAppCache() {
        
        jQuery.ajax({
            url: 'admin/perms/app/refresh',
            dataType: 'json',
            type: 'GET',
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {
                userHandler.ifSignIn(data);
            },
            error: function(xhr, textStatus, errorThrown) {
            }
        });
        
    };

    
}

var userHandler = new UserHandler();