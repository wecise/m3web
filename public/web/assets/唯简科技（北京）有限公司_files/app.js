<!DOCTYPE html>
<html lang="en-US">
<head data-suburl="">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
	<meta name="author" content="Matrix - Portal Service" />
	<meta name="description" content="Matrix - Portal Service write in go" />
	<meta name="keywords" content="matrix,bigdata,cassandra,go">
	<meta name="referrer" content="no-referrer" />
	<meta name="_csrf" content="41mC2bn7tIV0h_YDC563KJGN15A6MTUxNzQ5ODU1NzkzMjI3NTY3OA==" />
	<meta name="_suburl" content="" />
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<link rel="shortcut icon" href="" id="favicon"/>
	
	
	<script src="/web/lib/jquery/jquery-3.2.1.min.js"></script>
	
	<script src="/web/lib/jquery-ui/1.12.1/jquery-ui.min.js"></script>
	
	<link href="/web/lib/font-awesome/4.7.1/css/font-awesome.min.css" rel="stylesheet" >

	
	<link href="/web/css/bootstrap-3.3.7/less/bootstrap.less" rel="stylesheet/less" type="text/css">
	<script src="/web/lib/less/dist/less.min.js"></script>
	
	
	<script src="/web/css/bootstrap-3.3.7/dist/js/bootstrap.min.js"></script>

	
	<link href="/web/css/color/color_style.min.css" rel="stylesheet">
	<link href="/web/css/color/color_style_responsive.min.css" rel="stylesheet">
	<link href="/web/css/color/style.min.css" rel="stylesheet">

	
	<link href="/web/lib/sweetalert2/dist/sweetalert2.min.css" rel="stylesheet">
	
	<script src="/web/lib/sweetalert2/dist/sweetalert2.min.js"></script>

	
	<link href='/web/lib/bootstrap-select/dist/css/bootstrap-select.min.css' rel='stylesheet' >
	
	<script src='/web/lib/bootstrap-select/dist/js/bootstrap-select.min.js'></script>
	
	
	<link rel="stylesheet" href="/web/lib/bootstrap-tagsinput/dist/bootstrap-tagsinput.css">
	<script src="/web/lib/bootstrap-tagsinput/dist/bootstrap-tagsinput.js"></script>

	
	<script src="/web/lib/lodash/dist/lodash.min.js"></script>
	
	
	<script src="/web/lib/mark/dist/jquery.mark.min.js"></script>

	
	<script src="/web/lib/util/moment.min.js"></script>
	<script src="/web/lib/util/moment-with-locales.min.js"></script>

		
	<link href="/web/lib/flatpickr/dist/flatpickr.min.css" rel="stylesheet" >
	<script src="/web/lib/flatpickr/dist/flatpickr.min.js"></script>
	<script src="/web/lib/flatpickr/dist/l10n/zh.js"></script>
	
	
	<script src="/web/lib/vue/2.4.2/dist/vue.min.js"></script>
	<script src="/web/lib/vueloader/vue.loader.min.js"></script>
	
	
	<script src="/web/lib/later/later.js"></script>

	
	<script src="/web/lib/localForage/dist/localforage.min.js"></script>

	
	<script src="/web/lib/ace/src-noconflict/ace.js"></script>
	<script src="/web/lib/ace/src-noconflict/ext-language_tools.js"></script>
	<script src="/web/lib/ace/src-noconflict/ext-split.js"></script>
	<script src="/web/lib/ace/src-noconflict/ext-settings_menu.js"></script>
	<script src="/web/lib/ace/src-noconflict/ext-statusbar.js"></script>

	
	<script src="/web/lib/object-hash/dist/object_hash.js"></script>
	
	
	<script src="/web/lib/split/split.min.js"></script>
	
	<script src="/web/lib/tippyjs/dist/tippy.all.min.js"></script>
	
	<script src="/web/lib/iscroll/iscroll.js"></script>

	<script src="/web/js/util.js"></script>
	<script src="/web/js/cfg.js"></script>
	<script src="/web/js/init.js"></script>

		
	<script src="/web/lib/pace/pace.min.js"></script>
	<script>

		$(document).ajaxStart(function() { Pace.restart(); });
		
		let lang = `"en-US"`;
		lang = lang.replace(/"/g,"");
		moment.locale(lang);
	</script>

		
	<script src="/web/lib/defiantjs/defiant.min.js"></script>

		
	<script>
		mxBasePath = '/web/lib/mxgraph/src';
		mxLanguage = 'en-US'.replace(/"/g,"").replace(/en/g,"eg").split("-")[0];
	</script>
	<script src="/web/lib/mxgraph/src/js/mxClient.js" type="text/javascript"></script>
	<link href="/web/lib/mxgraph/graph/styles/grapheditor.css" type="text/css" rel="stylesheet">
	<script>
		mxResources.add('/web/lib/mxgraph/graph/resources/grapheditor');
	</script>

	
    <link href="/web/lib/jquery-contextmenu/dist/jquery.contextMenu.css" type="text/css" rel="stylesheet">
    <script src="/web/lib/jquery-contextmenu/dist/jquery.ui.position.js"></script>
    <script src="/web/lib/jquery-contextmenu/dist/jquery.contextMenu.js"></script>

	
	<link href="/web/lib/table/bootstrap/bootstrap-table.min.css" rel="stylesheet">
	<link href="/web/lib/table/export/bootstrap-editable.css" rel="stylesheet">
	<link href="/web/lib/table/bootstrap/bootstrap-table-fixed-columns.css" rel="stylesheet">
	<link href="/web/lib/table/dragtable/dragtable.css" rel="stylesheet"
	>
	
	
	<script src="/web/lib/table/dragtable/dragtable.js"></script>
	<script src="/web/lib/table/bootstrap/bootstrap-table.min.js"></script>
	<script src="/web/lib/table/bootstrap/locale/bootstrap-table-en-US.js"></script>
	<script src="/web/lib/table/bootstrap/extensions/export/bootstrap-table-export.js"></script>
	<script src="/web/lib/table/bootstrap/extensions/export/tableExport.js"></script>
	<script src="/web/lib/table/bootstrap/extensions/reorder-columns/bootstrap-table-reorder-columns.min.js"></script>
	<script src="/web/lib/table/bootstrap/extensions/editable/bootstrap-table-editable.js"></script>
	
	
	<script src="/web/lib/table/bootstrap/bootstrap-table-contextmenu.min.js"></script>
	<script src="/web/lib/table/bootstrap/bootstrap-table-fixed-columns.js"></script>
	
	
	<link href="/web/lib/x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css" rel="stylesheet">
	<script src="/web/lib/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.min.js"></script>
	
	
	<script src="/web/lib/gauge/gauge.min.js"></script>

	
	<script src="/web/lib/clipboard/dist/clipboard.min.js"></script>
	
	<title> 唯简科技（北京）有限公司</title>

	<style>
		
		body {
			font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
			background-color: #ffffff;  
			overflow-x: hidden;
		}

		.container-fluid {
		    margin-top: 5px;
		    margin-bottom: 45px;
		    margin: 5px -10px;
		}
		
		#company_logo::selection {
			background: #fff;
			color: white;
		}
		
		 
		div.mxWindowPane {
			overflow: auto!important;
			background-color: #ffffff;
		}
		div.mxWindow{
			z-index: 1000!important;

		    -webkit-box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.65);
		    -moz-box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.65);
		    box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.65);
		}


		 

		.navbar.navbar-default.navbar-fixed-top {
			z-index: 999;
			border-color: transparent!important;
			background-color: #2195f4; 
			-webkit-box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.2);
    		box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.2);
		}

		
		.navbar-default .navbar-nav > li > a:hover, .navbar-default .navbar-nav > li > a:focus {
		    background-color: #03A9F4;
		    color: #666;
		}

		.navbar-default .navbar-nav > li > a:hover, .navbar-default .navbar-nav > li > a:hover {
		    background-color: #1db7fc;
		    color: #666;
		}

		.navbar-default .navbar-nav > li > a.item.active {
		    background-color: #fff;
		    color: #666;
		}

		.navbar-default .navbar-nav > li > a.item {
		    color: #fff;
		}

		.modal-header{
			background-color: #2195f4; 
    		color: #ffffff;
		}

		.img-responsive{
			max-width: 120px;
			height: auto;
		}

	     

	    .bootstrap-table > .fixed-table-toolbar > .columns > .btn-group > .dropdown-menu {
	    	width: 220px;
	    }

	    .table>tbody>tr>td, .table>tbody>tr>th, .table>tfoot>tr>td, .table>tfoot>tr>th, .table>thead>tr>td, .table>thead>tr>th {
			vertical-align: middle;
		}

		.bootstrap-table .table:not(.table-condensed), .bootstrap-table .table:not(.table-condensed) > tbody > tr > th, .bootstrap-table .table:not(.table-condensed) > tfoot > tr > th, .bootstrap-table .table:not(.table-condensed) > thead > tr > td, .bootstrap-table .table:not(.table-condensed) > tbody > tr > td, .bootstrap-table .table:not(.table-condensed) > tfoot > tr > td {
	        padding: 4px!important;
	        white-space: wrap;
	    }

	     
	    .cell-style-selected {
			 
	    }

		 
	    .btn.btn-default.dropdown-toggle{
	    	font-size: 12px;
	    }

	     
	    .btn.btn-primary {
	    	background-color: rgb(33, 149, 244);
	    }
		
		 
	    html td.mxWindowTitle {
			background-color: rgb(238, 238, 238);
			background-image: linear-gradient(180deg,rgb(247, 247, 247),rgb(224, 224, 224));
		    background-repeat: repeat-x;
	    }

	    div.mxWindowPane {
	        border-top: 1px solid rgb(221, 221, 221);
	    }
		
		div.mxWindowPane > div > .tab-content > .tab-pane > div > .panel-body {
	    	min-height: calc(100vh - 330px);
	    	max-height: calc(100vh - 140px);
	    	overflow: auto;
	    }
		
		 
	    .dropdown-menu {
		    border: none;
		    -webkit-box-shadow: 0 2px 5px -1px rgba(0,0,0,.5);
		    box-shadow: 0 2px 5px -1px rgba(0,0,0,.5);
		    font-size: 12px;
		}

		.dropdown-menu>li>a {
		    padding: 5px 5px;
		}

	    .dropdown-menu > li > a > .fa {
	    	color: rgb(33, 148, 245);
	    }
		
		.dropdown-menu > li.context-menu-separator {
	    	padding: 0;
		    margin: .25em 0;
		    border-bottom: 1px solid rgb(230, 230, 230);
	    }

	    .context-menu-icon.context-menu-icon--fa::before {
		    color: rgb(33, 148, 245)!important;
		}

		.context-menu-item {
		    padding: 0.25em 2em!important;
		    color: rgb(71, 71, 71)!important;
		     
		}
		.context-menu-hover {
		    background-color: rgb(237, 240, 246)!important;
		}
	</style>
