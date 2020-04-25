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

                var timeoutId = 0;

                let main = {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container style="padding:30px 0;">
                                    <el-main style="padding:0px;">
                                        <el-row type="flex" justify="center" style="padding:40px 0px;">
                                            <el-col :span="18">
                                                <search-base-component :options="options" ref="searchRef" class="grid-content"></search-base-component>
                                                <div id="search-result-content" v-if="model.message"></div>
                                            </el-col>
                                        </el-row>
                                        
                                        <el-row type="flex" justify="center">
                                            <el-col :span="14" style="display:flex;flex-wrap:wrap;align-content: flex-start;" class="drag-content"> 
                                                <el-dropdown v-for="(item,index) in apps.template" :key="item.name" @command="onCommand" trigger="click" placement="top-end"  :hide-on-click="false">
                                                    <el-button type="primary"
                                                        class="animated flipInX" 
                                                        style="max-width: 120px;width: 120px;max-height:90px;height:90px;margin: 5px;border-radius: 10px!important;background: rgb(36, 44, 70);border:unset;">
                                                        <p style="display: flex;flex-wrap: wrap;max-height:40px;height: 40px;margin:5px 0px;">
                                                            <el-image :src="folder.icon | pickIcon" style="margin:3px;width:14px;height:14px;" v-for="(folder,index) in item.groups" v-if="index<8"></el-image>
                                                        </p>
                                                        <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">#{item.title}#（#{item.groups.length}#） <!--i class="el-icon-menu el-icon--right"></i--></p>
                                                        <el-dropdown @command="onGroupCommand" trigger="hover" placement="top-start"  style="position: absolute;right: 5px;top: 5px;">
                                                            <span class="el-dropdown-link">
                                                                <i class="el-icon-arrow-down el-icon--right" style="color:rgba(255,255,255,0.5)"></i>
                                                            </span>
                                                            <el-dropdown-menu slot="dropdown">
                                                                <el-dropdown-item :command="{cmd:'remove',data:item}">删除组</el-dropdown-item>
                                                            </el-dropdown-menu>
                                                        </el-dropdown>
                                                    </el-button>
                                                    <el-dropdown-menu slot="dropdown" :class="'menu-dropdown drag-content-' + index">
                                                        <el-dropdown-item :command="subItem" v-for="(subItem,index) in item.groups" :key="subItem.id">
                                                            <template scope="scope">
                                                                <el-button type="primary" 
                                                                    @click.stop.prevent="onCommand(subItem)"
                                                                    style="max-width: 120px;width: 120px;height:90px;border-radius: 10px!important;background:rgb(36, 44, 70);border:unset;margin: 5px;">
                                                                    <el-image :src="subItem.icon | pickIcon" style="width:40px;margin:5px;"></el-image>
                                                                    <p style="white-space:nowrap;overflow:hidden;margin:5px;">
                                                                        #{subItem.cnname}#
                                                                        <el-dropdown @command="onAppCommand" trigger="hover" placement="top-end" style="color:rgba(255,255,255,.5);">
                                                                            <span class="el-dropdown-link">
                                                                                <i class="el-icon-arrow-down el-icon--right" style="color:rgba(255,255,255,0.5)"></i>
                                                                            </span>
                                                                            <el-dropdown-menu slot="dropdown">
                                                                                <el-dropdown-item disabled>#{subItem.cnname}#</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'walking',data:subItem}" divided>当前窗口运行</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'running',data:subItem}">打开新窗口运行</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'home',data:subItem}" divided>设为首页</el-dropdown-item>
                                                                                <el-dropdown-item divided disabled>分组</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'groupAction', targetGroup: groupItem.name, data:subItem}" v-for="groupItem in _.xor(apps.template,[item])">移到【#{groupItem.title}#】组</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'groupAction', targetGroup: '', data:subItem}">移到桌面</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'uninstall',data:subItem}" divided>卸载应用</el-dropdown-item>
                                                                                <el-dropdown-item :command="{cmd:'share',data:subItem}" divided>分享</el-dropdown-item>
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
                                                    <el-image style="width:40px;margin:5px;" :src="item.icon | pickIcon"></el-image>
                                                    <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;">
                                                        #{item.cnname}#
                                                    </p>
                                                    <el-dropdown @command="onAppCommand" trigger="hover" placement="top-start" style="position: absolute;right: 5px;top: 5px;">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-arrow-down el-icon--right" style="color:rgba(255,255,255,0.5)"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item disabled>#{item.cnname}#</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'walking',data:item}" divided>当前窗口运行</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'running',data:item}">打开新窗口运行</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'home',data:item}" divided>设为首页</el-dropdown-item>
                                                            <el-dropdown-item divided disabled>分组</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'groupAction', targetGroup: groupItem.name, data:item}" v-for="groupItem in apps.template">移到【#{groupItem.title}#】组</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'uninstall',data:item}" divided>卸载应用</el-dropdown-item>
                                                            <el-dropdown-item :command="{cmd:'share',data:item}" divided>分享</el-dropdown-item>
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
                                                            <el-dropdown-item @click.native="onPlusCommand({type:'newGroup',url:''})">新建组</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onPlusCommand({type:'newApp',url:'/matrix/system'})">发布应用</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                    </el-dropdown>
                                                </el-button>
                                                
                                                <el-dialog :visible.sync="group.dialogVisible" width="30%" destroy-on-close="true" modal="false">
                                                    <el-form :model="group.form" style="width:100%;">
                                                        <el-form-item label="应用组名称" label-width="80">
                                                            <el-input v-model="group.form.title" autofocus></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                    <div slot="footer" class="dialog-footer">
                                                        <el-button @click="group.dialogVisible = false">取 消</el-button>
                                                        <el-button type="primary" @click="groupAdd" @keyup.enter.native.prevent="groupAdd">确 定</el-button>
                                                    </div>
                                                </el-dialog>
                                                
                                            </el-col>
                                        </el-row>
                                        
                                    </el-main>
                            
                                </el-container>`,
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
                            class: "#/matrix/:",
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
                            dialogVisible: false,
                            form: {
                                name: _.now()+"",
                                title: "new_"+_.now(),
                                status: "",
                                icon: "app.png"
                            }
                        }
                    },
                    filters:{
                        pickIcon:function(icon){
                            return `${window.ASSETS_ICON}/apps/png/${icon}?type=open&issys=${window.SignedUser_IsAdmin}`;
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
                                    console.log(3,evt)
                                },
                                onChange(evt) {
                                    console.log(33,evt)  
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
                                    message: "请输入搜索关键字"
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
                                this.group.dialogVisible = true;
                            } else {
                                let preset = encodeURIComponent(JSON.stringify({view:'tools-manage'}));
                                window.open(cmd.url+'?preset='+preset,'_blank');    
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
                                sideBar.appUninstall(item.data);
                            } else if(item.cmd === "home"){
                                sideBar.appAsHome(item.data);
                            } else if(item.cmd === "share"){
                                sideBar.appShare(item.data);
                            } else if(item.cmd === "groupAction"){
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
                                            console.log(2,evt)
                                            console.log(22,originalEvent)
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
                                            console.log(1,evt)
                                            console.log(11,originalEvent)
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
                            let data = {
                                user: window.SignedUser_UserName,
                                action:"add",
                                data: this.group.form   
                            };
                            let rtn = fsHandler.callFsJScript("/matrix/apps/group.js",encodeURIComponent(JSON.stringify(data))).message;
                            if(rtn === 1){
                                this.group.form.title = "new_"+_.now();
                                this.loadApps();
                            } else{
                                this.$message({
                                    type: "error",
                                    message: "新建失败，请确认！"
                                });
                            }
                            this.group.dialogVisible = false;
                        },
                        groupUpdate(){
                            let data = {
                                user: window.SignedUser_UserName,
                                action:"update",
                                data: this.group.form   
                            };
                            let rtn = fsHandler.callFsJScript("/matrix/apps/group.js",encodeURIComponent(JSON.stringify(data))).message;
                            if(rtn === 1){
                                this.loadApps();
                            } else{
                                this.$message({
                                    type: "error",
                                    message: "新建失败，请确认！"
                                });
                            }
                        },
                        groupRemove(item){
                            let data = {
                                user: window.SignedUser_UserName,
                                action: item.cmd,
                                data: item.data
                            };
                            
                            this.$confirm('确定要删除?', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                              }).then(() => {
                                let rtn = fsHandler.callFsJScript("/matrix/apps/group.js",encodeURIComponent(JSON.stringify(data))).message;
                                if(rtn === 1){
                                    this.loadApps();
                                    this.$message({
                                        type: 'success',
                                        message: '删除成功!'
                                    });
                                } else{
                                    this.$message({
                                        type: "error",
                                        message: "删除失败，请确认！"
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