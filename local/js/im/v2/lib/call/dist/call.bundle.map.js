{"version":3,"file":"call.bundle.map.js","names":["this","BX","Messenger","v2","exports","main_core_events","ui_vue3_vuex","im_call","im_public","im_v2_lib_slider","im_v2_lib_logger","im_v2_lib_soundNotification","im_v2_lib_rest","im_v2_const","main_core","ui_entitySelector","ui_buttons","im_v2_application_core","BetaCallService","static","chatId","runAction","RestMethod","imCallBetaCreateRoom","data","_","t","_t","openCallUserSelector","params","handleAddCLick","selectedItems","dialog","getSelectedItems","preparedItems","prepareUser","forEach","item","onSelect","user","handleCancelCLick","hide","Dialog","targetNode","bindElement","width","enableSearch","dropdownMode","context","entities","id","dynamicLoad","itemOptions","default","linkTitle","link","options","inviteEmployeeLink","Core","getUserId","filters","footer","getFooter","show","Promise","resolve","close","users","map","name","title","text","avatar","avatar_hr","gender","customData","get","GENDER","addButtonTitle","Loc","getMessage","cancelButtonTitle","Tag","render","_controller","babelHelpers","classPrivateFieldLooseKey","_store","_getController","_subscribeToEvents","_onCallCreated","_onCallJoin","_onCallLeave","_onCallDestroy","_onOpenChat","_checkCallSupport","_checkUserCallSupport","_checkChatCallSupport","_pushServerIsActive","_getCurrentDialogId","CallManager","instance","getInstance","constructor","Object","defineProperty","value","_getCurrentDialogId2","_pushServerIsActive2","_checkChatCallSupport2","_checkUserCallSupport2","_checkCallSupport2","_onOpenChat2","_onCallDestroy2","_onCallLeave2","_onCallJoin2","_onCallCreated2","_subscribeToEvents2","_getController2","writable","classPrivateFieldLooseBase","getStore","createBetaCallRoom","createRoom","startCall","dialogId","withVideo","Logger","warn","joinCall","callId","leaveCurrentCall","foldCurrentCall","hasActiveCall","hasVisibleCall","fold","unfoldCurrentCall","unfold","getCurrentCallDialogId","currentCall","associatedEntity","hasCurrentCall","hasCurrentScreenSharing","isScreenSharingStarted","startTest","test","chatCanBeCalled","callSupported","Controller","init","language","getLanguageId","messengerFacade","getDefaultZIndex","MessengerSlider","getZIndex","isMessengerOpen","isOpened","isSliderFocused","isFocused","isThemeDark","openMessenger","openChat","openHistory","openSettings","openHelpArticle","getContainer","document","querySelector","viewContainerClass","getMessageCount","getters","getCurrentDialogId","isPromoRequired","repeatSound","soundType","timeout","force","SoundNotificationManager","playLoop","stopRepeatSound","stop","showUserSelector","events","Events","onOpenVideoConference","event","getData","code","openConference","EventEmitter","subscribe","EventType","layout","onOpenChat","bind","onOpenNotifications","call","addEventListener","Call","Event","onJoin","onLeave","onDestroy","dispatch","state","RecentCallStatus","waiting","fields","joined","callDialogId","openedChat","Util","isWebRTCSupported","userId","Number","parseInt","status","bot","network","lastActivityDate","userCounter","getUserLimit","Layout","chat","entityId","Lib","Vue3","Vuex","Const","UI","EntitySelector","Application"],"sources":["call.bundle.js"],"mappings":"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"}