</head>
<body>
	
	<noscript>Please enable JavaScript in your browser!</noscript>
	<div id="page-container" class="page-sidebar-fixed page-header-fixed">
		
		<div class="navbar navbar-default navbar-fixed-top">
			<div class="container-fluid" style="margin:0px;padding:0px;">
				
				<div class="navbar-header">
					<a class="navbar-brand" href="#">
						<img id="company_logo" src="">
					</a>
			    </div>

			    <ul class="nav navbar-nav navbar-right">

					

						
						<li id="robot">
						</li>

						<li>
							<a class="head_write_font item" href="/"><i class="fa fa-home fa-fw"></i> &nbsp;Home</a>
						</li>

						<li class="current-active-item"></li>

					


					

						<li class="dropdown">

							<a id="drop3" href="#" class="dropdown-toggle item" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
								
								<i class="fa fa-user"></i> admin
								<i class="caret"></i>
							</a>

							<ul class="dropdown-menu" aria-labelledby="drop3" style="padding:10px 0px;">
								<li>
									<a href="/janesware/user?name=admin">
										<i class="fa fa-user"></i> Your Profile 
									</a>
								</li>
								
									<li role="separator" class="divider"></li>
									<li>
										<a class="" href="/janesware/system">
											<i class="fa fa-cogs"></i>
											System
										</a>
									</li>
								
								<li role="separator" class="divider"></li>
								<li>
									<a target="_blank" href="/janesware/files">
										<i class="fa fa-files-o"></i>
										My Files
									</a>
								</li>
								<li role="separator" class="divider"></li>
								<li>
									<a target="_blank" href="/janesware/api">
										<i class="fa fa-gear"></i>
										REST API
									</a>
								</li>
								<li role="separator" class="divider"></li>
								<li>
									<a href="/user/logout/wecise">
										<i class="fa fa-sign-out"></i>
										Sign Out
									</a>
								</li>
							</ul>
						</li>

					

				</ul>

			</div>
		</div>
	


