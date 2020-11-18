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
class Omdb{

    constructor() {
        this.app = null;
    }

    path(id, bid, node){
        let _dataset = [];
        let _columns = [];
        let _node = {};

        if(!_.isEmpty(node)) {
            _dataset = node.data[_.keys(node.columns)[0]];
            _columns = node.columns[_.keys(node.columns)[0]];
            _node = node;
        }

        return {
            delimiters: ['${', '}'],
            el: '#' + id,
            template:   `<el-table
                            :data="dt.rows"
                            highlight-current-row="true"
                            style="width:100%"
                            :row-class-name="rowClassName"
                            :header-cell-style="headerRender"
                            @selection-change="onSelectionChange"
                            ref="table">
                            <el-table-column type="selection" width="55">
                            </el-table-column>
                            <el-table-column :prop="item.field" 
                                :label="item.title" 
                                sortable 
                                show-overflow-tooltip
                                v-for="item in dt.columns">
                            </el-table-column>
                        </el-table>`,
            data: {
                id: id,
                bid: bid,
                dt: {
                    rows: _dataset,
                    columns: _columns,
                    selected: []
                },
                result: _node
            },
            created(){
                eventHub.$on(`QUERY-RESULT-TRIGGER-EVENT-${bid}`,this.setData);
                eventHub.$on(`NEW-QUERY-RESULT-TRIGGER-EVENT-${bid}`,this.setData);
            },
            mounted() {
                this.$nextTick(()=> {
                    this.init();
                })
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
                onSelectionChange(val){
                    eventHub.$emit(`PATH-TOGGLE-EVENT-${this.id}`,val);
                },
                init(){
                    if(!_.isEmpty(node)) {
                        this.dt.rows = this.result.data[_.keys(this.result.columns)[0]];
                        this.dt.columns = this.result.columns[_.keys(this.result.columns)[0]];
                    } else {
                        this.dt.rows = [];
                        this.dt.columns = [];
                    }

                },
                setData(event){
                    this.dt.rows = event.data[_.keys(event.columns)[0]] || [];
                    this.dt.columns = event.columns[_.keys(event.columns)[0]] || [];
                    this.result = event;

                }
            }
        }
    }

