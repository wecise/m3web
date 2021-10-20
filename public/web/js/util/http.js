$.ajaxSetup({
    dataType : "json",
    dataFilter: function (data, status) {
        
        try{
            let res = JSON.parse(data);
            if(res){
                if (res.status === 'signin'){
                    window.location.href = res.message;
                } else if(res.status === 'error'){
                    alert("系统异常，请联系管理员")
                }
            }
        }catch(err){

        }
        
        return data;
    }
})