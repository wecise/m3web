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
class Auto {

    constructor() {
        
    }
    
    init(){
        // 集成接入
        let cfg = mx.urlParams['cfg'] ? _.attempt(JSON.parse.bind(null, decodeURIComponent(mx.urlParams['cfg']))) : null;

        _.delay(function(){
            if(cfg){ 
                _.forEach(cfg,function(v,k){
                    $(`#${k}`).hide();
                    $(`#${k}-bg`).hide();
    
                    if(k==='tabs'){
                        let i = 0;
                        _.forEach(v,function(item){
                            if(item){
                                $($("#probe-tabs-ul").children()[i]).css("display","");
                                $($("#probe-tabs-div").children()[i]).css("display","");
                            } else {
                                $($("#probe-tabs-ul").children()[i]).css("display","none");
                                $($("#probe-tabs-div").children()[i]).css("display","none");
                            }
                            i = i+1;
                        })
                        
                        $("#probe-tabs-ul > li").removeClass("active")
                        $("#probe-tabs-div > div").removeClass("active")

                        $($("#probe-tabs-ul").children()[_.indexOf(v,true)]).addClass("active")
                        $($("#probe-tabs-div").children()[_.indexOf(v,true)]).addClass("active")
                    }
                })
    
                _.delay(function(){
                    $('#content.content').addClass('content-expand');
                },1000)
            } else {
                $('#content.content').removeClass('content-expand');
            }
        },500)

        // 全局 服务器列表组件
        auto.serverListComp();

        // 组件实例化
        VueLoader.onloaded([
            "probe-tree-component",
            "auto-list-datatables-component"], function () {
            
            Vue.component("auto-view", {
                props: {
                    model: Object
                },
                template: `<div class="row">
                            <div class="col-lg-2">
                                <probe-tree-component id="auto-tree" :model="{parent:'/probe',name:'auto_tree_data.js',domain:'auto'}"></-tree-component>
                            </div>
                            <div class="col-lg-10 auto-container">
                                <h4 class="page-header"><i class="fas fa-angle-right"></i> 自动化部署</h4 class="page-header">
                                <auto-list-datatables-component :model="model" id="auto-list-table"></auto-list-datatables-component>
                            </div>
                        </div>`
            });

            $(function () {

                var appVue = new Vue({
                    delimiters: ['${', '}'],
                    el: "#app",
                    template: "#app-template",
                    data: {
                        auto: {}
                    },
                    created() {
                        let self = this;

                        eventHub.$on("PROBE-REFRESH-EVENT", self.initData);
                    },
                    mounted() {
                        let self = this;

                        self.$nextTick(function () {

                            self.init();

                            _.delay(function () {
                                self.initPlug();
                            }, 3000)
                        })
                    },
                    methods: {
                        init() {
                            let self = this;

                            self.initData(['auto']);
                        },
                        initPlug() {
                            let self = this;

                            /* toggle tab trigger Echart resize */
                            $("a[data-toggle='tab']").on("shown.bs.tab", function () {
                                eventHub.$emit("COMPONENT-REDRAW-EVENT", null);
                            })
                        },
                        initData(event) {
                            let self = this;

                            _.forEach(event, function (v) {
                                window[v] = fsHandler.callFsJScript(`/matrix/probe/probe_summary_by_${v}.js`, '');

                                if (window[v].status == 'ok') {
                                    self[v] = window[v].message;
                                } else {
                                    self[v] = [];
                                }
                            })

                        }
                    }
                })

            });
        })
    }

