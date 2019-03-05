/**
 *
 *    #     # ####### #     # #     #
 *    ##   ## #       ##    # #     #
 *    # # # # #       # #   # #     #
 *    #  #  # #####   #  #  # #     #
 *    #     # #       #   # # #     #
 *    #     # #       #    ## #     #
 *    #     # ####### #     #  #####
 *
 * @author: wangzd
 * @description:
 * @Date: 2018/12/14 10:51
 */

class ContextMenu {
    constructor() {

    }

    destroy(id, event){
        $(`.${event.select}_${id}`).off('contextmenu');
    }

    build(id, event) {

        let rtn = null;

        // some asynchronous click handler
        $(`.${event.select}_${id}`).on('click', function(e){
            let $this = $(this);
            // store a callback on the trigger
            $this.data('runCallback', function(){ return contextMenu.create(event);});
            let _offset = $this.offset(),
                position = {
                    x: _offset.left + 10,
                    y: _offset.top + 10
                }
            // open the contextMenu asynchronously
            setTimeout(function(){ $this.contextMenu(position); }, 500);
        });

        // setup context menu

        contextMenu.destroy(id,event);

        rtn = $.contextMenu({
            selector: `.${event.select}_${id}`,
            trigger: 'left',
            delay: 10,
            hideOnSecondTrigger: true,
            className: `animated slideIn ${id} ${event.select}`,
            build: function($trigger, e) {
                e.preventDefault();

                // pull a callback from the trigger
                return $trigger.data('runCallback')();
            }
        });

        return rtn;
    }

    create(event) {
        return {
            callback: function(key, options) {
                let m = "clicked: " + key;
                //window.console && console.log(m) || alert(m);
                event.handle(key);
            },
            items: event.items
        };
    }

}

let contextMenu = new ContextMenu();