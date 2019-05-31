require.config({
    paths: {
        "jQuery": "jquery/jquery-3.3.1.min.js",
        "jspanel": "jsPanel/jquery.jspanel.min.js",
        "jqueryui": "jquery-ui/1.12.1/jquery-ui.min.js",
        "bootstrap": "/web/css/dist/js/bootstrap.min.js",
	
        "vue": "/web/vendor/vue/2.6.8/dist/vue.min.js",
        "vue.loader": "/web/vendor/vueloader/vue.loader.min.js",
	
        "index": "/web/vendor/element/2.6.1/dist/index.js",
	
        "bootstrap-select": "/web/vendor/bootstrap-select/dist/js/bootstrap-select.min.js",
	
        "bootstrap-tagsinput": "/web/vendor/bootstrap-tagsinput/dist/bootstrap-tagsinput.js",

        "lodash": "/web/vendor/lodash/dist/lodash.min.js",	
	
        "jquery.mark": "/web/vendor/mark/dist/jquery.mark.min.js",
	
        "moment": "/web/vendor/moment/min/moment.min.js",
        "moment-with-locales": "/web/vendor/moment/min/moment-with-locales.min.js",
	
        "flatpickr": "/web/vendor/flatpickr/dist/flatpickr.min.js",
        "zh": "/web/vendor/flatpickr/dist/l10n/zh.js",
	
        "jquery.ztree.core": "/web/vendor/zTree/js/jquery.ztree.core-3.5.js",
        "jquery.ztree.excheck": "/web/vendor/zTree/js/jquery.ztree.excheck-3.5.js",
        "jquery.ztree.exedit": "/web/vendor/zTree/js/jquery.ztree.exedit-3.5.js",
	
        "later": "/web/vendor/later/later.js",
	
        "localforage": "/web/vendor/localForage/dist/localforage.min.js",
	
        "ace": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/ace.js",
        "ext-language_tools": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/ext-language_tools.js",
        "ext-split": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/ext-split.js",
        "ext-settings_menu": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/ext-settings_menu.js",
        "ext-statusbar": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/ext-statusbar.js",
        "theme-tomorrow": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/theme-tomorrow.js",
        "mode-lua": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/mode-lua.js",
        "lua": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/snippets/lua.js",
        "mode-mql": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/mode-mql.js",
        "mql": "/web/vendor/ace-builds-1.4.2/src-min-noconflict/snippets/mql.js",
	
        "object_hash": "/web/vendor/object-hash/dist/object_hash.js",
	
        "goldenlayout": "/web/vendor/golden-layout/dist/goldenlayout.min.js",

        "alertify": "/web/vendor/alertifyjs/lib/alertify.js",

        "tagify.polyfills": "/web/vendor/tagify/dist/tagify.polyfills.js",
        "tagify": "/web/vendor/tagify/dist/tagify.js",
        "jQuery.tagify": "/web/vendor/tagify/dist/jQuery.tagify.js",
	
        "d3": "/web/vendor/d3/d3.min.js",
	
        "cfg": "/web/js/cfg.js",
        "app": "/web/js/app.js",
        "ContextMenu": "/web/js/model/ContextMenu.js",
        "Matrix": "/web/js/model/Matrix.js",
        "SideBar": "/web/js/model/SideBar.js",
        "Window": "/web/js/model/Window.js",
        "VueHub": "/web/js/model/VueHub.js",

        "AppContextHandler": "/web/js/handler/AppContextHandler.js",
        "JobHandler": "/web/js/handler/JobHandler.js",
        "LicenseHandler": "/web/js/handler/LicenseHandler.js",
        "FsHandler": "/web/js/handler/FsHandler.js",
        "OmdbHandler": "/web/js/handler/OmdbHandler.js",
        "RuleHandler": "/web/js/handler/RuleHandler.js",
        "GroupHandler": "/web/js/handler/GroupHandler.js",
        "TagHandler": "/web/js/handler/TagHandler.js",
        "UserHandler": "/web/js/handler/UserHandler.js",

        "h5utils": "/web/vendor/h5utils/h5utils.js",
        
        "defiant": "/web/vendor/defiantjs/defiant.min.js",
        
        "jquery.ui.position": "/web/vendor/jquery-contextmenu/dist/jquery.ui.position.js",
        "jquery.contextMenu": "/web/vendor/jquery-contextmenu/dist/jquery.contextMenu.js",

        "gauge": "/web/vendor/gauge/gauge.min.js",

        "clipboard": "/web/vendor/clipboard/dist/clipboard.min.js",

        "vis": "/web/vendor/vis/dist/vis.js",

        "bwizard": "/web/vendor/bootstrap-wizard/js/bwizard.js",

        "jquery.dataTables": "/web/vendor/DataTables/DataTables-1.10.16/js/jquery.dataTables.min.js",
        "dataTables.select": "/web/vendor/DataTables/Select-1.2.5/js/dataTables.select.min.js",
        "dataTables.buttons": "/web/vendor/DataTables/Buttons-1.5.1/js/dataTables.buttons.min.js",
        "buttons.colVis": "/web/vendor/DataTables/Buttons-1.5.1/js/buttons.colVis.min.js",
        "buttons.html5": "/web/vendor/DataTables/Buttons-1.5.1/js/buttons.html5.min.js",
        "dataTables.checkboxes": "/web/vendor/DataTables/dataTables.checkboxes.min.js",

        "jszip": "/web/vendor/jszip/dist/jszip.min.js",
        "FileSaver": "/web/vendor/jszip/vendor/FileSaver.js",

        "pace": "/web/vendor/pace/pace.min.js",

        "bootstrap-editable": "/web/vendor/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.min.js",

        "marked": "/web/vendor/marked/marked.min.js",

        "js-search": "/web/vendor/js-search/js-search.min.js"

    },
    shim: {
        "jqueryui": {
            deps: ['jQuery']
        },
        "jQuery": {
            exports: 'jQuery'
        }
    }
});