{"version":3,"file":"desktop-api.bundle.map.js","names":["this","BX","Messenger","v2","exports","main_core_events","im_v2_const","main_core","im_v2_lib_logger","lifecycleFunctions","isDesktop","Type","isObject","window","BXDesktopSystem","restart","_BXDesktopSystem","getApiVersion","Restart","shutdown","_BXDesktopSystem2","Shutdown","DesktopFeature","mask","id","version","versionFunctions","majorVersion","minorVersion","buildVersion","apiVersion","GetProperty","isFeatureEnabled","code","_window$BXDesktopSyst","Boolean","FeatureEnabled","isFeatureSupported","eventHandlers","eventFunctions","subscribe","eventName","handler","preparedHandler","event","_event$detail","params","detail","apply","push","Event","bind","unsubscribe","isFunction","isArrayFilled","forEach","eventHandler","unbind","emit","mainWindow","opener","top","allWindows","BXWindows","_window$BXDesktopWind","name","BXDesktopWindow","DispatchCustomEvent","emitToMainWindow","_mainWindow$BXDesktop","_mainWindow$BXDesktop2","GetMainWindow","windowFunctions","isTwoWindowMode","IsTwoWindowsMode","isChatWindow","settings","Extension","getSettings","get","isChatTab","location","href","includes","setActiveTab","target","_target$BXDesktopSyst","SetActiveTab","showWindow","_target$BXDesktopWind","ExecuteCommand","activateWindow","hideWindow","_target$BXDesktopWind2","closeWindow","_target$BXDesktopWind3","hideLoader","Dom","remove","document","getElementById","reloadWindow","BaseEvent","EventEmitter","EventType","desktop","onReload","reload","findWindow","find","createTab","path","preparedPath","create","tag","attrs","CreateTab","createImTab","CreateImTab","createWindow","callback","GetWindow","createTopmostWindow","htmlContent","setWindowPosition","rawParams","_BXDesktopWindow","preparedParams","Object","entries","key","value","preparedKey","toUpperCase","slice","SetProperty","prepareHtml","html","js","isDomNode","outerHTML","ready","isStringFilled","head","replaceAll","setWindowSize","width","height","Width","Height","setMinimumWindowSize","iconFunctions","setCounter","counter","important","preparedCounter","toString","SetIconBadge","SetTabBadge","setBrowserIconBadge","_BXDesktopSystem3","SetBrowserIconBadge","setIconStatus","status","_BXDesktopSystem4","SetIconStatus","setOfflineIcon","_BXDesktopSystem5","flashIcon","_BXDesktopSystem6","Browser","isWin","FlashIcon","DesktopSettingsKey","smoothing","telemetry","sliderBindingsStatus","settingsFunctions","getCameraSmoothingStatus","getCustomSetting","setCameraSmoothingStatus","preparedStatus","setCustomSetting","setTwoWindowMode","flag","V10","V8","getAutostartStatus","setAutostartStatus","getTelemetryStatus","setTelemetryStatus","StoreSettings","defaultValue","_BXDesktopSystem7","QuerySettings","commonFunctions","prepareResourcePath","source","result","url","URL","origin","legacyFunctions","changeTab","tabId","notificationFunctions","removeNativeNotifications","NotificationRemoveAll","loggerFunctions","writeToLogFile","filename","text","console","error","textPrepared","isString","isNumber","JSON","stringify","Log","printWelcomePrompt","join","osName","isMac","isLinux","promptMessage","Loc","getMessage","Logger","callMaskFunctions","getCallMask","setCallMaskLoadHandlers","setCallMask","maskUrl","backgroundUrl","Set3dAvatar","callBackgroundFunctions","getBackgroundImage","setCallBackground","promise","Promise","setTimeout","resolve","DesktopApi","Lib","Const"],"sources":["desktop-api.bundle.js"],"mappings":"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"}