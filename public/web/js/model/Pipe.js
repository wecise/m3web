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
class Pipe {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["pipe-design",
                            "mx-tag",
                            "mx-tag-tree"
                            ],()=> {

            $(function() {

                Vue.component("pipe-list",{
                    delimiters: ['#{', '}#'],
                    props: {
                        
                    },
                    data() {
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
                            dfs: {
                                root: `/home/${window.SignedUser_UserName}/Documents/pipe`,
                                path: `/home/${window.SignedUser_UserName}/Documents/pipe`
                            },
                            showView: 'table',
                            control: {
                                tagTree: {
                                    show: false
                                }
                            }
                        }
                    },
                    computed: {
                        fullname(){
                            return _.concat([""],_.xor(this.dfs.root.split("/"), this.dfs.path.split("/")));
                        }
                    },
                    template:   `<el-container style="height: calc(100% - 85px);background:#ffffff;">
                                    <el-aside width="200px" style="background: #f2f2f2;" ref="leftView" v-show="control.tagTree.show">
                                        <mx-tag-tree :model="{parent:'/pipe',name:'pipe_tree_data.js',domain:'pipe'}" :fun="onRefreshByTag" ref="tagTree"></mx-tag-tree>
                                    </el-aside>
                                    <el-container ref="mainView">
                                    <el-header style="height:35px;line-height:35px;">
                                        <el-row>
                                            <el-col :span="12">
                                                <el-breadcrumb separator=">">
                                                    <el-breadcrumb-item>
                                                        <el-button type="text" @click="onForward(dfs.root)"><i class="el-icon-s-home"></i> 组</el-button>
                                                    </el-breadcrumb-item>
                                                    <el-breadcrumb-item  v-for="(item,index) in fullname" v-if="index > 0">
                                                        <el-button type="text" @click="onForward(fullname.slice(0,index+1).join('/'))">#{item}#</el-button>
                                                    </el-breadcrumb-item>
                                                </el-breadcrumb>
                                            </el-col>
                                            <el-col :span="12" style="text-align:right;">
                                                <el-tooltip content="切换视图" open-delay="500" placement="top">
                                                    <el-button type="text" icon="el-icon-s-fold" @click="onTogglePanel"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="格子视图" placement="top">
													<el-button type="text" @click="showView='grid'" icon="el-icon-picture">
													</el-button>
												</el-tooltip>
												<el-tooltip content="表格视图" placement="top">
													<el-button type="text" @click="showView='table'" icon="el-icon-menu">
													</el-button>
												</el-tooltip>
                                                <el-tooltip content="新建接入组" open-delay="500" placement="top">
                                                    <el-button type="text" icon="el-icon-folder-add" @click="onNewGroup" style="padding-left:5px;"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="新建接入" open-delay="500" placement="top">
                                                    <el-button type="text" icon="el-icon-plus" @click="onNewPipe" style="padding-left:5px;"></el-button>
                                                </el-tooltip>
                                                <el-tooltip content="刷新" open-delay="500" placement="top">
                                                    <el-button type="text" icon="el-icon-refresh" @click="onRefresh"></el-button>
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
                                            </el-col>
                                        </el-row>
                                    </el-header>   
                                        <el-main v-if="showView=='table'">
                                            <el-table
                                                :data="dt.rows.slice((dt.pagination.currentPage - 1) * dt.pagination.pageSize,dt.pagination.currentPage * dt.pagination.pageSize)"
                                                highlight-current-row="true"
                                                stripe
                                                style="width: 100%;"
                                                :row-class-name="rowClassName"
                                                :header-cell-style="headerRender"
                                                ref="table">
                                                <el-table-column type="selection" align="center" width="55"></el-table-column> 
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
                                                <el-table-column label="标签" prop="tags" width="200">
                                                    <template slot-scope="scope">
                                                        <mx-tag domain='pipe' :model.sync="scope.row.tags" :id="scope.row.id" limit="1"></mx-tag>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="操作" width="160">
                                                    <template slot-scope="scope">
                                                        <el-tooltip content="新建接入组" open-delay="500" placement="top">
                                                            <el-button type="text" @click="onNewGroup(scope.row, scope.$index)" icon="el-icon-folder-add"></el-button>
                                                        </el-tooltip>
                                                        <el-tooltip content="新建接入" open-delay="500" placement="top">
                                                            <el-button type="text" @click="onNewPipe(scope.row, scope.$index)" icon="el-icon-plus"></el-button>
                                                        </el-tooltip>
                                                        <el-tooltip content="编辑接入" open-delay="500" placement="top">
                                                            <el-button type="text" icon="el-icon-edit"  @click="onUpdatePipe(scope.row,scope.$index)"></el-button>
                                                        </el-tooltip>
                                                        <el-tooltip content="删除接入" open-delay="500" placement="top">
                                                            <el-button type="text" @click="onDeletePipe(scope.row, scope.$index)" icon="el-icon-delete"></el-button>
                                                        </el-tooltip>
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </el-main>
                                        <el-main v-else>
                                            <el-checkbox-group v-model="dt.selected" class="pipe-grid-node">
                                                <el-button type="default" 
                                                        style="max-width: 12em;width: 12em;height:110px;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
                                                        @dblclick.native="onForward(item.fullname)"
                                                        @click="onTriggerClick(item)"
                                                        :key="item.id"
                                                        v-for="item in dt.rows">
                                                        <i class="el-icon-folder" style="font-size:48px;margin:5px;color:#FF9800;" v-if="item.ftype=='dir'"></i>
                                                        <i class="el-icon-cpu" style="font-size:48px;margin:5px;color:#FF9800;" v-else></i>
                                                        <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:center;">
                                                            #{item.name}#
                                                        </p>
                                                        <el-checkbox :label="item" :ref="'checkBox_'+item.id"></el-checkbox>
                                                </el-button>
                                            </el-checkbox-group>
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
                                    </el-container>
                                </el-container>`,
                    created(){
                        this.initData();

                        // 默认边栏显示状态
                        this.control.tagTree.show = (localStorage.getItem("PIPE-TAG-TREE-IFSHOW") == 'true');
                    },
                    mounted(){
                        // 初始化分隔栏
                        this.initSplit();
                    },
                    methods: {
                        rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0) {
                                //return 'text-align:center;';
                            }
                        },
                        onPageSizeChange(val) {
                            this.dt.pagination.pageSize = val;
                        },
                        onCurrentPageChange(val) {
                            this.dt.pagination.currentPage = val;
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
                        onTogglePanel(){
							this.control.tagTree.show = !this.control.tagTree.show;

                            localStorage.setItem("PIPE-TAG-TREE-IFSHOW",this.control.tagTree.show);
						},
                        onRefreshByTag(){

                        },
                        onTriggerClick(item){
                            this.$refs['checkBox_'+item.id][0].$el.click();
                        },
                        initData(){
                            let rtn = fsHandler.callFsJScript("/matrix/pipe/getPipeList.js").message;

                            this.dt.rows = rtn.rows;
                            
                            _.extend(this.dt, {columns: _.map(rtn.columns, (v)=>{
                                                    
                                if(_.isUndefined(v.visible)){
                                    _.extend(v, { visible: true });
                                }

                                if(!v.render){
                                    return v;
                                } else {
                                    return _.extend(v, { render: eval(v.render) });
                                }
                                
                            })});
                        },
                        onForward(fullname){
                            this.dt.rows = fsHandler.callFsJScript("/matrix/pipe/getChildPipeList.js", encodeURIComponent(fullname) ).message;
                            
                            if(fullname){
                                this.dfs.path = fullname;//_.concat([""],_.xor(this.dfs.root.split("/"), fullname.split("/")));
                                this.fullname = _.concat([""],_.xor(this.dfs.root.split("/"), this.dfs.path.split("/")))
                            } else {
                                this.dfs.path = [this.dfs.root];
                            }
                        },
                        onRefresh(){
                            this.initData();
                        },
                        onExport(){
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
                        },
                        onNewGroup(row,index){

                            this.$prompt('请输入接入组名称', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消'
                              }).then(({ value }) => {

                                if(_.isEmpty(value)){
                                    this.$message({
                                        type: 'info',
                                        message: '请输入接入组名称！'
                                    });
                                    return false;
                                }

                                let rtn = fsHandler.fsNew('dir', _.isEmpty(row)?this.dfs.root:row.fullname, value, null, {remark: ''});
                                if(rtn == 1){
                                    this.$message({
                                        type: 'success',
                                        message: '新建接入组成功: ' + value
                                    });
                                    this.initData();
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: '新建接入组失败 ' + rtn.message
                                    });
                                    return false;
                                }
                              }).catch(() => {
                                
                              });
                        },
                        onNewPipe(row,index){
                            this.$prompt('请输入接入名称', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消'
                              }).then(({ value }) => {
                                if(_.isEmpty(value)){
                                    this.$message({
                                        type: 'info',
                                        message: '请输入接入名称！'
                                    });
                                    return false;
                                }

                                let rtn = fsHandler.fsNew('json', _.isEmpty(row)?this.dfs.root:row.fullname, value, null, {remark: ''});
                                if(rtn == 1){
                                    this.$message({
                                        type: 'success',
                                        message: '新建接入成功: ' + value
                                    });
                                    this.initData();
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: '新建接入失败: ' + rtn.message
                                    });
                                    return false;
                                }
                              }).catch(() => {
                                
                              });
                        },
                        onUpdatePipe(row,index){
                            
                        },
                        onDeletePipe(row,index){
                            
                        }
                    }
                })

            })

        })

    }

    mount(el){
        
        let main = {
            delimiters: ['#{', '}#'],
            template:   `<pipe-list ref="pipeRef"></pipe-list>`
        };

        // mount
        _.delay(() => {
            this.app = new Vue(main).$mount(el);
        },500)
    }
    
}