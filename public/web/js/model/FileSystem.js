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

    fileNew(rootPath,loadCallBack){
        
        if($("#jsPanel-fileNew")){
            $("#jsPanel-fileNew").remove();
        }

        let win = maxWindow.winNewFile('新建', '<div class="animated slideInDown" id="file-new-win"></div>', null,null);

        let fileNew = {
            delimiters: ['#{', '}#'],
            template:   `<div class="container-fluid"><div class="row-fluid"><div class="col-lg-10 col-lg-offset-1"><form>
                            <div class="form-group">
                                <label>位置</label>
                                <input type="text" class="form-control" v-model="fileForm.path" placeholder="位置">
                            </div>
                            <div class="form-group">
                                <label>名称</label>
                                <input type="text" class="form-control" v-model="fileForm.name" placeholder="名称" ref='focusMe'>
                            </div>
                            <!--div class="checkbox">
                                <label>
                                <input type="checkbox" v-model="fileForm.dir"> 是否是目录
                                </label>
                            </div-->
                            <div class="form-group">
                                <label>文件类型</label>
                                <select class="form-control" v-model="fileForm.extName">
                                    <option :value="item.value" v-for="item in fileType">#{item.title}#</option>
                                </select>
                            </div>    
                            <div class="form-group">
                                <label>备注</label>
                                <input type="text" class="form-control" v-model="fileForm.remark"  placeholder="备注">
                            </div>
                            <div class="pull-right">
                                <a class="btn btn-primary" href="javascript:void(0);" @click="save">保存</a>
                                <a class="btn btn-default" href="javascript:void(0);" @click="cancle">取消</a>
                            </div>
                        </form></div></div></div>`,
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
                classList: fsHandler.callFsJScript("/fs/fs_list.js",encodeURIComponent(app)).message,
                defaultProps: {
                    children: 'children',
                    label: 'alias'
                },
                node: {}
            },
            template: `<el-container style="height:100%;">
                            <el-header style="height:40px;line-height:40px;">
                                复制到：<span v-if="!_.isEmpty(node.fullname)">#{node.fullname}#</span>
                            </el-header>
                            <el-main style="padding:10px;" style="background-color:#f7f7f7;">
                                <el-tree
                                    :data="classList"
                                    node-key="id"
                                    :default-expanded-keys="[_.first(classList).id]"
                                    :props="defaultProps"
                                    @node-click="onNodeClick"
                                    style="background-color:transparent;">
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
                            alertify.success("复制成功 " + this.node.fullname);
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
                classList: fsHandler.callFsJScript("/fs/fs_list.js",encodeURIComponent(app)).message,
                defaultProps: {
                    children: 'children',
                    label: 'alias'
                },
                node: {}
            },
            template: `<el-container style="height:100%;">
                            <el-header style="height:40px;line-height:40px;">
                                移动到：<span v-if="!_.isEmpty(node.fullname)">#{node.fullname}#</span>
                            </el-header>
                            <el-main style="padding:10px;" style="background-color:#f7f7f7;">
                                <el-tree
                                    :data="classList"
                                    node-key="id"
                                    :default-expanded-keys="[_.first(classList).id]"
                                    :props="defaultProps"
                                    @node-click="onNodeClick"
                                    style="background-color:transparent;">
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
                            alertify.success("移动成功 " + this.node.fullname);
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
