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
class Release {

    constructor() {

    }

    init() {

        VueLoader.onloaded(["fs-tree-component",
                        "fs-view-component",
                        "fs-editor-component",
                        "fs-output-component",
                        "fs-datatable-component",
                        "ai-robot-component"
                        ],function() {

        $(function() {

            "use strict";

            let treeVue = {
                delimiters: ['${', '}'],
                el: '#layout-tree-template',
                template: `<fs-tree-component id="file-fs-tree" :root="root" :checkEnable="false" :contextMenu="null"></fs-tree-component>`,
                data: {
                    root: "/app",
                },
                mounted: function() {
                    let self = this;

                    self.$nextTick(function() {

                    })
                }
            };

            let consoleVue = {
                delimiters: ['${', '}'],
                el: '#layout-console-template',
                template: `<fs-view-component id="file-fs-view" :root="root" defaultView="list-view" rootName="我的应用"></fs-view-component>`,
                data: {
                    model: [],
                    root: "/app",
                    toggle: {
                        left: true
                    }
                },
                created: function(){
                    let self = this;

                },
                mounted: function() {
                    let self = this;

                    self.$nextTick(function() {
                        self.init();
                    })
                },
                watch: {
                    model: function(newValue, oldValue) {
                        let self = this;

                        if (!_.isEqual(newValue, oldValue)) {
                            self.refresh();
                        }
                    }
                },
                methods: {
                    init: function() {
                        let self = this;

                    },
                    newModal: function() {
                        let self = this;
                        selectedTemplate = $(this).data("id");

                        var modal = $("#addDashBoardModal");
                        modal.modal("show");
                        //modal.find('#name').val(selectedTemplate + "_" + Math.floor(_.now()/1000));
                        modal.find('#title').val('');
                        modal.find('#tags').selectpicker('val', selectedTemplate);

                        $("#tags").tagsinput({
                            tagClass: function(item) {

                                if (item.indexOf("事件") > -1 || item.indexOf("event") > -1) {
                                    return 'label label-danger label-important';
                                } else if (item.indexOf("性能") > -1 || item.indexOf("performance") > -1) {
                                    return 'label label-warning';
                                } else if (item.indexOf("日志") > -1 || item.indexOf("log") > -1 || item.indexOf("蓝色") > -1) {
                                    return 'label label-primary';
                                } else if (item.indexOf("作业") > -1 || item.indexOf("job") > -1 || item.indexOf("绿色") > -1) {
                                    return 'label label-success';
                                } else if (item.indexOf("黑色") > -1) {
                                    return 'label label-default';
                                } else {
                                    return 'label label-default';
                                }
                            },
                        })
                    },
                    add: function() {
                        let self = this;
                        var modal = $("#addDashBoardModal");
                        var name = "dashboard_" + _.now(); //modal.find('#name').val();
                        var title = modal.find('#title').val();
                        if (_.isEmpty(title)) {
                            swal("地图标题不能空！", "", "warning");
                            modal.find('#title').setFocus();
                            return false;
                        }
                        var tags = modal.find("#tags").tagsinput('items');
                        var ispublic = $("#ispublic input:radio:checked").val();
                        var skin = $('input[name=radiooptions]:checked').val();
                        var data = new Object();

                        data.class = '/matrix/itmap';
                        data.name = name;
                        data.title = title;
                        data.tag = {
                            "_all": JSON.stringify(tags)
                        };
                        data.star = 0;
                        data.username = '{{.SignedUser.UserName}}';
                        data.ispublic = ispublic;
                        data.portlet = null;
                        data.theme = new Array(JSON.stringify(theme[skin]));

                        jQuery.ajax({
                            url: '/mxobject/actiontoclass',
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                data: JSON.stringify(data),
                                ctype: "insert"
                            },
                            beforeSend: function(xhr) {
                            },
                            complete: function(xhr, textStatus) {
                            },
                            success: function(data, textStatus, xhr) {
                                modal.modal("hide");
                                _.delay(function() {
                                    self.load();
                                }, 200);
                            },
                            error: function(xhr, textStatus, errorThrown) {
                            }
                        })
                    },
                    remove: function(name) {
                        let self = this;
                        var param = `#/matrix/filesystem: | name=` + name + ` | delete`;

                        swal({
                            title: name,
                            text: "确定要删除该地图吗?",
                            type: "warning",
                            showCancelButton: true,
                            closeOnConfirm: false,
                            cancelButtonText: "取消",
                            confirmButtonText: "删除",
                            confirmButtonColor: "#ff0000"
                        }, function() {

                            jQuery.ajax({
                                url: '/mxobject/search',
                                type: 'POST',
                                dataType: 'json',
                                data: {
                                    cond: param
                                },
                                beforeSend: function(xhr) {
                                },
                                complete: function(xhr, textStatus) {
                                },
                                success: function(data, textStatus, xhr) {

                                    if (data.status == "ok") {
                                        _.delay(function() {
                                            self.load();
                                        }, 200);
                                        swal("删除成功！", "", "success");
                                    } else {
                                        swal("删除失败！", data.message, "warning");
                                    }
                                },
                                error: function(xhr, textStatus, errorThrown) {
                                }
                            });

                        })
                    },
                    refresh: function() {
                        let self = this;

                        $(".tagsLabel").tagsinput({
                            tagClass: function(item) {
                                return _.sample(['label label-success']);//, 'label label-default', 'label label-primary', 'label label-warning', 'label label-danger label-important']);
                            }
                        });

                        $(".tagsLabel").on('itemAdded', function(event) {

                            let _id = $(this).data("index");
                            let _item = _.find(self.model.list,{id:_id});

                            fetchData(_item.id + ' | tags +' + event.item);

                        });

                        $(".tagsLabel").on('itemRemoved', function(event) {

                            let _id = $(this).data("index");
                            let _item = _.find(self.model.list,{id:_id});

                            fetchData(_item.id + ' | tags -' + event.item);

                        });
                    }
                }
            };

            let appApp = new Vue({
                delimiters: ['${', '}'],
                el: '#app',
                data: {
                    config: {
                        settings:{
                            showPopoutIcon: false,
                            showCloseIcon: false,
                            hasHeaders: false,
                        },
                        content: [{
                            type: 'row',
                            content:[
                                {
                                    type: 'stack',
                                    width: 15,
                                    content:[{
                                        type: 'component',
                                        componentName: 'layoutComponent',
                                        title:'我的文件',
                                        isClosable: false,
                                        componentState: {
                                            id: 'layout-tree',
                                            templateId: 'layout-tree-template'
                                        }
                                    }]
                                },
                                {
                                    type: 'column',
                                    content:[{
                                        type: 'component',
                                        componentName: 'layoutComponent',
                                        title:'内容',
                                        componentState: {
                                            id: 'layout-console',
                                            templateId: 'layout-console-template'
                                        }
                                    }]
                                }
                            ]
                        }],
                        layout: null
                    }

                },
                created: function(){
                    let self = this;

                    eventHub.$on("LAYOUT-RESIZE-EVENT",self.resizeLayout);
                },
                mounted: function() {
                    let self = this;

                    self.$nextTick(function() {
                        setTimeout(function () {
                            self.init();
                            self.initPlugin();
                        });
                    })
                },
                methods: {
                    init: function(){
                        let self = this;

                        //var savedState = localStorage.getItem('savedState');
                        //self.config = savedState !== null ? JSON.parse(savedState) : self.config;

                        self.layout = new GoldenLayout(self.config, self.$el);

                        self.layout.registerComponent('layoutComponent', function (container, state) {
                            var html = "<div id=\"" + state.templateId + "\">" + $('#' + state.templateId).html() + "</div>";
                            container.getElement().html(html);

                            setTimeout(function(){
                                if(state.id == 'layout-tree'){
                                    new Vue(treeVue);
                                } else if(state.id == 'layout-console'){
                                    new Vue(consoleVue);
                                } else if(state.id == 'layout-output'){
                                    //new Vue(queryOutput);
                                }
                            })
                        });
                        //
                        //	Save state in local storage
                        //
                        self.layout.on('stateChanged', function () {
                            var state = JSON.stringify(self.layout.toConfig());
                            localStorage.setItem('savedState', state);
                        });
                        //  Initialize GL
                        self.layout.init();

                        //  Update GL on window resize
                        window.addEventListener('resize', function () { self.layout.updateSize(); });

                    },
                    initPlugin: function(){
                        let self = this;

                    },
                    resetLayout: function () {
                        localStorage.removeItem('savedState');
                        window.location.reload(true);
                    },
                    resizeLayout: function(){
                        let self = this;

                        self.layout.updateSize();
                    }
                }
            });

        })

    })

    }
}

let release = new Release();
release.init();