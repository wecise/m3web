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
                        "ai-robot-component",
                        "mx-tag",
                        "mx-tag-tree"
                        ],function() {

            $(function() {

                // API统计
                Vue.component("api-summary",{
                    i18n,
                    delimiters: ['#{', '}#'],
                    data(){
                        return {
                            model: null
                        }
                    },
                    template:   `<el-container>
                                    <el-header style="padding:0px;height:40px;line-height:40px;"><h5 style="margin: 0px 10px;">#{ $t('api.title') }#</h5></el-header>
                                    <el-main style="display: flex;float: left;padding:0px;">
                                        <div @click="onForward(item.url)" 
                                            :key="item.name" v-for="item in model.api"
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
                            fsHandler.callFsJScriptAsync("/matrix/summary/getSummary.js",null).then( (rtn)=>{
                                this.model = rtn.message;
                            } )
                        }
                    }
                })
                
                // API树
                Vue.component("api-view-tree",{
                    delimiters: ['${', '}'],
                    template: `<mx-fs-tree :root="root"></mx-fs-tree>`,
                    data() {
                        return {
                            root: "/script",
                        }
                    }
                });

                // API管理
                Vue.component("api-view-console",{
                    i18n,
                    delimiters: ['${', '}'],
                    template: `<fs-view-component id="api-view-console-file-fs-view" :root="root" defaultView="grid-view" :rootName="$t('api.home')"></fs-view-component>`,
                    data(){
                        return {
                            root: "/script"
                        }
                    },
                    mounted(){
                        $(".el-container.api-view-console").css({
                            "height": "calc(100vh - 80px)"
                        });
                    }
                });

                mxApi.app = new Vue({
                    delimiters: ['#{', '}#'],
                    template:   `<el-container style="height:calc(100vh - 80px);background:#ffffff;">
                                    <el-aside style="width:240px;overflow:hidden;background:#f2f2f2;" ref="leftView">
                                        <api-view-tree ref="treeRef"></api-view-tree>
                                    </el-aside>
                                    <el-main style="padding:0px;overflow:hidden;display:grid;" ref="mainView">
                                        <!--api-summary></api-summary-->
                                        <api-view-console ref="viewRef"></api-view-console>
                                    </el-main>
                                </el-container>`,
                    mounted() {
                        
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
                        
                    }
                }).$mount("#app");

            })

        })

    }

}

let mxApi = new Api();
mxApi.init();