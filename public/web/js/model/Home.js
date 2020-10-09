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
class Home extends Matrix {

    constructor() {
        super();
        this.app = null;
    }

    init() {
        VueLoader.onloaded(["search-preset-component",
                            "search-base-component",
                            "ai-robot-component"],function() {

            $(function() {

                let main = {
                    i18n,
                    delimiters: ['#{', '}#'],
                    template:   `<el-container style="padding:30px 0;">
                                    <el-main style="padding:0px;overflow:hidden;">
                                        <!--搜索框-->
                                        <el-row type="flex" justify="center" style="padding:40px 0px;">
                                            <el-col :span="18">
                                                <search-base-component :options="options" ref="searchRef" class="grid-content"></search-base-component>
                                                <div id="search-result-content" v-if="model.message"></div>
                                            </el-col>
                                        </el-row>
                                        <!--应用组图标-->
                                        <el-row type="flex" justify="center">
                                            <el-col :span="14" style="display:flex;flex-wrap:wrap;align-content: flex-start;max-height: 60vh;overflow:auto;" class="drag-content"> 
                                                <el-dropdown v-for="(item,index) in apps.template" :key="item.name" @command="onCommand" trigger="click" placement="top-end"  :hide-on-click="false">
                                                    <el-button type="primary"
                                                        class="animated flipInX" 
                                                        style="max-width: 120px;width: 120px;max-height:90px;height:90px;margin: 5px;border-radius: 10px!important;background: rgb(36, 44, 70);border:unset;">
                                                        <p style="display: flex;flex-wrap: wrap;max-height:40px;height: 40px;margin:5px 0px;">
                                                            <el-image :src="folder.icon | pickIcon" style="margin:3px;width:14px;height:14px;" v-for="(folder,index) in item.groups" v-if="index<8"></el-image>
                                                        </p>
                                                        <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                                            #{ _.isEmpty($t('home.group')[item.name])?item.title:$t('home.group')[item.name] }#（ #{item.groups.length}# ） 
                                                        </p>
                                                        <el-dropdown @command="onGroupCommand" trigger="hover" placement="top-start"  style="position: absolute;right: 5px;top: 5px;">
                                                            <span class="el-dropdown-link">
                                                                <i class="el-icon-arrow-down el-icon--right" style="color:rgba(255,255,255,0.5)"></i>
                                                            </span>
                                                            <el-dropdown-menu slot="dropdown">
                                                                <el-dropdown-item :command="{cmd:'update',data:item}">#{ $t('home.actions.updateGroup') }#</el-dropdown-item>
                                                                <el-dropdown-item :command="{cmd:'remove',data:item}" divided>#{ $t('home.actions.deleteGroup') }#</el-dropdown-item>
                                                            </el-dropdown-menu>
                                                        </el-dropdown>
                                                    </el-button>
                                                    <!--应用图标-->
                                                    <el-dropdown-menu slot="dropdown" :class="'menu-dropdown drag-content-' + index" v-if="!_.isEmpty(item.groups)">
                                                        <el-dropdown-item :command="subItem" v-for="(subItem,index) in item.groups" :key="subItem.id">
                                                            <template scope="scope">
                                                                <el-button type="primary" 
                                                                    @click.stop.prevent="onCommand(subItem)"
                                                                    style="max-width: 120px;width: 120px;height:90px;border-radius: 10px!important;background:rgb(36, 44, 70);border:unset;margin: 5px;">
                                                                    <el-image :src="subItem.icon | pickIcon" style="width:40px;margin:5px;min-height: 40px;"></el-image>
                                                                    <p style="white-space:nowrap;overflow:hidden;margin:5px;display:flex;">
                                                                        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" v-if="window.MATRIX_LANG == 'zh-CN'">#{subItem.cnname}#</span>
                                                                        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" v-else>#{subItem.enname}#</span>
                                                                        <el-dropdown @command="onAppCommand" trigger="hover" placement="top-end" style="color:rgba(255,255,255,.5);">
                                                                            <span class="el-dropdown-link">
                                                                                <i class="el-icon-arrow-down el-icon--right" style="color:rgba(255,255,255,0.5)"></i>
                                                                            </span>
                                                                            <el-dropdown-menu slot="dropdown">
                                                                                <el-dropdown-item disabled>
                                                                                    <span v-if="window.MATRIX_LANG == 'zh-CN'">#{subItem.cnname}#</span>
                                                                                    <span v-else>#{subItem.enname}#</span>
                                                                                </el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'walking',data:subItem}" divided>#{ $t('home.actions.open') }#</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'running',data:subItem}">#{ $t('home.actions.openNew') }#</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'home',data:subItem}" divided>#{ $t('home.actions.setHome') }#</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'allUserHome',data:item}">#{ $t('home.actions.seAllUsertHome') }#</el-dropdown-item>
                                                                                <el-dropdown-item divided disabled>#{ $t('home.group.groupTitle') }#</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'groupAction', targetGroup: groupItem.name, data:subItem}" v-for="groupItem in _.xor(apps.template,[item])">#{ $t('home.actions.moveTo') }#【#{groupItem.title}#】</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'groupAction', targetGroup: '', data:subItem}">#{ $t('home.actions.moveToDesktop') }#</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'uninstall',data:subItem}" divided>#{ $t('home.actions.uninstall') }#</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'share',data:subItem}" divided>#{ $t('home.actions.share') }#</el-dropdown-item>
                                                                            </el-dropdown-menu>
                                                                        </el-dropdown>
                                                                    </p>
                                                                </el-button>
                                                            </template>
                                                        </el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                                <el-button type="primary" 
                                                    class="animated flipInX" 
                                                    v-for="item in apps.appListUnGrouped" 
                                                    @click="onCommand(item)"
                                                    style="max-width: 120px;width: 120px;height:90px;border-radius: 10px!important;background:rgb(36, 44, 70);border:unset;margin: 5px;">
                                                    <el-image style="width:40px;margin:5px;min-height: 40px;" :src="item.icon | pickIcon"></el-image>
                                                    <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;">
                                                        <span v-if="window.MATRIX_LANG == 'zh-CN'">#{item.cnname}#</span>
                                                        <span v-else>#{item.enname}#</span>
                                                    </p>
                                                    <el-dropdown @command="onAppCommand" trigger="hover" placement="top-start" style="position: absolute;right: 5px;top: 5px;">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-arrow-down el-icon--right" style="color:rgba(255,255,255,0.5)"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item disabled>
                                                                <span v-if="window.MATRIX_LANG == 'zh-CN'">#{item.cnname}#</span>
                                                                <span v-else>#{item.enname}#</span>
                                                            </el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'walking',data:item}" divided>#{ $t('home.actions.open') }#</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'running',data:item}">#{ $t('home.actions.openNew') }#</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'home',data:item}" divided>#{ $t('home.actions.setHome') }#</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'allUserHome',data:item}">#{ $t('home.actions.seAllUsertHome') }#</el-dropdown-item>
                                                            <el-dropdown-item divided disabled>#{ $t('home.group.groupTitle') }#</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'groupAction', targetGroup: groupItem.name, data:item}" v-for="groupItem in apps.template">#{ $t('home.actions.moveTo') }#【#{groupItem.title}#】组</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'uninstall',data:item}" divided>#{ $t('home.actions.uninstall') }#</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'share',data:item}" divided>#{ $t('home.actions.share') }#</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                    </el-dropdown>
                                                </el-button>
                                                <el-button type="default" 
                                                    style="max-width: 120px;width: 120px;height:90px;border-radius:10px!important;background: rgba(255,255,255,0.3);margin: 5px;">
                                                    <el-dropdown trigger="hover" placement="top-start">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-plus" style="font-size: 20px;"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item @click.native="onPlusCommand({type:'newGroup',url:''})">#{ $t('home.actions.newGroup') }#</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onPlusCommand({type:'newApp',url:'/matrix/system'})">#{ $t('home.actions.newApp') }#</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                    </el-dropdown>
                                                </el-button>
                                                <!--新建组-->
                                                <el-dialog :title="$t('home.group.application')" :visible.sync="group.newDialog.show" width="30%" destroy-on-close="true" modal="false" v-if="group.newDialog.show">
                                                    <el-form :model="group.newDialog.form" style="width:100%;" label-position="top">
                                                        <el-form-item :label="$t('home.group.groupName')" label-width="80">
                                                            <el-input v-model="group.newDialog.form.title" v-focus clearable></el-input>
                                                        </el-form-item>
                                                        <el-form-item :label="$t('home.group.groupIcon')" label-width="80" style="display:none;">
                                                            <el-radio-group v-model="group.newDialog.form.icon" style="display:flex;flex-wrap:wrap;align-content:flex-start;height:200px;overflow:auto;">
                                                                <el-button type="default" 
                                                                    style="width:8em;max-width:8em;height:90px;height:auto;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);" 
                                                                    v-for="icon in group.iconList" :key="icon.id">
                                                                    <el-radio :label="icon.icon | pickIcon">
                                                                        <el-image :src="icon.icon | pickIcon" style="max-width: 55px;min-width: 55px;" fit="contain"></el-image>
                                                                        <span slot="label">#{icon.id}#</span>
                                                                    </el-radio>
                                                                </el-button>
                                                            </el-radio-group>
                                                        </el-form-item>
                                                    </el-form>
                                                    <div slot="footer" class="dialog-footer">
                                                        <el-button @click="group.dialogVisible = false">#{ $t('home.actions.cancel') }#</el-button>
                                                        <el-button type="primary" @click="groupAdd" @keyup.enter.native.prevent="groupAdd">#{ $t('home.actions.apply') }#</el-button>
                                                    </div>
                                                </el-dialog>

                                                <!--编辑组-->
                                                <el-dialog :title="$t('home.group.application')" :visible.sync="group.editDialog.show" width="30%" destroy-on-close="true" modal="false" v-if="group.editDialog.show">
                                                    <el-form :model="group.editDialog.form" style="width:100%;" label-position="top">
                                                        <el-form-item :label="$t('home.group.groupName')" label-width="80">
                                                            <el-input v-model="group.editDialog.form.title" v-focus clearable></el-input>
                                                        </el-form-item>
                                                        <el-form-item :label="$t('home.group.groupIcon')" label-width="80" style="display:none;">
                                                            <el-radio-group v-model="group.editDialog.form.icon" style="display:flex;flex-wrap:wrap;align-content:flex-start;height:200px;overflow:auto;">
                                                                <el-button type="default" 
                                                                    style="width:8em;max-width:8em;height:90px;height:auto;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);" 
                                                                    v-for="icon in group.iconList" :key="icon.id">
                                                                    <el-radio :label="icon.icon | pickIcon">
                                                                        <el-image :src="icon.icon | pickIcon" style="max-width: 55px;min-width: 55px;" fit="contain"></el-image>
                                                                        <span slot="label">#{icon.id}#</span>
                                                                    </el-radio>
                                                                </el-button>
                                                            </el-radio-group>
                                                        </el-form-item>
                                                    </el-form>
                                                    <div slot="footer" class="dialog-footer">
                                                        <el-button @click="group.dialogVisible = false">#{ $t('home.actions.cancel') }#</el-button>
                                                        <el-button type="primary" @click="groupUpdate" @keyup.enter.native.prevent="groupAdd">#{ $t('home.actions.apply') }#</el-button>
                                                    </div>
                                                </el-dialog>

                                                <el-dialog title="应用发布" :visible.sync="dialog.appDeploy.show" v-if="dialog.appDeploy.show" destroy-on-close="true">
                                                    <mx-app-deploy :model="dialog.appDeploy"></mx-app-deploy>
                                                </el-dialog>
                                                
                                            </el-col>
                                        </el-row>
                                        
                                    </el-main>
                            
                                </el-container>`,
                    // 使用directives注册v-focus全局指令
                    directives: {
                        focus: {
                            inserted(el) {
                                el.querySelector('input').focus()
                            }
                        }
                    },
                    data: {
                        // 搜索组件结构
                        model: {
                            id: "matrix-home",
                            filter: null,
                            term: null,
                            preset: null,
                            message: null,
                        },
                        options: {
                            // 视图定义
                            view: {
                                show: false
                            },
                            // 搜索窗口
                            window: { name:"所有", value: ""},
                            // 输入
                            term: "",
                            // 指定类
                            class: "",
                            // 指定api
                            api: {parent: "search",name: "searchByTerm.js"},
                            // 其它设置
                            others: {
                                // 是否包含历史数据
                                ifHistory: false,
                                // 是否包含Debug信息
                                ifDebug: false,
                                // 指定时间戳
                                forTime:  ' for vtime ',
                            }
                        },
                        apps: {},
                        path: {
                            view: "event.html",
                            _csrf: "{{.CsrfToken}}"
                        },
                        group: {
                            newDialog: {
                                show: false,
                                form: {
                                    name: _.now()+"",
                                    title: "",
                                    status: "",
                                    icon: "app.png",
                                },
                            },
                            editDialog: {
                                show: false,
                                form: {
                                    name: "",
                                    title: "",
                                    status: "",
                                    icon: "",
                                },
                            },
                            iconList: []
                        },
                        dialog: {
                            appDeploy: {
                                show: false,
                                item: null
                            }
                        }
                    },
                    filters:{
                        pickIcon:function(icon){
                            if(!_.isEmpty(icon)){
                                return `${window.ASSETS_ICON}/apps/png/${icon}?type=download&issys=${window.SignedUser_IsAdmin}`;
                            }
                        }
                    },
                    created(){
                        
                        // 刷新应用列表
                        eventHub.$on("APP-REFRESH-EVENT",()=>{
                            this.loadApps();
                        });

                    },
                    mounted(){
                        
                        // watch数据更新
                        this.$watch(
                            "$refs.searchRef.result",(val, oldVal) => {
                                this.setData();
                            }
                        );

                        this.$nextTick().then(()=> {
                            this.init();

                            let el = $(`.drag-content`,this.$el)[0];
                            Sortable.create(el,{
                                group: 'shared', 
                                animation: 150,
                                onAdd: function (evt) {
                                    
                                },
                                onChange(evt) {
                                    
                                }
                            });
                        })

                    },
                    methods: {
                        setData(){
                            _.extend(this.model, {message:this.$refs.searchRef.result});  
                            
                            if (_.isEmpty(this.options.term)) {

                                this.$message({
                                    type: "info",
                                    message: this.$t('home.tip.searchTip')
                                });
                                
                                return false;
                            }

                            let url = `/matrix/search?preset=${window.btoa(encodeURIComponent(JSON.stringify(this.options)))}`;
                            
                            window.open(url,"_parent");

                        },
                        init(){
                            this.loadApps();
                        },
                        onPlusCommand(cmd){
                            
                            if(cmd.type === 'newGroup'){
                                this.group.iconList = fsHandler.fsList('/assets/images/apps/png');
                                this.group.newDialog.show = true;
                                this.group.newDialog.form.title = "";
                                this.group.newDialog.form.icon = _.sample(this.group.iconList).name;
                            } else if(cmd.type === 'editGroup'){
                                this.group.iconList = fsHandler.fsList('/assets/images/apps/png');
                                this.group.editDialog.show = true;
                                this.group.editDialog.form.title = "";
                                this.group.editDialog.form.icon = _.sample(this.group.iconList).name;
                            } else {
                                this.dialog.appDeploy.show = true;
                            }
                        },  
                        onCommand(item){
                            window.open(item.url,item.target);
                        },
                        onAppCommand(item){
                            if(item.cmd === "walking"){
                                sideBar.appRunning(item.data);
                            } else if(item.cmd === "running"){
                                sideBar.appRunningPlus(item.data);
                            } else if(item.cmd === "uninstall"){
                                sideBar.appUninstall(this,item.data);
                            } else if(item.cmd === "home"){
                                sideBar.appAsHome(item.data);
                            } else if(item.cmd === "allUserHome"){
                                sideBar.appAsHomeForAllUser(item.data);
                            } else if(item.cmd === "share"){
                                sideBar.appShare(item.data);
                            } else if(item.cmd === "groupAction"){
                                console.log(item)
                                _.extend(item.data.groups,{group: item.targetGroup });
                                this.toggleGroup(item.data);
                            }
                        },
                        onGroupCommand(item){
                            this.groupRemove(item);
                        },
                        loadApps() {
                            
                            this.apps = fsHandler.callFsJScript("/matrix/user/user.js",window.SignedUser_UserName).message;

                            _.extend(this.apps, {appList:_.orderBy(this.apps.appList,["seat"],["asc"]) });

                            this.$nextTick().then(()=> {
                                //初始化可拖拽
                                
                                let name = _.map(this.apps.template,(v,k)=>{
                                    return `sortable${k}`;
                                })

                                _.forEach(this.apps.template,(v,k)=>{
                                    let el = $(`.drag-content-${k}`,this.$el)[0];
                                    let elParent = $(el).parent()[0];
                                    
                                    Sortable.create(el,{
                                        group: {
                                            name: name[k],
                                            put: _.concat(['drag-content'],_.xor(name,[`sortable${k}`])),
                                            pull: _.concat(['drag-content'],_.xor(name,[`sortable${k}`]))
                                        },
                                        animation: 150,
                                        onMove: function (evt, originalEvent) {
                                        }
                                    });

                                    Sortable.create(elParent,{
                                        group: {
                                            name: 'drag-content',
                                            put: name,
                                            pull: name
                                        },
                                        animation: 150,
                                        onMove: function (evt, originalEvent) {
                                        }
                                    });
                                })
                            })
                        
                        },
                        toggleGroup(item){
                            let rtn = fsHandler.callFsJScript("/matrix/apps/app.js",encodeURIComponent(JSON.stringify(item)));
							if( _.lowerCase(rtn.status) == "ok"){
								this.loadApps();
							}
                        },
                        groupAdd(){
                            
                            if(_.isEmpty(this.group.newDialog.form.title)){
                                this.$message({
                                    type: "warning",
                                    message: "应用组名称不能为空！"
                                })
                                return false;
                            }

                            let data = {
                                user: window.SignedUser_UserName,
                                action:"add",
                                data: this.group.newDialog.form   
                            };
                            let rtn = fsHandler.callFsJScript("/matrix/apps/group.js",encodeURIComponent(JSON.stringify(data))).message;
                            if(rtn === 1){
                                this.group.newDialog.form.title = "";
                                this.loadApps();
                            } else{
                                this.$message({
                                    type: "error",
                                    message: this.$t('home.tip.newGroupFail')
                                });
                            }
                            this.group.newDialog.show = false;
                        },
                        groupUpdate(){

                        },
                        groupRemove(item){
                            let data = {
                                user: window.SignedUser_UserName,
                                action: item.cmd,
                                data: item.data
                            };
                            
                            this.$confirm(this.$t('home.tip.deleteGroupConfirm'), this.$t('home.tip.label'), {
                                confirmButtonText: this.$t('home.actions.deleteGroup'),
                                cancelButtonText: this.$t('home.actions.cancel'),
                                type: 'warning'
                              }).then(() => {
                                let rtn = fsHandler.callFsJScript("/matrix/apps/group.js",encodeURIComponent(JSON.stringify(data))).message;
                                if(rtn === 1){
                                    this.loadApps();
                                    this.$message({
                                        type: 'success',
                                        message: this.$t('home.tip.deleteGroupSuccess')
                                    });
                                } else{
                                    this.$message({
                                        type: "error",
                                        message: this.$t('home.tip.deleteGroupFail')
                                    });
                                }
                              }).catch(() => {
                                
                            });

                        }

                    }
                };
                
                this.app = new Vue(main).$mount("#app");
            })
        })
    }
}

let mxHome = new Home();
mxHome.init();