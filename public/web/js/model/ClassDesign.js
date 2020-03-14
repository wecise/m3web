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
                
                // Defines the column user object
                function Column(name){
                    this.name = name;
                };

                Column.prototype.ftype = 'varchar';

                Column.prototype.title = '';
                
                Column.prototype.iskey = false;
                
                Column.prototype.isindex = false;
                
                Column.prototype.clone = function() {
                    return mxUtils.clone(this);
                };
                
                // Defines the table user object
                function Table(name){
                    this.name = name;
                };
                Table.prototype.clone = function(){
                    return mxUtils.clone(this);
                };
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