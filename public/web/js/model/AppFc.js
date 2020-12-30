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
class AppFc {

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
                        "ai-robot-component",
                        "mx-tag",
                        "mx-tag-tree"
                        ],function() {

            $(function() {

                // API统计
                Vue.component("app-summary",{
                    delimiters: ['#{', '}#'],
                    data(){
                        return {
                            model: null
                        }
                    },
                    template:   `<el-container>
                                    <el-header style="padding:0px;height:40px;line-height:40px;"><h5 style="margin: 0px 10px;">接口服务概览</h5></el-header>
                                    <el-main style="display: flex;float: left;padding:0px;">
                                        <div @click="onForward(item.url)" 
                                            :key="item.name" v-for="item in model.app"
                                            :style="'cursor: pointer;width: 32.3%;min-width: 320px;height:8em;margin:0px 0px 10px 10px;display: flex;float: left;background: '+item.background +';color:#ffffff;'">
                                                <span style="padding:10px;">
                                                    <el-image :src="item.icon"></el-image>
                                                </span>
                                                <div style="text-align: left;padding:0 10px;">
                                                    <h4>
                                                        <span v-if="window.MATRIX_LANG == 'zh-CN'">#{item.cnname}#</span>
                                                        <span v-else>#{item.enname}#</span>
                                                    </h4>
                                                    <p style="font-size:34px;margin: 0px;font-weight: 900;">
                                                        #{item.count}#
                                                    </p>
                                                </div>
                                            </span>
                                        </div>
                                    </el-main>
                                </el-container>`,
                    created(){
                        this.initSummary();
            
                        setInterval(()=>{
                            this.initSummary();
                        }, 30 * 1000)
                    },
                    methods: {
                        initSummary(){
                            fsHandler.callFsJScriptAsync("/matrix/apps/getSummary.js",null).then( (rtn)=>{
                                this.model = rtn.message;
                            } )
                        }
                    }
                })

                Vue.component("app-view-tree",{
                    props:{
                        id: String
                    },
                    delimiters: ['${', '}'],
                    template: `<mx-fs-tree :root="root"></mx-fs-tree>`,
                    data() {
                        return {
                            root: "/app",
                        }
                    }
                });

                Vue.component("app-view-console",{
                    delimiters: ['${', '}'],
                    props:{
                        id: String
                    },
                    template: `<fs-view-component :id="id+'file-fs-view'" :root="root" defaultView="list-view" rootName="应用容器"></fs-view-component>`,
                    data(){
                        return {
                            root: "/app"
                        }
                    },
                    mounted(){
                        $(".el-container.app-view-console").css({
                            "height": "calc(100vh - 240px)"
                        });
                    }
                });

                mxAppFc.app = new Vue({
                    delimiters: ['${', '}'],
                    template:   `<el-container style="height:calc(100vh - 85px);background:#ffffff;">
                                    <el-aside style="width:240px;overflow:hidden;background:#f7f7f7;" ref="leftView">
                                        <app-view-tree ref="treeRef"></app-view-tree>
                                    </el-aside>
                                    <el-main style="padding:0px;overflow:hidden;" ref="mainView">
                                        <app-summary></app-summary>
                                        <app-view-console id="app-view-console" ref="viewRef"></app-view-console>
                                    </el-main>
                                </el-container>`,
                    mounted() {
                        Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                            sizes: [0, 100],
                            minSize: [0, 0],
                            gutterSize: 5,
                            cursor: 'col-resize',
                            direction: 'horizontal',
                            expandToMin: true
                        });
                    }
                }).$mount("#app");

            })

        })

    }

}

let mxAppFc = new AppFc();
mxAppFc.init();