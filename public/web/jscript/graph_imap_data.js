// Input
var _input = JSON.parse(decodeURIComponent(INPUT));

_input.push({gid:23,name:'wecise'});// for testing

var _host = "('" + _.map(_input,function(v,k){ return v.name; }).join("','")+("')");

var _eventTmp = eval('odb.mql("select id,host,name,msg,class,severity,status from /matrix/devops/event/ where host in '+_host+' and severity>=3")');

// Summary
var _eventList = _.map(_eventTmp,function(v){
  var groupInput = _.groupBy(_input,'name');
  
  var maxBySeverity = _.max(_eventTmp,function(val){return val.severity;}).severity;
  
  return _.extend(v, {severity:maxBySeverity, gid: groupInput[v.host][0].gid});
});

// Gen the result 
var rtn = {
    
    columns: [
        {"data":"name","title":"级别",className: 'text-right',render:'var s=function(data,type,row){ if(data >=5){return "重大告警";} else if(data == 4){return "一般告警";} else { return "一般告警";} };eval(s);'},
        {"data":"ftype","title":"状态",className: 'text-right',render:'var s=function(data,type,row){ if(data >=5){return "重大告警";} else if(data == 4){return "一般告警";} else { return "一般告警";} };eval(s);'},
        {"data":"msg","title":"告警内容",className: 'text-right'},
        {"data":"vtime","title":"告警时间",className: 'text-right',render:'var s=function(data,type,row){return moment(data).format("YYYY-MM-DD HH:mm:ss");};eval(s);'},
        {"data":"class", "title":"事件类型","visible":false}
    ],
    dataset: _eventList
};

// Output
OUTPUT = rtn;