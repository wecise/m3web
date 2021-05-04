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
				
				// 公司管理
				Vue.component("company-manage",{
					delimiters: ['#{', '}#'],
					props: {
						id: String
					},
					template: 	`<el-container style="height:100%;">
									
									<el-header style="text-align: right; font-size: 12px;height:30px;line-height:30px;" v-if="window.COMPANY_OSPACE == 'matrix' && window.SignedUser_IsAdmin">
										<span style="float:right;">
											<el-tooltip content="刷新列表">
												<el-button type="text" icon="el-icon-refresh" @click="initData">刷新</el-button>
											</el-tooltip>
											<el-tooltip content="新增公司信息">
												<el-button type="text" icon="el-icon-plus" @click="companyNew" >新增</el-button>
											</el-tooltip>
											<!--el-tooltip content="更新文件系统">
												<el-button type="text" icon="el-icon-files" @click="updateFs">更新</el-button>
											</el-tooltip-->
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
											<el-table-column label="操作" width="130" fixed="right" v-if="window.COMPANY_OSPACE == 'matrix' && window.SignedUser_IsAdmin">
												<template slot-scope="scope">
													<div>
														<el-tooltip content="更新公司信息" open-delay="800" placement="top">
															<el-button type="text" icon="el-icon-edit" @click="onCompanyUpdate(scope.row)"></el-button>
														</el-tooltip>
														<el-tooltip content="删除公司信息" open-delay="800" placement="top">
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
								companyHandler.companyListAsync().then( (rtn)=>{
									let rows = [];
									
									if( window.COMPANY_OSPACE == 'matrix' ){
										rows = rtn.message;
									} else {
										rows = _.filter(rtn.message,(v)=>{
											return v.ospace == window.COMPANY_OSPACE;
										})
									}

									
									
									_.extend(this.dt, { rows: rows });
									
									this.dt.rows = _.map(this.dt.rows,(v)=>{
										return _.extend(v,{enableFlag: '0'});
									});
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
														<el-form-item label="英文简称">
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
													h('p', null, `英文简称：${me.form.ospace}`),
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
														<el-form-item label="公司全称(Fullname)">
															<el-input v-model="form.fullname" placeholder="公司全称" clearable></el-input>
														</el-form-item>
														<el-form-item label="名称(Name)">
															<el-input v-model="form.name" placeholder="公司简称" clearable></el-input>
														</el-form-item>
														<el-form-item label="英文简称(Ospace)">
															<el-input v-model="form.ospace" placeholder="英文简称" clearable></el-input>
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
										
										if(_.isEmpty(me.form.fullname)){
											me.$message.warning("请输入公司全称");
											return false;
										}
										if(_.isEmpty(me.form.name)){
											me.$message.warning("请输入公司名称");
											return false;
										}
										if(_.isEmpty(me.form.ospace)){
											me.$message.warning("请输入英文简称");
											return false;
										}
										if(_.isEmpty(me.form.title)){
											me.$message.warning("请输入系统标题");
											return false;
										}
										if(_.isEmpty(me.form.logo)){
											me.$message.warning("请上传Logo");
											return false;
										}
										
										const h = this.$createElement;
										this.$msgbox({
												title: `确定要新建该公司`, 
												message: h('span', null, [
													h('p', null, `公司全称：${me.form.fullname}`),
													h('p', null, `公司名称：${me.form.name}`),
													h('p', null, `英文简称${me.form.ospace}`),
													h('p', null, `标题：${me.form.title}`)
												]),
												showCancelButton: true,
												confirmButtonText: '确定',
												cancelButtonText: '取消',
												type: 'warning'
										}).then(() => {

											let rtn = companyHandler.companyNew(me.form);
												
											me.$message({
												type: "info",
												message: "新建操作将提交至后台，请稍后刷新确认。。。"
											});

											if(rtn == 1){
												self.initData();
											}
											
											wnd.close();

										}).catch(() => {
											me.$message({
												type: "info",
												message: "新建操作已取消"
											});	
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
									title: `确定要删除该公司租户`, 
									message: h('span', null, [
										h('p', {style: "font-weight:900;"}, `公司全称(Fullname)：${row.fullname}`),
										h('p', {style: "font-weight:900;"}, `公司名称(Name)：${row.name}`),
										h('p', {style: "font-weight:900;"}, `英文简称(Ospace)：${row.ospace}`),
										h('p', {style: "font-weight:900;"}, `标题(Title)：${row.title}`),
										h('h3', {style: "color:#ff0000;font-weight:900;"}, `特别提醒，删除公司租户，将删除该公司下所有相关的数据，请再次确认!`)
									]),
									showCancelButton: true,
									dangerouslyUseHTMLString: true,
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									type: 'error'
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
								children: 'nodes',
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
									validPasswd: 0,
									show: false,
									ldap: {
										parent: "", 
										username: "",
										firstname: "",
										lastname: "",
										passwd: "",
										isactive: true,
										isadmin: false,
										otype: 'usr',
										address: "",
										wechat: ""            
									},
									email: "",
									mobile: "",
									telephone: "",
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
											auto-expand-parent
											highlight-current
											:data="nodes" 
											:props="defaultProps" 
											:filter-node-method="onFilterNode"
											:expand-on-click-node="false"
											@node-click="onNodeClick"
											style="background: transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)" v-if="data.otype=='org'">
												<span v-if="data.otype=='org'">
													<span class="el-icon-school" style="color:#FF9800;"></span>
													<span v-if="data.username === '/'">#{window.COMPANY_FULLNAME}#</span><span v-else>#{node.label}# (#{data | pickCount}#)</span>
													<el-button v-show="data.show" type="text" @click="onDeleteUser(node, data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete" v-if="!_.includes(['/system','/'],data.fullname)"></el-button>
													<el-button v-show="data.show" type="text" @click="onNewUser(data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-plus"></el-button>
													<el-button v-show="data.show" type="text" @click="onNewGroup(data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-folder-add"></el-button>
													<el-button v-show="data.show" type="text" @click="onRefresh(data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-refresh"></el-button>
												</span>
												<span v-else>
													<span class="el-icon-user" style="color:#67c23a;"></span>
													<span>#{node.label}#</span>
													<el-button v-show="data.show" type="text" @click="onDeleteUser(node, data)" style="float:right;width:14px;margin:0 5px;" icon="el-icon-delete" v-if="data.username != 'admin'"></el-button>
												</span>
											</span>                  
										</el-tree>
										<el-dialog title="新建组织" :visible.sync="dialog.group.show" v-if="dialog.group.show" 
											:close-on-press-escape="false"
											:close-on-click-modal="false">
											<el-container>
												<el-main>
													<el-form ref="form" label-width="80px" size="mini">

														<el-form-item label="父组织名称">
															<el-input v-model="dialog.group.parent" disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="组织名称">
															<el-input v-model="dialog.group.username" autofocus clearable></el-input>
														</el-form-item>
														
													</form>
												</el-main>
											</el-container>
											<div slot="footer" class="dialog-footer">
												<el-button type="default" @click="dialog.group.show = false;">关闭</el-button>
												<el-button type="primary" icon="el-icon-" @click="onSaveGroup">创建组</el-button>
											</div>
										</el-dialog>
										<el-dialog title="新建用户" :visible.sync="dialog.user.show" v-if="dialog.user.show" 
											:close-on-press-escape="false"
											:close-on-click-modal="false">
											<el-container>
												<el-main>
													<el-form ref="newUserForm" label-width="80px">

														<el-form-item label="组织名称" required>
															<el-input v-model="dialog.user.ldap.parent" autofocus disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="登录名称" required>
															<el-input v-model="dialog.user.ldap.username" autocomplete="off"></el-input>
														</el-form-item>

														<el-form-item label="登录密码" required>
															<el-input type="password" v-model="dialog.user.ldap.passwd" autocomplete="off" show-password @blur="onPasswordVaild($event)">
																<template v-if="dialog.user.validPasswd>0">
																	<el-button slot="append" type="success" icon="el-icon-check" style="background: #67c23a;color: #fff;" v-if="dialog.user.validPasswd==1">
																		密码设置安全
																	</el-button>
																	<el-button slot="append" type="error" style="background: #ffa500;color: #fff;" icon="el-icon-warning" v-else>
																		密码设置安全级别过低，建议由数字、符号、字母组合设立
																	</el-button>
																</template>
															</el-input>
														</el-form-item>
														
														<el-form-item label="确认密码" required>
															<el-input type="password" v-model="dialog.user.checkPass" autocomplete="off" show-password></el-input>
														</el-form-item>

														<el-form-item label="姓名">
															<el-input v-model="dialog.user.ldap.firstname" placeholder="姓" style="width:30%;"></el-input>
															<el-input v-model="dialog.user.ldap.lastname" placeholder="名" style="width:30%;"></el-input>
														</el-form-item>

														<el-form-item label="邮箱"
																	:rules="[
																	{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
																	]" required>
															<el-input v-model="dialog.user.email"></el-input>
														</el-form-item>

														<el-form-item label="手机">
															<el-input v-model="dialog.user.mobile" autocomplete="off"></el-input>
														</el-form-item>

														<el-form-item label="微信">
															<el-input v-model="dialog.user.ldap.wechat" autocomplete="off"></el-input>
														</el-form-item>

														<el-form-item label="座机">
															<el-input v-model="dialog.user.telephone" autocomplete="off"></el-input>
														</el-form-item>

														<el-form-item label="地址">
															<el-input type="textarea" v-model="dialog.user.ldap.address" autocomplete="off"></el-input>
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
												<el-button type="primary" @click="onSaveUser" v-else :disabled="dialog.user.validPasswd==2">创建用户</el-button>
											</div>
										</el-dialog>
									</el-main>
								</el-container>`,
					filters:{
						pickCount(data){
							try{
								return data.nodes.length;
							} catch(err){
								return 0;
							}
						}
					},
					created(){
						this.initNodes();

						// 刷新当前节点的用户列表
						eventHub.$on("REFRESH-LDAP-LIST",()=>{
							this.$emit('update:selectedNode', this.$refs.tree.getCurrentNode());
						});
					},
					watch: {
						nodes:{
							handler(val,oldVal){
								// 只显示组织
								if(this.$refs.tree){
									this.$refs.tree.filter('org');	
								}
							}
						}
					},
					methods:{
						onRefresh(data){
							this.initNodes();
						},
						initNodes() {
							
							try{
								userHandler.userListAsync("/").then( (rtn)=>{
									this.nodes = [rtn.message];
									// 首次赋值给LDAP-LIST
									this.$emit('update:selectedNode', _.first(this.nodes));
								} );
							} catch(err){

							} 

						},
						onFilterNode(value, data){
							return data.otype.indexOf(value) !== -1
						},
						onNodeClick(node){
							this.$emit('update:selectedNode', node);
						},
						onMouseEnter(data){
							this.$set(data, 'show', true);
							this.$refs.tree.setCurrentKey(data.fullname);
						},
						onMouseLeave(data){
							this.$set(data, 'show', false);
						},
						onDeleteUser(node,data){
							
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
                                
                                let rtn = userHandler.userDelete(data);
                                
                                if(rtn == 1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除成功!'
									});
									
									// 清除对象_group中的角色组信息
									fsHandler.callFsJScriptAsync("/matrix/system/clearRoleGroupInstAfterDeleteRoleGroup.js",encodeURIComponent(data.fullname));

									// 清除对象UI选择实例
									fsHandler.fsDeleteAsync("/matrix/system/group/tagdir",data.id);

									_.delay(()=>{
										// 更新Ldap树
										const parent = node.parent;
										const children = parent.data.nodes || parent.data;
										const index = children.findIndex(d => d.id === data.id);
										children.splice(index, 1);
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
						onNewUser(row){
							this.selectedNode = row;
							this.dialog.user.validPasswd = 0;
							this.dialog.user.show = true;
							this.dialog.user.ldap.parent = !_.isEmpty(row.fullname) ? row.fullname : '/';
							this.$nextTick(() => {
								this.dialog.user.ldap.username = "";
								this.dialog.user.ldap.passwd = "";
								this.dialog.user.ldap.isactive = true;
								this.dialog.user.ldap.isadmin = false;
								this.dialog.user.ldap.otype = 'usr';
								this.dialog.user.ldap.firstname = "";
								this.dialog.user.ldap.lastname = "";
								this.dialog.user.ldap.address = "";
								this.dialog.user.ldap.wechat = "";
								this.dialog.user.email = "";
								this.dialog.user.mobile = "";
								this.dialog.user.telephone = "";
								this.dialog.user.checkPass = "";
							})
						},
						onNewGroup(row){
							this.selectedNode = row;
							this.dialog.group.show = true;
							this.dialog.group.parent = !_.isEmpty(row.fullname) ? row.fullname : '/';
							this.$nextTick(() => {
								this.dialog.group.username = "";
							})
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
									this.onRefresh(this.selectedNode);
									this.dialog.group.show = false;
								},500);

							} else {
								this.$message({
									type: 'error',
									message: '添加失败 ' + rtn
								});
								return false;
							}
						},
						onSaveUser(){
										
							if (_.isEmpty(this.dialog.user.ldap.username)) {
								
								this.$message({
									type: "warning",
									message: `登录名称不能为空！`
								})
								return false;
							}

							if (_.isEmpty(this.dialog.user.email)) {
								this.$message({
									type: "warning",
									message: `用户邮件不能为空！`
								})
								return false;
							}

							
							/* let checkEmail = function(email){
								let regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
								let emails = email.split(",");
								let rtn = [];

								_.forEach(emails,(v)=>{
									rtn.push(regEmail.test(v));
								})
								return _.includes(rtn,false);
							}
							
							if( checkEmail(this.dialog.user.email) ){
								this.$message({
									type: "warning",
									message: `用户邮件格式不正确！`
								})
								return false;
							} */

							if (_.isEmpty(this.dialog.user.ldap.passwd)) {
								this.$message({
									type: "warning",
									message: `登录密码不能为空！`
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

							// emial
							this.$set(this.dialog.user.ldap,'email',this.dialog.user.email.split(","));
							// mobile
							this.$set(this.dialog.user.ldap,'mobile',this.dialog.user.mobile.split(","));

							this.dialog.user.loading = true;

							_.delay(()=>{
								
								let _csrf = window.CsrfToken.replace(/'/g,"");
								let rtn = userHandler.userAdd(this.dialog.user.ldap, _csrf);

								if(rtn == 1){
									
									this.$message({
										type: "success",
										message: `${this.dialog.user.ldap.username} ${this.dialog.user.email} 添加成功！`
									})
									
									this.dialog.user.loading = false;

									_.delay(()=>{
										this.initNodes;
										this.$emit('update:selectedNode', this.selectedNode);
										this.dialog.user.show = false;
									},500);

								} else {
									this.$message({
										type: "error",
										message: `${this.dialog.user.ldap.username} ${this.dialog.user.email} 添加失败 ` + rtn
									})
									
									this.dialog.user.loading = false;
								}
							},500)

						},
						onPasswordVaild(evt){
                            userHandler.passwordVaild(evt.target.value).then((rtn)=>{
                                if(rtn === 1){
                                    this.dialog.user.validPasswd = 1;
                                } else {
                                    this.dialog.user.validPasswd = 2;
                                }
                            });
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
								children: 'nodes',
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
											highlight-current
											:data="nodes" 
											:props="defaultProps" 
											:default-checked-keys="selectedNodes"
											:default-expanded-keys="selectedNodes"
											:expand-on-click-node="false"
											:check-on-click-node="false"
											@check-change="onCheckChange"
											check-strictly="true"
											show-checkbox
											style="background: transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;">
												<span v-if="data.otype=='org'">
													<span class="el-icon-school" style="color:#FF9800;"></span>
													<span v-if="data.username === '/'">#{window.COMPANY_FULLNAME}#</span><span v-else>#{node.label}#</span>
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

							try{

								const traverse = (obj) => {
									
									_.forEach(obj,(v)=>{
										
										let disabled = false;

										if( v ){
											
											// 禁止admin权限操作
											if(v.fullname == '/admin'){
												disabled = true;
												this.selectedNodes.push(v.fullname);
											}

											// LDAP 当前组织不能删除
											if(this.rowData.isldap ){
												disabled = true;

												// 设置已选择项 需要勾选子节点  111111
												// this.selectedNodes.push(v.fullname);
											}

											// 设置已选择项 需要勾选子节点   111111
											if( _.startsWith(v.fullname, this.rowData.fullname+"/") ) {
												this.selectedNodes.push(v.fullname);
											}

											_.extend(v,{ show:false, disabled:disabled });

										}
										
										if(v.nodes){
											traverse(v.nodes);
										}
									})
									
								}

								this.nodes = _.sortBy([userHandler.userList("/").message],'fullname');

								traverse(this.nodes);

							} catch(err){

							} finally{
								
								// 设置已选择项 需要勾选子节点  111111
								_.forEach(this.rowData.member,(v)=>{
									self.selectedNodes.push(v.replace(/^['G','U','O']/g,''));
								})
							}

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

								selectedNodes.push(data,data.length);
								
								this.$emit('update:selectedLdap', selectedNodes);
							} catch(err){
								console.error(err)
							}
						}
					}
				})

				// ldap组织更换选择使用
				Vue.component("ldap-manage-move",{
					delimiters: ['#{', '}#'],
					props:{
						rowData: Object,
						root:String
					},
					data(){
						return {
							defaultProps: {
								children: 'nodes',
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
											highlight-current
											:data="nodes" 
											:props="defaultProps" 
											:filter-node-method="onFilterNode"
											:expand-on-click-node="false"
											@node-click="onNodeClick"
											style="background: transparent;"
											ref="tree">
											<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;">
												<span v-if="data.otype=='org'">
													<span class="el-icon-school" style="color:#FF9800;"></span>
													<span v-if="data.username === '/'">#{window.COMPANY_FULLNAME}#</span><span v-else>#{node.label}#</span>
												</span>
												<span v-else>
													<span class="el-icon-user" style="color:#67c23a;"></span>
													<span>#{node.label}#</span>
												</span>
											</span>                  
										</el-tree>
									</el-main>
								</el-container>`,
					watch: {
						nodes:{
							handler(val,oldVal){
								// 只显示组织
								this.$refs.tree.filter('org');
							},
							deep:true
						}
					},
					created(){
						this.initNodes();
					},
					methods:{
						initNodes() {
							const self = this;

							try{

								const traverse = (obj) => {
									
									_.forEach(obj,(v)=>{
										
										let disabled = false;

										if( v ){
											
											// 禁止admin权限操作
											if(v.fullname == '/admin'){
												disabled = true;
												this.selectedNodes.push(v.fullname);
											}

											// LDAP 当前组织不能删除
											if(this.rowData.isldap ){
												disabled = true;

												// 设置已选择项 需要勾选子节点  111111
												// this.selectedNodes.push(v.fullname);
											}

											// 设置已选择项 需要勾选子节点   111111
											if( _.startsWith(v.fullname, this.rowData.fullname+"/") ) {
												this.selectedNodes.push(v.fullname);
											}

											_.extend(v,{ show:false, disabled:disabled });

										}
										
										if(v.nodes){
											traverse(v.nodes);
										}
									})
									
								}

								// 只显示组织
								this.nodes = _.sortBy([userHandler.userList("/").message],'fullname');

								traverse(this.nodes);

							} catch(err){

							} finally{
								
								// 设置已选择项 需要勾选子节点  111111
								if( this.rowData ){
									_.forEach(this.rowData.member,(v)=>{
										self.selectedNodes.push(v.replace(/^['G','U','O']/g,''));
									})
								}
							}

						},
						onFilterNode(value, data){
							return data.otype.indexOf(value) !== -1
						},
						onNodeClick(data){
							this.$emit('update:selectedLdapToMove', data);
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
                                    pageSize: 20,
                                    currentPage: 1
                                },
								term: ""
							},
							info: [],
							dialog: {
								user: {
									show: false,
									row: null,
									passwd: "",
									checkPasswd: "",
									resetPasswd: false,
									changeGroup: {
										change: false,
										user: null,
										newGroup: null
									},
									validPasswd: 0
								}
							}
						}
					},
					template:   `<el-container style="width:100%;height:100%;">
									<el-header style="height:30px;line-height:30px;">
										<el-tooltip content="切换视图" open-delay="800" placement="top">
											<el-button type="text" icon="el-icon-s-fold" @click="onTogglePanel"></el-button>
										</el-tooltip>
										<el-tooltip content="刷新" open-delay="800" placement="top">
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
											<!--el-table-column type="selection" align="center"></el-table-column--> 
											<el-table-column align="center">
												<template slot-scope="scope">
													<i class="el-icon-office-building el-avatar el-avatar--48 el-avatar--circle" style="font-size:32px;color:#03a9f4;" v-if="scope.row.otype==='org'"></i>
													<i class="el-icon-user el-avatar el-avatar--48 el-avatar--circle" style="font-size:32px;color:#ffffff;background:#ff9800" v-else-if="scope.row.otype!=='org' && scope.row.isadmin"></i>
													<i class="el-icon-user el-avatar el-avatar--48 el-avatar--circle" style="font-size:32px;color:#ffffff;background:#2196F3;" v-else></i>
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
														<div v-else-if="_.includes(['email','mobile','telephone'],item.field)">
															<el-select :value="_.first(scope.row[item.field])" v-if="!_.isEmpty(scope.row[item.field])" :placeholder="item.field">
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
											<el-table-column label="操作" width="160">
												<template slot="header" slot-scope="scope">
													<el-input v-model="dt.term" placeholder="关键字" clearable></el-input>
												</template>
												<template slot-scope="scope">
													<div v-if="_.includes(['/','system','admin'],scope.row.username)">
														
													</div>
													<div v-else-if="scope.row.otype=='usr'">
														<!--el-tooltip content="授权" open-delay="800" placement="top">
															<el-button type="text" icon="el-icon-s-check" @click="onToogleExpand(scope.row, scope.$index, 'userPermission')"></el-button>
														</el-tooltip-->
														<el-tooltip content="编辑" open-delay="800" placement="top">
															<el-button type="text" icon="el-icon-edit" @click="onUpdateUser(scope.row,scope.$index)"></el-button>
														</el-tooltip>
														<el-tooltip content="删除" open-delay="800" placement="top">
															<el-button type="text" @click="onDeleteUser(scope.row, scope.$index)" icon="el-icon-delete" v-if="!_.includes(['/系统组','/'],scope.row.fullname)"></el-button>
														</el-tooltip>
													</div>
													<div v-else>
														<!--el-tooltip content="授权" open-delay="800" placement="top">
															<el-button type="text" icon="el-icon-s-check" @click="onToogleExpand(scope.row, scope.$index, 'userPermission')"></el-button>
														</el-tooltip-->
														<el-tooltip content="新建组织" open-delay="800" placement="top">
															<el-button type="text" @click="$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.ldapManage.onNewGroup(scope.row,$event)" icon="el-icon-folder-add"></el-button>
														</el-tooltip>
														<el-tooltip content="新建用户" open-delay="800" placement="top">
															<el-button type="text" @click="$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.ldapManage.onNewUser(scope.row,$event)" icon="el-icon-plus"></el-button>
														</el-tooltip>
														<el-tooltip content="编辑" open-delay="800" placement="top">
															<el-button type="text" icon="el-icon-edit"  @click="onUpdateUser(scope.row,scope.$index)"></el-button>
														</el-tooltip>
														<el-tooltip content="删除" open-delay="800" placement="top">
															<el-button type="text" @click="onDeleteUser(scope.row,scope.$index)" icon="el-icon-delete" v-if="!_.includes(['/系统组','/'],scope.row.fullname)"></el-button>
														</el-tooltip>
													</div>
												</template>
											</el-table-column>
										</el-table>
										<el-dialog :title="'用户编辑 ' + dialog.user.row.username" :visible.sync="dialog.user.show" 
											:close-on-press-escape="false"
											:close-on-click-modal="false"
											v-if="dialog.user.show">
											<el-container>
												<el-main>
													<el-form label-width="80px">

														<el-form-item label="组名称" required>
															<el-input v-model="dialog.user.row.parent">
																<el-dropdown slot="prepend" trigger="hover">
																	<span class="el-dropdown-link">
																	更换组<i class="el-icon-arrow-down el-icon--right"></i>
																	</span>
																	<el-dropdown-menu slot="dropdown">
																		<el-dropdown-item>
																			<ldap-manage-move root="/" @update:selectedLdapToMove="(($event)=>{ onUserGroupMoved(dialog.user.row,$event); })" ref="ldapManageMove"></ldap-manage-move>
																		</el-dropdown-item>
																	</el-dropdown-menu>
																</el-dropdown>
															</el-input>
														</el-form-item>

														<el-form-item label="登录名称" required>
															<el-input v-model="dialog.user.row.username" disabled="true"></el-input>
														</el-form-item>

														<el-form-item label="重置密码">
															<el-switch v-model="dialog.user.resetPasswd"></el-switch>
														</el-form-item>

														<el-form-item label="登录密码" required v-if="dialog.user.resetPasswd">
															<el-input type="password" v-model="dialog.user.passwd" autocomplete="off" show-password @blur="onPasswordVaild($event)">
																<template v-if="dialog.user.validPasswd>0">
																	<el-button slot="append" type="success" icon="el-icon-check" style="background: #67c23a;color: #fff;" v-if="dialog.user.validPasswd==1">
																		密码设置安全
																	</el-button>
																	<el-button slot="append" type="error" style="background: #ffa500;color: #fff;" icon="el-icon-warning" v-else>
																		密码设置安全级别过低，建议由数字、符号、字母组合设立
																	</el-button>
																</template>
															</el-input>
														</el-form-item>

														<el-form-item label="确认密码" required v-if="dialog.user.resetPasswd">
															<el-input type="password" v-model="dialog.user.checkPasswd" autocomplete="off" show-password></el-input>
														</el-form-item>

														<el-form-item label="姓名">
															<el-input v-model="dialog.user.row.firstname" autofocus placeholder="姓" style="width:30%;"></el-input>
															<el-input v-model="dialog.user.row.lastname" placeholder="名" style="width:30%;"></el-input>
														</el-form-item>
														
														<el-form-item label="邮箱" required>
															<el-input v-model="dialog.user.row.email"></el-input>
														</el-form-item>

														<el-form-item label="手机">
															<el-input v-model="dialog.user.row.mobile"></el-input>
														</el-form-item>

														<el-form-item label="座机">
															<el-input v-model="dialog.user.row.telephone"></el-input>
														</el-form-item>

														<el-form-item label="微信">
															<el-input v-model="dialog.user.row.wechat"></el-input>
														</el-form-item>

														<el-form-item label="地址">
															<el-input type="textarea" v-model="dialog.user.row.address"></el-input>
														</el-form-item>
														
														<el-form-item label="激活">
															<el-switch v-model="dialog.user.row.isactive" true-value="true" false-value="false"></el-switch>
														</el-form-item>

														<el-form-item label="管理员">
															<el-switch v-model="dialog.user.row.isadmin" true-value="true" false-value="false"></el-switch>
														</el-form-item>

													</form>
												</el-main>
											</el-container>
											<div slot="footer" class="dialog-footer">
												<el-button type="default" @click="dialog.user.show = false;">关闭</el-button>
												<el-button type="primary" @click="onSaveUser(dialog.user.row)" :disabled="dialog.user.resetPasswd && dialog.user.validPasswd==2">更新用户</el-button>	
											</div>
										</el-dialog>
									</el-main>
									<el-footer  style="height:30px;line-height:30px;">
										<!--#{ info.join(' &nbsp; | &nbsp;') }#-->
										<el-pagination
                                            @size-change="onPageSizeChange"
                                            @current-change="onCurrentPageChange"
                                            :page-sizes="[10, 15, 20, 50, 100, 300]"
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
								this.dt.pagination.currentPage = 1;
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
						},
						'dt.term':{
							handler(val){
								if(_.isEmpty(val)){
									this.initData();
								} else {
									this.dt.rows = this.dt.rows.filter(data => !val || data.name.toLowerCase().includes(val.toLowerCase()));
								}
							}
						},
						'dialog.user.resetPasswd'(val){

						}
					},
					methods: {
						onPageSizeChange(val) {
                            this.dt.pagination.pageSize = val;
                        },
                        onCurrentPageChange(val) {
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
						onRefresh(){
							eventHub.$emit("REFRESH-LDAP-LIST");
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
									console.error(err);
								}
							};
	
							if($("table",this.$el).is(':visible')){
                                init();
                            } else {
                                setTimeout(init,50);
                            }
							
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
						onDeleteUser(data,index){

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

							const h = this.$createElement;
							this.$msgbox({
									title: `确认要删除该用户`, 
									message: h('span', null, [
										h('p', null, `用户名称：${data.username}`),
										h('p', null, `用户全称：${data.fullname}`)
									]),
									showCancelButton: true,
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									type: 'warning'
							}).then(() => {

								let rtn = userHandler.userDelete(data);
                                
                                if(rtn == 1){
                                    this.$message({
                                        type: 'success',
                                        message: '删除成功!'
									});
									
									// 清除对象_group中的角色组信息
									fsHandler.callFsJScriptAsync("/matrix/system/clearRoleGroupInstAfterDeleteRoleGroup.js",encodeURIComponent(data.fullname));

									_.delay(()=>{
										// 更新Ldap树
										this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.ldapManage.onRefresh(data);
										// 更新Table
										this.dt.rows.splice(index, 1);
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
						onUpdateUser(row,index){
							this.dialog.user.row = row;
							this.dialog.user.resetPasswd = false;
							this.dialog.user.passwd = "";
							this.dialog.user.checkPasswd = "";
							this.dialog.user.show = true;
							this.dialog.user.validPasswd = 0;
						},
						onUserGroupMoved(user,newGroup){
							
							this.dialog.user.row.parent = newGroup.fullname;
							this.dialog.user.changeGroup.change = true;
							this.dialog.user.changeGroup.user = user;
							this.dialog.user.changeGroup.newGroup = newGroup;

							/* this.$confirm(`确认要更新该用户到新组：${newGroup.fullname}？`, '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							}).then(() => {
									
								userHandler.userGruopUpdateAsync(user, newGroup).then( (rtn)=>{
									if(rtn.status == 1){
										this.$message({
											type: "success",
											message: "更新组成功"
										})

										this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.ldapManage.onRefresh();
										this.dialog.user.row.id = rtn.id;
										this.dialog.user.row.parent = newGroup.fullname;
										
									} else{
										this.$message({
											type: "error",
											message: "更新组失败 " + rtn
										})
									}
								} )
								
							}).catch(() => {
								
							}); */
							
						},
						onUserGroupMovedAction(user,newGroup){
							
							userHandler.userGruopUpdateAsync(user, newGroup).then( (rtn)=>{
								if(rtn.status == 1){
									/* this.$message({
										type: "success",
										message: "更新组成功"
									}) */

									this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.ldapManage.onRefresh();
									this.dialog.user.row.id = rtn.id;
									this.dialog.user.row.parent = newGroup.fullname;
									
								} else{
									/* this.$message({
										type: "error",
										s
										message: "更新组失败 " + rtn
									}) */
								}

								this.dialog.user.changeGroup.change = false;
								this.dialog.user.changeGroup.user = null;
								this.dialog.user.changeGroup.newGroup = null;
							} )
							
						},
						onSaveUser(row){
							console.log(11,row)
							if(this.dialog.user.resetPasswd){

								if (_.isEmpty(this.dialog.user.passwd)) {
									this.$message({
										type: "warning",
										message: `登录密码不能为空！`
									})
									return false;
								}
	
								if (_.isEmpty(this.dialog.user.checkPasswd)) {
									this.$message({
										type: "warning",
										message: `确认密码不能为空！`
									})
									return false;
								}
	
								if ( this.dialog.user.passwd !== this.dialog.user.checkPasswd) {
									this.$message({
										type: "warning",
										message: `确认密码不一致！`
									})
									return false;
								}

								this.$set(row, 'resetPasswd', this.dialog.user.resetPasswd);
								this.$set(row, 'passwd', this.dialog.user.passwd);
							}
							
							
							if (_.isEmpty(row.email)) {
								this.$message({
									type: "warning",
									message: `邮件不能为空！`
								})
								return false;
							}

							if(typeof row.email == 'string'){
								this.$set(row, 'email', row.email.split(","));
							}

							if(typeof row.mobile == 'string'){
								this.$set(row, 'mobile', row.mobile.split(","));
							}

							if(typeof row.telephone == 'string'){
								this.$set(row, 'telephone', row.telephone.split(","));
							}

							/* let checkEmail = function(email){
								let regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
								let emails = [];
								let rtn = [];
								if(typeof emails == 'object'){
									emails = email;
								} else {
									emails = email.split(",");
								}
								_.forEach(emails,(v)=>{
									rtn.push(regEmail.test(v));
								})
								
								return _.includes(rtn,false);
							}
							
							if( checkEmail(row.email) ){
								this.$message({
									type: "warning",
									message: `邮件格式不正确！`
								})
								return false;
							} */ 


							this.$confirm(`确认要更新该用户：${row.fullname}？`, '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							}).then(() => {

								let _csrf = window.CsrfToken.replace(/'/g,"");
								
								userHandler.userUpdateAsync(row, _csrf).then( (rtn)=>{
									if(rtn == 1){
										this.$message({
											type: "success",
											message: `更新用户: ${row.username} 成功！`
										})
	
										if(this.dialog.user.changeGroup){
											this.onUserGroupMovedAction(this.dialog.user.changeGroup.user,this.dialog.user.changeGroup.newGroup);
										}
	
										this.dialog.user.show = false;
	
										//this.dt.rows[index] = row;
	
									}
								} );

								
								
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
								
								userHandler.updateGroupPermissionsAsync(group);
							})
						},
						onPasswordVaild(evt){
                            userHandler.passwordVaild(evt.target.value).then((rtn)=>{
                                if(rtn === 1){
                                    this.dialog.user.validPasswd = 1;
                                } else {
                                    this.dialog.user.validPasswd = 2;
                                }
                            });
                        }
					}
				})

				/* 标签域管理 */
				Vue.component('domain-manage',{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-header style="line-height:60px;display:flex;">
										<h5 style="margin:0px;" v-if="tree.selected"><i class="el-icon-money"></i>  #{tree.selected.label}#</h5>
										<span style="position: absolute;right: 30px;">
										<el-popover
											placement="top-start"
											title="标题"
											width="200"
											trigger="hover"
											content="从标签目录中提取标签域，并进行初始化。可反复执行。">
											<el-button slot="reference" type="default" icon="el-icon-refresh" @click="onLoad(true)">初始化映射类</el-button>	
										</el-popover>
										
										<el-button type="success" icon="el-icon-plus" @click="onNewDomain">新建映射类</el-button>
										</span>
									</el-header>
									<el-main>
										<el-table
											:data="dt.rows"
											stripe
											border
											style="width: 100%">
											<el-table-column 
												:key="index" 
												v-for="(item,index) in dt.columns"
												:prop="item.field"
												:label="item.title"
												v-if="item.visible">
											</el-table-column>
											<el-table-column
												label="操作"
												width="100">
												<template slot-scope="scope">
													<el-button @click="onDelete(scope.$index,scope.row)" type="text" size="small">删除</el-button>
													<el-button @click="onEdit(scope.$index,scope.row)" type="text" size="small">编辑</el-button>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
									<el-footer style="line-height:60px;">
										标签域: #{_.uniqBy(dt.rows,'name').length}#
									</el-footer>
									<el-dialog title="标签域管理" 
										:visible.sync="dialog.domainAdd.show" 
										:close-on-press-escape="false" 
										:close-on-click-modal="false"
										:destroy-on-close="true" 
										v-if="dialog.domainAdd.show" width="50vw">
										<el-container style="height:100%;">
											<el-main style="overflow:hidden;padding:0px 10px;">
												<el-form ref="form" :model="dialog.domainAdd.data" label-width="80px" v-if="dialog.domainAdd.data">
													<el-form-item label="名称">
														<el-input placeholder="名称" v-model="dialog.domainAdd.data.name">
															<el-select v-model="dialog.domainAdd.data.name" slot="prepend" placeholder="请选择名称">
																<el-option :label="item.name+'('+item.remark+')'" :value="item.name" :key="index" v-for="(item,index) in _.uniqBy(dt.rows,'name')"></el-option>
															</el-select>
														</el-input>
													</el-form-item>
													<el-form-item label="描述">
														<el-input v-model="dialog.domainAdd.data.remark"></el-input>
													</el-form-item>
													<el-form-item label="对应类">
														<el-input v-model="dialog.domainAdd.data.mclass" placeholder="选择对应类"
															clearable
															autofocus>
															<template slot="prepend">
																<el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
																	<el-tooltip content="选则类" open-delay="800">
																		<el-button type="text" size="mini">
																			<i class="el-icon-office-building" style="font-size:16px;"></i>
																		</el-button>
																	</el-tooltip>
																	<el-dropdown-menu slot="dropdown">
																		<el-dropdown-item>
																			<template scope="scope">
																				<mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.domainAdd.data.mclass = data.class; }"></mx-entity-tree>
																			</template>
																		</el-dropdown-item>
																	</el-dropdown-menu>
																</el-dropdown>
															</template>
														</el-input>
													</el-form-item>
												</el-form>
											</el-main>
										</el-container>
										<div slot="footer" class="dialog-footer">
											<el-button type="default" @click="dialog.domainAdd.show = false;">关闭</el-button>
											<el-button type="primary" @click="onSaveDomain(dialog.domainAdd.data)">确定</el-button>
										</div>
									</el-dialog>
									<el-dialog title="编辑标签域" 
										:visible.sync="dialog.domainEdit.show" 
										:close-on-press-escape="false" 
										:close-on-click-modal="false" 
										:destroy-on-close="true" 
										v-if="dialog.domainEdit.show" width="50vw">
										<el-container style="height:100%;">
											<el-main style="overflow:hidden;padding:0px 10px;">
												<el-form ref="form" :model="dialog.domainEdit.data" label-width="80px" v-if="dialog.domainEdit.data">
													<el-form-item label="名称">
														<el-input v-model="dialog.domainEdit.data.name"></el-input>
													</el-form-item>
													<el-form-item label="描述">
														<el-input v-model="dialog.domainEdit.data.remark"></el-input>
													</el-form-item>
													<el-form-item label="对应类">
														<el-input v-model="dialog.domainEdit.data.mclass" placeholder="选择对应类"
															clearable
															autofocus>
															<template slot="prepend">
																<el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
																	<el-tooltip content="选则类" open-delay="800">
																		<el-button type="text" size="mini">
																			<i class="el-icon-office-building" style="font-size:16px;"></i>
																		</el-button>
																	</el-tooltip>
																	<el-dropdown-menu slot="dropdown">
																		<el-dropdown-item>
																			<template scope="scope">
																				<mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.domainEdit.data.mclass = data.class; }"></mx-entity-tree>
																			</template>
																		</el-dropdown-item>
																	</el-dropdown-menu>
																</el-dropdown>
															</template>
														</el-input>
													</el-form-item>
												</el-form>
											</el-main>
										</el-container>
										<div slot="footer" class="dialog-footer">
											<el-button type="default" @click="dialog.domainEdit.show = false;">关闭</el-button>
											<el-button type="primary" @click="onUpdateDomain(dialog.domainEdit.data)">确定</el-button>
										</div>
									</el-dialog>
								</el-container>`,
					data () {
						return {
							tree: {
								data: [],
								defaultProps: {
									children: 'children',
          							label: 'label'
								},
								selected: null
							},
							dt:{
								rows: [],
								columns: [{
									field:"id",
									title: "ID",
									visible: false
								},
								{
									field:"class",
									title: "CLASS",
									visible: false
								},
								{
									field:"name",
									title: "标签域",
									visible: true
								},
								{
									field:"mclass",
									title: "对应类",
									visible: true
								},
								{
									field:"remark",
									title: "备注",
									visible: true
								}],
								selected: []
							},
							dialog: {
								domainAdd: {
									show: false,
									data: {
										name: "",
										remark: "",
										mclass: []
									}
								},
								domainEdit: {
									show: false,
									data: null
								}
							}
						}
					},
					created(){
						this.onLoad(false);
					},
					mounted(){
						
					},
					methods: {
						onLoad(type){
							fsHandler.callFsJScriptAsync("/matrix/system/domain/getDomains.js",type).then((rtn)=>{
								this.tree.data = rtn.message;
								this.dt.rows = rtn.message;
							})
						},
						onNodeClick(data){
							
							this.tree.selected = data;

							fsHandler.callFsJScriptAsync("/matrix/system/domain/getClassByDomain.js", encodeURIComponent(data.label) ).then( (rtn)=>{
								this.dt.rows = rtn.message;
							});
						},
						onDelete(index,data){
							this.$confirm('确定要删除, 是否继续?', '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							  }).then(() => {
									let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'delete'} ) ) );
									fsHandler.callFsJScriptAsync("/matrix/system/domain/actions.js",param).then((rtn)=>{
										this.$message({
											type: "success",
											message: "删除成功"
										})
										this.onLoad(false);
									})
							  }).catch(() => {
								this.$message({
								  type: 'info',
								  message: '已取消删除'
								});          
							  });
						},
						onEdit(index,row){
							this.dialog.domainEdit.data = row;
							this.dialog.domainEdit.show = true;
							setTimeout(()=>{
								$(".el-dialog__body .el-input--small .el-input__inner").css("height","40px");
								$(".el-dialog__body .el-input--small .el-input__inner").css("line-height","40px");
							},50)
						},
						onSave(index,row){
							
						},
						onNewDomain(){
							this.dialog.domainAdd.data = {
								name: "",
								remark: "",
								mclass: []
							};
							this.dialog.domainAdd.show = true;
							setTimeout(()=>{
								$(".el-dialog__body .el-input--small .el-input__inner").css("height","40px");
								$(".el-dialog__body .el-input--small .el-input__inner").css("line-height","40px");
							},50)
						},
						onSaveDomain(data){
							let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'add'} ) ) );
							fsHandler.callFsJScriptAsync("/matrix/system/domain/actions.js",param).then((rtn)=>{
								this.$message({
									type: "success",
									message: "新建成功"
								})
								this.dialog.domainAdd.show = false;
								this.onLoad(false);
							})
						},
						onUpdateDomain(data){
							let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'edit'} ) ) );
							fsHandler.callFsJScriptAsync("/matrix/system/domain/actions.js",param).then((rtn)=>{
								this.$message({
									type: "success",
									message: "新建成功"
								})
								this.dialog.domainEdit.show = false;
								this.onLoad(false);
							})
						}
					}
				})

				/* 应用映射管理 */
				Vue.component('app-mapping-manage',{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;">
									<el-header style="line-height:60px;display:flex;">
										<span style="position: absolute;right: 30px;">
											<el-popover
												placement="top-start"
												title="标题"
												width="200"
												trigger="hover"
												content="根据应用初始化默认的应用映射规则。可反复执行。">
												<el-button slot="reference" type="default" icon="el-icon-refresh" @click="onInit">初始化映射规则</el-button>	
											</el-popover>
											<el-button type="success" icon="el-icon-plus" @click="onNewDomain">新建映射规则</el-button>
										</span>
									</el-header>
									<el-main>
										<el-table
											:data="dt.rows"
											stripe
											border
											style="width: 100%">
											<el-table-column 
												:key="index" 
												v-for="(item,index) in dt.columns"
												:prop="item.field"
												:label="item.title"
												v-if="item.visible">
												<template slot-scope="scope">
													<template v-if="_.includes(['api_rule','class_rule','owner_class_rule'], item['field'])">
														<div v-if="!_.isEmpty(_.compact(scope.row[item['field']]))">
															<el-tag :key="index" v-for="(v,index) in scope.row[item['field']]">
																#{v}#
															</el-tag>
														</div>
													</template>
													<span v-else>#{ scope.row[item['field']] }#</span>
												</template>
											</el-table-column>
											<el-table-column
												label="操作"
												width="100">
												<template slot-scope="scope">
													<el-button @click="onDelete(scope.$index,scope.row)" type="text" size="small">删除</el-button>
													<el-button @click="onEdit(scope.$index,scope.row)" type="text" size="small">编辑</el-button>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
									<el-footer style="line-height:60px;">
										映射规则: #{_.uniqBy(dt.rows,'name').length}#
									</el-footer>
									<el-dialog title="映射规则" 
										:visible.sync="dialog.add.show" 
										:close-on-press-escape="false" 
										:close-on-click-modal="false"
										:destroy-on-close="true" 
										v-if="dialog.add.show" width="50vw">
										<el-container style="height:100%;">
											<el-main style="overflow:hidden;padding:0px 10px;">
												<el-form ref="form" :model="dialog.add.data" label-width="80px" v-if="dialog.add.data">
													<el-form-item label="名称">
														<el-input placeholder="名称" v-model="dialog.add.data.name">
															<el-select v-model="dialog.add.data.name" slot="prepend" placeholder="请选择名称">
																<el-option :label="item.name" :value="item.name" :key="index" v-for="(item,index) in _.uniqBy(dt.rows,'name')"></el-option>
															</el-select>
														</el-input>
													</el-form-item>
													<el-form-item label="接口规则">
														<el-select
															v-model="dialog.add.data.api_rule"
															multiple
															filterable
															allow-create
															default-first-option
															placeholder="请选择">
															<el-option
																v-for="(item,index) in dialog.api.list"
																:key="index"
																:label="item.name"
																:value="item.name">
															</el-option>
														</el-select>
													</el-form-item>
													<el-form-item label="类规则">
														<span>
															<el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
																<el-tooltip content="选则类" open-delay="800">
																	<el-button type="text" size="mini">
																		<i class="el-icon-office-building" style="font-size:16px;"></i>
																	</el-button>
																</el-tooltip>
																<el-dropdown-menu slot="dropdown">
																	<el-dropdown-item>
																		<template scope="scope">
																			<mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.add.data.class_rule=_.xor(dialog.add.data.class_rule,[data.class]); }"></mx-entity-tree>
																		</template>
																	</el-dropdown-item>
																</el-dropdown-menu>
															</el-dropdown>
															<el-select
																v-model="dialog.add.data.class_rule"
																multiple
																filterable
																allow-create
																default-first-option
																placeholder="选择类"
																style="width:100%;">
																<el-option
																v-for="item in dialog.add.data.class_rule"
																:key="item"
																:label="item"
																:value="item">
																</el-option>
															</el-select>
														</span>
													</el-form-item>
													<el-form-item label="所属类规则">
														<span>
															<el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
																<el-tooltip content="选则类" open-delay="800">
																	<el-button type="text" size="mini">
																		<i class="el-icon-office-building" style="font-size:16px;"></i>
																	</el-button>
																</el-tooltip>
																<el-dropdown-menu slot="dropdown">
																	<el-dropdown-item>
																		<template scope="scope">
																			<mx-entity-tree root="/matrix" :filterEnable="false" @node-click="(data)=>{ dialog.add.data.owner_class_rule=_.xor(dialog.add.data.owner_class_rule,[data.class]); }"></mx-entity-tree>
																		</template>
																	</el-dropdown-item>
																</el-dropdown-menu>
															</el-dropdown>
															<el-select
																v-model="dialog.add.data.owner_class_rule"
																multiple
																filterable
																allow-create
																default-first-option
																placeholder="选择类"
																style="width:100%;">
																<el-option
																v-for="item in dialog.add.data.owner_class_rule"
																:key="item"
																:label="item"
																:value="item">
																</el-option>
															</el-select>
														</span>
													</el-form-item>
												</el-form>
											</el-main>
										</el-container>
										<div slot="footer" class="dialog-footer">
											<el-button type="default" @click="dialog.add.show = false;">关闭</el-button>
											<el-button type="primary" @click="onSaveDomain(dialog.add.data)">确定</el-button>
										</div>
									</el-dialog>

									<el-dialog title="编辑应用映射规则" 
										:visible.sync="dialog.edit.show" 
										:close-on-press-escape="false" 
										:close-on-click-modal="false" 
										:destroy-on-close="true" 
										v-if="dialog.edit.show" width="50vw">
										<el-container style="height:100%;">
											<el-main style="overflow:hidden;padding:0px 10px;">
												<el-form ref="form" :model="dialog.edit.data" label-width="80px" v-if="dialog.edit.data">
													<el-form-item label="名称">
														<el-input v-model="dialog.edit.data.name"></el-input>
													</el-form-item>
													<el-form-item label="接口规则">
														<el-select
															v-model="dialog.edit.data.api_rule"
															multiple
															filterable
															allow-create
															default-first-option
															placeholder="请选择">
															<el-option
																v-for="(item,index) in dialog.api.list"
																:key="index"
																:label="item.name"
																:value="item.name">
															</el-option>
														</el-select>
													</el-form-item>
													<el-form-item label="类规则">
														<span>
															<el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
																<el-tooltip content="选则类" open-delay="800">
																	<el-button type="text" size="mini">
																		<i class="el-icon-office-building" style="font-size:16px;"></i>
																	</el-button>
																</el-tooltip>
																<el-dropdown-menu slot="dropdown">
																	<el-dropdown-item>
																		<template scope="scope">
																			<mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.edit.data.class_rule=_.xor(dialog.edit.data.class_rule,[data.class]); }"></mx-entity-tree>
																		</template>
																	</el-dropdown-item>
																</el-dropdown-menu>
															</el-dropdown>
															<el-select
																v-model="dialog.edit.data.class_rule"
																multiple
																filterable
																allow-create
																default-first-option
																placeholder="选择类"
																style="width:100%;">
																<el-option
																v-for="item in dialog.edit.data.class_rule"
																:key="item"
																:label="item"
																:value="item">
																</el-option>
															</el-select>
														</span>
													</el-form-item>
													<el-form-item label="所属类规则">
														<span>
															<el-dropdown trigger="hover" placement="top-end"  :hide-on-click="true">
																<el-tooltip content="选则类" open-delay="800">
																	<el-button type="text" size="mini">
																		<i class="el-icon-office-building" style="font-size:16px;"></i>
																	</el-button>
																</el-tooltip>
																<el-dropdown-menu slot="dropdown">
																	<el-dropdown-item>
																		<template scope="scope">
																			<mx-entity-tree root="/matrix" :filterEnable="false" ref="entityTree" @node-click="(data)=>{ dialog.edit.data.owner_class_rule=_.xor(dialog.edit.data.owner_class_rule,[data.class]); }"></mx-entity-tree>
																		</template>
																	</el-dropdown-item>
																</el-dropdown-menu>
															</el-dropdown>
															<el-select
																v-model="dialog.edit.data.owner_class_rule"
																multiple
																filterable
																allow-create
																default-first-option
																placeholder="选择类"
																style="width:100%;">
																<el-option
																v-for="item in dialog.edit.data.owner_class_rule"
																:key="item"
																:label="item"
																:value="item">
																</el-option>
															</el-select>
														</span>
													</el-form-item>
												</el-form>
											</el-main>
										</el-container>
										<div slot="footer" class="dialog-footer">
											<el-button type="default" @click="dialog.edit.show = false;">关闭</el-button>
											<el-button type="primary" @click="onUpdateDomain(dialog.edit.data)">确定</el-button>
										</div>
									</el-dialog>
								</el-container>`,
					data () {
						return {
							dt:{
								rows: [],
								columns: [{
									field:"id",
									title: "ID",
									visible: false
								},
								{
									field:"class",
									title: "CLASS",
									visible: false
								},
								{
									field:"name",
									title: "应用",
									visible: true
								},
								{
									field:"api_rule",
									title: "对应接口规则",
									visible: true
								},
								{
									field:"class_rule",
									title: "对应类规则",
									visible: true
								},
								{
									field:"owner_class_rule",
									title: "所属类规则",
									visible: true
								}],
								selected: []
							},
							dialog: {
								api: {
									list: []
								},
								add: {
									show: false,
									data: {
										name: "",
										api_rule: [],
										class_rule: [],
										owner_class_rule: []
									}
								},
								edit: {
									show: false,
									data: null
								}
							}
						}
					},
					created(){
						this.onLoad();
					},
					mounted(){
						
					},
					methods: {
						onInit(){
							fsHandler.callFsJScriptAsync("/matrix/system/app/initAppMapping.js").then((rtn)=>{
								this.onLoad();
							})
						},
						onLoad(){
							fsHandler.callFsJScriptAsync("/matrix/system/app/getAppMapping.js").then((rtn)=>{
								this.dt.rows = rtn.message;
								this.onInitApi();
							})
						},
						onInitApi(){
							fsHandler.callFsJScriptAsync("/matrix/system/app/getApi.js").then((rtn)=>{
								this.dialog.api.list = rtn.message;
							})
						},
						onDelete(index,data){
							this.$confirm('确定要删除, 是否继续?', '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							  }).then(() => {
									let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'delete'} ) ) );
									fsHandler.callFsJScriptAsync("/matrix/system/app/actions.js",param).then((rtn)=>{
										this.$message({
											type: "success",
											message: "删除成功"
										})
										this.onLoad();
									})
							  }).catch(() => {
								this.$message({
								  type: 'info',
								  message: '已取消删除'
								});          
							  });
						},
						onEdit(index,row){
							this.dialog.edit.data = row;
							this.dialog.edit.show = true;
							setTimeout(()=>{
								$(".el-dialog__body .el-input--small .el-input__inner").css("height","40px");
								$(".el-dialog__body .el-input--small .el-input__inner").css("line-height","40px");
							},50)
						},
						onNewDomain(){
							this.dialog.add.data = {
								name: "",
								remark: "",
								class_rule: [],
								owner_class_rule: []
							};
							this.dialog.add.show = true;
							setTimeout(()=>{
								$(".el-dialog__body .el-input--small .el-input__inner").css("height","40px");
								$(".el-dialog__body .el-input--small .el-input__inner").css("line-height","40px");
							},50)
						},
						onSaveDomain(data){
							let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'add'} ) ) );
							fsHandler.callFsJScriptAsync("/matrix/system/app/actions.js",param).then((rtn)=>{
								this.$message({
									type: "success",
									message: "新建成功"
								})
								this.dialog.add.show = false;
								this.onLoad();
							})
						},
						onUpdateDomain(data){
							let param = encodeURIComponent( JSON.stringify( _.extend( data, {type: 'edit'} ) ) );
							fsHandler.callFsJScriptAsync("/matrix/system/app/actions.js",param).then((rtn)=>{
								this.$message({
									type: "success",
									message: "新建成功"
								})
								this.dialog.edit.show = false;
								this.onLoad();
							})
						}
					}
				})

				// tagdir 组合选择树
				Vue.component("tagdir-group-select",{
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
							filterText: "",
							nodes: [],
							filterNodes: [],
							selectedKeys: [],
							selectedNodes: [],
							selectedDomain: '',
							domain:{
								mapping: null,
								list: []
							},
							logical: false,
							loading:false,
							ifCheckStrictly: true
						}
					},
					template: `<el-container>
									<el-header style="height:auto;float:left;display:flex;flex-wrap:wrap;padding:0px;">
										<el-radio-group v-model="selectedDomain">
											<el-button v-for="item,key in domain.mapping" :key="item.id" style="margin:5px;">
												<el-radio :label="item.name">#{item.remark || item.name}#</el-radio>
											</el-button>
										</el-radio-group>	
									</el-header>
									<el-main style="height:70vh;background:#f2f2f2;overflow:hidden;">
										<el-row :gutter="20" style="height: 100%;">
											<el-col :span="10" style="height: 100%;">
												<el-container style="height:100%;background: #ffffff;">
													<el-header style="height:50px;line-height:50px;display:flex;">
														<el-input
															placeholder="输入关键字进行过滤"
															v-model="filterText"
															clearable
															style="width:70%;">
														</el-input>
														<el-checkbox v-model="ifCheckStrictly" label="节点关联" style="margin-left:20px;float:right;"></el-checkbox>
													</el-header>
													<el-main style="overflow:hidden;">
														<el-tree 
															node-key="id"
															show-checkbox
															highlight-current="true"
															:default-expanded-keys="selectedKeys"
															:default-checked-keys="selectedKeys"
															:expand-on-click-node="false"
															:filter-node-method="onFilterNode"
															:data="nodes" 
															:props="defaultProps" 
															:check-strictly="!ifCheckStrictly"
															@check-change="onCheckChange"
															style="background: transparent;height:100%;overflow:auto;"
															ref="tree">
															<span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
																<span class="el-icon-price-tag" style="color: #f8a502;font-size: 14px;"></span>
																<span v-if="_.isEmpty(data.name)">
																	<span>#{data.domain}#</span>
																	<el-dropdown style="float:right;display:none;">
																		<span class="el-dropdown-link">
																			<i class="el-icon-more el-icon--right"></i>
																		</span>
																		<el-dropdown-menu slot="dropdown">
																			<el-dropdown-item>
																				<el-checkbox-group v-model="data.perms" style="float: right;padding-right: 10px;" v-if="data.checked">
																					<el-checkbox label="add">添加</el-checkbox>
																					<el-checkbox label="delete">删除</el-checkbox>
																					<el-checkbox label="edit">编辑</el-checkbox>
																					<el-checkbox label="list">查询</el-checkbox>
																				</el-checkbox-group>
																			</el-dropdown-item>
																		</el-dropdown-menu>
																	</el-dropdown>
																</span>
																<span v-else>
																	<span>#{node.label}#</span>
																	<el-dropdown style="float:right;display:none;">
																		<span class="el-dropdown-link">
																			<i class="el-icon-more el-icon--right"></i>
																		</span>
																		<el-dropdown-menu slot="dropdown">
																			<el-dropdown-item>
																				<el-checkbox-group v-model="data.perms" style="float: right;padding-right: 10px;" v-if="data.checked">
																					<el-checkbox label="add">添加</el-checkbox>
																					<el-checkbox label="delete">删除</el-checkbox>
																					<el-checkbox label="edit">编辑</el-checkbox>
																					<el-checkbox label="list">查询</el-checkbox>
																				</el-checkbox-group>
																			</el-dropdown-item>
																		</el-dropdown-menu>
																	</el-dropdown>
																</span>
															</span>                  
														</el-tree>
													</el-main>
												</el-container>
											</el-col>
											<el-col :span="4" style="height: 100%;">
												<div style="height:100%;padding-top:10em;text-align:center;">
													<p>
														<el-button type="primary" @click="onSelectByRel(',')">加入标签组（或者）</el-button>
													</p>
													<p>
														<el-button type="primary" @click="onSelectByRel('+')">加入标签组（并且）</el-button>
													</p>
												</div>
											</el-col>
											<el-col :span="10" style="height: 100%;">
												<el-container style="height:100%;background: #ffffff;">
													<el-header style="height:40px;line-height:40px;">
														<el-button type="text" icon="el-icon-refresh" @click="selectedNodes = []">重置</el-button>
														<span style="float:right;display:none;">
															<el-switch
																v-model="logical"
																active-text="标签组关系(或者)"
																inactive-text="标签组关系(并且)">
															</el-switch>
														</span>
													</el-header>
													<el-main styl="display:flex;flex-wrap:wrap;" v-if="!_.isEmpty(selectedNodes)">
														
														<span v-for="item,index in _.filter(selectedNodes,{type:','})" :key="item.id" v-if="!_.isEmpty(item.data)">
															<!--el-divider content-position="left" v-if="!_.isEmpty(_.keys(_.groupBy(item.data,'domain')))">#{ _.keys(_.groupBy(item.data,'domain'))[0]  }#</el-divider-->
															<el-tag
																:key="tag.id"
																effect="plain"
																closable
																type="primary"
																:disable-transitions="false"
																@close="onTagClose(tag,item)" 
																style="margin:5px;width:100%;"
																v-for="tag,idx in item.data"
																v-if="tag.name">
																#{ tag.path }# 
															</el-tag>
														</span>
														<span v-for="item,index in _.filter(selectedNodes,{type:'+'})" 
															:key="item.id"
															style="margin:5px;width:100%;max-height:300px;overflow:auto;display:flex;flex-wrap: wrap;border: 1px solid #b3d8ff;color: #409eff;border-radius: 5px;"
															v-if="!_.isEmpty(item.data)">
															<!--el-divider content-position="left" v-if="!_.isEmpty(_.keys(_.groupBy(item.data,'domain')))">#{ _.keys(_.groupBy(item.data,'domain'))[0]  }#</el-divider-->
															<el-tag
																:key="tag.id"
																:disable-transitions="false"
																@close="onTagClose(tag,item)"
																style="margin:5px;"
																v-for="tag,idx in item.data"
																v-if="tag.name">
																#{tag.path}#
															</el-tag>
															<el-button type="text" icon="el-icon-close" style="float:right;" @click="onTagGroupClose(item)"></el-button>
														</span>
														
													</el-main>
												</el-container>
											</el-col>
										</el-row>
									</el-main>
									<el-footer style="text-align:right;line-height:60px;background: #f2f2f2;">
										<el-button type="default" @click="rowData.show = false;">关闭</el-button>
										<el-button type="primary" @click="onUpdateRoleGroupByTagGroup" :loading="loading">更新标签权限</el-button>
									</el-footer>
								</el-container>`,
					computed:{
						logicalStr(){
							return this.logical ? '或' : '且';
						}
					},
					watch: {
						filterText(val) {
						  this.$refs.tree.filter(val);
						},
						selectedDomain(val){
							this.selectedNodes = [];
							this.nodes = _.filter(this.filterNodes,{domain:val});
							this.onSetSelected();
						},
						selectedKeys(val){
							this.$emit("count:selectedTag", val.length);
						}
					},
					created(){
						this.loadNodes();
						this.initDomain();
					},
					methods:{
						initDomain(){
							fsHandler.callFsJScriptAsync("/matrix/system/domain/getDomains.js",false).then((rtn)=>{
								//  过滤mclass为空的
								this.domain.mapping = _.filter(rtn.message,(v)=> { return !_.isEmpty(v.mclass); });
								this.selectedDomain = _.head(this.domain.mapping).label;
							})
						},
						loadNodes(){
							fsHandler.callFsJScriptAsync(`${['/matrix'+this.model.parent,this.model.name].join("/")}`).then( (val)=>{
								let rtn = val.message;
								
								this.filterNodes = _.cloneDeep(rtn);
								this.nodes = _.filter(this.filterNodes,{domain:this.selectedDomain});
								this.onSetSelected();
								
							} );
						},
						onSetSelected(){
							
							let param = encodeURIComponent( JSON.stringify({domain: this.selectedDomain, roleGroup: this.rowData.row}) );
							fsHandler.callFsJScriptAsync("/matrix/system/perm/byTagdir/getPermByGroup.js", param ).then( (rtn)=>{
								if(_.isEmpty(rtn.message)) return;
								this.selectedNodes = rtn.message;
							} );
							
						},
						onMouseEnter(data){
							this.$set(data, 'show', true)
						},
						onMouseLeave(data){
							this.$set(data, 'show', false)
						},
						onFilterNode(value, data) {
							if (!value) return true;
							return data.path.indexOf(value) !== -1;
						},
						onTagGroupClose(item){
							
							item.nodes = [];

							let index = this.selectedNodes.indexOf(item);
							this.selectedNodes.splice(index, 1);

						},
						onTagClose(node,item){
							let index = item.nodes.indexOf(node);
							item.nodes.splice(index, 1);

							let selectedNode = _.find(this.selectedNodes,{ id:item.id });
							this.$set(selectedNode, 'nodes',item.nodes);
							this.$set(selectedNode, 'data',item.nodes);
							
							
						},
						onResetChecked() {
							this.$refs.tree.setCheckedKeys([]);
						},
						onDisabledNodes(nodes,flag){
							_.forEach(nodes,(v)=>{
								v.disabled = flag;
							})
						},
						parentNodesCheckChange(data){
							
							let perms = ['add','delete','edit','list'];
							let node = null;

							try{
								if(data.id){
									node = this.$refs.tree.getNode(data.id);
								} else {
									node = this.$refs.tree.getNode("");
								}
								
								if(node && node.parent){
									this.$refs.tree.setChecked(node.parent.data, true, false);
									this.$set( node.parent.data, 'perms', perms );	
								}

								this.parentNodesCheckChange(node.parent.data);
							} catch(err){

							}

						},
						onCheckChange(data, checked, indeterminate){
							
							// 选择父节点
							if(checked && this.ifCheckStrictly){
								//this.childNodesCheckChange(data);
								this.parentNodesCheckChange(data);
							}

						},
						onSelectByRel(type){
							
							// Tag用
							// let nodes = this.$refs.tree.getCheckedNodes(false,false);
							//let nodes = this.$refs.tree.getCheckedNodes(true,false);
							// Tlist用
							let data = this.$refs.tree.getCheckedNodes(true,false);
							console.log(1,data)
							if(_.isEmpty(data)) return false;

							let id = objectHash.sha1(JSON.stringify(data));
							let title = _.truncate(_.map(data,'name').join(" "),{
								'length': 10,
								'omission': ' ...'
							});

							// 已选择
							if(_.find(this.selectedNodes, {id:id})) return false;

							this.selectedNodes.push( {id: id, title: title, type: type, data: data} );

							// 选过的禁用
							//this.onDisabledNodes(nodes,true);
							this.onResetChecked();

						},
						// 标签授权
						onUpdateRoleGroupByTagGroup(){
							
							/* if(_.isEmpty(this.selectedNodes)){
								this.$message({
									type: "warning",
									message: "请选择标签组"
								})
								return false;
							} */

							this.loading = true;

							// 更新
							let domain = _.groupBy(this.domain.mapping,'name');
							let term =  JSON.stringify( { domain: domain[this.selectedDomain], roleGroup: this.rowData.row, data: this.selectedNodes, logical: this.logical?',':'+'} );
							
							fsHandler.callFsJScriptAsync("/matrix/system/perm/byTagdir/setPermByTagdirGroup.js", encodeURIComponent(term)).then( (rtn)=>{
								
								this.loading = false;

								if(rtn.message){

									if(rtn.message.status !== 'error'){
										
										this.$message({
											type: "success",
											message: "更新标签权限成功！"
										})
		
										this.$emit('update:selectedTag');
									} else {
										this.$message({
											type: "error",
											message: "更新标签权限失败：" + typeof rtn.message == 'object' ? _.truncate(JSON.stringify(rtn.message.message),{
												'length': 500,
												'separator': ' '
											}) : _.truncate(rtn.message.message,{
												'length': 500,
												'separator': ' '
											})
										})
									}

								} else {
									
									this.$message({
										type: "success",
										message: "更新标签权限成功！"
									})
	
									this.$emit('update:selectedTag');
								}
								
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
							filterText: "",
							loading: false
						}
					},
					template:   `<el-container style="height:70vh;background:#f2f2f2;">
									<el-aside :width="!_.isEmpty(selectedNode)?'100%':'100%'" style="overflow:hidden;">
										<el-header style="height:10%;line-height:60px;">
											<el-input
												placeholder="输入关键字进行过滤"
												v-model="filterText"
												clearable>
											</el-input>
										</el-header>
										<el-main style="padding:0px 10px; height: 80%;">
											<el-tree :data="treeData" 
													:props="defaultProps" 
													:default-checked-keys="selectedKeys"
													:filter-node-method="onFilterNode"
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
														<el-checkbox-group v-model="data.perms" style="float: right;padding-right: 10px;display:none;" v-if="data.checked">
															<el-checkbox label="add">添加</el-checkbox>
															<el-checkbox label="delete">删除</el-checkbox>
															<el-checkbox label="edit">编辑</el-checkbox>
															<el-checkbox label="list">查询</el-checkbox>
														</el-checkbox-group>
													</span>
												</span>  
											</el-tree>
										</el-main>
										<el-footer style="text-align:right;height:10%;line-height:60px;">
											<el-button type="default" @click="rowData.show = false;">关闭</el-button>
											<el-button type="primary" @click="onUpdateRoleGroupByApp" :loading="loading">更新应用权限</el-button>
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
						},
						selectedNodes(val){
							this.$emit("count:selectedApp", _.uniq(_.filter(val,(v)=>{ return v.checked; })).length);
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
							fsHandler.callFsJScriptAsync("/matrix/system/getAppList.js").then( (rtn)=>{
								this.treeData = rtn.message;

								this.onSetSelected();
							} );
						},
						onSetSelected(){
							let param = encodeURIComponent( JSON.stringify(this.rowData.row) );
							fsHandler.callFsJScriptAsync("/matrix/system/perm/byApp/getPermByApp.js", param).then( (rtn)=>{
								let apps = rtn.message;

								_.forEach(apps,(v)=>{
									_.extend( this.findNodeById(v.id), { perms: ["add","delete","edit","list"], checked:true } );
								});

								this.selectedKeys = _.values(_.map(apps,'id'));
							} );
						},
						onFilterNode(value, data) {
							if (!value) return true;
							return data.name.indexOf(value) !== -1 || data.cnname.indexOf(value) !== -1 || data.enname.indexOf(value) !== -1 ;
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
							}

							// 更新
							if(_.isEmpty(data.name)) {
								return false;
							}
							
							this.selectedNodes.push(data);

						},
						// 应用授权
						onUpdateRoleGroupByApp(event){
							
							this.loading = true;
							
							// 更新
							let checkedApps = _.filter(this.selectedNodes,{checked:true});
							let param = encodeURIComponent( JSON.stringify( { roleGroup: this.rowData.row, data: checkedApps } ) );
							
							fsHandler.callFsJScriptAsync("/matrix/system/perm/byApp/setPermByApp.js", param).then( (rtn)=>{
								
								if(rtn.message){

									if(rtn.message.status !== 'error'){
										
										this.$message({
											type: "success",
											message: "更新应用权限成功！"
										})
		
										this.$emit('update:selectedApp');
									} else {
										this.$message({
											type: "error",
											message: "更新应用权限失败：" + typeof rtn.message.message == 'object' ? _.truncate(JSON.stringify(rtn.message.message),{
												'length': 500,
												'separator': ' '
											}) : _.truncate(rtn.message.message,{
												'length': 500,
												'separator': ' '
											})
										})
									}

								} else {
									
									this.$message({
										type: "success",
										message: "更新标签权限成功！"
									})
	
									this.$emit('update:selectedApp');
								}
								
								// 刷新应用缓存，针对应用权限过滤
								userHandler.refreshAppCache();

								this.loading = false;
							} );
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
								selected: [],
								loading: true
							},
							info: [],
							dialog: {
								newApi: {
									show: false,
									name: "",
									pprefix: []
								}
							},
							expandedView: 'edit',
							loading: false
						}
					},
					template:   `<el-container style="width:100%;height:70vh;background:#f2f2f2;">
									<el-header style="height:40px;line-height:40px;">
										<el-tooltip content="刷新" open-delay="800" placement="top">
											<el-button type="text" icon="el-icon-refresh" @click="initData"></el-button>
										</el-tooltip>
										<el-tooltip content="新建接口组" open-delay="800" placement="top">
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
									</el-header>   
									<el-main style="width:100%;padding-top:0px;">
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
											ref="table"
											:loading="dt.loading">
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
															<el-button type="default" icon="el-icon-close" @click="onToogleExpand(scope.row, scope.$index, 'edit')">关闭</el-button>
															<el-button type="primary" icon="el-icon-edit" @click="onUpdateApi(scope.row, scope.$index)">确定</el-button>
														</el-footer>
													</el-container>
												</template>
											</el-table-column>
											<el-table-column label="操作" width="160">
												<template slot-scope="scope">
													
													<el-tooltip content="编辑" open-delay="800" placement="top">
														<el-button type="text" icon="el-icon-edit" @click="onToogleExpand(scope.row, scope.$index, 'edit')"></el-button>
													</el-tooltip>
													<el-tooltip content="删除" open-delay="800" placement="top">
														<el-button type="text" icon="el-icon-delete" @click="onDeleteApi(scope.row, scope.$index)"></el-button>
													</el-tooltip>
													
												</template>
											</el-table-column>
										</el-table>
									</el-main>
									<el-footer  style="height:30px;line-height:30px;">
										#{ info.join(' &nbsp; | &nbsp;') }#
									</el-footer>
									<el-dialog title="新建接口组" 
										:visible.sync="dialog.newApi.show" 
										:close-on-press-escape="false" 
										:close-on-click-modal="false"
										append-to-body
										v-if="dialog.newApi.show">
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
											<el-tooltip content="取消" open-delay="800" placement="top">
												<el-button type="default" icon="el-icon-close" @click="dialog.newApi.show = false;">关闭</el-button>
											</el-tooltip>	
											<el-tooltip content="确定" open-delay="800" placement="top">
												<el-button type="primary" icon="el-icon-edit" @click="onSaveApi">确定</el-button>
											</el-tooltip>	
										</div>
									</el-dialog>
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
						},
						'dt.selected':{
							handler(val){
								this.$emit("count:selectedApi",val.length);
							}
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
							
							let init = ()=>{
								
								try{

									userHandler.getApiPermissionsAsync().then( (rtn)=>{
										this.dt.rows = rtn;
										this.dt.loading = false;
									} );

									_.extend(this.dt, {columns: _.map(this.dt.columns, function(v){
										
										if(_.isUndefined(v.visible)){
											_.extend(v, { visible: true });
										}
		
										if(!v.render){
											return v;
										} else {
											return _.extend(v, { render: eval(v.render) });
										}
										
									})});
		
									_.extend(this.dt, {rows: this.dt.rows});

									
								} catch(err){
									console.error(err);
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

							userHandler.addApiPermissionsAsync( this.dialog.newApi ).then( (rtn)=>{
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
							} );

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
							
							this.loading = true;

							if(_.isEmpty(val)){
								_.forEach(this.dt.rows, (v,index)=>{
									
									userHandler.deleteApiPermissionsGroupsAsync({name:v.name, roleGroups: _.map([this.roleGroup],'fullname') });

									// 删除角色组
									let term = encodeURIComponent( JSON.stringify( { roleGroup: [this.roleGroup], data: [ _.extend(v, {checked:false} )] } ) );
									fsHandler.callFsJScriptAsync("/matrix/system/updateGroupByApi.js", term);
									
								})	
							} else {
								_.forEach(val, (v,index)=>{
									userHandler.setApiPermissionsGroupsAsync({name:v.name, roleGroups: _.map([this.roleGroup],'fullname') });

									// 更新角色组
									let term = encodeURIComponent( JSON.stringify( { roleGroup: [this.roleGroup], data: [ _.extend(v, {checked:true} )] } ) );
									fsHandler.callFsJScriptAsync("/matrix/system/updateGroupByApi.js", term);
								})
							}
							
							this.dt.selected = val;

							this.loading = false;
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
							
							userHandler.setApiPermissionsGroupsAsync(row).then( (rtn)=>{
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
							} );
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
												<!--el-tooltip content="更新权限" open-delay="800" v-if="showView=='table'">
													<el-button type="text" icon="el-icon-edit-outline" @click="$parent.$parent.$parent.$parent.$parent.onUpdateRoleGroup"></el-button>
												</el-tooltip-->	
												<el-tooltip content="刷新" open-delay="800" placement="top">
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

							let selected = _.map(this.rowData.member,(v)=>{ return v.replace(/^['G','U','O']/g,''); });
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
									console.error(err);
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

										userHandler.addGroupPermissionsAsync(this.role).then( (rtn)=>{
											if(rtn == 1){
												this.$message({
													type: 'success',
													message: `角色组: ${this.role.name} 添加成功！`
												});
												
												self.onRefresh();
												wnd.close();
											} else {
												this.$message({
													type: 'error',
													message: `角色组: ${this.role.name} 添加失败 ` + rtn
												});
											}
										} );

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
                                    pageSize: 100,
                                    currentPage: 1
                                },
								term: ""
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
							},
							count: {
								app: 0,
								data: 0,
								api: 0,
								tag: 0

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
													<!--el-tooltip content="切换视图" open-delay="800" placement="top">
														<el-button type="text" icon="el-icon-s-fold" @click="onTogglePanel"></el-button>
													</el-tooltip-->
													<el-tooltip content="新建角色组" open-delay="800" placement="top">
														<el-button type="text" icon="el-icon-plus" @click="onNewRole" style="padding-left:5px;"></el-button>
													</el-tooltip>
													<el-tooltip content="刷新" open-delay="800" placement="top">
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
												<!--el-table-column type="selection" align="center"></el-table-column--> 
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
																<el-link type="primary" :underline="true" @click.native.prevent="onForward(scope.row.fullname)" v-if="scope.row.isParent">
																	#{scope.row.name}# <i class="el-icon-more"></i>
																</el-link>
																<el-link type="info" :underline="true" v-else>
																	#{scope.row.name}#
																</el-link>
															</div>
															<div v-else-if="_.includes(['isldap'],item.field)">
																#{scope.row.isldap?'是':'否'}#
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
													<template slot="header" slot-scope="scope">
														<el-input v-model="dt.term" placeholder="关键字" clearable></el-input>
													</template>
													<template slot-scope="scope">
													
														<div v-if="_.includes(['/','system'],scope.row.name)">
															
														</div>
														<div v-else-if="_.includes(['admin'],scope.row.name) && window.SignedUser_UserName == 'admin'">
															<el-tooltip content="授权用户" open-delay="800" placement="top">
																<el-button type="text" icon="el-icon-user" @click="onSetLdap(scope.row)"></el-button>
															</el-tooltip>
														</div>
														<div v-else>
															<el-tooltip content="权限设置" open-delay="800" placement="top">
																<el-button type="text" icon="el-icon-lock" @click="onSetPermission(scope.row);"></el-button>
															</el-tooltip>
															<el-tooltip content="授权用户" open-delay="800" placement="top">
																<el-button type="text" icon="el-icon-user" @click="onSetLdap(scope.row)"></el-button>
															</el-tooltip>
															<el-tooltip content="新建角色组" open-delay="800" placement="top">
																<el-button type="text" icon="el-icon-plus" @click="onNewRole(scope.row)"></el-button>
															</el-tooltip>
															<!--el-tooltip content="编辑" open-delay="800" placement="top">
																<el-button type="text" icon="el-icon-edit" @click="onToogleExpand(scope.row,scope.$index,'roleGroupEdit')"></el-button>
															</el-tooltip-->
															<el-tooltip content="删除" open-delay="800" placement="top">
																<el-button type="text" icon="el-icon-delete" @click="onDeleteRole(scope.row)"></el-button>
															</el-tooltip>
														</div>
													</template>
												</el-table-column>
											</el-table>
											<el-dialog :title="permissionTitle" :visible.sync="dialog.permission.show" 
												:close-on-press-escape="false"
												:close-on-click-modal="false" v-if="dialog.permission.show" width="80vw">
												<el-container style="width:100%;height:100%">
													<el-main style="padding:0px;overflow:hidden;">
														<el-tabs value="tagdirGroup">

															<el-tab-pane name="tagdirGroup">
																<span slot="label"><i class="el-icon-collection-tag"></i> 标签组合权限</span>
																<tagdir-group-select :model="{parent:'/system',name:'tagdir_tree_data.js',domain:'*'}" 
																	:rowData="dialog.permission"
																	@count:selectedTag="(count)=>{ this.count.tag = count;}"
																	@update:selectedTag="()=>{ this.initData(); }"
																	ref="tagdirTree"
																	v-if="!_.isEmpty(dialog.permission.row)"></tagdir-group-select>
															</el-tab-pane>
															<el-tab-pane name="app" lazy>
																<span slot="label"><i class="el-icon-files"></i> 应用权限 </span>
																<app-permission  :rowData="dialog.permission" ref="appTree" 
																	@count:selectedApp="(count)=>{ this.count.app = count;}"
																	@update:selectedApp="()=>{ this.initData(); }" v-if="!_.isEmpty(dialog.permission.row)"></app-permission>
															</el-tab-pane>	
															
															<el-tab-pane name="api" lazy>
																<span slot="label"><i class="el-icon-tickets"></i> 接口权限 </span>
																<api-permission 
																	@count:selectedApi="(count)=>{ this.count.api = count;}"
																	:roleGroup="dialog.permission.row"></api-permission>
															</el-tab-pane>
														</el-tabs>
													</el-main>
												</el-container>
											</el-dialog>
											<el-dialog :title="selectLdapTitle" :visible.sync="dialog.ldap.show" 
												:close-on-press-escape="false" :close-on-click-modal="false" v-if="dialog.ldap.show" width="80vw">
												<el-container style="height:100%;">
													<el-main style="overflow:hidden;padding:0px 10px;">
														<el-row :gutter="20">
															<el-col :span="24">
																<h4>用户成员</h4>
																<ldap-manage-select root="/" 
																	:rowData="dialog.ldap.row" 
																	@update:selectedLdap="onSetRoleGroupByLdap(dialog.ldap.row, $event)">
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
												:page-sizes="[10, 15, 20, 50, 100, 300]"
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
								this.dt.pagination.currentPage = 1;
							},
							deep:true,
							immediate:true
						},
						'dt.term':{
							handler(val){
								if(_.isEmpty(val)){
									this.initData();
								} else {
									this.dt.rows = this.dt.rows.filter(data => !val || data.name.toLowerCase().includes(val.toLowerCase()));
								}
							}
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
                            this.dt.pagination.pageSize = val;
                        },
                        onCurrentPageChange(val) {
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
										//this.$refs.table.doLayout();
									},1000)
								} else {
									setTimeout(doLayout,50);
								}
							}
							doLayout();
						},
						getRoleGroupChildrens(fullname){
							
							let rtn = userHandler.getGroupPermissionsByParent({parent: fullname});
							if(!_.isEmpty(rtn)){
								return true;
							} else {
								return false;
							}
							
						},
						initData(){
							
							fsHandler.callFsJScriptAsync("/matrix/system/group/getGroupList.js","").then( (rtn)=>{
								
								this.dt.rows = rtn.message;
								
								try{
									_.extend(this.dt, {columns: _.map(this.dt.columns, function(v){
										
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
									console.error(err);
								}
							} )

							// const self = this;
							// 过滤 "/" 角色组
							/* userHandler.getGroupPermissionsByParentAsync({parent:""}).then( (rtn)=>{
								this.dt.rows = _.sortBy(_.filter(rtn,(v)=>{ 
													if(v.fullname != '/'){
														let isParent = this.getRoleGroupChildrens(v.fullname);
														return _.extend(v, {isParent: isParent}); 
													}
											}),['fullname'],['asc']);
							} ); 
							
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
									console.error(err);
								}
							};
	
							init();
							*/
							
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

							fsHandler.callFsJScriptAsync("/matrix/system/group/getGroupList.js", encodeURIComponent(fullname)).then( (rtn)=>{
								
								if(!_.isEmpty(rtn.message)){
									this.dt.rows = rtn.message;

									if(fullname){
										this.fullname = fullname.split("/");
									} else {
										this.fullname = ["/"];
									}
								}
								
							} )

							/* userHandler.getGroupPermissionsByParentAsync({parent: fullname}).then( (rtn)=>{
								
								if(!_.isEmpty(rtn)){
									this.dt.rows = _.map(rtn,(v)=>{
										let isParent = this.getRoleGroupChildrens(v.fullname);
										return _.extend(v, {isParent: isParent}); 
									});
	
									if(fullname){
										this.fullname = fullname.split("/");
									} else {
										this.fullname = ["/"];
									}
								}
							} ); */
							
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

										userHandler.addGroupPermissionsAsync(this.role).then( (rtn)=>{
											if(rtn == 1){
												
												this.$message({
													type: 'success',
													message: `角色组: ${this.role.name} 添加成功！`
												});
												
												self.onRefresh();
												wnd.close();
											} else {
												this.$message({
													type: 'error',
													message: `角色组: ${this.role.name} 添加失败 ` + rtn
												});
											}
										} );


									}
								}
							}).$mount("#ldap-newRoleGroup-container");
						},
						onDeleteRole(row){
							
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

									// 清除对象_group中的角色组信息
									fsHandler.callFsJScriptAsync("/matrix/system/clearRoleGroupInstAfterDeleteRoleGroup.js",encodeURIComponent(row.fullname)).then( ()=>{
										this.onRefresh();
									} );

									// 清除对象UI选择实例
									fsHandler.fsDeleteAsync("/matrix/system/group/tagdir",row.id);
									
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
							fsHandler.callFsJScriptAsync("/matrix/system/getRoleGroupTree.js",null).then( (rtn)=>{
								this.tree.nodes = rtn.message;
							} );
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
							
							userHandler.updateGroupPermissionsAsync(row).then( (rtn)=>{
								if(rtn == 1){
									this.$message({
										type: "success",
										message: "更新成功！"
									})
									this.dialog.ldap.show = false;
								} else {
									this.$message({
										type: "error",
										message: "更新失败 " + rtn
									})
									//this.initData();
								}
							} );
							
						},
						// 更新角色组的用户
						onSetRoleGroupByLdap(row,event){
							
							_.forEach(event,(v)=>{
								
								if(_.isUndefined(v)) return;

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
											{"field":"mobile",title:"手机"},
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
							splitInst: null,
							ldap: []
						}
					},
					template: 	`<el-container style="height:100%;" class="user-manage-container">
									<el-main style="padding:0px;overflow:hidden;">
										<el-tabs v-model="tabs.main.activeName" type="border-card" @tab-click="onTabClick">
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
														<user-roleGroup :checkSelect="false" ref="userRoleGroupRef"></user-roleGroup>
													</el-main>
												</el-container>
											</el-tab-pane>
										</el-tabs>
									</el-main>
								</el-container>`,
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
						onTabClick(tab,event){
							if(tab.name == 'role' && this.$refs.userRoleGroupRef){
								this.$refs.userRoleGroupRef.initData();
							}
						},
						onLoadUser(event) {
							this.selectedNode = event;
							this.ldap = [];
							// 只加载用户
							this.travelChildUser(userHandler.userList(event.fullname).message.nodes);
							this.model.rows = _.orderBy(this.ldap,'fullname');
						},
						travelChildUser(nodes){
							
							_.forEach(nodes,(v)=>{
								if(v.otype=='usr'){
									this.ldap.push( _.extend( {grpset:[]}, v) );
								}
								if(v.nodes){
									this.travelChildUser(v.nodes);
								}
							});

						}
					}
				})

				/* * * * * * * * * * * * * * *  Grok变量管理 * * * * * * * * * * * * * * * * * * * * * * * * * * * *  */

				// Grok变量管理
				Vue.component('groke-editor',{
					delimiters: ['#{','}#'],
					props: {
						value: String
					},
					template: `<div ref="editor" style="border: 1px solid #ddd;"></div>`,
					mounted(){
						this.initEditor();
					},
					methods: {
						initEditor(){
							let editor = ace.edit(this.$refs.editor);
							editor.setOptions({
								maxLines: Infinity,
								minLines: 6,
								autoScrollEditorIntoView: true,
								enableBasicAutocompletion: true,
								enableSnippets: true,
								enableLiveAutocompletion: false
							});
							
							editor.getSession().setMode("ace/mode/sh");
							editor.setTheme("ace/theme/chrome");
							editor.getSession().setUseSoftTabs(true);
							editor.getSession().setTabSize(2);
							editor.getSession().setUseWrapMode(false);
							editor.renderer.setShowGutter(true);
							editor.setValue(this.value);
				
							editor.focus(); 
							let row = editor.session.getLength() - 1;
							let column = editor.session.getLine(row).length;
							editor.gotoLine(row + 1, column);

							editor.on("change", _.debounce((v)=>{
                                this.$emit('input-value', editor.getValue());
                            },500));
						}
					}
				})

				Vue.component('grok-manage',{
					delimiters: ['#{', '}#'],
					data(){
						return {
							dt:{
								rows: [],
								columns: [],
								selected: [],
								search: ""
							},
							dialog: {
								add: {
									show: false,
									data: {
										name: "",
										pattern: "",
										eg: ""
									}
								}
							}
						}
					},
					template: 	`<el-container style="height:100%;">
									<el-header style="line-height:60px;display:flex;">
										<h5 style="margin:0px;"><i class="el-icon-finished"></i> 解析规则</h5>
										<span style="position: absolute;right: 30px;">
											<el-button type="success" icon="el-icon-plus" @click="onNew">新建解析规则</el-button>
										</span>
									</el-header>
									<el-main style="height:100%;overflow:hidden;">
										<el-table
											:data="dt.rows.filter(data => !dt.search || data.name.toLowerCase().includes(dt.search.toLowerCase()))"
											stripe
											highlight-current-row
											fit="true"
											style="width: 100%"
											:row-class-name="rowClassName"
											:header-cell-style="headerRender"
											@current-change="onSelectionChange">
											<el-table-column type="index" label="序号" sortable align="center">
												<template slot-scope="scope">
													<div style="width:100%; text-align: center;"> <b> #{ (scope.$index + 1) }# </b> </div>
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
											<el-table-column
												label="操作">
												<template slot="header" slot-scope="scope">
													<el-input v-model="dt.search" placeholder="输入关键字搜索" clearable></el-input>
												</template>
												<template slot-scope="scope">
													<el-button @click="onDelete(scope.row)" type="text" size="small">删除</el-button>
													<el-button @click="onEdit(scope.row)" type="text" size="small">编辑</el-button>
												</template>
											</el-table-column>
										</el-table>
									</el-main>
									<el-footer style="height:40px;line-height:40px;">
										数量：#{ dt.rows.length }#
									</el-footer>
									<el-dialog title="解析规则管理" 
										:visible.sync="dialog.add.show" 
										:close-on-press-escape="false" 
										:close-on-click-modal="false"
										:destroy-on-close="true" 
										v-if="dialog.add.show" width="50vw">
										<el-container style="height:100%;">
											<el-main style="overflow:hidden;padding:0px 10px;">
												<el-form ref="form" :model="dialog.add.data" label-width="80px" v-if="dialog.add.data">
													<el-form-item label="名称">
														<el-input v-model="dialog.add.data.name" placeholder="名称" v-model="dialog.add.data.name"></el-input>
													</el-form-item>
													<el-form-item label="Pattern">
														<groke-editor :value="dialog.add.data.pattern" @input-value="(data)=>{ dialog.add.data.pattern=data; }" style="height:10vh;"></groke-editor>
													</el-form-item>
													<el-form-item label="示例">
														<groke-editor :value="dialog.add.data.eg" @input-value="(data)=>{ dialog.add.data.eg=data; }" style="height:15vh;"></groke-editor>
													</el-form-item>
												</el-form>
											</el-main>
										</el-container>
										<div slot="footer" class="dialog-footer">
											<el-button type="default" @click="dialog.add.show = false;">关闭</el-button>
											<el-button type="primary" @click="onSave(dialog.add.data)">确定</el-button>
										</div>
									</el-dialog>
								</el-container>`,
					created(){
						this.initData();
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

							grokHandler.grokListAsync().then((rtn)=>{
								
								let rows = _.orderBy(rtn.message,['name'],['asc']);
								
								_.extend(this.dt, {rows: rows});

								_.map(this.dt.columns,(v)=>{
									if(!v.render){
										return v;
									} else {
										return _.extend(v,{render: eval(v.render) });;
									}
								})

								this.dt.columns = [
									{field:"name",title:"名称", width:120},
									{field:"pattern",title:"规则"},
									{field:"eg",title:"举例", width:120}
								];
							})
							
						},
						onNew(){
							this.dialog.add.data = {
								name: "",
								pattern: "",
								eg: ""
							};
							this.dialog.add.show = true;
						},
						onSave(data){

							if(_.isEmpty(data.name)){
								this.$message({
									type: "warning",
									message: "名称不能为空"
								})
								return false;
							}

							if(_.isEmpty(data.pattern)){
								this.$message({
									type: "warning",
									message: "规则不能为空"
								})
								return false;
							}

							grokHandler.grokNew(data).then((rtn)=>{
								if(rtn == 1){
									this.$message({
										type: "success",
										message: "新建成功"
									})

									this.initData();

									this.dialog.add.show = false;
								} else {
									this.$message({
										type: "error",
										message: "新建失败： "  + rtn.message
									})
								}
							})
						},
						onDelete(data){
							this.$confirm(`确定要删除 ${data.name}, 是否继续?`, '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							  }).then(() => {
									
									grokHandler.grokDelete(data).then((rtn)=>{
										this.$message({
											type: "success",
											message: "删除成功"
										})
										this.initData();
									})
							  }).catch(() => {
								this.$message({
								  type: 'info',
								  message: '已取消删除'
								});          
							  });
						},
						onEdit(data){
							this.dialog.add.data = data;
							this.dialog.add.show = true;
						}
					}
				})


				/* * * * * * * * * * * * * * *  应用管理 * * * * * * * * * * * * * * * * * * * * * * * * * * * *  */

				// 应用管理
				Vue.component('apps-manage',{
					delimiters: ['#{', '}#'],
					template: 	`<el-container style="height:100%;padding:20px;">
									<el-header style="line-height: 60px;">
										<el-tooltip content="刷新" open-delay="800">
											<el-button type="default" icon="el-icon-refresh" @click="onRefresh">刷新</el-button> 
										</el-tooltip>
										<el-tooltip content="发布应用" open-delay="800">
											<el-button type="success" icon="el-icon-plus" @click="dialog.appDeploy.show = true;">发布应用</el-button> 
										</el-tooltip>

										<el-dropdown style="float:right;">
											<span class="el-dropdown-link">
												<i class="el-icon-setting el-icon--right"></i>
											</span>
											<el-dropdown-menu slot="dropdown">
												<el-dropdown-item @click.native="onAppExport('mql')">导出应用(MQL)</el-dropdown-item>
												<el-dropdown-item @click.native="onAppExport('xlsx')">导出应用(Excel)</el-dropdown-item>
												<el-dropdown-item @click.native="dialog.appImport.show = true;" divided>导入应用</el-dropdown-item>
											</el-dropdown-menu>
										</el-dropdown>
									</el-header>
									<el-main style="padding:20px 0px;">
										<el-button type="default" 
											style="position: relative;width: 14em;height:10em;padding: 10px 30px;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);background:rgb(81, 123, 160);"
											v-for="(item,index) in model.list"
											:key="index">
											<el-image style="width:64px;height:64px;margin:5px;" :src="item.icon | pickIcon"></el-image>
											<p style="color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:center;">#{item.cnname}#</p>
											<div style="position:absolute;top:0px;right:5px;">
												<el-button type="text"  @click="onAppEdit(item)">
													<span class="el-icon-setting"  style="color:#ffffff;"></span> 
												</el-button>
											</div>
										</el-button>
										<el-dialog :title="'应用编辑 '+dialog.appEdit.item.name"  :visible.sync="dialog.appEdit.show" v-if="dialog.appEdit.show" destroy-on-close="true">
											<el-tabs v-model="tabs.activeName" ref="tabs">
												<el-tab-pane name="app">
													<span slot="label" style="font-size:14px;">
														<i class="el-icon-s-platform"></i> 应用信息
													</span>
													<el-container>
														<el-main style="padding:0px 20px;">
															<el-form ref="form" :model="dialog.appEdit.item" label-width="80px" >
																<el-form-item style="position:absolute;right:10px;">
																	<el-button type="text" @click="tabs.activeName='icon'" style="background:#444444;border-radius:15px!important;padding:20px;">
																		<el-image shape="square" fit="scale-down" style="width:64px;" :src="icon.value"></el-image>
																	</el-button>
																</el-form-item>
																<el-form-item label="中文名" style="width:75%;">
																	<el-input v-model="dialog.appEdit.item.cnname"></el-input>
																</el-form-item>
																<el-form-item label="英文名称" style="width:75%;">
																	<el-input v-model="dialog.appEdit.item.enname"></el-input>
																</el-form-item>
																<el-form-item label="Url" style="width:75%;">
																	<el-input v-model="dialog.appEdit.item.url"></el-input>
																</el-form-item>
																<el-form-item label="Target">
																	<el-radio-group v-model="dialog.appEdit.item.target">
																		<el-radio label="_blank">打开新窗口</el-radio>
																		<el-radio label="_parent">当前窗口打开</el-radio>
																	</el-radio-group>
																</el-form-item>
																<el-form-item label="分组">
																	<el-radio-group v-model="dialog.appEdit.item.groups.group">
																		#{dialog.appEdit.item.groups.group}#
																		<el-radio :label="item.name" v-for="item in model.groups">#{item.title}#</el-radio>
																	</el-radio-group>
																</el-form-item>
															</el-form> 
														</el-main>
														<el-footer style="text-align:right;line-height:60px;">
															<el-button type="default" @click="dialog.appEdit.show = false;">取消</el-button>
															<el-button type="primary" @click="onAppUpdate(dialog.appEdit.item)">更新应用</el-button>
															<el-button type="danger" @click="onAppRemove(dialog.appEdit.item)">卸载应用</el-button>
														</el-footer>
													</el-container>
												</el-tab-pane>
												<el-tab-pane name="icon">
													<span slot="label" style="font-size:14px;">
														<i class="el-icon-picture"></i> 选择图标
													</span>
													<el-container style="height:100%;">
														<el-main style="height:300px;overflow:auto;padding:10px 0px;background:#666666;">
															<el-radio-group v-model="icon.value" class="mx-app-icon">
																<el-button type="default" style="border: unset;width:100px;height:120px;margin:5px;padding:0px;cursor:pointer;background:transparent;" 
																	v-for="icon in icon.list"
																	:key="icon.id"
																	@click="onTriggerRadioClick(icon)"> 
																	<el-image :src="icon | pickExtIcon" fit="fill"  style="width:48px;"></el-image> 
																	<p>
																		<el-radio :label="'/fs'+icon.parent+'/'+icon.name+'?type=download&issys='+window.SignedUser_IsAdmin" 
																			:ref="'radio_'+icon.id">
																		</el-radio>
																	</p>
																</el-button>
															</el-radio-group>
														</el-main>
														<el-footer style="padding:20px 0px 50px 0px;display:flex;height:auto;position:releative;">
															<span style="position:absolute;right:140px;">
																<el-button type="default" icon="el-icon-close" @click="tabs.activeName='app';">返回</el-button>
																<el-button type="primary" icon="el-icon-refresh" @click="initIconList">刷新图标</el-button>
															</span>
															<span style="position:absolute;right:20px;">
																<el-upload
																	multiple
																	:data="{index:true}"
																	:action="upload.url+'?issys=true'"
																	:before-upload="onBeforeUpload"
																	:on-success="onSuccess"
																	:on-error="onError"
																	:show-file-list="false"
																	name="uploadfile">
																	<el-button icon="el-icon-upload" type="primary" style="padding-left:20px;" :loading="upload.loading">上传图标</el-button>
																</el-upload>
															</span>
														</el-footer>
													</el-container>
												</el-tab-pane>
											</el-tabs>
										</el-dialog>
										<el-dialog title="应用发布" :visible.sync="dialog.appDeploy.show" v-if="dialog.appDeploy.show" destroy-on-close="true">
											<mx-app-deploy :model="dialog.appDeploy"></mx-app-deploy>
										</el-dialog>
										<el-dialog title="应用导入" :visible.sync="dialog.appImport.show" v-if="dialog.appImport.show" destroy-on-close="true">
											<el-container>
												<el-main>
													<el-upload
														class="upload-demo"
														drag
														:auto-upload="false"
														:on-change="onFilesChange"
														:file-list="dialog.appImport.files">
														<i class="el-icon-upload"></i>
														<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
														<div class="el-upload__tip" slot="tip">只能上传Mql/Excel文件</div>
													</el-upload>
												</el-main>
												<el-footer style="line-height:60px;text-align:right;">
													<el-button type="default" @click="dialog.appImport.show = false;">取消</el-button>
													<el-button type="primary" @click="onAppImport">导入</el-button>
												</el-footer>
											</el-container>
										</el-dialog>
									</el-main>
								</el-container>`,
					data(){
						return {
							model: null,
							dialog: {
								appDeploy: {
									show: false,
									item: null
								},
								appEdit: {
									show: false,
									item: null
								},
								appImport: {
									show: false,
									files: null
								}
							},
							icon: {
								value: '',
								list: []
							},
							upload: {
								url: `${window.ASSETS_ICON}/apps/png`,
								fileList: [],
								loading: false
							},
							tabs: {
								activeName: "app"
							}
						}
					},
					mounted() {
						this.$nextTick( ()=>{
							this.init(); 
							this.initIconList();
						})
					},
					computed: {
						groupedModelList(){
							try{
								return _.groupBy(this.model.list, (v)=>{
									return v.name;//moment(v.day).format("YYYYMMDD");
								});
							} catch(err){
								return [];
							}
						}
					},
					filters:{
						pickExtIcon(icon) {
							return `/fs${icon.parent}/${icon.name}?type=download&issys=${window.SignedUser_IsAdmin}`;
						},
						pickIcon(icon){
							return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
						}
					},
					methods: {
						onRefresh(){
							this.init();
						},
						init(){
							fsHandler.callFsJScriptAsync("/matrix/apps/appList.js",null).then( (rtn)=>{
								this.model = rtn.message;
							} );
						},
						initIconList(){
							fsHandler.fsListAsync(this.upload.url).then( (rtn)=>{
								this.icon.list = rtn;
								this.icon.value = `${this.upload.url}/creative.png?type=open&issys=${window.SignedUser_IsAdmin}`;
							} );   
						},
						onTriggerRadioClick(item){
							this.$refs['radio_'+item.id][0].$el.click();
						},
						onAppUpdate(item){
							
							_.extend(item,{ icon: this.icon.value.replace(/\/fs\/assets\/images\/apps\/png\//,'').replace(/\?type=open&issys=true/,'').replace(/\?type=download&issys=true/,'') } );
							
							fsHandler.callFsJScriptAsync("/matrix/apps/app.js",encodeURIComponent(JSON.stringify(item))).then( (rtn)=>{
								if( _.lowerCase(rtn.status) == "ok"){
									
									this.$message({
										type: "info",
										message: "应用更新成功"
									});
									
									this.dialog.appEdit.show = false;
	
									eventHub.$emit("APP-REFRESH-EVENT");

									// 刷新应用缓存，针对应用权限过滤
									userHandler.refreshAppCache();
								}
							} );
						},
						onAppRemove(item) {
							
							this.$confirm(`确认要删除该应用：${item.name}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
								fsHandler.callFsJScriptAsync("/matrix/apps/app_delete.js",encodeURIComponent(JSON.stringify(item))).then( (rtn)=>{
									
									if(rtn.status === 'ok'){
										
										this.init();

										// 刷新应用缓存，针对应用权限过滤
										userHandler.refreshAppCache();

										this.dialog.appEdit.show = false;

									} else {
										this.$message({
											type: "error",
											message: rtn
										})
									}

								} );
								
                            }).catch(() => {
                                
                            });

						},
						onAppEdit(item){
							this.dialog.appEdit.item = item;
							this.dialog.appEdit.show = true;
						},
						onAppExport(ftype){
							
							let template = ftype=='mql'?true:false;

							axios.get(`/mxobject/export?recursive=true&relation_defined=false&filetype=${ftype}&template=${template}&class=%2Fmatrix%2Fportal%2Ftools&ignoreclass=%2Fmatrix%2Ffilesystem&limit=-1`,{
								headers: {
									"Content-type":"text/csv",
									"Access-Control-Allow-Origin":"*"
								},
								responseType:"arraybuffer"
							})
							.then((response)=> {
								var blob = new Blob([response.data], ftype=='mql'?{type: "octet/stream"}:{type: "application/vnd.ms-excel"});
                    			saveAs(blob, `Apps-${moment().format('LLL')}.${ftype}`);
							})
							.catch((error)=> {
								console.error(error);
							});
						},
						onFilesChange(file){
							this.dialog.appImport.files = [file.raw];
						},
						onAppImport(){
							
							let fileName = this.dialog.appImport.files[0].name;

							this.$confirm(`确认要导入应用：${fileName}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
								omdbHandler.classDataImport(this.dialog.appImport.files[0]).then( (rtn)=>{
									if(_.lowerCase(rtn.status) == 'ok'){
										this.$message({
											type: "success",
											message: "导入成功！"
										});
									} else {
										this.$message({
											type: "error",
											message: "导入失败：" + rtn.message
										});
									}
								} );
								
                            }).catch(() => {
                                this.$message({
									type: "info",
									message: "取消导入操作！"
								});
							});
							
						},
						onBeforeUpload(){
							this.upload.loading = true;
						},
						onSuccess(res,file,FileList){
							this.upload.fileList = FileList;
							this.$message({
								type: "success",
								message: "上传成功！"
							})
							this.upload.loading = false;
							this.initIconList();
						},
						onError(err,file,FileList){
							this.$message({
								type: "error",
								message: "上传失败：" + err
							})
							this.upload.loading = false;
							this.initIconList();
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
											<el-menu-item index="domain-manage">
												<i class="el-icon-money"></i>
												<span slot="title">标签域管理</span>
											</el-menu-item>
											<el-menu-item index="app-mapping-manage">
												<i class="el-icon-files"></i>
												<span slot="title">应用映射管理</span>
											</el-menu-item>
											<el-menu-item index="grok-manage">
												<i class="el-icon-finished"></i>
												<span slot="title">解析规则</span>
											</el-menu-item>
											<el-menu-item index="apps-manage">
												<i class="el-icon-menu"></i>
												<span slot="title">应用管理</span>
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
							var name = window.SignedUser_IsAdmin;
							var ospace = window.COMPANY_OSPACE;

							if(name && ospace=='matrix'){
								this.loadTreeData('/','configTreeNodes');
							} else {
								this.loadTreeData('/'+ospace,'configTreeNodes');
							}
							this.loadTreeData('/matrix/probes', 'rulesTreeNodes');
							
							this.initNotifyTreeNodes();
							this.initMaintainTreeNodes();

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