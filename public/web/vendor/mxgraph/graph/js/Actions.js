/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs the actions object for the given UI.
 */
function Actions(editorUi)
{
	this.editorUi = editorUi;
	this.actions = new Object();
	this.init();
};

/**
 * Adds the default actions.
 */
Actions.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var isGraphEnabled = function()
	{
		return Action.prototype.isEnabled.apply(this, arguments) && graph.isEnabled();
	};
	var self = this;

	// Event actions
	this.addAction('mx-event', function() {
		var cellSelected = graph.getSelectionCell().value;
		var self = this;
		var param = "";
		var oneLevelLoading;
		var win;
		var w = $( window ).width();//document.body.clientWidth;
		var h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);
		var lrwh = [(w-800)/2, (h-450)/3, 1024, 550];

		if(_.isEmpty(cellSelected)){
			swal("Please Select Node","","info");
			return false;
		} else {
			param = `#/matrix/devops/event/:  |` + cellSelected + ` | print id,biz,app,host,msg,ctime,severity| sort ctime desc
											  | lua severity=<lua> if severity == 'FATAL' then 
	                                              return "<kbd style='background-color:#000000;'>重大</kbd>"  
	                                             elseif  severity == 'ERROR' or severity == '5' or severity == 'ERR' then 
	                                              return "<kbd style='background-color:#FF0000;'>严重</kbd>"  
	                                             elseif  severity == 'WARN' or severity == '4' then 
	                                              return "<kbd style='background-color:#F0AD4E;'>警告</kbd>"  
	                                             elseif  severity == 'INFO' or severity == '一般' or severity == '3' or severity == '2' or severity == '1' then 
	                                              return "<kbd style='background-color:#3BC303;'>一般</kbd>"  
	                                             elseif severity== '6' then
	                                              return "<kbd style='background-color:#6BD2D2;'>未知</kbd>"  
	                                             end  
	                                           </lua>`;
		}
		
        jQuery.ajax({
            url: '/mxobject/search',
            type: 'POST',
            dataType: 'json',
            data: {
                cond: param,
                flag: false
            },
            beforeSend:function(xhr){ 
                oneLevelLoading = layer.load(3, {
                    shade: [0.1,'#ccc'],
                    time: 30*1000
                });
            },
            complete: function(xhr, textStatus) {
                layer.close(oneLevelLoading);
            },
            success: function(data, textStatus, xhr) {
                var data = data.message;
                var tb = document.createElement('div');
                $(tb).append(`<bootstrap-table id="show-event" :columns="model.columns" :options="model.options" :data="model.data"></bootstrap-table>`);
                
                win = new mxWindow('事件 ' + cellSelected, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
				win.setMaximizable(true);
				win.setResizable(true);
				win.setClosable(true);
				win.setVisible(true);

                _.delay(function(){
                	var eventVue = new Vue({
                        el: '#show-event',
                        data:{
                            model:{
                            	columns: [],
                            	options: {},
                            	data: data,
                            }
                        },
                        mounted: function(){
                            var self = this;
                            var cols = [];

                            $.map(data[0], function(v,col) { 
					               console.log(col)
					               if( col == "biz"){
					                    cols[0]={
					                       field: col,
					                       title: col,
					                       sortable: true,
					                   }
					               } else if( col == "host"){
					                    cols[1]={
					                       field: col,
					                       title: col,
					                       sortable: true
					                   }
					               } else if( col == "app"){
					                    cols[2]={
					                       field: col,
					                       title: col,
					                       sortable: true,
					                    }
					               } else if( col == 'severity' ){
					                  	cols[3]= {
											field: col,
											title: col,
											sortable: true,
											align: 'center'
											//formatter: operateSeverityFormatter
					                	}
					               } else if( col == "vtime" ) {
					                   	cols[4]={
					                       field: col,
					                       title: col,
					                       sortable: true,
					                       formatter: formaterDate,
					                       width: 150
					                   }
					               } else if( col == "msg" ) {
					                   	cols[5]={
					                       field: col,
					                       title: col,
					                       sortable: false,
					                       formatter: function(d){
					                       		return d.substr(0,100);
					                       }
					                   }
					                }  else {
					                    cols.push({
					                       field: col,
					                       title: col,
					                       sortable: true,
					                       visible: false
					                   })
					                }
						    });
				            cols.push({title:'Period',align:'left',formatter:function(value,row,index){
                                                                    return moment(row.vtime).from(moment(_.now())) + ` <i class="fa fa-spinner fa-spin" style="color:#5cb85c;"></i>`;
                                                                }});
				            cols.push({
				            	title:'Action',
				            	align:'center',
				            	formatter: function(d){
				            		return `<div class="btn-group">
					                            <a data-toggle="dropdown" aria-expanded="true"><i class="fa fa-"></i> <span class="caret"></span></a>
					                            <ul class="dropdown-menu">
					                                <li><a href="#">Confirm</a></li>
					                                <li><a href="#">Delete</a></li>
					                                <li><a href="#">Share</a></li>
					                                <li class="divider"></li>
					                                <li><a href="#">Search Me</a></li>
					                            </ul>
					                        </div>`;
				            	}
				            });
				            self.model.columns = cols;
				            self.model.options = {
							                        toggle: "table",
													classes: "table",
												    showColumns: false,
												    pagination: true,
												    toolbar: "#custom-toolbar1",
												    showExport: false,
												    exportTypes: "['json', 'xml', 'csv', 'txt', 'sql', 'excel']",
												    showFooter: false,
												    pageSize: "20",
							         				pageList: "[20,40,60,80,100]",
							         				detailView: true,
							         				buttonsAlign: "right",
							         				clickToSelect: true
									            };
                        }
                    })
                }, 500);
               
            },
            error: function(xhr, textStatus, errorThrown) {
             	layer.close(oneLevelLoading);
            }
        });
	}, null, null, 'Ctrl+Shift+1');
	
	// Performance actions
	this.addAction('mx-performance', function() {
		var cellSelected = graph.getSelectionCell().value;
		var self = this;
		var param = "";
		var oneLevelLoading;
		var win;
		var w = $( window ).width();//document.body.clientWidth;
		var h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);
		var lrwh = [(w-850)/2, (h-450)/3, 1024, 550];

		if(_.isEmpty(cellSelected)){
			swal("Please Select Node","","info");
			return false;
		} else {
			param = `#/matrix/devops/performance:  |` + cellSelected + ` | print id,biz,app,host,inst,param,value,ctime,vtime| sort ctime desc,host asc, inst asc, param asc
											  							  | lua value=<lua> 
														                        if param == 'usedpercent' or param=='response rate' or param=='success rate' or param=='cpu' then
														                            if value > 60 then
														                              return string.format("%.2f",value) .. " %" 
														                            else
														                              return string.format("%.2f",value) .. " %" 
														                            end
														                        elseif param == 'cores' then
														                            return value
														                        elseif param == 'response time' then
														                            return string.format("%.2f",value) .. " MS" 
														                        elseif param == 'transaction' then
														                            return value .. " 笔" 
														                        else
														                            return string.format("%.2f", value/1024/1024) .. " MB"
														                        end
														                    </lua>`;
		}

        jQuery.ajax({
            url: '/mxobject/search',
            type: 'POST',
            dataType: 'json',
            data: {
                cond: param,
                flag: false
            },
            beforeSend:function(xhr){ 
                oneLevelLoading = layer.load(3, {
                    shade: [0.1,'#ccc'],
                    time: 30*1000
                });
            },
            complete: function(xhr, textStatus) {
            	layer.close(oneLevelLoading);
            },
            success: function(data, textStatus, xhr) {
                
                if(_.isEmpty(data.message)) return false;

                var data = data.message;
                var tb = document.createElement('div');
                $(tb).append(`<bootstrap-table id="show-performance" :columns="model.columns" :options="model.options" :data="model.data"></bootstrap-table>`);

                win = new mxWindow('性能 ' + cellSelected, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
				win.setMaximizable(true);
				win.setResizable(true);
				win.setClosable(true);
				win.setVisible(true);

				_.delay(function(){
                	var performanceVue = new Vue({
                        el: '#show-performance',
                        data:{
                            model:{
                            	columns: [],
                            	options: {},
                            	data: data,
                            },
                            target: "#show-performance",
                        },
                        mounted: function(){
                            var self = this;
                            var cols = [];

                            $.map(data[0], function(v,col) { 
					               
					               if (col == "biz") {
		                                cols[0] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                }
		                            } else if (col == "host") {
		                                cols[1] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                }
		                            } else if (col == "app") {
		                                cols[2] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                }
		                            } else if (col == "inst") {
		                                cols[3] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                }
		                            } else if (col == "param") {
		                                cols[4] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                }
		                            } else if (col == "value") {
		                                cols[5] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                }
		                            } else if (col == "vtime") {
		                                cols[6] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                    formatter: function(value, row, index) {
													   		return moment(value).format('YYYY-MM-DD HH:mm:ss');
													   },
		                                    visible: false
		                                }
		                            } else if (col == "ctime") {
		                                cols[7] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                    formatter: function(value, row, index) {
													   		return moment(value).format('YYYY-MM-DD HH:mm:ss');
													   }
		                                }
		                            } else if (col == "id") {
		                                cols[8] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                    visible: false
		                                }
		                            } else {
		                                cols.push({
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                    visible: false
		                                })
		                            }
						    });
				            cols.push({title:'Period',align:'left',formatter:function(value,row,index){
                                                                    return moment(row.vtime).from(moment(_.now())) + ` <i class="fa fa-spinner fa-spin" style="color:#5cb85c;"></i>`;
                                                                }});
				            cols.push({
				            	title:'Action',
				            	align:'center',
				            	formatter: function(d){
				            		return `<div class="btn-group">
					                            <a data-toggle="dropdown" aria-expanded="true"><i class="fa fa-"></i> <span class="caret"></span></a>
					                            <ul class="dropdown-menu">
					                                <li><a href="#">Confirm</a></li>
					                                <li><a href="#">Delete</a></li>
					                                <li><a href="#">Share</a></li>
					                                <li class="divider"></li>
					                                <li><a href="#">Search Me</a></li>
					                            </ul>
					                        </div>`;
				            	}
				            });
				            self.model.columns = cols;
				            self.model.options = {
							                        toggle: "table",
													classes: "table",
												    showColumns: false,
												    pagination: true,
												    showExport: false,
												    exportTypes: "['json', 'xml', 'csv', 'txt', 'sql', 'excel']",
												    pageSize: "20",
							         				pageList: "[20,40,60,80,100]",
							         				detailView: true,
							         				buttonsAlign: "right",
							         				clickToSelect: true
									            };

							_.delay(self.loadDetailData,500);
                        },
                        methods: {
                        	init: function(){
                        		var self = this;

                        	},
                        	loadDetailData: function() {
				                var self = this;
				                
				                $(self.target).on('expand-row.bs.table', function(e, index, row, $detail) {

				                    var oneLevelLoading;
				                    var chart;
				                    var subChart = $("<div></div>").attr("id", 'div_analysis_chart' + index).css("height", "400");

				                    var param = `/matrix/devops/performance: 
				                          | id=` + row.id + `
				                          | sort ctime asc 
				                          | top 5000
				                          | within 8hour`;

				                    $(".info").removeClass('info');
				                    $("[data-index='" + index + "']").addClass('info');
				                    $($detail).addClass('info');


				                    jQuery.ajax({
				                        url: '/mxobject/search',
				                        dataType: 'json',
				                        type: 'POST',
				                        data: {
				                            cond: param,
				                            flag: false
				                        },
				                        beforeSend: function(xhr) {
				                            oneLevelLoading = layer.load(3, {
				                                shade: [0.1, '#ccc'],
				                                time: 30 * 1000
				                            });
				                        },
				                        complete: function(xhr, textStatus) {
				                            layer.close(oneLevelLoading);
				                        },
				                        success: function(data, textStatus, xhr) {

				                            if (data.message.length < 1) {
				                                swal("没有版本数据！", param, "warning");
				                                return false;
				                            }

				                            var chartXData = _.map(data.message, 'ctime');
				                            var seriesData = _.map(data.message, 'value');

				                            $detail.html(subChart).ready(function() {

				                                var option = {};

				                                chart = echarts.init(document.getElementById('div_analysis_chart' + index));
				                                
				                                if(row.param == 'usedpercent'){
				                                    option = {
				                                                title: {
				                                                    text: row.host,
				                                                    subtext: row.app + " " + row.inst + " " + row.param,
				                                                    x: 'center',
				                                                    align: 'right'
				                                                },
				                                                tooltip: {
				                                                    trigger: 'axis',
				                                                    axisPointer: {
				                                                        animation: false
				                                                    }
				                                                },
				                                                toolbox: {
				                                                    show: true,
				                                                    feature: {
				                                                        magicType: {
				                                                            show: true,
				                                                            type: ['line', 'bar']
				                                                        },
				                                                        saveAsImage: {
				                                                            show: true
				                                                        }
				                                                    }
				                                                },
				                                                xAxis: {
				                                                    data: chartXData.map(function(str) {
				                                                        return moment(str).format('MM-DD HH:mm:ss');
				                                                    })
				                                                },
				                                                yAxis: [{
				                                                    name: row.param,
				                                                    type: 'value',
				                                                    max: 100
				                                                }, ],
				                                                series: [{
				                                                    name: row.inst + " " + row.param,
				                                                    type: 'line',
				                                                    smooth: true,
				                                                    lineStyle: {
				                                                        normal: {
				                                                            color: '#66CC33',
				                                                            width: 1,
				                                                            shadowColor: 'rgba(0,0,0,0.4)',
				                                                            shadowBlur: 10,
				                                                            shadowOffsetY: 10
				                                                        }
				                                                    },
				                                                    data: seriesData,
				                                                    markPoint: {
				                                                        data: [{
				                                                            type: 'max',
				                                                            name: '最大值',
				                                                            label: {
				                                                                normal: {
				                                                                    formatter: '{c} %',
				                                                                }
				                                                            },
				                                                            symbol: 'pin',
				                                                            symbolSize: 82,
				                                                            itemStyle: {
				                                                                normal: {
				                                                                    color: '#03a9f4'
				                                                                }
				                                                            }
				                                                        }, 
				                                                        {
				                                                            type: 'min',
				                                                            name: '最小值',
				                                                            label: {
				                                                                normal: {
				                                                                    formatter: '{c} %',
				                                                                }
				                                                            },
				                                                            symbol: 'pin',
				                                                            symbolSize: 82,
				                                                            itemStyle: {
				                                                                normal: {
				                                                                    color: '#03a9f4'
				                                                                }
				                                                            }
				                                                        }]
				                                                    },
				                                                    markLine: {
				                                                        data: [{
				                                                            type: 'average',
				                                                            name: '平均值',
				                                                            label: {
				                                                                normal: {
				                                                                    formatter: '{c} %',
				                                                                }
				                                                            },
				                                                            lineStyle: {
				                                                                normal: {
				                                                                    width:2,
				                                                                    color: '#03a9f4'
				                                                                }
				                                                            }
				                                                        }]
				                                                    }
				                                                }]
				                                            }
				                                } else {
				                                    option = {
				                                                title: {
				                                                    text: row.host,
				                                                    subtext: row.app + " " + row.inst + " " + row.param,
				                                                    x: 'center',
				                                                    align: 'right'
				                                                },
				                                                tooltip: {
				                                                    trigger: 'axis',
				                                                    axisPointer: {
				                                                        animation: false
				                                                    }
				                                                },
				                                                toolbox: {
				                                                    show: true,
				                                                    feature: {
				                                                        magicType: {
				                                                            show: true,
				                                                            type: ['line', 'bar']
				                                                        },
				                                                        saveAsImage: {
				                                                            show: true
				                                                        }
				                                                    }
				                                                },
				                                                xAxis: {
				                                                    data: chartXData.map(function(str) {
				                                                        return moment(str).format('MM-DD HH:mm:ss');
				                                                    })
				                                                },
				                                                yAxis: [{
				                                                    name: row.param,
				                                                    type: 'value'
				                                                }, ],
				                                                series: [{
				                                                    name: row.inst + " " + row.param,
				                                                    type: 'bar',
				                                                    smooth: true,
				                                                    lineStyle: {
				                                                        normal: {
				                                                            width: 1,
				                                                            shadowColor: 'rgba(0,0,0,0.4)',
				                                                            shadowBlur: 10,
				                                                            shadowOffsetY: 10
				                                                        }
				                                                    },
				                                                    data: _.map(seriesData,function(d){
				                                                            return _.round(d/1024/1024,2);
				                                                        })
				                                                }]
				                                            }
				                                }
				                                chart.setOption(option);
				                            });

				                        },
				                        error: function(xhr, textStatus, errorThrown) {
				                            layer.close(oneLevelLoading);
				                        }
				                    });

				                });
				            }
                        }
                    });
                }, 500);
            },
            error: function(xhr, textStatus, errorThrown) {
             	layer.close(oneLevelLoading);
            }
        });
	}, null, null, 'Ctrl+Shift+2');

	// Log actions
	this.addAction('mx-log', function() {
		var cellSelected = graph.getSelectionCell().value;
		var self = this;
		var param = "";
		var oneLevelLoading;
		var win;
		var w = $( window ).width();//document.body.clientWidth;
		var h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);
		var lrwh = [(w-800)/2, (h-450)/3, 1024, 550];

		if(_.isEmpty(cellSelected)){
			swal("Please Select Node","","info");
			return false;
		} else {
			param =`#/matrix/devops/log/:  |` + cellSelected + ` | print id,biz,app,host,msg,ctime, severity, src,vtime| sort ctime desc
																 | lua severity=<lua> if severity == 'FATAL' then 
						                                              return "<kbd style='background-color:#000000;'>重大</kbd>"  
						                                             elseif  severity == 'ERROR' or severity == '5' or severity == 'ERR' then 
						                                              return "<kbd style='background-color:#FF0000;'>严重</kbd>"  
						                                             elseif  severity == 'WARN' or severity == '4' then 
						                                              return "<kbd style='background-color:#F0AD4E;'>警告</kbd>"  
						                                             elseif  severity == 'INFO' or severity == '一般' or severity == '3' or severity == '2' or severity == '1' then 
						                                              return "<kbd style='background-color:#3BC303;'>一般</kbd>"  
						                                             elseif severity== '6' then
						                                              return "<kbd style='background-color:#6BD2D2;'>未知</kbd>"  
						                                             end  
						                                           </lua>
						                                         | lua msg=<lua> 
										                                    if src=="shell" then
										                                      return "<pre style='border:0px;'>"..string.gsub(msg, "UN", "<kbd style='background-color:#4AB93D;'>".."%1".."</kbd>").."</pre>" 
										                                    end
										                                  </lua>
										                        | lua msg=<lua> 
										                                    if src=="shell" then
										                                      return "<pre style='border:0px;'>"..string.gsub(msg, "DN", "<kbd style='background-color:#ff0000;'>".."%1".."</kbd>").."</pre>" 
										                                    end
										                                  </lua>`
		}

        jQuery.ajax({
            url: '/mxobject/search',
            type: 'POST',
            dataType: 'json',
            data: {
                cond: param,
                flag: false
            },
            beforeSend:function(xhr){ 
                oneLevelLoading = layer.load(3, {
                    shade: [0.1,'#ccc'],
                    time: 30*1000
                });
            },
            complete: function(xhr, textStatus) {
                layer.close(oneLevelLoading);
            },
            success: function(data, textStatus, xhr) {
                
                if(_.isEmpty(data.message)){
                	return false;
                }
                var data = data.message;
                var tb = document.createElement('div');
                $(tb).append(`<bootstrap-table id="show-performance" :columns="model.columns" :options="model.options" :data="model.data"></bootstrap-table>`);                      
                
                win = new mxWindow('日志 ' + cellSelected, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
				win.setMaximizable(true);
				win.setResizable(true);
				win.setClosable(true);
				win.setVisible(true);

				_.delay(function(){
                	var eventVue = new Vue({
                        el: '#show-performance',
                        data:{
                            model:{
                            	columns: [],
                            	options: {},
                            	data: data,
                            }
                        },
                        mounted: function(){
                            var self = this;
                            var cols = [];

                            $.map(data[0], function(v,col) { 
					               
					               if (col == "biz") {
		                                cols[0] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                }
		                            } else if (col == "app") {
		                                cols[1] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                }
		                            } else if (col == "ctime") {
		                                cols[2] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                    formatter: function(value, row, index) {
													   		return moment(value).format('YYYY-MM-DD HH:mm:ss');
													   }
		                                }
		                            } else if (col == "msg") {
		                                cols[3] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                }
		                            } else if (col == "vtime") {
		                                cols[4] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                    formatter: function(value, row, index) {
													   		return moment(value).format('YYYY-MM-DD HH:mm:ss');
													   },
		                                    visible: false
		                                }
		                            } else if (col == "id") {
		                                cols[5] = {
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                    visible: false
		                                }
		                            } else {
		                                cols.push({
		                                    field: col,
		                                    title: col,
		                                    sortable: true,
		                                    visible: false
		                                })
		                            }
						    });
				            cols.push({title:'Period',align:'left',formatter:function(value,row,index){
                                                                    return moment(row.vtime).from(moment(_.now())) + ` <i class="fa fa-spinner fa-spin" style="color:#5cb85c;"></i>`;
                                                                }});
				            
				            self.model.columns = cols;
				            self.model.options = {
							                        toggle: "table",
													classes: "table",
												    showColumns: false,
												    pagination: true,
												    toolbar: "#custom-toolbar1",
												    showExport: false,
												    exportTypes: "['json', 'xml', 'csv', 'txt', 'sql', 'excel']",
												    showFooter: false,
												    pageSize: "20",
							         				pageList: "[20,40,60,80,100]",
							         				detailView: true,
							         				buttonsAlign: "right",
							         				clickToSelect: true
									            };
                        }
                    })
                }, 500);
            },
            error: function(xhr, textStatus, errorThrown) {
             	layer.close(oneLevelLoading);
            }
        });
	}, null, null, 'Ctrl+Shift+3');
	
	// Config actions
	this.addAction('mx-config', function() {
		var cellSelected = graph.getSelectionCell().value;
		var param = "";
		var oneLevelLoading;
		var win;
		var w = $( window ).width();//document.body.clientWidth;
		var h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);
		var lrwh = [(w-500)/2, (h-600)/3, 500, 600];

		if(_.isEmpty(cellSelected)) {
			swal("Please Select Node","","info");
			return false;
		} else {
			var param =`#/matrix/entity/: ` + cellSelected;
		}
		
        jQuery.ajax({
            url: '/mxobject/search',
            type: 'POST',
            dataType: 'json',
            data: {
                cond: param,
                flag: false
            },
            complete: function(xhr, textStatus) {
             
            },
            success: function(data, textStatus, xhr) {
                if(_.isEmpty(data.message)) return false;

                const CONFIG_NORMAL = {"assetid":"资产编号","biz":"业务","class":"类","company":"厂商","contact":"联系人","contain":"包含","ctel":"联系电话","dc":"数据中心","department":"部门","depend":"依赖","files":"附件","host":"服务器","id":"ID","ip":"IP地址","location":"位置","model":"型号","name":"资产名称","owner":"负责人","period":"启动时间","rack":"机柜","refer":"引用","region":"区域","room":"房间","sn":"序列号","status":"状态","tag":"标签","type":"类型","unit":"机架","vtime":"创建时间"};
				const CONFIG_EXT = {"config":"详细配置"};
				
                var data = data.message;
                var tb = document.createElement('div');
				$(tb).append(`<config-component id="show-config-win" :model="model"></config-component>`);
				win = new mxWindow('配置 ' + cellSelected, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
				win.setMaximizable(true);
				win.setResizable(true);
				win.setClosable(true);
				win.setVisible(true);

				_.delay(function(){
                	var cfgVue = new Vue({
                        delimiters: ['${', '}'],
                        el: '#show-config-win',
                        data:{
                            model:{
                            	normal: [],
                            	details: []
                            }
                        },
                        created: function(){
                        	var self = this;

                        	self.initFileUpload();
                        	
                        	eventHub.$on("config-update-event",self.update);
                        },
                        mounted: function(){
                        	var self = this;

                        	self.model.normal = _.map(_.pick(data[0], _.keys(CONFIG_NORMAL)),function(v,k){ 
				                        			if(k == 'day' || k == 'vtime' || k == 'period') {
				                        				v = moment(v).format("YYYY-MM-DD HH:mm:ss");
				                        			}
				                        			if(typeof v === 'object'){
				                        				var comp = `<select name="" id="input" class="form-control" required="required">
							                        					<option value=""></option>
							                        				</select>`;
				                        				v = _.isEmpty(v)?"":JSON.stringify(v,null,"\t");
				                        			}
				                        			return {name:k, value:v, title: CONFIG_NORMAL[k]};
				                        		});

                        	self.model.details = _.map(_.pick(data[0], _.keys(CONFIG_EXT)),function(v,k){ 
				                        			if(k == 'day' || k == 'vtime' || k == 'period') {
				                        				v = moment(v).format("YYYY-MM-DD HH:mm:ss");
				                        			}
				                        			if(typeof v === 'object'){
				                        				v = _.isEmpty(v)?"":JSON.stringify(v,null,"\t");
				                        			}
				                        			return {name:k, value:v, title: CONFIG_NORMAL[k]};
				                        		});
                        },
                        methods:{
                        	update: function(event){
                        		var self = this;
                        		
                        		console.log(JSON.stringify(event))
                        		return false;
                        		jQuery.ajax({
			                        url: '/mxobject/actiontoclass',
			                        type: 'POST',
			                        dataType: 'json',
			                        data: {
			                            data: json,
			                            ctype: "insert"
			                        },
			                        beforeSend: function(xhr) {
			                            
			                        },
			                        complete: function(xhr, textStatus) {
			                            
			                        },
			                        success: function(data, textStatus, xhr) {
			                            
			                        },
			                        error: function(xhr, textStatus, errorThrown) {
			                            
			                        }
			                    })
                        	},
                        	initFileUpload: function(){
				                var uploadButton = $('<button/>')
				                                    .addClass('btn btn-primary')
				                                    .prop('disabled', true)
				                                    .text('Processing...')
				                                    .on('click', function () {
				                                        var $this = $(this),
				                                            data = $this.data();
				                                        $this
				                                            .off('click')
				                                            .text('中止')
				                                            .on('click', function () {
				                                                $this.remove();
				                                                data.abort();
				                                            });
				                                        data.submit().always(function () {
				                                            $this.remove();
				                                        });
				                                    });
				                $('#fileupload').fileupload({
				                    url: "/fs/home",
				                    dataType: 'json',
				                    autoUpload: false,
				                    acceptFileTypes: /(\.|\/)(gif|jpe?g|png|csv|log|pdf|html|txt)$/i,
				                    maxFileSize: 999000,
				                    // Enable image resizing, except for Android and Opera,
				                    // which actually support image resizing, but fail to
				                    // send Blob objects via XHR requests:
				                    disableImageResize: /Android(?!.*Chrome)|Opera/
				                        .test(window.navigator.userAgent),
				                    previewMaxWidth: 100,
				                    previewMaxHeight: 100,
				                    previewCrop: true
				                })
				                .on('fileuploadadd', function (e, data) {
				                    data.context = $('<div/>').appendTo('#files');
				                    $.each(data.files, function (index, file) {
				                        var node = $('<p/>')
				                                .append($('<span/>').text(file.name));
				                        if (!index) {
				                            node
				                                .append('<br>')
				                                .append(uploadButton.clone(true).data(data));
				                        }
				                        node.appendTo(data.context);
				                    });
				                })
				                .on('fileuploadprocessalways', function (e, data) {
				                    var index = data.index,
				                        file = data.files[index],
				                        node = $(data.context.children()[index]);
				                    if (file.preview) {
				                        node
				                            .prepend('<hr>')
				                            .prepend(file.preview);
				                    }
				                    if (file.error) {
				                        node
				                            .append('<hr>')
				                            .append($('<span class="text-danger"/>').text(file.error));
				                    }
				                    if (index + 1 === data.files.length) {
				                        data.context.find('button')
				                            .text('上传')
				                            .prop('disabled', !!data.files.error);
				                    }
				                })
				                .on('fileuploadprogressall', function (e, data) {
				                    var progress = parseInt(data.loaded / data.total * 100, 10);
				                    $('#progress .progress-bar').css(
				                        'width',
				                        progress + '%'
				                    );
				                })
				                .on('fileuploaddone', function (e, data) {
				                    $.each(data.result.files, function (index, file) {
				                        if (file.url) {
				                            var link = $('<a>')
				                                .attr('target', '_blank')
				                                .prop('href', file.url);
				                            $(data.context.children()[index])
				                                .wrap(link);
				                        } else if (file.error) {
				                            var error = $('<span class="text-danger"/>').text(file.error);
				                            $(data.context.children()[index])
				                                .append('<br>')
				                                .append(error);
				                        }
				                    });
				                    _.delay(function(){
				                        $("#files").empty();
				                        $('#progress .progress-bar').css('width','');
				                    }, 2000)
				                    
				                })
				                .on('fileuploadfail', function (e, data) {
				                    $.each(data.files, function (index) {
				                        var error = $('<span class="text-danger"/>').text('上传失败。');
				                        $(data.context.children()[index])
				                            .append('<br>')
				                            .append(error);
				                    });
				                    _.delay(function(){
				                        $("#files").empty();
				                        $('#progress .progress-bar').css('width','');
				                    }, 2000)
				                    
				                })
				                .prop('disabled', !$.support.fileInput)
				                .parent().addClass($.support.fileInput ? undefined : 'disabled');
				            }
                        }
                    })
                },500);
            },
            error: function(xhr, textStatus, errorThrown) {
             
            }
        });
	}, null, null, 'Ctrl+Shift+C');

	// Script actions
	this.addAction('mx-script', function() {
		var self = this;
		var oneLevelLoading;
		var cellSelected = graph.getSelectionCell().value;
		var win;
		var w = $( window ).width();//document.body.clientWidth;
		var h = $( window ).height();//(document.body.clientHeight || document.documentElement.clientHeight);
		var lrwh = [(w-700)/2, (h-580)/3, 700, 580];

		if(_.isEmpty(cellSelected)) {
			swal("Please Select Node","","info");
			return false;
		}

        jQuery.ajax({
            url: '/entity/script',
            type: 'GET',
            dataType: 'json',
            data: {
                id: cellSelected
            },
            beforeSend:function(xhr){ 
                oneLevelLoading = layer.load(3, {
                    shade: [0.1,'#ccc'],
                    time: 30*1000
                });
            },
            complete: function(xhr, textStatus) {
            	layer.close(oneLevelLoading);
            },
            success: function(data, textStatus, xhr) {
                console.log(JSON.stringify(data))
                if(_.isEmpty(data.message)) return false;

                var data = data.message;
                var tb = document.createElement('div');
                $(tb).append(`<div id="show-script"></div>`);                      

                win = new mxWindow(mxResources.get("mx-contextmenu-script-win-title")+cellSelected, tb, lrwh[0], lrwh[1], lrwh[2], lrwh[3], true, true);
				win.setMaximizable(true);
				win.setResizable(true);
				win.setClosable(true);
				win.setVisible(true);

				_.delay(function(){
                	var scriptVue = new Vue({
                        el: '#show-script',
                        template: `	<div class="panel">
				                        <div class="panel-heading" style="height:22px;">
				                            <div class="panel-heading-btn">
				                                <!--a href="javascript:;" class="btn btn-xs btn-default" ><i class="fa fa-open"></i> `+mxResources.get("mx-contextmenu-script-win-open")+`</a-->
				                                <!--a href="javascript:;" class="btn btn-xs btn-default" ><i class="fa fa-import"></i> `+mxResources.get("mx-contextmenu-script-win-import")+`</a-->
				                                <!--a href="javascript:;" class="btn btn-xs btn-default" ><i class="fa fa-export"></i> `+mxResources.get("mx-contextmenu-script-win-export")+`</a-->
				                                <a href="javascript:void(0);" class="btn btn-xs btn-default" @click="save()" :disabled="actions.saveBtn"><i class="fa fa-save"></i> `+mxResources.get("mx-contextmenu-script-win-save")+`</a>
				                                <a href="javascript:;" class="btn btn-xs btn-default" ><i class="fa fa-file"></i> `+mxResources.get("mx-contextmenu-script-win-saveas")+`</a>
				                                <!--a href="javascript:;" class="btn btn-xs btn-default" ><i class="fa fa-close"></i> `+mxResources.get("mx-contextmenu-script-win-close")+`</a-->
				                            </div>
				                        </div>
				                        <div class="panel-body" style="padding:0px;border-top: 1px solid #e8e8e8;border-bottom: 1px solid #e8e8e8;">
				                            <object-script-editor-component id="script-editer" :model="model"></object-script-editor-component>
				                        </div>
				                        <div class="panel-footer" id="statusBar"></div>
				                    </div>`,
                        data:{
                            model:{
                            	oldInput: "",
                            	newInput: "",
                            	mode: "lua"
                            },
                            actions: {
                            	saveBtn: true
                            }
                        },
                        created: function(){
                        	var self = this;

                        	eventHub.$on("editor-script-input-event",self.setNewInput);
                        },
                        mounted: function(){
                            var self = this;

                            self.$nextTick(function () {
                            	_.delay(self.init,500);
                            })
                        },
                        methods:{
                        	init: function(){
                        		var self = this;

                        		self.model.oldInput = data.script.BPM;
                        	},
                        	setNewInput: function(val){
                        		var self = this;

                        		self.model.newInput = val;

                        		if(self.model.newInput != self.model.oldInput){
                        			self.actions.saveBtn = false;
                        		} else {
                        			self.actions.saveBtn = true;
                        		}
                        	},
                        	save: function(){
                        		var self = this;

                        		jQuery.ajax({
						            url: '/entity/script',
						            type: 'PUT',
						            dataType: 'json',
						            data: {
						            	id: cellSelected, 
						            	name: 'BPM',
						            	script: self.model.newInput
						            },
						            beforeSend:function(xhr){ 
						            },
						            complete: function(xhr, textStatus) {
						            },
						            success: function(data, textStatus, xhr) {
						                console.log(data.status)
						            },
						            error: function(xhr, textStatus, errorThrown) {
						            	console.log(errorThrown)
						            }
						        })
                        	}
                        }
                    });
                }, 500);
            },
            error: function(xhr, textStatus, errorThrown) {
             	layer.close(oneLevelLoading);
            }
        });

	}, null, null, 'Ctrl+Shift+A');

	// Save actions
	this.addAction('mx-save', function() {
		let tmp = localStorage.getItem("graph-object");
		let graphObject = _.attempt(JSON.parse.bind(null, tmp));

        let encoder = new mxCodec();
        let node = encoder.encode(graph.getModel());
        let fm = new FormData();

        fm.append("data", mxUtils.getPrettyXml(node));
        fm.append("attr", JSON.stringify({
            'content': mxUtils.getPrettyXml(node), 'pic': ''
        }));
        fm.append("type", "file");

        //console.log( JSON.stringify({'content': mxUtils.getPrettyXml(node)}) )
        jQuery.ajax({
            url: '/fs'+ graphObject.parent + "/" + graphObject.name,
            type: 'PUT',
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            dataType: "json",
            data: fm,
            beforeSend: function(xhr) {
            },
            complete: function(xhr, textStatus) {
            },
            success: function(data, textStatus, xhr) {
                swal("Success",'/fs'+ graphObject.parent + "/" + graphObject.name,"success");
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log(xhr,textStatus,errorThrown);
            }
        })

	}, null, 'null', 'Ctrl+Shift+S');

	// Clase actions
	this.addAction('mx-close', function()
	{	
		window.close();
	});

	// File actions
	this.addAction('new...', function() { window.open(ui.getUrl()); });
	this.addAction('open...', function()
	{
		window.openNew = true;
		window.openKey = 'open';
		
		ui.openFile();
	});
	this.addAction('import...', function()
	{
		window.openNew = false;
		window.openKey = 'import';
		
		// Closes dialog after open
		window.openFile = new OpenFile(mxUtils.bind(this, function()
		{
			ui.hideDialog();
		}));
		
		window.openFile.setConsumer(mxUtils.bind(this, function(xml, filename)
		{
			try
			{
				var doc = mxUtils.parseXml(xml);
				var model = new mxGraphModel();
				var codec = new mxCodec(doc);
				codec.decode(doc.documentElement, model);
				
				var children = model.getChildren(model.getChildAt(model.getRoot(), 0));
				editor.graph.setSelectionCells(editor.graph.importCells(children));
			}
			catch (e)
			{
				mxUtils.alert(mxResources.get('invalidOrMissingFile') + ': ' + e.message);
			}
		}));

		// Removes openFile if dialog is closed
		ui.showDialog(new OpenDialog(this).container, 320, 220, true, true, function()
		{
			window.openFile = null;
		});
	}).isEnabled = isGraphEnabled;
	this.addAction('save', function() { ui.saveFile(false); }, null, null, 'Ctrl+S').isEnabled = isGraphEnabled;
	this.addAction('saveAs...', function() { ui.saveFile(true); }, null, null, 'Ctrl+Shift+S').isEnabled = isGraphEnabled;
	this.addAction('export...', function() { ui.showDialog(new ExportDialog(ui).container, 300, 230, true, true); });
	this.addAction('editDiagram...', function()
	{
		var dlg = new EditDiagramDialog(ui);
		ui.showDialog(dlg.container, 620, 420, true, true);
		dlg.init();
	});
	this.addAction('pageSetup...', function() { ui.showDialog(new PageSetupDialog(ui).container, 320, 220, true, true); }).isEnabled = isGraphEnabled;
	this.addAction('print...', function() { ui.showDialog(new PrintDialog(ui).container, 300, 180, true, true); }, null, 'sprite-print', 'Ctrl+P');
	this.addAction('preview', function() { mxUtils.show(graph, null, 10, 10); });
	
	// Edit actions
	this.addAction('undo', function() { ui.undo(); }, null, 'sprite-undo', 'Ctrl+Z');
	this.addAction('redo', function() { ui.redo(); }, null, 'sprite-redo', (!mxClient.IS_WIN) ? 'Ctrl+Shift+Z' : 'Ctrl+Y');
	this.addAction('cut', function() { mxClipboard.cut(graph); }, null, 'sprite-cut', 'Ctrl+X');
	this.addAction('copy', function() { mxClipboard.copy(graph); }, null, 'sprite-copy', 'Ctrl+C');
	this.addAction('paste', function()
	{
		if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
		{
			mxClipboard.paste(graph);
		}
	}, false, 'sprite-paste', 'Ctrl+V');
	this.addAction('pasteHere', function(evt)
	{
		if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
		{
			graph.getModel().beginUpdate();
			try
			{
				var cells = mxClipboard.paste(graph);
				
				if (cells != null)
				{
					var bb = graph.getBoundingBoxFromGeometry(cells);
					
					if (bb != null)
					{
						var t = graph.view.translate;
						var s = graph.view.scale;
						var dx = t.x;
						var dy = t.y;
						
						var x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
						var y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));
						
						graph.cellsMoved(cells, x - bb.x, y - bb.y);
					}
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	});
	
	function deleteCells(includeEdges)
	{
		// Cancels interactive operations
		graph.escape();
		var cells = graph.getDeletableCells(graph.getSelectionCells());
		
		if (cells != null && cells.length > 0)
		{
			var parents = graph.model.getParents(cells);
			graph.removeCells(cells, includeEdges);
			
			// Selects parents for easier editing of groups
			if (parents != null)
			{
				var select = [];
				
				for (var i = 0; i < parents.length; i++)
				{
					if (graph.model.isVertex(parents[i]) || graph.model.isEdge(parents[i]))
					{
						select.push(parents[i]);
					}
				}
				
				graph.setSelectionCells(select);
			}
		}
	};
	
	this.addAction('delete', function(evt)
	{
		deleteCells(evt != null && mxEvent.isShiftDown(evt));
	}, null, null, 'Delete');
	this.addAction('deleteAll', function()
	{
		deleteCells(true);
	}, null, null, 'Ctrl+Delete');
	this.addAction('duplicate', function()
	{
		graph.setSelectionCells(graph.duplicateCells());
	}, null, null, 'Ctrl+D');
	this.put('turn', new Action(mxResources.get('turn') + ' / ' + mxResources.get('reverse'), function()
	{
		graph.turnShapes(graph.getSelectionCells());
	}, null, null, 'Ctrl+R'));
	this.addAction('selectVertices', function() { graph.selectVertices(); }, null, null, 'Ctrl+Shift+I');
	this.addAction('selectEdges', function() { graph.selectEdges(); }, null, null, 'Ctrl+Shift+E');
	this.addAction('selectAll', function() { graph.selectAll(null, true); }, null, null, 'Ctrl+A');
	this.addAction('selectNone', function() { graph.clearSelection(); }, null, null, 'Ctrl+Shift+A');
	this.addAction('lockUnlock', function()
	{
		if (!graph.isSelectionEmpty())
		{
			graph.getModel().beginUpdate();
			try
			{
				var defaultValue = graph.isCellMovable(graph.getSelectionCell()) ? 1 : 0;
				graph.toggleCellStyles(mxConstants.STYLE_MOVABLE, defaultValue);
				graph.toggleCellStyles(mxConstants.STYLE_RESIZABLE, defaultValue);
				graph.toggleCellStyles(mxConstants.STYLE_ROTATABLE, defaultValue);
				graph.toggleCellStyles(mxConstants.STYLE_DELETABLE, defaultValue);
				graph.toggleCellStyles(mxConstants.STYLE_EDITABLE, defaultValue);
				graph.toggleCellStyles('connectable', defaultValue);
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	}, null, null, 'Ctrl+L');

	// Navigation actions
	this.addAction('home', function() { graph.home(); }, null, null, 'Home');
	this.addAction('exitGroup', function() { graph.exitGroup(); }, null, null, 'Ctrl+Shift+Page Up');
	this.addAction('enterGroup', function() { graph.enterGroup(); }, null, null, 'Ctrl+Shift+Page Down');
	this.addAction('expand', function() { graph.foldCells(false); }, null, null, 'Ctrl+Page Down');
	this.addAction('collapse', function() { graph.foldCells(true); }, null, null, 'Ctrl+Page Up');

	// Arrange actions
	this.addAction('toFront', function() { graph.orderCells(false); }, null, null, 'Ctrl+Shift+F');
	this.addAction('toBack', function() { graph.orderCells(true); }, null, null, 'Ctrl+Shift+B');
	this.addAction('group', function()
	{
		if (graph.getSelectionCount() == 1)
		{
			graph.setCellStyles('container', '1');
		}
		else
		{
			graph.setSelectionCell(graph.groupCells(null, 0));
		}
	}, null, null, 'Ctrl+G');
	this.addAction('ungroup', function()
	{
		if (graph.getSelectionCount() == 1 && graph.getModel().getChildCount(graph.getSelectionCell()) == 0)
		{
			graph.setCellStyles('container', '0');
		}
		else
		{
			graph.setSelectionCells(graph.ungroupCells());
		}
	}, null, null, 'Ctrl+Shift+U');
	this.addAction('removeFromGroup', function() { graph.removeCellsFromParent(); });
	// Adds action
	this.addAction('edit', function()
	{
		if (graph.isEnabled())
		{
			graph.startEditingAtCell();
		}
	}, null, null, 'F2/Enter');
	this.addAction('editData...', function()
	{
		var cell = graph.getSelectionCell() || graph.getModel().getRoot();
		
		if (cell != null)
		{
			var dlg = new EditDataDialog(ui, cell);
			ui.showDialog(dlg.container, 320, 320, true, false);
			dlg.init();
		}
	}, null, null, 'Ctrl+M');
	this.addAction('editTooltip...', function()
	{
		var graph = ui.editor.graph;
		
		if (graph.isEnabled() && !graph.isSelectionEmpty())
		{
			var cell = graph.getSelectionCell();
			var tooltip = '';
			
			if (mxUtils.isNode(cell.value))
			{
				var tmp = cell.value.getAttribute('tooltip');
				
				if (tmp != null)
				{
					tooltip = tmp;
				}
			}
			
	    	var dlg = new TextareaDialog(ui, mxResources.get('editTooltip') + ':', tooltip, function(newValue)
			{
				graph.setTooltipForCell(cell, newValue);
			});
			ui.showDialog(dlg.container, 320, 200, true, true);
			dlg.init();
		}
	});
	this.addAction('openLink', function()
	{
		var link = graph.getLinkForCell(graph.getSelectionCell());
		
		if (link != null)
		{
			window.open(link);
		}
	});
	this.addAction('editLink...', function()
	{
		var graph = ui.editor.graph;
		
		if (graph.isEnabled() && !graph.isSelectionEmpty())
		{
			var cell = graph.getSelectionCell();
			var value = graph.getLinkForCell(cell) || '';
			
			ui.showLinkDialog(value, mxResources.get('apply'), function(link)
			{
				link = mxUtils.trim(link);
    			graph.setLinkForCell(cell, (link.length > 0) ? link : null);
			});
		}
	});
	this.addAction('insertLink...', function()
	{
		if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
		{
			var dlg = new LinkDialog(ui, '', mxResources.get('insert'), function(link, docs)
			{
				link = mxUtils.trim(link);
				
				if (link.length > 0)
				{
					var title = link.substring(link.lastIndexOf('/') + 1);
					var icon = null;
					
					if (docs != null && docs.length > 0)
					{
						icon = docs[0].iconUrl;
						title = docs[0].name || docs[0].type;
						title = title.charAt(0).toUpperCase() + title.substring(1);
						
						if (title.length > 30)
						{
							title = title.substring(0, 30) + '...';
						}
					}
					
					var pt = graph.getFreeInsertPoint();
            		var linkCell = new mxCell(title, new mxGeometry(pt.x, pt.y, 100, 40),
            	    	'fontColor=#0000EE;fontStyle=4;rounded=1;overflow=hidden;' + ((icon != null) ?
            	    	'shape=label;imageWidth=16;imageHeight=16;spacingLeft=26;align=left;image=' + icon :
            	    	'spacing=10;'));
            	    linkCell.vertex = true;

            	    graph.setLinkForCell(linkCell, link);
            	    graph.cellSizeUpdated(linkCell, true);
            	    graph.setSelectionCell(graph.addCell(linkCell));
            	    graph.scrollCellToVisible(graph.getSelectionCell());
				}
			});
			
			ui.showDialog(dlg.container, 420, 90, true, true);
			dlg.init();
		}
	}).isEnabled = isGraphEnabled;
	this.addAction('link...', mxUtils.bind(this, function()
	{
		var graph = ui.editor.graph;
		
		if (graph.isEnabled())
		{
			if (graph.cellEditor.isContentEditing())
			{
				var link = graph.getParentByName(graph.getSelectedElement(), 'A', graph.cellEditor.textarea);
				var oldValue = '';
				
				if (link != null)
				{
					oldValue = link.getAttribute('href') || '';
				}
				
				var selState = graph.cellEditor.saveSelection();
				
				ui.showLinkDialog(oldValue, mxResources.get('apply'), mxUtils.bind(this, function(value)
				{
		    		graph.cellEditor.restoreSelection(selState);

		    		if (value != null)
		    		{
		    			graph.insertLink(value);
					}
				}));
			}
			else if (graph.isSelectionEmpty())
			{
				this.get('insertLink').funct();
			}
			else
			{
				this.get('editLink').funct();
			}
		}
	})).isEnabled = isGraphEnabled;
	this.addAction('autosize', function()
	{
		var cells = graph.getSelectionCells();
		
		if (cells != null)
		{
			graph.getModel().beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					var cell = cells[i];
					
					if (graph.getModel().getChildCount(cell))
					{
						graph.updateGroupBounds([cell], 20);
					}
					else
					{
						var state = graph.view.getState(cell);
						var geo = graph.getCellGeometry(cell);

						if (graph.getModel().isVertex(cell) && state != null && state.text != null &&
							geo != null && graph.isWrapping(cell))
						{
							geo = geo.clone();
							geo.height = state.text.boundingBox.height / graph.view.scale;
							graph.getModel().setGeometry(cell, geo);
						}
						else
						{
							graph.updateCellSize(cell);
						}
					}
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	}, null, null, 'Ctrl+Shift+Y');
	this.addAction('formattedText', function()
	{
    	var state = graph.getView().getState(graph.getSelectionCell());
    	
    	if (state != null)
    	{
	    	var value = '1';
	    	graph.stopEditing();
			
			graph.getModel().beginUpdate();
			try
			{
		    	if (state.style['html'] == '1')
		    	{
		    		value = null;
		    		var label = graph.convertValueToString(state.cell);
		    		
		    		if (mxUtils.getValue(state.style, 'nl2Br', '1') != '0')
					{
						// Removes newlines from HTML and converts breaks to newlines
						// to match the HTML output in plain text
						label = label.replace(/\n/g, '').replace(/<br\s*.?>/g, '\n');
					}
		    		
		    		// Removes HTML tags
	    			var temp = document.createElement('div');
	    			temp.innerHTML = label;
	    			label = mxUtils.extractTextWithWhitespace(temp.childNodes);
	    			
					graph.cellLabelChanged(state.cell, label);
		    	}
		    	else
		    	{
		    		// Converts HTML tags to text
		    		var label = mxUtils.htmlEntities(graph.convertValueToString(state.cell), false);
		    		
		    		if (mxUtils.getValue(state.style, 'nl2Br', '1') != '0')
					{
						// Converts newlines in plain text to breaks in HTML
						// to match the plain text output
		    			label = label.replace(/\n/g, '<br/>');
					}
		    		
		    		graph.cellLabelChanged(state.cell, graph.sanitizeHtml(label));
		    	}
		
		       	graph.setCellStyles('html', value);
				ui.fireEvent(new mxEventObject('styleChanged', 'keys', ['html'],
						'values', [(value != null) ? value : '0'], 'cells',
						graph.getSelectionCells()));
			}
			finally
			{
				graph.getModel().endUpdate();
			}
    	}
	});
	this.addAction('wordWrap', function()
	{
    	var state = graph.getView().getState(graph.getSelectionCell());
    	var value = 'wrap';
    	
		graph.stopEditing();
    	
    	if (state != null && state.style[mxConstants.STYLE_WHITE_SPACE] == 'wrap')
    	{
    		value = null;
    	}

       	graph.setCellStyles(mxConstants.STYLE_WHITE_SPACE, value);
	});
	this.addAction('rotation', function()
	{
		var value = '0';
    	var state = graph.getView().getState(graph.getSelectionCell());
    	
    	if (state != null)
    	{
    		value = state.style[mxConstants.STYLE_ROTATION] || value;
    	}

		var dlg = new FilenameDialog(ui, value, mxResources.get('apply'), function(newValue)
		{
			if (newValue != null && newValue.length > 0)
			{
				graph.setCellStyles(mxConstants.STYLE_ROTATION, newValue);
			}
		}, mxResources.get('enterValue') + ' (' + mxResources.get('rotation') + ' 0-360)');
		
		ui.showDialog(dlg.container, 300, 80, true, true);
		dlg.init();
	});
	// View actions
	this.addAction('resetView', function()
	{
		graph.zoomTo(1);
		ui.resetScrollbars();
	}, null, null, 'Ctrl+H');
	this.addAction('zoomIn', function(evt) { graph.zoomIn(); }, null, null, 'Ctrl + / Alt+Mousewheel');
	this.addAction('zoomOut', function(evt) { graph.zoomOut(); }, null, null, 'Ctrl - / Alt+Mousewheel');
	this.addAction('fitWindow', function() { graph.fit(); }, null, null, 'Ctrl+Shift+H');
	this.addAction('fitPage', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 10;
		var ch = graph.container.clientHeight - 10;
		var scale = Math.floor(20 * Math.min(cw / fmt.width / ps, ch / fmt.height / ps)) / 20;
		graph.zoomTo(scale);
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			var pad = graph.getPagePadding();
			graph.container.scrollTop = pad.y * graph.view.scale;
			graph.container.scrollLeft = Math.min(pad.x * graph.view.scale, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
		}
	}), null, null, 'Ctrl+J');
	this.addAction('fitTwoPages', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 10;
		var ch = graph.container.clientHeight - 10;
		
		var scale = Math.floor(20 * Math.min(cw / (2 * fmt.width) / ps, ch / fmt.height / ps)) / 20;
		graph.zoomTo(scale);
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			var pad = graph.getPagePadding();
			graph.container.scrollTop = Math.min(pad.y, (graph.container.scrollHeight - graph.container.clientHeight) / 2);
			graph.container.scrollLeft = Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
		}
	}), null, null, 'Ctrl+Shift+J');
	this.addAction('fitPageWidth', mxUtils.bind(this, function()
	{
		if (!graph.pageVisible)
		{
			this.get('pageView').funct();
		}
		
		var fmt = graph.pageFormat;
		var ps = graph.pageScale;
		var cw = graph.container.clientWidth - 10;

		var scale = Math.floor(20 * cw / fmt.width / ps) / 20;
		graph.zoomTo(scale);
		
		if (mxUtils.hasScrollbars(graph.container))
		{
			var pad = graph.getPagePadding();
			graph.container.scrollLeft = Math.min(pad.x * graph.view.scale,
				(graph.container.scrollWidth - graph.container.clientWidth) / 2);
		}
	}));
	this.put('customZoom', new Action(mxResources.get('custom') + '...', mxUtils.bind(this, function()
	{
		var dlg = new FilenameDialog(this.editorUi, parseInt(graph.getView().getScale() * 100), mxResources.get('apply'), mxUtils.bind(this, function(newValue)
		{
			var val = parseInt(newValue);
			
			if (!isNaN(val) && val > 0)
			{
				graph.zoomTo(val / 100);
			}
		}), mxResources.get('zoom') + ' (%)');
		this.editorUi.showDialog(dlg.container, 300, 80, true, true);
		dlg.init();
	}), null, null, 'Ctrl+0'));
	this.addAction('pageScale...', mxUtils.bind(this, function()
	{
		var dlg = new FilenameDialog(this.editorUi, parseInt(graph.pageScale * 100), mxResources.get('apply'), mxUtils.bind(this, function(newValue)
		{
			var val = parseInt(newValue);
			
			if (!isNaN(val) && val > 0)
			{
				ui.setPageScale(val / 100);
			}
		}), mxResources.get('pageScale') + ' (%)');
		this.editorUi.showDialog(dlg.container, 300, 80, true, true);
		dlg.init();
	}));

	// Option actions
	var action = null;
	action = this.addAction('grid', function()
	{
		graph.setGridEnabled(!graph.isGridEnabled());
		ui.fireEvent(new mxEventObject('gridEnabledChanged'));
	}, null, null, 'Ctrl+Shift+G');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.isGridEnabled(); });
	action.setEnabled(false);
	
	action = this.addAction('guides', function()
	{
		graph.graphHandler.guidesEnabled = !graph.graphHandler.guidesEnabled;
		ui.fireEvent(new mxEventObject('guidesEnabledChanged'));
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.graphHandler.guidesEnabled; });
	action.setEnabled(false);
	
	action = this.addAction('tooltips', function()
	{
		graph.tooltipHandler.setEnabled(!graph.tooltipHandler.isEnabled());
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.tooltipHandler.isEnabled(); });
	
	action = this.addAction('collapseExpand', function()
	{
		ui.setFoldingEnabled(!graph.foldingEnabled);
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.foldingEnabled; });
	action.isEnabled = isGraphEnabled;
	action = this.addAction('scrollbars', function()
	{
		ui.setScrollbars(!ui.hasScrollbars());
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.scrollbars; });
	action = this.addAction('pageView', mxUtils.bind(this, function()
	{
		ui.setPageVisible(!graph.pageVisible);
	}));
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.pageVisible; });
	this.put('pageBackgroundColor', new Action(mxResources.get('backgroundColor') + '...', function()
	{
		ui.pickColor(graph.background || 'none', function(color)
		{
			ui.setBackgroundColor(color);
		});
	}));
	action = this.addAction('connectionArrows', function()
	{
		graph.connectionArrowsEnabled = !graph.connectionArrowsEnabled;
		ui.fireEvent(new mxEventObject('connectionArrowsChanged'));
	}, null, null, 'Ctrl+Q');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.connectionArrowsEnabled; });
	action = this.addAction('connectionPoints', function()
	{
		graph.setConnectable(!graph.connectionHandler.isEnabled());
		ui.fireEvent(new mxEventObject('connectionPointsChanged'));
	}, null, null, 'Ctrl+Shift+Q');
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.connectionHandler.isEnabled(); });
	action = this.addAction('copyConnect', function()
	{
		graph.connectionHandler.setCreateTarget(!graph.connectionHandler.isCreateTarget());
		ui.fireEvent(new mxEventObject('copyConnectChanged'));
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return graph.connectionHandler.isCreateTarget(); });
	action.isEnabled = isGraphEnabled;
	action = this.addAction('autosave', function()
	{
		ui.editor.setAutosave(!ui.editor.autosave);
	});
	action.setToggleAction(true);
	action.setSelectedCallback(function() { return ui.editor.autosave; });
	action.isEnabled = isGraphEnabled;
	action.visible = false;
	
	// Help actions
	this.addAction('help', function()
	{
		var ext = '';
		
		if (mxResources.isLanguageSupported(mxClient.language))
		{
			ext = '_' + mxClient.language;
		}
		
		window.open(RESOURCES_PATH + '/help' + ext + '.html');
	});
	this.put('about', new Action(mxResources.get('about') + ' Graph Editor...', function()
	{
		ui.showDialog(new AboutDialog(ui).container, 320, 280, true, true);
	}, null, null, 'F1'));
	
	// Font style actions
	var toggleFontStyle = mxUtils.bind(this, function(key, style, fn, shortcut)
	{
		return this.addAction(key, function()
		{
			if (fn != null && graph.cellEditor.isContentEditing())
			{
				fn();
			}
			else
			{
				graph.stopEditing(false);
				graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, style);
			}
		}, null, null, shortcut);
	});
	
	toggleFontStyle('bold', mxConstants.FONT_BOLD, function() { document.execCommand('bold', false, null); }, 'Ctrl+B');
	toggleFontStyle('italic', mxConstants.FONT_ITALIC, function() { document.execCommand('italic', false, null); }, 'Ctrl+I');
	toggleFontStyle('underline', mxConstants.FONT_UNDERLINE, function() { document.execCommand('underline', false, null); }, 'Ctrl+U');
	
	// Color actions
	this.addAction('fontColor...', function() { ui.menus.pickColor(mxConstants.STYLE_FONTCOLOR, 'forecolor', '000000'); });
	this.addAction('strokeColor...', function() { ui.menus.pickColor(mxConstants.STYLE_STROKECOLOR); });
	this.addAction('fillColor...', function() { ui.menus.pickColor(mxConstants.STYLE_FILLCOLOR); });
	this.addAction('gradientColor...', function() { ui.menus.pickColor(mxConstants.STYLE_GRADIENTCOLOR); });
	this.addAction('backgroundColor...', function() { ui.menus.pickColor(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, 'backcolor'); });
	this.addAction('borderColor...', function() { ui.menus.pickColor(mxConstants.STYLE_LABEL_BORDERCOLOR); });


	// Format actions
	this.addAction('vertical', function() { ui.menus.toggleStyle(mxConstants.STYLE_HORIZONTAL, true); });
	this.addAction('shadow', function() { ui.menus.toggleStyle(mxConstants.STYLE_SHADOW); });
	this.addAction('solid', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_DASHED, null);
			graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
				'values', [null, null], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('dashed', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
			graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
				'values', ['1', null], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('dotted', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
			graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, '1 4');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
				'values', ['1', '1 4'], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('sharp', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
			graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
					'values', ['0', '0'], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('rounded', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_ROUNDED, '1');
			graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
					'values', ['1', '0'], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('toggleRounded', function()
	{
		if (!graph.isSelectionEmpty() && graph.isEnabled())
		{
			graph.getModel().beginUpdate();
			try
			{
				var cells = graph.getSelectionCells();
	    		var state = graph.view.getState(cells[0]);
	    		var style = (state != null) ? state.style : graph.getCellStyle(cells[0]);
	    		var value = (mxUtils.getValue(style, mxConstants.STYLE_ROUNDED, '0') == '1') ? '0' : '1';
	    		
				graph.setCellStyles(mxConstants.STYLE_ROUNDED, value);
				graph.setCellStyles(mxConstants.STYLE_CURVED, null);
				ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
						'values', [value, '0'], 'cells', graph.getSelectionCells()));
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	});
	this.addAction('curved', function()
	{
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
			graph.setCellStyles(mxConstants.STYLE_CURVED, '1');
			ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
					'values', ['0', '1'], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
	this.addAction('collapsible', function()
	{
		var state = graph.view.getState(graph.getSelectionCell());
		var value = '1';
		
		if (state != null && graph.getFoldingImage(state) != null)
		{
			value = '0';	
		}
		
		graph.setCellStyles('collapsible', value);
		ui.fireEvent(new mxEventObject('styleChanged', 'keys', ['collapsible'],
				'values', [value], 'cells', graph.getSelectionCells()));
	});
	this.addAction('editStyle...', mxUtils.bind(this, function()
	{
		var cells = graph.getSelectionCells();
		
		if (cells != null && cells.length > 0)
		{
			var model = graph.getModel();
			
	    	var dlg = new TextareaDialog(this.editorUi, mxResources.get('editStyle') + ':',
	    			model.getStyle(cells[0]) || '', function(newValue)
			{
	    		if (newValue != null)
				{
					graph.setCellStyle(mxUtils.trim(newValue), cells);
				}
			}, null, null, 400, 220);
			this.editorUi.showDialog(dlg.container, 420, 300, true, true);
			dlg.init();
		}
	}), null, null, 'Ctrl+E');
	this.addAction('setAsDefaultStyle', function()
	{
		if (graph.isEnabled() && !graph.isSelectionEmpty())
		{
			ui.setDefaultStyle(graph.getSelectionCell());
		}
	}, null, null, 'Ctrl+Shift+D');
	this.addAction('clearDefaultStyle', function()
	{
		if (graph.isEnabled())
		{
			ui.clearDefaultStyle();
		}
	}, null, null, 'Ctrl+Shift+R');
	this.addAction('addWaypoint', function()
	{
		var cell = graph.getSelectionCell();
		
		if (cell != null && graph.getModel().isEdge(cell))
		{
			var handler = editor.graph.selectionCellsHandler.getHandler(cell);
			
			if (handler instanceof mxEdgeHandler)
			{
				var t = graph.view.translate;
				var s = graph.view.scale;
				var dx = t.x;
				var dy = t.y;
				
				var parent = graph.getModel().getParent(cell);
				var pgeo = graph.getCellGeometry(parent);
				
				while (graph.getModel().isVertex(parent) && pgeo != null)
				{
					dx += pgeo.x;
					dy += pgeo.y;
					
					parent = graph.getModel().getParent(parent);
					pgeo = graph.getCellGeometry(parent);
				}
				
				var x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
				var y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));
				
				handler.addPointAt(handler.state, x, y);
			}
		}
	});
	this.addAction('removeWaypoint', function()
	{
		// TODO: Action should run with "this" set to action
		var rmWaypointAction = ui.actions.get('removeWaypoint');
		
		if (rmWaypointAction.handler != null)
		{
			// NOTE: Popupevent handled and action updated in Menus.createPopupMenu
			rmWaypointAction.handler.removePoint(rmWaypointAction.handler.state, rmWaypointAction.index);
		}
	});
	this.addAction('clearWaypoints', function()
	{
		var cells = graph.getSelectionCells();
		
		if (cells != null)
		{
			graph.getModel().beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					var cell = cells[i];
					
					if (graph.getModel().isEdge(cell))
					{
						var geo = graph.getCellGeometry(cell);
			
						if (geo != null)
						{
							geo = geo.clone();
							geo.points = null;
							graph.getModel().setGeometry(cell, geo);
						}
					}
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	});
	action = this.addAction('subscript', mxUtils.bind(this, function()
	{
	    if (graph.cellEditor.isContentEditing())
	    {
			document.execCommand('subscript', false, null);
		}
	}), null, null, 'Ctrl+,');
	action = this.addAction('superscript', mxUtils.bind(this, function()
	{
	    if (graph.cellEditor.isContentEditing())
	    {
			document.execCommand('superscript', false, null);
		}
	}), null, null, 'Ctrl+.');
	this.addAction('image...', function()
	{
		if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
		{
			var title = mxResources.get('image') + ' (' + mxResources.get('url') + '):';
	    	var state = graph.getView().getState(graph.getSelectionCell());
	    	var value = '';
	    	
	    	if (state != null)
	    	{
	    		value = state.style[mxConstants.STYLE_IMAGE] || value;
	    	}
	    	
	    	var selectionState = graph.cellEditor.saveSelection();
	    	
	    	ui.showImageDialog(title, value, function(newValue, w, h)
			{
	    		// Inserts image into HTML text
	    		if (graph.cellEditor.isContentEditing())
	    		{
	    			graph.cellEditor.restoreSelection(selectionState);
	    			graph.insertImage(newValue, w, h);
	    		}
	    		else
	    		{
					var cells = graph.getSelectionCells();

					if (newValue != null)
					{
						var select = null;
						
						graph.getModel().beginUpdate();
			        	try
			        	{
			        		// Inserts new cell if no cell is selected
			    			if (cells.length == 0)
			    			{
			    				var pt = graph.getFreeInsertPoint();
			    				cells = [graph.insertVertex(graph.getDefaultParent(), null, '', pt.x, pt.y, w, h,
			    						'shape=image;imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;')];
			    				select = cells;
			    			}
			    			
			        		graph.setCellStyles(mxConstants.STYLE_IMAGE, newValue, cells);
			        		
			        		// Sets shape only if not already shape with image (label or image)
			        		var state = graph.view.getState(cells[0]);
			        		var style = (state != null) ? state.style : graph.getCellStyle(cells[0]);
			        		
			        		if (style[mxConstants.STYLE_SHAPE] != 'image' && style[mxConstants.STYLE_SHAPE] != 'label')
			        		{
			        			graph.setCellStyles(mxConstants.STYLE_SHAPE, 'image', cells);
			        		}
				        	
				        	if (graph.getSelectionCount() == 1)
				        	{
					        	if (w != null && h != null)
					        	{
					        		var cell = cells[0];
					        		var geo = graph.getModel().getGeometry(cell);
					        		
					        		if (geo != null)
					        		{
					        			geo = geo.clone();
						        		geo.width = w;
						        		geo.height = h;
						        		graph.getModel().setGeometry(cell, geo);
					        		}
					        	}
				        	}
			        	}
			        	finally
			        	{
			        		graph.getModel().endUpdate();
			        	}
			        	
			        	if (select != null)
			        	{
			        		graph.setSelectionCells(select);
			        		graph.scrollCellToVisible(select[0]);
			        	}
					}
	    		}
			}, graph.cellEditor.isContentEditing(), !graph.cellEditor.isContentEditing());
		}
	}).isEnabled = isGraphEnabled;
	this.addAction('insertImage...', function()
	{
		if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
		{
			graph.clearSelection();
			ui.actions.get('image').funct();
		}
	}).isEnabled = isGraphEnabled;
	action = this.addAction('layers', mxUtils.bind(this, function()
	{
		if (this.layersWindow == null)
		{
			// LATER: Check outline window for initial placement
			this.layersWindow = new LayersWindow(ui, document.body.offsetWidth - 280, 120, 220, 180);
			this.layersWindow.window.addListener('show', function()
			{
				ui.fireEvent(new mxEventObject('layers'));
			});
			this.layersWindow.window.addListener('hide', function()
			{
				ui.fireEvent(new mxEventObject('layers'));
			});
			this.layersWindow.window.setVisible(true);
			ui.fireEvent(new mxEventObject('layers'));
		}
		else
		{
			this.layersWindow.window.setVisible(!this.layersWindow.window.isVisible());
		}
		
		//ui.fireEvent(new mxEventObject('layers'));
	}), null, null, 'Ctrl+Shift+L');
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() { return this.layersWindow != null && this.layersWindow.window.isVisible(); }));
	action = this.addAction('formatPanel', mxUtils.bind(this, function()
	{
		ui.toggleFormatPanel();
	}), null, null, 'Ctrl+Shift+P');
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() { return ui.formatWidth > 0; }));
	action = this.addAction('outline', mxUtils.bind(this, function()
	{
		if (this.outlineWindow == null)
		{
			// LATER: Check layers window for initial placement
			this.outlineWindow = new OutlineWindow(ui, document.body.offsetWidth - 260, 100, 180, 180);
			this.outlineWindow.window.addListener('show', function()
			{
				ui.fireEvent(new mxEventObject('outline'));
			});
			this.outlineWindow.window.addListener('hide', function()
			{
				ui.fireEvent(new mxEventObject('outline'));
			});
			this.outlineWindow.window.setVisible(true);
			ui.fireEvent(new mxEventObject('outline'));
		}
		else
		{
			this.outlineWindow.window.setVisible(!this.outlineWindow.window.isVisible());
		}
		
		ui.fireEvent(new mxEventObject('outline'));
	}), null, null, 'Ctrl+Shift+O');
	
	action.setToggleAction(true);
	action.setSelectedCallback(mxUtils.bind(this, function() { return this.outlineWindow != null && this.outlineWindow.window.isVisible(); }));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.addAction = function(key, funct, enabled, iconCls, shortcut)
{
	var title;
	
	if (key.substring(key.length - 3) == '...')
	{
		key = key.substring(0, key.length - 3);
		title = mxResources.get(key) + '...';
	}
	else
	{
		title = mxResources.get(key);
	}
	
	return this.put(key, new Action(title, funct, enabled, iconCls, shortcut));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.put = function(name, action)
{
	this.actions[name] = action;
	
	return action;
};

/**
 * Returns the action for the given name or null if no such action exists.
 */
Actions.prototype.get = function(name)
{
	return this.actions[name];
};

/**
 * Constructs a new action for the given parameters.
 */
function Action(label, funct, enabled, iconCls, shortcut)
{
	mxEventSource.call(this);
	this.label = label;
	this.funct = funct;
	this.enabled = (enabled != null) ? enabled : true;
	this.iconCls = iconCls;
	this.shortcut = shortcut;
	this.visible = true;
};

// Action inherits from mxEventSource
mxUtils.extend(Action, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setEnabled = function(value)
{
	if (this.enabled != value)
	{
		this.enabled = value;
		this.fireEvent(new mxEventObject('stateChanged'));
	}
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isEnabled = function()
{
	return this.enabled;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setToggleAction = function(value)
{
	this.toggleAction = value;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setSelectedCallback = function(funct)
{
	this.selectedCallback = funct;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isSelected = function()
{
	return this.selectedCallback();
};
