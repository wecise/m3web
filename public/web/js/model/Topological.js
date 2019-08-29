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
class Topological {
    
    constructor() {

        this.app = null;
        this.graphScript = null;

        this.URL_PARAMS_ITEM = null;
        this.URL_PARAMS_CFG = null;
        this.URL_PARAMS_GRAPH = null;
    }
    
    init() {
        const inst = this;

        // 拓扑分析
        Vue.component("topological-analysis",{
            delimiters: ['${', '}'],
            template:  `<el-container>
                            <el-header style="height:50px;line-height:50px;padding:0 10px;">
                                <el-input placeholder="请输入内容" v-model="search.term" class="input-with-select">
                                    <el-select v-model="search.select" slot="prepend" placeholder="请选择">
                                        <el-option label="所有" value="#/matrix/"></el-option>
                                        <el-option label="事件" value="#/matrix/devops/event/"></el-option>
                                        <el-option label="性能" value="#/matrix/devops/performance/"></el-option>
                                        <el-option label="日志" value="#/matrix/devops/log/"></el-option>
                                    </el-select>
                                    <el-button slot="append" icon="el-icon-search"></el-button>
                                    <el-divider direction="vertical"></el-divider>
                                    <el-button slot="append" icon="fas fa-location-arrow" style="color:#2b90e1;"></el-button>
                                </el-input>
                            </el-header>
                            <el-main>
                            </el-main>
                        </el-container>`,
            data(){
                return {
                    search: {
                        term: "",
                        select: ""
                    }
                }
            },
            methods:{

            }
        })

        // 拓扑分析搜索框
        Vue.component("graph-view-search",{
            delimiters: ['${', '}'],
            props: {
                id: String
            },
            template: ` <div style="display:flex;">
                            <el-autocomplete
                                class="inline-input"
                                filterable="true"
                                allow-create="true"
                                v-model="term"
                                :fetch-suggestions="querySearch"
                                placeholder="图搜索"
                                @select="handleSelect"
                                style="width:96%;">
                            </el-autocomplete>
                            <el-button slot="append" type="success" icon="fas fa-search"  @click="search" size="default"></el-button>
                        </div>`,
            data(){
                return{
                    value: "",
                    terms: [],
                    term: "",
                }
            },
            created(){
                const self = this;

                // 更新选择列表
                eventHub.$on("GRAPH-VIEW-SEARCH-UPDATE-EVENT", term => {
                    this.term = term;
                });

                // 初始化图搜索脚本
                this.terms = _.union(inst.graphScript, this.loadAll());
                // 默认选择第一条
                this.term = _.first(this.terms).value;

                // url传入搜索脚本进行搜索
                let term = null;
                try {
                    term = decodeURIComponent(window.atob(mx.urlParams['term'] || ''));
                    if(term){
                        this.term = term;
                    }
                } catch(err){
                }
                
            },
            mounted(){
                const self = this;

                this.search();

                $(document).keypress(function(event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == 13) {
                        self.search();
                    }
                })

                // $(".el-input--small .el-input__inner,.el-select-dropdown__item").css({
                //     "fontSize": "12px",
                //     "height": "29px",
                //     "lineHeight": "28px",
                //     "background": "#f7f7f7",
                //     "borderRadius": "0px",
                //     "border": "unset"
                // })
            },
            methods:{
                search(){
                    this.$root.$refs.graphViewRef.search( encodeURIComponent(this.term) );

                    //加入搜索历史
                    this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.history.push({id:objectHash.sha1(this.term), term:this.term, time: _.now()});
                },
                querySearch(queryString, cb) {
                    var terms = this.terms;
                    var results = queryString ? terms.filter(this.createFilter(queryString)) : terms;
                    // 调用 callback 返回建议列表的数据
                    cb(results);
                },
                createFilter(queryString) {
                    return (term) => {
                      return (term.value.indexOf(queryString) === 0);
                    };
                },
                loadAll() {
                    let step = !_.isEmpty(this.step)?this.step:'';
                    return [
                        { value: `match("biz*")-[*${step}]->()`},
                        // { value: `match (m:"biz:查账系统")-[*]->(p:"linux:linux[1-5]")-[*]->(q:"esx:esx4") return status path m,p,q ALL PATH`},
                        // { value: `match ("biz:查账系统")-[*]->("esx:esx1") return name,status`},
                        // { value: `match ("biz:查账系统")-[*]->("linux:linux[0-9]")-[*1]->("esx:esx[1-4]")`},
                        // { value: `match ("biz:查账系统")-[*]->("linux:*")-[*1]->("esx:esx4")`},
                        // { value: `match ("biz:查账系统")-[:contain*1]->()-[*]->("esx:*")-[*1]->('switch:*')`},
                        // { value: `match ("biz:查账系统")-[:contain*1]->()-[*]->("esx:*","linux:*")-[*1]->('switch:*')`},
                        // { value: `match ("biz:查账系统")-[:contain*1]->()-[*]->("esx:*","linux:*")-[*1]->('switch:*') until "sanswitch:*"`},
                        // { value: `match (b:"biz:*")-[*]->(e:"esx:*")-[*1]->(s:"switch:*") return name,status short path b,e,s`},
                        // { value: `match (b:"biz:*")-[*]->(e:"esx:*")-[*1]->(s:"switch:*") return name,status path b,e,s`},
                        // { value: `match ("linux:*")-[*1]->("esx:*")`},
                        // { value: `match ("biz:查账系统")-[:contain]->("cluster:查账系统web集群")-[*]->() until "switch:*"`},
                        // { value: `match ('biz:*')-[*10]->()`},
                        // { value: `match ("biz:B查账系统")-[:contain]->("cluster:B查账系统web集群")-[*]->() until "switch:*" diff '2019-05-28 14:30:00'`},
                        // { value: `match (m:"biz:查账系统")-[*]->(p:"linux:linux[1-5]")-[*]->(q:"esx:esx4") return status path m,p,q`}
                        
                    ];
                },
                handleSelect(item) {
                    this.term = item.value;
                }
            }
        })

