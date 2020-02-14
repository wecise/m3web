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
                            "form-component",
                            "search-preset-component",
                            "search-base-component"],function() {
            $(function() {

                // ConsoleList Table组件
                Vue.component("el-consolelist-component",{
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
                                        <el-tooltip :content="item.content" open-delay="500" placement="top" v-for="item in model.actions" v-if="model.actions">
                                            <el-button type="text" @click="onAction(item)" :icon="item.icon"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="导出模板" placement="top" open-delay="500">
                                            <el-button type="text" icon="el-icon-s-unfold" @click="$root.exportIt">
                                            </el-button>
                                        </el-tooltip>
                                        <el-tooltip content="导入实体" placement="top" open-delay="500">
                                            <el-button type="text" class="fileinput-button" icon="el-icon-s-fold" @click="$root.entityDataImport">
                                            </el-button>
                                        </el-tooltip>
                                        <el-tooltip content="新增实体" placement="top" open-delay="500">
                                            <el-button type="text" icon="el-icon-plus" @click="$root.entityNew"></el-button>
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
                                    message: "请选择实体！"
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

                            $.contextMenu("destroy").contextMenu({
                                selector: `.${column.id}`,
                                trigger: "right",
                                autoHide: true,
                                delay: 5,
                                hideOnSecondTrigger: true,
                                className: `animated slideIn ${column.id}`,
                                build: ($trigger, e)=> {
                                    
                                    return {
                                        callback: (key, opt)=> {
                                            
                                            if(_.includes(key,'diagnosis')) {
                                                this.$root.detailAdd(row);
                                            } else if(_.includes(key,'update')) {
                                                this.$root.entityEdit(row);
                                            }
                                        },
                                        items: this.model.contextMenu.entity
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

                // 实体录入
                Vue.component("entity-new",{
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
                                    this.topological.graphScript = [ {value: `match (${bizs}) - [*1] -> (${bizs})`} ];
                                    this.topological.search(this.topological.graphScript[0].value);
                                }

                            } catch(err){
                                
                            } finally {
                                _.delay(() => {
                                    this.topological.setStyle();
                                },500)
                            }
                            
                        }
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
                    template: `<el-container style="height: calc(100vh - 190px);padding:10px;">
                                    <el-header style="text-align: right;line-height: 40px;height:40px;">
                                        <el-tooltip content="保存">
                                            <el-button type="primary" icon="el-icon-edit"></el-button>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main>
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
                            let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));

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
                                let rtn = fsHandler.callFsJScript("/matrix/tags/tag_service.js", encodeURIComponent(JSON.stringify(input)));
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
                    template: `<el-container style="height: calc(100vh - 190px);padding:10px;">
                                    <el-header style="text-align: right;line-height: 40px;height:40px;">
                                        <el-tooltip content="保存">
                                            <el-button type="primary" icon="el-icon-edit"></el-button>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main>
                                        <el-row :gutter="10">
                                            <el-col :span="24">
                                                <el-form label-width="120px">
                                                    <!-- 有模板 -->
                                                    <el-form-item :label="item.title" v-for="item in _.filter(model.template,{region:'manager'})" style="margin-bottom: 10px;" v-if="model.template">
                                                        <el-input :placeholder="item.data" :value="model.rows[item.data] | handlerFormat"></el-input>
                                                    </el-form-item>
                                                    <!-- 没有模板 -->
                                                    <el-form-item :label="key" v-for="(value,key) in model.rows" style="margin-bottom: 10px;" v-else>
                                                        <el-input :placeholder="key" :value="value | handlerFormat"></el-input>
                                                    </el-form-item>
                                                </el-form>
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
                        model:Object
                    },
                    data(){
                        return {
                            config: {},
                            files: {},
                            element: {}
                        }
                    },
                    template: `<el-container style="height: calc(100vh - 190px);padding:10px;">
                                    <el-header style="text-align: right;line-height: 40px;height:40px;">
                                        <el-tooltip content="保存">
                                            <el-button type="primary" icon="el-icon-edit"></el-button>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main>
                                        <el-row :gutter="10">
                                            <el-col :span="24">
                                                <el-form label-width="120px">
                                                    <!-- 有模板 -->
                                                    <el-form-item :label="item.title" v-for="item in _.filter(model.template,{region:'config'})" style="margin-bottom: 10px;" v-if="model.template">
                                                        <el-input type="textarea" :rows="6" :placeholder="item.data">#{model.rows[item.data]}#</el-input>
                                                    </el-form-item>
                                                    <!-- 没有模板 -->
                                                    <el-form-item :label="key" v-for="(value,key) in model.rows" style="margin-bottom: 10px;" v-else>
                                                        <el-input type="textares" :rows="6" :placeholder="value">#{value}#</el-input>
                                                    </el-form-item>
                                                </el-form>
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
                    created(){

                    },
                    mounted(){
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
                    template:   `<el-container style="height: calc(100vh - 190px);"><el-main>
                                    <el-timeline>
                                        <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model.history.rows">
                                            <el-card style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                                                <h4>#{item.id}#</h4>
                                                <p style="font-size:12px;">#{item.config}#</p>
                                                <p style="font-size:12px;">#{item.files}#</p>
                                                <p style="font-size:12px;">#{item.elements}#</p>
                                                <el-button type="primary" @click="compareWithLast(item,$event)">与最新配置比对 <i class="fas fa-angle-right"></i></el-button>
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
                                    let tmp = omdbHandler.fetchData("id="+v.id + " | vtime="+moment(v.vtime).format('yyyy-MM-dd HH:mm:ss.SSS'));
                                    
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
                    template:  `<el-container style="height: calc(100vh - 190px);">
                                    <el-main style="padding:0px;">
                                        <div :id="'topological-app-'+rId"></div>
                                    </el-main>
                                </el-container>`,
                    computed:{
                        rId(){
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
                    delimiters: ['#{', '}#'],
                    template:   `<el-container>
                                    <el-header style="height: 40px;line-height: 40px;padding: 0px;">
                                        <search-base-component :options="options"
                                                                ref="searchRef"
                                                                class="grid-content"></search-base-component>
                                    </el-header>			
                                    <el-main id="entity-view-container" style="padding: 5px 0px 0px 0px;">
                                        <el-tabs v-model="layout.main.activeIndex" type="border-card" closable @tab-remove="detailRemove">
                                            <el-tab-pane v-for="(item,index) in layout.main.tabs" :key="item.name" :label="item.title" :name="item.name" style="padding:0px;">
                                                <div v-if="item.type==='main'">
                                                    <div class="entity-view-summary-control">
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
                                                        <el-tooltip :content="control.ifGraph==1?'实体图谱启用中':'实体图谱关闭中'" placement="top" open-delay="500">
                                                                <div>
                                                                    #{control.ifGraph==1?'实体图谱':'实体图谱'}#
                                                                    <el-switch
                                                                    v-model="control.ifGraph"
                                                                    active-color="#13ce66"
                                                                    inactive-color="#dddddd"
                                                                    active-value="1"
                                                                    inactive-value="0"
                                                                    @change="toggleSummaryByGraph">
                                                                    </el-switch>
                                                                </div>
                                                            </el-tooltip>
                                                    </div>
                                                    
                                                    <el-container id="entity-view-summary">
                                                        <el-main>
                                                            <el-tabs v-model="layout.summary.activeIndex" type="border">
                                                                <el-tab-pane v-for="(item,index) in layout.summary.tabs" :key="item.name" :label="item.title" :name="item.name">
                                                                    <div v-if="item.type=='radar'">
                                                                        <entity-view-radar id="event-radar" :model='model.message'></entity-view-radar>
                                                                    </div>
                                                                    <div v-if="item.type=='pie'">
                                                                        <entity-view-pie id="event-pie" :model='model.message'></entity-view-pie>
                                                                    </div>
                                                                </el-tab-pane>
                                                            </el-tabs>
                                                        </el-main>
                                                    </el-container>
                                                    
                                                    <el-container id="entity-view-console">
                                                        <el-aside class="tree-view" style="background-color:#f6f6f6;" ref="leftView">
                                                            <entity-tree-component id="entity-tree" :model="{parent:'/entity',name:'tree_data.js',domain:'entity'}"></entity-tree-component>
                                                        </el-aside>
                                                        <el-main class="table-view" style="padding:5px;" ref="mainView">
                                                            <el-consolelist-component :model="model.message"></el-consolelist-component>		
                                                        </el-main>
                                                    </el-container>
                                                    
                                                </div>
                                                <div v-else-if="item.type==='entityEdit'">
                                                    <form-component :term="item.row.id" cHeight="160"></form-component>
                                                </div>
                                                <div v-else-if="item.type==='diagnosis'">
                                                    <el-tabs v-model="layout.main.detail.activeIndex" style="background:#ffffff;" class="el-tabs-bottom-line" @tab-click="toggleTab">
                                                        <el-tab-pane v-for="it in item.child" :key="it.name" :label="it.title" :name="it.name">
                                                        
                                                            <div v-if="it.type==='base'">
                                                                <entity-diagnosis-base :id="it.name+ '-base'" :model="it.model.detail"></entity-diagnosis-base>
                                                            </div>
                                                            <div v-else-if="it.type==='manager'">
                                                                <entity-diagnosis-manager :id="it.name+ '-manager'" :model="it.model.detail"></entity-diagnosis-manager>
                                                            </div>
                                                            <div v-else-if="it.type==='config'">
                                                                
                                                                <entity-diagnosis-config :model="it.model.detail"></entity-diagnosis-config>
                                                            </div>
                                                            <div v-else-if="it.type==='compare'">
                                                                <entity-diagnosis-compare :id="it.name+ '-compare'" :model="it.model"></entity-diagnosis-compare>
                                                            </div>
                                                            <div v-else-if="it.type==='topological'">
                                                                <entity-diagnosis-topological :id="it.name + '-topological'" :model="it.model.detail"></entity-diagnosis-topological>
                                                            </div>
                                                        </el-tab-pane>
                                                    </el-tabs>
                                                </div>
                                                <div v-else-if="item.type==='graph'" style="padding-top: 1px;margin: 0px -1px;">
                                                    <entity-view-graph id="entity-view-graph" :model="model.message"></entity-view-graph>
                                                </div>
                                            </tab>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
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
                            // 视图定义
                            view: {
                                show: false
                            },
                            // 搜索窗口
                            window: { name:"所有", value: ""},
                            // 输入
                            term: "top 20",
                            // 指定类
                            class: "#/matrix/entity/:",
                            // 指定api
                            api: {parent: "entity",name: "entity_list.js"},
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

                        // 初始化term
                        try{
                            let term = decodeURIComponent(window.atob(mx.urlParams['term']));
                            this.options.term = term;
                        } catch(err){

                        }

                        // 接收窗体RESIZE事件
                        eventHub.$on("WINDOW-RESIZE-EVENT",this.resizeEventConsole);
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
                        entityEdit(row){
                            try {
                                let id = row.id;
                                if(this.layout.main.activeIndex === `entityEdit-${id}`) return false;
                                
                                // event
                                let term = encodeURIComponent(JSON.stringify(row));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript("/matrix/entity/diagnosis-by-id.js",term).message;
                                
                                // 添加tab
                                let tab = {title:`实体编辑 ${row.id}`, name:`entityEdit-${id}`, type: 'entityEdit', child:[], row:row};
                                
                                this.layout.main.tabs.push(tab);
                                this.layout.main.activeIndex = `entityEdit-${id}`;
                                
                            } catch(error){
                                this.layout.main.tabs = [];
                            }
                        },
                        detailAdd(row){
                            try {
                                let id = row.id;
                                if(this.layout.main.activeIndex === `diagnosis-${id}`) return false;
                                
                                // event
                                let term = encodeURIComponent(JSON.stringify(row));
                                // 根据event获取关联信息
                                let model = fsHandler.callFsJScript("/matrix/entity/diagnosis-by-id.js",term).message;
                                
                                // 添加tab
                                let detail = {title:`实体卡片 ${row.id}`, name:`diagnosis-${id}`, type: 'diagnosis', child:[
                                                {title:'基本信息', name:`diagnosis-base-${id}`, type: 'base', model:model},
                                                {title:'管理信息', name:`diagnosis-manager-${id}`, type: 'manager', model:model},
                                                {title:'配置信息', name:`diagnosis-config-${id}`, type: 'config', model:model},
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
                            
                            $.contextMenu("destroy").contextMenu({
                                selector: `#${tId} tr td:not(:nth-child(1))`,
                                trigger: 'right',
                                autoHide: true,
                                delay: 5,
                                hideOnSecondTrigger: true,
                                className: `animated slideIn ${tId} context-menu-list`,
                                build: function($trigger, e) {
                    
                                    return {
                                        callback: (key, opt)=> {
                                            
                                            if(_.includes(key,'diagnosis')) {
                                                this.detailAdd(inst.mouseOverSelectedRows);
                                            } else if(_.includes(key,'action')) {
                                                // 增加操作类型
                                                let action = _.last(key.split("_"));
                                                if(action == 'update'){
                                                    this.entityEdit(inst.mouseOverSelectedRows);
                                                } else if(action == 'delete'){
                                                    this.entityDelete({list: [inst.mouseOverSelectedRows], action:action});
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
                                    
                                    let rtn = fsHandler.callFsJScript("/matrix/entity/action.js",encodeURIComponent(JSON.stringify(item))).status;
                                    
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
                        },
                        exportIt(){
                            const me = this;
                            let wnd = null;

                            try{
                                if(jsPanel.activePanels.getPanel('jsPanel-entity-template')){
                                    jsPanel.activePanels.getPanel('jsPanel-entity-template').close();
                                }
                            } catch(error){

                            }
                            finally{
                                wnd = maxWindow.winEntityTemplate('导出实体模板', `<div id="entity-template-export"></div>`, null, null, null);
                            }

                            new Vue({
                                data:{
                                    classList: fsHandler.callFsJScript("/matrix/entity/entity_class.js",encodeURIComponent("/matrix/entity")).message,
                                    defaultProps: {
                                        children: 'children',
                                        label: 'alias'
                                    },
                                    model: {
                                        ifData: false, 
                                        limit: 0,
                                        recursive: true,
                                        filetype: 'xlsx',
                                        template: true,
                                        class: '/matrix/entity',
                                        ignoreClass: ''
                                    }
                                },
                                template: `<el-container style="height:100%;">
                                                <el-header style="height:35px;line-height:35px;padding: 0px 5px;background: #f6f6f6;">
                                                    <el-switch v-model="model.ifData" active-text="导出样例数据" active-color="#13ce66"></el-switch>
                                                </el-header>
                                                <el-main style="padding:10px;">
                                                    <el-tree
                                                        ref="entityTree"
                                                        :data="classList"
                                                        show-checkbox
                                                        node-key="id"
                                                        :default-expanded-keys="[_.first(classList).id]"
                                                        :default-checked-keys="[]"
                                                        :props="defaultProps"
                                                        style="background-color:transparent;">
                                                    </el-tree>
                                                </el-main>
                                                <el-footer style="height:40px;line-height:40px;text-align:right;">
                                                    <el-button type="default" @click="onCancel">取消</el-button>
                                                    <el-button type="primary" @click="onExport">导出</el-button>
                                                </el-footer>
                                            </el-container>`,
                                methods:{
                                    onCancel(){
                                        wnd.close();
                                    },
                                    onExport(){
                                        let allNodes = fsHandler.callFsJScript("/matrix/omdb/getClassList.js",this.model.class).message;
                                        let checkedClass = _.map(this.$refs.entityTree.getCheckedNodes(),'class');
                                        
                                        _.extend(this.model, {ignoreClass: _.xor(allNodes,checkedClass) } );
                                        
                                        if(this.model.ifData){
                                            this.model.limit = 5;
                                            this.model.template = false;
                                        } else {
                                            this.model.template = true;
                                            this.model.limit = 0;
                                        }
                                        omdbHandler.classDataExport(this.model);
                                    }
                                }
                            }).$mount("#entity-template-export");
                            
                        },
                        entityNew(){
                            const me = this;
                            let wnd = null;

                            try{
                                if(jsPanel.activePanels.getPanel('jsPanel-entityNew')){
                                    jsPanel.activePanels.getPanel('jsPanel-entityNew').close();
                                }
                            } catch(error){

                            }
                            finally{
                                wnd = maxWindow.winEntityNew('新增实体', `<div id="entity-template-new"></div>`, null, null, null);
                            }

                            new Vue({
                                data:{
                                    classList: fsHandler.callFsJScript("/matrix/entity/entity_class.js",encodeURIComponent("/matrix/entity")).message,
                                    defaultProps: {
                                        children: 'children',
                                        label: 'alias'
                                    },
                                    model: {
                                        selectedNode: {},
                                        node: {}
                                    }
                                },
                                template: `<el-container style="height:100%;">
                                                <el-aside style="background: #f6f6f6;width:200px;" ref="leftView">
                                                    <el-container>
                                                        <el-header style="height:30px;line-height:30px;padding: 0px 10px;">
                                                            选择类
                                                        </el-header>
                                                        <el-main style="padding:0px;">
                                                            <el-tree
                                                                ref="entityTree"
                                                                :data="classList"
                                                                node-key="id"
                                                                accordion
                                                                @node-click="onNodeClick"
                                                                :props="defaultProps"
                                                                style="background-color:transparent;">
                                                            </el-tree>
                                                        </el-main>
                                                    </el-container>
                                                </el-aside>
                                                <el-container ref="container">
                                                    <el-main style="padding:10px;">
                                                        <el-form ref="form" :model="model.node" label-width="100px">
                                                            <el-form-item :label="item.dispname" v-for="item in model.node" style="margin:5px 0px;">
                                                                <el-date-picker type="datetime" v-model="item.value" v-if="item.type==='date'"></el-date-picker>
                                                                <el-input type="number" v-model="item.value" v-if="item.type==='smallint'" ></el-input>
                                                                <el-input type="string" v-model="item.value" v-if="item.type==='varchar'"></el-input>
                                                                <el-input type="textarea" v-model="item.value" v-if="item.type==='map'" show-word-limit></el-input>
                                                                <el-input type="textarea" v-model="item.value" v-if="item.type==='list'" show-word-limit></el-input>
                                                                <el-input type="textarea" v-model="item.value" v-if="item.type==='set'" show-word-limit></el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-main>
                                                    <el-footer style="height:40px;line-height:40px;text-align:right;">
                                                        <el-button type="default" @click="onCancel">取消</el-button>
                                                        <el-button type="primary" @click="onSave">提交</el-button>
                                                    </el-footer>
                                                </el-container>
                                            </el-container>`,
                                filters:{
                                    format(item){
                                        return JSON.stringify(item.value,null,2);
                                    }
                                },
                                mounted(){
                                    _.delay(()=>{
                                        Split([this.$refs.leftView.$el, this.$refs.container.$el], {
                                            sizes: [20, 80],
                                            minSize: [0, 0],
                                            gutterSize: 5,
                                            gutterStyle: function(dimension, gutterSize) {
                                                return {
                                                    'display': 'none'
                                                }
                                            },
                                            cursor: 'col-resize',
                                            direction: 'horizontal',
                                        });
                                    },1000)
                                },
                                methods:{
                                    onNodeClick(node){
                                        this.model.selectedNode = node;
                                        this.model.node = fsHandler.callFsJScript("/matrix/entity/entity_class_by_cid.js",encodeURIComponent(node.id)).message;
                                    },
                                    onCancel(){
                                        wnd.close();
                                    },
                                    onSave(){
                                        let mql =   _.concat(["INSERT INTO", this.model.selectedNode.class],_.map(this.model.node,function(v){
                                                            if(v.type == 'int'){
                                                                return `${v.name}='${v.value}'`;
                                                            } else if(v.type == 'map' || v.type == 'list' || v.type == 'set'){
                                                                return `${v.name}='${v.value}'`;
                                                            } else {
                                                                return `${v.name}='${v.value}'`;
                                                            }
                                                    }).join(", ")).join(" ");
                                        console.log(mql)
                                    }
                                }
                            }).$mount("#entity-template-new");
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