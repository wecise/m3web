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
class FormDesign {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["form-design"],function() {

            $(function() {
                
                Column.prototype.clone = function() {
                    return mxUtils.clone(this);
                };
                
                // Defines the table user object
                Table.prototype.clone = function(){
                    return mxUtils.clone(this);
                };
                
            })
        })

    }

    mount(el){
        
        let main = {
            delimiters: ['${', '}'],
            template:  `<form-design ref="formDesign"></form-design>`,
            data:{
                
            }
        };
        
        this.app = new Vue(main).$mount(el);
    }

}