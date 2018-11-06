// Input
var _input = INPUT;


// Gen the List 
var _list = {
    
    columns: [
        {"data":"checkbox","title":"选择",className: '',checkboxes: {
                selectRow: true
            }},
        {"data":"name","title":"名称",className: 'text-right',render:'var s=function(data,type,row){return \'<a href="javascript:eventHub.$emit(`PATH-CHANGE-EVENT`,`\'+  window.btoa(encodeURIComponent(JSON.stringify(row)))+\'`)">\'+data+\'</a>\';};eval(s);'},
        {"data":"ftype","title":"类型",className: 'text-right',render:'var s=function(data,type,row){ if(data=="dir"){return "目录";}else{return "文件";} };eval(s);'},
        {"data":"parent","title":"目录",className: 'text-right'},
        {"data":"vtime","title":"创建时间",className: 'text-right',render:'var s=function(data,type,row){return moment(data).format("YYYY-MM-DD HH:mm:ss");};eval(s);'},
        {"data":"attr", "title":"","visible":false},
        {"data":"class","title": "","visible":false},
        {"data":"fullname", "title":"","visible":false},
        {"data":"id", "title":"","visible":false},
        {"data":"owner", "title":"作者","visible":true, className: 'text-right'},
        {"data":"status", "title":"","visible":false},
        {"data":"tags", "title":"","visible":false},
        {"data":"username", "title":"","visible":false}
    ],
    dataset: []
};

// Merge & Maintain
var rtn = _list;

// Output
OUTPUT = rtn;