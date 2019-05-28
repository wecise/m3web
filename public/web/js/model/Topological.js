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
        this.graphAssociation = null;
        this.graphSelectedCell = null;
    }
    
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
    };

    init() {
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
                        model:Object
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
                                                <input id="file-upload" type="file" name="uploadfile" multiple>
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
                        this.upload.option.url = `/fs/storage/entity/files/${mxTopological.graphSelectedCell.value}?issys=true`;
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
    
                                try{
                                    return _.attempt(JSON.parse.bind(null, item.attr)).icon || `${window.ASSETS_ICON}/files/png/${item.ftype}.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                                }
                                catch(error){
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
            
                            $('#file-upload').fileupload(self.upload.option)
                                .on('fileuploadadd', function (e, data) {
            
                                    let title = "上传";
            
                                    let wnd = maxWindow.winUpload(title, '<div id="files" class="files"></div>', null,null);
            
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
            
                                    data.context = $('<ul/>').appendTo('#files');
            
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
                            let id = mxTopological.graphSelectedCell.id;
                            let fs = {action: action, class: `/matrix/entity/${mxTopological.graphSelectedCell.id.split(":")[0]}`, id:id, name: event.name, file: `/storage/entity/files/${mxTopological.graphSelectedCell.value}/${event.name}`};
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
                                let id = mxTopological.graphSelectedCell.getId();
                                let value = mxTopological.graphSelectedCell.getValue();
                                let model = fsHandler. callFsJScript("/topological/diagnosis-by-id.js",encodeURIComponent(id)).message;
                                
                                eventHub.$emit("GRAPH-DIAGNOSIS-DATA-TRIGGER",model);
                                
                            } catch(error){
                            }
                        }
                    }
                })

            });
        })
    }

    initComponent(mTo){
        
        let randomId = _.now();

        let component =  {
            delimiters: ['${', '}'],
            template: `<el-container style="background: transparent;height: 100%;">
                            <el-aside id="topological-view-left-${randomId}">
                                <div class="graphNav"></div>
                            </el-aside>
                            <el-container id="topological-view-main-${randomId}">
                                <el-main style="overflow:hidden;padding: 0px;">
                                    <div class="graph"></div>
                                </el-main>
                            </el-container>
                            <el-aside id="topological-view-right-${randomId}">
                                <div class="graph-association"></div>
                            </el-aside>
                        </el-container>`,
            data: {
                // 搜索组件结构
                model: {
                    id: "matrix-event-search",
                    filter: null,
                    term: null,
                    preset: null,
                    message: null,
                },
                options: {
                    // 搜索窗口
                    name:"所有", value: "",
                    // 输入
                    term: "柜面",
                    // 指定类
                    class: "#/matrix/devops/event/:",
                    // 时间窗口
                    range: { from: "", to: ""},
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
                count: {
                    event: 0,
                    performance: 0,
                    log: 0,
                    config: 0,
                    ticket: 0
                },
                splitInst:null
            },
            created: function(){
                // 初始化term
                try{
                    let term = decodeURIComponent(window.atob(mx.urlParams['term']));
                    this.options.term = term;
                } catch(err){

                }

                // 接收搜索数据
                eventHub.$on(`SEARCH-RESPONSE-EVENT-${this.model.id}`, this.setData);
            },
            mounted: function(){
                this.graph();

                this.splitInst = Split([`#topological-view-left-${randomId}`, `#topological-view-main-${randomId}`,`#topological-view-right-${randomId}`], {
                    sizes: [0, 100,0],
                    minSize: [0, 0],
                    gutterSize: 5,
                    cursor: 'col-resize',
                    direction: 'horizontal',
                });
            },
            methods: {
                setData(event){
                    this.model = _.extend(this.model, this.$refs.searchRef.result);
                },
                graph(){
                    _.delay(function(){
                        let ui = ['graphNav','graph'];
                        _.forEach(ui,function(v,index){
                            // 根据class设置组件id
                            $(`.${v}`).attr("id", v);
                           _.delay(function(){
                                // 组件实例化并挂载dom
                                new Vue(mxTopological[v](`topological-data-${v}`)).$mount(`#${v}`);
                           },50)
                        })
                    },50)
                }
            }
        };

        this.app = new Vue(component).$mount(mTo);
    }
    
    searchBar(){
        return {
            delimiters: ['${', '}'],
            template: ` <div class="input-group">
                            
                            <span class="input-group-btn" style="width:8rem;">
                                <multi-select v-model="type.selected" :options="type.options" :limit="1" size="sm" data-tooltip="tooltip" title="选择类型"  placeholder="搜索" />
                            </span>
                            
                            <div class="animated fadeIn" v-if="type.selected[0]==='advanced'">
                                <input type="text" class="form-control-transparent"  placeholder="搜索语法" v-model="advanced.input">
                                <!--input id="topological-graph-advanced-input" class="form-control-transparent" type="text" placeholder="搜索...">
                                <typeahead v-model="advanced.input" target="#topological-graph-advanced-input" force-select :data="advanced.data" item-key="value"/-->
                            </div>
                            <div class="input-group animated fadeIn" v-else>
                                <input type="text" class="form-control-transparent"  placeholder="节点">
                                <span class="input-group-btn" style="width:6rem;">
                                    <multi-select v-model="normal.rel.selected" :options="normal.rel.options" label-key="remedy" value-key="name" size="sm" data-tooltip="tooltip" title="选择关系" placeholder="关系" collapse-selected />
                                </span>
                                <span class="input-group-btn" style="width:6rem;">
                                    <multi-select v-model="normal.step.selected" :options="normal.step.options" :limit="1" size="sm" data-tooltip="tooltip" title="选择几跳"  placeholder="跳" />
                                </span>
                                <input type="text" class="form-control-transparent"  placeholder="节点">
                            </div>

                            <span class="input-group-btn">
                                <a href="javascript:void(0);" class="btn btn-sm btn-primary" @click="search">搜索</a>
                            </span>
                        </div>`,
            data: {
                // select gen term's mode
                type:{
                    selected: ['advanced'],
                    options: [
                            {value:'normal',label:'条件式搜索'},
                            {value:'advanced',label:'高级搜索'}
                        ]
                },
                // mode normal
                normal: {
                    rel:{
                        selected: [],
                        options: fsHandler.callFsJScript('/graph/edges.js',null).message
                    },
                    step: {
                        selected: [],
                        options: _.map(Array(10),function(v,index){let n = index+1; return {value: n, label: n+'跳'};})
                    },
                    input: ""
                },
                // mode advanced
                advanced: {
                    input: "",
                    data: null
                },
                // term for search
                term: {
                        value: 'match (m:"biz:查账系统")-[*]->(p:"linux:linux[1-5]")-[*]->(q:"esx:esx4") return status path m,p,q ALL PATH'
                    }
            },
            watch:{
                'advanced.input':{
                    handler:function(val,oldVal){
                        if(val === oldVal) return false;
                        _.extend(this.term, val['value']?{value: val.value}:{value:val});
                        console.log(2,this.term)
                    },
                    deep:true
                }
            },
            mounted(){
                const self = this;
                $(document).keypress(function(event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == 13) {
                        self.search();
                    }
                })

                this.advanced.data = this.loadCache();
            },
            methods:{
                search(){
                    this.cache();
                    eventHub.$emit("TOPOLOGICAL-TERM-EVENT",{value: encodeURIComponent(this.term.value)});
                },
                loadCache(){
                    let name = 'TOPOLOGICAL_GRAPH_SEARCH_CACHE.txt';

                    // load
                    return _.attempt(JSON.parse.bind(null, fsHandler.fsContent(`/${window.SignedUser_UserName}/temp`, name)));
                },
                cache(){
                    let preContent = this.loadCache();
                    // merge && save
                    let name = 'TOPOLOGICAL_GRAPH_SEARCH_CACHE.txt';
                    let content = JSON.stringify(_.merge(preContent,this.term));
                    let ftype = "txt";
                    let attr = {remark: "", ctime: _.now(), author: window.SignedUser_UserName, type: ftype};
                    let rtn = fsHandler.fsNew(ftype, `/${window.SignedUser_UserName}/temp`, name, content, attr);
                }
            }
        };
    }

    graphNav(id){
        return {
            delimiters: ['${', '}'],
            template: `<probe-tree-component id="event-detail-graph-tree" :model="{parent:'/event',name:'event_tree_data.js',domain:'event'}"></probe-tree-component>`,
            data: {
                id: id
            },
            mounted: function () {
                const self = this;

                self.$nextTick(function () {

                })
            }
        };
    }

    graph(id){
        return {
            delimiters: ['${', '}'],
            template: `<topological-graph-component :id="id" :graphData="model"></topological-graph-component>`,
            data: {
                id: id,
                model: {}
            },
            created(){
                eventHub.$on("TOPOLOGICAL-TERM-EVENT", this.search);   
            },
            mounted() {
                this.search();
            },
            methods:{
                search(term){
                    const self = this;

                    // 获取默认搜索条件
                    let defaultTerm = mxTopological.searchBar().data.term.value;

                    if(term){
                        defaultTerm = term.value;
                    }

                    // 重置关联信息
                    if(mxTopological.graphAssociation){
                        mxTopological.graphAssociation.$data.tabs = [];
                    }

                    try {
                        this.model = fsHandler.callFsJScript('/graph/graph_service.js', defaultTerm).message[0].graph;
                    } catch(error) {
                        alertify.error("图查询失败，请确认语法！"+error);
                        this.model = {};
                    }
                    
                }
            }
        };
    }

    toggleTheme(){
        let theme = localStorage.getItem("TOPOLOGICAL-GRAPH-THEME");

        if(theme === 'dark'){
            $(mxTopological.app.$el).find(".panel").removeClass("panel-inverse");
            $(mxTopological.app.$el).find(".panel").addClass("panel-default");
            $("body").css("background","#EBEBF3");
            theme = 'light';
        } else {
            $(mxTopological.app.$el).find(".panel").removeClass("panel-default");
            $(mxTopological.app.$el).find(".panel").addClass("panel-inverse");
            $("body").css("background","#000000");
            theme = 'dark';
        }

        localStorage.setItem("TOPOLOGICAL-GRAPH-THEME",theme);
    }

    diagnosis(event){
        
        let id = objectHash.sha1(event);
        let model = fsHandler.callFsJScript('/topological/diagnosis-by-id.js',event.id).message;
        let tabTemp =   {
                            title:event.value, name: `diagnosis-${id}`, type: 'diagnosis', child:[
                            {title:'属性', name:`diagnosis-profile-${id}`, type: 'profile', model:model},
                            {title:'事件', name:`diagnosis-event-${id}`, type: 'event', model:model},
                            {title:'性能', name:`diagnosis-performance-${id}`, type: 'performance', model:model},
                            {title:'日志', name:`diagnosis-log-${id}`, type: 'log', model:model},
                            {title:'文件', name:`diagnosis-file-${id}`, type: 'file', model:model}
                        ]};
                        
        if(!mxTopological.graphAssociation){
            mxTopological.graphAssociation = new Vue({
                delimiters: ['#{', '}#'],
                template:   `<el-tabs v-model="activeIndex" type="border-card" closable @tab-remove="detailRemove">
                                <el-tab-pane :label="item.title" v-for="item in tabs" :key="item.name" :name="item.name" lazy=true>
                                    <el-tabs v-if="item.child" v-model="subIndex" class="el-tabs-bottom-line">
                                        <el-tab-pane :label="it | pickTitle" v-for="it in item.child" :key="it.name" :name="it.name" lazy=true>
                                            <div v-if="it.type === 'profile'">
                                                <profile-view :id="item.name" :model="model[it.type]" v-if="it.model[it.type]"></profile-view>
                                            </div>
                                            <div v-else-if="_.includes(['event','performance','log'],it.type)">
                                                <event-diagnosis-datatable-component :id="it.name" :model="it.model[it.type]" v-if=" _.includes(['event','performance','log'],it.type) "></event-diagnosis-datatable-component>
                                            </div>
                                            <div v-else-if="it.type === 'file'">
                                                <file-view :id="it.id" :model="model[it.type]" v-if="it.model[it.type]""></file-view>
                                            </div>
                                        </el-tab-pane>
                                    </el-tabs>
                                </el-tab-pane>
                            </el-tabs>`,
                data: {
                    tabs:   [],
                    activeIndex: '',
                    subIndex: '',
                    model: null
                },
                filters: {
                    pickTitle(event){
                        const self = this;
                        
                        try {
                            let count = 0;
                            
                            count = event.model[event.type].rows.length;

                            return `${event.title} ${count}`;
                        } catch(error){
                            return `${event.title} 0`;
                        }
                    }
                },
                created(){
                    this.model = model;
                    this.activeIndex = `diagnosis-${id}`;

                    this.tabs.push(tabTemp);
                    this.subIndex = _.first(tabTemp.child).name;
                },
                mounted(){
                    this.init();
                },
                methods:{
                    init(){
                        
                    },
                    detailRemove(targetName) {
                            
                        let tabs = this.tabs;
                        let activeIndex = this.index;
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
                        
                        this.index = activeIndex;
                        this.tabs = tabs.filter(tab => tab.name !== targetName);

                        mxTopological.app.splitInst.setSizes([0,100,0]);
                    }
                }
            }).$mount(".graph-association");
        } else {
            
            let check = _.find(mxTopological.graphAssociation.$data.tabs,{name: `diagnosis-${id}`});
            
            if(!check){
                mxTopological.graphAssociation.$data.tabs.push(tabTemp);
                mxTopological.graphAssociation.$data.activeIndex = tabTemp.name;
                _.delay(function(){
                    mxTopological.graphAssociation.$data.subIndex = _.first(tabTemp.child).name;
                },500)
            } else {
                mxTopological.graphAssociation.$data.activeIndex = check.name;
            }
        }

        mxTopological.app.splitInst.setSizes([0,60,40]);
    
        mx.windowResize();
    }

}

let mxTopological = new Topological();
mxTopological.init();
