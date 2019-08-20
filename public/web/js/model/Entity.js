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
class Entity extends Matrix {

    constructor() {
        super();

        // 运行模式定义
        window.EVENT_VIEW_LIST = ['view-normal','view-tags','view-fullscreen'];
        window.EVENT_VIEW = 'view-normal';
        
        this.app = null;
        this.detail = null;

        this.URL_PARAMS_ITEM = null;
        this.URL_PARAMS_CFG = null;
        this.URL_PARAMS_GRAPH = null;
    }

    init() {
        const inst = this;

        VueLoader.onloaded(["ai-robot-component",
                            "entity-datatable-component",
                            "entity-tree-component",
                            "search-preset-component",
                            "search-base-component"],function() {
            $(function() {

                // 智能图谱
                Vue.component("entity-view-graph",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object,
                    },
                    data(){
                        return {
                            rId: _.now(),
                            topological: null
                        }
                    },
                    template:`<div :id="'topological-app-' + id + '-' + rId"></div>`,
                    watch: {
                        model:{
                            handler: function(val,oldVal){
                                this.initData();
                            },
                            immediate:true
                        }
                    },
                    methods: {
                        initData(){
                            
                            // 从业务开始绘制图谱
                            // 取出所有业务名称
                            let bizs = `"${_.map(_.slice(this.model.rows,0,50),'id').join('","')}"`;
                            
                            try {
                                
                                if(!this.topological){
                                    
                                    this.topological = new Topological();
                                    this.topological.init();
                                    this.topological.graphScript = [
                                        {value: `match (${bizs}) - [*1] -> (${bizs})`}
                                    ];
                                    
                                    this.topological.mount(`#topological-app-${this.id}-${this.rId}`);

                                } else {
                                    console.log(22)
                                    this.topological.graphScript = [ {value: `match (${bizs}) - [*1] -> (${bizs})`} ];
                                    this.topological.search(this.topological.graphScript[0].value);
                                }

                            } catch(err){
                                
                            } finally {
                                _.delay(() => {
                                    $("[id^='pane-graph']").css({
                                        "height": "calc(100vh - 150px)",
                                        "margin": "-15px"
                                    })
                                    this.topological.setStyle();
                                },500)
                            }
                            
                        }
                    },
                    destroyed() {
                        this.topological.destroy();
                    }
                })

                // 时间轴
                Vue.component("event-timeline",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<div class="block"><el-timeline>
                                    <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model">
                                        <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                            <h4>#{item.value}#</h4>
                                            <p>#{item.biz}# #{item.host}#</p>
                                            <p>#{item.msg}#</p>
                                        </el-card>
                                    </el-timeline-item>
                                </el-timeline></div>`
                })

                // 告警雷达
                Vue.component("entity-view-radar",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            progress:[]
                        }
                    },
                    template:   `<div>
                                    <div class="progress" 
                                         v-for="pg in progress" 
                                         style="padding-left: 80px;overflow: hidden;height: 24px;margin-bottom: 5px;background-color: rgb(245, 245, 245);border-radius: 4px;transition: width .6s ease;">
                                        <label style="padding: 3px 5px;position: absolute;left: 10px;">#{pg.name}#</label>
                                        <el-tooltip placement="top" v-for="item in pg.child">
                                            <div slot="content">#{item.title}#</div>
                                            <div class="progress-bar animated fadeInLeft" 
                                                :id="item.id"
                                                role="progressbar" 
                                                aria-valuemin="0" 
                                                :aria-valuenow="item.width" 
                                                aria-valuemax="100" 
                                                :style="'width:'+item.width+'%;background:'+item.color + ';padding:3px;cursor: pointer;'" 
                                                @click="search(item.expression)">
                                                <div v-if="pg.child.length < 20">
                                                    #{item.name}#
                                                </div>
                                            </div>
                                        </el-tooltip>
                                    </div>
                                </div>`,
                    watch:{
                        model:{
                            handler(val,oldVal){
                                this.initData();
                            },
                            deep:true
                        }
                    },
                    mounted(){
                    },
                    methods: {
                        initData(){
                            
                            this.progress = _.map(this.model.summary.radar,function(v,k){
                                let className = k.split("_")[0];
                                let title = k.split("_")[1];
                                let sum = _.sum(_.map(v,function(s){return s[1];}));
                                let pgs = _.map(v,function(val){
                                    let name = '其它';
                                    if(val[0]){
                                        name = val[0];
                                    }
                                    
                                    return {id:objectHash.sha1(name+val+_.now()), 
                                            name: name, 
                                            value: val[1],
                                            expression:  className==='vtime'?`at ${moment(name).format("YYYY-MM-DD HH:mm:SS")} within 15minutes for ${className}`:`${className}=${name}`,
                                            title: `按${title}分析 \n\n ${name}: ${val[1]}`,
                                            width: val[1]/sum * 100, 
                                            color: _.sample(_.map(mx.global.register.color.summary,'color'))
                                        }
                                })
                                return {name: title, class:className, child: pgs, sum: sum}
                            });
                        },
                        search(event){
                            this.$root.options.term = event;
                            this.$root.$refs.searchRef.search();
                        }
                    }
                });

                // 告警统计
                Vue.component("entity-view-pie",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            circles:[]
                        }
                    },
                    template:   `<div style="height:200px;">
                                    <el-progress type="circle" :percentage="item.percent" v-for="item in circles"></el-progress>
                                    <!--Circle
                                        dashboard
                                        :percent="item.percent"
                                        v-for="item in circles">
                                        <div>
                                            <h1>#{item.count}#</h1>
                                            <p>#{item.name}#</p>
                                            <span>
                                                总数
                                                <i>#{item.count}#</i>
                                            </span>
                                        </div>
                                    </Circle-->
                                </div>`,
                    watch:{
                        model:{
                            handler(val,oldVal){
                                this.initData();
                            },
                            deep:true
                        }
                    },
                    mounted(){
                        const self = this;
                        _.delay(function(){
                            self.initData();
                        },1000)
                    },
                    methods: {
                        initData(){
                            const self = this;
                            
                            self.circles = [];
                            _.forEach(self.model.summary.pie,function(v,k){
                                _.forEach(v,function(val){
                                    self.circles.push({
                                            dimension: k,
                                            id:objectHash.sha1(k+val+_.now()), 
                                            name: val[0], 
                                            count: val[1],
                                            sum: _.sum(_.map(v,function(s){return s[1];})),
                                            percent: val[1]/180*100,
                                            color: _.sample(['#ff0000','#ffd700','#666666','#00ffff','#40e0d0','#ff7373','#d3ffce','#3399ff','#000080','#66cccc','#a0db8e','#794044','#6897bb','#cc0000'])
                                        });
                                })
                            });
                        },
                        search(event){
                            this.$root.options.term = event;
                            this.$root.$refs.searchRef.search();
                        }
                    }
                });

                // 详情 基本信息
                Vue.component("entity-diagnosis-base",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    data(){
                        return {
                            rows:null,
                            template: null,
                            tags:{
                                inputVisible: false,
                                inputValue: ''
                            }
                        }
                    },
                    template: `<el-container style="height: calc(100vh - 230px);">
                                    <el-header style="text-align: right; font-size: 12px;line-height: 24px;height:24px;">
                                        <el-tooltip content="保存">
                                            <a href="javascript:void(0);" class="btn btn-link"><i class="fas fa-save"></i></a>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main style="padding:0px;">
                                        <el-row type="flex" justify="center">
                                            <el-col :span="6">
                                                <div class="grid-content" style="text-align:center;">
                                                    <img :src="model.rows.class | pickIcon" class="image" style="width:120px;">
                                                    <span style="text-align:left;">
                                                        <p><h4>#{model.rows.name}#</h4></p>
                                                        <p>名称：#{model.rows.alias}#</p>
                                                        <p>类型：#{model.rows.class}#</p>
                                                    </span>
                                                </div>
                                            </el-col>
                                            <el-col :span="18" style="border-left: 1px solid rgb(235, 235, 244);">
                                                <div class="grid-content">
                                                    <el-form label-width="100px">
                                                        <el-form-item :label="item.title" v-for="item in template" v-if="item.visible" style="height:50px;">
                                                            <el-input type="text" v-model="rows[item.data]" :placeholder="item.data" v-if="item.type==='text'" :disabled="item.disabled"></el-input>
                                                            <el-date-picker type="date" v-model="rows[item.data]" :placeholder="item.data" v-else-if="item.type==='datetime'"></el-date-picker>
                                                            <el-switch v-model="rows[item.data]" :placeholder="item.data" v-else-if="item.type==='switch'"></el-switch>
                                                        </el-form-item>
                                                        <el-form-item label="标签">
                                                            <el-tag
                                                                :key="tag"
                                                                closable
                                                                @close="tagsRemove(tag)"
                                                                style="margin:0 2px;" v-for="tag in rows.tags" v-if="rows.tags">
                                                                #{tag}#
                                                            </el-tag>
                                                            <el-input
                                                                class="input-new-tag"
                                                                v-if="tags.inputVisible"
                                                                v-model="tags.inputValue"
                                                                ref="saveTagInput"
                                                                size="small"
                                                                @keyup.enter.native="tagsAdd"
                                                                @blur="tagsAdd">
                                                            </el-input>
                                                            <el-button v-else class="button-new-tag" size="small" @click="tagsInputShow">+</el-button>
                                                        </el-form-item>
                                                    </el-form>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </el-main>
                                </el-container>`,
                    filters:{
                        pickIcon(evt){
                            try{
                                let icon = _.last(evt.split("/"));
                                return `/fs/assets/images/entity/png/${icon}.png?issys=true&type=download`;
                            } catch(err){
                                return `/fs/assets/images/entity/png/linux.png?issys=true&type=download`;
                            }
                        },
                        handlerFormat(evt){
                            // 2019-03-13T21:35:31.678Z
                            // 检查是否是UTC格式
                            if(_.indexOf(evt,'T') === 10 && (_.indexOf(evt,'Z') === 23 || _.indexOf(evt,'Z') === 19) ){
                                return moment(evt).format("LLL");
                            } else {
                                return evt;
                            }
                        }
                    },
                    mounted(){
                        this.rows = this.model.rows;
                        this.template = _.map(_.filter(this.model.template,{region:'base'}),function(v){
                            return _.extend({visible:true},v);
                        });
                    },
                    methods: {
                        tagsRemove(tag) {
                            const self = this;
        
                            self.rows.tags.splice($.inArray(tag,self.rows.tags), 1)
                            
                            // Tags Handler
                            let input = {class: self.rows.class, action: "-", tag: tag, id: self.rows.id};
                            let rtn = fsHandler.callFsJScript('/tags/tag_service.js', encodeURIComponent(JSON.stringify(input)));

                        },
                        tagsInputShow() {
                            const self = this;
        
                            self.tags.inputVisible = true;
                            self.$nextTick(_ => {
                                self.$refs.saveTagInput.$refs.input.focus();
                            });
                        },
                        tagsAdd() {
                            const self = this;
        
                            let inputValue = self.tags.inputValue;
                            if (inputValue) {
                                self.rows.tags.push(inputValue);

                                // Tags Handler
                                let input = {class: self.rows.class, action: "+", tag: inputValue, id: self.rows.id};
                                let rtn = fsHandler.callFsJScript('/tags/tag_service.js', encodeURIComponent(JSON.stringify(input)));
                            }

                            self.tags.inputVisible = false;
                            self.tags.inputValue = '';
                        }
                    }
                });

                // 详情 管理信息
                Vue.component("entity-diagnosis-manager",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    template: `<el-container style="height: calc(100vh - 230px);">
                                    <el-header style="text-align: right; font-size: 12px;line-height: 24px;height:24px;">
                                        <el-tooltip content="保存">
                                            <a href="javascript:void(0);" class="btn btn-link"><i class="fas fa-save"></i></a>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main>
                                        <el-row :gutter="10">
                                            <el-col :span="24">
                                                <div class="grid-content">
                                                    <form class="form-horizontal">
                                                        <!-- 有模板 -->
                                                        <div class="form-group" v-for="item in _.filter(model.template,{region:'manager'})" style="padding: 0px 10px;margin-bottom: 1px;" v-if="model.template">
                                                            <label :for="item.title" class="col-sm-2 control-label" style="text-align:left;">#{item.title}#</label>
                                                            <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                                <input type="text" class="form-control-bg-grey" :placeholder="item.data" :value="model.rows[item.data] | handlerFormat">
                                                            </div>
                                                        </div>
                                                        <!-- 没有模板 -->
                                                        <div class="form-group" v-for="(value,key) in model.rows" style="padding: 0px 10px;margin-bottom: 1px;" v-else>
                                                            <label :for="key" class="col-sm-2 control-label" style="text-align:left;">#{key}#</label>
                                                            <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                                <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | handlerFormat">
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </el-main>
                                </el-container>`,
                    filters:{
                        pickIcon(evt){
                            try{
                                let icon = _.last(evt.split("/"));
                                return `/fs/assets/images/entity/png/${icon}.png?issys=true&type=download`;
                            } catch(err){
                                return `/fs/assets/images/entity/png/linux.png?issys=true&type=download`;
                            }
                        },
                        handlerFormat(evt){
                            // 2019-03-13T21:35:31.678Z
                            // 检查是否是UTC格式
                            if(_.indexOf(evt,'T') === 10 && (_.indexOf(evt,'Z') === 23 || _.indexOf(evt,'Z') === 19) ){
                                return moment(evt).format("LLL");
                            } else {
                                return evt;
                            }
                        }
                    },
                    mounted(){
                    }
                });

                // 详情 实体信息
                Vue.component("entity-diagnosis-config",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    data(){
                        return {
                            config: {},
                            files: {},
                            element: {}
                        }
                    },
                    template: `<el-container style="height: calc(100vh - 230px);">
                                    <el-header style="text-align: right; font-size: 12px;line-height: 24px;height:24px;">
                                        <el-tooltip content="保存">
                                            <a href="javascript:void(0);" class="btn btn-link"><i class="fas fa-save"></i></a>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main>
                                        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
                                            <el-form-item label="活动名称" prop="name">
                                                <el-input v-model="ruleForm.name"></el-input>
                                            </el-form-item>
                                        </el-form>
                                        /* <el-row :gutter="10">
                                            <el-col :span="24">
                                                <div class="grid-content">
                                                    <form class="form-horizontal">
                                                        <!-- 有模板 -->
                                                        <div class="form-group" v-for="item in _.filter(model.template,{region:'config'})" style="padding: 0px 10px;margin-bottom: 1px;" v-if="model.template">
                                                            <label :for="item.title" class="col-sm-2 control-label" style="text-align:left;">#{item.title}#</label>
                                                            <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                                <textarea rows="6" class="form-control-bg-grey" :placeholder="item.data">#{model.rows[item.data]}#</textarea>
                                                            </div>
                                                        </div>
                                                        <!-- 没有模板 -->
                                                        <div class="form-group" v-for="(value,key) in model.rows" style="padding: 0px 10px;margin-bottom: 1px;" v-else>
                                                            <label :for="key" class="col-sm-2 control-label" style="text-align:left;">#{key}#</label>
                                                            <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                                <textarea rows="6" class="form-control-bg-grey" :placeholder="value">#{value}#</textarea>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </el-col>
                                        </el-row> */
                                    </el-main>
                                </el-container>`,
                    filters:{
                        pickIcon(evt){
                            try{
                                let icon = _.last(evt.split("/"));
                                return `/fs/assets/images/entity/png/${icon}.png?issys=true&type=download`;
                            } catch(err){
                                return `/fs/assets/images/entity/png/linux.png?issys=true&type=download`;
                            }
                        },
                        handlerFormat(evt){
                            // 2019-03-13T21:35:31.678Z
                            // 检查是否是UTC格式
                            if(_.indexOf(evt,'T') === 10 && (_.indexOf(evt,'Z') === 23 || _.indexOf(evt,'Z') === 19) ){
                                return moment(evt).format("LLL");
                            } else {
                                return evt;
                            }
                        }
                    },
                    created(){

                    },
                    mounted(){
                    }
                });

                // 仪表盘
                Vue.component("gauge-component",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data:function(){
                        return {
                            gaugePS: null
                        }
                    },
                    template: ` <div style="width:100%;">
                                    <canvas :id="'gauge-'+id"></canvas>
                                    <p>#{model.host}#/<small>#{model.param}#</small></p>
                                </div>`,
                    mounted:function(){
                        const self = this;
                        self.init();
                    },
                    methods: {
                        init: function(){
                            let self = this;
                            
                            self.gaugePS = new RadialGauge({
                                renderTo: `gauge-${self.id}`,
                                width: 200,
                                height: 200,
                                units: 'PS',
                                minValue: 0,
                                maxValue: 100,
                                majorTicks: [
                                    '0',
                                    '10',
                                    '20',
                                    '30',
                                    '40',
                                    '50',
                                    '60',
                                    '70',
                                    '80',
                                    '90',
                                    '100'
                                ],
                                minorTicks: 2,
                                ticksAngle: 270,
                                startAngle: 45,
                                strokeTicks: true,
                                highlights  : [
                                    { from : 50,  to : 80, color : '#ffff00' },
                                    { from : 80, to : 100, color : 'rgba(225, 7, 23, 0.75)' }
                                ],
                                valueInt: 1,
                                valueDec: 0,
                                colorPlate: "#fff",
                                colorMajorTicks: "#686868",
                                colorMinorTicks: "#686868",
                                colorTitle: "#000",
                                colorUnits: "#000",
                                colorNumbers: "#686868",
                                valueBox: true,
                                colorValueText: "#000",
                                colorValueBoxRect: "#fff",
                                colorValueBoxRectEnd: "#fff",
                                colorValueBoxBackground: "#fff",
                                colorValueBoxShadow: false,
                                colorValueTextShadow: false,
                                colorNeedleShadowUp: true,
                                colorNeedleShadowDown: false,
                                colorNeedle: "rgba(200, 50, 50, .75)",
                                colorNeedleEnd: "rgba(200, 50, 50, .75)",
                                colorNeedleCircleOuter: "rgba(200, 200, 200, 1)",
                                colorNeedleCircleOuterEnd: "rgba(200, 200, 200, 1)",
                                borderShadowWidth: 0,
                                borders: true,
                                borderInnerWidth: 0,
                                borderMiddleWidth: 0,
                                borderOuterWidth: 5,
                                colorBorderOuter: "#fafafa",
                                colorBorderOuterEnd: "#cdcdcd",
                                needleType: "arrow",
                                needleWidth: 2,
                                needleCircleSize: 7,
                                needleCircleOuter: true,
                                needleCircleInner: false,
                                animationDuration: 1500,
                                animationRule: "dequint",
                                fontNumbers: "Verdana",
                                fontTitle: "Verdana",
                                fontUnits: "Verdana",
                                fontValue: "Led",
                                fontValueStyle: 'italic',
                                fontNumbersSize: 20,
                                fontNumbersStyle: 'italic',
                                fontNumbersWeight: 'bold',
                                fontTitleSize: 24,
                                fontUnitsSize: 22,
                                fontValueSize: 50,
                                animatedValue: true
                            });
                            self.gaugePS.draw();
                            self.gaugePS.value = self.model.value || 0;
                        }
                    }
                    
                });
                
                // 配置比对
                Vue.component("entity-diagnosis-compare",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            resultDiff:{
                                selectedId: [],
                                setting: {
                                    element: '',
                                    mode: "ace/mode/json",
                                    theme: "ace/theme/tomorrow",
                                    left: {
                                        content:null,
                                    },
                                    right: {
                                        content:null,
                                    }
                                },
								left: {
                                    tags: [],
                                },
								right: {
                                    tags: [],
								}
                            }
                        }
                    },
                    template:   `<el-container style="height: calc(100vh - 230px);"><el-main>
                                    <el-timeline>
                                        <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model.history.rows">
                                            <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                                <h4>#{item.id}#</h4>
                                                <p style="font-size:12px;">#{item.config}#</p>
                                                <p style="font-size:12px;">#{item.files}#</p>
                                                <p style="font-size:12px;">#{item.elements}#</p>
                                                <!--a href="javascript:void(0);" class="btn btn-xs btn-primary" @click="compareAdd(item)">加入比对</a-->
                                                <a href="javascript:void(0);" class="btn btn-xs btn-primary" @click="compareWithLast(item,$event)">与最新配置比对 <i class="fas fa-angle-right"></i></a>
                                                <p :class="'ace-compare-container ace-compare-container-'+objectHash.sha1(item)" style="display: flex;
                                                            display: -webkit-flex;
                                                            flex-direction: row;
                                                            position: relative;
                                                            bottom: 0;
                                                            width: 100%;
                                                            top: 0px !important;left: 0px;height: 50vh;width: 100%;overflow: auto;display:none;"></p>
                                            </el-card>
                                        </el-timeline-item>
                                    </el-timeline>
                                    </el-main>
                                    </el-container>`,
                    mounted:function(){
                        this.init();
                    },
                    methods: {
                        init: function(){
                            
                        },
                        compareAdd(item){
                            const self = this;

                            if(self.resultDiff.selectedId.length === 2){
                                self.resultDiff.selectedId[1] = item.id;
                            } else {
                                self.resultDiff.selectedId.push(item.id);
                            }
                        },
                        compareWithLast(item,event){
                            const self = this;
                            console.log(event,$($(event.target).find("i")).hasClass("fas"))
                            // 检查是否已存在
                            let node = `.ace-compare-container-${objectHash.sha1(item)}`;
                            
                            if($($(event.target).find("i")).hasClass("fa-angle-down")){
                                $(node).empty();
                                $(node).hide();
                                self.resultDiff.selectedId = [];

                                $($(event.target).find("i")).removeClass("fa-angle-down");
                                $($(event.target).find("i")).addClass("fa-angle-right");
                            } else {
                                self.resultDiff.setting.element = node;

                                self.resultDiff.selectedId.push(self.model.detail.rows);
                                self.resultDiff.selectedId.push(item);

                                $(node).show();
                                $($(event.target).find("i")).removeClass("fa-angle-right");
                                $($(event.target).find("i")).addClass("fa-angle-down");

                                _.forEach(self.resultDiff.selectedId,function(v,k){
                                    let tmp = omdbHandler.fetchData("id="+v.id + " | vtime="+v.vtime);
                                    
                                    if (k == 0) {
                                        self.resultDiff.setting.left.content = JSON.stringify(tmp.message[0],null, 2);
                                    } else {
                                        self.resultDiff.setting.right.content = JSON.stringify(tmp.message[0],null, 2);
                                    }
                                });
    
                                _.delay(function(){
                                    let aceDiff = new AceDiff(self.resultDiff.setting);
                                    let aceDiffInst = aceDiff.getEditors();
                                    aceDiffInst.left.getSession().on('changeScrollTop', function(scroll) {
                                        aceDiffInst.right.getSession().setScrollTop(parseInt(scroll) || 0)
                                    });
                                    aceDiffInst.right.getSession().on('changeScrollTop', function(scroll) {
                                        aceDiffInst.left.getSession().setScrollTop(parseInt(scroll) || 0)
                                    });
                                },500)
                            }
                            
                        }
                    }
                    
                });

                // 资源信息
                let entityDiagnosisTopological = Vue.extend({
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:  `<el-container style="height: calc(100vh - 230px);">
                                    <el-main style="padding:0px;">
                                        <div :id="'topological-app-'+rId"></div>
                                    </el-main>
                                </el-container>`,
                    computed:{
                        rId(){
                            console.log(11,this.id,objectHash.sha1(this.id),this.model.rows)
                            return objectHash.sha1(this.id);
                        }
                    },
                    mounted(){
                        this.init();
                    },
                    methods: {
                        init(){    
                            var mxTopological = new Topological();
                            mxTopological.init();
                            mxTopological.graphScript = _.map([this.model.rows],function(v){
                                return {value: `match () - [*1] -> ("${v.id}") - [*1] -> ()`};
                            });
                            mxTopological.mount(`#topological-app-${this.rId}`);
                            
                            _.delay(()=>{
                                mxTopological.app.contextMenu();
                            },500)

                        }
                    }
                });
                
