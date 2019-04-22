class JsonParse {
	constructor(){

		this.renderCount = 0;
		this.elementCount = 0;
		this.arrayCount = 0;
		this.objectCount = 0;
		this.tree = null;
		this.currentlyFocused = null;
		this.currentFocusElement = null;
	}

	init(){

		window.transformTree = function(parseTree) {
			var tree = null;
			var treeMap = [];
		  
			function register(treeish) {
			  treeMap.push(treeish);
			  treeish.index = treeMap.length - 1;
			}
		  
			var TreeVoid = function(address) {
			  this.address = address;
			  this.value = "(null)";
			  register(this);
			}
		  
			Object.defineProperty(TreeVoid.prototype, "type", { value: "void" });
			Object.defineProperty(TreeVoid.prototype, "typeLabel", { value: "Void" });
			Object.defineProperty(TreeVoid.prototype, "simple", { value: true });
		  
			var TreeString = function(address, value) {
			  this.address = address;
			  this.value = value.toString();
			  register(this);
			}
		  
			Object.defineProperty(TreeString.prototype, "type", { value: "string" });
			Object.defineProperty(TreeString.prototype, "typeLabel", { value: "String" });
			Object.defineProperty(TreeString.prototype, "simple", { value: true });
		  
			var TreeNumber = function(address, value) {
			  this.address = address;
			  this.value = value.toString();
			  register(this);
			}
		  
			Object.defineProperty(TreeNumber.prototype, "type", { value: "number" });
			Object.defineProperty(TreeNumber.prototype, "typeLabel", { value: "Number" });
			Object.defineProperty(TreeNumber.prototype, "simple", { value: true });
		  
			var TreeBoolean = function(address, value) {
			  this.address = address;
			  this.value = value.toString();
			  register(this);
			}
		  
			Object.defineProperty(TreeBoolean.prototype, "type", { value: "boolean" });
			Object.defineProperty(TreeBoolean.prototype, "typeLabel", { value: "Boolean" });
			Object.defineProperty(TreeBoolean.prototype, "simple", { value: true });
		  
			var TreeTuple = function(name, value) {
			  this.name = name;
			  this.value = value;
			}
		  
			var TreeAddress = function(parent, prop) {
			  this.parent = parent;
			  this.prop = prop;
			}
		  
			TreeAddress.prototype.full = function() {
			  var trail = [];
			  var address = this;
			  while(address) {
				trail.push(address);
				address = address.parent && address.parent.address;
			  }
			  return trail.reverse();
			}
		  
			var TreeObject = function(address) {
			  this.address = address;
			  this.tuples = [];
			  register(this);
			}
		  
			Object.defineProperty(TreeObject.prototype, "type", { value: "object" });
			Object.defineProperty(TreeObject.prototype, "typeLabel", { value: "Object" });
			Object.defineProperty(TreeObject.prototype, "simple", { value: false });
		  
			var TreeArray = function(address) {
			  this.address = address;
			  this.tuples = [];
			  register(this);
			}
		  
			Object.defineProperty(TreeArray.prototype, "type", { value: "array" });
			Object.defineProperty(TreeArray.prototype, "typeLabel", { value: "Array" });
			Object.defineProperty(TreeArray.prototype, "simple", { value: false });
		  
			function transform(val, address) {
			  var type = typeof(val);
		  
			  if(val == null) return new TreeVoid(address);
			  if(type == "string") return new TreeString(address, val);
			  if(type == "number") return new TreeNumber(address, val);
			  if(type == "boolean") return new TreeBoolean(address, val);
			  return transformObject(val, address);
			}
		  
			function transformObject(val, address) {
			  var result = (val instanceof Array) ? new TreeArray(address) : new TreeObject(address);
		  
			  result.tuples = Object.keys(val).map(function(prop) {
				return new TreeTuple(prop, transform(val[prop], new TreeAddress(result, prop)));
			  });
		  
			  return result;
			}
		  
			var root = transform(parseTree, null);
			
			var nestingLevel = 0;
			treeMap.forEach(function(item) {
			  if(!item.address) return;
		  
			  var addressLength = item.address.full().length;
			  if(addressLength > nestingLevel) nestingLevel = addressLength;
			});
		  
			function fromIndex(index) {
			  return treeMap[index];
			}
		  
			return {
			  root: root,
			  nestingLevel: nestingLevel + 1,
			  fromIndex: fromIndex
			};
		}

		jsonParse.load();
	}

	
	escapeHTML(unsafe) {
		if(unsafe == null) return "";
		return unsafe.toString()
		 .replace(/&/g, "&amp;")
		 .replace(/</g, "&lt;")
		 .replace(/>/g, "&gt;")
		 .replace(/"/g, "&quot;")
		 .replace(/'/g, "&#039;");
	  }
	  
	  
	  
	  doStats() {
		var out = "<input type='button' id='statst' onclick='jsonParse.showStats();' value='Show Statistics' style='float: right;' />\n"
		 + "<div class='clear'></div>\n"
		  + "<div id='statscon'>\n<table>\n<tr>\n<td>数组：</td>\n<td>" + jsonParse.arrayCount + "</td>\n</tr>\n"
		  + "<tr>\n<td>对象：</td>\n<td>" + jsonParse.objectCount + "</td>\n</tr>\n"
		   + "<tr>\n<td>所有：</td>\n<td>" + jsonParse.elementCount + "</td>\n</tr>\n"
			+ "<tr>\n<td>深度：</td>\n<td>" + jsonParse.tree.nestingLevel + "</td>\n</tr>\n"
			+ "</table>\n</div>\n</div>\n";
		return out;
	  }
	  
	  parse(str) {
		try {
		  return JSON.parse(str);
		}
		catch(e) {
		  if(e instanceof SyntaxError) {
			alert("There was a syntax error in your JSON string.\n" + e.message + "\nPlease check your syntax and try again.");
		  }
		  else {
			alert("There was an unknown error. Perhaps the JSON string contained a deep level of nesting.");
		  }
	  
		  $("#text").focus();
		  return;
		}
	  }
	  
	  
	  render(val) {
		jsonParse.elementCount = 0;
		jsonParse.arrayCount = 0;
		jsonParse.objectCount = 0;
		jsonParse.renderCount = 0;
	  
		if(val.type == "array") return jsonParse.renderArray(val);
		if(val.type == "object") return jsonParse.renderObject(val);
		jsonParse.elementCount++;
		return "<span class='" + val.type + "' title='" + value.typeLabel + "'>" + jsonParse.escapeHTML(val.value) + "</span>";
	  }
	  
	  renderTuples(tuples) {
		var out = "";
	  
		tuples.forEach(function(tuple) {
		  var value = tuple.value;
		  out += "<tr data-index='" + value.index + "'><td>" + jsonParse.escapeHTML(tuple.name) + "</td>";
		  out += "<td class='" + value.type + "'" + (value.simple ? " title='" + value.typeLabel + "'" : "") + ">";
		  
		  if(value.simple) {
			jsonParse.elementCount++;
			out += jsonParse.escapeHTML(value.value);
		  }
		  else if(value.type == "array") {
			out += jsonParse.renderArray(value);
		  }
		  else if(value.type == "object") {
			out += jsonParse.renderObject(value);
		  }
		  out += "</td></tr>";
		});
	  
		return out;
	  }
	  
	  renderArray(array) {
		jsonParse.elementCount++;
		jsonParse.arrayCount++;
		jsonParse.renderCount++;
		if(!array.tuples.length) return "<div data-index='" + array.index + "'>(空数组)</div>";
	  
		var out = "<div class='array" + (jsonParse.renderCount >= 1000 ? " minimised" : "") + "' data-index='" + array.index + "' onmouseover='jsonParse.doFocus(event, this);'><div class='widget'></div><h3>数组</h3>";
		out += "<table><tr><th>Index</th><th>Value</th></tr>";
		out += jsonParse.renderTuples(array.tuples);
		out += "</table></div>";
		return out;
	  }
	  
	  renderObject(object) {
		jsonParse.elementCount++;
		jsonParse.objectCount++;
		jsonParse.renderCount++;
		if(!object.tuples.length) return "<div data-index='" + object.index + "'>(空对象)</div>";
	  
		var out = "<div class='object" + (jsonParse.renderCount >= 1000 ? " minimised" : "") + "' data-index='" + object.index + "' onmouseover='jsonParse.doFocus(event, this);'><div class='widget'></div><h3>对象</h3>";
		out += "<table><tr><th>名称</th><th>值</th></tr>";
		out += jsonParse.renderTuples(object.tuples);
		out += "</table></div>";
		return out;
	  }
	  
	  json2html(str) {
		var parseTree = jsonParse.parse(str);
		if(!parseTree) return;
		jsonParse.tree = transformTree(parseTree);
		var result = jsonParse.render(jsonParse.tree.root);
	  
		// $("#output").innerHTML = result;
	  
		// $("#stats").innerHTML = jsonParse.doStats();
		// $("#stats").className = "";
	  
		// $("#submit").value = "json 2 html";
		// $("#submit").disabled = null;
	  
		// $("#output").scrollIntoView();
		return result;
	  }
	  
	  
	  showStats() {
		if($("#statscon").style.display != "block") {
		  $("#statscon").style.display = "block";
		  $("#stats").className = "statson";
		  $("#statst").value = "Hide Statistics";
		}
		else {
		  $("#statscon").style.display = "none";
		  $("#stats").className = "";
		  $("#statst").value = "Show Statistics";
		}
	  }
	  
	  itemPath(item) {
		var path = ["<root>"];
	  
		if(item.address) {
		  item.address.full().forEach(function(address) {
			path.push(address.parent.type == "array" ? "[" + address.prop + "]" : "." + address.prop);
		  });
		}
	  
		return path.join("");
	  }
	  
	  itemTrailLabel(item) {
		return item.typeLabel + " (" + item.tuples.length + " item" + (item.tuples.length != 1 ? "s)" : ")");
	  }
	  
	  itemTrail(item) {
		var trail = ["Root"];
	  
		if(item.address) {
		  item.address.full().forEach(function(address) {
			trail.push(jsonParse.itemTrailLabel(address.parent));
		  });
		}
	  
		if(!item.simple) trail.push(jsonParse.itemTrailLabel(item));
	  
		return trail.join(" > ");
	  }
	  
	  focusObject(element) {
		if(element == jsonParse.currentFocusElement) return;
	  
		jsonParse.currentFocusElement = element;
	  
		var item = jsonParse.tree.fromIndex(parseInt(element.dataset.index));
	  
		$("#focus-path").textContent = jsonParse.itemPath(item);
		$("#focus-trail").textContent = jsonParse.itemTrail(item);
	  }
	  
	  doFocus(event, ele) {
		if(jsonParse.currentlyFocused != null) jsonParse.currentlyFocused.style.outline = "none";
		ele.style.outline = "1px solid #ffa000";
	  
		jsonParse.currentlyFocused = ele;
	  
		if(!event) event = window.event;
		event.cancelBubble = true;
		if(event.stopPropagation) event.stopPropagation();
	  }
	  
	//   stopFocus() {
	// 	if(jsonParse.currentlyFocused != null) jsonParse.currentlyFocused.style.outline = "none";
	//   }
	  
	  //code from Painfully Obvious.
	  //based on code from quirksmode.org
	//   var Client = {
	// 	viewportWidth: function() {
	// 	return self.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth);
	// 	},
	  
	// 	viewportHeight: function() {
	// 	 return self.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight);
	// 	},
	  
	// 	viewportSize: function() {
	// 	 return { width: this.viewportWidth(), height: this.viewportHeight() };
	// 	}
	//   };
	  
	//   doHelp() {
	// 	$("#help-content").style.display = "block";
	// 	var bodySize = Client.viewportSize();
	  
	// 	$("#backdrop").style.display = "block";
	  
	// 	$("#help-content").style.left = ((bodySize.width / 2) - ($("#help-content").offsetWidth / 2)) + "px";
	// 	$("#help-content").style.top = ((bodySize.height / 2) - ($("#help-content").offsetHeight / 2)) + "px";
	// 	$("body").scrollIntoView();
	//   }
	  
	//   hideHelp() {
	// 	$("#help-content").style.display = "none";
	// 	$("#backdrop").style.display = "none";
	// 	$("#text").focus();
	//   }
	  
	//   clearPage() {
	// 	$("#stats").innerHTML = "";
	// 	$("#output").innerHTML = "";
	//   }
	  
	load() {
		//window.$ = document.querySelector.bind(document);
	  
		document.body.addEventListener("click", function(event) {
		  var tr = event.target.closest("div[data-index], tr[data-index]");
		  if(tr) {
			event.preventDefault();
			jsonParse.focusObject(tr);
		  }
	  
		  if(event.target.matches(".widget")) {
			event.preventDefault();
			event.target.parentNode.classList.toggle("minimised");
		  }
		});
	  
		document.body.addEventListener("mousemove", function(event) {
		  var tr = event.target.closest("div[data-index], tr[data-index]");
		  if(tr) {
			event.preventDefault();
			jsonParse.focusObject(tr);
		  }
		});
	  
		// 	if($("#text").focus) $("#text").focus();
	}
	  
	//   window.onload = load;
}

let jsonParse = new JsonParse();

jsonParse.init();