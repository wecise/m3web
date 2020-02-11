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
class Job extends Matrix {

    constructor() {
        super();

        // 运行模式定义
        window.EVENT_VIEW_LIST = ['view-normal','view-tags','view-fullscreen'];
        window.EVENT_VIEW = 'view-normal';
        
        this.app = null;
        this.detail = null;
    }

    init() {

        VueLoader.onloaded(["ai-robot-component",
                            "job-datatable-component",
                            "job-diagnosis-datatable-component",
                            "search-preset-component",
                            "search-base-component",
                            "probe-tree-component"],function() {
            $(function() {

                // JobList Table组件
                Vue.component("el-joblist-component",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            dt:{
                                rows:[],
                                columns: [],
                                selected: []
                            },
                            info: []
                        }
                    },
                    watch: {
                        model: {
                            handler(val,oldVal){
                                this.initData();
                            },
                            deep:true,
                            immediate:true
                        },
                        dt: {
                            handler(val,oldVal){
                                this.info = [];
                                this.info.push(`共 ${this.dt.rows.length} 项`);
                                this.info.push(`已选择 ${this.dt.selected.length} 项`);
                                this.info.push(moment().format("YYYY-MM-DD HH:MM:SS.SSS"));
                            },
                            deep:true,
                            immediate:true
                        }
                    },
                    template:   `<el-container class="animated fadeIn" style="height:calc(100vh - 145px);">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-tooltip content="运行模式切换" open-delay="500" placement="top">
                                            <el-button type="text" @click="onToggle" icon="el-icon-notebook-2"></el-button>
                                        </el-tooltip>
                                        <el-tooltip :content="mx.global.register.event.status[item][1]" open-delay="500" placement="top" v-for="item in model.actions" v-if="model.actions">
                                            <el-button type="text" @click="onAction(item)" :icon="mx.global.register.event.status[item][2]"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="导出" delay-time="500">
                                            <el-dropdown @command="onExport">
                                                <span class="el-dropdown-link">
                                                    <i class="el-icon-download el-icon--right"></i>
                                                </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item command="csv">CSV</el-dropdown-item>
                                                    <el-dropdown-item command="json">JSON</el-dropdown-item>
                                                    <!--el-dropdown-item command="pdf">PDF</el-dropdown-item-->
                                                    <el-dropdown-item command="png">PNG</el-dropdown-item>
                                                    <!--el-dropdown-item command="sql">SQL</el-dropdown-item-->
                                                    <el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </el-tooltip>
                                    </el-header>   
                                    <el-main style="padding:0px;">
                                        <el-table
                                            :data="dt.rows"
                                            highlight-current-row="true"
                                            style="width: 100%"
                                            :row-class-name="rowClassName"
                                            :header-cell-style="headerRender"
                                            @row-dblclick="onRowContextmenu"
                                            @row-contextmenu="onRowContextmenu"
                                            @row-click="onRowContextmenu"
                                            @selection-change="onSelectionChange"
                                            ref="table">
                                            <el-table-column type="selection" align="center"></el-table-column> 
                                            <el-table-column type="expand">
                                                <template slot-scope="props">
                                                    <el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f7f7f7;" >
                                                        <el-form-item v-for="v,k in props.row" :label="k">
                                                            <el-input v-model="v"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </template>
                                            </el-table-column>
                                            <el-table-column :prop="item.field" 
                                                :label="item.title" 
                                                sortable 
                                                show-overflow-tooltip
                                                :formatter="item.render" 
                                                v-for="item in dt.columns"
                                                :width="item.width"
                                                v-if="item.visible">
                                            </el-table-column>
                                        </el-table>
                                    </el-main>
                                    <el-footer  style="height:30px;line-height:30px;">
                                        #{ info.join(' &nbsp; | &nbsp;') }#
                                    </el-footer>
                                </el-container>`,
                    mounted(){

                    },
                    methods: {
                        initData(){
                            const self = this;
                            
                            let init = function(){
                                
                                _.extend(self.dt, {columns: _.map(self.model.template, function(v){
                                    
                                    if(_.isUndefined(v.visible)){
                                        _.extend(v, { visible: true });
                                    }

                                    if(!v.render){
                                        return v;
                                    } else {
                                        return _.extend(v, { render: eval(v.render) });
                                    }
                                    
                                })});

                                _.extend(self.dt, {rows: self.model.rows});
                                    
                            };

                            if(self.model && $("table",self.$el).is(':visible')){
                                init();
                            } else {
                                setTimeout(init,50);
                            }
                            
                        },
                        rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0) {
                                //return 'text-align:center;';
                            }
                        },
                        onSelectionChange(val) {
                            this.dt.selected = val;
                        },
                        onAction(evt){
                            if(_.isEmpty(this.dt.selected)){
                                this.$message({
                                    type: "info",
                                    message: "请选择事件！"
                                });
                                return false;
                            }

                            this.$root.action( {list: this.dt.selected, action:evt});
                        },
                        onToggle(){
                            this.$root.toggleModel(_.without(['view-normal','view-tags'],window.EVENT_VIEW).join(""));
                        },
                        onRowContextmenu(row, column, event){
                            const self = this;

                            $.contextMenu( 'destroy' ).contextMenu({
                                selector: `.${column.id}`,
                                trigger: "right",
                                autoHide: true,
                                delay: 5,
                                hideOnSecondTrigger: true,
                                className: `animated slideIn ${column.id}`,
                                build: function($trigger, e) {
                                    
                                    return {
                                        callback: function(key, opt) {
                                            
                                            if(_.includes(key,'diagnosis')) {
                                                self.$root.detailAdd(row);
                                            } else if(_.includes(key,'action')) {
                                                // 增加操作类型
                                                let action = _.last(key.split("_"));
                                                self.$root.action({list: [row], action:action});
                                            } else if(_.includes(key,'ticket')){
                                                alertify.confirm(`确定生成工单<br><br>
                                                                    告警ID：${row.id}<br><br>
                                                                    实体ID：${row.entity}<br><br>
                                                                    模板ID：b223c78b-3107-11e6-8487-446d577ed81c<br><br>
                                                                    告警摘要：${row.msg}<br><br>
                                                                    告警时间：${moment(row.vtime).format("LLL")}<br><br>`, function (e) {
                                                    if (e) {
                                                        try{
                                                            let rtn = fsHandler.callFsJScript("/matrix/readysoft/eventToTicket.js", encodeURIComponent(JSON.stringify(row).replace(/%/g,'%25'))).message.data;
                                                            if(rtn.data.success == 1){
                                                                self.options.term = row.id;
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
                                        items: self.model.contextMenu.job
                                    }
                                },
                                events: {
                                    show(opt) {
                
                                        let $this = this;
                                        _.delay(()=>{
                                            new Vue(mx.tagInput(`${column.id}_single_tags`, `.${column.id} input`, row, self.$root.$refs.searchRef.search));
                                        },50)
                                    }
                                }
                            });
                        },
                        onExport(type){
                    
                            let options = {
                                csvEnclosure: '',
                                csvSeparator: ', ',
                                csvUseBOM: true,
                                ignoreColumn: [0,1],
                                fileName: `tableExport_${moment().format("YYYY-MM-DD HH:MM:SS")}`,
                                type: type,
                            };
        
                            if(type === 'png'){
                                //$(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
                                $(this.$refs.table.$el.querySelector("table.el-table__body")).tableExport(options);
                            } else if(type === 'pdf'){
                                _.extend(options, {
                                    jspdf: {orientation: 'l',
                                            format: 'a3',
                                            margins: {left:10, right:10, top:20, bottom:20},
                                            autotable: {styles: {fillColor: 'inherit', 
                                                                    textColor: 'inherit'},
                                                        tableWidth: 'auto'}
                                    }
                                });
                                $(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
                            } else {
                                $(this.$refs.table.$el.querySelectorAll("table")).tableExport(options);
                            }
                            
                        }
                    }
                })

                Vue.component('job-history-chart', {
                    template: `<div :id="id" style="width:100%;height:200px;"></div>`,
                    props:{
                        id:String,
                        model:Object
                    },
                    data(){
                        return {
                            chart: null,
                            option: {
                                tooltip: {
                                    trigger: 'axis'
                                },
                                xAxis: {
                                    type: 'category',
                                    data: []
                                },
                                yAxis: {
                                    type: 'value'
                                },
                                series: [{
                                    data: [],
                                    type: 'line',
                                    smooth: true
                                }]
                            }                            
                        }
                    },
                    created(){
                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT", this.checkChart);
                    },
                    mounted() {
                        this.init();
                    },
                    watch: {
                        model: {
                            handler: function (val,oldVal) {
                                
                            },
                            deep:true
                        }
                    },
                    methods: {
                        init(){
                            this.initData();
                            this.chart = echarts.init(this.$el);
                            this.chart.setOption(this.option);
                        },
                        initData(){
                            const self = this;
                            this.option.xAxis.data = [];
                            this.option.series[0].data = [];
                            _.forEach(this.model.reverse(),function(v){
                                self.option.xAxis.data.push(moment(v.vtime).format("YY-MM-DD HH:mm:SS"));
                                self.option.series[0].data.push(v.value);
                            });
                        },
                        checkChart(){
                            const self = this;
        
                            if(self.chart.id){
                                self.chart.resize();
                            } else {
                                setTimeout(self.checkChart, 50);
                            }
                        }
                    }
                }); 

                // 雷达
                Vue.component("job-radar",{
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

                // 仪表盘
                Vue.component("job-gauge",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    data:function(){
                        return {
                            gauge: [
                                {host:'wecise',inst:'',param:'', value:25,status:'success', showText:false},
                                {host:'wecise',inst:'',param:'', value:80,status:'success', showText:false},
                                {host:'wecise',inst:'',param:'', value:100,status:'success', showText:false},
                                {host:'wecise',inst:'',param:'', value:50,status:'text', showText:false},
                                {host:'wecise',inst:'',param:'', value:100,status:'exception', showText:false},
                                {host:'wecise',inst:'',param:'', value:75,status:'success', showText:false}
                            ]
                        }
                    },
                    template: ` <el-row :gutter="0">
                                    <el-col :span="3" v-for="item in gauge">
                                        <div class="grid-content" style="text-align: center;">
                                            <el-progress type="circle" :percentage="item.value" :status="item.status"></el-progress>
                                            <p>#{item.host}#</p>
                                        </div>
                                    </el-col>
                                </el-row>`,
                    mounted:function(){
                        this.init();
                    },
                    methods: {
                        init: function(){
                            const self = this;
                        
                        }
                    }
                    
                });

                // 执行命令时间轴
                Vue.component("cmds-timeline",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<div class="block"><el-timeline>
                                    <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model">
                                        <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                            <h4>名称：#{item.name}#</h4>
                                            <p style="font-size:12px;"><code>命令：#{item.cmd}#</code></p>
                                            <p style="font-size:12px;">位置：#{item.dir}#</p>
                                            <p style="font-size:12px;">源：#{item.source}#</p>
                                            <p style="font-size:12px;">服务器：#{item.host}#</p>
                                            <p style="font-size:12px;">进程ID：#{item.pid}#</p>
                                            <p style="font-size:12px;">RUNID：#{item.runid}#</p>
                                            <p style="font-size:12px;">SID：#{item.sid}#</p>
                                            <p v-if="item.stauts" style="font-size:12px;">状态：#{mx.global.register.jobs.status[item.stauts][1]}#</p>
                                            <p v-if="item.type" style="font-size:12px;">类型：#{mx.global.register.jobs.type[item.type][1]}#</p>
                                            <p style="font-size:12px;">开始时间：#{moment(item.stime).format("LLL")}#  结束时间：#{moment(item.etime).format("LLL")}#</p>
                                            <p style="font-size:12px;">耗时：#{moment(item.etime).from(item.etime,true)}#</p>
                                            <p style="font-size:12px;">命令：#{item.cmds}#</p>
                                            <p style="font-size:12px;">输出：#{item.output}#</p>
                                            <p style="font-size:12px;">错误：#{item.err}#</p>
                                            <p style="font-size:12px;">代码：#{item.code}#</p>
                                        </el-card>
                                    </el-timeline-item>
                                </el-timeline></div>`
                })

                // 时间轴
                Vue.component("job-timeline",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<div class="block"><el-timeline>
                                    <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model">
                                        <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                            <h4>#{item.name}#</h4>
                                            <p v-if="item.stauts" style="font-size:12px;">状态：#{mx.global.register.jobs.status[item.stauts][1]}#</p>
                                            <p v-if="item.type" style="font-size:12px;">类型：#{mx.global.register.jobs.type[item.type][1]}#</p>
                                            <p style="font-size:12px;">开始时间：#{moment(item.stime).format("LLL")}#  结束时间：#{moment(item.etime).format("LLL")}#</p>
                                            <p style="font-size:12px;">耗时：#{moment(item.etime).from(item.etime,true)}#</p>
                                            <p style="font-size:12px;">命令：#{item.cmds}#</p>
                                        </el-card>
                                    </el-timeline-item>
                                </el-timeline></div>`
                })   

                // 作业详情
                Vue.component("job-diagnosis-detail",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    template: `<el-container style="height: calc(100vh - 190px);">
                                    <el-main>
                                        <el-row :gutter="10">
                                            <el-col :xs="12" :sm="10" :md="6" :lg="6" :xl="10">
                                                <div class="grid-content" style="text-align:center;">
                                                    <img src="/fs/assets/images/entity/png/linux.png?issys=true&type=download" class="image">
                                                    <p><h3>#{model.rows.host}#</h3></p>
                                                </div>
                                            </el-col>
                                            <el-col :xs="12" :sm="14" :md="18" :lg="18" :xl="14">
                                                <div class="grid-content">
                                                    <form class="form-horizontal" style="height:50vh;overflow-x: hidden;overflow-y: auto;">
                                                        <!-- 有模板 -->
                                                        <div class="form-group" v-for="item in model.template" style="padding: 0px 10px;margin-bottom: 1px;" v-if="model.template">
                                                            <label :for="item.title" class="col-sm-2 control-label" style="text-align:left;">#{item.title}#</label>
                                                            <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                                <div v-if="item.data==='value' && model.rows[item.data] <= 100">
                                                                    <progress :value="model.rows[item.data]" max="100"></progress> <b style="font-size:12px;">#{model.rows[item.data]}#%</b>
                                                                </div>
                                                                <div v-else-if="item.data==='value' && model.rows[item.data] > 100">
                                                                    <input type="text" class="form-control-bg-grey" :placeholder="item.data" :value="model.rows[item.data] | mx.bytesToSize">
                                                                </div>
                                                                <div v-else>
                                                                    <input type="text" class="form-control-bg-grey" :placeholder="item.data" :value="model.rows[item.data] | handlerFormat">
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!-- 没有模板 -->
                                                        <div class="form-group" v-for="(value,key) in model.rows" style="padding: 0px 10px;margin-bottom: 1px;" v-else>
                                                            <label :for="key" class="col-sm-2 control-label" style="text-align:left;">#{key}#</label>
                                                            <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                                <div v-if="key==='value' && value <= 100">
                                                                    <progress :value="value" max="100"></progress> <b style="font-size:12px;">#{value}#%</b>
                                                                </div>
                                                                <div v-else-if="key==='value' && value > 100">
                                                                    <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | mx.bytesToSize">
                                                                </div>
                                                                <div v-else>
                                                                    <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value | handlerFormat">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </el-main>
                                </el-container>`,
                    filters:{
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
                        console.log(this.model)
                    }
                });

                // 作业轨迹
                Vue.component("job-diagnosis-journal",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    template: `<el-container style="height: calc(100vh - 190px);">
                                    <el-main>
                                        <el-card class="box-card">
                                            <div slot="header" class="clearfix">
                                                <span>作业轨迹
                                                    <small>#{moment(_.head(model.journal.rows).vtime).format("LLL")}# - #{moment(_.last(model.journal.rows).vtime).format("LLL")}#</small>
                                                </span>
                                                <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                            </div>
                                            <job-timeline :id="id + '-journal'" :model="model.journal.rows"></job-timeline>
                                        </el-card>
                                    </el-main>
                                </el-container>
                                    `,
                    mounted(){
                    }
                });

                // 执行命令
                Vue.component("job-diagnosis-cmd",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    template: `<el-container style="height: calc(100vh - 190px);">
                                    <el-main>
                                        <el-card class="box-card">
                                            <div slot="header" class="clearfix">
                                                <span id="event-diagnosis-cmds">执行命令
                                                    <small>#{moment(_.head(model.cmds.rows).vtime).format("LLL")}# - #{moment(_.last(model.cmds.rows).vtime).format("LLL")}#</small>
                                                </span>
                                                <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-menu"></el-button>
                                            </div>
                                            <cmds-timeline :id="id + '-cmds'" :model="model.cmds.rows"></cmds-timeline>
                                        </el-card>
                                    </el-main>
                                </el-container>`,
                    mounted(){
                    }
                });             
                
                maxJob.app = {
                    delimiters: ['#{', '}#'],
                    template:   `<main id="content" class="content">
                                    <el-container>
                                        <el-header style="height: 40px;line-height: 40px;padding: 0px;">
                                            <search-base-component :options="options"
                                                                ref="searchRef"
                                                                class="grid-content"></search-base-component>
                                        </el-header>
                                        <el-main id="job-view-container" style="padding: 5px 0px 0px 0px;">
                                            <el-tabs v-model="layout.main.activeIndex" class="grid-content" type="border-card" closable @tab-remove="detailRemove">
                                                <el-tab-pane v-for="(item,index) in layout.main.tabs" :key="item.name" :label="item.title" :name="item.name">
                                                    <div v-if="item.type==='main'">
                                                        <div class="job-view-summary-control">
                                                            <el-tooltip :content="control.ifRefresh==1?'自动刷新启用中':'自动刷新关闭中'" placement="top" open-delay="500">
                                                                <div>
                                                                    #{control.ifRefresh==1?'自动刷新':'自动刷新'}#
                                                                    <el-switch
                                                                    v-model="control.ifRefresh"
                                                                    active-color="#13ce66"
                                                                    inactive-color="#dddddd"
                                                                    active-value="1"
                                                                    inactive-value="0"
                                                                    @change="toggleSummaryByRefresh">
                                                                    </el-switch>
                                                                </div>
                                                            </el-tooltip>
                                                            <el-tooltip :content="control.ifSmart==1?'智能分析启用中':'智能分析关闭中'" placement="top" open-delay="500">
                                                                <div>
                                                                    #{control.ifSmart==1?'智能分析':'智能分析'}#
                                                                    <el-switch
                                                                    v-model="control.ifSmart"
                                                                    active-color="#13ce66"
                                                                    inactive-color="#dddddd"
                                                                    active-value="1"
                                                                    inactive-value="0"
                                                                    @change="toggleSummaryBySmart">
                                                                    </el-switch>
                                                                </div>
                                                            </el-tooltip>
                                                        </div>
                                                        
                                                        <el-container id="job-view-summary">
                                                            <el-main>
                                                                <el-tabs v-model="layout.summary.activeIndex" type="border">
                                                                    <el-tab-pane v-for="(item,index) in layout.summary.tabs" :key="item.name" :label="item.title" :name="item.name">
                                                                        <div v-if="item.type=='radar'">
                                                                            <job-radar id="job-radar" :model='model.message'></job-radar>
                                                                        </div>
                                                                        <div v-if="item.type=='gauge'">
                                                                            <job-gauge id="performance-view-gauge"></job-gauge>
                                                                        </div>
                                                                    </el-tab-pane>
                                                                </el-tabs>
                                                            </el-main>
                                                        </el-container>
                                                        <el-container id="job-view-console">
                                                            <el-aside class="tree-view" style="background-color:#f6f6f6;" ref="leftView">
                                                                <probe-tree-component id="job-tree" :model="{parent:'/job',name:'job_tree_data.js',domain:'job'}"></probe-tree-component>
                                                            </el-aside>
                                                            <el-main class="table-view" style="padding:5px;" ref="mainView">
                                                                <el-joblist-component :model="model.message"></el-joblist-component>
                                                            </el-main>
                                                        </el-container>
                                                    </div>
                                                    <div v-if="item.type==='diagnosis'">
                                                        <el-tabs v-model="layout.main.detail.activeIndex" style="background:#ffffff;" class="el-tabs-bottom-line">
                                                            <el-tab-pane v-for="it in item.child" :key="it.name" :label="it.title" :name="it.name">
                                                                <div v-if="it.type==='detail'">
                                                                    <job-diagnosis-detail :id="it.name+ '-detail'" :model="it.model.detail"></job-diagnosis-detail>
                                                                </div>
                                                                <div v-if="it.type==='journal'">
                                                                    <job-diagnosis-journal :id="it.name+ '-journal'" :model="it.model"></job-diagnosis-journal>
                                                                </div>
                                                                <div v-if="it.type==='cmd'">
                                                                    <job-diagnosis-cmd :id="it.name+ '-cmd'" :model="it.model"></job-diagnosis-cmd>
                                                                </div>
                                                                <div v-else>
                                                                    <!-- <job-diagnosis-datatable-component :id="it.name" :model="it.model[it.type]"></job-diagnosis-datatable-component> -->
                                                                </div>
                                                            </el-tab-pane>
                                                        </el-tabs>
                                                    </div>
                                                </tab>
                                            </el-tabs>
                                        </el-main>
                                    </el-container>
                                </main>`,
                    data: {
                        id: _.now(),
                        // 布局
                        layout:{
                            main:{
                                tabIndex: 1,
                                activeIndex: 'job-view-console',
                                tabs:[
                                    {name: 'job-view-console', title:'性能列表', type: 'main'}
                                ],
                                detail: {
                                    model: [],
                                    tabIndex: 1,
                                    activeIndex: '1',
                                }
                            },
                            summary: {
                                tabIndex: 1,
                                activeIndex: 'job-radar',
                                tabs:[
                                    {name: 'job-radar', title:'雷达', type: 'radar'},
                                    {name: 'job-gauge', title:'仪表盘', type: 'gauge'}
                                ]
                            }
                        },
                        control: {
                            ifSmart: '0',
                            ifRefresh: '0'
                        },
                        // 搜索组件结构
                        model: {
                            id: "matrix-event-search",
                            filter: null,
                            term:  null,
                            preset: null,
                            message: null,
                        },
                        options: {
                            // 视图定义
                            view: {
                                show: false
                            },
                            // 搜索窗口
                            window: { name:"所有", value: ""},
                            // 输入
                            term: "",
                            // 指定类
                            class: "#/matrix/jobs/jobrun:",
                            // 指定api
                            api: {parent: "job",name: "job_list.js"},
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
                                    $("#tab-job-view-console").show();
                                }else {
                                    $("#tab-job-view-console").hide();
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
                        // 初始化term
                        try{
                            let term = decodeURIComponent(window.atob(mx.urlParams['term']));
                            this.options.term = term;
                        } catch(err){

                        }

                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT",maxJob.resizeEventConsole);

                    },
                    mounted(){
                        
                        // 数据设置
                        this.setData();

                        // watch数据更新
                        this.$watch(
                            "$refs.searchRef.result",(val, oldVal) => {
                                this.setData();
                            }
                        );


                        $(this.$el).addClass('view-normal');
                        
                        // 没有详细页时，默认隐藏告警列表Title
                        this.hideTabEventViewConsoleUl();
                      
                        // 维度统计
                        this.toggleSummaryBySmart(this.control.ifSmart);

                        // 窗口Resize
                        _.delay(()=>{
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");

                            Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                                sizes: [20, 80],
                                minSize: [0, 0],
                                gutterSize: 5,
                                gutterStyle: function(dimension, gutterSize) {
                                    return {
                                        'display': 'none'
                                    }
                                },
                                gutterAlign: 'end',
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true
                            });
                        },2000);
                        
                    },
                    methods: {
                        setData(){
                            _.extend(this.model, {message:this.$refs.searchRef.result});
                        },
                        hideTabEventViewConsoleUl(){
                            const self = this;

                            if($('#tab-job-view-console').is(':visible')) {
                                $("#tab-job-view-console").hide();
                            $("#tab-job-view-console > span").hide();
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
                            
                            // RESIZE Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Console
                            maxJob.resizeEventConsole();
                        },
                        toggleSummaryBySmart(evt){
                            if(evt==1) {
                                $("#job-view-summary").css("height","200px").css("display","");
                            } else {
                                $("#job-view-summary").css("height","0px").css("display","none");
                            }
                            this.control.ifSmart = evt;
                            
                            // RESIZE Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Console
                            maxJob.resizeEventConsole();
                        },
                        detailAdd(event){
                            try {
                                let id = event.id;
                                if(this.layout.main.activeIndex === `diagnosis-${id}`) return false;
                                
                                // event
                                let term = encodeURIComponent(JSON.stringify(event).replace(/%/g,'%25'));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript("/matrix/job/diagnosis-by-id.js",term).message;
                                
                                // 添加tab
                                let detail = {title:`作业分析 ${event.name}`, name:`diagnosis-${id}`, type: 'diagnosis', child:[
                                                {title:'作业详情', name:`diagnosis-detail-${id}`, type: 'detail', model:model},
                                                {title:'作业轨迹', name:`diagnosis-journal-${id}`, type: 'journal', model:model},
                                                {title:'执行命令', name:`diagnosis-cmd-${id}`, type: 'cmd', model:model}
                                            ]};
                                this.layout.main.detail.activeIndex = _.first(detail.child).name;
                                
                                this.layout.main.tabs.push(detail);
                                this.layout.main.activeIndex = `diagnosis-${id}`;
                                
                            } catch(error){
                                this.layout.main.tabs = [];
                            }
                        },
                        detailRemove(targetName) {
                            
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
                            
                            this.layout.main.activeIndex = activeIndex;
                            this.layout.main.tabs = tabs.filter(tab => tab.name !== targetName);

                            _.delay(function(){
                                // RESIZE Event Summary
                                eventHub.$emit("WINDOW-RESIZE-EVENT");
                                // RESIZE Event Console
                                event.resizeEventConsole();
                            },500)
                        }
                    }
                };
                new Vue(maxJob.app).$mount("#app");    
            });
        })

        window.addEventListener('resize', () => { 
            maxJob.resizeEventConsole();
            
            // RESIZE Event Summary
            eventHub.$emit("WINDOW-RESIZE-EVENT");
        })

        
    }

    resizeEventConsole(){
        let evwH = $(window).height();
        let evcH = $("#job-view-container").height();
        let evsH = $("#job-view-summary").height();
        
        $("#job-view-console .dataTables_scrollBody").css("max-height", evwH + "px")
                                                        .css("max-height","-=230px")
                                                        .css("max-height","-=" + evsH + "px")
                                                        .css("min-height", evwH + "px")
                                                        .css("min-height","-=230px")
                                                        .css("min-height","-=" + evsH + "px");
    }

}

let maxJob = new Job();
maxJob.init();