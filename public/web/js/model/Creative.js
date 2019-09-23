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
class Creative {

    constructor() {
        this.app = null;
    }

    init() {
        VueLoader.onloaded(["ai-robot-component"],function() {
            $(function() {

                creative.app = new Vue({
                    delimiters: ['${', '}'],
                    template: '#app-template',
                    data: {
                        model: {
                            list:[],
                            root: "/opt/creative",
                            action: {
                                from: null,
                                to: null
                            },
                            project: {
                                title: "",
                                current:"",
                                stime: "",
                                etime: "",
                                status: "start",
                                diaglog: {
                                    title: "",
                                    prompt: [],
                                    select: ""
                                },
                                action: {
                                    node: "",
                                    status: ""
                                }

                            }
                        },
                        crontab: {
                            project:{
                                sched: Object,
                                timer: Object
                            }
                        },
                        toggle: {
                            left: false
                        }

                    },
                    mounted: function() {
                        const self = this;

                        self.$nextTick(function() {
                            self.load();
                            self.init();

                            _.delay(function(){
                                self.initPlugin();
                            },500);
                        })
                    },
                    watch: {
                        model: {
                            handler:function(newValue, oldValue) {
                                const self = this;

                                if (!_.isEqual(newValue, oldValue)) {
                                    self.refresh();
                                }
                            },
                            deep:true
                        }
                    },
                    created: function() {
                        const self = this;

                        self.initProject();

                        eventHub.$on("FS-FORWARD-EVENT", self.forwardDir);
                    },
                    computed: {
                        filePath: function(){
                            const self = this;
                            let _tmp = self.model.root.split("/");

                            return _tmp;
                        }
                    },
                    filters: {
                        pickName: function (item) {
                            const self = this;

                            if (_.isEmpty(item)) return '';

                            let _name = _.head(item.name.split("."));

                            /*if(!_.isEmpty(_name) && _.size(_name) > 9){
                                _name = _.split(_name,"",9).join("") + "...";
                            }*/

                            return _name;
                        },
                        pickRemark: function (item) {
                            const self = this;
                            
                            let _remark = '';

                            try{
                                if (_.isEmpty(item.attr)) return '';

                                if(_.attempt(JSON.parse.bind(null, item.attr)).remark){
                                    _remark = _.attempt(JSON.parse.bind(null, item.attr)).remark;
                                }

                                return _remark;
                            } catch(err){
                                return _remark;
                            }
                        },
                        pickIcon: function(item){
                            const self = this;

                            if (_.isEmpty(item.attr)) return `${window.ASSETS_ICON}/files/png/${item.ftype}.png?type=download&issys=${window.SignedUser_IsAdmin}`;

                            return JSON.parse(item.attr).icon;
                        },
                        readMore: function (text, length, suffix) {
                            return text.substring(0, length) + suffix;
                        },
                        toLocalTime: function (value) {
                            return moment(value).format("LLL");
                        }
                    },
                    methods: {
                        init: function() {
                            const self = this;

                        },
                        initPlugin: function(){
                            const self = this;

                            self.crontab.project.sched = later.parse.text('every 15 sec');
                            self.crontab.project.timer = later.setInterval(self.initProject, self.crontab.project.sched);
                            self.initProject();

                            self.initContextMenu();

                        },
                        initContextMenu: function(){
                            const self = this;

                            $.contextMenu({
                                selector: '.list-context-menu',
                                trigger: 'left',
                                build: function($trigger, e) {
                                    let _item = _.attempt(JSON.parse.bind(null, e.target.attributes.getNamedItem('data-item').value));

                                    if(_.includes(['dir'], _item.ftype)){
                                        return {

                                            items: {
                                                "edit": {name: "编辑", icon: "fas fa-edit", callback: function(key, opt) {
                                                        self.forwardCreative('edit', _item);
                                                    }
                                                },
                                                "sep1": "---------",

                                                "delete": {name: "删除", icon: "fas fa-trash", callback: function(key, opt) {
                                                        self.remove(_item);
                                                    }
                                                },
                                                "sep2": "---------",
                                                "copy": {name: "复制", icon: "fas fa-copy", callback: function(key, opt) {
                                                        self.copyIt(_item);
                                                    }
                                                },
                                                "paste": {name: "粘贴", icon: "fas fa-paste", callback: function(key, opt) {
                                                        self.pasteIt();

                                                    }
                                                },
                                                "sep3": "---------",
                                                "share": {
                                                    name: "共享", icon: "fas fa-share-square", callback: function (key, opt) {
                                                        self.shareIt(_item);
                                                    }
                                                },
                                                "sep4": "---------",
                                                "info": {name: "属性", icon: "fas fa-info", callback: function(key, opt, rootMenu, originalEvent) {
                                                        self.info(_item);
                                                    }
                                                }
                                            }
                                        };
                                    } else {
                                        return {

                                            items: {
                                                "edit": {name: "编辑", icon: "fas fa-edit", callback: function(key, opt) {
                                                        self.forwardCreative('edit', _item);
                                                    }
                                                },
                                                "sep1": "---------",

                                                "delete": {name: "删除", icon: "fas fa-trash", callback: function(key, opt) {
                                                        self.remove(_item);
                                                    }
                                                },
                                                "sep2": "---------",
                                                "copy": {name: "复制", icon: "fas fa-copy", callback: function(key, opt) {
                                                        self.copyIt(_item);
                                                    }
                                                },
                                                "paste": {name: "粘贴", icon: "fas fa-paste", callback: function(key, opt) {
                                                        self.pasteIt();

                                                    }
                                                },
                                                "sep3": "---------",
                                                "runUrl": {
                                                    name: "复制链接", icon: "fas fa-map-marker-alt", callback: function (key, opt) {
                                                        self.copyUrl(_item);
                                                    }
                                                },
                                                "share": {
                                                    name: "共享", icon: "fas fa-share-square", callback: function (key, opt) {
                                                        self.shareIt(_item);
                                                    }
                                                },
                                                "sep4": "---------",
                                                "info": {name: "属性", icon: "fas fa-info", callback: function(key, opt, rootMenu, originalEvent) {
                                                        self.info(_item);
                                                    }
                                                }
                                            }
                                        };
                                    }
                                }
                            });

                        },
                        initProject: function(){
                            const self = this;

                            let _rtn = jobHandler.jobContextGet("BOB", "");

                            if (!_.isEmpty(_rtn) && !_.isEmpty(_rtn.message)) {
                                if (!_.isEmpty(_rtn.message["BOB"])){
                                    self.model.project = _rtn.message["BOB"];
                                }
                            }
                        },
                        forwardDir: function(path){
                            const self = this;

                            self.model.root = path;

                            self.load();
                        },
                        load: function() {
                            const self = this;

                            let _rtn = fsHandler.fsList(self.model.root);

                            self.model.list = _.orderBy(_.map(_rtn,function(v,k){

                                return _.merge(v, {"username": window.SignedUser_UserName, "project": self.model.project });

                            }),['vtime','fullname'],['desc','asc']);


                            _.delay(function(){
                                self.refresh();
                            },200);

                        },
                        newDir: function() {
                            const self = this;

                            let win = maxWindow.winDir('新建项目',`<div id="creative-starting"></div>`, null,null);

                            new Vue({
                                delimiters: ['#{', '}#'],
                                template: `<el-container style="height: 500px; border: 1px solid #eee">
                                                <!--el-aside width="200px" style="background-color: rgb(238, 241, 246)">
                                                    <el-menu :default-openeds="['1', '3']">
                                                        <el-submenu index="1">
                                                            <template slot="title"><i class="fas fa-sitemap"></i> IT地图</template>
                                                        </el-submenu>
                                                        <el-submenu index="2">
                                                            <template slot="title"><i class="fas fa-tachometer-alt"></i> DashBoard</template>
                                                        </el-submenu>
                                                        <el-submenu index="3">
                                                            <template slot="title"><i class="fas fa-random"></i> 流程设计</template>
                                                        </el-submenu>
                                                        <el-submenu index="4">
                                                            <template slot="title"><i class="fas fa-project-diagram"></i> 作业设计</template>
                                                        </el-submenu>
                                                        <el-submenu index="5">
                                                            <template slot="title"><i class="fas fa-layer-group"></i> 页面设计</template>
                                                        </el-submenu>
                                                    </el-menu>
                                                </el-aside-->
                                                
                                                
                                                    <el-header style="text-align: right; font-size: 12px;background:#f6f6f6;">
                                                        <el-tooltip content="取消" placement="top">
                                                            <a href="javascript:void(0);" class="btn btn-link" title="取消" @click="cancel">
                                                                <i class="fas fa-window-close"></i> 取消
                                                            </a>
                                                        </el-tooltip>
                                                        <el-tooltip content="保存" placement="top">
                                                            <a href="javascript:void(0);" class="btn btn-link" title="保存" @click="save">
                                                                <i class="fas fa-save"></i> 保存
                                                            </a>
                                                        </el-tooltip>    
                                                    </el-header>
                                                
                                                    <el-main>
                                                        <el-form label-position="right" label-width="80px">
                                                            <el-form-item label="名称">
                                                                <el-input v-model="model.name"></el-input>
                                                            </el-form-item>
                                                            
                                                            <el-form-item label="描述">
                                                                <el-input type="textarea" v-model="model.info.remark"></el-input>
                                                            </el-form-item>

                                                            <el-form-item label="标签">
                                                                <el-tag
                                                                    :key="tag"
                                                                    closable
                                                                    type=""
                                                                    @close="tagsRemove(tag)"
                                                                    style="margin:0 2px;" v-for="tag in model.tags.list">
                                                                    #{tag}#
                                                                </el-tag>
                                                                <el-input
                                                                    class="input-new-tag"
                                                                    v-if="model.tags.inputVisible"
                                                                    v-model="model.tags.inputValue"
                                                                    ref="saveTagInput"
                                                                    size="small"
                                                                    @keyup.enter.native="tagsAdd"
                                                                    @blur="tagsAdd">
                                                                </el-input>
                                                                <el-button v-else class="button-new-tag" size="small" @click="showTagsInput">+</el-button>
                                                            </el-form-item>

                                                            <el-form-item label="是否分享">
                                                                <el-radio-group v-model="model.ifshare">
                                                                    <el-radio label="公开" value="1"></el-radio>
                                                                    <el-radio label="私有" value="0"></el-radio>
                                                                </el-radio-group>
                                                            </el-form-item>

                                                        </el-form>
                                                    </el-main>
                                                
                                            </el-container>`,
                                data: {
                                    model: {
                                        project: {
                                            value: "IT地图",
                                            extName: {
                                                "流程设计": "iflow",
                                                "仪表盘": "ishow",
                                                "IT地图": "imap"
                                            }
                                        },
                                        name: "",
                                        type: "dir",
                                        tags: {
                                            inputVisible: false,
                                            inputValue: '',
                                            list:[]
                                        },
                                        info: {
                                            remark: ""
                                        },
                                        ifshare: 0
                                    }
                                },
                                mounted:function(){
                                    const me = this;

                                    me.$nextTick(function() {
                                        me.init();
                                    })
                                },
                                watch: {

                                },
                                computed: {
                                    type: function(){
                                        const me = this;

                                        return me.model.type + "t";
                                    }
                                },
                                methods: {
                                    init: function(){
                                        const me = this;

                                        $("#tags").tagsinput({
                                            tagClass: function(item) {
                                                return _.sample(['label label-default', 'label label-success', 'label label-primary', 'label label-warning', 'label label-danger label-important']);
                                            }
                                        });

                                    },
                                    save: function(){
                                        const me = this;
                                        let _root = _.cloneDeep(self.model.root);

                                        if (_.isEmpty(me.model.name)) {
                                            alertify.error("名称不能为空！");
                                            return false;
                                        }

                                        let _name = me.model.name;
                                        if(!_name){
                                            alertify.log("名称不能为空！");
                                            return false;
                                        }

                                        let _type = me.model.type;
                                        let _info = {remark: me.model.info.remark, ctime: _.now(), author: window.SignedUser_UserName, type: _type, icon: `${window.ASSETS_ICON}/files/png/dir.png?type=download&issys=${window.SignedUser_IsAdmin}`};

                                        let _check = fsHandler.fsCheck(_root, _name);
                                        if(_check) {
                                            alertify.error("文件已存在，请确认！")
                                            return false;
                                        }

                                        let _rtn = fsHandler.fsNew(_type, _root, _name, null, _info);

                                        if(_rtn == 1){

                                            self.load();

                                            win.close();
                                        }
                                    },
                                    cancel(){
                                        win.close();
                                    },
                                    newFile: function(parent){

                                        const me = this;

                                        _.delay(function(){

                                            let _name = "PAGE_" + _.now();
                                            let _type = me.model.project.extName[me.model.project.value];
                                            let _info = {remark: me.model.info.remark, ctime: _.now(), author: window.SignedUser_UserName, type: _type, icon: `${window.ASSETS_ICON}/files/png/dir.png?type=download&issys=${window.SignedUser_IsAdmin}`};
                                            let _rtn = fsHandler.fsNew(_type, parent, _name+"."+_type, "", _info);

                                            if(_rtn == 1){

                                                self.load();
                                            }
                                        },500)
                                    },
                                    tagsRemove(tag) {
                                        this.model.tags.list.splice(this.model.tags.list.indexOf(tag), 1);
                                    },
                                    showTagsInput() {
                                        this.model.tags.inputVisible = true;
                                        this.$nextTick(_ => {
                                            this.$refs.saveTagInput.$refs.input.focus();
                                        });
                                    },
                                    tagsAdd() {
                                        let inputValue = this.model.tags.inputValue;
                                        if (inputValue) {
                                            this.model.tags.list.push(inputValue);
                                        }
                                        this.model.tags.inputVisible = false;
                                        this.model.tags.inputValue = '';
                                    }
                                }
                            }).$mount("#creative-starting");
                        },
                        newFile: function() {
                            const self = this;

                            let win = maxWindow.winFile('新建文件',`<div id="creative-starting"></div>`, null,null);

                            new Vue({
                                delimiters: ['#{', '}#'],
                                template: `<el-container style="height: 500px; border: 1px solid #eee">
                                                <el-aside width="200px" style="background-color: #f6f6f6;">
                                                    <el-menu @open="menuOpen"
                                                            active-text-color="#ffd04b"
                                                            unique-opened="true">
                                                        <el-submenu :index="item.value" v-for="item in _.filter(mx.global.register.file,{type:'private'})">
                                                            <template slot="title"><i :class="item.icon"></i> #{item.title}#</template>
                                                        </el-submenu>
                                                    </el-menu>
                                                </el-aside>
                                                <el-container>
                                                    <el-header style="text-align: right; font-size: 12px;background:#f6f6f6;">
                                                        <el-tooltip content="取消" placement="top">
                                                            <a href="javascript:void(0);" class="btn btn-link" title="取消" @click="cancel">
                                                                <i class="fas fa-window-close"></i> 取消
                                                            </a>
                                                        </el-tooltip>
                                                        <el-tooltip content="保存" placement="top">
                                                            <a href="javascript:void(0);" class="btn btn-link" title="保存" @click="save">
                                                                <i class="fas fa-save"></i> 保存
                                                            </a>
                                                        </el-tooltip>
                                                    </el-header>
                                                
                                                    <el-main>
                                                        <el-form label-position="right" label-width="80px">
                                                            <el-form-item label="类型">
                                                                <el-input v-model="model.type" disabled></el-input>
                                                            </el-form-item>
                                                            <el-form-item label="名称">
                                                                <el-input v-model="model.name"></el-input>
                                                            </el-form-item>
                                                            
                                                            <el-form-item label="描述">
                                                                <el-input type="textarea" v-model="model.info.remark"></el-input>
                                                            </el-form-item>

                                                            <el-form-item label="标签">
                                                                <el-tag
                                                                    :key="tag"
                                                                    closable
                                                                    type=""
                                                                    @close="tagsRemove(tag)"
                                                                    style="margin:0 2px;" v-for="tag in model.tags.list">
                                                                    #{tag}#
                                                                </el-tag>
                                                                <el-input
                                                                    class="input-new-tag"
                                                                    v-if="model.tags.inputVisible"
                                                                    v-model="model.tags.inputValue"
                                                                    ref="saveTagInput"
                                                                    size="small"
                                                                    @keyup.enter.native="tagsAdd"
                                                                    @blur="tagsAdd">
                                                                </el-input>
                                                                <el-button v-else class="button-new-tag" size="small" @click="showTagsInput">+</el-button>
                                                            </el-form-item>

                                                            <el-form-item label="是否分享">
                                                                <el-radio-group v-model="model.ifshare">
                                                                    <el-radio label="公开" value="1"></el-radio>
                                                                    <el-radio label="私有" value="0"></el-radio>
                                                                </el-radio-group>
                                                            </el-form-item>

                                                        </el-form>
                                                    </el-main>
                                                </el-container>
                                                
                                            </el-container>`,
                                data: {
                                    model: {
                                        name: "",
                                        type: "imap",
                                        tags: {
                                            inputVisible: false,
                                            inputValue: '',
                                            list:[]
                                        },
                                        info: {
                                            remark: ""
                                        },
                                        ifshare: 0
                                    }
                                },
                                mounted:function(){
                                    const me = this;

                                    me.$nextTick(function() {
                                        me.init();
                                    })
                                },
                                methods: {
                                    init: function(){
                                        const me = this;

                                    },
                                    menuOpen(key, keyPath) {
                                        const me = this;
                                        
                                        me.model.type = key;
                                    },
                                    save: function(){
                                        const me = this;
                                        let _xml = null;

                                        if (_.isEmpty(me.model.name)) {
                                            alertify.error("名称不能为空！");
                                            return false;
                                        }

                                        let _name = me.model.name;
                                        let _type = me.model.type;

                                        let _info = {remark: me.model.info.remark, ctime: _.now(), author: window.SignedUser_UserName, type: _type, icon: `${window.ASSETS_ICON}/files/png/iflow.png?type=download&issys=${window.SignedUser_IsAdmin}`};

                                        let _check = fsHandler.fsCheck(self.model.root, _name+"."+_type);
                                        if(_check) {
                                            alertify.error("文件已存在，请确认！")
                                            return false;
                                        }

                                        let _rtn = fsHandler.fsNew(_type, self.model.root, _name+"."+_type, _xml, _info);

                                        if(_rtn == 1){
                                            self.load();
                                            win.close();
                                        }

                                    },
                                    cancel(){
                                        win.close();
                                    },
                                    tagsRemove(tag) {
                                        this.model.tags.list.splice(this.model.tags.list.indexOf(tag), 1);
                                    },
                                    showTagsInput() {
                                        this.model.tags.inputVisible = true;
                                        this.$nextTick(_ => {
                                            this.$refs.saveTagInput.$refs.input.focus();
                                        });
                                    },
                                    tagsAdd() {
                                        let inputValue = this.model.tags.inputValue;
                                        if (inputValue) {
                                            this.model.tags.list.push(inputValue);
                                        }
                                        this.model.tags.inputVisible = false;
                                        this.model.tags.inputValue = '';
                                    }
                                }
                            }).$mount("#creative-starting");
                        },
                        refresh: function() {
                            const self = this;

                            $(".tagsLabel").tagsinput({
                                tagClass: function(item) {
                                    return _.sample(['label label-success']);
                                }
                            });

                            $(".tagsLabel").on('itemAdded', function(event) {

                                let _id = $(this).data("index");
                                let _item = _.find(self.model.list,{id:_id});

                                omdbHandler.fetchData(_item.id + ' | tags +' + event.item);

                            });

                            $(".tagsLabel").on('itemRemoved', function(event) {

                                let _id = $(this).data("index");
                                let _item = _.find(self.model.list,{id:_id});

                                omdbHandler.fetchData(_item.id + ' | tags -' + event.item);

                            });
                        },
                        forwardCreative: function(action,item){
                            const self = this;

                            if(item.ftype === 'dir'){

                                self.model.root = item.parent+"/"+item.name.replace(/\/home\/admin/g,"");
                                self.load();

                            } else {
                                let lang = window.MATRIX_LANG;

                                item = _.merge(item,{lang: lang, action:action});

                                let url = fsHandler.genFsUrl(item,null,null);

                                window.open(url, "_blank");
                            }
                        },
                        remove: function(event) {
                            const self = this;

                            alertify.confirm(`确定要删除以下目录或文件? <br><br> 
                                                名称：${event.name}<br>
                                                位置：${event.parent}<br>
                                                类型：${event.ftype}<br>
                                                大小：${mx.bytesToSize(event.size)}<br>
                                                创建时间：${moment(event.vtime).format("LLL")}`, function (e) {
                                if (e) {
                                    let rtn = fsHandler.fsDelete(event.parent,event.name);

                                    if (rtn == 1){
                                        self.load();
                                    }
                                } else {
                                    
                                }
                            });
                        },
                        info: function(node){
                            const self = this;

                            let _win = maxWindow.winInfo("属性",'<div id="fs-info"></div>',null, $('#content'));

                            let _infoVue = new Vue({
                                delimiters: ['#{', '}#'],
                                el: "#fs-info",
                                template: `<div class="tab-content" style="height:100%;">
                                            <div role="tabpanel" class="tab-pane active" id="home" style="height:100%;">
                                                    <form style="height:95%;overflow:auto;">
                                                        <div class="form-group">
                                                            <label for="name">项目名称</label>
                                                            <input type="text" class="form-control" id="name" placeholder="" v-model="model.newName">
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="remark">项目备注</label>
                                                            <textarea type="text" class="form-control" rows="2" id="remark" placeholder="" v-model="model.attr.remark"></textarea>
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="ctime">更新时间</label>
                                                            <input type="text" class="form-control" id="ctime" placeholder="" :value="model.attr.ctime | toLocalTime" disabled>
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="parent">目录</label>
                                                            <input type="text" class="form-control" id="parent" placeholder="" v-model="model.parent" disabled>
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="type">类型</label>
                                                            <input type="text" class="form-control" id="type" placeholder="" v-model="model.type" disabled>
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="author">作者</label>
                                                            <input type="text" class="form-control" id="author" placeholder="" v-model="model.attr.author" disabled>
                                                        </div>
                                                        <div class="form-group">
                                                            <a href="#icon-list" aria-controls="icon-list" role="tab" data-toggle="tab">
                                                                <label for="icon">图标</label> <small style="color: rgb(153, 153, 153);">点击更换图标</small>
                                                                <img class="media-object" :src="model.icon.value" style="width:15%;">
                                                            </a>
                                                        </div>
                                                </form>
                                                <div class="form-group" style="text-align: center;height:5%;">
                                                    <a href="javascript:void(0)" class="btn btn-sm btn-warning" @click="apply">应用</a>
                                                    <a href="javascript:void(0)" class="btn btn-sm btn-success" @click="save">确定</a>
                                                    <a href="javascript:void(0)" class="btn btn-sm btn-default" @click="close">取消</a>
                                                </div>
                                            </div>
                                            <div role="tabpanel" class="tab-pane" id="icon-list" style="height:100%;">
                                                <div class="row" style="height:95%;">
                                                  <div class="col-md-12" style="display: list-item;height: 95%;overflow: auto;">
                                                    <ul>
                                                        <li v-for="icon in model.icon.list">
                                                            <a href="#" class="thumbnail" style="border:none;" @click="triggerInput(icon.id)">
                                                              <img class="media-object" :src="icon | pickIcon" style="max-width: 55px;min-width: 55px;;">
                                                              <input type="radio" :ref="icon.id" :id="icon.id"  :value="'/fs'+icon.parent+'/'+icon.name+'?type=download&issys=true'" v-model="model.icon.value" >
                                                            </a>
                                                        </li>
                                                    </ul>
                                                  </div>
                                                </div>
                                                <div class="row">
                                                    <div class="col-md-12" style="text-align:center;">
                                                        <a class="btn btn-sm btn-default" href="#home" aria-controls="home" role="tab" data-toggle="tab">返回</a></li>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>`,
                                data: {
                                    model: {
                                        parent: node.parent,
                                        oldName: node.name,
                                        newName: _.head(_.split(node.name,'.')),
                                        extName: node.ftype=='dir'?'':'.'+node.ftype,
                                        type: node.ftype,
                                        attr: null,
                                        icon: {
                                            value: '',
                                            list: []
                                        }
                                    }
                                },
                                mounted: function() {
                                    const me = this;

                                    me.$nextTick(function() {
                                        me.model.attr = _.attempt(JSON.parse.bind(null, node.attr));
                                        me.model.icon.value = me.model.attr.icon;
                                        me.init();
                                    })
                                },
                                filters: {
                                    pickName: function (value) {
                                        const me = this;

                                        if (!value) return '';

                                        let _attr = _.attempt(JSON.parse.bind(null, value));

                                        return _attr.name;
                                    },
                                    pickIcon: function(item) {
                                        return `/fs${item.parent}/${item.name}?type=download&issys=${window.SignedUser_IsAdmin}`;
                                    },
                                    readMore: function (text, length, suffix) {
                                        return text.substring(0, length) + suffix;
                                    },
                                    toLocalTime: function (value) {
                                        return moment(value).format("LLL");
                                    }
                                },
                                destroyed: function(){
                                    const me = this;

                                    me.model = null;
                                },
                                methods: {
                                    init: function(){
                                        const me = this;

                                        me.model.icon.list = fsHandler.fsList('/assets/images/files/png');
                                    },
                                    triggerInput: function(id){
                                        const self = this;

                                        $(self.$refs[id]).click()
                                    },
                                    apply: function(){
                                        const me = this;

                                        me.saveAttr();

                                    },
                                    save: function(){
                                        const me = this;

                                        me.saveAttr();
                                        _win.close();
                                    },
                                    close: function(){
                                        const me = this;

                                        _win.close();
                                    },
                                    saveName: function(){
                                        const me = this;

                                        let _old = node.parent + "/" + node.name;// + _extName;
                                        let _new = node.parent + "/" + me.model.newName + me.model.extName;


                                        let _check = fsHandler.fsCheck( node.parent, me.model.newName + me.model.extName);
                                        if(_check) {
                                            alertify.error("文件已存在，请确认！")
                                            return false;
                                        }

                                        let _rtn = fsHandler.fsRename(_old, _new);

                                        if(_rtn == 1){

                                            self.load();
                                        }
                                    },
                                    saveAttr: function(){
                                        const me = this;

                                        me.model.attr.icon = me.model.icon.value;

                                        let _rtn = fsHandler.fsUpdateAttr(node.parent, node.name, me.model.attr);

                                        if(_rtn == 1){
                                            self.load();

                                            if(me.model.oldName != me.model.newName + me.model.extName){

                                                me.saveName();
                                            }
                                        }
                                    }
                                }
                            })

                        },
                        copyIt: function(item){
                            const self = this;

                            self.model.action.from = item.parent + "/" + item.name;
                            alertify.log("已复制 " + self.model.action.from);
                        },
                        pasteIt: function(){
                            const self = this;

                            if(_.isEmpty(self.model.action.from)){
                                alertify.log("请选择复制内容")
                                return false;
                            }

                            self.model.action.to = self.model.root;
                            let _rtn = fsHandler.fsCopy(self.model.action.from, self.model.action.to);
                            if(_rtn == 1){

                                alertify.log("已粘贴 " + self.model.action.to);
                                self.load();

                                //
                                self.model.action.from = null;
                                self.model.action.to = null;
                            }
                        },
                        copyUrl: function(item){
                            const self = this;

                            let _lang = `{{.Lang}}`;
                            let lang = _lang.replace(/"/g,"").split("-")[0].replace(/en/g,"eg");

                            item = _.merge(item,{lang: lang, action:'run'});

                            let url = fsHandler.genFsUrl(item,null,null);

                            alertify.set({ labels: {
                                    ok     : "复制地址",
                                    cancel : "取消"
                                }});

                            alertify.prompt("运行链接地址", function (e, str) {
                                // str is the input text
                                if (e) {
                                    // user clicked "ok"
                                    let clipboard = new Clipboard('.alertify-button-ok', {
                                        text: function (trigger) {
                                            return str;
                                        }
                                    });
                                } else {
                                    // user clicked "cancel"
                                }
                            }, url);

                            $(".alertify-prompt .alertify-message").css('height','5vh');

                        },
                        shareIt: function(item){
                            const self = this;

                            alertify.prompt("共享设置", function (e, str) {
                                // str is the input text
                                if (e) {
                                    // user clicked "ok"
                                } else {
                                    // user clicked "cancel"
                                }
                            }, "admin;");

                            $(".alertify-prompt .alertify-message").css('height','5vh');
                        },
                        toggleLeft: function() {
                            const self = this;

                            if(self.toggle.left) {

                                $("#nav").hide();

                                $("#content").removeClass("col-lg-10");
                                $("#content").addClass("col-lg-12");

                                $(".navtoggle").removeClass("fa fa-caret-left");
                                $(".navtoggle").addClass("fa fa-caret-right");

                                self.toggle.left = false;
                            } else {
                                $("#nav").slideDown(500);
                                $("#nav").show();

                                $("#content").removeClass("col-lg-12");
                                $("#content").addClass("col-lg-10");
                                //$("#content").find(".panel-default").css("border-left","2px #ddd dotted");

                                $(".navtoggle").removeClass("fa fa-caret-right");
                                $(".navtoggle").addClass("fa fa-caret-left");

                                self.toggle.left = true;
                            }
                        }

                    }
                }).$mount("#app");
            })
        })
    }
}

let creative = new Creative();
creative.init();