{"version":3,"file":"comment-action-controller.bundle.map.js","names":["this","BX","exports","main_core","rest_client","CommentActionController","possibleActions","deadlineChange","taskApprove","taskDisapprove","taskComplete","accessActions","ajaxActions","actionNotificationMessages","prefix","Loc","getMessage","static","parameters","Promise","resolve","promisesToResolve","workHours","push","loadWorkHours","workSettings","loadWorkSettings","length","all","then","rest","callMethod","response","result","answer","startHours","startMinutes","String","work_time_start","split","endHours","endMinutes","work_time_end","start","hours","minutes","end","ajax","runAction","deadlineTimeVisibility","data","visibility","action","Object","keys","includes","link","url","userId","taskId","deadline","matches","isActionValid","init","showDeadlinePicker","anchor","checkCanRun","runAjaxAction","console","error","target","now","Date","today","UTC","getFullYear","getMonth","getDate","value","Number","getTimezoneOffset","calendar","Reflection","getClass","node","field","form","bTime","currentTime","Math","round","bHideTimebar","bCompatibility","bCategoryTimeVisibilityOption","bTimeVisibility","callback_after","onDeadlinePicked","fields","DEADLINE","toISOString","reject","isAjaxRunning","allowedActions","accessAction","showNotification","defaultData","params","PLATFORM","errors","errorMsg","MESSAGE","message","DATA","ui","Tasks","alert","Runtime","loadExtension","notificationCenter","notify","content"],"sources":["comment-action-controller.bundle.js"],"mappings":"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"}