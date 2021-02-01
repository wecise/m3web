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
class Form {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["form-component",
                            "mx-tag",
                            "mx-tag-tree"],function() {

            $(function() {

                this.app = new Vue({
                    delimiters: ['${', '}'],
                    template:  `<form-component :term="term" cHeight="20"></form-component>`,
                    data: {
                        term: ""
                    },
                    created(){
                        if(mx.urlParams['id']){
                            this.term = decodeURIComponent(mx.urlParams['id']);
                        }
                    },
                    mounted() {
                        
                    },
                    methods: {
                        init(){
                            
                        }
                    }
                }).$mount("#app");

            })

        })

    }

}