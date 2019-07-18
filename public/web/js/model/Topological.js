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
                                style="width:93%;">
                            </el-autocomplete>
                            <a href="javascript:void(0);" class="btn btn-sm btn-primary" @click="search">搜索</a>
                        </div>`,
            data(){
                return{
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
            },
            methods:{
                search(){
                    this.$root.$refs.graphViewRef.search( encodeURIComponent(this.term) );
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
                    return [
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
                    upload:{
                        option: {
                            url: '/fs/temp?issys=true',
                            dataType: 'json',
                            autoUpload: true,
                            acceptFileTypes: /(\.|\/)(gif|jpe?g|png|csv|log|pdf|html|txt|iso|mp3|mp4)$/i,
                            disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
                            previewMaxWidth: 100,
                            previewMaxHeight: 100,
                            previewCrop: true
                        }
                    }
                }
            },
            template:   `<div><div class="row">
                            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <div class="btn-group" style="padding:0 11px;float:right;">
                                    <a href="#" class="btn btn-link fs-order" title="排序" data-tooltip="tooltip">
                                        <i class="fas fa-list-ol"></i>
                                    </a>
                                    <a href="javascript:void(0);" class="btn btn-link fileinput-button" title="上传文件" data-tooltip="tooltip">
                                        <i class="fas fa-upload"></i>
                                        <input :id="id+'-file-upload'" type="file" name="uploadfile" multiple>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="row" v-if="model && model.rows">
                            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <div id="grid" style="padding:0 5px;"><ul>
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
                                                <a class="fs-name" data-edit="true" :data-pk="item.id" href="javascript:void(0);" style="text-align: left;margin:15px -15px -15px -15px;padding: 5px;" :title="item.name" :data-info="JSON.stringify(item)">
                                                    #{item.name}#
                                                </a>
                                            </div>
                                            <div class="list-context-menu" :data-item="JSON.stringify(item)" style="position: absolute;right: 10px;top: 5px;cursor:pointer;">
                                                <i class="fa fa-bars"></i>
                                            </div>
                                        </div>
                                    </li>
                                </ul></div>
                            </div>
                        </div></div>`,
            created(){
                this.upload.option.url = `/fs/storage/entity/files/${this.node.value}?issys=true`;
                eventHub.$on("GRAPH-DIAGNOSIS-DATA-TRIGGER",this.reloadData);
            },
            mounted(){
                this.initFileUpload();
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
                        selector: '.list-context-menu',
                        trigger: 'left',
                        build: function($trigger, e) {
                            let _item = null;
    
                            if(!_.isEmpty(e.target.attributes.getNamedItem('data-item').value)) {
                                _item = _.attempt(JSON.parse.bind(null, e.target.attributes.getNamedItem('data-item').value));
                            }
                            
                            return {
                                items: {
    
                                    "read": {
                                        name: "下载", icon: "fas fa-download", callback: function (key, opt) {
                                            self.downloadIt(_item,true);
                                        }
                                    },                                               
                                    "sep1": "---------",
                                    "delete": {
                                        name: "删除", icon: "fas fa-trash", callback: function (key, opt) {
                                            self.deleteIt(_item,true);
                                        }
                                    },
                                    "sep2": "---------",
                                    "info": {
                                        name: "属性", icon: "fas fa-info", callback: function (key, opt) {
                                            self.info(_item);
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
                        selector: '.fs-order',
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
                initFileUpload: function(){
                    const self = this;

                    let uploadButton = $('<button/>')
                        .addClass('btn btn-xs btn-primary')
                        .prop('disabled', true)
                        .text('准备中...')
                        .on('click', function () {
                            var $this = $(this),
                                data = $this.data();
                            $this
                                .off('click')
                                .text('中止')
                                .on('click', function () {
                                    $this.remove();
                                    data.abort();
                                });
                            data.submit().always(function () {
                                $this.remove();
                            });
                        });
    
                    $(`#${self.id}-file-upload`).fileupload(self.upload.option)
                        .on('fileuploadadd', function (e, data) {
    
                            let title = "上传";
    
                            let wnd = maxWindow.winUpload(title, `<div id="files-${self.id}" class="files"></div>`, null,null);
    
                            // 更新信息栏信息
                            new Vue({
                                delimiters: ['#{', '}#'],
                                el: `#jsPanel-upload-footer-${objectHash.sha1(title)}`,
                                template: `<div class="pull-left" style="width: 100%;"><i class="fas fa-clock"></i> #{stime}# | 上传文件：#{total}# </div>`,
                                data: {
                                    stime: moment().format("LLL"),
                                    utime: '',
                                    upload: 0,
                                    total: data.originalFiles.length,
                                    interval: null
                                },
                                created: function(){
                                },
                                methods: {
                                    update: function(event){
    
                                        if(event.stop){
                                            //clearInterval(this.interval);
                                        }
    
                                        if(event.upload){
                                            this.upload += event.upload;
                                        }
    
                                    }
                                }
                            });
    
                            data.context = $('<ul/>').appendTo(`#files-${self.id}`);
    
                            $.each(data.files, function (index, file) {
    
                                let _name = file.name;
    
                                if(!_.isEmpty(file.name) && _.size(file.name) > 9){
                                    _name = _.split(file.name,"",9).join("")+"..."
                                }
    
                                var node = $('<li/>')
                                    .append($(`<a href="#" class="thumbnail" style="margin-bottom:0px;border:none;-webkit-box-shadow: unset;box-shadow: unset;"/>`)
                                        .text(_name))
                                    .attr("title",file.name)
                                    .append($(`<div id="progress_${objectHash.sha1(file.name)}" class="progress">
                                                    <div class="progress-bar progress-bar-success"></div>
                                               </div>`));
                                if (!index) {
                                    node
                                        .append(uploadButton.clone(true).data(data));
                                }
                                node.appendTo(data.context);
                            });
                        })
                        .on('fileuploadprocessalways', function (e, data) {
                            var index = data.index,
                                file = data.files[index],
                                node = $(data.context.children()[index]);
    
                            if (file.preview) {
                                node
                                    .prepend(file.preview);
                            }else{
                                node
                                    .prepend(`<span class="fa fa-file fa-4x preview-null"></span>`);
                            }
    
                            if (file.error) {
                                node
                                    .append('<hr>')
                                    .append($('<span class="text-danger"/>').text(file.error));
                            }
                            if (index + 1 === data.files.length) {
                                data.context.find('button')
                                    .text('上传')
                                    .css('display','none')
                                    .prop('disabled', !!data.files.error);
                            }
    
                        })
                        .on('fileuploadprogress', function (e, data) {
    
                            let _name = objectHash.sha1(data.files[0].name);
                            let progress = parseInt(data.loaded / data.total * 100, 10);
                            $(`#progress_${_name} .progress-bar`).css(
                                'width',
                                progress + '%'
                            ).html(`<small>${parseInt(data.loaded/1024,10)} KB / ${parseInt(data.total/1024,10)} KB</small>`);
    
                        })
                        .on('fileuploaddone', function (e, data) {
                            $.each(data.files, function (index, file) {
                                if (file.name) {
                                    // var link = $('<a>')
                                    //     .attr('target', '_blank')
                                    //     .prop('href', file.name);
                                    // $(data.context.children()[index])
                                    //     .wrap(link);
                                    $(`#progress_${objectHash.sha1(file.name)} .progress-bar`).html(`<small>已完成</small>`);
                                    self.updateEntity(file,'+');
                                } else if (file.error) {
                                    var error = $('<span class="text-danger"/>').text(file.error);
                                    $(data.context.children()[index])
                                        .append('<br>')
                                        .append(error);
                                }
                            });
                        })
                        .on('fileuploadfail', function (e, data) {
                            $.each(data.files, function (index) {
                                var error = $('<span class="text-danger"/>').text('上传失败。');
                                $(data.context.children()[index])
                                    .append('<br>')
                                    .append(error);
                            });
                            // close upload win
    
                        })
                        .prop('disabled', !$.support.fileInput)
                        .parent().addClass($.support.fileInput ? undefined : 'disabled');
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
                    try {
                        let id = this.node.id;
                        let value = this.node.value;
                        this.model = fsHandler.callFsJScript("/graph/diagnosis-by-id.js", encodeURIComponent(JSON.stringify(_.omit(this.node,'cell')))).message;
                        
                        eventHub.$emit("GRAPH-DIAGNOSIS-DATA-TRIGGER",model);
                        
                    } catch(error){
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
            template: `<probe-tree-component :id="'graph-tree-'+id" :model="{parent:'/event',name:'event_tree_data.js',domain:'event'}"></probe-tree-component>`
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
                            "probe-tree-component"],function() {
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
            template: `<topological-graph-component :id="id" :graphData="model"></topological-graph-component>`,
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
                id: String,
                node: Object
            },
            template:   `<el-tabs v-model="activeIndex" type="border-card" closable @tab-remove="diagnosisRemove">
                            <el-tab-pane :label="item.title" v-for="item in tabs" :key="item.name" :name="item.name" lazy=true>
                                <el-tabs v-if="item.child" v-model="subIndex" class="el-tabs-bottom-line">
                                    <el-tab-pane :label="it | pickTitle" v-for="it in item.child" :key="it.name" :name="it.name" lazy=true>
                                        <div v-if="it.type === 'profile'">
                                            <profile-view :id="item.name" :model="model[it.type]" v-if="it.model[it.type]"></profile-view>
                                        </div>
                                        <div v-else-if="_.includes(['event','performance','log','ticket'],it.type)">
                                            <event-diagnosis-datatable-component :id="it.name" :model="it.model[it.type]" v-if=" _.includes(['event','performance','log','ticket'],it.type) "></event-diagnosis-datatable-component>
                                        </div>
                                        <div v-else-if="it.type === 'file'">
                                            <file-view :id="it.id" :model="it.model[it.type]" :node="node" v-if="it.model[it.type]""></file-view>
                                        </div>
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
                        self.node = node;

                        self.model = fsHandler.callFsJScript('/graph/diagnosis-by-id.js', encodeURIComponent(JSON.stringify(_.omit(node,'cell')))).message;

                        let id = objectHash.sha1(node);

                        // 检查是否已打开
                        let name = `diagnosis-${id}`;
                        let find = _.find(self.tabs,{name: name});
                        if(find){
                            self.activeIndex = name;
                            self.subIndex = _.first(find.child).name;  
                            return false;  
                        }

                        let tab = {
                            title: node.value, name: `diagnosis-${id}`, type: 'diagnosis', child:[
                            {title:'属性', name:`diagnosis-profile-${id}`, type: 'profile', model: self.model},
                            {title:'事件', name:`diagnosis-event-${id}`, type: 'event', model: self.model},
                            {title:'性能', name:`diagnosis-performance-${id}`, type: 'performance', model: self.model},
                            {title:'日志', name:`diagnosis-log-${id}`, type: 'log', model: self.model},
                            {title:'工单', name:`diagnosis-ticket-${id}`, type: 'ticket', model: self.model},
                            {title:'文件', name:`diagnosis-file-${id}`, type: 'file', model: self.model}
                        ]};
                        self.activeIndex = tab.name;
                        self.tabs.push(tab);
                        self.subIndex = _.first(tab.child).name;
                    } catch(err){
                        console.log(err)
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
                node: Object
            },
            template:   `<el-container>
                            <el-main style="padding: 5px 0px 0px 0px;">
                                <el-tabs v-model="activeIndex" type="board-card" closable @tab-remove="edgesTabRemove">
                                    <el-tab-pane :label="item.title" v-for="item in tabs" :key="item.name" :name="item.name" lazy=true>
                                        <el-tabs v-if="item.child" v-model="subIndex" class="el-tabs-bottom-line">
                                            <el-tab-pane :label="it | pickTitle" v-for="it in item.child" :key="it.name" :name="it.name" lazy=true>
                                                <edges-maintain :id="id+'-maintain'" :parent="node" :type="it.type" :model="it.model"></edges-maintain>    
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-main>
                        </el-container>`,
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
                            <el-aside :id="'topological-view-left-'+id">
                                <!--graph-view-nav :id="'graph-view-nav-'+id"></graph-view-nav-->
                                <graph-view-edges :id="'graph-view-edges-'+id" ref="graphEdgesRef"></graph-view-edges>
                            </el-aside>
                            <el-container :id="'topological-view-main-'+id">
                                <el-main style="overflow:hidden;padding: 0px;">
                                    <graph-view-container :id="'graph-view-'+id" ref="graphViewRef"></graph-view-container>
                                </el-main>
                            </el-container>
                            <el-aside :id="'topological-view-right-'+id" style="height:100%;overflow:hidden;">
                                <graph-view-diagnosis :id="'graph-diagnosis-'+id" ref="graphDiagnosisRef"></graph-view-diagnosis>
                            </el-aside>
                        </el-container>`,
            data: {
                id: randomId,
                splitInst: null,
                model: null,
                selectedCell: null
            },
            components:{
                'graph-view-diagnosis': graphViewDiagnosis,
                'graph-view-container': graphViewContainer,
                'graph-view-edges': graphViewEdges
            },
            created(){
                try {
                    if(mx.urlParams['item']){
                        inst.URL_PARAMS_ITEM = window.URL_PARAMS_ITEM = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['item']))));
                        inst.graphScript = [ { value: `${inst.URL_PARAMS_ITEM.fullname}` } ];
                    }

                    if(mx.urlParams['data']) {
                        inst.graphScript = [{value:decodeURIComponent(window.atob(mx.urlParams['data']))}];
                    }
                    
                    if(mx.urlParams['cfg']){
                        inst.URL_PARAMS_CFG = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['cfg']))));
                    }

                    if(mx.urlParams['graph']){
                        inst.URL_PARAMS_GRAPH = window.URL_PARAMS_GRAPH = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['graph']))));
                    }
                    
                    
                    let init = (function(){
            
                        _.forEach(inst.URL_PARAMS_CFG,function(v,k){
            
                            if("false" == String(v)){
                                $(`#${k}`).hide();
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
                    inst.URL_PARAMS_ITEM = null;
                    inst.URL_PARAMS_CFG = null;
                    inst.graphScript = null;
                    inst.URL_PARAMS_GRAPH = null;
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

                },500)
                
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
                contextMenu(){
                    const self = this;

                    $.contextMenu({
                        selector: `#graph-view-${self.id} svg g image`,
                        trigger: 'left',
                        autoHide: true,
                        delay: 10,
                        hideOnSecondTrigger: true,
                        build: function($trigger, e) {
                            let cell = self.selectedCell;
                            
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
                                    }
                                },
                                items: {
                                    "m10_diagnosis": {
                                        "name": "实体分析",
                                        "icon": "fas fa-diagnoses"
                                    },
                                    "m20":"----------",
                                    "m30_search_out": {
                                        "name": "出度查询",
                                        "icon": "fas fa-angle-up"
                                    },
                                    "m40_search_in": {
                                        "name": "入度查询",
                                        "icon": "fas fa-angle-down"
                                    },
                                    "m50":"----------",
                                    "m60_edges_new": {
                                        "name": "关系维护",
                                        "icon": "fas fa-angle-up"
                                    },
                                    // "m70":"----------",
                                    // "m80_clone": {
                                    //     "name": "克隆实体",
                                    //     "icon": "fas fa-plus"
                                    // },
                                    // "m90_delete": {
                                    //     "name": "删除实体",
                                    //     "icon": "fas fa-minus"
                                    // },
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
                    console.log(123,term, this.$root.$refs.graphViewRef.$data)
                    //this.$root.$refs.graphViewRef.term.push(term);
                    this.$root.$refs.graphViewRef.search( encodeURIComponent(term) );
                },
                toggleTheme(){
                    let theme = localStorage.getItem("TOPOLOGICAL-GRAPH-THEME");
            
                    if(theme === 'dark'){
                        $(this.app.$el).find(".panel").removeClass("panel-inverse");
                        $(this.app.$el).find(".panel").addClass("panel-default");
                        $("body").css("background","#EBEBF3");
                        theme = 'light';
                    } else {
                        $(this.app.$el).find(".panel").removeClass("panel-default");
                        $(this.app.$el).find(".panel").addClass("panel-inverse");
                        $("body").css("background","#000000");
                        theme = 'dark';
                    }
            
                    localStorage.setItem("TOPOLOGICAL-GRAPH-THEME",theme);
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


