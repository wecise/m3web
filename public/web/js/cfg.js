/*
*
*      __  __   ____
*    |  \/  | |__ /
*    | \  / |  |_ \
*    | |\/| | |___/
*    | |  | |
*    |_|  |_|
*
*
*/

var GLOBAL_CONFIG = {
    global: {
        timeline_scale: {
            "1" : {'scale':'year', 'step': 1, 'title':'Year', 'pattern':'YYYY/MM', 'filter':'YYYY/MM'},
            "2" : {'scale':'month', 'step': 2, 'title':'Month', 'pattern':'YYYY/MM/DD', 'filter':'YYYY/MM'},
            "3" : {'scale':'week', 'step': 3, 'title':'Week', 'pattern':'YYYY/MM/DD', 'filter':'YYYY/MM'},
            "4" : {'scale':'day', 'step': 4, 'title':'Day', 'pattern':'YYYY/MM/DD HH', 'filter':'YYYY/MM'},
            "5" : {'scale':'hour', 'step': 5, 'title':'Hour', 'pattern':'YYYY/MM/DD HH:mm', 'filter':'YYYY/MM'},
            "6" : {'scale':'minute', 'step': 6, 'title':'Minute', 'pattern':'YYYY/MM/DD HH:mm:ss', 'filter':'YYYY/MM'},
            "7" : {'scale':'second', 'step': 7, 'title':'Second', 'pattern':'YYYY/MM/DD HH:mm:ss.sss', 'filter':'YYYY/MM'}
        },
        gremlin: `#
g.V("linux:wecise").Out("contain").All();

# 节点 linux:wecise 双向包含哪些节点
g.V("linux:wecise").Both("contain").All();

# 那个节点包含app:cassandra
g.V().Has("contain", "app:cassandra").All();

# 支持多个，有 bug
g.V().Out("contain").Is("app:cassandra").All();


# linux:wecise 包含？, ? 包含etcd:etcd
g.V("linux:wecise").Out("contain").Has("contain", "etcd:etcd").All();

# linux:wecise 任意关系 ，发出或指向
g.V("linux:wecise").Both().All();


# linux:wecise 两种关系 ，发出或指向
g.V("linux:wecise").Both(["contain","connect"]).All();

# 从多个顶点出发
g.V("linux:wecise", "linux:wecise1").Both("contain").All();


# 集合运算 ，并集
var cFollows = g.V("linux:wecise").Out("contain")
var dFollows = g.V("linux:wecise1").Out("contain")
cFollows.Union(dFollows).All();

# 集合运算 ，交集 ???
var cFollows = g.V("linux:wecise").Out("contain");
var dFollows = g.V("linux:wecise1").Out("contain");
cFollows.Intersect(dFollows).All();


# 集合运算 ，差集
var cFollows = g.V("linux:wecise").Out("contain")
var dFollows = g.V("linux:wecise1").Out("contain")
cFollows.Except(dFollows).All();

# js 处理 , d 是 js object 能被序列化为json
g.V("linux:wecise", "linux:wecise1").Both("contain").All().ForEach(function(d) { g.Emit(d) } );

# A string or list of strings to act as a result key. The value for tag was the vertex the path was on at the time it reached "Tag"
# 过滤环
g.V("linux:wecise").Tag("a").Out("contain").Out("contain").ForEach(function (item) { if (item.id !== item.a) g.Emit({ id: item.id }); });
g.V("linux:wecise").As("a").Out("contain").Out("contain").ForEach(function (item) { if (item.id !== item.a) g.Emit({ id: item.id }); });

# 返回路径
g.V("linux:wecise").As("a").Out("contain").As("b").Out("contain").As("c").ForEach(function (item) { if (item.id !== item.a) g.Emit({ id: item.a+"-"+item.b+"-"+item.c }); });
g.V("linux:wecise").As("a").Out("contain").As("b").Out("contain").As("c").Map(function (item) { if (item.id !== item.a) g.Emit({ id: item.a+"-"+item.b+"-"+item.c }); });

# 路径复用
path = g.M().Out("contain").As("b").Out("contain").As("c")
g.V("linux:wecise").As("a").Follow(path).Map(function (item) { if (item.id !== item.a) g.Emit({ id: item.a+"-"+item.b+"-"+item.c }); });
g.V("linux:wecise").As("a").Follow(path).Map(function (item) { if (item.id !== item.a) g.Emit({ id: item.a+"-"+item.b+"-"+item.c+"$"+item.etcd.name }); });`,
        help: [
            `
      ___  ___   _____  
     /   |/   | |___  | 
    / /|   /| |    _| | 
   / / |__/ | |   |_  | 
  / /       | |  ___| | 
 /_/        |_| |_____/ 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                                         * 
 * In fact, you're looking at M³ right now. Go ahead and play with it!                                     *
 *                                                                                                         *
 * We are currently showing off the help mode. M³ has support for many keywords used to support to search. *
 *                                                                                                         *
 * Enjoy it! :)                                                                                            *
 *                                                                                                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 `,
            `|: Pipeline\n\tprint id,name,value | top 5 | sort vtime desc\n`,
            `top: \n\ttop 5\n`,
            `sort: \n\tsort vtime desc, name asc\n`,
            "group: \n\tgroup name\n",
            "print: \n\tprint id,class,name\n",
            "at: \n\tat 2017-11-18 12:30\n",
            "within: \n\twithin 5min\n",
            "nearest: \n\tnearest 1day\n",
            "last: \n\tlast day\n",
            `lua: \n\tlua msg=<lua> 
			    if src=="shell" then
			      return "<pre style='border:0px;'>"..string.gsub(msg, "UN", "<kbd style='background-color:#4AB93D;'>".."%1".."</kbd>").."</pre>" 
			    end
			</lua>\n`,
            `call: \n\tcall tree {"ftype":"class","parent":"/"}\n`,
            `\n\tcall graph {"level":3, "rels":["contain","depend","connect"], "element":true, "entity":true}`
        ],
        unshow_columns:['id','_tokens','day','vtime','class'],
        ci_card: [
                    {name: 'model', title: '型号', stype: 'string', otype: 'any'},
                    {name: 'type', title: '类型', stype: 'string', otype: 'number'},
                    {name: 'company', title: '厂商', stype: 'string', otype: 'any'},
                    {name: 'ctel', title: '厂商联系电话', stype: 'string', otype: 'any'},
                    {name: 'sn', title: '序列号', stype: 'string', otype: 'any'},
                    {name: 'host', title: 'Host', stype: 'string', otype: 'any'},
                    {name: 'ip', title: 'IP', stype: 'string', otype: 'any'},
                    {name: 'dc', title: '数据中心', stype: 'string', otype: 'any'},
                    {name: 'room', title: '房间', stype: 'string', otype: 'any'},
                    {name: 'rack', title: '机柜', stype: 'string', otype: 'any'},
                    {name: 'unit', title: '机架', stype: 'string', otype: 'any'},
                    {name: 'location', title: '地点', stype: 'string', otype: 'any'},
                    {name: 'region', title: '所属地点', stype: 'string', otype: 'any'},
                    {name: 'biz', title: '所属业务', stype: 'string', otype: 'any'},
                    {name: 'department', title: '负责部门', stype: 'string', otype: 'any'},
                    {name: 'contact', title: '联系人', stype: 'string', otype: 'any'},
                    {name: 'tel', title: '联系人电话', stype: 'string', otype: 'number'},
                    {name: 'assetid', title: '资产编号', stype: 'string', otype: 'any'},
                    {name: 'period', title: '保修期', stype: 'string', otype: 'any'},
                    {name: 'config', title: '详细配置', stype: 'string', otype: 'json'},
                    {name: 'files', title: '配置文件列表', stype: 'string', otype: 'json'},
                    {name: 'element', title: '组成实体的元素', stype: 'string', otype: 'json'}
                ]
    },
    keyspace:{
        wecise: {
            dimension: [
                { name:"By Event", value:[
                        { name: "host", value:"host"}
                    ]
                },
                { name:"By Biz", value:[
                        { name: "biz", value:"biz"},
                        { name: "app", value:"app"},
                    ]
                }
            ],
            event: {
                name: "/matrix/devops/event",
                "/matrix/devops/event": {
                    preconfig: 	{
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "6": {name:"Fatal", color:"#333333"},
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns:[
                        {field:"biz",title: "业务", visible: true},
                        {field:"app",title: "应用", visible: true},
                        {field:"host",title: "服务器", visible: true},
                        {field:"severity",title: "级别", visible: true, formatter: function(value, row, index) {
                                return window.GLOBAL_OBJECT.company.object.event.preconfig.severity.level[row.severity].name;
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isNull(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_other'};
                                }

                            }
                        },
                        {field:"ctime",title: "告警时间", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"msg",title: "摘要", visible: true}
                    ]
                }
            },
            syslog: {
                name: "/matrix/devops/event/syslog",
                "/matrix/devops/event/syslog": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            performance: {
                name: "/matrix/devops/performance",
                "/matrix/devops/performance": {
                    preconfig: {
                        host: ["host"],
                        time: ["vtime"]
                    },
                    columns: [
                        {field:"biz",title: "业务", visible: true},
                        {field:"host",title: "服务器", visible: true},
                        {field:"ip",title: "IP", visible: true},
                        {field:"app",title: "应用", visible: true},
                        {field:"inst",title: "实例", visible: true},
                        {field:"param",title: "参数", visible: true},
                        {field:"value",title: "值", visible: true, formatter:function(value,row,index){
                                if(!_.isNull(value) && !_.isUndefined(value)){
                                    if (_.includes(['usedpercent','response rate','success rate','cpu','cpu_usedpercent','memory_usedpercent','disk_usedpercent'],row.param)){
                                        if ( value > 60 ){
                                            return "<span class='pull-right' style='color:#FF0000;' title='超过阈值｛60％｝'><b>" + value + " %</b> <i class='fa fa-sort-up'></i></span>"
                                        } else {
                                            return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + " %</b></span>"
                                        }
                                    } else if( 'cores' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + "</b></span>"
                                    } else if( 'response time' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " MS</b></span>"
                                    } else if ( 'transaction' == row.param ){
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " 笔</b></span>"
                                    } else {
                                        return "<span class='pull-right' style='color:#9999CC;'><b>" + _.round(value,2) + " MB</b></span>"
                                    }
                                } else {
                                    return '';
                                }
                            }
                        },
                        {field:"vtime",title: "采集时间", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            log: {
                name: "/matrix/devops/log",
                "/matrix/devops/log": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "时间", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "服务器", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "级别", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "内容", sortable: true},
                        {field: "id", title: "ID", visible: false},
                        {field: "class", title: "CLASS", visible: false},
                    ]
                }
            },
            raw: {
                name: "/matrix/devops/log/raw",
                "/matrix/devops/log/raw": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "采集时间", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "node", title: "服务器", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log?cond=`+row.id+`&preset=`+encodeURI(JSON.stringify(self.search.default))+`" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "级别", sortable: true, formatter: function(value,row,index){
                                if ( value >= '5') {
                                    return "<kbd style='background-color:#FF0000;'>Critical</kbd>";
                                } else if ( value > '3' && value < '5') {
                                    return "<kbd style='background-color:#F0AD4E;'>Warning</kbd>";
                                } else {
                                    return "<kbd style='background-color:#3BC303;'>Normal</kbd>";
                                }
                            }
                        },
                        {field: "msg", title: "报文", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            tickets: {
                name: "/matrix/devops/tickets",
                "/matrix/devops/tickets": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"request_id2",title: "REQUEST_ID2", visible: true},
                        {field:"element_id",title: "ELEMENT_ID", visible: true},
                        {field:"create_date",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"modified_date",title: "MODIFIED_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"submitter",title: "SUBMITTER", visible: true},
                        {field:"assigned_to",title: "ASSIGNED_TO", visible: true},
                        {field:"last_modified_by",title: "LAST_MODIFIED_BY", visible: true},
                        {field:"ticket_status",title: "TICKET_STATUS", visible: true},
                        {field:"begindatetime",title: "BEGINDATETIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"enddatatime",title: "ENDDATATIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"problem_identified",title: "PROBLEM_IDENTIFIED", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"severity_text",title: "SEVERITY_TEXT", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"resolutionaction",title: "RESOLUTIONACTION", visible: true}
                    ]
                }
            },
            change: {
                name: "/matrix/devops/change",
                "/matrix/devops/change": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"submitter",title: "SUBMITTER", visible: true},
                        {field:"create_date",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"status",title: "STATUS", visible: true},
                        {field:"elementid",title: "ELEMENTID", visible: true},

                        {field:"network",title: "NETWORK", visible: true},

                        {field:"actualstarttime",title: "ACTUALSTARTTIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"actualendtime",title: "ACTUALENDTIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"assignedtech",title: "ASSIGNEDTECH", visible: true},
                        {field:"echangeid",title: "ECHANGEID", visible: true}
                    ]
                }
            },
            journal: {
                name: "/matrix/devops/event/omnibus/journal",
                "/matrix/devops/event/omnibus/journal": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"servername",title: "服务器", visible: true},
                        {field:"serverserial",title: "序列号", visible: true},
                        {field:"uid",title: "UserId", visible: true},
                        {field:"test",title: "TestN", visible: true,formatter:function(value,row,index){
                                return row.text1 + row.text2 + row.text3 + row.text4 + row.text5 + row.text6 + row.text7 + row.text8 + row.text9;
                            }
                        }
                    ]
                }
            }
        },
        rtyj: {
            dimension: [
                { name:"By Event", value:[
                        { name: "host", value:"host"}
                    ]
                },
                { name:"By Biz", value:[
                        { name: "biz", value:"biz", selected:"selected"},
                        { name: "app", value:"app"},
                    ]
                }
            ],
            event: {
                name: "/matrix/devops/event",
                "/matrix/devops/event": {
                    preconfig: 	{
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "6": {name:"Fatal", color:"#333333"},
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns:[
                        {field:"biz",title: "Biz", visible: true},
                        {field:"app",title: "App", visible: true},
                        {field:"host",title: "Host", visible: true},
                        {field:"severity",title: "Severity", visible: true, formatter: function(value, row, index) {
                            return row.severity;
                            },
                            cellStyle: function(value,row,index){
                                console.log(value, _.isEmpty(value))
                                if(value){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_other'};
                                }
                            }
                        },
                        {field:"ctime",title: "Ctime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).utc().format('YYYY-MM-DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"msg",title: "Msg", visible: true}
                    ]
                }
            },
            syslog: {
                name: "/matrix/devops/event/syslog",
                "/matrix/devops/event/syslog": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            performance: {
                name: "/matrix/devops/performance",
                "/matrix/devops/performance": {
                    preconfig: {
                        host: ["host"],
                        time: ["vtime"]
                    },
                    columns: [
                        {field:"biz",title: "Biz", visible: true},
                        {field:"host",title: "Host", visible: true},
                        {field:"ip",title: "IP", visible: true},
                        {field:"app",title: "App", visible: true},
                        {field:"inst",title: "Inst", visible: true},
                        {field:"param",title: "Param", visible: true},
                        {field:"value",title: "Value", visible: true, formatter:function(value,row,index){
                                if(!_.isNull(value) && !_.isUndefined(value)){
                                    if ('usedpercent' == row.param || 'response rate' == row.param || 'success rate' == row.param || 'cpu' == row.param){
                                        if ( value > 60 ){
                                            return "<span class='pull-right' style='color:#FF0000;' title='超过阈值｛60％｝'><b>" + value + " %</b> <i class='fa fa-sort-up'></i></span>"
                                        } else {
                                            return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + " %</b></span>"
                                        }
                                    } else if( 'cores' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + "</b></span>"
                                    } else if( 'response time' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " MS</b></span>"
                                    } else if ( 'transaction' == row.param ){
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " 笔</b></span>"
                                    } else {
                                        return "<span class='pull-right' style='color:#9999CC;'><b>" + _.round(value,2) + " </b></span>"
                                    }
                                } else {
                                    return '';
                                }
                            }
                        },
                        {field:"vtime",title: "Vtime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    let _date = moment(value).utc();
                                    let _utc = moment.utc(_date).toDate();
                                    let _local = moment(_utc).local().format('YYYY-MM-DD HH:mm:ss');
                                    return `<span style="white-space: nowrap;">`+_local+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            log: {
                name: "/matrix/devops/log",
                "/matrix/devops/log": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            raw: {
                name: "/matrix/devops/log/raw",
                "/matrix/devops/log/raw": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "node", title: "Node", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log?cond=`+row.id+`&preset=`+encodeURI(JSON.stringify(self.search.default))+`" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value,row,index){
                                if ( value >= '5') {
                                    return "<kbd style='background-color:#FF0000;'>Critical</kbd>";
                                } else if ( value > '3' && value < '5') {
                                    return "<kbd style='background-color:#F0AD4E;'>Warning</kbd>";
                                } else {
                                    return "<kbd style='background-color:#3BC303;'>Normal</kbd>";
                                }
                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            tickets: {
                name: "/matrix/devops/tickets",
                "/matrix/devops/tickets": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"request_id2",title: "REQUEST_ID2", visible: true},
                        {field:"element_id",title: "ELEMENT_ID", visible: true},
                        {field:"create_date",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"modified_date",title: "MODIFIED_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"submitter",title: "SUBMITTER", visible: true},
                        {field:"assigned_to",title: "ASSIGNED_TO", visible: true},
                        {field:"last_modified_by",title: "LAST_MODIFIED_BY", visible: true},
                        {field:"ticket_status",title: "TICKET_STATUS", visible: true},
                        {field:"begindatetime",title: "BEGINDATETIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"enddatatime",title: "ENDDATATIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"problem_identified",title: "PROBLEM_IDENTIFIED", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"severity_text",title: "SEVERITY_TEXT", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"resolutionaction",title: "RESOLUTIONACTION", visible: true}
                    ]
                }
            },
            change: {
                name: "/matrix/devops/change",
                "/matrix/devops/change": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"createusername",title: "CreateUserName", visible: true},
                        {field:"formstatus",title: "FormStatus", visible: true},
                        {field:"impactsysorg",title: "ImpactSysOrg", visible: true},
                        {field:"informdept",title: "InformDept", visible: true},
                        {field:"isbreak",title: "Isbreak", visible: true},
                        {field:"linksystem",title: "LinkSystem", visible: true},
                        {field:"sources",title: "Sources", visible: true},
                        {field:"systemtype",title: "SystemType", visible: true},
                        {field:"title",title: "Title", visible: true},
                        {field:"risklevel",title: "RiskLevel", visible: true},
                        {field:"vtime",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            journal: {
                name: "/matrix/devops/event/omnibus/journal",
                "/matrix/devops/event/omnibus/journal": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"servername",title: "ServerName", visible: true},
                        {field:"serverserial",title: "ServerSerial", visible: true},
                        {field:"uid",title: "UserId", visible: true},
                        {field:"test",title: "TestN", visible: true,formatter:function(value,row,index){
                                return row.text1 + row.text2 + row.text3 + row.text4 + row.text5 + row.text6 + row.text7 + row.text8 + row.text9;
                            }
                        }
                    ]
                }
            }
        },
        suninfo: {
            dimension: [
                { name:"By Event", value:[
                        { name: "host", value:"host"}
                    ]
                },
                { name:"By Biz", value:[
                        { name: "biz", value:"biz"},
                        { name: "app", value:"app"},
                    ]
                }
            ],
            event: {
                name: "/matrix/devops/event",
                "/matrix/devops/event": {
                    preconfig: 	{
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "6": {name:"Fatal", color:"#333333"},
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns:[
                        {field:"biz",title: "Biz", visible: true},
                        {field:"app",title: "App", visible: true},
                        {field:"host",title: "Host", visible: true},
                        {field:"severity",title: "Severity", visible: true, formatter: function(value, row, index) {
                                return row.severityalias;
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_other'};
                                }

                            }
                        },
                        {field:"ctime",title: "Ctime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).utc().format('YYYY-MM-DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"msg",title: "Msg", visible: true}
                    ]
                }
            },
            syslog: {
                name: "/matrix/devops/event/syslog",
                "/matrix/devops/event/syslog": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            performance: {
                name: "/matrix/devops/performance",
                "/matrix/devops/performance": {
                    preconfig: {
                        host: ["host"],
                        time: ["vtime"]
                    },
                    columns: [
                        {field:"biz",title: "Biz", visible: true},
                        {field:"host",title: "Host", visible: true},
                        {field:"ip",title: "IP", visible: true},
                        {field:"app",title: "App", visible: true},
                        {field:"inst",title: "Inst", visible: true},
                        {field:"param",title: "Param", visible: true},
                        {field:"value",title: "Value", visible: true, formatter:function(value,row,index){
                                if(!_.isNull(value) && !_.isUndefined(value)){
                                    if ('usedpercent' == row.param || 'response rate' == row.param || 'success rate' == row.param || 'cpu' == row.param){
                                        if ( value > 60 ){
                                            return "<span class='pull-right' style='color:#FF0000;' title='超过阈值｛60％｝'><b>" + value + " %</b> <i class='fa fa-sort-up'></i></span>"
                                        } else {
                                            return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + " %</b></span>"
                                        }
                                    } else if( 'cores' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + "</b></span>"
                                    } else if( 'response time' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " MS</b></span>"
                                    } else if ( 'transaction' == row.param ){
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " 笔</b></span>"
                                    } else {
                                        return "<span class='pull-right' style='color:#9999CC;'><b>" + _.round(value,2) + " </b></span>"
                                    }
                                } else {
                                    return '';
                                }
                            }
                        },
                        {field:"vtime",title: "Vtime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    let _date = moment(value).utc();
                                    let _utc = moment.utc(_date).toDate();
                                    let _local = moment(_utc).local().format('YYYY-MM-DD HH:mm:ss');
                                    return `<span style="white-space: nowrap;">`+_local+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            log: {
                name: "/matrix/devops/log",
                "/matrix/devops/log": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            raw: {
                name: "/matrix/devops/log/raw",
                "/matrix/devops/log/raw": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "node", title: "Node", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log?cond=`+row.id+`&preset=`+encodeURI(JSON.stringify(self.search.default))+`" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value,row,index){
                                if ( value >= '5') {
                                    return "<kbd style='background-color:#FF0000;'>Critical</kbd>";
                                } else if ( value > '3' && value < '5') {
                                    return "<kbd style='background-color:#F0AD4E;'>Warning</kbd>";
                                } else {
                                    return "<kbd style='background-color:#3BC303;'>Normal</kbd>";
                                }
                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            tickets: {
                name: "/matrix/devops/tickets",
                "/matrix/devops/tickets": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"request_id2",title: "REQUEST_ID2", visible: true},
                        {field:"element_id",title: "ELEMENT_ID", visible: true},
                        {field:"create_date",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"modified_date",title: "MODIFIED_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"submitter",title: "SUBMITTER", visible: true},
                        {field:"assigned_to",title: "ASSIGNED_TO", visible: true},
                        {field:"last_modified_by",title: "LAST_MODIFIED_BY", visible: true},
                        {field:"ticket_status",title: "TICKET_STATUS", visible: true},
                        {field:"begindatetime",title: "BEGINDATETIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"enddatatime",title: "ENDDATATIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"problem_identified",title: "PROBLEM_IDENTIFIED", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"severity_text",title: "SEVERITY_TEXT", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"resolutionaction",title: "RESOLUTIONACTION", visible: true}
                    ]
                }
            },
            change: {
                name: "/matrix/devops/change",
                "/matrix/devops/change": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"createusername",title: "CreateUserName", visible: true},
                        {field:"formstatus",title: "FormStatus", visible: true},
                        {field:"impactsysorg",title: "ImpactSysOrg", visible: true},
                        {field:"informdept",title: "InformDept", visible: true},
                        {field:"isbreak",title: "Isbreak", visible: true},
                        {field:"linksystem",title: "LinkSystem", visible: true},
                        {field:"sources",title: "Sources", visible: true},
                        {field:"systemtype",title: "SystemType", visible: true},
                        {field:"title",title: "Title", visible: true},
                        {field:"risklevel",title: "RiskLevel", visible: true},
                        {field:"vtime",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            journal: {
                name: "/matrix/devops/event/omnibus/journal",
                "/matrix/devops/event/omnibus/journal": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"servername",title: "ServerName", visible: true},
                        {field:"serverserial",title: "ServerSerial", visible: true},
                        {field:"uid",title: "UserId", visible: true},
                        {field:"test",title: "TestN", visible: true,formatter:function(value,row,index){
                                return row.text1 + row.text2 + row.text3 + row.text4 + row.text5 + row.text6 + row.text7 + row.text8 + row.text9;
                            }
                        }
                    ]
                }
            }
        },
        h3c: {
            dimension: [
                { name:"By Event", value:[
                        { name: "host", value:"host"}
                    ]
                },
                { name:"By Biz", value:[
                        { name: "biz", value:"biz"},
                        { name: "app", value:"app"},
                    ]
                }
            ],
            event: {
                name: "/matrix/devops/event",
                "/matrix/devops/event": {
                    preconfig: 	{
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "6": {name:"Fatal", color:"#333333"},
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns:[
                        {field:"biz",title: "Biz", visible: true},
                        {field:"app",title: "App", visible: true},
                        {field:"host",title: "Host", visible: true},
                        {field:"severity",title: "Severity", visible: true, formatter: function(value, row, index) {
                                return row.severityalias;
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_other'};
                                }

                            }
                        },
                        {field:"ctime",title: "Ctime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).utc().format('YYYY-MM-DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"msg",title: "Msg", visible: true}
                    ]
                }
            },
            syslog: {
                name: "/matrix/devops/event/syslog",
                "/matrix/devops/event/syslog": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            performance: {
                name: "/matrix/devops/performance",
                "/matrix/devops/performance": {
                    preconfig: {
                        host: ["host"],
                        time: ["vtime"]
                    },
                    columns: [
                        {field:"biz",title: "Biz", visible: true},
                        {field:"host",title: "Host", visible: true},
                        {field:"ip",title: "IP", visible: true},
                        {field:"app",title: "App", visible: true},
                        {field:"inst",title: "Inst", visible: true},
                        {field:"param",title: "Param", visible: true},
                        {field:"value",title: "Value", visible: true, formatter:function(value,row,index){
                                if(!_.isNull(value) && !_.isUndefined(value)){
                                    if ('usedpercent' == row.param || 'response rate' == row.param || 'success rate' == row.param || 'cpu' == row.param){
                                        if ( value > 60 ){
                                            return "<span class='pull-right' style='color:#FF0000;' title='超过阈值｛60％｝'><b>" + value + " %</b> <i class='fa fa-sort-up'></i></span>"
                                        } else {
                                            return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + " %</b></span>"
                                        }
                                    } else if( 'cores' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + "</b></span>"
                                    } else if( 'response time' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " MS</b></span>"
                                    } else if ( 'transaction' == row.param ){
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " 笔</b></span>"
                                    } else {
                                        return "<span class='pull-right' style='color:#9999CC;'><b>" + _.round(value,2) + " </b></span>"
                                    }
                                } else {
                                    return '';
                                }
                            }
                        },
                        {field:"vtime",title: "Vtime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    let _date = moment(value).utc();
                                    let _utc = moment.utc(_date).toDate();
                                    let _local = moment(_utc).local().format('YYYY-MM-DD HH:mm:ss');
                                    return `<span style="white-space: nowrap;">`+_local+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            log: {
                name: "/matrix/devops/log",
                "/matrix/devops/log": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            raw: {
                name: "/matrix/devops/log/raw",
                "/matrix/devops/log/raw": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "node", title: "Node", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log?cond=`+row.id+`&preset=`+encodeURI(JSON.stringify(self.search.default))+`" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value,row,index){
                                if ( value >= '5') {
                                    return "<kbd style='background-color:#FF0000;'>Critical</kbd>";
                                } else if ( value > '3' && value < '5') {
                                    return "<kbd style='background-color:#F0AD4E;'>Warning</kbd>";
                                } else {
                                    return "<kbd style='background-color:#3BC303;'>Normal</kbd>";
                                }
                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            tickets: {
                name: "/matrix/devops/tickets",
                "/matrix/devops/tickets": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"request_id2",title: "REQUEST_ID2", visible: true},
                        {field:"element_id",title: "ELEMENT_ID", visible: true},
                        {field:"create_date",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"modified_date",title: "MODIFIED_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"submitter",title: "SUBMITTER", visible: true},
                        {field:"assigned_to",title: "ASSIGNED_TO", visible: true},
                        {field:"last_modified_by",title: "LAST_MODIFIED_BY", visible: true},
                        {field:"ticket_status",title: "TICKET_STATUS", visible: true},
                        {field:"begindatetime",title: "BEGINDATETIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"enddatatime",title: "ENDDATATIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"problem_identified",title: "PROBLEM_IDENTIFIED", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"severity_text",title: "SEVERITY_TEXT", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"resolutionaction",title: "RESOLUTIONACTION", visible: true}
                    ]
                }
            },
            change: {
                name: "/matrix/devops/change",
                "/matrix/devops/change": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"createusername",title: "CreateUserName", visible: true},
                        {field:"formstatus",title: "FormStatus", visible: true},
                        {field:"impactsysorg",title: "ImpactSysOrg", visible: true},
                        {field:"informdept",title: "InformDept", visible: true},
                        {field:"isbreak",title: "Isbreak", visible: true},
                        {field:"linksystem",title: "LinkSystem", visible: true},
                        {field:"sources",title: "Sources", visible: true},
                        {field:"systemtype",title: "SystemType", visible: true},
                        {field:"title",title: "Title", visible: true},
                        {field:"risklevel",title: "RiskLevel", visible: true},
                        {field:"vtime",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            journal: {
                name: "/matrix/devops/event/omnibus/journal",
                "/matrix/devops/event/omnibus/journal": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"servername",title: "ServerName", visible: true},
                        {field:"serverserial",title: "ServerSerial", visible: true},
                        {field:"uid",title: "UserId", visible: true},
                        {field:"test",title: "TestN", visible: true,formatter:function(value,row,index){
                                return row.text1 + row.text2 + row.text3 + row.text4 + row.text5 + row.text6 + row.text7 + row.text8 + row.text9;
                            }
                        }
                    ]
                }
            }
        },
        tansun: {
            dimension: [
                { name:"By Event", value:[
                        { name: "host", value:"host"}
                    ]
                },
                { name:"By Biz", value:[
                        { name: "biz", value:"biz", selected:"selected"},
                        { name: "app", value:"app"},
                    ]
                }
            ],
            event: {
                name: "/matrix/devops/event",
                "/matrix/devops/event": {
                    preconfig: 	{
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "6": {name:"Fatal", color:"#333333"},
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns:[
                        {field:"biz",title: "Biz", visible: true},
                        {field:"app",title: "App", visible: true},
                        {field:"host",title: "Host", visible: true},
                        {field:"severity",title: "Severity", visible: true, formatter: function(value, row, index) {
                                return row.severityalias;
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_other'};
                                }

                            }
                        },
                        {field:"ctime",title: "Ctime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).utc().format('YYYY-MM-DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"msg",title: "Msg", visible: true}
                    ]
                }
            },
            syslog: {
                name: "/matrix/devops/event/syslog",
                "/matrix/devops/event/syslog": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            performance: {
                name: "/matrix/devops/performance",
                "/matrix/devops/performance": {
                    preconfig: {
                        host: ["host"],
                        time: ["vtime"]
                    },
                    columns: [
                        {field:"biz",title: "Biz", visible: true},
                        {field:"host",title: "Host", visible: true},
                        {field:"ip",title: "IP", visible: true},
                        {field:"app",title: "App", visible: true},
                        {field:"inst",title: "Inst", visible: true},
                        {field:"param",title: "Param", visible: true},
                        {field:"value",title: "Value", visible: true, formatter:function(value,row,index){
                                if(!_.isNull(value) && !_.isUndefined(value)){
                                    if ('usedpercent' == row.param || 'response rate' == row.param || 'success rate' == row.param || 'cpu' == row.param){
                                        if ( value > 60 ){
                                            return "<span class='pull-right' style='color:#FF0000;' title='超过阈值｛60％｝'><b>" + value + " %</b> <i class='fa fa-sort-up'></i></span>"
                                        } else {
                                            return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + " %</b></span>"
                                        }
                                    } else if( 'cores' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + "</b></span>"
                                    } else if( 'response time' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " MS</b></span>"
                                    } else if ( 'transaction' == row.param ){
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " 笔</b></span>"
                                    } else {
                                        return "<span class='pull-right' style='color:#9999CC;'><b>" + _.round(value,2) + " </b></span>"
                                    }
                                } else {
                                    return '';
                                }
                            }
                        },
                        {field:"vtime",title: "Vtime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    let _date = moment(value).utc();
                                    let _utc = moment.utc(_date).toDate();
                                    let _local = moment(_utc).local().format('YYYY-MM-DD HH:mm:ss');
                                    return `<span style="white-space: nowrap;">`+_local+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            log: {
                name: "/matrix/devops/log",
                "/matrix/devops/log": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "-1": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {

                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            raw: {
                name: "/matrix/devops/log/raw",
                "/matrix/devops/log/raw": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "node", title: "Node", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log?cond=`+row.id+`&preset=`+encodeURI(JSON.stringify(self.search.default))+`" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value,row,index){
                                if ( value >= '5') {
                                    return "<kbd style='background-color:#FF0000;'>Critical</kbd>";
                                } else if ( value > '3' && value < '5') {
                                    return "<kbd style='background-color:#F0AD4E;'>Warning</kbd>";
                                } else {
                                    return "<kbd style='background-color:#3BC303;'>Normal</kbd>";
                                }
                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            tickets: {
                name: "/matrix/devops/tickets",
                "/matrix/devops/tickets": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"request_id2",title: "REQUEST_ID2", visible: true},
                        {field:"element_id",title: "ELEMENT_ID", visible: true},
                        {field:"create_date",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"modified_date",title: "MODIFIED_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"submitter",title: "SUBMITTER", visible: true},
                        {field:"assigned_to",title: "ASSIGNED_TO", visible: true},
                        {field:"last_modified_by",title: "LAST_MODIFIED_BY", visible: true},
                        {field:"ticket_status",title: "TICKET_STATUS", visible: true},
                        {field:"begindatetime",title: "BEGINDATETIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"enddatatime",title: "ENDDATATIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"problem_identified",title: "PROBLEM_IDENTIFIED", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"severity_text",title: "SEVERITY_TEXT", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"resolutionaction",title: "RESOLUTIONACTION", visible: true}
                    ]
                }
            },
            change: {
                name: "/matrix/devops/change",
                "/matrix/devops/change": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"createusername",title: "CreateUserName", visible: true},
                        {field:"formstatus",title: "FormStatus", visible: true},
                        {field:"impactsysorg",title: "ImpactSysOrg", visible: true},
                        {field:"informdept",title: "InformDept", visible: true},
                        {field:"isbreak",title: "Isbreak", visible: true},
                        {field:"linksystem",title: "LinkSystem", visible: true},
                        {field:"sources",title: "Sources", visible: true},
                        {field:"systemtype",title: "SystemType", visible: true},
                        {field:"title",title: "Title", visible: true},
                        {field:"risklevel",title: "RiskLevel", visible: true},
                        {field:"vtime",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            journal: {
                name: "/matrix/devops/event/omnibus/journal",
                "/matrix/devops/event/omnibus/journal": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"servername",title: "ServerName", visible: true},
                        {field:"serverserial",title: "ServerSerial", visible: true},
                        {field:"uid",title: "UserId", visible: true},
                        {field:"test",title: "TestN", visible: true,formatter:function(value,row,index){
                                return row.text1 + row.text2 + row.text3 + row.text4 + row.text5 + row.text6 + row.text7 + row.text8 + row.text9;
                            }
                        }
                    ]
                }
            }
        },
        telus: {
            dimension: [
                { name:"By Event", value:[
                        { name: "NODE", value:"NODE"},
                        { name: "NODEALIAS", value:"NODEALIAS"},
                        { name: "MANAGER", value:"MANAGER"},
                        { name: "AGENT", value:"AGENT"},
                        { name: "ALERTGROUP", value:"ALERTGROUP"},
                        { name: "ALERTKEY", value:"ALERTKEY"},
                        { name: "SEVERITY", value:"SEVERITY"},
                        { name: "TYPE", value:"TYPE"},
                        { name: "OWNERUID", value:"OWNERUID"},
                        { name: "OWNERGID", value:"OWNERGID"},
                        { name: "ACKNOWLEDGED", value:"ACKNOWLEDGED"},
                        { name: "SUPPRESSESCL", value:"SUPPRESSESCL"},
                        { name: "ORIGINALSEVERITY", value:"ORIGINALSEVERITY"},
                        { name: "ACTPROKEY", value:"ACTPROKEY"},
                        { name: "SITEID", value:"SITEID", selected:"selected"},
                        { name: "RESOLVESTATUS", value:"RESOLVESTATUS"},
                        { name: "TELUS_GEOLOC", value:"TELUS_GEOLOC"},
                        { name: "TELUS_TTSYSTEM", value:"TELUS_TTSYSTEM"},
                        { name: "TIXTTSTATUS", value:"TIXTTSTATUS"}
                    ]
                },
                { name:"By Biz", value:[
                        { name: "TELUS_SEVERITY", value:"TELUS_SEVERITY"},
                        { name: "MOBOWNERGROUP", value:"MOBOWNERGROUP"},
                        { name: "PROVINCE", value:"PROVINCE"},
                        { name: "ELEMENTSTATUS", value:"ELEMENTSTATUS"},
                        { name: "ELEMENTOWNER", value:"ELEMENTOWNER"},
                        { name: "ELKEY_SERVICEREGION", value:"ELKEY_SERVICEREGION"},
                        { name: "ELKEY_TECHNOLOGY", value:"ELKEY_TECHNOLOGY"},
                        { name: "ELKEY_SERVICE", value:"ELKEY_SERVICE"},
                        { name: "EVKEY_VISIBILITY", value:"EVKEY_VISIBILITY"},
                        { name: "EVKEY_ALARMCLASS", value:"EVKEY_ALARMCLASS"},
                        { name: "EVKEY_DOMAIN", value:"EVKEY_DOMAIN"},
                        { name: "EVKEY_EVENTTYPE", value:"EVKEY_EVENTTYPE"},
                        { name: "EVKEY_SERVICEIMPACT", value:"EVKEY_SERVICEIMPACT"},
                        { name: "REMEDYTTSTATUS", value:"REMEDYTTSTATUS"},
                        { name: "TELUS_HIER_1", value:"TELUS_HIER_1"},
                        { name: "TELUS_HIER_2", value:"TELUS_HIER_2"},
                        { name: "TELUS_HIER_3", value:"TELUS_HIER_3"},
                        { name: "TELUS_HIER_4", value:"TELUS_HIER_4"},
                        { name: "TELUS_HIER_5", value:"TELUS_HIER_5"}
                    ]
                }
            ],
            event: {
                name: "/matrix/devops/event/omnibus",
                "/matrix/devops/event/omnibus": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "6": {name:"Fatal", color:"#333333"},
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"firstoccurrence",title: "FirstOccurrence", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"lastoccurrence",title: "LastOccurrence", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"node",title: "Node", visible: true},
                        {field:"nodealias",title: "NodeAlias", visible: true},
                        {field:"originalseverity",title: "OriginalSeverity", visible: true, formatter: function(value, row, index) {
                                if (value == '5'){
                                    return `Critical`;
                                } else if( value == '4'){
                                    return `Major`;
                                } else if( value == '3'){
                                    return `Minor`;
                                } else if( value == '2'){
                                    return `Warning`;
                                } else if( value == '1'){
                                    return `Indeterminate`;
                                } else if( value == '0'){
                                    return `Clear`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){

                                if( value >= 0 && value < 7 ){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field:"tuid",title: "TUID", visible: true},
                        {field:"actprokey",title: "ActProKey", visible: true},
                        {field:"manager",title: "Manager", visible: true},
                        {field:"agent",title: "Agent", visible: true},
                        {field:"alertgroup",title: "AlertGroup", visible: true},
                        {field:"alertkey",title: "AlertKey", visible: true},
                        {field:"eventid",title: "EventId", visible: true},
                        {field:"tally",title: "Tally", visible: true},
                        {field:"type",title: "Type", visible: true},
                        {field:"nmosentityid",title: "NmosEntityId", visible: true},
                        {field:"serial",title: "Serial", visible: true},
                        {field:"serverserial",title: "ServerSerial", visible: true},
                        {field:"summary",title: "Summary", visible: true}
                    ]
                }
            },
            syslog: {
                name: "/matrix/devops/event/syslog",
                "/matrix/devops/event/syslog": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "6": {name:"Fatal", color:"#333333"},
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "host", title: "Host", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {
                                if (value == '5'){
                                    return `Critical`;
                                } else if( value == '4'){
                                    return `Major`;
                                } else if( value == '3'){
                                    return `Minor`;
                                } else if( value == '2'){
                                    return `Warning`;
                                } else if( value == '1'){
                                    return `Indeterminate`;
                                } else if( value == '0'){
                                    return `Clear`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){

                                if( value >= 0 && value < 7 ){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            performance: {
                name: "/matrix/devops/performance/tnpm",
                "/matrix/devops/performance/tnpm": 	{
                    preconfig: {
                        host: ["ip"],
                        time: ["vtime","starttime"]
                    },
                    columns: [
                        {field:"biz",title: "Biz", visible: true},
                        {field:"ip",title: "IP", visible: true},
                        {field:"app",title: "App", visible: true},
                        {field:"delta",title: "Delta", visible: true},
                        {field:"inst",title: "Inst", visible: true},
                        {field:"param",title: "Param", visible: true},
                        {field:"value",title: "Value", visible: true, formatter:function(value,row,index){
                                if(!_.isNull(value) && !_.isUndefined(value)){
                                    if ('usedpercent' == row.param || 'response rate' == row.param || 'success rate' == row.param || 'cpu' == row.param || _.startsWith(row.param,'OLT')){
                                        if ( value > 60 ){
                                            return "<span class='pull-right' style='color:#FF0000;' title='超过阈值｛60％｝'><b>" + value + "</b> <i class='fa fa-sort-up'></i></span>"
                                        } else {
                                            return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + " </b></span>"
                                        }
                                    } else if( 'cores' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) + "</b></span>"
                                    } else if( 'response time' == row.param ) {
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " MS</b></span>"
                                    } else if ( 'transaction' == row.param ){
                                        return "<span class='pull-right' style='color:#0088CC;'><b>" + _.round(value,2) +  " 笔</b></span>"
                                    } else {
                                        return "<span class='pull-right' style='color:#9999CC;'><b>" + _.round(value,2) + " </b></span>"
                                    }
                                } else {
                                    return '';
                                }
                            }
                        },
                        {field:"starttime",title: "StartTime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"endtime",title: "EndTime", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        }
                    ]
                }
            },
            log: {
                name: "/matrix/devops/log",
                "/matrix/devops/log": {
                    preconfig: {
                        host: ["host"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Error", color:"#FF0000"},
                                "4": {name:"Warning", color:"#FFA500"},
                                "3": {name:"Information", color:"#00acac"},
                                "2": {name:"Debug", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "ctime", title: "RawCapterTimeStamp", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "tuid", title: "TUID", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {
                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            raw: {
                name: "/matrix/devops/log/raw",
                "/matrix/devops/log/raw": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["severity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["vtime"]
                    },
                    columns: [
                        {field: "vtime", title: "Vtime", sortable: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field: "node", title: "Node", sortable: true, formatter: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return `<a href="/janesware/log?cond=`+row.id+`&preset=`+encodeURI(JSON.stringify(self.search.default))+`" target="_blank">`+value+`</a>`;
                                }
                            }
                        },
                        {field: "severity", title: "Severity", sortable: true, formatter: function(value, row, index) {
                                if (value == '5'){
                                    return `Error`;
                                } else if( value == '4'){
                                    return `Warning`;
                                } else if( value == '3'){
                                    return `Information`;
                                } else if( value == '2'){
                                    return `Debug`;
                                } else {
                                    return `Unknown`;
                                }
                            },
                            cellStyle: function(value,row,index){
                                if(!_.isEmpty(value)){
                                    return {classes: 'severity'+value};
                                } else {
                                    return {classes: 'severity_1'};
                                }

                            }
                        },
                        {field: "msg", title: "Msg", sortable: true},
                        {field: "id", title: "Id", visible: false},
                        {field: "class", title: "class", visible: false},
                    ]
                }
            },
            tickets: {
                name: "/matrix/devops/tickets",
                "/matrix/devops/tickets": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"request_id2",title: "REQUEST_ID2", visible: true},
                        {field:"element_id",title: "ELEMENT_ID", visible: true},
                        {field:"create_date",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"modified_date",title: "MODIFIED_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"submitter",title: "SUBMITTER", visible: true},
                        {field:"assigned_to",title: "ASSIGNED_TO", visible: true},
                        {field:"last_modified_by",title: "LAST_MODIFIED_BY", visible: true},
                        {field:"ticket_status",title: "TICKET_STATUS", visible: true},
                        {field:"begindatetime",title: "BEGINDATETIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"enddatatime",title: "ENDDATATIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"problem_identified",title: "PROBLEM_IDENTIFIED", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"severity_text",title: "SEVERITY_TEXT", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+value+`</span>`;
                                }
                            }
                        },
                        {field:"resolutionaction",title: "RESOLUTIONACTION", visible: true}
                    ]
                }
            },
            change: {
                name: "/matrix/devops/change",
                "/matrix/devops/change": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"submitter",title: "SUBMITTER", visible: true},
                        {field:"create_date",title: "CREATE_DATE", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"status",title: "STATUS", visible: true},
                        {field:"elementid",title: "ELEMENTID", visible: true},

                        {field:"network",title: "NETWORK", visible: true},

                        {field:"actualstarttime",title: "ACTUALSTARTTIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"actualendtime",title: "ACTUALENDTIME", visible: true, formatter: function(value, row, index) {
                                if(!_.isEmpty(value)){
                                    return `<span style="white-space: nowrap;">`+moment(value).format('YYYY/MM/DD HH:mm:ss')+`</span>`;
                                }
                            }
                        },
                        {field:"assignedtech",title: "ASSIGNEDTECH", visible: true},
                        {field:"echangeid",title: "ECHANGEID", visible: true}
                    ]
                }
            },
            journal: {
                name: "/matrix/devops/event/omnibus/journal",
                "/matrix/devops/event/omnibus/journal": {
                    preconfig: {
                        host: ["node"],
                        severity: {
                            name: ["originalseverity"],
                            level: {
                                "5": {name:"Critical", color:"#FF0000"},
                                "4": {name:"Major", color:"#FFA500"},
                                "3": {name:"Minor", color:"#FFD700"},
                                "2": {name:"Warning", color:"#0000FF"},
                                "1": {name:"Indeterminate", color:"#800080"},
                                "0": {name:"Clear", color:"#008000"},
                                "other": {name:"Unknown", color:"#808080"},
                            }
                        },
                        time: ["firstoccurrence"]
                    },
                    columns: [
                        {field:"servername",title: "ServerName", visible: true},
                        {field:"serverserial",title: "ServerSerial", visible: true},
                        {field:"uid",title: "UserId", visible: true},
                        {field:"test",title: "TestN", visible: true,formatter:function(value,row,index){
                                return row.text1 + row.text2 + row.text3 + row.text4 + row.text5 + row.text6 + row.text7 + row.text8 + row.text9;
                            }
                        }
                    ]
                }
            }
        }
    }
};