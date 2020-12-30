/*
              # ####### ######
              # #     # #     #
              # #     # #     #
              # #     # ######
        #     # #     # #     #
        #     # #     # #     #
         #####  ####### ######

* */

class  JobHandler {
    constructor(){

    }

    /*
    *   作业管理
    *
    *   作业列表
    *
    *
    */
    jobList() {
        let rtn = null;

        jQuery.ajax({
            url: '/job',
            dataType: 'json',
            type: 'GET',
            async:false,
            beforeSend(xhr){},
            complete(xhr, textStatus) {},
            success(data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error(xhr, textStatus, errorThrown){
                rtn = xhr.responseJSON;
            }
        });
        return rtn;
    };

    /*
    *   作业管理
    *
    *   作业内容
    *
    *
    */
    jobContent(job) {
        let rtn = null;

        jQuery.ajax({
            url: `/job/${job}`,
            dataType: 'json',
            type: 'GET',
            async:false,
            beforeSend(xhr){},
            complete(xhr, textStatus) {},
            success(data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error(xhr, textStatus, errorThrown){
                rtn = xhr.responseJSON;
            }
        });
        return rtn;
    };

    async jobContentAsync(job) {
        let rtn = null;

        try{
            await jQuery.ajax({
                url: `/job/${job}`,
                dataType: 'json',
                type: 'GET',
                async: true,
                beforeSend(xhr){},
                complete(xhr, textStatus) {},
                success(data, status) {

                    userHandler.ifSignIn(data);

                    rtn = data;

                },
                error(xhr, textStatus, errorThrown){
                    rtn = xhr.responseJSON;
                }
            });
        } catch(err){

        }
        return rtn;
    };

    /*
    *   作业管理
    *
    *   作业Enable
    *
    *
    */
    async jobEnableAsync(job) {
        let rtn = null;
        try{
            await jQuery.ajax({
                url: `/job/enable/${job}`,
                dataType: 'json',
                type: 'GET',
                async: true,
                beforeSend(xhr){},
                complete(xhr, textStatus) {},
                success(data, status) {

                    userHandler.ifSignIn(data);

                },
                error(xhr, textStatus, errorThrown){
                    rtn = xhr.responseJSON;
                }
            });
        } catch(err){

        }
        return rtn;
    };

    /*
    *   作业管理
    *
    *   作业Enable
    *
    *
    */
    async jobDisableAsync(job) {
        let rtn = null;
        try{
            await jQuery.ajax({
                url: `/job/disable/${job}`,
                dataType: 'json',
                type: 'GET',
                async: true,
                beforeSend(xhr){},
                complete(xhr, textStatus) {},
                success(data, status) {

                    userHandler.ifSignIn(data);

                },
                error(xhr, textStatus, errorThrown){
                    rtn = xhr.responseJSON;
                }
            });
        } catch(err){

        }
        return rtn;
    };

    /*
    *   作业管理
    *
    *   添加作业
    *
    *
    */
    jobAdd(job) {
        let rtn = null;

        jQuery.ajax({
            url: '/job',
            dataType: 'json',
            type: 'POST',
            async:false,
            data: job,
            beforeSend(xhr){},
            complete(xhr, textStatus) {},
            success(data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error(xhr, textStatus, errorThrown){
                rtn = xhr.responseJSON;
            }
        });
        return rtn;
    };

    /*
    *   作业管理
    *
    *   更新作业
    *
    *
    */
   jobMerge(job) {
        let rtn = null;

        jQuery.ajax({
            url: '/job/merge',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: job,
            beforeSend(xhr){},
            complete(xhr, textStatus) {},
            success(data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error(xhr, textStatus, errorThrown){
                rtn = xhr.responseText;
            }
        });
        
        return rtn;
    };
    

    /*
    *   作业管理
    *
    *   删除作业
    *
    *
    */
    jobDelete(job) {
        let rtn = null;

        jQuery.ajax({
            url: `/job/${job.name}@${job.job.dir}`,
            dataType: 'json',
            type: 'DELETE',
            async:false,
            beforeSend:function(xhr){},
            complete: function(xhr, textStatus) {},
            success: function (data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseJSON;
            }
        });
        return rtn;
    };

    async jobDeleteAsync(job) {
        let rtn = null;
        try{
            await jQuery.ajax({
                url: `/job/${job.name}@${job.job.dir}`,
                dataType: 'json',
                type: 'DELETE',
                async: true,
                beforeSend:function(xhr){},
                complete: function(xhr, textStatus) {},
                success: function (data, status) {

                    userHandler.ifSignIn(data);

                    rtn = data;

                },
                error: function(xhr, textStatus, errorThrown){
                    rtn = xhr.responseJSON;
                }
            });
        } catch(err){
            
        }
        return rtn;
    };

    /*
    *   作业管理
    *
    *   检查作业是否存在
    *
    *
    */
    jobExist(job) {
        let rtn = null;

        jQuery.ajax({
            url: `/job/exist/${job.name}@${job.dir}`,
            dataType: 'json',
            type: 'GET',
            async:false,
            beforeSend:function(xhr){},
            complete: function(xhr, textStatus) {},
            success: function (data, status) {

                userHandler.ifSignIn(data);

                rtn = data;

            },
            error: function(xhr, textStatus, errorThrown){
                rtn = xhr.responseJSON;
            }
        });
        return rtn;
    };

    async jobExistAsync(job) {
        let rtn = null;

        try{
            await jQuery.ajax({
                url: `/job/exist/${job}`,
                dataType: 'json',
                type: 'GET',
                async: true,
                beforeSend:function(xhr){},
                complete: function(xhr, textStatus) {},
                success: function (data, status) {

                    userHandler.ifSignIn(data);

                    rtn = data;

                },
                error: function(xhr, textStatus, errorThrown){
                    rtn = xhr.responseJSON;
                }
            });
        } catch(err){

        }
        return rtn;
    };

    /*
    *   作业管理
    *
    *   获取作业
    *
    *
    */
    jobContextGet(key,prefix) {
        let rtn = null;

        jQuery.ajax({
            url: `/job/context/${key}`,
            dataType: 'json',
            type: 'GET',
            async:false,
            data: {
                prefix: prefix
            },
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if (_.isEmpty(data.message)) return rtn;

                rtn = data;

            },
            error: function(xhr, textStatus, errorThrown){
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };

    /*
    *   作业管理
    *
    *   作业状态
    *
    *
    */
    jobContextSetup(key,name,value) {
        let rtn = 1;

        jQuery.ajax({
            url: `/job/context/${key}`,
            dataType: 'json',
            type: 'PUT',
            async:false,
            data: {
                name:name,
                value: value
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
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                alertify.error("失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };

    /*
    *   作业管理
    *
    *   重置作业
    *
    *
    */
    jobContextReset(key) {
        let rtn = 1;

        jQuery.ajax({
            url: `/job/context/${key}?clear=true`,
            dataType: 'json',
            type: 'DELETE',
            async:false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + moment().format("LLL"));
                } else {
                    rtn = 0;
                    alertify.error("失败" + " " + moment().format("LLL"));
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
    *   作业管理
    *
    *   执行作业
    *
    *       参数：
    *           receive_output： false【等待执行】 true【立即执行】 default：false
    *           param：cmd
    */
    callJob(cmd,host) {
        let rtn = null;
        let event = `{"cmd": "${cmd}", "HOST!": "${host}", "timeout": 5}`;

        jQuery.ajax({
            url: '/job/remote_command@system/common',
            dataType: 'json',
            type: 'GET',
            async:false,
            timeout:3000,
            data: {
                receive_output: true,
                param: event
            },
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if (_.isEmpty(data.message)) return rtn;

                rtn = data;

            },
            error: function(xhr, textStatus, errorThrown){
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };

    callBobJob(cmd,host) {
        let rtn = null;
        let event = `{"cmd": "${cmd}", "HOST!": "${host}", "timeout": 6000}`;

        jQuery.ajax({
            url: '/job/remote_wincall@system/common',
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {
                receive_output: true,
                param: event
            },
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if (_.isEmpty(data.message)) return rtn;

                rtn = data;

            },
            error: function(xhr, textStatus, errorThrown){
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };
}

var jobHandler = new JobHandler();