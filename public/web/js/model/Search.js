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
class Search {

    constructor() {
        this.app = null;
    }

    init() {

        VueLoader.onloaded(["search-preset-component",
                            "search-base-component",
                            "ai-robot-component"],function() {

            $(function(){

                Vue.component('el-timeline-component',{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    template:   `<el-timeline>
                                    <el-timeline-item :timestamp="moment(item.vtime).format('LLL')" placement="top" v-for="item in model.list">
                                        
                                        <el-card v-if="_.startsWith(item.class,'/matrix/devops/event')">
                                            <h4 v-if="item.cxType" style="float: right;padding:10px;margin:5px;">#{item.cxType}#</h4>
                                            <h4>#{item.host}#</h4>
                                            <pre>
                                                #{item.msg}#
                                            </pre>
                                        </el-card>
                                        <el-card v-else-if="_.startsWith(item.class,'/matrix/devops/log')">
                                            <h4 v-if="item.cxType" style="float: right;padding:10px;margin:5px;">#{item.cxType}#</h4>
                                            <h4>#{item.host}#</h4>
                                            <pre>
                                                #{item.msg}#
                                            </pre>
                                        </el-card>
                                        <el-card v-else-if="_.startsWith(item.class,'/matrix/devops/performance')">
                                            <h4 v-if="item.cxType" style="float: right;padding:10px;margin:5px;">#{item.cxType}#</h4>
                                            <h4>#{item.host}# <small>服务器</small></h4>
                                            <h4>#{item.ip}# <small>IP</small></h4>
                                            <p>#{item.inst}# <small>实例</small></p>
                                            <p>#{item.param}# <small>参数</small></p>
                                            <p v-if=" _.includes(['usedpercent','response rate','success rate','cpu','cpu_usedpercent','memory_usedpercent','disk_usedpercent'],item.param)">
                                                <span style='color:#0088CC;'><b>#{_.round(item.value,2)}#%</b> <small>值</small></span>
                                            </p>   
                                            <p v-else-if=" _.includes(['cores'],item.param)">
                                                <span style='color:#0088CC;'><b>#{ _.round(item.value,2) }#</b> <small>值</small></span>
                                            </p>
                                            <p v-else-if=" _.includes(['response time'],item.param)">
                                                <span style='color:#0088CC;'><b>#{ _.round(item.value,2) }# MS</b> <small>值</small></span>
                                            </p>
                                            <p v-else-if=" _.includes(['transaction'],item.param)">
                                                <span style='color:#0088CC;'><b>#{ _.round(item.value,2) }# 笔</b> <small>值</small></span>
                                            </p>
                                            <p v-else>
                                                <span style='color:#0088CC;'><b>#{ mx.bytesToSize(item.value) }#</b> <small>值</small></span>
                                            </p>
                                        </el-card>
                                        <el-card v-else-if="_.startsWith(item.class,'/matrix/devops/journal')">
                                            <h4 v-if="item.cxType" style="float: right;padding:10px;margin:5px;">#{item.cxType}#</h4>
                                            <h4>#{item.host}#</h4>
                                            <pre>
                                                #{item.msg}#
                                            </pre>
                                        </el-card>
                                        <el-card v-else-if="_.startsWith(item.class,'/matrix/filesystem')">
                                            <h4 v-if="item.cxType" style="float: right;padding:10px;margin:5px;">#{item.cxType}#</h4>
                                            <h4>#{item.host}#</h4>
                                            <attr>
                                                #{item.fullname}#
                                            </attr>
                                        </el-card>
                                        <el-card v-else>
                                            <h4 v-if="item.cxType" style="float: right;padding:10px;margin:5px;">#{item.cxType}#</h4>
                                            <h4>#{item.host}#</h4>
                                            <p>
                                                #{item.class}#
                                                #{item.name}#
                                            </p>
                                        </el-card>
                                    </el-timeline-item>
                                </el-timeline>`
                })

                // knowledge View
                Vue.component('knowledge-view',{
                    delimiters: ['#{', '}#'],
                    props: {
                        model: Object
                    },
                    data(){
                        return {
                            editor: null,
                            splitInst: null,
                            compiledMarkdown: "",
                            mdOption: {
                                renderer: new marked.Renderer(),
                                gfm: true,
                                tables: true,
                                breaks: false,
                                pedantic: false,
                                sanitize: false,
                                smartLists: true,
                                smartypants: false
                            },
                            mode:"view"
                        }
                    },
                    template:   `<el-container style="height:100%;">
                                    <el-header style="height:40px;line-height:40px;">
                                        <span style="font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;" v-if="!_.isEmpty(model)">
                                            #{model.item.name | pickName}#
                                        </span>
                                        <el-button type="text" icon="el-icon-s-platform" @click="mode='view'" style="margin-left:10px;float:right;"></el-button>
                                        <el-button type="text" icon="el-icon-edit" @click="mode='edit'" style="float:right;"></el-button>
                                    </el-header>
                                    <el-main style="height:100%;padding:0px;overflow:hidden;">
                                        <el-container style="height:100%;">
                                            <el-aside style="width:50%;" ref="editor">
                                            </el-aside>
                                            <el-main style="width:50%;height:100%;" ref="content" v-html="compiledMarkdown">
                                            </el-main>
                                        </el-container>
                                    </el-main>
                                </el-container>`,
                    filters: {
                        pickName(name){
                            try{
                                return _.head(name.split(".md"));
                            } catch(err){
                                return name;
                            }
                        }
                    },
                    watch:{
                        model:{
                            handler(val,oldVal){
                                if(this.editor){
                                    this.editor.setValue(val.content);
                                    this.compiledMarkdown = marked(val.content);
                                }
                            },
                            deep:true
                        },
                        mode:{
                            handler(val,oldVal){
                                if(val === 'view'){
                                    $(this.$refs.editor.$el).hide();
                                    //this.splitInst.setSizes([0, 100]);
                                } else {
                                    $(this.$refs.editor.$el).show();
                                    //this.splitInst.setSizes([50, 50]);
                                }
                            }
                        }
                    },
                    mounted(){
                        this.$nextTick(()=>{
                            //this.initSplit();
                            this.initEditor();
                            $(this.$refs.editor.$el).hide();
                        })
                    },
                    methods: {
                        initEditor(){
                            try{
                                // Editor
                                this.editor = ace.edit(this.$refs.editor.$el);
                                this.editor.setOptions({
                                    //maxLines: 1000,
                                    minLines: 20,
                                    autoScrollEditorIntoView: false,
                                    enableBasicAutocompletion: false,
                                    enableLiveAutocompletion: false
                                });
                                this.editor.on("input", ()=> {
                                    this.compiledMarkdown = marked(this.editor.getValue());
                                    this.onSave();
                                });
                                this.editor.setTheme("ace/theme/tomorrow");
                                this.editor.getSession().setMode("ace/mode/markdown");
                                this.editor.renderer.setShowGutter(false);
                                
                                if(!_.isEmpty(this.model.content)){
                                    this.editor.setValue(this.model.content);
                                }
                            } catch(err){
                                console.log(err)
                            }

                        },
                        initSplit(){
                            if(!this.splitInst){
                                this.splitInst = Split([this.$refs.editor.$el, this.$refs.content.$el], {
                                    sizes: [0, 100],
                                    minSize: [0, 0],
                                    gutterSize: 5,
                                    cursor: 'col-resize',
                                    direction: 'horizontal',
                                    expandToMin: true
                                });
                            }
                        },
                        onSave: _.debounce(function(){
                                    try{
                                        let attr = null;
                                        
                                        if(_.isEmpty(data.attr)){
                                            attr = {remark: '', ctime: _.now(), author: window.SignedUser_UserName, rate:1};
                                        } else {
                                            attr = _.attempt(JSON.parse.bind(null, data.attr));
                                            if(attr.rate){
                                                _.extend(attr, {rate:attr.rate + 1});    
                                            } else {
                                                _.extend(attr, {rate:1}); 
                                            }
                                        }
                                        
                                        fsHandler.fsNew(this.model.item.ftype, this.model.item.parent, this.model.item.name, this.editor.getValue(), attr);    
                                        
                                    } catch(err){

                                    }
                                    
                                },5000)
    
                    }
                });
                
                Vue.component('el-table-component', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-table
                                    :data="rows"
                                    stripe
                                    style="width: 100%"
                                    :row-class-name="rowClassName"
                                    :header-cell-style="headerRender"
                                    @row-dblclick="rowDblclick">
                                    <el-table-column type="expand">
                                        <template slot-scope="props">
                                            <el-container style="width:80%;height:100%;">
                                                <el-main>
                                                    <el-form label-width="120px">
                                                        <el-form-item v-for="v,k in props.row" :label="k">
                                                            <el-input type="textarea" :rows="3" :value="v|pickString" v-if="typeof v ==='object'"></el-input>
                                                            <el-input :value="v" v-else></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-main>
                                            </el-container>
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
                                </el-table>`,
                    props:{
                        columns: Array,
                        rows: Array,
                        forward: String
                    },
                    data(){
                        return {
                            dt: {
                                rows:[],
                                columns: []
                            }
                        }
                    },
                    filters:{
                        pickString(item){
                            try{
                                return JSON.stringify(item,null,2);
                            } catch(err){
                                return item;
                            }
                        }
                    },
                    created() {
                        this.dt.columns =   _.map(this.columns,function(v){
                                                if(v.render){
                                                    v.render = eval(v.render);
                                                }
                                                return v;
                                            });
                    },
                    mounted() {
                        
                        this.$nextTick( ()=> {
                            
                            $(this.$el).on('dbl-click-row.bs.table', function (e, row, $element) {
                                let term = row.id;
                                let url = `/matrix/${this.forward}?term=${window.btoa(encodeURIComponent(term))}`;
                                window.open(url,'_blank');
                            });

                            $(this.$el).on('click-row.bs.table', function (e, row, $element) {
                                $('.info').removeClass('info');
                                $($element).addClass('info');
                            });
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
                        rowDblclick(row, column, event){
                            let term = row.id;
                            let url = `/matrix/${this.forward}?term=${window.btoa(encodeURIComponent(term))}`;
                            window.open(url,'_blank');
                        }
                    }
                }); 

                Vue.component('search-event', {
                    delimiters: ['#{', '}#'],
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    },
                    filters:{
                        pickUrl(item){
                            try{
                                return '/matrix/event?cond='+item.id+'&preset='+item.preset;
                            } catch(err){
                                return '';
                            }
                        },
                        pickStyle(item){
                            try{
                                return 'background:'+mx.global.register.event.severity[item.severity][2]+';color:#FFFFFF;';
                            } catch(err){
                                return '';
                            }
                        },
                        pickSeverity(item){
                            try{
                                return mx.global.register.event.severity[item.severity][1];
                            } catch(err){
                                return item.severity;
                            }
                        },
                        pickLocaleTime(item){
                            try{
                                return moment(item.vtime).format("LLL");
                            } catch(err){
                                return '';
                            }
                        },
                        pickBgStyle(item){
                            let hexToRgba = function(hex, opacity) {
                                var RGBA = "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt( "0x" + hex.slice(5, 7)) + "," + opacity + ")";
                                return {
                                    red: parseInt("0x" + hex.slice(1, 3)),
                                    green: parseInt("0x" + hex.slice(3, 5)),
                                    blue: parseInt("0x" + hex.slice(5, 7)),
                                    rgba: RGBA
                                }
                            };
                            let rgbaColor = hexToRgba(mx.global.register.event.severity[item.severity][2],0.1).rgba;
                            return `background:linear-gradient(to top, ${rgbaColor}, rgb(255,255,255));border: 1px solid rgb(247, 247, 247);border-radius: 5px;box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;line-height:1.5;`;
                        }
                    },
                    template:   `<el-container id="search-event" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-warning" @click="showContent=!showContent"> 事件</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <el-tabs>
                                            <el-tab-pane>
                                                <span slot="label">
                                                     <i class="el-icon-s-grid"></i>
                                                </span>
                                                <el-table-component :columns="model.columns"  
                                                                    :rows="model.rows" forward="event">
                                                </el-table-component>
                                            </el-tab-pane>
                                            <el-tab-pane>
                                                <span slot="label">
                                                    <i class="el-icon-tickets"></i>
                                                </span>
                                                <div v-for="item in model.rows">
                                                    <h5>
                                                        <el-link :href="item | pickUrl" target="_blank">#{item.host}#</el-link>
                                                    </h5>
                                                    <p>
                                                        <el-button :style="item | pickStyle">#{item.severity}#</el-button>
                                                    </p>
                                                    <p>
                                                        <i class="el-icon-timer"></i> 时间： #{ item | pickLocaleTime }#
                                                    </p>
                                                    <p>
                                                        <el-tag v-for="(k,v) in item.tag">#{ v }#</el-tag>
                                                    </p>
                                                    <p>#{item.msg}#</p>
                                                    <el-divider></el-divider>
                                                </div>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`
                });

                Vue.component('search-syslog', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-syslog" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-document" @click="showContent=!showContent"> Syslog</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <el-tabs>
                                            <el-tab-pane>
                                                <span slot="label">
                                                     <i class="el-icon-s-grid"></i>
                                                </span>
                                                <el-table-component :columns="model.columns" 
                                                                    :data="model.rows"
                                                                    forward="event"></el-table-component>
                                            </el-tab-pane>
                                            <el-tab-pane>
                                                <span slot="label">
                                                    <i class="el-icon-tickets"></i>
                                                </span>
                                                <div v-for="item in model.rows" v-if="item">
                                                    <h6>
                                                        <el-link :href="'/matrix/event?cond='+item.id+'&preset='+item.preset" target="_blank">#{item.host}#</el-link>
                                                    </h6>
                                                    <p>
                                                        <el-button :style="'background:'+mx.global.register.log.severity[item.severity][2]+';color:#FFFFFF;'">#{mx.global.register.log.severity[item.severity][1]}#</el-button>
                                                    </p>
                                                    <p>
                                                        <i class="el-icon-timer"></i> 时间： #{ new Date(item.vtime).toLocaleString() }#
                                                    </p>
                                                    <p>
                                                        <i class="el-icon-price-tag" v-for="(k,v) in item.tag"> <a href="#"> #{ v }# </a> &nbsp; </i> 
                                                    </p>
                                                    <p>#{item.msg}#</p>
                                                    <el-divider></el-divider>
                                                </div>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    }
                }); 

                Vue.component('search-journal', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-journal" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-map-location" @click="showContent=!showContent"> 告警轨迹</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <el-tabs>
                                            <el-tab-pane>
                                                <span slot="label">
                                                     <i class="el-icon-s-grid"></i>
                                                </span>
                                                <el-table-component :columns="model.columns" 
                                                                    :data="model.rows"
                                                                    forward="event"></el-table-component>
                                            </el-tab-pane>
                                            <el-tab-pane>
                                                <span slot="label">
                                                    <i class="el-icon-tickets"></i>
                                                </span>
                                                <div v-for="item in model.rows" v-if="item">
                                                    <h6>
                                                        <el-link :href="'/matrix/event?cond='+item.id+'&preset='+item.preset" target="_blank">#{item.host}#</el-link>
                                                    </h6>
                                                    <p>
                                                        <i class="el-icon-timer"></i> 时间： #{ new Date(item.vtime).toLocaleString() }#
                                                    </p>
                                                    <p>
                                                        <i class="el-icon-price-tag" v-for="(k,v) in item.tag"> <a href="#"> #{ v }# </a> &nbsp; </i> 
                                                    </p>
                                                    <p>#{item.msg}#</p>
                                                    <el-divider></el-divider>
                                                </div>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    }
                }); 

                Vue.component('search-log', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-log" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-document" @click="showContent=!showContent"> 日志</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <el-tabs>
                                            <el-tab-pane>
                                                <span slot="label">
                                                     <i class="el-icon-s-grid"></i>
                                                </span>
                                                <el-table-component :columns="model.columns" 
                                                                            :rows="model.rows"
                                                                            forward="log"></el-table-component>
                                            </el-tab-pane>
                                            <el-tab-pane>
                                                <span slot="label">
                                                    <i class="el-icon-tickets"></i>
                                                </span>
                                                <div v-for="item in model.rows" v-if="item">
                                                    <h6>
                                                        <el-link :href="'/matrix/log?cond='+item.id+'&preset='+item.preset" target="_blank">#{item.host}#</el-link>
                                                    </h6>
                                                    <p>
                                                        <el-button :style="'background:'+mx.global.register.log.severity[item.severity][2]+';color:#FFFFFF;'">#{mx.global.register.log.severity[item.severity][1]}#</el-button>
                                                    </p>
                                                    <p>
                                                        <i class="el-icon-timer"></i> 时间： #{ new Date(item.vtime).toLocaleString() }#
                                                    </p>
                                                    <p>
                                                        <i class="el-icon-price-tag" v-for="(k,v) in item.tag"> <a href="#"> #{ v }# </a> &nbsp; </i> 
                                                    </p>
                                                    <p>#{item.msg}#</p>
                                                    <el-divider></el-divider>
                                                </div>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    }
                }); 

                Vue.component('search-raw', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-raw" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-document" @click="showContent=!showContent"> 原始报文</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <el-tabs>
                                            <el-tab-pane>
                                                <span slot="label">
                                                     <i class="el-icon-s-grid"></i>
                                                </span>
                                                <el-table-component :columns="model.columns" 
                                                                            :rows="model.rows"
                                                                            forward="log"></el-table-component>
                                            </el-tab-pane>
                                            <el-tab-pane>
                                                <span slot="label">
                                                    <i class="el-icon-tickets"></i>
                                                </span>
                                                <div v-for="item in model.rows" v-if="item">
                                                    <h6>
                                                        <el-link :href="'/matrix/log?cond='+item.id+'&preset='+item.preset" target="_blank">#{item.host}#</el-link>
                                                    </h6>
                                                    <p>
                                                        <el-button :style="'background:'+mx.global.register.log.severity[item.severity][2]+';color:#FFFFFF;'">#{mx.global.register.log.severity[item.severity][1]}#</el-button>
                                                    </p>
                                                    <p>
                                                        <i class="el-icon-timer"></i> 时间： #{ new Date(item.vtime).toLocaleString() }#
                                                    </p>
                                                    <p>
                                                        <i class="el-icon-price-tag" v-for="(k,v) in item.tag"> <a href="#"> #{ v }# </a> &nbsp; </i> 
                                                    </p>
                                                    <p>#{item.msg}#</p>
                                                    <el-divider></el-divider>
                                                </div>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    }
                }); 

                Vue.component('search-tickets', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-tickets" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-notebook-1" @click="showContent=!showContent"> 问题单</el-button>
                                    </el-header> 
                                        
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <el-tabs>
                                            <el-tab-pane>
                                                <span slot="label">
                                                     <i class="el-icon-s-grid"></i>
                                                </span>
                                                <el-table-component :columns="model.columns" 
                                                                            :rows="model.rows">
                                                </el-table-component>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    }
                }); 

                Vue.component('search-change', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-change" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">  
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-document-copy" @click="showContent=!showContent"> 变更单</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <el-tabs>
                                            <el-tab-pane>
                                                <span slot="label">
                                                     <i class="el-icon-s-grid"></i>
                                                </span>
                                                <el-table-component :columns="model.columns" 
                                                                                :rows="model.rows">
                                                </el-table-component>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    }
                }); 

                Vue.component('search-performance', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-performance" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-data-line" @click="showContent=!showContent"> 性能</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <el-table-component :columns="model.columns" 
                                            :rows="model.rows"
                                            forward="performance"></el-table-component>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    }
                }); 

                Vue.component('search-graph', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-graph" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-picture-outline" @click="showContent=!showContent"> 图</el-button>
                                    </el-header>        
                                    <el-main class="animated fadeIn" style="display:flex;flex-wrap:wrap;" v-if="showContent">
                                        <el-button type="default" 
                                            style="max-width: 20em;width: 20em;height:auto;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
                                            @click="forwardCreative('run',item)" 
                                            v-for="item in model.rows" v-if="model.rows">
                                            <el-image style="width:64px;margin:5px;" :src="item | pickIcon"></el-image>
                                            <div>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">名称：#{item.name}#</p>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">作者：#{item|pickAuthor}#</p>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">创建：#{moment(item.vtime).format("YYYY-MM-DD hh:mm:ss")}#</p>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">描述：#{item|pickRemark}#</p>
                                            </div>
                                        </el-button>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    },
                    filters: {
                        pickName: function (item) {
                            const self = this;

                            if (_.isEmpty(item)) return '';

                            let _name = _.head(item.name.split("."));

                            /*if(!_.isEmpty(_name) && _.size(_name) > 9){
                                _name = _.split(_name,"",9).join("") + "...";
                            }*/

                            return _name;
                        },
                        pickAuthor: function(item){
                            if (!_.isEmpty(item.attr) || !_.isEqual(item.attr, 'null')) {
                                return _.attempt(JSON.parse.bind(null, item.attr)).author;
                            }
                        },
                        pickRemark: function(item){
                            if (!_.isEmpty(item.attr) || !_.isEqual(item.attr, 'null')) {
                                return _.attempt(JSON.parse.bind(null, item.attr)).remark;
                            }
                        },
                        pickIcon: function(item){
                            const self = this;

                            return `${window.ASSETS_ICON}/files/png/${item.ftype}.png?type=download&issys=${window.SignedUser_IsAdmin}`;
                        },
                        readMore: function (text, length, suffix) {
                            return text.substring(0, length) + suffix;
                        },
                        toLocalTime: function (value) {
                            return moment(value).format("LLL");
                        }
                    },
                    methods: {
                        forwardCreative: function(action,item){
                            const self = this;

                            if(item.ftype === 'dir'){

                            } else {
                                let lang = window.MATRIX_LANG;

                                item = _.merge(item,{lang: lang, action:action});

                                let url = fsHandler.genFsUrl(item,null,null);

                                window.open(url, "_blank");
                            }
                        }
                    }
                }); 
                
                Vue.component('search-files', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-files" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-notebook-2" @click="showContent=!showContent"> 文件</el-button>
                                    </el-header>    
                                    <el-main id="list" v-if="showContent" style="flex-flow: wrap;display: flex;align-content: flex-start;">
                                        <el-button type="default" 
                                            style="max-width: 20em;width: 20em;height:auto;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
                                            @mouseover.native="mouseOver(item)"
                                            @mouseout.native="mouseOut(item)"
                                            @dblclick.native="openIt(item)" 
                                            v-for="item in model.rows" v-if="model.rows">
                                            <!--div style="position: relative;right: -100px;">    
                                                <el-dropdown trigger="hover" placement="top-start">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-arrow-down el-icon--right"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item :command="{fun:menuItem.fun,param:item,type:menuItem.type?menuItem.type:false}" v-for="menuItem in $root.$refs.viewRef.$children[0].getMenuModel(item)">#{menuItem.name}#</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                </el-dropdown>
                                            </div-->
                                            <el-image style="width:64px;margin:5px;" :src="item | pickIcon"></el-image>
                                            <div>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">名称：#{item.name}#</p>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">作者：#{item|pickAuthor}#</p>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">创建：#{moment(item.vtime).format("YYYY-MM-DD hh:mm:ss")}#</p>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">描述：#{item|pickRemark}#</p>
                                            </div>
                                        </el-button>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    },
                    filters: {
                        pickName(item){

                            if (_.isEmpty(item)) return '';

                            let _name = _.head(item.name.split("."));

                            if(!_.isEmpty(_name)){
                                _name = _.truncate(_name, {
                                    'length': 9
                                });
                            }

                            return _name;
                        },
                        pickIcon(item){

                            // extend || ...
                            if( item.fullname === '/extend' ){
                                return `${window.ASSETS_ICON}/files/png/dir-lock.png?type=download&issys=${window.SignedUser_IsAdmin}`;
                            } else {

                                try{
                                    return _.attempt(JSON.parse.bind(null, item.attr)).icon || `${window.ASSETS_ICON}/files/png/${item.ftype}.png?type=download&issys=${window.SignedUser_IsAdmin}`;
                                }
                                catch(error){
                                    return `${window.ASSETS_ICON}/files/png/${item.ftype}.png?type=download&issys=${window.SignedUser_IsAdmin}`;
                                }
                            }

                        },
                        pickTags(item){

                            if(item.tags){
                                return item.tags.join(",");
                            } else {
                                return "";
                            }
                        },
                        pickAuthor(item){
                            if (!_.isEmpty(item.attr) || !_.isEqual(item.attr, 'null')) {
                                return _.attempt(JSON.parse.bind(null, item.attr)).author;
                            }
                        },
                        pickRemark(item){
                            if (!_.isEmpty(item.attr) || !_.isEqual(item.attr, 'null')) {
                                return _.attempt(JSON.parse.bind(null, item.attr)).remark;
                            }
                        }
                    },
                    methods:{
                        mouseOver(item){
                            const self = this;

                            $(self.$el).find('.fs-node-highlight').removeClass('fs-node-highlight');
                            $('#fs_node_'+item.id).find('.widget').addClass('fs-node-highlight');

                        },
                        mouseOut(item){
                            const self = this;

                            $('#fs_node_'+item.id).find('.fs-node-highlight').removeClass('fs-node-highlight');
                        },
                        openIt(data, path){
                            try{
                                if(_.includes(['md','txt'],data.ftype)){
                                    
                                    let wnd = maxWindow.winApp(data.name, `<div id="mdView"></div>`, null,null);
                                    new Vue({
                                        data: {
                                            model: null
                                        },
                                        template: `<el-container style="width:100%;height:100%;">
                                                        <el-main style="overflow:hidden;padding:0px;">
                                                            <knowledge-view :model="model" ref="viewRef"></knowledge-view>
                                                        </el-main>
                                                    </el-container>`,
                                        created(){
                                            this.model = {item:data, content:fsHandler.fsContent(data.parent, data.name)};
                                        }
                                    }).$mount("#mdView");
                                    
                                } else if(_.includes(['pdf'],data.ftype)){
                                    let contents = `<section class="is-vertical el-container" style="width:100%;height:100%;">
                                                        <main class="el-main" style="overflow:hidden;padding:0px;">
                                                            <iframe src="/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}" style="width: 100%;height: 100%;" frameborder="0"></iframe>
                                                        </main>
                                                    </section>`;

                                    let wnd = maxWindow.winApp(data.name, contents, null,null);
                                } else if(_.includes(['png','gif','jpg','jpeg'],data.ftype)){
                                    
                                    let wnd = maxWindow.winApp(data.name, `<div id="picView"></div>`, null,null);
                                    new Vue({
                                        data: {
                                            loading: true,
                                            url: `/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}`,
                                            srcList: [`/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}`]
                                        },
                                        template: `<el-container style="width:100%;height:100%;">
                                                        <el-main style="overflow:hidden;background:#333333;">
                                                            <el-image 
                                                                v-loading="loading"
                                                                style="width: 100%; height: 100%"
                                                                :src="url" 
                                                                :preview-src-list="srcList"
                                                                @load="loading=false"
                                                                @error="loading=false">
                                                            </el-image>
                                                        </el-main>
                                                    </el-container>`,
                                        created(){
                                            this.model = {item:data, content:fsHandler.fsContent(data.parent, data.name)};
                                        }
                                    }).$mount("#picView");

                                } else if(_.includes(['mov','mp3','mp4','wav','swf'],data.ftype)){
                                    
                                    let wnd = maxWindow.winApp(data.name, `<div id="movView"></div>`, null,null);

                                    new Vue({
                                        data: {
                                            url: `/fs${data.fullname}?type=open&issys=${window.SignedUser_IsAdmin}`
                                        },
                                        template: `<el-container style="width:100%;height:100%;">
                                                        <el-main style="overflow:hidden;background:#333333;">
                                                            <video :src="url" width="100%" height="100%" 
                                                                controls="controls" autoplay
                                                                style="background-image: url(/fs/assets/images/files/png/matrix.png?type=open&issys=true);
                                                                        background-repeat: no-repeat;
                                                                        background-position-x: center;
                                                                        background-position-y: center;">
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        </el-main>
                                                    </el-container>`,
                                        created(){
                                            this.model = {item:data, content:fsHandler.fsContent(data.parent, data.name)};
                                        }
                                    }).$mount("#movView");

                                } else {
                                    let url = `/fs/${data.fullname}?type=download&issys=true`;
                                    window.open(url,"_blank");
                                }
                            } catch(err){

                            }
                            
                        }
                    }
                }); 

                Vue.component('search-entity', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-entity" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="el-icon-s-order" @click="showContent=!showContent"> 实体</el-button>
                                    </el-header>
                                    <el-main style="display:flex;flex-flow: wrap;" class="animated fadeIn" v-if="showContent">
                                        <el-button type="default" 
                                            style="max-width: 20em;width: 20em;height:auto;border-radius: 10px!important;margin: 5px;border: unset;box-shadow: 0 0px 5px 0 rgba(0, 0, 0, 0.05);"
                                            @click="forward(item)"
                                            v-for="item in model.rows" v-if="model.rows">
                                            <!--div style="position: relative;right: -100px;">    
                                                <el-dropdown trigger="hover" placement="top-start">
                                                        <span class="el-dropdown-link">
                                                            <i class="el-icon-arrow-down el-icon--right"></i>
                                                        </span>
                                                        <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item :command="{fun:menuItem.fun,param:item,type:menuItem.type?menuItem.type:false}" v-for="menuItem in $root.$refs.viewRef.$children[0].getMenuModel(item)">#{menuItem.name}#</el-dropdown-item>
                                                        </el-dropdown-menu>
                                                </el-dropdown>
                                            </div-->
                                            <el-image style="width:64px;margin:5px;" :src="item | pickIcon"></el-image>
                                            <div>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">名称：#{item.name}#</p>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">ID：#{item.id}#</p>
                                                <p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">创建时间：#{moment(item.vtime).format("YYYY-MM-DD hh:mm:ss")}#</p>
                                                <!--p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px;text-align:left;">标签：<input type="text" class="tags" name="tags" :value="item|pickTags"></p-->
                                            </div>
                                        </el-button>
                                    </el-main>
                                </el-container>`,
                    props:{
                        model: Object
                    },
                    data(){
                        return {
                            showContent: true
                        }
                    },
                    filters: {
                        pickIcon(item){
                            try{
                                let ftype = _.last(item.class.split("/"));
                                return `${window.ASSETS_ICON}/entity/png/${ftype}.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                            }
                            catch(error){
                                return `${window.ASSETS_ICON}/entity/png/matrix.png?type=open&issys=${window.SignedUser_IsAdmin}`;
                            }

                        }
                    },
                    methods:{
                        forward(item){
                            let url = `/matrix/entity?term=${window.btoa(encodeURIComponent(item.id))}`;
                            window.open(url,'_blank');
                        }
                    }
                }); 

                /**
                 * @todo App Vue
                 */
                let main = {
                    delimiters: ['#{', '}#'],
                    template:   `<main id="content" class="content">
                                    <el-container style="height: calc(100vh - 90px);">
                                        <el-header style="height:40px;line-height:40px;padding:0px;">
                                            <search-base-component :options="options" ref="searchRef" class="grid-content"></search-base-component>
                                        </el-header>
                                        <el-main style="overflow: hidden;height: 100%;padding:0px;" v-if="!_.isEmpty(all.list)">
                                            <el-container style="height: 100%;">
                                                <el-header style="height:40px;line-height:40px;padding:10px 0px;">
                                                    <span style="width:95%;">
                                                        <el-button type="text" @click="forwardInView(v.href)" v-for="(v,k) in search.result" v-if="v.count > 0">
                                                            #{v.name}#: #{v.count}#
                                                        </el-button>
                                                    </span>
                                                    <span style="width:5%;float:right;text-align:right;">
                                                        <el-dropdown @command="toggleView">
                                                            <i class="el-icon-menu" style="margin-right: 15px;font-size:14px;"></i>
                                                            <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item command="view">视图查看</el-dropdown-item>
                                                            <el-dropdown-item command="timeline">时间轴查看</el-dropdown-item>
                                                            </el-dropdown-menu>
                                                        </el-dropdown>
                                                    </span>
                                                </el-header>
                                                <el-main id="div_result_view" style="padding:0px;height:100%;overflow:auto;">
                                                    <el-tabs v-model="showResultType">
                                                        <el-tab-pane name="view" key="view">
                                                            
                                                            <template slot="label" style="display:none;"></template>
                                                            
                                                            <search-event :model="event" v-if="!_.isEmpty(event.rows)"></search-event>
                                
                                                            <search-syslog :model="syslog" v-if="!_.isEmpty(syslog.rows)"></search-syslog>
                            
                                                            <search-journal :model="journal" v-if="!_.isEmpty(journal.rows)"></search-journal>
                            
                                                            <search-raw :model="raw" v-if="!_.isEmpty(raw.rows)"></search-raw>
                                                            
                                                            <search-log :model="log" v-if="!_.isEmpty(log.rows)"></search-log>
                            
                                                            <search-tickets :model="tickets" v-if="!_.isEmpty(tickets.rows)"></search-tickets>
                            
                                                            <search-change :model="change" v-if="!_.isEmpty(change.rows)"></search-change>
                                                            
                                                            <search-performance :model="performance" v-if="!_.isEmpty(performance.rows)"></search-performance>
                                                            
                                                            <search-files :model="files" v-if="!_.isEmpty(files.rows)"></search-files>
                            
                                                            <search-graph :model="graph" v-if="!_.isEmpty(graph.rows)"></search-graph>

                                                            <search-entity :model="entity" v-if="!_.isEmpty(entity.rows)"></search-entity>
                                                            
                                                        </el-tab-pane>
                                                        <el-tab-pane name="timeline" key="timeline">
                                                            <template slot="label"></template>
                                                            <el-timeline-component :model="all" v-if="all.list" id="result-timeline"></el-timeline-component>
                                                        </el-tab-pane>
                                                    </el-tabs> 
                                                    
                                                </el-main>
                                                
                                            </el-container>
                                            
                                        </el-main>

                                        <el-main style="background:#ffffff;margin-top:10px;" v-else>
                                                <h2>很抱歉，没有找到与  相关的记录。</h2>
                                                <p>
                                                    温馨提示：  
                                                    请检查您的输入是否正确 
                                                    如有任何意见或建议，请及时反馈给我们。 
                                                </p>
                                        </el-main>
                                
                                    </el-container>
                                </main>`,
                    data: {
                        all: {
                            list: []
                        },
                        event: {
                            columns: [],
                            rows: []
                        },
                        syslog: {
                            columns: [],
                            rows: []
                        },
                        performance: {
                            columns: [],
                            rows: [],
                        },
                        log: {
                            columns: [],
                            rows: []
                        },
                        raw: {
                            columns: [],
                            rows: []
                        },
                        journal: {
                            columns: [],
                            rows: []
                        },
                        tickets: {
                            columns: [],
                            rows: []
                        },
                        change: {
                            columns: [],
                            rows: []
                        },
                        files: {
                            columns: [],
                            rows: []
                        },
                        graph: {
                            columns: [],
                            rows: []
                        },
                        entity: {
                            columns: [],
                            rows: []
                        },
                        // 搜索组件结构
                        model: {
                            id: "matrix-search",
                            filter: null,
                            term: null,
                            preset: null,
                            message: null,
                        },
                        options: {
                            // 视图定义
                            view: {
                                show: false
                            },
                            // 搜索窗口
                            window: { name:"所有", value: ""},
                            // 输入
                            term: "",
                            autoSearch: true,
                            // 指定类
                            class: "",
                            // 指定api
                            api: {parent: "search",name: "searchByTerm.js"},
                            // 其它设置
                            others: {
                                // 是否包含历史数据
                                ifHistory: false,
                                // 是否包含Debug信息
                                ifDebug: false,
                                // 指定时间戳
                                forTime:  ' for vtime ',
                            }
                        },
                        showResultType: "view",
                        search:{
                            result: []
                        }
                    },
                    created(){
                        
                        // 初始化preset
                        try{
                            let preset = decodeURIComponent(window.atob(mx.urlParams['preset']));
                            
                            _.extend(this.options,_.attempt(JSON.parse.bind(null, preset)));
                            console.log(this.options)
                            
                        } catch(err){
                            
                        }

                    },
                    watch: {
                        'all.list'(val,oldVal){
                            if(!_.isEmpty(val)){
                                _.delay(()=>{
                                    $("#div_result_view > .el-tabs > .el-tabs__header").hide();
                                },500)
                            }
                        },
                        'options.term'(val,oldVal){
                            if(_.isEmpty(val)){
                                this.event.rows = [];
                                this.syslog.rows = [];
                                this.performance.rows = [];
                                this.log.rows = [];
                                this.raw.rows = [];
                                this.journal.rows = [];
                                this.tickets.rows = [];
                                this.change.rows = [];
                                this.files.rows = [];
                                this.graph.rows = [];
                                this.entity.rows = [];

                                this.$set(this.all,'list',[]);
                            }
                        }
                    },
                    mounted(){
                        
                        // 数据设置
                        this.setData();

                        // watch数据更新
                        this.$watch(
                            "$refs.searchRef.result",(val, oldVal) => {
                                this.setData();
                            }
                        );

                        /* this.$nextTick( ()=> {
                            _.delay( ()=> {
                                
                                $(document).keypress(function(event) {
                                    var keycode = (event.keyCode ? event.keyCode : event.which);
                                    if (keycode == 13) {
                                        $("#btn_search").click();
                                    } else if (keycode == 27) { 
                                        this.setSearchTerm("");
                                    }
                                })

                            },500)
                        }) */

                        this.weclome();

                    },
                    methods: {
                        weclome(){

                            fsHandler.callFsJScriptAsync("/matrix/search/weclome.js",null).then( (rtn)=>{
                                let message = rtn.message;

                                this.$notify({
                                    title: '欢迎使用一键搜索',
                                    type: 'success',
                                    dangerouslyUseHTMLString: true,
                                    message: message
                                });
                            } );
                        },
                        setData(){
                            _.extend(this.model, {message:this.$refs.searchRef.result});
                            
                            try {
                                
                                _.extend(this.event, this.model.message.data.event);
                                _.extend(this.syslog, this.model.message.data.syslog);
                                _.extend(this.performance, this.model.message.data.performance);
                                _.extend(this.log, this.model.message.data.log);
                                _.extend(this.raw, this.model.message.data.raw);
                                _.extend(this.journal, this.model.message.data.journal);
                                _.extend(this.tickets, this.model.message.data.tickets);
                                _.extend(this.change, this.model.message.data.change);
                                _.extend(this.files, this.model.message.data.files);
                                _.extend(this.graph, this.model.message.data.graph);
                                _.extend(this.entity, this.model.message.data.entity);

                                this.$set(this.all,'list',_.orderBy(this.model.message.data.all,["vtime"],["desc"]));

                            } catch(err){
                                
                                this.event.rows = [];
                                this.syslog.rows = [];
                                this.performance.rows = [];
                                this.log.rows = [];
                                this.raw.rows = [];
                                this.journal.rows = [];
                                this.tickets.rows = [];
                                this.change.rows = [];
                                this.files.rows = [];
                                this.graph.rows = [];
                                this.entity.rows = [];

                                this.$set(this.all,'list',[]);
                            }
                            
                            
                            this.search.result = [];
                            this.search.result.push({name:'事件', count:this.event.rows.length, href:"#search-event"});
                            this.search.result.push({name:'Syslog', count:this.syslog.rows.length, href:"#search-syslog"});
                            this.search.result.push({name:'日志', count:this.log.rows.length, href:"#search-log"});
                            this.search.result.push({name:'报文', count:this.raw.rows.length, href:"#search-raw"});
                            this.search.result.push({name:'Journal', count:this.journal.rows.length, href:"#search-journal"});
                            this.search.result.push({name:'性能', count:this.performance.rows.length, href:"#search-performance"});
                            this.search.result.push({name:'工单', count:this.tickets.rows.length, href:"#search-tickets"});
                            this.search.result.push({name:'变更单', count:this.change.rows.length, href:"#search-change"});
                            this.search.result.push({name:'文件', count:this.files.rows.length, href:"#search-files"});
                            this.search.result.push({name:'图', count:this.graph.rows.length, href:"#search-graph"});
                            this.search.result.push({name:'实体', count:this.entity.rows.length, href:"#search-entity"});
                        },
                        filterByCond: function(data,cond){
                            const self = this;
                            let rtn = [];
                            let param = "serial=" + _.map(data,cond).join(";serial=");
                            let _list = omdbHandler.fetchData("#/matrix/devops/event/omnibus/journal/: | " + param);

                            rtn = _list.message.data;

                            return rtn;
                        },
                        toggleView(cmd){
                            this.showResultType = cmd;
                        },
                        forwardInView: function(href){
                            // this.showResultType = "view";
                            // document.location.href = href;
                        }
                    }
                };
                
                // mount
                _.delay(() => {
                    this.app = new Vue(main).$mount("#app");
                },50)
                
                

            })
        })

    }

}