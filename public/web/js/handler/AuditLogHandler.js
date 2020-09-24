/*
             _    _   _____    _____   _______     _         ____     _____ 
     /\     | |  | | |  __ \  |_   _| |__   __|   | |       / __ \   / ____|
    /  \    | |  | | | |  | |   | |      | |      | |      | |  | | | |  __ 
   / /\ \   | |  | | | |  | |   | |      | |      | |      | |  | | | | |_ |
  / ____ \  | |__| | | |__| |  _| |_     | |      | |____  | |__| | | |__| |
 /_/    \_\  \____/  |_____/  |_____|    |_|      |______|  \____/   \_____|
                                                                            
 */

class AuditLogHandler {
    
    constructor(){

    }

    writeLog(module,operation,status){
        
        try{
            let term = encodeURIComponent(JSON.stringify({module: module, operation: operation, status: status}));
            
            fsHandler.callFsJScriptAsync("/matrix/audit/writeLog.js", term);

        } catch(err){

        }
    }

}

var auditLogHandler = new AuditLogHandler();