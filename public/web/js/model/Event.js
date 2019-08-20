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
class Event {

    constructor() {

        // 运行模式定义
        window.EVENT_VIEW_LIST = ['view-normal','view-tags','view-fullscreen'];
        window.EVENT_VIEW = 'view-normal';
        
        this.app = null;
        this.detail = null;

        this.URL_PARAMS_CFG = null;
    }

    init() {
        const event = this;

        VueLoader.onloaded(["ai-robot-component",
                            "event-graph-component",
                            "event-datatable-component",
                            "event-diagnosis-datatable-component",
                            "event-summary-component",
                            "search-preset-component",
                            "search-base-component"],function() {
            $(function() {

                // 告警轨迹
                Vue.component("event-diagnosis-journal",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<el-container style="height: calc(100vh - 230px);">
                                    <el-main>
                                        <div class="block">
                                            <el-timeline>
                                                <el-timeline-item :timestamp="moment(item.vtime).format(mx.global.register.event.time.format)" placement="top" v-for="item in model.rows">
                                                    <el-card style="box-shadow: 0 0px 3px 0 rgba(0, 0, 0, 0.1);">
                                                        <p style="font-size:12px;">业务：#{item.biz}#</p>
                                                        <p style="font-size:12px;">服务器：#{item.host}#</p>
                                                        <p style="font-size:12px;">级别：#{item.severity | pickSeverity}#</p>
                                                        <p style="font-size:12px;">状态：#{item.status | pickStatus}#</p>
                                                        <p style="font-size:12px;">摘要：#{item.msg}#</p>
                                                    </el-card>
                                                </el-timeline-item>
                                            </el-timeline>
                                        </div>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickSeverity(item){
                            try{
                                return mx.global.register.event.severity[item][1];
                            } catch(err){
                                return '';
                            }
                            
                        },
                        pickStatus(item){
                            try {
                                return mx.global.register.event.status[item][1];
                            } catch(err){
                                return '';
                            }
                        }
                    }
                })

                // 告警雷达
                Vue.component("event-view-radar",{
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
                                        <el-tooltip placement="top" v-for="item in pg.child" open-delay="500">
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
                                    let name = '';
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
                Vue.component("event-view-pie",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            dataset:[]
                        }
                    },
                    template:   `<div style="width: 35%;height:200px;float: left;display: flex;">
                                    <max-echart-pie :id="id" :model="item" v-for="item in dataset"></max-echart-pie>
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
                            
                            self.dataset = [];
                            _.forEach(self.model.summary.pie,function(v,k){
                                _.forEach(v,function(val){
                                    self.dataset.push({
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

                // 告警统计
                Vue.component("event-view-summary",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            dataset:[]
                        }
                    },
                    template:   `<div style="width: 100%;height:200px;float:left;display: flex;flex-wrap: wrap;">
                                    <max-echart-pie-group :id="id+'-'+item.id" :model="item" v-for="item in dataset" @click.native="search(item)"></max-echart-pie-group>
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
                        },500)
                    },
                    methods: {
                        initData(){
                            const self = this;
                            
                            self.dataset = [];

                            _.forEach(self.model.summary.summary,function(v,k){
                                let sum = _.sum(_.map(v,function(s){return s[1];}));
                                _.forEach(v,function(val){
                                    self.dataset.push({
                                            dimension: k,
                                            id:objectHash.sha1(k+val+_.now()), 
                                            name: val[0], 
                                            count: val[1],
                                            sum: sum,
                                            percent: _.round(val[1]/sum*100,1),
                                            color: _.sample(['#ff0000','#ffd700','#666666','#00ffff','#40e0d0','#ff7373','#d3ffce','#3399ff','#000080','#66cccc','#a0db8e','#794044','#6897bb','#cc0000'])
                                        });
                                })
                            });
                            
                            self.dataset = _.orderBy(self.dataset,['percent'],['desc'])
                        },
                        search(event){
                            // 根据相应维度再搜索
                            this.$root.options.term = `${event.dimension}=${event.name}`;
                            this.$root.$refs.searchRef.search();
                        }
                    }
                });

                // 告警详情
                Vue.component("event-diagnosis-detail",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:String
                    },
                    template: `<el-container style="height: calc(100vh - 230px);">
                                    <el-main>
                                        <form class="form-horizontal">
                                            <div class="form-group" v-for="(value,key) in model.rows[0]" style="padding: 0px 10px;margin-bottom: 1px;">
                                                <label :for="key" class="col-sm-2 control-label" style="text-align:left;">#{key}#</label>
                                                <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                    <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value">
                                                </div>
                                            </div>
                                        </form>
                                    </el-main>
                                </el-container>`,
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
                            const self = this;
                            
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

                // 历史相关告警
                Vue.component("event-diagnosis-history",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            
                        }
                    },
                    template:  `<el-container style="height: calc(100vh - 230px);">
                                    <el-main style="padding:0px;">
                                        <event-diagnosis-datatable-component :id="id" :model="model" type="event"></event-diagnosis-datatable-component>
                                    </el-main>
                                </el-container>`,
                    mounted(){
                        const self = this;
                    },
                    methods: {
                        init(){    
                            const self = this;

                        }
                    }
                })

                // 智能分组 grid
                Vue.component("event-view-aigroup-grid",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            tableData: null,
                        }
                    },
                    watch: {
                        model(val,oldVal){
                            this.initData();
                        }
                    },
                    template:`<event-diagnosis-datatable-component :id="id" :model="tableData" type="event"></event-diagnosis-datatable-component>`,
                    mounted(){
                        // 默认维度关联事件
                        this.tableData = {
                            rows: this.$root.$data.model.message.rows,
                            columns: this.$root.$data.model.message.columns[this.$root.$data.model.message.rootclass],
                            options: this.$root.$data.model.message.options
                        };
                        this.initData();
                    },
                    methods: {
                        initData(){
                            const self = this;
                            let event = this.model;

                            if(event.length < 1) {
                                self.tableData = null;
                                return false;
                            }

                            try{
                                let temp = _.map(event,function(v){
                                    // MQL
                                    //return `${v.title}='${v.data}'`;
                                    // SEARCH
                                    return `${v.title}=${v.data}`;
                                })

                                // 获取相应维度的关联事件  eg: biz='查账系统'
                                // MQL
                                // let where = temp.join(` ${self.aiGroupData.ifOR=='1'?'and':'or'} `);
                                // SEARCH
                                let where = _.map(event,'ids').join(";");//`biz=matrix`;
                                self.tableData = fsHandler.callFsJScript("/event/aigroup-by-id.js", encodeURIComponent(where)).message.event;
                            } catch(err){
                                self.tableData = null;
                            }
                            
                        }
                    }
                })

                // 智能分组 graph
                Vue.component("event-view-aigroup-graph",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object,
                    },
                    data(){
                        return {
                            rId: _.now(),
                            tableData: null,
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
                            const self = this;
                            
                            if(this.model.length < 1) {
                                self.tableData = null;
                                return false;
                            }

                            try {
                                
                                // 获取相应维度的关联事件  eg: biz='查账系统'
                                // MQL
                                // let where = temp.join(` ${self.aiGroupData.ifOR=='1'?'and':'or'} `);
                                // SEARCH
                                let where = _.map(this.model,'ids').join(";");//`biz=matrix`;
                                self.tableData = fsHandler.callFsJScript("/event/aigroup-by-id.js", encodeURIComponent(where)).message.event;

                                if(!this.topological){
                                    this.topological = new Topological();
                                    this.topological.init();
                                    this.topological.graphScript = [
                                        {value: `match () - [*1] -> ("${_.map(this.tableData.rows,'entity').join('","')}") - [*1] -> ()`}
                                    ];
                                    this.topological.mount(`#topological-app-${self.id}-${self.rId}`);

                                } else {
                                    this.topological.graphScript = [ {value: `match () - [*1] -> ("${_.map(this.tableData.rows,'entity').join('","')}") - [*1] -> ()`} ];
                                    this.topological.search(this.topological.graphScript[0].value);
                                }

                                _.delay(() => {
                                    this.topological.setStyle();
                                },5000)

                            } catch(err){
                                self.tableData = null;
                            }
                            
                        }
                    },
                    destroyed() {
                        this.topological.destroy();
                    }
                })

                // 智能分组
                Vue.component("event-view-aigroup",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            aiGroupData: {
                                rows: [],
                                columns: [],
                                options: {
                                    searching: false,
                                    aDataSort: true,
                                    bSort: true,
                                    bAutoWidth: true,
                                    info: false,
                                    paging:         false,
                                    aoColumnDefs: [{sDefaultContent:'', aTargets:['_all']}],
                                    select: {
                                        style: 'single',
                                    }
                                },
                                selected: [],
                            },
                            split:{
                                inst: null
                            },
                            control: {
                                ifGraph: '0'
                            }
                        }
                    },
                    template: `<el-container style="height: calc(100vh - 155px);margin: -15px;">
                                    <el-aside style="width:300px;background: rgb(255, 255, 255);overflow:hidden;" class="split" id="aigroup-left-panel">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-main style="padding:0px;overflow:auto;">
                                                <table :id="id+'-table'" class="hover event-table-dimension" width="100%"></table>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container class="split" id="aigroup-right-panel">
                                        <el-header style="height:30px;line-height:30px;background: rgb(241, 241, 241);display:;">
                                            <el-tooltip :content="control.ifGraph==0?'列表':'图'" placement="top" open-delay="500">
                                                <div style="float:right;">
                                                    #{control.ifGraph==0?'列表':'图'}#
                                                    <el-switch
                                                    v-model="control.ifGraph"
                                                    active-color="#13ce66"
                                                    inactive-color="#dddddd"
                                                    active-value="0"
                                                    inactive-value="1"
                                                    @change="toggleView">
                                                    </el-switch>
                                                </div>
                                            </el-tooltip>
                                        </el-header>
                                        <el-main style="padding:0px;">
                                            <el-tabs v-model="control.ifGraph">
                                                <el-tab-pane label="" name="0">
                                                    <event-view-aigroup-grid :id="id + '-grid'" :model="aiGroupData.selected" ></event-view-aigroup-grid>
                                                </el-tab-pane>
                                                <el-tab-pane label="" name="1">
                                                    <event-view-aigroup-graph :id="id + '-graph'" :model="aiGroupData.selected" ></event-view-aigroup-graph>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    created(){
                        const self = this;

                        // 根据model进行分组
                        let ids = _.map(this.model.rows,'id').join(";");
                        let aiGroup = fsHandler.callFsJScript("/event/aigroup-list-by-ids.js",encodeURIComponent(self.$root.$refs.searchRef.result.term)).message;
                        self.aiGroupData.rows = aiGroup.rows;
                        self.aiGroupData.columns = [
                                                        {data:'type',title:'',sortable:true, width:'5',render: function(data,type,row){
                                                                return data==1?'<i class="fas fa-font"></i>':'<i class="fab fa-medium-m"></i>';
                                                            }
                                                        },
                                                        {data:'group',title:'分组名称',sortable:true},
                                                        {data:'app',title:'影响应用系统'},
                                                        {data:'severity',title:'告警级别统计', render:function(data,type,row){
                                                            return `<a href="javascript:void(0);" class="btn btn-link" style="max-width:30px;min-width:30px;padding: 2px 4px;background:${mx.global.register.event.severity[5][2]}">${data[0]}</a>
                                                                    <a href="javascript:void(0);" class="btn btn-link" style="max-width:30px;min-width:30px;padding: 2px 4px;background:${mx.global.register.event.severity[4][2]}">${data[1]}</a>
                                                                    <a href="javascript:void(0);" class="btn btn-link" style="max-width:30px;min-width:30px;padding: 2px 4px;background:${mx.global.register.event.severity[3][2]}">${data[2]}</a>`;
                                                        }},
                                                        {data:'ids',title:'IDS', visible: false}
                                            ];
                    },
                    mounted(){
                        const self = this;
                        
                        self.init();
                    },
                    methods: {
                        init(){    
                            const self = this;

                            //初始化维度选择Table
                            var table = $(`#${self.id}-table`).DataTable(_.extend(
                                                                        self.aiGroupData.options,{
                                                                            data: self.aiGroupData.rows,
                                                                            columns: self.aiGroupData.columns
                                                                        }));
                            
                            $(`#${self.id}-table tbody`).on( 'click', 'tr', function () {
                                if ( $(this).hasClass('selected') ) {
                                    $(this).removeClass('selected');
                                }
                                else {
                                    table.$('tr.selected').removeClass('selected');
                                    $(this).addClass('selected');
                                }
                            } );                                    

                            table.on( 'select', function ( e, dt, type, indexes ) {
                                self.aiGroupData.selected = table.rows( '.selected' ).data().toArray();
                                //self.handlerFetchData(self.aiGroupData.selected);
                            } ).on( 'deselect', function ( e, dt, type, indexes ) {
                                self.aiGroupData.selected = table.rows( '.selected' ).data().toArray();
                                //self.handlerFetchData(self.aiGroupData.selected);
                            } );

                            $(self.$el).find('td').css("white-space","normal");
                            
                            self.split.inst = Split(['#aigroup-left-panel', '#aigroup-right-panel'], {
                                sizes: [35, 65],
                                minSize: [0, 0],
                                gutterSize: 5,
                                gutterAlign: 'end',
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true,
                            });

                            // 默认选择第一行
                            $(`#${self.id}-table`).DataTable().row(':eq(0)', { page: 'current' }).select();                            
                            self.aiGroupData.selected = $(`#${self.id}-table`).DataTable().rows( '.selected' ).data().toArray();
                            //self.handlerFetchData(self.aiGroupData.selected);

                            // 隐藏tabs header
                            $(".el-tabs > .el-tabs__header",this.$el).css({
                                "display":"none"
                            });
                        },
                        toggleView(event){
                            this.control.ifGraph = event;
                        }
                    }
                })

                // 维度关联性告警
                Vue.component("event-diagnosis-dimension",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            dimensionData: {
                                rows: [],
                                columns: [],
                                options: {
                                    searching: false,
                                    aDataSort: false,
                                    bSort: false,
                                    bAutoWidth: true,
                                    info: false,
                                    paging:         false,
                                    aoColumnDefs: [{sDefaultContent:'', aTargets:['_all']}],
                                    stateSave: false,
                                    keys:  true,
                                    select: {
                                        style: 'multi',
                                    }
                                },
                                selected: [],
                                ifOR: '1'
                            },
                            tableData: {},
                        }
                    },
                    template:  `<el-container style="height: calc(100vh - 230px);">
                                    <el-aside style="background: rgb(241, 241, 241);overflow:hidden;" class="split" id="left-panel">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-header style="height: 30px;
                                                                padding: 5px 10px;
                                                                float: right;
                                                                line-height: 20px;">
                                                当前告警
                                                <el-switch
                                                    v-model="dimensionData.ifOR"
                                                    active-text="AND"
                                                    inactive-text="OR"
                                                    style="right:-40%;">
                                                </el-switch>
                                            </el-header>
                                            <el-main style="padding:0px;overflow:auto;">
                                                <table :id="id+'-table'" class="display event-table-dimension" width="100%"></table>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container class="split" id="right-panel">
                                        <el-main style="padding:0px;">
                                            <event-diagnosis-datatable-component :id="id + '-dimension-by-value'" :model="tableData" type="event"></event-diagnosis-datatable-component>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    mounted(){
                        const self = this;
                        
                        // 默认维度关联事件
                        self.tableData = self.model;

                        self.init();

                    },
                    methods: {
                        init(){    
                            const self = this;

                            self.dimensionData.rows = _.map(_.toPairs(self.model.rows[0]),function(v){
                                return {title:v[0],data:v[1]};
                            });

                            self.dimensionData.columns = [{data:'title',title:'维度'},{data:'data',title:'值'}];

                            self.menuData = _.groupBy(_.keys(self.model.rows[0]),function(v){
                                return v.substr(0,1);
                            })

                            _.delay(function(){
                                //初始化维度选择Table
                                let table = $(`#${self.id}-table`).DataTable(_.extend(self.dimensionData.options,{
                                                                                data: self.dimensionData.rows,
                                                                                columns: self.dimensionData.columns
                                                                            }));
                                
                                table.on( 'select', function ( e, dt, type, indexes ) {
                                    self.dimensionData.selected = table.rows( '.selected' ).data().toArray();
                                    self.handlerFetchData(self.dimensionData.selected);
                                } ).on( 'deselect', function ( e, dt, type, indexes ) {
                                    self.dimensionData.selected = table.rows( '.selected' ).data().toArray();
                                    self.handlerFetchData(self.dimensionData.selected);
                                } );

                                // table style
                                $(self.$el).find("thead:eq(0)").css("display","none");

                                Split(['#left-panel', '#right-panel'], {
                                    sizes: [45, 55],
                                    gutterSize: 5,
                                    cursor: 'col-resize',
                                    direction: 'horizontal',
                                });

                                // 默认选择第一行
                                $(`#${self.id}-table`).DataTable().row(':eq(0)', { page: 'current' }).select();                            
                                self.dimensionData.selected = $(`#${self.id}-table`).DataTable().rows( '.selected' ).data().toArray();
                                self.handlerFetchData(self.dimensionData.selected);
                            },500)
                            
                            
                        },
                        handlerFetchData(event){
                            const self = this;

                            if(event.length < 1) {
                                self.tableData = [];
                                return false;
                            }

                            try{
                                let temp = _.map(event,function(v){
                                    // MQL
                                    //return `${v.title}='${v.data}'`;
                                    // SEARCH
                                    return `${v.title}=${v.data}`;
                                })

                                // 获取相应维度的关联事件  eg: biz='查账系统'
                                // MQL
                                // let where = temp.join(` ${self.dimensionData.ifOR=='1'?'and':'or'} `);
                                // SEARCH
                                let where = temp.join(` ${self.dimensionData.ifOR=='1'?' | ':'; '} `);
                                self.tableData = fsHandler.callFsJScript("/event/diagnosis-dimension-by-value.js", encodeURIComponent(where)).message.event;
                            } catch(err){
                                self.tableData = [];
                            }
                            
                        }
                    }
                })

                // 概率相关性告警
                Vue.component("event-diagnosis-probability",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            tableData: null
                        }
                    },
                    template:  `<el-container style="height: calc(100vh - 230px);">
                                    <el-aside class="split" :id="'probability-left-panel-'+id">
                                        <el-container>
                                            <el-header style="text-align: right; font-size: 12px;line-height: 24px;height:24px;">
                                                
                                            </el-header>
                                            <el-main style="display: flex;flex-wrap: wrap;align-content: space-around;justify-content: space-between;padding: 0px 10px 0px 10px;" v-if="model.rows">
                                                <el-button type="success" style="flex: 0 1 18%;padding: 30px;border-radius: 30px;margin: 5px;" v-for="item in model.rows" :data-item="item.name" @click="toggleEvent(item.name)">
                                                    #{item.names.length}#
                                                </el-button>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container class="split" :id="'probability-right-panel-'+id">
                                        <el-main style="padding:0px;">
                                            <event-diagnosis-datatable-component :id="id + '-table'" :model="tableData" type="event"></event-diagnosis-datatable-component>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    mounted(){
                        this.init();

                        // 默认维度关联事件
                        this.tableData = {  rows: this.model.rows[0].events, 
                                            options: this.model.options,
                                            columns: this.model.columns, 
                                            template: this.model.template
                                        };
                    },
                    methods: {
                        init(){    
                            const self = this;
                            
                            Split([`#probability-left-panel-${self.id}`, `#probability-right-panel-${self.id}`], {
                                sizes: [30, 70],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal',
                            });

                        },
                        toggleEvent(event){
                            _.extend(this.tableData, { rows: _.find(this.model.rows,{name:event}).events } );
                            console.log(this.tableData.rows.length)
                        }
                    }
                })

                // 资源信息
                let eventDiagnosisTopological = Vue.extend({
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:  `<el-container style="height: calc(100vh - 230px);">
                                    <el-main style="padding:0px;">
                                        <div :id="'topological-app-'+id"></div>
                                    </el-main>
                                </el-container>`,
                    mounted(){
                        this.init();
                    },
                    methods: {
                        init(){    
                            let mxTopo= new Topological();
                            mxTopo.init();
                            mxTopo.graphScript = _.map(this.model.rows,function(v){
                                return {value: `match () - [*1] -> ("${v.entity}") - [*1] -> ()`};
                            });
                            console.log(2,mxTopo.graphScript)
                            mxTopo.mount(`#topological-app-${this.id}`);
                            
                            _.delay(()=>{
                                mxTopo.app.contextMenu();
                            },500)

                        }
                    }
                });

                // Runbook
                // 获取下发脚本列表，获取脚本下发执行结果
                let eventDiagnosisScript = Vue.extend({
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            tableData: {
                                rows: [],
                                columns: [],
                                options: {
                                    searching: false,
                                    aDataSort: true,
                                    bSort: true,
                                    bAutoWidth: true,
                                    info: false,
                                    paging:         false,
                                    aoColumnDefs: [{sDefaultContent:'', aTargets:['_all']}],
                                    select: {
                                        style: 'single',
                                    }
                                },
                                selected: [],
                                result:{
                                    runid: "",
                                    sid: "",
                                    outputs: []
                                }
                            },
                            split:{
                                inst: null
                            }
                        }
                    },
                    template:  ` <el-container style="height:calc(100vh - 230px);">
                                    <el-aside style="width:300px;background: rgb(241, 241, 241);overflow:hidden;" class="split" :id="id+'-left-panel'">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-main style="padding:0px;overflow:auto;">
                                                <table :id="id+'-table'" class="hover event-table-dimension" width="100%"></table>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container class="split" :id="id+'-right-panel'">
                                        <el-header style="height:30px;line-height:30px;background: rgb(241, 241, 241);display:;padding: 0;">
                                            <el-tooltip content="下发脚本">
                                                <a href="javascript:void(0);" class="btn btn-link" style="float: right;" @click="scriptRun"><i class="fas fa-running"></i></a>
                                            </el-tooltip>
                                        </el-header>
                                        <el-main style="padding:0px;background:#333333;">
                                            <div contenteditable="true" style="height:100vh;color:rgb(23, 236, 59);outline-style: none;white-space: pre-line;">
                                                #{tableData.result.outputs.toString()}#
                                            </div>
                                        </el-main>
                                        <el-footer style="height:30px;line-height:30px;background: rgb(241, 241, 241);display:;padding: 0;">
                                            <el-tooltip :content="'查看作业: ' + tableData.result.runid">
                                                <a href="javascript:void(0);" class="btn btn-link" style="float: right;" @click="job(tableData.result.runid)"><i class="fas fa-task"></i> #{tableData.result.runid}#</a>
                                            </el-tooltip>
                                            <el-tooltip :content="'查看会话: ' + tableData.result.sid">
                                                <a href="javascript:void(0);" class="btn btn-link" style="float: right;" @click="job(tableData.result.sid)"><i class="fas fa-task"></i> #{tableData.result.sid}#</a>
                                            </el-tooltip>
                                        </el-footer>
                                    </el-container>
                                </el-container>`,
                    created(){
                        this.tableData = _.extend(this.tableData,{
                            rows: this.model.rows,
                            columns: this.model.template
                        });
                    },
                    mounted(){
                        this.init();
                    },
                    watch: {
                        'tableData.selected':{
                            handler(val, oldVal) {
                                if(val !== oldVal){
                                    this.tableData.result.outputs = [];
                                }
                            },
                            immediate: true
                        }
                    },
                    methods: {
                        init(){    
                            const self = this;

                            //初始化维度选择Table
                            var table = $(`#${self.id}-table`).DataTable(_.extend(
                                                                        self.tableData.options,{
                                                                            data: self.tableData.rows,
                                                                            columns: self.tableData.columns
                                                                        }));
                            
                            $(`#${self.id}-table tbody`).on( 'click', 'tr', function () {
                                if ( $(this).hasClass('selected') ) {
                                    $(this).removeClass('selected');
                                }
                                else {
                                    table.$('tr.selected').removeClass('selected');
                                    $(this).addClass('selected');
                                }
                            } );                                    

                            table.on( 'select', function ( e, dt, type, indexes ) {
                                self.tableData.selected = table.rows( '.selected' ).data().toArray();
                                //self.handlerFetchData(self.tableData.selected);
                            } ).on( 'deselect', function ( e, dt, type, indexes ) {
                                self.tableData.selected = table.rows( '.selected' ).data().toArray();
                                //self.handlerFetchData(self.tableData.selected);
                            } );

                            $(self.$el).find('td').css("white-space","normal");
                            
                            self.split.inst = Split([`#${self.id}-left-panel`, `#${self.id}-right-panel`], {
                                sizes: [35, 65],
                                minSize: [0, 0],
                                gutterSize: 5,
                                gutterAlign: 'end',
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true,
                            });

                            // 默认选择第一行
                            $(`#${self.id}-table`).DataTable().row(':eq(0)', { page: 'current' }).select();                            
                            self.tableData.selected = $(`#${self.id}-table`).DataTable().rows( '.selected' ).data().toArray();
                            //self.handlerFetchData(self.tableData.selected);
                        },
                        scriptRun(){
                            let cmd = this.tableData.selected[0].name;
                            let server = "wecise";
                            let user = "matrix";
                            try {
                                this.tableData.result.outputs[0] = `${server}:~ ${user}$ ${cmd}\n`;

                                let rtn = jobHandler.callJob(cmd,'wecise');
                                this.tableData.result.runid = rtn.message.runid;
                                this.tableData.result.sid = rtn.message.sid;
                                this.tableData.result.outputs.push(rtn.message.outputs[0]);

                            } catch(err){
                                this.tableData.result.outputs = [];
                            }
                        },
                        job(term){

                            // 默认Job名称
                            if(!term){
                                term = 'remote_command';
                            }
                            let url = `/janesware/job?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                })
                
                let main = {
                    delimiters: ['${', '}'],
                    template: "#app-template",
                    data: {
                        // 布局
                        layout:{
                            main:{
                                tabIndex: 1,
                                activeIndex: 'event-view-console',
                                tabs:[
                                    {name: 'event-view-console', title:'告警列表', type: 'main'}
                                ],
                                detail: {
                                    model: [],
                                    tabIndex: 1,
                                    activeIndex: '1',
                                }
                            },
                            summary: {
                                tabIndex: 1,
                                activeIndex: 'event-view-radar',
                                tabs:[
                                    {name: 'event-view-radar', title:'告警雷达', type: 'radar'},
                                    // {name: 'event-view-pie', title:'告警统计', type: 'pie'},
                                    // {name: 'event-view-summary', title:'告警统计', type: 'summary'}
                                ]
                            }
                        },
                        control: {
                            ifSmart: '0',
                            ifAiGroup: '0',
                            ifRefresh: '0'
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
                            name:"所有", 
                            value: "",
                            // 输入
                            term: "",
                            // 指定类
                            class: "#/matrix/devops/event/:",
                            // 指定api
                            api: "event",
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
                    watch:{
                        'layout.main.tabs':{
                            handler(val,oldVal){
                                if(val.length > 1){
                                    $("#tab-event-view-console").show();
                                }else {
                                    $("#tab-event-view-console").hide();
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
                    components: {
                        'event-diagnosis-topological': eventDiagnosisTopological,
                        'event-diagnosis-script': eventDiagnosisScript
                    },
                    created(){
                        try {
                            if(mx.urlParams['cfg']){
                                event.URL_PARAMS_CFG = _.attempt(JSON.parse.bind(null, decodeURIComponent(window.atob(mx.urlParams['cfg']))));
                            }
                            
                            let init = function(){
                    
                                _.forEach(event.URL_PARAMS_CFG,function(v,k){
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
                    
                            };
                            _.delay(()=>{
                                init();
                            },50)
                        } catch(err){
                            event.URL_PARAMS_CFG = null;
                        }

                        // 初始化term
                        try{
                            let term = decodeURIComponent(window.atob(mx.urlParams['term']));
                            this.options.term = term;
                        } catch(err){

                        }

                        // 接收搜索数据
                        eventHub.$on(`SEARCH-RESPONSE-EVENT-${this.model.id}`, this.setData);
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT",event.resizeEventConsole);
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
                        },2000);
                        
                    },
                    methods: {
                        setData(event){
                            _.extend(this.model, this.$refs.searchRef.result);
                        },
                        hideTabEventViewConsoleUl(){
                            const self = this;

                            if($('#tab-event-view-console').is(':visible')) {
                                $("#tab-event-view-console").hide();
                            $("#tab-event-view-console > span").hide();
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
                        toggleSummaryBySmart(evt){
                            if(evt==1) {
                                $("#event-view-summary").css("height","200px").css("display","");
                            } else {
                                $("#event-view-summary").css("height","0px").css("display","none");
                            }
                            this.control.ifSmart = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Event Console
                            
                            event.resizeEventConsole();
                        },
                        toggleSummaryByGroup(evt){
                            const self = this;

                            if(evt==1) {
                                self.aiGroup();
                                $("#event-view-aigroup").css("height","200px").css("display","");
                            } else {
                                $("#event-view-aigroup").css("height","0px").css("display","none");

                                //关闭智能分组
                                try {
                                    let id = _.find(self.layout.main.tabs,{type:'aiGroup'}).name;
                                    if(id){
                                        self.detailRemove(id);
                                    }
                                } catch(err){

                                }
                            }
                            this.control.ifAiGroup = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Event Console
                            
                            event.resizeEventConsole();
                        },
                        toggleSummaryByRefresh(evt){
                            const self = this;
                            
                            if(evt==1) {
                                window.intervalListener = setInterval(function(){
                                    self.$refs.searchRef.search();
                                },5000)
                            } else {
                                clearInterval(window.intervalListener);
                            }

                            this.control.ifRefresh = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Event Console
                            
                            event.resizeEventConsole();
                        },
                        aiGroup(){
                            try {
                                let id = _.now();
                                
                                // 添加tab
                                let aiGroup = {title:`智能分组`, name:`aiGroup-${id}`, type: 'aiGroup', child:[]};
                                
                                this.layout.main.tabs.push(aiGroup);
                                this.layout.main.activeIndex = `aiGroup-${id}`;
                                
                            } catch(error){
                                this.layout.main.tabs = [];
                            }
                        },
                        handleClick(tab, event) {
                            let tmp = _.find(this.layout.main.tabs,{name: tab.name});
                            if(tmp.child){
                                this.layout.main.detail.activeIndex = _.first(tmp.child).name;
                            }
                        },
                        detailAdd(event){
                            try {
                                let id = event.id;
                                if(this.layout.main.activeIndex === `diagnosis-${id}`) return false;
                                
                                // event
                                let term = encodeURIComponent(JSON.stringify(event).replace(/%/g,'%25'));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript('/event/diagnosis-by-id.js',term).message;
                                
                                // 添加tab
                                let detail = {title:`告警分析 ${event.id}`, name:`diagnosis-${id}`, type: 'diagnosis', child:[
                                                {title:'告警详情', name:`diagnosis-detail-${id}`, type: 'detail', model:model},
                                                {title:'告警轨迹', name:`diagnosis-journal-${id}`, type: 'journal', model:model},
                                                {title:'维度关联性告警', name:`diagnosis-dimension-${id}`, type: 'dimension', model:model},
                                                {title:'概率相关性告警', name:`diagnosis-probability-${id}`, type: 'probability', model:model},
                                                {title:'历史相似告警', name:`diagnosis-history-${id}`, type: 'history', model:model},
                                                {title:'资源信息', name:`diagnosis-topological-${id}`, type: 'topological', model:model},
                                                {title:'Runbook', name:`diagnosis-script-${id}`, type: 'script', model:model}
                                            ]};
                                this.layout.main.activeIndex = `diagnosis-${id}`;
                                this.layout.main.tabs.push(detail);
                                this.layout.main.detail.activeIndex = _.first(detail.child).name;
                                
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
                                
                                _.delay(function(){
                                    // RESIZE Event Summary
                                    eventHub.$emit("WINDOW-RESIZE-EVENT");
                                    // RESIZE Event Console
                                    event.resizeEventConsole();
                                },500)
                            } catch(err){
                                
                            } finally{
                                // AI Group
                                if(_.includes(targetName,'aiGroup')){
                                    this.control.ifAiGroup = '0';
                                }
                            }
                        },
                        action(event){
                            const self = this;
                            
                            let tip = null;
                            let list = [];

                            if(event.list.length < 2){
                                list = event.list;
                                tip = `确定要【${mx.global.register.event.status[event.action][1]}】以下事件？<br><br>
                                        告警摘要：${list[0].msg}<br><br>
                                        告警时间：${moment(list[0].vtime).format("YYYY-MM-DD HH:mm:SS")}<br><br>
                                        告警级别：${list[0].severity}<br><br>
                                        告警时间：${list[0].status}<br><br>
                                        告警ID：${list[0].id}`
                            } else {
                                list =  _.map(event.list,function(v){ 
                                            return _.pick(v, ['id','class'])
                                        });
                                let ids = _.map(list,'id').join("<br><br>");
                                tip = `确定要【${mx.global.register.event.status[event.action][1]}】以下事件？<br><br>
                                        告警ID【${list.length}】：<br><br>${ids}`
                            }

                            alertify.confirm(`${tip}`, function (e) {
                                if (e) {
                                    let rtn = fsHandler.callFsJScript("/event/action-by-id.js", encodeURIComponent(JSON.stringify(event).replace(/%/g,'%25'))).message;
                                    if(rtn == 1){
                                        self.options.term = _.map(list,'id').join(";");
                                        self.$refs.searchRef.search();
                                    }
                                } else {
                                    
                                }
                            });
                            
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
                                                self.detailAdd(inst.selectedRows);
                                            } else if(_.includes(key,'action')) {
                                                // 增加操作类型
                                                let action = _.last(key.split("_"));
                                                self.action({list: [inst.selectedRows], action:action});
                                            } else if(_.includes(key,'ticket')){
                                                alertify.confirm(`确定生成工单<br><br>
                                                                    告警ID：${inst.selectedRows.id}<br><br>
                                                                    实体ID：${inst.selectedRows.entity}<br><br>
                                                                    模板ID：b223c78b-3107-11e6-8487-446d577ed81c<br><br>
                                                                    告警摘要：${inst.selectedRows.msg}<br><br>
                                                                    告警时间：${moment(inst.selectedRows.vtime).format("LLL")}<br><br>`, function (e) {
                                                    if (e) {
                                                        try{
                                                            let rtn = fsHandler.callFsJScript("/matrix/readysoft/eventToTicket.js", encodeURIComponent(JSON.stringify(inst.selectedRows).replace(/%/g,'%25'))).message.data;
                                                            if(rtn.data.success == 1){
                                                                self.options.term = inst.selectedRows.id;
                                                                self.$refs.searchRef.search();
                                                                alertify.success(`创建工单成功! <br><br>
                                                                            工单单号：${rtn.data.ticket_number}`)
                                                            }
                                                        }catch(err){
                                                            alertify.error(`创建工单失败，请确认！ <br><br>
                                                                            ${rtn}<br><br>
                                                                            ${err}`)
                                                        }
                                                    } else {
                                                        
                                                    }
                                                });
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
                        }
                    }
                };

                event.app = new Vue(main).$mount("#app");    
            });
        })

        
        window.addEventListener('resize', () => { 
            
            event.resizeEventConsole();

            // RESIZE Event Summary
            eventHub.$emit("WINDOW-RESIZE-EVENT");
        })

        
    }

    

    resizeEventConsole(){
        let evwH = $(window).height();
        let evcH = $("#event-view-container").height();
        let evsH = $("#event-view-summary").height();
        
        $("#event-view-console .dataTables_scrollBody").css("max-height", evwH + "px")
                                                        .css("max-height","-=250px")
                                                        .css("max-height","-=" + evsH + "px")
                                                        .css("min-height", evwH + "px")
                                                        .css("min-height","-=250px")
                                                        .css("min-height","-=" + evsH + "px");
    }

    /* resizeEventConsole(){
        let evcH = $("#event-view-container").height();
        let evsH = $("#event-view-summary").height();
        let otherH = 120;
        console.log(1,evcH)
        $("#event-view-console .dataTables_scrollBody").css("max-height", evcH + "px")
                                                        .css("max-height","-=" + evsH + "px")
                                                        .css("max-height","-=" + otherH + "px")
                                                        .css("min-height", evcH + "px")
                                                        .css("min-height","-=" + evsH + "px")
                                                        .css("min-height","-=" + otherH + "px");
    } */

    checkContainer(){
        if($('#event-view-container').is(':visible')) {
            this.layout();
            this.resizeContainer();
        } else {
            setTimeout(this.checkContainer, 50);
        }
    }

    resizeContainer(){
        
        let evwH = $(window).height();
        let headerH = $("header#header").height();
        let footerH = $("footer#footer").height();
        let otherH = 45;

        $("#event-view-container").css("min-height",evwH + "px")
                                    .css("min-height","-=" + headerH + "px")
                                    .css("min-height","-=" + footerH + "px")
                                    .css("min-height","-=" + otherH + "px");
        
    }
}