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
        
                    //$(".geDiagramContainer").css("background-color","#000000");
                    
                    _.forEach(URL_PARAMS_CFG,function(v,k){
        
                        if(!v){
                            $(`#${k}`).hide();
                        }
                    })
                    
                    //$(".geDiagramContainer").css("background-color","#ffffff");
        
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

                // 日志
                Vue.component("log-view",{
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
                                parent: null,
                                paths:{
                                    ports: [],
                                    list: []
                                }
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
                    mounted() {
                        const self = this;
    
                        self.$nextTick(function() {
                            self.init();
                            self.initPlugIn();
                        })
                    },
                    watch: {
                        'model.graph.appData':  {
                            handler(val,oldVal){
                                const self = this;
    
                                self.update();
                            },
                            deep:true
                        },
                        'model.graph.paths.ports':{
                            handler(val,oldVal){
                                
                                if(val.length > 0){
                                    this.paths();
                                }
                            },
                            deep:true
                        }
                    },
                    created() {
                        const self = this;
    
                        self.load();
    
                    },
                    methods: {
                        toCenter(){
                            const self = this;
    
                            //self.model.graph.graph.fit();//自适应
                            self.model.graph.graph.center(true,true,0.5,0);//将画布放到容器中间
                            // var sc = self.model.graph.graph.getView().getScale();//获取当前的缩放比例
                            // self.model.graph.graph.zoomTo(Math.round(sc/2));//在缩放一半，否则是满屏状态，不好看
    
                        },
                        load(){
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
                        init() {
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
                                self.model.graph.container.style.overflow = 'auto';
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
    
                            }
                        },
                        initGraph(){
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
                        initPlugIn(){
                            const self = this;
    
                            self.initOutline();
                            self.initToolBars();
                            self.model.graph.container.style.top = "0px";
    
                            self.crontab.load.sched = later.parse.text('every '+self.crontab.frequency+' sec');
                            //self.crontab.load.timer = later.setInterval(self.initData, self.crontab.load.sched);
    
                            $("#nav").find("div").hide();
                            self.win.toolbars.hide();

                            // 节点右键菜单
                            self.contextMenu();
                        },
                        contextMenu(){
                            const self = this;

                            $.contextMenu({
                                selector: `svg g image`,
                                trigger: 'hover',
                                autoHide: true,
                                delay: 10,
                                hideOnSecondTrigger: true,
                                build: function($trigger, e) {
                                    
                                    let cell = self.model.graph.selectedCell;
                                    let node = {id: cell.getId(), value: cell.getValue()};
                                    
                                    return {
                                        callback: function(key, opt) {
                                            if(_.includes(key,'diagnosis')){
                                                self.config(node, objectHash.sha1(cell));
                                            } else if(_.includes(key,'spath')){
                                                imap.app.$set(self.model.graph.paths.ports, 0, cell);
                                                eventHub.$emit("ENTITY-PATHS-SEARCH-EVENT");
                                            } else if(_.includes(key,'epath')){
                                                imap.app.$set(self.model.graph.paths.ports, 1, cell);
                                                eventHub.$emit("ENTITY-PATHS-SEARCH-EVENT");
                                            }

                                        },
                                        items: {
                                            "m10_diagnosis": {
                                                "name": "实体分析",
                                                "icon": "fas fa-diagnoses"
                                            },
                                            "m20":"----------",
                                            "m30_spath": {
                                                "name": "选定为路径查询起点",
                                                "icon": "fas fa-hourglass-start"
                                            },
                                            "m31_epath": {
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
                        cellEvent: function(){
                            const self = this;

                            self.model.graph.graph.addListener(mxEvent.CLICK, function(sender, evt) {
                                
                                let cell = evt.getProperty('cell');
                                
                                if(!cell) return;

                                self.model.graph.selectedCell = cell;
    
                                let id = cell.getId();
                                let value = cell.getValue();
    
                                let state = self.model.graph.graph.view.getState(cell);
                                
                                //state.shape.node.getElementsByTagName("image")[0].setAttribute('class', `${value} ${id.replace(/:/g,"_")} animated flash`);
                                //state.shape.node.getElementsByTagName("image")[0].setAttribute('data-item', JSON.stringify(model));

                                // copy to copyboard
                                let clipboard2 = new Clipboard('g image',{
                                    text: function(trigger) {
                                        return id;
                                    }
                                });

                                // 查看相关信息
                                self.config({id:id,value:value}, objectHash.sha1(cell));

                            });

                            let track = new mxCellTracker(self.model.graph.graph);
                            track.mouseMove = function(sender, me) {
                                
                                let cell = this.getCell(me);
                                
                                if(!cell) return;
                                
                                self.model.graph.selectedCell = cell;
                                
                            };
                        },
                        config(node,hashId){
                            const self = this;

                            try {
                                if( window.jsPanel.activePanels.getPanel(`jsPanel-entity`) ){
                                    window.jsPanel.activePanels.getPanel(`jsPanel-entity`).close();
                                }
                            } catch(err){
                                
                            }
                            
                            let wnd = maxWindow.winEntity(node.id, `<div id="entity-container" style="width:100%;height:100%;"></div>`, null, 'body');

                            let config = {
                                delimiters: ['#{', '}#'],
                                template: ` <el-container>
                                                <el-main style="padding:0px 5px;">
                                                    <el-tabs v-model="layout.main.activeIndex" class="el-tabs-bottom-line">
                                                        <el-tab-pane :label="item.title" v-for="(item,index) in layout.main.tabs" :key="item.id"  style="height:calc(100vh - 235px);overflow:hidden;" lazy=true>
                                                            <div v-if="item.type === 'profile'" style="height:100%;overflow-x:hidden;overflow-y:auto;">
                                                                <profile-view :id="item.id" :model="model.value[item.type]" v-if="model.value[item.type].rows"></profile-view>
                                                            </div>
                                                            <div v-if="item.type === 'event'" style="height:100%;overflow:auto;">
                                                                <event-view :id="item.id" :model="model.value[item.type]"v-if="model.value[item.type].rows" ></event-view>
                                                            </div>
                                                            <div v-if="item.type === 'log'" style="height:100%;overflow-x:hidden;overflow-y:auto;">
                                                                <log-view :id="item.id" :model="model.value[item.type]" v-if="model.value[item.type].rows"></log-view>
                                                            </div>
                                                            <div v-if="item.type === 'performance'" style="height:100%;overflow-x:hidden;overflow-y:auto;">
                                                                <gauge-view :id="item.id" :model="model.value[item.type]" v-if="model.value[item.type].rows"></gauge-view>    
                                                                <performance-view :id="item.id" :model="model.value[item.type]" v-if="model.value[item.type].rows"></performance-view>
                                                            </div>
                                                            <div v-if="item.type === 'file'" style="height:100%;overflow-x:hidden;overflow-y:auto;">
                                                                <file-view :id="item.id" :model="model.value[item.type]" v-if="model.value[item.type].rows"></file-view>
                                                            </div>
                                                        </el-tab-pane>
                                                    </el-tabs>
                                                </el-main>
                                            </el-container>`,
                                data: {
                                    layout:{
                                        main:{
                                            activeIndex: 0,
                                            tabs:[
                                                {title:'属性', id:`profile-${hashId}`, type: 'profile'},
                                                {title:'事件', id:`event-${hashId}`, type: 'event'},
                                                {title:'日志', id:`log-${hashId}`, type: 'log'},
                                                {title:'性能', id:`performance-${hashId}`, type: 'performance'},
                                                {title:'文件', id:`file-${hashId}`, type: 'file'}
                                            ]
                                        }
                                    },
                                    model: {
                                        value: null,
                                        list: []
                                    }
                                },
                                created(){
                                    this.model.value = fsHandler.callFsJScript("/graph/diagnosis-by-id.js",encodeURIComponent(JSON.stringify(node))).message;
                                    this.model.list =   _.map(self.model.graph.graph.getChildVertices(self.model.graph.graph.getDefaultParent()),function(v,k){
                                                            return {gid: v.id, name: v.value};
                                                        });
                                },
                                mounted(){
                                    $(this.$el).find("ul.nav-tabs").addClass("nav-tabs-bottom-1px");
                                },
                                methods: {
                                }
                            };
                            new Vue(config).$mount("#entity-container");
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

                                            self.model.graph.graph.addCellOverlay(cell, self.createOverlayByTip(status, `${id}: 重大告警`));

                                            // 判断节点类型
                                            // let image = state.shape.node.getElementsByTagName("image");
                                            // if(image){
                                            //     self.model.graph.graph.addCellOverlay(cell, self.createOverlayByTip(status, `${id}: 重大告警`));
                                            //     return false;
                                            // }

                                            // let rect = state.shape.node.getElementsByTagName("rect");
                                            // if(rect){
                                            //     self.model.graph.graph.addCellOverlay(cell, self.createOverlayByMask(rect));
                                            //     return false;
                                            // }

                                        } else if (status >3 && status < 5) {
                                            self.model.graph.graph.addCellOverlay(cell, self.createOverlayByTip(status, `${id}: 严重告警`));
                                        } else {
                                            self.model.graph.graph.removeCellOverlays(cell);
                                        } 
                                    
                                    }
    
                                })
    
                            } catch(err){

                            }
                            finally {
                                self.model.graph.graph.getModel().endUpdate();
                            }
    
                        },
                        paths(){
                            const self = this;

                            let wndId = `entity-paths-container`;
                            let wnd = null;

                            try {
                                if( window.jsPanel.activePanels.getPanel(`jsPanel-paths`) ){
                                    //window.jsPanel.activePanels.getPanel(`jsPanel-paths`).close();
                                }
                            } catch(err){
                                
                            } finally{
                                maxWindow.winPaths('路径查询', `<div id="${wndId}" style="width:100%;height:100%;"></div>`, null, 'body');
                            }
                            
                            // 选择节点超过2个
                            if(self.model.graph.paths.ports.length > 1){
                                try{
                                            
                                    let term = _.map(self.model.graph.paths.ports,'id');
                                    let paths = fsHandler.callFsJScript('/graph/paths-by-id.js',encodeURIComponent(JSON.stringify(term))).message.data[0].graph;

                                    let rows = [];
                                    let cols = null;
                                    cols = {
                                                "path":_.concat([{data:"num",title:"序号"}],_.map(paths.pathtags,function(v){ return {data:v,title:v}}))
                                            };
                                    
                                    _.forEach(paths.paths,function(v,index){
                                        rows.push( _.merge({num:`路径${++index}`,class:"path"},v));
                                    })
                                    
                                    let node = { data: _.groupBy(rows,'class'), columns: cols};
                                    
                                    if(!_.isEmpty(node)) {
                                        let rows = node.data[_.keys(node.columns)[0]];
                                        let columns = node.columns[_.keys(node.columns)[0]];

                                        _.delay(function(){
                                            new Vue(app(rows,columns)).$mount(`#${wndId}`);
                                        },500)
                                    }
                                    
                                } catch(err){

                                }
                            }

                            let app = function(rows,columns){

                                return {
                                    delimiters: ['#{', '}#'],
                                    data:{
                                        rows: [],
                                        columns: [],
                                        options: {
                                            destroy:true,
                                            searching: false,
                                            aDataSort: true,
                                            bSort: true,
                                            bAutoWidth: true,
                                            info: false,
                                            paging:         false,
                                            aoColumnDefs: [{sDefaultContent:'', aTargets:['_all']}],
                                            stateSave: false,
                                            select: {
                                                style: 'multi',
                                            }
                                        },
                                        term: ""
                                    },
                                    template:  `<el-container>
                                                    <el-header style="height:30px;line-height:30px;background:#f7f7f7;">
                                                        <el-input v-model="term" placeholder="请输入内容"></el-input>
                                                    </el-header>
                                                    <el-main style="padding:0px;">
                                                        <table id="entity-paths-table" class="row-border hover" width="100%"></table>
                                                    </el-main>
                                                </el-container>`,
                                    created(){
                                        this.term = _.map(self.model.graph.paths.ports,'id').join(" --> ");
                                        this.rows = rows;
                                        this.columns = columns;
                                    },
                                    mounted(){
                                        
                                        let table = $('#entity-paths-table').DataTable(_.extend(
                                            this.options,{
                                                data: this.rows,
                                                columns: this.columns
                                            }));
                                            
                                        table.on( 'select', function ( e, dt, type, indexes ) {
                                            let selected = table.rows( '.selected' ).data().toArray();
                                            self.addPath(selected);
                                        } ).on( 'deselect', function ( e, dt, type, indexes ) {
                                            let selected = table.rows( '.selected' ).data().toArray();
                                            self.addPath(selected);
                                        } ); 

                                        // el-input
                                        $(".el-input__inner").css({
                                            "border": "none",
                                            "border-radius": "0px",
                                            "line-height": "30px",
                                            "height": "30px",
                                            "background":"transparent"
                                        });
                                    }
                                }

                            };

                            
                        },
                        addPath(event){
                            const self = this;
                            
                            // 过滤event
                            let paths = _.map(event,function(v){
                                return _.omit(v,['num','class']);
                            });

                            self.model.graph.graph.getModel().beginUpdate();
                            
                            try{
                               
                                self.model.graph.graph.getModel()
            
                                if(self.model.graph.paths.list.length){
                                    self.removePath();
                                }     

                                _.forEach(paths,function(v,index){
                                    // keys
                                    var keys = _.keys(v);
                                    // values
                                    var values = _.values(v);

                                    let color = _.sample(mx.global.register.graph.color);
                                    
                                    for(var i=0;i<keys.length;i++){
                                        
                                        let source = self.model.graph.graph.getModel().getCell(v[keys[i]]);
                                        let target = self.model.graph.graph.getModel().getCell(v[keys[i+1]]);
                                        if(_.isUndefined(target)){
                                            return;
                                        }

                                        let startArrow = i==0?'block':'none';
                                        let endArrow = i==keys.length - 1?'block':'none';
                                        let baseEdgeStyle = `edgeStyle=elbowEdgeStyle;orthogonalLoop=1;strokeWidth=8;dashed=1;startFill=0;endFill=0;startArrow=${startArrow};endArrow=${endArrow};orthogonal=1;elbow=vertical;`;
                                        let strokeColor = color;
                                        
                                        // 绘制路径
                                        let hasPath = self.model.graph.graph.getModel().getCell(`path${index+1}${i}`);
                                        console.log(hasPath)
                                        if(!hasPath){
                                            let path = self.model.graph.graph.insertEdge(self.model.graph.parent, `path${index+1}${i}`, `${index+1}`, source, target, baseEdgeStyle+`strokeColor=${strokeColor};`);
                                            self.model.graph.paths.list.push(path);
                                        }
                                    }
                                })

                                // Executes the layout
                                //new mxHierarchicalLayout(self.model.graph.graph).execute(self.model.graph.parent);
                                
                            }
                            finally
                            {
                                self.model.graph.graph.getModel().endUpdate();
                            }
                        },
                        removePath(){
                            const self = this;
            
                            // Cancels interactive operations
                            self.model.graph.graph.escape();
                            var cells = self.model.graph.paths.list;
                            
                            if (cells != null && cells.length > 0)
                            {
                                self.model.graph.graph.removeCells(cells, true);
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
                            
                            
                            tb.addItem('{{.i18n.Tr "creative-tools-theme"}}', `${window.ASSETS_ICON}/tools/png/design.png?type=download&issys=${window.SignedUser_IsAdmin}`,function(evt)
                            {
                                self.editIt();
    
                            },null,'tools-item');   

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

                            tb.addItem('{{.i18n.Tr "creative-tools-theme"}}', `${window.ASSETS_ICON}/tools/png/theme.png?type=download&issys=${window.SignedUser_IsAdmin}`,function(evt)
                            {
                                self.toggleGraphBg();
    
                            },null,'tools-item');

                            tb.addItem('{{.i18n.Tr "creative-tools-theme"}}', `${window.ASSETS_ICON}/tools/png/flow.png?type=download&issys=${window.SignedUser_IsAdmin}`,function(evt)
                            {
                                self.toggleGraphDash();
    
                            },null,'tools-item');
    
                            self.win.toolbars = maxWindow.winToolBars('{{.i18n.Tr "creative-tools"}}',content,[5,220],null);
    
                        },
                        toggleGraphBg(){
                            if($("#graph.geDiagramContainer").hasClass("dark")){
                                $("#graph.geDiagramContainer").removeClass("dark");
                            } else {
                                $("#graph.geDiagramContainer").addClass("dark");
                            }
                        },
                        toggleGraphDash(){
                            if($("svg").hasClass("dash")){
                                $("svg").removeClass("dash");
                            } else {
                                $("svg").addClass("dash");
                            }
                        },
                        navToggle: function(){
                            const self = this;
    
                            $("#nav").find("div").toggle(500);
                            self.win.toolbars.toggle(500);
    
                            self.initOutline();
                        },
                        editIt(){
                            let item = { 
                                            parent:URL_PARAMS_ITEM.parent, 
                                            name:URL_PARAMS_ITEM.name, 
                                            ftype:URL_PARAMS_ITEM.ftype, 
                                            lang: window.MATRIX_LANG, 
                                            attr:URL_PARAMS_ITEM.attr, 
                                            action:'edit'
                                        };

                            let url = fsHandler.genFsUrl(item,null,null);

                            window.open(url, "_parent");
                        }
                    }
                });
    
            })
        })
    }
}

let imap = new Imap();
imap.init();