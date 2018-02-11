
var VueLoader = new function(){
	var D = document;
	var me = this;
	this.debug = function(s) { return window.VueLoaderDebug && window.VueLoaderDebug(s); };

	// Vue的错误信息会输出到console，不会抛出异常
	Vue.config.errorHandler = function (err, vm) {
		console.log("error " + err.message + "\r\n" + err.stack);
	}

	Vue.mixin({
		beforeMount: function() {
			this.vcname = this.constructor.options.name;
			//console.log("beforeMount " + vcname);
			if (!this._orender) {
				this._orender = this._render;
				this._render = function() {
					var vnode = this._orender.apply(this, arguments);
					var vctag = this.vcname;
					if (vctag && vnode) {
						var cparent = vnode.parent;
						var pdata = cparent && cparent.data || {};
						var pattrs = pdata && pdata.attrs || {};
						var cdata = vnode.data;
						if (!cdata) {
							vnode.data = cdata = {};
						}
						if (!cdata.attrs) {
							cdata.attrs = {};
						}
						var pcls = pdata['class'] || {};
						//console.log(pcl + "parent class:" + JSON.stringify(pcls));
						var cls = cdata['class'];
						if (!cls) {
							cdata['class'] = cls = {};
						}
						if (cdata.staticClass) {
							var scs = cdata.staticClass.split(/\s+/);
							for (var i=0; i<scs.length; i++) {
								cls[scs[i].trim()] = true;
							}
							cdata.staticClass = "";
						}
						cls[vctag] = !pcls[vctag];
						var ovaInheritSkin = cdata["ovaInheritSkin"] = cdata.attrs["skin"] || cdata["ovaInheritSkin"] || pattrs["skin"] || pdata["ovaInheritSkin"];
						if (ovaInheritSkin) {
							cls[ovaInheritSkin + '-' + vctag] = !pcls[ovaInheritSkin + '-' + vctag];
						}
						if (vctag.substring(0,4)=="ovo-") {
							var ovaInheritScene = cdata["ovaInheritScene"] = cdata.attrs["scene"] || cdata["ovaInheritScene"] || pattrs["scene"] || pdata["ovaInheritScene"];
							if (ovaInheritScene && ovaInheritScene != "ovo") {
								var stag = ovaInheritScene + '-' + vctag.substring(4);
								cls[stag] = !pcls[stag];
								if (ovaInheritSkin) {
									cls[ovaInheritSkin + '-' + stag] = !pcls[ovaInheritSkin + '-' + stag];
								}
							}
						}
					}
					return vnode;
				};
			}
		},
	});
	
	var cutStr = function(txt, ss, se) {
		var is = txt.indexOf(ss);
		var ie = is>=0?txt.indexOf(se, is):-1;
		return (is>=0 && ie>=is)?txt.substring(is+ss.length,ie).trim():"";
	};
	
	var getTag = function(txt, tag) {
		var n = 0;
		var ss = "<" + tag;
		var se = "</"+tag+">";
		var rta = [];
		while(n<txt.length) {
			var is = txt.indexOf(ss, n);
			is = is>=0?txt.indexOf(">", is):-1;
			var ie = is>=0?txt.indexOf(se, is):-1;
			var n = ie>=0?(ie+se.length):(txt.length+1);
			var s = (is>=0 && ie>=is)?txt.substring(is+1,ie).trim():"";
			if (s) {
				rta.push(s);
			}
		}
		return rta;
	};
	
	var getAttr = function(txt, tag, key) {
		var p = new RegExp(key+"\\s*=\\s*([\\\'\\\"])([^\\1]*)\\1");
		var s = cutStr(txt, "<" + tag, ">");
		var s = s.match(p);
		return s&&s.length>2&&s[2]&&s[2].trim()||"";
	};
	
	this.addCSS = function(css) {
		var e=D.createElement('style');
		e.setAttribute("type","text/css");
		e.styleSheet&&(e.styleSheet.cssText=css)||e.appendChild(D.createTextNode(css));
		D.getElementsByTagName('head')[0].appendChild(e); 
	};
	
	this.addJS = function(js) {
		var e=D.createElement('script');
		e.appendChild(D.createTextNode(js));
		D.getElementsByTagName('head')[0].appendChild(e); 
	};
	
	this.parseVC = function(url, txt) {
		var ret = [];
		if (txt) {
			var vcs = getTag(txt, "code");
			if (vcs.length==0) {
				vcs = [txt];
			}
			var loadedcb = false;
			for(var vci=0; vci<vcs.length; vci++) {
				var code = vcs[vci];
				if (code) {
					try {
						var style = getTag(code, "style")[0];
						if (style) {
							this.debug("style:"+style);
							this.addCSS(style);
						}
						var template = getTag(code, "template")[0];
						var vcname = getAttr(code, "script", "id");
						var script = getTag(code, "script")[0];
						if (!script && !template && !style) {
							script = code;
						}
						//if (script.match(/props\s*\:\s*\{/)) {
						//	script = script.replace(/(props\s*\:\s*\{)/, "$1ovaInheritSkin:{},ovaInheritScene:{},");
						//} else {
						//	script = script.replace(/\{/, "{\r\nprops:{ovaInheritSkin:{},ovaInheritScene:{}},");
						//}
						if (template) {
							script = script.replace(/\{/, "{\r\ntemplate:'"+template.replace(/'/g, "\\'").replace(/\t/g,"\\t").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"',");
						}
						script = "/*** "+url+" ***/\r\nVue.component('" + vcname + "', " + script + ");";
						this.debug("script:"+script);
						this.addJS(script);
						//eval(script);
						ret.push(vcname);
						loadedcb = loadedcb || args_onloaded.vcs && args_onloaded.cb && args_onloaded.vcs.indexOf(vcname)>=0;
					} catch (e) {
						console.log(url + " parseVC Error: " + e.message);
					}
				}
			}
			if (loadedcb) {
				me.onloaded(args_onloaded.vcs, args_onloaded.cb);
			}
		}
		return ret;
	};
	
	this.url_load = null;
	this.cb_done = null;
	this.done = function(cb) {
		if (this.url_load) {
			this.cb_done = cb;
		} else {
			if (cb) {
				return cb();
			}
		}
		return this;
	};
	
	this.loadOne = function(url, cb) {
		if (cb) {
			me.debug("异步加载 "+url);
			me.url_load = url;
			$.ajax({
					url: url,
					mimeType: "text/plain",
					cache: false,
				}).done(function(txt){
					me.parseVC(url, txt);
					if (cb) {
						cb();
					}
					if (me.cb_done) {
						me.cb_done();
					}
				});
		} else {
			me.debug("同步加载 "+url);
			me.url_load = null;
			me.parseVC(url,
				$.ajax({
					url: url,
					mimeType: "text/plain",
					async: false,
					cache: false,
				}).responseText);
		}
		return me;
	};
	
	this.loadVC = function(url, cb) {
		if ($.type(url) == "string") {
			me.loadOne(url,cb);
		} else if (cb) {
			var urli = 0;
			var loadcb = function() {
				if (urli<url.length) {
					me.loadOne(url[urli], loadcb);
					urli++;
				} else {
					cb();
				}
			};
			loadcb();
		} else {
			for (var i=0; i<url.length; i++) {
				me.loadOne(url[i]);
			}
		}
		return me;
	};

	this.loadVCLink = function() {
		var links = D.getElementsByTagName('link');
		for (var i=0; i<links.length; i++) {
			if (links[i].rel == "vc" && !links[i].loaded) {
				links[i].loaded = true;
				me.loadVC(links[i].href, links[i].type=="async"?function(){}:undefined);
			}
		}
	};

	var args_onloaded = {};
	this.onloaded = function(vcs, cb) {
		var b = true;
		for (var i=0; b && i<vcs.length; i++) {
			b = Vue.component(vcs[i])?true:false;
		}
		if (b && cb) {
			cb();
			args_onloaded = {};
		} else {
			args_onloaded = {vcs: vcs, cb: cb};
		}
	};

	// document加载后（interactive）
	// vue loader 初始化之后，同步加载,直接加载,不使用回调
	{
		// 避免被后续代码覆盖
		var orsca = [];
		D.onreadystatechange = function(e) {
			for(var i=0; i<orsca.length; i++) {
				orsca[i](e);
			}
		};
		D.__defineSetter__("onreadystatechange", function(f) {
			orsca.push(f);
		});
		// 
		D.onreadystatechange = function() {
			//console.log("loadVC "+D.readyState);
			if (D.readyState == "interactive") {
				me.loadVCLink();
			}
		};
	}
	
	return this;
}();
