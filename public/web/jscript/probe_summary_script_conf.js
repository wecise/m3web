// 

// Policy Base Datatable
var _base = {
    options: {},
    columns: [
        {"data":"checkbox","title":"选择","visible":true, className: 'dt-nowrap',checkboxes: {
                selectRow: true
            }},
        {"data":"name","title":"名称","visible":true, className: 'dt-nowrap text-right'},
        {"data":"ifsave","title":"是否存储","visible":true, className: 'dt-nowrap text-right'},
        {"data":"remark","title":"描述","visible":true, className: 'dt-nowrap text-right'},
        {"data":"threshold_A","title":"阈值A","visible":true, className: 'dt-nowrap text-right', render:'var s=function(data,type,row){return `<input type="text" value="${data}">`;};eval(s);'},
        {"data":"severity_A","title":"告警级别A","visible":true, className: 'dt-nowrap text-right', render:'var s=function(data,type,row){return `<input type="text" value="${data}">`;};eval(s);'},
        {"data":"threshold_B","title":"阈值B","visible":true, className: 'dt-nowrap text-right', render:'var s=function(data,type,row){return `<input type="text" value="${data}">`;};eval(s);'},
        {"data":"severity_B","title":"告警级别B","visible":true, className: 'dt-nowrap text-right', render:'var s=function(data,type,row){return `<input type="text" value="${data}">`;};eval(s);'}],
    dataset: []
};


_base.dataset = _.map(new Array(5),function(v){
    return {name:"KPI1",ifsave:"是", remark: "字符串", threshold_A: "A", severity_A:"Error",threshold_B:"B",severity_B:"Warning"};
});

var _servers = {
    options: {},
    columns: [
        {"data":"checkbox","title":"选择","visible":true, className: '',checkboxes: {
                selectRow: true
            }},
        {"data":"host","title":"服务器","visible":true, className: 'dt-nowrap text-right'},
        {"data":"ip","title":"IP","visible":true, className: 'dt-nowrap text-right'},
        {"data":"app","title":"应用系统","visible":true, className: 'dt-nowrap text-right'},
        {"data":"env","title":"所属环境","visible":true, className: 'dt-nowrap text-right'},
        {"data":"remark","title":"描述","visible":true, className: 'dt-nowrap text-right'}],
    dataset: []
};

_servers.dataset = _.map(new Array(5),function(v){
    return {host:"wecise",ip:"192.168.31.101", app: "matrix", env: "Linux", remark:""};
});

var _editor = {
                    oldInput: "",
                    newInput: "",
                    theme: "tomorrow",
                    printMargin: false,
                    readOnly: false,
                    showToolsBar: true,
                    showStatusBar: false
                };

// Merge result
var rtn = {
    base: _base,
    editor: _editor,
    servers: _servers
};

// Return result
OUTPUT = rtn;