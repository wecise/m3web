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
class Robot {

    constructor() {
        
    }

    init() {

        Vue.component("ai-robot", {
            delimiters: ['#{', '}#'],
            props: {
                model: Object
            },
            template:   `<el-container>
                            <el-row>
                                <el-col :span="24">
                                    <div class="grid-content">
                                        <el-card style="padding: 20px 15em;">
                                            <img src='${window.ASSETS_ICON}/robot/png/robot.png?issys=true&type=download' style="width:180px;">
                                            <div class="caption">
                                                <h2>唯简运维机器人</h2>
                                                <p>在岗：9个月</p>
                                                <p>入岗：2017-02-03</p>
                                                <p>专注于IT运维领域的日常运维</p>
                                                <p>专业技能：词频分析、关联分析和神经元网络</p>
                                                <div class="bottom clearfix"">
                                                    <a class="btn btn-xs btn-white"><i class="fa fa-thumbs-up"></i> 联系 </a>
                                                    <a class="btn btn-xs btn-success"><i class="fa fa-server"></i> 技能</a>
                                                </div>
                                            </div>
                                        </el-card>
                                    </div>
                                </el-col>
                            </el-row>
                        </el-container>`
        });

        Vue.component("ai-message", {
            delimiters: ['#{', '}#'],
            props: {
                model: Object
            },
            data(){
                return {
                    message: {
                        term: '',
                        defaultSubject: [],
                        subject: [],
                        ws: null,
                        search: {
                            term: ''
                        }
                    }
                }
            },
            template:   `<el-container>
                            <span slot="label">
                                <a href="javascript:void(0);">消息 <span class="badge" style="position: absolute;background: rgb(255, 0, 0);" v-if="allMsg>0">#{allMsg}#</span></a>
                            </span>
                            <el-aside width="34%" style="height:100%;overflow: auto;background: transparent;">
                                <el-container>
                                    <el-header style="height:80px;line-height:80px;display: flex;">
                                        <el-input v-model="message.search.term" placeholder="搜索"></el-input>
                                        <el-tooltip content="订阅消息">
                                            <a hrefe="javascript:void(0);" class="btn btn-link" style="padding: 30px 10px;"><i class="fas fa-plus"></i></a>
                                        </el-tooltip>
                                    </el-header>
                                    <el-main style="padding:0px;">
                                        <div class="media" :class="[index==0?'selected':'']" :id="objectHash.sha1(item)" v-for="(item,index) in message.subject" style="border-bottom: 1px solid rgb(221, 221, 221);padding: 5px;cursor: pointer;margin: 0px;" @click="clickMe(item)">
                                            <div class="media-left">
                                                <span class="fas fa-circle" style="position: absolute;left:40px;color: rgb(255, 0, 0);transform: scale(.7);" v-if="item.msgs.length>0"></span>
                                                <a href="#">
                                                    <img class="media-object" :src="'/fs/assets/images/robot/png/'+item.icon + '.png?type=download&issys=true'" style="width: 42px;height: 42px;">
                                                </a>
                                            </div>
                                            <div class="media-body" style="text-align: left;">
                                                <h5 class="media-heading">#{item.title}#</h5>
                                                <span class="date-time">#{moment(item.vtime).format("L, ddd, HH:MM A")}#</span>
                                            </div>
                                        </div>
                                    </el-main>
                                </el-container>
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

                eventHub.$on("win-close-event",self.wsClose);

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

        Vue.component("ai-setup", {
            delimiters: ['#{', '}#'],
            props: {
                model: Object
            },
            data(){
                return {
                    currentView: 'robot-ai-setup-words-analysis',
                    setup: {
                        default: {},
                        list: [
                            {id: 'robot-ai-setup-words-analysis', name: '词频分析', title: '关键字规则定义', icon: 'event'},
                            {id: 'robot-ai-setup-relation', name: '关联分析', title: '分析模型定义', icon: 'event'},
                            {id: 'robot-ai-setup-baseline', name: '基线计算', title: '基线计算', icon: 'baseline'},
                            {id: 'robot-ai-setup-neuralnetwork-analysis', name: '神经元网络', title: '神经元网络定义', icon: 'neuralnetwork'}
                        ]
                    }
                }
            },
            template:   `<el-container>
                            <el-aside width="34%" style="height:100%;overflow: auto;background: transparent;border-right:1px solid #dddddd;">
                                <el-container>
                                    <el-header style="height:30px;">
                                        
                                    </el-header>
                                    <el-main style="padding:0px;">
                                        <div class="media" :class="[index==0?'selected':'']" :id="objectHash.sha1(item)" v-for="(item,index) in setup.list" style="border-bottom: 1px solid rgb(221, 221, 221);padding: 5px;cursor: pointer;margin: 0px;" @click="clickMe(item)">
                                            <div class="media-left">
                                                <a href="#">
                                                    <img class="media-object" :src="'/fs/assets/images/robot/png/'+item.icon + '.png?type=download&issys=true'" style="width: 42px;height: 42px;">
                                                </a>
                                            </div>
                                            <div class="media-body" style="text-align: left;">
                                                <h5 class="media-heading">#{item.name}#</h5>
                                                <span class="date-time">#{item.title}#</span>
                                            </div>
                                        </div>
                                    </el-main>
                                </el-container>
                            </el-aside>
                            <component v-bind:is="currentView" :model="null" transition="fade" transition-mode="out-in"></component>
                        </el-container>`,
            created(){
                // 刷新title
                eventHub.$on("AI-SETUP-REFRESH-TITLE", this.titleUpdate);
            },
            mounted(){
                $(this.$el).find(".el-tabs__header.is-top").remove();
            },
            methods:{
                clickMe(item){
                    $(this.$el).find(".selected").removeClass("selected");
                    $(`#${objectHash.sha1(item)}`).addClass("selected");
    
                    this.setup.default = item;

                    this.currentView = item.id;
                },
                titleUpdate(evt){
                    const self = this;

                    if(evt.type == 'words'){
                        self.setup.list[0] = _.extend(self.setup.list[0],{ title: `${evt.count}项关键字规则定义` } ); 
                    } else if(evt.type == 'neuralnetwork'){
                        self.setup.list[3] = _.extend(self.setup.list[3],{ title: `${evt.count}项神经网络规则定义` } ); 
                    }
                }
            }
        });

        // 词频输入组件
        Vue.component('robot-ai-setup-words-input',{
            delimiters: ['#{', '}#'],
            props:{
                id: String,
                model: Object
            },
            template: `<el-card :id="id" style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);padding: 5px 0px;line-height: 10px;margin-bottom:10px;">
                            <div slot="header" class="clearfix">
                                #{model.status==1?'启用中':'关闭中'}#
                                <el-switch v-model="model.status"
                                        active-color="#13ce66"
                                        inactive-color="#dddddd"
                                        active-value=1
                                        inactive-value=0
                                        @change="statusUpdate">
                                </el-switch>
                                <el-button size="mini" type="text" style="float: right; padding: 3px 0;outline: none;" @click="ruleRemove"><i class="fas fa-times"></i></el-button>
                            </div>
                            <el-form :model="model" label-width="80px" size="mini">
                                <el-form-item label="关键词">
                                    <el-tag
                                        :key="tag"
                                        closable
                                        type=""
                                        @close="nameRemove(tag)"
                                        style="margin:0 2px;" v-for="tag in model.name">
                                        #{tag}#
                                    </el-tag>
                                    <el-input
                                        class="input-new-tag"
                                        v-if="names.inputVisible"
                                        v-model="names.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="nameAdd"
                                        @blur="nameAdd">
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="nameInputShow">+</el-button>
                                </el-form-item>
                                <el-form-item label="指定类">
                                    <el-select v-model="model.class" placeholder="请选择类">
                                        <el-option
                                            v-for="item in type.list"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="阈值" prop="threshold">
                                    <el-input-number v-model="model.threshold" controls-position="right" :min="1" @change="thresholdUpdate"></el-input-number> 次
                                    <small>发生次数，超过阈值，发送消息</small>
                                </el-form-item>
                                <el-form-item label="最近" prop="nearest">
                                    <el-input-number v-model="model.nearest" controls-position="right" :min="10*60" @change="nearestUpdate"></el-input-number> 秒
                                    <small>统计窗口，默认最近10分钟</small>
                                </el-form-item>
                                <el-form-item label="消息模板" prop="msg">
                                    <el-input type="textarea" v-model="model.msg" @change="msgUpdate"></textarea></el-input>
                                </el-form-item>
                                <el-form-item label="时间" prop="time">
                                    <small>#{moment(model.time).format('LLL')}#</small>
                                </el-form-item>
                                <el-form-item label="用户" prop="user">
                                    <small>#{model.user}#</small>
                                </el-form-item>
                            </el-form>
                        </el-car>`,
            data: function(){
                return {
                    dataFile: {
                        rules: [`/${window.SignedUser_UserName}/ai/words`]
                    },
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
                    rules:[],
                    names:{
                        inputVisible: false,
                        inputValue: ''
                    }
                }
            },
            mounted(){
                const self = this;

                self.$nextTick(function(){
                    self.initRules();
                })
            },
            methods: {
                initRules(){
                    const self = this;
                    try {
                        let fsList = fsHandler.fsList(self.dataFile.rules[0]);
                        
                        self.rules = [];
                        
                        _.forEach(fsList,function(v){
                            let tmp = fsHandler.fsContent(v.parent, v.name);
                            if(tmp){
                                self.rules.push(_.attempt(JSON.parse.bind(null, tmp)));
                            }
                        })
                    } catch(err){
                        self.rules = [];
                    }
                },  
                // 删除规则
                ruleRemove: function() {
                    const self = this;

                    alertify.confirm(`确认要删除该规则? <br><br> ${JSON.stringify(self.model,null,2)}`, function (e) {
                        if (e) {
                            self.rules.splice($.inArray(self.model,self.rules),1);

                            // 更新到文件系统
                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);
                            if(rtn==1){
                                // 刷新rules
                                eventHub.$emit("AI-SETUP-WORDS-RULES-REFRESH");
                            }
                        } else {
                            
                        }
                    });
                },
                nameRemove(tag) {
                    const self = this;

                    let index = _.findIndex(self.rules, {id: self.model.id});

                    self.model.name.splice($.inArray(tag,self.model.name), 1)

                    // 更新规则，没有关键字时status=0
                    self.rules[index] = _.extend(self.model, {name: self.model.name, status: self.model.name.length==0?'0':'1'});
                    
                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);

                },
                nameInputShow() {
                    const self = this;

                    self.names.inputVisible = true;
                    self.$nextTick(_ => {
                        self.$refs.saveTagInput.$refs.input.focus();
                    });
                },
                nameAdd() {
                    const self = this;

                    let inputValue = self.names.inputValue;
                    if (inputValue) {
                        self.model.name.push(inputValue);
                    }

                    let index = _.findIndex(self.rules, {id: self.model.id});
                    
                     // 更新规则，没有关键字时status=0
                     self.rules[index] = _.extend(self.model, {name: self.model.name});

                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);

                    if(rtn == 1){
                        self.names.inputVisible = false;
                        self.names.inputValue = '';
                    }
                },
                thresholdUpdate(evt){
                    const self = this;

                    let index = _.findIndex(self.rules, {id: self.model.id});

                    self.rules[index] = _.extend(self.model,{threshold:evt});
                    
                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);
                },
                statusUpdate(evt){
                    const self = this;

                    let index = _.findIndex(self.rules, {id: self.model.id});

                    self.rules[index] = _.extend(self.model,{status:evt+''});
                    
                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);
                },
                nearestUpdate(evt){
                    const self = this;

                    let index = _.findIndex(self.rules, {id: self.model.id});

                    self.rules[index] = _.extend(self.model,{nearest:evt+''});
                    
                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);
                },
                msgUpdate(evt){
                    const self = this;

                    let index = _.findIndex(self.rules, {id: self.model.id});

                    self.rules[index] = _.extend(self.model,{msg:evt});
                    
                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);
                }
            }
        })

        // 词频分析
        Vue.component('robot-ai-setup-words-analysis',{
            delimiters: ['#{', '}#'],
            template: `<el-container>
                            <el-main style="padding:10px;text-align: left;line-height: 45px;" id="words-rule-content"> 
                                <robot-ai-setup-words-input :id="'rule-'+rule.id" :model="rule" v-for="rule in rules"></robot-ai-setup-words-input>
                            </el-main>
                            <el-footer>
                                <div class="input-group" style="padding:5px 10px;">
                                    <input type="text" class="form-control" placeholder="新增词频规则" v-model="term" @keyup.13="add"/>
                                    <span class="input-group-btn">
                                        <a class="btn btn-grey" href="javascript:void(0);" @click="add"><i class="fas fa-paper-plane"></i></a>
                                    </span>
                                </div>
                            </el-footer>
                        </el-container>`,
            data: function(){
                return {
                    term: '',
                    dataFile: {
                        rules: [`/${window.SignedUser_UserName}/ai/words`]
                    },
                    rules: []
                }
            },
            watch:{
                rules(val,oldVal){
                    const self = this;

                    // 刷新title
                    eventHub.$emit("AI-SETUP-REFRESH-TITLE", {type:'words',count:this.rules.length});
                }
            },
            created(){
                // 刷新rules
                eventHub.$on("AI-SETUP-WORDS-RULES-REFRESH",this.init);
            },
            mounted(){
                const self = this;

                self.$nextTick(function(){
                    self.init();
                })
            },
            methods: {
                init(){
                    const self = this;
                    try {
                        let fsList = fsHandler.fsList(self.dataFile.rules[0]);
                        
                        self.rules = [];

                        _.forEach(fsList,function(v){
                            let tmp = fsHandler.fsContent(v.parent, v.name);
                            if(tmp){
                                self.rules.push(_.attempt(JSON.parse.bind(null, tmp)));
                            }
                        })
                    } catch(err){
                        self.rules = [];
                    }
                },  
                add: function(){
                    const self = this;
                    
                    if(!self.term) return false;

                    //if(_.indexOf(self.rules,self.term) !== -1) return false;
                    let content = { name: [self.term], 
                                    class: '', 
                                    status: '0', 
                                    threshold: 600, 
                                    msg:`{{.name}}词频预警：事件词频统计超过阈值 {{.threshold}}，请知晓！`, 
                                    ospace:window.COMPANY_OSPACE, 
                                    user:window.SignedUser_UserName, 
                                    time:_.now(),
                                    source: 'AI',
                                    subject: 'CPYJ',
                                    title: '词频分析'
                                };
                    let id = objectHash.sha1(content);
                    self.rules.push(_.merge({id:id},content));
                    
                    self.term = '';
                    
                    // 消息列表滚动到最底部
                    self.scrollSmoothToBottom('words-rule-content');

                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);
                },
                scrollSmoothToBottom (id) {
                    var div = document.getElementById(id);
                    $('#' + id).animate({
                        scrollTop: div.scrollHeight// - div.clientHeight
                    }, 500);
                }
            }
        })

        // 基线计算
        Vue.component('robot-ai-setup-baseline',{
            delimiters: ['#{', '}#'],
            template: `<el-container>
                            <el-main style="padding:10px;text-align: left;line-height: 45px;" id="words-content">
                                <el-tag
                                    v-for="word in words"
                                    :key="word"
                                    closable
                                    type=""
                                    @close="remove(word)"
                                    style="margin:0 2px;">
                                    #{word}#
                                </el-tag>
                            </el-main>
                            <el-footer>
                                <div class="input-group" style="padding:5px 10px;">
                                    <input type="text" class="form-control" placeholder="关键字输入" v-model="term" @keyup.13="add"/>
                                    <span class="input-group-btn">
                                        <a class="btn btn-grey" href="javascript:void(0);" @click="add"><i class="fas fa-paper-plane"></i></a>
                                    </span>
                                </div>
                            </el-footer>
                        </el-container>`,
            data: function(){
                return {
                    term: '',
                    dataFile: {
                        words: [`/${window.SignedUser_UserName}/ai/`,`words.json`],
                        relation: [`/${window.SignedUser_UserName}/ai/`,`relation.json`],
                    },
                    words:[],
                }
            },
            mounted(){
                const self = this;

                self.$nextTick(function(){
                    self.init();
                })
            },
            methods: {
                init(){
                    const self = this;
                    try {
                        let tmp = fsHandler.fsContent(self.dataFile.words[0], self.dataFile.words[1]);
                        if(tmp){
                            self.words = _.attempt(JSON.parse.bind(null, tmp));
                        }
                    } catch(err){
                        self.words = [];
                    }
                },  
                add: function(){
                    const self = this;
                    
                    if(!self.term) return false;

                    if(_.indexOf(self.words,self.term) !== -1) return false;

                    self.words.push(_.trim(self.term));
                    
                    self.term = '';
                    
                    // 消息列表滚动到最底部
                    self.scrollSmoothToBottom('words-content');

                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.words[0], self.dataFile.words[1], JSON.stringify(self.words), attr);
                },
                scrollSmoothToBottom (id) {
                    var div = document.getElementById(id);
                    $('#' + id).animate({
                        scrollTop: div.scrollHeight// - div.clientHeight
                    }, 500);
                },
                remove: function(item) {
                    const self = this;

                    self.words.splice($.inArray(item,self.words),1);

                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.words[0], self.dataFile.words[1], JSON.stringify(self.words), attr);
                }
            }
        })

        Vue.component('robot-ai-setup-neuralnetwork-cell',{
            delimiters: ['#{', '}#'],
            props:{
                id: String,
                model: Object
            },
            data(){
                return {
                    nodes: [],
                    rules: [],
                    dataFile: {
                        rules: [`/${window.SignedUser_UserName}/ai/neuralnetwork`]
                    },
                    names:{
                        inputVisible: false,
                        inputValue: ''
                    },
                    input:{
                        inputVisible: false,
                        inputValue: ''
                    },
                    hidden:{
                        inputVisible: false,
                        inputValue: ''
                    },
                    output:{
                        inputVisible: false,
                        inputValue: ''
                    }
                }
            },
            template:`<el-card :id="id" style="box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);padding: 5px 0px;line-height: 10px;margin-bottom:10px;">
                            <div slot="header" class="clearfix">
                                #{model.status==1?'启用中':'关闭中'}#
                                <el-switch v-model="model.status"
                                        active-color="#13ce66"
                                        inactive-color="#dddddd"
                                        active-value=1
                                        inactive-value=0
                                        @change="statusUpdate">
                                </el-switch>
                                <el-button size="mini" type="text" style="float: right; padding: 3px 0;outline: none;" @click="ruleRemove"><i class="fas fa-times"></i></el-button>
                            </div>
                            <el-form :model="model" label-width="80px">
                                <el-form-item label="关键词">
                                    <el-tag
                                        :key="tag"
                                        closable
                                        type=""
                                        @close="nameRemove(tag)"
                                        style="margin:0 2px;" v-for="tag in model.name">
                                        #{tag}#
                                    </el-tag>
                                    <el-input
                                        class="input-new-tag"
                                        v-if="names.inputVisible"
                                        v-model="names.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="nameAdd"
                                        @blur="nameAdd">
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="nameInputShow">+</el-button>
                                </el-form-item>
                                <el-form-item label="输入">
                                    <el-tag
                                        :key="tag"
                                        closable
                                        type=""
                                        @close="inputRemove(tag)"
                                        style="margin:0 2px;" v-for="tag in model.nodes.input">
                                        #{tag}#
                                    </el-tag>
                                    <el-input
                                        class="input-new-tag"
                                        v-if="input.inputVisible"
                                        v-model="input.inputValue"
                                        ref="saveInputInput"
                                        size="small"
                                        @keyup.enter.native="inputAdd"
                                        @blur="inputAdd">
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="inputInputShow">+</el-button>
                                </el-form-item>
                                <el-form-item>
                                    <div :id="id"></div>
                                </el-form-item>
                            </el-form>
                            
                        </el-card>`,
            mounted(){
                this.initRules();
                this.checkContainer();
            },
            methods:{
                checkContainer(){
                    const self = this;

                    if($(`#${self.id}`).is(':visible')) {
                        self.initNet();
                    } else {
                        setTimeout(self.checkContainer, 50);
                    }
                },
                initRules(){
                    const self = this;
                    try {
                        let fsList = fsHandler.fsList(self.dataFile.rules[0]);
                        
                        self.rules = [];
                        
                        _.forEach(fsList,function(v){
                            let tmp = fsHandler.fsContent(v.parent, v.name);
                            if(tmp){
                                self.rules.push(_.attempt(JSON.parse.bind(null, tmp)));
                            }
                        })
                    } catch(err){
                        self.rules = [];
                    }
                }, 
                initNet(){
                    const self = this;

                    self.nodes = self.model.nodes;

                    let width = $(self.$el).parent().width(),
                        height = $(self.$el).parent().height(),
                        nodeSize = 30;
                    
                    let color = d3.scale.category20();
                    
                    let svg = d3.select(`#${self.id}`).append("svg")
                        .attr("width", width)
                        .attr("height", height);
                    

                    let nodes = _.union(_.union(self.nodes.input,self.nodes.hidden),self.nodes.output);
                
                    // get network size
                    let netsize = {};
                    nodes.forEach(function (d) {
                    if(d.layer in netsize) {
                        netsize[d.layer] += 1;
                    } else {
                        netsize[d.layer] = 1;
                    }
                    d["lidx"] = netsize[d.layer];
                    });
                
                    // calc distances between nodes
                    let largestLayerSize = Math.max.apply(
                        null, Object.keys(netsize).map(function (i) { return netsize[i]; }));
                
                    let xdist = width / Object.keys(netsize).length,
                        ydist = height / largestLayerSize;
                
                    // create node locations
                    nodes.map(function(d) {
                    d["x"] = (d.layer - 0.5) * xdist;
                    d["y"] = (d.lidx - 0.5) * ydist;
                    });
                
                    // autogenerate links
                    let links = [];
                    nodes.map(function(d, i) {
                    for (var n in nodes) {
                        if (d.layer + 1 == nodes[n].layer) {
                        links.push({"source": parseInt(i), "target": parseInt(n), "value": 1}) }
                    }
                    }).filter(function(d) { return typeof d !== "undefined"; });
                
                    // draw links
                    let link = svg.selectAll(".link")
                        .data(links)
                    .enter().append("line")
                        .attr("class", "link")
                        .attr("x1", function(d) { return nodes[d.source].x; })
                        .attr("y1", function(d) { return nodes[d.source].y; })
                        .attr("x2", function(d) { return nodes[d.target].x; })
                        .attr("y2", function(d) { return nodes[d.target].y; })
                        .style("stroke-width", function(d) { return Math.sqrt(d.value); });
                
                    // draw nodes
                    let node = svg.selectAll(".node")
                        .data(nodes)
                    .enter().append("g")
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")"; }
                        );
                
                    let circle = node.append("circle")
                        .attr("class", "node")
                        .attr("r", nodeSize)
                        .style("fill", function(d) { return color(d.layer); });
                
                
                    node.append("text")
                        .attr("dx", "-.35em")
                        .attr("dy", ".35em")
                        .text(function(d) { return d.label; });
                
                },
                add: function(){
                    const self = this;
                    
                    if(!self.term) return false;

                    if(_.indexOf(self.nodes,self.term) !== -1) return false;

                    self.nodes.push(_.trim(self.term));
                    
                    self.term = '';
                    
                    // 消息列表滚动到最底部
                    self.scrollSmoothToBottom();

                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.neuralnetwork[0], self.dataFile.neuralnetwork[1], JSON.stringify(self.nodes), attr);
                },
                scrollSmoothToBottom () {
                    const self = this;

                    let id = `${self.id}-content`;
                    var div = document.getElementById(id);
                    $('#' + id).animate({
                        scrollTop: div.scrollHeight
                    }, 500);
                },
                statusUpdate(evt){
                    const self = this;

                    let index = _.findIndex(self.rules, {id: self.model.id});

                    self.rules[index] = _.extend(self.model,{status:evt+''});
                    
                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);
                },
                // 删除规则
                ruleRemove: function() {
                    const self = this;

                    alertify.confirm(`确认要删除该规则? <br><br> ${JSON.stringify(self.model,null,2)}`, function (e) {
                        if (e) {
                            self.rules.splice($.inArray(self.model,self.rules),1);

                            // 更新到文件系统
                            let attr = {ctime: _.now()};
                            let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);
                            if(rtn==1){
                                // 刷新rules
                                eventHub.$emit("AI-SETUP-NERUALNETWORK-RULES-REFRESH");
                            }
                        } else {
                            
                        }
                    });
                },
                nameRemove(tag) {
                    const self = this;

                    let index = _.findIndex(self.rules, {id: self.model.id});

                    self.model.name.splice($.inArray(tag,self.model.name), 1)

                    // 更新规则，没有关键字时status=0
                    self.rules[index] = _.extend(self.model, {name: self.model.name, status: self.model.name.length==0?'0':'1'});
                    
                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);

                },
                nameInputShow() {
                    const self = this;

                    self.names.inputVisible = true;
                    self.$nextTick(_ => {
                        self.$refs.saveTagInput.$refs.input.focus();
                    });
                },
                nameAdd() {
                    const self = this;

                    let inputValue = self.names.inputValue;
                    if (inputValue) {
                        self.model.name.push(inputValue);
                    }

                    let index = _.findIndex(self.rules, {id: self.model.id});
                    
                     // 更新规则，没有关键字时status=0
                     self.rules[index] = _.extend(self.model, {name: self.model.name});

                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);

                    if(rtn == 1){
                        self.names.inputVisible = false;
                        self.names.inputValue = '';
                    }
                },
                inputRemove(tag) {
                    const self = this;

                    let index = _.findIndex(self.rules, {id: self.model.id});

                    self.model.nodes.input.splice($.inArray(tag,self.model.nodes.input), 1)

                    // 更新规则，没有关键字时status=0
                    self.rules[index] = _.extend(self.model, {nodes: self.model.nodes, status: self.model.nodes.length==0?'0':'1'});
                    
                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);

                },
                inputInputShow() {
                    const self = this;

                    self.input.inputVisible = true;
                    self.$nextTick(_ => {
                        self.$refs.saveInputInput.$refs.input.focus();
                    });
                },
                inputAdd() {
                    const self = this;

                    let inputValue = self.input.inputValue;
                    if (inputValue) {
                        self.model.nodes.input.push({label:inputValue,layer:1,type:'i'});
                    }
                    
                    let index = _.findIndex(self.rules, {id: self.model.id});
                    
                     // 更新规则，没有关键字时status=0
                     self.rules[index] = self.model;//_.extend(self.model, {nodes: self.model.nodes});
                    
                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);

                    if(rtn == 1){
                        self.input.inputVisible = false;
                        self.input.inputValue = '';
                    }
                }
            }
        })

        // 神经元网络
        Vue.component('robot-ai-setup-neuralnetwork-analysis',{
            delimiters: ['#{', '}#'],
            template:   `<el-container>
                            <el-main style="padding:10px;text-align: left;line-height: 45px;" id="rule-content">
                                <robot-ai-setup-neuralnetwork-cell :id="'neuralnetwork-'+ objectHash.sha1(item)" :model="item" v-for="item in rules"></robot-ai-setup-neuralnetwork-cell>
                            </el-main>
                            <el-footer>
                                <div class="input-group" style="padding:5px 10px;">
                                    <input type="text" class="form-control" placeholder="新增规则名称" v-model="term" @keyup.13="add"/>
                                    <span class="input-group-btn">
                                        <a class="btn btn-grey" href="javascript:void(0);" @click="add"><i class="fas fa-paper-plane"></i></a>
                                    </span>
                                </div>
                            </el-footer>
                        </el-container>`,
            data: function(){
                return {
                    term: '',
                    dataFile: {
                        rules: [`/${window.SignedUser_UserName}/ai/`,`neuralnetwork.json`],
                    },
                    rules:[],
                }
            },
            watch:{
                rules(val,oldVal){
                    const self = this;

                    // 刷新title
                    eventHub.$emit("AI-SETUP-REFRESH-TITLE", {type:'neuralnetwork',count:this.rules.length});
                }
            },
            created(){
                // 刷新rules
                eventHub.$on("AI-SETUP-NERUALNETWORK-RULES-REFRESH",this.init);
            },
            mounted(){
                const self = this;

                self.$nextTick(function(){
                    self.init();
                })
            },
            methods: {
                init(){
                    const self = this;
                    try {
                        let tmp = fsHandler.fsContent(self.dataFile.rules[0], self.dataFile.rules[1]);
                        if(tmp){
                            self.rules = eval(tmp);
                        }
                    } catch(err){
                        self.rules = [];
                    }
                },
                add: function(){
                    const self = this;
                    
                    if(!self.term) return false;

                    //if(_.indexOf(self.rules,self.term) !== -1) return false;
                    let content = { name: [self.term], 
                                    status: '0', 
                                    nodes:[],
                                    msg:`神经网络分析：{{.name}}统计超过阈值 {{.threshold}}，请知晓！`, 
                                    ospace:window.COMPANY_OSPACE, 
                                    user:window.SignedUser_UserName, 
                                    time:_.now(),
                                    source: 'AI',
                                    subject: 'NEURALWORK',
                                    title: '神经网络分析'
                                };
                    let id = objectHash.sha1(content);
                    self.rules.push(_.merge({id:id},content));
                    
                    self.term = '';
                    
                    // 消息列表滚动到最底部
                    self.scrollSmoothToBottom('rule-content');

                    // 更新到文件系统
                    let attr = {ctime: _.now()};
                    let rtn = fsHandler.fsNew('json', self.dataFile.rules[0], self.dataFile.rules[1], JSON.stringify(self.rules,null,2), attr);
                },
                scrollSmoothToBottom (id) {
                    var div = document.getElementById(id);
                    $('#' + id).animate({
                        scrollTop: div.scrollHeight// - div.clientHeight
                    }, 500);
                }
            }
        })

    }

}

let maxRobot = new Robot();
maxRobot.init();