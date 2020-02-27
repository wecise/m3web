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
                            <el-main>
                            <el-row>
                                <el-col :span="24">
                                    
                                    <el-card style="padding: 20px 15em;">
                                        <img src='${window.ASSETS_ICON}/robot/png/robot.png?issys=true&type=download' style="width:180px;">
                                        <div>
                                            <h2>唯简运维机器人</h2>
                                            <p>在岗：9个月</p>
                                            <p>入岗：2017-02-03</p>
                                            <p>专注于IT运维领域的日常运维</p>
                                            <p>专业技能：词频分析、关联分析和神经元网络</p>
                                            <p>
                                                <el-button type="success"> 联系 </el-button>
                                                <el-button type="success"> 技能 </el-button>
                                            </p>
                                        </div>
                                    </el-card>
                                    
                                </el-col>
                            </el-row>
                            </el-main>
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
                            <el-aside width="220px" style="height:100%;overflow: auto;background: transparent;">
                                <el-container>
                                    <el-header style="height:40px;line-height:40px;">
                                        <el-input v-model="message.search.term" placeholder="搜索">
                                            <el-button slot="append" type="text" icon="el-icon-plus"></el-button>
                                        </el-input>
                                    </el-header>
                                    <el-main style="padding:0px;overflow-x:hidden;">
                                        <el-button type="text" :class="[index==0?'selected':'']" :id="objectHash.sha1(item)" 
                                            v-for="(item,index) in message.subject" 
                                            style="border-bottom: 1px solid rgb(221, 221, 221);padding: 0px;cursor: pointer;width:100%;" @click="clickMe(item)">
                                            <div style="display:flex;flex-wrap: nowrap;">
                                                <div style="padding: 8px;">
                                                    <span class="fas fa-circle" style="position: absolute;left:40px;color: rgb(255, 0, 0);transform: scale(.7);" v-if="item.msgs.length>0"></span>
                                                    <el-avatar shape="square" size="42" :src="'/fs/assets/images/robot/png/'+item.icon + '.png?type=download&issys=true'"></el-avatar>
                                                </div>
                                                <div style="text-align: left;">
                                                    <h5 style="margin: 10px 0px;">#{item.title}#</h5>
                                                    <span>#{moment(item.vtime).format("L, ddd, HH:MM A")}#</span>
                                                </div>
                                            </template>
                                        </el-button>
                                    </el-main>
                                </el-container>
                            </el-aside>
                            <el-container>
                                <el-main style="text-align: center;line-height: 30px;background:rgb(228, 231, 237);overflow:hidden auto;border:1px solid #ddd;" id="subject-msgs">
                                    <ul class="chats">
                                        <li :class="item.type" v-for="item in message.defaultSubject.msgs">
                                            <span class="date-time">#{moment(item.ctime).format("LLL")}#</span>
                                            <el-link :underline="false" class="name">#{item.icon}#</el-link>
                                            <el-link :underline="false" class="image">
                                                <el-image :src="'/fs/assets/images/robot/png/'+item.icon + '.png?type=open&issys=true'" style="width: 42px;height: 42px;" ></el-image>
                                            </el-link>
                                            <div class="message animated pulse" contenteditable="false" style="outline:none;">
                                                #{item.msg}#
                                            </div>
                                        </li>
                                    </ul>
                                </el-main>
                                <el-footer style="padding:10px;">
                                    <el-input placeholder="消息输入" v-model="message.term" @keyup.13="sendMsg">
                                        <el-button slot="append" type="primary" icon="el-icon-position" @click="sendMsg"></el-button>
                                    </el-input>
                                </el-footer>
                            </el-container>
                        </el-container>`,
            computed: {
                allMsg(){
                    return _.sumBy(this.message.subject,function(v){ return v.msgs.length; });
                }
            },
            created(){
                eventHub.$on("WIN-CLOSE-EVENT",()=>{
                    this.message.ws.close(this.message.ws);
                });

                // 初始化主题
                this.message.subject = fsHandler.callFsJScript("/matrix/ai/subscribe.js", null).message;
                
            },
            mounted(){
            
                // 默认主题消息
                let item = _.first(this.message.subject);
                let message = fsHandler.callFsJScript("/matrix/ai/getMessage.js", encodeURIComponent(JSON.stringify(item)) ).message;
                this.message.defaultSubject = _.extend(item, {msgs:message});

                // 初始化默认WS
                this.initWs(item);

                // 消息列表滚动到最底部
                this.scrollSmoothToBottom('subject-msgs');
    
                this.$nextTick(function(){
                    
                })
            },
            destroyed(){
                this.message.ws.close(this.message.ws);
            },
            methods: {
                initWs(item) {
                    
                    if(this.message.ws) {
                        this.message.ws.close(this.message.ws);
                    }

                    try {
                        if(!this.message.ws){
                            this.message.ws = new WebSocket(`ws://${document.location.host}/websocket/${item.subject}?source=${item.source}&title=${item.title}`);
                        }

                        this.message.ws.onopen = function(evt) {
                            console.log("已打开: " + JSON.stringify(evt), this.message.ws);
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
                                this.message.defaultSubject.msgs.push(_.merge(JSON.parse(wsMsg),{icon:'event',type:'from'}));
                                // 消息列表滚动到最底部
                                this.scrollSmoothToBottom('subject-msgs');
                            }
                        };
                    } catch (err) {
                        console.error(err);
                    }
    
                },
                sendMessage(){
                    if (this.message.ws.readyState === 1) {
                        this.message.ws.send(`事件来了 ${moment().format("hh:mm:ss a")} 来自 ${this.message.wsUrl}`);
                    }
                },
                apply(){
                    if(this.message.ws){
    
                        this.ws.close(this.message.ws);
    
                        this.init();
    
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
    
                    this.message.defaultSubject.msgs.push({icon:'online-service', time:_.now(), msg:this.message.term, type: 'to'});

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
                    currentView: '',
                    setup: {
                        default: {},
                        list: [
                            
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
                                       
                                    </el-main>
                                </el-container>
                            </el-aside>
                            
                        </el-container>`,
            created(){
                
            },
            mounted(){
                $(this.$el).find(".el-tabs__header.is-top").remove();
            },
            methods:{
                
            }
        });

    }

}

let maxRobot = new Robot();
maxRobot.init();