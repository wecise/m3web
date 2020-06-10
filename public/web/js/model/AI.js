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
class AI {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["ai-robot-component","ai-neural-graph"],function() {

            $(function() {
                Vue.component("matrix-ai-robot", {
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    template:   `<el-container>
                                    <el-row>
                                        <el-col :span="24">
                                            <div class="grid-content">
                                                <el-card style="padding: 20px 15em;">
                                                    <el-image src='${window.ASSETS_ICON}/robot/png/robot.png?issys=true&type=download' style="width:180px;"></el-image>
                                                    <p>
                                                        <h2>唯简运维机器人</h2>
                                                        <p>在岗：9个月</p>
                                                        <p>入岗：2017-02-03</p>
                                                        <p>专注于IT运维领域的日常运维</p>
                                                        <p>专业技能：词频分析、关联分析和神经元网络</p>
                                                        <div class="bottom clearfix"">
                                                            <el-button type="text"><i class="fa fa-thumbs-up"></i> 联系 </el-button>
                                                            <el-button type="text"><i class="fa fa-server"></i> 技能</el-button>
                                                        </div>
                                                    </p>
                                                </el-card>
                                            </div>
                                        </el-col>
                                    </el-row>
                                </el-container>`
                });
                
                Vue.component("matrix-ai-message", {
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            message: {
                                term: "",
                                defaultSubject: [],
                                subject: [],
                                ws: null,
                            }
                        }
                    },
                    template:   `<el-container>
                                    <span slot="label">
                                        <a href="javascript:void(0);">消息 <span class="badge" style="position: absolute;background: rgb(255, 0, 0);" v-if="allMsg>0">#{allMsg}#</span></a>
                                    </span>
                                    <el-aside width="34%" style="height:100%;overflow: auto;background: transparent;">
                                        <div class="media" :class="[index==0?'selected':'']" :id="objectHash.sha1(item)" v-for="(item,index) in message.subject" style="border-bottom: 1px solid rgb(221, 221, 221);padding: 5px;cursor: pointer;margin: 0px;" @click="clickMe(item)">
                                            <div class="media-left">
                                                <span class="fas fa-circle" style="position: absolute;left:40px;color: rgb(255, 0, 0);transform: scale(.7);" v-if="item.msgs.length>0"></span>
                                                <a href="#">
                                                    <img class="media-object" :src="'/fs/assets/images/robot/png/'+item.icon + '.png?type=download&issys=true'" style="width: 42px;height: 42px;">
                                                </a>
                                            </div>
                                            <div class="media-body" style="text-align: left;">
                                                <h5 class="media-heading">#{item.title}#</h5>
                                                <span class="date-time">#{moment(item.vtime).format("LLL")}#</span>
                                            </div>
                                        </div>
                                    </el-aside>
                                    <el-container>
                                        <el-main style="padding:0px;text-align: center;line-height: 30px;background:rgb(228, 231, 237);overflow:hidden auto;" id="subject-msgs">
                                            <ul class="chats">
                                                <li :class="item.type" v-for="item in message.defaultSubject.msgs">
                                                    <span class="date-time">#{moment(item.ctime).format("LLL")}#</span>
                                                    <a href="javascript:;" class="name">#{item.icon}#</a>
                                                    <a href="javascript:;" class="image">
                                                        <img alt="" :src="'/fs/assets/images/robot/png/'+item.icon + '.png?type=download&issys=true'" style="width: 42px;height: 42px;" />
                                                    </a>
                                                    <div class="message animated pulse" contenteditable="false" style="outline:none;">
                                                        #{item.msg}#
                                                    </div>
                                                </li>
                                            </ul>
                                        </el-main>
                                        <el-footer>
                                            <div class="input-group" style="padding:5px 10px;">
                                                <input type="text" class="form-control" placeholder="消息输入" v-model="message.term" @keyup.13="sendMsg"/>
                                                <span class="input-group-btn">
                                                    <a class="btn btn-grey" href="javascript:void(0);" @click="sendMsg"><i class="fas fa-paper-plane"></i></a>
                                                </span>
                                            </div>
                                        </el-footer>
                                    </el-container>
                                </el-container>`,
                    computed: {
                        allMsg(){
                            return _.sumBy(this.message.subject,function(v){ return v.msgs.length; });
                        }
                    },
                    created: function(){
                        const self = this;
        
                        eventHub.$on("WIN-CLOSE-EVENT",self.wsClose);
        
                        // 初始化主题
                        self.message.subject = fsHandler.callFsJScript("/matrix/ai/subscribe.js", null).message;
                        
                    },
                    mounted: function(){
                        const self = this;
                        
                        // 默认主题消息
                        let item = _.first(self.message.subject);
                        let message = fsHandler.callFsJScript("/matrix/ai/getMessage.js", encodeURIComponent(JSON.stringify(item)) ).message;
                        self.message.defaultSubject = _.extend(item, {msgs:message});
        
                        // 初始化默认WS
                        self.initWs(item);
        
                        // 消息列表滚动到最底部
                        self.scrollSmoothToBottom('subject-msgs');
            
                        self.$nextTick(function(){
                            
                        })
                    },
                    destroyed: function(){
                        this.message.ws.close(self.message.ws);
                    },
                    methods: {
                        initWs(item) {
                            const self = this;
                            
                            if(this.message.ws) {
                                this.message.ws.close(this.message.ws);
                            }
        
                            try {
                                if(!this.message.ws){
                                    this.message.ws = new WebSocket(`ws://${document.location.host}/websocket/${item.subject}?source=${item.source}&title=${item.title}`);
                                }
        
                                this.message.ws.onopen = function(evt) {
                                    console.log("已打开: " + JSON.stringify(evt), self.message.ws);
                                };
                                this.message.ws.onclose = function (evt) {
                                    console.log("已关闭: " + JSON.stringify(evt));
                                };
                                this.message.ws.onerror = function (evt) {
                                    console.log("错误: " + JSON.stringify(evt));
                                };
                                this.message.ws.onmessage = function (evt) {
                                    let wsMsg = evt.data;
                                    
                                    if (wsMsg.indexOf("error") > 0) {
                                        console.log("错误: " + wsMsg.error + "\r\n");
                                    } else {
                                        console.log("收到: " + wsMsg + "\r\n");
                                        self.message.defaultSubject.msgs.push(_.merge(JSON.parse(wsMsg),{icon:'event',type:'from'}));
                                        // 消息列表滚动到最底部
                                        self.scrollSmoothToBottom('subject-msgs');
                                    }
                                };
                            } catch (err) {
                                console.error(err);
                            }
            
                        },
                        sendMessage(){
                            const self = this;
            
                            if (self.message.ws.readyState === 1) {
                                self.message.ws.send(`事件来了 ${moment().format("hh:mm:ss a")} 来自 ${self.message.wsUrl}`);
                            }
                        },
                        apply(){
                            const self = this;
            
                            if(self.message.ws){
            
                                this.ws.close(self.message.ws);
            
                                self.init();
            
                                $('#wsSetup').collapse('hide');
                            }
                        },
                        // 切换主题，获取相应消息
                        clickMe(item){
                            
                            // 选择主题效果
                            $(this.$el).find(".selected").removeClass("selected");
                            $(`#${objectHash.sha1(item)}`).addClass("selected");
                            
                            // 获取最新主题消息
                            let message = fsHandler.callFsJScript("/matrix/ai/getMessage.js", encodeURIComponent(JSON.stringify(item)) ).message;
                            this.message.defaultSubject = _.extend(item, {msgs: message});
        
                            // 接收消息
                            this.initWs(item);
                        },
                        sendMsg(){
                            
                            if(!this.message.term) return false;
            
                            this.message.defaultSubject.msgs.push({icon:'wzd', time:_.now(), msg:this.message.term, type: 'to'});
        
                            // 消息列表滚动到最底部
                            this.scrollSmoothToBottom('subject-msgs');
            
                            this.message.term = "";
                        },
                        scrollSmoothToBottom (id) {
                            var div = document.getElementById(id);
                            $('#' + id).animate({
                                scrollTop: div.scrollHeight// - div.clientHeight
                            }, 500);
                        }
                    },
                });
                
                
                Vue.component('matrix-ai-setup-baseline',{
                    delimiters: ['#{', '}#'],
                    props:{
                        id: String,
                        model: Object
                    },
                    template: `<el-container :id="id" style="height:100%;">
                                    <el-header style="line-height:40px;height:40px;text-align:right;">
                                        <el-tooltip content="保存规则">
                                            <el-button type="text" @click="onSave" icon="el-icon-position"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除规则">
                                            <el-button type="text" @click="onDelete" icon="el-icon-delete"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="查看作业">
                                            <el-button type="text" @click="job(content.name)" icon="el-icon-date"></el-button>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <span>#{content.status==1?'启用中':'关闭中'}#</span>
                                        <el-switch v-model="content.status"
                                                active-color="#13ce66"
                                                inactive-color="#dddddd"
                                                active-value=1
                                                inactive-value=0
                                                @change="onStatusUpdate">
                                        </el-switch>
                                    </el-header>
                                    <el-main style="height:100%;">
                                        <el-tabs tab-position="left" style="height: 100%;">
                                            <el-tab-pane label="基本设置">
                                                <el-form :model="content" label-position="top" label-width="160px" style="width:95%;height:100%;overflow:auto;padding: 0 20px; border-left: 1px solid #dddddd;">
                                                    <el-form-item label="指定计算类" style="width:80%;">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="指定计算类(class)"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover>    
                                                        <mx-class-cascader root="/matrix/entity" :value="content.model.class" ref="class"></mx-class-cascader>
                                                    </el-form-item>
                                                    <el-form-item label="指定计算属性和值" style="width:80%;">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="指定计算属性和值(bucketkeys)"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover>    
                                                        <mx-classkeys-number-cascader :root="content.class" :value="content.model.bucketkeys" multiplenable="true"  ref="bucketkeys"></mx-classkeys-number-cascader>
                                                    </el-form-item>
                                                    <el-form-item label="计算属性" style="width:80%;display:none;">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="计算属性(ctype)"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover> 
                                                        <el-checkbox-group v-model="content.ctypelist">
                                                            <el-checkbox label="max" class="el-checkbox">Max</el-checkbox>
                                                            <el-checkbox label="avg" class="el-checkbox">Avg</el-checkbox>
                                                            <el-checkbox label="min" class="el-checkbox">Min</el-checkbox>
                                                        </el-checkbox-group>
                                                    </el-form-item>
                                                    <!--el-form-item label="指定基线计算属性和值" style="width:80%;display:none;">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="指定基线计算属性和值(baselinebucketkeys)"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover> 
                                                        <mx-classkeys-string-cascader :root="content.class" :value="content.model.baselinebucketkeys" multiplenable="true"  ref="baselinebucketkeys"></mx-classkeys-cascader>
                                                    </el-form-item-->
                                                    <el-form-item label="指定不参与计算属性" style="width:80%;">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="指定不参与计算属性(copykeys)"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover> 
                                                        <mx-classkeys-string-cascader :root="content.class" :value="content.model.copykeys" multiplenable="true"  ref="copykeys"></mx-classkeys-string-cascader>
                                                    </el-form-item>
                                                    <el-form-item label="指定子属性(diffkeys)" style="width:80%;">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="指定子属性(diffkeys)"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover>
                                                        <mx-classkeys-string-cascader :root="content.class" :value="content.model.diffkeys" multiplenable="true"  ref="diffkeys"></mx-classkeys-string-cascader>
                                                    </el-form-item>
                                                    
                                                    <el-form-item label="基线类型" style="width:80%;">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="基线类型(周基线：7天 | 月基线：30天）"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover>
                                                        <el-radio v-model="content.limitday" :label="7">周基线</el-radio>
                                                        <el-radio v-model="content.limitday" :label="30">月基线</el-radio>
                                                    </el-form-item>
                                                    <el-form-item label="计算平均值的算法类型" style="width:80%;">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="计算平均值的算法类型"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover>
                                                        <el-radio-group v-model="content.avgtype">
                                                            <el-radio label="avg" class="el-radio">Avg</el-radio>
                                                            <el-radio label="median" class="el-radio">Median</el-radio>
                                                        </el-radio-group>    
                                                    </el-form-item>

                                                    <el-form-item label="采集间隔" prop="interval" style="width:80%;">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="采集间隔"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover>
                                                        <el-input-number v-model="content.interval" controls-position="right" :min="1"></el-input-number> 秒
                                                    </el-form-item>
                                                    
                                                </el-form>
                                            </el-tab-pane>
                                            <el-tab-pane label="服务器组">
                                                <mx-job-group :value="content.job.group" ref="jobGroup"></mx-job-group>
                                            </el-tab-pane>
                                            <el-tab-pane label="定时任务">
                                                <mx-job-cron :value="content.job.cron" style="height:100%;" ref="jobCron"></mx-job-cron>
                                            </el-tab-pane>
                                            <el-tab-pane label="阈值消息">
                                                <el-form :model="content" label-width="80px" label-position="top" style="height:100%;overflow:auto;padding: 0 20px; border-left: 1px solid #dddddd;">
                                                            
                                                    <el-form-item label="阈值" prop="threshold">
                                                        <el-input-number v-model="content.threshold" controls-position="right" :min="1"></el-input-number>
                                                        <small>超过阈值，发送消息</small>
                                                    </el-form-item>

                                                    <el-form-item label="消息模板" prop="msg">
                                                        <el-input type="textarea" rows="10" v-model="content.msg"></textarea></el-input>
                                                    </el-form-item>
                                                    
                                                </el-form>
                                            </el-tab-pane>
                                            <el-tab-pane label="其它设置">
                                                <el-form :model="content" label-width="140px" label-position="top" style="width:95%;height:100%;overflow:auto;padding: 0 20px; border-left: 1px solid #dddddd;">
                                                    
                                                    <el-form-item label="作业名称">
                                                        <el-input type="text" v-model="content.name" disabled></el-input>
                                                    </el-form-item>

                                                    <el-form-item label="指定不参与计算对象黑名单">
                                                        <el-popover
                                                            placement="top-start"
                                                            trigger="hover"
                                                            content="指定不参与计算对象黑名单"
                                                            style="position:absolute;top:-40px;right:0px;">
                                                            <span slot="reference" class="el-icon-question"></span>
                                                        </el-popover>
                                                        <mx-class-entity-select :root="content.class" :value="content.model.blacklist" multiplenable="true" ref="blacklist"></mx-class-entity-select>
                                                    </el-form-item>

                                                    <el-form-item label="时间" prop="time">
                                                        <small>#{moment(content.time).format(mx.global.register.format)}#</small>
                                                    </el-form-item>
                                                    <el-form-item label="用户" prop="user">
                                                        <small>#{content.user}#</small>
                                                    </el-form-item>
                                                </el-form>
                                            </el-tab-pane>
                                        </el-tabs>
                                        
                                    </el-main>
                                </el-container>`,
                    data(){
                        return {
                            content: null
                        }
                    },
                    created(){
                        this.content = this.model.content;
                    },
                    mounted(){
                        // watch数据更新
                        this.$watch(
                            "$refs.class.selected",{
                                handler:(val, oldVal) => {
                                    this.$set(this.content,'class', _.last(val));
                                    this.$set(this.content.model,'class', _.last(val));
                                },
                                deep:true
                            }
                        );

                        // bucket && bucketkeys
                        // auto baselinebucketkeys
                        this.$watch(
                            "$refs.bucketkeys.selected",{
                                handler:(val, oldVal) => {
                                    this.$set(this.content,'bucket', _.head(_.head(val)));
                                    this.$set(this.content,'bucketkeys', _.map(val,(v)=>{ return _.last(v);}));

                                    this.$set(this.content.model,'bucketkeys', val);


                                    // baselinebucketkeys
                                    this.$set(this.content,'baselinebucket',  _.head(_.head(val))+"_baseline");
                                    
                                    // baselinebucketkeys
                                    let baselineBucketKeys = {};
                                    
                                    let ctypelist = this.content.ctypelist;
                                    _.forEach(this.content.bucketkeys,(v)=>{ 
                                        let tmp = {};
                                        _.forEach(ctypelist,(w)=>{ _.extend(tmp, { [w]: `${v}_${w}` }); });
                                        _.extend(baselineBucketKeys, { [v]: tmp } );
                                    });
                                    this.$set(this.content,'baselinebucketkeys', baselineBucketKeys);

                                    this.$set(this.content.model,'baselinebucketkeys', val);
                                },
                                deep:true
                            }
                        );

                        // baselinebucket && baselinebucketkeys
                        /* this.$watch(
                            "$refs.baselinebucketkeys.selected",{
                                handler:(val, oldVal) => {

                                    // baselinebucket
                                    this.$set(this.content,'baselinebucket',  _.head(_.head(val)));
                                    
                                    // baselinebucketkeys
                                    let baselineBucketKeys = {};
                                    let keys = _.map(val,(v)=>{ return _.last(v);});
                                    let ctypelist = this.content.ctypelist;
                                    _.forEach(keys,(v)=>{ 
                                        let tmp = {};
                                        _.forEach(ctypelist,(w)=>{ _.extend(tmp, { [w.split("_")[0]]: `${v}` }); });
                                        _.extend(baselineBucketKeys, { [v]: tmp } );
                                    });
                                    this.$set(this.content,'baselinebucketkeys', baselineBucketKeys);

                                    this.$set(this.content.model,'baselinebucketkeys', val);
                                },
                                deep:true
                            }
                        ); */

                        // copykeys
                        this.$watch(
                            "$refs.diffkeys.selected",{
                                handler:(val, oldVal) => {

                                    // copykeys
                                    this.$set(this.content,'copykeys',  _.map(val,(v)=>{ return _.last(v);}));
                                    this.$set(this.content.model,'copykeys',  val);
                                },
                                deep:true
                            }
                        );
                        
                        // diffkeys
                        this.$watch(
                            "$refs.diffkeys.selected",{
                                handler:(val, oldVal) => {

                                    // diffkeys
                                    this.$set(this.content,'diffkeys',  _.map(val,(v)=>{ return _.last(v);}));
                                    this.$set(this.content.model,'diffkeys',  val);
                                },
                                deep:true
                            }
                        );

                        // blacklist
                        this.$watch(
                            "$refs.blacklist.entity.selected",{
                                handler:(val, oldVal) => {
                                    console.log(val)
                                    this.$set(this.content, 'blacklist',  _.map(val,(v)=>{ return v;}))
                                    this.$set(this.content.model,'blacklist', _.map(val,(v)=>{ return v;}));
                                },
                                deep:true
                            }
                        );

                        // job Group
                        this.$watch(
                            "$refs.jobGroup.dt.selected",{
                                handler:(val, oldVal) => {
                                    this.$set(this.content.job, 'group',  _.map(val,'name')[0])
                                },
                                deep:true
                            }
                        );

                        // job cron
                        this.$watch(
                            "$refs.jobCron.cron",{
                                handler:(val, oldVal) => {
                                    this.$set(this.content.job, 'cron',  _.concat(['cron'],val).join(" "));
                                },
                                deep:true
                            }
                        );
                        
                    },
                    methods: {
                        onSave(){
                            let attr = {ctime: _.now()};
                            
                            let rt = fsHandler.fsNew('json', this.model.parent, this.model.name, JSON.stringify(this.content,null,2), attr);
                            if(rt == 1){

                                if(_.isEmpty(this.content.job.group)){
                                    this.$message({
                                        type: "info",
                                        message: "请选择服务器组"
                                    })
                                    return false;
                                }
                                
                                let name = this.model.name.split(".")[0];
                                
                                let jobObj = { 
                                    name: name, 
                                    dir: this.content.job.dir, 
                                    exec: [this.content.job.exec[0], this.model.fullname].join(" "), 
                                    group: this.content.job.group, 
                                    schedule: `${this.content.job.cron}`, // 'cron 0 0 * * *'
                                    timeout: 43200
                                };
                                this.$set(this.content,'name',name);

                                // 检查job是否存在
                                // let check = jobHandler.jobExist(jobObj);
                                // console.log(23,check)

                                // 如果不存在，生成Job
                                //let rtn = jobHandler.jobAdd(jobObj);
                                let rtn = jobHandler.jobMerge(jobObj);
                                
                                if(rtn.status == 'ok'){
                                    this.$message({
                                        type: 'success',
                                        message: '作业提交成功！'
                                    })
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: '作业提交失败：' + rtn.message
                                    })
                                }

                            } else {
                                this.$message({
                                    type: 'warning',
                                    message: '保存失败:' + rt.message
                                })
                            }
                        },
                        // 删除规则
                        onDelete() {
                            
                            this.$confirm(`确认要删除该规则：${this.model.name}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
                                let rt = jobHandler.jobDelete(this.content);
                                if(rt.status == 'ok'){
                                    
                                    // 删除文件系统
                                    let rtn = fsHandler.fsDelete(this.model.parent, this.model.name);
                                    if (rtn == 1){
                                    
                                        // 刷新rules
                                        this.$root.$refs.aiSetup.load();
                                        this.$root.$refs.aiSetup.close(this.model.id);

                                        this.$message({
                                            type: "success",
                                            message: "删除成功！"
                                        })
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "删除失败 " + rtn.message
                                        })
                                    }
                                } else {
                                    this.$message({
                                        type: "error",
                                        message: "删除失败：" + rt.message
                                    })
                                }

                            }).catch(() => {
                                
                            });

                        },
                        onStatusUpdate(evt){
                            
                            _.extend(this.content,{status:evt+'', ospace:window.COMPANY_OSPACE, user: window.SignedUser_UserName,time: _.now()});
                            
                            // 更新到文件系统
                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', this.model.parent, this.model.name, JSON.stringify(this.content,null,2), attr);
                            
                            // 生成JOB
                            if(rtn == 1){
                                this.$message({
                                    type: 'success',
                                    message: '作业提交成功！'
                                })
                            } else {
                                this.$message({
                                    type: 'error',
                                    message: '作业提交失败!'
                                })        
                            }
                            
                        },
                        job(term){
                            let url = `/matrix/job?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                })

                // 频繁项关联
                Vue.component('matrix-ai-setup-cafp',{
                    delimiters: ['#{', '}#'],
                    props:{
                        id: String,
                        model: Object
                    },
                    template:   `<el-container :id="id" style="height:100%;" v-if="model.content">
                                    <el-header style="line-height:40px;height:40px;text-align:right;">
                                        <el-tooltip content="保存规则">
                                            <el-button type="text" @click="save" icon="el-icon-position"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除规则">
                                            <el-button type="text" @click="remove" icon="el-icon-delete"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="查看作业">
                                            <el-button type="text" @click="job(content.name)" icon="el-icon-date"></el-button>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <span>#{content.status==1?'启用中':'关闭中'}#</span>
                                        <el-switch v-model="content.status"
                                                active-color="#13ce66"
                                                inactive-color="#dddddd"
                                                active-value=1
                                                inactive-value=0
                                                @change="statusUpdate">
                                        </el-switch>
                                    </el-header>
                                    <el-main style="height:100%;">
                                        <el-form :model="content" label-width="80px">
                                            <el-form-item label="指定类">
                                                <el-select v-model="content.class" placeholder="请选择类">
                                                    <el-option
                                                        v-for="item in type.list"
                                                        :key="item.value"
                                                        :label="item.label"
                                                        :value="item.value">
                                                    </el-option>
                                                </el-select>
                                            </el-form-item>
                                            <el-form-item label="idfield" prop="idfield">
                                                <el-input type="text" v-model="content.idfield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="valuefield" prop="valuefield">
                                                <el-input type="text" v-model="content.valuefield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="minpts" prop="minpts">
                                                <el-input type="text" v-model="content.minpts"></el-input>
                                            </el-form-item>
                                            <el-form-item label="eps" prop="eps">
                                                <el-input type="text" v-model="content.eps"></el-input>
                                            </el-form-item>
                                            <el-form-item label="times" prop="times">
                                                <el-input-number v-model="content.times" controls-position="right" :min="1"></el-input-number>
                                            </el-form-item>
                                            <el-form-item label="isversion" prop="isversion">
                                                <el-switch v-model="content.isversion"></el-switch>
                                            </el-form-item>
                                            <el-form-item label="时间" prop="time">
                                                <small>#{moment(content.time).format(mx.global.register.format)}#</small>
                                            </el-form-item>
                                            <el-form-item label="用户" prop="user">
                                                <small>#{content.user}#</small>
                                            </el-form-item>
                                        </el-form>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickTag(tag){
                            if(typeof tag == 'object'){
                                return tag.join(",");
                            } else {
                                return tag;
                            }
                        }  
                    },
                    data: function(){
                        return {
                            type:{
                                model:'',
                                list: [
                                    {
                                        value: '/matrix/devops/performance',
                                        label: '所有性能'
                                    }
                                ]
                            },
                            content: null
                        }
                    },
                    created(){
                        this.content = this.model.content;
                    },
                    methods: {
                        save(){
                            const self = this;

                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        // 删除规则
                        remove: function() {
                            
                            alertify.confirm(`确认要删除该规则? <br><br> ${this.model.name}`, (e)=> {
                                if (e) {
                                    // 删除文件系统
                                    let rtn = fsHandler.fsDelete(this.model.parent, this.model.name);
                                    
                                    if (rtn == 1){
                                        // 刷新rules
                                        this.$root.$refs.aiSetup.load();
                                        this.$root.$refs.aiSetup.close(this.model.id);

                                        this.$message({
                                            type: "success",
                                            message: "删除成功！"
                                        })
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "删除失败 " + rtn.message
                                        })
                                    }
                                } else {
                                    
                                }
                            })
                        },
                        statusUpdate(evt){
                            const self = this;
        
                            _.extend(self.content,{status:evt+'', ospace:window.COMPANY_OSPACE, user: window.SignedUser_UserName,time: _.now()});
                            
                            // 更新到文件系统
                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        job(term){
                            // 默认Job名称
                            if(!term){
                                term = 'word';
                            }
                            let url = `/matrix/job?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                })

                // 实体异常检测
                Vue.component('matrix-ai-setup-elad',{
                    delimiters: ['#{', '}#'],
                    props:{
                        id: String,
                        model: Object
                    },
                    template:   `<el-container :id="id" style="height:100%;">
                                    <el-header style="line-height:40px;height:40px;text-align:right;">
                                        <el-tooltip content="保存规则">
                                            <el-button type="text" @click="save"icon="el-icon-position"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除规则">
                                            <el-button type="text"  @click="remove" icon="el-icon-delete"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="查看作业">
                                            <el-button type="text" @click="job(content.name)" icon="el-icon-date"></el-button>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <span>#{content.status==1?'启用中':'关闭中'}#</span>
                                        <el-switch v-model="content.status"
                                                active-color="#13ce66"
                                                inactive-color="#dddddd"
                                                active-value=1
                                                inactive-value=0
                                                @change="statusUpdate">
                                        </el-switch>
                                    </el-header>
                                    <el-main>
                                        <el-form :model="content" label-width="80px">
                                            <el-form-item label="指定类">
                                                <el-select v-model="content.class" placeholder="请选择类">
                                                    <el-option
                                                        v-for="item in type.list"
                                                        :key="item.value"
                                                        :label="item.label"
                                                        :value="item.value">
                                                    </el-option>
                                                </el-select>
                                            </el-form-item>
                                            <el-form-item label="hostfield" prop="hostfield">
                                                <el-input type="text" v-model="content.hostfield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="osfield" prop="osfield">
                                                <el-input type="text" v-model="content.osfield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="timefield" prop="timefield">
                                                <el-input type="text" v-model="content.timefield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="nearest" prop="nearest">
                                                <el-input-number v-model="content.nearest" controls-position="right" :min="1"></el-input-number>
                                            </el-form-item>
                                            <el-form-item label="interval" prop="interval">
                                                <el-input-number v-model="content.interval" controls-position="right" :min="10*60"></el-input-number>
                                            </el-form-item>
                                            <el-form-item label="消息模板" prop="msg">
                                                <el-input type="textarea" v-model="content.msg"></textarea></el-input>
                                            </el-form-item>
                                            <el-form-item label="时间" prop="time">
                                                <small>#{moment(content.time).format(mx.global.register.format)}#</small>
                                            </el-form-item>
                                            <el-form-item label="用户" prop="user">
                                                <small>#{content.user}#</small>
                                            </el-form-item>
                                        </el-form>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickTag(tag){
                            if(typeof tag == 'object'){
                                return tag.join(",");
                            } else {
                                return tag;
                            }
                        }  
                    },
                    data: function(){
                        return {
                            type:{
                                model:'',
                                list: [
                                    {
                                        value: '/matrix/devops/performance',
                                        label: '所有性能'
                                    }
                                ]
                            },
                            content: null
                        }
                    },
                    created(){
                        this.content = this.model.content;
                    },
                    methods: {
                        save(){
                            const self = this;

                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        // 删除规则
                        remove: function() {
        
                            alertify.confirm(`确认要删除该规则? <br><br> ${this.model.name}`,  (e)=> {
                                if (e) {
                                    // 删除文件系统
                                    let rtn = fsHandler.fsDelete(this.model.parent, this.model.name);
                                    
                                    if (rtn == 1){
                                        // 刷新rules
                                        this.$root.$refs.aiSetup.load();
                                        this.$root.$refs.aiSetup.close(this.model.id);

                                        this.$message({
                                            type: "success",
                                            message: "删除成功！"
                                        })
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "删除失败 " + rtn.message
                                        })
                                    }
                                } else {
                                    
                                }
                            })
                        },
                        statusUpdate(evt){
                            const self = this;
        
                            _.extend(self.content,{status:evt+'', ospace:window.COMPANY_OSPACE, user: window.SignedUser_UserName,time: _.now()});
                            
                            // 更新到文件系统
                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        job(term){
                            // 默认Job名称
                            if(!term){
                                term = 'word';
                            }
                            let url = `/matrix/job?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                })

                // 实体发现
                Vue.component('matrix-ai-setup-e-elad',{
                    delimiters: ['#{', '}#'],
                    props:{
                        id: String,
                        model: Object
                    },
                    template:   `<el-container :id="id" style="height:100%;">
                                    <el-header style="line-height:40px;height:40px;text-align:right;">
                                        <el-tooltip content="保存规则">
                                            <el-button type="text"  @click="save"icon="el-icon-position"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除规则">
                                            <el-button type="text" @click="remove" icon="el-icon-delete"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="查看作业">
                                            <el-button type="text"  @click="job(content.name)" icon="el-icon-date"></el-button>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <span>#{content.status==1?'启用中':'关闭中'}#</span>
                                        <el-switch v-model="content.status"
                                                active-color="#13ce66"
                                                inactive-color="#dddddd"
                                                active-value=1
                                                inactive-value=0
                                                @change="statusUpdate">
                                        </el-switch>
                                    </el-header>
                                    <el-main>
                                        <el-form :model="content" label-width="80px">
                                            <el-form-item label="指定类">
                                                <el-select v-model="content.class" placeholder="请选择类">
                                                    <el-option
                                                        v-for="item in type.list"
                                                        :key="item.value"
                                                        :label="item.label"
                                                        :value="item.value">
                                                    </el-option>
                                                </el-select>
                                            </el-form-item>
                                            <el-form-item label="hostfield" prop="hostfield">
                                                <el-input type="text" v-model="content.hostfield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="osfield" prop="osfield">
                                                <el-input type="text" v-model="content.osfield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="timefield" prop="timefield">
                                                <el-input type="text" v-model="content.timefield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="nearest" prop="nearest">
                                                <el-input-number v-model="content.nearest" controls-position="right" :min="1"></el-input-number>
                                            </el-form-item>
                                            <el-form-item label="interval" prop="interval">
                                                <el-input-number v-model="content.interval" controls-position="right" :min="10*60"></el-input-number>
                                            </el-form-item>
                                            <el-form-item label="消息模板" prop="msg">
                                                <el-input type="textarea" v-model="content.msg"></textarea></el-input>
                                            </el-form-item>
                                            <el-form-item label="时间" prop="time">
                                                <small>#{moment(content.time).format(mx.global.register.format)}#</small>
                                            </el-form-item>
                                            <el-form-item label="用户" prop="user">
                                                <small>#{content.user}#</small>
                                            </el-form-item>
                                        </el-form>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickTag(tag){
                            if(typeof tag == 'object'){
                                return tag.join(",");
                            } else {
                                return tag;
                            }
                        }  
                    },
                    data: function(){
                        return {
                            type:{
                                model:'',
                                list: [
                                    {
                                        value: '/matrix/devops/performance',
                                        label: '所有性能'
                                    }
                                ]
                            },
                            content: null
                        }
                    },
                    created(){
                        this.content = this.model.content;
                    },
                    methods: {
                        save(){
                            const self = this;

                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        // 删除规则
                        remove: function() {
                            
                            alertify.confirm(`确认要删除该规则? <br><br> ${this.model.name}`,  (e)=> {
                                if (e) {
                                    // 删除文件系统
                                    let rtn = fsHandler.fsDelete(this.model.parent, this.model.name);
                                    
                                    if (rtn == 1){
                                        // 刷新rules
                                        this.$root.$refs.aiSetup.load();
                                        this.$root.$refs.aiSetup.close(this.model.id);

                                        this.$message({
                                            type: "success",
                                            message: "删除成功！"
                                        })
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "删除失败 " + rtn.message
                                        })
                                    }
                                } else {
                                    
                                }
                            })
                        },
                        statusUpdate(evt){
                            const self = this;
        
                            _.extend(self.content,{status:evt+'', ospace:window.COMPANY_OSPACE, user: window.SignedUser_UserName,time: _.now()});
                            
                            // 更新到文件系统
                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        job(term){
                            // 默认Job名称
                            if(!term){
                                term = 'word';
                            }
                            let url = `/matrix/job?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                })

                // 实体关系发现
                Vue.component('matrix-ai-setup-el-elad',{
                    delimiters: ['#{', '}#'],
                    props:{
                        id: String,
                        model: Object
                    },
                    template:   `<el-container :id="id" style="height:100%;">
                                    <el-header style="line-height:40px;height:40px;text-align:right;">
                                        <el-tooltip content="保存规则">
                                            <el-button type="text" @click="save"icon="el-icon-position"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除规则">
                                            <el-button type="text" @click="remove" icon="el-icon-delete"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="查看作业">
                                            <el-button type="text" @click="job(content.name)" icon="el-icon-date"></el-button>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <span>#{content.status==1?'启用中':'关闭中'}#</span>
                                        <el-switch v-model="content.status"
                                                active-color="#13ce66"
                                                inactive-color="#dddddd"
                                                active-value=1
                                                inactive-value=0
                                                @change="statusUpdate">
                                        </el-switch>
                                    </el-header>
                                    <el-main>
                                        <el-form :model="content" label-width="80px">
                                            <el-form-item label="指定类">
                                                <el-select v-model="content.class" placeholder="请选择类">
                                                    <el-option
                                                        v-for="item in type.list"
                                                        :key="item.value"
                                                        :label="item.label"
                                                        :value="item.value">
                                                    </el-option>
                                                </el-select>
                                            </el-form-item>
                                            <el-form-item label="hostfield" prop="hostfield">
                                                <el-input type="text" v-model="content.hostfield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="osfield" prop="osfield">
                                                <el-input type="text" v-model="content.osfield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="timefield" prop="timefield">
                                                <el-input type="text" v-model="content.timefield"></el-input>
                                            </el-form-item>
                                            <el-form-item label="nearest" prop="nearest">
                                                <el-input-number v-model="content.nearest" controls-position="right" :min="1"></el-input-number>
                                            </el-form-item>
                                            <el-form-item label="interval" prop="interval">
                                                <el-input-number v-model="content.interval" controls-position="right" :min="10*60"></el-input-number>
                                            </el-form-item>
                                            <el-form-item label="消息模板" prop="msg">
                                                <el-input type="textarea" v-model="content.msg"></textarea></el-input>
                                            </el-form-item>
                                            <el-form-item label="时间" prop="time">
                                                <small>#{moment(content.time).format(mx.global.register.format)}#</small>
                                            </el-form-item>
                                            <el-form-item label="用户" prop="user">
                                                <small>#{content.user}#</small>
                                            </el-form-item>
                                        </el-form>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickTag(tag){
                            if(typeof tag == 'object'){
                                return tag.join(",");
                            } else {
                                return tag;
                            }
                        }  
                    },
                    data: function(){
                        return {
                            type:{
                                model:'',
                                list: [
                                    {
                                        value: '/matrix/devops/performance',
                                        label: '所有性能'
                                    }
                                ]
                            },
                            content: null
                        }
                    },
                    created(){
                        this.content = this.model.content;
                    },
                    methods: {
                        save(){
                            const self = this;

                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        // 删除规则
                        remove() {
                            
                            alertify.confirm(`确认要删除该规则? <br><br> ${this.model.name}`,  (e)=> {
                                if (e) {
                                    // 删除文件系统
                                    let rtn = fsHandler.fsDelete(this.model.parent, this.model.name);
                                    
                                    if (rtn == 1){
                                        // 刷新rules
                                        this.$root.$refs.aiSetup.load();
                                        this.$root.$refs.aiSetup.close(this.model.id);

                                        this.$message({
                                            type: "success",
                                            message: "删除成功！"
                                        })
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "删除失败 " + rtn.message
                                        })
                                    }
                                } else {
                                    
                                }
                            })
                        },
                        statusUpdate(evt){
                            const self = this;
        
                            _.extend(self.content,{status:evt+'', ospace:window.COMPANY_OSPACE, user: window.SignedUser_UserName,time: _.now()});
                            
                            // 更新到文件系统
                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        job(term){
                            // 默认Job名称
                            if(!term){
                                term = 'word';
                            }
                            let url = `/matrix/job?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                })

                // 词频输入
                Vue.component('matrix-ai-setup-words',{
                    delimiters: ['#{', '}#'],
                    props:{
                        id: String,
                        model: Object
                    },
                    template:   `<el-container :id="id" style="height:100%;">
                                    <el-header style="line-height:40px;height:40px;text-align:right;">
                                        <el-tooltip content="保存规则">
                                            <el-button type="text" @click="save"icon="el-icon-position"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除规则">
                                            <el-button type="text" @click="remove" icon="el-icon-delete"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="查看作业">
                                            <el-button type="text" @click="job(content.name)" icon="el-icon-date"></el-button>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <span>#{content.status==1?'启用中':'关闭中'}#</span>
                                        <el-switch v-model="content.status"
                                                active-color="#13ce66"
                                                inactive-color="#dddddd"
                                                active-value=1
                                                inactive-value=0
                                                @change="statusUpdate">
                                        </el-switch>
                                    </el-header>
                                    <el-main>
                                        <el-form :model="content" label-width="80px">
                                            <el-form-item label="关键词">
                                                <el-tag
                                                    :key="tag"
                                                    closable
                                                    type=""
                                                    @close="wordsRemove(tag)"
                                                    style="margin:0 2px;" v-for="tag in content.name">
                                                    #{tag | pickTag}#
                                                </el-tag>
                                                <el-input
                                                    class="input-new-tag"
                                                    v-if="words.inputVisible"
                                                    v-model="words.inputValue"
                                                    ref="saveTagInput"
                                                    size="small"
                                                    @keyup.enter.native="wordsAdd"
                                                    @blur="wordsAdd">
                                                </el-input>
                                                <el-button v-else class="button-new-tag" size="small" @click="wordsInputShow">+</el-button>
                                            </el-form-item>
                                            <el-form-item label="指定类">
                                                <el-select v-model="content.class" placeholder="请选择类">
                                                    <el-option
                                                        v-for="item in type.list"
                                                        :key="item.value"
                                                        :label="item.label"
                                                        :value="item.value">
                                                    </el-option>
                                                </el-select>
                                            </el-form-item>
                                            <el-form-item label="阈值" prop="threshold">
                                                <el-input-number v-model="content.threshold" controls-position="right" :min="1"></el-input-number> 次
                                                <small>发生次数，超过阈值，发送消息</small>
                                            </el-form-item>
                                            <el-form-item label="最近" prop="nearest">
                                                <el-input-number v-model="content.nearest" controls-position="right" :min="10*60"></el-input-number> 秒
                                                <small>统计窗口，默认最近10分钟</small>
                                            </el-form-item>
                                            <el-form-item label="消息模板" prop="msg">
                                                <el-input type="textarea" v-model="content.msg"></textarea></el-input>
                                            </el-form-item>
                                            <el-form-item label="时间" prop="time">
                                                <small>#{moment(content.time).format(mx.global.register.format)}#</small>
                                            </el-form-item>
                                            <el-form-item label="用户" prop="user">
                                                <small>#{content.user}#</small>
                                            </el-form-item>
                                        </el-form>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickTag(tag){
                            if(typeof tag == 'object'){
                                return tag.join(",");
                            } else {
                                return tag;
                            }
                        }  
                    },
                    data: function(){
                        return {
                            type:{
                                model:'',
                                list: [
                                    {
                                        value: '/matrix/devops/event',
                                        label: '所有事件'
                                    },
                                    {
                                        value: '/matrix/devops/event/syslog',
                                        label: 'Syslog'
                                    },
                                    {
                                        value: '/matrix/devops/event/omnibus',
                                        label: 'Omnibus'
                                    },
                                    {
                                        value: '/matrix/devops/log',
                                        label: '所有日志'
                                    },
                                    {
                                        value: '/matrix/devops/log/cassandra',
                                        label: 'Cassandra日志'
                                    }
                                ]
                            },
                            words:{

                                inputVisible: false,
                                inputValue: ''
                            },
                            content: null
                        }
                    },
                    created(){
                        this.content = this.model.content;
                    },
                    methods: {
                        save(){
                            const self = this;

                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        // 删除规则
                        remove: function() {
                            
                            alertify.confirm(`确认要删除该规则? <br><br> ${this.model.name}`,  (e)=> {
                                if (e) {
                                    // 删除文件系统
                                    let rtn = fsHandler.fsDelete(this.model.parent, this.model.name);
                                    
                                    if (rtn == 1){
                                        // 刷新rules
                                        this.$root.$refs.aiSetup.load();
                                        this.$root.$refs.aiSetup.close(this.model.id);

                                        this.$message({
                                            type: "success",
                                            message: "删除成功！"
                                        })
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "删除失败 " + rtn.message
                                        })
                                    } 
                                } else {
                                    
                                }
                            })
                        },
                        wordsRemove(tag) {
                            const self = this;
        
                            self.content.name.splice($.inArray(tag,self.content.name), 1)
        
                            // 更新规则，没有关键字时status=0
                            _.extend(self.content, {name: self.content.name, status: self.content.name.length==0?'0':'1'});
                            
                        },
                        wordsInputShow() {
                            const self = this;
        
                            self.words.inputVisible = true;
                            self.$nextTick(_ => {
                                self.$refs.saveTagInput.$refs.input.focus();
                            });
                        },
                        wordsAdd() {
                            const self = this;
        
                            let inputValue = self.words.inputValue;
                            if (inputValue) {
                                // ,作为数组
                                if(_.indexOf(inputValue,',') !== -1){
                                    self.content.name.push(inputValue.split(","));
                                } else {
                                    self.content.name.push(inputValue);
                                }
                                
                            }
        
                             // 更新规则，没有关键字时status=0
                             _.extend(self.content, {name: self.content.name});
        
                             self.words.inputVisible = false;
                             self.words.inputValue = '';
                        },
                        statusUpdate(evt){
                            const self = this;
        
                            _.extend(self.content,{status:evt+'', ospace:window.COMPANY_OSPACE, user: window.SignedUser_UserName,time: _.now()});
                            
                            // 更新到文件系统
                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        job(term){
                            // 默认Job名称
                            if(!term){
                                term = 'word';
                            }
                            let url = `/matrix/job?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                })
        
                // 神经元网络
                Vue.component('matrix-ai-setup-neural',{
                    delimiters: ['#{', '}#'],
                    props:{
                        id: String,
                        model: Object
                    },
                    data(){
                        return {
                            graph:{
                                input: [],
                                hidden: 300,
                                output: []
                            },
                            nodes: [],
                            content: null
                        }
                    },
                    template:   `<el-container :id="id" style="height:100%;">
                                    <el-header style="line-height:40px;height:40px;text-align:right;">
                                        <el-tooltip content="保存规则">
                                            <el-button type="text" @click="onSave" icon="el-icon-position"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除规则">
                                            <el-button type="text" @click="onDelete" icon="el-icon-delete"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="查看作业">
                                            <el-button type="text" @click="job(content.name)" icon="el-icon-date"></el-button>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                        <span>#{content.status==1?'启用中':'关闭中'}#</span>
                                        <el-switch v-model="content.status"
                                                active-color="#13ce66"
                                                inactive-color="#dddddd"
                                                active-value=1
                                                inactive-value=0
                                                @change="onStatusUpdate">
                                        </el-switch>
                                    </el-header>
                                    <el-main>
                                        <el-tabs tab-position="left" style="height: 100%;">
                                            <el-tab-pane label="计算模型">
                                                
                                                <el-form :model="model" label-width="140px" label-position="top" style="width:95%;height:100%;overflow:auto;padding: 0 20px; border-left: 1px solid #dddddd;">
                                                    
                                                    <ai-neural-graph :model="graph"></ai-neural-graph>
                                                    
                                                    <!--el-form-item label="输入层设置">
                                                        <mx-entity-class-keys-cascader root="/matrix/entity" :value="content.model.bucketkeys" multiplenable="true"  ref="input"></mx-entity-class-keys-cascader>
                                                    </el-form-item>

                                                    <el-form-item label="计算层">
                                                        <el-input-number v-model="graph.hidden" :min="0"></el-input-number>
                                                    </el-form-item>

                                                    <el-form-item label="输出层设置">
                                                        <mx-entity-class-keys-cascader root="/matrix/entity" :value="content.model.bucketkeys" multiplenable="true"  ref="output"></mx-entity-class-keys-cascader>
                                                    </el-form-item>

                                                    <el-form-item label="">
                                                        
                                                    </el-form-item-->

                                                </el-form>
                                            </el-tab-pane>
                                            
                                            <el-tab-pane label="阈值消息">
                                                <el-form :model="model" label-width="140px" label-position="top" style="width:95%;height:100%;overflow:auto;padding: 0 20px; border-left: 1px solid #dddddd;">
                                                    
                                                    <el-form-item label="阈值" prop="threshold">
                                                        <el-input-number v-model="content.threshold" controls-position="right" :min="1"></el-input-number> 次
                                                        <small>发生次数，超过阈值，发送消息</small>
                                                    </el-form-item>
                                                    
                                                    <el-form-item label="最近" prop="nearest">
                                                        <el-input-number v-model="content.nearest" controls-position="right" :min="10*60"></el-input-number> 秒
                                                        <small>统计窗口，默认最近10分钟</small>
                                                    </el-form-item>

                                                    <el-form-item label="消息模板" prop="msg">
                                                        <el-input type="textarea" v-model="content.msg"></textarea></el-input>
                                                    </el-form-item>
                                                </el-form>
                                            </el-tab-pane>
                                            <el-tab-pane label="其它设置">
                                                <el-form :model="content" label-width="140px" label-position="top" style="width:95%;height:100%;overflow:auto;padding: 0 20px; border-left: 1px solid #dddddd;">
                                                    
                                                    <el-form-item label="作业名称">
                                                        <el-input type="text" v-model="content.name" disabled></el-input>
                                                    </el-form-item>

                                                    <el-form-item label="采集间隔" prop="interval">
                                                        <el-input-number v-model="content.interval" controls-position="right" :min="1"></el-input-number> 秒
                                                    </el-form-item>
                                                    
                                                    <el-form-item label="时间" prop="time">
                                                        <small>#{moment(content.time).format(mx.global.register.format)}#</small>
                                                    </el-form-item>
                                                    <el-form-item label="用户" prop="user">
                                                        <small>#{content.user}#</small>
                                                    </el-form-item>
                                                </el-form>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    created(){
                        this.content = this.model.content;
                    },
                    mounted(){
                        // watch数据更新
                        this.$watch(
                            "$refs.input.selected",{
                                handler:(val, oldVal) => {
                                    console.log(1,val)
                                },
                                deep:true
                            }
                        );

                        this.$watch(
                            "$refs.output.selected",{
                                handler:(val, oldVal) => {
                                    console.log(2,val)
                                },
                                deep:true
                            }
                        );
                    },
                    methods:{
                        
                        onStatusUpdate(evt){
                            
                            _.extend(this.content,{status:evt+'', ospace:window.COMPANY_OSPACE, user: window.SignedUser_UserName,time: _.now()});
                            
                            // 更新到文件系统
                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', this.model.parent, this.model.name, JSON.stringify(this.content,null,2), attr);
                        },
                        onSave(){
                            const self = this;

                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.model.parent, self.model.name, JSON.stringify(self.content,null,2), attr);
                        },
                        // 删除规则
                        onDelete() {
                            
                            this.$confirm(`确认要删除该规则：${this.model.name}？`, '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
								
                                let rt = jobHandler.jobDelete(this.content);
                                if(rt.status == 'ok'){
                                    
                                    // 删除文件系统
                                    let rtn = fsHandler.fsDelete(this.model.parent, this.model.name);
                                    if (rtn == 1){
                                    
                                        // 刷新rules
                                        this.$root.$refs.aiSetup.load();
                                        this.$root.$refs.aiSetup.close(this.model.id);

                                        this.$message({
                                            type: "success",
                                            message: "删除成功！"
                                        })
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: "删除失败 " + rtn.message
                                        })
                                    }
                                } else {
                                    this.$message({
                                        type: "error",
                                        message: "删除失败：" + rt.message
                                    })
                                }

                            }).catch(() => {
                                
                            });

                        },
                        job(term){
                            // 默认Job名称
                            if(!term){
                                term = 'neural_network';
                            }
                            let url = `/matrix/job?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                })

                Vue.component("matrix-ai-setup", {
                    delimiters: ['#{', '}#'],
                    props: {  
                        id: String
                    },
                    data(){
                        return {
                            split:{
                                inst: null
                            },
                            defaultOpends: [],
                            ruleList: [],
                            selectedRule: {},
                            main: {
                                activeIndex: '1',
                                tabs: []
                            }
                        }
                    },
                    template:   `<el-container style="background:#ffffff;height:calc(100vh - 85px);">
                                    
                                    <el-aside width="20%" style="height:100%;overflow: hidden;background:#f2f3f5" ref="leftView">
                                        <el-container style="height:100%;">
                                            <el-header style="height: 30px;line-height: 30px;padding: 0px 5px;font-weight: 900;">
                                                <span><i class="el-icon-s-grid"></i> 规则分类</span>
                                                <div style="float:right;">
                                                    <el-tooltip content="刷新">
                                                        <el-button type="text" @click="load"><i class="fas fa-sync-alt"></i></el-button>
                                                    </el-tooltip>
                                                </div>
                                            </el-header>
                                            <el-main style="padding:0px;overflow:auto;height:100%;">
                                                <el-menu @open="open" @close="open">
                                                    <el-submenu :index="item.id" v-for="item in ruleList" @open="select">
                                                        <template slot="title">
                                                            <el-image :src="'/fs/assets/images/robot/png/'+item.icon + '?type=download&issys=true'" style="width: 32px;height: 32px;padding-right:8px;"></el-image>
                                                            #{item.label}# <span style="color:#999;">(#{item.child.length}#)</span>
                                                            <div style="position: absolute;
                                                                top: 25%;
                                                                right: 30px;
                                                                margin-top: -7px;
                                                                -webkit-transition: -webkit-transform .3s;
                                                                transition: -webkit-transform .3s;
                                                                transition: transform .3s;
                                                                transition: transform .3s,-webkit-transform .3s;
                                                                font-size: 12px;">
                                                                <e-button class="el-icon-plus" @click="add(item,$event)" style="font-size:12px;"></e-button>
                                                            </div>
                                                        </template>
                                                        <el-menu-item :index="subItem.id" v-for="subItem in item.child" @click="select(subItem)">
                                                            <i class="fas fa-tasks"></i> #{subItem.name.split(".")[0]}#</el-menu-item>   
                                                    </el-submenu>
                                                </el-menu>
                                            </el-main>
                                        </el-container>
                                    </el-aside>
                                    <el-container style="height:100%;" ref="container">
                                        <!--el-header style="height: 30px;padding:0 10px;line-height:30px;">
                                            #{[selectedRule.label,selectedRule.name].join("/").replace(/\\//g," / ")}#
                                        </el-header-->
                                        <el-main style="padding:0px;overflow:hidden;height:100%;background: #ffffff;">
                                            <el-tabs v-model="main.activeIndex" type="border-card" closable @tab-remove="close" style="height:100%;">
                                                <el-tab-pane :label="tab.name" :key="tab.id" :name="tab.id" v-for="tab in main.tabs" style="height:100%;overflow:auto;">
                                                    <span slot="label">
                                                        <el-image :src="'/fs/assets/images/robot/png/'+tab.component + '.png?type=download&issys=true'" style="width: 10px;height: 10px;"></el-image>
                                                        #{tab.name.split(".")[0]}#
                                                    </span>
                                                    <matrix-ai-setup-words :id="tab.component+'-'+tab.id" :model="tab" v-if="tab.component=='words'" transition="fade" transition-mode="out-in"></matrix-ai-setup-words>
                                                    <matrix-ai-setup-neural :id="tab.component+'-'+tab.id" :model="tab" v-if="tab.component=='neural'" transition="fade" transition-mode="out-in"></matrix-ai-setup-neural>
                                                    <matrix-ai-setup-baseline :id="tab.component+'-'+tab.id" :model="tab" v-if="tab.component=='baseline'" transition="fade" transition-mode="out-in"></matrix-ai-setup-baseline>
                                                    <matrix-ai-setup-elad :id="tab.component+'-'+tab.id" :model="tab" v-if="tab.component=='elad'" transition="fade" transition-mode="out-in"></matrix-ai-setup-elad>
                                                    <matrix-ai-setup-e-elad :id="tab.component+'-'+tab.id" :model="tab" v-if="tab.component=='e-elad'" transition="fade" transition-mode="out-in"></matrix-ai-setup-e-elad>
                                                    <matrix-ai-setup-el-elad :id="tab.component+'-'+tab.id" :model="tab" v-if="tab.component=='el-elad'" transition="fade" transition-mode="out-in"></matrix-ai-setup-el-elad>
                                                    <matrix-ai-setup-cafp :id="tab.component+'-'+tab.id" :model="tab" v-if="tab.component=='cafp'" transition="fade" transition-mode="out-in"></matrix-ai-setup-cafp>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-main>
                                    </el-container>
                                    
                                </el-container>`,
                    created(){
                        this.load();
                    },
                    mounted(){
                        const self = this;

                        // 默认样式
                        $(".el-submenu__title",this.$el).css({
                            "display": "-webkit-box",
                            "line-height": "32px",
                            "height": "40px",
                            "padding": "5px 10px",
                            "font-size": "12px"
                        });

                        $(".el-tabs__content",this.$el).css({
                            "padding": "0px",
                            "backgroundColor":"#ffffff"
                        })

                        _.delay(() => {
                            this.split.inst = Split([this.$refs.leftView.$el, this.$refs.container.$el], {
                                sizes: [25, 75],
                                minSize: [0, 0],
                                gutterSize: 5,
                                gutterAlign: 'end',
                                cursor: 'col-resize',
                                direction: 'horizontal',
                                expandToMin: true,
                            });
                        },500)

                    },
                    methods:{
                        add(item,event){
                            const self = this;

                            event.stopPropagation();
                            
                            let win = maxWindow.winRule("新建规则",'<div id="ai-rule-new"></div>',null,null);
                            
                            let app = new Vue({
                                delimiters: ['#{', '}#'],
                                template:   `<el-form label-width="80px">
                                                <el-form-item label="规则类型">
                                                    <el-input v-model="model.label" :disabled="true"></el-input>
                                                </el-form-item>
                                                <el-form-item label="规则名称">
                                                    <el-input type="text" v-model="name"></el-input>
                                                </el-form-item>
                                                <el-form-item label="描述">
                                                    <el-input type="textarea" v-model="remark"></el-input>
                                                </el-form-item>
                                                <el-form-item>
                                                    <el-button type="primary" @click="save">保存</el-button>
                                                    <el-button type="default" @click="cancel">取消</el-button>
                                                </el-form-item>
                                            </el-form>`,
                                data: {
                                    model: item,
                                    name: "",
                                    remark: ""
                                },
                                methods: {
                                    save(){
                                        
                                        if(!this.name){
                                            this.$message({
                                                type: "info",
                                                message: "规则名称不能为空!"
                                            });
                                            return false;
                                        }
                                        
                                        // 更新到文件系统
                                        let name = this.name + ".json";
                                        let attr = { ctime: _.now(),remark:this.remark, author: window.SignedUser_UserName };
                                        let content = _.find(mx.global.register.rule, {name: this.model.name}).content;
                                        _.extend(content,{
                                                            id: _.now()+'',
                                                            ospace: window.COMPANY_NAME,
                                                            user: window.SignedUser_UserName,
                                                            time:  _.now(),
                                                            name: name
                                                        });
                                        let rtn = fsHandler.fsNew('json', this.model.fullname, this.name+'.json', JSON.stringify(content,null,2), attr);
                                        if(rtn == 1){
                                            // Reload规则列表
                                            self.load();
                                            // 刷新菜单
                                            self.open(item.id,[item.id]);
                                            // 关闭窗体
                                            win.close();
                                        }
                                    },
                                    cancel(){
                                        win.close();
                                    }
                                }
                            }).$mount("#ai-rule-new");
                        },
                        load(){
                            this.ruleList = fsHandler.callFsJScript("/matrix/ai/ai-rule-list.js",null).message;
                        },
                        clickMe(item){
                            
                            this.setup.default = item;
        
                            this.currentView = item.id;
                        },
                        open(key,keyPath){
                            
                            this.defaultOpends = [];
                            this.defaultOpends = keyPath;

                            let selectItem = this.selectedRule = _.find(this.ruleList,{id:key});
                            let item = fsHandler.fsList([selectItem.parent,selectItem.name].join("/"));
                            
                            // extend当前目录
                            _.find(this.ruleList,function(v){
                                if(v.id === key){
                                    v.child = _.map(item,function(val){
                                        // merge parent的label
                                        return _.merge(val,{label:v.label,component:v.component});
                                    });
                                }
                            })
                            
                        },
                        select(item){
                            
                            // 已经打开
                            if(_.find(this.main.tabs,{id:item.id})){
                                
                                // 获取规则内容
                                let content = fsHandler.fsContent(item.parent,item.name);
                                
                                // 删除
                                _.remove(this.main.tabs, {
                                    id: item.id
                                });

                                // 更新
                                this.main.tabs.push(_.merge(item,{content: _.attempt(JSON.parse.bind(null, content))}));
                                this.main.activeIndex = item.id;  

                                return false;
                            }

                            // 当前选择规则
                            this.selectedRule = item;

                            // 获取规则内容
                            let content = fsHandler.fsContent(item.parent,item.name);
                            this.main.tabs.push(_.merge(item,{content: _.attempt(JSON.parse.bind(null, content))}));
                            this.main.activeIndex = item.id;   
                            
                        },
                        close(targetId){
                            let tabs = this.main.tabs;
                            let activeIndex = this.main.activeIndex;
                            if (activeIndex === targetId) {
                              tabs.forEach((tab, index) => {
                                if (tab.id === targetId) {
                                  let nextTab = tabs[index + 1] || tabs[index - 1];
                                  if (nextTab) {
                                    activeIndex = nextTab.id;
                                  }
                                }
                              });
                            }
                            
                            this.main.activeIndex = activeIndex;
                            this.main.tabs = tabs.filter(tab => tab.id !== targetId);
                        }
                    }
                })
        
            })
        })

    }

    mount(el){
        
        let main = {
            delimiters: ['${', '}'],
            template:  `<matrix-ai-setup ref="aiSetup" :id="id"></matrix-ai-setup>`,
            data:{
                id: _.now()
            }
        }
        _.delay(() => {
            this.app = new Vue(main).$mount(el);
        },50)
    }

}