    // auto upload to git 
    upload(){
        let wnd = maxWindow.winProbe( `<i class="fas fa-plus-circle"></i> 上传`, `<div id="auto-add-container"></div>`, null, 'auto-container');

        let conf = fsHandler.callFsJScript("/matrix/probe/probe_summary_auto_conf.js", mx.urlParams['userid']).message;
        
        let wizard = {
            data: {
                model: {
                    file: {
                        name: null,
                        version: 1.0,
                        remark: null,
                        uploadfile: null,
                        tags: ['AUTO'],
                        servers: conf.servers,
                        command: null,
                        wnd: wnd
                    },
                    script: {
                        name: null,
                        version: 1.0,
                        remark: null,
                        uploadfile: null,
                        tags: ['SCRIPT'],
                        servers: conf.servers,
                        command: null,
                        wnd: wnd
                    },
                    handler: {
                        tagify: null
                    }
                }
            },
            created(){
                const me = this

                eventHub.$on("LAYOUT-RESIZE-EVENT",me.resize);
            },
            methods: {
                tagInput(className,container, tags){
                    const me = this

                    me.model.handler.tagify = $(me.$el).find(".tags").tagify()
                        .on("add",function(event, tagName){
                            me.model.file.tags = tagName.value;
                            me.model.script.tags = tagName.value;
                        })
                        .on("remove",function(event,tagName){
                            me.model.file.tags = tagName.value;
                            me.model.script.tags = tagName.value;
                        });

                },
                save(){
                    const me = this
                    let rtn = 0;
                    
                    rtn = scriptHandler.depotAdd(me.model.file);
                    rtn = scriptHandler.depotAdd(me.model.script);

                    if(rtn === 1){

                        alertify.confirm("是否需要部署该文件？", function (e) {
                            if (e) {
                                // user clicked "ok"
                            } else {
                                wnd.close();
                            }
                        });

                        eventHub.$emit("PROBE-REFRESH-EVENT", ['auto']);
                    }
                },
                resize(){
                    wnd.resize($(wnd.content).parent().parent().width()+20, $(wnd.content).parent().parent().height()+60 );
                },
                onFileChange(e) {
                    const me = this

                    let file = e.target.files[0];

                    me.model.file.name = _.head(file.name.split("."));

                    me.model.file.uploadfile = file;

                },
                onScriptChange(e) {
                    const me = this

                    let file = e.target.files[0];

                    me.model.script.name = _.head(file.name.split("."));

                    me.model.script.uploadfile = file;

                }
            },
            mounted(){
                const me = this

                me.$nextTick(function () {
                    mx.handleBootstrapWizards("auto-wizard");
                    me.tagInput();

                    $(me.$el).find("li").on("click",function(){
                        eventHub.$emit("COMPONENT-REDRAW-EVENT");
                    })
                })
            },
            template: `<form>
                            <div id="auto-wizard">
                                <ol>
                                    <li>
                                        上传部署文件
                                        <small>选择文件，上传到文件库。</small>
                                    </li>
                                    <li>
                                        选择部署脚本
                                        <small>选择部署脚本。</small>
                                    </li>
                                    <li>
                                        部署目标
                                        <small>如果需要部署，选择部署目标，开始部署。</small>
                                    </li>
                                </ol>

                                <div>
                                    <fieldset class="form-horizontal">
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">选择文件：</label>
                                            <div class="col-sm-10">
                                                <label for="auto-file-upload" class="custom-file-upload" style="border: 1px dashed rgb(204, 204, 204);display: inline-block;padding: 6px 12px;cursor: pointer;">
                                                    上传文件
                                                </label>
                                                <input id="auto-file-upload" type="file" @change="onFileChange" required="required" style="display:none;" />
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">文件名称：</label>
                                            <div class="col-sm-10">
                                                <input type="text" placeholder="" class="form-control" v-model="model.file.name" required="required" />
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">文件版本：</label>
                                            <div class="col-sm-10">
                                                <input type="number" placeholder="" class="form-control"  v-model="model.file.version" required="required" step="0.1"/>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">执行命令：</label>
                                            <div class="col-sm-10">
                                                <input type="text" placeholder="" class="form-control" v-model="model.file.command"/>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">文件说明：</label>
                                            <div class="col-sm-10">
                                                <textarea row="6" placeholder="" class="form-control"  v-model="model.file.remark"></textarea>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">添加标签：</label>
                                            <div class="col-sm-10"><input type="text" placeholder="" class="tags"  v-model="model.file.tags"/></div>
                                        </div>
                                        <hr/>
                                        <a class="btn btn-sm btn-primary pull-right" href="javascript:void(0);" @click="save">保存并退出</a>
                                    </fieldset>
                                </div>
                                <div>
                                    <fieldset class="form-horizontal">
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">选择脚本：</label>
                                            <div class="col-sm-10">
                                                <label for="auto-script-upload" class="custom-file-upload" style="border: 1px dashed rgb(204, 204, 204);display: inline-block;padding: 6px 12px;cursor: pointer;">
                                                    上传脚本
                                                </label>
                                                <input id="auto-script-upload" type="file" @change="onScriptChange" required="required" style="display:none;" />
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">脚本名称：</label>
                                            <div class="col-sm-10">
                                                <input type="text" placeholder="" class="form-control" v-model="model.script.name" required="required" />
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">脚本版本：</label>
                                            <div class="col-sm-10">
                                                <input type="number" placeholder="" class="form-control"  v-model="model.script.version" required="required" step="0.1"/>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">执行命令：</label>
                                            <div class="col-sm-10">
                                                <input type="text" placeholder="" class="form-control" v-model="model.script.command"/>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">脚本说明：</label>
                                            <div class="col-sm-10">
                                                <textarea row="6" placeholder="" class="form-control"  v-model="model.script.remark"></textarea>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">添加标签：</label>
                                            <div class="col-sm-10"><input type="text" placeholder="" class="tags"  v-model="model.script.tags"/></div>
                                        </div>
                                        <hr/>
                                        <a class="btn btn-sm btn-primary pull-right" href="javascript:void(0);" @click="save">保存并退出</a>
                                    </fieldset>
                                </div>
                                <div>
                                    <fieldset>
                                        <div class="row">
                                            <div class="col-md-12">
                                                <auto-base-datatable id="auto-servers-datatable" :model="model.script"></auto-base-datatable>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>

                            </div>
                        </form>`
        };

        new Vue(wizard).$mount("#auto-add-container");
    }

