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
class Api {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["fs-tree-component",
                        "fs-view-component",
                        "fs-editor-component",
                        "fs-output-component",
                        "fs-datatable-component",
                        "devops-tree-component",
                        "ai-robot-component"
                        ],function() {

            $(function() {

                Vue.component("api-view-tree",{
                    props:{
                        id: String
                    },
                    delimiters: ['${', '}'],
                    template: `<mx-fs-tree :root="root"></mx-fs-tree>`,
                    data() {
                        return {
                            root: "/script",
                        }
                    }
                });

                Vue.component("api-view-console",{
                    delimiters: ['${', '}'],
                    props:{
                        id: String
                    },
                    template: `<fs-view-component :id="id+'file-fs-view'" :root="root" defaultView="list-view" rootName="我的接口"></fs-view-component>`,
                    data(){
                        return {
                            root: "/script"
                        }
                    }
                });

                mxApi.app = new Vue({
                    delimiters: ['${', '}'],
                    template:   `<el-container style="height:calc(100vh - 80px);background:#ffffff;">
                                    <el-aside style="width:240px;overflow:hidden;background:#f2f3f5;" ref="leftView">
                                        <api-view-tree id="api-view-tree" ref="treeRef"></api-view-tree>
                                    </el-aside>
                                    <el-main style="padding:0px;overflow:hidden;" ref="mainView">
                                        <api-view-console id="api-view-console" ref="viewRef"></api-view-console>
                                    </el-main>
                                </el-container>`,
                    mounted() {
                        this.$nextTick().then(()=>{
                            Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                                sizes: [20, 80],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true,
                                gutterStyle: function(dimension, gutterSize) {
                                    return {
                                        
                                    }
                                }
                            });
                        })
                    }
                }).$mount("#app");

            })

        })

    }

}

let mxApi = new Api();
mxApi.init();