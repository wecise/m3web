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
class Notes {

    constructor() {

    }

    init() {

        VueLoader.onloaded(["fs-tree-component",
            "fs-view-component",
            "fs-md-editor-component",
            "fs-output-component",
            "fs-datatable-component",
            "ai-robot-component"
        ],function() {

            $(function() {

                let treeVue = {
                    delimiters: ['${', '}'],
                    el: '#layout-tree-template',
                    template: `<fs-tree-component id="notes-fs-tree" :root="root" :checkEnable="false" :contextMenu="null"></fs-tree-component>`,
                    data: {
                        root: "/notes",
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
                    template: `<fs-view-component id="notes-fs-view" :root="root" defaultView="note-view"></fs-view-component>`,
                    data: {
                        model: [],
                        root: "/notes",
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

                        }
                    },
                    methods: {
                        init: function() {
                            let self = this;

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

let notes = new Notes();
notes.init();