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
        
    }

    init() {

        VueLoader.onloaded(["ai-robot-component"
                        ],function() {

            $(function() {
                moment.locale('zh_CN');

                Vue.component('user-update',{
                    delimiters: ['${', '}'],
                    template: '#user-update-template',
                    data(){
                        return {
                            userForm: {
                                user_name: '{{.SignedUser.UserName}}',
                                password: '{{.SignedUser.Passwd}}',
                                mobile: "",
                                email: ""
                            }
                        }
                    },
                    created(){
                        this.userForm.mobile = _.fill([''], '{{.SignedUser.Mobile}})'.join(",");
                        this.userForm.email = _.fill([''], '{{.SignedUser.Email}})'.join(",");
                    },
                    mounted(){
                        console.log(this.userForm)
                    },
                    methods: {
                        onCancel(){
                            appVue.currentView = 'user-info';
                        },
                        onSubmit(){
                            // let fm = new FormData();
                            // fm.append("user_name", this.userForm.user_name);
                            // fm.append("password", this.userForm.password);
                            // fm.append("email", this.userForm.email);

                            jQuery.ajax({
                                url: "/admin/users/15305020520705546474",
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
                    delimiters: ['${', '}'],
                    template: '#user-info-template',
                    computed: {
                        email: function(){
                            var self = this;
                            let email = _.fill([''], '{{.SignedUser.Email}}');

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
                    delimiters: ['${', '}'],
                    template: '#company-update-template',
                    data: function(){
                        return {
                            company:{
                                name: '{{.company}}',
                                fullname: '{{.company_fullname}}',
                                icon: '{{.icon}}',
                                logo: '{{.logo}}',
                                ospace: '{{.ospace}}',
                                title: '{{.title}}',
                                web: '{{.website}}'
                            },
                            license: null
                        }
                    },
                    mounted: function(){
                        const self = this;

                        self.$nextTick(function(){
                            self.init();
                        })

                    },
                    methods: {
                        init: function(){
                            const self = this;

                            $(self.$el).find("#icon").attr("src",'{{.icon}}');
                            $(self.$el).find("#logo").attr("src",'{{.logo}}');

                            let _license = _.attempt(JSON.parse.bind(null, `{{.license}}`));

                            if(_.isEmpty(_license)){
                                self.license = "未经授权用户";
                            } else {
                                self.license = `截止日期：${_license.expire} 服务器数量：${_license.server} 代理数量：${_license.agent}`;
                            }

                        },
                        update: function(){
                            const self = this;

                            let _rtn = companyHandler.companyUpdate(self.company);

                            if(_rtn == 1){
                                document.location.href = mx.getPage();
                            }
                        },
                        cancel: function(){
                            appVue.currentView = 'user-info';
                        },
                        importLicense: function(event){
                            console.log(1,event)
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

                var appVue = new Vue({
                    delimiters: ['${', '}'],
                    el: "#app",
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
                            
                            let logo = `{{.logo}}`;
                            
                            this.logo = logo.replace(/"/g,"");

                            let _license = _.attempt(JSON.parse.bind(null, `{{.license}}`));

                            if(_.isEmpty(_license)){
                                this.license = "未经授权用户";
                            } else {
                                this.license = `${_license.expire}`;
                            }
                        },
                        update: function(){
                            const self = this;
                            let fullname = `{{.SignedUser.FullName}}.replace(/"/g,"")`;
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
                                                let _config = `{{.company_config}}`;
                                                let _company = {
                                                    "name": "{{.company}}",
                                                    "logo": dataUrl,
                                                    "fullname": "{{.company_fullname}}",
                                                    "icon": "{{.icon}}",
                                                    "ospace": "{{.ospace}}",
                                                    "title": "{{.title}}",
                                                    "web": "{{.website}}",
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
                                mounted: function() {
                                    let me = this;

                                    me.$nextTick(function() {
                                        me.init();
                                    })
                                },
                                filters: {
                                    pickIcon: function(item) {
                                        return "/fs" + item.parent + "/" + item.name + "?type=download&issys=true";
                                    }
                                },
                                methods: {
                                    init: function(){
                                        let me = this;

                                        me.model.icon.list = fsHandler.fsList('/assets/images/files/png');
                                    },
                                    triggerInput: function(id){
                                        const self = this;

                                        $(self.$refs[id]).click()
                                    },
                                    toDataURL: function(url, callback) {
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
                })
            })
        })
    }

}

let mxUser = new User();