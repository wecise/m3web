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
class User {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded([],()=> {

            $(function() {
                
                moment.locale('zh_CN');

                Vue.component('user-update',{
                    delimiters: ['#{', '}#'],
                    data(){
                        return {
                            signedUser: mxAuth.signedUser,
                            user: {
                                resetPasswd: false,
                                passwd: "",
                                checkPasswd: ""
                            }
                        }
                    },
                    template:   `<div>
                                    <h2>用户信息</h2>
                                    <el-divider></el-divider>
                                    <el-form label-width="80px">
                                        
                                        <el-form-item label="组名称" required>
                                            <el-input v-model="signedUser.parent" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item label="登录名称" required>
                                            <el-input v-model="signedUser.username" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item label="重置密码">
                                            <el-switch v-model="user.resetPasswd"></el-switch>
                                        </el-form-item>

                                        <el-form-item label="登录密码" required v-if="user.resetPasswd">
                                            <el-input type="password" v-model="user.passwd" autocomplete="off" show-password></el-input>
                                        </el-form-item>

                                        <el-form-item label="确认密码" required v-if="user.resetPasswd">
                                            <el-input type="password" v-model="user.checkPasswd" autocomplete="off" show-password></el-input>
                                        </el-form-item>

                                        <el-form-item label="姓名">
                                            <el-input v-model="signedUser.firstname" autofocus placeholder="姓" style="width:30%;"></el-input>
                                            <el-input v-model="signedUser.lastname" placeholder="名" style="width:30%;"></el-input>
                                        </el-form-item>
                                        
                                        <el-form-item label="邮箱" required>
                                            <el-input v-model="signedUser.email"></el-input>
                                        </el-form-item>

                                        <el-form-item label="手机">
                                            <el-input v-model="signedUser.mobile"></el-input>
                                        </el-form-item>

                                        <el-form-item label="座机">
                                            <el-input v-model="signedUser.telephone"></el-input>
                                        </el-form-item>

                                        <el-form-item label="微信">
                                            <el-input v-model="signedUser.wechat"></el-input>
                                        </el-form-item>

                                        <el-form-item label="地址">
                                            <el-input type="textarea" v-model="signedUser.address"></el-input>
                                        </el-form-item>

                                    </el-form>

                                    <div class="dialog-footer" style="text-align:right;">
                                        <el-button type="default" @click="onCancel">取消</el-button>
                                        <el-button type="primary" @click="onSaveUser(signedUser)">更新用户</el-button>	
                                    </div>
                                    
                                </div>`,
                    methods: {
                        onCancel(){
                            this.$root.currentView = 'user-info';
                        },
                        onSaveUser(row){

							if(this.user.resetPasswd){

								if (_.isEmpty(this.user.passwd)) {
									this.$message({
										type: "warning",
										message: `登录密码不能为空！`
									})
									return false;
								}
	
								if (_.isEmpty(this.user.checkPasswd)) {
									this.$message({
										type: "warning",
										message: `确认密码不能为空！`
									})
									return false;
								}
	
								if ( this.user.passwd !== this.user.checkPasswd) {
									this.$message({
										type: "warning",
										message: `确认密码不一致！`
									})
									return false;
								}

								this.$set(row, 'resetPasswd', this.user.resetPasswd);
								this.$set(row, 'passwd', this.user.passwd);
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
    
                                        this.$root.currentView = "user-info";
    
                                    }
                                } );

								
								
							}).catch(() => {
								
							});

						}
                    }
                });
        
                Vue.component('user-info',{
                    delimiters: ['#{', '}#'],
                    data(){
                        return {
                            signedUser: mxAuth.signedUser,
                            user: {
                                resetPasswd: false,
                                passwd: "",
                                checkPasswd: ""
                            }
                        }
                    },
                    template:   `<div>
                                    <h2>用户信息</h2>
                                    <el-divider></el-divider>
                                    <el-form label-width="80px">
                                        
                                        <el-form-item label="组名称" required>
                                            <el-input v-model="signedUser.parent" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item label="登录名称" required>
                                            <el-input v-model="signedUser.username" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item label="姓名">
                                            <el-input v-model="signedUser.firstname" autofocus placeholder="姓" style="width:30%;" disabled="true"></el-input>
                                            <el-input v-model="signedUser.lastname" placeholder="名" style="width:30%;" disabled="true"></el-input>
                                        </el-form-item>
                                        
                                        <el-form-item label="邮箱" required>
                                            <el-input v-model="signedUser.email" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item label="手机">
                                            <el-input v-model="signedUser.mobile" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item label="座机">
                                            <el-input v-model="signedUser.telephone" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item label="微信">
                                            <el-input v-model="signedUser.wechat" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item label="地址">
                                            <el-input type="textarea" v-model="signedUser.address" disabled="true"></el-input>
                                        </el-form-item>
                                        
                                    </el-form>
                            
                                </div>`,
                    methods: {
                        update(){
                            this.$root.currentView = 'user-update';
                        }
                    }
                });
        
