{"version":3,"file":"chat-content.bundle.map.js","names":["this","BX","Messenger","v2","Component","exports","ui_uploader_core","im_v2_component_dialog_chat","im_v2_component_textarea","im_v2_lib_logger","im_v2_lib_theme","im_v2_component_entitySelector","im_v2_lib_utils","im_v2_lib_permission","im_v2_lib_localStorage","im_v2_lib_menu","im_public","im_v2_lib_call","im_v2_component_sidebar","main_core","main_core_events","im_v2_application_core","im_v2_const","im_v2_component_elements","im_v2_provider_service","INPUT_PADDING","EditableChatTitle","name","components","ChatTitle","props","dialogId","type","String","required","emits","data","isEditing","inputWidth","showEditIcon","chatTitle","computed","dialog","$store","getters","canBeRenamed","PermissionManager","getInstance","canPerformAction","ChatActionType","rename","inputStyle","width","watch","length","mounted","methods","onTitleClick","$nextTick","then","$refs","titleInput","focus","onNewTitleSubmit","nameNotChanged","$emit","onEditCancel","template","CallTypes","video","id","locCode","start","startVideoCall","audio","beta","Core","getStore","CallManager","createBetaCallRoom","chatId","_getVideoCallItem","babelHelpers","classPrivateFieldLooseKey","_getAudioCallItem","_getBetaCallItem","_isCallBetaAvailable","CallMenu","BaseMenu","constructor","super","Object","defineProperty","value","_isCallBetaAvailable2","_getBetaCallItem2","_getAudioCallItem2","_getVideoCallItem2","getMenuOptions","className","getMenuClassName","angle","offsetLeft","offsetTop","getMenuItems","classPrivateFieldLooseBase","isAvailable","chatCanBeCalled","context","text","Loc","getMessage","onclick","emit","events","onMenuItemClick","menuInstance","close","disabled","settings","Extension","getSettings","get","CallButton","lastCallType","isActive","chatIsAllowedToCall","call","isConference","DialogType","videoconf","callButtonText","loc","created","getLastCallChoice","subscribeToMenuItemClick","getCallMenu","subscribe","event","callTypeId","getData","saveLastCallChoice","callMenu","onButtonClick","onMenuClick","shouldShowMenu","openMenu","menu","onStartConferenceClick","openConference","code","public","LocalStorageManager","LocalStorageKey","set","isCallBetaAvailable","phraseCode","$Bitrix","ChatHeader","Avatar","AddToChat","default","sidebarOpened","Boolean","sidebarSearchOpened","showAddToChatPopup","AvatarSize","user","isInited","inited","isUser","isChat","isGuest","role","UserRole","guest","avatarStyle","backgroundImage","avatar","dialogDescription","getMessagePlural","userCounter","userLink","Utils","getProfileLink","userLastOnline","showInviteButton","extend","canChangeAvatar","toggleRightPanel","toggleSearchPanel","onMembersClick","newTitle","getChatService","renameChat","catch","UI","Notification","Center","notify","content","chatService","ChatService","openInvitePopup","onAvatarClick","avatarInput","click","async","input","target","file","files","preparedAvatar","prepareAvatar","changeAvatar","onContainerClick","stopPropagation","replacements","SidebarWrapper","ChatSidebar","sidebarDetailBlock","onClickBack","EVENT_NAMESPACE","_observer","_textareaHeight","_initObserver","ResizeManager","EventEmitter","_initObserver2","writable","setEventNamespace","observeTextarea","element","observe","clientHeight","unobserveTextarea","unobserve","ResizeObserver","entries","forEach","entry","_entry$borderBoxSize","height","borderBoxSize","blockSize","Type","isNumber","onHeightChange","newHeight","DropArea","show","EmptyState","BUTTON_BACKGROUND_COLOR","BUTTON_HOVER_COLOR","BUTTON_TEXT_COLOR","MutePanel","ChatButton","Button","ButtonSize","isMuted","muteList","includes","getUserId","buttonText","mutedCode","unmutedCode","buttonColorScheme","borderColor","Color","transparent","backgroundColor","iconColor","textColor","hoverColor","unmuteChat","muteChat","JoinPanel","ButtonColor","joinChat","CHAT_HEADER_HEIGHT","ChatContent","ChatDialog","ChatTextarea","directives","binding","instance","textareaResizeManager","beforeUnmount","entityId","contextMessageId","Number","needSidebarTransition","searchSidebarOpened","textareaHeight","showDropArea","lastDropAreaEnterTarget","layout","hasPinnedMessages","canPost","send","sidebarTransitionName","containerClasses","alignment","Settings","appearance","backgroundStyle","ThemeManager","getCurrentBackgroundStyle","dialogContainerStyle","TEXTAREA_PLACEHOLDER_HEIGHT","dropAreaStyles","PINNED_MESSAGES_HEIGHT","DROP_AREA_OFFSET","dropAreaTopOffset","top","isSearchSidebarOpened","SidebarDetailBlock","messageSearch","newValue","oldValue","Logger","warn","onChatChange","resetSidebarDetailState","saveSidebarOpenedState","restoreSidebarOpenState","initTextareaResizeManager","EventType","sidebar","open","onSidebarOpen","onSidebarClose","unsubscribe","isExternalId","realDialogId","prepareDialogId","dispatch","layoutName","Layout","chat","contextId","loading","loadChatWithContext","loadChat","error","showNotification","openChat","loadChatWithMessages","toggleSidebar","detailBlock","toggleMembersPanel","main","eventData","sidebarOpenState","WRITE_TO_STORAGE_TIMEOUT","clearTimeout","saveSidebarStateTimeout","setTimeout","onDragEnter","hasDataTransferOnlyFiles","dataTransfer","success","onDragLeave","onDrop","getFilesFromDataTransfer","getUploadingService","addFilesFromInput","uploadingService","UploadingService","Content","Uploader","Dialog","Lib","EntitySelector","Event","Application","Const","Elements","Provider","Service"],"sources":["chat-content.bundle.js"],"mappings":"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"}