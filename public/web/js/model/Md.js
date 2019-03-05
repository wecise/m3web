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
class Md {

    constructor() {

    }

    init() {
        VueLoader.onloaded([],function() {

            const URL_PARAMS_ITEM = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['item']))));
            const URL_PARAMS_CFG = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['cfg']))));

            let init = function(){

                _.forEach(URL_PARAMS_CFG,function(v,k){
                    if(!v){
                        //$(`#${k}`).hide();
                    }
                })

            }();

            $(function() {

                let appVue = new Vue({
                    delimiters: ['${', '}'],
                    el: '#app',
                    template: '#app-template',
                    data: {
                        model: {
                            content: null
                        }
                    },
                    mounted: function() {
                        let self = this;

                        self.$nextTick(function() {
                            self.init();
                        })
                    },
                    created: function() {
                        let self = this;


                    },
                    methods: {
                        init: function(){
                            let self = this;

                            let rtn = fsHandler.fsContent(URL_PARAMS_ITEM.parent,URL_PARAMS_ITEM.name);
                            self.model.content = marked(rtn, { sanitize: true });
                        }
                    }
                });


            })
        })
    }
}

let md = new Md();
md.init();