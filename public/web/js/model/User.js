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
                
                

                Vue.component('user-update',{
                    i18n,
                    delimiters: ['#{', '}#'],
                    data(){
                        return {
                            signedUser: mxAuth.signedUser,
                            user: {
                                resetPasswd: false,
                                passwd: "",
                                checkPasswd: ""
                            },
                            validPasswd: 0
                        }
                    },
                    template:   `<div>
                                    <h2>#{ $t('user.userInfo') }#</h2>
                                    <el-divider></el-divider>
                                    <el-form label-width="80px">
                                        
                                        <el-form-item :label="$t('user.parent')" required>
                                            <el-input v-model="signedUser.parent" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.userName')" required>
                                            <el-input v-model="signedUser.username" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.resetPassword')">
                                            <el-switch v-model="user.resetPasswd"></el-switch>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.password')" required v-if="user.resetPasswd">
                                            <el-input type="password" v-model="user.passwd" autocomplete="off" show-password @blur="onPasswordVaild($event)">
                                                <template v-if="validPasswd>0">
                                                    <el-button slot="append" type="success" icon="el-icon-check" style="background: #67c23a;color: #fff;" v-if="validPasswd==1">
                                                        #{ $t('user.passwordSetup') }#
                                                    </el-button>
                                                    <el-button slot="append" type="error" style="background: #ffa500;color: #fff;" icon="el-icon-warning" v-else>
                                                    #{ $t('user.passwordTip') }#
                                                    </el-button>
                                                </template>
                                            </el-input>
                                        </el-form-item>"

                                        <el-form-item :label="$t('user.checkPassword')" required v-if="user.resetPasswd">
                                            <el-input type="password" v-model="user.checkPasswd" autocomplete="off" show-password></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.fullName')">
                                            <el-input v-model="signedUser.firstname" autofocus placeholder="姓" style="width:30%;"></el-input>
                                            <el-input v-model="signedUser.lastname" placeholder="名" style="width:30%;"></el-input>
                                        </el-form-item>
                                        
                                        <el-form-item :label="$t('user.email')" required>
                                            <el-input v-model="signedUser.email"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.mobile')">
                                            <el-input v-model="signedUser.mobile"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.telephone')">
                                            <el-input v-model="signedUser.telephone"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.wechat')">
                                            <el-input v-model="signedUser.wechat"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.address')">
                                            <el-input type="textarea" v-model="signedUser.address"></el-input>
                                        </el-form-item>

                                    </el-form>

                                    <div class="dialog-footer" style="text-align:right;">
                                        <el-button type="default" @click="onCancel">#{ $t('user.cancel') }#</el-button>
                                        <el-button type="primary" @click="onSaveUser(signedUser)" :disabled="user.resetPasswd && validPasswd==2">#{ $t('user.applyUser') }#</el-button>	
                                    </div>
                                    
                                </div>`,
                    methods: {
                        onCancel(){
                            this.$root.currentView = 'user-info';
                        },
                        onPasswordVaild(evt){
                            userHandler.passwordVaild(evt.target.value).then((rtn)=>{
                                if(rtn === 1){
                                    this.validPasswd = 1;
                                } else {
                                    this.validPasswd = 2;
                                }
                            });
                        },
                        onSaveUser(row){

							if(this.user.resetPasswd){

								if (_.isEmpty(this.user.passwd)) {
									this.$message({
										type: "warning",
										message: this.$t('user.passwordNotNull')
									})
									return false;
								}
	
								if (_.isEmpty(this.user.checkPasswd)) {
									this.$message({
										type: "warning",
										message: this.$t('user.checkPasswordNotNull')
									})
									return false;
								}
	
								if ( this.user.passwd !== this.user.checkPasswd) {
									this.$message({
										type: "warning",
										message: this.$t('user.checkPasswordNotSame')
									})
									return false;
								}

								this.$set(row, 'resetPasswd', this.user.resetPasswd);
								this.$set(row, 'passwd', this.user.passwd);
							}
							
							
							if (_.isEmpty(row.email)) {
								this.$message({
									type: "warning",
									message: this.$t('user.emailNotNull')
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

							this.$confirm(`${ this.$t('user.confirmUpdateUser') }：${row.fullname}？`, this.$t('user.tip'), {
								confirmButtonText: this.$t('user.confirm'),
								cancelButtonText: this.$t('user.cancel'),
								type: 'warning'
							}).then(() => {
									
								let _csrf = window.CsrfToken.replace(/'/g,"");
								userHandler.userUpdateAsync(row, _csrf).then( (rtn)=>{
                                    if(rtn == 1){
                                        this.$message({
                                            type: "success",
                                            message: `${ this.$t('user.updateSuccess') } ${row.username}`
                                        })
    
                                        this.$root.currentView = "user-info";
    
                                    }else {
                                        this.$message({
                                            type: "error",
                                            message: `${this.$t('user.updateFailed')}  ${row.username} ` + rtn
                                        })
                                    }
                                } );

								
								
							}).catch(() => {
								
							});

						}
                    }
                });
        
                Vue.component('user-info',{
                    i18n,
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
                                    <h2>#{ $t('user.userInfo') }#</h2>
                                    <el-divider></el-divider>
                                    <el-form label-width="80px">
                                        
                                        <el-form-item :label="$t('user.parent')" required>
                                            <el-input v-model="signedUser.parent" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.userName')" required>
                                            <el-input v-model="signedUser.username" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.fullName')">
                                            <el-input v-model="signedUser.firstname" autofocus placeholder="姓" style="width:30%;" disabled="true"></el-input>
                                            <el-input v-model="signedUser.lastname" placeholder="名" style="width:30%;" disabled="true"></el-input>
                                        </el-form-item>
                                        
                                        <el-form-item :label="$t('user.email')" required>
                                            <el-input v-model="signedUser.email" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.mobile')">
                                            <el-input v-model="signedUser.mobile" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.telephone')">
                                            <el-input v-model="signedUser.telephone" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.wechat')">
                                            <el-input v-model="signedUser.wechat" disabled="true"></el-input>
                                        </el-form-item>

                                        <el-form-item :label="$t('user.address')">
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
                    i18n,
                    delimiters: ['#{', '}#'],
                    template:   `<div class="animated fadeIn">
                                    <h2>#{ $t('user.companyInfo') }#</h2>
                                    <el-divider></el-divider>
                                    <el-form>
                                        <el-form-item :label="$t('user.companyName')">
                                            <el-input  v-model="signedUser.Company.name" autofocus required disabled></el-input>
                                        </el-form-item>
                                        <el-form-item :label="$t('user.companyFullname')">
                                            <el-input v-model="signedUser.Company.fullname" autofocus required></el-input>
                                        </el-form-item>
                            
                                        <el-form-item :label="$t('user.ospace')">
                                            <el-input v-model="signedUser.Company.ospace" required disabled="true"></el-input>
                                        </el-form-item>
                            
                                        <el-form-item :label="$t('user.title')">
                                            <el-input v-model="signedUser.Company.title" required></el-input>
                                        </el-form-item>
                            
                                        <el-form-item :label="$t('user.website')">
                                            <el-input v-model="signedUser.Company.web" required></el-input>
                                        </el-form-item>
                            
                                        <el-form-item :label="$t('user.license')">
                                            <el-input id="config" class="form-control" :value="license" required disabled>
                                                <el-button type="success" slot="append">
                                                    #{ $t('user.import') }#
                                                    <input type="file" name="loadfile" @change="importLicense" />
                                                </el-button>
                                            </el-input>
                                        </el-form-item>
                            
                                        <el-form-item style="text-align:right;">
                                            <el-button type="default" @click="cancel">#{ $t('user.cancel') }#</el-button>
                                            <el-button type="primary" @click="update">#{ $t('user.applyCompany') }#</el-button>
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
                                this.license = this.$t('user.unauthorizedUsers');
                            } else {
                                this.license = `${ this.$t('user.closingDate') } ${license.expire} ${ this.$t('user.numberOfServers') } ${license.server} ${ this.$t('user.NumberOfAgents') } ${license.agent}`;
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
            i18n,
            delimiters: ['#{', '}#'],
            template:   `<el-container style="background:#fff;height: calc(100vh - 85px);">
                            <el-aside id="nav" style="width:auto;">
                                <el-container>
                                    <el-header style="height:auto;text-align:center;">
                                        <el-button type="text" icon="el-icon-s-tools" @click="dialog.iconUpdate.show=true" style="float: right;" v-if="mxAuth.isAdmin"></el-button>
                                        <p><img :src="logo" style="width:120px;max-width:120px;"></img></p>
                                    </el-header>
                                    <el-main style="overflow:hidden;">
                                        <h5>#{ $t('user.companyInfo') }#</h5>
                                        <p>#{ $t('user.companyName') }#：#{signedUser.Company.name}#</p>
                                        <p>#{ $t('user.companyFullname') }#：#{signedUser.Company.fullname}#</p>
                                        <p>#{ $t('user.ospace') }#：#{signedUser.Company.ospace}#</p>
                                        <p>#{ $t('user.title') }#：#{signedUser.Company.title}#</p>
                                        <p>#{ $t('user.license') }#：#{license}#</p>
                                        <p>
                                            <el-link type="default" icon="el-icon-location" href="http://{{.website}}" target="_blank" :underline="false">#{ $t('user.website') }#</el-link>
                                        </p>
                                        <p style="display:flex;">
                                            <el-button type="success" icon="el-icon-edit" @click="toggleView('company-update')" v-if="mxAuth.isAdmin">#{ $t('user.applyCompany') }#</el-button>
                                            <el-button type="success" icon="el-icon-user" @click="toggleView('user-update')">#{ $t('user.applyUser') }#</el-button>
                                        </p>
                                    </el-main>
                                </el-container>
                            </el-aside>
                            <el-main id="content" style="margin: 0px 0px 0px 10px;height: calc(100vh - 90px);background: rgb(255, 255, 255);">
                                <component v-bind:is="currentView"></component>
                            </el-main>
                            <el-dialog :title="$t('user.changeIcon')" :visible.sync="dialog.iconUpdate.show" v-if="dialog.iconUpdate.show" destroy-on-close="true">
                                <el-container style="height:50vh;">
                                    <el-main style="display:flex;flex-wrap:wrap;align-content: flex-start;padding:10px;">
                                        <el-button type="text" style="width:10em;max-width: 10em;height: 105px;padding: 10px;line-height: 1;margin: 5px;text-align: center;border:1px solid rgba(0,0,0,.2);"
                                            v-for="icon in dialog.iconUpdate.model.icon.list"
                                            :key="icon.id"
                                            @click="triggerInput(icon.id)">
                                            <el-image :src="icon | pickIcon" style="max-width: 55px;min-width: 55px;"></el-image>
                                            <p>
                                                <input type="radio" :ref="icon.id" :id="icon.id"  :value="'/fs'+icon.parent+'/'+icon.name+'?type=download&issys=true'" v-model="dialog.iconUpdate.model.icon.value" >
                                            </p>
                                        </el-button>
                                        </el-main>
                                    <el-footer style="padding:20px 0px 50px 0px;display:flex;height:auto;position:releative;">
                                        <span style="position:absolute;right:140px;">
                                            <el-button type="default" icon="el-icon-close" @click="dialog.iconUpdate.show=false;">#{ $t('user.cancel') }#</el-button>
                                        </span>
                                        <span style="position:absolute;right:20px;">
                                            <el-upload
                                                multiple
                                                :data="{index:true}"
                                                :action="dialog.iconUpdate.upload.url"
                                                :before-upload="onBeforeUpload"
                                                :on-success="onSuccess"
                                                :on-error="onError"
                                                :show-file-list="false"
                                                name="uploadfile">
                                                <el-button icon="el-icon-upload" type="primary" style="padding-left:20px;" :loading="dialog.iconUpdate.upload.loading">#{ $t('user.uploadIcon') }#</el-button>
                                            </el-upload>
                                        </span>
                                    </el-footer>
                                </el-container>
                            </el-dialog>
                        </el-container>`,
            data: {
                signedUser: mxAuth.signedUser,
                currentView: 'user-info',
                ifShow: true,
                dialog: {
                    iconUpdate: {
                        show: false,
                        model: {
                            icon: {
                                value: '',
                                list: []
                            }
                        },
                        upload: {
                            url: `/fs/assets/images/files/png?issys=true`,
                            fileList: [],
                            loading: false
                        }
                    }
                }
            },
            filters: {
                pickIcon(item) {
                    return "/fs" + item.parent + "/" + item.name + "?type=download&issys=true";
                }
            },
            watch: {
                'dialog.iconUpdate.model.icon.value': {
                    handler(val,oldVal){
                        
                        this.$confirm(`${ this.$t('user.confirmChangeIcon') }`, this.$t('user.tip'), {
                            confirmButtonText: this.$t('user.confirm'),
                            cancelButtonText: this.$t('user.cancel'),
                            type: 'warning'
                        }).then(() => {
                            
                            this.toDataURL(val,(dataUrl)=> {
                            
                                let company = {
                                    "name": this.signedUser.Company.name,
                                    "logo": dataUrl,
                                    "fullname": this.signedUser.Company.fullname,
                                    "icon": this.signedUser.Company.icon,
                                    "ospace": this.signedUser.Company.ospace,
                                    "title": this.signedUser.Company.title,
                                    "web": this.signedUser.Company.web,
                                    "config": {}
                                };
                                let rtn = companyHandler.companyUpdate(company);
                                if(rtn == 1){
                                    document.location.href = mx.getPage();
                                }
                            });
                            
                        }).catch(() => {
                            
                        });

                    },
                    deep:true
                }
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
                            return this.$t('user.unauthorizedUsers');
                        } else {
                            return license.expire;
                        }
                    } catch(err){
                        console.error(err);
                        return this.$t('user.unauthorizedUsers');
                    }
                }
            },
            created(){
                this.init();
            },
            methods: {
                init(){
                    fsHandler.fsListAsync('/assets/images/files/png').then( (rtn)=>{
                        this.dialog.iconUpdate.model.icon.list = rtn;
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
                toggleView(view){
                    this.currentView = view;
                },
                onBeforeUpload(){
                    this.dialog.iconUpdate.upload.loading = true;
                },
                onSuccess(res,file,FileList){
                    this.dialog.iconUpdate.upload.fileList = FileList;
                    this.$message({
                        type: "success",
                        message: this.$t('user.uploadSuccess')
                    })
                    this.dialog.iconUpdate.upload.loading = false;
                    this.init();
                },
                onError(err,file,FileList){
                    this.$message({
                        type: "error",
                        message: this.$t('user.uploadFailed') + err
                    })
                    this.dialog.iconUpdate.upload.loading = false;
                    this.init();
                }

            }
        };

        _.delay(()=>{
            this.app = new Vue(main).$mount(el);
        })
    }

}