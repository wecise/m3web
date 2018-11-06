var toolbar = {
    probe: {
        probe: {
            name: {
                name: "标签", 
                type: 'text', 
                value: "", 
                icon: "fas fa-tag"
            }
        },
        policy: {
            add: {
                name: "添加", 
                icon: "fas fa-plus"
            },
            delete: {
                name: "删除", 
                icon: "fas fa-trash",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            },
            export: {
                name: "导出",
                icon: "fas fa-file-export",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            },
            load: {
                name: "导入", 
                icon: "fas fa-retweet",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            },
            tags: {
                name: "标签", 
                type: 'text', 
                value: "", 
                icon: "fas fa-tags",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            }
        },
        script: {
            add: {
                name: "添加", 
                icon: "fas fa-plus"
            },
            delete: {
                name: "删除", 
                icon: "fas fa-trash",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            },
            export: {
                name: "导出",
                icon: "fas fa-file-export",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            },
            load: {
                name: "导入", 
                icon: "fas fa-retweet",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            },
            tags: {
                name: "标签", 
                type: 'text', 
                value: "", 
                icon: "fas fa-tags",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            }
        },
        log: {
            add: {
                name: "添加", 
                icon: "fas fa-plus"
            },
            delete: {
                name: "删除", 
                icon: "fas fa-trash",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            },
            export: {
                name: "导出",
                icon: "fas fa-file-export",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            },
            load: {
                name: "导入", 
                icon: "fas fa-retweet",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            },
            tags: {
                name: "标签", 
                type: 'text', 
                value: "", 
                icon: "fas fa-tags",
                events: {
                    keyup: function(e) {
                        // add some fancy key handling here?
                        window.console && console.log('key: '+ e.keyCode); 
                    }
                }
            }
        }
    }
};

OUTPUT = toolbar;