                let main = {
                    delimiters: ['${', '}'],
                    template: "#app-template",
                    data: {
                        // 布局
                        layout:{
                            main:{
                                tabIndex: 1,
                                activeIndex: 'entity-view-console',
                                tabs:[
                                    {name: 'entity-view-console', title:'实体列表', type: 'main'}
                                ],
                                detail: {
                                    model: [],
                                    tabIndex: 1,
                                    activeIndex: '1',
                                }
                            },
                            summary: {
                                tabIndex: 1,
                                activeIndex: 'entity-view-radar',
                                tabs:[
                                    {name: 'entity-view-radar', title:'雷达', type: 'radar'}
                                ]
                            }
                        },
                        control: {
                            ifSmart: '0',
                            ifGraph: '0'
                        },
                        // 搜索组件结构
                        model: {
                            id: "matrix-event-search",
                            filter: null,
                            term: null,
                            preset: null,
                            message: null,
                        },
                        options: {
                            // 搜索窗口
                            name:"所有", value: "",
                            // 输入
                            term: "",
                            // 指定类
                            class: "#/matrix/entity/:",
                            // 指定api
                            api: "entity",
                            // 时间窗口
                            range: { from: "", to: ""},
                            // 其它设置
                            others: {
                                // 是否包含历史数据
                                ifHistory: false,
                                // 是否包含Debug信息
                                ifDebug: false,
                                // 指定时间戳
                                forTime:  ' for vtime ',
                            }
                        }
                    },
                    components: {
                        'entity-diagnosis-topological': entityDiagnosisTopological,
                    },
                    watch:{
                        'layout.main.tabs':{
                            handler(val,oldVal){
                                if(val.length > 1){
                                    $("#tab-entity-view-console").show();
                                }else {
                                    $("#tab-entity-view-console").hide();
                                }
                            },
                            deep:true
                        }
                    },
                    filters: {
                        pickTitle(item,model,index){
                            try {
                                let count = 0;
                                count = model[item.type].rows.length;
                                
                                let badge = 0;
                                let severity = 0;
                                try{
                                    severity = _.maxBy(model[item.type].rows,'severity').severity;
                                } catch(error){
                                    severity = 0;
                                }
                                
                                badge = severity>=5?`<span style="color:#FF0000;">${count}</span>`:severity>=4?`<span style="color:#FFDC00;">${count}</span>`:count;
                                
                                return `${item.title} ${badge}`;

                            } catch(error){
                                return `${item.title} 0`;
                            }
                        }
                    },
                    created(){
                        try {
                            if(mx.urlParams['cfg']){
                                inst.URL_PARAMS_CFG = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['cfg']))));
                            }

                            if(mx.urlParams['item']){
                                inst.URL_PARAMS_ITEM = window.URL_PARAMS_ITEM = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['item']))));
                            }
        
                            if(mx.urlParams['data']) {
                                inst.graphScript = [{value:decodeURIComponent(window.atob(mx.urlParams['data']))}];
                            }
                            
                            let init = (function(){
                    
                                _.forEach(inst.URL_PARAMS_CFG,function(v,k){
                    
                                    if("false" == String(v)){
                                        $(`#${k}`).hide();
                                        $(".page-header-fixed").css({
                                            "paddingTop": "0px"
                                        })
                                        $(".page-sidebar-minified .sidebar-bg").css({
                                            "width": "0px"
                                        })
                                        $(".page-sidebar-minified .content").css({
                                            "marginLeft": "0px"
                                        })

                                        $("body").css({
                                            "background": "transparent"
                                        })
                                    }
                                })
                    
                            })();
                        } catch(err){
                            inst.URL_PARAMS_ITEM = null;
                            inst.URL_PARAMS_CFG = null;
                            inst.graphScript = null;
                            inst.URL_PARAMS_GRAPH = null;
                        }

                        // 接收搜索数据
                        eventHub.$on(`SEARCH-RESPONSE-EVENT-${this.model.id}`, this.setData);
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT",this.resizeEventConsole);
                    },
                    mounted(){
                        $(this.$el).addClass('view-normal');
                        
                        // 没有详细页时，默认隐藏告警列表Title
                        this.hideTabEventViewConsoleUl();

                        // 维度统计
                        this.toggleSummaryBySmart(this.control.ifSmart);

                        // 窗口Resize
                        _.delay(function(){
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");

                            Split(['#entity-view-left', '#entity-view-main'], {
                                sizes: [20, 80],
                                minSize: [0, 0],
                                gutterSize: 5,
                                gutterAlign: 'end',
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true
                            });
                        },2000);
                        
                    },
                    methods: {
                        setData(event){
                            this.model = _.extend(this.model, this.$refs.searchRef.result);
                        },
                        hideTabEventViewConsoleUl(){
                            const self = this;

                            if($('#tab-entity-view-console').is(':visible')) {
                                $("#tab-entity-view-console").hide();
                            $("#tab-entity-view-console > span").hide();
                            } else {
                                setTimeout(self.hideTabEventViewConsoleUl, 50);
                            }   
                        },
                        // 切换运行模式
                        toggleModel(event){
                            $(this.$el).removeClass(window.EVENT_VIEW);
                            $(this.$el).addClass(event);
                            window.EVENT_VIEW = event;
                        },
                        toggleSummaryByGraph(evt){
                            if(evt==1) {
                                this.aiGraph();
                                $("#entity-view-graph").css("height","200px").css("display","");
                            } else {
                                $("#entity-view-graph").css("height","0px").css("display","none");

                                //关闭智能分组
                                try {
                                    let id = _.find(this.layout.main.tabs,{type:'graph'}).name;
                                    if(id){
                                        this.detailRemove(id);
                                    }
                                } catch(err){

                                }
                            }
                            this.control.ifGraph = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Event Console
                            
                            this.resizeEventConsole();
                        },
                        toggleSummaryBySmart(evt){
                            if(evt==1) {
                                $("#entity-view-summary").css("height","200px").css("display","");
                            } else {
                                $("#entity-view-summary").css("height","0px").css("display","none");
                            }
                            this.control.ifSmart = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Event Console
                            this.resizeEventConsole();
                        },
                        aiGraph(){
                            try {
                                let id = _.now();
                                
                                // 添加tab
                                let graph = {title:`实体图谱`, name:`graph-${id}`, type: 'graph', child:[]};
                                
                                this.layout.main.tabs.push(graph);
                                this.layout.main.activeIndex = `graph-${id}`;
                                
                            } catch(error){
                                this.layout.main.tabs = [];
                            }
                        },
                        detailAdd(event){
                            try {
                                let id = event.id;
                                if(this.layout.main.activeIndex === `diagnosis-${id}`) return false;
                                
                                // event
                                let term = encodeURIComponent(JSON.stringify(event));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript('/entity/diagnosis-by-id.js',term).message;
                                
                                // 添加tab
                                let detail = {title:`实体卡片 ${event.id}`, name:`diagnosis-${id}`, type: 'diagnosis', child:[
                                                {title:'基本信息', name:`diagnosis-base-${id}`, type: 'base', model:model},
                                                {title:'管理信息', name:`diagnosis-manager-${id}`, type: 'manager', model:model},
                                                {title:'配置信息', name:`diagnosis-cofig-${id}`, type: 'cofig', model:model},
                                                {title:'配置比对', name:`diagnosis-compare-${id}`, type: 'compare', model:model},
                                                {title:'资源信息', name:`diagnosis-topological-${id}`, type: 'topological', model:model},
                                                {title:'实体发现', name:`diagnosis-discover-${id}`, type: 'discover', model:model},
                                            ]};
                                this.layout.main.detail.activeIndex = _.first(detail.child).name;
                                
                                this.layout.main.tabs.push(detail);
                                this.layout.main.activeIndex = `diagnosis-${id}`;
                                
                            } catch(error){
                                this.layout.main.tabs = [];
                            }
                        },
                        detailRemove(targetName) {
                            try{
                                let tabs = this.layout.main.tabs;
                                let activeIndex = this.layout.main.activeIndex;
                                if (activeIndex === targetName) {
                                tabs.forEach((tab, index) => {
                                    if (tab.name === targetName) {
                                    let nextTab = tabs[index + 1] || tabs[index - 1];
                                    if (nextTab) {
                                        activeIndex = nextTab.name;
                                    }
                                    }
                                });
                                }
                                
                                this.layout.main.tabs = tabs.filter(tab => tab.name !== targetName);
                                this.layout.main.activeIndex = activeIndex;
                                this.layout.main.detail.activeIndex = _.first(_.last(this.layout.main.tabs).child).name;

                            } catch(err){

                            } finally {
                                // Graph
                                if(_.includes(targetName,'graph')){
                                    this.control.ifGraph = '0';
                                }
                            }
                        },
                        toggleTab(targetName){
                            this.layout.main.detail.activeIndex = _.first(_.last(this.layout.main.tabs).child).name;
                        },
                        contextMenu(tId,inst,items,fun){
                            const self = this;

                            $.contextMenu({
                                selector: `#${tId} tr td:not(:nth-child(1))`,
                                trigger: 'right',
                                autoHide: true,
                                delay: 5,
                                hideOnSecondTrigger: true,
                                className: `animated slideIn ${tId} context-menu-list`,
                                build: function($trigger, e) {
                    
                                    return {
                                        callback: function(key, opt) {
                                            
                                            if(_.includes(key,'diagnosis')) {
                                                self.detailAdd(inst.mouseOverSelectedRows);
                                            } else if(_.includes(key,'action')) {
                                                // 增加操作类型
                                                let action = _.last(key.split("_"));
                                                if(action == 'update'){
                                                    self.detailAdd(inst.mouseOverSelectedRows);
                                                } else if(action == 'delete'){
                                                    self.entityDelete({list: [inst.mouseOverSelectedRows], action:action});
                                                }
                                                
                                            }
                                        },
                                        items: items
                                    }
                                },
                                events: {
                                    show: function(opt) {
                    
                                        let $this = this;
                                        _.delay(function(){
                                            new Vue(mx.tagInput(`${tId}_single_tags`, `.${tId} input`, inst.selectedRows, fun));
                                        },50)
                                    },
                                    hide: function(opt) {
                    
                                        let $this = this;
                    
                                    }
                                }
                            });
                        },
                        resizeEventConsole(){
                            let evwH = $(window).height();
                            let evcH = $("#entity-view-container").height();
                            let evsH = $("#entity-view-summary").height();
                            
                            $("#entity-view-console .dataTables_scrollBody").css("max-height", evwH + "px")
                                                                            .css("max-height","-=225px")
                                                                            .css("max-height","-=" + evsH + "px")
                                                                            .css("min-height", evwH + "px")
                                                                            .css("min-height","-=225px")
                                                                            .css("min-height","-=" + evsH + "px");
                        },
                        entityDelete(item){
                            const self = this;
                            let ids = _.map(item.list,'id').join("<br><br>");
                            
                            alertify.confirm(`确认要删除以下实体，请确认！<br><br>
                                                删除实体数量：${item.list.length}<br><br>
                                                实体ID：<br><br>${ids}`, function (e) {
                                
                                if (e) {
                                    _.extend(item, {list:_.map(item.list,'id')});
                                    
                                    let rtn = fsHandler.callFsJScript("/entity/action.js",encodeURIComponent(JSON.stringify(item))).status;
                                    
                                    if(rtn == 'ok'){
                                        alertify.success(`实体${ids}删除成功！`);
                                        // 更新页面
                                        self.$refs.searchRef.search();
                                    }
                                } else {
                                    
                                }

                            });

                            $(".alertify-confirm .alertify-header i").addClass("fas fa-sync-alt fa-spin").css({
                                "color":"#ffffff",
                                "fontSize": "14px"
                            });
                            
                        },
                        entityDataImport(){
                            const me = this;
                            let wnd = null;

                            try{
                                if(jsPanel.activePanels.getPanel('jsPanel-class-template')){
                                    jsPanel.activePanels.getPanel('jsPanel-class-template').close();
                                }
                            } catch(error){

                            }
                            finally{
                                wnd = maxWindow.winClassTemplate('导入实体数据', `<div id="class-template-import"></div>`, null, null, null);
                            }

                            new Vue({
                                delimiters: ['#{', '}#'],
                                data:{
                                    fileList: [],
                                    rtnInfo: null
                                },
                                template: `<el-container style="height:100%;">
                                                <el-main style="padding:10px;">
                                                    <div v-if="!_.isEmpty(rtnInfo)">
                                                        <el-button type="text" icon="el-icon-close" @click="clearInfo"></el-button>
                                                        <section>
                                                            <code>#{rtnInfo.message.join(",")}#</code>
                                                        </section>
                                                    </div>
                                                    <el-upload
                                                        class="upload-demo"
                                                        drag
                                                        :auto-upload="false"
                                                        :on-change="onChange"
                                                        :file-list="fileList"
                                                        v-else>
                                                        <i class="el-icon-upload"></i>
                                                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                                                        <div class="el-upload__tip" slot="tip">只能上传Mql/Excel文件</div>
                                                    </el-upload>
                                                </el-main>
                                                <el-footer style="height:40px;line-height:40px;text-align:right;">
                                                    <el-button type="default" @click="onCancel">取消</el-button>
                                                    <el-button type="primary" @click="onImport">导入</el-button>
                                                </el-footer>
                                            </el-container>`,
                                methods:{
                                    onChange(file) {
                                        this.fileList = [file.raw];
                                    },
                                    onCancel(){
                                        wnd.close();
                                    },
                                    onImport(){
                                        this.rtnInfo = JSON.parse(omdbHandler.classDataImport(this.fileList[0]));
                                    },
                                    clearInfo(){
                                        this.rtnInfo = null;
                                    }
                                }
                            }).$mount("#class-template-import");
                        }
                    }
                };
                
                this.app = new Vue(main).$mount("#app");    
            });
        })

        window.addEventListener('resize', () => { 
            // RESIZE Event Summary
            eventHub.$emit("WINDOW-RESIZE-EVENT");
            
            let evwH = $(window).height();
            let evcH = $("#entity-view-container").height();
            let evsH = $("#entity-view-summary").height();
            
            $("#entity-view-console .dataTables_scrollBody").css("max-height", evwH + "px")
                                                            .css("max-height","-=225px")
                                                            .css("max-height","-=" + evsH + "px")
                                                            .css("min-height", evwH + "px")
                                                            .css("min-height","-=225px")
                                                            .css("min-height","-=" + evsH + "px");
        })

        
    }

}