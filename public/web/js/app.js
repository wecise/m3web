/*
*
*      __  __   ____
*    |  \/  | |__ /
*    | \  / |  |_ \
*    | |\/| | |___/
*    | |  | |
*    |_|  |_|
*
*
*/

"use strict";

var GLOBAL_OBJECT=  {
    company: {
        name: "",
        global: {},
        dimension: [],
        object: {
            event: {},
            syslog: {},
            journal: {},
            raw: {},
            log: {},
            performance: {},
            tickets: {},
            change: {},
        }
    }
};

var init =  function(){

    GLOBAL_OBJECT.company.global = GLOBAL_CONFIG.global.timeline_scale;
    GLOBAL_OBJECT.company.name = localStorage.getItem("uname");// `{{.SignedUser.Company.OSpace}}`;
    if (_.isEmpty(GLOBAL_OBJECT.company.name )){
        GLOBAL_OBJECT.company.name = 'wecise';
    }

    GLOBAL_OBJECT.company.name = GLOBAL_OBJECT.company.name.replace(/"/g,"");
    let _name = GLOBAL_OBJECT.company.name;

    GLOBAL_OBJECT.company.dimension = GLOBAL_CONFIG.keyspace['wecise'].dimension;

    if(GLOBAL_CONFIG.keyspace[_name]){
        GLOBAL_OBJECT.company.dimension = GLOBAL_CONFIG.keyspace[_name].dimension;
    }

    _.forEach(_.keys(GLOBAL_OBJECT.company.object),function(v){
        if(!_.isEmpty(GLOBAL_CONFIG.keyspace[_name])){
            GLOBAL_OBJECT.company.object[v] = GLOBAL_CONFIG.keyspace[_name][v][GLOBAL_CONFIG.keyspace[_name][v].name];
        } else {
            GLOBAL_OBJECT.company.object[v] = [];
        }
    })
};

init();
