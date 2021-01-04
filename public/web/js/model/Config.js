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
class Config {

    constructor() {
        this.app = null;
    }

    init() {
        VueLoader.onloaded(["ai-robot-component"], function () {

            
            $(function () {
                
                Vue.component('config-tree',{
                    delimiters: ['#{', '}#'],
                    data(){
                        return {
                            defaultProps: {
                                children: 'nodes',
                                label: 'key'
                            },
                            treeData: [],
                            defaultExpandedKeys: ["/"],
                            filterText: "",
                            dialog:{
                                configNew: {
                                    show: false,
                                    parent: '',
                                    name: '',
                                    formItem: {
                                        key: '',
                                        value: '',
                                        ttl: null,
                                        ifDir: true,
                                    },
                                    data: null,
                                    loading: false
                                }
                            }
                        }
                    },
                    watch: {
                        filterText(val) {
                            if(_.isEmpty(val)){
                                this.initData();
                            } else {
                                this.$refs.tree.filter(val);
                            }
                        }
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:40px;line-height:40px;display:flex;">
                                        <el-input v-model="filterText" 
                                            placeholder="搜索"
                                            clearable></el-input>

                                            <el-dropdown placement="top-start" trigger="click">
                                                <el-tooltip content="导出、导入" open-delay="800">
                                                    <el-button type="text" icon="el-icon-menu" style="color:#333333;"></el-button>
                                                </el-tooltip>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item>
                                                        <label for="auto-file-upload" class="custom-file-upload" style="display: inline-block;padding: 6px 12px;cursor: pointer;">
                                                            <i class="el-icon-download"></i> 导入
                                                        </label>
                                                        <input id="auto-file-upload" type="file" @change="$root.configImport" required="required" style="display:none;" />
                                                    </el-dropdown-item>
                                                    <el-dropdown-item>
                                                        <el-button type="text" @click="$root.configExport"><i class="el-icon-upload2"></i> 导出</el-button>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                    </el-header>
                                    <el-main style="padding:0px 10px; height: 100%;overflow:auto;">
                                        <el-tree :data="treeData" 
                                                :props="defaultProps" 
                                                node-key="key"
                                                highlight-current
                                                accordion
                                                @node-click="onNodeClick"
                                                :filter-node-method="onNodeFilter"
                                                :expand-on-click-node="true"
                                                :default-expanded-keys="defaultExpandedKeys"
                                                style="background:transparent;"
                                                ref="tree">
                                            <span slot-scope="{ node, data }" style="width:100%;height:30px;line-height: 30px;"  @mouseenter="onMouseEnter(data)" @mouseleave="onMouseLeave(data)">
                                                <span v-if="data.dir">
                                                    <i class="el-icon-timer" style="color:#FFC107;" v-if="_.endsWith(node.label,'jobs')"></i>
                                                    <i class="el-icon-bank-card" style="color:#FFC107;" v-else-if="_.endsWith(node.label,'rules')"></i>
                                                    <i class="el-icon-s-platform" style="color:#FFC107;" v-else-if="_.endsWith(node.label,'hosts')"></i>
                                                    <i class="el-icon-lock" style="color:#FFC107;" v-else-if="_.endsWith(node.label,'lock')"></i>
                                                    <i class="el-icon-warning" style="color:#FFC107;" v-else-if="_.endsWith(node.label,'notify')"></i>
                                                    <i class="el-icon-folder" style="color:#FFC107;" v-else></i>
                                                    <span v-if="node.label=='/'">我的配置(#{data.nodes.length}#)</span>
                                                    <span v-else>#{ _.last(node.label.split("/")) }#(#{data.nodes.length}#)</span>
                                                    <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-more el-icon--right"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item @click.native="onRefresh(data)"icon="el-icon-refresh">刷新</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onNewFile(data)"icon="el-icon-plus" divided>新建</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onNewDir(data)"icon="el-icon-folder-add">新建目录</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onEditFile(data)"icon="el-icon-edit-outline" divided>编辑</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onExport(data)"icon="el-icon-download" divided>导出</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onDelete(data)" icon="el-icon-delete" divided>删除</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                    </el-dropdown>
                                                </span>
                                                <span v-else>
                                                    <i class="el-icon-c-scale-to-original" style="color:#0088cc;"></i>
                                                    <span>#{ _.last(node.label.split("/")) }#</span>
                                                    <el-dropdown v-show="data.show" style="float:right;width:14px;margin:0 5px;">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-more el-icon--right"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item @click.native="onEditFile(data)"icon="el-icon-edit-outline">编辑</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onNewFile(data)"icon="el-icon-plus" divided>新建</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onNewDir(data)"icon="el-icon-folder-add">新建目录</el-dropdown-item>
                                                            <el-dropdown-item @click.native="onDelete(data)" icon="el-icon-delete" divided>删除</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                    </el-dropdown>
                                                    <el-tooltip content="编辑" open-delay="800">
                                                        <el-button v-show="data.show" type="text" @click.stop="onEditFile(data)" icon="el-icon-edit-outline" style="float:right;width:14px;margin:0 5px;"></el-button>
                                                    </el-tooltip>
                                                </span>
                                            </span>  
                                        </el-tree>
                                        <el-dialog :title="dialog.configNew.formItem.ifDir?'新增目录':'新增配置'" 
                                            :visible.sync="dialog.configNew.show" 
                                            v-if="dialog.configNew.show">
                                            <el-container>
                                                <el-main style="padding:0px 20px;height:100%;overflow:auto;">
                                                    <el-form label-width="80">
                                                        <el-form-item label="位置" prop="parent">
                                                            <el-input v-model="dialog.configNew.parent" placeholder="位置" :disabled="true"></el-input>
                                                        </el-form-item>
                                                        <el-form-item label="名称" prop="name">
                                                            <el-input v-model="dialog.configNew.name" :placeholder="dialog.configNew.formItem.ifDir?'目录名称':'配置名称'" autofocus="true"></el-input>
                                                        </el-form-item>
                                                        <el-form-item :label="dialog.configNew.formItem.ifDir?'目录':'配置'">
                                                            <el-switch v-model="dialog.configNew.formItem.ifDir"
                                                                active-color="#13ce66"
                                                                :active-value="true"
                                                                :inactive-value="false"></el-switch>
                                                        </el-form-item>
                                                        <el-form-item label="TTL" prop="ttl">
                                                            <el-input v-model="dialog.configNew.formItem.ttl" placeholder="TTL"></el-input>
                                                        </el-form-item>
                                                        <el-form-item label="值" prop="value">
                                                            <el-input v-model="dialog.configNew.formItem.value" type="textarea" placeholder="配置内容"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-main>
                                                <el-footer style="text-align:right;">
                                                    <el-button type="default" @click="dialog.configNew.show = false;">取消</el-button>
                                                    <el-button type="primary" @click="onConfigSave" :loading="dialog.configNew.loading">提交</el-button>
                                                </el-footer>
                                            </el-container>
                                        </el-dialog> 
                                    </el-main>
                                </el-container>`,
                    created(){
                        this.initData();
                    },
                    methods: {
                        initData(){
                            if(window.SignedUser_IsAdmin && window.COMPANY_OSPACE=='matrix'){
                                configHandler.configGetAsync("/").then( (rtn)=>{
                                    this.treeData = [rtn];
                                } );
                            } else {
                                configHandler.configGetAsync("/"+window.COMPANY_OSPACE).then( (rtn)=>{
                                    this.treeData = [rtn];
                                } );
                            }
                        },
                        onMouseEnter(item){
                            this.$set(item, 'show', true)
                            this.$refs.tree.setCurrentKey(item.key);
                        },
                        onMouseLeave(item){
                            this.$set(item, 'show', false)
                        },
                        onNodeFilter(value, data) {
                            if(!value) return true;
                            
                            return data.key.indexOf(value) !== -1;
                        },
                        onCollapseAll(){
                            _.forEach(this.$refs.tree.store._getAllNodes(), (v,k)=>{
                                this.$set(v, 'expanded', false);
                            })
                        },                      
                        onRefresh(data){
                            configHandler.configGetAsync(data.key).then( (rtn)=>{
                                this.$set(data, 'nodes', rtn.nodes);
                            } );
                        },
                        onNodeClick(data){
                            
                            this.$root.configTreeSelectedNode = data;
                            
                            this.onRefresh(data);

                        },
                        onDelete(data, index){
                            
                            let item = data;
                            let parent = this.$refs.tree.getNode(data.key).parent.data;

                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要删除以下配置`, 
                                    message: h('span', null, [
                                        h('p', null, `位置：${item.key}`),
                                        h('p', null, `值：${_.truncate(item.value)}`),
                                        h('p', null, `TTL：${  _.isUndefined(item.ttl) ? '' : item.ttl }`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                configHandler.configDeleteAsync(item).then( (rtn)=>{
                                    if(rtn == 1){
                                        // 刷新
                                        this.onRefresh(parent);
                                        
                                        // 关闭Tab
                                        this.$root.configClose(item.key);
                                    }
                                } );

                            }).catch(() => {
                                    
                            }); 

                        },
                        onNewFile(data){

                            this.dialog.configNew.formItem.ifDir = false;
                            this.dialog.configNew.data = data;
                            this.dialog.configNew.parent = data.key || '/';
                            
                            this.dialog.configNew.show = true;
                            
                        },
                        onNewDir(data){
                            
                            this.dialog.configNew.formItem.ifDir = true;
                            this.dialog.configNew.data = data;
                            this.dialog.configNew.parent = data.key || '/';

                            this.dialog.configNew.show = true;
                        },
                        onEditFile(data){

                            configHandler.configGetAsync(data.key).then( (rtn)=>{
                                this.$root.configOpen(rtn);
                            } );
                        },
                        onResetConfig(){
                            
                            this.dialog.configNew.parent = '';
                            this.dialog.configNew.name = '';
                            this.dialog.configNew.data = null;
                            this.dialog.configNew.formItem.key = '';
                            this.dialog.configNew.formItem.value = '';
                            this.dialog.configNew.formItem.ttl = null;
                            this.dialog.configNew.formItem.ifDir = true;

                        },
                        onExport(data){
                            
                            this.$confirm(`确认要导出 ${data.key} 下的配置?`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                
                                configHandler.configExport(data.key,this);
                                
                            }).catch(() => {
                                
                            });
                        },  
                        onConfigSave(){
                            

                            if(_.isEmpty(this.dialog.configNew.name)){
                                this.$message({
                                    type: "warning",
                                    message: "配置名称不能为空！"
                                })
                                return false;
                            }

                            this.dialog.configNew.loading = true;
                            
                            this.dialog.configNew.formItem.key = [this.dialog.configNew.parent, this.dialog.configNew.name].join("/").replace(/\/\//g,'/');
                            
                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要添加以下配置`, 
                                    message: h('span', null, [
                                        h('p', null, `位置：${this.dialog.configNew.formItem.key}`),
                                        h('p', null, `值：${_.truncate(this.dialog.configNew.formItem.value)}`),
                                        h('p', null, `TTL：${ this.dialog.configNew.formItem.ttl ? this.dialog.configNew.formItem.ttl : ''}`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                configHandler.configAddAsync(this.dialog.configNew.formItem).then( (rtn)=>{
                                    if(rtn == 1){
                                        this.$message({
                                            type: "success",
                                            message: "保存成功！"
                                        })
                                        
                                        // 刷新
                                        this.onRefresh(this.dialog.configNew.data);

                                        this.onResetConfig();
                                        
                                        this.dialog.configNew.show = false;


                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "保存失败：" + rtn
                                        })
                                    }

                                    this.dialog.configNew.loading = false;
                                } );

                            }).catch(() => {
                                this.dialog.configNew.loading = false;
                            }); 

                        },
                    }
                })

                // 调试
                Vue.component('config-debug-console',{
                    delimiters: ['#{', '}#'],
                    props: {
                        rule: String
                    },
                    template:   `<el-container style="height:calc(100% - 70px);">
                                    <el-header style="height:30px;line-height:30px;text-align:right;">
                                        <el-tooltip content="重置测试内容" open-delay="800">
                                            <el-button type="text" @click="onReset" icon="el-icon-refresh"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="发送测试内容" open-delay="800">
                                            <el-button type="text" @click="onSubmit" icon="el-icon-s-promotion"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="文件类型" open-delay="800">
                                            <el-dropdown @command="onHandleCommand" trigger="click" style="margin-left:10px;">
                                                <span class="el-dropdown-link">
                                                    <i class="el-icon-document"></i>
                                                </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item :command="item.name" v-for="item in mode">#{item.name}#</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main style="background:#f2f2f2;" ref="debugEditor">
                                    </el-main>
                                </el-container>`,
                    data(){
                        return {
                            editor: null,
                            mode: null
                        }
                    },
                    created(){
                        fsHandler.callFsJScriptAsync("/matrix/config/modeList.js",null).then( (rtn)=>{
                            this.mode = rtn.message;
                        } );
                    },
                    mounted() {
                        this.initEditor();
                    },
                    methods:{
                        initEditor(){
                            
                            //初始化对象
                            this.editor = ace.edit(this.$refs.debugEditor.$el);
                            this.editor.setOptions({
                                maxLines: 30,
                                minLines: 20,
                                autoScrollEditorIntoView: true,
                                enableBasicAutocompletion: true,
                                enableSnippets: true,
                                enableLiveAutocompletion: true
                            });

                            //设置风格和语言（更多风格和语言，请到github上相应目录查看）
                            this.editor.setTheme("ace/theme/tomorrow");
                            this.editor.session.setMode("ace/mode/csv");

                            //字体大小
                            this.editor.setFontSize(12);

                            //自动换行,设置为off关闭
                            this.editor.setOption("wrap", "free")
                            
                        },
                        onReset(){
                            this.editor.setValue("");
                            this.editor.resize();
                        },
                        onSubmit(){
                            let debug = this.editor.getValue();
                            
                            if( this.editor.getSelectedText().length > 0 ) {
                                debug = this.editor.getSelectedText();
                            }

                            if(debug.length < 1){
                                this.$message({
                                    type:"info",
                                    message: "请输入调试信息"
                                })
                                return false;
                            }

                            let term = encodeURIComponent(JSON.stringify(_.extend({},{rule:this.rule, term: debug})));
                            fsHandler.callFsJScriptAsync("/matrix/config/forwardDebug.js",term).then( (rtn)=>{
                                if(rtn.status = 'ok'){
                                    eventHub.$emit("CONFIG-LOG-UPDATE-EVENT");
                                }
                            } );
                            
                        },
                        onHandleCommand(cmd){
                            this.editor.session.setMode("ace/mode/"+cmd);
                        }
                    }
                })

                // 数据
                Vue.component('config-data-console',{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        //class名称
                        model: Object
                    },
                    template:   `<el-container>
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-tooltip content="清空" open-delay="800">
                                            <el-button type="text" @click="onReset"><i class="fas fa-trash"></i></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="重新加载" open-delay="800">
                                            <el-button type="text" @click="onLoad"><i class="fas fa-sync"></i></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="默认只删除对象数据，勾选此项同时删除版本数据。" open-delay="800">
                                            <el-checkbox v-model="ifDeleteVersionData" style="height: 35px;line-height: 35px;float:right;">删除版本数据</el-checkbox>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main style="padding: 20px;height:100%;">
                                        <el-table :data="rows" 
                                                style="width: 100%" 
                                                height="100%"
                                                stripe 
                                                :default-sort="{prop: 'vtime', order: 'descending'}" 
                                                :row-class-name="rowClassName"
                                                :header-cell-style="headerRender"
                                                @selection-change="handleSelectionChange"
                                                fit="true">
                                            <el-table-column type="selection" width="55"></el-table-column>
                                            <el-table-column :label="item.title" 
                                                            :prop="item.data" 
                                                            v-for="item in columns" 
                                                            :formatter="item.render"
                                                            v-if="item.visible">
                                            </el-table-column>
                                            <!--el-table-column align="right">
                                                <template slot="header" slot-scope="scope">
                                                    <el-input size="mini" placeholder="输入关键字搜索"/>
                                                </template>
                                            </el-table-column-->
                                        </el-table>
                                    </el-main>
                                </el-container>`,
                    data(){
                        return {
                            rows: [],
                            columns: [],
                            selectedRows: [],
                            ifDeleteVersionData: false
                        }
                    },
                    created(){
                        
                        fsHandler.callFsJScriptAsync("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).then( (val)=>{
                            let rtn = val.message;

                            this.rows = rtn.rows;
                            this.columns = _.map(rtn.columns,function(v){
                                                if(v.render){
                                                    v.render = eval(v.render);
                                                }
                                                return v;
                                            });
                        } );

                        // 更新DataTable
                        eventHub.$on("CONFIG-LOG-UPDATE-EVENT",()=>{
                            fsHandler.callFsJScriptAsync("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).then( (val)=>{
                                let rtn = val.message;
                                this.rows = rtn.rows;
                            } );
                        })
                    },
                    methods:{
                        rowClassName({row, rowIndex}){
                            return `row-${rowIndex}`;
                        },
                        headerRender({ row, column, rowIndex, columnIndex }){
                            if (rowIndex === 0 && columnIndex !== 0) {
                                //return 'text-align:right;';
                            }
                        },
                        onReset(){
                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要删除下列数据`, 
                                    message: h( 'span', null, _.map(this.selectedRows, (v)=>{ return h('p',null, v.id); }) ),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                let item = {class:"/matrix/", ids: _.map(this.selectedRows,'id').join("', '"), ifDeleteVersionData: this.ifDeleteVersionData};
                                fsHandler.callFsJScriptAsync("/matrix/config/action-by-delete.js",encodeURIComponent(JSON.stringify(item))).then( (val)=>{
                                    fsHandler.callFsJScript("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).then( (val)=>{
                                        let rtn = val.message;
                                        this.rows = rtn.rows;
                                    } );
                                } )

                            }).catch(() => {
                                    
                            }); 
                            
                        },
                        onLoad(){
                            fsHandler.callFsJScript("/matrix/config/data-by-name.js", encodeURIComponent(this.model.name)).then( (val)=>{
                                let rtn = val.message;
                                this.rows = rtn.rows;
                            } );
                        },
                        handleSelectionChange(val) {
                            this.selectedRows = val;
                        }
                    }
                })
    
                Vue.component('config-manage',{
                    delimiters: ['#{', '}#'],
                    props: {
                        id: String,
                        model: Object
                    },
                    template: ` <el-container style="height:calc(100vh - 174px);">
                                    <el-main ref="mainView" :style="'height:'+mainHeight+'%;'">
                                        <div class="config-value" ref="editorContainer" :model="model" style="border:none;border-top:1px solid #f5f5f5;border-bottom:1px solid #f5f5f5;height:100%"></div>
                                        <div class="config-status-footer" ref="editorStatus" style="line-height: 30px;padding: 0px 15px;background: #f2f2f2;"></div>
                                    </el-main>
                                    <el-footer :style="'padding:0px;height:'+footerHeight+'%;'" ref="footerView">
                                        <el-tabs v-model="debug.tabs.activeIndex" type="border-card" closable @tab-remove="logClose" @tab-click="handleClick">
                                            <el-tab-pane name="log" style="padding:10px;">
                                                <span slot="label">日志 <i class="el-icon-date"></i></span>
                                                <mx-consolelog :fullname="id" logType="rule" v-if="!_.isEmpty(id)" ref="configLogConsoleRef"></mx-consolelog> 
                                            </el-tab-pane>
                                            <el-tab-pane label="测试" name="debug" style="padding:10px;">
                                                <config-debug-console :rule="id"></config-debug-console>
                                            </el-tab-pane>
                                            <el-tab-pane label="数据" name="data" style="padding:10px;">
                                                <config-data-console :id="id" :model="classModel"></config-data-console>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-footer>
                                </el-container>`,
                    data() {
                        return {
                            editor: null,
                            ignore: false,
                            changed: false,
                            mode: "toml",
                            etcd: {
                                key: null,
                                value: null,
                                ttl: null,
                                isDir: true
                            },
                            cid: "",
                            splitInst: null,
                            mainHeight: '80',
                            footerHeight: '20',
                            ifLog: false,
                            debug:{
                                tabs: {
                                    list: [],
                                    activeIndex: 'log'
                                }
                            },
                            classModel: {}
                        }
                    },
                    watch: {
                        ifLog: {
                            handler:function(val,oldVal){
                                if(val){
                                    this.splitInst.setSizes([50,50]);
                                } else {
                                    this.splitInst.setSizes([100,0]);
                                }
                            }
                        }
                    },
                    created(){
                        
                        if(_.startsWith(this.model.key,"/matrix/rules")){
                            this.mode = "lua";
                        }
                        this.cid = objectHash.sha1(this.id);
                        try{
                            let name = _.trim(_.split(_.first(this.model.value.match(/^--class.*/mgi)),"=",2)[1]);
                            _.extend(this.classModel, {name:name});
                        } catch(err){
                            _.extend(this.classModel, {name:""});
                        }
                        
                    },
                    mounted(){
                        
                        // 选择节点
                        if(_.has(this.model,'key')){
                            this.initEditer();
                            this.initSplit();
                        }
                        
                    },
                    methods: {
                        initEditer(){
                            
                            this.langTools = ace.require("ace/ext/language_tools");
                            this.editor = ace.edit(this.$refs.editorContainer);
                            ace.require('ace/ext/settings_menu').init(this.editor);
                            let StatusBar = ace.require("ace/ext/statusbar").StatusBar;
                            let statusBar = new StatusBar(this.editor, this.$refs.editorStatus);
    
                            this.editor.setOptions({
                                minLines: 10,
                                autoScrollEditorIntoView: true,
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true
                            });
                            this.editor.commands.addCommands([{
                                name: "showSettingsMenu",
                                bindKey: {
                                    win: "Ctrl-9",
                                    mac: "Command-9"
                                },
                                exec: (editor)=> {
                                    this.editor.showSettingsMenu();
                                },
                                readOnly: true
                            }]);
                            this.editor.$blockScrolling = Infinity;
                            this.editor.setTheme("ace/theme/tomorrow");
                            this.editor.getSession().setMode(`ace/mode/${this.mode}`);
                            this.editor.getSession().setTabSize(2);
                            this.editor.getSession().setUseWrapMode(true);

                            this.editor.on('mousemove', ()=> {
                                this.editor.resize();
                            });

                            this.editor.on("input", ()=> {
                                    
                                if(this.changed) {
                                    
                                    if(!_.includes(this.$root.control.save.lis, this.model.key)){
                                        this.$root.control.save.list.push(this.model.key);
                                    }
                                }

                            });
                            this.editor.on('change', ()=> {

                                if (!this.ignore) {
                                    this.changed = true;
                                    this.$emit('update:change',this.changed);
                                }
                            });

                            /* 根据mode获取snippets */
                            try {
                                let snippetManager = ace.require("ace/snippets").snippetManager;
                                let className = _.trim(_.split(_.first(this.model.value.match(/^--class.*/mgi)),"=",2)[1]);    
                                
                                if(!_.isEmpty(className)){
                                    let term = encodeURIComponent(JSON.stringify( {mode:this.mode, class:className} ));

                                    fsHandler.callFsJScriptAsync("/matrix/config/snippets.js",term).then( (val)=>{
                                        let snippetText = val.message;
                                        snippetManager.register(snippetText, this.mode);
                                    } );
                                }

                            } catch(err){

                            }
                            
                            // Add commands
                            this.editor.commands.addCommand(
                                {
                                    name: "save",
                                    bindKey: {
                                        mac: "cmd-S", 
                                        win: "ctrl-S",
                                        sender: 'editor|cli'
                                    },
                                    exec: (env, args, request)=> {
                                        this.$root.configUpdate();
                                    }
                                },
                                {    
                                    name: "fullscreen",   
                                    bindKey: {
                                        win: "ctrl-enter", 
                                        mac: "cmd-enter",
                                        sender: 'editor|cli'
                                    },   
                                    exec: function(editor) {        
                                        var vp = cantkGetViewPort();        
                                        if(editor.isFullScreen) {            
                                            div.style.width = editorW + "px";            
                                            div.style.height = editorH + "px";            
                                            div.style.position = "absolute";           
                                            div.style.left = editorX + "px";            
                                            div.style.top = (scrollTop + editorY) + "px";            
                                            editor.resize();            
                                            editor.isFullScreen = false;            
                                            document.body.style.overflow = "auto";        
                                        } else {            
                                            div.style.width = vp.width+ "px";            
                                            div.style.height = vp.height+ "px";            
                                            div.style.position = "absolute";            
                                            div.style.left = 0 + "px";            
                                            div.style.top = (scrollTop + 0) + "px";            
                                            editor.resize();            
                                            editor.isFullScreen = true;            
                                            document.body.style.overflow = "hidden";        
                                        }    
                                    }
                                }
                            );

                            // Customer Auto Completer
                            if(mx.searchJson){
                                let customerCompleter = {
                                    getCompletions(editor, session, pos, prefix, callback) {
                                        
                                        if (prefix.length === 0) { callback(null, []); return };

                                        let templates = mx.searchJson.search(prefix);

                                        if(_.isEmpty(templates)) return;

                                        callback(null, _.uniqBy(_.map(templates,(v)=> {
                                            return {
                                                name: v.name,
                                                score: 1000,
                                                meta: v.title,
                                                caption: v.title,
                                                value: v.template,
                                                className: "btn btn-danger"
                                            }
                                        }),'name'));

                                    }
                                };

                                this.langTools.addCompleter(customerCompleter);
                            }
                            
                            // 设置value
                            if(_.has(this.model,'value')){
                                // 判断是否为JSON 格式化用
                                if(_.first(this.model.value) === "{" && _.last(this.model.value) === "}"){
                                    this.etcd.value = JSON.stringify(JSON.parse(this.model.value),null,2);
                                } else {
                                    this.etcd.value = this.model.value;
                                }
                                
                            } else {
                                this.etcd.value = "";
                            }

                            this.setEditor();
                        },
                        setEditor() {
                            
                            // key
                            this.etcd.key = _.has(this.model,'key')?this.model.key:[];

                            // 如果value is null
                            if(!this.etcd.value) return false;
                            this.ignore = true;
                            this.editor.setValue(this.etcd.value);
                            this.editor.setValue(this.editor.getValue(), 1);
                            this.ignore = false;
                            /*this.editor.getSession().on('change', function() {
                                $(".config-editor-save").css("display", "");
                            });*/
                        },
                        initSplit(){
                            this.splitInst = Split([this.$refs.mainView.$el, this.$refs.footerView.$el], {
                                sizes: [100, 0],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'vertical',
                                onDragEnd:(sizes)=> {
                                    this.mainHeight = sizes[0];
                                    this.footerHeight = sizes[1];
                                }
                            });
                        },
                        logClose(){
                            this.splitInst.setSizes([100,0]);
                        },
                        handleClick(tab,event){
                            eventHub.$emit("CONFIG-LOG-UPDATE-EVENT");
                        }
                    }
                })
    
                let main = {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container style="height: calc(100vh - 85px);background-color:#f2f2f2;">
                                    
                                    <el-main style="padding:0px;">
                                        <el-container style="height:100%;">
                                            <el-aside style="background-color:#f2f2f2!important;overflow:hidden;" ref="leftView" v-show="control.configTree.show">
                                                <config-tree ref="configTree"></config-tree>
                                            </el-aside>
                                            <el-container ref="mainView">
                                                <el-header style="height: 35px;line-height: 35px;background:#f2f2f2;border-bottom:1px solid #dddddd; padding: 0px 10px 0px 0px;">
                                                    
                                                    <el-tooltip content="切换视图" open-delay="800" placement="top">
                                                        <el-button type="text" @click="onTogglePanel">
                                                            <span :class="control.configTree.show?'el-icon-s-fold':'el-icon-s-unfold'" style="font-size:17px;"></span>
                                                        </el-button>
                                                    </el-tooltip>

                                                    <el-tooltip content="保存" open-delay="800">
                                                        <el-button type="text" @click="configUpdate" v-if="control.save.show && !_.isEmpty(configTabs.tabs)">
                                                            <i class="far fa-save" style="color:#009688;font-size:15px;"><i>
                                                        </el-button>
                                                    </el-tooltip>
                                                    
                                                    <el-tooltip content="主题" open-delay="800">
                                                        <el-button type="text" 
                                                            :class="'editor-select-theme-'+objectHash.sha1(configTabs.activeIndex)" 
                                                            v-show="!_.isEmpty(configTabs.tabs)" 
                                                            icon="fas fa-tshirt"
                                                            style="float:right;"></el-button>
                                                    </el-tooltip>
                                                </el-header>
                                                <el-main style="padding:0px;position: relative;">                            
                                                    <el-tabs v-model="configTabs.activeIndex" type="border-card" closable @tab-remove="configClose" v-if="!_.isEmpty(configTabs.tabs)">
                                                        <el-tab-pane :key="item.name" :name="item.name" v-for="item in configTabs.tabs">
                                                            <span slot="label" v-if="item.dir">
                                                                <i class="el-icon-folder-opened" style="color:#ff0000;" v-if="_.includes(control.save.list,item.name)"></i>
                                                                <i class="el-icon-folder-opened" style="color:#409eff;" v-else></i> #{item.title}#
                                                                <el-dropdown trigger="click">
                                                                    <span class="el-dropdown-link">
                                                                        <i class="el-icon-arrow-down"></i>
                                                                    </span>
                                                                    <el-dropdown-menu slot="dropdown">
                                                                        <el-dropdown-item @click.native="configCopy(item.name)" :class="'copy'+objectHash.sha1(item.name)">复制</el-dropdown-item>
                                                                        <el-dropdown-item divided @click.native="configDegug(item.name)">调试</el-dropdown-item>
                                                                        <el-dropdown-item @click.native="tabClose(0,item)" divided>关闭</el-dropdown-item>
                                                                        <el-dropdown-item @click.native="tabClose(1,item)">关闭其它标签页</el-dropdown-item>
                                                                        <el-dropdown-item @click.native="tabClose(2,item)">关闭右侧标签页</el-dropdown-item>
                                                                    </el-dropdown-menu>
                                                                </el-dropdown>
                                                            </span>
                                                            <span slot="label" v-else>
                                                                <i class="el-icon-document" style="color:#ff0000;" v-if="_.includes(control.save.list,item.name)"></i>
                                                                <i class="el-icon-document" style="color:#409eff;" v-else></i> #{item.title}#
                                                                <el-dropdown trigger="click">
                                                                    <span class="el-dropdown-link">
                                                                        <i class="el-icon-arrow-down"></i>
                                                                    </span>
                                                                    <el-dropdown-menu slot="dropdown">
                                                                        <!--el-dropdown-item @click.native="configCopy(item.name)" :class="'copy'+objectHash.sha1(item.name)">复制</el-dropdown-item-->
                                                                        <el-dropdown-item @click.native="configDegug(item.name)">调试</el-dropdown-item>
                                                                        <el-dropdown-item @click.native="tabClose(0,item)" divided>关闭</el-dropdown-item>
                                                                        <el-dropdown-item @click.native="tabClose(1,item)">关闭其它标签页</el-dropdown-item>
                                                                        <el-dropdown-item @click.native="tabClose(2,item)">关闭右侧标签页</el-dropdown-item>
                                                                    </el-dropdown-menu>
                                                                </el-dropdown>
                                                            </span>
                                                            <config-manage :id="item.name" :model="item.model" :ref="'configManageRef'+objectHash.sha1(item.name)" @update:change="(v)=>{control.save.show=v;}"></config-manage>
                                                        </el-tab-pane>
                                                    </el-tabs>
                                                    
                                                    <div style="background:#ffffff;padding:20px;height:100%;display:block;text-align:center;" v-else>
                                                        <h2 style="margin: 0px 0px 40px 0px;">欢迎使用配置管理</h2>
                                                        <p>
                                                            
                                                            <el-button style="width:100px;height:90px;" @click="onToggleKey('etc')">
                                                                <i class="el-icon-money" style="font-size:48px;"></i> <p>全局配置</p>
                                                            </el-button>

                                                            <el-button style="width:100px;height:90px;" @click="onToggleKey('hosts')">
                                                                <i class="el-icon-office-building" style="font-size:48px;"></i> <p>服务器组管理</p>
                                                            </el-button>
                                                            
                                                            <el-button style="width:100px;height:90px;" @click="onToggleKey('jobs')">
                                                                <i class="el-icon-postcard" style="font-size:48px;"></i> <p>作业定义</p>
                                                            </el-button>
                                                        
                                                            <el-button style="width:100px;height:90px;" @click="onToggleKey('rules')">
                                                                <i class="el-icon-s-data" style="font-size:48px;"></i> <p>规则管理</p>
                                                            </el-button>

                                                            <el-button style="width:100px;height:90px;" @click="onToggleKey('locks')">
                                                                <i class="el-icon-lock" style="font-size:48px;"></i> <p>全局锁</p>
                                                            </el-button>

                                                            <el-button style="width:100px;height:90px;" @click="onToggleKey('notify')">
                                                                <i class="el-icon-warning-outline" style="font-size:48px;"></i> <p>通知设置</p>
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

                                                </e-main>
                                            </el-container>
                                        </el-container>
                                    </el-main>
                                    <el-footer style="height: 30px;line-height: 30px;padding: 0 10px;">
                                        <i class="el-icon-user"></i> #{window.SignedUser_UserName}#    <i class="el-icon-timer"></i> #{moment().format(mx.global.register.format)}# </Footer>
                                    </el-footer>
                                    
                                </el-container>`,
                    data: {
                        splitInst: null,
                        configTabs: {
                            tabs:[],
                            activeIndex: '',
                        },
                        control: {
                            configTree: {
                                show: false
                            },
                            save: {
                                show: false,
                                list: []
                            }
                        },
                        configTreeSelectedNode:{}
                    },
                    watch:{
                        'configTabs.tabs'(val,oldVal){
                            if(_.isEmpty(val)){
                                this.control.save.show = false;
                            }
                        }
                    },
                    created() {
                        // 默认边栏显示状态
                        this.control.configTree.show = (localStorage.getItem("CONFIG-TREE-IFSHOW") == 'true');
                    },
                    mounted() {
                        
                        this.$nextTick(()=>{
                            this.initSplit();
                        })
                        
                    },
                    methods: {
                        initSplit(){
                            this.splitInst = Split([this.$refs.leftView.$el, this.$refs.mainView.$el], {
                                sizes: [25, 75],
                                minSize: [0, 0],
                                gutterSize: 5,
                                cursor: 'col-resize',
                                direction: 'horizontal'
                            });
                        },
                        onToggleKey(key){
                            
                            this.control.configTree.show = true;
                            
                            let keyPath = ["",window.COMPANY_OSPACE,key].join("/");
                            
                            this.$refs.configTree.defaultExpandedKeys.push(keyPath);
                            this.$refs.configTree.onCollapseAll();
                            this.$refs.configTree.$refs.tree.setCurrentKey(keyPath);
                        },
                        onTogglePanel(){
							this.control.configTree.show = !this.control.configTree.show;

                            localStorage.setItem("CONFIG-TREE-IFSHOW",this.control.configTree.show);
						},
                        tabClose(key,tab){
                            const self = this;

                            if(key === 0){
                                self.configClose(tab.name);
                            } else if( key === 1 ){
                                let others = _.xor(self.configTabs.tabs,[tab]);
                                _.forEach(others,(v)=>{
                                    self.configClose(v.name);
                                })
                            } else {
                                let others = self.configTabs.tabs.slice(_.indexOf(self.configTabs.tabs,tab) + 1, self.configTabs.tabs.length);
                                _.forEach(others,(v)=>{
                                    self.configClose(v.name);
                                })
                            }
                        },
                        configImport(event){
                            
                            let file = event.target.files[0];
                            const h = this.$createElement;

                            this.$msgbox({
                                    title: `确认要导入配置`, 
                                    message: h('span', null, [
                                        h('p', null, `文件名称：${file.name}`),
                                        h('p', null, `修改时间：${file.lastModifiedDate}`),
                                        h('p', null, `文件大小：${mx.bytesToSize(file.size)}`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                let rtn = configHandler.configImport(file,null);

                                if(rtn == 1){
                                    eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", '/');
                                }

                            }).catch(() => {
                                    
                            }); 
                                        
                        },
                        configExport(){
                            
                            this.$confirm(`确认要导出所有配置?`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
                                configHandler.configExport(this.configTreeSelectedNode.key,this);
                                
                            }).catch(() => {
                                
                            });

                        },
                        configOpen(treeNode){
                            
                            this.configTreeSelectedNode = treeNode;

                            try {
                                let id = treeNode.key;//tId;
                                //if(this.configTabs.activeIndex === id) return false;
                                // 已经打开
                                if(_.find(this.configTabs.tabs,{name:id})){
                                    this.configTabs.activeIndex = id;
                                    return false;
                                }
                                
                                // 添加tab
                                this.configTabs.activeIndex = id;
                                this.configTabs.tabs.push({dir: treeNode.dir, title: treeNode.key, name: id, type: 'config', model: treeNode});                                

                                this.initTheme();
                            } catch(error){
                                this.configTabs.tabs = [];
                            }
                        },
                        configClose(targetName){
                            const self = this;

                            let closeFun = function(){
                                let tabs = self.configTabs.tabs;
                                let activeIndex = self.configTabs.activeIndex;
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
                                
                                self.configTabs.activeIndex = activeIndex;
                                self.configTabs.tabs = tabs.filter(tab => tab.name !== targetName);

                                // 重置是否编辑状态
                                self.control.save.list = _.xor(self.control.save.list, [targetName]);
                            }

                            if(_.includes(this.control.save.list, targetName)) {

                                this.$confirm(`${targetName} 已修改，确认是否保存`, '提示', {
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                                }).then(() => {
                                    
                                    this.onConfigSave();
                                    
                                }).catch(() => {
                                    
                                    closeFun();
                                    
                                });
                            } else {
                                closeFun();
                            }

                            
                        },
                        initTheme: function(){
                            let id = objectHash.sha1(this.configTabs.activeIndex);
                            
                            $.contextMenu({
                                selector: `.editor-select-theme-${id}`,
                                trigger: 'left',
                                callback: (key, options)=> {
                                    if(key !== 'bright' && key !== 'dark'){
                                        let editor = ace.edit(this.$refs[`configManageRef${id}`][0].$refs.editorContainer);
                                        editor.setTheme("ace/theme/"+key);
                                        localStorage.setItem(`editor-select-theme-${id}`,key);
                                    }
                                },
                                items: {
                                    "bright": { name: "亮色", items: {
                                            "chrome": { name: "chrome"},
                                            "clouds": { name: "clouds"},
                                            "crimson_editor": { name: "crimson_editor"},
                                            "dawn": { name: "dawn"},
                                            "dreamweaver": { name: "dreamweaver"},
                                            "eclipse": { name: "eclipse"},
                                            "github": { name: "github"},
                                            "iplastic": { name: "iplastic"},
                                            "solarized_light": { name: "solarized_light"},
                                            "textmate": { name: "textmate"},
                                            "tomorrow": { name: "tomorrow"},
                                            "xcode": { name: "xcode"},
                                            "kuroir": { name: "kuroir"},
                                            "katzenmilch": { name: "katzenmilch"},
                                            "sqlserver": { name: "sqlserver"}
                                        }
                                    },
                                    "dark": { name: "暗色", items: {
                                            "ambiance": { name: "ambiance"},
                                            "chaos": { name: "chaos"},
                                            "clouds_midnight": { name: "clouds_midnight"},
                                            "dracula": { name: "dracula"},
                                            "cobalt": { name: "cobalt"},
                                            "gruvbox": { name: "gruvbox"},
                                            "gob": { name: "gob"},
                                            "idle_fingers": { name: "idle_fingers"},
                                            "kr_theme": { name: "kr_theme"},
                                            "merbivore": { name: "merbivore"},
                                            "merbivore_soft": { name: "merbivore_soft"},
                                            "mono_industrial": { name: "mono_industrial"},
                                            "monokai": { name: "monokai"},
                                            "pastel_on_dark": { name: "pastel_on_dark"},
                                            "solarized_dark": { name: "solarized_dark"},
                                            "terminal": { name: "terminal"},
                                            "tomorrow_night": { name: "tomorrow_night"},
                                            "tomorrow_night_blue": { name: "tomorrow_night_blue"},
                                            "tomorrow_night_bright": { name: "tomorrow_night_bright"},
                                            "tomorrow_night_eighties": { name: "tomorrow_night_eighties"},
                                            "twilight": { name: "twilight"},
                                            "vibrant_ink": { name: "vibrant_ink"}
                                        }
                                    }
                                }
                            });
                        },
                        configNew(){

                            // 初始化位置
                            this.dialog.configNew.parent = this.configTreeSelectedNode.key || '/';

                            this.dialog.configNew.show = true;

                        },
                        onConfigSave(){
                            

                            if(_.isEmpty(this.dialog.configNew.name)){
                                this.$message({
                                    type: "warning",
                                    message: "配置名称不能为空！"
                                })
                                return false;
                            }

                            this.dialog.configNew.loading = true;
                            
                            this.dialog.configNew.formItem.key = [this.dialog.configNew.parent, this.dialog.configNew.name].join("/").replace(/\/\//g,'/');
                            
                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要添加以下配置`, 
                                    message: h('span', null, [
                                        h('p', null, `位置：${this.dialog.configNew.formItem.key}`),
                                        h('p', null, `值：${_.truncate(this.dialog.configNew.formItem.value)}`),
                                        h('p', null, `TTL：${ this.dialog.configNew.formItem.ttl ? this.dialog.configNew.formItem.ttl : ''}`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                configHandler.configAddAsync(this.dialog.configNew.formItem).then( (rtn)=>{
                                    if(rtn == 1){
                                        this.$message({
                                            type: "success",
                                            message: "保存成功！"
                                        })
                                        
                                        eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", this.dialog.configNew.formItem.key);

                                        // 重置是否编辑状态
                                        this.control.save.list = _.xor(this.control.save.list, [this.dialog.configNew.formItem.key]);
                                        
                                        this.dialog.configNew.show = false;

                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "保存失败：" + rtn
                                        })
                                    }

                                    this.dialog.configNew.loading = false;
                                } );

                            }).catch(() => {
                                this.dialog.configNew.loading = false;
                            }); 

                        },
                        configUpdate(){
                            
                            let item = {};
                            item.key = _.find(this.configTabs.tabs,{name:this.configTabs.activeIndex}).model.key;
                            
                            let id = objectHash.sha1(this.configTabs.activeIndex);
                            let editor = ace.edit(this.$refs[`configManageRef${id}`][0].$refs.editorContainer);
                            item.value = editor.getValue();
                            
                            item.ttl = _.find(this.configTabs.tabs,{name:this.configTabs.activeIndex}).model.ttl;


                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要更新以下配置`, 
                                    message: h('span', null, [
                                        h('p', null, `位置：${item.key}`),
                                        h('p', null, `值：${_.truncate(item.value)}`),
                                        h('p', null, `TTL：${ _.isUndefined(item.ttl) ? '' : item.ttl }`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                configHandler.configAddAsync(item).then( (rtn)=>{
                                    if(rtn == 1){
                                        this.$message({
                                            type: "success",
                                            message: "更新成功！"
                                        });

                                        this.control.save.show = false;

                                        // 重置是否编辑状态
                                        this.control.save.list = _.xor(this.control.save.list, [item.key]);

                                        eventHub.$emit("CONFIG-TREE-REFRESH-EVENT", item.key);
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "更新失败：" + rtn
                                        })
                                    }
                                } );

                            }).catch(() => {
                                    
                            }); 
                            
                        },
                        configDelete(){
                            
                            let item = this.configTreeSelectedNode;

                            const h = this.$createElement;
                            this.$msgbox({
                                    title: `确认要删除以下配置`, 
                                    message: h('span', null, [
                                        h('p', null, `位置：${item.key}`),
                                        h('p', null, `值：${_.truncate(item.value)}`),
                                        h('p', null, `TTL：${  _.isUndefined(item.ttl) ? '' : item.ttl }`)
                                    ]),
                                    showCancelButton: true,
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                            }).then(() => {

                                configHandler.configDeleteAsync(item).then( (rtn)=>{
                                    if(rtn == 1){
                                        // 刷新Tree
                                        eventHub.$emit("CONFIG-TREE-REFRESH-EVENT",item.key);
                                        // 关闭Tab
                                        this.configClose(item.key);
                                        // 重置选择
                                        this.configTreeSelectedNode = null;

                                        // 重置是否编辑状态
                                        this.control.save.list = _.xor(this.control.save.list, [item.key]);
    
                                    }
                                } );

                            }).catch(() => {
                                    
                            }); 

                        },
                        configCopy(item){
                            new Clipboard(`.copy${objectHash.sha1(item)}`, {
                                text: (trigger)=> {
                                    this.$message("已复制");
                                    let id = objectHash.sha1(this.configTabs.activeIndex);
                                    let editor = ace.edit(this.$refs[`configManageRef${id}`][0].$refs.editorContainer);
                                    return editor.getValue();
                                }
                            });
                        },
                        configDegug(item){
                            let name = objectHash.sha1(item);
                            this.$refs[`configManageRef${name}`][0].ifLog = !this.$refs[`configManageRef${name}`][0].ifLog;
                        }
                    }
                };

                this.app = new Vue(main).$mount("#app");
            })

        })
    }
}