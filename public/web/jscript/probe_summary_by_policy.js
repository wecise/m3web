// 
var _policyListTmp = odb.mql("select * from /matrix/system/policy/ limit -1")  || [];


// Gen the List of Policy
var _policyList = {
    options: {},
    columns: [
        {"data":"checkbox","title":"选择","visible":true, className: '',checkboxes: {
                selectRow: true
            }},
        {"data":"innername","title":"策略名称","visible":true, className: 'text-right'},
        {"data":"branch","title":"使用脚本","visible":true, className: 'text-right'},
        {"data":"version","title":"版本","visible":true, className: 'text-right'},
        {"data":"tags","title":"标签","visible":true, className: 'text-right'},
        {"data":"owner","title":"创建人","visible":true, className: 'text-right', render: ""},
        {"data":"vtime","title":"创建时间","visible":true, className: 'text-right',render:'var s=function(data,type,row){return moment(data).format("YYYY-MM-DD HH:mm:ss");};eval(s);'},
        {"data":"tags","title":"标签","visible":false, className: 'text-right'},
        {"data":"class","title":"Class","visible":false, className: 'text-right'},
        {"data":"id","title":"ID","visible":false, className: 'text-right'}],
    dataset: []
};

var _tags = odb.mql("select tags from /matrix/system/policy limit -1")[0].tags;

_policyList.dataset = _.map(new Array(20),function(v){
    return _policyListTmp[0];
});

// Merge result
var rtn = {
    list: _policyList,
    tags: _tags
};

// Return result
OUTPUT = rtn;