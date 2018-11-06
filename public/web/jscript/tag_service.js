// Input  input = { action: "", class: "", tag: "", id: ""};
var input = JSON.parse(decodeURIComponent(INPUT));

// Handler
var rtn = null;
if(input.action == '+'){
  rtn = odb.mql("update " + input.class + " tags = tags + '" + input.tag + "' where id='" + input.id + "'");
} else {
  rtn = odb.mql("update " + input.class + " tags = tags - '" + input.tag + "' where id='" + input.id + "'");
}

// Return result
OUTPUT = rtn;