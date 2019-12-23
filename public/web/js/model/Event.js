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

                // EventList Table组件
                Vue.component("event-eventlist-component",{
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
                    template:   `<el-container class="animated fadeIn" style="height:calc(100vh - 135px);">
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
                                        items: self.model.contextMenu.event
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

                // Table组件 单选
                Vue.component("el-table-component",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object,
                        expandColumn: Boolean
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
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-tooltip content="删除" open-delay="500" placement="top">
                                            <el-button type="text" icon="el-icon-notebook-2"></el-button>
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
                                            @row-dblclick="onRowDblclick"
                                            @row-contextmenu="onRowContextmenu"
                                            @selection-change="onSelectionChange"
                                            @current-change="onCurrentChange"
                                            ref="table">
                                            <!--el-table-column type="selection" align="center"></el-table-column--> 
                                            <el-table-column type="expand">
                                                <template slot-scope="props">
                                                    <el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f7f7f7;" >
                                                        <el-form-item v-for="v,k in props.row" :label="k">
                                                            <el-input v-model="v"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </template>
                                            </el-table-column>
                                            <el-table-column
                                                sortable 
                                                show-overflow-tooltip
                                                v-for="(item,index) in dt.columns"
                                                :key="index"
                                                :prop="item.field"
                                                :label="item ? item.title : ''"
                                                :width="item.width"
                                                v-if="item.visible">
                                                    <template slot-scope="scope">
                                                        <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                                            v-if="typeof item.render === 'function'">
                                                        </div>
                                                        <div v-else>
                                                            #{scope.row[item.field]}#
                                                        </div>
                                                    </template>
                                            </el-table-column>
                                        </el-table>
                                    </el-main>
                                    <el-footer  style="height:30px;line-height:30px;">
                                        #{ info.join(' &nbsp; | &nbsp;') }#
                                    </el-footer>
                                </el-container>`,
                    mounted(){

                    },
                    directives: {
                        'table': function (el, binding) {
                          if (binding.value) {
                            el.focus()
                          }
                        }
                    },
                    methods: {
                        initData(){
                            const self = this;
                            
                            let init = function(){
                                
                                _.extend(self.dt, {columns: _.map(self.model.columns, function(v){
                                    
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

                            _.delay(()=>{
                                init();
                            },1000)
                            
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
                            this.dt.selected = [val];
                        },
                        onCurrentChange(val){
                            this.dt.selected = [val];
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
                                        items: self.$root.model.message.contextMenu.event
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
                        onRowDblclick(row, column, event){
                            
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

                // Table组件 多选
                Vue.component("el-table-multiselect-component",{
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
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-tooltip content="删除" open-delay="500" placement="top">
                                            <el-button type="text" icon="el-icon-notebook-2"></el-button>
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
                                            style="width: 100%"
                                            :row-class-name="rowClassName"
                                            :header-cell-style="headerRender"
                                            @row-contextmenu="onRowContextmenu"
                                            @selection-change="onSelectionChange"
                                            ref="table"
                                            stripe="true">
                                            <el-table-column type="selection" align="center"></el-table-column> 
                                            <!--el-table-column type="expand" v-show="expandColumn">
                                                <template slot-scope="props">
                                                    <el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f7f7f7;" >
                                                        <el-form-item v-for="v,k in props.row" :label="k">
                                                            <el-input v-model="v"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </template>
                                            </el-table-column-->
                                            <el-table-column
                                                sortable 
                                                show-overflow-tooltip
                                                v-for="(item,index) in dt.columns"
                                                :key="index"
                                                :prop="item.field"
                                                :label="item ? item.title : ''"
                                                :width="item.width"
                                                v-if="item.visible">
                                                    <template slot-scope="scope">
                                                        <div v-html='item.render(scope.row, scope.column, scope.row[item.field], scope.$index)' 
                                                            v-if="typeof item.render === 'function'">
                                                        </div>
                                                        <div v-else>
                                                            #{scope.row[item.field]}#
                                                        </div>
                                                    </template>
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
                                
                                _.extend(self.dt, {columns: _.map(self.model.columns, function(v){
                                    
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

                            _.delay(()=>{
                                init();
                            },1000)
                            
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
                                        items: self.$root.model.message.contextMenu.event
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

                // 告警轨迹
                Vue.component("event-diagnosis-journal",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<el-container style="height: calc(100vh - 180px);">
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
                Vue.component("event-view-facet",{
                    delimiters: ['#{', '}#'],
                    props: {
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
                            
                            this.progress = _.map(this.model.summary.facet,function(v,k){
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
                    template: `<el-container style="height: calc(100vh - 180px);">
                                    <el-main>
                                        <form class="form-horizontal">
                                            <div class="form-group" v-for="(value,key) in model.rows[0]" style="padding: 0px 10px;margin-bottom: 1px;">
                                                <label :for="key" class="col-sm-2 control-label" style="text-align:left;">#{key}#</label>
                                                <div class="col-sm-10" style="border-left: 1px solid rgb(235, 235, 244);">
                                                    <input type="text" class="form-control-bg-grey" :placeholder="key" :value="moment(value).format('LLL')" v-if="_.includes(key,'day')">
                                                    <input type="text" class="form-control-bg-grey" :placeholder="key" :value="moment(value).format('LLL')" v-else-if="_.includes(key,'occurrence')">
                                                    <input type="text" class="form-control-bg-grey" :placeholder="key" :value="moment(value).format('LLL')" v-else-if="_.includes(key,'time')">
                                                    <input type="text" class="form-control-bg-grey" :placeholder="key" :value="value" v-else>
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
                        model: Object
                    },
                    data(){
                        return {
                            
                        }
                    },
                    template:  `<el-container style="height: calc(100vh - 180px);">
                                    <el-main style="padding:0px;">
                                        <el-table-component :model="model" expandColumn="true"></el-table-component>
                                    </el-main>
                                </el-container>`,
                    mounted(){
                        
                    },
                    methods: {
                        
                    }
                })

                // 智能分组 grid [deserted]
                Vue.component("event-view-aigroup-grid",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    template:`<el-table-component :model="model" expandColumn="true"></el-table-component>`,
                    mounted(){
                        
                    },
                    methods: {
                        
                    }
                })

                // 智能分组 graph
                Vue.component("event-view-aigroup-graph",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object,
                    },
                    data(){
                        return {
                            id: objectHash.sha1(_.now()),
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
                            deep:true,
                            immediate:true
                        }
                    },
                    methods: {
                        initData(){
                            
                            if(!this.model) {
                                return false;
                            }

                            try {
                                
                                if(!this.topological){
                                    this.topological = new Topological();
                                    this.topological.init();
                                    this.topological.graphScript = [
                                        {value: `match () - [*1] -> ("${_.map(this.model.rows,'entity').join('","')}") - [*1] -> ()`}
                                    ];
                                    this.topological.mount(`#topological-app-${this.id}-${this.rId}`);

                                } else {
                                    this.topological.graphScript = [ {value: `match () - [*1] -> ("${_.map(this.model.rows,'entity').join('","')}") - [*1] -> ()`} ];
                                    this.topological.search(this.topological.graphScript[0].value);
                                }

                                _.delay(() => {
                                    this.topological.setStyle();
                                },5000)

                            } catch(err){
                                
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
                            dt: {
                                rows: [],
                                columns: [],
                                selected: [],
                                modelByGroup: null
                            },
                            split:{
                                inst: null
                            },
                            control: {
                                ifGraph: '0'
                            }
                        }
                    },
                    template: `<el-container style="height: calc(100vh - 150px);padding:1px;">
                                    <el-aside style="width:300px;background: #f6f6f6;overflow:hidden;" class="split" id="aigroup-left-panel">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-main style="padding:0px;overflow:auto;">
                                                <el-table-component :model="dt" ref="groups" expandColumn="false"></el-table-component>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container class="split" id="aigroup-right-panel">
                                        <el-header style="height:30px;line-height:30px;background: #f6f6f6;display:;">
                                            <el-tooltip :content="control.ifGraph==0?'列表':'图'" placement="top" open-delay="500">
                                                <div style="float:right;">
                                                    
                                                    <el-switch
                                                    v-model="control.ifGraph"
                                                    active-color="#13ce66"
                                                    inactive-color="#409EFF"
                                                    active-value="0"
                                                    inactive-value="1"
                                                    active-text="列表"
                                                    inactive-text="图"
                                                    @change="toggleView">
                                                    </el-switch>
                                                </div>
                                            </el-tooltip>
                                        </el-header>
                                        <el-main style="padding:0px;height:100%;">
                                            <el-tabs v-model="control.ifGraph" style="height:100%;">
                                                <el-tab-pane label="" name="0" lazy="true" style="height:100%;">
                                                    <event-view-aigroup-grid :model="dt.modelByGroup" expandColumn="true"></event-view-aigroup-grid>
                                                </el-tab-pane>
                                                <el-tab-pane label="" name="1" lazy="true" style="height:100%;">
                                                    <event-view-aigroup-graph :model="dt.modelByGroup" ></event-view-aigroup-grap>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    watch: {
                        'dt.selected':function(val,oldVal){
                            this.getEventByGroup();
                        }  
                    },
                    created(){
                        const self = this;

                        // 根据model进行分组
                        let ids = _.map(this.model.rows,'id').join(";");
                        let rtn = fsHandler.callFsJScript("/matrix/event/aigroup-list-by-ids.js",encodeURIComponent(self.$root.$refs.searchRef.result.term)).message;
                        self.dt.rows = rtn.rows;
                        self.dt.columns = rtn.columns;
                    },
                    mounted(){
                        this.init();
                        this.$watch(
                            "$refs.groups.dt.selected",(val, oldVal) => {
                                this.dt.selected = val;
                            }
                        );
                    },
                    methods: {
                        init(){    
                            this.split.inst = Split(['#aigroup-left-panel', '#aigroup-right-panel'], {
                                sizes: [38, 62],
                                minSize: [0, 0],
                                gutterSize: 5,
                                gutterAlign: 'end',
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true,
                            });

                            // 默认选择第一行
                            _.delay(()=>{
                                //this.$refs.groups.$refs.table.toggleRowSelection(this.$refs.groups.dt.rows[0],true);
                                this.$refs.groups.$refs.table.setCurrentRow(this.$refs.groups.dt.rows[0]);
                            },1000)
                            

                            // 隐藏tabs header
                            $(".el-tabs > .el-tabs__header",this.$el).css({
                                "display":"none"
                            });
                            $(".el-tabs > .el-tabs__content",this.$el).css({
                                "height":"100%"
                            });
                        },
                        toggleView(event){
                            this.control.ifGraph = event;
                        },
                        getEventByGroup(){
                            try{
                                // SEARCH
                                let where = this.dt.selected[0].ids;//_.map(this.dt.selected,'ids').join(";");
                                this.dt.modelByGroup = fsHandler.callFsJScript("/matrix/event/aigroup-by-id.js", encodeURIComponent(where)).message;
                            } catch(err){
                                this.dt.modelByGroup = null;
                            }
                        }
                    }
                })

                // 维度关联性告警
                Vue.component("event-diagnosis-dimension",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            dt: {
                                rows: [],
                                columns: [],
                                selected: [],
                                ifOR: '1'
                            },
                            modelByDimension: null
                        }
                    },
                    template:  `<el-container style="height: calc(100vh - 180px);">
                                    <el-aside style="background: rgb(241, 241, 241);overflow:hidden;" class="split" id="left-panel">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-header style="height: 30px;
                                                                float: right;
                                                                line-height: 30px;">
                                                当前告警
                                                <el-switch
                                                    v-model="dt.ifOR"
                                                    active-text="AND"
                                                    inactive-text="OR"
                                                    style="right:-40%;">
                                                </el-switch>
                                            </el-header>
                                            <el-main style="padding:0px;overflow:auto;">
                                                <el-table-multiselect-component :model="dt" ref="dimension"></el-table-multiselect-component>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container class="split" id="right-panel">
                                        <el-main style="padding:0px;">
                                            <el-table-component :model="modelByDimension" expandColumn="false"></el-table-component>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    watch: {
                        'dt.selected':function(val,oldVal){
                            this.getEventByDimension();
                        }  
                    },
                    created(){
                        
                        this.dt.rows = _.map(_.toPairs(this.model.rows[0]),(v)=>{
                            return {title:v[0],data:v[1]};
                        });

                        this.dt.columns = [{field:'title',title:'维度'},{field:'data',title:'值'}];

                    },
                    mounted(){
                        
                        this.init();
                        
                        this.$watch(
                            "$refs.dimension.dt.selected",(val, oldVal) => {
                                this.dt.selected = val;
                            }
                        );

                    },
                    methods: {
                        init(){    
                            
                            Split(['#left-panel', '#right-panel'], {
                                sizes: [45, 55],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal',
                            });

                            _.delay(()=>{
                                // 默认选择第一行
                                this.$refs.dimension.$refs.table.setCurrentRow(this.$refs.dimension.dt.rows[0]);
                            },500)
                            
                        },
                        getEventByDimension(){
                            
                            try{

                                let temp = _.map(this.dt.selected,(v)=>{
                                    // MQL
                                    //return `${v.title}='${v.data}'`;
                                    // SEARCH
                                    return `${v.title}=${v.data}`.replace(/%/g,'%25');
                                })

                                // SEARCH
                                let where = temp.join(` ${this.dt.ifOR=='1'?' | ':'; '} `);
                                this.modelByDimension = fsHandler.callFsJScript("/matrix/event/diagnosis-dimension-by-value.js", encodeURIComponent(where)).message;
                            } catch(err){
                                this.modelByDimension = null;
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
                    template:  `<el-container style="height: calc(100vh - 180px);">
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
                        }
                    }
                })

                // 资源信息
                Vue.component("event-diagnosis-topological",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:  `<el-container style="height: calc(100vh - 180px);">
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
                            mxTopo.mount(`#topological-app-${this.id}`);
                            
                            _.delay(()=>{
                                mxTopo.app.contextMenu();
                            },500)

                        }
                    }
                })

                // Runbook
                // 获取下发脚本列表，获取脚本下发执行结果
                Vue.component("event-diagnosis-script",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            id: _.now(),
                            dt: {
                                rows: [],
                                columns: [],
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
                    template:  ` <el-container style="height:calc(100vh - 180px);">
                                    <el-aside style="width:300px;background: #f7f7f7;overflow:hidden;" :class="'split left-panel-'+id">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-main style="padding:0px;overflow:auto;">
                                                <el-table-component :model="dt" expandColumn="true" ref="script"></el-table-component>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container :class="'split right-panel-'+id">
                                        <el-header style="height:30px;line-height:30px;background: #f7f7f7;display:;padding: 0px 10px;">
                                            <el-tooltip content="下发脚本">
                                                <el-button type="text" style="float: right;" @click="scriptRun" icon="fas fa-running"></el-button>
                                            </el-tooltip>
                                        </el-header>
                                        <el-main style="padding:0px;background:#333333;">
                                            <div contenteditable="true" style="height:100vh;color:rgb(23, 236, 59);outline-style: none;white-space: pre-line;">
                                                #{dt.result.outputs.toString()}#
                                            </div>
                                        </el-main>
                                        <el-footer style="height:30px;line-height:30px;background: #f7f7f7;display:;padding: 0px 10px;">
                                            <el-tooltip :content="'查看作业: ' + dt.result.runid">
                                                <el-link style="float: right;" @click="job(dt.result.runid)" icon="fas fa-task">#{dt.result.runid}#</el-link>
                                            </el-tooltip>
                                            <el-tooltip :content="'查看会话: ' + dt.result.sid">
                                                <el-link style="float: right;" @click="job(dt.result.sid)" icon="fas fa-task">#{dt.result.sid}#</el-link>
                                            </el-tooltip>
                                        </el-footer>
                                    </el-container>
                                </el-container>`,
                    watch: {
                        'dt.selected':{
                            handler(val, oldVal) {
                                if(val !== oldVal){
                                    this.dt.result.outputs = [];
                                }
                            },
                            immediate: true
                        }
                    },
                    created(){
                        this.dt = _.extend(this.dt,{
                            rows: this.model.rows,
                            columns: this.model.columns
                        });
                    },
                    mounted(){
                        this.init();
                        this.$watch(
                            "$refs.script.dt.selected",(val, oldVal) => {
                                this.dt.selected = val;
                            }
                        );
                    },
                    methods: {
                        init(){    
                            this.split.inst = Split([`.left-panel-${this.id}`, `.right-panel-${this.id}`], {
                                sizes: [33, 67],
                                minSize: [0, 0],
                                gutterSize: 5,
                                gutterAlign: 'end',
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true,
                            });

                            // 默认选择第一行
                            _.delay(()=>{
                                this.$refs.script.$refs.table.setCurrentRow(this.$refs.script.dt.rows[0]);
                            },1000)
                        },
                        scriptRun(){
                            console.log(2,this.dt.selected)
                            let cmd = this.dt.selected[0].name;
                            let server = "wecise";
                            let user = "matrix";
                            try {
                                this.dt.result.outputs[0] = `${server}:~ ${user}$ ${cmd}\n`;

                                let rtn = jobHandler.callJob(cmd,'wecise');
                                this.dt.result.runid = rtn.message.runid;
                                this.dt.result.sid = rtn.message.sid;
                                this.dt.result.outputs.push(rtn.message.outputs[0]);

                            } catch(err){
                                this.dt.result.outputs = [];
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

                // 视图 Table
                Vue.component("view-table-component",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    template:   `<el-table :data="model.rows" 
                                        @selection-change="onSelectionChange"
                                        style="width: 100%" height="300" 
                                        border 
                                        stripe>
                                    <el-table-column type="selection" width="55"></el-table-column>
                                    <el-table-column sortable :prop="item.field" :label="item.title" :width="item.width" v-for="item in model.columns">
                                        <template slot-scope="scope">
                                            <el-input v-model="scope.row[item.field]"></el-input>
                                        </template>
                                    </el-table-column>
                                </el-table>`,
                    data(){
                        return {
                            dt:{
                                selected: []
                            }
                        }
                    },
                    methods:{
                        onSelectionChange(val){
                            console.log(val)
                            this.dt.selected = val;
                        }
                    }

                })
                // 视图
                Vue.component("view-component",{
                    delimiters: ['#{', '}#'],
                    template:   `<el-container class="animated fadeInLeft" style="height:100%;">
                                    <el-aside style="height:100%;background:#f7f7f7;">
                                        <el-container  style="height:100%;">
                                            <el-header style="height:30px;line-height:30px;width:100%;text-align:right;">
                                                <el-tooltip content="刷新视图">
                                                    <el-button type="text" icon="el-icon-refresh" @click="load"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="新建视图">
                                                    <el-button type="text" icon="el-icon-plus" @click="onAdd"></el-button>
                                                </el-tooltip>
                                            </el-header>
                                        
                                            <el-main style="height:100%;overflow:auto;">
                                                <el-radio-group v-model="view.activeName" @change="onChange">
                                                    <el-radio :label="item.name"  style="padding:10px;" v-for="item in view.list" v-if="view.list">
                                                        <el-card :body-style="{ padding: '5px' }" style="text-align: center;">
                                                            <el-image src="/fs/assets/images/robot/png/online-service.png?issys=true&type=open" fit="fill" style="width:200px;height:120px;padding-top:10px;"></el-image>
                                                            <div style="padding: 0px;">
                                                            <span>#{item.title}#</span>
                                                                <el-tooltip content="删除视图">
                                                                    <el-button type="text"  icon="el-icon-delete" @click.native="onDelete(item)"></el-button>
                                                                </el-tooltip>
                                                            </div>
                                                        </el-card>
                                                    </el-radio>
                                                </el-radio-group>
                                            </el-main>

                                        </el-container>
                                    </el-aside>
                                    <el-main style="padding:0px;height: 100%;overflow:auto;">
                                        <el-container  style="height:100%;">
                                            <el-header style="height:30px;line-height:30px;width:100%;text-align:right;">
                                                <el-tooltip content="退出视图编辑">
                                                    <el-button type="text" icon="el-icon-close" @click="$root.view.show=false"></el-button>
                                                </el-tooltip>
                                            </el-header>
                                            <el-main style="height:100%;overflow:auto;">
                                                <el-form :model="view.activeModel" label-width="120px" v-if="view.activeModel">
                                                    
                                                    <el-form-item label="视图标题">
                                                        <el-input type="textarea" v-model="view.activeModel.title"></el-input>
                                                    </el-form-item>
                                                    <el-form-item label="条件">
                                                        <el-select v-model="view.activeModel.class" 
                                                            placeholder="请选择类" 
                                                            default-first-option 
                                                            @change="onCondsChange">
                                                            <el-option v-for="item in view.class.list"
                                                            :key="item.key"
                                                            :label="item.label"
                                                            :value="item.key">
                                                            <span style="float: left">#{ item.label }#</span>
                                                            <span style="float: right; color: #8492a6; font-size: 12px">#{ item.key }#</span>
                                                            </el-option>
                                                        </el-select>
                                                        <el-popover
                                                            placement="top-start"
                                                            title="提示"
                                                            width="200"
                                                            trigger="hover"
                                                            content="按类定义视图，并选择视图中的显示属性">
                                                            <el-button type="text" slot="reference"><i class="el-icon-question"></i></el-button>
                                                        </el-popover>

                                                        <view-table-component :model="view.activeModel.template" ref="table"></view-table-component>

                                                        <el-popover
                                                            placement="top-start"
                                                            title="提示"
                                                            width="200"
                                                            trigger="hover"
                                                            content="可自定义视图过滤条件，参考一键搜索语法">
                                                            <el-button type="text" slot="reference"><i class="el-icon-question"></i></el-button>
                                                        </el-popover>
                                                        <el-input type="textarea" v-model="view.activeModel.filters" autosize="true"></el-input>

                                                    </el-form-item>
                                                    <el-form-item label="创建时间">
                                                        <el-input v-model="moment(view.activeModel.time).format('YYYY-MM-DD HH:MM:SS')"></el-input>
                                                    </el-form-item>
                                                </el-form>
                                            </el-main>
                                            <el-footer style="height:60px;line-height:60px;text-align:right;">
                                                <el-button type="primary" icon="el-icon-edit" @click="onSave">提交</el-button>
                                            </el-footer>
                                        </el-container>
                                    </el-main>
                                </el-container>`,
                    data(){
                        return {
                            // view
                            view: {
                                show: false,
                                // 类
                                class: {
                                    value: "/matrix/devops/event",
                                    list:[]
                                },
                                activeName: "all",
                                // 当前视图model
                                activeModel: null,
                                //按条件选择  按类、按属性条件
                                filter:{
                                    filters: "",
                                    class:"",
                                    template: {
                                        rows:[],
                                        columns: [],
                                        selected: []    
                                    }
                                },
                                list: [],
                            }
                        }
                    },
                    created(){
                        this.load();
                    },
                    mounted(){
                        this.$watch(
                            "$refs.table.dt.selected",(val, oldVal) => {
                                this.view.filter.template.selected = val;
                            }
                        );
                    },
                    methods:{
                        load(){
                            // 视图列表
                            let term = JSON.stringify({class: "event", action:"list"});
                            this.view.list = fsHandler.callFsJScript("/matrix/view/action.js",encodeURIComponent(term)).message;;
                            
                            // 默认视图
                            this.view.activeModel = _.find(this.view.list,{name:this.view.activeName});
                            console.log(this.view.activeModel)
                            // 当前视图class
                            this.view.class.list = fsHandler.callFsJScript("/matrix/view/class.js",encodeURIComponent(this.view.class.value)).message;
                            // 当前视图属性
                            this.onCondsChange(this.view.activeModel.class);
                        },
                        onCondsChange(val){
                            this.view.activeModel.template = fsHandler.callFsJScript("/matrix/view/props.js",encodeURIComponent(val)).message;
                        },
                        onChange(val){
                            this.view.activeModel = _.find(this.view.list,{name:this.view.activeName});
                        },
                        onAdd(){
                            let name = _.now();
                            let title = `view_${name}`;
                            let term = JSON.stringify({
                                                        class: "event", 
                                                        action:"add",
                                                        model:{name: name,title: title, filter: { class: "", template: [], filters:""}, time: _.now()}
                                                    });
                            let rtn = fsHandler.callFsJScript("/matrix/view/action.js",encodeURIComponent(term)).message;
                            if(rtn==1){
                                this.view.activeName = name;
                                this.load();
                            }
                        },
                        onSave(){
                            _.extend(this.view.activeModel,{time: _.now()});

                            let term = JSON.stringify({
                                                        class: "event", 
                                                        action:"update", 
                                                        model: _.extend(this.view.activeModel,{filter:{
                                                                                                class: this.view.filter.class.value,
                                                                                                template: this.view.filter.template.selected,
                                                                                                filters: this.view.filter.filters
                                                                                            }}) 
                                        });
                            let rtn = fsHandler.callFsJScript("/matrix/view/action.js",encodeURIComponent(term)).message;
                            if(rtn==1){
                                this.load();
                            }
                        },
                        onDelete(item){
                            this.$confirm("确认要删除该视图？", '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                let term = JSON.stringify({class: "event", action:"delete", name:item.name});
                                let rtn = fsHandler.callFsJScript("/matrix/view/action.js",encodeURIComponent(term)).message;
                                
                                if(rtn==1){
                                    this.load();
                                    this.$message({
                                        type: 'success',
                                        message: '删除成功!'
                                    });
                                }else {
                                    this.$message({
                                        type: 'info',
                                        message: rtn.message
                                    });
                                }
                            }).catch(() => {
                                this.$message({
                                  type: 'info',
                                  message: '已取消删除'
                                });          
                            });
                        }
                    }

                })
                
                let main = {
                    delimiters: ['#{', '}#'],
                    template:   `<main id="content" class="content">
                                    <el-container>
                                        <el-header style="height: 30px;line-height: 30px;padding: 0px;">
                                            <search-base-component :id="model.id"
                                                                :options="options"
                                                                ref="searchRef"
                                                                class="grid-content"></search-base-component>
                                        </el-header>
                                        <el-main style="padding:0px;margin: 10px 0px;background: #fff;height: calc(100vh - 125px);overflow:hidden;" v-if="view.show">
                                            <view-component></view-component>
                                        </el-main>
                                        <el-main id="event-view-container" style="padding: 5px 0px 0px 0px;" >
                                            <el-tabs v-model="layout.main.activeIndex" class="eventViewContainer animated fadeInLeft" type="border-card" closable @tab-remove="detailRemove" @tab-click="handleClick">
                                                <el-tab-pane v-for="(item,index) in layout.main.tabs" :key="item.name" :label="item.title" :name="item.name" lazy=true style="padding:0px;">
                                                    <div v-if="item.type==='main'">
                                                        <div class="event-view-summary-control">
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
                                                            <el-tooltip :content="control.ifAiGroup==1?'智能分组启用中':'智能分组关闭中'" placement="top" open-delay="500">
                                                                <div>
                                                                    #{control.ifAiGroup==1?'智能分组':'智能分组'}#
                                                                    <el-switch
                                                                    v-model="control.ifAiGroup"
                                                                    active-color="#13ce66"
                                                                    inactive-color="#dddddd"
                                                                    active-value="1"
                                                                    inactive-value="0"
                                                                    @change="toggleSummaryByGroup">
                                                                    </el-switch>
                                                                </div>
                                                            </el-tooltip>
                                                        </div>
                                                        <el-container id="event-view-console">
                                                            <el-aside class="tree-view" id="event-view-left" style="background-color:#f6f6f6;">
                                                                <entity-tree-component id="event-tree" :model="{parent:'/event',name:'event_tree_data.js',domain:'event'}"></entity-tree-component>
                                                            </el-aside>
                                                            <el-main class="table-view" id="event-view-main" style="padding:5px;">
                                                                <event-view-facet :model="model.message" v-show="control.ifSmart!=0" style="margin-top:30px;"></event-view-facet>
                                                                <event-eventlist-component :model="model.message"></event-eventlist-component>
                                                            </el-main>
                                                        </el-container>
                                                    </div>
                                                    <div v-else-if="item.type==='diagnosis'">
                                                        <el-tabs v-model="layout.main.detail.activeIndex" style="background:#ffffff;" class="el-tabs-bottom-line"> 
                                                            <el-tab-pane v-for="it in item.child" :key="it.name" :label="it.title" :name="it.name"  lazy=true>
                                                                <div v-if="it.type==='detail'">
                                                                    <event-diagnosis-detail :id="it.name + '-detail'" :model="it.model.event"></event-diagnosis-detail>
                                                                </div>
                                                                <div v-else-if="it.type==='journal'">
                                                                    <event-diagnosis-journal :id="it.name + '-journal'" :model="it.model.journal"></event-diagnosis-journal>
                                                                </div>
                                                                <div v-else-if="it.type==='history'">
                                                                    <event-diagnosis-history :model="it.model.history"></event-diagnosis-history>
                                                                </div>
                                                                <div v-else-if="it.type==='dimension'">
                                                                    <event-diagnosis-dimension :model="it.model.dimension"></event-diagnosis-dimension>
                                                                </div>
                                                                <div v-else-if="it.type==='probability'">
                                                                    <event-diagnosis-probability :id="it.name + '-probability'" :model="it.model.probability"></event-diagnosis-probability>
                                                                </div>
                                                                <div v-else-if="it.type==='topological'">
                                                                    <event-diagnosis-topological :id="it.name + '-topological'" :model="it.model.event"></event-diagnosis-topological>
                                                                </div>
                                                                <div v-else-if="it.type==='script'">
                                                                    <event-diagnosis-script :model="it.model.script"></event-diagnosis-script>
                                                                </div>
                                                            </el-tab-pane>
                                                        </el-tabs>
                                                    </div>
                                                    <div v-else-if="item.type==='aiGroup'">
                                                        <event-view-aigroup id="event-view-aigroup" :model="model.message"></event-view-aigroup>
                                                    </div>
                                                </tab>
                                            </el-tabs>
                                        </el-main>
                                    </el-container>
                                </main>`,
                    data: {
                        view: {
                            show:false
                        },
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
                        //eventHub.$on("WINDOW-RESIZE-EVENT",event.resizeEventConsole);
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

                            Split(['#event-view-left', '#event-view-main'], {
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
                            // if(evt==1) {
                            //     $("#event-view-summary").css("height","200px").css("display","");
                            // } else {
                            //     $("#event-view-summary").css("height","0px").css("display","none");
                            // }
                            this.control.ifSmart = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                            // RESIZE Event Console
                            
                            //event.resizeEventConsole();
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
                            
                            //event.resizeEventConsole();
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
                            
                            //event.resizeEventConsole();
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
                                let model = fsHandler.callFsJScript("/matrix/event/diagnosis-by-id.js",term).message;
                                
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
                                    //event.resizeEventConsole();
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
                                    let rtn = fsHandler.callFsJScript("/matrix/event/action-by-id.js", encodeURIComponent(JSON.stringify(event).replace(/%/g,'%25'))).message;
                                    if(rtn == 1){
                                        //self.options.term = _.map(list,'id').join(";");
                                        self.$refs.searchRef.search();
                                    }
                                } else {
                                    
                                }
                            });
                            
                        },
                        contextMenu(tId,inst,items,fun){
                            const self = this;

                            $.contextMenu("destroy").contextMenu({
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
            
            //event.resizeEventConsole();

            // RESIZE Event Summary
            eventHub.$emit("WINDOW-RESIZE-EVENT");
        })

        
    }

    

    // /* resizeEventConsole(){
    //     let evwH = $(window).height();
    //     let evcH = $("#event-view-container").height();
    //     let evsH = $("#event-view-summary").height();
        
    //     $("#event-view-console .dataTables_scrollBody").css("max-height", evwH + "px")
    //                                                     .css("max-height","-=225px")
    //                                                     .css("max-height","-=" + evsH + "px")
    //                                                     .css("min-height", evwH + "px")
    //                                                     .css("min-height","-=225px")
    //                                                     .css("min-height","-=" + evsH + "px");
    // }

    // /* resizeEventConsole(){
    //     let evcH = $("#event-view-container").height();
    //     let evsH = $("#event-view-summary").height();
    //     let otherH = 120;
    //     console.log(1,evcH)
    //     $("#event-view-console .dataTables_scrollBody").css("max-height", evcH + "px")
    //                                                     .css("max-height","-=" + evsH + "px")
    //                                                     .css("max-height","-=" + otherH + "px")
    //                                                     .css("min-height", evcH + "px")
    //                                                     .css("min-height","-=" + evsH + "px")
    //                                                     .css("min-height","-=" + otherH + "px");
    // } */

    // checkContainer(){
    //     if($('#event-view-container').is(':visible')) {
    //         this.layout();
    //         this.resizeContainer();
    //     } else {
    //         setTimeout(this.checkContainer, 50);
    //     }
    // }

    // resizeContainer(){
        
    //     let evwH = $(window).height();
    //     let headerH = $("header#header").height();
    //     let footerH = $("footer#footer").height();
    //     let otherH = 45;

    //     $("#event-view-container").css("min-height",evwH + "px")
    //                                 .css("min-height","-=" + headerH + "px")
    //                                 .css("min-height","-=" + footerH + "px")
    //                                 .css("min-height","-=" + otherH + "px");
        
    // } */
}