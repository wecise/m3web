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
class LangHub {

    constructor() {
        
    }

    // 通过选项创建 VueI18n 实例
    lang() {
        
        try{

            let cache = localStorage.getItem("MATRIX-LANG-LIST");

            if( cache !== null ){
                
                return new VueI18n({
                    locale: window.MATRIX_LANG,
                    messages: JSON.parse(cache)
                });    
                
            } else {
                
                let xhr = new XMLHttpRequest();
                let name = '/matrix/lang/getLangList.js';
                xhr.open("POST", `/script/exec/js?filepath=${name}`, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        let rtn = xhr.response;
                        localStorage.setItem("MATRIX-LANG-LIST", JSON.stringify(rtn.message));

                        return new VueI18n({
                            locale: window.MATRIX_LANG,
                            messages: rtn.message
                        });
                    }
                }
                xhr.responseType = "json";
                xhr.send({ input: null, isfile: true });
                
            }
            
        } catch(err){
            return null;
        }

    }

}

let langHub = new LangHub();

let i18n = langHub.lang();