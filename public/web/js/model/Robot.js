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
            delimiters: ['${', '}'],
            props: {
                model: Object
            },
            template: `<div class="row">
                        <div class="col-lg-2">
                            
                        </div>
                        <div class="col-lg-10 auto-container">
                            <h4 class="page-header"><i class="fas fa-angle-right"></i> 自动化部署</h4 class="page-header">
                            
                        </div>
                    </div>`
        });

        Vue.component("ai-message", {
            delimiters: ['${', '}'],
            props: {
                model: Object
            },
            data(){
                return {
                    message: {
                        term: "",
                        defaultSubject: [],
                        subject: [
                            {name:'告警事件',icon:'event', time:_.now(), msgs:[
                                    {icon:'event', time:_.now(), msg:'文件系统/opt使用率超过99%', type: 'from'},
                                    {icon:'wzd', time:_.now(), msg:'请生成wecise最近的性能曲线', type: 'to'},
                                    {icon:'event', time:_.now(), msg:'文件系统/opt使用率超过99%', type: 'from'}
                                ]
                            },
                            {name:'根原因分析',icon:'service', time:_.now(), msgs:[
                                    {icon:'service', time: _.now(), msg: '当前根原因事件：文件系统/opt使用率超过99%', type: 'from'}
                                ]
                            },
                            {name:'词频预警',icon:'event', time:_.now(), msgs:[
                                    {icon:'event', time:_.now(), msg: 'PMTS告警事件中，host=wecise事件超过正常值。', type: 'from'},
                                ]
                            },
                            {name:'基线预警',icon:'performance', time:_.now(), msgs:[
                                    {icon:'performance', time:_.now(), msg:'wecise服务器CPU使用率超过基线值200%。', type: 'from'}
                                ]
                            },
                            {name:'关联分析',icon:'cell', time:_.now(), msgs:[
                                    {icon:'cell', time:_.now(), msg: '关联模型一异常', type: 'from'},
                                ]
                            }
                        ],
                        ws: null,
                        wsUrl: 'ws://47.92.151.165/websocket/event',//'wss://echo.websocket.org',
                        message: ["这里接收事件"],
                        cron:{
                            sched: null,
                            timer: null
                        }
                    }
                }
            },
            template: ` <div>
                            <span slot="label">
                                <a href="javascript:void(0);">消息 <span class="badge" style="position: absolute;background: rgb(255, 0, 0);" v-if="allMsg>0">${allMsg}</span></a>
                            </span>
                            <el-container>
                                <el-aside width="35%" style="height:100%;overflow: auto;background: transparent;border-right:1px solid #dddddd;">
                                    <div class="media" :class="[index==0?'selected':'']" :id="objectHash.sha1(item)" v-for="(item,index) in message.subject" style="border-bottom: 1px solid rgb(221, 221, 221);padding: 5px;cursor: pointer;margin: 0px;" @click="clickMe(item)">
                                        <div class="media-left">
                                            <span class="fas fa-circle" style="position: absolute;left:120px;color: rgb(255, 0, 0);transform: scale(.7);" v-if="item.msgs.length>0"></span>
                                            <a href="#">
                                                <img class="media-object" :src="'/fs/assets/images/robot/png/'+item.icon + '.png?type=download&issys=true'" style="width: 42px;height: 42px;">
                                            </a>
                                        </div>
                                        <div class="media-body" style="text-align: left;">
                                            <h5 class="media-heading">${item.name}</h5>
                                            <span class="date-time">${moment(item.time).format("LLL")}</span>
                                        </div>
                                    </div>
                                </el-aside>
                                <el-container>
                                    <el-main style="padding:0px;text-align: center;line-height: 30px;" id="subject-msgs">
                                        <div class="collapse" id="wsSetup">
                                            <div class="input-group">
                                                <input type="text" class="form-control no-border" v-model="message.wsUrl">
                                                <span class="input-group-btn">
                                                    <button class="btn btn-default ws-setup" type="button" @click="apply">应用</button>
                                                </span>
                                            </div>
                                        </div>
                                        <ul class="chats">
                                            <li :class="item.type" v-for="item in message.defaultSubject.msgs">
                                                <span class="date-time">${moment(item.time).format("LLL")}</span>
                                                <a href="javascript:;" class="name">${item.icon}</a>
                                                <a href="javascript:;" class="image">
                                                    <img alt="" :src="'/fs/assets/images/robot/png/'+item.icon + '.png?type=download&issys=true'" style="width: 42px;height: 42px;" />
                                                </a>
                                                <div class="message animated pulse" contenteditable="true" style="outline:none;">
                                                    ${item.msg}
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
                            </el-container>
                        </div>`,
            computed: {
                allMsg(){
                    return _.sumBy(this.message.subject,function(v){ return v.msgs.length; });
                }
            },
            created: function(){
                const self = this;

                eventHub.$on("win-close-event",self.wsClose);    
            },
            mounted: function(){
                const self = this;
                
                this.message.defaultSubject = _.first(this.message.subject);
    
                self.$nextTick(function(){
                    _.delay(function(){
                        self.init();
                    },500);
    
                    self.initPlugin();
                })
            },
            destroyed: function(){
                let self = this;
    
                mxWebSocket.webSocketClose(self.ws);
            },
            methods: {
                init: function(event) {
                    let self = this;
    
                    self.message.ws = new WebSocket('ws://47.92.151.165/websocket/event');//mxWebSocket.webSocketNew(self.wsUrl);
    
                    self.message.ws.onopen = function() {
    
                        //alertify.log("已连接");
    
                        if (self.message.ws.readyState === 1) {
                            self.message.ws.send("发送测试数据");
                        }
                    };
    
                    self.message.ws.onmessage = function (ev) {
                        //alertify.log('接收消息');
                        self.message.message.push(ev.data);
                    };
    
                    self.message.ws.onclose = function()
                    {
                        alertify.log("连接关闭...");
                        self.message.message = ["..."];
                    };
    
                    self.message.ws.onerror = function(e){
                        console.log(e);
                    };
    
    
    
                },
                initPlugin: function(){
                    let self = this;
    
                    self.message.cron.sched = later.parse.text('every 5 sec');
                    self.message.cron.timer = later.setInterval(self.sendMessage, self.message.cron.sched);
    
                },
                sendMessage: function(){
                    let self = this;
    
                    if (self.message.ws.readyState === 1) {
                        self.message.ws.send(`事件来了 ${moment().format("hh:mm:ss a")} 来自 ${self.message.wsUrl}`);
                    }
                },
                apply: function(){
                    let self = this;
    
                    if(self.message.ws){
    
                        mxWebSocket.webSocketClose(self.message.ws);
    
                        self.init();
    
                        $('#wsSetup').collapse('hide');
                    }
                },
                wsClose: function(){
                    let self = this;
    
                    self.message.cron.sched = null;
                    self.message.cron.timer = null;
    
                    mxWebSocket.webSocketClose(self.message.ws);
                },
                clickMe(item){
                    $(this.$el).find(".selected").removeClass("selected");
                    $(`#${objectHash.sha1(item)}`).addClass("selected");
    
                    this.message.defaultSubject = item;
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
            delimiters: ['${', '}'],
            props: {
                model: Object
            },
            template:   `<el-container>
                            <el-aside width="35%" style="height:100%;overflow: auto;background: transparent;border-right:1px solid #dddddd;">
                                
                            </el-aside>
                            <el-container>
                                <el-main style="padding:0px;text-align: center;line-height: 30px;">
                                    
                                </el-main>
                                <el-footer>
                                    
                                </el-footer>
                            </el-container>
                        </el-container>`,
        });
    }

}

let maxRobot = new Robot();
maxRobot.init();