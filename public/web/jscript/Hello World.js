
var graph = odb.mql('match ("biz:查账系统")-[*]->("esx:esx1")');

var search = odb.mql('select * from /matrix/devops/ limit 50');


var result = {
  search: {
    data: _.groupBy(search,'class'),
    template: '<div></div>'
  }
};

OUTPUT = result;