    deploy(event){
        
        let wnd = maxWindow.winProbe(`<i class="fas fa-plus-circle"></i> 编辑`, `<div id="auto-add-container"></div>`, null, 'auto-container');

        let conf = fsHandler.callFsJScript("/matrix/probe/probe_summary_auto_conf.js", mx.urlParams['userid']).message;

        let wizard = {
            data: {
                model: {
                    item: {
                        autos: event,
                        servers: conf.servers,
                        wnd: wnd
                    }
                }
            },
            created: function(){
                const me = this
                eventHub.$on("LAYOUT-RESIZE-EVENT",me.resize);                
            },
            methods: {
                resize:function(){
                    wnd.resize($(wnd.content).parent().parent().width()+20, $(wnd.content).parent().parent().height()+60 );
                }
            },
            mounted: function(){
                const me = this

                me.$nextTick(function () {
                    mx.handleBootstrapWizards("auto-wizard");
                    
                    $(me.$el).find("li").on("click",function(){
                        eventHub.$emit("COMPONENT-REDRAW-EVENT");
                    })
                })
            },
            template: `<form>
                            <div id="auto-wizard">
                                <ol>
                                    <li>
                                        部署目标
                                        <small>如果需要部署，选择部署目标，开始部署。</small>
                                    </li>
                                </ol>

                                <div>
                                    <fieldset>
                                        <div class="row">
                                            <div class="col-md-12">
                                                <auto-base-datatable id="auto-servers-datatable" :model="model.item"></auto-base-datatable>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>

                            </div>
                        </form>`
        };

        new Vue(wizard).$mount("#auto-add-container");
    }

    depotDeploy(model,event){

        let ifSuccess = false;

        _.forEach(model.autos,function(v){
            
            let depot = {depots: v.name, versions: v.version, hosts: new Array(event.host)};

            let rtn = scriptHandler.depotDeploy(depot);

            if(rtn === 1) {
                ifSuccess = true;
            } else {
                ifSuccess = false;
            }

            if(ifSuccess){
                eventHub.$emit("PROBE-REFRESH-EVENT", ['auto']);
                model.wnd.close();
            }
        })   
    }

    depotUnDeploy(model,event){

        alertify.confirm(`确认从服务器：${event.host} 上 解除文件：${model.name} 版本：${model.version} `, function (e) {
            if (e) {
                let ifSuccess = false;

                let depot = {depots: model.name, versions: model.version, hosts: event.host};
                
                let rtn = scriptHandler.depotUnDeploy(depot);

                if(rtn === 1) {
                    ifSuccess = true;
                } else {
                    ifSuccess = false;
                }

                if(ifSuccess){
                    eventHub.$emit("PROBE-REFRESH-EVENT", ['auto']);
                }
            } else {
                // user clicked "cancel"
            }
        });
        
    }

