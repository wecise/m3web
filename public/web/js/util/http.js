$.ajaxSetup({
	dataType : "json",
    success: function (data, status) {
        
        if (data.status == 'signin'){
            window.location.href = data.message;
        }

    },
	error : function(xhr, textStatus, errorThrown) {
		switch (xhr.status) {
            case (500):
                alert('服务器系统内部错误，请联系管理员。');
                break;
            /* case (401):
                alert('未登录');
                break;
            case (403):
                alert('无权限执行此操作');
                break;
            case (408):
                alert('请求超时');
                break; */
            default:
                //alert('未知错误,请联系管理员');
		}
	},
	cache : false
})