<!--MXClient JS & CSS-->
<script>
    mxBasePath = '{{AppSubUrl}}/web/vendor/mxgraph/src';
    mxLanguage = '{{.Lang}}'.replace(/"/g,"").replace(/en/g,"eg").split("-")[0];
</script>

<script src="{{AppSubUrl}}/web/vendor/mxgraph/src/js/mxClient.js" type="text/javascript"></script>
<link href="{{AppSubUrl}}/web/vendor/mxgraph/graph/styles/grapheditor.css" type="text/css" rel="stylesheet">

<script>
    mxResources.add('{{AppSubUrl}}/web/vendor/mxgraph/graph/resources/grapheditor');
</script>