    update(event){
        
        let wnd = maxWindow.winProbe(`<i class="fas fa-plus-circle"></i> 编辑`, `<div id="auto-add-container"></div>`, null, 'auto-container');

        let conf = fsHandler.callFsJScript("/matrix/probe/probe_summary_auto_conf.js", mx.urlParams['userid']).message;

        let node = _.cloneDeep(event);

        let wizard = {
            delimiters: ['#{', '}#'],
            data: {
                model: {
                    item: {
                        name: node.name,
                        version: node.version,
                        command: null,
                        remark: node.remark,
                        uploadfile: null,
                        tags: node.tags,
                        servers: conf.servers,
                        wnd: wnd
                    },
                    handler: {
                        tagify: null
                    }
                }
            },
            created: function(){
                eventHub.$on("LAYOUT-RESIZE-EVENT",this.resize);
            },
            methods: {
                tagInput: function(className,container, tags){
                    const me = this

                    me.model.handler.tagify = $(me.$el).find(".tags").tagify()
                        .on("add",function(event, tagName){
                            me.model.item.tags = tagName.value;
                        })
                        .on("remove",function(event,tagName){
                            me.model.item.tags = tagName.value;
                        });

                },
                save: function(){
                    const me = this;

                    let model = _.omit(me.model.item,['servers','wnd']);

                    // 文件内容没有变化, 版本不变
                    if(!me.model.item.uploadfile){
                        model = _.omit(me.model.item,['uploadfile']);
                    }

                    let rtn = scriptHandler.depotUpdate(model);

                    if(rtn === 1){

                        alertify.confirm("是否需要部署该文件？", function (e) {
                            if (e) {
                                // user clicked "ok"
                            } else {
                                wnd.close();
                            }
                        });

                        _.delay(function(){
                            eventHub.$emit("PROBE-REFRESH-EVENT", ['auto']);
                        },500);
                    }
                },
                resize:function(){
                    wnd.resize($(wnd.content).parent().parent().width()+20, $(wnd.content).parent().parent().height()+60 );
                },
                onFileChange(e) {
                    const me = this

                    let file = e.target.files[0];
                    
                    me.model.item.uploadfile = file;

                }
            },
            mounted: function(){
                const me = this

                me.$nextTick(function () {
                    mx.handleBootstrapWizards("auto-wizard");
                    me.tagInput();

                    $(me.$el).find("li").on("click",function(){
                        eventHub.$emit("COMPONENT-REDRAW-EVENT");
                    })
                })
            },
            template: `<form>
                            <div id="auto-wizard">
                                <ol>
                                    <li>
                                        更新文件及属性
                                        <small>文件内容如有更新，请重新上传文件。</small>
                                    </li>
                                    <!--li>
                                        部署目标
                                        <small>如果需要部署，选择部署目标，开始部署。</small>
                                    </li-->
                                </ol>

                                <div>
                                    <fieldset class="form-horizontal">
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">选择文件：</label>
                                            <div class="col-sm-10">
                                                <div v-if="model.item.uploadfile">
                                                    <label for="auto-upload" class="custom-file-upload" style="border: 1px dashed rgb(204, 204, 204);display: inline-block;padding: 6px 12px;cursor: pointer;">
                                                        <p>文件名称：#{model.item.uploadfile.name}#</p>
                                                        <p>更新时间：#{moment(model.item.uploadfile.lastModified).format("LLL")}#</p>
                                                        <p>文件大小：#{mx.bytesToSize(model.item.uploadfile.size)}#</p>

                                                        <p style="color:blue;">文件发生变化，建议递增版本号！</p>
                                                    </label>
                                                </div>
                                                <div v-else>
                                                    <label for="auto-upload" class="custom-file-upload" style="border: 1px dashed rgb(204, 204, 204);display: inline-block;padding: 6px 12px;cursor: pointer;">
                                                        #{model.item.name}#  【文件内容如有更新，请重新上传文件】
                                                    </label>
                                                </div>
                                                <input id="auto-upload" type="file" @change="onFileChange" required="required" style="display:none;" />
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">文件名称：</label>
                                            <div class="col-sm-10">
                                                <input type="text" placeholder="" class="form-control" v-model="model.item.name" required="required"  disabled="false"/>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">执行命令：</label>
                                            <div class="col-sm-10">
                                                <input type="text" placeholder="" class="form-control" v-model="model.item.command" required="required"  disabled="false"/>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">文件版本：</label>
                                            <div class="col-sm-10">
                                                <input type="number" placeholder="1.0" class="form-control"  v-model="model.item.version" required="required" step="0.1"/>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">文件说明：</label>
                                            <div class="col-sm-10">
                                                <textarea row="6" placeholder="" class="form-control"  v-model="model.item.remark"></textarea>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">添加标签：</label>
                                            <div class="col-sm-10">
                                                <input type="text" placeholder="" class="tags"  v-model="model.item.tags"/>
                                            </div>
                                        </div>
                                        <hr/>
                                        <a class="btn btn-sm btn-primary pull-right" href="javascript:void(0);" @click="save">保存并退出</a>
                                    </fieldset>
                                </div>
                                <!--div>
                                    <fieldset>
                                        <div class="row">
                                            <div class="col-md-12">
                                                <auto-base-datatable id="auto-servers-datatable" :model="model.item"></auto-base-datatable>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div-->

                            </div>
                        </form>`
        };

        new Vue(wizard).$mount("#auto-add-container");
    }

