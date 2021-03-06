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
class VueHub {

    constructor() {
        
    }

    // 全局 Event Hub For Vue
    hub() {
        return new Vue();
    }

    // 通过选项创建 VueI18n 实例
    lang() {
        
        try{

            let cache = localStorage.getItem("MATRIX-LANG-LIST");

            if( cache !== null ){
                
                return new VueI18n({
                    locale: window.MATRIX_LANG,
                    messages: JSON.parse(cache)
                });    
                
            } else {

                fsHandler.callFsJScriptAsync("/matrix/lang/getLangList.js",null).then( (rtn)=>{
                    
                    localStorage.setItem("MATRIX-LANG-LIST", JSON.stringify(rtn.message));

                    return new VueI18n({
                        locale: window.MATRIX_LANG,
                        messages: rtn.message
                    });
                } );
                
            }
            
        } catch(err){
            return null;
        }

    }

    // 当前用户权限 
    auth(){
        let rtn = {};
        try {
            let signedUser = fsHandler.callFsJScript("/matrix/user/signedUser.js").message;
            _.extend( rtn, {isAdmin: window.SignedUser_UserName === 'admin', signedUser: signedUser} );
        } catch(err) {

        }

        return rtn;
    }

    // Tags
    tags(){
        try{
            return fsHandler.callFsJScript("/matrix/tags/getAllTags.js").message;
        } catch(err){
            return [];
        }
    }

    // extented
    extend(){
        setInterval(()=>{
            $(".el-input--small").addClass("el-input");
            $(".el-select--small").addClass("el-select");
            $(".el-button--small").addClass("el-button");
            $(".el-transfer-panel__item").addClass("el-checkbox");
            $("label[role='checkbox']").addClass("el-checkbox");
            $("label[role='radio']").addClass("el-radio");
            $(".el-tree-node__content>label").addClass("el-checkbox");
            $(".el-dropdown-menu--small").addClass("el-dropdown-menu el-popper");
            $(".el-form-item--small").addClass("el-form-item");
            $(".el-table--fit").addClass("el-table");
            $(".topological-view-edges-tabs.el-tabs.el-tabs--top").addClass("el-tabs--border-card");
            $(".el-popover--plain").addClass("el-popover el-popper");
            $(".el-date-editor--timerange.el-range-editor--small").addClass("el-date-editor el-range-editor el-input__inner");
            $(".el-input.el-input--small.el-date-editor--time-select").addClass("el-date-editor");
            $(".el-date-editor--datetimerange.el-range-editor--small").addClass("el-date-editor el-range-editor el-input__inner el-date-editor--datetimerange");
            $(".has-time").addClass("el-picker-panel el-date-range-picker el-popper");
            $(".el-dialog__wrapper.transition.ElDialog").removeClass("transition ElDialog");
            $(".el-message-box__wrapper").removeClass("transition");
            $(".el-drawer__wrapper").removeClass("transition");
            $(".el-checkbox-group > label").addClass("el-checkbox");
            $(".el-radio-group > label").addClass("el-radio");
            $(".el-progress--circle").addClass("el-progress");
            $("i[class^='elicon']").css("font-size","14px");
            $(".ElTreeNode").removeClass("ElTreeNode");
        },50)
    }
}

let vue = new VueHub();

let eventHub = vue.hub();

let i18n = vue.lang();

let mxAuth = vue.auth();

let mxAllTags = vue.tags();

vue.extend();

// Element UI Setup
Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000};

