// summary by os
var _sumByLinux = 0;
var _l = odb.mql("select count(*) from /matrix/entity/linux limit -1");
if(_l){
    _sumByLinux = _l[0].count;
}

var _sumByWindow = 0;
var _w = odb.mql("select count(*) from /matrix/entity/linux limit -1");
if(_w){
    _sumByWindow = _w[0].count;
}

var _sumByUnix = 0;
var _u = odb.mql("select count(*) from /matrix/entity/linux limit -1");
if(_u){
    _sumByUnix = _u[0].count;
}

var _hostListTmp = odb.mql("select * from /matrix/system/hostinfo/ limit -1")  || [];


// Gen the List of Probe
var _hostList = {
    options: {},
    columns: [
        {"data":"checkbox","title":"选择","visible":true, className: '',checkboxes: {
                selectRow: true
            }},
        {"data":"host","title":"服务器名称","visible":true, className: 'text-right', "defaultContent": '<div class="dropdown"><button onclick="btnFunction()" class="dropbtn">...</button><div id="mydrop" class="dropdown-content"><a href="#">Some Option</a></div></div>'},
        {"data":"ip","title":"IP","visible":true, className: 'text-right'},
        {"data":"os","title":"操作系统","visible":true, className: 'text-right'},
        {"data":"probe_version","title":"探针版本","visible":true, className: 'text-right'},
        {"data":"probe_status","title":"探针状态","visible":true, className: 'text-right', render: "var s=function(data,type,row){return '运行中 <i class=\"fas fa-cog fa-spin\" style=\"color:#8bc34a\"></i>';};eval(s);"},
        {"data":"cpu_usedpercent","title":"CPU利用率","visible":true, className: 'text-right', "render": "var s=function(data,type,row){ if(data>=65){return '<progress value=\"'+data+'\" max=\"100\"></progress> <b style=\"font-size:12px;\">'+data+'%</b>'; } else if(data<60 && data>30) {return '<progress value=\"'+data+'\" max=\"100\"></progress> <b style=\"font-size:12px;\">'+data+'%</b>';} else {return '<progress value=\"'+data+'\" max=\"100\"></progress> <b style=\"font-size:12px;\">'+data+'%</b>';} };eval(s);"},
        {"data":"memory_usedpercent","title":"MEM利用率","visible":true, className: 'text-right',"render": "var s=function(data,type,row){ if(data>=90){return '<progress value=\"'+data+'\" max=\"100\"></progress> <b style=\"font-size:12px;\">'+data+'%</b>'; } else{return '<progress value=\"'+data+'\" max=\"100\"></progress> <b style=\"font-size:12px;\">'+data+'%</b>';} };eval(s);"},
        {"data":"disk_usedpercent","title":"文件系统利用率","visible":true, className: 'text-right',"render": "var s=function(data,type,row){ if(data>=80){return '<progress value=\"'+data+'\" max=\"100\"></progress> <b style=\"font-size:12px;\">'+data+'%</b>'; } else{return '<progress value=\"'+data+'\" max=\"100\"></progress> <b style=\"font-size:12px;\">'+data+'%</b>';} };eval(s);"},
        {"data":"disk_free","title":"disk_free","visible":false, className: 'text-right'},
        {"data":"disk_used","title":"disk_used","visible":false, className: 'text-right'},
        {"data":"pid","title":"PID","visible":true, className: 'text-right'},
        {"data":"disk_total","title":"disk_total","visible":false, className: 'text-right'},
        {"data":"matrixroot","title":"matrixroot","visible":true, className: 'text-right'},
        {"data":"tags","title":"标签","visible":false, className: 'text-right'},
        {"data":"class","title":"Class","visible":false, className: 'text-right'},
        {"data":"id","title":"ID","visible":false, className: 'text-right'}],
    dataset: []
};

_.forEach(_hostListTmp,function(v,k){
    var cfg = v.config;
    _hostList.dataset.push({
        host:cfg.host,
        ip:'11.194.13.11',
        os: cfg.os,
        probe_version:'V1.1',
        probe_status: '',
        pid: cfg.pid,
        cpu_usedpercent: cfg.cpu_usedpercent,
        memory_usedpercent: cfg.memory_usedpercent,
        disk_usedpercent:cfg.disk_usedpercent,
      matrixroot:cfg.matrixroot,
      tags:v.tags,
      class:v.class,
      id:v.id
    });
});

_hostList.dataset = _.map(new Array(20),function(v){
    return _hostList.dataset[0];
});


var _tags = odb.mql("select tags from /matrix/system/hostinfo limit -1")[0].tags;

// Merge result
var rtn = {
    summary:[
        {name:"Linux", count: _sumByLinux},
        {name:"Window", count: _sumByWindow},
        {name:"Unix", count: _sumByUnix},
        {name:"VM", count: 0}
    ],
    list: _hostList,
    tags: _tags
};

// Return result
OUTPUT = rtn;