    init() {
        const odb = this;

        // Class Tree组件
        Vue.component("omdb-tree",{
            delimiters: ['#{', '}#'],
            props: {
                control: Object
            },
            data(){
                return {
                    defaultProps: {
                        children: 'children',
                        label: 'name'
                    },
                    treeData: [],
                    defaultExpandedKeys: [-1],
                    filterText: ""
                }
            },
            template:   `<el-container style="height:100%;">
                            <!--el-header style="height:40px;line-height:40px;padding:0px 10px;">
                                <el-input v-model="filterText" 
                                    placeholder="搜索" size="mini"
                                    clearable></el-input>
                            </el-header-->
                            <el-main style="padding:0px 5px; height: 100%;">
                                <el-tree :data="treeData" 
                                        :props="defaultProps" 
                                        node-key="cid"
                                        highlight-current
                                        auto-expand-parent
                                        @node-click="onNodeClick"
                                        :expand-on-click-node="true"
                                        :default-expanded-keys="defaultExpandedKeys"
                                        style="background:transparent;"
                                        ref="tree">
                                    <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                                        <!--Class-->
                                        <span v-if="data.type=='class'">
                                            <!--root-->
                                            <span v-if="data.name=='/'">
                                                <i class="el-icon-folder" style="color:#FFC107;"></i>
                                                <span v-if="data.autosearch">
                                                    #{ $t('omdb.classTree.class') }# (#{ data.child.length || data.children.length }#) <span v-if="control.autosearch.show">(A)</span>
                                                </span>
                                                <span v-else>#{ $t('omdb.classTree.class') }# (#{ data.child.length || data.children.length }#)</span>
                                            </span>
                                            <!--dir-->
                                            <span v-else-if="data.child">
                                                <i class="el-icon-folder" style="color:#FFC107;"></i>
                                                <span v-if="data.autosearch">
                                                    #{ data,control | pickNodeLabel }# (#{ data.child.length || data.children.length }#) <span v-if="control.autosearch.show">(A)</span>
                                                </span>
                                                <span v-else>#{ data,control | pickNodeLabel }# (#{ data.child.length || data.children.length }#)</span>
                                            </span>
                                            <!--node-->
                                            <span v-else>
                                                <i class="el-icon-date" style="color:#0088cc;"></i>
                                                <span v-if="data.autosearch">
                                                    #{ data,control | pickNodeLabel }# <span v-if="control.autosearch.show">(A)</span>
                                                </span>
                                                <span v-else>#{ data,control | pickNodeLabel }#</span>
                                            </span>

                                            <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;">
                                                <span class="el-dropdown-link">
                                                    <i class="el-icon-more el-icon--right"></i>
                                                </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item @click.native="onClassNew(data)">新建子类</el-dropdown-item>
                                                    
                                                    <el-dropdown-item @click.native="onClassFieldNew(data)" divided>新建属性</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassFieldDelete(data)">删除属性</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassIndexNew(data)" divided>新建索引</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassIndexDelete(data,'delete')">删除索引</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassSetup(data,'delete')" divided>属性设置</el-dropdown-item>
                                                    
                                                    <el-dropdown-item @click.native="onClassDelete(data)" divided>删除类</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassDeleteData(data, 'delete-data')">删除数据</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassDeleteData(data, 'delete-data-withversion')">删除数据（带版本）</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassDeleteData(data, 'delete-column-data')">删除列数据</el-dropdown-item>

                                                    <el-dropdown-item @click.native="onClassMql(data,'select')" divided>SELECT</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassMql(data,'insert')">INSERT</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassMql(data,'update')">UPDATE</el-dropdown-item>
                                                    <el-dropdown-item @click.native="onClassMql(data,'delete')">DELETE</el-dropdown-item>
                                                    
                                                    <el-dropdown-item @click.native="onClassExport(data)" divided>导出</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                            <el-button v-show="data.show" type="text" @click.native.stop="onClassConsole(data)" icon="el-icon-s-platform" style="float:right;width:14px;margin:0 5px;"></el-button>
                                            <el-button v-show="data.show" type="text" @click.native.stop="onClassEdit(data)" icon="el-icon-edit-outline" style="float:right;width:14px;margin:0 5px;"></el-button>
                                        </span>
                                        <!--Edge-->
                                        <span v-else>
                                            <span v-if="data.child">
                                                <i class="el-icon-folder" style="color:#FFC107;"></i>
                                                <span>#{ node.label }# (#{ data.children.length }#)</span>
                                                <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;">
                                                    <span class="el-dropdown-link">
                                                        <i class="el-icon-more el-icon--right"></i>
                                                    </span>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item @click.native="initEdgeData(data)">刷新</el-dropdown-item>
                                                        <el-dropdown-item @click.native="onEdgeDelete(data,'drop-all-edge-type')" divided>删除所有关系</el-dropdown-item>
                                                        <el-dropdown-item @click.native="onEdgeExport(data)" divided>导出</el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                                <el-button v-show="data.show" type="text" @click.native.stop="onEdgeNew(data)" icon="el-icon-plus" style="float:right;width:14px;margin:0 5px;"></el-button>
                                            </span>
                                            <span v-else>
                                                <i class="el-icon-share" style="color:#0088cc;"></i>
                                                <span>#{ node.label }#(#{ data.remedy }#)</span>
                                                <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;">
                                                    <span class="el-dropdown-link">
                                                        <i class="el-icon-more el-icon--right"></i>
                                                    </span>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item @click.native="onEdgeDelete(data,'drop-edge-type')">删除关系</el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                                <el-button v-show="data.show" type="text" @click.native.stop="onEdgeEdit(data)" icon="el-icon-edit" style="float:right;width:14px;margin:0 5px;"></el-button>
                                            </span>

                                        </span>
                                    </span>  
                                </el-tree>
                            </el-main>
                        </el-container>`,
            watch: {
                
            },
            filters: {
                pickNodeLabel(data,control){
                    if(control.alias.show){
                        try{
                            return data.alias;
                        } catch(err){
                            return _.last(_.split(data.name,'/'));    
                        }
                    } else {
                        return _.last(_.split(data.name,'/'));
                    }
                }
            },
            created(){
                this.onInit();
            },
            mounted(){
                this.initClassData(this.treeData[0]);
                this.initEdgeData(this.treeData[1]);
            },
            methods: {
                onInit(){
                    this.treeData = [
                        {cid:'1', pid:null, class: "/", type: 'class', name: `/`, title: this.$t('omdb.classTree.class'), child:true, children:[]},
                        {cid:'-10', pid:null, class: null, type: 'edge', name: `/${this.$t('omdb.classTree.edge')}`, title: this.$t('omdb.classTree.edge'), child:true, children:[]}
                    ];
                },
                initClassData(data){
				
                    omdbHandler.classListAsync(data.cid).then( (val)=>{
                        
                        if (_.isEmpty(val)) {
                            return;
                        }
                        
                        let rtn = _.map(val, (v)=>{
                            return _.merge(v, {type: 'class'});
                        })
                        
                        this.$set(data, 'children', rtn);
                        
                        if(!this.defaultExpandedKeys[data.cid]){
                            this.defaultExpandedKeys.push(data.cid);
                        }
                        
                    })
    
                },
                initEdgeData(data){
				
                    omdbHandler.fetchDataByMqlAsync('select edge type').then( (val)=>{
                        
                        if(_.isEmpty(val)){
                            return;
                        }
                        
                        let rtn = _.sortBy(_.map(val.message, (v)=>{
                            return _.merge(v, {type: 'edge', cid: objectHash.sha1(v.name)});
                        }),'name');
                        
                        this.$set(data, 'children', rtn);
                    } );

                },
                onMouseEnter(data){
                    this.$set(data, 'show', true)
                    this.$refs.tree.setCurrentKey(data.cid);
                },
                onMouseLeave(data){
                    this.$set(data, 'show', false)
                },
                onRefresh(data,index){
                    
                },
                onNodeClick(data){
                    if(data.type == 'class'){
                        this.initClassData(data);
                    } else {
                        this.initEdgeData(data);
                    }
                },
                // 类新建
                onClassNew(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'create-class', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 类删除
                onClassDelete(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'drop-class', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 类数据删除
                onClassDeleteData(treeNode, type){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: type, node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 类编辑
                onClassEdit(treeNode){
                    
                    let nodeFieldObj = omdbHandler.classListField(treeNode.cid);
                    let pNodeFieldObj = omdbHandler.classListField(treeNode.pid==-1?1:treeNode.pid);
                    
                    this.$root.mainTabsAdd({ type: 'omdb-class-console',
                                            name: treeNode.name.replace(/\//g,"_")+'_class',
                                            title: treeNode.name+'_class',
                                            model: {pattern: 'select', 
                                                    node: _.extend(treeNode,{fieldsObj:nodeFieldObj}), 
                                                    pnode: _.extend(treeNode.parent,{fieldsObj: pNodeFieldObj}) }
                                        });
                },
                // 类查询控制台
                onClassConsole(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'select', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 类导出
                onClassExport(treeNode){
                    this.$root.classDataExport(treeNode.name);
                },
                // 类MQL
                onClassMql(treeNode, type){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: type, node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 类属性新建
                onClassFieldNew(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'alter-add-column', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 类属性删除
                onClassFieldDelete(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'alter-drop-column', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 类索引新建
                onClassIndexNew(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'alter-add-index', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 类索引删除
                onClassIndexDelete(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'alter-drop-index', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 类属性设置
                onClassSetup(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'alter', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 关系新建
                onEdgeNew(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name,
                                                title: treeNode.name,
                                                model: { pattern: 'create-edge-type', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 关系删除
                onEdgeDelete(treeNode,type){
                    
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name,
                                                title: treeNode.name,
                                                model: { pattern: type, node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 关系编辑
                onEdgeEdit(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'alter-edge', node: treeNode, pnode: treeNode.parent }
                                            });
                },
                // 关系导出
                onEdgeExport(treeNode){
                    this.$root.mainTabsAdd({ type: 'omdb-query-console',
                                                name: treeNode.name.replace(/\//g,"_"),
                                                title: treeNode.name,
                                                model: { pattern: 'alter', node: treeNode, pnode: treeNode.parent }
                                            });
                }
            }
        })

        // ClassList Table组件
        Vue.component("omdb-classlist-component",{
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
            template:   `<el-container class="animated fadeIn" style="height:calc(100% - 70px);">
                            <el-header style="height:30px;line-height:30px;">
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
                            <el-main style="padding:0px;height:100%;overflow:hidden;">
                                <el-table
                                    :data="dt.rows"
                                    highlight-current-row="true"
                                    style="width: 100%"
                                    :row-class-name="rowClassName"
                                    :header-cell-style="headerRender"
                                    @row-contextmenu="onRowContextmenu"
                                    @selection-change="onSelectionChange"
                                    @expand-change="onExpandChange"
                                    stripe
                                    ref="table">
                                    <el-table-column type="selection" align="center"></el-table-column> 
                                    <el-table-column type="expand">
                                        <template slot-scope="props">
                                            
                                            <el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f7f7f7;" >
                                                <el-form-item v-for="v,k in _.find(dt.rows,{name:props.row.name})" :label="k">
                                                    <el-select v-model="v" v-if="k==='class'">
                                                        <el-option
                                                            v-for="item in v"
                                                            :key="item"
                                                            :label="item"
                                                            :value="item">
                                                        </el-option>
                                                    </el-select>
                                                    <el-select v-model="v" v-else-if="k==='dispname'">
                                                        <el-option
                                                            v-for="(val,key) in v"
                                                            :key="key"
                                                            :label="val"
                                                            :value="val">
                                                            <span style="float: left">#{ val }#</span>
                                                            <span style="float: right; color: #8492a6; font-size: 13px">#{ key }#</span>
                                                        </el-option>
                                                    </el-select>
                                                    <el-select v-model="v" v-else-if="k==='tags'">
                                                        <el-option
                                                            v-for="(val,key) in v"
                                                            :key="key"
                                                            :label="val"
                                                            :value="val">
                                                            <el-tag style="float: left">#{ val }#</el-tag>
                                                            <span style="float: right; color: #8492a6; font-size: 13px">#{ key }#</span>
                                                        </el-option>
                                                    </el-select>
                                                    <el-input type="textarea" autosize v-model="v" v-else-if="k==='note'"></el-input>
                                                    <el-image :src="'${window.ASSETS_ICON}/tools/png/'+v+'.png?type=open&issys=${window.SignedUser_IsAdmin}'" v-else-if="k==='icon'" style="width:64px;"></el-image>
                                                    <el-input v-model="v" v-else></el-input>
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
                this.initData();
            },
            methods: {
                initData(){
                    _.extend(this.dt,this.model);
                    _.map(this.dt.columns,(v)=>{
                        if(_.isUndefined(v.visible)){
                            _.extend(v, { visible: true });
                        }
                        return v;
                    })
                },
                rowClassName({row, rowIndex}){
                    return `row-${rowIndex}`;
                },
                headerRender({ row, column, rowIndex, columnIndex }){
                    if (rowIndex === 0) {
                        //return 'text-align:center;';
                    }
                },
                onExpandChange(val){
                    
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
                                items: self.model.contextMenu
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

        Vue.component("omdb-editor",{
            delimiters: ['#{', '}#'],
            props:{
                model: String
            },
            template:  `<div style="width:100%;height:100%;" ref="editor"></div>`,
            mounted(){
                this.$nextTick().then(()=> {
                    this.init();
                })
            },
            methods: {
                init(){
                    let editor = ace.edit(this.$refs.editor);
                    editor.setOptions({
                        // maxLines: 1000,
                        minLines: 20,
                        autoScrollEditorIntoView: true,
                        enableBasicAutocompletion: true,
                        enableSnippets: true,
                        enableLiveAutocompletion: false
                    });
                    
                    editor.getSession().setMode("ace/mode/json");
                    editor.setTheme("ace/theme/chrome");
                    editor.getSession().setUseSoftTabs(true);
                    editor.getSession().setTabSize(2);
                    editor.getSession().setUseWrapMode(false);
                    editor.renderer.setShowGutter(true);
                    editor.setValue(this.model);
                }
            }
        })
        // 日志控制台
        Vue.component("omdb-log-console", {
            delimiters: ['#{', '}#'],
            props:{
                id: String,
                model: Object
            },
            template:   `<el-container :class="'log-console '+ theme" style="height:100%;">
                            <el-header class="logToolBar" style="height: 30px;line-height: 30px;padding: 0px 10px;width: 100%;">
                                <el-button type="text" class="copy" @click="copyIt" title="复制"><i class="fa fa-copy"></i></el-button>
                                <el-button type="text" class="clear" @click="clearIt" title="清空"><i class="fa fa-trash"></i></el-button>
                            </el-header>
                            <el-main :class="'log-console-content '+ theme" v-if="!_.isEmpty(log.msg)">
                                <el-collapse value="['1']" accordion>
                                    <el-collapse-item :name="item[2].id" v-for="item in log.msg" :key="item[2].id">
                                        <template slot="title">
                                            <div style="height: 30px;line-height: 30px;width: 100%;font-size: 10px;font-weight: normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">
                                                [#{item[0]}#] [<span :class="'log-severity '+item[1]">#{item[1]}#</span>]  #{item[2].short}# 
                                            </div>
                                        </template>
                                        <el-container style="height:200px;">
                                            <el-header class="logToolBar" style="height: 30px;line-height: 30px;padding: 0px 10px;width: 100%;">
                                                <el-button :class="item[2].id"  type="text"  icon="el-icon-copy-document" @click="copyMe(item)"></el-button>
                                            </el-header>
                                            <el-main style="padding:0px;height:100%;overflow:hidden;">
                                                <omdb-editor :model="item[2].content"></omdb-editor>
                                            </el-main>
                                        </el-container>
                                    </el-collapse-item>
                                </el-collapse>
                            </el-main>
                        </el-container>`,
            data(){
                return {
                    log: {
                        msg: []
                    },
                    theme: 'light',
                    debug: {
                        mql: [],
                        flag: [],
                        crontab: {
                            sched: '30 second',
                            timer: null
                        }
                    }
                }
            },
            watch: {
                'debug.mql': {
                    handler: function(val,oldVal){
                        const self = this;

                        if(val !== oldVal){
                            self.debugIt(val);
                        }

                        if(_.isEmpty(val)){
                            self.debug.crontab.sched = null;
                            self.debug.crontab.timer = null;
                        } else {
                            self.debug.crontab.sched = later.parse.text(`every ${self.debug.crontab.sched}`);
                            self.debug.crontab.timer = later.setInterval(self.refresh, self.debug.crontab.sched);
                        }
                    },
                    deep:true
                },
                model: {
                    handler:function(val,oldVal){
                        const self = this;
                        // 追加
                        if(!_.isEmpty(val)){
                            self.append(_.last(val).level, _.last(val).msg);
                        }
                    },
                    deep:true,
                    immediate:true
                }
            },
            mounted() {
                this.$nextTick( ()=> {
                    this.init();
                    this.initPlugin();
                })
            },
            filters: {
                format(value){
                    return value.join('\n\n');
                }
            },
            methods: {
                init(){
                    this.theme = localStorage.getItem("LOG-CONSOLE-THEME");
                },
                initPlugin(){
                    const self = this;

                    $(self.$el).contextMenu({
                        selector: 'a.debug',
                        trigger: 'left',
                        build: function($trigger, e) {

                            $(".context-menu-input-refresh").eq(3).prop('selected', true);

                            let _items = {
                                "trigger": {
                                    name: "调式触发器", type: "checkbox", selected: false
                                },
                                "scriptjs": {
                                    name: "调式脚本", type: "checkbox", selected: false
                                },
                                "itil": {
                                    name: "调式流程", type: "checkbox", selected: false
                                },
                                "rule": {
                                    name: "调式规则", type: "checkbox", selected: false
                                },
                                "webcontext": {
                                    name: "调式缓存", type: "checkbox", selected: false
                                },
                                "scriptlua": {
                                    name: "调式脚本Lua", type: "checkbox", selected: false
                                },
                                "refresh": {
                                    name: "刷新时间",
                                    type: 'select',
                                    options: {1: '5 second', 2: '15 second', 3: '30 second', 4: '1 mins'},
                                    selected: 3,
                                    events: {
                                        change: function (e) {
                                            self.debug.crontab.sched = e.target.options[e.target.selectedIndex].label;
                                        }
                                    }
                                }
                            };

                            if(!_.isEmpty(self.debug.flag)){
                                _.forEach(self.debug.flag,function(v,k){
                                    _items[v].selected = true;
                                })
                            }

                            return {
                                items: _items
                            }
                        },
                        events: {
                            show: function(opt) {
                                let $this = this;

                                $.contextMenu.setInputValues(opt, $this.data());

                            },
                            hide: function(opt) {
                                let $this = this;

                                $.contextMenu.getInputValues(opt, $this.data());

                                self.debugs($this.data());


                            }
                        }
                    });
                },
                refresh(){
                    this.debugIt(self.debug.mql);
                },
                debugs(key){
                    const self = this;

                    self.debug.mql = [];
                    self.debug.flag = [];

                    _.forEach(key, function(v,k){
                        if(k !== 'contextMenu' && v != false){
                            self.debug.mql.push(`#/matrix/consolelog/${k}: | nearest 1 day | sort ctime desc`);
                            self.debug.flag.push(k);
                        }
                    });

                },
                append(level, event){
                    const self = this;
                    let _log = null;

                    _log = self.logFormat(level, event);

                    self.log.msg.unshift(_log);

                },
                logFormat(level, event){
                    const self = this;
                    let _content = event;

                    if(typeof(event) === 'object'){
                        _content = JSON.stringify(event);
                    }

                    let _short = _.truncate(_content, {
                        'length': 100,
                        'separator': ' ',
                        'omission': ''
                    });

                    let _id = 'id' + objectHash.sha1(level + _content + _.now());

                    return [moment().format("YYYY-MM-DD HH:mm:ss:SSS"), _.upperCase(level), {id:_id, short: _short, content: JSON.stringify(JSON.parse(_content),null,2) }];
                },
                copyIt(event){
                    
                    new Clipboard(".copy", {
                        text: (trigger)=> {
                            this.$message({
                                type: "info",
                                message: "已复制"
                            });

                            let rtn = _.map(this.log.msg,function(v){
                                return [v[0],v[1],v[2].short + v[2].content];
                            });
                            return rtn.join("\n");
                        }
                    });

                },
                copyMe(item){
                    
                    new Clipboard(`.${item[2].id}`, {
                        text: (trigger)=> {
                            this.$message({
                                type: "info",
                                message: "已复制"
                            });
                            return item[2].content;
                        }
                    });

                },
                clearIt(){
                    const self = this;

                    self.log.msg = [];

                },
                debugIt(event){
                    const self = this;

                    _.forEach(event,function(v){
                        let _list = omdbHandler.fetchData(v);

                        _.forEach(_list.message,function(v){

                            let _content = `[${v.name}] [${v.class}] ${v.msg}`;

                            let _short = _.truncate(_content, {
                                'length': 130,
                                'separator': ' ',
                                'omission': ''
                            });

                            let _id = objectHash.sha1(v.level + _content + _.now());

                            let _log = [moment(v.ctime).format("YYYY-MM-DD HH:mm:ss:SSS"), _.upperCase(v.level), {id:_id, short: _short, content: _content.replace(_short,'')}];

                            self.log.msg.unshift(_log);
                        })
                    })

                },
                toggleTheme(){
                    const self = this;

                    if(self.theme === 'light') {

                        $(self.$el).removeClass("light");
                        $(self.$el).addClass("dark");

                        $(self.$el).find(".light").addClass("dark");
                        $(self.$el).find(".light").removeClass("light");

                        self.theme = 'dark';

                    } else {

                        $(self.$el).removeClass("dark");
                        $(self.$el).addClass("light");

                        $(self.$el).find(".dark").addClass("light");
                        $(self.$el).find(".dark").removeClass("dark");

                        self.theme = 'light';
                    }

                    localStorage.setItem("LOG-CONSOLE-THEME", self.theme);

                }
            }
            
        })

        // Trigger
        Vue.component("omdb-trigger-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template: `<omdb-trigger-editor-component :id="id"
                            :className="model.node.name"
                            :model="editor"
                            showToolsBar="true"
                            showStatusBar="false"></omdb-trigger-editor-component>`,
            data(){
                return {
                    editor: {
                        mode: "lua",
                        theme: "tomorrow",
                        readOnly: false,
                    }
                }
            },
            created(){
                
            }
            
        })

        // JSON输出控制台
        Vue.component("omdb-query-output-json-console",{
            delimiters: ['#{', '}#'],
            props: {
                model: Object
            },
            template: `<el-container style="height: calc(100% - 30px);">
                            <el-header style="height:30px;line-height:30px;background: #f2f2f2;">
                                <el-button-group>
                                    <el-tooltip content="复制" placement="bottom" open-delay="500">
                                        <el-button type="text" icon="fas fa-copy" class="btn-copy"></el-button>
                                    </el-tooltip>
                                </el-button-group>
                            </el-header>
                            <el-main style="padding:0px;height:100%;" ref="editor">
                            </el-main>
                        </el-container>`,
            data(){
                return {

                }
            },
            created: function(){
                const self = this;

            },
            mounted() {
               this.init();
            },
            methods: {
                init(){
                    
                    let jsonStr = JSON.stringify(this.model,null,4);

                     // Editor
                    let editor = ace.edit(this.$refs.editor.$el);
                    editor.setOptions({
                        //maxLines: 1000,
                        minLines: 20,
                        autoScrollEditorIntoView: true,
                        enableBasicAutocompletion: true,
                        enableSnippets: true,
                        enableLiveAutocompletion: true
                    });
                    editor.setTheme("ace/theme/tomorrow");
                    editor.getSession().setMode("ace/mode/json");
                    editor.setValue(jsonStr);

                    new Clipboard('.el-button.btn-copy',{
                        text: (trigger)=> {
                            this.$message('已复制');
                            return jsonStr;
                        }
                    });

                }
            }
        })

        // 文本输出控制台
        Vue.component("omdb-query-output-text-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Array
            },
            template:   `<el-container>
                            <el-main>
                                <p>
                                    <div v-for="item in model">
                                        <div v-for="(v,k) in item">
                                            <dt>#{k}#：#{v}#</dt>
                                        </div>
                                    </div>
                                </p>
                                <p>输出时间：#{moment().format("LLL")}#</p>
                            </el-main>
                        </el-container>`,
            data(){
                return {

                }
            }  
        })

        // 类编辑控制台 
        Vue.component("omdb-class-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template:   `<el-container style="height: calc(100vh - 110px);">
                            <el-main style="padding:0px;overflow:hidden;background:#f2f2f2;">
                                <el-form label-width="80px" :model="formModel" style="width:70%;padding: 10px 0px;">
                                    <el-form-item label="类名称">
                                        <el-input v-model="formModel.name" :disabled="true"></el-input>
                                    </el-form-item>
                                    <el-form-item label="类别名">
                                        <el-input v-model="formModel.alias">
                                            <el-button slot="append" icon="fas fa-save" @click="onUpdate('alias')"></el-button>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="TTL">
                                        <el-input-number v-model="formModel.ttl" controls-position="right" :min="-1">
                                        </el-input-number>
                                        <span style="font-size:10px;padding-left:10px;">#{ mx.secondsToDay(formModel.ttl) }#</span>
                                        <el-button icon="fas fa-save" @click="onUpdate('ttl')" style="float:right;"></el-button>
                                        <span style="font-size:10px;float:right;padding-right:10px;">数据生命周期(单位：秒)，-1为永久保存，0为不保存</span>
                                    </el-form-item>
                                    <el-form-item label="备注">
                                        <el-input v-model="formModel.remedy" clearable>
                                            <el-button slot="append" icon="fas fa-save" @click="onUpdate('remedy')"></el-button>
                                        </el-input>
                                    </el-form-item>
                                </el-form>
                                <el-tabs v-model="tabs.activeName" type="card" tab-position="left" 
                                    @tab-click="onClick" 
                                    style="border-top:1px solid #dddddd;height:100%;">
                                    <el-tab-pane name="columns">
                                        <span slot="label"><i class="fas fa-columns"></i> 属性</span>
                                        <el-container style="height:calc(100% - 145px);padding:10px;"> 
                                            <el-header style="height:30px;"> 
                                                <el-breadcrumb separator="/" style="height:30px;line-height:30px;">
                                                    <el-breadcrumb-item>
                                                        <el-button type="text" @click="onChangeClassColumn('/')">基类</el-button>
                                                    </el-breadcrumb-item>
                                                    <el-breadcrumb-item  :key="item" v-for="(item,index) in ddlPath" v-if="index > 0">
                                                        <el-button type="text" @click="onChangeClassColumn(ddlPath.slice(0,index+1).join('/'))">#{item}#</el-button>
                                                    </el-breadcrumb-item>
                                                </el-breadcrumb>
                                            </el-header>
                                            <el-main style="padding:0px;">
                                                <omdb-classlist-component :model="dt"></omdb-classlist-component>
                                            </el-main>
                                        </el-container>
                                    </el-tab-pane>
                                    <el-tab-pane name="keys">
                                        <span slot="label"><i class="fas fa-key"></i> 主键</span>
                                        <el-container style="height:calc(100% - 230px);padding:10px;"> 
                                            <el-header style="height:30px;"> 
                                                <el-breadcrumb separator="/" style="height:30px;line-height:30px;">
                                                    <el-breadcrumb-item>
                                                        <el-button type="text">基类</el-button>
                                                    </el-breadcrumb-item>
                                                    <el-breadcrumb-item  :key="item" v-for="(item,index) in ddlPath" v-if="index > 0">
                                                        <el-button type="text">#{item}#</el-button>
                                                    </el-breadcrumb-item>
                                                </el-breadcrumb>
                                            </el-header>
                                            <el-main style="padding:0px;">
                                                <omdb-editor-base-component :model="keysModel"
                                                                            showToolsBar="true"
                                                                            showStatusBar="true">
                                                </omdb-editor-base-component>
                                            </el-main>
                                        </el-container>
                                    </el-tab-pane>
                                    <el-tab-pane name="indexes">
                                        <span slot="label"><i class="fas fa-indent"></i> 索引</span>
                                        <el-container style="height:calc(100% - 230px);padding:10px;"> 
                                            <el-header style="height:30px;"> 
                                                <el-breadcrumb separator="/" style="height:30px;line-height:30px;">
                                                    <el-breadcrumb-item>
                                                        <el-button type="text">基类</el-button>
                                                    </el-breadcrumb-item>
                                                    <el-breadcrumb-item  :key="item" v-for="(item,index) in ddlPath" v-if="index > 0">
                                                        <el-button type="text">#{item}#</el-button>
                                                    </el-breadcrumb-item>
                                                </el-breadcrumb>
                                            </el-header>
                                            <el-main style="padding:0px;">
                                                <omdb-editor-base-component :model="indexesModel"
                                                                            showToolsBar="true"
                                                                            showStatusBar="true">
                                                </omdb-editor-base-component>
                                            </el-main>
                                        </el-container>
                                    </el-tab-pane>
                                    <el-tab-pane name="subClass">
                                        <span slot="label"><i class="fas fa-cube"></i> 子类</span>
                                        <el-container style="height:calc(100% - 230px);padding:10px;"> 
                                            <el-header style="height:30px;"> 
                                                <el-breadcrumb separator="/" style="height:30px;line-height:30px;">
                                                    <el-breadcrumb-item>
                                                        <el-button type="text">基类</el-button>
                                                    </el-breadcrumb-item>
                                                    <el-breadcrumb-item  :key="item" v-for="(item,index) in ddlPath" v-if="index > 0">
                                                        <el-button type="text">#{item}#</el-button>
                                                    </el-breadcrumb-item>
                                                </el-breadcrumb>
                                            </el-header>
                                            <el-main style="padding:0px;">
                                                <omdb-editor-base-component :model="subClassModel"
                                                                            showToolsBar="true"
                                                                            showStatusBar="true">
                                                </omdb-editor-base-component>
                                            </el-main>
                                        </el-container>
                                    </el-tab-pane>
                                    <el-tab-pane name="options">
                                        <span slot="label"><i class="fas fa-cog"></i> 设置</span>
                                        <el-container style="height:calc(100% - 230px);padding:10px;"> 
                                            <el-header style="height:30px;"> 
                                                <el-breadcrumb separator="/" style="height:30px;line-height:30px;">
                                                    <el-breadcrumb-item>
                                                        <el-button type="text">基类</el-button>
                                                    </el-breadcrumb-item>
                                                    <el-breadcrumb-item  :key="item" v-for="(item,index) in ddlPath" v-if="index > 0">
                                                        <el-button type="text">#{item}#</el-button>
                                                    </el-breadcrumb-item>
                                                </el-breadcrumb>
                                            </el-header>
                                            <el-main style="padding:0px;">
                                                <omdb-editor-base-component :model="optionsModel"
                                                                            showToolsBar="true"
                                                                            showStatusBar="true">
                                                </omdb-editor-base-component>
                                            </el-main>
                                        </el-container>
                                    </el-tab-pane>
                                    <el-tab-pane name="ddl">
                                        <span slot="label"><i class="fas fa-table"></i> DDL</span>
                                        <el-container style="height:calc(100% - 230px);padding:10px;"> 
                                            <el-header style="height:30px;"> 
                                                <el-breadcrumb separator="/" style="height:30px;line-height:30px;">
                                                    <el-breadcrumb-item>
                                                        <el-button type="text" @click="onChangeClassDDL('/')">基类</el-button>
                                                    </el-breadcrumb-item>
                                                    <el-breadcrumb-item  :key="item" v-for="(item,index) in ddlPath" v-if="index > 0">
                                                        <el-button type="text" @click="onChangeClassDDL(ddlPath.slice(0,index+1).join('/'))">#{item}#</el-button>
                                                    </el-breadcrumb-item>
                                                </el-breadcrumb>
                                            </el-header>
                                            <el-main style="padding:0px;">
                                                <omdb-editor-base-component :model="ddlModel"
                                                                            showToolsBar="true"
                                                                            showStatusBar="true">
                                                </omdb-editor-base-component>
                                            </el-main>
                                        </el-container>
                                    </el-tab-pane>
                                    <el-tab-pane name="trigger">
                                        <span slot="label"><i class="fas fa-stopwatch"></i> 触发器</span>
                                        <el-container style="height:calc(100% - 200px);padding:10px;"> 
                                            <el-header style="height:30px;"> 
                                                <el-breadcrumb separator="/" style="height:30px;line-height:30px;">
                                                    <el-breadcrumb-item>
                                                        <el-button type="text">基类</el-button>
                                                    </el-breadcrumb-item>
                                                    <el-breadcrumb-item  :key="item" v-for="(item,index) in ddlPath" v-if="index > 0">
                                                        <el-button type="text">#{item}#</el-button>
                                                    </el-breadcrumb-item>
                                                </el-breadcrumb>
                                            </el-header>
                                            <el-main style="padding:0px;">
                                                <omdb-trigger-console :id="id+'-trigger'" :model="model"></omdb-trigger-console>
                                            </el-main>
                                        </el-container>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-main>
                        </el-container>`,
            data(){
                return {
                    tabs:{
                        activeName: 'columns'
                    },
                    dt: {
                        rows: [],
                        columns: [],
                        result: {},
                        keys: [],
                    },
                    formModel: {},
                    keysModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    },
                    indexesModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    },
                    subClassModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    },
                    optionsModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    },
                    ddlModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: true,
                    }
                }
            },
            computed: {
                ddlPath(){
                    return this.formModel.name.split("/");
                }
            },
            created(){
                // columns
                this.initColumns(this.model);

                // keys
                this.initKeys();

                // form
                this.initForm();
            },
            mounted() {
                
            },
            methods: {
                initColumns(model){
                    let node = model.node;
                    let pnode = model.pnode;
                    
                    if(!_.isEmpty(node.fieldsObj) && !_.isEmpty(pnode.fieldsObj)) {

                        let _node = _.cloneDeep(node.fieldsObj);
                        let _pnode = _.cloneDeep(pnode.fieldsObj);
        
                        if(node.fieldsObj == pnode.fieldsObj) {
                            this.dt.rows = _.map(node.fieldsObj, (v)=>{
                                return _.merge(v, {icon: 'parent'});
                            });
                        } else {
                            let _diff =  _.differenceWith(node.fieldsObj, pnode.fieldsObj, (v1,v2)=>{return v1.name === v2.name;});
        
                            if(_.isEmpty(_diff)){
                                this.dt.rows = _.map(_node, (v)=> {
                                    return _.merge(v, {icon: 'parent'});
                                });
        
                            } else {
                                this.dt.rows = _.concat(_.map(_pnode,(v)=>{return _.merge(v, {icon: 'parent'});}), _.map(_diff,(v)=>{return _.merge(v, {icon: 'child'});}));
                            }
                        }
                    } else{
                        this.dt.rows = _.map(node.fieldsObj, (v)=> {
                            return _.merge(v, {icon: 'parent'});
                        });
                    }
        
                    this.dt.rows = _.map(_.uniqBy(this.dt.rows,'name'),(v)=>{
                        if(_.indexOf(node.keys,v.name) > -1){
                            _.extend(v,{iskey:1});
                        }
                        return v;
                    });
    
                    this.dt.columns = [
                                        {"field": "id", title:"序号", width: 80, render: function(row,column,cellValue,index) {
                                                return index + 1;
                                            }
                                        },
                                        {"field": "icon", "title": "继承", width: 120, render: function(row,column,cellValue,index) {
                                                return `<img src="${window.ASSETS_ICON}/tools/png/${cellValue}.png?type=open&issys=${window.SignedUser_IsAdmin}" style="width:22px;height:22px;">`;
                                            }
                                        },
                                        {"field": "name", "title": "属性", width: 120},
                                        {"field": "colname", "title": "列属性", width: 120, visible: false},
                                        {"field": "title", "title": "标题", width: 120},
                                        {"field": "ftype", "title": "类型", width: 80, render: function(row,column,cellValue,index) {
                                                return cellValue==='smallint'?'enum':cellValue;
                                            }
                                        },
                                        {"field": "loption", "title": "Loption", width: 120},
                                        {"field": "fparam", "title": "Fparam", width: 160},
                                        {"field": "isindex", "title": "索引", width: 80, render: function (row,column,cellValue,index) {
                                                return cellValue===1?'是':'否';
                                            }
                                        },
                                        {"field": "iskey", "title": "主键", width: 120, render: function (row,column,cellValue,index) {
                                                return cellValue===1?'是':'否';
                                            }
                                        },
                                        {"field": "note", "title": "备注"},
                                        {"field": "mtime", "title": "时间", width: 160, render: function (row,column,cellValue,index) {
                                                return moment(cellValue).format("YYYY-MM-DD HH:MM:SS.SSS");
                                            }
                                        },
                                        {"field": "class", "title": "类", width: 80, "visible": false},
                                        {"field": "dispname", "title": "显示名称", width: 80, "visible": false},
                                        {"field": "tags", "title": "标签", width: 80, "visible": false},
                                        {"field": "isrel", "title": "Rel", width: 80, "visible": false},
                                        {"field": "btype", "title": "Btype", width: 80, "visible": false}
                                    ];
    
                    this.dt.columns = _.uniqBy(this.dt.columns, 'field');
                                    
                    this.dt.result = node;
                    
                },
                onChangeClassColumn(className){
                    
                    fsHandler.callFsJScriptAsync("/matrix/omdb/getClassIdByName.js", encodeURIComponent(className)).then( (rtn)=>{
                        
                        let id = rtn.message;

                        /* omdbHandler.classTreeAsync(id).then( (rtn)=>{
                            console.log(2323,rtn)
                        } )
                        
                        omdbHandler.classListAsync(id).then( (node)=>{
                            console.log(node)
                            let nodeObj = omdbHandler.classListField(node.cid);
                            let pNodeObj = omdbHandler.classListField(node.pid==-1?1:node.pid);

                            let model = {node: {fieldsObj:nodeObj}, pnode: {fieldsObj:pNodeObj} };
                            
                            this.initColumns(model);

                        } ) */

                    } );
                    
                },
                initKeys: function(){
                    let rtn = omdbHandler.classList(-1)[0];
                    this.dt.keys = _.sortBy(_.keys(rtn));
                },
                initForm(){
                    this.formModel = this.model.node;
                },
                onClick(tab, event){
                    const splitTab = "\t| ";
                    const endWord = "\n";
                    const spaceWord = function(n){return n<=20?_.fill(Array(20 - n)," ").join(""):"" ;};
                    const headerWord = _.fill(Array(100),"-").join("");

                    if(tab.name == 'keys'){
                        this.keysModel.newInput = _.concat([`Name${spaceWord(4)}${splitTab}Type`,headerWord],_.map(this.model.node.keys,(v)=>{
                            return `${v}${spaceWord(v.length)}${splitTab}Primary Key`;
                        })).join(endWord);
                    } else if(tab.name == 'indexes'){
                        this.indexesModel.newInput = _.concat([`Name${spaceWord(4)}${splitTab}Query`,headerWord],_.map(_.filter(this.model.node.fieldsObj,(v)=>{
                            return v.isindex == 1;
                        }),(w)=>{
                            return `${w.name}${spaceWord(w.name.length)}${splitTab}CREATE INDEX ${w.name} ON ${window.COMPANY_OSPACE}(${w.name});`;
                        })).join(endWord);
                    } else if(tab.name == 'subClass'){
                        this.subClassModel.newInput = _.concat([`Name[${this.model.node.child.length}]`,headerWord],_.map(this.model.node.child,(v)=>{
                            return `${v}`;
                        })).join(endWord);
                    } else if(tab.name == 'options'){
                        this.dt.keys = _.without(this.dt.keys,'child','fields');
                        this.optionsModel.newInput = _.concat([`Name${spaceWord(4)}${splitTab}Value`,headerWord],_.map(this.dt.keys,(v)=>{
                            let value = this.model.node[v];

                            if(v === 'mtime'){
                                value = moment(this.model.node[v]).format("LLL");
                            } else if(v === 'keymethod'){
                                if(this.model.node[v] === 1){
                                    value = 'uuid';
                                } else {
                                    value = 'md5';
                                }
                            }
                            
                            return `${v}${spaceWord(v.length)}${splitTab}${value}`;
                        })).join(endWord);;
                    } else if(tab.name == 'ddl'){
                        omdbHandler.classToDDLAsync(this.model.node.name).then( (rtn)=>{
                            this.ddlModel.newInput = rtn;
                        } );
                    }
                },
                onChangeClassDDL(className){
                    omdbHandler.classToDDLAsync(className).then( (rtn)=>{
                        this.ddlModel.newInput = rtn;
                    } );
                },
                onUpdate(column){
                    let item = {action:'update', class: this.formModel.name, name: column, value: this.formModel[column]};
                    fsHandler.callFsJScriptAsync("/matrix/omdb/updateClass.js",encodeURIComponent(JSON.stringify(item))).then( (rtn)=>{
                        if(rtn.status == 'ok'){
                            this.$message({
                                type: "success",
                                message: "更新成功"
                            })
                        } else {
                            this.$message({
                                type: "error",
                                message: "更新失败：" + rtn.message
                            })
                        }
                    } );
                }
            }  
        })

        // 图谱控制台
        Vue.component("omdb-graph-console",{
            delimiters: ['${', '}'],
            props: {
                id: String,
                model: Object
            },
            template: `<omdb-graph-component :id="id" :bid="id" :graphData="graphModel"></omdb-graph-component>`,
            data(){
                return {
                    graphModel: {},
                }
            },
            watch: {
                model:{
                    handler: function(val,oldVal){
                        this.init();
                    },
                    deep:true
                }
            },
            created(){
                this.init();
            },
            mounted() {
                const self = this;

                self.$nextTick(function () {
                    self.init();
                })
            },
            methods: {
                init(){
                    const self = this;

                    _.extend(self.graphModel, {nodes: self.model.nodes || [], edges: self.model.edges || [], paths: self.model.paths || [], pathtags: self.model.pathtags || [], diff: self.model.diff || [] } );

                }
            }
        })

        // 查询输出控制台
        Vue.component("omdb-query-output-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template:   `<el-container style="height:calc(100% - 30px);">
                            <el-header style="height:30px;line-height:30px;" v-if="!_.isEmpty(model.data) && _.includes(['select'],model.type)">
                                <el-tooltip content="删除" open-delay="800" placement="top">
                                    <el-button type="text" @click="onDelete" icon="el-icon-delete"></el-button>
                                </el-tooltip>
                                <el-tooltip content="导出" open-delay="900" placement="top">
                                    <el-dropdown @command="onExport">
                                        <span class="el-dropdown-link">
                                            <i class="el-icon-download el-icon--right"></i>
                                        </span>
                                        <el-dropdown-menu slot="dropdown">
                                            <el-dropdown-item command="mql">MQL</el-dropdown-item>
                                            <el-dropdown-item command="csv">CSV</el-dropdown-item>
                                            <el-dropdown-item command="json">JSON</el-dropdown-item>
                                            <el-dropdown-item command="png">PNG</el-dropdown-item>
                                            <el-dropdown-item command="xls">XLS (Excel 2000 HTML format)</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </el-tooltip>

                            </el-header>
                            
                            <el-main style="height:100%;padding:0px;" v-if="!_.isEmpty(model.data) && _.includes(['select'],model.type)">
                                <el-table :data="dt.rows" 
                                    stripe
                                    border
                                    style="width: 100%;"
                                    height="100%"
                                    :row-class-name="rowClassName"
                                    :header-cell-style="headerRender"
                                    @cell-dblclick="onCellDblclick"
                                    @selection-change="onSelectionChange"
                                    fit="true"
                                    ref="table"
                                    v-if="!_.isEmpty(dt.rows)">
                                    
                                    <el-table-column type="index" label="序号" sortable align="center">
                                        <template slot-scope="scope">
                                            <div style="width:100%; text-align: center;"> <b> #{scope.$index + 1}# </b> </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column type="selection" align="center">
                                    </el-table-column>                                                
                                    <el-table-column type="expand" label="详细" align="center" >
                                        <template slot-scope="props">
                                            <el-container style="width:50vw;">
                                                <el-main>
                                                    <el-form label-position="right" label-width="120px">
                                                        <el-form-item v-for="v,k in props.row" :label="k" :key="k">
                                                            <el-input :type="k,dt.columns | pickType" :value="moment(v).format(mx.global.register.format)"  v-if="pickFtype(k) == 'timestamp'"></el-input>
                                                            <el-input :type="k,dt.columns | pickType" :value="moment(v).format('YYYY-MM-DD')"  v-else-if="pickFtype(k) == 'date'"></el-input>
                                                            <el-input :type="k,dt.columns | pickType" :rows="6" :value="arrayToCsv(v)"  v-else-if="pickFtype(k) == 'bucket'"></el-input>
                                                            <el-input :type="k,dt.columns | pickType" :rows="6" :value="JSON.stringify(v,null,4)"  v-else-if="_.includes(['map','set','list'],pickFtype(k))"></el-input>
                                                            <el-input :type="k,dt.columns | pickType" :value="v"  v-else></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-main>
                                            </el-container>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :prop="item['field']"  
                                            show-overflow-tooltip="true" 
                                            sortable
                                            resizable
                                            :formatter="item.render"
                                            v-for="item in dt.columns"
                                            min-width="180">
                                        <template slot-scope="scope" slot="header">
                                            <span> #{item['field']}# 
                                                <el-popover
                                                    placement="top-start"
                                                    width="100"
                                                    trigger="hover"
                                                    :content="item.type">
                                                    <code slot="reference" style="color: #333;background-color: #f7f7f7;">#{item.type.substr(0,1)}#</code>
                                                </el-popover>
                                            </span>
                                        </template>
                                        <template slot-scope="scope">
                                            <div v-if="pickFtype(item['field']) == 'timestamp'">#{moment(scope.row[item['field']]).format(mx.global.register.format)}#</div>
                                            <div v-else-if="pickFtype(item['field']) == 'date'">#{moment(scope.row[item['field']]).format('YYYY-MM-DD')}#</div>
                                            <el-popover
                                                placement="top"
                                                width="550"
                                                trigger="click"
                                                popper-class="dataTablePopper"
                                                v-else-if="pickFtype(item['field']) == 'bucket'">
                                                <el-container>
                                                    <el-header style="height:30px;line-height:30px;padding:0px;">
                                                        <el-button type="text" icon="el-icon-timer" @click="arrayToCsvByLocal(item['field'],scope.$index)"></el-button>
                                                        <el-button type="text" icon="el-icon-copy-document" class="el-button-copy" @click="onCopy(item['field'],scope.$index)"></el-button>
                                                    </el-header>
                                                    <el-main style="padding:0px;">
                                                        <textarea rows="10" style="width:98%;white-space:nowrap;" :id="'textarea_'+scope.$index">#{arrayToCsv(scope.row[item['field']])}#</textarea>
                                                    </el-main>
                                                </el-container>
                                                <el-button type="text" icon="el-icon-date" slot="reference">#{scope.row[item['field']].length}#</el-button>
                                            </el-popover>
                                            <el-popover
                                                placement="top"
                                                width="550"
                                                trigger="click"
                                                popper-class="dataTablePopper"
                                                v-else-if="_.includes(['msg','cmds','err','out','config','depot','attr'],item['field']) && !_.isEmpty(scope.row[item['field']])">
                                                <el-container>
                                                    <el-header style="height:30px;line-height:30px;padding:0px;">
                                                        <el-button type="text" icon="el-icon-copy-document" class="el-button-copy" @click="onCopy(item['field'],scope.$index)"></el-button>
                                                    </el-header>
                                                    <el-main style="padding:0px;">
                                                        <textarea rows="10" style="width:98%;white-space:nowrap;" :id="'textarea_'+scope.$index">#{ scope.row[item['field']] }#</textarea>
                                                    </el-main>
                                                </el-container>
                                                <el-button type="text" slot="reference">#{ _.truncate(scope.row[item['field']], {'length': 24}) }# <i class="el-icon-more-outline"></i></el-button>
                                            </el-popover>
                                            <el-popover
                                                placement="top"
                                                width="550"
                                                trigger="click"
                                                popper-class="dataTablePopper"
                                                v-else-if="_.includes(['map','set','list'],pickFtype(item['field'])) && !_.isEmpty(scope.row[item['field']])">
                                                <el-container>
                                                    <el-header style="height:30px;line-height:30px;padding:0px;">
                                                        <el-button type="text" icon="el-icon-copy-document" class="el-button-copy" @click="onCopy(item['field'],scope.$index)"></el-button>
                                                    </el-header>
                                                    <el-main style="padding:0px;">
                                                        <textarea rows="10" style="width:98%;white-space:nowrap;" :id="'textarea_'+scope.$index">#{ scope.row[item['field']] }#</textarea>
                                                    </el-main>
                                                </el-container>
                                                <el-button type="text" slot="reference">#{ _.truncate(JSON.stringify(scope.row[item['field']]), {'length': 24}) }# <i class="el-icon-more-outline"></i></el-button>
                                            </el-popover>
                                            <!--div v-else-if="_.includes(['map','set','list'],pickFtype(item['field']))">#{JSON.stringify(scope.row[item['field']],null,4)}#</div-->
                                            <div v-else>#{scope.row[item['field']]}#</div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div style="padding:20px;" v-else>
                                    <h3><i class="el-icon-info" style="font-size:32px;color:#4caf50;"></i> 没有找到相关的记录</h3>
                                    <p>温馨提示：  
                                    请检查您的输入是否正确
                                    如有任何意见或建议，请及时反馈给我们。
                                    </p>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                            </el-main>
                            <!-- 异常信息提示 -->
                            <el-main style="height:100%;padding:0px;" v-else>
                                <div style="padding:20px;" v-if="model.type=='create-class'">
                                    <h3><i class="el-icon-success" style="font-size:32px;color:#4caf50;"></i> 创建类成功</h3>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else-if="model.type=='drop-class'">
                                    <h3><i class="el-icon-success" style="font-size:32px;color:#4caf50;"></i> 删除类成功</h3>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else-if="model.type=='insert-class'">
                                    <h3><i class="el-icon-success" style="font-size:32px;color:#4caf50;"></i> 插入数据成功</h3>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else-if="model.type=='delete'">
                                    <h3><i class="el-icon-success" style="font-size:32px;color:#4caf50;"></i> 删除数据成功</h3>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else-if="model.type=='update'">
                                    <h3><i class="el-icon-success" style="font-size:32px;color:#4caf50;"></i> 更新数据成功</h3>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else-if="model.type=='create edge'">
                                    <h3><i class="el-icon-success" style="font-size:32px;color:#4caf50;"></i> 创建关系成功</h3>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else-if="model.type=='create-edge-type'">
                                    <h3><i class="el-icon-success" style="font-size:32px;color:#4caf50;"></i> 创建关系类型成功</h3>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else-if="model.type=='drop-edge-type'">
                                    <h3><i class="el-icon-success" style="font-size:32px;color:#4caf50;"></i> 删除关系成功</h3>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else-if="model.type=='alter-class'">
                                    <h3><i class="el-icon-success" style="font-size:32px;color:#4caf50;"></i> 更新类属性成功</h3>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else-if="model.type=='error'">
                                    <h3><i class="el-icon-info" style="font-size:32px;color:#ff0000;"></i> 操作失败</h3>
                                    <p>消息：#{model.data}#</p>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                                <div style="padding:20px;" v-else>
                                    <h3><i class="el-icon-info" style="font-size:32px;color:#4caf50;"></i> 没有找到相关的记录</h3>
                                    <p>温馨提示：  
                                    请检查您的输入是否正确
                                    如有任何意见或建议，请及时反馈给我们。
                                    </p>
                                    <p>耗时：#{model.consume}#</p>
                                </div>
                            </el-main>
                            <el-footer  style="height:30px;line-height:30px;">
                                #{ info.join(' &nbsp; | &nbsp;') }#
                            </el-footer>
                        </el-container>`,
            data(){
                return {
                    dt: {
                        rows: [],
                        columns: [],
                        selected: [],
                    },
                    info: []
                }
            },
            filters: {
                pickType(key,columns){
                    let rtn = 'text';
                    try{
                        let type = _.find(columns,{field:key}).type;
                        if(_.includes(['map','list','set','bucket'],type)){
                            rtn = 'textarea';
                        }
                    } catch(err){
                        rtn = 'input';
                    }

                    return rtn;
                }
            },
            watch: {
                dt:{
                    handler: function(val,oldVal){
                        this.info = [];
                        this.info.push(`共 ${val.rows.length} 项`);
                        this.info.push(`已选择 ${val.selected.length} 项`);
                        this.info.push(moment().format("YYYY-MM-DD HH:MM:SS.SSS"));
                    },
                    deep:true
                }
            },
            created(){
                
                try{
                    if( !_.isEmpty(this.model) ) {
                        this.dt.rows = this.model.data;
                        this.dt.columns = _.map(this.model.columns[_.keys(this.model.columns)[0]],(v)=>{
                            
                            //  msg
                            if(_.includes(['msg'],v['field'])){
                                return _.extend(v,{render: function(row, column, cellValue, index){
                                            return  _.truncate(cellValue, {'length': 100});
                                        }});
                            }

                            //  data & time render
                            else if(_.includes(['day'],v['field'])){
                                return _.extend(v,{render: function(row, column, cellValue, index){
                                            return moment(cellValue).format("YYYY-MM-DD");
                                        }});
                            }

                            else if(_.includes(['vtime','mtime','ctime','stime','etime'],v['field'])){
                                return _.extend(v,{render: function(row, column, cellValue, index){
                                            return moment(cellValue).format("YYYY-MM-DD HH:mm:ss.SSS");
                                        }});
                            }

                            else if(_.includes(['map','set','list'],v.type) || typeof(data) === 'object'){
                                return _.extend(v,{render: function(row, column, cellValue, index){
                                            if(_.isNull(cellValue) || _.isEmpty(cellValue)) {
                                                return '';
                                            } else{
                                                return JSON.stringify(cellValue,null,2);
                                            }
                                        }});
                            }
                            else {
                                return v;
                            }

                            return v;
                        });

                    }
                } catch(err){
                    console.log(err)
                }
            },
            mounted(){
                this.info.push(`共 ${this.dt.rows.length} 项`);
            },
            methods: {
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
                arrayToCsv(data){
                    
                    let lineArray = [];
                    _.forEach(data, (infoArray, index)=> {
                        let line = infoArray.join(", ");
                        lineArray.push(line);
                    });
                    
                    return lineArray.join("\n");
                    
                },
                arrayToCsvByLocal(data,index){
                    
                    try{
                        _.forEach(this.dt.rows[index][data], (infoArray, index)=> {
                            let valid = (new Date(infoArray[0])).getTime() > 0;
                            
                            if(valid){
                                if(typeof infoArray[0] == 'string'){
                                    this.$set(infoArray, 0, moment(infoArray[0]).valueOf());
                                } else {
                                    this.$set(infoArray, 0, moment(infoArray[0]).format(mx.global.register.format));
                                }
                                
                            }
                        });
                    } catch(err){
                        console.log(err)
                    }
                    
                },
                pickFtype(key){
                    let rtn = 'string';
                    try{
                        rtn = _.find(this.dt.columns,{field:key}).type;
                    } catch(err){
                        return rtn;
                    }
                    return rtn;
                },
                rowClassName({row, rowIndex}){
                    return `row-${rowIndex}`;
                },
                headerRender({ row, column, rowIndex, columnIndex }){
                    if (rowIndex === 0) {
                        return 'text-align:center;';
                    }
                },
                onCellDblclick(row, column, cell, event){
                    
                    $(cell).focus();
                    $(cell).select();

                    try {
                        let flag = document.execCommand('copy');
                        if(flag){
                            this.$message({
                                type: "info",
                                message: "已复制"
                            });
                        } 
                    } catch (err) {
                        
                    }
                    
                },
                onSelectionChange(val) {
                    this.dt.selected = val;
                },
                onUpdate(row){
                    let cx = { columns:_.map(this.dt.columns,(v)=>{ return { [v.field]:v.type }; }), row: row };
                },
                onDelete(){
                    
                    if(_.isEmpty(this.dt.selected)) {
                        this.$message({
                            message: '请选择删除数据！',
                            type: 'info'
                        });
                        return false;
                    }

                    let ids = _.map(this.dt.selected,"id");

                    this.$confirm(`确定删除数据？`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        
                        fsHandler.callFsJScriptAsync("/matrix/omdb/dataDelete.js", encodeURIComponent(JSON.stringify(ids))).then( (rtn)=>{
                            this.dt.rows = _.xor(this.dt.rows, this.dt.selected);
                            this.dt.selected = [];
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            }); 
                        } );
                        
                    }).catch(() => {
                        
                    });
                },
                onExport(type){
                    
                    let options = {
                        csvEnclosure: '',
                        csvSeparator: ', ',
                        csvUseBOM: true,
                        ignoreColumn: [0,1,2],
                        fileName: `tableExport_${moment().format("YYYY-MM-DD HH:mm:ss")}`,
                        type: type,
                    };
                    if(type === 'mql'){
                        this.$root.classDataExport(this.model.rootclass);
                    } else if(type === 'png'){
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

        
        // 查询控制台
        Vue.component("omdb-query-console",{
            delimiters: ['#{', '}#'],
            props: {
                id: String,
                model: Object
            },
            template: `<el-container style="height:calc(100vh - 110px);">
                            <el-header :style="'padding:0px;height:'+main.headerHeight+'%;'" ref="topView">
                                <omdb-editor-component :id="id" :bid="id"
                                                        :model="editorModel"
                                                        showToolsBar="true"
                                                        showStatusBar="true"></omdb-editor-component>
                            </el-header>
                            <el-main :style="'padding:0px;height:'+main.mainHeight+'%;overflow:hidden;'" ref="mainView">
                                <el-tabs v-model="main.activeIndex" type="border-card" closable @tab-remove="mainTabsRemove" @tab-click="mainTabsClick"  style="height:100%;">
                                    <el-tab-pane
                                        :key="item.name"
                                        v-for="(item, index) in main.tabs"
                                        :name="item.name"
                                        style="height:100%;">
                                        <span slot="label"><i class="fas fa-list-alt"></i> #{item.title}#</span>
                                        <!--日志-->
                                        <omdb-log-console :id="id+'-log-'+item.name" :model="item.model" v-if="item.type=='omdb-log-console'" :ref="'omdbQueryLogRef-'+id"></omdb-log-console>
                                        <!--表格-->
                                        <omdb-query-output-console :id="id+'-output-'+item.name" :model="item.model" v-if="item.type=='omdb-query-output-console'" :ref="'omdbQueryOutputRef-'+id"></omdb-query-output-console>
                                        <!--文本输出提示-->
                                        <!--图-->
                                        <omdb-graph-console :id="id+'-graph-'+item.name" :model="item.model" v-if="item.type=='omdb-query-graph-console'"  :ref="'omdbQueryGraphRef-'+id"></omdb-graph-console>
                                        
                                        <!--JSON-->
                                        <omdb-query-output-json-console :model="item.model" v-if="item.type=='omdb-query-output-json-console'"  :ref="'omdbQueryOutputJsonRef-'+id"></omdb-class-console>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-main>
                        </el-container>`,
            data(){
                return {
                    main: {
                        tabs: [
                                {title: '日志', name: `log`, type: 'omdb-log-console', model: []}
                            ],
                        activeIndex: 'log',
                        splitInst: null,
                        headerHeight: '40',
                        mainHeight: '60'
                    },
                    editorModel: {
                        oldInput: "",
                        newInput: "",
                        mode: "mql",
                        theme: "tomorrow",
                        printMargin: false,
                        readOnly: false,
                    },
                    keys: []
                }
            },
            created(){
                
                let _diff = null;
                
                if(!_.isEmpty(this.model.pnode)){
                    if(this.model.node.fieldsObj && this.model.pnode.fieldsObj) {
                        _diff = _.differenceBy(this.model.node.fieldsObj, this.model.pnode.fieldsObj, 'name');
                        this.model.node["fieldsObj"] = _.uniqBy(_diff,'name');
                    }
                }

                if(this.model.pattern === 'ddl') {
                    this.editorModel.readOnly = true;
                }

                this.initKeys();
            },
            mounted() {
                this.$nextTick( ()=> {
                    this.init();
                })
            },
            methods: {
                init(){
                    
                    this.initSplit();

                    if(_.isEmpty(this.model.node)) return false;

                    let colms = _.without(this.model.node.fields,"_tokens") || this.model.node.fields;

                    let cls = "";
                    if(_.isEmpty(colms)){
                        cls = "*";
                    } else {
                        cls = colms.join(",");
                    }
                    let mql = "";

                    if(this.model.pattern === 'data') {
                        mql = `SELECT\n\t ${cls} \nFROM\n\t ${this.model.node.name} limit 50`;
                    } else if(this.model.pattern === 'select') {
                        mql = "SELECT\n\t " + cls + "\nFROM\n\t " + this.model.node.name;
                    } else if(this.model.pattern === 'select-edge') {
                        mql = "SELECT\n\t " + cls + "\nFROM\n\t " + this.model.node.name.split("[")[0];
                    } else if(this.model.pattern === 'insert') {
                        mql = "INSERT INTO " + this.model.node.name + "\n" + _.map(this.model.node.fields, function(v){return `${v}=''`;}).join(", ") + ";";
                    } else if(this.model.pattern === 'update') {
                        mql = "UPDATE " + this.model.node.name + "\nSET " + _.map(this.model.node.fields,function(v){return v+"=''";}).join(",") + "\nWHERE ";
                    } else if(this.model.pattern === 'delete') {
                        mql = "DELETE FROM\n\t " + this.model.node.name;
                    }  else if(this.model.pattern === 'delete-data') {
                        mql = "DELETE FROM\n\t " + this.model.node.name + " limit -1";
                    }  else if(this.model.pattern === 'delete-data-withversion') {
                        mql = "DELETE FROM\n\t " + this.model.node.name + " with version";
                    }  else if(this.model.pattern === 'delete-column-data') {
                        mql = "DELETE column_name FROM " + this.model.node.name;
                    }  else if(this.model.pattern === 'ddl') {

                        mql = "#DDL\nCREATE CLASS IF NOT EXISTS " + this.model.node.name + " (\n\t" + _.map(this.model.node.fieldsObj, (v)=>{ return `${v.name}  ${v.ftype}  '${v.title}'`;}).join(",\n\t") + "\n\tindexes(" + _.map(_.filter(this.model.node.fieldsObj,(v)=>{return v.isindex == 1;}),'name').join(",") + ")\n\tkeys(" + this.model.node.keys.join(",") + ")\n);";

                        _.forEach(this.keys,(v)=>{

                            if(_.includes(v,'time')) {
                                mql += `\n\n#${_.startCase(v)}\n${v}=${moment(this.model.node[v]).format("LLL")}`;
                                return;
                            }

                            let _value = this.model.node[v];

                            if(_value === 1){
                                _value = true;
                            } else if(_value === 0){
                                _value = false;
                            }

                            if(v === 'keymethod'){
                                if(_value === 1){
                                    _value = 'uuid';
                                } else {
                                    _value = 'md5';
                                }
                            }

                            mql += `\n\n#${_.startCase(v)}\n${v}=${_value}`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                        })

                    } else if(this.model.pattern === 'create-class') {
                        let _modelName = `new_${_.now()}`
                        mql = `CREATE CLASS IF NOT EXISTS  ${this.model.node.name}/${_modelName}(\n\tfield1\tdate\t"日期",\n\tfield2\ttimestamp\t"时间戳",\n\tfield3\tint\t     "整形值",\n\tfield4\tfloat\t"浮点值",\n\tfield5\tenum {\n\t"1000":["item1", "item1描述"],\n\t"1001":["item2", "item2描述"]}\t"枚举值",\n\tfield6\tvarchar\t"字符串",\n\tkeys(field1,field2,field3,field4,field6),\n\tindex(field1,field2,field3,field4,field6)\n)with ttl=366 day , autosearch=true , alias='${_modelName}', nickname='${_modelName}';`;
                        mql = _.replace(mql, "//", "/");
                    } else if(this.model.pattern === 'drop-class') {
                        mql = "DROP CLASS IF EXISTS " + this.model.node.name + ";";
                    } else if(this.model.pattern === 'alter') {
                        mql = `#设置类属性`;

                        let _keys = _.remove(this.keys, (v)=>{
                            return !_.includes(['cid','pid','fields','keys','mtime','fieldsObj','child', 'loption', 'subclass','vtimebase','tags', 'name'],v)
                        })

                        _.forEach(_keys,(v)=>{
                            let _value = this.model.node[v];

                            if(_value === 1){
                                _value = true;
                            } else if(_value === 0){
                                _value = false;
                            }

                            if(v === 'keymethod'){
                                if(_value === 1){
                                    _value = 'uuid';
                                } else {
                                    _value = 'md5';
                                }
                            }

                            if(_.includes(['alias','keymethod','remedy'],v)){
                                mql += `\n\n#${_.startCase(v)}\nALTER CLASS ${this.model.node.name} SET ${v}='${_value}';`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                            } else {
                                mql += `\n\n#${_.startCase(v)}\nALTER CLASS ${this.model.node.name} SET ${v}=${_value};`.replace(/keymode/gi,"largepartition").replace(/keymethod/gi,"key");
                            }
                        })
                    } else if(this.model.pattern === 'alter-add-column') {
                        mql = "ALTER CLASS " + this.model.node.name + " ADD COLUMN column_name type;\n\n";
                    } else if(this.model.pattern === 'alter-drop-column') {
                        mql = "ALTER CLASS " + this.model.node.name + " DROP COLUMN column_name;\n\n";
                    } else if(this.model.pattern === 'alter-add-index') {
                        mql = "ALTER CLASS " + this.model.node.name + " ADD INDEX index_name type;\n\n";
                    } else if(this.model.pattern === 'alter-drop-index') {
                        mql = "ALTER CLASS " + this.model.node.name + " DROP INDEX index_name type;\n\n";
                    } else if(this.model.pattern === 'alter-add-key') {
                        mql = "ALTER CLASS " + this.model.node.name + " ADD KEY key_name;\n\n";
                    } else if(this.model.pattern === 'alter-drop-key') {
                        mql = "ALTER CLASS " + this.model.node.name + " DROP KEY key_name;\n\n";
                    } else if(this.model.pattern === 'g') { 
                        mql = `g.V(" ").In("${this.model.node.name}").All();`;
                    } else if(this.model.pattern === 'create-edge-type') { 
                        mql = `CREATE EDGE TYPE IF NOT EXISTS type_name 'type_remedy';`;
                    } else if(this.model.pattern === 'drop-all-edge-type') { 
                        
                        omdbHandler.fetchDataByMqlAsync('select edge type').then( (rtn)=>{
                            
                            if(_.isEmpty(rtn.message)){
                                this.editorModel.newInput = "";
                            }
                            
                            this.editorModel.newInput =  _.map(_.sortBy(rtn.message,'name'), (v)=>{
                                                            return `DROP EDGE TYPE ${v.name}`;
                                                        }).join(";\r");
                        } );
                        
                    } else if(this.model.pattern === 'drop-edge-type') {  // edge drop edge type
                        mql = `DROP EDGE TYPE ${this.model.node.name};`;
                    } else if(this.model.pattern === 'edge-insert') {  // edge  create
                        mql = `INSERT INTO class_name id="",${this.model.node.name}=[""];`;
                    } else if(this.model.pattern === 'edge-update') {  // edge  update
                        mql = `UPDATE class_name SET ${this.model.node.name}='' WHERE ID='';`;
                    } else if(this.model.pattern === 'edge-g') {  // edge query all
                        mql = GLOBAL_CONFIG.global.gremlin;
                    }

                    this.editorModel.newInput = mql;
                },
                initKeys(){
                    let rtn = omdbHandler.classList(-1)[0];
                    this.keys = _.sortBy(_.keys(rtn));
                },
                initSplit(){
                    
                    this.main.splitInst = Split([this.$refs.topView.$el, this.$refs.mainView.$el], {
                        sizes: [40,60],
                        minSize: [0, 0],
                        gutterSize: 5,
                        cursor: 'col-resize',
                        direction: 'vertical',
                        onDragEnd:(sizes)=> {
                            this.main.headerHeight = sizes[0];
                            this.main.mainHeight = sizes[1];
                        }
                    });
                },
                logAppend(level,list){
                    
                    let log = _.find(this.main.tabs,{name:'log'});
                    
                    if(_.isEmpty(log)){
                        this.main.tabs.push({title: '日志', name: `log`, type: 'omdb-log-console', model: []});
                        log = _.find(this.main.tabs,{name:'log'});   
                    }
                    
                    log.model.push({level:level,msg:list});
                },
                mainTabsClick(tab, event) {

                },
                mainTabsAdd(node){
                    
                    // 已经打开
                    if(_.find(this.main.tabs,{name: node.name})){
                        this.mainTabsRemove(node.name);

                        _.delay(()=>{
                            this.main.tabs.push(node);
                            this.main.activeIndex = node.name;
                        },50)
                    } else {
                        this.main.tabs.push(node);
                        this.main.activeIndex = node.name;
                    }


                },
                mainTabsRemove(targetName){
                    
                    try{
                        let tabs = this.main.tabs;
                        let activeIndex = this.main.activeIndex;
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
                        
                        this.main.tabs = tabs.filter(tab => tab.name !== targetName);
                        this.main.activeIndex = activeIndex;
                        
                    } catch(err){
                        
                    } 
                }
            }
        })

        VueLoader.onloaded([
            "omdb-editor-component",
            "omdb-editor-base-component",
            "omdb-graph-component",
            "omdb-trigger-editor-component",
            "ai-robot-component"], function() {
    

            $(function() {

                odb.app = new Vue({
                    i18n,
                    delimiters: ['#{', '}#'],
                    template:   `<el-container style="calc(100vh - 140px);">
                                    <el-aside style="overflow:hidden;height:100%;" ref="leftView">
                                        <el-container style="height:100%;">
                                            <el-header style="height:29px;line-height:29px;padding:0 5px;border-bottom:1px solid #dddddd;display:flex;">
                                                <span style="width:90%;margin:0px;">
                                                    <i class="el-icon-coin"></i> #{ $t('omdb.title') }# [${window.COMPANY_OSPACE}]
                                                </span>
                                                <el-dropdown style="width: 10%;text-align: right;cursor:pointer;" placement="top-end">
                                                    <span class="el-dropdown-link">
                                                        <i class="fas fa-angle-down"></i>
                                                    </span>
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item @click.native="classDataExport('/matrix')">#{ $t('omdb.actions.export') }#</el-dropdown-item>
                                                        <el-dropdown-item @click.native="classDataImport">#{ $t('omdb.actions.import') }#</el-dropdown-item>
                                                        <el-dropdown-item @click.native="classPropsDirectory" divided>#{ $t('omdb.actions.directory') }#</el-dropdown-item>
                                                        <el-dropdown-item divided>
                                                            显示别名(Alias)：<el-switch
                                                                v-model="control.alias.show"
                                                                active-color="#13ce66"
                                                                inactive-color="#dddddd">
                                                        </el-dropdown-item>
                                                        <el-dropdown-item divided>
                                                            搜索标记(Autosearch)：<el-switch
                                                                v-model="control.autosearch.show"
                                                                active-color="#13ce66"
                                                                inactive-color="#dddddd">
                                                        </el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                            </el-header>
                                            <el-main style="padding:0px;height:calc(100vh - 108px);overflow:hidden;border-top:1px solid #ffffff;">
                                                <omdb-tree :control="control"></omdb-tree>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-main style="padding:0px;overflow:hidden;position:relative;" ref="mainView">
                                        <el-tabs v-model="main.activeIndex" type="border-card" closable @tab-remove="mainTabsRemove" @tab-click="mainTabsClick" v-if="main.tabs.length > 0">
                                            <el-tab-pane
                                                :key="item.name"
                                                v-for="(item, index) in main.tabs"
                                                :name="item.name">
                                                <span slot="label">
                                                    #{ item.title }#
                                                    <el-dropdown trigger="click">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-arrow-down"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item @click.native="mainTabsClose(0,item)">#{ $t('omdb.actions.close') }#</el-dropdown-item>
                                                            <el-dropdown-item @click.native="mainTabsClose(1,item)">#{ $t('omdb.actions.closeOthersTab') }#</el-dropdown-item>
                                                            <el-dropdown-item @click.native="mainTabsClose(2,item)">#{ $t('omdb.actions.closeRightTab') }#</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                    </el-dropdown>
                                                </span>
                                                
                                                <omdb-query-console :id="id+'-query-'+item.name" :model="item.model" v-if="item.type=='omdb-query-console'" :ref="'omdbQueryConsoleRef-'+id+'-query-'+item.name"></omdb-query-console>
                                                <omdb-trigger-console :id="id+'-trigger-'+item.name" :model="item.model" v-if="item.type=='omdb-trigger-console'"></omdb-trigger-console>
                                                <omdb-class-console :id="id+'-class-'+item.name" :model="item.model" v-if="item.type=='omdb-class-console'"  :ref="'omdbClassRef-'+id+'-class-'+item.name""></omdb-class-console>
                                            </el-tab-pane>
                                        </el-tabs>
                                        <div style="background:#ffffff;padding:5% 20px;height:100%;display:block;text-align:center;" v-else>
                                            <h2 style="margin: 0px 0px 40px 0px;">欢迎使用#{ $t('omdb.title') }#</h2>
                                            <p>
                                                <el-button style="width:100px;height:90px;">
                                                    <i class="el-icon-office-building" style="font-size:48px;"></i> <p>类管理</p>
                                                </el-button>
                                                <!--el-link style="margin-left: 20px;">文章</el-link>
                                                <el-link style="margin-left: 20px;">视频</el-link-->
                                            
                                                <el-button style="width:100px;height:90px;">
                                                    <i class="el-icon-postcard" style="font-size:48px;"></i> <p>属性管理</p>
                                                </el-button>
                                            
                                                <el-button style="width:100px;height:90px;">
                                                    <i class="el-icon-s-data" style="font-size:48px;"></i> <p>数据管理</p>
                                                </el-button>
                                            
                                                <el-button style="width:100px;height:90px;">
                                                    <i class="el-icon-money" style="font-size:48px;"></i> <p>关系管理</p>
                                                </el-button>
                                            </p>
                                            <object data="/fs/assets/images/files/svg/configWorld.svg?type=open&issys=true" 
                                                type="image/svg+xml" style="width:40vw;height:40vh;background: #ffffff;">
                                            </object>
                                            <p>
                                                如有任何意见或建议，请及时反馈给我们。
                                                <el-link href="mailto:m3@wecise.com">Email：m3@wecise.com</el-link>
                                            </p>
                                            
                                        </div>
                                        <el-dialog title="导出" :visible.sync="dialog.omdbExport.show" v-if="dialog.omdbExport.show" width="60vw">
                                            <el-container style="height:55vh;">
                                                <el-header style="height:auto;line-height:40px;min-height:40px;background: #f2f2f2;">
                                                    <el-checkbox v-model="dialog.omdbExport.model.ifRelation" label="导出关系"></el-checkbox>
                                                    <el-checkbox v-model="dialog.omdbExport.model.ifData" label="导出数据" style="margin-left:20px;"></el-checkbox>
                                                    <p v-if="dialog.omdbExport.model.ifData">
                                                        <el-radio-group v-model="dialog.omdbExport.model.ifAllData">
                                                            <el-radio :label="true" border>导出所有数据</el-radio>
                                                            <el-radio :label="false" border>导出部分数据</el-radio>
                                                        </el-radio-group>
                                                        <el-input-number v-model="dialog.omdbExport.model.limit" v-if="!dialog.omdbExport.model.ifAllData && dialog.omdbExport.model.ifData != -1" style="width:30%;margin-left:10px;"></el-input-number>  
                                                    </p>
                                                    <el-checkbox v-model="dialog.omdbExport.model.ifCheckStrictly" label="节点关联" style="margin-left:20px;float:right;"></el-checkbox>
                                                </el-header>
                                                <el-main>
                                                    <el-tree
                                                        :data="dialog.omdbExport.classList"
                                                        ref="classTree"
                                                        show-checkbox
                                                        node-key="class"
                                                        :check-strictly="!dialog.omdbExport.model.ifCheckStrictly"
                                                        :default-expanded-keys="dialog.omdbExport.defaultExpandedKeys"
                                                        :props="dialog.omdbExport.defaultProps"
                                                        check-on-click-node="true"
                                                        style="background-color:transparent;">
                                                    </el-tree>
                                                </el-main>
                                                <el-footer style="line-height:60px;text-align:center;">
                                                    <el-button type="default" @click="dialog.omdbExport.show=false;">取消</el-button>
                                                    <el-button type="primary" @click="onExport('mql')" :loading="dialog.omdbExport['mql'].loading">导出MQL</el-button>
                                                    <el-button type="primary" @click="onExport('xlsx')" :loading="dialog.omdbExport['xlsx'].loading">导出Excel</el-button>
                                                </el-footer>
                                            </el-container>
                                        </el-dialog>
                                        <el-dialog title="导入" :visible.sync="dialog.omdbImport.show" v-if="dialog.omdbImport.show" width="60vw">
                                            <el-container style="height:55vh;">
                                                <el-main style="padding:10px;" v-if="!dialog.omdbImport.loading">
                                                    <div v-if="!_.isEmpty(dialog.omdbImport.rtnInfo)">
                                                        <el-button type="text" icon="el-icon-close" @click="dialog.omdbImport.rtnInfo = null;"></el-button>
                                                        <section>
                                                            <code>#{dialog.omdbImport.rtnInfo.message.join(",")}#</code>
                                                        </section>
                                                    </div>
                                                    <el-upload
                                                        class="upload-demo"
                                                        drag
                                                        :auto-upload="false"
                                                        :on-change="onImportChange"
                                                        :file-list="dialog.omdbImport.fileList"
                                                        v-else>
                                                        <i class="el-icon-upload"></i>
                                                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                                                        <div class="el-upload__tip" slot="tip">只能上传Mql/Excel文件</div>
                                                    </el-upload>
                                                </el-main>
                                                <el-main style="text-align:center;"  v-else>
                                                    <p style="padding-top:30px;">
                                                        <h2>正在导入，请稍后。。。</h2>
                                                    </p>
                                                </el-main>
                                                <el-footer style="line-height:60px;text-align:center;">
                                                    <el-button type="default" @click="dialog.omdbImport.show=false;">取消</el-button>
                                                    <el-button type="primary" @click="onImport" :loading="dialog.omdbImport.loading">导入</el-button>
                                                </el-footer>
                                            </el-container>
										</el-dialog>
                                    </el-main>
                                </el-container>`,
                    data: {
                        id: 'omdb',
                        main: {
                            tabs: [],
                            activeIndex: 'query'
                        },
                        dialog: {
                            omdbExport: {
                                show: false,
                                classList: null,
                                defaultExpandedKeys: [],
                                defaultProps: {
                                    children: 'children',
                                    label: 'class'
                                },
                                model: {
                                    ifCheckStrictly: true,
                                    ifRelation: true,
                                    ifData: false, 
                                    ifAllData: false,
                                    limit: 10,
                                    recursive: true,
                                    filetype: 'mql',
                                    template: true,
                                    class: '',
                                    ignoreClass: '/matrix/filesystem'
                                },
                                mql:{
                                    loading: false
                                },
                                xlsx: {
                                    loading: false
                                }
                            },
                            omdbImport: {
                                show: false,
                                fileList: [],
                                rtnInfo: null,
                                loading: false
                            }
                        },
                        control: {
                            alias: {
                                show: false
                            },
                            autosearch: {
                                show: false
                            }
                        }
                    },
                    watch:{
                        'dialog.omdbExport.model.ifData'(val,oldVal){
                            if(!val){
                                this.dialog.omdbExport.model.limit = 0;
                            }
                        },
                        'dialog.omdbExport.model.ifAllData'(val,oldVal){
                            if(val){
                                this.dialog.omdbExport.model.limit = -1;
                            }
                        }
                    },
                    created(){
                        // 初始化Tabs
                        this.main.tabs.push({title: this.$t('omdb.actions.query'), name: 'query', type: 'omdb-query-console', model: {node:null, pnode:null, pattern: 'select'}});
                    },
                    mounted() {
                        this.$nextTick(()=> {
                            this.init();
                        })
                    },
                    methods: {
                        init(){

                            this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                                sizes: [20, 80],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal',
                            });
                        },
                        mainTabsClick(tab, event) {
                            
                        },
                        mainTabsClose(key,tab){
                            const self = this;

                            if(key === 0){
                                self.mainTabsRemove(tab.name);
                            } else if( key === 1 ){
                                let others = _.xor(self.main.tabs,[tab]);
                                _.forEach(others,(v)=>{
                                    self.mainTabsRemove(v.name);
                                })
                            } else {
                                let others = self.main.tabs.slice(_.indexOf(self.main.tabs,tab) + 1, self.main.tabs.length);
                                _.forEach(others,(v)=>{
                                    self.mainTabsRemove(v.name);
                                })
                            }
                        },
                        mainTabsAdd(node){
                            // 已经打开
                            if(_.find(this.main.tabs,{name:node.name})){
                                this.main.activeIndex = node.name;
                                return false;
                            }

                            this.main.tabs.push(_.extend(node,{ name: [node.name,node.model.pattern,_.now()].join("-"), title: [node.title,node.model.pattern].join("-") }));
                            this.main.activeIndex = node.name;
                        },
                        mainTabsRemove(targetName){
                            
                            try{
                                let tabs = this.main.tabs;
                                let activeIndex = this.main.activeIndex;
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
                                
                                this.main.tabs = tabs.filter(tab => tab.name !== targetName);
                                this.main.activeIndex = activeIndex;
                                
                            } catch(err){
                                
                            } finally{
                                
                            }
                        },
                        classDataExport(selectedNode){

                            this.dialog.omdbExport.show = true;

                            if(!_.isEmpty(selectedNode)){
                                this.dialog.omdbExport.model.class = selectedNode;
                            }

                            fsHandler.callFsJScriptAsync("/matrix/omdb/getClassListForTree.js",encodeURIComponent(selectedNode)).then( (rtn)=>{
                                
                                this.dialog.omdbExport.classList = rtn.message;
                                this.dialog.omdbExport.defaultExpandedKeys = [_.first(this.dialog.omdbExport.classList).id];

                                fsHandler.callFsJScriptAsync("/matrix/omdb/getClassList.js",encodeURIComponent(this.dialog.omdbExport.model.class)).then( (rtn)=>{
                                    this.$refs.classTree.setCheckedKeys(rtn.message);
                                } ); 
                            } ) 

                        },
                        onExport(type){
                            
                            this.dialog.omdbExport.model.filetype = type;

                            this.dialog.omdbExport[type].loading = true;

                            //获取所有Class
                            fsHandler.callFsJScriptAsync("/matrix/omdb/getClassList.js",encodeURIComponent(this.dialog.omdbExport.model.class)).then( (rtn)=>{
                                let allNodes = rtn.message;

                                //checked Class
                                let checkedClass = _.map(this.$refs.classTree.getCheckedNodes(),'class');
                                
                                // 交集
                                _.extend(this.dialog.omdbExport.model, {ignoreClass: _.concat(this.dialog.omdbExport.model.ignoreClass,_.xor(allNodes,checkedClass)) } );

                                if(this.dialog.omdbExport.model.ifData){
                                    //this.model.limit = -1;
                                    this.dialog.omdbExport.model.template = false;
                                } else {
                                    this.dialog.omdbExport.model.template = true;
                                    // this.model.limit = 0;
                                }

                            } );

                            omdbHandler.classDataExportAsync(this.dialog.omdbExport.model).then((rtn)=>{
                                
                                if(rtn == 1){

                                    this.$message({
                                        type: "success",
                                        message: "导出成功！"
                                    })  

                                    this.dialog.omdbExport[type].loading = false;

                                    this.dialog.omdbExport.show = false;

                                } else{
                                    this.$message({
                                        type: "error",
                                        message: "导出失败: " + rtn
                                    })  
                                }

                            });
                        },
                        classDataImport(){
                            this.dialog.omdbImport.show = true;
                        },
                        onImportChange(file) {
                            this.dialog.omdbImport.fileList = [file.raw];
                        },
                        onImport(){
                            
                            this.dialog.omdbImport.loading = true;

                            this.$message({
                                type: "info",
                                message: "导入操作正在执行，请稍后。。。"
                            })

                            omdbHandler.classDataImportAsync(this.dialog.omdbImport.fileList[0]).then( (rtn) => {
                                
                                this.dialog.omdbImport.rtnInfo = JSON.parse(rtn);

                                if(rtn == 1){

                                    this.$message({
                                        type: "success",
                                        message: "导入成功！"
                                    })  

                                    this.dialog.omdbImport.loading = false;

                                    this.dialog.omdbImport.show = false;
                                } else{
                                    this.$message({
                                        type: "error",
                                        message: "导入失败: " + rtn
                                    })  
                                }

                            });
                        },
                        classPropsDirectory(){
                            
                            let wnd = null;

                            try{
                                if(jsPanel.activePanels.getPanel('jsPanel-class-template')){
                                    jsPanel.activePanels.getPanel('jsPanel-class-template').close();
                                }
                            } catch(error){

                            }
                            finally{
                                wnd = maxWindow.winClassTemplate('属性字典', `<div id="class-template-import"></div>`, null, null, null);
                            }

                            new Vue({
                                delimiters: ['#{', '}#'],
                                data:{
                                    tree: {
                                        data: [],
                                        defaultProps: {
                                            children: 'children',
                                            label: 'label'
                                        }
                                    },
                                    classObj:{
                                        // Class list
                                        list: [],
                                        // 当前选定prop对象
                                        prop: null,
                                        // 当前prop所在Clas分布
                                        propAtClass:{
                                            rows:[],
                                            columns:[]
                                        }
                                        
                                    }
                                },
                                template: `<el-container style="height:100%;">
                                                <el-header style="height:40px;line-height:40px;background:#f7f7f7;">
                                                    <el-button type="text" icon="el-icon-refresh" @click="onRefreshDirectory"></el-button>
                                                </el-header>
                                                <el-container style="height:calc(100% - 40px);">
                                                    <el-aside width="200px" style="height:100%;">
                                                        <el-tree :data="tree.data" 
                                                                :props="tree.defaultProps" 
                                                                @node-click="onNodeClick"  
                                                                default-expand-all
                                                                style="background: transparent;">
                                                            <span slot-scope="{ node, data }">
                                                                <i class="el-icon-folder" style="color:#f2cb34;" v-if="data.isParent"></i>
                                                                <i class="el-icon-bank-card" style="color:#409eff;" v-else></i>
                                                                <span v-if="data.children.length>0">#{ node.label }# (#{data.children.length}#)</span>
                                                                <span v-else>#{ node.label }#</span>
                                                            </span>
                                                        </el-tree>
                                                    </el-aside>
                                                    <el-container>
                                                        <el-main style="padding:10px;">
                                                            <h3 v-if="classObj.prop">#{classObj.prop.name}#</h3>
                                                            <el-divider></el-divider>
                                                            <el-form label-width="80px" label-position="top" v-if="classObj.prop">
                                                                <el-form-item label="名称">
                                                                    <el-input :value="classObj.prop.name"></el-input>
                                                                </el-form-item>
                                                                <el-form-item label="存储名称">
                                                                    <el-input :value="classObj.prop.colname"></el-input>
                                                                </el-form-item>
                                                                <el-form-item label="类型">
                                                                    <el-input :value="classObj.prop.ftype"></el-input>
                                                                </el-form-item>
                                                                <el-form-item label="所在类">

                                                                    <el-table :data="classObj.propAtClass.rows" 
                                                                            stripe 
                                                                            border
                                                                            show-overflow-tooltip 
                                                                            tooltip-effect="light" 
                                                                            style="width: 100%"
                                                                            height="100%">
                                                                        <el-table-column
                                                                            type="index"
                                                                            width="50">
                                                                        </el-table-column>
                                                                        <el-table-column type="expand">
                                                                            <template slot-scope="props">
                                                                                <el-container><el-main>
                                                                                    <el-form label-position="top" label-width="100px">
                                                                                        <el-form-item :label="k" :key="k" v-for="(v,k) in props.row">
                                                                                            <el-input type="textarea" :rows="6" v-if="typeof v == 'object'" :value="JSON.stringify(v,null,2)"></el-input>
                                                                                            <el-input :value="v" v-else>#{props.row[k]}#</el-input>
                                                                                        </el-form-item>
                                                                                    </el-form>
                                                                                </el-main></el-container>
                                                                            </template>
                                                                        </el-table-column>
                                                                        <el-table-column
                                                                            prop="Cid"
                                                                            label="cid"
                                                                            width="80">
                                                                        </el-table-column>
                                                                        <el-table-column
                                                                            prop="Name"
                                                                            label="类名称">
                                                                        </el-table-column>
                                                                        <el-table-column
                                                                            prop="Alias"
                                                                            label="类别名"
                                                                            width="160">
                                                                        </el-table-column>
                                                                        <el-table-column
                                                                            prop="colName"
                                                                            label="属性名称"
                                                                            width="160">
                                                                        </el-table-column>
                                                                    </el-table>
                                                                </el-form-item>
                                                            </el-form>  
                                                        </el-main>
                                                    </el-container>
                                                </el-container>
                                            </el-container>`,
                                created(){
                                    this.initTreeData();
                                },
                                methods:{
                                    onRefreshDirectory(){
                                        fsHandler.callFsJScriptAsync("/matrix/omdb/getClassListFromCache.js", encodeURIComponent('refresh-cache')).then( (rtn)=>{
                                            this.classObj.list = rtn.message;
                                        } );
                                    },
                                    initTreeData(){
                                        fsHandler.callFsJScriptAsync("/matrix/omdb/propsDirectory.js",null).then( (rtn)=>{
                                            this.tree.data = rtn.message;
                                        } );
                                        fsHandler.callFsJScriptAsync("/matrix/omdb/getClassListFromCache.js", encodeURIComponent('no-refresh')).then( (rtn)=>{
                                            this.classObj.list = rtn.message;
                                        } );
                                    },
                                    onNodeClick(tNode){
                                        this.classObj.propAtClass.rows = [];

                                        if(tNode.isParent){
                                            tNode.children = [];
                                            fsHandler.callFsJScriptAsync("/matrix/omdb/getPropsByName.js",encodeURIComponent(tNode.label)).then( (rtn)=>{
                                                tNode.children = rtn.message;
                                                _.extend(this.tree.data,tNode);
                                            } );
                                        } else {
                                            // 当前prop所在Class分布
                                            let propObj = _.filter(this.classObj.list,(v)=>{
                                                if(_.indexOf(v.Fields,tNode.label) != -1){

                                                    let colObj = _.find(v.Columns,(val)=>{ return val.name==tNode.label; });
                                                    this.classObj.propAtClass.rows.push(_.extend(v,{colName:colObj.name}));
                                                    
                                                    return v;
                                                }
                                            });
                                            
                                            // 当前prop所有定义
                                            let colObj = []; 
                                            _.forEach(propObj,(v)=>{
                                                let col = _.find(v.Columns,(val)=>{ return val.name==tNode.label; });
                                                colObj.push(col);
                                            });
                                            
                                            this.classObj.prop =   {
                                                                        name: tNode.label, 
                                                                        colname: colObj[0].colname,
                                                                        ftype:  colObj[0].ftype,
                                                                        prop: propObj  
                                                                    };

                                        }
                                    },
                                    onCancel(){
                                        wnd.close();
                                    }
                                }
                            }).$mount("#class-template-import");
                        }
                    }
                }).$mount("#app");

            })

        })
    }
}

let omdb = new Omdb();
omdb.init();