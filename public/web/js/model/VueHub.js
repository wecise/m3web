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