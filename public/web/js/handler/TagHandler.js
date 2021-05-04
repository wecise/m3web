
/*
        #######    #     #####
           #      # #   #     #
           #     #   #  #
           #    #     # #  ####
           #    ####### #     #
           #    #     # #     #
           #    #     #  #####
 */

class TagHandler{
    constructor(){

    }

    /*
    *  Update tagdir
    *
    */
    updateTagDir(system,tags){

        let rtn = 0;

        let fm = new FormData();

        fm.append("tagpath", tags);

        jQuery.ajax({
            url: `/tagdir/${system}`,
            dataType: 'json',
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            type: 'POST',
            data: fm,
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                

                if (data.status == "ok"){
                    rtn = 1;
                }
            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;

    };


    /*
    *  Get tagdir tree
    *
    */
    getTagDir(system){
        let rtn = null;

        jQuery.ajax({
            url: `/tagdir/${system}`,
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {},
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                

                if (data.status == "ok"){
                    rtn = data.message;
                }
            },
            error: function(xhr, textStatus, errorThrown){
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;
    };


    /*
    *  Move tagdir tree
    *
    */
    moveTagDir(system, tagpath, topath){
        let rtn = 0;

        var fm = new FormData();
        fm.append("tagpath", tagpath);
        fm.append("topath", topath);

        jQuery.ajax({
            url: `/tagdir/${system}`,
            dataType: 'json',
            type: 'PUT',
            async: false,
            data: fm,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                

                if (data.status == "ok"){
                    rtn = 1;
                }
            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;
    };


    /*
    *  Delete tag from tagdir
    *
    */
    delTagDir(system, tagpath){
        let rtn = 0;

        let _tagpath = encodeURIComponent(tagpath);

        jQuery.ajax({
            url: `/tagdir/${system}?tagpath=${_tagpath}`,
            dataType: 'json',
            type: 'DELETE',
            async: false,
            beforeSend:function(xhr){
            },
            complete: function(xhr, textStatus) {
            },
            success: function (data, status) {

                

                if (data.status == "ok"){
                    rtn = 1;
                }
            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;

    };


    /* Rename tag name */
    reNameTagDir(system,source,target){

        let rtn = 0;
        let fm = new FormData();
        fm.append("system", "false");
        fm.append("tagpath", source);
        fm.append("topath", target);

        jQuery.ajax({
            url: `/tagdir/${system}`,
            dataType: 'json',
            processData: false,
            contentType: false,
            mimeType: 'multipart/form-data',
            type: 'PUT',
            data: fm,
            async: false,
            beforeSend:function(xhr){},
            complete: function(xhr, textStatus) {},
            success: function (data, status) {

                

                if (data.status == "ok"){
                    rtn = 1;
                }
            },
            error: function(xhr, textStatus, errorThrown){
                rtn = 0;
                console.log("["+ moment().format("LLL")+"] [" + xhr.status + "] " + xhr.responseJSON.error);
            }
        });

        return rtn;

    };
    
}

var tagHandler = new TagHandler();