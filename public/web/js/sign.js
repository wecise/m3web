/*
        #####  ###  #####  #     #    ### #     #
        #     #  #  #     # ##    #     #  ##    #
        #        #  #       # #   #     #  # #   #
         #####   #  #  #### #  #  #     #  #  #  #
              #  #  #     # #   # #     #  #   # #
        #     #  #  #     # #    ##     #  #    ##
         #####  ###  #####  #     #    ### #     #

 */

"use strict";

var ifSignIn = function (event) {
    if (event.status == 'signin'){
        window.location.href = event.message;
        return false;
    }
};