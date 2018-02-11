<code>

	<style>
		/*----------  style  ----------*/
        .timeline:before {
            width: 3px;
            background: #dae0e8;
        }

        .timeline .timeline-icon a {
            background: #b6c2ca;
            border: 3px solid #dae0e8;
        }
		
	</style>

	
	/*----------  最外层element会自动增加组件同名 class="vue-timeline-component"  ----------*/
	<template>
		<ul class="timeline">
            <li v-for="item in list">
                <!-- begin timeline-time -->
                <div class="timeline-time">
                    <span class="date">${item.date}</span>
                    <span class="date">${item.time}</span>
                </div>
                <!-- end timeline-time -->
                <!-- begin timeline-icon -->
                <div class="timeline-icon">
                    <a href="javascript:;"><i class="fa fa-paper-plane"></i></a>
                </div>
                <!-- end timeline-icon -->
                <!-- begin timeline-body -->
                <div class="timeline-body">
                    <div>
                        <span class="username"><a href="javascript:;">${item.class}</a> <small></small></span>
                        <span class="pull-right text-muted"></span>
                    </div>
                    <div class="table-responsive" style="overflow:auto;padding:0px 0px 30px 0px;">
                        <span v-if="!_.isEmpty(item.columns)">
                            <bootstrap-table-search :columns="item.columns" 
                                                    :options="item.options" 
                                                    :data="item.data"
                                                    forward="event">
                            </bootstrap-table-search>
                        </span>
                        <span v-else>
                            ${item.data[0]}
                        </span>
                    </div>
                    <div class="timeline-footer" style="padding:10px 30px;">
                        <a  class="m-r-15"
                            role="button" 
                            data-toggle="collapse" 
                            :href="'#collapseData'+item.id" 
                            aria-expanded="false" 
                            aria-controls="collapseData">
                            More...
                        </a>
                        <div class="collapse" :id="'collapseData'+item.id">
                            <div class="well" @click="forward(item.url, item.id)" style="overflow:auto;">
                                <u>${item.data[0]}</u>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- end timeline-body -->
            </li>
        </ul>
	</template>

	/*----------  id是vue组件的name，内容是vue组件的option参数  ----------*/
	<script id="vue-timeline-component">
	{
	    delimiters: ['${', '}'],
        props: {
            id: String,
            model: Object
        },
        data: function(){
            return {
                list: []
            }
        },
        mounted: function(){
            var self = this;

            self.$nextTick(function(){
                self.init(self.model.list);
            })
        },
        watch: {
            'model.list': {
            	handler:function(val,oldVal){
                    var self = this;

                    self.init(val);
                },
                deep:true
            }
        },
        created: function () {
            var self = this;

        },
        methods: {
            init: function() {
                var self = this;
                
                self.list = [];

                let _sorted = _.orderBy(self.model.list,['vtime'],['desc']);
                _.forEach(_sorted,function(v,k){
                    let _date = moment(v.vtime).format("ll");
                    let _time = moment(v.vtime).format("LT");
                    let _class = _.isEmpty(v.host)?v.node:v.host;
                    let _columns = [];
                    let _list = v;
                    let _url = "";

                    if(_.includes(v.class,"/matrix/devops/event/syslog")){
                        _url = "/janesware/event";
                        _columns = window.GLOBAL_OBJECT.company.object.syslog.columns;

                    } else if(_.includes(v.class,"/matrix/devops/event/omnibus")){
                        _url = "/janesware/event";
                        _columns = window.GLOBAL_OBJECT.company.object.event.columns;

                    } else if(v.class === "/matrix/devops/event/omnibus/journal"){
                        _url = "/janesware/event";
                        _columns = window.GLOBAL_OBJECT.company.object.journal.columns;

                    } else if(_.includes(v.class,"/matrix/devops/event")){
                        _url = "/janesware/event";
                        _columns = window.GLOBAL_OBJECT.company.object.event.columns;

                    } else if(_.includes(v.class,"/matrix/devops/log/raw")){
                        _url = "/janesware/log";
                        _columns = window.GLOBAL_OBJECT.company.object.log.columns;

                    } else if(_.includes(v.class,"/matrix/devops/log")){
                        _url = "/janesware/log";
                        _columns = window.GLOBAL_OBJECT.company.object.log.columns;

                    } else if(_.includes(v.class,"/matrix/devops/performance")){
                        _url = "/janesware/performance";
                        _columns = window.GLOBAL_OBJECT.company.object.performance.columns;

                    } else if(_.includes(v.class,"/matrix/devops/tickets")){
                        _url = "#";
                        _columns = window.GLOBAL_OBJECT.company.object.tickets.columns;

                    } else if(_.includes(v.class,"/matrix/devops/change")){
                        _url = "#";
                        _columns = window.GLOBAL_OBJECT.company.object.change.columns;

                    }  else {
                        _url = "#";
                        _columns = [];
                    }
                    
                    self.list.push({
                                    date:_date, time:_time, 
                                    class:_class, 
                                    columns:_columns, 
                                    data: new Array(v), 
                                    options:{
                                                classes: "table table-no-bordered",
                                                pageSize: "30",
                                                pageList: "[15,30,45,60]",
                                                detailView: false,
                                                buttonsAlign: "right",
                                                search: false,
                                                locale: '{{.Lang}}',
                                                rowStyle:   function rowStyle(row, index) {
                                                                return {
                                                                    classes: 'text-nowrap'
                                                                };
                                                            }
                                            },
                                    url:_url, 
                                    id:v.id});
                })
            },
            forward: function(url,id){
                var self = this;

                // Search For
                localStorage.setItem("search-open-"+url.split("/")[2],JSON.stringify({
                                                                        id: "id="+id, 
                                                                        preset:null
                                                                    })
                                    );
                window.open(url,"_blank");     

            }
        }
    
	
	}
	</script>

</code>
