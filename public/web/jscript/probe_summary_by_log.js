// 
var _logListTmp = odb.mql("select * from /matrix/system/script/ limit -1")  || [];


// Gen the List of Policy
var _logList = {
    options: {},
    columns: [
        {"data":"checkbox","title":"选择","visible":true, className: '',checkboxes: {
                selectRow: true
            }},
        {"data":"host","title":"策略名称","visible":true, className: 'text-right'},
        {"data":"ip","title":"使用脚本","visible":true, className: 'text-right'},
        {"data":"os","title":"版本","visible":true, className: 'text-right'},
        {"data":"probe_version","title":"标签","visible":true, className: 'text-right'},
        {"data":"probe_status","title":"创建人","visible":true, className: 'text-right', render: ""},
        {"data":"cpu_usedpercent","title":"创建时间","visible":true, className: 'text-right', "render": ""},
        {"data":"memory_usedpercent","title":"操作","visible":true, className: 'text-right',render:'var s=function(data,type,row){return moment(data).format("YYYY-MM-DD HH:mm:ss");};eval(s);'},
        {"data":"tags","title":"标签","visible":false, className: 'text-right'},
        {"data":"class","title":"Class","visible":false, className: 'text-right'},
        {"data":"id","title":"ID","visible":false, className: 'text-right'}],
    dataset: []
};

var _tags = odb.mql("select tags from /matrix/system/policy limit -1")[0].tags;


_logList.dataset = _.map(new Array(20),function(v){
    return _logListTmp[0];
});

// Merge result
var rtn = {
    list: _policyList,
    tags: _tags
};

// Return result
OUTPUT = rtn;