/*
 *Copyright (c) 20015-2022, Wecise Ltd
 *
 *      __  __   ____
 *     |  \/  | |__ /
 *     | \  / |  |_ \
 *     | |\/| | |___/
 *     | |  | |
 *     |_|  |_|
 *
 *
 */
class System {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["vue-editor-component",
							"vue-base-datatables-component",
							"vue-common-form-component",
							"ai-robot-component"
							],function() {

			$(function() {
			
				Vue.component('bootstrap-table', {
					template: `<table :id="id" class="table table-striped" data-locale="zh-CN"></table>`,
					props:{
						columns: Array,
						data: Array,
						options: Object,
						id: String,
					},
					mounted: function () {
						const self = this;

						self.$nextTick(function () {
							
							$(self.$el).on('check.bs.table', function (e, row) {
								eventHub.$emit('user-table-select', row);
							})

							window.actionEvents = {
								'click .like': function (e, value, row, index) {
									alert('You click like icon, row: ' + JSON.stringify(row));
									console.log(value, row, index);
								},
								'click .edit': function (e, value, row, index) {
									alert('You click edit icon, row: ' + JSON.stringify(row));
									console.log(value, row, index);
								},
								'click .remove': function (e, value, row, index) {
									alert('You click remove icon, row: ' + JSON.stringify(row));
									console.log(value, row, index);
								}
							};
						})
					},
					watch: {
						data: function (val) {
							const self = this;

							$(self.$el).bootstrapTable('load', val);
						},
						columns: function(val) {
							const self = this;

							$(self.$el).bootstrapTable({                    
								columns: val,
								data: self.data
							});
						},

						options: function(val) {
							const self = this;

							$(self.$el).bootstrapTable('refreshOptions', val);
						}
					},
					methods: {
						
					}
				});

				Vue.component('tree-component',{
					delimiters: ['${', '}'],
					template: '<ul class="ztree" :id="zId" style="overflow:auto;"></ul>',
					props: {
						zNodes: Object,
						zId: String,

					},
					data: function(){
						return {
							zTree: Object,
							setting: {
								check: {
									enable: true
								},
								edit: {
									enable: true
								},
								callback: {

								},
								data: {
									simpleData: {
										enable: true
									}
								}
							},
						}
					},
					mounted: function() {
						this.$nextTick(function(){
							const self = this;
							self.setting.callback.onClick = self.zTreeOnClick;
							self.setting.callback.onExpand = self.zTreeOnExpand;
						})
					},
					watch: {
						setting: function(val){
							this.zTree = $.fn.zTree.init($(this.$el), val, this.zNodes);
						},
						zNodes: function(val){

							$.fn.zTree.init($(this.$el), this.setting, val);
							this.zTree = $.fn.zTree.getZTreeObj(this.zId);
							var nodes = this.zTree.getNodes();
							if (nodes.length > 0) {
								this.zTree.expandNode(nodes[0], true, false, true);
							}
						}
					},
					methods: {
						zTreeOnExpand: function (event, treeId, treeNode) {
							if (treeNode.dir) {
								treeNode.isParent = true;
							} else {
								treeNode.isParent = false;
							}
						},
						zTreeOnClick: function (event, treeId, treeNode, clickFlisParentag) {
							const self = this;
						}
					}
				})

				Vue.component('byobject-tree-component',{
					delimiters: ['${', '}'],
					template: '<ul class="ztree" id="byObjectTree" style="overflow:auto;"></ul>',
					props: {
						zNodes: Array,
					},
					data: function(){
						return {
							zTree: Object,
							setting: {
								edit: {
									enable: false
								},
								callback: {

								},
								check: {
									enable: true,
									chkStyle: "checkbox",
									chkboxType: { "Y": "s", "N": "s" }
								},
								data: {
									simpleData: {
										enable: true,
										idKey: "cid",
										pIdKey: "pid",
									}
								}
							},
						}
					},
					mounted: function() {
						const self = this;

						self.$nextTick(function(){
							self.setting.callback.onClick = self.zTreeOnClick;
							self.setting.callback.onCheck = self.zTreeOnCheck;
						})
					},
					watch: {
						setting: function(val){
							const self = this;

							self.zTree = $.fn.zTree.init($(this.$el), val, self.zNodes);
						},
						zNodes: function(val){
							const self = this;

							$.fn.zTree.init($(self.$el), self.setting, val);
							$.fn.zTree.getZTreeObj("byObjectTree").expandAll(true);
							$("#byObjectTable").bootstrapTable('removeAll');
							$("#byPropertyTable").bootstrapTable('removeAll');
						}
					},
					methods: {
						zTreeOnExpand: function (event, treeId, treeNode) {
							if (treeNode.dir) {
								treeNode.isParent = true;
							} else {
								treeNode.isParent = false;
							}
						},
						zTreeOnClick: function (event, treeId, treeNode, clickFlisParentag) {
							const self = this;

						},
						zTreeOnCheck: function (event, treeId, treeNode) {
							const self = this;

							var zTree = $.fn.zTree.getZTreeObj("byObjectTree");
							var nodes = zTree.getCheckedNodes(true);
							if (nodes.length > 0) {
								eventHub.$emit('byObjectTree-select', _.map(nodes,function(v){
									return _.pick(v,['cid', 'pid', 'name','auth']);
								}));
							} else {
								eventHub.$emit('byObjectTree-select', []);
							}
						}

					}
				})

				Vue.component('byProperty-tree-component',{
					delimiters: ['${', '}'],
					template: '<ul class="ztree" id="byPropertyTree" style="overflow:auto;"></ul>',
					props: {
						zNodes: Array,
					},
					data: function(){
						return {
							zTree: Object,
							setting: {
								edit: {
									enable: false
								},
								callback: {
								},
								data: {
									simpleData: {
										enable: true,
										idKey: "cid",
										pIdKey: "pid",
									}
								}
							},
						}
					},
					mounted: function() {
						const self = this;

						self.$nextTick(function(){
							self.setting.callback.onClick = self.zTreeOnClick;
						})
					},
					watch: {
						setting: function(val){
							const self = this;

							self.zTree = $.fn.zTree.init($(self.$el), val, self.zNodes);
						},
						zNodes: function(val){
							const self = this;

							$.fn.zTree.init($(self.$el), self.setting, val);
						}
					},
					methods: {
						zTreeOnExpand: function (event, treeId, treeNode) {
							if (treeNode.dir) {
								treeNode.isParent = true;
							} else {
								treeNode.isParent = false;
							}
						},
						zTreeOnClick: function (event, treeId, treeNode, clickFlisParentag) {
							const self = this;

							var zTree = $.fn.zTree.getZTreeObj("byPropertyTree");
							var nodes = zTree.getSelectedNodes();
							if (nodes.length > 0) {
								eventHub.$emit('byPropertyTree-select', nodes);
							} else {
								eventHub.$emit('byPropertyTree-select', []);
							}
						}
					}
				})

				Vue.component('user-tree-component',{
					delimiters: ['${', '}'],
					template: '<ul class="ztree" id="userTree" style="overflow:auto;"></ul>',
					props: {
						zNodes: null,
					},
					data: function(){
						return {
							zTree: Object,
							setting: {
								edit: {
									enable: false
								},
								callback: {

								},
								data: {
									simpleData: {
										enable: true,
										idKey: "fullname",
										pIdKey: "parent",
									},
									key: {
										name: "username",
									}
								},
								view: {

								}
							},
						}
					},
					created: function() {
						const self = this;

						eventHub.$on("user-remove-node", self.removeNode);
					},
					mounted: function() {
						const self = this;

						self.$nextTick(function(){
							
							self.setting.callback.onClick = self.zTreeOnClick;
							self.setting.view.addDiyDom = self.addDiyDom;
						})
					},
					watch: {
						setting: function(val){
							const self = this;

							$.fn.zTree.init($(self.$el), val, self.zNodes);
						},
						zNodes: function(val){
							const self = this;

							$.fn.zTree.init($(self.$el), self.setting, val);
						}
					},
					methods: {
						zTreeOnClick: function (event, treeId, treeNode, clickFlisParentag) {
							const self = this;

							if (treeNode.isParent) {
								eventHub.$emit("user-tree-click-event",{parent:true,node:treeNode});
							} else {
								eventHub.$emit("user-tree-click-event",{parent:false,node:treeNode});
							}
						},
						removeNode: function(event) {
							const self = this;
							var zTree = $.fn.zTree.getZTreeObj("userTree");
							var nodes = zTree.getSelectedNodes();
							
							for (var i=0, l=nodes.length; i < l; i++) {
								if(nodes[i].isParent){
									for(var j=0;j<nodes[i].children.length;j++){
										if(nodes[i].children[j].fullname === event){
											zTree.removeNode(nodes[i].children[j]);
										}        
									}
								} else {
									if(nodes[i].fullname === event){
										zTree.removeNode(nodes[i]);
									}  
								}
							}
						},
						addDiyDom: function (treeId, treeNode) {
							const self = this;
							let aObj = $("#" + treeNode.tId + "_a");

							if (treeNode.isParent){
								let str = "<span> ["+treeNode.children.length+"]</span>";
								aObj.append(str);
							} 
						}
					}
				})

				Vue.component('config-tree-component',{
					delimiters: ['${', '}'],
					template: '<ul class="ztree" id="configTree" style="overflow:auto;"></ul>',
					props: {
						zNodes: Object,

					},
					data: function(){
						return {
							zTree: Object,
							setting: {
								edit: {
									enable: false
								},
								callback: {

								},
								data: {
									simpleData: {
										enable: true
									},
									key: {
										name: "key",
										children: "nodes"
									}
								},
								view: {
									showTitle: true,
								}
							},
							selectedNodeName: ""
						}
					},
					created: function(){
						const self = this;

						eventHub.$on("config-refresh-event",self.refresh);
					},
					mounted: function() {
						const self = this;

						self.$nextTick(function(){
							self.setting.callback.onClick = self.zTreeOnClick;
							self.setting.callback.onExpand = self.zTreeOnExpand;
							self.setting.view.addDiyDom = self.addDiyDom;
						})
					},
					watch: {
						setting: function(val){
							const self = this;

							self.zTree = $.fn.zTree.init($(self.$el), val, self.zNodes);
						},
						zNodes: function(val){
							const self = this;

							$.fn.zTree.init($(self.$el), self.setting, val);
							self.zTree = $.fn.zTree.getZTreeObj("configTree");
							var nodes = self.zTree.getNodes();
							if (nodes.length > 0) {
								self.zTree.expandNode(nodes[0], true, false, true);
							}
						}
					},
					methods: {
						zTreeOnExpand: function (event, treeId, treeNode) {
							if (treeNode.dir) {
								treeNode.isParent = true;
							} else {
								treeNode.isParent = false;
							}
						},
						zTreeOnClick: function (event, treeId, treeNode, clickFlisParentag) {
							const self = this;
							var node = self.zTree.getSelectedNodes();
							
							$("[title='" + self.selectedNodeName + "']").removeClass('curSelectedNode');
							self.selectedNodeName = treeNode.key;
							
							jQuery.ajax({
								url: '/config/get',
								type: 'GET',
								dataType: 'json',
								data: {
									key: treeNode.key
								},
								beforeSend: function(xhr) {
								},
								complete: function(xhr, textStatus) {
								},
								success: function(data, textStatus, xhr) {
									
									if(!_.isEmpty(data.message)){
										self.zTree.removeChildNodes(node[0]);
										let _tmp = JSON.stringify(data.message).replace(new RegExp('"dir":true', 'gm'), '"isParent":true,"dir":true');
										let rtn = _.attempt(JSON.parse.bind(null, _tmp));
										self.zTree.addNodes(treeNode, eval(rtn.nodes));

									}
									/**
									 * @todo  赋键值
									 */
									eventHub.$emit('editor-value', treeNode);


								},
								error: function(xhr, textStatus, errorThrown) {
								}
							});
						},
						refresh: function () {
							const self = this;

							var treeObj = $.fn.zTree.getZTreeObj("configTree");
							var sNodes = treeObj.getSelectedNodes();

							if (sNodes.length > 0) {
								var pNode = sNodes[0].getParentNode() || sNodes[0];
								
								jQuery.ajax({
									url: '/config/get',
									type: 'GET',
									dataType: 'json',
									data: {
										key: pNode.key
									},
									beforeSend: function(xhr) {
									},
									complete: function(xhr, textStatus) {
									},
									success: function(data, textStatus, xhr) {
										/**
										 * @todo  刷新当前节点结构
										 */
										self.zTree.removeChildNodes(pNode);
										var rtn = JSON.parse(JSON.stringify(data).replace(new RegExp('"dir":true', 'gm'), '"isParent":true,"dir":true'));
										self.zTree.addNodes(pNode, eval(rtn.message.nodes));
										/**
										 * @todo  选中当前节点
										 */
										$("[title='" + self.selectedNodeName + "']").addClass('curSelectedNode');
									},
									error: function(xhr, textStatus, errorThrown) {
									}
								})
							} 
						},
						addDiyDom: function (treeId, treeNode) {
							const self = this;
							let aObj = $("#" + treeNode.tId + "_a");
							
							if (treeNode.isParent){
								let str = "<span>["+treeNode.nodes.length+"]</span>";
								aObj.append(str);
							} 
						}
					}
				})

				Vue.component('rules-tree-component',{
					delimiters: ['${', '}'],
					template: '<ul class="ztree" id="rulesTree" style="overflow:auto;"></ul>',
					props: {
						zNodes: Object,

					},
					data: function(){
						return {
							zTree: Object,
							setting: {
								edit: {
									enable: false
								},
								callback: {

								},
								data: {
									simpleData: {
										enable: true
									},
									key: {
										name: "key",
										children: "nodes"
									}
								}
							},
						}
					},
					mounted: function() {
						const self = this;

						self.$nextTick(function(){
							self.setting.callback.onClick = self.zTreeOnClick;
							self.setting.callback.onExpand = self.zTreeOnExpand;
						})
					},
					watch: {
						setting: function(val){
							this.zTree = $.fn.zTree.init($(this.$el), val, this.zNodes);
						},
						zNodes: function(val){

							$.fn.zTree.init($(this.$el), this.setting, val);
							this.zTree = $.fn.zTree.getZTreeObj("rulesTree");
							var nodes = this.zTree.getNodes();
							if (nodes.length > 0) {
								this.zTree.expandNode(nodes[0], true, false, true);
							}
						}
					},
					methods: {
						zTreeOnExpand: function (event, treeId, treeNode) {
							if (treeNode.dir) {
								treeNode.isParent = true;
							} else {
								treeNode.isParent = false;
							}
						},
						zTreeOnClick: function (event, treeId, treeNode, clickFlisParentag) {
							self = this;
							var node = self.zTree.getSelectedNodes();

							jQuery.ajax({
								url: '/config/get',
								type: 'GET',
								dataType: 'json',
								data: {
									key: treeNode.key
								},
								beforeSend: function(xhr) {
								},
								complete: function(xhr, textStatus) {
								},
								success: function(data, textStatus, xhr) {
									/**
									 * @todo  刷新当前节点结构
									 */
									self.zTree.removeChildNodes(node[0]);
									var rtn = JSON.parse(JSON.stringify(data).replace(new RegExp('"dir":true', 'gm'), '"isParent":true,"dir":true'));
									self.zTree.addNodes(treeNode, eval(rtn.message.node.nodes));

									/**
									 * @todo  赋键值
									 */
									eventHub.$emit('editor-value', treeNode);


								},
								error: function(xhr, textStatus, errorThrown) {
								}
							});
						}
					}
				})

				Vue.component('notify-tree-component',{
					delimiters: ['${', '}'],
					template: '<ul class="ztree" id="notifyTree" style="overflow:auto;"></ul>',
					props: {
						zNodes: Object,

					},
					data: function(){
						return {
							zTree: Object,
							setting: {
								edit: {
									enable: false
								},
								callback: {

								},
								data: {
									simpleData: {
										enable: true
									}
								}
							},
						}
					},
					mounted: function() {
						this.$nextTick(function(){
							const self = this;
							self.setting.callback.onClick = self.zTreeOnClick;
							self.setting.callback.onExpand = self.zTreeOnExpand;
						})
					},
					watch: {
						setting: function(val){
							this.zTree = $.fn.zTree.init($(this.$el), val, this.zNodes);
						},
						zNodes: function(val){

							$.fn.zTree.init($(this.$el), this.setting, val);
							this.zTree = $.fn.zTree.getZTreeObj("notifyTree");
							var nodes = this.zTree.getNodes();
							if (nodes.length > 0) {
								this.zTree.expandNode(nodes[0], true, false, true);
							}
						}
					},
					methods: {
						zTreeOnExpand: function (event, treeId, treeNode) {
							if (treeNode.dir) {
								treeNode.isParent = true;
							} else {
								treeNode.isParent = false;
							}
						},
						zTreeOnClick: function (event, treeId, treeNode, clickFlisParentag) {
							self = this;
						}
					}
				})

				Vue.component('maintain-tree-component',{
					delimiters: ['${', '}'],
					template: '<ul class="ztree" id="maintainTree" style="overflow:auto;"></ul>',
					props: {
						zNodes: Object,

					},
					data: function(){
						return {
							zTree: Object,
							setting: {
								edit: {
									enable: false
								},
								callback: {

								},
								data: {
									simpleData: {
										enable: true
									}
								}
							},
						}
					},
					mounted: function() {
						this.$nextTick(function(){
							const self = this;
							self.setting.callback.onClick = self.zTreeOnClick;
							self.setting.callback.onExpand = self.zTreeOnExpand;
						})
					},
					watch: {
						setting: function(val){
							this.zTree = $.fn.zTree.init($(this.$el), val, this.zNodes);
						},
						zNodes: function(val){

							$.fn.zTree.init($(this.$el), this.setting, val);
							this.zTree = $.fn.zTree.getZTreeObj("maintainTree");
							var nodes = this.zTree.getNodes();
							if (nodes.length > 0) {
								this.zTree.expandNode(nodes[0], true, false, true);
							}
						}
					},
					methods: {
						zTreeOnExpand: function (event, treeId, treeNode) {
							if (treeNode.dir) {
								treeNode.isParent = true;
							} else {
								treeNode.isParent = false;
							}
						},
						zTreeOnClick: function (event, treeId, treeNode, clickFlisParentag) {
							self = this;
						}
					}
				})

				// 公司管理
				Vue.component("company-manage",{
					delimiters: ['${', '}'],
					props: {
						id: String
					},
					template: 	`<el-container>
									
									<el-header style="text-align: right; font-size: 12px;height:30px;line-height:30px;">
										<span style="float:right;">
											<el-tooltip content="刷新列表">
												<a href="javascript:void(0);" class="btn btn-xs btn-link" type="button" @click="initData"><i class="fas fa-sync-alt fa-fw"></i> 刷新</a>
											</el-tooltip>
											<el-tooltip content="新增公司">
												<a href="javascript:void(0);" class="btn btn-xs btn-link" type="button" @click="companyNew" ><i class="fas fa-plus fa-fw"></i> 新增</a>
											</el-tooltip>
											<el-tooltip content="删除公司">
												<a href="javascript:void(0);" class="btn btn-xs btn-link" type="button" @click="companyDelete" ><i class="fas fa-plus fa-fw"></i> 删除</a>
											</el-tooltip>
											<el-tooltip content="更新文件系统">
												<a href="javascript:void(0);" class="btn btn-xs btn-link" type="button" @click="updateFs"><i class="fas fa-cloud-upload-alt fa-fw"></i> 更新</a>
											</el-tooltip>
										</span>
									</el-header>
									
									<el-main style="padding:10px;">
										<table :id="id+'-table'" class="hover row-border" width="100%"></table>
									</el-main>
									
								</el-container>`,
					data(){
						return{
							id: "",
							datatable: null,
							tableData: {},
							tableSelectedRows: {}
						}
					},
					watch: {
						'tableData.rows': {

							handler: function(val,oldVal){
			
								// 数据无更新
								if(val === oldVal) {
									return false;
								}
			
								// 数据为空 
								// Table置空
								if( _.isEmpty(val)) {
									this.datatable.rows().remove().draw();
									return false;
								}
			
								// 表格已经初始化
								if(this.datatable instanceof $.fn.dataTable.Api) {
									this.datatable.clear();
									this.datatable.rows.add(val);
									this.datatable.draw();		
								} else {
									
								}
							},
							deep:true,
							immediate: true
						}
					},
					created(){
						this.id = `company-manage-${_.now()}`;
						this.initData();
					},
					mounted(){
						this.initTable();
					},
					methods:{
						initData(){
							try {
								// rows
								_.extend(this.tableData, {rows:companyHandler.companyList().message});

								// columns & options
								let ext = fsHandler.callFsJScript("/company/company-list.js",null).message;
								_.extend(this.tableData,ext);

								_.map(this.tableData.columns,function(v){
									if(!v.render){
										return v;
									} else {
										return _.extend(v,{render: eval(v.render) });;
									}
								})

							} catch(err){
								
							}
						},
						initTable(){
							const self = this;
							
							self.datatable = $(`#${self.id}-table`).DataTable(_.extend(
								self.tableData.options,{
								data: self.tableData.rows,
								columns: self.tableData.columns,
			                    initComplete:function(){
									
									$(".dataTables_filter input").css({
										"height":"28px"
									})
								}
							}));

							self.datatable.on( 'select', function ( e, dt, type, indexes ) {
								self.tableSelectedRows = self.datatable.rows( '.selected' ).data().toArray();
							} ).on( 'deselect', function ( e, dt, type, indexes ) {
								self.tableSelectedRows = self.datatable.rows( '.selected' ).data().toArray();
							} );
						},
						companyNew(){
							const self = this;
							let rId = `system-company-container-${_.now()}`;
							let wnd = null;

							try{
								if(jsPanel.activePanels.getPanel('jsPanel-company')){
									jsPanel.activePanels.getPanel('jsPanel-company').close();
								}
							}catch(error){
			
							}
							finally{
								wnd = maxWindow.winCompany("新增公司",`<div id="${rId}"></div>`,null,null); 
							}
							let main = {
								data: {
									form: {
										fullname: '',
										name: '',
										ospace: '',
										title: '',
										web: '',
										logo: '',
										icon: '',
										config: {},
									},
									upload: {
										preLogoImageUrl: '',
										preIconImageUrl: ''
									}
								},
								template: 	`<el-container>
												<el-main>
													<el-form ref="form" :model="form" label-width="80px">
														<el-form-item label="公司全称">
															<el-input v-model="form.fullname"></el-input>
														</el-form-item>
														<el-form-item label="名称">
															<el-input v-model="form.name"></el-input>
														</el-form-item>
														<el-form-item label="应用">
															<el-input v-model="form.ospace"></el-input>
														</el-form-item>
														<el-form-item label="网站">
															<el-input v-model="form.web"></el-input>
														</el-form-item>
														<el-form-item label="标题">
															<el-input v-model="form.title"></el-input>
														</el-form-item>
														<el-form-item label="配置">
															<el-input v-model="form.config"></el-input>
														</el-form-item>
														<el-form-item label="Logo">
															<img :src="upload.preLogoImageUrl" style="width: 120px;height: auto;border: 2px dashed rgb(221, 221, 221);">
															<input type="file" @change="encodeLogoFileAsURL" >
														</el-form-item>
														<el-form-item label="Icon">
															<img :src="upload.preIconImageUrl" style="width: 120px;height: auto;border: 2px dashed rgb(221, 221, 221);">
															<input type="file" @change="encodeIconFileAsURL" >
														</el-form-item>
														<el-form-item>
															<el-tooltip content="创建">
																<a href="javascript:void(0);" class="btn btn-xs btn-success" @click="companySave"><i class="fas fa-save fa-fw"></i> 创建</a>
															</el-tooltip>
															<el-tooltip content="取消">
																<a href="javascript:void(0);" class="btn btn-xs btn-default" @click="closeMe" ><i class="fas fa-plus fa-fw"></i> 取消</a>
															</el-tooltip>
														</el-form-item>
													</el-form>
												</el-main>
											</el-container>`,
								methods: {
									encodeLogoFileAsURL(event) {
										const me = this;
										var file = event.target.files[0];
										var reader = new FileReader();

										reader.onloadend = function(){
											me.upload.preLogoImageUrl = reader.result;
											_.extend(me.form, {logo: reader.result});
										}
										reader.readAsDataURL(file);
									},
									encodeIconFileAsURL(event) {
										const me = this;
										var file = event.target.files[0];
										var reader = new FileReader();

										reader.onloadend = function(){
											me.upload.preIconImageUrl = reader.result;
											_.extend(me.form, {icon: reader.result});
										}
										reader.readAsDataURL(file);
									},
									companySave() {
										let rtn = companyHandler.companyNew(this.form);
										if(rtn == 1){
											self.initData();
											wnd.close();
										}
									},
									closeMe(){
										wnd.close();
									}
								}
							};

							new Vue(main).$mount(`#${rId}`);
						},
						companyDelete() {
							const self = this;

							if(self.tableSelectedRows[0].ospace === 'matrix' || self.tableSelectedRows[0].name === 'wecise' ){
								alertify.error("系统账户，不可以删除！")
								return false;
							} 

							alertify.confirm(`确定要删除该公司? <br><br> 
												${self.tableSelectedRows[0].fullname}<br><br>
												${self.tableSelectedRows[0].name}<br><br>
												${self.tableSelectedRows[0].ospace}<br><br>
												${self.tableSelectedRows[0].title}<br><br>`, function (e) {
								if (e) {
									let rtn = companyHandler.companyDelete(self.tableSelectedRows[0].fullname);
									if(rtn == 1){
										self.initData();
									}
								} else {
									
								}
							});
							
						},
						updateFs(){

						}
					}
					
				})

				// 用户、权限管理
				Vue.component('user-manage',{
					delimiters: ['${', '}'],
					template: '#user-manage-template',
					data(){
						return {
							permission: {
								tabs: [],
								activeIndex:'byObject'
							},
							model:{
								data: [],
								columns: [],
								options: {},
							},
							byObjectTreeModel: {
								data: [],
								columns: [],
								options: {},  
							},
							byPropertyTreeModel: {
								data: [],
								columns: [],
								options: {},  
							},
							byObjectTreeNodes: [],
							byPropertyTreeNodes: [],
							selectedNode: null
						}
					},
					created: function(){
						const self = this;

						eventHub.$on("new-user-event",self.newUser);
						eventHub.$on("new-group-event",self.newGroup);
						eventHub.$on('user-table-select',self.loadByClassTreeNodes);
						eventHub.$on("user-tree-click-event", self.loadUserData);
						eventHub.$on("user-remove", self.removeUserData);
						eventHub.$on("byObjectTree-select", self.setByObjectTreeModel)
						eventHub.$on("byPropertyTree-select", self.setByPropertyTreeModel)
					},
					mounted: function(){
						const self = this;

						self.$nextTick(function () {

							self.model.columns = [
													{
														field: 'state',
														radio: true,
														align: 'center',
														valign: 'middle'
													},
													{"field":"email",title:"邮件", sortable: true, formatter: function(v){
														return v?v.join("\n"):"";
													}},
													{"field":"username",title:"用户名", sortable: true},
													{"field":"passwd",title:"口令", sortable: true, visible:false},
													{"field":"parent",title:"组", sortable: true},
													{"field":"isactive",title:"状态","align":"center", sortable: true, formatter:function(v){
														return v?`<i class='far fa-check-square' style='color:#1ab394;font-size:14px;'></i>`:`<i class='far fa-square' style="font-size:14px;"></i>`;
													}},
													{"field":"fullname", title:"操作", align: 'center', formatter: function(v,r){
														return `<a href="javascript:eventHub.$emit('user-remove', {id: '${r.id}',fullname: '${r.fullname}'});"><i class="fas fa-trash"></i></a>`;
													}},
												];
							self.model.options = {
								toggle: "table",
								classes: "table table-striped",
								pagination: true,
								pageSize: "15",
								pageList: "[15,30,45,60]",
								clickToSelect: true,
								treeShowField: 'name'
							};

							self.byObjectTreeModel.columns = self.byPropertyTreeModel.columns = [
															{"field":"name",title:"动作"},
															{"field":"add",title:"添加", align: 'center',
																formatter:function(v){
																	return `<input type="checkbox" value="" checked="checked">`;
																}
															},
															{"field":"remove",title:"删除", align: 'center',
																formatter:function(v){
																	return `<input type="checkbox" value="" checked="checked">`;
																}
															},
															{"field":"update",title:"修改", align: 'center',
																formatter:function(v){
																	return `<input type="checkbox" value="" checked="checked">`;
																}
															},
															{"field":"search",title:"搜索", align: 'center',
																formatter:function(v){
																	return `<input type="checkbox" value="" checked="checked">`;
																}
															},
														];
							self.byObjectTreeModel.options =  self.byPropertyTreeModel.options = {
															toggle: "table",
															classes: "table table-striped",
															pagination: true,
															pageSize: "15",
															pageList: "[15,30,45,60]",
														};
						})
					},
					methods: {
						newUser: function(){
							const self = this;

							let wnd = null;

							try{
								if(jsPanel.activePanels.getPanel('jsPanel-user')){
									jsPanel.activePanels.getPanel('jsPanel-user').close();
								}
							}catch(error){
			
							}
							finally{
								wnd = maxWindow.winUser("新建用户",`<div id="ldap-newUser-container"></div>`,null,null); 
							}

							let config = {
								delimiters: ['#{', '}#'],
								template: `<el-container>
												<el-main>
													<el-form ref="form" label-width="80px" size="mini">

														<el-form-item label="组名称">
															<el-input v-model="ldap.parent" autofocus disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="用户名">
															<el-input v-model="ldap.username" autofocus autocomplete="off"></el-input>
														</el-form-item>

														<el-form-item prop="email"
																	label="邮箱"
																	:rules="[
																	{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
																	]">
															<el-input v-model="email"></el-input>
														</el-form-item>

														<el-form-item label="密码" prop="pass">
															<el-input type="password" v-model="ldap.passwd" autocomplete="off"></el-input>
														</el-form-item>
														
														<el-form-item label="确认密码">
															<el-input type="password" v-model="checkPass" autocomplete="off"></el-input>
														</el-form-item>


														<el-form-item label="激活" prop="delivery">
															<el-switch v-model="ldap.isactive" true-value="true" false-value="false"></el-switch>
														</el-form-item>
														
														<el-form-item label="管理员" prop="delivery">
															<el-switch v-model="ldap.isadmin" true-value="true" false-value="false"></el-switch>
														</el-form-item>

														<el-form-item>
															<a href="javascript:void" class="btn btn-success" @click="save">创建用户</a>
														</el-form-item>
														
													</form>
												</el-main>
											</el-container>`,
								data: {
									ldap: {
										parent: "", 
										username: "",
										passwd: "",
										isactive: true,
										isadmin: false,
										otype: 'usr'                     
									},
									email: "",
									checkPass: ""
								},
								created(){
									this.ldap.parent = !_.isEmpty(self.selectedNode.fullname)?self.selectedNode.fullname:'/用户组';
								},
								mounted:function(){
									let me = this;

									me.$nextTick(function() {
										me.init();
									})
								},
								methods: {
									init: function(){
										let me = this;

									},
									save: function(){
										let me = this;

										if (_.isEmpty(me.ldap.username)) {
											alertify.error("名称不能为空！");
											return false;
										}

										if (_.isEmpty(me.email)) {
											alertify.error("邮件不能为空！");
											return false;
										}

										if (_.isEmpty(me.ldap.passwd)) {
											alertify.error("密码不能为空！");
											return false;
										}

										if (_.isEmpty(me.checkPass)) {
											alertify.error("确认密码不能为空！");
											return false;
										}

										if ( me.ldap.passwd !== me.checkPass) {
											alertify.error("确认密码不一致！");
											return false;
										}

										let _csrf = window.CsrfToken.replace(/'/g,"");
										let rtn = userHandler.userAdd(me.ldap, _csrf);

										if(rtn===1){
											alertify.success(`用户: ${me.ldap.username} ${me.email} 添加成功！`);
											
											_.delay(function(){
												eventHub.$emit('user-tree-refresh-event', null);
												wnd.close();
											},500);

										}

									}
								}
							};
							
							new Vue(config).$mount("#ldap-newUser-container");
						},
						newGroup: function(){
							const self = this;

							let wnd = null;

							try{
								if(jsPanel.activePanels.getPanel('jsPanel-user')){
									jsPanel.activePanels.getPanel('jsPanel-user').close();
								}
							}catch(error){
			
							}
							finally{
								wnd = maxWindow.winUser("新建组",`<div id="ldap-newGroup-container"></div>`,null,null); 
							}

							let config  = {
								delimiters: ['#{', '}#'],
								template: `<el-container>
												<el-main>
													<el-form ref="form" label-width="80px" size="mini">

														<el-form-item label="组名称">
															<el-input v-model="ldap.parent" disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="名称">
															<el-input v-model="ldap.username" autofocus></el-input>
														</el-form-item>

														<el-form-item>
															<a href="javascript:void" class="btn btn-success" @click="save">创建组</a>
														</el-form-item>
														
													</form>
												</el-main>
											</el-container>`,
								data: {
									ldap: {
										parent: "", 
										username: "",
										passwd: "",
										isactive: true,
										isadmin: false,
										otype: 'org'                     
									}
								},
								created(){
									this.ldap.parent = !_.isEmpty(self.selectedNode.fullname)?self.selectedNode.fullname:'/用户组';
								},
								mounted:function(){
									let me = this;

									me.$nextTick(function() {
										me.init();
									})
								},
								methods: {
									init: function(){
										let me = this;

									},
									save: function(){
										let me = this;

										if (_.isEmpty(me.ldap.parent)) {
											alertify.error("所属组名称不能为空！");
											return false;
										}

										if (_.isEmpty(me.ldap.username)) {
											alertify.error("组名称不能为空！");
											return false;
										}

										let _csrf = window.CsrfToken.replace(/'/g,"");
										let rtn = userHandler.userAdd(me.ldap, _csrf);

										if(rtn===1){
											alertify.success(`组: ${me.ldap.parent} 添加成功！`);
											
											_.delay(function(){
												eventHub.$emit('user-tree-refresh-event', null);
												wnd.close();
											},500);

										}

									}
								}
							};

							new Vue(config).$mount("#ldap-newGroup-container");
						},
						loadUserData: function(event) {
							const self = this;
							let param = "";

							self.selectedNode = event.node;

							let rtn = userHandler.userList(event.node.fullname).message;
							
							self.model.data = rtn;
							self.byObjectTreeNodes = [];
							self.byPropertyTreeNodes = [];
						},
						saveUserData: function(){
							const self = this;
							var action = ["add","delete","update","view"];
							var auth = {
										Fields:{
											add: [],
											delete: [],
											update: [],
											view: []
										},
										Conds:{
											add: [],
											delete: [],
											update: [],
											view: []
										},
										Rels:{
											add: [],
											delete: [],
											update: [],
											view: []
										}
									};
							auth.Fields.view = [];
							//auth.Conds.view = [{"type":"match","field":"class","value":"/matrix/devops/"}];

							var userData = $("#userTable").bootstrapTable('getSelections');
							var userByObjectData = $("#byObjectTable").bootstrapTable('getData');
							
							if(_.isEmpty(userData)) {
								alertify.log(`请选择用户！`);
								return false;
							}

							_.forEach(action,function(v,k){
								var tmp = { "type": "contains", "field": "class", "values": []};
								tmp.values = _.map(userByObjectData,function(d){
									return d.name;
								});
								auth.Conds[v].push(tmp);
							})
							
							var sql = [];
							sql[0] = "insert";
							sql[1] = "into";
							sql[2] = "/matrix/ldap";
							sql[3] = "fullname='" + userData[0].fullname + "'";
							sql[4] = "auth='" + JSON.stringify(auth) + "'";
							
							console.log("sql------>",sql.join(" "));
							
							jQuery.ajax({
								url: "/mxobject/mql",
								dataType: 'json',
								type: 'POST',
								data: {
									mql:sql.join(" ")
								},
								beforeSend: function(xhr) {
								},
								complete: function(xhr, textStatus) {
								},
								success: function(data, textStatus, xhr) {
									
									if(data.status!="ok"){
										console.log(data.message);
									} else {
										
									}
								},
								error: function(xhr, textStatus, errorThrown) {
									console.log(errorThrown)
								}
							})
							var byObjectTableData = $("#byObjectTable").bootstrapTable('getData');
						},
						removeUserData: function(event) {
							const self = this;
							
							let user = event;

							alertify.confirm(`确定要删除该用户? <br><br> ${user.fullname}`, function (e) {
								if (e) {
									let rtn = userHandler.userDelete(user.id);
									if(rtn == 1){
										eventHub.$emit('user-remove-node',user.fullname);    
									}
								} else {
									
								}
							});
						},
						loadByClassTreeNodes: function(event){
							const self = this;
							
							self.getObjectTreeNode(event);
						},
						getObjectTreeNode: function(event) {
							const self = this;
							let auth = _.attempt(JSON.parse.bind(null, event.auth));
							let rtn = omdbHandler.classTree("/");
							
							self.byObjectTreeNodes = _.map(rtn, function(v){
																return _.pick(v,['cid', 'pid', 'name']);
															});

							if(!_.isEmpty(auth)) {
								_.forEach(auth.conds.add[0].values, function(v,k){
									self.byObjectTreeNodes = _.map(self.byObjectTreeNodes, function(d){
																if(d.name == v){
																	return _.assign(d, {checked: true, open:true});
																} else {
																	return d;
																}
															})
								});
							}
							
							self.setByObjectTreeModel(_.filter(self.byObjectTreeNodes,function(d){
													return d.checked;
												}));

							self.byPropertyTreeNodes =  _.map(rtn, function(v){
															return _.pick(v,['cid', 'pid', 'name', 'fields']);
														});

														
						},
						setByObjectTreeModel: function(event) {
							const self = this;

							self.byObjectTreeModel.data = event;
						},
						setByPropertyTreeModel: function(event) {
							const self = this;

							self.byPropertyTreeModel.data = _.map(event[0].fields,function(v){
																return {name:v};
															});
						}
					}
				})

				// 通知管理
				Vue.component('notify-manage',{
					delimiters: ['${', '}'],
					template: '#notify-manage-template',
					data: function(){
						return {
							model:{
								data: [],
								columns: [],
								options: {},
							},
							byTreeModel: {
								data: [],
								columns: [],
								options: {},  
							},
							byClassTreeNodes: {},
							bySeverityTreeNodes: {},
							byNotifyPeopleTreeNodes: {},
							byNotifyModeTreeNodes: {},
						}
					},
					mounted: function(){
						this.$nextTick(function () {
							this.model.columns = [
													{"field":"name",title:"规则"},
													{"field":"config",title:"定义"},
													{"field":"status",title:"状态"},
													{"field":"ctime",title:"创建时间"},
												];
							this.model.data = [];
							this.model.options = {
								toggle: "table",
								classes: "table table-striped",
								pagination: true,
								pageSize: "15",
								pageList: "[15,30,45,60]",
							};

							this.byClassTreeNodes = [
														{ id:1, pId:0, name:"事件", open:true},
														
														{ id:12, pId:1, name:"应用事件"},
														{ id:121, pId:12, name:"Cassandra"},
														{ id:122, pId:12, name:"Etcd"},
														{ id:123, pId:12, name:"Nats"},
														{ id:124, pId:12, name:"Web"},

														{ id:13, pId:1, name:"服务器事件"},
														{ id:131, pId:13, name:"mxsvr201"},
														{ id:132, pId:13, name:"mxsvr211"},
														{ id:133, pId:13, name:"mxsvr221"},
														{ id:134, pId:13, name:"mxsvr231"},
														{ id:134, pId:13, name:"mxsvr232"},
														{ id:136, pId:13, name:"tsoracle.bmc.com"},
														{ id:137, pId:13, name:"truesight"},

														{ id:2, pId:0, name:"网银系统事件", open:true},
														{ id:3, pId:0, name:"银行业务系统事件", open:true},
													];

							this.bySeverityTreeNodes = [
														{ id:1, pId:0, name:"重大告警", open:true},
														{ id:2, pId:0, name:"严重告警", open:true},
														{ id:3, pId:0, name:"次要告警", open:true},
														{ id:4, pId:0, name:"一般告警", open:true},
														{ id:5, pId:0, name:"正常告警", open:true},
														{ id:6, pId:0, name:"未知告警", open:true},
													];

							this.byNotifyPeopleTreeNodes = [
														{ id:1, pId:0, name:"北京值班组", open:true},
														
														{ id:12, pId:1, name:"运维值班"},
														{ id:13, pId:1, name:"网络值班"},
														{ id:14, pId:1, name:"系统值班"},
														{ id:15, pId:1, name:"应用值班"},
														{ id:16, pId:1, name:"主机值班"},

														{ id:2, pId:0, name:"上海值班组", open:true},

														{ id:21, pId:2, name:"运维值班"},
														{ id:22, pId:2, name:"网络值班"},
														{ id:23, pId:2, name:"系统值班"},
														{ id:24, pId:2, name:"应用值班"},
														{ id:25, pId:2, name:"主机值班"},
													];
							this.byNotifyModeTreeNodes = [
														{ id:1, pId:0, name:"邮件", open:true},
														{ id:2, pId:0, name:"短信", open:true},
													];


						})
					},
				})

				// 会话管理
				Vue.component('session-manage',{
					delimiters: ['${', '}'],
					template: '#session-manage-template',
					data: function(){
						return {
							model:{
								data: [],
								columns: [],
								options: {},
							}
						}
					},
					mounted: function(){
						this.$nextTick(function(){
							this.model.columns = [
													{"field":"key",title:"Key"},
													{"field":"data",title:"Data"}
												];
							
							this.model.options = {
								toggle: "table",
								classes: "table table-striped",
								search: true,
								pagination: true,
								pageSize: "15",
								pageList: "[15,30,45,60]",
							};
							this.init();
						})
					},
					methods: {
						init: function(){
							const self = this;
							var sql = `select json * from mxsystem.session`;
							jQuery.ajax({
								url: '/mxobject/action',
								type: 'POST',
								dataType: 'json',
								data: {
									sql
								},
								complete: function(xhr, textStatus) {

								},
								success: function(data, textStatus, xhr) {
									self.model.data = JSON.parse(data.message);
								},
								error: function(xhr, textStatus, errorThrown) {

								}
							});
						}
					}
				})

				// Grok变量管理
				Vue.component('grok-manage',{
					delimiters: ['${', '}'],
					template: '#grok-manage-template',
					data: function(){
						return {
							model:{
								data: [],
								columns: [],
								options: {
											info:true
										}
							}
						}
					},
					created: function(){
						const self = this;

						eventHub.$on("grok-list-refresh-event", self.init);
					},
					mounted: function(){
						const self = this;

						self.$nextTick(function(){
							self.model.columns = [
													{"field":"eg",title:"举例"},
													{"field":"name",title:"名称"},
													{"field":"pattern",title:"规则"}
												];
							
							self.init();
						})
					},
					methods: {
						init: function(){
							const self = this;
							
							let _list = grokHandler.grokList();
							
							self.model.data = _list.message;
						}
					}
				})

				// 应用管理
				Vue.component('tools-manage',{
					delimiters: ['${', '}'],
					template: '#tools-manage-template',
					data: function(){
						return {
							model: [],
							isDragging: false,
							delayedDragging:false,
							layout:{
								tabs: [],
								activeIndex: ''
							}
						}
					},
					mounted: function() {
						const self = this;

						self.$nextTick( function(){
							self.init(); 
						})
					},
					watch: {
						isDragging: function(newValue) {
							const self = this;

							if (newValue){
								self.delayedDragging = true;
								return;
							}
							self.$nextTick( function(){
								self.delayedDragging = false;
							})
						}
					},
					filters:{
						pickIcon:function(icon){
							return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
						}
					},
					methods: {
						init: function(){
							const self = this;

							jQuery.ajax({
								url: '/mxobject/search',
								type: 'POST',
								dataType: 'json',
								data: {
									cond: `#/matrix/portal/tools:| sort name asc, vtime desc`
								},
								beforeSend: function(xhr) {
								},
								complete: function(xhr, textStatus) {
								},
								success: function(data, textStatus, xhr) {
									self.model = _.orderBy(data.message,["seat"],["asc"]);
									
									/*
									_.delay(function(){
										var list = document.getElementById("ul-li");
										Sortable.create(list, {
											handle: '.drag-handle',
											animation: 150
										});    
									},500)
									*/
								},
								error: function(xhr, textStatus, errorThrown) {
								}
							});
						},
						add: function(event){
							const self = this;
							var obj = _.assign({
											class: '/matrix/portal/tools',
											name: "tools_"+_.now()},
										self.toJsonString(event));

							jQuery.ajax({
								url: '/mxobject/actiontoclass',
								type: 'POST',
								dataType: 'json',
								data: {
									data: JSON.stringify(obj),
									ctype: "insert"
								},
								beforeSend: function(xhr) {
								},
								complete: function(xhr, textStatus) {
								},
								success: function(data, textStatus, xhr) {
									self.resetForm();
									self.init();
									alertify.success("发布成功!");
								},
								error: function(xhr, textStatus, errorThrown) {
								}
							})
						},
						update: function(event){
							const self = this;
							var obj = _.assign({
											class: '/matrix/portal/tools',
											name: event},
										self.toJsonString(event));
							
							jQuery.ajax({
								url: '/mxobject/actiontoclass',
								type: 'POST',
								dataType: 'json',
								data: {
									data: JSON.stringify(obj),
									ctype: "insert"
								},
								beforeSend: function(xhr) {
								},
								complete: function(xhr, textStatus) {
								},
								success: function(data, textStatus, xhr) {
									self.resetForm();
									self.init();
									$("#collapse"+event).collapse("hide");
									alertify.success("更新成功!");
								},
								error: function(xhr, textStatus, errorThrown) {
								}
							})
						},
						remove: function(event) {
							const self = this;

							alertify.confirm(`确定要删除？<br><br> ${event}`, function (e) {
								if (e) {
									let _mql = `delete from /matrix/portal/tools where name='${event}'`;
									let _rtn = omdbHandler.fetchDataByMql(_mql);

									self.init();
								} else {
									
								}
							});

						},
						resetForm: function(){
							const self = this;

							var elements = $("form.tools").find( "input,select,textarea" );
							for( var i = 0; i < elements.length; ++i ) {
								var element = elements[i];
								var id = element.id;
								var value = element.value;

								if( id ) {
									$(id).val("");
								} 
							}
						},
						toJsonString: function(event) {
							var obj = {};                    
							var elements = $("form."+event).find( "input,select,textarea" );
							
							for( var i = 0; i < elements.length; ++i ) {
								var element = elements[i];
								var id = element.id;
								var value = element.value;

								if( id ) {
									if( id === "groups" ){
										obj[id] = { id:value } ;
									} else {
										obj[id] = value;
									}
								} 
							}
							return obj;
						}

					}
				})

				// 日历管理
				Vue.component('calendar-manage',{
					delimiters: ['${', '}'],
					template: '#calendar-manage-template',
					data: function () {
						return {
							event: []
						}
					},
					mounted: function(){
						const self = this;

						self.$nextTick(function(){
							self.initCalendar();
						})
					},
					methods: {
						init: function(){
							const self = this;
							let _menu = {
								"open": {
									name: "打开", icon: "fa-folder-o",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										let _item = $(this).data("item");
										self.open(_item);
									}
								},
								"download": {
									name: "下载", icon: "fa-cloud-download",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										let _item = $(this).data("item");
										self.download(_item);
									}
								},
								"-": "-",
								"new-folder": {
									name: "新建配置组", icon: "fa-copy",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										let _item = $(this).data("item");
										console.log($(this).data("item"))
										self.mkdir(_item);
									}
								},
								"new-ci": {
									name: "新建配置项", icon: "fa-paste",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										let _item = $(this).data("item");
										//self.mkfile(_item);
									}
								},
								"delete": {
									name: "删除", icon: "fa-trash",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										let _item = $(this).data("item");
										self.delete(_item);
									}
								},
								"--": "--",
								"history": {
									name: "配置历史", icon: "fa-clock-o",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										let _item = $(this).data("item");
										self.open(_item);
									}
								},
								"detail": {
									name: "配置卡片", icon: "fa-tasks",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										self.look('config', '');
									}
								},
								"compare": {
									name: "配置比对", icon: "fa-list-alt",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										self.look('config', '');
									}
								},
								"connect": {
									name: "配置关联", icon: "fa-sitemap",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										let _item = $(this).data("item");
										self.open(_item);
									}
								},
								"---": "---",
								"event": {
									name: "事件", icon: "fa-warning",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										self.look('itsm', '/janesware/event');
									}
								},
								"performance": {
									name: "性能", icon: "fa-line-chart",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										self.look('itsm', '/janesware/performance');
									}
								},
								"log": {
									name: "日志", icon: "fa-file-code-o",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										self.look('itsm', '/janesware/log');
									}
								},
								"----": "----",
								"new-content": {
									name: "新增", icon: "fa-plus",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										alertify.log('新增配置相关内容！')
									}
								}
							};

							$.contextMenu({
								selector: '#calendar',
								callback: function (key, options) {
									var m = "clicked: " + key;
									console.log(m);
								},
								items: _menu
							});
						},
						load: function () {
							const self = this;

							self.event = omdbHandler.fetchData('#/matrix/system/calendar/: | top 200');
						},
						initCalendar: function(){
							let _locale = `{{.Lang}}`;
							let t = new Date;
							let n = t.getMonth();
							let r = t.getFullYear();
							let i = $('#calendar').fullCalendar({
										schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
										themeSystem:'bootstrap3',
										header: {
											left: 'prev,next today',
											center: 'title',
											right: 'month,agendaWeek,agendaDay,listMonth'
										},
										locale: _locale,
										firstDay: 1,
										businessHours: {
											dow: [ 1, 2, 3, 4, 5 ], // Monday - Thursday
											start: '08:30', // a start time (10am in this example)
											end: '17:30', // an end time (6pm in this example)
										},
										selectable: true,
										selectHelper: true,
										droppable: true,
										drop: function(e, t) {
											var n = $(this).data("eventObject");
											var r = $.extend({}, n);
											r.start = e;
											r.allDay = t;
											$("#calendar").fullCalendar("renderEvent", r, true);
											if ($("#drop-remove").is(":checked")) {
												$(this).remove()
											}
										},
										select: function(e, t, n) {
											var r = prompt("Event Title:");
											if (r) {
												i.fullCalendar("renderEvent", {
													title: r,
													start: e,
													end: t,
													allDay: n
												}, true)
											}
											i.fullCalendar("unselect")
										},
										eventClick: function(calEvent, jsEvent, view) {

											alert('Event: ' + calEvent.title);
											alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
											alert('View: ' + view.name);

											// change the border color just for fun
											$(this).css('border-color', 'red');

										},
										eventRender: function(e, t, n) {
											console.log(e,t,n)
											var r = e.media ? e.media : "";
											var i = e.description ? e.description : "";
											t.find(".fc-event-title").after($('<span class="fc-event-icons"></span>').html(r));
											t.find(".fc-event-title").append("<small>" + i + "</small>")
										},
										editable: true,
										events: [{
											title: "Event",
											start: new Date(r, n, 0),
											end: new Date(r, n, 1),
											className: "bg-purple",
											media: '<i class="fa fa-trophy"></i>',
											description: "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus."
										}, {
											title: "Daily Meeting",
											start: new Date(r, n, 10),
											end: new Date(r, n, 12),
											allDay: false,
											className: "bg-blue",
											media: '<i class="fa fa-users"></i>',
											description: "Lorem ipsum dolor sit amet adipiscing elit."
										}, {
											title: "Click for Google",
											start: new Date(r, n, 15),
											end: new Date(r, n, 17),
											url: "",
											className: "bg-green",
											media: '<i class="fa fa-google-plus"></i>',
											description: "Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos."
										}]
									});

							_.delay(self.init,500);
						}
					}
				})

				// 规则管理
				Vue.component('rules-manage',{
					delimiters: ['${', '}'],
					template: '#rules-manage-template',
					data: function() {
						return {
							editor: Object,
							etcd: {
								createdIndex: String,
								modifiedIndex: String,
								ttl: -1,
								expiration: Number,
							},
							etcdKey: String,
						}
					},
					mounted: function(){
						this.$nextTick(function(){
							this.initEditer();
						})
					},
					created: function(){
						eventHub.$on("editor-value", this.setEditor);
					},
					methods: {
						initEditer: function(){
							self = this;
							self.editor = ace.edit("etcd_value");
							ace.require('ace/ext/settings_menu').init(self.editor);
							self.editor.setOptions({
								maxLines: 30,//Infinity,
								minLines: 10,
							});
							self.editor.commands.addCommands([{
								name: "showSettingsMenu",
								bindKey: {
									win: "Ctrl-9",
									mac: "Command-9"
								},
								exec: function(editor) {
									self.editor.showSettingsMenu();
								},
								readOnly: true
							}]);
							self.editor.$blockScrolling = Infinity;
							self.editor.setTheme("ace/theme/xcode");
							self.editor.getSession().setMode("ace/mode/ini");
							self.editor.getSession().setTabSize(2);
							self.editor.getSession().setUseWrapMode(true);
						},
						setEditor: function(event) {
							self = this;
							self.etcdKey = event.key;
							self.editor.setValue(event.value);
							self.editor.setValue(self.editor.getValue(), 1);

							/**
							 * @todo  当前节点为目录，隐藏键值输入框并显示节点［添加］按钮
							 */
							if (event.dir) {
								$("#etcd_value").hide();
								$("#etcd_label").hide();
								$("#config_btn_new_modal").show();
							} else {
								/**
								 * @todo  当前为节点，显示键值输入框并隐藏节点［添加］按钮，调用刷新为正常显示键值（codemirror's bug)
								 */
								$("#etcd_value").show();
								$("#etcd_label").show();
								$("#config_btn_new_modal").hide();

							}
							/**
							 * @todo  设置节点其它值信息
							 */
							self.etcd.createdIndex = event.createdIndex;
							self.etcd.modifiedIndex = event.modifiedIndex;
							self.etcd.ttl = event.ttl;
							self.etcd.expiration = event.expiration;
						},
						addNode:function() {

						},
						removeNode: function() {

						},
						saveNode: function(){
							self = this;
							var key = self.etcdKey;
							var value = self.editor.getValue();
							var ttl = self.etcd.ttl;
							
							jQuery.ajax({
								url: '/mxconfig/set',
								type: 'POST',
								dataType: 'json',
								data: {
									key,
									value,
									ttl
								},
								complete: function(xhr, textStatus) {
									//called when complete
								},
								success: function(data, textStatus, xhr) {

									alertify.success(`${self.etcdKey} 添加成功`);
									return false;
									var treeObj = $.fn.zTree.getZTreeObj("tree1");
									var sNodes = treeObj.getSelectedNodes();
									if (sNodes.length > 0) {
										var node = sNodes[0].getParentNode();

										refreshNodeData(node);
									}
								},
								error: function(xhr, textStatus, errorThrown) {
									//called when there is an error
								}
							})
						}
					}
				})

				// 队列管理
				Vue.component('queue-manage',{
					delimiters: ['${', '}'],
					template: '#queue-manage-template',
					data: function(){
						return {
							model:{
								data: [],
							}
						}
					},
					mounted: function(){
						this.$nextTick(function () {
							this.initQueueData();
						})
					},
					methods: {
						initQueueData: function(){
							const self = this;

							jQuery.ajax({
								url: '/mxqueue',
								type: 'POST',
								dataType: 'json',
								data: {data: ""},
								beforeSend:function(xhr){
								},
								complete: function(xhr, textStatus) {
								},
								success: function(data, textStatus, xhr) {
									console.log(data.message)
									self.model.data = data.message.splice(0);
								},
								error: function(xhr, textStatus, errorThrown) {
								}
							});
						}
					}
				})

				let main = {
					template: `<el-container style="background-color:#ffffff;height: calc(100vh - 85px);">
									<el-aside id="system-view-left-panel">
										<el-collapse value="user-manage" accordion @change="toggleView">
											
											<el-collapse-item name="user-manage">
												<template slot="title">
													<i class="fas fa-users"></i> &nbsp;用户和权限
												</template>
												<el-container>
													<el-header style="line-height:30px;height:30px;text-align:right;padding:0px 5px 0px;">
														<el-tooltip content="新建用户">
															<a href="javascript:void(0);" class="btn btn-link" @click="newUser" style="padding:0px;color:#999;"><i class="fas fa-user"></i>+</a>
														</el-tooltip>
														<el-tooltip content="新建组">    
															<a href="javascript:void(0);" class="btn btn-link" @click="newGroup" style="padding:0px;color:#999;"><i class="fas fa-users-cog"></i>+</a>
														</el-tooltip>
													</el-header>
													<el-main style="padding:0px;">
														<user-tree-component :zNodes="userTreeNodes" @click.native="toggleView('user-manage')"></user-tree-component>
													</el-main>
												</el-container>
											</el-collapse-item>

											<el-collapse-item name="company-manage" v-if="window.COMPANY_NAME=='wecise' && window.SignedUser_IsAdmin==true">
												<template slot="title">
													<i class="fas fa-building"></i> &nbsp;公司管理
												</template>
											</el-collapse-item>
							
											<el-collapse-item name="grok-manage">
												<template slot="title">
													<i class="fas fa-random"></i> &nbsp;解析规则
												</template>
											</el-collapse-item>
											
											<el-collapse-item name="calendar-manage">
												<template slot="title">
													<i class="fas fa-calendar"></i> &nbsp;日历管理
												</template>
											</el-collapse-item>
							
											<el-collapse-item name="tools-manage">
												<template slot="title">
													<i class="fas fa-tasks"></i> &nbsp;应用管理
												</template>
											</el-collapse-item>
							
											<!--el-collapse-item name="session-manage">
												<template slot="title">
													<i class="fas fa-slideshare"></i> &nbsp;会话管理
												</template>
											</el-collapse-item>
							
											<el-collapse-item name="notify-manage">
												<template slot="title">
													<i class="fas fa-bell"></i> &nbsp;通知中心
												</template>
												<div class="panel-body">
													<notify-tree-component :zNodes="notifyTreeNodes" @click.native="toggleView('notify-manage')"></notify-tree-component>
												</div>
											</el-collapse-item>
							
											<el-collapse-item name="queue-manage">
												<template slot="title">
													<i class="fas fa-exchange"></i> &nbsp;队列管理
												</template>
											</el-collapse-item-->
																	
										</el-collapse>
										
									</el-aside>
									<el-main style="padding:0px;" id="system-view-main-panel">
										<component v-bind:is="currentView" transition="fade" transition-mode="out-in"></component>
									</el-main>
								</el-container>  `,
					data: {
						currentView: 'user-manage',
						userTreeNodes: {},
						configTreeNodes: {},
						rulesTreeNodes: {},
						notifyTreeNodes: {},
						maintainTreeNodes: {},
						split: {
							inst: null
						}
					},
					created() {
						eventHub.$on('user-tree-refresh-event', this.initUserTreeNodes);
					},
					mounted(){
						const self = this;

						self.$nextTick(function(){
							var name = `{{.SignedUser.IsAdmin}}`;
							var ospace = `{{.SignedUser.Company.OSpace}}`;

							if(name && ospace=='matrix'){
								self.loadTreeData('/','configTreeNodes');
							} else {
								self.loadTreeData('/'+ospace,'configTreeNodes');
							}
							self.loadTreeData('/matrix/probes', 'rulesTreeNodes');
							self.initUserTreeNodes();
							self.initNotifyTreeNodes();
							self.initMaintainTreeNodes();

							self.split.inst = Split(['#system-view-left-panel', '#system-view-main-panel'], {
                                sizes: [25, 75],
                                minSize: [0, 0],
                                gutterSize: 5,
                                gutterAlign: 'end',
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true,
                            });
						})
					},
					methods: {
						toggleView(event) {
							this.currentView=event;
						},
						loadTreeData(event, param){
							const self = this;
							jQuery.ajax({
								url: '/config/get',
								type: 'GET',
								dataType: 'json',
								data: {
									key: event
								},
								beforeSend: function(xhr) {
								},
								complete: function(xhr, textStatus) {
								},
								success: function(data, textStatus, xhr) {
									
									if(!_.isEmpty(data.message)){
										let _tmp = JSON.stringify(data.message).replace(new RegExp('"dir":true', 'gm'), '"isParent":true,"dir":true');
										let rtn = _.attempt(JSON.parse.bind(null, _tmp));
										self[param] = rtn;
									}
									
								},
								error: function(xhr, textStatus, errorThrown) {
								}
							});
						},
						refreshUser(){
							const self = this;

							self.initUserTreeNodes();
						},
						initUserTreeNodes() {
							const self = this;

							let rtn = userHandler.userList("/").message;
							
							self.userTreeNodes = _.map(rtn,function(v,k){
													return _.merge(v, {open:true});
												});
						},
						initNotifyTreeNodes() {
							const self = this;
							self.notifyTreeNodes = {name: "值班组", children: [
													{name: "上海值班"},
													{name: "北京值班"}
												]};
						},
						initMaintainTreeNodes() {
							const self = this;
							self.maintainTreeNodes = {name: "实体", children: [
													{name: "应用"},
													{name: "服务器"},
													{name: "网络"},
													{name: "存储"},
													{name: "集群"}
												]};
						},
						saveUserGroup(){
							const self = this;

							jQuery.ajax({
								url: '/mxobject/search',
								type: 'POST',
								dataType: 'json',
								data: {
									cond: `#/matrix/ldap/:`
									//cond: `call user { "ftype": "query",  "object":{ "fullname": "/" } }`
								},
								beforeSend: function(xhr) {
								},
								complete: function(xhr, textStatus) {
								},
								success: function(data, textStatus, xhr) {
									var rtn = data.message;
									
									self.userTreeNodes = rtn;
								},
								error: function(xhr, textStatus, errorThrown) {
								}
							})
						},
						newUser(){
							eventHub.$emit("new-user-event",null);
						},
						newGroup(){
							eventHub.$emit("new-group-event",null);
						},
						toggleLeft() {
							const self = this;

							if(self.toggle.left) {

								$("#nav").hide();

								$("#mainview").removeClass("col-lg-10");
								$("#mainview").addClass("col-lg-12");
								//$("#mainview").find(".panel-default").css("border-left","1px #ddd solid");

								$(".navtoggle").removeClass("fa fa-caret-left");
								$(".navtoggle").addClass("fa fa-caret-right");

								self.toggle.left = false;
							} else {
								$("#nav").slideDown(500);
								$("#nav").show();

								$("#mainview").removeClass("col-lg-12");
								$("#mainview").addClass("col-lg-10");
								//$("#mainview").find(".panel-default").css("border-left","2px #ddd dotted");

								$(".navtoggle").removeClass("fa fa-caret-right");
								$(".navtoggle").addClass("fa fa-caret-left");

								self.toggle.left = true;
							}
						}
					}
				};
				
				this.app = new Vue(main).$mount("#app");
			});
		})

    }

}