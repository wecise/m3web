/*

        ######  ####### #       ###  #####  #     #
        #     # #     # #        #  #     #  #   #
        #     # #     # #        #  #         # #
        ######  #     # #        #  #          #
        #       #     # #        #  #          #
        #       #     # #        #  #     #    #
        #       ####### ####### ###  #####     #
*/

class PolicyHandler {
    constructor(){

    }

    /*
    *  策略管理
    *
    *  Add Cmd Policy
    *
    *  var data = {
                    "name": "test",
                    "command": "test.sh",
                    "depotname": "test",
                    "depotversion": "1.1",
                    "ctype": 0,
                    "interval": 10,
                    "unit": "second",
                    "rule": "/matrix/rules/test",
                    "hosts": [
                        "mxsvr221"
                    ],
                    "split": true,
                    "delimiter": "\n",
                    "delimitereol":false,
                    "tags": [
                        "test"
                    ],
                    "attrs": {}
                    };
    *
    * */
    cmdPolicyAdd(event) {

        let rtn = 0;

        /*let fm = new FormData();

        fm.append("name", event.name);
        fm.append("command", event.command);
        fm.append("depotname", event.depot.name);
        fm.append("depotversion", event.depot.version);
        fm.append("ctype", event.ctype);
        fm.append("interval", event.interval);
        fm.append("unit", event.unit);
        fm.append("rule", event.rule);

        _.forEach(event.hosts,function(v){
            fm.append("hosts", v);
        })

        fm.append("split", event.split);
        fm.append("delimiter", event.delimiter);
        fm.append("delimitereol", event.delimitereol);

        _.forEach(event.tags,function(v){
            fm.append("tags", v);
        })

        fm.append("attrs", event.attrs);*/

        jQuery.ajax({
            url: '/monitoring/policy',
            dataType: 'json',
            type: 'POST',
            processData: false,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(event),
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
                    alertify.success("添加成功" + " " + data.message);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("添加失败" + " " + xhr.responseText);
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };


    /*
    *  策略管理
    *
    *  Add Log Policy
    *
    *  var data = {
                    "name": "testlog",
                    "rule": "/matrix/rules/log/etcd",
                    "dir": "/opt/matrix/var/logs/etcd",
                    "match": "out.log",
                    "delimiter": "\n",
                    "delimitereol": false,
                    "hosts": [
                        "mxsvr221"
                    ],
                    "tags": [
                        "test"
                    ],
                    "attrs": {}
                    };
    *
    * */
    logPolicyAdd(event) {

        let rtn = 0;

        let fm = new FormData();

        fm.append("name", event.name);
        fm.append("rule", event.rule);
        fm.append("dir", event.dir);
        fm.append("match", event.match);
        fm.append("delimiter", event.delimiter);
        fm.append("delimitereol", event.delimitereol);

        _.forEach(event.hosts,function(v){
            fm.append("hosts", v);
        })

        _.forEach(event.tags,function(v){
            fm.append("tags", v);
        })

        fm.append("attrs", event.attrs);

        jQuery.ajax({
            url: '/monitoring/policy/log',
            type: 'POST',
            dataType: 'json',
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            data: fm,
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
                    alertify.success("添加成功" + " " + data.message);
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                rtn = 0;
                alertify.error("添加失败" + " " + xhr.responseText);
                console.log("[" + moment().format("LLL") + "] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });
        return rtn;
    };


    /*
    *  策略管理
    *
    *  Deploy Policy
    */
    policyDeploy(event) {
        let rtn = 0;

        jQuery.ajax({
            url: '/monitoring/policy/deploy/${event}',
            dataType: 'json',
            type: 'POST',
            processData: false,
            contentType: false,
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
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
    *  策略管理
    *
    *  Undeploy Policy
    *
    * */
    policyDelete(event) {
        let rtn = 0;

        jQuery.ajax({
            url: `/monitoring/policy/undeploy/${event}`,
            dataType: 'json',
            type: 'POST',
            processData: false,
            contentType: false,
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                userHandler.ifSignIn(data);

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
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
    *  策略管理
    *
    *  Get policy extend
    *
    * */
    policyExtendList() {
        let rtn = null;

        jQuery.ajax({
            url: '/monitoring/policy/extend/matrix/rules/test',
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
                    rtn = data;
                }

            },
            error: function(xhr, textStatus, errorThrown){
                alertify.error("失败" + " " + xhr.responseText);
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;
    };


    /*
    *  策略管理
    *
    *   Update policy extend
    *   ltsv detail http://ltsv.org/
    *   ltsv delimiter: \t
    *
    *   event = 'key:mxsvr201 val:127.0.0.1'
    *
    * */
    policyExtendUpdate(event) {
        let rtn = 0;

        jQuery.ajax({
            url: '/monitoring/policy/extend/matrix/rules/test',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: event,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                if( _.lowerCase(data.status) == "ok"){
                    rtn = 1;
                    alertify.success("成功" + " " + data.message);
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
}

var policyHandler = new PolicyHandler();