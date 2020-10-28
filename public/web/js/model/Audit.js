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
class Audit {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["mx-tag",
                        "mx-tag-tree",
                        "search-preset-component",
                        "search-base-component"
                        ],function() {

            $(function() {
                Vue.component("audit-list",{
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
                                this.info.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
                            },
                            deep:true,
                            immediate:true
                        }
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height: 30px;line-height: 30px;padding: 10px 0px;">
                                        <el-tooltip content="切换视图" open-delay="500" placement="top">
                                            <el-button type="text" icon="el-icon-s-fold" @click="onTogglePanel"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="刷新" open-delay="500" placement="top">
                                            <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除" open-delay="500" placement="top" v-if="!_.isEmpty(dt.selected)">
                                            <el-button type="text" icon="el-icon-delete" @click="onDelete"></el-button>
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
                                    <el-main style="margin:20px 0px;padding:0px;">
                                        <el-table
                                            :data="dt.rows.slice((dt.pagination.currentPage - 1) * dt.pagination.pageSize,dt.pagination.currentPage * dt.pagination.pageSize)"
                                            highlight-current-row="true"
                                            stripe
                                            tooltip-effect="dark"
                                            style="width:100%"
                                            :row-class-name="rowClassName"
                                            :header-cell-style="headerRender"
                                            @selection-change="onSelectionChange"
                                            ref="table">
                                            <el-table-column type="selection" align="center"></el-table-column> 
                                            <el-table-column :prop="item.field" 
                                                :label="item.title" 
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
                                                    <div v-if="pickFtype(item['field']) == 'timestamp'">#{moment(scope.row[item['field']]).format(mx.global.register.format)}#</div>
                                                    <div v-else-if="pickFtype(item['field']) == 'date'">#{moment(scope.row[item['field']]).format('YYYY-MM-DD')}#</div>
                                                    <el-popover
                                                        placement="top-start"
                                                        width="550"
                                                        trigger="click"
                                                        popper-class="info-popper"
                                                        :popper-options="{ boundariesElement: 'body' }"
                                                        v-else-if="_.includes(['operation'],item['field']) && !_.isEmpty(scope.row[item['field']])">
                                                        <el-container>
                                                            <el-header style="height:30px;line-height:30px;padding:0px;">
                                                                <el-button type="text" icon="el-icon-copy-document" class="el-button-copy" @click="onCopy(item['field'],scope.$index)"></el-button>
                                                            </el-header>
                                                            <el-main style="padding:0px;">
                                                                <textarea rows="10" style="width:98%;white-space:nowrap;" :id="'textarea_'+scope.$index">#{scope.row[item['field']]}#</textarea>
                                                            </el-main>
                                                        </el-container>
                                                        <el-button type="text" slot="reference">
                                                            #{  _.truncate(scope.row[item['field']], {
                                                            'length': 100,
                                                            'omission': ' ...'
                                                        }) }# <span class="el-icon-date"></span> #{ _.size(scope.row[item['field']]) }#</el-button>
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
                                            <el-table-column label="标签" prop="tags" width="120">
                                                <template slot-scope="scope">
                                                    <mx-tag domain='event' :model.sync="scope.row.tags" :id="scope.row.id" limit="1"></mx-tag>
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="操作" width="60">
												<template slot-scope="scope">
													<el-tooltip content="删除" open-delay="500" placement="top">
                                                        <el-button type="text" @click="onDelete(scope.row,scope.$index)" icon="el-icon-delete"></el-button>
                                                    </el-tooltip>
												</template>
											</el-table-column>
                                        </el-table>
                                    </el-main>
                                    <el-footer  style="height:30px;line-height:30px;">
                                        <!--#{ info.join(' &nbsp; | &nbsp;') }#-->
                                        <el-pagination
                                            @size-change="onPageSizeChange"
                                            @current-change="onCurrentPageChange"
                                            :page-sizes="[10, 15, 20]"
                                            :page-size="dt.pagination.pageSize"
                                            :total="dt.rows.length"
                                            layout="total, sizes, prev, pager, next">
                                        </el-pagination>
                                    </el-footer>
                                    </el-main>
                                </el-container>`,
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
                        onPageSizeChange(val) {
                            this.dt.pagination.pageSize = val;
                        },
                        onCurrentPageChange(val) {
                            this.dt.pagination.currentPage = val;
                        },
                        layout(){
                            let doLayout = ()=>{
                                if($(".el-table__body-wrapper",this.$el).is(':visible')){
                                    this.$refs.table.setCurrentRow(this.dt.rows[0]);
                                    //this.$refs.table.doLayout();
                                } else {
                                    setTimeout(doLayout,50);
                                }
                            }
                            doLayout();
                        },
                        initData(){
                            
                            let init = ()=>{
                                
                                _.extend(this.dt, {columns: _.map(this.model.columns, function(v){
                                    
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
                        onSelectionChange(val) {
                            this.dt.selected = val;
                        },
                        onTogglePanel(){    
                            $(this.$root.$refs.leftView.$el).toggle();
                        },
                        onRefresh(){
                            this.$root.options.term = "";
                            this.$root.$refs.searchRef.search();
                        },
                        onDelete(row,index){
                           
							const h = this.$createElement;
							this.$msgbox({
                                    title: `确认要删除该日志`, 
                                    message: h('span', null, [
										h('p', null, `日志ID：${row.id}`)
									]),
									showCancelButton: true,
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									type: 'warning'
							}).then(() => {

								fsHandler.callFsJScriptAsync("/matrix/audit/deleteLog.js", encodeURIComponent(JSON.stringify(row))).then( (rtn)=>{
                                    this.onRefresh();
                                } );

							}).catch(() => {
                                
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
            })

        })

    }

    mount(el){
        let main = {
            delimiters: ['#{', '}#'],
            data:{
                model: {},
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
                    class: "#/matrix/system/operationlog",
                    // 指定api
                    api: {parent: "audit",name: "audit_list.js"},
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
            template:   `<el-container style="height:calc(100vh - 85px);background:#ffffff;">
                            <el-aside style="width:240px;overflow:hidden;background:#f2f2f2;" ref="leftView">
                                <mx-tag-tree :model="{parent:'/audit',name:'audit_tree_data.js',domain:'audit'}" :fun="onRefreshByTag" ref="tagTree"></mx-tag-tree>
                            </el-aside>
                            <el-container style="padding:20px; height:100%;" ref="mainView">
                                <el-header style="height:40px;line-height:40px;background: #dddddd;display: inline-table;padding:0px;">
                                    <search-base-component :options="options" ref="searchRef" class="grid-content"></search-base-component>
                                </el-header>
                                <el-main style="overflow:hidden;padding:0px;">
                                    <audit-list :model="model"></audit-list>
                                </el-main>
                            </el-container>
                        </el-container>`,
            
            mounted() {
            
                // 数据设置
                this.setData();

                // watch数据更新
                this.$watch(
                    "$refs.searchRef.result",(val, oldVal) => {
                        this.setData();
                    }
                );

                // 初始化分隔栏
                this.initSplit();

                // 默认收起Tag树
                $(this.$refs.leftView.$el).toggle();
                
            },
            methods: {
                setData(){
                    this.$set(this, 'model', this.$refs.searchRef.result);
                },
                initSplit(){
                    this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                        sizes: [20, 80],
                        minSize: [0, 0],
                        gutterSize: 5,
                        cursor: 'col-resize',
                        direction: 'horizontal'
                    });
                },
                onRefreshByTag(tag){
                    this.options.term = `tags=${tag}`;
                    this.$refs.searchRef.search();
                }
            }
        };
        
        _.delay(()=>{
            this.app = new Vue(main).$mount(el);
        },1000)
    }

}