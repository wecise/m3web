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
class FileSystem {

    constructor() {
        
    }

    init(){
    }

    fileNewTo(app, sourceList, loadCallBack){
        let wnd = null;

        try{
            if(jsPanel.activePanels.getPanel('jsPanel-fileAction')){
                jsPanel.activePanels.getPanel('jsPanel-fileAction').close();
            }
        }catch(error){

        }
        finally{
           wnd = maxWindow.winFileAction('新建', '<div class="animated slideInDown" id="file-action-win"></div>', null,null);
        }

        new Vue({
            delimiters: ['#{', '}#'],
            data:{
                classList: fsHandler.callFsJScript("/matrix/fs/fs_list.js",encodeURIComponent(app)).message,
                defaultProps: {
                    children: 'children',
                    label: 'alias'
                },
                node: {},
                form: {
                    name: "",
                    attr: ""
                }
            },
            template: `<el-container style="height:100%;">
                            <el-header style="height:140px;line-height:140px;background-color:#f6f6f6;padding:10px;">
                                <el-form ref="form" :model="form" label-width="80px">
                                    <el-form-item label="项目名称：">
                                        <el-input v-model="form.name"></el-input>
                                    </el-form-item>
                                    <el-form-item label="项目备注：">
                                        <el-input type="textarea" v-model="form.attr"></el-input>
                                    </el-form-item>
                                    <el-form-item label="选择目录：">
                                        <el-input v-model="node.fullname" v-if="!_.isEmpty(node.fullname)"></el-input>
                                    </el-form-item>
                                </el-form>
                            </el-header>
                            <el-main style="padding:10px;">
                                <el-tree
                                    :data="classList"
                                    node-key="id"
                                    :default-expanded-keys="[_.first(classList).id]"
                                    :props="defaultProps"
                                    @node-click="onNodeClick"
                                    accordion="true"
                                    style="background-color:transparent;">
                                    <span slot-scope="{ node, data }" 
                                            style="flex: 1;
                                            display: flex;
                                            align-items: center;
                                            justify-content: space-between;
                                            font-size: 12px;
                                            padding-right: 8px;">
                                        <span>#{ node.label }#</span>
                                        <span style="color:#999;">#{ data.name }#</span>
                                    </span>
                                </el-tree>
                            </el-main>
                            <el-footer style="height:40px;line-height:40px;text-align:right;">
                                <el-button type="default" @click="onCancel">取消</el-button>
                                <el-button type="primary" @click="onSave">创建</el-button>
                            </el-footer>
                        </el-container>`,
            created(){
                // 默认创建目录
                _.extend(this.node,{fullname: app});
            },
            methods:{
                onNodeClick(node){
                    this.node = node;
                },
                onCancel(){
                    wnd.close();
                },
                onSave(){
                    try {
                        
                        if(_.isEmpty(this.form.name)){
                            this.$message({
                                message: "项目名称不能为空",
                                type: 'error'
                            });
                            return false;
                        }

                        let type = 'dir';
                        let attr = {remark: '', ctime: _.now(), author: window.SignedUser_UserName};
        
                        let rtn = fsHandler.fsNew(type, this.node.fullname, this.form.name, null, attr);
        
                        if(rtn == 1){
                            this.$message({
                                message: "创建成功 " + this.node.name,
                                type: 'success'
                            });
                            // 刷新Tree
                            eventHub.$emit("DEVOPS-TREE-REFRESH-EVENT");
                            // callBack
                            loadCallBack;
                            wnd.close();
                        }
                    }
                    catch(error){}
                }
            }
        }).$mount("#file-action-win");
        
    }

    fileNew(rootPath,loadCallBack){
        
        if($("#jsPanel-fileNew")){
            $("#jsPanel-fileNew").remove();
        }

        let win = maxWindow.winNewFile('新建', '<div class="animated slideInDown" id="file-new-win"></div>', null,null);

        let fileNew = {
            delimiters: ['#{', '}#'],
            template:   `<el-container>
                            <el-main>
                                <el-form label-width="80px">
                                    <el-form-item label="位置">
                                        <el-input v-model="fileForm.path"></el-input>
                                    </el-form-item>
                                    <el-form-item label="名称">
                                        <el-input v-model="fileForm.name"></el-input>
                                    </el-form-item>
                                    <el-form-item label="文件类型">
                                        <el-select v-model="fileForm.extName" placeholder="请选择">
                                            <el-option v-for="item in fileType"
                                                :key="item.value"
                                                :label="item.title"
                                                :value="item.value">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="备注">
                                        <el-input type="textarea" v-model="fileForm.remark"></el-input>
                                    </el-form-item>
                                    <el-form-item>
                                        <el-button type="default" @click="cancle">取消</el-button>
                                        <el-button type="primary" @click="save">保存</el-button>
                                    </el-form-item>
                                </el-form>
                            </el-main>
                        </elcontainer>`,
            data: {
                fileForm:{
                    path: rootPath,
                    name: '',
                    extName: 'js',
                    remark: ''
                },
                fileType: mx.global.register.file
            },
            mounted(){
                this.$refs.focusMe.focus();
            },
            methods: {
                save(){
                    const me = this;

                    if(!me.fileForm.name) {
                        alertify.log("请输入名称！");
                        return false;
                    }

                    let name = me.fileForm.name + "." + me.fileForm.extName;
                    let attr = {remark: me.fileForm.remark, ctime: _.now(), author: window.SignedUser_UserName};
                    let rtn = fsHandler.fsNew(me.fileForm.extName, me.fileForm.path, name, null, attr);
                    if(rtn == 1){
                        loadCallBack();
                        win.close();
                    }
                },
                cancle(){
                    win.close();
                }
            }
        };

        new Vue(fileNew).$mount("#file-new-win");
        
    }

