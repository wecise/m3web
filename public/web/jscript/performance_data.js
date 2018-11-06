
var _l = odb.mql("select biz,app,host,inst,param,value from /matrix/devops/performance where inst='disk_/' and param='disk_total'  order by value desc limit 5");




// Merge result
var rtn = {
    summary:[
        {name:"Linux", count: null},
        {name:"Window", count: null},
        {name:"Unix", count: null},
        {name:"VM", count: null}
    ],
    list: null
};

// Return result
OUTPUT = _l;