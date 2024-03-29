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

                Vue.component('release-tree-view',{
                    delimiters: ['${', '}'],
                    props:{
                        id: String
                    },
                    template: `<fs-tree-component :id="id+'-tree'" :root="root" :checkEnable="false" :contextMenu="null"></fs-tree-component>`,
                    data(){
                        return {
                            root: "/app",
                        }
                    },
                    mounted: function() {
                        const self = this;

                        self.$nextTick(function() {

                        })
                    }
                });

                Vue.component('release-console-view',{
                    delimiters: ['${', '}'],
                    props:{
                        id: String
                    },
                    template: `<fs-view-component :id="id+'-content'" :root="root" defaultView="list-view" rootName="我的应用"></fs-view-component>`,
                    data(){
                        return {
                            model: [],
                            root: "/app",
                            toggle: {
                                left: true
                            }
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

                                omdbHandler.fetchData(_item.id + ' | tags +' + event.item);

                            });

                            $(".tagsLabel").on('itemRemoved', function(event) {

                                let _id = $(this).data("index");
                                let _item = _.find(self.model.list,{id:_id});

                                omdbHandler.fetchData(_item.id + ' | tags -' + event.item);

                            });
                        }
                    }
                });

                let appApp = new Vue({
                    delimiters: ['#{', '}#'],
                    data: {
                        split1: 0.2,
                    },
                    template: `<el-container style="height: calc(100vh - 80px);padding:0px;background-color:#ffffff;">
                                    <el-main>
                                        <Split v-model="split1">
                                            <div slot="left" style="height: 100%;overflow: auto;">
                                                <release-tree-view id="release-tree-view"></release-tree-view>
                                            </div>
                                            <div slot="right">
                                                <release-console-view id="release-console-view"></release-console-view>
                                            </div>
                                        </Split>
                                    </el-main> 
                                </el-container>`,
                    created: function(){
                        const self = this;
                    },
                    mounted: function() {
                        const self = this;

                        self.$nextTick(function() {
                            setTimeout(function () {
                                self.init();
                                self.initPlugin();
                            });
                        })
                    },
                    methods: {
                        init: function(){
                            const self = this;


                        },
                        initPlugin: function(){
                            let self = this;

                        }
                    }
                }).$mount("#app");

            })

        })

    }
}

let release = new Release();
release.init();