    fileCopyTo(app, sourceList, loadCallBack){
        let wnd = null;

        try{
            if(jsPanel.activePanels.getPanel('jsPanel-fileAction')){
                jsPanel.activePanels.getPanel('jsPanel-fileAction').close();
            }
        }catch(error){

        }
        finally{
           wnd = maxWindow.winFileAction('复制到', '<div class="animated slideInDown" id="file-action-win"></div>', null,null);
        }

        new Vue({
            delimiters: ['#{', '}#'],
            data:{
                classList: fsHandler.callFsJScript("/matrix/fs/fs_list.js",encodeURIComponent(app)).message,
                defaultProps: {
                    children: 'children',
                    label: 'alias'
                },
                node: {}
            },
            template: `<el-container style="height:100%;">
                            <el-header style="height:30px;line-height:30px;background-color:#f6f6f6;">
                                复制到：<span v-if="!_.isEmpty(node.fullname)">#{node.fullname}#</span>
                            </el-header>
                            <el-main style="padding:10px;">
                                <el-tree
                                    :data="classList"
                                    node-key="id"
                                    :default-expanded-keys="[_.first(classList).id]"
                                    :props="defaultProps"
                                    @node-click="onNodeClick"
                                    accordion="true"
                                    style="background-color:transparent;">
                                    <span slot-scope="{ node, data }" 
                                            style="flex: 1;
                                            display: flex;
                                            align-items: center;
                                            justify-content: space-between;
                                            font-size: 12px;
                                            padding-right: 8px;">
                                        <span>#{ node.label }#</span>
                                        <span style="color:#999;">#{ data.name }#</span>
                                    </span>
                                </el-tree>
                            </el-main>
                            <el-footer style="height:40px;line-height:40px;text-align:right;">
                                <el-button type="default" @click="onCancel">取消</el-button>
                                <el-button type="primary" @click="onCopy">复制</el-button>
                            </el-footer>
                        </el-container>`,
            methods:{
                onNodeClick(node){
                    this.node = node;
                },
                onCancel(){
                    wnd.close();
                },
                onCopy(){
                    try {
                        let rtn = true;
                        
                        _.forEach(sourceList,(v) => {
                            let _rtn = fsHandler.fsCopy([v.parent,v.name].join("/"), this.node.fullname);
                            if(_rtn===0){
                                rtn = false;
                            }
                        })
                        if(rtn){
                            this.$message({
                                message: "复制成功 " + this.node.fullname,
                                type: 'success'
                            });
                            loadCallBack;
                            wnd.close();
                        }
                    }
                    catch(error){}
                    finally{
                        sourceList = [];
                    }
                }
            }
        }).$mount("#file-action-win");
        
    }

    fileMoveTo(app, sourceList,loadCallBack){
        
        let wnd = null;

        try{
            if(jsPanel.activePanels.getPanel('jsPanel-fileAction')){
                jsPanel.activePanels.getPanel('jsPanel-fileAction').close();
            }
        }catch(error){

        }
        finally{
           wnd = maxWindow.winFileAction('移动到', '<div class="animated slideInDown" id="file-action-win"></div>', null,null);
        }

        new Vue({
            delimiters: ['#{', '}#'],
            data:{
                classList: fsHandler.callFsJScript("/matrix/fs/fs_list.js",encodeURIComponent(app)).message,
                defaultProps: {
                    children: 'children',
                    label: 'alias'
                },
                node: {}
            },
            template: `<el-container style="height:100%;">
                            <el-header style="height:30px;line-height:30px;background-color:#f6f6f6;">
                                移动到：<span v-if="!_.isEmpty(node.fullname)">#{node.fullname}#</span>
                            </el-header>
                            <el-main style="padding:10px;">
                                <el-tree
                                    :data="classList"
                                    node-key="id"
                                    :default-expanded-keys="[_.first(classList).id]"
                                    :props="defaultProps"
                                    @node-click="onNodeClick"
                                    accordion="true"
                                    style="background-color:transparent;">
                                    <span slot-scope="{ node, data }" 
                                            style="flex: 1;
                                            display: flex;
                                            align-items: center;
                                            justify-content: space-between;
                                            font-size: 12px;
                                            padding-right: 8px;">
                                        <span>#{ node.label }#</span>
                                        <span style="color:#999;">#{ data.name }#</span>
                                    </span>
                                </el-tree>
                            </el-main>
                            <el-footer style="height:40px;line-height:40px;text-align:right;">
                                <el-button type="default" @click="onCancel">取消</el-button>
                                <el-button type="primary" @click="onMove">移动</el-button>
                            </el-footer>
                        </el-container>`,
            methods:{
                onNodeClick(node){
                    this.node = node;
                },
                onCancel(){
                    wnd.close();
                },
                onMove(){
                    try {
                        let rtn = true;
                        
                        _.forEach(sourceList,(v) => {
                            let _rtn = fsHandler.fsMove([v.parent,v.name].join("/"), this.node.fullname);
                            if(_rtn===0){
                                rtn = false;
                            }
                        })
                        if(rtn){
                            this.$message({
                                message: "移动成功 " + this.node.fullname,
                                type: 'success'
                            });
                            loadCallBack;
                            wnd.close();
                        }
                    }
                    catch(error){}
                    finally{
                        sourceList = [];
                    }
                }
            }
        }).$mount("#file-action-win");
        
    }
}

let fileSystem = new FileSystem();