                Vue.component('company-update',{
                    delimiters: ['#{', '}#'],
                    template:   `<div class="animated fadeIn">
                                    <h2>企业信息</h2>
                                    <el-divider></el-divider>
                                    <el-form>
                                        <el-form-item label="企业简称">
                                            <el-input  v-model="signedUser.Company.name" autofocus required></el-input>
                                        </el-form-item>
                                        <el-form-item label="企业全称">
                                            <el-input v-model="signedUser.Company.fullname" autofocus required></el-input>
                                        </el-form-item>
                            
                                        <el-form-item label="系统名称">
                                            <el-input v-model="signedUser.Company.ospace" required disabled="true"></el-input>
                                        </el-form-item>
                            
                                        <el-form-item label="系统标题">
                                            <el-input v-model="signedUser.Company.title" required></el-input>
                                        </el-form-item>
                            
                                        <el-form-item label="企业网站">
                                            <el-input v-model="signedUser.Company.web" required></el-input>
                                        </el-form-item>
                            
                                        <el-form-item label="License">
                                            <el-input id="config" class="form-control" :value="license" required disabled>
                                                <el-button type="success" slot="append">
                                                    导入
                                                    <input type="file" name="loadfile" @change="importLicense" />
                                                </el-button>
                                            </el-input>
                                        </el-form-item>
                            
                                        <el-form-item style="text-align:right;">
                                            <el-button type="default" @click="cancel">取消</el-button>
                                            <el-button type="primary" @click="update">更新企业</el-button>
                                        </el-form-item>
                            
                                    </el-form>
                            
                                </div>`,
                    data(){
                        return {
                            signedUser: mxAuth.signedUser,
                            license: null
                        }
                    },
                    mounted(){
                        
                        this.$nextTick(()=>{
                            this.init();
                        })
        
                    },
                    methods: {
                        init(){
                            
                            let license = _.attempt(JSON.parse.bind(null, this.signedUser.Company.license));
                            
                            if(_.isEmpty(license)){
                                this.license = "未经授权用户";
                            } else {
                                this.license = `截止日期：${license.expire} 服务器数量：${license.server} 代理数量：${license.agent}`;
                            }
        
                        },
                        update(){
                            companyHandler.companyUpdateAsync(this.signedUser.Company).then( (rtn)=>{
                                if(rtn == 1){
                                    document.location.href = mx.getPage();
                                }
                            } );
                        },
                        cancel(){
                            this.$root.currentView = 'user-info';
                        },
                        importLicense(event){
                            
                            try{
        
                                let file = event.target.files[0];
        
                                licenseHandler.licenseImportAsync(file).then( (rtn)=>{
                                    if(rtn == 1){
                                        document.location.href = mx.getPage();
                                    }
                                } );
        
                            } catch(err){
                                console.error(err)
                            }
        
                        }
                    }
                });

            })
        })
    }

    mount(el){
        let main = {
            delimiters: ['#{', '}#'],
            template:   `<el-container style="background:#fff;height: calc(100vh - 85px);">
                            <el-aside id="nav" style="width:auto;">
                                <el-container>
                                    <el-header style="height:auto;text-align:center;">
                                        <el-button type="text" icon="el-icon-s-tools" @click="changeLogo" style="float: right;" v-if="mxAuth.isAdmin"></el-button>
                                        <p><img :src="logo" style="width:120px;max-width:120px;"></img></p>
                                    </el-header>
                                    <el-main style="overflow:hidden;">
                                        <h5>企业信息</h5>
                                        <p>企业简称：#{signedUser.Company.name}#</p>
                                        <p>企业全称：#{signedUser.Company.fullname}#</p>
                                        <p>系统名称：#{signedUser.Company.ospace}#</p>
                                        <p>系统标题：#{signedUser.Company.title}#</p>
                                        <p>License：#{license}#</p>
                                        <p>
                                            <el-link type="default" icon="el-icon-location" href="http://{{.website}}" target="_blank" :underline="false">官网</el-link>
                                        </p>
                                        <p style="display:flex;">
                                            <el-button type="success" icon="el-icon-edit" @click="toggleView('company-update')" v-if="mxAuth.isAdmin">更新企业信息</el-button>
                                            <el-button type="success" icon="el-icon-user" @click="toggleView('user-update')">更新用户信息</el-button>
                                        </p>
                                    </el-main>
                                </el-container>
                            </el-aside>
                            <el-main id="content" style="margin: 0px 0px 0px 10px;height: calc(100vh - 90px);background: rgb(255, 255, 255);">
                                <component v-bind:is="currentView"></component>
                            </el-main>
                        </el-container>`,
            data: {
                signedUser: mxAuth.signedUser,
                currentView: 'user-info',
                ifShow: true
            },
            computed: {
                logo(){
                    try{
                        return this.signedUser.Company.logo.replace(/"/g,"");
                    } catch(err){
                        console.error(err);
                        return "";
                    }
                },
                license(){
                    try{
                        let license = _.attempt( JSON.parse.bind(null, this.signedUser.Company.license) );
                        
                        if(_.isEmpty(license)){
                            return "未经授权用户";
                        } else {
                            return license.expire;
                        }
                    } catch(err){
                        console.error(err);
                        return "未经授权用户";
                    }
                }
            },
            methods: {
                toggleView(view){
                    this.currentView = view;
                },
                changeLogo(){
                    const self = this;

                    let wnd = maxWindow.winInfo("更改Logo",'<div id="fs-info"></div>',null,$('#content'));

                    let app = new Vue({
                        delimiters: ['#{', '}#'],
                        template: `<el-container style="height:100%;">
                                      <el-main style="display:flex;flex-wrap:wrap;align-content: flex-start;padding:10px;">
                                        <el-button type="text" style="width:10em;max-width: 10em;height: 105px;padding: 10px;line-height: 1;margin: 5px;text-align: center;border:1px solid rgba(0,0,0,.2);"
                                            v-for="icon in model.icon.list"
                                            :key="icon.id"
                                            @click="triggerInput(icon.id)">
                                            <el-image :src="icon | pickIcon" style="max-width: 55px;min-width: 55px;"></el-image>
                                            <p>
                                                <input type="radio" :ref="icon.id" :id="icon.id"  :value="'/fs'+icon.parent+'/'+icon.name+'?type=download&issys=true'" v-model="model.icon.value" >
                                            </p>
                                        </el-button>
                                      </el-main>
                                    <el-footer style="line-height:60px;text-align:right;">
                                        <el-button type="default" @click="onClose">取消</el-button>
                                    </el-footer>
                                </el-container>`,
                        data: {
                            model: {
                                icon: {
                                    value: '',
                                    list: []
                                }
                            }
                        },
                        watch: {
                            'model.icon.value': {
                                handler(val,oldVal){
                                    
                                    this.toDataURL(val,(dataUrl)=> {
                                        
                                        let company = {
                                            "name": self.signedUser.Company.name,
                                            "logo": dataUrl,
                                            "fullname": self.signedUser.Company.fullname,
                                            "icon": self.signedUser.Company.icon,
                                            "ospace": self.signedUser.Company.ospace,
                                            "title": self.signedUser.Company.title,
                                            "web": self.signedUser.Company.web,
                                            "config": {}
                                        };
                                        let rtn = companyHandler.companyUpdate(company);
                                        if(rtn == 1){
                                            document.location.href = mx.getPage();
                                        }
                                    });
                                },
                                deep:true
                            }
                        },
                        mounted() {
                            this.$nextTick(()=> {
                                this.init();
                            })
                        },
                        filters: {
                            pickIcon(item) {
                                return "/fs" + item.parent + "/" + item.name + "?type=download&issys=true";
                            }
                        },
                        methods: {
                            init(){
                                fsHandler.fsListAsync('/assets/images/files/png').then( (rtn)=>{
                                    this.model.icon.list = rtn;
                                } );
                            },
                            triggerInput(id){
                                $(this.$refs[id]).click()
                            },
                            toDataURL(url, callback) {
                                let xhr = new XMLHttpRequest();

                                xhr.onload = function() {
                                    var reader = new FileReader();
                                    reader.onloadend = function() {
                                        callback(reader.result);
                                    }
                                    reader.readAsDataURL(xhr.response);
                                };
                                xhr.open('GET', url);
                                xhr.responseType = 'blob';
                                xhr.send();
                            },
                            onClose(){
                                wnd.close();
                            }
                        }
                    }).$mount("#fs-info");
                }

            }
        };

        _.delay(()=>{
            this.app = new Vue(main).$mount(el);
        })
    }

}