    delete(event){
        
        let selected = _.map(event,'name');

        alertify.confirm(`确认删除：${selected.join(",")}`, function (e) {
            if (e) {
                if(selected.length > 0) {
                    _.forEach(selected, function(v){
                        scriptHandler.depotDelete(v);
                    })

                    eventHub.$emit("PROBE-REFRESH-EVENT", ['auto']);
                } else {
                    alertify.log("请选择文件。")
                    return false;
                }

            } else {
                // user clicked "cancel"
            }
        });

    }

    refresh(){
        eventHub.$emit("PROBE-REFRESH-EVENT", ['auto']);
    }

    export(){

    }

    import(){

    }

    detail(id,datatable){
        
        // Array to track the ids of the details displayed rows
        let detailRows = [];
        
        $("#"+id).on('click', 'tr td.details-control', function () {
           
            var tr = $(this).closest('tr');
            var row = datatable.row( tr );
            var idx = $.inArray( tr.attr('id'), detailRows );

            if ( row.child.isShown() ) {
                tr.removeClass( 'details' );
                row.child.hide();

                // Remove from the 'open' array
                detailRows.splice( idx, 1 );
                
                // 按钮状态
                tr.find(' i').removeClass("fa-angle-down")
                tr.find(' i').addClass("fa-angle-right")
            }
            else {
                tr.addClass( 'details' );
                row.child( auto.format(row.data()) ).show();
                
                // Add to the 'open' array
                if ( idx === -1 ) {
                    detailRows.push( tr.attr('id') );
                }

                // 按钮状态
                tr.find(' i').removeClass("fa-angle-right")
                tr.find(' i').addClass("fa-angle-down")
            }
        } );

        // On each draw, loop over the `detailRows` array and show any child rows
        datatable.on( 'draw', function () {
            $.each( detailRows, function ( i, id ) {
                $('#'+id+' td.details-control').trigger( 'click' );
            } );
        } );
    }

    format(event){
        
        try {
            
            let id = objectHash.sha1(event);

            let renderChildDiv = function(){
                if($(`#tr_${id}`).is(':visible')){
                    new Vue({
                        delimiters: ['#{', '}#'],
                        data: {
                            model:event
                        },
                        template:   `<ul style="width: 100%;padding-left: 0;list-style: none;">
                                        <li style="float: left;width: 16em;height: 170px;padding: 5px;font-size: 12px;line-height: 2.4;text-align: center;border-right: 1px solid rgb(221, 221, 221);"
                                            v-for="item in model.servers">
                                            <img :src="'/fs/assets/images/entity/png/'+item.os+'.png?issys=true&type=download'" style="width:64px;">
                                            <p>#{item.entityId}#</p>
                                            <p><progress :value="Number(item.cpu_usedpercent)" max="100"></progress> <b>#{item.cpu_usedpercent}#%/CPU</b></p>
                                            <p><progress :value="Number(item.autos)" max="100"></progress> <b>#{item.autos}#个/文件数量</b></p>
                                            <a href="javascript:void(0);" class="btn btn-xs btn-white" style="position: relative;right: -80px;top: -185px;" @click="unDeploy(item)"><i class="fas fa-trash-alt"></i></a>
                                        </li>
                                    </ul>`,
                        methods: {
                            unDeploy(item){
                                auto.depotUnDeploy(this.model,item);
                            }
                        }
                    }).$mount(`#tr_${id}`);
                  } else {
                    setTimeout(renderChildDiv, 50);
                  }
            }

            return $(`<div id="tr_${id}"></div>`).ready(renderChildDiv);

        } catch(err){

        }
        
    }

