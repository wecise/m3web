ace.define("ace/snippets/mql",[], function(require, exports, module) {
"use strict";

// exports.snippetText = "snippet cc*\n\
// 	create class ${1:class_name} (\n\
// 		${2:column_name}  ${3:type}  ${4:alias}, \n\
// 		keys( ${5:columns} ),\n\
// 		index( ${6:columns} ),\n\
// 	)with ${7:ttl=value}, ${8:alias=value};\n\
// snippet cr*\n\
// 	drop class ${1:class_name};\n\
// snippet s*\n\
// 	select * from ${1:/matrix};\n\
// snippet de*\n\
// 	delete * from ${1:class_name};\n\
// snippet ad*\n\
// 	alter class ${1:class_name} add column ${2:column_name} ${3:type};\n\
// snippet ar*\n\
// 	alter class ${1:class_name} drop column ${2:column_name};\n\
// snippet adi*\n\
// 	alert class  ${1:class_name} add index ${2:index_name} ${3:type};\n\
// snippet ari*\n\
// 	alert class  ${1:class_name} drop index ${2:index_name};\n\
// snippet as*\n\
// 	alert class  ${1:class_name} set ${2:key=value};\n\
// snippet mat*\n\
// 	match(${1:node_name}) - [:${2:edge_name}*${3:step_number}] -> (${4:node_name});\n\
// ";

exports.snippetText = "snippet cre*(Create Class)\n\
	create class ${1:class_name} (\n\
		${2:column_name}  ${3:type}  ${4:alias}, \n\
		keys( ${5:columns} ),\n\
		index( ${6:columns} ),\n\
	)with ${7:ttl=value}, ${8:alias=value};\n\
snippet dro*(Drop Class)\n\
	drop class ${1:class_name};\n\
snippet sel*(Select) \n\
	select * from ${1:/matrix};\n\
snippet del*(Delete) \n\
	delete * from ${1:class_name};\n\
snippet ad*(Add Cloumn)\n\
	alter class ${1:class_name} add column ${2:column_name} ${3:type};\n\
snippet ar*(Drop Cloumn)\n\
	alter class ${1:class_name} drop column ${2:column_name};\n\
snippet adi*(Add Index)\n\
	alert class  ${1:class_name} add index ${2:index_name} ${3:type};\n\
snippet ari*(Drop Index)\n\
	alert class  ${1:class_name} drop index ${2:index_name};\n\
snippet as*(Set Param)\n\
	alert class  ${1:class_name} set ${2:key=value};\n\
snippet mat*(Graph Query)\n\
	match(${1:node_name}) - [:${2:edge_name}*${3:step_number}] -> (${4:node_name});\n\
";
exports.scope = "mql";

});
                (function() {
                    ace.require(["ace/snippets/mql"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            