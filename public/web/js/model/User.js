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

        VueLoader.onloaded([],function() {

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
                                        {{.CsrfTokenHtml}}
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

                                        <!--el-form-item label="姓名">
                                            <el-input v-model="signedUser.firstname" autofocus placeholder="姓" style="width:30%;"></el-input>
                                            <el-input v-model="signedUser.lastname" placeholder="名" style="width:30%;"></el-input>
                                        </el-form-item-->
                                        
                                        <!--el-form-item label="邮箱" required>
                                            <el-input v-model="signedUser.email"></el-input>
                                        </el-form-item-->

                                        <!--el-form-item label="手机">
                                            <el-input v-model="signedUser.mobile"></el-input>
                                        </el-form-item-->

                                        <!--el-form-item label="座机">
                                            <el-input v-model="signedUser.telephone"></el-input>
                                        </el-form-item-->

                                        <!--el-form-item label="微信">
                                            <el-input v-model="signedUser.wechat"></el-input>
                                        </el-form-item-->

                                        <!--el-form-item label="地址">
                                            <el-input type="textarea" v-model="signedUser.address"></el-input>
                                        </el-form-item-->

                                </div>`,
                    created(){
                        console.log(this.signedUser)
                        this.userForm.mobile = _.fill([''], window.SignedUser_Mobile).join(",");
                        this.userForm.email = _.fill([''], window.SignedUser_EMAIL).join(",");
                    },
                    methods: {
                        onCancel(){
                            appVue.currentView = 'user-info';
                        },
                        onSubmit(){
                            
                            jQuery.ajax({
                                url: `/admin/users/${this.signedUser.id}`,
                                dataType: 'json',
                                type: 'POST',
                                data: {
                                    fullname: this.userForm.user_name,
                                    email: this.userForm.email,
                                    password: this.userForm.password
                                },
                                async:false,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("X-Csrf-Token", window.CsrfToken);
                                },
                                complete: function (xhr, textStatus) {
                                },
                                success: function (data, textStatus, xhr) {
                                    console.log(data)
                                },
                                error: function(xhr, textStatus, errorThrown) {
                                    console.log(errorThrown)
                                }
                            })
                        }
                    }
                });
        
                Vue.component('user-info',{
                    delimiters: ['#{', '}#'],
                    template: '#user-info-template',
                    computed: {
                        email: function(){
                            var self = this;
                            let email = _.fill([''], window.SignedUser_EMAIL);
        
                            return email.join(",");
                        },
                        vtime(){
                            
                            return moment().format("LLL");
                        }
                    },
                    methods: {
                        update: function(){
                            appVue.currentView = 'user-update';
                        }
                    }
                });
        
                Vue.component('company-update',{
                    delimiters: ['#{', '}#'],
                    template: '#company-update-template',
                    data(){
                        return {
                            company:{
                                name: window.COMPANY_NAME,
                                fullname: window.COMPANY_FULLNAME,
                                icon: window.COMPANY_FAVICON,
                                logo: window.COMPANY_LOGO,
                                ospace: window.COMPANY_OSPACE,
                                title: window.MATRIX_TITLE,
                                web: window.COMPANY_WEBSITE
                            },
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
                            const self = this;
        
                            $(self.$el).find("#icon").attr("src",window.COMPANY_FAVICON);
                            $(self.$el).find("#logo").attr("src",window.COMPANY_LOGO);
        
                            let _license = _.attempt(JSON.parse.bind(null, window.COMPANY_LICENSE));
        
                            if(_.isEmpty(_license)){
                                self.license = "未经授权用户";
                            } else {
                                self.license = `截止日期：${_license.expire} 服务器数量：${_license.server} 代理数量：${_license.agent}`;
                            }
        
                        },
                        update(){
                            let _rtn = companyHandler.companyUpdate(this.company);
        
                            if(_rtn == 1){
                                document.location.href = mx.getPage();
                            }
                        },
                        cancel(){
                            appVue.currentView = 'user-info';
                        },
                        importLicense(event){
                            
                            try{
        
                                let file = event.target.files[0];
        
                                let rtn = licenseHandler.licenseImport(file);
        
                                if(rtn == 1){
                                    document.location.href = mx.getPage();
                                }
                            } catch(err){
                                console.log(err)
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
            template: "#app-template",
            data: {
                currentView: 'user-info',
                logo: null,
                ifShow: true,
                license: null
            },
            created:function(){
                const self = this;


            },
            computed: {
                vtime(){
                    return moment().format("YYYY-MM-DD hh:mm:ss");
                }
            },
            mounted(){
                this.$nextTick(()=>{
                    this.init();
                })
            },
            methods: {
                init(){
                    
                    let logo = window.COMPANY_LOGO;
                    
                    this.logo = logo.replace(/"/g,"");

                    let _license = _.attempt(JSON.parse.bind(null, '{{.license}}'));

                    if(_.isEmpty(_license)){
                        this.license = "未经授权用户";
                    } else {
                        this.license = `${_license.expire}`;
                    }
                },
                update: function(){
                    const self = this;
                    let fullname = '{{.SignedUser.FullName}}.replace(/"/g,"")';
                    let email = $("#email").val().split(",");
                    let password = $("#password").val();

                    jQuery.ajax({
                        url: '/admin/users/15305020520705546474',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            fullname: fullname,
                            email: email,
                            password: password
                        },
                        beforeSend: function(xhr) {
                        },
                        complete: function(xhr, textStatus) {
                        },
                        success: function(data, textStatus, xhr) {
                            eventHub.$emit('tree-refresh-event',null);
                        },
                        error: function(xhr, textStatus, errorThrown) {
                            console.log(xhr,textStatus, errorThrown);
                            eventHub.$emit('tree-refresh-event',null);
                        }
                    });

                },
                toggleView(view){
                    this.currentView = view;
                },
                changeLogo(){
                    const self = this;

                    let wnd = maxWindow.winInfo("更改Logo",'<div id="fs-info"></div>',null,$('#content'));

                    let _infoVue = new Vue({
                        delimiters: ['#{', '}#'],
                        el: "#fs-info",
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
                                handler: function(val,oldVal){
                                    let me = this;

                                    me.toDataURL(val,function(dataUrl) {
                                        
                                        let _company = {
                                            "name": window.COMPANY_NAME,
                                            "logo": dataUrl,
                                            "fullname": window.COMPANY_FULLNAME,
                                            "icon": window.COMPANY_FAVICON,
                                            "ospace": window.COMPANY_OSPACE,
                                            "title": window.MATRIX_TITLE,
                                            "web": window.COMPANY_WEBSITE,
                                            "config": {}
                                        };
                                        let _rtn = companyHandler.companyUpdate(_company);
                                        if(_rtn == 1){
                                            document.location.href = mx.getPage();
                                        }
                                    });
                                },
                                deep:true
                            }
                        },
                        mounted() {
                            let me = this;

                            me.$nextTick(function() {
                                me.init();
                            })
                        },
                        filters: {
                            pickIcon(item) {
                                return "/fs" + item.parent + "/" + item.name + "?type=download&issys=true";
                            }
                        },
                        methods: {
                            init(){
                                let me = this;

                                me.model.icon.list = fsHandler.fsList('/assets/images/files/png');
                            },
                            triggerInput(id){
                                const self = this;

                                $(self.$refs[id]).click()
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
                    })
                }

            }
        };

        _.delay(()=>{
            this.app = new Vue(main).$mount(el);
        })
    }

}