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

}

let fileSystem = new FileSystem();
