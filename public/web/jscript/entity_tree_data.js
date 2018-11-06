var _tags = odb.mql("select name from /matrix/tagdir limit -1");

var _tagsList = _.map(_tags, function(v,k){
    return {cid: v.id, parent: 'A2', rtype:'A2', isParent:true, name: v.name, title: v.title, children:[], iconSkin: 'tag'};
});

var icon = {
  pdu: 'http://47.92.151.165/fs/home/assets/entity/png/pdu.png?type=download',
  router: 'http://47.92.151.165/fs/home/assets/entity/png/router.png?type=download',
  app: 'http://47.92.151.165/fs/home/assets/entity/png/app.png?type=download',
  db2: 'http://47.92.151.165/fs/home/assets/entity/png/db2.png?type=download',
  esx: 'http://47.92.151.165/fs/home/assets/entity/png/esx.png?type=download',
  cluster: 'http://47.92.151.165/fs/home/assets/entity/png/cluster.png?type=download',
  tomcat: 'http://47.92.151.165/fs/home/assets/entity/png/tomcat.png?type=download',
  vlan: 'http://47.92.151.165/fs/home/assets/entity/png/vlan.png?type=download',
  linux: 'http://47.92.151.165/fs/home/assets/entity/png/linux.png?type=download',
  websphere: 'http://47.92.151.165/fs/home/assets/entity/png/websphere.png?type=download',
  aix: 'http://47.92.151.165/fs/home/assets/entity/png/aix.png?type=download',
  mal: 'http://47.92.151.165/fs/home/assets/entity/png/mal.png?type=download',
  power: 'http://47.92.151.165/fs/home/assets/entity/png/power.png?type=download',
  oracle: 'http://47.92.151.165/fs/home/assets/entity/png/oracle.png?type=download',
  x86: 'http://47.92.151.165/fs/home/assets/entity/png/x86.png?type=download',
  openstack: 'http://47.92.151.165/fs/home/assets/entity/png/openstack.png?type=download',
  biz: 'http://47.92.151.165/fs/home/assets/entity/png/biz.png?type=download',
  sanstorage: 'http://47.92.151.165/fs/home/assets/entity/png/sanstorage.png?type=download',
  ups: 'http://47.92.151.165/fs/home/assets/entity/png/ups.png?type=download',
  mysql: 'http://47.92.151.165/fs/home/assets/entity/png/mysql.png?type=download',
  switch: 'http://47.92.151.165/fs/home/assets/entity/png/switch.png?type=download',
  windows: 'http://47.92.151.165/fs/home/assets/entity/png/windows.png?type=download',
  line: 'http://47.92.151.165/fs/home/assets/entity/png/line.png?type=download',
  etcd: 'http://47.92.151.165/fs/home/assets/entity/png/etcd.png?type=download',
  hmc: 'http://47.92.151.165/fs/home/assets/entity/png/hmc.png?type=download',
  ha: 'http://47.92.151.165/fs/home/assets/entity/png/ha.png?type=download',
  weblogic: 'http://47.92.151.165/fs/home/assets/entity/png/weblogic.png?type=download',
  nats: 'http://47.92.151.165/fs/home/assets/entity/png/nats.png?type=download',
  http: 'http://47.92.151.165/fs/home/assets/entity/png/http.png?type=download',
  sanswitch: 'http://47.92.151.165/fs/home/assets/entity/png/sanswitch.png?type=download',
  cassandra: 'http://47.92.151.165/fs/home/assets/entity/png/cassandra.png?type=download',
  sqlserver: 'http://47.92.151.165/fs/home/assets/entity/png/sqlserver.png?type=download',
  vmware: 'http://47.92.151.165/fs/home/assets/entity/png/vmware.png?type=download'
};

// Input
var nodes = [
                {cid:'A1', parent:null, rtype:'A1', isParent:true, name: '/配置管理', title: '配置列表', children:[
                        {cid:'A21', parent:'A1', rtype:'A1', isParent:true, name: 'linux', title: 'Linux', children:[]},
                        {cid:'A22', parent:'A1', rtype:'A1', isParent:true, name: 'windows', title: 'Windows', children:[]},
                        {cid:'A23', parent:'A1', rtype:'A1', isParent:true, name: 'unix', title: 'Unix', children:[]}
                  ], open:true},
              {cid:'A2', parent:null, rtype:'A2', isParent:true, name: '/', title: '标签', children: _tagsList}
            ];

// Merge & Maintain
var rtn = nodes;

// Output
OUTPUT = rtn;