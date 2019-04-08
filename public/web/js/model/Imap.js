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
class Imap extends Matrix {

    constructor() {
        super();

        this.app = null;
    }

    init() {
        VueLoader.onloaded(["vue-base-datatables-component"],function() {
            let URL_PARAMS_ITEM, URL_PARAMS_CFG,URL_PARAMS_DATA,URL_PARAMS_SESSIONID;
            try {
                URL_PARAMS_ITEM = mx.urlParams['item']?_.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['item'])))):null;
                URL_PARAMS_CFG = mx.urlParams['cfg']?_.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['cfg'])))):null;
                URL_PARAMS_DATA = mx.urlParams['data']?decodeURIComponent(window.atob(mx.urlParams['data'])):[];
                URL_PARAMS_SESSIONID = mx.urlParams['sessionid'];

                let init = function(){
        
                    $(".geDiagramContainer").css("background-color","#000000");
                    
                    _.forEach(URL_PARAMS_CFG,function(v,k){
        
                        if(!v){
                            $(`#${k}`).hide();
                        }
                    })
                    $(".geDiagramContainer").css("background-color","#ffffff");
        
                }();
            } catch(error){

            }
            
    
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

                // 告警
                Vue.component("event-view",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    data(){
                        return {
                            datatable:null
                        }
                    },
                    template: ` <div v-show="model.rows.length && this.model.columns.length">
                                    <table :id="id" class="display" cellspacing="0"  width="100%"></table>
                                </div>`,
                    mounted(){
                        let cols = this.model.columns;

                        if(this.model.template){
                            cols = this.model.template;
                        }
                        cols  = _.map(cols,function(v){
                            if(v.render){
                                v.render = eval(v.render);
                            }
                            return v;
                        });
                        this.datatable = $("#"+this.id).DataTable( _.extend(this.model.options, { data: this.model.rows, columns: cols}))
                                                        .columns.adjust().draw();
                    }
                });

                // 仪表盘
                Vue.component("gauge-view",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data:function(){
                        return {
                            gaugePS: null
                        }
                    },
                    template: ` <div v-show="model.rows.length">
                                <ul style="list-style:none;padding:0 5px;">
                                    <li v-for="item in model.rows" style="float: left;width: 50%;height: 170px;padding: 10px;font-size: 10px;line-height: 1.4;text-align: center;">
                                        <canvas :id="'gauge-'+item.id"></canvas>
                                        <p>#{item.host}#/<small>#{item.param}#</small></p>
                                    </li>
                                </ul>
                                </div>`,
                    mounted:function(){
                        const self = this;
                        _.delay(function(){
                            self.init();
                        },500)
                    },
                    methods: {
                        init: function(){
                            const self = this;
                            
                            _.forEach(this.model.rows,function(v){
                                let gauge = new RadialGauge({
                                    renderTo: `gauge-${v.id}`,
                                    width: 150,
                                    height: 150,
                                    units: 'PS',
                                    minValue: 0,
                                    maxValue: 100,
                                    majorTicks: [
                                        '0',
                                        '10',
                                        '20',
                                        '30',
                                        '40',
                                        '50',
                                        '60',
                                        '70',
                                        '80',
                                        '90',
                                        '100'
                                    ],
                                    minorTicks: 2,
                                    ticksAngle: 270,
                                    startAngle: 45,
                                    strokeTicks: true,
                                    highlights  : [
                                        { from : 50,  to : 80, color : '#ffff00' },
                                        { from : 80, to : 100, color : 'rgba(225, 7, 23, 0.75)' }
                                    ],
                                    valueInt: 1,
                                    valueDec: 0,
                                    colorPlate: "#fff",
                                    colorMajorTicks: "#686868",
                                    colorMinorTicks: "#686868",
                                    colorTitle: "#000",
                                    colorUnits: "#000",
                                    colorNumbers: "#686868",
                                    valueBox: true,
                                    colorValueText: "#000",
                                    colorValueBoxRect: "#fff",
                                    colorValueBoxRectEnd: "#fff",
                                    colorValueBoxBackground: "#fff",
                                    colorValueBoxShadow: false,
                                    colorValueTextShadow: false,
                                    colorNeedleShadowUp: true,
                                    colorNeedleShadowDown: false,
                                    colorNeedle: "rgba(200, 50, 50, .75)",
                                    colorNeedleEnd: "rgba(200, 50, 50, .75)",
                                    colorNeedleCircleOuter: "rgba(200, 200, 200, 1)",
                                    colorNeedleCircleOuterEnd: "rgba(200, 200, 200, 1)",
                                    borderShadowWidth: 0,
                                    borders: true,
                                    borderInnerWidth: 0,
                                    borderMiddleWidth: 0,
                                    borderOuterWidth: 5,
                                    colorBorderOuter: "#fafafa",
                                    colorBorderOuterEnd: "#cdcdcd",
                                    needleType: "arrow",
                                    needleWidth: 2,
                                    needleCircleSize: 7,
                                    needleCircleOuter: true,
                                    needleCircleInner: false,
                                    animationDuration: 1500,
                                    animationRule: "dequint",
                                    fontNumbers: "Verdana",
                                    fontTitle: "Verdana",
                                    fontUnits: "Verdana",
                                    fontValue: "Led",
                                    fontValueStyle: 'italic',
                                    fontNumbersSize: 20,
                                    fontNumbersStyle: 'italic',
                                    fontNumbersWeight: 'bold',
                                    fontTitleSize: 24,
                                    fontUnitsSize: 22,
                                    fontValueSize: 50,
                                    animatedValue: true
                                });
                                gauge.draw();
                                gauge.value = v.value || 0;
                            })
                        }
                    }
                    
                });

                // 性能
                Vue.component("performance-view",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    template: `<form class="form-horizontal">
                                    <div v-show="model.rows.length">
                                    <div class="form-group" v-for="item in model.rows" style="padding: 0px 10px;margin-bottom: 1px;">
                                        <label :for="item.id" class="col-sm-4 control-label" style="text-align:left;"><h4>#{item.host}# <small>#{item.param}#</small></h4></label>
                                        <div class="col-sm-8" style="border-left: 1px solid rgb(235, 235, 244);">
                                            <input type="text" class="form-control-bg-grey" :placeholder="item.id" :value="item.value" style="height:50px;font-size:24px;color:green;">
                                        </div>
                                    </div>
                                    </div>
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
                        this.upload.option.url = `/fs/entity/files/${imap.app.model.graph.selectedCell.value}?issys=true`;
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
                                swal({
                                    title: event.name,
                                    text: "确定要删除?",
                                    type: "warning",
                                    showCancelButton: true,
                                    closeOnConfirm: false,
                                    cancelButtonText: "取消",
                                    confirmButtonText: "删除",
                                    confirmButtonColor: "#ff0000"
                                }).then((result) => {
                                    if (result.value) {
                                        let _rtn = fsHandler.fsDelete(event.parent,event.name);
                                        if (_rtn == 1){
                                            let fs = {class: event.class, id:event.id, name: event.name, file: `${event.parent}/${event.name}`};
                                            self.updateEntity(fs,"-");
                                        }
                                    }
                                })
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
                            let id = imap.app.model.graph.selectedCell.id;
                            let fs = {action: action, class: `/matrix/entity/${imap.app.model.graph.selectedCell.id.split(":")[0]}`, id:id, name: event.name, file: `/entity/files/${imap.app.model.graph.selectedCell.value}/${event.name}`};
                            let rtn = fsHandler.callFsJScript('/graph/update-files-by-id.js', encodeURIComponent(JSON.stringify(fs))).message;
                            imap.app.reloadData();
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
            
                        }
                    }
                });
    
                imap.app = new Vue({
                    delimiters: ['${', '}'],
                    el: '#app',
                    template: '#app-template',
                    data: {
                        model: {
                            object: {
                                data: null,
                                nodes: {},
                                tip: []
                            },
                            project: {},
                            graph:{
                                container: null,
                                model: null,
                                graph: null,
                                selectedCell: null,
                                theme: "theme-white",
                                data: null,
                                prompt: null,
                                outline: null,
                                appData:null,
                                layout: null,
                                parent: null
                            }
    
                        },
                        crontab: {
                            frequency: 15,
                            load: {
                                sched: Object,
                                timer: Object
                            }
                        },
                        win: {
                            toolbars: null,
                            cmd: null,
                            start: null,
                            end: null,
                        }
                    },
                    mounted: function() {
                        const self = this;
    
                        self.$nextTick(function() {
                            self.init();
                            self.initPlugIn();
                        })
                    },
                    watch: {
                        'model.graph.appData':  {
                            handler:function(val,oldVal){
                                const self = this;
    
                                self.update();
                            },
                            deep:true
                        }
                    },
                    created: function() {
                        const self = this;
    
                        self.load();
    
                    },
                    methods: {
                        toCenter: function(){
                            const self = this;
    
                            //self.model.graph.graph.fit();//自适应
                            self.model.graph.graph.center(true,true,0.5,0);//将画布放到容器中间
                            // var sc = self.model.graph.graph.getView().getScale();//获取当前的缩放比例
                            // self.model.graph.graph.zoomTo(Math.round(sc/2));//在缩放一半，否则是满屏状态，不好看
    
                        },
                        load: function(){
                            const self = this;
    
                            // 根据查询参数获取图
                            if( !_.isEmpty(URL_PARAMS_DATA) ){
                                self.model.graph.data = fsHandler.callFsJScript('/graph/graph_service.js', encodeURIComponent(URL_PARAMS_DATA)).message[0].graph;
                            }
                            // 根据文件获取图
                            else {
                                self.model.graph.data = fsHandler.fsContent(URL_PARAMS_ITEM.parent, URL_PARAMS_ITEM.name);
                            }
                        },
                        init: function() {
                            const self = this;
    
                            if (!mxClient.isBrowserSupported())
                            {
                                // Displays an error message if the browser is
                                // not supported.
                                mxUtils.error('Browser is not supported!', 200, false);
                            }
                            else
                            {
    
                                self.model.graph.container = document.getElementById('graph');
                                self.model.graph.container.style.position = 'absolute';
                                self.model.graph.container.style.overflow = 'hidden';
                                self.model.graph.container.style.left = '0px';
                                self.model.graph.container.style.top = '55px';
                                self.model.graph.container.style.right = '0px';
                                self.model.graph.container.style.bottom = '0px';
                                document.body.appendChild(self.model.graph.container);
    
    
                                //mxEvent.disableContextMenu(self.model.graph.container);
    
                                if (mxClient.IS_QUIRKS)
                                {
                                    document.body.style.overflow = 'hidden';
                                    new mxDivResizer(self.model.graph.container);
                                    new mxDivResizer(outline);
                                }
    
                                // Creates the graph inside the given container
                                self.model.graph.model = new mxGraphModel();
                                self.model.graph.graph = new mxGraph(self.model.graph.container, self.model.graph.model);
    
                                // Enables automatic sizing for vertices after editing and
                                // panning by using the left mouse button.
                                self.model.graph.graph.setEnabled(false);
                                self.model.graph.graph.setCellsMovable(true);
                                self.model.graph.graph.setAutoSizeCells(true);
                                self.model.graph.graph.setPanning(true);
                                self.model.graph.graph.centerZoom = true;
                                self.model.graph.graph.panningHandler.useLeftButtonForPanning = true;
                                // Disables tooltips on touch devices
                                self.model.graph.graph.setTooltips(!mxClient.IS_TOUCH);
                                self.model.graph.graph.htmlLabels = true;
    
                                self.model.graph.graph.setResizeContainer(false);
    
    
                                self.model.graph.graph.getCursorForCell = function(cell){
                                    if (cell != null && cell.value != null && cell.vertex ==1 ){
                                        return 'pointer';
                                    }
                                }
    
                                // Displays a popupmenu when the user clicks
                                // on a cell (using the left mouse button) but
                                // do not select the cmxCellRenderer.prototype.createLabelell when the popup menu
                                // is displayed
                                self.model.graph.graph.panningHandler.popupMenuHandler = false;
    
    
                                self.initGraph();
    
                                self.cellEvent();
    
                                _.delay(function(){
    
                                    self.model.graph.graph.addListener(mxEvent.CLICK, function(sender, evt) {
    
                                        let cell = self.model.graph.selectedCell = evt.getProperty('cell');
    
                                        if(_.isEmpty(cell)) return;
    
                                        let _value = cell.getValue();
    
    
                                        self.tip(cell.getValue());
    
                                    });
                                },500)
    
                            }
                        },
                        initGraph: function(){
                            const self = this;
    
                            self.model.graph.graph.getModel().beginUpdate();
    
                            try
                            {
                                if(!_.isEmpty(URL_PARAMS_DATA)){
    
                                    // Creates a layout algorithm to be used with the graph
                                    self.model.graph.layout = new mxHierarchicalLayout(self.model.graph.graph);
                                    //self.model.graph.layout = new mxFastOrganicLayout(self.model.graph.graph);
                                    self.model.graph.layout.orientation = "north";
                                    self.model.graph.layout.forceConstant = 120;

                                    // self.model.graph.layout = new mxCompactTreeLayout(self.model.graph.graph,false);
                                    // self.model.graph.layout.useBoundingBox = false;
                                    // self.model.graph.layout.edgeRouting = false;
                                    // self.model.graph.layout.levelDistance = 30;
                                    // self.model.graph.layout.nodeDistance = 10;
    
                                    self.model.graph.parent = self.model.graph.graph.getDefaultParent();
    
                                    let nodes = {};
                                    let orderNodes = _.orderBy(self.model.graph.data.nodes,['level'],['asc']);
    
                                    _.forEach(orderNodes,function(v){
                                        let _type = v._icon || 'matrix';
                                        let _name =  _.last(v.id.split(":")) || '';
                                        let node = self.model.graph.graph.insertVertex(self.model.graph.parent, v.id, _name, 50, 50, 120, 50,
                                            `shape=image;html=1;image=${window.ASSETS_ICON}/entity/png/${_type}.png?type=download&issys=${window.SignedUser_IsAdmin};verticalLabelPosition=bottom;verticalAlign=top;`);
    
                                        nodes[v.id] = node;
                                    })
    
                                    _.forEach(self.model.graph.data.edges,function(k){
                                        let source = nodes[k.source];
                                        let target = nodes[k.target];
                                        let baseEdgeStyle = 'edgeStyle=elbowEdgeStyle;html=1;rounded=1;jettySize=auto;orthogonalLoop=1;endArrow=block;endFill=1;';
                                        let direction = '';
                                        if(k.twoway){
                                            direction = 'startArrow=block;endArrow=block;endFill=1;';
                                        }
    
                                        let edge = self.model.graph.graph.insertEdge(self.model.graph.parent, k.id, k.class, source, target, baseEdgeStyle+direction);
                                    })
    
                                    // Executes the layout
                                    self.model.graph.layout.execute(self.model.graph.parent);
    
                                } else {
                                    let doc = mxUtils.parseXml(self.model.graph.data);
                                    let svgBgColor = doc.getElementsByTagName("mxGraphModel")[0].getAttribute("background") || "#ffffff";
                                    $("svg").css("background-color",svgBgColor);
                                    let codec = new mxCodec(doc);
    
                                    codec.decode(doc.documentElement, self.model.graph.graph.getModel());
                                }
    
                            }
                            finally
                            {
                                self.model.graph.graph.getModel().endUpdate();
    
                                self.toCenter();
    
                                self.initData();
    
                            }
                        },
                        initPlugIn: function(){
                            const self = this;
    
                            self.initOutline();
                            self.initToolBars();
                            self.model.graph.container.style.top = "0px";
    
                            self.crontab.load.sched = later.parse.text('every '+self.crontab.frequency+' sec');
                            //self.crontab.load.timer = later.setInterval(self.initData, self.crontab.load.sched);
    
                            $("#nav").find("div").hide();
                            self.win.toolbars.hide();
                        },
                        cellEvent: function(){
                            const self = this;
    
                            self.model.graph.graph.addListener(mxEvent.CLICK, function(sender, evt) {
    
                                let cell = evt.getProperty('cell');
    
                                if(_.isEmpty(cell)) return;
    
                                let id = cell.getId();
                                let value = cell.getValue();
    
                                let state = self.model.graph.graph.view.getState(cell);
                                let model = null;
                                
                                model = fsHandler.callFsJScript("/graph/diagnosis-by-id.js",encodeURIComponent(JSON.stringify({id:id,value:value}))).message;
                                //state.shape.node.getElementsByTagName("image")[0].setAttribute('class', `${value} ${id.replace(/:/g,"_")} animated flash`);
                                //state.shape.node.getElementsByTagName("image")[0].setAttribute('data-item', JSON.stringify(model));

                                // copy to copyboard
                                let clipboard2 = new Clipboard('g image',{
                                    text: function(trigger) {
                                        
                                        try {
                                            if( window.jsPanel.activePanels.getPanel(`jsPanel-entity`) ){
                                                window.jsPanel.activePanels.getPanel(`jsPanel-entity`).close();
                                            }
                                        } catch(err){
                                            let wnd = maxWindow.winEntity(id, `<div id="entity-container" style="width:100%;height:100%;"></div>`, null, 'body');
                                            let hashId = objectHash.sha1(cell);
                                            let config = {
                                                delimiters: ['#{', '}#'],
                                                template: ` <tabs v-model="layout.main.index">
                                                                <tab :title="item.title" v-for="(item,index) in layout.main.tabs" :key="item.id"  html-title style="height:calc(100vh - 235px);overflow:hidden;">
                                                                    <div v-if="item.type === 'profile'" style="height:100%;overflow-x:hidden;overflow-y:auto;">
                                                                        <profile-view :id="item.id" :model="model[item.type]"></profile-view>
                                                                    </div>
                                                                    <div v-if="item.type === 'event'" style="height:100%;overflow:auto;">
                                                                        <event-view :id="item.id" :model="model[item.type]"></event-view>
                                                                    </div>
                                                                    <div v-if="item.type === 'performance'" style="height:100%;overflow-x:hidden;overflow-y:auto;">
                                                                        <!--gauge-view :id="item.id" :model="model[item.type]"></gauge-view-->    
                                                                        <performance-view :id="item.id" :model="model[item.type]"></performance-view>
                                                                    </div>
                                                                    <div v-if="item.type === 'file'" style="height:100%;overflow-x:hidden;overflow-y:auto;">
                                                                        <file-view :id="item.id" :model="model[item.type]"></file-view>
                                                                    </div>
                                                                </tab>
                                                            </tabs>`,
                                                data: {
                                                    layout:{
                                                        main:{
                                                            index: 0,
                                                            tabs:[
                                                                {title:'属性', id:`profile-${hashId}`, type: 'profile'},
                                                                {title:'事件', id:`event-${hashId}`, type: 'event'},
                                                                {title:'性能', id:`performance-${hashId}`, type: 'performance'},
                                                                {title:'文件', id:`file-${hashId}`, type: 'file'}
                                                            ]
                                                        }
                                                    },
                                                    model: model
                                                },
                                                mounted(){
                                                    $(this.$el).find("ul.nav-tabs").addClass("nav-tabs-bottom-1px");
                                                },
                                                methods: {
                                                }
                                            };
                                            new Vue(config).$mount("#entity-container");
                                        }
                                        
                                        return id;
                                    }
                                });
                                //self.tip(`ID：${id} 已复制到剪切板！`);
    
                            });
                        },
                        initData: function(){
                            const self = this;
    
                            // 图所有节点
                            let cells = _.map(self.model.graph.graph.getChildVertices(self.model.graph.graph.getDefaultParent()),function(v,k){
                                return {gid: v.id, name: v.value};
                            });
    
                            let input = "('" + `${cells.join("','")}` + "')";
    
                            self.model.graph.appData = fsHandler.callFsJScript('/graph/graph_imap_data.js', encodeURIComponent(JSON.stringify(cells))).message;
                        },
                        reloadData(){
                            try {
                                let id = this.model.graph.selectedCell.getId();
                                let value = this.model.graph.selectedCell.getValue();
                                let model =fsHandler. callFsJScript("/graph/diagnosis-by-id.js",encodeURIComponent(JSON.stringify({id:id,value:value}))).message;
                                
                                eventHub.$emit("GRAPH-DIAGNOSIS-DATA-TRIGGER",model);
                                
                            } catch(error){
                                // alertify.error("没有关联信息");
                                // return false;
                            }
                        },
                        reset: function(){
                            const self = this;
    
                            self.model.graph.graph.getModel().beginUpdate();
    
                            try {
    
                                let _cells = self.model.graph.graph.getChildVertices(self.model.graph.graph.getDefaultParent(),true);
    
                                _.forEach(_cells, function (cell, k) {
                                    // Resets the fillcolor and the overlay
                                    self.model.graph.graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, '#dddddd', [cell]);
                                    self.model.graph.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#dddddd', [cell]);
                                    self.model.graph.graph.setCellStyles(mxConstants.STYLE_GRADIENTCOLOR, '#f9f9f9', [cell]);
                                    self.model.graph.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, '12', [cell]);
                                    self.model.graph.graph.setCellStyles(mxConstants.STYLE_FONTCOLOR, '#000000', [cell]);
                                    self.model.graph.graph.removeCellOverlays(cell);
                                })
                            }
                            finally {
                                self.model.graph.graph.getModel().endUpdate();
                            }
                        },
                        createOverlayByTip(image, tooltip) {
                            
                            let overlay = new mxCellOverlay(new mxImage(`/fs/assets/images/apps/png/severity/${image}.png?issys=true&type=download`,24,24), tooltip, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, new mxPoint(-10,15));
                            
                            return overlay;
                        },
                        createOverlayByMask(state){
                            let x = Number($(state[0]).attr('x')) - 5;
                            let y = Number($(state[0]).attr('y')) - 5;
                            let w = Number($(state[0]).attr('width')) + 5;
                            let h = Number($(state[0]).attr('height')) + 5;
                            
                            $(state[0]).parent().prepend(`<rect x="${x}" y="${y}" height="${h}" width="${w}" style="stroke: #70d5dd; fill: #dd524b">
                                                                <animate attributeType="XML"
                                                                        attributeName="fill" 
                                                                        values="#800;#f00;#800;#800" 
                                                                        dur="0.8s" 
                                                                        repeatCount="indefinite"/>
                                                        </rect>`);//setAttribute('class', 'animated infinite flash');
                        },
                        update: function () {
    
                            const self = this;
    
                            self.model.graph.graph.getModel().beginUpdate();
    
                            try {
                                _.forEach(self.model.graph.appData,function(v) {
                                    
                                    let id = v.gid;
                                    let status = v.status;
                                    let cell = self.model.graph.graph.getModel().getCell(id);
                                    let state = self.model.graph.graph.view.getState(cell);
                                    
                                    if (cell != null) {
                                        // Resets
                                        self.model.graph.graph.removeCellOverlays(cell);
                
                                        // Changes the cell color for the known states
                                        if (status >= 5) {
                                            
                                            // 判断节点类型
                                            let image = state.shape.node.getElementsByTagName("image");
                                            if(image){
                                                self.model.graph.graph.addCellOverlay(cell, self.createOverlayByTip(status, `${id}: 重大告警`));
                                                return false;
                                            }

                                            let rect = state.shape.node.getElementsByTagName("rect");
                                            if(rect){
                                                self.model.graph.graph.addCellOverlay(cell, self.createOverlayByMask(rect));
                                                return false;
                                            }

                                        } else if (status >3 && status < 5) {
                                            self.model.graph.graph.addCellOverlay(cell, self.createOverlay(status, `${id}: 严重告警`));
                                        }
                                    
                                    }
                                    /*
                                    
                                    self.model.graph.graph.setCellStyles(mxConstants.STYLE_FONTCOLOR, '#000000', [cell]);
                                    
                                    if(v.status >= 5){
                                        
                                        if(state && state.shape.node){


                                            //self.model.graph.graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, '#ff0000', [_cell]);
                                            self.model.graph.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#ff0000', [_cell]);
                                            self.model.graph.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, '6', [_cell]);
                                            //self.model.graph.graph.setCellStyles(mxConstants.STYLE_GLASS, '1', [_cell]);
    
                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("image"))){
                                                state.shape.node.getElementsByTagName("image")[k].setAttribute('class', 'animated infinite flash');
                                            }

                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("rect"))){
                                                _.forEach(state.shape.node.getElementsByTagName("rect"),function(v,k){
                                                    if(k == 1){
                                                        state.shape.node.getElementsByTagName("rect")[k].setAttribute('class', 'animated infinite flash');
                                                    } else {
                                                        state.shape.node.getElementsByTagName("rect")[k].style.stroke = "#ffffff";
                                                        state.shape.node.getElementsByTagName("rect")[k].style.strokeWidth = "12px"
                                                    }
                                                })
                                            }
    
                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("path"))){
                                                _.forEach(state.shape.node.getElementsByTagName("path"),function(v,k){
                                                    if(k == 1){
                                                        state.shape.node.getElementsByTagName("path")[k].setAttribute('class', 'animated infinite flash');
                                                    } else {
                                                        state.shape.node.getElementsByTagName("path")[k].style.stroke = "#ffffff";
                                                        state.shape.node.getElementsByTagName("path")[k].style.strokeWidth = "12px"
                                                    }
                                                })
                                            }
    
                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("ellipse"))){
                                                _.forEach(state.shape.node.getElementsByTagName("ellipse"),function(v,k){
                                                    if(k == 1){
                                                        state.shape.node.getElementsByTagName("ellipse")[k].setAttribute('class', 'animated infinite flash');
                                                    } else {
                                                        state.shape.node.getElementsByTagName("ellipse")[k].style.stroke = "#ffffff";
                                                        state.shape.node.getElementsByTagName("ellipse")[k].style.strokeWidth = "12px"
                                                    }
                                                })
                                            }
                                        }
    
                                        //self.tip(_id + " 跳过不执行",5);
                                    } else if(v.severity == 4){
    
                                        if(state && state.shape.node){
                                            //self.model.graph.graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, '#8bc34a', [_cell]);
                                            self.model.graph.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#8bc34a', [_cell]);
                                            self.model.graph.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, '6', [_cell]);
                                            //self.model.graph.graph.setCellStyles(mxConstants.STYLE_GLASS, '1', [_cell]);
    
    
                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("rect"))){
                                                _.forEach(state.shape.node.getElementsByTagName("rect"),function(v,k){
                                                    if(k == 1){
                                                        state.shape.node.getElementsByTagName("rect")[k].setAttribute('class', 'animated infinite flash');
                                                    } else {
                                                        state.shape.node.getElementsByTagName("rect")[k].style.stroke = "#ffffff";
                                                        state.shape.node.getElementsByTagName("rect")[k].style.strokeWidth = "12px"
                                                    }
                                                })
                                            }
    
                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("path"))){
                                                _.forEach(state.shape.node.getElementsByTagName("path"),function(v,k){
                                                    if(k == 1){
                                                        state.shape.node.getElementsByTagName("path")[k].setAttribute('class', 'animated infinite flash');
                                                    } else {
                                                        state.shape.node.getElementsByTagName("path")[k].style.stroke = "#ffffff";
                                                        state.shape.node.getElementsByTagName("path")[k].style.strokeWidth = "12px"
                                                    }
                                                })
                                            }
    
                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("ellipse"))){
                                                _.forEach(state.shape.node.getElementsByTagName("ellipse"),function(v,k){
                                                    if(k == 1){
                                                        state.shape.node.getElementsByTagName("ellipse")[k].setAttribute('class', 'animated infinite flash');
                                                    } else {
                                                        state.shape.node.getElementsByTagName("ellipse")[k].style.stroke = "#ffffff";
                                                        state.shape.node.getElementsByTagName("ellipse")[k].style.strokeWidth = "12px"
                                                    }
                                                })
                                            }
                                        }
    
                                        //self.tip(_id + " 运行完毕",3);
    
                                    } else {
    
                                        if(state && state.shape.node){
                                            self.model.graph.graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, '#ffc107', [_cell]);
                                            self.model.graph.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#ffc107', [_cell]);
                                            self.model.graph.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, '6', [_cell]);
                                            //self.model.graph.graph.setCellStyles(mxConstants.STYLE_GLASS, '1', [_cell]);
    
    
                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("rect"))){
                                                _.forEach(state.shape.node.getElementsByTagName("rect"),function(v,k){
                                                    if(k == 1){
                                                        state.shape.node.getElementsByTagName("rect")[k].setAttribute('class', 'animated infinite flash');
                                                    } else {
                                                        state.shape.node.getElementsByTagName("rect")[k].style.stroke = "#ffffff";
                                                        state.shape.node.getElementsByTagName("rect")[k].style.strokeWidth = "12px"
                                                    }
                                                })
                                            }
    
                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("path"))){
                                                _.forEach(state.shape.node.getElementsByTagName("path"),function(v,k){
                                                    if(k == 1){
                                                        state.shape.node.getElementsByTagName("path")[k].setAttribute('class', 'animated infinite flash');
                                                    } else {
                                                        state.shape.node.getElementsByTagName("path")[k].style.stroke = "#ffffff";
                                                        state.shape.node.getElementsByTagName("path")[k].style.strokeWidth = "12px"
                                                    }
                                                })
                                            }
    
                                            if(!_.isEmpty(state.shape.node.getElementsByTagName("ellipse"))){
                                                _.forEach(state.shape.node.getElementsByTagName("ellipse"),function(v,k){
                                                    if(k == 1){
                                                        state.shape.node.getElementsByTagName("ellipse")[k].setAttribute('class', 'animated infinite flash');
                                                    } else {
                                                        state.shape.node.getElementsByTagName("ellipse")[k].style.stroke = "#ffffff";
                                                        state.shape.node.getElementsByTagName("ellipse")[k].style.strokeWidth = "12px"
                                                    }
                                                })
                                            }
                                        }
    
                                        //self.tip(_id + " 报错",4);
    
                                    }*/
    
                                })
    
                            }
                            finally {
                                self.model.graph.graph.getModel().endUpdate();
                            }
    
                        },
                        tip: function(event,severity){
                            const self = this;
    
                            if (severity == 5) {
                                alertify.log(event + ' ' + moment().format("LLL"));
                            } else if (severity == 4) {
                                alertify.error(event + ' ' + moment().format("LLL"));
                            } else {
                                alertify.success(event + ' ' + moment().format("LLL"));
                            }
                        },
                        initOutline: function(){
                            const self = this;
    
                            let outline = document.getElementById('outlineContainer');
    
    
                            self.model.graph.outline = new mxOutline(self.model.graph.graph, outline);
    
                        },
                        reload: function(){
                            const self = this;
    
                            self.load();
                            self.initGraph();
                        },
                        initToolBars: function () {
                            const self = this;
    
                            let content = document.getElementById('tools');
                            content.style.padding = '4px';
    
                            let tb = new mxToolbar(content);
    
                            tb.addItem('{{.i18n.Tr "creative-tools-zoom_in"}}', `${window.ASSETS_ICON}/tools/png/zoom_out.png?type=download&issys=${window.SignedUser_IsAdmin}`,function(evt)
                            {
                                self.model.graph.graph.zoomIn();
                            },null,'tools-item');
    
                            tb.addItem('{{.i18n.Tr "creative-tools-zoom_out"}}', `${window.ASSETS_ICON}/tools/png/zoom_in.png?type=download&issys=${window.SignedUser_IsAdmin}`,function(evt)
                            {
                                self.model.graph.graph.zoomOut();
                            },null,'tools-item');
    
                            /*tb.addItem('{{.i18n.Tr "creative-tools-actual_size"}}', `${window.ASSETS_ICON}/tools/png/actual_size.png?type=download&issys=${window.SignedUser_IsAdmin}`,function(evt)
                            {
                                self.model.graph.graph.zoomActual();
                            },null,'tools-item');*/
    
                            tb.addItem('{{.i18n.Tr "creative-tools-print"}}', `${window.ASSETS_ICON}/tools/png/print.png?type=download&issys=${window.SignedUser_IsAdmin}`,function(evt)
                            {
                                var preview = new mxPrintPreview(self.model.graph.graph, 1);
                                preview.open();
    
                            },null,'tools-item');
    
                            tb.addItem('{{.i18n.Tr "creative-tools-fullscreen"}}', `${window.ASSETS_ICON}/tools/png/fullscreen.png?type=download&issys=${window.SignedUser_IsAdmin}`,function(evt)
                            {
                                mx.fullScreen();
    
                            },null,'tools-item');
    
                            self.win.toolbars = maxWindow.winToolBars('{{.i18n.Tr "creative-tools"}}',content,[5,220],null);
    
                        },
                        navToggle: function(){
                            const self = this;
    
                            $("#nav").find("div").toggle(500);
                            self.win.toolbars.toggle(500);
    
                            self.initOutline();
                        }
                    }
                });
    
            })
        })
    }
}

let imap = new Imap();
imap.init();