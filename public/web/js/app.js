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

//var eventHub = new Vue();

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




/*
*  Theme toggle
*
* */
var MATRIX_THEME = "DARK";

var toggleTheme = function(event){

    if(event == 'LIGHT'){

        $(".navbar.navbar-default.navbar-fixed-top").css({
            "backgroundColor": "rgb(33, 149, 244)",
        });

        $("#sidebar").css({
            "backgroundColor": "rgb(33, 149, 244)!important",
        });

        $("#sidebar-bg").css({
            "backgroundColor": "rgb(33, 149, 244)!important",
        });

    	$(".sidebar-toggle i").css({
            "color": "rgb(166, 211, 248)"
        });

        $(".layer.btn.btn-primary").css({
            "backgroundColor": "rgb(33, 149, 244)"
        });

        $(".layer > .dropdown > a").css({
            "color": "rgb(110, 180, 236)"
        });

        $(".layer > .dropdown > i").css({
            "color": "rgba(255,255,255,0.5)"
        });

        $(".layer a").css({
            "color": "rgb(255,255,255)"
        });

        $(".row .btn.btn-primary").css({
            "backgroundColor": "rgb(33, 149, 244)",
            "borderColor": "rgba(0, 0, 0, 0)"
        });

        $(".navbar.navbar-default.navbar-fixed-bottom").css("background-color","rgb(240, 243, 244)");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("span").css("color","#333333");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("a").css("color","#333333");

    } else if (event == 'DARK'){

        $(".navbar.navbar-default.navbar-fixed-top").css({
            "backgroundColor": "rgb(8, 62, 106)",
        });

        $("#sidebar").css({
            "backgroundColor": "rgb(8, 62, 106)!important",
        });

        $("#sidebar-bg").css({
            "backgroundColor": "rgb(8, 62, 106)!important",
        });

        $(".sidebar-toggle i").css({
            "color": "rgb(141, 146, 151)"
    	});

        $(".layer.btn.btn-primary").css({
            "backgroundColor": "rgb(8, 62, 106)"
        });

        $(".layer > .dropdown > a").css({
            "color": "rgb(255,255,255)"
        });

        $(".layer > .dropdown > i").css({
            "color": "rgba(255,255,255,0.5)"
        });

        $(".layer a").css({
            "color": "rgb(255,255,255)"
        });

        $(".row .btn.btn-primary").css({
            "backgroundColor": "rgb(8, 62, 106)",
            "borderColor": "rgb(8, 62, 106)"
        });

        $(".navbar.navbar-default.navbar-fixed-bottom").css("background-color","rgb(8, 62, 106)");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("span").css("color","#f9f9f9");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("a").css("color","#f9f9f9");
    }

    localStorage.setItem("MATRIX_THEME",event);

};


init();
