var _tags = odb.mql("select name from /matrix/tagdir limit -1");

var _tagsList = _.map(_tags, function(v,k){
    return {cid: v.id, parent: 'A2', rtype:'A2', isParent:true, name: v.name, title: v.title, children:[], iconSkin: 'tag'};
});

// Input
var nodes = [
                {cid:'A1', parent:null, rtype:'A1', isParent:true, name: '/探针列表', title: '探针列表', children:[
                        {cid:'A21', parent:'A1', rtype:'A1', isParent:true, name: 'linux', title: 'Linux', children:[], iconSkin: 'server'},
                        {cid:'A22', parent:'A1', rtype:'A1', isParent:true, name: 'windows', title: 'Windows', children:[], iconSkin: 'server'},
                        {cid:'A23', parent:'A1', rtype:'A1', isParent:true, name: 'unix', title: 'Unix', children:[], iconSkin: 'server'}
                  ], open:true, iconSkin: "platform"},
              {cid:'A2', parent:null, rtype:'A2', isParent:true, name: '/', title: '标签', children: _tagsList, iconSkin: 'tag'}
            ];

// Merge & Maintain
var rtn = nodes;

// Output
OUTPUT = rtn;