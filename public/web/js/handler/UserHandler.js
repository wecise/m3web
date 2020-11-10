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
            },
            complete: function (xhr, textStatus) {
                
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

                // Audit
                auditLogHandler.writeLog("system:user", "Query: " + event, 0);

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:user", "Query: " + event, 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:user", "Add: " + event.username, 0);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:user", "Add: " + event.username, 1);
            }

        })

        return rtn;

    };

    /* 
        用户更新
    */
    userUpdate(event,token) {
        let rtn = 0;

        let data = {
            email: event.email, 
            mobile: event.mobile,
            telephone: event.telephone,
            firstname: event.firstname,
            lastname: event.lastname,
            wechat: event.wechat,
            address: event.address,
            isactive: event.isactive,
            isadmin: event.isadmin,
            status: event.status
        };

        if(event.resetPasswd){
            _.extend(data, {passwd: event.passwd});
        }
        
        jQuery.ajax({
            url: `/admin/users/${event.id}`,
            dataType: 'json',
            type: 'POST',
            processData: false,
            contentType: false,
            contentType: 'application/json; charset=utf-8',
            async: false,
            data: JSON.stringify(data),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("X-Csrf-Token", token);
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

                    // Audit
                    auditLogHandler.writeLog("system:user", "Update: " + event.username, 0);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:user", "Update: " + event.username, 1);
            }

        })

        return rtn;

    };

    async userUpdateAsync(event,token) {
        let rtn = 0;
        
        try{

        
            let data = {
                email: event.email, 
                mobile: event.mobile,
                telephone: event.telephone,
                firstname: event.firstname,
                lastname: event.lastname,
                wechat: event.wechat,
                address: event.address,
                isactive: event.isactive,
                isadmin: event.isadmin,
                status: event.status
            };

            if(event.resetPasswd){
                _.extend(data, {passwd: event.passwd});
            }
            
            await jQuery.ajax({
                url: `/admin/users/${event.id}`,
                dataType: 'json',
                type: 'POST',
                processData: false,
                contentType: false,
                contentType: 'application/json; charset=utf-8',
                async: true,
                data: JSON.stringify(data),
                beforeSend(xhr) {
                    xhr.setRequestHeader("X-Csrf-Token", token);
                },
                complete(xhr, textStatus) {
                    // 初始化新用户文件系统
                    if(event.otype == 'usr'){
                        userHandler.userFsInit(event.username);
                    }
                },
                success(data, status) {

                    userHandler.ifSignIn(data);

                    if( _.lowerCase(data.status) == "ok"){
                        rtn = 1;

                        // Audit
                        auditLogHandler.writeLog("system:user", "Update: " + event.username, 0);
                    }

                },
                error(xhr, textStatus, errorThrown) {
                    rtn = xhr.responseText;

                    // Audit
                    auditLogHandler.writeLog("system:user", "Update: " + event.username, 1);
                }

            })
        } catch(err){

        }
        return rtn;

    };
    
    /* 
        用户删除
    */
    userDelete(event) {
        let rtn = null;

        jQuery.ajax({
            url: `/admin/users/${event.id}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend: function (xhr) {
                
            },
            complete: function (xhr, textStatus) {
                // 删除用户文件系统
                if(event.otype == 'usr'){
                    userHandler.userFsDelete(event.username);
                }
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;

                    // Audit
                    auditLogHandler.writeLog("system:user", "Delete: " + event.username, 0);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:user", "Delete: " + event.username, 1);
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

            // Audit
            auditLogHandler.writeLog("system:user", "Init user DFS: " + newUsername, 0);

        } catch(err){
            console.log(err)

            // Audit
            auditLogHandler.writeLog("system:user", "Init user DFS: " + newUsername, 1);
        } 
    };

    /* 用户文件系统删除 */
    userFsDelete(newUsername) {
        
        try{

            if(newUsername == 'admin'){
                
                return;

            } else {

                // 检查当前用户FS是否存在
                let home = ["","home"].join("/");
                let check = fsHandler.fsCheck(home,newUsername);
                // 如果不存在，进行删除
                if(check){
                    fsHandler.fsDelete("/home", newUsername);
                }
            }

            // Audit
            auditLogHandler.writeLog("system:user", "Delete user DFS: " + newUsername, 0);

        } catch(err){
            console.log(err)

            // Audit
            auditLogHandler.writeLog("system:user", "Delete user DFS: " + newUsername, 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Add group permissions: " + event.name + " 【" +  event.member + "】", 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Add group permissions: " + event.name + " 【" +  event.member + "】", 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Delete group permissions : " + event.id, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Delete group permissions: " + event.id, 1);
            }
        });
        return rtn;
    };

    /* Update group permissions */
    async updateGroupPermissionsAsync(event) {
        let rtn = null;

        try{
            await jQuery.ajax({
                url: `/admin/perms/group`,
                dataType: 'json',
                type: 'PUT',
                contentType: "application/json; charset=utf-8",
                async: true,
                data: JSON.stringify({name:event.name, parent:event.parent, member:event.member}),
                beforeSend:function(xhr){
                },
                complete: function(xhr, textStatus) {
                    
                },
                success: function (data, status) {

                    userHandler.ifSignIn(data);

                    if( _.lowerCase(data.status) == "ok"){
                        rtn = 1;

                        // Audit
                        auditLogHandler.writeLog("Ussystem:permissioner", "Update group permissions: " + event.name + " 【" +  event.member + "】", 0);
                    }

                },
                error: function(xhr, textStatus, errorThrown) {
                    rtn = xhr.responseText;

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Update group permissions: " + event.name + " 【" +  event.member + "】", 1);
                }
            });
        } catch(err){
            
        }
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Query group permissions: " + event.parent, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Query group permissions: " + event.parent, 1);
            }
        });
        return rtn;
    };

    async getGroupPermissionsByParentAsync(event) {
        let rtn = null;

        try{
            await jQuery.ajax({
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

                        // Audit
                        auditLogHandler.writeLog("system:permission", "Query group permissions: " + event.parent, 0);
                    }

                },
                error: function(xhr, textStatus, errorThrown) {
                    rtn = xhr.responseText;

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Query group permissions: " + event.parent, 1);
                }
            });
        } catch(err){

        }
        
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Query group permissions: " + event.id, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;
                // Audit
                auditLogHandler.writeLog("system:permission", "Query group permissions: " + event.id, 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Add api permissions: " + event.name, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Add api permissions: " + event.name, 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Delete api permissions: " + event.name, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Delete api permissions: " + event.name, 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Update api permissions: " + event.name, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Update api permissions: " + event.name, 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:permissionser", "Query api permissions", 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Query api permissions", 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Query api permissions: " + event.name, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Query api permissions: " + event.name, 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Add api permissions Group: " + event.name, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Add api permissions Group: " + event.name, 1);
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

                    // Audit
                    auditLogHandler.writeLog("system:permission", "Delete api permissions Group: " + event.name, 0);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                rtn = xhr.responseText;

                // Audit
                auditLogHandler.writeLog("system:permission", "Delete api permissions Group: " + event.name, 1);
            }
        });
        return rtn;
    };

    /* Refresh App Cache When CURD for /matrix/portal/tools */
    refreshAppCache() {
        
        jQuery.ajax({
            url: '/admin/perms/app/refresh',
            dataType: 'json',
            type: 'GET',
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
                // Audit
                auditLogHandler.writeLog("system:permission", "Refresh app Cache", 0);
            },
            success: function (data, status) {
                userHandler.ifSignIn(data);
            },
            error: function(xhr, textStatus, errorThrown) {
                // Audit
                auditLogHandler.writeLog("system:permission", "Refresh app Cache", 1);
            }
        });
        
    };

    
}

var userHandler = new UserHandler();