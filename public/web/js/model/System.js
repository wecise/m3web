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

        VueLoader.onloaded(["ai-robot-component"
							],function() {

			$(function() {
			
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
					delimiters: ['#{', '}#'],
					data(){
						return {
							defaultProps: {
								children: 'children',
								label: 'username'
							},
							nodes: []
						}
					},
					template: 	`<el-container>
									<!--el-header style="line-height:30px;height:30px;text-align:right;padding:0px 5px 0px;">
										<el-tooltip content="新建组">    
											<el-button type="text" @click="newGroup" icon="el-icon-folder-add"></el-button>
										</el-tooltip>
									</el-header-->
									<el-main style="padding:0px;">
										<el-tree 
											node-key="fullname"
											default-expand-all
											:data="nodes" :props="defaultProps" 
											@node-click="onNodeClick"
											@node-expand="onNodeExpand"
											style="background: transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
												<span class="el-icon-folder" style="color:#409eff;" v-if="data.otype=='org'"></span>
												<span class="el-icon-user" style="color:#67c23a;" v-else></span>
												<span>#{node.label}#</span>
												<span v-if="data.otype=='org'">
													<el-button v-show="data.del" type="text" @click="onDeleteUser(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete" v-if="!_.includes(['/系统组','/'],data.fullname)"></el-button>
													<el-button v-show="data.del" type="text" @click="newUser(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-plus"></el-button>
													<el-button v-show="data.del" type="text" @click="newGroup(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-folder-add"></el-button>
													<el-button v-show="data.del" type="text" @click="onRefresh(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-refresh"></el-button>
												</span>
												<span v-else>
													<el-button v-show="data.del" type="text" @click="onDeleteUser(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete" v-if="data.username != 'admin'"></el-button>
													<el-button v-show="data.del" type="text" @click="editUser(data,$event)" style="float:right;width:14px;margin-left:5px;" icon="el-icon-edit"></el-button>
												</span>
											</span>                  
										</el-tree>	
									</el-main>
								</el-container>`,
					created(){
						this.initNodes();
					},
					methods:{
						onRefresh(data,event){
							event.stopPropagation();
							this.initNodes();
						},
						initNodes() {

							var users = function(parent) {

								var data = userHandler.userList(parent).message;
								
								var itemArr = [];
								_.forEach(data,(v)=>{
									if (parent === v.parent) {
										itemArr.push( _.extend(v,{children: users(v.fullname), del:false }) );
									}
								})
								
								return _.sortBy(itemArr,'fullname');
							};

							this.nodes = [{
								"id": "1",
								"class": "/matrix/ldap",
								"username": "组",
								"fullname": "/",
								"lft": 1,
								"rgt": 1,
								"otype": "org",
								"name": "1",
								children: users("/")
							}];

						},
						onNodeClick(){
							
						},
						onNodeExpand(){

						},
						onMouseEnter(data){
							this.$set(data, 'del', true)
						},
						onMouseLeave(data){
							this.$set(data, 'del', false)
						},
						newUser(data,event){
							
							event.stopPropagation();

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
													<el-form ref="form" label-width="80px">

														<el-form-item label="组名称">
															<el-input v-model="ldap.parent" autofocus disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="用户名">
															<el-input v-model="ldap.username" autofocus autocomplete="off"></el-input>
														</el-form-item>

														<el-form-item label="邮箱"
																	:rules="[
																	{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
																	]">
															<el-input v-model="email"></el-input>
														</el-form-item>

														<el-form-item label="密码">
															<el-input type="password" v-model="ldap.passwd" autocomplete="off" show-password></el-input>
														</el-form-item>
														
														<el-form-item label="确认密码">
															<el-input type="password" v-model="checkPass" autocomplete="off" show-password></el-input>
														</el-form-item>


														<el-form-item label="激活">
															<el-switch v-model="ldap.isactive" true-value="true" false-value="false"></el-switch>
														</el-form-item>
														
														<el-form-item label="管理员">
															<el-switch v-model="ldap.isadmin" true-value="true" false-value="false"></el-switch>
														</el-form-item>

														<el-form-item>
															<el-button type="warning" v-if="loading"><i class="el-icon-loading"></i> 创建用户、同步文件系统，请稍后。。。</el-button>
															<el-button type="primary" @click="save" v-else>创建用户</el-button>
														</el-form-item>
														
													</form>
												</el-main>
											</el-container>`,
								data: {
									ldap: {
										parent: data.fullname, 
										username: "",
										passwd: "",
										isactive: true,
										isadmin: false,
										otype: 'usr'                     
									},
									email: "",
									checkPass: "",
									loading: false
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
											
											this.$message({
												type: "warning",
												message: `名称不能为空！`
											})
											return false;
										}

										if (_.isEmpty(me.email)) {
											this.$message({
												type: "warning",
												message: `邮件不能为空！`
											})
											return false;
										}

										if (_.isEmpty(me.ldap.passwd)) {
											this.$message({
												type: "warning",
												message: `密码不能为空！`
											})
											return false;
										}

										if (_.isEmpty(me.checkPass)) {
											this.$message({
												type: "warning",
												message: `确认密码不能为空！`
											})
											return false;
										}

										if ( me.ldap.passwd !== me.checkPass) {
											this.$message({
												type: "warning",
												message: `确认密码不一致！`
											})
											return false;
										}

										me.loading = true;

										_.delay(()=>{
											
											let _csrf = window.CsrfToken.replace(/'/g,"");
											let rtn = userHandler.userAdd(me.ldap, _csrf);
	
											if(rtn===1){
												this.$message({
													type: "success",
													message: `用户: ${me.ldap.username} ${me.email} 添加成功！`
												})
												
												me.loading = false;
	
												_.delay(()=>{
													self.initNodes;
													self.onRefresh(data,event);
													wnd.close();
												},500);
	
											}
										},500)

									}
								}
							};
							
							new Vue(config).$mount("#ldap-newUser-container");
						},
						editUser(data,event){

						},
						onDeleteUser(data,event){

							if(data.fullname === '/系统组'){
								this.$message({
									type: "warning",
									message: "系统组，禁止删除！"
								})
								return false;
							}
							if(data.fullname === '/系统组/admin'){
								this.$message({
									type: "warning",
									message: "系统管理员，禁止删除！"
								})
								return false;
							}

							this.$confirm(`确认要删除该用户：${data.fullname}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                
                                let rtn = userHandler.userDelete(data.id);
                                
                                if(rtn==1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除成功!'
									});
									_.delay(()=>{
										this.onRefresh(data,event);
									},500)
									
                                }else {
									this.$message({
                                        type: 'error',
                                        message: '删除失败!'
                                    });
								}
                            }).catch(() => {
                                
                            });
							
						},
						newGroup(node,event){
							
							event.stopPropagation();

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
															<el-button type="primary" @click="save">创建组</el-button>
														</el-form-item>
														
													</form>
												</el-main>
											</el-container>`,
								data: {
									ldap: {
										parent: node.fullname, 
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
											this.$message({
												type: 'warning',
												message: '所属组名称不能为空！!'
											});
											return false;
										}

										if (_.isEmpty(me.ldap.username)) {
											this.$message({
												type: 'warning',
												message: '组名称不能为空！'
											});
											return false;
										}

										let _csrf = window.CsrfToken.replace(/'/g,"");
										let rtn = userHandler.userAdd(me.ldap, _csrf);

										if(rtn==1){
											this.$message({
												type: 'success',
												message: `组: ${me.ldap.parent} 添加成功！`
											});
											
											_.delay(function(){
												self.onRefresh(node,event);
												eventHub.$emit('user-tree-refresh-event', null);
												wnd.close();
											},500);

										}

									}
								}
							};

							new Vue(config).$mount("#ldap-newGroup-container");
						}
					}
				})

				Vue.component('user-trewe-component',{
					delimiters: ['#{', '}#'],
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

				// 通知管理-rule
				Vue.component("notify-manage-rule",{
					delimiters: ['#{', '}#'],
					template: 	`<el-container>
									<el-header style="height:40px;line-height:40px;">
										<el-tooltip content="刷新">
											<el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
										</el-tooltip>
										<el-tooltip content="新建规则">
											<el-button type="text" icon="el-icon-plus" @click="onNew"></el-button>
										</el-tooltip>
										<!--el-tooltip content="导出规则">
											<el-button type="text" icon="el-icon-upload2"></el-button>
										</el-tooltip>
										<el-tooltip content="导入规则">
											<el-button type="text" icon="el-icon-download"></el-button>
										</el-tooltip-->
									</el-header>
									<el-main  style="padding:0px;">
										<el-table
											:data="dt.rows"
											:row-class-name="rowClassName"
                                            :header-cell-style="headerRender"
											style="width: 100%">
											<el-table-column type="index"></el-table-column>
											<el-table-column type="expand">
												<template slot-scope="props">
													<el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f2f3f5;" >
														<el-form-item v-for="v,k in props.row" :label="k">
															<el-input v-model="v"></el-input>
														</el-form-item>
													</el-form>
												</template>
											</el-table-column>
											<el-table-column 
												node-key="id"
												:label="item.title" 
												:prop="item.field" 
												:formatter="item.render"
												v-for="item in dt.columns"
												v-if="item.visible">
												
											</el-table-column>
											<el-table-column label="操作">
												<template slot-scope="scope">
													<el-button type="text" icon="el-icon-delete"  @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
								</el-container>`,
					data(){
						return {
							dt: {
								rows:[],
								columns: [],
								selected: []
							}
						}
					},
					mounted() {
						this.$nextTick().then(()=>{
							this.initData();
						})
					},
					methods:{
						initData(){
							let rtn = fsHandler.callFsJScript("/matrix/notify/getRuleList.js").message;
							_.extend(rtn, {columns: _.map(rtn.columns, (v)=>{
                                    
								if(_.isUndefined(v.visible)){
									_.extend(v, { visible: true });
								}

								if(!v.render){
									return v;
								} else {
									return _.extend(v, { render: eval(v.render) });
								}
								
							})});
							_.extend(this.dt, rtn);
						},
						rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0) {
                                //return 'text-align:center;';
                            }
						},
						onRefresh(){
							this.initData();
						},
						onNew(){
							
							this.$prompt('请输入规则名称', '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
							  }).then(({ value }) => {

								if(_.isEmpty(value)){
									this.$message({
										type: "info",
										message: "请输入规则名称"
									})
									return false;
								}

								let term = {
									action: "new",
									model: {
										name: value,
										persons:"",
										rtype:"",
										situation:"",
										status:1,
										template:""
									}
								};

								let rtn = fsHandler.callFsJScript("/matrix/notify/ruleAction.js",encodeURIComponent(JSON.stringify(term))).message;
								this.$message({
									type: "success",
									message: "新建规则成功！"
								})
								_.delay((v)=>{
									this.initData();
								},500)
							
							  }).catch(() => {
								
							  });
						},
						onDelete(index,item){
							this.$confirm(`确认要删除该规则：${item.name}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
								let term = {action:"delete",model:item};
                                let rtn = fsHandler.callFsJScript("/matrix/notify/ruleAction.js",encodeURIComponent(JSON.stringify(term))).message;
                                
                                if(rtn==1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除规则成功!'
									});
									_.delay(()=>{
										this.initData();
									},500)
                                }else {
									this.$message({
                                        type: 'error',
                                        message: '删除规则失败!'
                                    });
								}
                            }).catch(() => {
                                
                            });
						}
					}
				})
				// 通知管理-type
				Vue.component("notify-manage-type",{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-aside style="width:240px;background:#fff;height:100%;">
										<el-tree 
											node-key="id"
											:data="tree.data" 
											:props="tree.defaultProps" 
											@node-click="onNodeClick"
											style="background:transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
												<span>#{node.label}#</span>
												<el-button v-show="data.show" type="text" @click="delNode(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete"></el-button>
												<el-button v-show="data.show" type="text" @click="newNode(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-plus"></el-button>
												<el-button v-show="data.show" type="text" @click="newGroup(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-folder-add"></el-button>
												<el-button v-show="data.show" type="text" @click="refresh(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-refresh"></el-button>
											</span>   
										</el-tree>
									</el-aside>
									<el-container style="height:100%;">
										<el-header style="height:40px;line-height:40px;">
											<el-tooltip content="删除选择的分类">
												<el-button type="text" icon="el-icon-delete"></el-button>
											</el-tooltip>
											<el-tooltip content="导出">
												<el-button type="text" icon="el-icon-download"></el-button>
											</el-tooltip>
											<el-tooltip content="导入">
												<el-button type="text" icon="el-icon-upload2"></el-button>
											</el-tooltip>
										</el-header>
										<el-main  style="padding:0px;height:100%;">
											<el-table
												:data="dt.rows"
												style="width: 100%">
												<el-table-column type="index"></el-table-column>
												<el-table-column type="expand">
												<template slot-scope="props">
													<el-form label-position="left">
														
													</el-form>
												</template>
												</el-table-column>
												<el-table-column 
													:label="item.title" 
													:prop="item.field" 
													v-for="item in dt.columns"
													v-if="item.visible"></el-table-column>
											</el-table>
										</el-main>
									</el-container>
								</el-container>`,
					data(){
						return {
							tree: {
								data: [
									{
										id: "1",
										label: '主机事件',
										show: false,
										children: [
											{
												id: "11",
												label: '主机硬件',
												show: false,
												param: `alerttype="1"`,
												children: []
											},
											{
												id: "12",
												label: '主机系统',
												show: false,
												param: `alerttype="2"`,
												children: []
											},
											{
												id: "13",
												label: '主机DB2',
												show: false,
												param: `alerttype="3"`,
												children: []
											}
										]
									}, 
									{
										id: "2",
										label: '开放事件',
										children: [
											{
												id: "21",
												label: '开放硬件',
												show: false,
												param: `alerttype="1"`,
												children: []
											},
											{
												id: "22",
												label: '开放系统',
												show: false,
												param: `alerttype="2"`,
												children: []
											},
											{
												id: "3",
												label: '开放DB2',
												show: false,
												param: `alerttype="3"`,
												children: []
											}
										]
									}
								],
								defaultProps:{
									children: 'children',
          							label: 'label'
								}
							},
							dt: {
								rows:[{
									id: '1',
									class: "/matrix/system/notify",
									name: '运维开放',
									status: '1',
									param: `alerttype='1'`,
									config: ''
								},
								{
									id: '2',
									class: "/matrix/system/notify",
									name: '运维主机',
									status: '1',
									param: `alerttype='1'`,
									config: ''
								}],
								columns: [
									{
										field: "id",
										title: "ID",
										width: 120,
										visible:false
									},
									{
										field: "class",
										title: "CLASS",
										width: 120,
										visible:false
									},
									{
										field: "name",
										title: "规则名称",
										width: 160,
										visible: true
									},
									{
										field: "param",
										title: "规则定义",
										visible: true
									},
									{
										field: "config",
										title: "其它",
										width: 160,
										visible: true
									}],
								selected: []
							}
						}
					},
					mounted() {
						
					},
					methods:{
						onNodeClick(tNode){

						},
						newNode(){

						},
						delNode(){
							
						},
						newGroup(){
							
						},
						refresh(){

						},
						onMouseEnter(data){
							this.$set(data, 'show', true)
						},
						onMouseLeave(data){
							this.$set(data, 'show', false)
						}
					}
				})
				// 通知管理-person
				Vue.component("notify-manage-person",{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-aside style="width:240px;background:#fff;height:100%;">
										<el-tree 
											node-key="id"
											:data="tree.data" 
											:props="tree.defaultProps" 
											@node-click="onNodeClick"
											style="background:transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
												<span>#{node.label}#</span>
												<el-button v-show="data.show" type="text" @click="delNode(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete"></el-button>
												<el-button v-show="data.show" type="text" @click="newNode(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-plus"></el-button>
												<el-button v-show="data.show" type="text" @click="newGroup(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-folder-add"></el-button>
												<el-button v-show="data.show" type="text" @click="refresh(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-refresh"></el-button>
											</span>   
										</el-tree>
									</el-aside>
									<el-container style="height:100%;">
										<el-header style="height:40px;line-height:40px;">
											<el-tooltip content="删除选择的人员">
												<el-button type="text" icon="el-icon-delete"></el-button>
											</el-tooltip>
											<el-tooltip content="导出">
												<el-button type="text" icon="el-icon-download"></el-button>
											</el-tooltip>
											<el-tooltip content="导入">
												<el-button type="text" icon="el-icon-upload2"></el-button>
											</el-tooltip>
										</el-header>
										<el-main  style="padding:0px;height:100%;">
											<el-table
												:data="dt.rows"
												style="width: 100%">
												<el-table-column type="index"></el-table-column>
												<el-table-column type="expand">
												<template slot-scope="props">
													<el-form label-position="left">
														
													</el-form>
												</template>
												</el-table-column>
												<el-table-column 
													node-key="id"
													:label="item.title" 
													:prop="item.field" 
													v-for="item in dt.columns"
													v-if="item.visible">
													<template slot-scope="scope">
														<span v-if="item.field=='status'">
															<el-button type="danger" v-if="scope.row.status==0">禁用</el-button>
															<el-button type="success" v-else>启用</el-button>
														</span>
														<span v-else>
															#{scope.row[item.field]}#
														</span>
													</template>	
												</el-table-column>
											</el-table>
										</el-main>
									</el-container>
								</el-container>`,
					data(){
						return {
							tree: {
								data: [
									{	
										id: "1",
										label: '系统一组',
										show: false,
										children: [
											{
												id: "11",
												label: '李勇',
												show: false,
												phone: "13900000000",
												email: "139@139.com",
												children: []
											},
											{
												id: "12",
												label: '李勇',
												show: false,
												phone: "13900000000",
												email: "139@139.com",
												children: []
											},
											{
												id: "13",
												label: '李勇',
												show: false,
												phone: "13900000000",
												email: "139@139.com",
												children: []
											}
										]
									}, 
									{
										id: "2",
										label: '系统二组',
										children: [
											{
												id: "21",
												label: '李勇1',
												show: false,
												phone: "13900000000",
												email: "139@139.com",
												children: []
											},
											{
												id: "22",
												label: '李勇2',
												show: false,
												phone: "13900000000",
												email: "139@139.com",
												children: []
											},
											{
												id: "23",
												label: '李勇3',
												show: false,
												phone: "13900000000",
												email: "139@139.com",
												children: []
											}
										]
									}
								],
								defaultProps: {
									children: 'children',
          							label: 'label'
								}
							},
							dt: {
								rows:[{
									id: '1',
									class: "/matrix/system/notify",
									name: '李勇',
									status: '1',
									phones: '13923234366',
									emails: 'wz@13.com',
									company: "ibm",
									department: "运维部门",
									group: "系统一组",
									config: "",
									template: '开放'
								},
								{
									id: '2',
									class: "/matrix/system/notify",
									name: '运维主机',
									status: '1',
									phones: '13923234366',
									emails: 'wz@13.com',
									company: "ibm",
									department: "运维部门",
									group: "系统一组",
									config: "",
									template: '开放'
								}],
								columns: [
									{
										field: "status",
										title: "状态",
										width: 50,
										visible: true
									},
									{
										field: "id",
										title: "ID",
										width: 120,
										visible:false
									},
									{
										field: "class",
										title: "CLASS",
										width: 120,
										visible:false
									},
									{
										field: "name",
										title: "人员",
										width: 160,
										visible: true
									},
									{
										field: "phones",
										title: "接收人员电话",
										width: 160,
										visible: true
									},
									{
										field: "emails",
										title: "接收人员邮件",
										width: 160,
										visible: true
									},
									{
										field: "company",
										title: "公司",
										width: 160,
										visible: true
									},
									{
										field: "department",
										title: "部门",
										width: 160,
										visible: true
									},
									{
										field: "group",
										title: "所属组",
										width: 160,
										visible: true
									},
									{
										field: "config",
										title: "其它",
										width: 160,
										visible: true
									},
									{
										field: "template",
										title: "引用模板",
										width: 160,
										visible: true
									}],
								selected: []
							}
						}
					},
					mounted() {
						
					},
					methods:{
						onNodeClick(tNode){

						},
						newNode(){

						},
						delNode(){
							
						},
						newGroup(){
							
						},
						refresh(){

						},
						onMouseEnter(data){
							this.$set(data, 'show', true)
						},
						onMouseLeave(data){
							this.$set(data, 'show', false)
						}
					}
				})
				// 通知管理-severity
				Vue.component("notify-manage-severity",{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-header style="height:40px;line-height:40px;">
										<el-tooltip content="新建级别">
											<el-button type="text" icon="el-icon-plus"></el-button>
										</el-tooltip>
										<el-tooltip content="删除选择的级别">
											<el-button type="text" icon="el-icon-delete"></el-button>
										</el-tooltip>
										<el-tooltip content="导出">
											<el-button type="text" icon="el-icon-download"></el-button>
										</el-tooltip>
									</el-header>
									<el-main  style="padding:0px;height:100%;">
										<el-table
											:data="dt.rows"
											style="width: 100%"
											v-if="dt.rows">
											<el-table-column type="index"></el-table-column>
											</el-table-column>
											<el-table-column 
												:label="item.title" 
												:prop="item.field" 
												sortable
												v-for="item in dt.columns"
												v-if="item.visible">
												<template slot-scope="scope">
													<el-color-picker
														:value="scope.row.color"
														show-alpha
														v-if="item.field=='color'">
													</el-color-picker>
													<span style="font-weight:900;" v-else>#{scope.row[item['field']]}#</span>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
								</el-container>`,
					data(){
						return {
							dt: {
								rows:[],
								columns: [],
								selected: []
							}
						}
					},
					created(){
						this.initData();
					},
					mounted() {
						
					},
					methods:{
						initData(){
							let term = {action:"list"};
							console.log(1,term)
							let rtn = fsHandler.callFsJScript("/matrix/system/severity-action.js",encodeURIComponent(JSON.stringify(term))).message;
							console.log(2,rtn)
							this.$set(this.dt,'rows',rtn.rows);
							this.$set(this.dt,'columns',rtn.columns);
						}
					}
				})
				// 通知管理-template
				Vue.component("notify-manage-template",{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-header style="height:40px;line-height:40px;">
										<el-tooltip content="刷新模板">
											<el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
										</el-tooltip>
										<el-tooltip content="新建模板">
											<el-button type="text" icon="el-icon-plus" @click="onNew"></el-button>
										</el-tooltip>
										<!--el-tooltip content="导出模板">
											<el-button type="text" icon="el-icon-upload2"></el-button>
										</el-tooltip>
										<el-tooltip content="导入模板">
											<el-button type="text" icon="el-icon-download"></el-button>
										</el-tooltip-->
									</el-header>
									<el-main style="height:100%;padding:0px;">
										<el-table
											:data="dt.rows"
											:row-class-name="rowClassName"
											@current-change="onSelectionChange"
											style="width: 100%">
											<!--el-table-column align="center" width="55">
												<template slot-scope="scope">
													<el-radio  v-model="dt.radio" :label="scope.row.enableFlag">&nbsp;</el-radio>
												</template>
											</el-table-column--> 
											<el-table-column type="index"></el-table-column>
											<el-table-column 
												node-key="id"
												:label="item.title" 
												:prop="item.field" 
												:formatter="item.render" 
												v-for="item in dt.columns"
												v-if="item.visible">
												<template slot-scope="scope">
													<div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
														v-if="typeof item.render === 'function'">
													</div>
													<div v-else>
														#{scope.row[item.field]}#
													</div>
												</template>	
											</el-table-column>
											<el-table-column type="expand" label="模板定义" width="300">
												<template slot-scope="scope">
													<el-container>
														<el-header style="height:30px;line-height:30px;">
															<el-tooltip content="点击更新模板内容" open-delay="500">
																<el-button type="text" icon="el-icon-refresh" @click="onUpdate(scope.row)"></el-button>
															</el-tooltip>
														</el-header>
														<el-main style="padding:0px;">
															<notify-manage-editor :render="scope.row.template" :index="scope.$index" @update:render="scope.row.template = $event"></notify-manage-editor>
														</el-main>
													</el-container>
												</template>
											</el-table-column>
											<el-table-column label="操作">
												<template slot-scope="scope">
													<el-button type="text" icon="el-icon-delete"  @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
								</el-container>`,
					data(){
						return {
							dt: {
								rows:[],
								columns: [],
								selected: [],
								radio:''
							}
						}
					},
					created(){
						this.initData();
					},
					mounted() {
						
					},
					methods:{
						rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
						initData(){
							let rtn = fsHandler.callFsJScript("/matrix/notify/getTemplateList.js",null).message;
							this.$set(this.dt,'rows', rtn.rows);
							this.$set(this.dt,'columns', _.map(rtn.columns, (v)=>{
                                    
								if(_.isUndefined(v.visible)){
									_.extend(v, { visible: true });
								}

								if(!v.render){
									return v;
								} else {
									return _.extend(v, { render: eval(v.render) });
								}
								
							}));
						},
						onSelectionChange(val) {
							this.dt.selected = val;
							
							// 单选设置
							_.forEach(this.dt.rows,(v)=>{
								this.$set(v,'enableFlag','0');
							})
							this.$set(_.find(this.dt.rows,{name: val.name}),'enableFlag','1');
							this.dt.radio = '1';
						},
						onRefresh(){
							this.initData();
						},
						onNew(){
							let ftype = "json";
							let attr = {remark: "模板", ctime: _.now(), author: window.SignedUser_UserName, type: ftype, status:0};
							let parent = `/home/${window.SignedUser_UserName}/Documents/notify`;
							let content = JSON.stringify({template: ""},null,2);

							this.$prompt('请输入模板名称', '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
							  }).then(({ value }) => {

								if(_.isEmpty(value)){
									this.$message({
										type: "info",
										message: "请输入名称"
									})
									return false;
								}

								let rtn = fsHandler.fsNew(ftype, parent, [value,ftype].join("."), content, attr);
							
								if(rtn == 1){
									
									this.$message({
										type: "success",
										message: "新建模板成功！"
									})
									_.delay((v)=>{
										this.initData();
									},500)
									
								} else {
									this.$message({
										type: "error",
										message: "新建模板失败，" + rtn.message
									})
								}
							  }).catch(() => {
								
							  });
							
						},
						onUpdate(item){
							
							if(_.isEmpty(item)){
								this.$message({
									type: "info",
									message: "请选择模板"
								});
								return false;
							}
							
							let ftype = item.ftype;
							let parent = item.parent;
							let name = item.name;
							let content = JSON.stringify({template:item.template},null,2);
							let attr = item.attr;
							
							let rtn = fsHandler.fsNew(ftype, parent, name, content, attr);
							
							if(rtn == 1){
								this.$message({
									type: "success",
									message: "更新模板成功！"
								})
								_.delay((v)=>{
									this.initData();
								},500)
								
							} else {
								this.$message({
									type: "error",
									message: "更新模板失败，" + rtn.message
								})
							}
						},
						onDelete(index,item){
							this.$confirm(`确认要删除该模板：${item.name}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                
                                let rtn = fsHandler.fsDelete(item.parent,item.name);
                                
                                if(rtn==1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除模板成功!'
									});
									_.delay((v)=>{
										this.initData();
									},500)
                                }else {
									this.$message({
                                        type: 'error',
                                        message: '删除模板失败!'
                                    });
								}
                            }).catch(() => {
                                
                            });
						}
					}
				})
				// 通知管理-voice
				Vue.component("notify-manage-voice",{
					delimiters: ['#{', '}#'],
					template: 	`<el-container>
									<el-header style="height:40px;line-height:40px;">
										<el-tooltip content="刷新">
											<el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
										</el-tooltip>
										<el-tooltip content="上传新媒介">
											<el-button type="text" @click="onUpload">
											 	<i class="el-icon-upload" style="color:#3ae23a;font-size:16px;"></i>
											</el-button>
										</el-tooltip>
										<!--el-tooltip content="导出媒介">
											<el-button type="text" icon="el-icon-upload2"></el-button>
										</el-tooltip>
										<el-tooltip content="导入媒介">
											<el-button type="text" icon="el-icon-download"></el-button>
										</el-tooltip-->
									</el-header>
									<el-main  style="padding:0px;">
										<el-table
											:data="dt.rows"
											style="width: 100%">
											<el-table-column type="index"></el-table-column>
											<el-table-column 
												:label="item.title" 
												:prop="item.field" 
												:formatter="item.render" 
												v-for="item in dt.columns"
												v-if="item.visible">
											</el-table-column>
											<el-table-column label="操作">
												<template slot-scope="scope">
													<el-button type="text" icon="el-icon-video-play"  @click="onPlay(scope.$index, scope.row)" v-if="!scope.row.isPlay"> 播放</el-button>
													<el-button type="text" icon="el-icon-video-pause"  @click="onStop(scope.$index, scope.row)" v-else> 停止</el-button>
													<el-button type="text" icon="el-icon-delete"  @click="onDelete(scope.$index, scope.row)"> 删除</el-button>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
								</el-container>`,
					data(){
						return {
							dt: {
								rows:[],
								columns: [],
								selected: []
							},
							sound: null
						}
					},
					created(){
						this.initData();
					},
					mounted() {
						
					},
					methods:{
						initData(){
							let rtn = fsHandler.callFsJScript("/matrix/notify/getVoiceList.js",null).message;
							this.$set(this.dt,'rows', rtn.rows);
							this.$set(this.dt,'columns', _.map(rtn.columns, (v)=>{
                                    
								if(_.isUndefined(v.visible)){
									_.extend(v, { visible: true });
								}

								if(!v.render){
									return v;
								} else {
									return _.extend(v, { render: eval(v.render) });
								}
								
							}));
						},
						onRefresh(){
							this.initData();
						},
						onUpload(){
                            const self = this;
                            let wnd = null;

                            try{
                                if(jsPanel.activePanels.getPanel('jsPanel-class-template')){
                                    jsPanel.activePanels.getPanel('jsPanel-class-template').close();
                                }
                            } catch(error){

                            }
                            finally{
                                wnd = maxWindow.winClassTemplate('导入声音文件', `<div id="class-template-import"></div>`, null, null, null);
                            }

                            new Vue({
                                delimiters: ['#{', '}#'],
                                data:{
                                    fileList: [],
                                    rtnInfo: null
                                },
                                template: `<el-container style="height:100%;">
                                                <el-main style="padding:10px;">
                                                    <div v-if="!_.isEmpty(rtnInfo)">
                                                        <el-button type="text" icon="el-icon-close" @click="clearInfo"></el-button>
                                                        <section>
                                                            <code>#{rtnInfo.message.join(",")}#</code>
                                                        </section>
                                                    </div>
													<el-upload
														name="uploadfile"
                                                        class="upload-demo"
                                                        drag
                                                        :auto-upload="true"
														:on-change="onChange"
														:on-success="onUploadSuccess"
														:file-list="fileList"
														accept=".mp3,.wav"
														action="/fs/assets/audio?issys=true"
														ref="upload"
                                                        v-else>
                                                        <i class="el-icon-upload"></i>
                                                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                                                        <div class="el-upload__tip" slot="tip">只能上传声音文件</div>
                                                    </el-upload>
                                                </el-main>
                                                <el-footer style="line-height:60px;text-align:center;">
                                                    <el-button type="default" @click="onCancel">取消</el-button>
                                                </el-footer>
                                            </el-container>`,
                                methods:{
                                    onChange(file) {
                                        this.fileList = [file.raw];
                                    },
                                    onCancel(){
                                        wnd.close();
									},
									onUploadSuccess(res, file){
										self.initData();
									},
                                    clearInfo(){
                                        this.rtnInfo = null;
                                    }
                                }
                            }).$mount("#class-template-import");
                        },
						onPlay(index){
							
							if(this.sound){
								this.sound.stop();
							}

							let src = `/fs${this.dt.rows[index].fullname}?type=open&issys=true`;
							this.sound = new Howl({
								src: [src],
								volume: 1,
								
								onend: function() {
									console.log('Finished!');
								}
							});
							this.sound.play();
							this.$set(this.dt.rows[index],'isPlay',true);
						},
						onStop(index){
							this.sound.stop();
							this.$set(this.dt.rows[index],'isPlay',false);
						},
						onDelete(index,item){
							this.$confirm(`确认要删除该声音文件：${item.name}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                
                                let rtn = fsHandler.fsDelete(item.parent,item.name);
                                
                                if(rtn==1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除声音文件成功!'
									});
									_.delay((v)=>{
										this.initData();
									},500)
                                }else {
									this.$message({
                                        type: 'error',
                                        message: '删除声音文件失败!'
                                    });
								}
                            }).catch(() => {
                                
                            });
						}
					}
				})
				// 通知管理-log
				Vue.component("notify-manage-log",{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-header style="height:40px;line-height:40px;">
										<el-tooltip content="删除选择的日志">
											<el-button type="text" icon="el-icon-delete"></el-button>
										</el-tooltip>
										<el-tooltip content="导出日志">
											<el-button type="text" icon="el-icon-download"></el-button>
										</el-tooltip>
									</el-header>
									<el-main  style="padding:0px;height:100%;">
										<el-table
											:data="dt.rows"
											:row-class-name="rowClassName"
											style="width: 100%">
											<el-table-column type="index"></el-table-column>
											<el-table-column 
												node-key="id"
												sortable
												:label="item.title" 
												:prop="item.field" 
												:formatter="item.render" 
												v-for="item in dt.columns"
												v-if="item.visible">
												<template slot-scope="scope">
													<div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
														v-if="typeof item.render === 'function'">
													</div>
													<div v-else>
														#{scope.row[item.field]}#
													</div>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
								</el=container>`,
					data(){
						return {
							dt: {
								rows:[],
								columns: [],
								selected: []
							}
						}
					},
					created(){
						this.initData();
					},
					mounted() {
						
					},
					methods:{
						rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
						initData(){
							let rtn = fsHandler.callFsJScript("/matrix/notify/getLogList.js",null).message;
							this.$set(this.dt,'rows', rtn.rows);
							this.$set(this.dt,'columns', _.map(rtn.columns, (v)=>{
                                    
								if(_.isUndefined(v.visible)){
									_.extend(v, { visible: true });
								}

								if(!v.render){
									return v;
								} else {
									return _.extend(v, { render: eval(v.render) });
								}
								
							}));
						}
					}
				})

				// 通知管理 Editor
                Vue.component("notify-manage-editor",{
                    delimiters: ['#{', '}#'],
                    props: {
                        render: String,
                        index: Number
                    },
                    data(){
                        return {
                            editor: null
                        }
                    },
                    template: `<div style="width:100%;height:200px;" ref="editor"></div>`,
                    beforeDestroy() {
                        this.editor.destroy();
                        this.editor.container.remove();
                    },
                    mounted(){
                        this.$nextTick(()=>{
                            this.init();
                        })
                    },
                    methods:{
                        init(){
                            this.editor = ace.edit(this.$refs.editor);
                            this.editor.setOptions({
                                // maxLines: 1000,
                                // minLines: 20,
                                autoScrollEditorIntoView: true,
                                enableBasicAutocompletion: true,
                                enableSnippets: true,
                                enableLiveAutocompletion: false
                            });
                            
                            this.editor.getSession().setMode("ace/mode/text");
                            this.editor.getSession().setUseSoftTabs(true);
                            this.editor.getSession().setTabSize(2);
                            this.editor.getSession().setUseWrapMode(true);

                            this.editor.setValue(this.render);

                            this.editor.on("change", _.debounce((v)=>{
                                this.$emit('update:render', this.editor.getValue());
                            },500));
                        }
                    }

                })

                // 事件处理-log
				Vue.component("event-manage-log",{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-header style="height:40px;line-height:40px;">
										<el-tooltip content="删除选择的日志">
											<el-button type="text" icon="el-icon-delete"></el-button>
										</el-tooltip>
										<el-tooltip content="导出日志">
											<el-button type="text" icon="el-icon-download"></el-button>
										</el-tooltip>
									</el-header>
									<el-main  style="padding:0px;height:100%;">
										<el-table
											:data="dt.rows"
											style="width: 100%">
											<el-table-column type="index"></el-table-column>
											<el-table-column type="expand">
											<template slot-scope="props">
												<el-form label-position="left">
													
												</el-form>
											</template>
											</el-table-column>
											<el-table-column 
												node-key="id"
												sortable
												:label="item.title" 
												:prop="item.field" 
												v-for="item in dt.columns"
												v-if="item.visible">
												<template slot-scope="scope">
													<span v-if="item.field=='status'">
														<el-button type="danger" v-if="scope.row.status==0">失败</el-button>
														<el-button type="success" v-else>成功</el-button>
													</span>
													<span v-else>
														#{scope.row[item.field]}#
													</span>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
								</el=container>`,
					data(){
						return {
							dt: {
								rows:[{
									id: '1',
									class: "/matrix/system/notify",
									status: '1',
									serial: '2234234',
                                    name: '事件屏蔽',
                                    msg: '屏蔽事件390条',
									vtime: _.now(),
								},
								{
									id: '2',
									class: "/matrix/system/notify",
									status: '0',
									serial: '2234234',
									name: '事件关闭',
                                    msg: '事件关闭390条'
								}],
								columns: [
									{
										field: "status",
										title: "状态",
										width: 50,
										visible: true
									},
									{
										field: "id",
										title: "ID",
										width: 120,
										visible:false
									},
									{
										field: "class",
										title: "CLASS",
										width: 120,
										visible:false
									},
									{
										field: "name",
										title: "处理方式",
										width: 160,
										visible: true
									},
									{
										field: "msg",
										title: "摘要",
										visible: true
									},
									{
										field: "vtime",
										title: "发送时间",
										width: 160,
										visible: true
									}],
								selected: []
							}
						}
					},
					mounted() {
						
					},
					methods:{
						
					}
				})
				// 级别管理
				Vue.component("severity-manage",{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-header style="height:40px;line-height:40px;">
										<el-tooltip content="新建级别">
											<el-button type="text" icon="el-icon-plus"></el-button>
										</el-tooltip>
										<el-tooltip content="删除选择的级别">
											<el-button type="text" icon="el-icon-delete"></el-button>
										</el-tooltip>
										<el-tooltip content="导出">
											<el-button type="text" icon="el-icon-download"></el-button>
										</el-tooltip>
									</el-header>
									<el-main  style="height:100%;">
										<el-table
											:data="dt.rows"
											style="width: 100%"
											v-if="dt.rows">
											<el-table-column type="index"></el-table-column>
											<el-table-column 
												:label="item.title" 
												:prop="item.field" 
												sortable
												v-for="item in dt.columns"
												v-if="item.visible">
												<template slot-scope="scope">
													<el-color-picker
														:value="scope.row.color"
														show-alpha
														v-if="item.field=='color'">
													</el-color-picker>
													<span style="font-weight:900;" v-else>#{scope.row[item['field']]}#</span>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
								</el-container>`,
					data(){
						return {
							dt: {
								rows:[],
								columns: [],
								selected: []
							}
						}
					},
					created(){
						this.initData();
					},
					mounted() {
						
					},
					methods:{
						initData(){
							let term = {action:"list"};
							let rtn = fsHandler.callFsJScript("/matrix/system/severity-action.js",encodeURIComponent(JSON.stringify(term))).message;
							
							this.$set(this.dt,'rows',rtn.rows);
							this.$set(this.dt,'columns',rtn.columns);
						}
					}
                })

				// 通知管理
				Vue.component('notify-manage',{
					delimiters: ['#{', '}#'],
					template: 	`<el-container  style="height:100%;">
									<el-main style="padding:0px;height:100%;overflow:hidden;">
										<el-tabs v-model="activeName" @tab-click="onTabClick" type="border-card">
										<el-tab-pane label="规则管理" name="rule">
											<notify-manage-rule></notify-manage-rule>
										</el-tab-pane>
										<el-tab-pane label="分类管理" name="type">
											<notify-manage-type></notify-manage-type>
										</el-tab-pane>
										<!--el-tab-pane label="人员管理" name="person">
											<notify-manage-person></notify-manage-person>
										</el-tab-pane-->
										<!--el-tab-pane label="级别管理" name="severity">
											<notify-manage-severity></notify-manage-severity>
										</el-tab-pane-->
										<el-tab-pane label="模板管理" name="template">
											<notify-manage-template></notify-manage-template>
										</el-tab-pane>
										<el-tab-pane label="声音媒介" name="voice">
											<notify-manage-voice></notify-manage-voice>
										</el-tab-pane>
										<el-tab-pane label="发送日志" name="log">
											<notify-manage-log></notify-manage-log>
										</el-tab-pane>
									</el-tabs>
									</el-main>
								</el-container>`,
					data(){
						return {
							activeName:"rule"
						}
					},
					mounted() {
						
					},
					methods:{
						onTabClick(){

						}
					}
                })

                // 事件处理
				Vue.component('event-manage',{
					delimiters: ['#{', '}#'],
					template: 	`<el-container  style="height:100%;">
									<el-main style="padding:0px;height:100%;overflow:hidden;">
										<el-tabs v-model="activeName" @tab-click="onTabClick" type="border-card">
                                        <el-tab-pane label="事件屏蔽" name="filter">
											
										</el-tab-pane>
                                        <el-tab-pane label="事件关闭" name="close">
											
										</el-tab-pane>
										<el-tab-pane label="事件升级" name="up">
											
										</el-tab-pane>
										<el-tab-pane label="事件降级" name="down">
											
										</el-tab-pane>
										<el-tab-pane label="事件处理日志" name="log">
											<event-manage-log></event-manage-log>
										</el-tab-pane>
									</el-tabs>
									</el-main>
								</el-container>`,
					data(){
						return {
							activeName:"filter"
						}
					},
					mounted() {
						
					},
					methods:{
						onTabClick(){

						}
					}
                })

				// 公司管理
				Vue.component("company-manage",{
					delimiters: ['#{', '}#'],
					props: {
						id: String
					},
					template: 	`<el-container style="height:100%;">
									
									<el-header style="text-align: right; font-size: 12px;height:30px;line-height:30px;">
										<span style="float:right;">
											<el-tooltip content="刷新列表">
												<el-button type="text" icon="el-icon-refresh" @click="initData">刷新</el-button>
											</el-tooltip>
											<el-tooltip content="新增公司信息">
												<el-button type="text" icon="el-icon-plus" @click="companyNew" >新增</el-button>
											</el-tooltip>
											<el-tooltip content="更新公司信息">
												<el-button type="text" icon="el-icon-edit" @click="companyUpdate" >编辑</el-button>
											</el-tooltip>
											<el-tooltip content="删除公司信息">
												<el-button type="text" icon="el-icon-delete" @click="companyDelete" >删除</el-button>
											</el-tooltip>
											<el-tooltip content="更新文件系统">
												<el-button type="text" icon="el-icon-files" @click="updateFs">更新</el-button>
											</el-tooltip>
										</span>
									</el-header>
									
									<el-main style="padding:10px;height:100%;">
										<el-table
											:data="dt.rows"
											stripe
											highlight-current-row
											fit="true"
											style="width: 100%"
											:row-class-name="rowClassName"
											:header-cell-style="headerRender"
											@current-change="onSelectionChange"
											ref="table">
											<el-table-column align="center" width="55">
												<template slot-scope="scope">
													<el-radio  v-model="dt.radio" :label="scope.row.enableFlag">&nbsp;</el-radio>
												</template>
											</el-table-column>     
											<el-table-column type="index" label="序号" sortable align="center">
												<template slot-scope="scope">
													<div style="width:100%; text-align: center;"> <b> #{scope.$index + 1}# </b> </div>
												</template>
											</el-table-column>
											<!--el-table-column type="selection" align="center">
											</el-table-column--> 
											<el-table-column type="expand">
												<template slot-scope="props">
													<el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f2f3f5;" >
														<el-form-item v-for="v,k in props.row" :label="k">
															<el-input v-model="v"></el-input>
														</el-form-item>
													</el-form>
												</template>
											</el-table-column>
											<el-table-column :prop="item.field" 
												show-overflow-tooltip="true" 
												:label="item.title"
												sortable
												resizable
												v-for="item in dt.columns"
												min-width="180">
												<template slot-scope="scope" >
													<span v-if="_.includes(['logo','icon'],item.field)">
														<el-avatar shape="circle" size="48" :src="scope.row[item.field]"></el-avatar>
													</span>
													<span  v-else>#{scope.row[item.field]}#</el-avatar>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
									
								</el-container>`,
					data(){
						return{
							id: "",
							dt: {
								rows: [],
								columns: [],
								selected: null,
								radio:''
							}
						}
					},
					
					created(){
						this.initData();
					},
					mounted(){
						
					},
					methods:{
						rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0) {
                                //return 'text-align:center;';
                            }
						},
						onSelectionChange(val) {
							this.dt.selected = val;
							
							// 单选设置
							_.forEach(this.dt.rows,(v)=>{
								this.$set(v,'enableFlag','0');
							})
							this.$set(_.find(this.dt.rows,{name: val.name}),'enableFlag','1');
							this.dt.radio = '1';
						},					
						initData(){
							try {
								// rows
								_.extend(this.dt, {rows:companyHandler.companyList().message});
								this.dt.rows = _.map(this.dt.rows,(v)=>{
									return _.extend(v,{enableFlag: '0'});
								});

								// columns
								let ext = fsHandler.callFsJScript("/matrix/company/company-list.js",null).message;
								_.extend(this.dt,ext);

								_.map(this.dt.columns,function(v){
									if(!v.render){
										return v;
									} else {
										return _.extend(v,{render: eval(v.render) });;
									}
								})

							} catch(err){
								
							}
						},
						companyUpdate(){
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
								wnd = maxWindow.winCompany("更新公司",`<div id="${rId}"></div>`,null,null); 
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
								template: 	`<el-container style="height:100%;">
												<el-main>
													<el-form ref="form" :model="form" label-width="120px">
														<el-form-item label="公司全称">
															<el-input v-model="form.fullname"></el-input>
														</el-form-item>
														<el-form-item label="名称">
															<el-input v-model="form.name" :disabled="true"></el-input>
														</el-form-item>
														<el-form-item label="应用">
															<el-input v-model="form.ospace" :disabled="true"></el-input>
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
															<el-upload :before-upload="encodeLogoFileAsURL" class="avatar-uploader" :show-file-list="false">
																<img :src="upload.preLogoImageUrl" v-if="upload.preLogoImageUrl" class="avatar">
																<i v-else class="el-icon-plus avatar-uploader-icon"></i>
															</el-upload>
														</el-form-item>
														<el-form-item label="Icon">
															<el-upload :before-upload="encodeIconFileAsURL" class="avatar-uploader" :show-file-list="false">
																<img :src="upload.preIconImageUrl" v-if="upload.preIconImageUrl" class="avatar">
																<i v-else class="el-icon-plus avatar-uploader-icon"></i>
															</el-upload>
														</el-form-item>
													</el-form>
												</el-main>
												<el-footer style="text-align:right;">
													<el-tooltip content="更新">
														<el-button type="success" icon="fas fa-save fa-fw" @click="companySave">更新</el-button>
													</el-tooltip>
													<el-tooltip content="取消">
														<el-button type="default" @click="closeMe" >取消</el-button>
													</el-tooltip>
												</el-footer>
											</el-container>`,
								created(){
									_.extend(this.form,self.dt.selected);
									this.upload.preLogoImageUrl = this.form.logo;
									this.upload.preIconImageUrl = this.form.icon;
								},
								methods: {
									encodeLogoFileAsURL(file) {
										const me = this;
										
										var reader = new FileReader();

										reader.onloadend = function(){
											me.upload.preLogoImageUrl = reader.result;
											_.extend(me.form, {logo: reader.result});
										}
										reader.readAsDataURL(file);
									},
									encodeIconFileAsURL(file) {
										const me = this;
										
										var reader = new FileReader();

										reader.onloadend = function(){
											me.upload.preIconImageUrl = reader.result;
											_.extend(me.form, {icon: reader.result});
										}
										reader.readAsDataURL(file);
									},
									companySave() {
										const me = this;

										alertify.confirm(`确定要更新该公司信息? <br><br> 
															公司全称：${me.form.fullname}<br><br>
															公司名称：${me.form.name}<br><br>
															应用名称：${me.form.ospace}<br><br>
															标题：${me.form.title}`, function (e) {
											if (e) {
												let rtn = companyHandler.companyUpdate(me.form);
												
												if(rtn == 1){
													self.initData();
												}
												
												me.$message({
													type: "info",
													message: "更新操作将提交至后台，请稍后刷新确认。。。"
												});

												wnd.close();
											} else {
												
											}
										});
									},
									closeMe(){
										wnd.close();
									}
								}
							};

							new Vue(main).$mount(`#${rId}`);
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
										config: null,
									},
									upload: {
										preLogoImageUrl: '',
										preIconImageUrl: ''
									}
								},
								template: 	`<el-container style="height:100%;">
												<el-main>
													<el-form ref="form" :model="form" label-width="120px">
														<el-form-item label="公司全称(fullname)">
															<el-input v-model="form.fullname" placeholder="公司全称" clearable></el-input>
														</el-form-item>
														<el-form-item label="名称(name)">
															<el-input v-model="form.name" placeholder="公司简称" clearable></el-input>
														</el-form-item>
														<el-form-item label="应用(ospace)">
															<el-input v-model="form.ospace" placeholder="应用" clearable></el-input>
														</el-form-item>
														<el-form-item label="网站">
															<el-input v-model="form.web" placeholder="公司网站" clearable></el-input>
														</el-form-item>
														<el-form-item label="标题">
															<el-input v-model="form.title" placeholder="标题" clearable></el-input>
														</el-form-item>
														<el-form-item label="配置">
															<el-input type="textarea" v-model="form.config" placeholder="集群配置"></el-input>
														</el-form-item>
														<el-form-item label="Logo">
															<el-upload :before-upload="encodeLogoFileAsURL" class="avatar-uploader" :show-file-list="false">
																<img :src="upload.preLogoImageUrl" v-if="upload.preLogoImageUrl" class="avatar">
																<i v-else class="el-icon-plus avatar-uploader-icon"></i>
															</el-upload>
														</el-form-item>
														<el-form-item label="Icon">
															<el-upload :before-upload="encodeIconFileAsURL" class="avatar-uploader" :show-file-list="false">
																<img :src="upload.preIconImageUrl" v-if="upload.preIconImageUrl" class="avatar">
																<i v-else class="el-icon-plus avatar-uploader-icon"></i>
															</el-upload>
														</el-form-item>
													</el-form>
												</el-main>
												<el-footer style="text-align:right;line-height: 60px;">
													<el-tooltip content="创建">
														<el-button type="success" icon="fas fa-save fa-fw" @click="companySave">创建</el-button>
													</el-tooltip>
													<el-tooltip content="取消">
														<el-button type="default" @click="closeMe" >取消</el-button>
													</el-tooltip>
												</el-footer>
											</el-container>`,
								methods: {
									encodeLogoFileAsURL(file) {
										const me = this;
										
										var reader = new FileReader();

										reader.onloadend = function(){
											me.upload.preLogoImageUrl = reader.result;
											_.extend(me.form, {logo: reader.result});
										}
										reader.readAsDataURL(file);
									},
									encodeIconFileAsURL(file) {
										const me = this;
										
										var reader = new FileReader();

										reader.onloadend = function(){
											me.upload.preIconImageUrl = reader.result;
											_.extend(me.form, {icon: reader.result});
										}
										reader.readAsDataURL(file);
									},
									companySave() {
										const me = this;
										
										alertify.confirm(`确定要新建该公司? <br><br> 
															公司全称：${me.form.fullname}<br><br>
															公司名称：${me.form.name}<br><br>
															应用名称：${me.form.ospace}<br><br>
															标题：${me.form.title}`, function (e) {
											if (e) {
												let rtn = companyHandler.companyNew(me.form);
												
												me.$message({
													type: "info",
													message: "新建操作将提交至后台，请稍后刷新确认。。。"
												});

												if(rtn == 1){
													self.initData();
												}
												
												wnd.close();
											} else {
												
											}
										});
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

							if(self.dt.selected.ospace === 'matrix' || self.dt.selected.name === 'wecise' ){
								self.$message({
									message: "系统账户，不可以删除！",
									type: 'error'});
								return false;
							} 

							alertify.confirm(`确定要删除该公司? <br><br> 
												公司全称：${self.dt.selected.fullname}<br><br>
												公司名称：${self.dt.selected.name}<br><br>
												应用名称：${self.dt.selected.ospace}<br><br>
												标题：${self.dt.selected.title}`, function (e) {
								if (e) {
									let rtn = companyHandler.companyDelete(self.dt.selected.name);
									self.$message({
										type: "info",
										message: "删除操作将提交至后台，请稍后刷新确认。。。"
									});
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
					template: 	`<el-container style="height:100%;background:#f9f9f9;">
									<el-aside style="width:260px;height:100%;" ref="leftView">
										<user-tree-component></user-tree-component>
									</el-aside>
									<el-container style="height:100%;background:#ffffff;" ref="mainView">
										<el-main>
											<el-header style="line-height:40px;height:40px;">
												<span style="font-size:16px;">用户信息</span>
												<span style="float: right; font-size: 12px">
													<el-tooltip content="用户信息更新">
														<el-button type="text" @click="saveUserData" icon="el-icon-edit">保存</el-button>
													</el-tooltip>
												</span>
											</el-header>
									
											<el-main style="padding:10px;">
												<el-row>
													<el-col :span="24">
														<bootstrap-table id="userTable" :columns="model.columns" :options="model.options" :data="model.data"></bootstrap-table>
													</el-col>
												</el-row>
												<el-divider></el-divider>
												<span style="font-size:16px;">权限管理</span>
												<el-row>
													<el-col :span="24">
														<el-tabs v-model="permission.activeIndex" class="grid-content" type="border-card">
															<el-tab-pane label="按对象授权" name="byObject">
																<el-container style="height: calc(100vh - 360px);">
																	<el-aside>
																		<byobject-tree-component :zNodes="byObjectTreeNodes"></byobject-tree-component>      
																	</el-aside>
																	<el-main>
																		<bootstrap-table id="byObjectTable" :columns="byObjectTreeModel.columns" :options="byObjectTreeModel.options" :data="byObjectTreeModel.data"></bootstrap-table>    
																	</el-main>
																</el-container>  
															</el-tab-pane>
															<el-tab-pane label="按属性授权" name="byProperty">
																<el-container>
																	<el-aside>
																		<byProperty-tree-component :zNodes="byPropertyTreeNodes"></byProperty-tree-component>
																	</el-aside>
																	<el-main style="padding:0px 0px 0px 10px;">
																		<bootstrap-table id="byPropertyTable" :columns="byPropertyTreeModel.columns" :options="byPropertyTreeModel.options" :data="byPropertyTreeModel.data"></bootstrap-table>
																	</el-main>
																</el-container>  
															</el-tab-pane>
														</el-tabs>
													</el-col>
												</el-row>
											</el-main>
										</el-main>
									</el-container>
								</el-container>`,
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
					created(){
						
						eventHub.$on('user-table-select',this.loadByClassTreeNodes);
						eventHub.$on("user-tree-click-event", this.loadUserData);
						eventHub.$on("user-remove", this.removeUserData);
						eventHub.$on("byObjectTree-select", this.setByObjectTreeModel)
						eventHub.$on("byPropertyTree-select", this.setByPropertyTreeModel)
					},
					mounted(){
						
						this.$nextTick( ()=> {

							this.model.columns = [
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
							this.model.options = {
								toggle: "table",
								classes: "table table-striped",
								pagination: true,
								pageSize: "15",
								pageList: "[15,30,45,60]",
								clickToSelect: true,
								treeShowField: 'name'
							};

							this.byObjectTreeModel.columns = this.byPropertyTreeModel.columns = [
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
							this.byObjectTreeModel.options =  this.byPropertyTreeModel.options = {
															toggle: "table",
															classes: "table table-striped",
															pagination: true,
															pageSize: "15",
															pageList: "[15,30,45,60]",
														};

							this.split.inst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
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
						loadUserData(event) {
							const self = this;
							let param = "";

							self.selectedNode = event.node;

							let rtn = userHandler.userList(event.node.fullname).message;
							
							self.model.data = rtn;
							self.byObjectTreeNodes = [];
							self.byPropertyTreeNodes = [];
						},
						saveUserData(){
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

				// Grok变量管理
				Vue.component('grok-manage',{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-header style="height:30px;line-height:30px;">
										<h4>解析规则</h4>
									</el-header>
									<el-main style="height:100%;">
										<el-table
											:data="dt.rows"
											stripe
											highlight-current-row
											fit="true"
											style="width: 100%"
											:row-class-name="rowClassName"
											:header-cell-style="headerRender"
											@current-change="onSelectionChange">
											<el-table-column type="index" label="序号" sortable align="center">
												<template slot-scope="scope">
													<div style="width:100%; text-align: center;"> <b> #{scope.$index + 1}# </b> </div>
												</template>
											</el-table-column>
											<!--el-table-column type="selection" align="center">
											</el-table-column--> 
											<el-table-column type="expand">
												<template slot-scope="props">
													<el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f2f3f5;" >
														<el-form-item v-for="v,k in props.row" :label="k">
															<el-input v-model="v"></el-input>
														</el-form-item>
													</el-form>
												</template>
											</el-table-column>
											<el-table-column :prop="item.field" 
												show-overflow-tooltip="true" 
												:label="item.title"
												sortable
												resizable
												v-for="item in dt.columns"
												min-width="180">
												<template slot-scope="scope" >
													<span v-if="_.includes(['logo','icon'],item.field)">
														<el-avatar shape="circle" size="48" :src="scope.row[item.field]"></el-avatar>
													</span>
													<span  v-else>#{scope.row[item.field]}#</el-avatar>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
								</el-container>`,
					data(){
						return {
							dt:{
								rows: [],
								columns: [],
								selected: []
							}
						}
					},
					created(){
						this.initData();
					},
					mounted(){
						
					},
					methods: {
						rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0) {
                                //return 'text-align:center;';
                            }
						},
						onSelectionChange(val) {
							this.dt.selected = val;
						},
						initData(){

							this.dt.columns = [
								{field:"name",title:"名称", width:120},
								{field:"pattern",title:"规则"},
								{field:"eg",title:"举例", width:120}
							];

							try {
								// rows
								_.extend(this.dt, {rows: grokHandler.grokList().message});

								_.map(this.dt.columns,(v)=>{
									if(!v.render){
										return v;
									} else {
										return _.extend(v,{render: eval(v.render) });;
									}
								})

							} catch(err){
								
							}
						}
					}
				})

				// 应用管理
				Vue.component('tools-manage',{
					delimiters: ['#{', '}#'],
					template: 	`<el-tabs type="border-card">
									<el-tab-pane>
										<span slot="label"><i class="el-icon-date"></i> 应用</span>
										<div class="block__list_words">  
											<el-button type="default" 
												style="width: auto;height:auto;padding: 10px 30px;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);background:rgb(81, 123, 160);"
												v-for="(item,index) in model.list"
												:key="index">
												<el-image style="width:64px;height:64px;margin:5px;" :src="item.icon | pickIcon"></el-image>
												<p style="color:#fff;">#{item.cnname}#</p>
												<p class="tools-manage">
													<el-collapse accordion="true">
														<el-collapse-item>
															<div style="padding:10px;">
																<el-form ref="form" :model="item" label-width="80px" >
																	<el-form-item label="中文名">
																		<el-input v-model="item.cnname"></el-input>
																	</el-form-item>
																	<el-form-item label="英文名称">
																		<el-input v-model="item.enname"></el-input>
																	</el-form-item>
																	<el-form-item label="Url">
																		<el-input v-model="item.url">
																			
																		</el-input>
																	</el-form-item>
																	<el-form-item label="图标">
																		<el-input v-model="item.icon"></el-input>
																	</el-form-item>
																	<el-form-item label="Target">
																		<el-radio-group v-model="item.target">
																			<el-radio label="_blank">打开新窗口</el-radio>
																			<el-radio label="_parent">当前窗口打开</el-radio>
																		</el-radio-group>
																	</el-form-item>
																	<el-form-item label="分组">
																		<el-radio-group v-model="item.groups.group">
																			#{item.groups.group}#
																			<el-radio :label="item.name" v-for="item in model.groups">#{item.title}#</el-radio>
																		</el-radio-group>
																	</el-form-item>
																	<el-form-item>
																		<el-button type="primary" @click="update(item)">发布</el-button>
																		<el-button type="danger" @click="remove(item.name)">删除</el-button>
																	</el-form-item>
																</el-form> 
															</div>
														</el-collapse-item>
													</el-collapse>
												</p>
											</el-button>  
										</div>
									</el-tab-pane>
									<el-tab-pane label="tools-list">
										<span slot="label"><i class="el-icon-date"></i> 发布</span>
										<el-form ref="form" :model="form" label-width="80px">
											<el-form-item label="中文名">
												<el-input v-model="form.cnname"></el-input>
											</el-form-item>
											<el-form-item label="英文名称">
												<el-input v-model="form.enname"></el-input>
											</el-form-item>
											<el-form-item label="Url">
												<el-input v-model="form.url">

												</el-input>
											</el-form-item>
											<el-form-item label="图标">
												<el-input v-model="form.icon"></el-input>
											</el-form-item>
											<el-form-item label="Target">
												<el-radio-group v-model="form.target">
													<el-radio label="_blank">打开新窗口</el-radio>
													<el-radio label="_parent">当前窗口打开</el-radio>
												</el-radio-group>
											</el-form-item>
											<el-form-item label="分组">
												<el-radio-group v-model="form.groups.group">
													<el-radio :label="item.name" v-for="item in model.groups">#{item.title}#</el-radio>
												</el-radio-group>
											</el-form-item>
											<el-form-item>
												<el-button type="primary" @click="add">发布</el-button>
												<el-button type="defult">取消</el-button>
											</el-form-item>
										</el-form> 
									</el-tab-pane>
								</el-tabs>`,
					data(){
						return {
							form: {
								cnname: "",
								enname: "",
								url: "",
								icon: "",
								target: "_blank",
								selected: 1,
								groups: {"group":"application"}
							},
							model: null,
							isDragging: false,
							delayedDragging:false,
							layout:{
								tabs: [],
								activeIndex: ''
							}
						}
					},
					mounted() {
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
						init(){
							const self = this;
							self.model = fsHandler.callFsJScript("/matrix/apps/appList.js",null).message;
						},
						add(){
							const self = this;

							let rtn = fsHandler.callFsJScript("/matrix/apps/app.js",encodeURIComponent(JSON.stringify(self.form)));
							if( _.lowerCase(rtn.status) == "ok"){
								self.$message({
									type: "info",
									message: "应用发布成功"
								});
								
								eventHub.$emit("APP-REFRESH-EVENT");

								$("ul.nav").find("li>a[title='应用']").popover({
									container: "body",
									title: "",
									content: `${self.form.cnname} 应用发布成功！`
								}).popover('show');

								_.delay(function(){
									$("ul.nav").find("li>a[data-original-title='应用']").popover('destroy');
								},8000)

								self.resetForm();
							}

						},
						update(item){

							const self = this;

							let rtn = fsHandler.callFsJScript("/matrix/apps/app.js",encodeURIComponent(JSON.stringify(item)));
							if( _.lowerCase(rtn.status) == "ok"){
								self.$message({
									type: "info",
									message: "应用更新成功"
								});
								
								eventHub.$emit("APP-REFRESH-EVENT");

								$("ul.nav").find("li>a[title='应用']").popover({
									container: "body",
									title: "",
									content: `${item.cnname} 应用更新成功！`
								}).popover('show');

								_.delay(function(){
									$("ul.nav").find("li>a[data-original-title='应用']").popover('destroy');
								},8000)

								self.hide(item.name);
								self.resetForm();
							}
						},
						remove(event) {
							
							alertify.confirm(`确定要删除？<br><br> ${event}`, (e)=> {
								if (e) {
									let _mql = `delete from /matrix/portal/tools where name='${event}'`;
									let rtn = omdbHandler.fetchDataByMql(_mql);
									if(rtn.status === 'ok'){
										this.init();
									} else {
										this.$message({
											type: "error",
											message: rtn.message
										})
									}
								} else {
									
								}
							});

						},
						resetForm(){
							_.extend(this.form, {
								cnname: "",
								enname: "",
								url: "",
								icon: "",
								target: "_blank",
								selected: 1,
								groups: "application"
							});
						},
						hide(name){
							$("#collapse"+name).collapse('hide');
						}

					}
				})

				// 日历管理
				Vue.component('calendar-manage',{
					delimiters: ['${', '}'],
					template: '<el-calendar v-model="value"></el-calendar>',
					data () {
						return {
							value: new Date(),
							event: []
						}
					},
					mounted(){
						const self = this;

						self.$nextTick(function(){
							
						})
					},
					methods: {
						init(){
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
										self.look('itsm', '/matrix/event');
									}
								},
								"performance": {
									name: "性能", icon: "fa-line-chart",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										self.look('itsm', '/matrix/performance');
									}
								},
								"log": {
									name: "日志", icon: "fa-file-code-o",
									callback: function (itemKey, opt, rootMenu, originalEvent) {
										self.look('itsm', '/matrix/log');
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
						load () {
							const self = this;

							self.event = omdbHandler.fetchData('#/matrix/system/calendar/: | top 200');
						}
					}
				})

				let main = {
					template: `<el-container style="background-color:#ffffff;height: calc(100vh - 85px);">
									<el-aside style="width:unset;" ref="leftView">
										<el-menu
											:default-active="currentView"
											@select="toggleView"
											:collapse="ifCollapse"
											style="height:100%;"
											class="system-manage-menu">
											<el-menu-item index="company-manage" v-if="window.COMPANY_NAME=='wecise' && window.SignedUser_IsAdmin==true">
												<i class="el-icon-office-building"></i>
												<span slot="title">公司管理</span>
											</el-menu-item>
											<el-menu-item index="user-manage">
												<i class="el-icon-user"></i>
												<span slot="title">用户和权限</span>
											</el-menu-item>
											<el-menu-item index="notify-manage">
												<i class="el-icon-bell"></i>
												<span slot="title">通知管理</span>
											</el-menu-item>
											<el-menu-item index="grok-manage">
												<i class="el-icon-finished"></i>
												<span slot="title">解析规则</span>
											</el-menu-item>
											<el-menu-item index="calendar-manage">
												<i class="el-icon-alarm-clock"></i>
												<span slot="title">日历管理</span>
											</el-menu-item>
											<el-menu-item index="tools-manage">
												<i class="el-icon-menu"></i>
												<span slot="title">应用管理</span>
											</el-menu-item>
											<el-menu-item index="severity-manage">
												<i class="el-icon-warning"></i>
												<span slot="title">级别管理</span>
											</el-menu-item>
											<el-menu-item index="event-manage">
												<i class="el-icon-s-opportunity"></i>
												<span slot="title">事件处理</span>
											</el-menu-item>
										</el-menu>
									</el-aside>
									<el-main style="padding:0px;" ref="mainView">
										<component v-bind:is="currentView" transition="fade" transition-mode="out-in"></component>
									</el-main>
								</el-container>  `,
					data: {
						currentView: 'company-manage',
						configTreeNodes: {},
						rulesTreeNodes: {},
						notifyTreeNodes: {},
						maintainTreeNodes: {},
						split: {
							inst: null
						},
						ifCollapse:true
					},
					created(){

						// 预设应用
						try{
							if(mx.urlParams['preset']){
								let preset = _.attempt(JSON.parse.bind(null, decodeURIComponent(mx.urlParams['preset'])));
								this.currentView = preset.view;
							}
						} catch(err){

						}
						
					},
					mounted(){
						
						this.$nextTick(()=>{
							var name = `{{.SignedUser.IsAdmin}}`;
							var ospace = `{{.SignedUser.Company.OSpace}}`;

							if(name && ospace=='matrix'){
								this.loadTreeData('/','configTreeNodes');
							} else {
								this.loadTreeData('/'+ospace,'configTreeNodes');
							}
							this.loadTreeData('/matrix/probes', 'rulesTreeNodes');
							
							this.initNotifyTreeNodes();
							this.initMaintainTreeNodes();

							// this.split.inst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                            //     sizes: [15, 85],
                            //     minSize: [0, 0],
                            //     gutterSize: 5,
                            //     gutterAlign: 'end',
                            //     cursor: 'col-resize',
                            //     direction: 'horizontal',
                            //     expandToMin: true,
                            // });
						})
					},
					methods: {
						toggleView(key,keyPath) {
							if(key == 'toggle'){
								this.ifCollapse = !this.ifCollapse;
							}else {
								this.currentView = key;
							}
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