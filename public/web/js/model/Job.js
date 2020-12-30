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
                            "search-base-component",
                            "mx-tag",
                            "mx-tag-tree"],function() {
            $(function() {

                moment.locale(window.MATRIX_LANG);

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
                                selected: [],
                                pagination:{
                                    pageSize: 10,
                                    currentPage: 1
                                }
                            },
                            info: []
                        }
                    },
                    computed:{
                        metaColumns(){
                            try{
                                return this.model.columns[this.model.rootClass];
                            } catch(err){
                                return [];
                            }
                        },
                        cHeight(){
                            return `height:calc(100vh - ${this.$root.cHeight}px);`
                        }
                    },
                    watch: {
                        model: {
                            handler(val,oldVal){
                                this.dt.pagination.currentPage = 1;
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
                                this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
                            },
                            deep:true,
                            immediate:true
                        }
                    },
                    template:   `<el-container class="animated fadeIn" :style="cHeight">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-tooltip content="运行模式切换" open-delay="500" placement="top">
                                            <el-button type="text" @click="onToggle" icon="el-icon-notebook-2"></el-button>
                                        </el-tooltip>
                                        <el-tooltip :content="mx.global.register.event.status[item][1]" open-delay="500" placement="top" v-for="item in model.actions" v-if="model.actions">
                                            <el-button type="text" @click="onAction(item)" :icon="mx.global.register.event.status[item][2]"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="刷新" open-delay="500" placement="top">
                                            <el-button type="text" @click="onRefresh" icon="el-icon-refresh"></el-button>
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
                                            :data="dt.rows.slice((dt.pagination.currentPage - 1) * dt.pagination.pageSize,dt.pagination.currentPage * dt.pagination.pageSize)"
                                            highlight-current-row="true"
                                            stripe
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
                                                    <el-container style="width:50vw;">
                                                        <el-main>
                                                            <el-form label-position="right" label-width="120px">
                                                                <el-form-item v-for="v,k in props.row" :label="k" :key="k">
                                                                    <el-input :type="k,metaColumns | pickType" :value="moment(v).format(mx.global.register.format)"  v-if="pickFtype(k) == 'timestamp'"></el-input>
                                                                    <el-input :type="k,metaColumns | pickType" :value="moment(v).format('YYYY-MM-DD')"  v-else-if="pickFtype(k) == 'date'"></el-input>
                                                                    <el-input :type="k,metaColumns | pickType" :rows="6" :value="arrayToCsv(v)"  v-else-if="pickFtype(k) == 'bucket'"></el-input>
                                                                    <el-input :type="k,metaColumns | pickType" :rows="6" :value="JSON.stringify(v,null,4)"  v-else-if="_.includes(['map','set','list'],pickFtype(k))"></el-input>
                                                                    <el-input :type="k,metaColumns | pickType" :value="v"  v-else></el-input>
                                                                </el-form-item>
                                                            </el-form>
                                                        </el-main>
                                                    </el-container>
                                                </template>
                                            </el-table-column>
                                            <el-table-column :prop="item['field']"
                                                sortable 
                                                show-overflow-tooltip
                                                :formatter="item.render" 
                                                v-for="item in dt.columns"
                                                :width="item.width"
                                                v-if="item.visible"
                                                min-width="160">
                                                <template slot-scope="scope" slot="header">
                                                    <span> #{item['title']}# </span>
                                                </template>
                                                <template slot-scope="scope">
                                                    <mx-tag domain='job' :model.sync="scope.row.tags" :id="scope.row.id" limit="1" v-if="item['field'] == 'tags'"></mx-tag>
                                                    <div v-else-if="pickFtype(item['field']) == 'timestamp'">#{moment(scope.row[item['field']]).format(mx.global.register.format)}#</div>
                                                    <div v-else-if="pickFtype(item['field']) == 'date'">#{moment(scope.row[item['field']]).format('YYYY-MM-DD')}#</div>
                                                    <el-popover
                                                        placement="top-start"
                                                        width="550"
                                                        trigger="click"
                                                        popper-class="dataTablePopper"
                                                        :popper-options="{ boundariesElement: 'body' }"
                                                        v-else-if="_.includes(['msg','cmds','err','out','config','depot','attr'],item['field']) && !_.isEmpty(scope.row[item['field']])">
                                                        <el-container>
                                                            <el-header style="height:30px;line-height:30px;padding:0px;">
                                                                <el-button type="text" icon="el-icon-copy-document" class="el-button-copy" @click="onCopy(item['field'],scope.$index)"></el-button>
                                                            </el-header>
                                                            <el-main style="padding:0px;">
                                                                <textarea rows="10" style="width:98%;white-space:nowrap;" :id="'textarea_'+scope.$index">#{scope.row[item['field']]}#</textarea>
                                                            </el-main>
                                                        </el-container>
                                                        <el-button type="text" icon="el-icon-date" slot="reference">#{ _.size(scope.row[item['field']]) }#</el-button>
                                                    </el-popover>
                                                    <div v-else>
                                                        <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                                            v-if="typeof item.render === 'function'">
                                                        </div>
                                                        <div v-else>
                                                            #{scope.row[item.field]}#
                                                        </div>
                                                    </div>
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                    </el-main>
                                    <el-footer  style="height:30px;line-height:30px;">
                                        <!--#{ info.join(' &nbsp; | &nbsp;') }#-->
                                        <el-pagination
                                            @size-change="onPageSizeChange"
                                            @current-change="onCurrentPageChange"
                                            :page-sizes="[10, 15, 20, 50, 100, 300]"
                                            :page-size="dt.pagination.pageSize"
                                            :total="dt.rows.length"
                                            layout="total, sizes, prev, pager, next">
                                        </el-pagination>
                                    </el-footer>
                                </el-container>`,
                    filters: {
                        pickType(key,columns){
                            let rtn = 'text';
                            try{
                                let type = _.find(columns,{data:key}).type;
                                if(_.includes(['map','list','set','bucket'],type)){
                                    rtn = 'textarea';
                                }
                            } catch(err){
                                rtn = 'input';
                            }
        
                            return rtn;
                        }
                    },
                    mounted(){

                    },
                    methods: {
                        onPageSizeChange(val) {
                            this.dt.pagination.pageSize = val;
                        },
                        onCurrentPageChange(val) {
                            this.dt.pagination.currentPage = val;
                        },
                        pickFtype(key){
                            
                            let rtn = 'string';
                            try{
                                rtn = _.find(this.metaColumns,{data:key}).type;
                            } catch(err){
                                return rtn;
                            }
                            return rtn;
                        },
                        onCopy(data,index){
                            try{
                                let tx = document.getElementById('textarea_'+index);
                                tx.select(); 
                                document.execCommand("Copy"); 
                                this.$message({
                                    type: "info",
                                    message: "已复制"
                                });
                            } catch(err){
        
                            }
                        },
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
                        onRefresh(){
                            this.$root.$refs.searchRef.search();
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
                                            }
                                        },
                                        items: self.model.contextMenu.job
                                    }
                                },
                                events: {
                                    show(opt) {
                
                                        let $this = this;

                                        _.delay(()=>{
                                            new Vue({
                                                computed: {
                                                    model(){
                                                        return row;
                                                    }
                                                },
                                                template: `<mx-tag domain='job' :model.sync="model.tags" :id="model.id" limit="6"></mx-tag>`

                                            }).$mount(`.${column.id} input`);
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
                                fileName: `tableExport_${moment().format("YYYY-MM-DD HH:mm:ss")}`,
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

                // 执行命令时间轴
                Vue.component("cmds-timeline",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    template:   `<div class="block">
                                    <el-timeline>
                                        <el-timeline-item 
                                            :timestamp="moment(item.vtime).format('YYYY-MM-DD HH:mm:ss')" 
                                            placement="top" 
                                            v-for="item in model">
                                            <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);padding:0 20px;">
                                                <h4>名称：#{item.name}#</h4>
                                                <el-form label-width="80px">
                                                    <el-form-item label="位置">#{item.dir}#</el-form-item>
                                                    <el-form-item label="源">#{item.source}#</el-form-item>
                                                    <el-form-item label="服务器">#{item.host}#</el-form-item>
                                                    <el-form-item label="进程ID">#{item.pid}#</el-form-item>
                                                    <el-form-item label="RUNID">#{item.runid}#</el-form-item>
                                                    <el-form-item label="SID">#{item.sid}#</el-form-item>
                                                    <el-form-item label="状态" style="font-size:12px;" v-if="mx.global.register.jobs.status[item.stauts]">#{mx.global.register.jobs.status[item.stauts][1]}#</el-form-item>
                                                    <el-form-item label="类型" style="font-size:12px;" v-if="mx.global.register.jobs.type[item.type]">#{mx.global.register.jobs.type[item.type][1]}#</el-form-item>
                                                    <el-form-item label="开始时间">#{moment(item.stime).format("YYYY-MM-DD HH:mm:ss")}#</el-form-item>
                                                    <el-form-item label="结束时间">#{moment(item.etime).format("YYYY-MM-DD HH:mm:ss")}#</el-form-item>
                                                    <el-form-item label="耗时">#{ item | pickDiff }#</el-form-item>
                                                    <el-form-item label="命令" v-if="item.cmd"><mx-editor :model="item.cmd | pickString" cHeight="200px"></el-form-item>
                                                    <el-form-item label="输出" v-if="item.out"><mx-editor :model="item.out" cHeight="200px"></mx-editor></el-form-item>
                                                    <el-form-item label="错误" v-if="item.err"><mx-editor :model="item.err" cHeight="200px"></mx-editor></el-form-item>
                                                    <el-form-item label="代码">#{item.code}#</el-form-item>
                                                </el-form>
                                            </el-card>
                                        </el-timeline-item>
                                    </el-timeline>
                                </div>`,
                    filters: {
                        pickDiff(item){
                            let timeDiff = moment(item.etime).diff(moment(item.stime), "millisecond");
                            if(timeDiff > 1000){
                                return moment(item.etime).diff(moment(item.stime), "seconds") + ' 秒';    
                            } else {
                                return timeDiff + ' 毫秒';    
                            }
                        }
                    }
                })

                // 时间轴
                Vue.component("job-timeline",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    template:   `<div class="block">
                                    <el-timeline>
                                        <el-timeline-item 
                                            :timestamp="moment(item.vtime).format('YYYY-MM-DD HH:mm:ss')" 
                                            :color="mx.global.register.jobs.status[item.status][2]"
                                            size="large"
                                            placement="top" 
                                            v-for="item in model">
                                            <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);padding:0 20px;">
                                                <h4>
                                                    #{item.name}#
                                                </h4>
                                                <el-form label-width="80px">
                                                    <el-form-item label="状态" v-if="item.status">
                                                        <el-button type="text" :style="item.status | pickStatusStyle">#{mx.global.register.jobs.status[item.status][1]}#</el-button>
                                                    </el-form-item>
                                                    <el-form-item label="类型" v-if="item.type">
                                                        #{mx.global.register.jobs.type[item.type][1]}#
                                                    </el-form-item>
                                                    <el-form-item label="开始时间">
                                                        #{moment(item.stime).format("YYYY-MM-DD HH:mm:ss")}# 
                                                    </el-form-item>
                                                    <el-form-item label="结束时间">
                                                        #{moment(item.etime).format("YYYY-MM-DD HH:mm:ss")}#
                                                    </el-form-item>
                                                    <el-form-item label="耗时">
                                                        #{ item | pickDiff }#
                                                    </el-form-item>
                                                    <el-form-item label="命令" v-if="item.cmds">
                                                        <mx-editor :model="item.cmds | pickString" cHeight="200px">
                                                    </el-form-item>
                                                    <el-form-item label="输出" v-if="item.out">
                                                        <mx-editor :model="item.out" cHeight="200px"></mx-editor>
                                                    </el-form-item>
                                                    <el-form-item label="错误" v-if="item.err">
                                                        <mx-editor :model="item.err" cHeight="200px"></mx-editor>
                                                    </el-form-item>
                                                    <el-form-item label="代码" v-if="item.code">
                                                        #{item.code}#
                                                    </el-form-item>
                                                </el-form>
                                            </el-card>
                                        </el-timeline-item>
                                    </el-timeline>
                                </div>`,
                    filters:{
                        pickStatusStyle(status){
                            try{
                                return `padding:5px;background:${mx.global.register.jobs.status[status][2]};`;
                            } catch(err){
                                return `padding:5px;`;
                            }
                        },
                        pickString(val){
                            try{
                                if(typeof val == 'object'){
                                    return JSON.stringify(val,null,2);
                                } else {
                                    return val;
                                }
                            } catch(err){
                                return '';
                            }
                        },
                        pickDiff(item){
                            let timeDiff = moment(item.etime).diff(moment(item.stime), "millisecond");
                            if(timeDiff > 1000){
                                return moment(item.etime).diff(moment(item.stime), "seconds") + ' 秒';    
                            } else {
                                return timeDiff + ' 毫秒';    
                            }
                        }
                    }
                })   

                // 作业详情
                Vue.component("job-diagnosis-detail",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:Object
                    },
                    template: `<el-container style="height: calc(100vh - 190px);">
                                    <el-main style="height:100%;">
                                        <el-row :gutter="10" style="height:100%;">
                                            <el-col :xs="12" :sm="10" :md="6" :lg="6" :xl="10" style="height:100%;">
                                                <div class="grid-content" style="text-align:center;">
                                                    <img src="/fs/assets/images/entity/png/linux.png?issys=true&type=download" class="image">
                                                    <p><h3>#{model.rows.host}#</h3></p>
                                                </div>
                                            </el-col>
                                            <el-col :xs="12" :sm="14" :md="18" :lg="18" :xl="14" style="height:100%;">
                                                <el-form label-width="120px" style="height:100%;overflow-x: hidden;overflow-y: auto;" class="form-no-border">
                                                    <!-- 有模板 -->
                                                    <el-form-item :label="item.title" v-for="item in model.template" style="margin-bottom: 10px;" v-if="model.template">
                                                        <div v-if="item.data==='value' && model.rows[item.data] <= 100">
                                                            <progress :value="model.rows[item.data]" max="100"></progress> 
                                                            <b style="font-size:12px;">#{model.rows[item.data]}#%</b>
                                                        </div>
                                                        <div v-else-if="item.data==='value' && model.rows[item.data] > 100">
                                                            <el-input :value="model.rows[item.data] | mx.bytesToSize" disabled></el-input>
                                                        </div>
                                                        <div v-else>
                                                            <el-input :value="model.rows[item.data] | handlerFormat" disabled></el-input>
                                                        </div>
                                                    </el-form-item>
                                                    <!-- 没有模板 -->
                                                    <el-form-item :label="key" class="form-group" v-for="(value,key) in model.rows" style="padding: 0px 10px;margin-bottom: 1px;" v-else>
                                                        <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                            <div v-if="key==='value' && value <= 100">
                                                                <progress :value="value" max="100"></progress> <b style="font-size:12px;">#{value}#%</b>
                                                            </div>
                                                            <div v-else-if="key==='value' && value > 100">
                                                                <el-input :placeholder="key" :value="value | mx.bytesToSize" disabled></el-input>
                                                            </div>
                                                            <div v-else>
                                                                <el-input :placeholder="key" :value="value | handlerFormat" disabled></el-input>
                                                            </div>
                                                        </div>
                                                    </el-form-item>
                                                </el-form>
                                            </el-col>
                                        </el-row>
                                    </el-main>
                                </el-container>`,
                    filters:{
                        handlerFormat(evt){
                            // 2019-03-13T21:35:31.678Z
                            // 检查是否是UTC格式
                            if(_.indexOf(evt,'T') === 10 && (_.indexOf(evt,'Z') === 23 || _.indexOf(evt,'Z') === 19) ){
                                return moment(evt).format("YYYY-MM-DD HH:mm:ss");
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
                        model:Object
                    },
                    template: `<el-container style="height: calc(100vh - 190px);">
                                    <el-main>
                                        <el-card class="box-card">
                                            <div slot="header" class="clearfix">
                                                <span>作业轨迹</span>
                                            </div>
                                            <job-timeline :model="model.journal.rows"></job-timeline>
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
                                                <span id="event-diagnosis-cmds">执行命令</span>
                                            </div>
                                            <cmds-timeline :model="model.cmds.rows"></cmds-timeline>
                                        </el-card>
                                    </el-main>
                                </el-container>`,
                    mounted(){
                    }
                });             
                
            });
        })

        window.addEventListener('resize', () => { 
            // RESIZE Event Summary
            eventHub.$emit("WINDOW-RESIZE-EVENT");
        })

        
    }

    mount(el,cHeight){
        
        let main = {
            delimiters: ['#{', '}#'],
            template:   `<el-container style="height:100%;">
                            <el-header class="job-view-header" style="height: 40px;line-height: 40px;padding: 0px;">
                                <search-base-component :options="options"
                                                    ref="searchRef"
                                                    class="grid-content"></search-base-component>
                            </el-header>
                            <el-main id="job-view-container" style="padding: 5px 0px 0px 0px;overflow:hidden;" :loading="loading">
                                <el-tabs :value="layout.main.activeIndex" class="grid-content" type="border-card" closable @tab-remove="detailRemove" @tab-click="handleClick">
                                    <el-tab-pane v-for="(item,index) in layout.main.tabs" :key="item.name" :label="item.title" :name="item.name">
                                        <div v-if="item.type==='main'">
                                            <div class="job-view-summary-control">
                                                <el-tooltip :content="control.refresh.enable?'自动刷新启用中':'自动刷新关闭中'" placement="top" open-delay="500">
                                                    <div>
                                                        #{control.refresh.enable?'自动刷新':'自动刷新'}#
                                                        <el-switch
                                                        v-model="control.refresh.enable"
                                                        active-color="#13ce66"
                                                        inactive-color="#dddddd"
                                                        @change="toggleSummaryByRefresh">
                                                        </el-switch>
                                                    </div>
                                                </el-tooltip>
                                                <el-tooltip :content="control.ifSmart==1?'智能分析启用中':'智能分析关闭中'" placement="top" open-delay="500" style="display:none;">
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
                                            
                                            <el-container id="job-view-console">
                                                <el-aside class="tree-view" style="background-color:#f2f2f2;" ref="leftView">
                                                    <mx-tag-tree :model="{parent:'/job',name:'job_tree_data.js',domain:'job'}" :fun="onRefreshByTag" ref="tagTree"></mx-tag-tree>
                                                </el-aside>
                                                <el-main class="table-view" style="padding:5px;" ref="mainView">
                                                    <el-joblist-component :model="model.message"></el-joblist-component>
                                                </el-main>
                                            </el-container>
                                        </div>
                                        <div v-if="item.type==='diagnosis'">
                                            <el-tabs v-model="layout.main.detail.activeIndex" style="background:#ffffff;" class="el-tabs-bottom-line">
                                                <el-tab-pane v-for="it in item.child" :key="it.name" :label="it.title" :name="it.name">
                                                    
                                                    <job-diagnosis-detail :id="it.name+ '-detail'" :model="it.model.detail" v-if="it.type==='detail' && !_.isEmpty(it.model)"></job-diagnosis-detail>
                                                
                                                    <job-diagnosis-journal :model="it.model" v-if="it.type==='journal' && !_.isEmpty(it.model)"></job-diagnosis-journal>
                                                
                                                    <job-diagnosis-cmd :id="it.name+ '-cmd'" :model="it.model" v-if="it.type==='cmd' && !_.isEmpty(it.model)"></job-diagnosis-cmd>
                                                    
                                                </el-tab-pane>
                                            </el-tabs>
                                        </div>
                                    </tab>
                                </el-tabs>
                            </el-main>
                        </el-container>`,
            data: {
                id: _.now(),
                cHeight: 145,
                // 布局
                layout:{
                    main:{
                        tabIndex: 1,
                        activeIndex: 'job-view-console',
                        tabs:[
                            {name: 'job-view-console', title:'作业列表', type: 'main'}
                        ],
                        detail: {
                            model: [],
                            tabIndex: 1,
                            activeIndex: '1',
                        }
                    }
                },
                control: {
                    ifSmart: '0',
                    refresh: {
                        enable: true,
                        inst: null,
                        interval: 5 * 1000
                    }
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
                        eidtEnable: false,
                        show: false,
                        value: "all"
                    },
                    // 搜索窗口
                    window: { name:"所有", value: ""},
                    // 输入
                    term: "",
                    autoSearch: true,
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
                },
                loading: false
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
                },
                'control.refresh.enable':{
                    handler(val,oldVal){
                        if(val) {
                            this.control.refresh.inst = setInterval(()=>{
                                this.$refs.searchRef.search();
                            },this.control.refresh.interval);
                            this.$message({
                                type: "info",
                                message: "自动刷新开启"
                            })
                        } else {
                            clearInterval(this.control.refresh.inst);
                            this.$message({
                                type: "info",
                                message: "自动刷新关闭"
                            })
                        }
                    },
                    immediate:true
                },
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
                    // 列表容器高度
                    this.cHeight = cHeight;

                    // 状态刷新标志
                    this.control.refresh.enable = (localStorage.getItem("JOB-LIST-IFREFRESH") == 'true');

                    // 初始化term
                    let term = decodeURIComponent(window.atob(mx.urlParams['term']));
                    this.options.term = term;
                } catch(err){

                }

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
                },1000);
                
            },
            methods: {
                setData(){
                    _.extend(this.model, {message:this.$refs.searchRef.result});
                },
                onRefresh(){
                    this.$refs.searchRef.search();
                },
                onRefreshByTag(tag){
                    this.options.term = `tags=${tag}`;
                    this.$refs.searchRef.search();
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
                    
                    this.control.refresh.enable = evt;
                    localStorage.setItem("JOB-LIST-IFREFRESH", evt);
                    
                    // RESIZE Summary
                    eventHub.$emit("WINDOW-RESIZE-EVENT");
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
                },
                handleClick(tab, event) {
                    let tmp = _.find(this.layout.main.tabs,{name: tab.name});
                    if(tmp.child){
                        this.layout.main.detail.activeIndex = _.first(tmp.child).name;
                    }
                },
                detailAdd(event){

                    this.loading = true;

                    try {
                        let id = event.id;
                        
                        if(this.layout.main.activeIndex === `diagnosis-${id}`) return false;
                        
                        // event
                        let term = encodeURIComponent(JSON.stringify(event).replace(/%/g,'%25'));
                        // 根据event获取关联信息
                        fsHandler.callFsJScriptAsync("/matrix/job/diagnosis-by-id.js",term).then( (rtn)=>{
                            let model = rtn.message

                            // 添加tab
                            let detail = {title:`作业分析 ${event.name}`, name:`diagnosis-${id}`, type: 'diagnosis', child:[
                                {title:'作业详情', name:`diagnosis-detail-${id}`, type: 'detail', model:model},
                                {title:'作业轨迹', name:`diagnosis-journal-${id}`, type: 'journal', model:model},
                                {title:'执行命令', name:`diagnosis-cmd-${id}`, type: 'cmd', model:model}
                            ]};
                            
                            this.layout.main.tabs.push(detail);
                            this.layout.main.activeIndex = `diagnosis-${id}`;
                            this.layout.main.detail.activeIndex = _.first(detail.child).name;

                            this.loading = false;
                        } );
                        
                    } catch(error){
                        this.layout.main.tabs = [];
                        this.loading = false;
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
                    this.layout.main.detail.activeIndex = _.first(_.last(this.layout.main.tabs).child).name;

                    _.delay(function(){
                        // RESIZE Event Summary
                        eventHub.$emit("WINDOW-RESIZE-EVENT");
                    },500)
                }
            }
        };
        _.delay(()=>{
            this.app = new Vue(main).$mount(el);    
        },500)
        
    }

}