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

var eventHub = new Vue();


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

var GLOBAL_PARAMS_FUNC = function(){
    let _input = document.createElement("input");

    _input.id = 'hidden_input';
    _input.type = "hidden";
    _input.value = `{{.SignedUser.Company.OSpace}}`;

    document.body.appendChild(_input);

    _.delay(function(){
        console.log(document.getElementById("hidden_input").value);
    },5000);

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




var initPlugIn = function () {

    // Theme
    let _theme = localStorage.getItem("MATRIX_THEME");

    toggleTheme(_theme);


    // Robot
    $(".ai.ai-robot").removeClass("ai-robot");

    if(_.includes(['home',''],getPage())){
        $(".ai").addClass("ai-robot");
    }

    // Nav Menu level1
    let menu = {
        delimiters: ['#{', '}#'],
        el: '#nav-menu-level1',
        data: {
            model: null
        },
        template: `<ul class="dropdown-menu top-bar animated fadeInDown nav-menu-level1">
                        <li>
                            <a href="/">
                                <i class="fa fa-home fa-3x"></i> <p>首页</p>
                            </a>
                        </li>
                        <!--<li role="separator" class="divider"></li>-->
                        <li v-for="(item,index) in model" :class="index<model.length - 1?'slot-li-divider':''">
                            <a :href="item.url" :target="item.target">
                                <i :class="item.icon + ' fa-3x'"></i> <p>#{item.cnname}#</p>
                            </a>
                        </li>
                    </ul>`,
        created: function(){
            let _list = fetchData("#/matrix/portal/tools/: | sort by seat asc");
            this.model = _list.message;
            this.model.push({icon:'fa fa-plus', url:'/janesware/system?view=app', cnname:'应用管理', enname: 'App Console', target: '_parent'});
        },
        mounted: function () {

            this.$nextTick(function () {
                //$(".slot-li-divider").after(`<li role="separator" class="divider"></li>`);
            })
        }
    };

    // Nav Menu level1
    let sideMenu = {
        delimiters: ['#{', '}#'],
        el: '#sidebar-menu',
        data: {
            model: null
        },
        template: `<ul class="nav animated bounceIn">
                        <li class="dropdown top-bar">
							<a  class="dropdown-toggle" 
								href="{{AppSubUrl}}/"  
								data-toggle="dropdown" 
								role="button" 
								aria-haspopup="true" 
								aria-expanded="false"
								title="应用">
								<i class="fa fa-th fa-2x"></i> <span class="nav-label">应用</span>
							</a>
							<div id="nav-menu-level1">
							</div>
						</li>
                        <li>
                            <a href="/" data-original-title="首页">
                                <i class="fas fa-home fa-2x"></i> <span class="nav-label">首页</span>
                            </a>
                        </li>
                        <li v-for="(item,index) in model" :class="item.status">
                            <a :href="item.url" :target="item.target" :data-original-title="item.cnname">
                                <i :class="item.icon + ' fa-2x'"></i> <span class="nav-label">#{item.cnname}#</span>
                            </a>
                        </li>
                    </ul>`,
        created: function(){
            let _list = fetchData("#/matrix/portal/tools/: | sort by seat asc");
            this.model = _.map(_list.message,function(v){
                let _page = _.last(getPage().split("/"));

                if(_.endsWith(v.url,_page)){
                    return _.merge(v, {status: "active"});
                }

                return _.merge(v, {status: ""});
            });
            this.model.push({icon:'fa fa-plus', url:'/janesware/system?view=app', cnname:'应用管理', enname: 'App Console', target: '_parent', status: ''});
        },
        mounted: function () {

            this.$nextTick(function () {
                //$(".slot-li-divider").after(`<li role="separator" class="divider"></li>`);
            })
        }
    };

    _.delay(function(){
        new Vue(sideMenu);
        new Vue(menu);
    },1000)


};



/*
*  Sidebar 切换
*
* */
var toggleSideBar = function(){

	// let flag = _.sample([1,2]);
    //
	// if(flag == 1) {
    //
		// $("#sidebar").css("display","");
        // $("#content").css("margin-left","220px");

		var a = "page-sidebar-minified",
            t = "#page-container";
        $(t).hasClass(a) ? ($(t).removeClass(a), $(t).hasClass("page-sidebar-fixed") && (generateSlimScroll($('#sidebar [data-scrollbar="true"]')), $("#sidebar [data-scrollbar=true]").trigger("mouseover"), $("#sidebar [data-scrollbar=true]").stop(), $("#sidebar [data-scrollbar=true]").css("margin-top", "0"))) : ($(t).addClass(a), /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? ($('#sidebar [data-scrollbar="true"]').css("margin-top", "0"), $('#sidebar [data-scrollbar="true"]').css("overflow", "visible")) : ($(t).hasClass("page-sidebar-fixed") && ($('#sidebar [data-scrollbar="true"]').slimScroll({
            destroy: !0
        }), $('#sidebar [data-scrollbar="true"]').removeAttr("style")), $("#sidebar [data-scrollbar=true]").trigger("mouseover"))), $(window).trigger("resize")
	// } else {
    //
     //    $("#sidebar").css("display","none");
     //    $("#content").css("margin-left","0px");
	// }

};



/*
*  皮肤切换
*
* */

var MATRIX_THEME = "LIGHT";

var toggleTheme = function(event){

    if(event == 'LIGHT'){

        $(".navbar.navbar-default.navbar-fixed-top").css({
            "backgroundColor": "rgb(33, 149, 244)",
        });

        $("ul.side-bar").css({
            "backgroundColor": "rgb(33, 149, 244)",
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
            "backgroundColor": "rgb(90, 90, 90)",
        });

        $("ul.side-bar").css({
            "backgroundColor": "rgb(90, 90, 90)",
        });

        $(".layer.btn.btn-primary").css({
            "backgroundColor": "rgb(90, 90, 90)"
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
            "backgroundColor": "rgb(90, 90, 90)",
            "borderColor": "rgb(90,90,90)"
        });

        $(".navbar.navbar-default.navbar-fixed-bottom").css("background-color","rgb(90, 90, 90)");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("span").css("color","#f9f9f9");
        $(".navbar.navbar-default.navbar-fixed-bottom").find("a").css("color","#f9f9f9");
    }

    localStorage.setItem("MATRIX_THEME",event);

};



/*

       #    ###    ######  ####### ######  ####### #######
      # #    #     #     # #     # #     # #     #    #
     #   #   #     #     # #     # #     # #     #    #
    #     #  #     ######  #     # ######  #     #    #
    #######  #     #   #   #     # #     # #     #    #
    #     #  #     #    #  #     # #     # #     #    #
    #     # ###    #     # ####### ######  #######    #
 */
var robot = function(){

    $(".ai-robot").html(`<div style="position: absolute;right:0px;top: -38px;cursor: pointer;" class="animated fadeIn">
                            <img src="/web/assets/images/robot.svg" style="width:120px;height:120px;transform: scale(0.5);">
                         </div>`).click(function(){
        let _win = null;

        _win = localStorage.getItem("mx-window");

        if(!_.isEmpty(_win)){
            $(".mxWindow").remove();
        }

        _win = newWindow("robot", "∵", '<div class="animated slideInDown" id="robot-active-win"></div>', null);
        _win.setMaximizable(false);

        let _robotVue = new Vue({
            el: '#robot-active-win',
            template: '<vue-ai-robot-component id="THIS-IS-ROBOT"></vue-ai-robot-component>',
            mounted:function(){
                let me = this;

                me.$nextTick(function() {

                })
            }
        });
    });
};

var appsBox = function(){
    $(".apps-box").html(`<div style="position:absolute;right:10px;top:65px;z-index:100;">
                            <i class="fa fa-th fa-2x" style="color:rgb(182, 194, 202);cursor:pointer;"></i>
                          </div>`).click(function(){
        let _win = null;

        _win = localStorage.getItem("mx-window");

        if(!_.isEmpty(_win)){
            $(".mxWindow").remove();
        }

        _win = newWindow("appsbox","∷", '<div class="animated slideInDown" id="apps-box-win"></div>',null);
        _win.setMaximizable(false);

        let _robotVue = new Vue({
            el: '#apps-box-win',
            template: '<vue-apps-box-component id="THIS-IS-MY-APPS"></vue-apps-box-component>',
            mounted:function(){
                let me = this;

                me.$nextTick(function() {

                })
            }
        });
    });
}

var license = function(){

};


init();

initPlugIn();

_.delay(function () {
    //copyBoard();
    robot();
    //GLOBAL_PARAMS_FUNC();
    //appsBox();
},2000);




/*!
	Textarea Autosize 4.0.0
	license: MIT
	http://www.jacklmoore.com/autosize
*/
(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod);
		global.autosize = mod.exports;
	}
})(this, function (exports, module) {
	'use strict';

	var map = typeof Map === "function" ? new Map() : (function () {
		var keys = [];
		var values = [];

		return {
			has: function has(key) {
				return keys.indexOf(key) > -1;
			},
			get: function get(key) {
				return values[keys.indexOf(key)];
			},
			set: function set(key, value) {
				if (keys.indexOf(key) === -1) {
					keys.push(key);
					values.push(value);
				}
			},
			'delete': function _delete(key) {
				var index = keys.indexOf(key);
				if (index > -1) {
					keys.splice(index, 1);
					values.splice(index, 1);
				}
			}
		};
	})();

	var createEvent = function createEvent(name) {
		return new Event(name, { bubbles: true });
	};
	try {
		new Event('test');
	} catch (e) {
		// IE does not support `new Event()`
		createEvent = function (name) {
			var evt = document.createEvent('Event');
			evt.initEvent(name, true, false);
			return evt;
		};
	}

	function assign(ta) {
		if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) return;

		var heightOffset = null;
		var clientWidth = ta.clientWidth;
		var cachedHeight = null;

		function init() {
			var style = window.getComputedStyle(ta, null);

			if (style.resize === 'vertical') {
				ta.style.resize = 'none';
			} else if (style.resize === 'both') {
				ta.style.resize = 'horizontal';
			}

			if (style.boxSizing === 'content-box') {
				heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
			} else {
				heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
			}
			// Fix when a textarea is not on document body and heightOffset is Not a Number
			if (isNaN(heightOffset)) {
				heightOffset = 0;
			}

			update();
		}

		function changeOverflow(value) {
			{
				// Chrome/Safari-specific fix:
				// When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
				// made available by removing the scrollbar. The following forces the necessary text reflow.
				var width = ta.style.width;
				ta.style.width = '0px';
				// Force reflow:
				/* jshint ignore:start */
				ta.offsetWidth;
				/* jshint ignore:end */
				ta.style.width = width;
			}

			ta.style.overflowY = value;
		}

		function getParentOverflows(el) {
			var arr = [];

			while (el && el.parentNode && el.parentNode instanceof Element) {
				if (el.parentNode.scrollTop) {
					arr.push({
						node: el.parentNode,
						scrollTop: el.parentNode.scrollTop
					});
				}
				el = el.parentNode;
			}

			return arr;
		}

		function resize() {
			var originalHeight = ta.style.height;
			var overflows = getParentOverflows(ta);
			var docTop = document.documentElement && document.documentElement.scrollTop; // Needed for Mobile IE (ticket #240)

			ta.style.height = '';

			var endHeight = ta.scrollHeight + heightOffset;

			if (ta.scrollHeight === 0) {
				// If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
				ta.style.height = originalHeight;
				return;
			}

			ta.style.height = endHeight + 'px';

			// used to check if an update is actually necessary on window.resize
			clientWidth = ta.clientWidth;

			// prevents scroll-position jumping
			overflows.forEach(function (el) {
				el.node.scrollTop = el.scrollTop;
			});

			if (docTop) {
				document.documentElement.scrollTop = docTop;
			}
		}

		function update() {
			resize();

			var styleHeight = Math.round(parseFloat(ta.style.height));
			var computed = window.getComputedStyle(ta, null);

			// Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box
			var actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta.offsetHeight;

			// The actual height not matching the style height (set via the resize method) indicates that
			// the max-height has been exceeded, in which case the overflow should be allowed.
			if (actualHeight !== styleHeight) {
				if (computed.overflowY === 'hidden') {
					changeOverflow('scroll');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			} else {
				// Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
				if (computed.overflowY !== 'hidden') {
					changeOverflow('hidden');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			}

			if (cachedHeight !== actualHeight) {
				cachedHeight = actualHeight;
				var evt = createEvent('autosize:resized');
				try {
					ta.dispatchEvent(evt);
				} catch (err) {
					// Firefox will throw an error on dispatchEvent for a detached element
					// https://bugzilla.mozilla.org/show_bug.cgi?id=889376
				}
			}
		}

		var pageResize = function pageResize() {
			if (ta.clientWidth !== clientWidth) {
				update();
			}
		};

		var destroy = (function (style) {
			window.removeEventListener('resize', pageResize, false);
			ta.removeEventListener('input', update, false);
			ta.removeEventListener('keyup', update, false);
			ta.removeEventListener('autosize:destroy', destroy, false);
			ta.removeEventListener('autosize:update', update, false);

			Object.keys(style).forEach(function (key) {
				ta.style[key] = style[key];
			});

			map['delete'](ta);
		}).bind(ta, {
			height: ta.style.height,
			resize: ta.style.resize,
			overflowY: ta.style.overflowY,
			overflowX: ta.style.overflowX,
			wordWrap: ta.style.wordWrap
		});

		ta.addEventListener('autosize:destroy', destroy, false);

		// IE9 does not fire onpropertychange or oninput for deletions,
		// so binding to onkeyup to catch most of those events.
		// There is no way that I know of to detect something like 'cut' in IE9.
		if ('onpropertychange' in ta && 'oninput' in ta) {
			ta.addEventListener('keyup', update, false);
		}

		window.addEventListener('resize', pageResize, false);
		ta.addEventListener('input', update, false);
		ta.addEventListener('autosize:update', update, false);
		ta.style.overflowX = 'hidden';
		ta.style.wordWrap = 'break-word';

		map.set(ta, {
			destroy: destroy,
			update: update
		});

		init();
	}

	function destroy(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.destroy();
		}
	}

	function update(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.update();
		}
	}

	var autosize = null;

	// Do nothing in Node.js environment and IE8 (or lower)
	if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
		autosize = function (el) {
			return el;
		};
		autosize.destroy = function (el) {
			return el;
		};
		autosize.update = function (el) {
			return el;
		};
	} else {
		autosize = function (el, options) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], function (x) {
					return assign(x, options);
				});
			}
			return el;
		};
		autosize.destroy = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], destroy);
			}
			return el;
		};
		autosize.update = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], update);
			}
			return el;
		};
	}

	module.exports = autosize;
});
