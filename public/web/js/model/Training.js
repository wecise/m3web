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
class Training {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded([],()=> {

            $(function() {
                
               
            })
        })
    }

    mount(el){
        let main = {
            delimiters: ['#{', '}#'],
            template:   `<el-container style="background:#ffffff;">
                            <el-main style="display:flex;flex-wrap:wrap;padding:0px;">
                                <el-card :body-style="{ padding: '0px' }" v-for="(o, index) in 12" :key="o" 
                                    style="width:32em;height:30em;margin:20px;padding:10px;background:#f2f2f2;box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)">
                                    <video src="http://wecise.com/assets/mp4/输入模板示例.mov" controls="controls" width="100%">
                                        your browser does not support the video tag
                                    </video>
                                    <div style="padding: 14px;">
                                    <h3 style="margin:5px;">数据接入</h3>
                                    <p>上传时间：#{ moment().format("LL") }#</p>
                                    <p>上传作者：#{ window.SignedUser_UserName }#</p>
                                    </div>
                                </el-card>
                            </el-main>
                        </el-container>`,
            data: {
            

            }
        };

        _.delay(()=>{
            this.app = new Vue(main).$mount(el);
        })
    }

}