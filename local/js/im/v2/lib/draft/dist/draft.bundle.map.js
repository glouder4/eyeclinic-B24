{"version":3,"file":"draft.bundle.map.js","names":["this","BX","Messenger","v2","exports","main_core_events","im_v2_application_core","im_v2_lib_localStorage","im_v2_lib_logger","im_v2_const","WRITE_TO_STORAGE_TIMEOUT","SHOW_DRAFT_IN_RECENT_TIMEOUT","_drafts","babelHelpers","classPrivateFieldLooseKey","_store","_setDraftsInRecentList","_setDraftInRecentList","_onLayoutChange","DraftManager","static","instance","constructor","Object","defineProperty","value","_onLayoutChange2","_setDraftInRecentList2","_setDraftsInRecentList2","writable","classPrivateFieldLooseBase","Core","getStore","EventEmitter","subscribe","EventType","layout","onLayoutChange","bind","initDraftHistory","inited","LocalStorageManager","getInstance","get","LocalStorageKey","draft","Logger","warn","setDraft","dialogId","text","trim","clearTimeout","writeToStorageTimeout","setTimeout","set","clearDraft","getDraft","_babelHelpers$classPr","clearDraftInRecentList","entries","forEach","dispatch","id","event","from","getData","name","Layout","chat","entityId","Lib","Event","Application","Const"],"sources":["draft.bundle.js"],"mappings":"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"}