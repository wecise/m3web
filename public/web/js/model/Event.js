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
                            "search-base-component",
                            "search-log-component",
                            "form-component",
                            "form-card-component",
                            "md-editor-component"],function() {
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
                        'model.rows': {
                            handler(val,oldVal){
                                if(val !== oldVal){
                                    this.dt.rows = [];
                                    this.initData();
                                }
                                this.layout();
                            },
                            deep:true
                        },
                        dt: {
                            handler(val,oldVal){
                                this.info = [];
                                this.info.push(`共 ${this.dt.rows.length} 项`);
                                this.info.push(`已选择 ${this.dt.selected.length} 项`);
                                this.info.push(moment().format("YYYY-MM-DD HH:MM:SS.SSS"));

                                // 有选择情况下
                                // 初始化drag&drop
                                // if(!_.isEmpty(val.selected)){
                                //     this.dragHandle(true);
                                //     this.dropHandle();
                                // } else{
                                //     this.dragHandle(false);
                                // }
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
                                        <el-tooltip content="刷新" open-delay="500" placement="top">
                                            <el-button type="text" @click="$root.$refs.searchRef.search" icon="el-icon-refresh"></el-button>
                                        </el-tooltip>
                                        <el-tooltip :content="mx.global.register.event.status[item][1]" open-delay="500" placement="top" v-for="item in model.actions" v-if="!_.isEmpty(model.actions)">
                                            <el-button type="text" @click="onAction(item)" :icon="mx.global.register.event.status[item][2]"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="导出" delay-time="500">
                                            <el-dropdown @command="onExport" style="margin-left:5px;">
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
                                        <el-tooltip :content="$root.control.viewType" placement="top" open-delay="500">
                                            <el-dropdown @command="$root.toggleView" style="margin-left:5px;">
                                                <span class="el-dropdown-link">
                                                    <el-button type="text" icon="el-icon-s-platform"></el-button>
                                                </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item command="m">监控模式</el-dropdown-item>
                                                    <el-dropdown-item command="o">运维模式</el-dropdown-item>
                                                    <el-dropdown-item command="f">全屏模式</el-dropdown-item>
                                                    <el-dropdown-item command="e">退出全屏</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </el-tooltip>
                                    </el-header>   
                                    <el-main style="padding:0px;" @mouseup.native="onMainClick">
                                        <el-table
                                            :data="dt.rows"
                                            highlight-current-row="true"
                                            style="width:100%"
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
                                                                    <el-input :type="k,metaColumns | pickType" :rows="6" :value="JSON.stringify(v,null,4)"  v-else-if="_.includes(['map','set','list'],pickFtype(k))"></el-input>
                                                                    <el-input :type="k,metaColumns | pickType" :value="v"  v-else></el-input>
                                                                </el-form-item>
                                                            </el-form>
                                                        </el-main>
                                                    </el-container>
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
                    computed:{
                        metaColumns(){
                            try{
                                return this.model.columns[this.model.rootClass];
                            } catch(err){
                                return [];
                            }
                        }
                    },
                    mounted(){
                        this.$nextTick(()=>{
                            this.layout();
                        })
                    },
                    methods: {
                        pickFtype(key){
                
                            let rtn = 'string';
                            try{
                                rtn = _.find(this.metaColumns,{data:key}).type;
                            } catch(err){
                                return rtn;
                            }
                            return rtn;
                        },
                        layout(){
                            let doLayout = ()=>{
                                if($(".el-table-column--selection",this.$el).is(':visible')){
                                    _.delay(()=>{
                                        this.$refs.table.doLayout();
                                    },1000)
                                } else {
                                    setTimeout(doLayout,50);
                                }
                            }
                            doLayout();
                        },
                        initData(){
                            
                            let init = ()=>{
                                
                                _.extend(this.dt, {columns: _.map(this.model.template, function(v){
                                    
                                    if(_.isUndefined(v.visible)){
                                        _.extend(v, { visible: true });
                                    }

                                    if(!v.render){
                                        return v;
                                    } else {
                                        return _.extend(v, { render: eval(v.render) });
                                    }
                                    
                                })});

                                _.extend(this.dt, { rows: [] });
                                _.delay(()=>{
                                    _.extend(this.dt, { rows: this.model.rows });
                                },500);
                                    
                            };

                            if($("table",this.$el).is(':visible')){
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
                        // 监听鼠标操作 停止自动刷新
                        onMainClick(){
                            this.$root.control.ifRefresh=0;
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
                                            } else if(_.includes(key,'window')) {
                                                
                                                try{
                                                    let tmp = JSON.parse(key.split("::")[1]);
                                                    let url = tmp.url;
                                                    let target = tmp.target;
                                                    window.open(url,target);
                                                } catch(err){
                                                    
                                                }
                                                
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
                            
                        },
                        dragHandle(flag){
                            
                            let elFrom = $("tbody tr",this.$refs.table.$el);

                            if(flag) {
                                elFrom.attr("draggable","true");
                                addEvent(elFrom, 'dragstart', (e)=> {
                                    e.dataTransfer.effectAllowed = 'copy';
                                    e.dataTransfer.setData("item", JSON.stringify(this.dt.selected));
                                });
                            } else {
                                elFrom.off('dragstart');
                            }
                            
                        },
                        dropHandle(){
                            // init drop for tree
                            let treeName = "event-tree";
                            let elTo = $('div[role="treeitem"]',this.$root.$refs.tagTree[0].$refs.tree.$el);
                            console.log(1,elTo)
                            // addEvent(elTo, 'dragleave', function (e) {
                            //     let tId = $(e.target).attr("id").replace(/_span/g,"_a");
            
                            //     $(`#${tId}`).removeClass("curSelectedNode");
                            // });
            
            
                            // addEvent(elTo, 'dragover', function (e) {
                            //     e.preventDefault();
                            //     let tId = $(e.target).attr("id").replace(/_span/g,"_a");
            
                            //     $(`#${tId}`).addClass("curSelectedNode");
                            // });
            
                            addEvent(elTo, 'drop', (e)=> {
                                e.preventDefault();
                                // 接收数据
                                let data = _.attempt(JSON.parse.bind(null, e.dataTransfer.getData("item")));
                                e.dataTransfer.clearData();
                                //console.log(1,elTo.target.data("item"),e,e.target.textContent,data,this.$root.$refs.tagTree[0].nodes)
                                console.log(11,this.$root.$refs.tagTree[0].$refs.tree.getNode(3))
                                //target
                                let targetNode = _.filter(this.$root.$refs.tagTree[0].$refs.tree.nodes,{name:e.target.textContent});
                                console.log(2,targetNode)
                                // // 获取tree tID
                                // let tId = $(e.target).attr("id").replace(/_span/g,"");
                                // let treeObj = $.fn.zTree.getZTreeObj(treeName);
                                // let node = treeObj.getNodeByTId(tId);
            
                                // let input = null;
                                // // 删除标签
                                // if(node.cid == 'A3'){
                                //     input = {class: `${_.split( data[0].class,"/",4).join("/")}/`, action: "-", tag: null, id: _.map(data,'id')};
                                // } 
                                // // 打标签
                                // else {
                                //     input = {class: `${_.split( data[0].class,"/",4).join("/")}/`, action: "+", tag: _.last(node.name.split("/")), id: _.map(data,'id')};
                                // }
                                
                                // let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
            
                                // if(rtn.status == 'ok'){
                                //     self.$root.$refs.searchRef.search();
                                // }
            
                                // $(`#${treeName} .curSelectedNode`).removeClass("curSelectedNode");
            
                            });
                        }
                    }
                })

                // Table组件 单选
                Vue.component("el-table-component",{
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
                                this.layout();
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
                    template:   `<el-container style="width:100%;height:100%;">
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
                                    <el-main style="width:100%;padding:0px;">
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
                    filters:{
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
                    computed:{
                        metaColumns(){
                            try{
                                return this.model.columns[this.model.rootClass];
                            } catch(err){
                                return [];
                            }
                        }
                    },
                    mounted(){

                    },
                    methods: {
                        pickFtype(key){
                            
                            let rtn = 'string';
                            try{
                                rtn = _.find(this.metaColumns,{data:key}).type;
                            } catch(err){
                                return rtn;
                            }
                            return rtn;
                        },
                        layout(){
                            let doLayout = ()=>{
                                if($(".el-table-column--selection",this.$el).is(':visible')){
                                    _.delay(()=>{
                                        this.$refs.table.doLayout();
                                    },1000)
                                } else {
                                    setTimeout(doLayout,50);
                                }
                            }
                            doLayout();
                        },
                        initData(){
                            
                            try{
                                _.delay(()=>{

                                    if(_.isEmpty(this.model)){ 
                                        return false; 
                                    }

                                    this.$set(this.dt, 'columns', _.map(this.model.columns, (v)=>{
                                    
                                        if(_.isUndefined(v.visible)){
                                            _.extend(v, { visible: true });
                                        }
    
                                        if(!v.render){
                                            return v;
                                        } else {
                                            return _.extend(v, { render: eval(v.render) });
                                        }
                                        
                                    }));
                                    
                                    this.$set(this.dt, 'rows', this.model.rows);
                                },1000)

                            } catch(err){

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

                // Table组件 单选 智能分组用
                Vue.component("el-table-aigroup-component",{
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
                                this.layout();
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
                    template:   `<el-container style="width:100%;height:100%;">
                                    <el-main style="width:100%;padding:0px;">
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
                    methods: {
                        layout(){
                            let doLayout = ()=>{
                                if($(".el-table-column--selection",this.$el).is(':visible')){
                                    _.delay(()=>{
                                        this.$refs.table.doLayout();
                                    },1000)
                                } else {
                                    setTimeout(doLayout,50);
                                }
                            }
                            doLayout();
                        },
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
                                this.layout();
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
                        layout(){
                            let doLayout = ()=>{
                                if($(".el-table-column--selection",this.$el).is(':visible')){
                                    _.delay(()=>{
                                        this.$refs.table.doLayout();
                                    },1000)
                                } else {
                                    setTimeout(doLayout,50);
                                }
                            }
                            doLayout();
                        },
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

                // 智能分组 grid [deserted]
                Vue.component("event-view-aigroup-grid",{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    template:`<el-table-component :model="model"></el-table-component>`,
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
                                
                                // 所有实体
                                //let actions = _.map(this.model.rows,'entity').join('","');
                                let actionsArr = [];
                                let actions = "";
                                _.forEach(this.model.rows,(v)=>{ 
                                    if(!_.isEmpty(v['refer'])){
                                        if(!_.isEmpty(v['refer']['_all'])){
                                            actionsArr.push(v['refer']['_all']);
                                        }
                                    }
                                });
                                actions = actionsArr.join('","');
                                
                                let matchObj = {value: `match () - [*1] -> ("${actions}") union ("${actions}") - [*1] -> ()`};
                                
                                if(!this.topological){
                                    this.topological = new Topological();
                                    this.topological.init();
                                    
                                    this.topological.graphScript = [matchObj];
                                    this.topological.mount(`#topological-app-${this.id}-${this.rId}`);

                                } else {
                                    this.topological.graphScript = [matchObj];
                                    this.topological.search(this.topological.graphScript[0].value);
                                }

                            } catch(err){
                                console.log(err)
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
                                ifGraph: '0',
                                ifGroupFullScreen: false,
                                ifGraphFullScreen: false
                            }
                        }
                    },
                    template: `<el-container :style="$root.control.view.mode | pickContainerStyle">
                                    <el-aside style="width:300px;background: #f6f6f6;overflow:hidden;" class="split" ref="leftView">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-header style="height:30px;line-height:30px;background: #f6f6f6;display:;">
                                                <el-tooltip content="刷新" placement="top" open-delay="500">
                                                    <el-button type="text" icon="el-icon-refresh"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="新建分组" placement="top" open-delay="500">
                                                    <el-button type="text" icon="el-icon-plus"></el-button>
                                                </el-tooltip>
                                                <el-button type="text" :icon="control.ifGroupFullScreen | pickScreenStyle" style="float:right;" @click="onGroupFullScreen"></el-button>
                                            </el-header>
                                            <el-main style="padding:10px;overflow:auto;" ref="groupListRef">
                                                <el-table-aigroup-component :model="dt" ref="groups" style="height:100%;"></el-table-aigroup-component>
                                                <!--el-table-aigroup-component :model="dt" ref="groupsByManual" style="height:50%;"></el-table-aigroup-component-->
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container class="split" ref="container">
                                        <el-header style="height:30px;line-height:30px;background: #f6f6f6;display:;">
                                            <el-tooltip content="列表" placement="top" open-delay="500">
                                                <el-button type="text" icon="el-icon-s-grid" @click="control.ifGraph='0'"></el-button>
                                            </el-tooltip>
                                            <el-tooltip content="图" placement="top" open-delay="500">
                                                <el-button type="text" icon="el-icon-data-line" @click="control.ifGraph='1'"></el-button>
                                            </el-tooltip>
                                            <!--el-button type="text" :icon="control.ifGraphFullScreen | pickScreenStyle" style="float:right;" @click="onGraphFullScreen"></el-button-->
                                        </el-header>
                                        <el-main style="padding:0px;height:100%;">
                                            <el-tabs v-model="control.ifGraph" style="height:100%;">
                                                <el-tab-pane label="" name="0" lazy="true" style="height:100%;">
                                                    <event-view-aigroup-grid :model="dt.modelByGroup"></event-view-aigroup-grid>
                                                </el-tab-pane>
                                                <el-tab-pane label="" name="1" lazy="true" style="height:100%;padding:5px;">
                                                    <event-view-aigroup-graph :model="dt.modelByGroup" ></event-view-aigroup-grap>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    filters: {
                        pickScreenStyle(evt){
                            if(evt){
                                return `el-icon-full-screen`;
                            } else {
                                return `el-icon-copy-document`;
                            }
                        },
                        pickContainerStyle(evt){
                            if(evt == 'aigroup'){
                                return `height: calc(100vh - 80px);padding:1px;`;
                            } else {
                                return `height: calc(100vh - 160px);padding:1px;`;
                            }
                        }
                    },
                    created(){
                        // 根据model进行分组
                        let ids = _.map(this.model.rows,'id').join(";");
                        let rtn = fsHandler.callFsJScript("/matrix/event/aigroup-list-by-ids.js",encodeURIComponent(ids)).message;
                        this.dt.rows = rtn.rows;
                        this.dt.columns = rtn.columns;
                    },
                    mounted(){
                        this.init();
                        this.$watch(
                            "$refs.groups.dt.selected",(val, oldVal) => {
                                this.dt.selected = val;
                                this.getEventByGroup();
                            }
                        );
                    },
                    methods: {
                        init(){    
                            this.split.inst = Split([this.$refs.leftView.$el, this.$refs.container.$el], {
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
                        getEventByGroup(){
                            try{
                                // SEARCH
                                let where = this.dt.selected[0].ids;
                                this.dt.modelByGroup = fsHandler.callFsJScript("/matrix/event/aigroup-by-id.js", encodeURIComponent(where)).message;
                            } catch(err){
                                this.dt.modelByGroup = null;
                            }
                        },
                        onGroupFullScreen(){
                            this.control.ifGroupFullScreen = mx.fullScreenByEl(this.$refs.groupListRef.$el);
                        },
                        onGraphFullScreen(){
                            this.control.ifGraphFullScreen = mx.fullScreenByEl(this.$refs.container.$el);
                        }
                    }
                })

                // 告警分片
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

                // 告警详情
                Vue.component("event-diagnosis-detail",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model:String
                    },
                    template: `<el-container :style="$root.control.viewType | heightByMode">
                                    <el-main>
                                        <el-form label-width="120px"  label-position="left" class="form-no-border">
                                            <el-form-item :label="key" v-for="(value,key) in model.rows[0]" style="margin:10px 0;">
                                                <el-input :value="moment(value).format('LLL')" disabled v-if="_.includes(['time','day'],key)"></el-input>
                                                <el-input :value="value" disabled v-else></el-input>
                                            </el-form-item>
                                        </el-form>
                                    </el-main>
                                </el-container>`,
                    mounted(){
                        
                    },
                    filters: {
                        heightByMode: function(viewType){
                            if(viewType === 'm'){
                                return `height: calc(100vh - 140px)`;
                            } else {
                                return `height: calc(100vh - 205px)`;
                            }
                        }
                    }
                });

                // 告警轨迹
                Vue.component("event-diagnosis-journal",{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template:   `<el-container :style="$root.control.viewType | heightByMode">
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
                        heightByMode: function(viewType){
                            if(viewType === 'm'){
                                return `height: calc(100vh - 140px)`;
                            } else {
                                return `height: calc(100vh - 205px)`;
                            }
                        },
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
                    template:  `<el-container :style="$root.control.viewType | heightByMode">
                                    <el-main style="padding:0px;">
                                        <el-table-component :model="model"></el-table-component>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        heightByMode: function(viewType){
                            if(viewType === 'm'){
                                return `height: calc(100vh - 140px)`;
                            } else {
                                return `height: calc(100vh - 205px)`;
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
                    template:  `<el-container :style="$root.control.viewType | heightByMode">
                                    <el-aside style="background: #f7f7f7;overflow:hidden;padding:0px 10px;" class="split" ref="leftView">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-header style="height: 30px;line-height: 30px;text-align: right;padding:0px;">
                                                <el-switch
                                                    v-model="dt.ifOR"
                                                    active-text="AND"
                                                    inactive-text="OR">
                                                </el-switch>
                                            </el-header>
                                            <el-main style="padding:0px;overflow:hidden;">
                                                <el-table-multiselect-component :model="dt" ref="dimension"></el-table-multiselect-component>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container class="split" ref="mainView">
                                        <el-main style="padding:0px;">
                                            <el-table-component :model="modelByDimension"></el-table-component>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    watch: {
                        'dt.selected':function(val,oldVal){
                            this.getEventByDimension();
                        }  
                    },
                    filters: {
                        heightByMode: function(viewType){
                            if(viewType === 'm'){
                                return `height: calc(100vh - 140px)`;
                            } else {
                                return `height: calc(100vh - 205px)`;
                            }
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
                            
                            Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
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
                        model: Object
                    },
                    data(){
                        return {
                            dt:{
                                rows: [],
                                columns: [],
                                template: []
                            },
                            activeName: ""
                        }
                    },
                    template:  `<el-container :style="$root.control.viewType | heightByMode">
                                    <el-aside  style="background: #f7f7f7;overflow:hidden;padding:10px;" ref="leftView">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-header style="text-align: right;line-height: 30px;height:30px;">
                                                <el-tooltip content="刷新" open-delay="500">
                                                    <el-button type="text" icon="el-icon-refresh"></el-button>
                                                </el-tooltip>
                                            </el-header>
                                            <el-main style="background:#ffffff;display: flex;flex-wrap: wrap;align-content: flex-start;justify-content: space-between;" v-if="model.rows">
                                                <el-radio-group v-model="activeName">
                                                    <el-radio :label="item.name" v-for="item in model.rows" :key="item.name">
                                                        <el-button type="default" style="max-width:100%;width:100%;height:auto;margin: 5px;border-radius: 10px!important;"  @click="toggleEvent(item.name)">
                                                            <div style="text-align:left;">
                                                            <p>相关业务：
                                                                <p v-for="biz in _.uniq(_.map(item.events,'biz'))" :key="biz" style="text-indent:25px;">#{biz}#</p>
                                                            </p>
                                                            <p>相关服务器：
                                                                <p v-for="host in _.uniq(_.map(item.events,'host'))" :key="host" style="text-indent:25px;">#{host}#</p>
                                                            </p>
                                                            <p>级别：
                                                                <el-button type="danger">#{_.filter(item.events,(v)=>{ return v.severity>=5 }).length}#</el-button>
                                                                <el-button type="warning">#{_.filter(item.events,(v)=>{ return v.severity>=4 && v.severity <5 }).length}#</el-button>
                                                            </p>
                                                        </el-button>
                                                    </el-radio>
                                                </el-radio-group>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container class="split" ref="mainView">
                                        <el-main style="padding:0px;">
                                            <el-table-component :model="dt"></el-table-component>
                                        </el-main>
                                    </el-container>
                                </el-container>`,
                    filters: {
                        heightByMode: function(viewType){
                            if(viewType === 'm'){
                                return `height: calc(100vh - 140px)`;
                            } else {
                                return `height: calc(100vh - 205px)`;
                            }
                        }
                    },
                    created(){
                        this.activeName = _.first(this.model.rows).name;
                    },
                    mounted(){
                        this.$nextTick(()=>{
                            this.init();
                        })
                    },
                    methods: {
                        init(){

                            _.extend(this.dt, {rows: _.first(this.model.rows).events, columns: this.model.template, template: this.model.template});
                            
                            _.delay(()=>{
                                Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                                    sizes: [30, 70],
                                    minSize: [0, 0],
                                    gutterSize: 5,
                                    cursor: 'col-resize',
                                    direction: 'horizontal',
                                });
                            },2000)

                        },
                        toggleEvent(event){
                            this.activeName = event;
                            _.extend(this.dt, { rows: _.find(this.model.rows,{name:event}).events } );
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
                    template:  `<el-container :style="$root.control.viewType | heightByMode">
                                    <el-main style="padding:0px;">
                                        <div :id="'topological-app-'+id"></div>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        heightByMode: function(viewType){
                            if(viewType === 'm'){
                                return `height: calc(100vh - 140px)`;
                            } else {
                                return `height: calc(100vh - 205px)`;
                            }
                        }
                    },
                    mounted(){
                        this.init();
                    },
                    methods: {
                        init(){    
                            let mxTopo= new Topological();
                            mxTopo.init();
                            mxTopo.graphScript = _.map(this.model.rows,(v)=>{
                                return {value: `match () - [*1] -> ("${v.entity}") union ("${v.entity}") - [*1] -> ()`};
                            });
                            mxTopo.mount(`#topological-app-${this.id}`);
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
                    template:  ` <el-container :style="$root.control.viewType | heightByMode">
                                    <el-aside style="width:300px;background: #f7f7f7;overflow:hidden;" ref="leftView">
                                        <el-container style="overflow:hidden;height:100%;">
                                            <el-main style="padding:0px;overflow:auto;">
                                                <el-table-component :model="dt" ref="script"></el-table-component>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container ref="container">
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
                    filters: {
                        heightByMode: function(viewType){
                            if(viewType === 'm'){
                                return `height: calc(100vh - 140px)`;
                            } else {
                                return `height: calc(100vh - 205px)`;
                            }
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
                            this.split.inst = Split([this.$refs.leftView.$el, this.$refs.container.$el], {
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
                            let url = `/matrix/job?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                })

                // 视图 Editor
                Vue.component("view-editor-component",{
                    delimiters: ['#{', '}#'],
                    props: {
                        render: String,
                        index: Number
                    },
                    data(){
                        return {
                            editor: null
                        }
                    },
                    template: `<div style="width:100%;height:200px;" ref="editor"></div>`,
                    beforeDestroy() {
                        this.editor.destroy();
                        this.editor.container.remove();
                    },
                    mounted(){
                        this.$nextTick(()=>{
                            this.init();
                        })
                    },
                    methods:{
                        init(){
                            this.editor = ace.edit(this.$refs.editor);
                            this.editor.setOptions({
                                // maxLines: 1000,
                                // minLines: 20,
                                autoScrollEditorIntoView: true,
                                enableBasicAutocompletion: true,
                                enableSnippets: true,
                                enableLiveAutocompletion: false
                            });
                            
                            this.editor.getSession().setMode("ace/mode/javascript");
                            this.editor.getSession().setUseSoftTabs(true);
                            this.editor.getSession().setTabSize(2);
                            this.editor.getSession().setUseWrapMode(true);

                            this.editor.setValue(this.render);

                            this.editor.on("change", _.debounce((v)=>{
                                this.$emit('update:render', this.editor.getValue());
                            },500));
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
                                        style="width: 100%" 
                                        height="300" 
                                        border 
                                        stripe
                                        ref="table">
                                    <el-table-column type="selection" width="55"></el-table-column>
                                    <el-table-column sortable :prop="item.field" :label="item.title" :width="item.width" v-for="item in model.columns" v-if="item.field!=='render'">
                                        <template slot-scope="scope">
                                            <el-input v-model="scope.row[item.field]"></el-input>
                                        </template>
                                    </el-table-column>
                                    <el-table-column type="expand" label="渲染">
                                        <template slot-scope="scope">
                                            <view-editor-component :render="scope.row.render" :index="scope.$index" @update:render="scope.row.render = $event"></view-editor-component>
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
                    watch:{
                        'model.selected':{
                            handler:function(val,oldVal){
                                _.delay(()=>{
                                    this.toggleSelection(val);
                                },1000)
                            },
                            deep: true
                        }
                    },
                    mounted(){
                        this.$nextTick().then(()=>{
                            this.toggleSelection(this.model.selected);
                            _.delay(()=>{
                                const el = $('tbody',this.$el)[0];
                                const self = this;
                                Sortable.create(el, {
                                    animation: 150,
                                    onEnd({ newIndex, oldIndex }) {
                                        const currRow = self.model.rows.splice(oldIndex, 1)[0];
                                        self.model.rows.splice(newIndex, 0, currRow)
                                    }
                                })
                            },3000)
                        })
                    },
                    methods:{
                        onSelectionChange(val){
                            this.dt.selected = val;
                        },
                        onExpandChange(row){
                            
                        },
                        toggleSelection(rows) {
                            this.dt.selected = rows;
                            _.forEach(rows, (v) => {
                                let index = _.indexOf(this.model.rows,v);
                                this.$refs.table.toggleRowSelection(this.model.rows[index],true);
                            });
                        }
                    }

                })

                // 视图
                Vue.component("view-component",{
                    delimiters: ['#{', '}#'],
                    props:{
                        model:Object
                    },
                    template:   `<el-container class="view-manage animated fadeInLeft" style="height:100%;">
                                    <el-aside style="width:270px;height:100%;background:#f7f7f7;">
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
                                                        <el-card :body-style="{ padding: '5px' }" style="text-align: center;padding:0px;">
                                                            <span class="el-icon-bank-card" style="font-size:65px;padding:0px 65px;"></span>
                                                            <div style="padding: 0px;text-align: right;">
                                                                <p style="margin: 0px;">#{item.title}#</p>
                                                                <p style="margin: 0px;">
                                                                    创建时间:#{moment(item.time).format(mx.global.register.format)}#
                                                                    <el-tooltip content="删除视图">
                                                                        <el-button type="text"  icon="el-icon-delete" @click.native="onDelete(item)"></el-button>
                                                                    </el-tooltip>
                                                                </p>
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
                                                    <el-button type="text" icon="el-icon-close" @click="onCloseView"></el-button>
                                                </el-tooltip>
                                            </el-header>
                                            <el-main style="height:100%;overflow:auto;padding:0 20px;">
                                                <el-form :model="view.activeModel" label-width="120px" label-position="top" v-if="view.activeModel">
                                                    
                                                    <el-form-item>
                                                        <template slot="label">
                                                            视图标题
                                                            <el-popover
                                                                placement="top-start"
                                                                title="提示"
                                                                width="200"
                                                                trigger="hover"
                                                                content="视图标题，表头显示名称">
                                                                <el-button type="text" slot="reference"><i class="el-icon-question"></i></el-button>
                                                            </el-popover>
                                                        </template>
                                                        <el-input type="textarea" v-model="view.activeModel.title"></el-input>
                                                    </el-form-item>
                                                    <el-form-item>
                                                        <template slot="label">
                                                            条件
                                                            <el-popover
                                                                placement="top-start"
                                                                title="提示"
                                                                width="200"
                                                                trigger="hover"
                                                                content="按类定义视图，并选择视图中的显示属性。属性可设置显示名称、宽度、是否排序及属性值的渲染。">
                                                                <el-button type="text" slot="reference"><i class="el-icon-question"></i></el-button>
                                                            </el-popover>
                                                        </template>
                                                        
                                                        <el-select v-model="view.activeModel.filter.class" 
                                                            placeholder="请选择类" 
                                                            default-first-option 
                                                            @change="onPropsChange">
                                                            <el-option v-for="item in view.class.list"
                                                            :key="item.key"
                                                            :label="item.label"
                                                            :value="item.key">
                                                            <span style="float: left">#{ item.label }#</span>
                                                            <span style="float: right; color: #8492a6; font-size: 12px">#{ item.key }#</span>
                                                            </el-option>
                                                        </el-select>

                                                        <view-table-component :model="view.filter.template" ref="table"></view-table-component>

                                                    </el-form-item>
                                                    <el-form-item>
                                                        <template slot="label">
                                                            条件
                                                            <el-popover
                                                                placement="top-start"
                                                                title="提示"
                                                                width="400"
                                                                trigger="hover"
                                                                content="可自定义视图过滤条件，参考一键搜索语法。例如：severity>=3 | status=10 | top 100">
                                                                <el-button type="text" slot="reference"><i class="el-icon-question"></i></el-button>
                                                            </el-popover>
                                                        </template>
                                                        <el-input type="textarea" v-model="view.activeModel.filter.filters" autosize="true"></el-input>
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
                            view: {
                                show: false,
                                // 类
                                class: {
                                    value: "/matrix/devops/alert",
                                    list:[]
                                },
                                // 当前视图name
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
                                // 视图列表
                                list: [],
                            }
                        }
                    },
                    created(){
                        this.load();
                    },
                    mounted(){
                        this.$nextTick(()=>{
                            // 默认视图
                            this.view.activeName = this.model.value;
                            // 默认视图Model
                            this.view.activeModel = _.find(this.view.list,{name:this.view.activeName});
                        })
                        this.$watch(
                            "$refs.table.dt.selected",(val, oldVal) => {
                                //this.view.filter.template.selected = val;
                            }
                        );
                    },
                    methods:{
                        load(){
                            // 视图列表
                            let term = JSON.stringify({class: "event", action:"list"});
                            this.view.list = fsHandler.callFsJScript("/matrix/view/action.js",encodeURIComponent(term)).message;;
                            this.$root.$refs.searchRef.view.list = this.view.list;
                            
                            // 默认视图
                            this.view.activeModel = _.find(this.view.list,{name:this.view.activeName});
                            
                            // 当前视图class
                            this.view.class.list = fsHandler.callFsJScript("/matrix/view/class.js",encodeURIComponent(this.view.activeModel.filter.class)).message;
                            
                            // 当前视图属性
                            
                            this.onPropsChange(this.view.activeModel.filter.class);
                        },
                        // 视图属性配置
                        onPropsChange(val){
                            this.view.filter.template = fsHandler.callFsJScript("/matrix/view/props.js",encodeURIComponent(val)).message;
                            if(!_.isEmpty(this.view.activeModel.filter.template)){
                                
                                _.forEach(this.view.activeModel.filter.template,(v)=>{
                                    let index = _.findIndex(this.view.filter.template.rows,{field:v.field});
                                    if(index != -1){
                                        this.view.filter.template.rows[index] = v;
                                    } else {
                                        this.view.filter.template.rows.push(v);
                                    }
                                })

                            }
                            _.extend(this.view.filter.template,{selected:this.view.activeModel.filter.template});
                            
                        },
                        // 视图切换
                        onChange(val){
                            // 当前视图配置
                            this.view.activeModel = _.find(this.view.list,{name:val});
                            // 当前视图属性配置
                            this.onPropsChange(this.view.activeModel.filter.class);
                        },
                        onAdd(){
                            let defaultClass = _.first(this.view.class.list).key;

                            let name = `view_${_.now()}`;
                            let title = `view_${name}`;
                            let term = JSON.stringify({
                                                        class: "event", 
                                                        action:"add",
                                                        model:{
                                                            name: name,
                                                            title: title, 
                                                            filter: { 
                                                                class: defaultClass, 
                                                                template: [], 
                                                                filters:""
                                                            }, 
                                                            time: _.now()
                                                        }
                                                    });
                            let rtn = fsHandler.callFsJScript("/matrix/view/action.js",encodeURIComponent(term)).message;
                            if(rtn==1){
                                this.view.activeName = name;
                                this.load();
                            }
                        },
                        onSave(){
                            
                            this.view.activeModel.time = _.now();
                            this.view.activeModel.filter.template = this.$refs.table.dt.selected;
                            
                            let term = JSON.stringify({
                                                        class: "event", 
                                                        action:"update", 
                                                        model: this.view.activeModel
                                        });

                            let rtn = fsHandler.callFsJScript("/matrix/view/action.js",encodeURIComponent(term)).message;
                            if(rtn==1){
                                this.load();
                            }
                        },
                        onDelete(item){
                            this.$confirm(`确认要删除该视图：${item.name}？`, '提示', {
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
                        },
                        onCloseView(){
                            this.$root.options.view.eidtEnable=false;
                            _.delay(()=>{
                                if(this.$root.layout.main.tabs.length === 1){
                                    $("#tab-event-view-console").hide();
                                }
                            },50)
                        }
                    }

                })
                
                let main = {
                    delimiters: ['#{', '}#'],
                    template:   `<main id="content" class="content">
                                    <el-container>
                                        <el-header style="height:40px;line-height:40px;padding: 0px;" v-show="control.view.mode != 'aigroup'">
                                            <search-base-component :options="options" ref="searchRef" class="grid-content"></search-base-component>
                                        </el-header>
                                        <el-main style="padding:0px;margin: 10px 0px;background: #fff;height: calc(100vh - 135px);overflow:hidden;" v-if="options.view.eidtEnable">
                                            <view-component :model="options.view" ref="viewRef"></view-component>
                                        </el-main>
                                        <el-main class="event-view-container" style="padding: 5px 0px 0px 0px;" v-else>
                                            <el-tabs v-model="layout.main.activeIndex" class="eventViewContainer animated fadeInLeft" type="border-card" closable @tab-remove="detailRemove" @tab-click="handleClick">
                                                <el-tab-pane v-for="(item,index) in layout.main.tabs" :key="item.name" :label="item.title" :name="item.name" lazy=true style="padding:0px;">
                                                    <el-container v-if="item.type==='main'">
                                                        <el-main style="padding:0px;">
                                                            <div class="event-view-summary-control">
                                                                <el-dropdown style="padding-right:10px;">
                                                                    <span class="el-dropdown-link">
                                                                        <i class="el-icon-menu el-icon--right"></i>
                                                                    </span>
                                                                    <el-dropdown-menu slot="dropdown">
                                                                        <el-dropdown-item>
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
                                                                        </el-dropdown-item>
                                                                        <el-dropdown-item>
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
                                                                        </el-dropdown-item>
                                                                    </el-dropdown-menu>
                                                                </el-dropdown>

                                                                <el-tooltip :content="control.ifRefresh==1?'自动刷新启用中':'自动刷新关闭中'" placement="top" open-delay="500">
                                                                    <el-dropdown>
                                                                        <span class="el-dropdown-link">
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
                                                                        </span>
                                                                        <el-dropdown-menu slot="dropdown">
                                                                            <el-dropdown-item>15s</el-dropdown-item>
                                                                            <el-dropdown-item>30s</el-dropdown-item>
                                                                            <el-dropdown-item>60s</el-dropdown-item>
                                                                        </el-dropdown-menu>
                                                                    </el-dropdown>
                                                                </el-tooltip>
                                                            </div>
                                                            <el-container id="event-view-console">
                                                                <el-aside class="tree-view" style="background-color:#f6f6f6;" ref="leftView">
                                                                    <entity-tree-component id="event-tree" :model="{parent:'/event',name:'event_tree_data.js',domain:'event'}" ref="tagTree"></entity-tree-component>
                                                                </el-aside>
                                                                <el-main class="table-view" style="padding:5px;" ref="mainView">
                                                                    <event-view-facet :model="model.message" v-show="control.ifSmart!=0" style="margin-top:30px;"></event-view-facet>
                                                                    <event-eventlist-component :model="model.message"></event-eventlist-component>
                                                                </el-main>
                                                            </el-container>
                                                        </el-main>
                                                    </el-container>
                                                    <el-container v-else-if="item.type==='diagnosis'">
                                                        <el-main style="padding:10px 20px;">
                                                            <el-tabs v-model="layout.main.detail.activeIndex" style="background:#ffffff;" class="event-diagnosis-tabs"> 
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
                                                        </el-main>
                                                    </el-container>
                                                    <el-container v-else-if="item.type==='aiGroup'">
                                                        <el-main style="padding:0px;">
                                                            <event-view-aigroup id="event-view-aigroup" :model="model.message"></event-view-aigroup>
                                                        </el-main>
                                                    </el-container>
                                                </tab>
                                            </el-tabs>
                                        </el-main>
                                    </el-container>
                                </main>`,
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
                            }
                        },
                        control: {
                            ifSmart: '0',
                            ifAiGroup: '0',
                            ifRefresh: '0',
                            viewType: "o",
                            view:{
                                mode: 'all' // all: all_event_console | console: only_event_console | aigroup: only_aigroup | term: get_term
                            }
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
                            // 视图定义
                            view: {
                                eidtEnable: false,
                                show: true,
                                value: "all"
                            },
                            // 搜索窗口
                            window: { name:"所有", value: ""},
                            // 输入
                            term: "",
                            autoSearch: true,
                            // 指定类
                            class: "#/matrix/devops/alert/:",
                            // 指定api
                            api: {parent: "event",name: "event_list.js"},
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
                        splitInst: null
                    },
                    watch:{
                        'control.ifRefresh':{
                            handler(val,oldVal){
                                if(val==1) {
                                    window.intervalListener = setInterval(()=>{
                                        this.$refs.searchRef.search();
                                    },mx.global.register.event.interval);
                                    this.$message({
                                        type: "info",
                                        message: "自动刷新开启"
                                    })
                                } else {
                                    clearInterval(window.intervalListener);
                                    this.$message({
                                        type: "info",
                                        message: "自动刷新关闭"
                                    })
                                }
                            },
                            deep:true
                        },
                        'layout.main.tabs':{
                            handler(val,oldVal){
                                if(val.length > 1){
                                    $("#tab-event-view-console").show();
                                }else {
                                    $("#tab-event-view-console").hide();
                                }
                            },
                            deep:true
                        },
                        'options.view.eidtEnable':{
                            handler(val,oldVal){
                                const self = this;
                                if(!val){
                                    self.$refs.searchRef.search();
                                }
                            }
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
                        
                        // 集成
                        try{
                            if(!_.isEmpty(window.location.search)){
                                // 接收参数
                                if(mx.urlParams['term']){
                                    let term = decodeURIComponent(window.atob(mx.urlParams['term']));
                                    this.options.term = term;
                                } 
                                // 集成AiGroup
                                else if(mx.urlParams['ids']){
                                    let term = mx.urlParams['ids'];
                                    this.options.term = term;
                                    this.control.ifAiGroup = '1';
                                    this.control.view.mode = 'aigroup';
                                    this.layout.main.tabs = [];
                                    _.delay(()=>{
                                        this.aiGroup();
                                    },1000)
                                } 
                            } else {
                                // 集成console模式
                                if(_.endsWith(window.location.pathname,'_link')){
                                    this.control.view.mode = 'console';
                                }
                            }
                            
                        } catch(err){

                        }

                        // 初始化默认视图
                        let defaultView = localStorage.getItem("EVENT-DEFAULT-VIEW");
                        if(defaultView){
                            this.options.view.value = defaultView;
                        }
                    },
                    mounted(){
                        
                        this.$nextTick().then(()=>{

                            $(this.$el).addClass('view-normal');
                            
                            // 没有详细页时，默认隐藏告警列表Title
                            this.hideTabEventViewConsoleUl();

                            // 维度统计
                            this.toggleSummaryBySmart(this.control.ifSmart);

                            // 窗口Resize
                            _.delay(()=>{
                                // RESIZE Event Summary
                                eventHub.$emit("WINDOW-RESIZE-EVENT");
                            },2000);

                            // 数据设置
                            this.setData();

                            // watch数据更新
                            this.$watch(
                                "$refs.searchRef.result",(val, oldVal) => {
                                    this.setData();
                                }
                            );
                        })
                        
                    },
                    methods: {
                        setData(){
                            _.extend(this.model, {message:this.$refs.searchRef.result});
                        },
                        hideTabEventViewConsoleUl(){
                            
                            if($('#tab-event-view-console').is(':visible')) {
                                $("#tab-event-view-console").hide();
                            $("#tab-event-view-console > span").hide();
                            } else {
                                setTimeout(this.hideTabEventViewConsoleUl, 50);
                            }   
                        },
                        // 切换运行模式
                        toggleModel(event){
                            $(this.$el).removeClass(window.EVENT_VIEW);
                            $(this.$el).addClass(event);
                            window.EVENT_VIEW = event;
                            
                            if(event == 'view-normal'){
                                this.splitInst.destroy();
                            } else {
                                this.splitInst = Split([this.$refs.leftView[0].$el, this.$refs.mainView[0].$el], {
                                    sizes: [20, 80],
                                    minSize: [0, 0],
                                    gutterSize: 5,
                                    gutterAlign: 'end',
                                    cursor: 'col-resize',
                                    direction: 'horizontal',
                                    expandToMin: true
                                });
                            }
                        },
                        toggleView(cmd){
                            if(cmd === 'm'){
                                // 监控模式 
                                // 自动刷新
                                // 全屏显示
                                mx.fullScreen(false);
                                $("#header").removeClass("navbar-fixed-top").hide();
                                $("#aside").hide();
                                $("#content.content").css({
                                    "width": "100vw",
                                    "position":"absolute",
                                    "z-index": 1000,
                                    "top": "0px",
                                    "left": "0px",
                                    "margin": "0px",
                                    "background": "#ffffff"
                                }).addClass("animate fadeInLeft");
                                $("#content.content .event-view-summary-contro").css({
                                    "right": "25%"
                                });
                                $("#content.content .event-eventlist-component").css({
                                    "height":"calc(100vh - 95px)"
                                });
                                this.control.ifRefresh = '1';
                                mx.fullScreen(true);
                            } else if(cmd === 'o'){
                                // 运维模式 
                                mx.fullScreen(false);
                                $("#header").addClass("navbar-fixed-top").show();
                                $("#aside").show();
                                $("#content.content").css({
                                    "width": "95.3vw",
                                    "position":"releative",
                                    "z-index": 10,
                                    "top": "unset",
                                    "left": "unset",
                                    "margin": "50px 0px 0px 60px",
                                    "padding": "5px 5px 0px 5px!important",
                                    "background": "transparent"
                                }).addClass("animate fadeInLeft");
                                $("#content.content .event-view-summary-contro").css({
                                    "right": "5px"
                                });
                                $("#content.content .event-eventlist-component").css({
                                    "height":"calc(100vh - 145px)"
                                });
                                this.control.ifRefresh = '0';
                                mx.fullScreen(true);
                            } else if(cmd === 'f'){
                                // 全屏模式
                                // 全屏显示
                                mx.fullScreen(true);
                            } else if(cmd === 'e'){
                                // 全屏模式
                                // 全屏显示
                                mx.fullScreen(false);
                            }

                            this.control.viewType = cmd;
                        },
                        toggleSummaryBySmart(evt){
                            
                            this.control.ifSmart = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                        },
                        toggleSummaryByGroup(evt){
                            if(evt==1) {
                                this.aiGroup();
                            } else {
                                //关闭智能分组
                                try {
                                    let id = _.find(this.layout.main.tabs,{type:'aiGroup'}).name;
                                    if(id){
                                        this.detailRemove(id);
                                    }
                                } catch(err){

                                }
                            }
                            this.control.ifAiGroup = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
                        },
                        toggleSummaryByRefresh(evt){
                            const self = this;

                            this.control.ifRefresh = evt;
                            
                            // RESIZE Event Summary
                            eventHub.$emit("WINDOW-RESIZE-EVENT");
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
                                                //{title:'概率相关性告警', name:`diagnosis-probability-${id}`, type: 'probability', model:model},
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
                                
                                if(this.layout.main.tabs.length < 2) return false;

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
            
            // RESIZE Event Summary
            eventHub.$emit("WINDOW-RESIZE-EVENT");
        })

        
    }

}