<div class="ui container center">
	<p style="margin-top: 100px"><img src="/img/404.png" alt="404"/></p>
	<div class="ui divider"></div>
	<br>
	<p>Application Version: 0.8</p>
	<p>如果你认为这是个问题，可以开个工单 <a href="/issues/new">创建工单</a>.</p>
</div>

	</div>
	
	<div class="navbar navbar-default navbar-fixed-bottom" 
		 style="max-height: 30px;min-height: 30px;background-color:#f0f3f4;-webkit-box-shadow: none;box-shadow: none;">
		<div class="container-fluid" style="margin:0px 10px 0px 10px;padding:0px 15px 0px 15px;">
			<div class="navbar-header">
				<span class="navbar-brand" style="font-size: 12px;height: 30px;padding: 0px 15px;">© 2016  Version: 0.8 Page: <strong>39ms</strong> Template: <strong>34ms</strong></span>
			</div>
			<ul class="nav navbar-nav navbar-right" style="padding:5px;">
		        <li><a target="_blank" href="/help/REST_API.html"  style="padding-top: 0px;padding-bottom: 0px;font-size:12px;">API</a></li>
		        <li class="dropdown">
		          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" style="padding-top: 0px;padding-bottom: 0px;font-size:12px;"><span class="icon-globe"></span> English</a>
		          <ul class="dropdown-menu">
		          	
		            <li  style="padding: 5px 0px;"><a class="item active selected" href="#" onclick="window.location.href='#'" style="padding-top: 0px;padding-bottom: 0px;font-size:12px;">English</a></li>
		            
		            <li  style="padding: 5px 0px;"><a class="item " href="#" onclick="window.location.href='\/web\/js\/en-US\/app.js?lang=zh-CN'" style="padding-top: 0px;padding-bottom: 0px;font-size:12px;">简体中文</a></li>
		            
		          </ul>
		        </li>
		        <li><a target="_blank" href="http://www.wecise.com"  style="padding-top: 0px;padding-bottom: 0px;font-size:12px;">唯简科技（北京）有限公司</a></li>
		    </ul>
		</div>
		
	</div>

	<script type="text/javascript">
		const COMPANY_OBJECT = {
									tghd: {
										bgColor: ""
									},
									rtyj: {
										logoCss: { "width": "120px", "left": "5%"} 
									},
									rxhy: {
										logoCss: {"height": "50px"}
									},
									telus: {
									},
									wecise: {
									}
								};

		$(function() {
			let _company = "wecise";
			let _logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADPCAYAAACwXZ4mAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGNzdGMTE3NDA3MjA2ODExQkUxRUU1NTRDOUFFRkMyQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozRTFCQkZCNDlGMEYxMUU1ODc0Q0Q5NjcwMDVFNzExRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozRTFCQkZCMzlGMEYxMUU1ODc0Q0Q5NjcwMDVFNzExRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkY3N0YxMTc0MDcyMDY4MTFCRTFFRTU1NEM5QUVGQzJDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkY3N0YxMTc0MDcyMDY4MTFCRTFFRTU1NEM5QUVGQzJDIi8+IDwvcmRmOkRlc2NyaXB0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";
			
			$("#company_logo").attr("src",_logo);
			$("#favicon").attr("href", _logo);

			if(_company == "telus"){
				$("#company_logo").css("width","140px");
			} else if(_company == "rtyj"){
				$("#company_logo").css("width","120px");
			} else if(_company == "rxhy"){
				$("#company_logo").css("height","50px");
			} else {
				$("#company_logo").css("height","45px");
				$("#company_logo").css("margin-top","-7px");
			}

			let _isSigned =  true ;
			let _cname = "wecise";
			if(_isSigned){
				localStorage.setItem("uname",_cname);
			}
		});
	</script>

	
	<a href="javascript:;" class="btn btn-icon btn-circle btn-success btn-scroll-to-top fade" data-click="scroll-top"><i class="fa fa-angle-up"></i></a>
	
</div>
</body>
	
</html>

