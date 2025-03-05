{"version":3,"file":"sectionmanager.bundle.map.js","names":["this","BX","exports","calendar_util","calendar_sectionmanager","main_core","main_core_events","CalendarSection","constructor","data","updateData","calendarContext","Util","getCalendarContext","getId","id","type","CAL_TYPE","ownerId","parseInt","OWNER_ID","ID","color","COLOR","name","NAME","isShown","sectionManager","sectionIsShown","show","hiddenSections","getHiddenSections","filter","sectionId","setHiddenSections","saveHiddenSections","hide","push","remove","EventAlias","getBX","Event","EventEmitter","emit","BaseEvent","ajax","runAction","then","response","updateListAfterDelete","hideSyncSection","onCustomEvent","calendar","sectionStatus","hideExternalCalendarSection","getLink","LINK","canBeConnectedToOutlook","isPseudo","OUTLOOK_JS","CAL_DAV_CAL","CAL_DAV_CON","browser","IsMac","connectToOutlook","url","result","eval","canDo","action","isVirtual","includes","hasPermission","PERM","isSuperposed","SUPERPOSED","indexOf","GAPI_CALENDAR_ID","EXTERNAL_TYPE","isGoogle","googleTypes","isCalDav","isIcloud","isOffice365","isArchive","isExchange","isCompanyCalendar","isGroupCalendar","hasConnection","connectionLinks","length","isLocationRoom","belongsToView","getCalendarType","getOwnerId","belongsToOwner","belongsToUser","getUserId","userId","ACTIVE","getExternalType","getConnectionLinks","Type","isArray","externalTypeIsLocal","SectionManager","EXTERNAL_TYPE_LOCAL","isPrimaryForConnection","find","connection","isPrimary","isActive","getType","getConnectionIdList","connectionIdList","connectionId","reload","section","i","sections","CalendarTaskSection","defaultColor","belongToUser","defaultName","Loc","getMessage","super","edit_section","view_full","view_time","view_title","isUserTaskSection","taskSectionBelongToUser","config","setSections","setConfig","addTaskSection","sortSections","subscribeOnce","event","deleteSectionHandler","reloadDataDebounce","Runtime","debounce","reloadData","RELOAD_DELAY","rawSections","sectionIndex","forEach","sectionData","sort","a","b","isFunction","localeCompare","index","calendarType","ownerName","defaultSectionAccess","new_section_access","sectionAccessTasks","showTasks","customizationData","sectionCustomization","meetSectionId","taskSection","handlePullChanges","params","command","fields","getSections","getSuperposedSectionList","getSectionListForEdit","getSection","getDefaultSectionName","getDefaultSectionAccess","saveSection","access","Promise","resolve","_params$section","isString","trim","isCustomization","analyticsLabel","customization","external_type","sectionList","Calendar","displayError","errors","util","in_array","optionName","userIsOwner","userOptions","save","getSectionsInfo","allActive","superposed","active","hidden","undefined","deleteFromArray","static","isExternalMode","getDefaultSection","newEntrySectionId","options","followedUserList","trackingUsersList","getFollowedUserList","sectionGroups","title","user","htmlspecialchars","FORMATTED_NAME","getSectionAccessTasks","isNumber","defaultSectionId","item","section1","section2","setDefaultSection","userSettings","getUserSettings","key","defaultSections","setUserSettings","sectionExternalType","linkList","provider","syncInterface","getProviderById"],"sources":["sectionmanager.bundle.js"],"mappings":"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"}