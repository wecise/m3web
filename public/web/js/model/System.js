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

		VueLoader.onloaded(["ai-robot-component",
							"mx-tag",
							"mx-tag-tree"
							],function() {

			$(function() {
				
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
													<el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f2f2f2;" >
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
													<el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f2f2f2;" >
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
											<el-table-column label="操作" width="130" fixed="right">
												<template slot-scope="scope">
													<div>
														<el-tooltip content="更新公司信息" open-delay="500" placement="top">
															<el-button type="text" icon="el-icon-edit" @click="onCompanyUpdate(scope.row)"></el-button>
														</el-tooltip>
														<el-tooltip content="删除公司信息" open-delay="500" placement="top">
															<el-button type="text" icon="el-icon-delete" @click="onCompanyDelete(scope.row)"></el-button>
														</el-tooltip>
													</div>
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
						onCompanyUpdate(row){
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
									_.extend(this.form, row);
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

										if(_.isEmpty(me.form.title)){
											
											this.$message({
												type: "warning",
												message: "标题不可为空！"
											})
											return false;
										}

										const h = this.$createElement;
										this.$msgbox({
												title: `确定要更新该公司信息`, 
												message: h('span', null, [
													h('p', null, `公司全称：${me.form.fullname}`),
													h('p', null, `公司名称：${me.form.name}`),
													h('p', null, `应用名称：${me.form.ospace}`),
													h('p', null, `标题：${me.form.title}`)
												]),
												showCancelButton: true,
												confirmButtonText: '确定',
												cancelButtonText: '取消',
												type: 'warning'
										}).then(() => {

											let rtn = companyHandler.companyUpdate(me.form);
												
											if(rtn == 1){
												self.initData();
											}
											
											me.$message({
												type: "info",
												message: "更新操作将提交至后台，请稍后刷新确认。。。"
											});

											wnd.close();

										}).catch(() => {
												
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
						onCompanyDelete(row) {
							const self = this;

							if(row.ospace === 'matrix' || row.name === 'wecise' ){
								self.$message({
									message: "系统账户，不可以删除！",
									type: 'error'});
								return false;
							} 

							const h = this.$createElement;
							this.$msgbox({
									title: `确定要删除该公司`, 
									message: h('span', null, [
										h('p', null, `公司全称：${row.fullname}`),
										h('p', null, `公司名称：${row.name}`),
										h('p', null, `应用名称：${row.ospace}`),
										h('p', null, `标题：${row.title}`)
									]),
									showCancelButton: true,
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									type: 'warning'
							}).then(() => {

								let rtn = companyHandler.companyDelete(row.name);
								self.$message({
									type: "info",
									message: "删除操作将提交至后台，请稍后刷新确认。。。"
								});
								if(rtn == 1){
									self.initData();
								}

							}).catch(() => {
									
							}); 
							
						},
						updateFs(){

						}
					}
					
				})

				/* * * * * * * * * * * * * * *  用户、权限管理 * * * * * * * * * * * * * * * * * * * * * * * * * * * *  */

				// ldap组织、人员管理
				Vue.component("ldap-manage",{
					delimiters: ['#{', '}#'],
					props:{
						root:String
					},
					data(){
						return {
							defaultProps: {
								children: 'children',
								label: 'username'
							},
							nodes: [],
							selectedNode: null,
							dialog: {
								group: {
									show: false,
									parent: "", 
									username: "",
									passwd: "",
									isactive: true,
									isadmin: false,
									otype: 'org' 
								},
								user: {
									show: false,
									ldap: {
										parent: "", 
										username: "",
										passwd: "",
										isactive: true,
										isadmin: false,
										otype: 'usr'                     
									},
									email: "",
									checkPass: "",
									loading: false
								}
							}
						}
					},
					template: 	`<el-container style="height:100%;">
									<el-main style="padding:0px;">
										<el-tree 
											node-key="fullname"
											default-expand-all
											highlight-current
											:data="nodes" 
											:props="defaultProps" 
											:expand-on-click-node="false"
											@node-click="onNodeClick"
											@node-expand="onNodeExpand"
											style="background: transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
												<span v-if="data.otype=='org'">
													<span class="el-icon-school" style="color:#FF9800;"></span>
													<span>#{node.label}#</span>
													<el-button v-show="data.show" type="text" @click="onDeleteUser(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete" v-if="!_.includes(['/system','/'],data.fullname)"></el-button>
													<el-button v-show="data.show" type="text" @click="onNewUser(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-plus"></el-button>
													<el-button v-show="data.show" type="text" @click="onNewGroup(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-folder-add"></el-button>
													<el-button v-show="data.show" type="text" @click="onRefresh(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-refresh"></el-button>
												</span>
												<span v-else>
													<span class="el-icon-user" style="color:#67c23a;"></span>
													<span>#{node.label}#</span>
													<el-button v-show="data.show" type="text" @click="onDeleteUser(data,$event)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete" v-if="data.username != 'admin'"></el-button>
												</span>
											</span>                  
										</el-tree>
										<el-dialog title="新建组织" :visible.sync="dialog.group.show" v-if="dialog.group.show">
											<el-container>
												<el-main>
													<el-form ref="form" label-width="80px" size="mini">

														<el-form-item label="父组织名称">
															<el-input v-model="dialog.group.parent" disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="组织名称">
															<el-input v-model="dialog.group.username" autofocus></el-input>
														</el-form-item>
														
													</form>
												</el-main>
											</el-container>
											<div slot="footer" class="dialog-footer">
												<el-button type="default" @click="dialog.group.show = false;">关闭</el-button>
												<el-button type="primary" icon="el-icon-" @click="onSaveGroup">创建组</el-button>
											</div>
										</el-dialog>
										<el-dialog title="新建用户" :visible.sync="dialog.user.show" v-if="dialog.user.show">
											<el-container>
												<el-main>
													<el-form ref="newUserForm" label-width="80px">

														<el-form-item label="组织名称">
															<el-input v-model="dialog.user.ldap.parent" autofocus disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="用户名">
															<el-input v-model="dialog.user.ldap.username" autofocus autocomplete="off"></el-input>
														</el-form-item>

														<el-form-item label="邮箱"
																	:rules="[
																	{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
																	]">
															<el-input v-model="dialog.user.email"></el-input>
														</el-form-item>

														<el-form-item label="密码">
															<el-input type="password" v-model="dialog.user.ldap.passwd" autocomplete="off" show-password></el-input>
														</el-form-item>
														
														<el-form-item label="确认密码">
															<el-input type="password" v-model="dialog.user.checkPass" autocomplete="off" show-password></el-input>
														</el-form-item>

														<el-form-item label="激活">
															<el-switch v-model="dialog.user.ldap.isactive" true-value="true" false-value="false"></el-switch>
														</el-form-item>
														
													</form>
												</el-main>
											</el-container>
											<div slot="footer" class="dialog-footer">
												<el-button type="default" @click="dialog.user.show = false;">关闭</el-button>
												<el-button type="warning" v-if="dialog.user.loading"><i class="el-icon-loading"></i> 创建用户、同步文件系统，请稍后。。。</el-button>
												<el-button type="primary" @click="onSaveUser" v-else>创建用户</el-button>
											</div>
										</el-dialog>
									</el-main>
								</el-container>`,
					created(){
						this.initNodes();
					},
					methods:{
						onRefresh(data,event){
							//event.stopPropagation();
							this.initNodes();
						},
						initNodes() {
							const self = this;

							var users = function(parent) {

								var data = userHandler.userList(parent).message;
								var itemArr = [];

								_.forEach(data,(v)=>{
									if(v.parent){
										if( parent === v.parent ) {
											itemArr.push( _.extend(v,{children: users(v.fullname), show:false }) );
										}
									}
									
								})
								
								return _.sortBy(itemArr,'fullname');
							};

							this.nodes = [];
							this.nodes.push( {id:0, parent:null, fullname: this.root, name: '/', username: window.COMPANY_FULLNAME, otype:'org', children: users(this.root), show:false } );

						},
						onNodeClick(node){
							this.$emit('update:selectedNode', node);
						},
						onNodeExpand(node){
							
						},
						onMouseEnter(data){
							this.$set(data, 'show', true)
						},
						onMouseLeave(data){
							this.$set(data, 'show', false)
						},
						onDeleteUser(data,event){

							if(data.fullname === '/system'){
								this.$message({
									type: "warning",
									message: "系统组，禁止删除！"
								})
								return false;
							}
							if(data.fullname === '/system/admin'){
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
                                
                                if(rtn == 1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除成功!'
									});
									
									_.delay(()=>{
										// 更新Ldap树
										this.initNodes();
										// 更新Ldap列表
										this.$parent.$parent.onLoadUser("");

									},1000)
									
                                } else {
									this.$message({
                                        type: 'error',
                                        message: '删除失败: ' + rtn
                                    });
								}
                            }).catch(() => {
                                
                            });
							
						},
						onNewUser(row,event){
							this.selectedNode = row;
							this.dialog.user.show = true;
							this.dialog.user.ldap.parent = !_.isEmpty(row.fullname) ? row.fullname : '/';
							this.$nextTick(() => {
								this.dialog.user.ldap.username = "";
								this.dialog.user.ldap.passwd = "";
								this.dialog.user.ldap.isactive = true;
								this.dialog.user.ldap.isadmin = false;
								this.dialog.user.ldap.otype = 'usr';
								this.dialog.user.email = "";
								this.dialog.user.checkPass = "";
							})
						},
						onNewGroup(row,event){
							this.selectedNode = row;
							this.dialog.group.show = true;
							this.dialog.group.parent = !_.isEmpty(row.fullname) ? row.fullname : '/';
						},
						onSaveGroup(){
							
							if (_.isEmpty(this.dialog.group.parent)) {
								this.$message({
									type: 'warning',
									message: '所属组名称不能为空！!'
								});
								return false;
							}

							if (_.isEmpty(this.dialog.group.username)) {
								this.$message({
									type: 'warning',
									message: '组名称不能为空！'
								});
								return false;
							}

							let _csrf = window.CsrfToken.replace(/'/g,"");
							let rtn = userHandler.userAdd(this.dialog.group, _csrf);

							if(rtn==1){
								this.$message({
									type: 'success',
									message: `组: ${this.dialog.group.parent} 添加成功！`
								});
								
								_.delay(()=>{
									this.onRefresh(this.selectedNode,event);
									eventHub.$emit('user-tree-refresh-event', null);
									this.dialog.group.show = false;
								},500);

							}

							
						},
						onSaveUser(){
										
							if (_.isEmpty(this.dialog.user.ldap.username)) {
								
								this.$message({
									type: "warning",
									message: `名称不能为空！`
								})
								return false;
							}

							if (_.isEmpty(this.dialog.user.email)) {
								this.$message({
									type: "warning",
									message: `邮件不能为空！`
								})
								return false;
							}

							if (_.isEmpty(this.dialog.user.ldap.passwd)) {
								this.$message({
									type: "warning",
									message: `密码不能为空！`
								})
								return false;
							}

							if (_.isEmpty(this.dialog.user.checkPass)) {
								this.$message({
									type: "warning",
									message: `确认密码不能为空！`
								})
								return false;
							}

							if ( this.dialog.user.ldap.passwd !== this.dialog.user.checkPass) {
								this.$message({
									type: "warning",
									message: `确认密码不一致！`
								})
								return false;
							}

							this.$set(this.dialog.user.ldap,'email',this.dialog.user.email.split(","));

							this.dialog.user.loading = true;

							_.delay(()=>{
								
								let _csrf = window.CsrfToken.replace(/'/g,"");
								let rtn = userHandler.userAdd(this.dialog.user.ldap, _csrf);

								if(rtn == 1){
									
									this.$message({
										type: "success",
										message: `用户: ${this.dialog.user.ldap.username} ${this.dialog.user.email} 添加成功！`
									})
									
									this.dialog.user.loading = false;

									_.delay(()=>{
										this.initNodes;
										this.onRefresh(this.selectedNode,event);
										this.dialog.user.show = false;
									},500);

								} else {
									this.$message({
										type: "error",
										message: `用户: ${this.dialog.user.ldap.username} ${this.dialog.user.email} 添加失败 ` + rtn
									})
									
									this.dialog.user.loading = false;
								}
							},500)

						}
					}
				})

				// ldap组织、人员管理 选择使用
				Vue.component("ldap-manage-select",{
					delimiters: ['#{', '}#'],
					props:{
						rowData: Object,
						root:String
					},
					data(){
						return {
							defaultProps: {
								children: 'children',
								label: 'username'
							},
							nodes: [],
							selectedNodes: []
						}
					},
					template: 	`<el-container style="height:100%;background:#f2f2f2;">
									<el-main style="">
										<el-tree 
											node-key="fullname"
											default-expand-all
											highlight-current
											:data="nodes" 
											:props="defaultProps" 
											:default-checked-keys="selectedNodes"
											:expand-on-click-node="false"
											:check-on-click-node="false"
											@check-change="onCheckChange"
											show-checkbox
											style="background: transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;">
												<span v-if="data.otype=='org'">
													<span class="el-icon-school" style="color:#FF9800;"></span>
													<span>#{node.label}#</span>
												</span>
												<span v-else>
													<span class="el-icon-user" style="color:#67c23a;"></span>
													<span>#{node.label}#</span>
												</span>
											</span>                  
										</el-tree>
									</el-main>
								</el-container>`,
					created(){
						this.initNodes();
					},
					methods:{
						initNodes() {
							const self = this;

							var users = function(parent) {

								var data = userHandler.userList(parent).message;
								var itemArr = [];

								_.forEach(data,(v)=>{
									if(v.parent){
										if( parent === v.parent ) {
											let disabled = false;

											// 禁止admin权限操作
											if(v.fullname == '/admin'){
												disabled = true;
											}

											// LDAP 当前组织不能删除
											if(self.rowData.isldap && (v.fullname == self.rowData.fullname)){
												disabled = true;
											}

											// 同步组织 且 O 类型 不能选择操作
											if( self.rowData.isldap && _.startsWith(v.fullname, self.rowData.fullname+"/") ) {
												disabled = true;
											}

											itemArr.push( _.extend(v,{children: users(v.fullname), show:false, disabled:disabled }) );
										}
									}
									
								})
								
								return _.sortBy(itemArr,'fullname');
							};

							this.nodes = [];
							this.nodes.push( {id:0, parent:null, fullname: this.root, name: '/', username: window.COMPANY_FULLNAME, otype:'org', children: users(this.root), show:false } );

							// 设置已选择项
							this.selectedNodes = _.map(this.rowData.member,(v)=>{
								return v.replace(/['U','G','O']/g,'');
							})

						},
						onCheckChange(data, checked, indeterminate){
							
							try{
								// 设置复选框状态
								let selectedNodes = [];

								if(checked){
									if(!_.isEmpty(data.fullname)){
										this.$set(data, 'checked', true);
									}
								} else {
									this.$set(data, 'checked', false);
								}

								// 更新
								if(_.isEmpty(data.fullname)) {
									return false;
								}

								selectedNodes.push(data);
								
								this.$emit('update:selectedLdap', selectedNodes);
							} catch(err){
								console.log(err)
							}
						}
					}
				})

				// tagdir选择树
				Vue.component("tagdir-select",{
					delimiters: ['#{', '}#'],
					props: {
						model: Object,
						rowData: Object
					},
					data(){
						return {
							defaultProps: {
								children: 'nodes',
								label: 'name'
							},
							nodes: [],
							defaultExpandedKeys: [""],
							selectedKeys: [],
							selectedNodes: []
						}
					},
					template: `<el-container>
									<el-main style="height: 100%;background:#f2f2f2;">
										<el-tree 
											node-key="id"
											show-checkbox
											highlight-current="true"
											:default-expand-all="false"
											:default-expanded-keys="defaultExpandedKeys"
											:default-checked-keys="selectedKeys"
											:expand-on-click-node="false"
											:check-on-click-node="false"
											@node-click="onNodeClick"
											:data="nodes" 
											:props="defaultProps" 
											@check-change="onCheckChange"
											style="background: transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
												<span class="el-icon-price-tag" style="color: #f8a502;font-size: 14px;"></span>
												<span v-if="_.isEmpty(data.name)">
													<span>#{data.domain}#</span>
													<el-checkbox-group v-model="data.perms" style="float: right;padding-right: 10px;" v-if="data.checked">
														<el-checkbox label="add">添加</el-checkbox>
														<el-checkbox label="delete">删除</el-checkbox>
														<el-checkbox label="edit">编辑</el-checkbox>
														<el-checkbox label="list">查询</el-checkbox>
													</el-checkbox-group>
												</span>
												<span v-else>
													<span>#{node.label}#</span>
													<el-checkbox-group v-model="data.perms" style="float: right;padding-right: 10px;" v-if="data.checked">
														<el-checkbox label="add">添加</el-checkbox>
														<el-checkbox label="delete">删除</el-checkbox>
														<el-checkbox label="edit">编辑</el-checkbox>
														<el-checkbox label="list">查询</el-checkbox>
													</el-checkbox-group>
												</span>
											</span>                  
										</el-tree>
									</el-main>
									<el-footer style="text-align:right;line-height:60px;">
										<el-button type="default" @click="rowData.show = false;">取消</el-button>
										<el-button type="primary" @click="onUpdateRoleGroupByTag">更新标签权限</el-button>
									</el-footer>
								</el-container>`,
					created(){
						this.loadNodes();
					},
					methods:{
						loadNodes(){
							this.nodes = fsHandler.callFsJScript(`${['/matrix'+this.model.parent,this.model.name].join("/")}`).message;
							_.delay(()=>{
								this.onSetSelected();
							},50)
						},
						onSetSelected(){
							
							try{
								let stags = fsHandler.callFsJScript("/matrix/system/getStagsById.js", this.rowData.row.id).message;
								console.log(22,stags)
								_.forEach(stags,(v,k)=>{
									let perms = JSON.parse(v);
									_.extend( this.findNodeById(k), { perms: v, checked:true } );
								});
								this.selectedKeys = _.keys(stags);


							} catch(err){
								console.log(err)
							}
						},
						findNodeById(id){
							let rtn = null;

							let find = function(nodes){
								_.forEach(nodes,(v)=>{
									
									if(v.id == id){
										rtn = v;
									}

									if(v.nodes){
										find(v.nodes)
									}
								})	
							} 

							find(this.nodes);

							return rtn;
						},
						onMouseEnter(data){
							this.$set(data, 'show', true)
						},
						onMouseLeave(data){
							this.$set(data, 'show', false)
						},
						onNodeClick(data){
							console.log(data)
						},
						onCheckChange(data, checked, indeterminate){
							
							// 设置复选框状态
							let perms = ['add','delete','edit','list'];

							if(checked){
								if(!_.isEmpty(data.name)){
									this.$set( data, 'checked', true);
									this.$set( data, 'perms', perms );
								}
							} else {
								this.$set( data, 'checked', false);
								//this.$set(data, 'perms', []);
							}

							// 更新
							if(_.isEmpty(data.name)) {
								//return false;
							}

							this.selectedNodes.push( data );

						},
						// 标签授权
						onUpdateRoleGroupByTag(){
							
							// 更新
							let term = encodeURIComponent( JSON.stringify( { roleGroup: [this.rowData.row], data: this.selectedNodes } ) );
							console.log(JSON.stringify( { roleGroup: [this.rowData.row], data: this.selectedNodes } ))
							let rtn = fsHandler.callFsJScript("/matrix/system/updateGroupByTagdir.js", term);
							_.delay(()=>{
								this.$emit('update:selectedTag');
								this.$message({
									type: "success",
									message: "更新标签权限成功！"
								})
							},500)
						}
					}
				})

				// 用户管理
				Vue.component("user-list",{
					delimiters: ['#{', '}#'],
					props: {
						model: Object
					},
					data(){
						return {
							dt:{
								rows:[],
								columns: [],
								selected: [],
								pagination:{
                                    pageSize: 10,
                                    currentPage: 1
                                }
							},
							info: [],
							dialog: {
								user: {
									show: false,
									row: null
								}
							}
						}
					},
					template:   `<el-container style="width:100%;height:100%;">
									<el-header style="height:30px;line-height:30px;">
										<el-tooltip content="切换视图" open-delay="500" placement="top">
											<el-button type="text" icon="el-icon-s-fold" @click="onTogglePanel"></el-button>
										</el-tooltip>
										<el-tooltip content="刷新" open-delay="500" placement="top">
											<el-button type="text" icon="el-icon-refresh" @click="initData"></el-button>
										</el-tooltip>
										<el-tooltip content="导出" delay-time="500">
											<el-dropdown @command="onExport">
												<span class="el-dropdown-link">
													<i class="el-icon-download el-icon--right"></i>
												</span>
												<el-dropdown-menu slot="dropdown">
													<el-dropdown-item command="csv">CSV</el-dropdown-item>
													<el-dropdown-item command="json">JSON</el-dropdown-item>
													<!--el-dropdown-item command="pdf">PDF</el-dropdown-item-->
													<el-dropdown-item command="png">PNG</el-dropdown-item>
													<!--el-dropdown-item command="sql">SQL</el-dropdown-item-->
													<el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
												</el-dropdown-menu>
											</el-dropdown>
										</el-tooltip>
									</el-header>   
									<el-main style="width:100%;padding:0px;">
										<el-table
											:data="dt.rows.slice((dt.pagination.currentPage - 1) * dt.pagination.pageSize,dt.pagination.currentPage * dt.pagination.pageSize)"
											highlight-current-row="true"
											stripe
											style="width: 100%;"
											:row-class-name="rowClassName"
											:header-cell-style="headerRender"
											@row-dblclick="onRowDblclick"
											@row-contextmenu="onRowContextmenu"
											@selection-change="onSelectionChange"
											@current-change="onCurrentChange"
											ref="table">
											<el-table-column type="selection" align="center"></el-table-column> 
											<el-table-column align="center">
												<template slot-scope="scope">
													<i class="el-icon-office-building el-avatar el-avatar--48 el-avatar--circle" style="font-size:32px;color:#03a9f4;" v-if="scope.row.otype==='org'"></i>
													<i class="el-icon-user el-avatar el-avatar--48 el-avatar--circle" style="font-size:32px;color:#03a9f4;" v-else></i>
												</template>
											</el-table-column> 
											<el-table-column
												sortable 
												show-overflow-tooltip
												v-for="(item,index) in dt.columns"
												:key="index"
												:prop="item.field"
												:label="item ? item.title : ''"
												:width="item.width"
												v-if="item.visible">
													<template slot-scope="scope">
														<div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
															v-if="typeof item.render === 'function'">
														</div>
														<div v-else-if="_.includes(['email'],item.field)">
															<el-select :value="_.first(scope.row[item.field]).split(',')" v-if="!_.isEmpty(scope.row[item.field])" placeholder="Email">
																<el-option
																v-for="subItem in scope.row[item.field][0].split(',')"
																:key="subItem"
																:label="subItem"
																:value="subItem">
																</el-option>
															</el-select>
														</div>
														<div v-else>
															#{scope.row[item.field]}#
														</div>
													</template>
											</el-table-column>
											<el-table-column label="操作" width="160">
												<template slot-scope="scope">
													<div v-if="_.includes(['/','system','admin'],scope.row.username)">
														
													</div>
													<div v-else-if="scope.row.otype=='usr'">
														<!--el-tooltip content="授权" open-delay="500" placement="top">
															<el-button type="text" icon="el-icon-s-check" @click="onToogleExpand(scope.row, scope.$index, 'userPermission')"></el-button>
														</el-tooltip-->
														<el-tooltip content="编辑" open-delay="500" placement="top">
															<el-button type="text" icon="el-icon-edit" @click="onUpdateUser(scope.row,scope.$index)"></el-button>
														</el-tooltip>
														<el-tooltip content="删除" open-delay="500" placement="top">
															<el-button type="text" @click="$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.ldapManage.onDeleteUser(scope.row,$event)" icon="el-icon-delete" v-if="!_.includes(['/系统组','/'],scope.row.fullname)"></el-button>
														</el-tooltip>
													</div>
													<div v-else>
														<!--el-tooltip content="授权" open-delay="500" placement="top">
															<el-button type="text" icon="el-icon-s-check" @click="onToogleExpand(scope.row, scope.$index, 'userPermission')"></el-button>
														</el-tooltip-->
														<el-tooltip content="新建组织" open-delay="500" placement="top">
															<el-button type="text" @click="$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.ldapManage.onNewGroup(scope.row,$event)" icon="el-icon-folder-add"></el-button>
														</el-tooltip>
														<el-tooltip content="新建用户" open-delay="500" placement="top">
															<el-button type="text" @click="$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.ldapManage.onNewUser(scope.row,$event)" icon="el-icon-plus"></el-button>
														</el-tooltip>
														<el-tooltip content="编辑" open-delay="500" placement="top">
															<el-button type="text" icon="el-icon-edit"  @click="onUpdateUser(scope.row,scope.$index)"></el-button>
														</el-tooltip>
														<el-tooltip content="删除" open-delay="500" placement="top">
															<el-button type="text" @click="$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.ldapManage.onDeleteUser(scope.row,$event)" icon="el-icon-delete" v-if="!_.includes(['/系统组','/'],scope.row.fullname)"></el-button>
														</el-tooltip>
													</div>
												</template>
											</el-table-column>
										</el-table>
										<el-dialog title="用户编辑" :visible.sync="dialog.user.show" v-if="dialog.user.show">
											<el-container>
												<el-main>
													<el-form label-width="80px">

														<el-form-item label="组名称">
															<el-input v-model="dialog.user.row.parent" autofocus disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="用户名">
															<el-input v-model="dialog.user.row.username" autofocus disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="邮箱">
															<el-input v-model="dialog.user.row.email"></el-input>
														</el-form-item>

														<el-form-item label="密码">
															<el-input type="password" v-model="dialog.user.row.passwd" autocomplete="off" disabled="true" show-password></el-input>
														</el-form-item>
														
														<el-form-item label="激活">
															<el-switch v-model="dialog.user.row.isactive" true-value="true" false-value="false"></el-switch>
														</el-form-item>

													</form>
												</el-main>
											</el-container>
											<div slot="footer" class="dialog-footer">
												<el-button type="default" @click="dialog.user.show = false;">关闭</el-button>
												<el-button type="primary" @click="onSaveUser(dialog.user.row)">更新用户</el-button>	
											</div>
										</el-dialog>
									</el-main>
									<el-footer  style="height:30px;line-height:30px;">
										<!--#{ info.join(' &nbsp; | &nbsp;') }#-->
										<el-pagination
                                            @size-change="onPageSizeChange"
                                            @current-change="onCurrentPageChange"
                                            :page-sizes="[10, 15, 20]"
                                            :page-size="dt.pagination.pageSize"
                                            :total="dt.rows.length"
                                            layout="total, sizes, prev, pager, next">
                                        </el-pagination>
									</el-footer>
								</el-container>`,
					filters:{
						pickDatetime(item){
							return moment(item).format(mx.global.register.format);      
						}
					},
					watch: {
						model: {
							handler(val,oldVal){
								this.initData();
								this.layout();
							},
							deep:true,
							immediate:true
						},
						dt: {
							handler(val,oldVal){
								this.info = [];
								this.info.push(`共 ${this.dt.rows.length} 项`);
								this.info.push(`已选择 ${this.dt.selected.length} 项`);
								this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
							},
							deep:true,
							immediate:true
						}
					},
					methods: {
						onPageSizeChange(val) {
                            console.log(1,val)
                            this.dt.pagination.pageSize = val;
                        },
                        onCurrentPageChange(val) {
                            console.log(2,val)
                            this.dt.pagination.currentPage = val;
                        },
						layout(){
							let doLayout = ()=>{
								if($(".el-table-column--selection",this.$el).is(':visible')){
									_.delay(()=>{
										//this.$refs.table.setCurrentRow(this.dt.rows[0]);
										this.$refs.table.doLayout();
									},1000)
								} else {
									setTimeout(doLayout,50);
								}
							}
							doLayout();
						},
						initData(){
							const self = this;
							
							let init = function(){
								
								try{
									_.extend(self.dt, {columns: _.map(self.model.columns, function(v){
										
										if(_.isUndefined(v.visible)){
											_.extend(v, { visible: true });
										}
		
										if(!v.render){
											return v;
										} else {
											return _.extend(v, { render: eval(v.render) });
										}
										
									})});
		
									_.extend(self.dt, {rows: self.model.rows});
									
								} catch(err){
									console.log(err);
								}
							};
	
							_.delay(()=>{
								init();
							},1000)
							
						},
						rowClassName({row, rowIndex}){
							return `row-${rowIndex}`;
						},
						headerRender({ row, column, rowIndex, columnIndex }){
							if (rowIndex === 0) {
								//return 'text-align:center;';
							}
						},
						onSelectionChange(val) {
							this.dt.selected = [val];
						},
						onCurrentChange(val){
							this.dt.selected = [val];
						},
						onRowContextmenu(row, column, event){
							
						},
						onRowDblclick(row, column, event){
							
						},
						onUpdateUser(row,index){
							this.dialog.user.row = row;
							this.dialog.user.show = true;
						},
						onSaveUser(row){

							this.$confirm(`确认要更新该用户：${row.fullname}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
								
								let _csrf = window.CsrfToken.replace(/'/g,"");
								let rtn = userHandler.userUpdate(row, _csrf);

								if(rtn == 1){
									this.$message({
										type: "success",
										message: `更新用户: ${row.username} 成功！`
									})
									this.dialog.user.show = false;
								}

								this.$set(row, 'email', row.email.split(","));
								this.dt.rows[index] = row;
                                
                            }).catch(() => {
                                
                            });

						},
						onExport(type){
					
							let options = {
								csvEnclosure: '',
								csvSeparator: ', ',
								csvUseBOM: true,
								ignoreColumn: [0,1],
								fileName: `tableExport_${moment().format("YYYY-MM-DD HH:mm:ss")}`,
								type: type,
							};
	
							if(type === 'png'){
								//$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
								$(this.$refs.table.$el.querySelector("table.el-table__body")).tableExport(options);
							} else if(type === 'pdf'){
								_.extend(options, {
									jspdf: {orientation: 'l',
											format: 'a3',
											margins: {left:10, right:10, top:20, bottom:20},
											autotable: {styles: {fillColor: 'inherit', 
																	textColor: 'inherit'},
														tableWidth: 'auto'}
									}
								});
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							} else {
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							}
							
						},
						onTogglePanel(){
							// So bad
							$(this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.leftView.$el).toggle();
						},
						onUpdateRoleGroup(row,roleGroups){
							_.forEach(roleGroups, (v)=>{
								let group = userHandler.getGroupPermissionsById({id:v});
								
								let fullname = group.isldap?`U${row.fullname}`:`G${row.fullname}`
								group.member.push(fullname);
								
								userHandler.updateGroupPermissions(group);
							})
						}
					}
				})

				// App Permission Select
				Vue.component("app-permission",{
					delimiters: ['#{', '}#'],
					props: {
						rowData: Object
					},
					data(){
						return {
							defaultProps: {
								children: 'children',
								label: 'name'
							},
							treeData: [],
							selectedNode: null,
							selectedNodes: [],
							selectedKeys: [],
							filterText: ""
						}
					},
					template:   `<el-container style="height:100%;background:#f2f2f2;">
									<el-aside :width="!_.isEmpty(selectedNode)?'60%':'100%'">
										<el-header style="height:30px;;padding:0px 10px;">
											<!--el-input v-model="filterText" 
												placeholder="搜索" size="mini"
												clearable></el-input-->
											<h4>应用权限</h4>
										</el-header>
										<el-main style="padding:0px 10px; height: 100%;">
											<el-tree :data="treeData" 
													:props="defaultProps" 
													:default-checked-keys="selectedKeys"
													node-key="id"
													highlight-current
													default-expand-all
													auto-expand-parent
													@node-click="onNodeClick"
													@check-change="onCheckChange"
													:expand-on-click-node="false"
													:check-on-click-node="false"
													style="background:transparent;"
													show-checkbox
													ref="tree">
												<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
													<span v-if="data.ftype=='dir'">
														<i class="el-icon-folder" style="color:#FFC107;"></i>
														<span>#{node.label}#</span>
													</span>
													<span v-else>
														<i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i>
														<span>#{node.label}#</span>
														<el-checkbox-group v-model="data.perms" style="float: right;padding-right: 10px;" v-if="data.checked">
															<el-checkbox label="add">添加</el-checkbox>
															<el-checkbox label="delete">删除</el-checkbox>
															<el-checkbox label="edit">编辑</el-checkbox>
															<el-checkbox label="list">查询</el-checkbox>
														</el-checkbox-group>
													</span>
												</span>  
											</el-tree>
										</el-main>
										<el-footer style="text-align:right;line-height:60px;">
											<el-button type="default" @click="rowData.show = false;">取消</el-button>
											<el-button type="primary" @click="onUpdateRoleGroupByApp">更新应用权限</el-button>
										</el-footer>
									</el-aside>
									<el-container v-if="!_.isEmpty(selectedNode)" style="width:40%;">
										<el-header>
											<h4>#{currentAppTitle}#</h4>
										</el-header>
										<el-main style="overflow: hidden;">
											<el-checkbox-group v-model="selectedNode.tags" v-if="!_.isEmpty(selectedNode)">
												<el-checkbox label="add">添加</el-checkbox>
												<el-checkbox label="delete">删除</el-checkbox>
												<el-checkbox label="edit">编辑</el-checkbox>
												<el-checkbox label="list">查询</el-checkbox>
											</el-checkbox-group>
										</el-main>
									</el-container>
								</el-container>`,
					watch: {
						filterText(val) {
							if(_.isEmpty(val)){
								this.onInit();
							} else {
								this.$refs.tree.filter(val);
							}
						}
					},
					computed:{
						currentAppTitle(){
							return _.isEmpty(this.selectedNode) ? '页面权限': `${this.selectedNode.name} 页面权限`;
						}
					},
					created(){
						this.onInit();
					},
					methods: {
						onInit(){
							this.treeData = fsHandler.callFsJScript("/matrix/system/getAppList.js").message;
							_.delay(()=>{
								this.onSetSelected();
							},50)
						},
						onSetSelected(){
							try{
								let sapp = fsHandler.callFsJScript("/matrix/system/getSappById.js", this.rowData.row.id).message;
								console.log(22,sapp)
								_.forEach(sapp,(v,k)=>{
									let cPerms = JSON.parse(v);
									_.extend( this.findNodeById(k), { perms: cPerms, checked:true } );
								});
								this.selectedKeys = _.keys(sapp);

							} catch(err){
								console.log(err)
							}
						},
						findNodeById(id){
							let rtn = null;

							let find = function(nodes){
								_.forEach(nodes,(v)=>{
									
									if(v.id == id){
										rtn = v;
										return;
									}

									if(v.nodes){
										find(v.nodes)
									}
								})	
							} 

							find(this.treeData);

							return rtn;
						},
						onMouseEnter(item){
							this.$set(item, 'show', true)
						},
						onMouseLeave(item){
							this.$set(item, 'show', false)
						},
						onRefresh(item,index){
							let childrenData = fsHandler.fsList(item.fullname);

							this.$set(data, 'children', childrenData);
						},
						onFilterNode:_.debounce(function(value, data) {
							if (!value) return true;
							try{
								let rtn = fsHandler.callFsJScript("/matrix/fs/getFsByTerm.js", encodeURIComponent(value)).message;
								this.treeData = rtn;
							} catch(err){
								this.treeData = [];
							}
						},1000),
						onNodeClick(data){
							try{

								if(!data.isdir) {
									eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

								} else {

									let rtn = _.map(fsHandler.fsList(data.fullname),(v)=>{
										return _.extend(v,{show:false});
									});

									let childrenData = _.sortBy(rtn,'fullname');

									this.$set(data, 'children', childrenData);

									eventHub.$emit("FS-FORWARD-EVENT", data, data.fullname);
									
								}

								this.selectedNode = data;

								window.FS_TREE_DATA = this.$refs.tree.data;

							} catch(err){

							}

						},
						onCheckChange(data, checked, indeterminate){
								
							// 设置复选框状态
							let perms = ['add','delete','edit','list'];

							if(checked){
								if(!_.isEmpty(data.name)){
									this.$set(data, 'checked', true);
									this.$set(data, 'perms', perms);
								}
							} else {
								this.$set(data, 'checked', false);
								//this.$set(data, 'perms', []);
							}

							// 更新
							if(_.isEmpty(data.name)) {
								return false;
							}

							this.selectedNodes.push(data);

						},
						// 应用授权
						onUpdateRoleGroupByApp(event){
							
							// 更新
							let term = encodeURIComponent( JSON.stringify( { roleGroup: [this.rowData.row], data: this.selectedNodes } ) );
							console.log(JSON.stringify( { roleGroup: [this.rowData.row], data: this.selectedNodes } ))
							let rtn = fsHandler.callFsJScript("/matrix/system/updateGroupByApp.js", term);
							_.delay(()=>{
								this.$emit('update:selectedApp');
								this.$message({
									type: "success",
									message: "更新应用权限成功！"
								})
								// 刷新应用缓存，针对应用权限过滤
								userHandler.refreshAppCache();
							},500)
						}
					}
				})

				// Data Permission Select
				Vue.component("data-permission",{
					delimiters: ['#{', '}#'],
					props: {
						rowData: Object,
						root: String
					},
					data(){
						return {
							treeData: [],
							selectedNode: null,
							selectedNodes: [],
							selectedKeys: [],
							defaultProps: {
								children: 'children',
								label: 'alias'
							},
							filterText: "",
							dt: {
								rows:[],
								columns: [],
								selected: []
							}
						}
					},
					template:   `<el-container style="height:100%;background:#f2f2f2;">
									<el-header style="height:300px;">
										<el-container style="height:100%;">
											<el-header style="height:40px;line-height:40px;padding:0px 10px;display:none;">
												<el-input v-model="filterText" 
													placeholder="搜索" size="mini"
													clearable></el-input>
											</el-header>
											<el-main style="padding:0px 10px; height: 100%;">
												<el-tree :data="treeData" 
														:props="defaultProps" 
														:default-checked-keys="selectedKeys"
														node-key="id"
														show-checkbox
														highlight-current
														default-expand-all
														auto-expand-parent
														@node-click="onNodeClick"
														@check-change="onCheckChange"
														:filter-node-method="onFilterNode"
														:check-on-click-node="false"
														:expand-on-click-node="false"
														style="background:transparent;"
														ref="tree">
													<span slot-scope="{ node, data }" style="width:100%;">
														<span>
															<i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i>
															#{ node.label }#
															<el-checkbox-group v-model="data.cPerms" style="float: right;padding-right: 10px;" v-if="data.checked">
																<el-checkbox label="add">添加</el-checkbox>
																<el-checkbox label="delete">删除</el-checkbox>
																<el-checkbox label="edit">编辑</el-checkbox>
																<el-checkbox label="list">查询</el-checkbox>
															</el-checkbox-group>
														</span>
													</span>
												</el-tree>
											</el-main>
											<el-footer style="text-align:right;line-height:60px;">
												<el-button type="default" @click="rowData.show = false;">取消</el-button>
												<el-button type="primary" @click="onUpdateRoleGroupByData">更新类权限</el-button>
											</el-footer>
										</el-container>
									</el-header>
									<el-main style="overflow:hidden;" v-if="!_.isEmpty(selectedNode)">
										
										<el-tabs type="border-card">
											<el-tab-pane label="类记录授权">
											
												<el-container>
													<el-main>
														<el-checkbox-group v-model="selectedNode.rPerms">
															<el-checkbox label="add">添加</el-checkbox>
															<el-checkbox label="delete">删除</el-checkbox>
															<el-checkbox label="edit">编辑</el-checkbox>
															<el-checkbox label="list">查询</el-checkbox>
														</el-checkbox-group>
													</el-main>
												</el-container>

											</el-tab-pane>
											<el-tab-pane label="类属性授权">
											
												<el-table
													:data="dt.rows"
													tooltip-effect="dark"
													style="width: 100%;height:60%!important;"
													@selection-change="onSelectionChange"
													ref="propsTable">
													<el-table-column type="selection" width="55"></el-table-column>
													<el-table-column label="属性" width="120" align="center">
														<template slot-scope="scope">#{ scope.row.name }#</template>
													</el-table-column>
													<el-table-column label="权限" align="center">
														<template slot-scope="scope">
															<el-checkbox-group v-model="scope.row.perms" style="float: right;padding-right: 10px;">
																<el-checkbox label="add">添加</el-checkbox>
																<el-checkbox label="delete">删除</el-checkbox>
																<el-checkbox label="edit">编辑</el-checkbox>
																<el-checkbox label="list">查询</el-checkbox>
															</el-checkbox-group>
														</template>
													</el-table-column>
												</el-table>
											
											</el-tab-pane>
										</el-tabs>
										
									</el-main>
								</el-container>`,
					watch: {
						filterText(val) {
							if(_.isEmpty(val)){
								this.initData();
							} else {
								this.$refs.tree.filter(val);
							}
						}
					},
					created(){
						this.initData();
					},
					methods: {
						initData(){
							this.treeData = fsHandler.callFsJScript("/matrix/entity/entity_class.js",encodeURIComponent(this.root)).message;
							_.delay(()=>{
								this.onSetSelected();
							},50)
						},
						onSetSelected(){
							try{
								let sdata = fsHandler.callFsJScript("/matrix/system/getSdataById.js", this.rowData.row.id).message;
								_.forEach(sdata,(v,k)=>{
									let dcPerms = v;
									_.extend( this.findNodeById(k), { cPerms: dcPerms, checked:true } );
								});
								this.selectedKeys = _.keys(sdata);

							} catch(err){
								console.log(err)
							}
						},
						findNodeById(id){
							let rtn = null;

							let find = function(nodes){
								_.forEach(nodes,(v)=>{
									
									if(v.id == id){
										rtn = v;
										return;
									}

									if(v.nodes){
										find(v.nodes)
									}
								})	
							} 

							find(this.treeData);

							return rtn;
						},
						onFilterNode:_.debounce(function(value, data) {
							if (!value) return true;
							try{
								let rtn = fsHandler.callFsJScript("/matrix/graph/entity-search-by-term.js",encodeURIComponent(value)).message;
								this.treeData = _.map(rtn,(v)=>{
									return _.extend(v,{ children:[], alias:_.last(v.class.split("/"))});
								});
							} catch(err){
								this.treeData = [];
							}
						},1000),
						onNodeClick(data){
							
							try{

								if(!data.isdir) {
									eventHub.$emit("FS-NODE-OPENIT-EVENT", data, data.parent);

								} else {

									let childrenData = _.sortBy(fsHandler.fsList(data.fullname),'fullname');

									this.$set(data, 'children', childrenData);

									eventHub.$emit("FS-FORWARD-EVENT", data, data.fullname);
									
								}

								// 当前class对应的属性
								this.dt.rows = _.map(data.fields, (v)=>{
									return {name: v, perms:['add','delete','edit','list']};
								})

								// 当前选择节点
								this.selectedNode = data;
								console.log(this.selectedNode, data)

							} catch(err){

							}

						},
						onSelectionChange(){

						},
						onCheckChange(data, checked, indeterminate){
							
							// 设置复选框状态
							let perms = ['add','delete','edit','list'];
							
							if(checked){
								if(!_.isEmpty(data.class)){
									this.$set(data, 'checked', true);
									this.$set(data, 'cPerms', perms);
								}
							} else {
								this.$set(data, 'checked', false);
								//this.$set(data, 'cPerms', []);
							}

							// 更新
							if(_.isEmpty(data.class)) {
								return false;
							}

							this.selectedNodes.push( {id:data.id, cPerms:data.cPerms, checked:data.checked, class:data.class, fields: data.fields} );
						},
						// 数据类授权
						onUpdateRoleGroupByData(){
							// 更新
							let term = encodeURIComponent( JSON.stringify( { roleGroup: [this.rowData.row], data: this.selectedNodes } ) );
							console.log(JSON.stringify( { roleGroup: [this.rowData.row], data: this.selectedNodes } ))
							let rtn = fsHandler.callFsJScript("/matrix/system/updateGroupByData.js", term);
							_.delay(()=>{
								this.$emit('update:selectedData');
								this.$message({
									type: "success",
									message: "更新类权限成功！"
								})
							},500)
						}
					}
				})

				// Api permission List
				Vue.component("api-permission",{
					delimiters: ['#{', '}#'],
					props: {
						roleGroup: Object
					},
					data(){
						return {
							dt:{
								rows:[],
								columns: [
									{ "field":"name", title:"名称", width:200 },
									{ "field":"pprefix", title:"角色组" }
								],
								selected: []
							},
							info: [],
							dialog: {
								newApi: {
									show: false,
									name: "",
									pprefix: []
								}
							},
							expandedView: 'edit'
						}
					},
					template:   `<el-container style="width:100%;height:100%;background:#f2f2f2;">
									<el-header style="height:30px;line-height:30px;">
										<el-tooltip content="刷新" open-delay="500" placement="top">
											<el-button type="text" icon="el-icon-refresh" @click="initData"></el-button>
										</el-tooltip>
										<el-tooltip content="新建接口组" open-delay="500" placement="top">
											<el-button type="text" icon="el-icon-plus" @click="dialog.newApi.show = true;"></el-button>
										</el-tooltip>
										<el-tooltip content="导出" delay-time="500">
											<el-dropdown @command="onExport">
												<span class="el-dropdown-link">
													<i class="el-icon-download el-icon--right"></i>
												</span>
												<el-dropdown-menu slot="dropdown">
													<el-dropdown-item command="csv">CSV</el-dropdown-item>
													<el-dropdown-item command="json">JSON</el-dropdown-item>
													<!--el-dropdown-item command="pdf">PDF</el-dropdown-item-->
													<el-dropdown-item command="png">PNG</el-dropdown-item>
													<!--el-dropdown-item command="sql">SQL</el-dropdown-item-->
													<el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
												</el-dropdown-menu>
											</el-dropdown>
										</el-tooltip>
										<el-dialog title="新建接口组" :visible.sync="dialog.newApi.show">
											<el-container style="width:100%;">
												<el-main>
													<el-form label-position="top">
														<el-form-item label="接口组名称">
															<el-input v-model="dialog.newApi.name"></el-input>
														</el-form-item>
														<el-form-item label="选择接口">
															<mx-fs-tree-select root="/script" @update:selected="onSetPprefix($event)"></mx-fs-tree-select>
														</el-form-item>
													</el-form>
												</el-main>
											</el-container>
											<div slot="footer" class="dialog-footer">
												<el-tooltip content="取消" open-delay="500" placement="top">
													<el-button type="default" icon="el-icon-close" @click="dialog.newApi.show = false;">关闭</el-button>
												</el-tooltip>	
												<el-tooltip content="确定" open-delay="500" placement="top">
													<el-button type="primary" icon="el-icon-edit" @click="onSaveApi">确定</el-button>
												</el-tooltip>	
											</div>
										</el-dialog>
									</el-header>   
									<el-main style="width:100%;padding:0px;">
										<el-table
											:data="dt.rows"
											highlight-current-row="true"
											style="width: 100%;"
											:row-class-name="rowClassName"
											:header-cell-style="headerRender"
											@row-dblclick="onRowDblclick"
											@row-contextmenu="onRowContextmenu"
											@selection-change="onSelectionChange"
											@current-change="onCurrentChange"
											ref="table">
											<el-table-column type="selection" align="center"></el-table-column> 
											<el-table-column
												sortable 
												show-overflow-tooltip
												v-for="(item,index) in dt.columns"
												:key="index"
												:prop="item.field"
												:label="item ? item.title : ''"
												:width="item.width"
												v-if="item.visible">
													<template slot-scope="scope">
														<div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
															v-if="typeof item.render === 'function'">
														</div>
														<div v-else-if="_.includes(['pprefix'],item.field)">
															<el-select :value="_.first(scope.row[item.field])" v-if="!_.isEmpty(scope.row[item.field])" placeholder="Group">
																<el-option
																v-for="subItem in scope.row[item.field]"
																:key="subItem"
																:label="subItem"
																:value="subItem">
																</el-option>
															</el-select>
														</div>
														<div v-else>
															#{scope.row[item.field]}#
														</div>
													</template>
											</el-table-column>
											<el-table-column type="expand">
												<template slot-scope="scope">
													<el-container style="width:100%;" v-if="expandedView == 'edit'">
														<el-main>
															<mx-fs-tree-select root="/script" :selected="scope.row.pprefix" @update:selected="onUpdatePprefix(scope.row, $event) "></mx-fs-tree-select>
														</el-main>
														<el-footer style="text-align:right;">
															<el-tooltip content="取消" open-delay="500" placement="top">
																<el-button type="default" icon="el-icon-close" @click="onToogleExpand(scope.row, scope.$index, 'edit')">取消</el-button>
															</el-tooltip>	
															<el-tooltip content="确定" open-delay="500" placement="top">
																<el-button type="primary" icon="el-icon-edit" @click="onUpdateApi(scope.row, scope.$index)">确定</el-button>
															</el-tooltip>	
														</el-footer>
													</el-container>
												</template>
											</el-table-column>
											<el-table-column label="操作" width="160">
												<template slot-scope="scope">
													
													<el-tooltip content="编辑" open-delay="500" placement="top">
														<el-button type="text" icon="el-icon-edit" @click="onToogleExpand(scope.row, scope.$index, 'edit')"></el-button>
													</el-tooltip>
													<el-tooltip content="删除" open-delay="500" placement="top">
														<el-button type="text" icon="el-icon-delete" @click="onDeleteApi(scope.row, scope.$index)"></el-button>
													</el-tooltip>
													
												</template>
											</el-table-column>
										</el-table>
									</el-main>
									<el-footer  style="height:30px;line-height:30px;">
										#{ info.join(' &nbsp; | &nbsp;') }#
									</el-footer>
								</el-container>`,
					filters:{
						pickDatetime(item){
							return moment(item).format(mx.global.register.format);      
						}
					},
					watch: {
						'dt.rows': {
							handler(val,oldVal){
								//this.initData();
								this.layout();
							},
							deep:true,
							immediate:true
						},
						dt: {
							handler(val,oldVal){
								this.info = [];
								this.info.push(`共 ${this.dt.rows.length} 项`);
								this.info.push(`已选择 ${this.dt.selected.length} 项`);
								this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
							},
							deep:true,
							immediate:true
						}
					},
					mounted(){
						this.initData();

						// 当前角色组对应的接口
						_.delay(()=>{
							if(!_.isEmpty(this.roleGroup)){
								_.forEach(this.dt.rows,(v)=>{
									if(v._group && _.includes(v._group._all, this.roleGroup.fullname) ){
										this.$refs.table.toggleRowSelection(v);
									}
								})
							}
						},1000)
					},
					methods: {
						layout(){
							let doLayout = ()=>{
								if($(".el-table-column--selection",this.$el).is(':visible')){
									_.delay(()=>{
										//this.$refs.table.setCurrentRow(this.dt.rows[0]);
										this.$refs.table.doLayout();
									},1000)
								} else {
									setTimeout(doLayout,50);
								}
							}
							doLayout();
						},
						initData(){
							const self = this;
							
							let init = function(){
								
								try{

									self.dt.rows = userHandler.getApiPermissions();

									_.extend(self.dt, {columns: _.map(self.dt.columns, function(v){
										
										if(_.isUndefined(v.visible)){
											_.extend(v, { visible: true });
										}
		
										if(!v.render){
											return v;
										} else {
											return _.extend(v, { render: eval(v.render) });
										}
										
									})});
		
									_.extend(self.dt, {rows: self.dt.rows});

									
								} catch(err){
									console.log(err);
								}
							};
	
							_.delay(()=>{
								init();
							},1000)
							
						},
						rowClassName({row, rowIndex}){
							return `row-${rowIndex}`;
						},
						headerRender({ row, column, rowIndex, columnIndex }){
							if (rowIndex === 0) {
								//return 'text-align:center;';
							}
						},
						onSaveApi(){
							
							if(_.isEmpty(this.dialog.newApi.name)){
								this.$message({
									type: "warning",
									message: "接口组名称不能为空！"
								})

								return false;
							}

							if(_.isEmpty(this.dialog.newApi.pprefix)){
								this.$message({
									type: "warning",
									message: "接口组不能为空！"
								})

								return false;
							}

							let rtn = userHandler.addApiPermissions( this.dialog.newApi );

							if(rtn === 1){
								this.$message({
									type: 'success',
									message: `接口组 ${this.dialog.newApi.name} 添加成功！`
								});
								
								this.dialog.newApi.show = false;
								this.initData();

							} else {
								this.$message({
									type: 'error',
									message: `接口组 ${this.dialog.newApi.name} 添加失败！`
								});
							}

						},
						onUpdateApi(row,index){
							
							if(_.isEmpty(row.pprefix)){
								this.$message({
									type: "warning",
									message: "接口组不能为空！"
								})

								return false;
							}

							let rtn = userHandler.UpdateApiPermissions( row );

							if(rtn === 1){
								this.$message({
									type: 'success',
									message: `接口组 ${row.name} 更新成功！`
								});
								
								this.initData();

							} else {
								this.$message({
									type: 'error',
									message: `接口组 ${row.name} 更新失败！`
								});
							}
						},
						onSetPprefix(event){
							this.dialog.newApi.pprefix = event.data;
						},
						onUpdatePprefix(row,event){
							row.pprefix = event.data;
						},
						onDeleteApi(row,index){

							this.$confirm(`确认要删除该接口组：${row.name}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
								let rtn = userHandler.deleteApiPermissions(row);
                                
                                if(rtn==1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除接口组成功!'
									});
									
									_.delay(()=>{
										this.initData();
									},500)

                                }else {
									this.$message({
                                        type: 'error',
                                        message: '删除接口组失败!'
                                    });
								}
                            }).catch(() => {
                                
                            });
						},
						// 设置角色组
						onSelectionChange(val) {
							
							if(_.isEmpty(val)){
								_.forEach(this.dt.rows, (v,index)=>{
									userHandler.deleteApiPermissionsGroups({name:v.name, roleGroups: _.map([this.roleGroup],'fullname') });

									// 删除角色组
									let term = encodeURIComponent( JSON.stringify( { roleGroup: [this.roleGroup], data: [ _.extend(v, {checked:false} )] } ) );
									fsHandler.callFsJScript("/matrix/system/updateGroupByApi.js", term);
									
								})	
							} else {
								_.forEach(val, (v,index)=>{
									userHandler.setApiPermissionsGroups({name:v.name, roleGroups: _.map([this.roleGroup],'fullname') });

									// 更新角色组
									let term = encodeURIComponent( JSON.stringify( { roleGroup: [this.roleGroup], data: [ _.extend(v, {checked:true} )] } ) );
									fsHandler.callFsJScript("/matrix/system/updateGroupByApi.js", term);
								})
							}
							
							this.dt.selected = val;
						},
						onCurrentChange(val){
							this.dt.selected = [val];
						},
						onRowContextmenu(row, column, event){
							
						},
						onRowDblclick(row, column, event){
							
						},
						onToogleExpand(row,index,view){
							
							if(row.expand){
								this.$refs.table.toggleRowExpansion(row,false);
								this.$set(row, 'expand', !row.expand);
								return false;
							}

							this.$refs.table.toggleRowExpansion(row);

							this.expandedView = view;
	
						},
						onExport(type){
					
							let options = {
								csvEnclosure: '',
								csvSeparator: ', ',
								csvUseBOM: true,
								ignoreColumn: [0,1],
								fileName: `tableExport_${moment().format("YYYY-MM-DD HH:mm:ss")}`,
								type: type,
							};
	
							if(type === 'png'){
								//$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
								$(this.$refs.table.$el.querySelector("table.el-table__body")).tableExport(options);
							} else if(type === 'pdf'){
								_.extend(options, {
									jspdf: {orientation: 'l',
											format: 'a3',
											margins: {left:10, right:10, top:20, bottom:20},
											autotable: {styles: {fillColor: 'inherit', 
																	textColor: 'inherit'},
														tableWidth: 'auto'}
									}
								});
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							} else {
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							}
							
						},
						onTogglePanel(){
							// So bad
							$(this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.leftView.$el).toggle();
						},
						onSetRoleGroups(row,roleGroups){
							row.roleGroups = _.map(roleGroups,'fullname');
						},
						onUpdateRoleGroup(row,index){
							
							let rtn = userHandler.setApiPermissionsGroups(row);
							if(rtn === 1){
								
								this.$message({
									type: 'success',
									message: `${row.name} 角色组设置成功！`
								});

								this.initData();

							} else {
								this.$message({
									type: 'error',
									message: `${row.name} 角色组设置失败！`
								});
							}
						}
					}
				})

				// 组管理 选择用
				Vue.component("user-roleGroup-select",{
					delimiters: ['#{', '}#'],
					props: {
						rowData: Object,
						showView: String
					},
					data(){
						return {
							dt:{
								rows:[],
								columns: [
									{ "field":"name", title:"名称" },
									{ "field":"fullname", title:"全名称", visible:false},
									{ "field":"id", title:"ID", visible:false },
									{ "field":"isldap", title:"LDAP" },
									{ "field":"parent", title:"父节点" },
									{ "field":"member", title:"成员", width:200 },
									{ "field":"fields", title:"属性", width:200 },
									{ "field":"readexps", title:"数据表达式", width:200 },
									{ "field":"readonly", title:"读权限", width:200 },
									{ "field":"writable", title:"写权限", width:200 },
									{ "field":"selected", title:"选择", width:200, visible:false }
								],
								selected: []
							},
							info: [],
							fullname: ["/"]
						}
					},
					template:   `<el-container style="width:100%;height:100%;background:#f2f2f2;">
									<el-header style="height:35px;line-height:35px;">
										<el-row>
											<el-col :span="12">
												<el-breadcrumb separator=">">
													<el-breadcrumb-item>
														<el-button type="text" @click="onForward('')"><i class="el-icon-s-home"></i> 角色组</el-button>
													</el-breadcrumb-item>
													<el-breadcrumb-item  v-for="(item,index) in fullname" v-if="index > 0">
														<el-button type="text" @click="onForward(fullname.slice(0,index+1).join('/'))">#{item}#</el-button>
													</el-breadcrumb-item>
												</el-breadcrumb>
											</el-col>
											<el-col :span="12" style="text-align:right;">
												<el-tooltip content="格子视图" placement="top">
													<el-button type="text" @click="showView='grid'" icon="el-icon-picture">
													</el-button>
												</el-tooltip>
												<el-tooltip content="表格视图" placement="top">
													<el-button type="text" @click="showView='table'" icon="el-icon-menu">
													</el-button>
												</el-tooltip>
												<!--el-tooltip content="更新权限" open-delay="500" v-if="showView=='table'">
													<el-button type="text" icon="el-icon-edit-outline" @click="$parent.$parent.$parent.$parent.$parent.onUpdateRoleGroup"></el-button>
												</el-tooltip-->	
												<el-tooltip content="刷新" open-delay="500" placement="top">
													<el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
												</el-tooltip>
												<el-tooltip content="导出" delay-time="500">
													<el-dropdown @command="onExport">
														<span class="el-dropdown-link">
															<i class="el-icon-download el-icon--right"></i>
														</span>
														<el-dropdown-menu slot="dropdown">
															<el-dropdown-item command="csv">CSV</el-dropdown-item>
															<el-dropdown-item command="json">JSON</el-dropdown-item>
															<!--el-dropdown-item command="pdf">PDF</el-dropdown-item-->
															<el-dropdown-item command="png">PNG</el-dropdown-item>
															<!--el-dropdown-item command="sql">SQL</el-dropdown-item-->
															<el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
														</el-dropdown-menu>
													</el-dropdown>
												</el-tooltip>
											</el-col>
										</el-row>
									</el-header>   
									<el-main style="width:100%;" v-if="showView=='table'">
										<el-table
											:data="dt.rows"
											highlight-current-row="true"
											style="width: 100%;"
											:row-class-name="rowClassName"
											:header-cell-style="headerRender"
											@row-dblclick="onRowDblclick"
											@row-contextmenu="onRowContextmenu"
											@selection-change="onSelectionChange"
											@current-change="onCurrentChange"
											ref="table">
											<el-table-column type="selection" align="center"></el-table-column> 
											<el-table-column type="expand">
												<template slot-scope="scope">
													
												</template>
											</el-table-column>
											<el-table-column
												sortable 
												show-overflow-tooltip
												v-for="(item,index) in dt.columns"
												:key="index"
												:prop="item.field"
												:label="item ? item.title : ''"
												:width="item.width"
												v-if="item.visible">
													<template slot-scope="scope">
														<div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
															v-if="typeof item.render === 'function'">
														</div>
														<div v-else-if="_.includes(['name'],item.field)">
															<el-link type="info" :underline="true" @dblclick.native.prevent="onForward(scope.row.fullname)">
																#{scope.row.name}#
															</el-link>
														</div>
														<div v-else-if="_.includes(['fields', 'member', 'writable', 'readexps', 'readonly'],item.field)">
															<el-select :value="_.first(scope.row[item.field])" :placeholder="_.upperFirst(item.field)">
																<el-option
																v-for="subItem in scope.row[item.field]"
																:key="subItem"
																:label="subItem"
																:value="subItem">
																</el-option>
															</el-select>
														</div>
														<div v-else>
															#{ scope.row[item.field] }#
														</div>
													</template>
											</el-table-column>
											<el-table-column label="标签" prop="tags" width="200">
												<template slot-scope="scope">
													<mx-tag domain='script' :model.sync="scope.row.tags" :id="scope.row.id" limit="1"></mx-tag>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
									<el-main style="width:100%;" v-else>
										<el-checkbox-group v-model="dt.selected" class="roleGroup-grid-node">
											<el-button type="default" 
													style="max-width: 12em;width: 12em;height:110px;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
													@dblclick.native="onForward(item.fullname)"
													@click="onTriggerClick(item)"
													:key="item.id"
													v-for="item in dt.rows">
													<i class="el-icon-s-check" style="font-size:48px;margin:5px;color:#FF9800;"></i>
													<p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:center;">
														#{item.name}#
													</p>
													<el-checkbox :label="item" :ref="'checkBox_'+item.id"></el-checkbox>
											</el-button>
										</el-checkbox-group>
									</el-main>
									<el-footer  style="height:30px;line-height:30px;" v-if="showView=='table'">
										#{ info.join(' &nbsp; | &nbsp;') }#
									</el-footer>
								</el-container>`,
					filters:{
						pickDatetime(item){
							return moment(item).format(mx.global.register.format);      
						}
					},
					watch: {
						dt: {
							handler(val,oldVal){
								this.info = [];
								this.info.push(`共 ${this.dt.rows.length} 项`);
								this.info.push(`已选择 ${this.dt.selected.length} 项`);
								this.info.push(moment().format("YYYY-MM-DD hh:mm:ss.SSS"));
							},
							deep:true,
							immediate:true
						},
						'dt.selected'(val,oldVal){
							this.$emit('update:selectedRoleGroup', val);
						}
					},
					mounted(){
						this.initData();
					},
					methods: {
						layout(){
							let doLayout = ()=>{
								if($(".el-table-column--selection",this.$el).is(':visible')){
									_.delay(()=>{
										//this.$refs.table.setCurrentRow(this.dt.rows[0]);
										this.$refs.table.doLayout();
									},1000)
								} else {
									setTimeout(doLayout,50);
								}
							}
							doLayout();
						},
						initData(){
							const self = this;
							
							// 过滤系统组、当前角色组、同步的组织
							this.dt.rows = _.filter(userHandler.getGroupPermissionsByParent({parent:""}),(v)=>{
								
								if(!_.includes(['/','system','admin'],v.name) && v.fullname != this.rowData.fullname && !v.isldap){
									return v;
								};

							});

							let selected = _.map(this.rowData.member,(v)=>{ return v.replace(/['G','U','O']/g,''); });
							if(selected){
								this.dt.selected = _.filter(this.dt.rows, (v)=>{
									if(_.includes(selected,v.fullname)){
										return v;
									}
								});
							}

							let init = function(){
								
								try{
									_.extend(self.dt, {columns: _.map(self.dt.columns, function(v){
										
										if(_.isUndefined(v.visible)){
											_.extend(v, { visible: true });
										}
		
										if(!v.render){
											return v;
										} else {
											return _.extend(v, { render: eval(v.render) });
										}
										
									})});
									
								} catch(err){
									console.log(err);
								}
							};
	
							_.delay(()=>{
								init();
							},1000)
							
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
						onForward(fullname){
							let rtn = userHandler.getGroupPermissionsByParent({parent: fullname});
							
							if(!_.isEmpty(rtn)){
								this.dt.rows = rtn;

								if(fullname){
									this.fullname = fullname.split("/");
								} else {
									this.fullname = ["/"];
								}
							}
						},
						onSelectionChange(val) {
							this.dt.selected = val;
						},
						onCurrentChange(val){
							this.dt.selected = [val];
						},
						onRowContextmenu(row, column, event){
							
						},
						onRowDblclick(row, column, event){
							
						},
						onToogleExpand(row,index){
							this.$refs.table.toggleRowExpansion(row);
						},
						onExport(type){
					
							let options = {
								csvEnclosure: '',
								csvSeparator: ', ',
								csvUseBOM: true,
								ignoreColumn: [0,1],
								fileName: `tableExport_${moment().format("YYYY-MM-DD HH:mm:ss")}`,
								type: type,
							};
	
							if(type === 'png'){
								//$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
								$(this.$refs.table.$el.querySelector("table.el-table__body")).tableExport(options);
							} else if(type === 'pdf'){
								_.extend(options, {
									jspdf: {orientation: 'l',
											format: 'a3',
											margins: {left:10, right:10, top:20, bottom:20},
											autotable: {styles: {fillColor: 'inherit', 
																	textColor: 'inherit'},
														tableWidth: 'auto'}
									}
								});
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							} else {
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							}
							
						},
						onToggle(){
							this.$root.$refs.probeView.onToggle();
						},
						onNewRole(row){
							const self = this;

							let wnd = null;

							try{
								if(jsPanel.activePanels.getPanel('jsPanel-user')){
									jsPanel.activePanels.getPanel('jsPanel-user').close();
								}
							}catch(error){
			
							}
							finally{
								wnd = maxWindow.winUser("新建角色组",`<div id="ldap-newRoleGroup-container"></div>`,null,null); 
							}

							new Vue({
								delimiters: ['#{', '}#'],
								template: `<el-container>
												<el-main>
													<el-form ref="form" label-width="80px">

														<el-form-item label="角色组名称">
															<el-input v-model="role.name"></el-input>
														</el-form-item>

														<el-form-item label="父节点">
															<el-input v-model="role.parent" autofocus></el-input>
														</el-form-item>
														
													</form>
												</el-main>
												<el-footer style="text-align:right;">
													<el-button type="primary" @click="onSave">创建角色组</el-button>
												</el-footer>
											</el-container>`,
								data: {
									role: {
										name: "", 
										parent: "",
										member: []                  
									}
								},
								created(){
									if(!_.isEmpty(row)){
										this.role.parent = row.fullname;
									}
								},
								methods: {
									onSave(){
										
										if (_.isEmpty(this.role.name)) {
											this.$message({
												type: 'warning',
												message: '角色组名称不能为空！!'
											});
											return false;
										}

										let rtn = userHandler.addGroupPermissions(this.role);

										if(rtn == 1){
											this.$message({
												type: 'success',
												message: `角色组: ${this.role.name} 添加成功！`
											});
											
											_.delay(()=>{
												self.onRefresh();
												wnd.close();
											},500);

										}

									}
								}
							}).$mount("#ldap-newRoleGroup-container");
						},
						onDeleteRole(row){
							const self = this;

							if( row.isldap ){
								this.$message({
									type: "warning",
									message: "系统角色组，禁止删除！"
								})
								return false;
							}

							this.$confirm(`确认要删除该角色组：${row.fullname}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
								let _csrf = window.CsrfToken;
								let rtn = userHandler.deleteGroupPermissions(row,_csrf);
                                
                                if(rtn == 1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除成功!'
									});
									
									_.delay(()=>{
										self.onRefresh();
									},500)
									
                                } else {
									this.$message({
                                        type: 'error',
                                        message: '删除失败: ' + rtn
                                    });
								}
                            }).catch(() => {
                                
                            });
						},
						onTriggerClick(item){
                            this.$refs['checkBox_'+item.id][0].$el.click();
                        }
					}
				})

				// 组管理 管理用
				Vue.component("user-roleGroup",{
					delimiters: ['#{', '}#'],
					data(){
						return {
							dt:{
								rows:[],
								columns: [
									{ "field":"name", title:"角色名称", width:200 },
									{ "field":"fullname", title:"全名称", width:200, visible:false},
									{ "field":"id", title:"ID", width:200, visible:false },
									{ "field":"isldap", title:"同步组织" , width:200 },
									{ "field":"parent", title:"父角色组" , width:200 },
									{ "field":"member", title:"成员" },
									{ "field":"fields", title:"属性", width:200 , visible:false },
									{ "field":"readexps", title:"数据表达式", width:200 , visible:false },
									{ "field":"readonly", title:"读权限", width:200 , visible:false },
									{ "field":"writable", title:"写权限", width:200 , visible:false },
									{ "field":"selected", title:"选择", width:200, visible:false }
								],
								selected:[],
								pagination:{
                                    pageSize: 10,
                                    currentPage: 1
                                }
							},
							info: [],
							tree: {
								defaultProps: {
									children: 'children',
									label: 'name'
								},
								nodes: []	
							},
							fullname: ["/"],
							splitInst: null,
							dialog: {
								permission:{
									row: {},
									show: false
								},
								ldap:{
									row: {},
									show: false
								}
							}
						}
					},
					template:   `<el-container style="width:100%;height: calc(100% - 39px);background:#f2f2f2;">
									<el-aside ref="leftView" style="display:none;">
										<el-tree 
											node-key="fullname"
											default-expand-all
											highlight-current
											:data="tree.nodes" 
											:props="tree.defaultProps" 
											@node-click="onNodeClick"
											@node-expand="onNodeExpand"
											style="background: transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
												<span class="el-icon-school" style="color:#FF9800;"></span>
												<span>#{node.label}#</span>
											</span>                  
										</el-tree>
									</el-aside>
									<el-container style="width:100%;height:100%;background:#ffffff;" ref="mainView">
										<el-header style="height:35px;line-height:35px;">
											<el-row>
												<el-col :span="12">
													<el-breadcrumb separator=">">
														<el-breadcrumb-item>
															<el-button type="text" @click="onForward('')"><i class="el-icon-s-home"></i> 角色组</el-button>
														</el-breadcrumb-item>
														<el-breadcrumb-item  v-for="(item,index) in fullname" v-if="index > 0">
															<el-button type="text" @click="onForward(fullname.slice(0,index+1).join('/'))">#{item}#</el-button>
														</el-breadcrumb-item>
													</el-breadcrumb>
												</el-col>
												<el-col :span="12" style="text-align:right;">
													<!--el-tooltip content="切换视图" open-delay="500" placement="top">
														<el-button type="text" icon="el-icon-s-fold" @click="onTogglePanel"></el-button>
													</el-tooltip-->
													<el-tooltip content="新建角色组" open-delay="500" placement="top">
														<el-button type="text" icon="el-icon-plus" @click="onNewRole" style="padding-left:5px;"></el-button>
													</el-tooltip>
													<el-tooltip content="刷新" open-delay="500" placement="top">
														<el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
													</el-tooltip>
													<el-tooltip content="导出" delay-time="500">
														<el-dropdown @command="onExport">
															<span class="el-dropdown-link">
																<i class="el-icon-download el-icon--right"></i>
															</span>
															<el-dropdown-menu slot="dropdown">
																<el-dropdown-item command="csv">CSV</el-dropdown-item>
																<el-dropdown-item command="json">JSON</el-dropdown-item>
																<!--el-dropdown-item command="pdf">PDF</el-dropdown-item-->
																<el-dropdown-item command="png">PNG</el-dropdown-item>
																<!--el-dropdown-item command="sql">SQL</el-dropdown-item-->
																<el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
															</el-dropdown-menu>
														</el-dropdown>
													</el-tooltip>
												</el-col>
											</el-row>
										</el-header>   
										<el-main style="width:100%;padding:0px;">
											<el-table
												stripe
												:data="dt.rows.slice((dt.pagination.currentPage - 1) * dt.pagination.pageSize,dt.pagination.currentPage * dt.pagination.pageSize)"
												highlight-current-row="true"
												style="width: 100%;"
												:row-class-name="rowClassName"
												:header-cell-style="headerRender"
												@row-dblclick="onRowDblclick"
												@row-contextmenu="onRowContextmenu"
												@selection-change="onSelectionChange"
												@current-change="onCurrentChange"
												ref="table">
												<el-table-column type="selection" align="center"></el-table-column> 
												<el-table-column
													sortable 
													show-overflow-tooltip
													v-for="(item,index) in dt.columns"
													:key="index"
													:prop="item.field"
													:label="item ? item.title : ''"
													:width="item.width"
													v-if="item.visible">
														<template slot-scope="scope">
															<div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
																v-if="typeof item.render === 'function'">
															</div>
															<div v-else-if="_.includes(['name'],item.field)">
																<el-link type="info" :underline="true" @dblclick.native.prevent="onForward(scope.row.fullname)">
																	#{scope.row.name}#
																</el-link>
															</div>
															<div v-else-if="_.includes(['fields', 'member', 'writable', 'readexps', 'readonly'],item.field)">
																<el-select :value="_.first(scope.row[item.field])" :placeholder="_.upperFirst(item.field)">
																	<el-option
																	v-for="subItem in scope.row[item.field]"
																	:key="subItem"
																	:label="subItem"
																	:value="subItem">
																	</el-option>
																</el-select>
															</div>
															<div v-else>
																#{ scope.row[item.field] }#
															</div>
														</template>
												</el-table-column>
												<!--el-table-column label="标签" prop="tags" width="200">
													<template slot-scope="scope">
														<mx-tag domain='script' :model.sync="scope.row.tags" :id="scope.row.id" limit="1"></mx-tag>
													</template>
												</el-table-column-->
												<el-table-column label="操作" width="160">
													<template slot-scope="scope">
													
														<div v-if="_.includes(['/','system'],scope.row.name)">
															
														</div>
														<div v-else-if="_.includes(['admin'],scope.row.name) && window.SignedUser_UserName == 'admin'">
															<el-tooltip content="授权用户" open-delay="500" placement="top">
																<el-button type="text" icon="el-icon-user" @click="onSetLdap(scope.row)"></el-button>
															</el-tooltip>
														</div>
														<div v-else>
															<el-tooltip content="权限设置" open-delay="500" placement="top">
																<el-button type="text" icon="el-icon-lock" @click="onSetPermission(scope.row);"></el-button>
															</el-tooltip>
															<el-tooltip content="授权用户" open-delay="500" placement="top">
																<el-button type="text" icon="el-icon-user" @click="onSetLdap(scope.row)"></el-button>
															</el-tooltip>
															<el-tooltip content="新建角色组" open-delay="500" placement="top">
																<el-button type="text" icon="el-icon-plus" @click="onNewRole(scope.row)"></el-button>
															</el-tooltip>
															<!--el-tooltip content="编辑" open-delay="500" placement="top">
																<el-button type="text" icon="el-icon-edit" @click="onToogleExpand(scope.row,scope.$index,'roleGroupEdit')"></el-button>
															</el-tooltip-->
															<el-tooltip content="删除" open-delay="500" placement="top">
																<el-button type="text" icon="el-icon-delete" @click="onDeleteRole(scope.row)"></el-button>
															</el-tooltip>
														</div>
													</template>
												</el-table-column>
											</el-table>
											<el-dialog :title="permissionTitle" :visible.sync="dialog.permission.show" v-if="dialog.permission.show" width="80vw">
												<el-container style="width:100%;">
													<el-main style="padding:0px;overflow:hidden;">
														<el-tabs value="tagdir">
															<el-tab-pane name="app" lazy>
																<span slot="label"><i class="el-icon-files"></i> 应用权限</span>
																<app-permission  :rowData="dialog.permission" ref="appTree" 
																	@update:selectedApp="()=>{ this.initData(); }" v-if="!_.isEmpty(dialog.permission.row)"></app-permission>
															</el-tab-pane>	
															<el-tab-pane name="data" lazy>
																<span slot="label"><i class="el-icon-bank-card"></i> 数据权限</span>
																<data-permission root="/" :rowData="dialog.permission"
																	@update:selectedData="()=>{ this.initData(); }"
																	ref="classTree"></data-permission>
															</el-tab-pane>
															<el-tab-pane name="api" lazy>
																<span slot="label"><i class="el-icon-tickets"></i> 接口权限</span>
																<api-permission :roleGroup="dialog.permission.row"></api-permission>
															</el-tab-pane>
															<el-tab-pane name="tagdir">
																<span slot="label"><i class="el-icon-collection-tag"></i> 标签权限</span>
																<tagdir-select :model="{parent:'/system',name:'tagdir_tree_data.js',domain:'*'}" 
																	:rowData="dialog.permission"
																	@update:selectedTag="()=>{ this.initData(); }"
																	ref="tagdirTree"
																	v-if="!_.isEmpty(dialog.permission.row)"></tagdir-select>
															</el-tab-pane>
														</el-tabs>
													</el-main>
												</el-container>
											</el-dialog>
											<el-dialog :title="selectLdapTitle" :visible.sync="dialog.ldap.show" v-if="dialog.ldap.show" width="80vw">
												<el-container style="height:100%;">
													<el-main style="overflow:hidden;padding:0px 10px;">
														<el-row :gutter="20">
															<el-col :span="24">
																<h4>用户成员</h4>
																<ldap-manage-select root="/" 
																	:rowData="dialog.ldap.row" 
																	@update:selectedLdap="onSetRoleGroupByLdap(dialog.ldap.row,$event)">
																</ldap-manage-select>
															</el-col>
														</el-row>
														<el-row :gutter="20">
															<el-col :span="24">
																<h4>角色成员</h4>
																<user-roleGroup-select showView="grid" 
																	:rowData="dialog.ldap.row"
																	@update:selectedRoleGroup="onSetRoleGroupByRoleGroup(dialog.ldap.row,$event)" 
																	ref="roleGroup">
																</user-roleGroup-select>
															</el-col>
														</el-row>
													</el-main>
												</el-container>
												<div slot="footer" class="dialog-footer">
													<el-button type="default" @click="dialog.ldap.show = false;">关闭</el-button>
													<el-button type="primary" @click="onUpdatePermission(dialog.ldap.row)">更新成员</el-button>
												</div>
											</el-dialog>
										</el-main>
										<el-footer  style="height:30px;line-height:30px;">
											<!--#{ info.join(' &nbsp; | &nbsp;') }#-->
											<el-pagination
												@size-change="onPageSizeChange"
												@current-change="onCurrentPageChange"
												:page-sizes="[10, 15, 20]"
												:page-size="dt.pagination.pageSize"
												:total="dt.rows.length"
												layout="total, sizes, prev, pager, next">
											</el-pagination>
										</el-footer>
									</el-container>
								</el-container>`,
					filters:{
						pickDatetime(item){
							return moment(item).format(mx.global.register.format);      
						}
					},
					computed:{
						permissionTitle(){
							try{
								return `权限设置 ${this.dialog.permission.row.fullname}`;
							} catch(err){}
						},
						selectLdapTitle(){
							try{
								return `当前角色组 ${this.dialog.ldap.row.fullname}`;
							} catch(err){}
						}
					},
					watch: {
						dt: {
							handler(val,oldVal){
								this.info = [];
								this.info.push(`共 ${this.dt.rows.length} 项`);
								this.info.push(`已选择 ${this.dt.selected.length} 项`);
								this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
								this.$refs.table.doLayout();
							},
							deep:true,
							immediate:true
						}
					},
					mounted(){
						// 获取角色组树
						//this.initNodes();
						// 获取角色组列表
						this.initData();
						// 初始化分隔栏
						this.initSplit();

					},
					methods: {	
						onPageSizeChange(val) {
                            console.log(1,val)
                            this.dt.pagination.pageSize = val;
                        },
                        onCurrentPageChange(val) {
                            console.log(2,val)
                            this.dt.pagination.currentPage = val;
                        },				
						initSplit(){
							
							this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
								sizes: [20, 80],
								minSize: [0, 0],
								gutterSize: 5,
								cursor: 'col-resize',
								direction: 'horizontal'
							});

						},
						layout(){
							let doLayout = ()=>{
								if($(".el-table-column--selection",this.$el).is(':visible')){
									_.delay(()=>{
										//this.$refs.table.setCurrentRow(this.dt.rows[0]);
										this.$refs.table.doLayout();
									},1000)
								} else {
									setTimeout(doLayout,50);
								}
							}
							doLayout();
						},
						initData(){
							const self = this;
							
							// 过滤 "/" 角色组
							this.dt.rows = _.orderBy(_.filter(userHandler.getGroupPermissionsByParent({parent:""}),(v)=>{ return v.fullname != '/'; }),'fullname');

							let init = function(){
								
								try{
									_.extend(self.dt, {columns: _.map(self.dt.columns, function(v){
										
										if(_.isUndefined(v.visible)){
											_.extend(v, { visible: true });
										}
		
										if(!v.render){
											return v;
										} else {
											return _.extend(v, { render: eval(v.render) });
										}
										
									})});
									
								} catch(err){
									console.log(err);
								}
							};
	
							_.delay(()=>{
								init();
							},1000)
							
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
						onForward(fullname){
							let rtn = userHandler.getGroupPermissionsByParent({parent: fullname});
							
							if(!_.isEmpty(rtn)){
								this.dt.rows = rtn;

								if(fullname){
									this.fullname = fullname.split("/");
								} else {
									this.fullname = ["/"];
								}
							}
						},
						onSelectionChange(val) {
							this.dt.selected = [val];
						},
						onCurrentChange(val){
							this.dt.selected = [val];
						},
						onRowContextmenu(row, column, event){
							
						},
						onRowDblclick(row, column, event){
							
						},
						onToogleExpand(row,index,view){
							
							if(row.expand){
								this.$refs.table.toggleRowExpansion(row,false);
								this.$set(row, 'expand', !row.expand);
								return false;
							}

							this.$refs.table.toggleRowExpansion(row);
	
						},
						onExport(type){
					
							let options = {
								csvEnclosure: '',
								csvSeparator: ', ',
								csvUseBOM: true,
								ignoreColumn: [0,1],
								fileName: `tableExport_${moment().format("YYYY-MM-DD HH:mm:ss")}`,
								type: type,
							};
	
							if(type === 'png'){
								//$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
								$(this.$refs.table.$el.querySelector("table.el-table__body")).tableExport(options);
							} else if(type === 'pdf'){
								_.extend(options, {
									jspdf: {orientation: 'l',
											format: 'a3',
											margins: {left:10, right:10, top:20, bottom:20},
											autotable: {styles: {fillColor: 'inherit', 
																	textColor: 'inherit'},
														tableWidth: 'auto'}
									}
								});
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							} else {
								$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
							}
							
						},
						onTogglePanel(){
							$(this.$refs.leftView.$el).toggle();
						},
						onNewRole(row){
							const self = this;

							let wnd = null;

							try{
								if(jsPanel.activePanels.getPanel('jsPanel-user')){
									jsPanel.activePanels.getPanel('jsPanel-user').close();
								}
							}catch(error){
			
							}
							finally{
								wnd = maxWindow.winUser("新建角色组",`<div id="ldap-newRoleGroup-container"></div>`,null,null); 
							}

							new Vue({
								delimiters: ['#{', '}#'],
								template: `<el-container>
												<el-main>
													<el-form ref="form" label-width="80px">

														<el-form-item label="角色组名称">
															<el-input v-model="role.name"></el-input>
														</el-form-item>

														<el-form-item label="父节点">
															<el-input v-model="role.parent" autofocus></el-input>
														</el-form-item>
														
													</form>
												</el-main>
												<el-footer style="text-align:right;">
													<el-button type="primary" @click="onSave">创建角色组</el-button>
												</el-footer>
											</el-container>`,
								data: {
									role: {
										name: "", 
										parent: "",
										member: []                  
									}
								},
								created(){
									if(!_.isEmpty(row)){
										this.role.parent = row.fullname;
									}
								},
								methods: {
									onSave(){
										
										if (_.isEmpty(this.role.name)) {
											this.$message({
												type: 'warning',
												message: '角色组名称不能为空！!'
											});
											return false;
										}

										let rtn = userHandler.addGroupPermissions(this.role);

										if(rtn == 1){
											this.$message({
												type: 'success',
												message: `角色组: ${this.role.name} 添加成功！`
											});
											
											_.delay(()=>{
												self.onRefresh();
												wnd.close();
											},500);

										}

									}
								}
							}).$mount("#ldap-newRoleGroup-container");
						},
						onDeleteRole(row){
							const self = this;

							if( row.isldap ){
								this.$message({
									type: "warning",
									message: "系统角色组，禁止删除！"
								})
								return false;
							}

							this.$confirm(`确认要删除该角色组：${row.fullname}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
								let _csrf = window.CsrfToken;
								let rtn = userHandler.deleteGroupPermissions(row,_csrf);
                                
                                if(rtn == 1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除成功!'
									});
									
									_.delay(()=>{
										self.onRefresh();
									},500)
									
                                } else {
									this.$message({
                                        type: 'error',
                                        message: '删除失败: ' + rtn
                                    });
								}
                            }).catch(() => {
                                
                            });
						},
						initNodes() {
							this.tree.nodes = fsHandler.callFsJScript("/matrix/system/getRoleGroupTree.js",null).message;
						},
						onNodeClick(node){
							this.onForward(row.fullname);
						},
						onNodeExpand(node){
							
						},
						onMouseEnter(data){
							this.$set(data, 'show', true)
						},
						onMouseLeave(data){
							this.$set(data, 'show', false)
						},
						// 更新角色组合用户关联
						onUpdatePermission(row){
							
							let rtn = userHandler.updateGroupPermissions(row);
							if(rtn == 1){
								this.$message({
									type: "success",
									message: "更新成功！"
								})
								this.dialog.ldap.show = false;
							} else {
								this.$message({
									type: "error",
									message: "更新失败！"
								})
							}
						},
						// 更新角色组的用户
						onSetRoleGroupByLdap(row,event){
							
							_.forEach(event,(v)=>{
								if(v.checked){
									row.member.push( 'U'+v.fullname );
								} else {
									_.pull(row.member, 'U'+v.fullname);
								}
							});

						},
						// 更新角色组的子角色组
						onSetRoleGroupByRoleGroup(row,event){
							
							let roleGroups = _.map(event,(v)=>{ return 'G'+ v.fullname; });
							
							row.member = _.filter(row.member,(v)=>{
								if(!_.startsWith(v,'G')){
									return v;
								}
							});
							
							row.member = _.filter(_.uniq( _.concat( row.member, roleGroups ) ), null);
							
						},
						// 当前角色组授权
						onSetPermission(row){
							this.$set(this.dialog.permission, 'row', row);
							this.dialog.permission.show = true;
						},
						// 当前角色组关联ldap
						onSetLdap(row){
							this.$set(this.dialog.ldap, 'row',row);
							this.dialog.ldap.show = true;
						}

					}
				})

				// 用户、权限管理
				Vue.component('user-manage',{
					delimiters: ['${', '}'],
					data(){
						return {
							selectedNode: null,
							model:{
								rows: [],
								columns: [
											{"field":"email",title:"邮件"},
											{"field":"username",title:"用户名"},
											{"field":"passwd",title:"口令", visible:false},
											{"field":"parent",title:"组"},
											{"field":"isactive",title:"状态", render:`var s=function(row, column, cellValue, index){
												return cellValue ? "正常" : "禁用";
											};eval(s);`},
											{"field":"fullname", title:"操作", visible:false}]
							},
							tabs: {
								main: {
									activeName: 'users'
								}
							},
							splitInst: null
						}
					},
					template: 	`<el-container style="height:100%;" class="user-manage-container">
									<el-main style="padding:0px;overflow:hidden;">
										<el-tabs v-model="tabs.main.activeName" type="border-card">
											<el-tab-pane label="用户管理" name="users">
												<el-container style="height:calc(100% - 40px);">
													<el-aside style="width:260px;height:100%;background:#f2f2f2;" ref="leftView">
														<ldap-manage root="/" @update:selectedNode="onLoadUser($event)" ref="ldapManage"></ldap-manage>
													</el-aside>
													<el-container style="height: 100%;" ref="mainView">
														<el-main style="padding:0px;overflow:hidden;">
															<user-list :model="model" ref="userList"></user-lis>
														</el-main>
													</el-container>
												</el-container>
											</el-tab-pane>
											<el-tab-pane label="角色管理" name="role" lazy>
												<el-container style="height:100%;">
													<el-main style="padding:0px;">
														<user-roleGroup :checkSelect="false"></user-roleGroup>
													</el-main>
												</el-container>
											</el-tab-pane>
										</el-tabs>
									</el-main>
								</el-container>`,
					created(){
						this.onLoadUser("");
					},
					mounted(){
						this.$nextTick(()=>{
							this.initSplit();
						})
					},
					methods: {
						initSplit(){
							
							this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
								sizes: [20, 80],
								minSize: [0, 0],
								gutterSize: 5,
								cursor: 'col-resize',
								direction: 'horizontal'
							});

						},
						onLoadUser(event) {
							this.selectedNode = event;
							this.model.rows = _.map(userHandler.userList(event.fullname).message, (v)=>{
								return _.extend( {grpset:[]},  v);
							});
						}
					}
				})

				/* * * * * * * * * * * * * * *  Grok变量管理 * * * * * * * * * * * * * * * * * * * * * * * * * * * *  */

				// Grok变量管理
				Vue.component('grok-manage',{
					delimiters: ['#{', '}#'],
					data(){
						return {
							dt:{
								rows: [],
								columns: [],
								selected: [],
								pagination:{
									pageSize: 10,
									currentPage: 1
								}
							}
						}
					},
					template: 	`<el-container style="height:100%;">
									<el-header style="height:30px;line-height:30px;">
										<h4 style="margin:0px;">解析规则</h4>
									</el-header>
									<el-main style="height:100%;padding:0px;overflow:hidden;">
										<el-table
											:data="dt.rows.slice((dt.pagination.currentPage - 1) * dt.pagination.pageSize,dt.pagination.currentPage * dt.pagination.pageSize)"
											stripe
											highlight-current-row
											fit="true"
											style="width: 100%"
											:row-class-name="rowClassName"
											:header-cell-style="headerRender"
											@current-change="onSelectionChange">
											<el-table-column type="index" label="序号" sortable align="center">
												<template slot-scope="scope">
													<div style="width:100%; text-align: center;"> <b> #{ (scope.$index + 1) + (dt.pagination.currentPage - 1) * dt.pagination.pageSize }# </b> </div>
												</template>
											</el-table-column>
											<!--el-table-column type="selection" align="center">
											</el-table-column--> 
											<el-table-column type="expand">
												<template slot-scope="props">
													<el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f2f2f2;" >
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
									<el-footer style="height:40px;line-height:40px;">
										<!--#{ info.join(' &nbsp; | &nbsp;') }#-->
										<el-pagination
											style="padding: 8px 0px;"
											@size-change="onPageSizeChange"
											@current-change="onCurrentPageChange"
											:page-sizes="[10, 15, 20]"
											:page-size="dt.pagination.pageSize"
											:total="dt.rows.length"
											layout="total, sizes, prev, pager, next">
										</el-pagination>
									</el-footer>
								</el-container>`,
					created(){
						this.initData();
					},
					methods: {
						onPageSizeChange(val) {
							console.log(1,val)
							this.dt.pagination.pageSize = val;
						},
						onCurrentPageChange(val) {
							console.log(2,val)
							this.dt.pagination.currentPage = val;
						},
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


				/* * * * * * * * * * * * * * *  应用管理 * * * * * * * * * * * * * * * * * * * * * * * * * * * *  */

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

								// 刷新应用缓存，针对应用权限过滤
								userHandler.refreshAppCache();
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

								// 刷新应用缓存，针对应用权限过滤
								userHandler.refreshAppCache();
							}
						},
						remove(event) {
							
							alertify.confirm(`确定要删除？<br><br> ${event}`, (e)=> {
								if (e) {
									let _mql = `delete from /matrix/portal/tools where name='${event}'`;
									let rtn = omdbHandler.fetchDataByMql(_mql);
									if(rtn.status === 'ok'){
										this.init();

										// 刷新应用缓存，针对应用权限过滤
										userHandler.refreshAppCache();
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


				/* * * * * * * * * * * * * * *  日历管理 * * * * * * * * * * * * * * * * * * * * * * * * * * * *  */

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
									<el-main style="padding:0px;overflow:hidden;" ref="mainView">
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