        // 拓扑分析管理
        Vue.component("graph-view-manager",{
            delimiters: ['${', '}'],
            props: {
                id: String
            },
            template: ` <div style="display:flex;">
                            <el-tooltip content="新增实体" open-delay="500">
                                <a href="javascript:void(0);" class="btn btn-link" disabled><i class="fas fa-plus"></i></a>
                            </el-tooltip>  
                            <el-tooltip content="删除实体" open-delay="500">
                                <a href="javascript:void(0);" class="btn btn-link" disabled><i class="fas fa-minus"></i></a>
                            </el-tooltip>    
                        </div>`,
            data(){
                return{
                    
                }
            },
            mounted(){
                
            },
            methods:{
                
            }
        })

        // 详情
        Vue.component("profile-view",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model:Object
            },
            template: `<form class="form-horizontal">
                            <div v-show="model.rows.length">
                                <div class="form-group" v-for="(value,key) in model.rows[0]" style="padding: 0px 10px;margin-bottom: 1px;">
                                    <label :for="key" class="col-sm-3 control-label" style="text-align:left;">#{key}#</label>
                                    <div class="col-sm-9" style="border-left: 1px solid rgb(235, 235, 244);">
                                        <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value">
                                    </div>
                                </div>
                            <div>
                        </form>`,
            mounted(){
                
            }
        });

        // 文件
        Vue.component("file-view",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model:Object,
                node: Object
            },
            data(){
                return {
                    
                }
            },
            template:   `<el-container :id="id">
                            <el-header style="height:30px;line-height:30px;padding:0px 10px;">
                                <el-button-group>
                                    <el-tooltip content="排序">
                                        <el-button type="text" class="fs-order">
                                            <i class="fas fa-list-ol"></i>
                                        </el-button>
                                    </el-tooltip>    
                                    <el-button type="text" style="width: 10px;">
                                    </el-button>
                                    <el-tooltip content="上传文件">
                                        <el-button type="text" class="fileinput-button" @click="fileUpload">
                                            <i class="fas fa-upload"></i>
                                        </el-button>
                                    </el-tooltip>    
                                </el-button-group>
                            </el-header>
                            <el-main style="padding:10px;height:calc(100vh - 205px);">
                                <el-row v-if="model && model.rows">
                                    <el-col :span="24" id="grid">
                                        <ul>
                                            <li :class="item.ftype=='dir'?'dir fs-node context-menu-file':'fs-node context-menu-file'"
                                                :id="'fs_node_'+item.id"
                                                style="cursor: pointer;"
                                                :title="item.name"
                                                v-for="item in model.rows">
                                                <div class="widget widget-stats bg-silver animated flipInX" :id="'fs_node_widget_'+item.id" @dblclick="openIt(item, item.parent+'/'+item.name);" >
                                                    <div class="stats-info">
                                                        <p><img class="media-object" :src="item | pickIcon" onerror="this.src='${window.ASSETS_ICON}/files/png/dir.png?type=open&issys=${window.SignedUser_IsAdmin}';" style="width:32px;"></p>
                                                    </div>
                                                    <div class="stats-link">
                                                        <a class="fs-name" data-edit="true" :data-pk="item.id" href="javascript:void(0);" style="text-align: left;margin:15px -15px -15px -15px;padding: 5px;" :title="item.name">
                                                            #{item.name}#
                                                        </a>
                                                    </div>
                                                    <div class="list-context-menu" :data-id="item.id" style="position: absolute;right: 10px;top: 5px;cursor:pointer;">
                                                        <i class="fa fa-bars"></i>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </el-col>
                                </el-row>
                            </el-main>
                        </el-container>`,
            created(){
                console.log(_.now(),this.node)
            },
            mounted(){
                this.initContextMenu();
                this.orderIt();
            },
            filters: {
                pickName: function(item){

                    if (_.isEmpty(item)) return '';

                    let _name = _.head(item.name.split("."));

                    if(!_.isEmpty(_name)){
                        _name = _.truncate(_name, {
                            'length': 9
                        });
                    }

                    return _name;
                },
                pickIcon: function(item){

                    // extend || ...
                    if( item.fullname === '/extend' ){
                        return `${window.ASSETS_ICON}/files/png/dir-lock.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                    } else {

                        try {
                            return _.attempt(JSON.parse.bind(null, item.attr)).icon || `${window.ASSETS_ICON}/files/png/${item.ftype}.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                        }
                        catch(error) {
                            return `${window.ASSETS_ICON}/files/png/${item.ftype}.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                        }
                    }
                }
            },
            methods: {
                reloadData(event){
                    this.model = event['file'];
                },
                initContextMenu(){
                    const self = this;

                    $.contextMenu({
                        selector: `#${self.id} .list-context-menu`,
                        trigger: 'left',
                        build: function($trigger, e) {
                            let item = null;
    
                            if(!_.isEmpty(e.target.attributes.getNamedItem('data-id').value)) {
                                let id = e.target.attributes.getNamedItem('data-id').value;
                                item = _.find(self.model.rows,{id:id});
                            }
                            
                            return {
                                items: {
    
                                    "read": {
                                        name: "下载", icon: "fas fa-download", callback: function (key, opt) {
                                            self.downloadIt(item,true);
                                        }
                                    },                                               
                                    "sep1": "---------",
                                    "delete": {
                                        name: "删除", icon: "fas fa-trash", callback: function (key, opt) {
                                            self.deleteIt(item,true);
                                        }
                                    },
                                    "sep2": "---------",
                                    "info": {
                                        name: "属性", icon: "fas fa-info", callback: function (key, opt) {
                                            self.info(item);
                                        }
                                    }
                                }
                            }
    
                        }
                    });
                },
                deleteIt: function(event, prompt) {
                    const self = this;
    
                    if(_.includes(['app','extend','assets','opt','script'],event.name)){
                        alertify.error("系统目录，不允许删除!");
                        return false;
                    }
    
                    if(_.isEmpty(event)) {
                        alertify.log("选择需要删除的对象！");
                        return false;
                    }
    
                    if(prompt){

                        alertify.confirm(`确定要删除 ${event.name} 文件?`, function (e) {
                            if (e) {
                                let _rtn = fsHandler.fsDelete(event.parent,event.name);
                                if (_rtn == 1){
                                    let fs = {class: event.class, id:event.id, name: event.name, file: `${event.parent}/${event.name}`};
                                    self.updateEntity(fs,"-");
                                }
                            } else {
                                
                            }
                        });
                    } else {
                        let _rtn = fsHandler.fsDelete(event.parent,event.name);
    
                        if (_rtn == 1){
                            
                        }
                    }
                },                     
                downloadIt: function(item, prompt) {
                    let self = this;
    
                    if(item.ftype == 'dir'){
                        let rtn = fsHandler.fsList(item.parent);
                    } else {
                        let _url = `/fs/${item.parent}/${item.name}?type=download&issys=${window.SignedUser_IsAdmin}`.replace(/\/\//g,'/');
                        let _target = '_blank';
                        window.open(_url, _target);
                    }
                },
                orderIt: function(){
                    const self = this;
    
                    $.contextMenu({
                        selector: `#${self.id} .fs-order`,
                        trigger: 'left',
                        callback: function (key, options) {
                            if(key == 'byNameAsc'){
                                self.model.rows = _.orderBy(self.model.rows,['name'],['asc']);
                            } else if(key == 'byNameDesc'){
                                self.model.rows = _.orderBy(self.model.rows,['name'],['desc']);
                            } else if(key == 'byTimeAsc'){
                                self.model.rows = _.orderBy(self.model.rows,['vtime'],['asc']);
                            } else if(key == 'byTimeDesc'){
                                self.model.rows = _.orderBy(self.model.rows,['vtime'],['desc']);
                            } else {
                                self.model.rows = _.orderBy(self.model.rows,['ftype'],['asc']);
                            }
                        },
                        items: {
                            "byNameAsc": { name: "按名称升序",icon: "fas fa-sort-alpha-up" },
                            "byNameDesc": { name: "按名称降序",icon: "fas fa-sort-alpha-down" },
                            "byTimeAsc": { name: "按时间升序",icon: "fas fa-sort-alpha-up" },
                            "byTimeDesc": { name: "按时间降序",icon: "fas fa-sort-alpha-down" },
                            "byFtype": { name: "按类型排序",icon: "fas fa-sort-alpha-down" },
                        }
                    });
    
                },
                fileUpload: function(){
                    const self = this;

                    let wnd = null;
                    let wndID = `jsPanel-upload-${objectHash.sha1(self.node.value)}`;

                    try{
                        if(jsPanel.activePanels.getPanel(wndID)){
                            jsPanel.activePanels.getPanel(wndID).close();
                        }
                    } catch(error){

                    }
                    finally{
                        wnd = maxWindow.winUpload('文件上传', `<div id="${wndID}"></div>`, null, null);
                    }
                    
                    new Vue({
                        delimiters: ['#{', '}#'],
                        template:   `<el-container>
                                        <el-main>
                                            <el-upload drag
                                                multiple
                                                :action="upload.url"
                                                :on-success="onSuccess"
                                                list-type="text"
                                                name="uploadfile">
                                                <i class="el-icon-upload"></i>
                                            </el-upload>
                                        </el-main>
                                        <el-footer>
                                            <i class="fas fa-clock"></i> 上传文件：#{upload.fileList.length}# 
                                        </el-footer>
                                    </el-container>`,
                        data: {
                            upload: {
                                url: `/fs/storage/entity/files/${self.node.value}?issys=true`,
                                fileList: []
                            }
                        },
                        created(){
                            
                        },
                        methods: {
                            beforeUpload(file){
                                
                            },
                            onSuccess(res,file,FileList){
                                this.upload.fileList = FileList;
                                self.updateEntity(file.raw,"+");
                            },
                            onRemove(file, fileList) {
                                console.log(file, fileList);
                            },
                            onPreview(file) {
                                console.log(file);
                            }
                        }
                    }).$mount(`#${wndID}`);
                    
                },  
                // 上传完毕，更新/matrix/entity   
                updateEntity(event,action){
                    let id = this.node.id;
                    let fs = {action: action, class: `/matrix/entity/${this.node.id.split(":")[0]}`, id:id, name: event.name, file: `/storage/entity/files/${this.node.value}/${event.name}`};
                    let rtn = fsHandler.callFsJScript('/graph/update-files-by-id.js', encodeURIComponent(JSON.stringify(fs))).message;
                    this.reload();
                },                     
                openIt: function(item, path){
                    const self = this;
    
                    if(typeof(item) === 'string' || item.ftype === 'dir'){
                        self.rootPath = path.replace(/\/\//g,'/');
                        return;
                    }
    
                    if(!_.isEmpty(item)){
    
                        if(_.includes(['png','jpg','jpeg','gif'], item.ftype)) {
    
    
                            let contents = `<img src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}" class="preview-img-responsive center-block" alt="Image">`;
                            let _wnd = maxWindow.winApp(item.name, contents, null,null);
    
                        } else if(_.includes(['mov','mp4','avi'], item.ftype)) {
    
                            let contents = `<div class="embed-responsive embed-responsive-16by9">
                                                <video src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}" controls="controls" autoplay>
                                                    your browser does not support the video tag
                                                </video>
                                            </div>
                                            `;
    
                            let _wnd = maxWindow.winApp(item.name, contents, null,null);
    
                        } else if(_.includes(['pdf'], item.ftype)) {
    
                            let contents = `<div class="embed-responsive embed-responsive-16by9">
                                                <iframe class="embed-responsive-item" src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}"></iframe>
                                            </div>`;
    
                            let _wnd = maxWindow.winApp(item.name, contents, null,null);
    
                        } else if(_.includes(['pptx','ppt'], item.ftype)) {
    
                            window.open(`/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}`, "_blank");
    
                        } else if(_.includes(['js','ltsv','txt','csv','html'], item.ftype)) {
    
                           self.editIt(item);
    
                        } else if(_.includes(['swf'], item.ftype)) {
                            let contents = `<div class="embed-responsive embed-responsive-16by9">
                                                <video src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}" width="100%" height="100%" controls="controls" autoplay>
                                                    Your browser does not support the video tag.
                                                </video>
                                            </div>`;
    
                            let _wnd = maxWindow.winApp(item.name, contents, null,null);
                        } else if(_.includes(['imap','iflow', 'ishow'], item.ftype)) {
                            _.merge(item,{action:'run'});
                            let url = fsHandler.genFsUrl(item,null,null);
                            window.open(url,'_blank');
                        } else if(_.includes(['md'], item.ftype)){
                            _.merge(item,{action:'run'});
    
                            let url = fsHandler.genFsUrl(item,{ header:true, sidebar:true, footbar:true },null);
    
                            window.open(url,'_blank');
                        }
                    }
    
                },
                info: function(node){
                    const self = this
    
                    let _win = maxWindow.winInfo("属性",'<div id="fs-info"></div>',null,$('#content'));
    
                    let _attr = {"attr": `{"remark": "", "ctime": ${_.now()}, "author": ${window.SignedUser_UserName}, "type": "${node.ftype}", "icon": "${window.ASSETS_ICON}/files/png/${node.ftype}.png?type=download&issys=${window.SignedUser_IsAdmin}"}`};
    
                    if(_.isEmpty(node.attr)){
                        node = _.merge(node, _attr);
                    }
    
                    let _infoVue = new Vue({
                        delimiters: ['#{', '}#'],
                        el: "#fs-info",
                        template: `<div class="tab-content" style="height:100%;">
                                                <div role="tabpanel" class="tab-pane active" id="home"  style="height:100%;">
                                                    <form  style="height:95%;overflow:auto;">
                                                        <div class="form-group">
                                                            <label for="name">名称</label>
                                                            <input type="text" class="form-control" id="name" placeholder="" v-model="model.newName" autofocus @keyup.enter="save">
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="remark">备注</label>
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
                                                            <label for="type">大小</label>
                                                            <input type="text" class="form-control" id="size" placeholder="" value="${mx.bytesToSize(node.size)}" disabled>
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="author">作者</label>
                                                            <input type="text" class="form-control" id="author" placeholder="" v-model="model.attr.author" disabled>
                                                        </div>
                                                        <div class="form-group">
                                                            <label for="icon">图标</label>
                                                            <a href="#icon-list" aria-controls="icon-list" role="tab" data-toggle="tab">
                                                                <img class="media-object" :src="model.icon.value" style="width:15%;">
                                                            </a>
                                                        </div>
    
                                                   </form>
                                                    <div class="form-group" style="text-align: center;padding-top:3px;">
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
                                                                  <input type="radio" :ref="icon.id" :id="icon.id"  :value="'/fs'+icon.parent+'/'+icon.name+'?type=download&issys=${window.SignedUser_IsAdmin}'" v-model="model.icon.value" >
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
                                newName: node.name,
                                type: node.ftype,
                                attr: {remark:''},
                                icon: {
                                    value: null,
                                    list: []
                                }
                            }
                        },
                        mounted: function() {
                            let me = this;
    
                            me.$nextTick(function() {
                                me.model.attr = _.attempt(JSON.parse.bind(null, node.attr));
                                me.model.icon.value = me.model.attr.icon;
                                me.init();
                            })
                        },
                        filters: {
                            pickName: function (value) {
                                let me = this;
    
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
                            let me = this;
    
                            me.model = null;
                        },
                        methods: {
                            init: function(){
                                let me = this;
    
                                me.model.icon.list = fsHandler.fsList('/assets/images/files/png');
                            },
                            triggerInput: function(id){
                                const self = this
    
                                $(self.$refs[id]).click()
                            },
                            apply: function(){
                                let me = this;
    
                                me.saveAttr();
    
                            },
                            save: function(){
                                let me = this;
    
                                me.saveAttr();
                                _win.close();
                            },
                            close: function(){
                                let me = this;
    
                                _win.close();
                            },
                            saveName: function(){
                                let me = this;
    
                                let _extName = node.ftype=='dir'?'':'.'+node.ftype;
                                let _old = node.parent + "/" + node.name;// + _extName;
                                let _new = node.parent + "/" + me.model.newName;// + _extName;
    
    
                                let _check = fsHandler.fsCheck( node.parent, me.model.newName);
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
                                let me = this;
    
                                me.model.attr = me.model.icon.value?_.extend(me.model.attr, {icon: me.model.icon.value}):me.model.attr;
    
                                let _rtn = fsHandler.fsUpdateAttr(node.parent, node.name, me.model.attr);
    
                                if(_rtn == 1){
                                    self.load();
                                    $(".list-context-menu").contextMenu('update');
    
                                    if(me.model.oldName != me.model.newName){
                                        me.saveName();
                                    }
                                }
                            }
                        }
                    })
    
                },
                reload(){
                    const self = this;
                    
                    try {
                        let id = this.node.id;
                        let value = this.node.value;
                        let model = fsHandler.callFsJScript("/graph/diagnosis-by-id.js", encodeURIComponent(JSON.stringify(_.omit(this.node,'cell')))).message;
                        
                        // 更新当前数据
                        _.extend(this.model, model['file']);

                        // 更新父-父-父数据
                        _.extend(this.$parent.$parent.$parent.model,model);
                        
                    } catch(error){
                        console.log(_.now(),error)
                    }
                }
            }
        })

        // 拓扑分析树
        Vue.component("graph-view-nav",{
            delimiters: ['${', '}'],
            props:{
                id: String
            },
            template: `<entity-tree-component :id="'graph-tree-'+id" :model="{parent:'/event',name:'event_tree_data.js',domain:'event'}"></entity-tree-component>`
        })

        //edges关系维护
        Vue.component("edges-maintain",{
            delimiters: ['#{', '}#'],
            props:{
                id: String,
                parent: Object,
                type: String,
                model: Object
            },
            data() {
                return {
                    term: "",
                    list: [],
                    selected: []
                };
            },
            template:   `<el-container>
                            <el-main style="padding: 10px 0px 0px 10px;">
                                <p><el-input v-model="term" clearable placeholder="实体关键字" @change="searchByTerm"></el-input></p>
                                <el-transfer v-model="selected" 
                                :titles="['实体列表',type]"
                                :button-texts="['取消关系', '创建关系']"
                                :data="list"
                                @change="updateEdges"></el-transfer>
                            </el-main>
                        </el-container>`,
            created(){
                
                try{
                    this.list = _.map(this.model.value,function(v){
                        return {key: v, label: v, disabled: 0};
                    })

                    this.selected = _.map(this.list,'key');
                } catch(err){
                    this.selected = [];
                }
                
            },
            mounted(){
                setInterval(()=>{
                    $(".el-transfer__buttons",this.$el).css({
                        "padding": "0 15px"
                    })
                    $(".el-transfer__buttons > .el-transfer__button",this.$el).css({
                        "padding": "5px"
                    })
    
                    $(".el-transfer-panel .el-transfer-panel__header",this.$el).css({
                        "height":"30px",
                        "line-height":"30px"
                    })
                    $(".el-transfer__button span,.el-checkbox__label,.el-transfer",this.$el).css({
                        "fontSize":"12px"
                    })
    
                    $(".el-transfer-panel__filter",this.$el).css({
                        "margin":"5px"
                    })
                    $(".el-transfer-panel__filter .el-input__inner",this.$el).css({
                        "height":"26px"
                    })
                    $(".el-tabs__header").css({
                        "margin":"0px"
                    })

                    $(".el-transfer-panel").css({
                        "width":"42.5%!important"
                    })

                    $(".el-transfer-panel__item.el-checkbox .el-checkbox__label").css({
                        "overflow":"unset"
                    })
                },100)
                
            },
            methods: {
                searchByTerm(){
                    let rtn = fsHandler.callFsJScript("/graph/entity-search-by-term.js",encodeURIComponent(this.term)).message;
                    
                    //如果已有选择
                    if(this.selected.length){
                        _.merge(this.list,_.map(rtn,function(v){
                            return {key: v.id, label: v.id+":"+v.name, class:v.class, disabled: 0};
                        }))
                    } else {
                        this.list = _.map(rtn,function(v){
                            return {key: v.id, label: v.id+":"+v.name, class:v.class, disabled: 0};
                        })
                    }

                    setInterval(()=>{
                        $(".el-transfer-panel__item",this.$el).addClass("el-checkbox");
                    },300)
                    
                },
                updateEdges(value, direction, movedKeys) {
                    
                    let edges = {id:this.parent.id, type:this.type, action:direction=='right'?"+":"-", value:_.map(movedKeys,(v) => {
                                    return _.find(this.list,{key:v});
                                })};
                    
                    let rtn = fsHandler.callFsJScript("/graph/edges-action.js",encodeURIComponent(JSON.stringify(edges))).message;
                    this.$root.$refs.graphViewRef.search();
                    console.log(rtn)
                }
            }
        })

        VueLoader.onloaded(["ai-robot-component",
                            "topological-graph-component",
                            "omdb-path-datatables-component",
                            "event-datatable-component",
                            "event-diagnosis-datatable-component",
                            "event-summary-component",
                            "search-preset-component",
                            "search-base-component",
                            "entity-tree-component"],function() {
            $(function() {

                

            })
        })
    }

    // 图挂载
    mount(el){
        const inst = this;
        
        // 拓扑分析图 局部组件
        let graphViewContainer = Vue.extend({
            delimiters: ['${', '}'],
            props: {
                id: String
            },
            data(){
                return {
                    model: null
                }
            },
            template: `<topological-graph-component :id="id" :graphData="model" ref="graphViewContainerInst"></topological-graph-component>`,
            mounted() {
                
            },
            methods:{
                search(term){
                    const self = this;

                    try {
                        
                        // 根据文件获取图
                        if( !_.isEmpty(inst.URL_PARAMS_ITEM) ){
                            self.model = fsHandler.fsContent(inst.URL_PARAMS_ITEM.parent, inst.URL_PARAMS_ITEM.name);
                        } else {
                            self.model = fsHandler.callFsJScript('/graph/graph_service.js', term).message[0].graph;
                        }

                    } catch(error) {
                        alertify.error("图查询失败，请确认语法！"+error);
                        self.model = {};
                    }
                    
                }
            }
        })

        // 拓扑分析节点信息 局部组件
        let graphViewDiagnosis = Vue.extend({
            delimiters: ['#{', '}#'],
            props: {
                id: String
            },
            template:   `<el-tabs v-model="activeIndex" type="border-card" closable @tab-remove="diagnosisRemove">
                            <el-tab-pane :label="item.title" v-for="item in tabs" :key="item.name" :name="item.name" lazy=true>
                                <el-tabs v-if="item.child" v-model="subIndex" class="el-tabs-bottom-line">
                                    <el-tab-pane :label="it | pickTitle" v-for="it in item.child" :key="it.name" :name="it.name" lazy=true>
                                        
                                        <profile-view :id="item.name" :model="model[it.type]" v-if="it.type === 'profile'"></profile-view>
                                        
                                        <event-diagnosis-datatable-component :id="it.name" :model="it.model[it.type]" v-if=" _.includes(['event','performance','log','ticket'],it.type) "></event-diagnosis-datatable-component>
                                        
                                        <file-view :id="it.name" :model="it.model[it.type]" :node="item.node" v-if="it.type === 'file'"></file-view>
                                        
                                    </el-tab-pane>
                                </el-tabs>
                            </el-tab-pane>
                        </el-tabs>`,
            data(){
                return {
                    tabs:   [],
                    activeIndex: '',
                    subIndex: '',
                    model: null
                }
            },
            filters: {
                pickTitle(event){
                    
                    try {
                        let count = 0;
                        
                        count = _.size(event.model[event.type].rows);
                        
                        return `${event.title} ${count}`;
                    } catch(err){
                        return `${event.title} 0`;
                    }
                }
            },
            watch: {
                tabs:function(val,oldVal){
                    if(val.length > 0){
                        this.$root.$data.splitInst.setSizes([0,60,40]);
                    } else {
                        this.$root.$data.splitInst.setSizes([0,100,0]);
                    }
                }
            },
            created(){
            },
            mounted(){ 
            },
            methods:{
                diagnosisAdd(node){
                    const self = this;

                    try{
                        self.model = fsHandler.callFsJScript('/graph/diagnosis-by-id.js', encodeURIComponent(JSON.stringify(_.omit(node,'cell')))).message;

                        let id = objectHash.sha1(node);

                        // 检查是否已打开
                        let name = `diagnosis-${id}`;
                        let find = _.find(self.tabs,{name: name});
                        if(find){
                            self.diagnosisRemove(name);
                        }

                        let tab = {
                            title: node.value, name: `diagnosis-${id}`, type: 'diagnosis', node: node, child:_.map(self.model.template,function(v){
                                return {title: v.title, name:`diagnosis-${v.name}-${id}`, type: v.type, model: self.model};
                            })};

                        self.activeIndex = tab.name;
                        self.tabs.push(tab);
                        self.subIndex = _.first(tab.child).name;

                    } catch(err){
                        console.log(err)
                    } finally{
                        let graph = this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.graph;
                        //graph.getView().setTranslate(20,20);//将画布放到容器中间
                        var highlight = new mxCellHighlight(graph, '#ff0000', 3);
                        highlight.highlight(graph.view.getState(node.cell));
                    }
                    
                },
                diagnosisRemove(targetName) {
                        
                    try{
                        let tabs = this.tabs;
                        let activeIndex = this.activeIndex;
                        if (activeIndex === targetName) {
                        tabs.forEach((tab, index) => {
                            if (tab.name === targetName) {
                            let nextTab = tabs[index + 1] || tabs[index - 1];
                            if (nextTab) {
                                activeIndex = nextTab.name;
                            }
                            }
                        });
                        }
                        
                        this.tabs = tabs.filter(tab => tab.name !== targetName);
                        this.activeIndex = activeIndex;
                        this.subIndex = _.first(_.last(this.tabs).child).name;
                    } catch(err){
                        
                    }
                    
                    
                }
            }
        })

        // 节点关系维护 局部组件
        let graphViewEdges = Vue.extend({
            delimiters: ['#{', '}#'],
            props: {
                id: String,
            },
            template:   `<el-tabs v-model="activeIndex" type="board-card" closable @tab-remove="edgesTabRemove" class="topological-view-edges-tabs">
                            <el-tab-pane :label="item.title" v-for="item in tabs" :key="item.name" :name="item.name" lazy=true>
                                <el-tabs v-if="item.child" v-model="subIndex" class="el-tabs-bottom-line">
                                    <el-tab-pane :label="it | pickTitle" v-for="it in item.child" :key="it.name" :name="it.name" lazy=true>
                                        <edges-maintain :id="id+'-maintain'" :parent="node" :type="it.type" :model="it.model"></edges-maintain>    
                                    </el-tab-pane>
                                </el-tabs>
                            </el-tab-pane>
                        </el-tabs>`,
            data(){
                return {
                    tabs:   [],
                    activeIndex: '',
                    subIndex: '',
                    node: null,
                    model: null
                }
            },
            filters: {
                pickTitle(event){
                    
                    try {
                        let count = 0;
                        count = event.model.value.length;
                        
                        return `${event.title} ${count}`;
                    } catch(err){
                        return `${event.title} 0`;
                    }
                }
            },
            watch: {
                tabs:function(val,oldVal){
                    if(val.length > 0){
                        this.$root.$data.splitInst.setSizes([44,56,0]);
                    } else {
                        this.$root.$data.splitInst.setSizes([0,100,0]);
                    }
                }
            },
            created(){
            },
            mounted(){ 
            },
            methods:{
                edgesTabAdd(node){
                    const self = this;

                    try{
                        self.node = node;

                        let id = node.id;

                        // 检查是否已打开
                        let name = `edges-${id}`;
                        let find = _.find(self.tabs,{name: name});
                        if(find){
                            self.activeIndex = name;
                            self.subIndex = _.first(find.child).name;  
                            return false;  
                        }

                        let tab = fsHandler.callFsJScript("/graph/edges-list.js",encodeURIComponent(JSON.stringify(_.omit(node,'cell')))).message;
                        
                        self.activeIndex = tab.name;
                        self.tabs.push(tab);
                        self.subIndex = _.first(tab.child).name;
                    } catch(err){
                        console.log(err)
                    }
                    
                },
                edgesTabRemove(targetName) {
                        
                    try{
                        let tabs = this.tabs;
                        let activeIndex = this.activeIndex;
                        if (activeIndex === targetName) {
                        tabs.forEach((tab, index) => {
                            if (tab.name === targetName) {
                            let nextTab = tabs[index + 1] || tabs[index - 1];
                            if (nextTab) {
                                activeIndex = nextTab.name;
                            }
                            }
                        });
                        }
                        
                        this.tabs = tabs.filter(tab => tab.name !== targetName);
                        this.activeIndex = activeIndex;
                        this.subIndex = _.first(_.last(this.tabs).child).name;
                    } catch(err){
                        
                    }
                    
                    
                }
            }
        })
        
        let randomId = objectHash.sha1(el + _.now());

        let component =  {
            delimiters: ['${', '}'],
            template: `<el-container style="background: transparent;height: 100%;">
                            <el-aside :id="'topological-view-left-'+id" style="border-right:1px solid #ddd;background-color:#f6f6f6;" class="topological-view-edges">
                                <!--graph-view-nav :id="'graph-view-nav-'+id"></graph-view-nav-->
                                <graph-view-edges :id="'graph-view-edges-'+id" ref="graphEdgesRef"></graph-view-edges>
                            </el-aside>
                            <el-container :id="'topological-view-main-'+id">
                                <graph-view-container :id="'graph-view-'+id" ref="graphViewRef"></graph-view-container>
                            </el-container>
                            <el-aside :id="'topological-view-right-'+id" style="height:calc(100vh - 30px);overflow:hidden;border-left:1px solid #ddd;background-color:#f6f6f6;" class="topological-view-diagnosis">
                                <graph-view-diagnosis :id="'graph-diagnosis-'+id" ref="graphDiagnosisRef"></graph-view-diagnosis>
                            </el-aside>
                        </el-container>`,
            data: {
                id: randomId,
                splitInst: null,
                model: null
            },
            components:{
                'graph-view-diagnosis': graphViewDiagnosis,
                'graph-view-container': graphViewContainer,
                'graph-view-edges': graphViewEdges
            },
            created(){
                
                try {
                    
                    if(!_.isEmpty(mx.urlParams['item'])){
                        inst.URL_PARAMS_ITEM = window.URL_PARAMS_ITEM = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['item']))));
                        inst.graphScript = [ { value: `${inst.URL_PARAMS_ITEM.fullname}` } ];
                    }
                    
                    if(!_.isEmpty(mx.urlParams['data'])) {
                        inst.graphScript = [{value:decodeURIComponent(window.atob(mx.urlParams['data']))}];
                    }
                    
                    if(!_.isEmpty(mx.urlParams['cfg'])){
                        inst.URL_PARAMS_CFG = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['cfg']))));
                    }

                    if(!_.isEmpty(mx.urlParams['graph'])){
                        inst.URL_PARAMS_GRAPH = window.URL_PARAMS_GRAPH = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['graph']))));
                    }
                    
                    
                    let init = (function(){
            
                        _.forEach(inst.URL_PARAMS_CFG,function(v,k){
                            
                            if("false" == String(v)){
                                $(`#${k}`).remove();
                                $(".page-header-fixed").css({
                                    "paddingTop": "0px"
                                })
                                $(".page-sidebar-minified .sidebar-bg").css({
                                    "width": "0px"
                                })
                                $(".page-sidebar-minified .content").css({
                                    "marginLeft": "0px"
                                })
                                $("body").css({
                                    "background": "transparent"
                                })
                            }
                        })
            
                    })();
                } catch(err){
                    // inst.URL_PARAMS_ITEM = null;
                    // inst.URL_PARAMS_CFG = null;
                    // inst.graphScript = null;
                    // inst.URL_PARAMS_GRAPH = null;
                }
            },
            mounted(){
                const self = this;

                _.delay(function(){
                    self.splitInst = Split([`#topological-view-left-${self.id}`, `#topological-view-main-${self.id}`,`#topological-view-right-${self.id}`], {
                        sizes: [0, 100,0],
                        minSize: [0, 0],
                        gutterSize: 5,
                        cursor: 'col-resize',
                        direction: 'horizontal',
                    });

                },1500)
                
            },
            methods: {
                setData(event){
                    this.model = _.extend(this.model, this.$refs.searchRef.result);
                },
                path(id, bid, node){

                    let _dataset = [];
                    let _columns = [];
                    let _node = {};
            
                    if(!_.isEmpty(node)) {
                        _dataset = node.data[_.keys(node.columns)[0]];
                        _columns = node.columns[_.keys(node.columns)[0]];
                        _node = node;
                    }
            
                    _columns.unshift({"field": "num", "title": "", render: function (data, type, row, meta) {
                            return meta.row + meta.settings._iDisplayStart + 1;
                        }
                    });
            
                    return {
            
                        delimiters: ['${', '}'],
                        el: '#' + id,
                        template: `<omdb-path-datatables-component :id="id" :bid="bid"
                                                                    :dataset="model.dataset"
                                                                    :columns="model.columns"
                                                                    :options="model.options"
                                                                    contextmenu="null"
                                                                    :result="result"></omdb-path-datatables-component>`,
                        data: {
                            id: id,
                            bid: bid,
                            model: {
                                dataset: _dataset,
                                columns: _columns,
                                options: {
                                    info:false,
                                    scrollY: '25vh',
                                    searching: false,
                                }
                            },
                            result: _node
                        },
                        created: function(){
                            let self = this;
            
                            eventHub.$on("LAYOUT-RESIZE-TRIGGER-EVENT", self.setScrollY);
            
                            eventHub.$on(`QUERY-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
                            eventHub.$on(`NEW-QUERY-RESULT-TRIGGER-EVENT-${bid}`,self.setData);
                        },
                        mounted: function() {
                            let self = this;
            
                            self.$nextTick(function() {
                                self.init();
                            })
                        },
                        methods: {
                            init: function(){
                                let self = this;
            
                                if(!_.isEmpty(node)) {
                                    self.model.dataset = self.result.data[_.keys(self.result.columns)[0]];
                                    self.model.columns = self.result.columns[_.keys(self.result.columns)[0]];
                                } else {
                                    self.model.dataset = [];
                                    self.model.columns = [];
                                }
            
                            },
                            setData: function(event){
                                let self = this;
            
                                self.model.dataset = event.data[_.keys(event.columns)[0]] || [];
                                self.model.columns = event.columns[_.keys(event.columns)[0]] || [];
                                self.result = event;
            
                            },
                            setScrollY: function(event){
                                let self = this;
            
                                self.model.options.scrollY = event.scrollY;
                            }
                        }
                    };
                },
                cellSelect(cell){
                    let graph = this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.graph;
                    
                    if (cell != null){
						var overlays = graph.getCellOverlays(cell);
						
						if (overlays == null) {
							// Creates a new overlay with an image and a tooltip
							var overlay = new mxCellOverlay(new mxImage('/fs/assets/images/files/png/check.png?type=open&issys=true', 16, 16),'Overlay tooltip');

							// Installs a handler for clicks on the overlay							
							overlay.addListener(mxEvent.CLICK, function(sender, evt2)
							{
								
							});
							
							// Sets the overlay for the cell in the graph
							graph.addCellOverlay(cell, overlay);
						} else {
							graph.removeCellOverlays(cell);
						}
                    }

                    try {
                        if( window.jsPanel.activePanels.getPanel(`jsPanel-graphAction`) ){
                            window.jsPanel.activePanels.getPanel(`jsPanel-graphAction`).close();
                        }
                    } catch(err){
                        
                    }
                    let wnd = maxWindow.winGraphAction("", `<div id="topological-analysis-container" style="width:100%;height:100%;"></div>`, null, `#graph-view-${this.id}-container`);
                    
                    new Vue({
                        delimiters: ['#{', '}#'],
                        template: `<topological-analysis></topological-analysis>`,
                    }).$mount("#topological-analysis-container")
                    
                },
                contextMenu(){
                    const self = this;

                    $.contextMenu({
                        selector: `#graph-view-${self.id} svg g image`,
                        trigger: 'left',
                        autoHide: true,
                        delay: 10,
                        hideOnSecondTrigger: true,
                        build: function($trigger, e) {
                            let graph = self.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph;
                            let cell = graph.selectedCell;
                            
                            if(!cell) return false;

                            let id = cell.getId();
                            let value = cell.getValue();
                            let node = {id: id, value: value, type:'event', cell: cell};
                            
                            return {
                                callback: function(key, opt) {
                                    if(_.includes(key,'diagnosis')){
                                        self.$root.$refs.graphDiagnosisRef.diagnosisAdd( node );
                                    } else if(_.includes(key,'search_out')){
                                        self.edgesSearch({direction:"out",node:node});
                                    } else if(_.includes(key,'search_in')){
                                        self.edgesSearch({direction:"in",node:node});
                                    } else if(_.includes(key,'edges_new')){
                                        self.$root.$refs.graphEdgesRef.edgesTabAdd( node );
                                    } else if(_.includes(key,'select_cell')){
                                        self.cellSelect( cell );
                                    }
                                },
                                items: {
                                    "m10_diagnosis": {
                                        "name": "实体分析",
                                        "icon": "fas fa-diagnoses"
                                    },
                                    "m20":"----------",
                                    "m30_search_out": {
                                        "name": "起点图查询",
                                        "icon": "fas fa-angle-up"
                                    },
                                    "m40_search_in": {
                                        "name": "终点图查询",
                                        "icon": "fas fa-angle-down"
                                    },
                                    "m50":"----------",
                                    "m60_edges_new": {
                                        "name": "关系维护",
                                        "icon": "fas fa-network-wired"
                                    },
                                    "m70":"----------",
                                    "m80_select_cell": {
                                        "name": "选择/取消实体",
                                        "icon": "far fa-check-square"
                                    },
                                    "m100":"----------",
                                    "m110_spath": {
                                        "name": "选定为路径查询起点",
                                        "icon": "fas fa-hourglass-start"
                                    },
                                    "m120_epath": {
                                        "name": "选定为路径查询终点",
                                        "icon": "fas fa-hourglass-end"
                                    }
                                }
                            }
                        },
                        events: {
                            show: function(opt) {
                                let $this = this;
                            },
                            hide: function(opt) {
                                let $this = this;
                            }
                        }
                    });
                },
                edgesSearch(node){
                    let term = "";
                    if(node.direction=="out"){
                        term = `match ('${node.node.id}') - [*] -> ()`;
                    } else{
                        term = `match ('${node.node.id}') <- [*] - ()`;
                    }
                    
                    //this.$root.$refs.graphViewRef.term.push(term);
                    this.$root.$refs.graphViewRef.search( encodeURIComponent(term) );
                    //加入搜索历史
                    this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.history.push({id:objectHash.sha1(term),term:term, time: _.now()});

                    _.delay(()=>{
                        let graph = this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.graph;
                        let graphModel = this.$root.$refs.graphViewRef.$refs.graphViewContainerInst.model.graph.graph.getModel();
                        let geo = graph.getCellGeometry(node.cell);
                        graphModel.setGeometry(node.cell, geo);
                        graph.refresh();
                    },1000)
                }
            },
            destroyed: function () {
                $(this.$el).off();
            }
        };
        
        // mount
        _.delay(() => {
            this.app = new Vue(component).$mount(el);
        },50)

    }

    // 图更新
    search(term){
        this.app.$refs.graphViewRef.search( encodeURIComponent(term) );

        // 更新选择列表
        eventHub.$emit("GRAPH-VIEW-SEARCH-UPDATE-EVENT",term);
    }

    // 销毁
    destroy(){
        $(this.app.$el).remove();
        this.app = null;
    }

    // 设定样式
    setStyle(){
        $(this.app.$el).find(".gutter-horizontal").css({
            "backgroundColor":"#ffffff!important"
        });
    }

}


