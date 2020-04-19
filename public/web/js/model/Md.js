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
        this.app = null;
    }

    init() {

        VueLoader.onloaded([
                        "ai-robot-component",
                        "md-editor-component"
                        ],function() {

            $(function() {

                mxMd.app = new Vue({
                    delimiters: ['${', '}'],
                    data:{
                        model:{}
                    },
                    template:   `<md-editor-component :model="model"></md-editor-component>`,
                    created(){
                        try{
                            if(!_.isEmpty(mx.urlParams['item'])){
                                let term = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['item']))));
                                this.model = {item:term, content:fsHandler.fsContent(term.parent, term.name)};
                            }
                        }catch(err){

                        }
                    },
                    mounted() {
                        
                    }
                }).$mount("#app");

            })

        })

    }

}

let mxMd = new Md();
mxMd.init();