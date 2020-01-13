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

        VueLoader.onloaded(["vue-editor-component",
                            "search-preset-component",
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
                                            <el-form label-width="120px" style="width:100%;height:300px;overflow:auto;padding:10px;background:#f7f7f7;" >
                                                <el-form-item v-for="v,k in props.row" :label="k">
                                                    <el-input v-model="v"></el-input>
                                                </el-form-item>
                                            </el-form>
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
                                let url = `/janesware/${this.forward}?term=${window.btoa(encodeURIComponent(term))}`;
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
                            let url = `/janesware/${this.forward}?term=${window.btoa(encodeURIComponent(term))}`;
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
                    template:   `<el-container id="search-event" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="fas fa-exclamation-triangle" @click="showContent=!showContent"> 事件</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <div role="tabpanel">
                                            <!-- Nav tabs -->
                                            <ul class="nav nav-tabs" role="tablist" style="border:none;float:right;position: relative;top: 0px;background-color:transparent;">
                                                <li role="presentation" class="active">
                                                    <a href="#event-table" aria-controls="event-table" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-table"></i>
                                                    </a>
                                                </li>
                                                <li role="presentation">
                                                    <a href="#event-list" aria-controls="event-list" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-list-ul"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        
                                            <!-- Tab panes -->
                                            <div class="tab-content">
                                                <div role="tabpanel" class="tab-pane active" id="event-table">
                                                    <el-table-component :columns="model.columns" 
                                                                            :rows="model.rows"
                                                                            forward="event"></el-table-component>
                                                </div>
                                                <div role="tabpanel" class="tab-pane" id="event-list">
                                                    <span v-for="item in model.rows" v-if="item">
                                                        <h6><a :href="'/janesware/event?cond='+item.id+'&preset='+item.preset" target="_blank">#{item.host}#</a></h6>
                                                        <span class="text-muted">
                                                            <span v-if="item.severity == '5'">
                                                            <kbd style="color:#FFFFFF;background-color:#FF0000;">Critical</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '4' ">
                                                            <kbd style="color:#FFFFFF;background-color:#FFA500;">Major</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '3' ">
                                                            <kbd style="color:#FFFFFF;background-color:#FFD700;">Minor</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '2' ">
                                                            <kbd style="color:#FFFFFF;background-color:#0000FF;">Warning</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '1' ">
                                                            <kbd style="color:#FFFFFF;background-color:#800080;">Indeterminate</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '0' ">
                                                            <kbd style="color:#FFFFFF;background-color:#008000;">Clear</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else>
                                                            <kbd style="color:#FFFFFF;background-color:#808080;">Unknown</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <i class="fa fa-time"></i> 时间： #{ new Date(item.vtime).toLocaleString() }#  &nbsp;&nbsp;&nbsp;&nbsp;							
                                                            <i class="fa fa-tag" v-for="(k,v) in item.tag"> <a href="#"> #{ v }# </a> &nbsp; </i> 
                                                        </span>
                                                        <p>#{item.msg}#</p>
                                                        <hr/>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </el-main>
                                </el-container>`
                });

                Vue.component('search-syslog', {
                    delimiters: ['#{', '}#'],
                    template:   `<el-container id="search-syslog" class="animated fadeIn" style="background:#ffffff;margin-top:10px;">
                                    <el-header style="height:30px;line-height:30px;">
                                        <el-button type="text" icon="fas fa-exclamation-triangle" @click="showContent=!showContent"> Syslog</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <div role="tabpanel">
                                            <!-- Nav tabs -->
                                            <ul class="nav nav-tabs" role="tablist" style="border:none;float:right;position: relative;top: 0px;background-color:transparent;">
                                                <li role="presentation" class="active">
                                                    <a href="#syslog-table" aria-controls="syslog-table" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-table"></i>
                                                    </a>
                                                </li>
                                                <li role="presentation">
                                                    <a href="#syslog-list" aria-controls="syslog-list" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-list-ul"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        
                                            <!-- Tab panes -->
                                            <div class="tab-content">
                                                <div role="tabpanel" class="tab-pane active" id="syslog-table">
                                                    <el-table-component :columns="model.columns" 
                                                                            :data="model.rows"
                                                                            forward="event"></el-table-component>
                                                </div>
                                                <div role="tabpanel" class="tab-pane" id="syslog-list">
                                                    <span v-for="item in model.rows" v-if="item">
                                                        <h6><a :href="'/janesware/event?cond='+item.id+'&preset='+item.preset" target="_blank">#{item.host}#</a></h6>
                                                        <span class="text-muted">
                                                            <span v-if="item.severity == '5'">
                                                            <kbd style="color:#FFFFFF;background-color:#FF0000;">Critical</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '4' ">
                                                            <kbd style="color:#FFFFFF;background-color:#FFA500;">Major</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '3' ">
                                                            <kbd style="color:#FFFFFF;background-color:#FFD700;">Minor</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '2' ">
                                                            <kbd style="color:#FFFFFF;background-color:#0000FF;">Warning</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '1' ">
                                                            <kbd style="color:#FFFFFF;background-color:#800080;">Indeterminate</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '0' ">
                                                            <kbd style="color:#FFFFFF;background-color:#008000;">Clear</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else>
                                                            <kbd style="color:#FFFFFF;background-color:#808080;">Unknown</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <i class="fa fa-time"></i> 时间： #{ new Date(item.vtime).toLocaleString() }#  &nbsp;&nbsp;&nbsp;&nbsp;							
                                                            <i class="fa fa-tag" v-for="(k,v) in item.tag"> <a href="#"> #{ v }# </a> &nbsp; </i> 
                                                        </span>
                                                        <p>#{item.msg}#</p>
                                                        <hr/>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
                                        <el-button type="text" icon="fas fa-film" @click="showContent=!showContent"> 告警轨迹</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <div role="tabpanel">
                                            <!-- Nav tabs -->
                                            <ul class="nav nav-tabs" role="tablist" style="border:none;float:right;position: relative;top: 0px;background-color:transparent;">
                                                <li role="presentation" class="active">
                                                    <a href="#journal-table" aria-controls="journal-table" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-table"></i>
                                                    </a>
                                                </li>
                                                <li role="presentation">
                                                    <a href="#journal-list" aria-controls="journal-list" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-list-ul"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        
                                            <!-- Tab panes -->
                                            <div class="tab-content">
                                                <div role="tabpanel" class="tab-pane active" id="journal-table">
                                                    <el-table-component :columns="model.columns" 
                                                                            :rows="model.rows"
                                                                            forward="event"></el-table-component>
                                                </div>
                                                <div role="tabpanel" class="tab-pane" id="journal-list">
                                                    
                                                    <span v-for="item in model.rows" v-if="item">
                        
                                                        <h5><a href="#" target="_blank"><ins>#{item.host}#</ins></a></h5>
                        
                                                        <span class="text-muted">
                                                            <i class="fa fa-time"></i> 时间：#{ new Date(item.vtime).toLocaleString() }#  &nbsp;&nbsp;&nbsp;&nbsp;
                                                            <i class="fa fa-tag" v-for="(k,v) in item.tag"> <a href="#"> #{ v }# </a> &nbsp; </i> 
                                                        </span>
                                                        <p>
                                                            #{item.msg}#
                                                        </p>
                        
                                                        <hr/>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
                                        <el-button type="text" icon="fas fa-file-code" @click="showContent=!showContent"> 日志</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <div role="tabpanel">
                                            <!-- Nav tabs -->
                                            <ul class="nav nav-tabs" role="tablist" style="border:none;float:right;position: relative;top: 0px;background-color:transparent;">
                                                <li role="presentation" class="active">
                                                    <a href="#log-table" aria-controls="log-table" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-table"></i>
                                                    </a>
                                                </li>
                                                <li role="presentation">
                                                    <a href="#log-list" aria-controls="log-list" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-list-ul"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        
                                            <!-- Tab panes -->
                                            <div class="tab-content">
                                                <div role="tabpanel" class="tab-pane active" id="log-table">
                                                    <el-table-component :columns="model.columns" 
                                                                            :rows="model.rows"
                                                                            forward="log"></el-table-component>
                                                </div>
                                                <div role="tabpanel" class="tab-pane" id="log-list">
                                                    
                                                    <span v-for="item in model.rows" v-if="item">
                        
                                                        <h5><a :href="'/janesware/log?cond='+item.id+'&preset='+item.preset" target="_blank"><ins>#{item.host}#</ins></a></h5>
                        
                                                        <span class="text-muted">
                                                            <span v-if="item.severity == '5'">
                                                            <kbd style="color:#FFFFFF;background-color:#FF0000;">Critical</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '4' ">
                                                            <kbd style="color:#FFFFFF;background-color:#FFA500;">Major</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '3' ">
                                                            <kbd style="color:#FFFFFF;background-color:#FFD700;">Minor</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '2' ">
                                                            <kbd style="color:#FFFFFF;background-color:#0000FF;">Warning</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '1' ">
                                                            <kbd style="color:#FFFFFF;background-color:#800080;">Indeterminate</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '0' ">
                                                            <kbd style="color:#FFFFFF;background-color:#008000;">Clear</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else>
                                                            <kbd style="color:#FFFFFF;background-color:#808080;">Unknown</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <i class="fa fa-time"></i> 时间：#{ new Date(item.vtime).toLocaleString() }#  &nbsp;&nbsp;&nbsp;&nbsp;
                                                            <i class="fa fa-tag" v-for="(k,v) in item.tag"> <a href="#"> #{ v }# </a> &nbsp; </i> 
                                                        </span>
                                                        <p>
                                                            #{item.msg}#
                                                        </p>
                        
                                                        <hr/>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
                                        <el-button type="text" icon="fab fa-fa-file-code" @click="showContent=!showContent"> 原始报文</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <div role="tabpanel">
                                            <!-- Nav tabs -->
                                            <ul class="nav nav-tabs" role="tablist" style="border:none;float:right;position: relative;top: 0px;background-color:transparent;">
                                                <li role="presentation" class="active">
                                                    <a href="#raw-table" aria-controls="raw-table" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-table"></i>
                                                    </a>
                                                </li>
                                                <li role="presentation">
                                                    <a href="#raw-list" aria-controls="raw-list" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-list-ul"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        
                                            <!-- Tab panes -->
                                            <div class="tab-content">
                                                <div role="tabpanel" class="tab-pane active" id="raw-table">
                                                    <el-table-component :columns="model.columns" 
                                                                            :rows="model.rows"
                                                                            forward="log"></el-table-component>
                                                </div>
                                                <div role="tabpanel" class="tab-pane" id="raw-list">
                                                    
                                                    <span v-for="item in model.rows" v-if="item">
                        
                                                        <h5><a :href="'/janesware/event?cond='+item.id+'&preset='+item.preset" target="_blank"><ins>#{item.host}#</ins></a></h5>
                        
                                                        <span class="text-muted">
                                                            <span v-if="item.severity == '5'">
                                                            <kbd style="color:#FFFFFF;background-color:#FF0000;">Critical</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '4' ">
                                                            <kbd style="color:#FFFFFF;background-color:#FFA500;">Major</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '3' ">
                                                            <kbd style="color:#FFFFFF;background-color:#FFD700;">Minor</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '2' ">
                                                            <kbd style="color:#FFFFFF;background-color:#0000FF;">Warning</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '1' ">
                                                            <kbd style="color:#FFFFFF;background-color:#800080;">Indeterminate</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else-if="item.severity === '0' ">
                                                            <kbd style="color:#FFFFFF;background-color:#008000;">Clear</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <span v-else>
                                                            <kbd style="color:#FFFFFF;background-color:#808080;">Unknown</kbd>&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </span>
                                                            <i class="fa fa-time"></i> 时间：#{ new Date(item.vtime).toLocaleString() }#  &nbsp;&nbsp;&nbsp;&nbsp;
                                                            <i class="fa fa-tag" v-for="(k,v) in item.tag"> <a href="#"> #{ v }# </a> &nbsp; </i> 
                                                        </span>
                                                        <p>
                                                            #{item.msg}#
                                                        </p>
                        
                                                        <hr/>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
                                        <el-button type="text" icon="fab fa-book" @click="showContent=!showContent"> 问题单</el-button>
                                    </el-header> 
                                        
                                    <el-main v-if="showContent" class="animated fadeIn">
                                        <div role="tabpanel">
                                            <!-- Nav tabs -->
                                            <ul class="nav nav-tabs" role="tablist" style="border:none;float:right;position: relative;top: 0px;background-color:transparent;">
                                                <li role="presentation" class="active">
                                                    <a href="#tickets-table" aria-controls="tickets-table" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-table"></i>
                                                    </a>
                                                </li>
                                                <li role="presentation">
                                                    <a href="#tickets-list" aria-controls="tickets-list" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-list-ul"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        
                                            <!-- Tab panes -->
                                            <div class="tab-content">
                                                <div role="tabpanel" class="tab-pane active" id="tickets-table">
                                                    
                                                    <el-table-component :columns="model.columns" 
                                                                            :rows="model.rows">
                                                    </el-table-component>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        
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
                                        <el-button type="text" icon="fab fa-book" @click="showContent=!showContent"> 变更单</el-button>
                                    </el-header>   
                                    <el-main v-if="showContent" class="animated fadeIn">
                            
                                        <div role="tabpanel">
                                            <!-- Nav tabs -->
                                            <ul class="nav nav-tabs" role="tablist" style="border:none;float:right;position: relative;top: 0px;background-color:transparent;">
                                                <li role="presentation" class="active">
                                                    <a href="#change-table" aria-controls="change-table" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-table"></i>
                                                    </a>
                                                </li>
                                                <li role="presentation">
                                                    <a href="#change-list" aria-controls="change-list" role="tab" data-toggle="tab" style="border:none;">
                                                        <i class="fas fa-list-ul"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        
                                            <!-- Tab panes -->
                                            <div class="tab-content">
                                                <div role="tabpanel" class="tab-pane active" id="change-table">
                                                    
                                                        <el-table-component :columns="model.columns" 
                                                                                :rows="model.rows">
                                                        </el-table-component>
                                                    
                                                </div>
                                            </div>
                                        </div>

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
                                        <el-button type="text" icon="fab fa-creative-commons-sampling" @click="showContent=!showContent"> 性能</el-button>
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
                                        <el-button type="text" icon="fas fa-book" @click="showContent=!showContent"> 图</el-button>
                                    </el-header>        
                                    <el-main class="animated fadeIn" style="display:flex;flex-wrap:wrap;" v-if="showContent">
                                        <div :class="'widget widget-stats animated fadeIn bg-info ' + item.ftype" v-for="(item,index) in model.rows" v-if="model.rows">
                                            <div @click="forwardCreative('run',item)">
                                                <div class="stats-title">
                                                    <i class="fa fa-braille fa-fw"></i>
                                                    <span class="fs-name" :data-info="JSON.stringify(item)">#{ item | pickName}#</span>
                                                </div>
                
                                                <div class="stats-subtitle">
                                                    #{item | pickRemark}#
                                                </div>
                
                                                <div class="media">
                                                    <div class="media-left">
                                                        <img class="media-object" :src="item | pickIcon">
                                                    </div>
                                                    <div class="media-body">
                                                        <p>项目作者： #{item.username}#</p>
                                                        <p>更新日期： #{ moment(item.vtime).format("L") }#</p>
                                                        <p>更新时间： #{ moment(item.vtime).format("LTS") }#</p>
                                                        <p class="status">
                                                            项目状态： 就绪
                                                        </p>
                                                    </div>
                                                </div>
                
                                            </div>
                                        </div>
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
                        pickRemark: function (item) {
                            const self = this;

                            if (_.isEmpty(item.attr)) return '';

                            let _remark = '';

                            if(_.attempt(JSON.parse.bind(null, item.attr)).remark){

                                _remark = _.attempt(JSON.parse.bind(null, item.attr)).remark;

                                /*if(_.isEmpty(_remark)) return '';


                                if($(window).width()>1280){
                                    if(_.size(_remark) > 50){
                                        _remark = _.split(_remark,"",49).join("") + "..."
                                    }
                                } else {

                                    if(_.size(_remark) > 44){
                                        _remark = _.split(_remark,"",43).join("") + "..."
                                    }
                                }*/

                            }

                            return _remark;
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
                                        <el-button type="text" icon="fas fa-book" @click="showContent=!showContent"> 文件</el-button>
                                    </el-header>    
                                    <el-main id="list" v-if="showContent" class="animated fadeIn">
                                        <ul>
                                            <li :class="item.ftype=='dir'?'dir fs-node context-menu-file':'fs-node context-menu-file'"
                                                    :id="'fs_node_'+item.id"
                                                    @mouseover="mouseOver(item)"
                                                    @mouseout="mouseOut(item)"
                                                    style="cursor: pointer;"
                                                    :title="item.name"
                                                    v-for="item in model.rows" v-if="model.rows">
                                                <div class="widget widget-stats bg-silver animated fadeIn" :id="'fs_node_widget_'+item.id">
                                                    <div class="stats-info" @dblclick="openIt(item, item.parent+'/'+item.name);" >
                                                        <p><img class="media-object" :src="item | pickIcon" onerror="this.src='${window.ASSETS_ICON}files/png/dir.png?type=download&issys=${window.SignedUser_IsAdmin}';"></p>
                                                    </div>
                                                    <div class="stats-link">
                                                        <a class="fs-name" :data-pk="item.id" href="javascript:void(0);" style="text-align: left;margin:15px -15px -15px -15px;padding: 10px;" :title="item.title" :data-info="JSON.stringify(item)">
                                                            <p><i class="fas fa-plug"></i>  名称：#{item.name}#</p>
                                                            <p><i class="fas fa-user"></i>  作者：#{item|pickAuthor}# </p>
                                                            <p><i class="fas fa-clock"></i> 创建：#{moment(item.vtime).format("YYYY-MM-DD hh:mm:ss")}# </p>
                                                        </a>
                                                    </div>
                                                    <div class="list-context-menu" :data-item="JSON.stringify(item)" style="position: absolute;right: 10px;top: 5px;cursor:pointer;">
                                                        <i class="fa fa-bars"></i>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
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
                        openIt(item, path){
                            const self = this;

                            if(!_.isEmpty(item)){

                                if(_.includes(['png','jpg','jpeg','gif'], item.ftype)) {


                                    let contents = `<img src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}" class="preview-img-responsive center-block" alt="Image">`;
                                    let _wnd = maxWindow.winApp(item.name, contents, null,null);

                                } else if(_.includes(['mov','mp4','avi'], item.ftype)) {

                                    let contents = `<div class="embed-responsive embed-responsive-16by9">
                                                        <video src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}" controls="controls" autoplay>
                                                            your browser does not support the video tag
                                                        </video>
                                                    </div>
                                                    `;

                                    let _wnd = maxWindow.winApp(item.name, contents, null,null);

                                } else if(_.includes(['pdf'], item.ftype)) {

                                    let contents = `<div class="embed-responsive embed-responsive-16by9">
                                                        <iframe class="embed-responsive-item" src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}"></iframe>
                                                    </div>`;

                                    let _wnd = maxWindow.winApp( item.name, contents, null,null);

                                } else if(_.includes(['pptx','ppt'], item.ftype)) {

                                    window.open(`/fs${path}?type=download&issys=${window.SignedUser_IsAdmin}`, "_blank");

                                } else if(_.includes(['js','ltsv','txt','csv','html'], item.ftype)) {

                                    window.open(`/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}`, "_blank");

                                } else if(_.includes(['swf'], item.ftype)) {
                                    let contents = `<div class="embed-responsive embed-responsive-16by9">
                                                        <video src="/fs${path}?type=open&issys=${window.SignedUser_IsAdmin}" width="100%" height="100%" controls="controls" autoplay>
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    </div>`;

                                    let _wnd = maxWindow.winApp(item.name, contents, null,null);
                                } else if(_.includes(['imap','iflow', 'ishow'], item.ftype)) {

                                    _.merge(item,{action:'run'});

                                    let url = fsHandler.genFsUrl(item,null,null);

                                    window.open(url,'_blank');
                                } else if(_.includes(['md'], item.ftype)){
                                    _.merge(item,{action:'run'});

                                    let url = fsHandler.genFsUrl(item,{ header:true, sidebar:true, footbar:true },null);

                                    window.open(url,'_blank');
                                }
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
                                        <el-card body-style="{ padding: '5px'}" v-for="item in model.rows">
                                            <el-image style="width: 80px; height: 80px; marging:10px;" :src="item | pickIcon" fit="contain"></el-image>
                                            <div class="bottom clearfix">
                                                <el-button type="text" @click="forward(item)">
                                                    #{item.name}#
                                                </el-button>
                                            </div>
                                            </el-card>
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
                            let url = `/janesware/entity?term=${window.btoa(encodeURIComponent(item.id))}`;
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
                                    <el-container style="height: 100%;">
                                        <el-header style="height:30px;line-height:30px;">
                                            <search-base-component :options="options" ref="searchRef" class="grid-content"></search-base-component>
                                        </el-header>
                                        <el-main style="padding: 10px 0px;overflow: hidden;height: 100%;">
                                            <el-container style="height: 100%;">
                                                <el-header style="height:30px;line-height:30px;">
                                                    <span style="font-size:14px;">结果：</span>
                                                    <span>
                                                        <el-button type="text" @click="forwardInView(v.href)" v-for="(v,k) in search.result">
                                                            <u>#{v.name}#: #{v.count}#</u>
                                                        </el-button>
                                                    </span>
                                                    <span style="float:right;">
                                                        <el-dropdown @command="toggleView">
                                                            <i class="el-icon-menu" style="margin-right: 15px;font-size:14px;"></i>
                                                            <el-dropdown-menu slot="dropdown">
                                                            <el-dropdown-item command="view">视图查看</el-dropdown-item>
                                                            <el-dropdown-item command="timeline">时间轴查看</el-dropdown-item>
                                                            </el-dropdown-menu>
                                                        </el-dropdown>
                                                    </span>
                                                </el-header>
                                                <el-main id="div_result_view" style="padding:0 20px;height:100%;overflow:auto;">
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
                            // 指定类
                            class: "#/matrix/devops/:",
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
                    created: function(){
                        
                        // 初始化preset
                        try{
                            let preset = decodeURIComponent(window.atob(mx.urlParams['preset']));
                            
                            _.extend(this.options,_.attempt(JSON.parse.bind(null, preset)));
                            console.log(this.options)
                            
                        } catch(err){
                            
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

                        this.$nextTick( ()=> {
                            _.delay( ()=> {
                                
                                $(document).keypress(function(event) {
                                    var keycode = (event.keyCode ? event.keyCode : event.which);
                                    if (keycode == 13) {
                                        $("#btn_search").click();
                                    } else if (keycode == 27) { 
                                        this.setSearchTerm("");
                                    }
                                })

                                $("#div_result_view > .el-tabs > .el-tabs__header").hide();
                            },500)
                        })

                    },
                    methods: {
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

                                this.all.list = _.orderBy(this.model.message.data.all,["vtime"],["desc"]);
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

                                this.all.list = [];
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
                            this.showResultType = "view";
                            document.location.href = href;
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