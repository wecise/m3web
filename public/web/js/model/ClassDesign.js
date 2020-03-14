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
class ClassDesign {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["omdb-class-design"],function() {

            $(function() {
                
                
            })
        })

    }

    mount(el){
        
        let main = {
            delimiters: ['${', '}'],
            template:  `<omdb-class-design ref="classDesign"></omdb-class-design>`,
            data:{
                
            }
        };
        
        this.app = new Vue(main).$mount(el);
    }

}