    serverListComp(){

        return Vue.component("auto-base-datatable", {
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template:`<table :id="id" class="display" style="width:100%;"></table>`,
            data: function(){
                return {
                    datatable: null
                }
            },
            created: function(){
                const me = this

                eventHub.$on("COMPONENT-REDRAW-EVENT", me.redraw);
            },
            watch: {
                'model.servers.dataset': {
                    handler: function(val,oldVal){
                        const me = this

                        if(val === oldVal) return false;

                        if(me.datatable){
                            me.datatable.destroy();
                            $(`#${me.id}`).empty();
                            me.init();
                        }
                    },
                    deep:true
                }

            },
            mounted: function () {
                const me = this

                me.$nextTick(function () {

                    me.init();
                    me.initPlug();
                })
            },
            computed: {
                _columns: function(){
                    const me = this

                    let _cols = _.map(me.model.servers.columns,function(v,k){

                        if(!v.render){
                            return v;
                        } else {
                            v.render = eval(v.render);
                            return v;
                        }

                    });

                    return _cols;
                }
            },
            methods: {
                init: function () {
                    const me = this

                    me.datatable = $("#" + me.id).DataTable(_.extend({
                        data: me.model.servers.dataset,
                        columns: me._columns,
                        //stripeClasses: [],
                        responsive: false,
                        searching: false,
                        aDataSort: true,
                        bSort: true,
                        bAutoWidth: true,
                        rowReorder: false,
                        colReorder: false,
                        paging: false,
                        info: true,
                        scrollX: true,
                        scrollY: '300px',
                        scrollCollapse: true,
                        aoColumnDefs: [{sDefaultContent: '', aTargets: ['_all']}],
                        language: {
                            "sProcessing": "处理中...",
                            "sLengthMenu": "显示 _MENU_ 项结果",
                            "sZeroRecords": "没有匹配结果",
                            "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                            "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
                            "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                            "sInfoPostFix": "",
                            "sSearch": "过滤:",
                            "sUrl": "",
                            "sEmptyTable": "表中数据为空",
                            "sLoadingRecords": "载入中...",
                            "sInfoThousands": ",",
                            "oPaginate": {
                                "sFirst": "首页",
                                "sPrevious": "上页",
                                "sNext": "下页",
                                "sLast": "末页"
                            },
                            "oAria": {
                                "sSortAscending": ": 以升序排列此列",
                                "sSortDescending": ": 以降序排列此列"
                            },
                            buttons: {
                                copyTitle: '已拷贝到剪切板',
                                copyKeys: '已拷贝',
                                copySuccess: {
                                    _: '已拷贝 %d 项',
                                    1: '1 已拷贝'
                                }
                            },
                            select: {
                                rows: {
                                    _: "已拷贝 %d 项"
                                }
                            }
                        },
                        select: {
                            style: 'multi',
                            selector: 'td:first-child'

                        },
                        lengthChange: true,
                        stateSave: false,
                        dom: {
                            button: {
                                tag: 'button',
                                className: 'datatables-toolbars-button'
                            }
                        },
                        dom: 'Bfrtip',
                        buttons: {
                            dom: {
                                button: {
                                    tag: 'button'
                                }
                            },
                            buttons: [
                                {
                                    text: '下发到服务器',
                                    action: function (e, dt, node, config) {
                                        auto.depotDeploy(me.model, dt.row( { selected: true } ).data());
                                    },
                                    enabled: false,
                                    className: 'btn btn-sm btn-success'
                                },
                                {
                                    text: '取消下发',
                                    action: function (e, dt, node, config) {

                                    },
                                    enabled: false,
                                    className: 'btn btn-sm btn-default'
                                },
                                // {
                                //     text: '查看',
                                //     action: function (e, dt, node, config) {

                                //     },
                                //     enabled: false,
                                //     className: 'btn btn-sm btn-default'
                                // }
                            ]
                        },
                        initComplete: function (event, settings, json) {

                        },
                        rowCallback: function( row, data ) {
                            console.log(me.model,row,data)
                        }
                    }, me.model.servers.options)).columns.adjust().draw();

                },
                initPlug: function(){
                    const me = this

                    // Buttons enable/disable
                    me.datatable.on( 'select deselect', function () {
                        let selectedRows = me.datatable.rows( { selected: true } ).count();

                        me.datatable.buttons( [0] ).enable( selectedRows > 0 );
                    } );
                },
                redraw: function () {
                    const me = this

                    _.delay(function(){
                        me.datatable.columns.adjust().draw();
                    },500);
                }
            }
        });
    }

}

let auto = new Auto();
auto.init();