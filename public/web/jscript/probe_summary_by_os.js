var _sumByLinux = odb.mql("select name from /matrix/entity/linux limit -1")  || {};
var _sumByWindow = odb.mql("select name from /matrix/entity/window limit -1")  || {};
var _sumByUnix = odb.mql("select name from /matrix/entity/unix limit -1")  || {};

var rtn = {linux: _sumByLinux,window: _sumByWindow, unix: _sumByUnix, aix: {}};

OUTPUT = JSON.stringify(rtn);