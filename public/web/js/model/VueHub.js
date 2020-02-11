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
}

let vue = new VueHub();

let eventHub = vue.hub();

// Element UI Setup
Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000};

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
    $(".has-time").addClass("el-picker-panel el-date-range-picker el-popper");
    $(".el-dialog__wrapper.transition.ElDialog").removeClass("transition ElDialog");
    $(".el-message-box__wrapper").removeClass("transition");
    $("i[class^='elicon']").css("font-size","14px");
//    $(".el-tabs__nav.is-left > div:eq(0)").addClass("el-tabs__active-bar");
},50)