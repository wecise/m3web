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
class FormCard {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["form-card-component"],function() {

            $(function() {

                this.app = new Vue({
                    delimiters: ['${', '}'],
                    template:  `<form-card-component :term="term" cHeight="20"></form-card-component>`,
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