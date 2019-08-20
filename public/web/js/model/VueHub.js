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
},50)