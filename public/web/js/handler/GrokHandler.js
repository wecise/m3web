
/*
        #####  ######  ####### #    #
        #     # #     # #     # #   #
        #       #     # #     # #  #
        #  #### ######  #     # ###
        #     # #   #   #     # #  #
        #     # #    #  #     # #   #
         #####  #     # ####### #    #
 */

class GrokHandler {
    constructor(){

    }

    /*
    *  Grok解析规则列表
    *
    */
    async grokListAsync(event) {
        let rtn = null;

        try{
            await jQuery.ajax({
                url: "/pattern",
                dataType: 'json',
                type: 'GET',
                async: true,
                beforeSend:function(xhr){
                },
                complete: function(xhr, textStatus) {
                },
                success: function (data, status) {

                    

                    if (data.status == "ok"){
                        rtn = data;
                    }
                },
                error: function(xhr, textStatus, errorThrown){
                    rtn = xhr.responseText;
                }
            });
        } catch(err){

        }
        return rtn;
    };

    /*
    *  Grok解析规则列表
    *
    */
    async grokNew(event) {
        let rtn = null;

        try{
            var form = new FormData();
            form.append("eg", event.eg);
            form.append("pattern", event.pattern);

            await jQuery.ajax({
                url: "/pattern/" + event.name,
                dataType: 'json',
                type: 'POST',
                async: true,
                data: event,
                beforeSend:function(xhr){
                },
                complete: function(xhr, textStatus) {
                },
                success: function (data, status) {

                    

                    if( _.lowerCase(data.status) == "ok"){
                        rtn = 1;
                    }

                },
                error: function(xhr, textStatus, errorThrown){
                    rtn = xhr.responseText;
                }
            });
        } catch(err){

        }
        return rtn;
    };

    /*
    *  Grok解析规则列表
    *
    */
    async grokDelete(event) {
        let rtn = null;
        try{
            await jQuery.ajax({
                url: `/pattern/${event.name}`,
                dataType: 'json',
                type: 'DELETE',
                async: true,
                beforeSend:function(xhr){
                },
                complete: function(xhr, textStatus) {
                },
                success: function (data, status) {

                    

                    if( _.lowerCase(data.status) == "ok"){
                        rtn = 1;
                    }

                },
                error: function(xhr, textStatus, errorThrown){
                    rtn = xhr.responseText;
                }
            });
        } catch(err){

        }
        return rtn;
    };
}

var grokHandler = new GrokHandler();