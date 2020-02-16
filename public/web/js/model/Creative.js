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
class Creative {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["fs-view-component",
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
                    template: `<fs-editor-tree-component :id="id+'file-fs-tree'" :root="root" :checkEnable="false" :contextMenu="null"></fs-editor-tree-component>`,
                    data() {
                        return {
                            root: "/opt/creative",
                        }
                    }
                });

                Vue.component("api-view-console",{
                    delimiters: ['${', '}'],
                    props:{
                        id: String
                    },
                    template: `<fs-view-component :id="id+'file-fs-view'" :root="root" defaultView="thumbnail-view" rootName="创作中心"></fs-view-component>`,
                    data(){
                        return {
                            root: "/opt/creative"
                        }
                    }
                });

                mxCreative.app = new Vue({
                    delimiters: ['${', '}'],
                    data: {
                        root: "/opt/creative",
                        name: "创作中心",
                        defaultView: "thumbnail-view"
                    },
                    template:   `<el-container style="height:calc(100vh - 80px);background:#ffffff;">
                                    <el-aside style="width:230px;padding:0px 10px;overflow:hidden;background:#f6f6f6;" ref="leftView">
                                        <api-view-tree id="api-view-tree" ref="treeRef"></api-view-tree>
                                    </el-aside>
                                    <el-main style="padding:0px;overflow:hidden;" ref="mainView">
                                        <api-view-console id="api-view-console" ref="viewRef"></api-view-console>
                                    </el-main>
                                </el-container>`,
                    mounted() {
                        this.$nextTick().then(()=>{
                            Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                                sizes: [18, 82],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal',
                            });
                        })
                    }
                }).$mount("#app");

            })

        })

    }

}

let mxCreative = new Creative();
mxCreative.init();