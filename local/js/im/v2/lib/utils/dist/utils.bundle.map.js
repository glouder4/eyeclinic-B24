{"version":3,"file":"utils.bundle.map.js","names":["this","BX","Messenger","v2","exports","im_v2_lib_desktopApi","main_date","im_v2_lib_dateFormatter","im_v2_const","main_core","UA","navigator","userAgent","toLowerCase","BrowserUtil","isChrome","Browser","isFirefox","isIe","isIE","isSafari","includes","isSafariBased","findParent","item","findTag","isHtmlElement","HTMLElement","Type","isString","document","parentNode","Dom","hasClass","openLink","link","target","window","open","waitForSelectionToUpdate","Promise","resolve","setTimeout","DateUtil","cast","date","def","Date","result","isNumber","Number","isNaN","getTime","getTimeToNextMidnight","nextMidnight","setHours","now","getStartOfTheDay","isToday","toDateString","isSameDay","firstDate","secondDate","getFullYear","getMonth","getDate","UA$1","DeviceUtil","isDesktop","isMobile","isUndefined","isMobileStatic","orientationHorizontal","orientationPortrait","getOrientation","Math","abs","orientation","UA$2","PlatformUtil","isMac","isLinux","isWindows","isWin","isBitrixMobile","isBitrixDesktop","DesktopApi","getDesktopVersion","getApiVersion","isDesktopFeatureEnabled","code","isFeatureEnabled","isAndroid","isIos","isIOS","getIosVersion","matches","match","parseFloat","openNewPage","url","MobileTools","openWidget","resolveOpenFunction","app","RestUtil","getLogTrackingParams","params","name","data","dialog","message","files","encodeURIComponent","isPlainObject","dataArray","hasOwnProperty","push","isArray","isObjectLike","type","entityId","split","isNull","length","join","emojiRegex","TextUtil","convertHtmlEntities","text","create","tag","html","innerText","convertSnakeToCamelCase","replace","$1","toUpperCase","escapeRegex","string","getLocalizeForNumber","phrase","number","language","pluralFormType","parseInt","Loc","getMessage","getFirstLetters","validSymbolsPattern","words","filter","word","firstLetter","charAt","test","insertUnseenWhitespace","splitIndex","UNSEEN_SPACE","firstPart","slice","secondPart","hasWhitespace","hasUserCode","getUuidV4","c","r","random","v","toString","isUuidV4","uuid","uuidV4pattern","RegExp","search","isTempMessage","messageId","startsWith","checkUrl","allowList","checkCorrectStartLink","find","protocol","element","attrs","href","indexOf","isEmojiOnly","messageText","replaceAll","htmlspecialchars","Text","encode","htmlspecialcharsback","decode","getWordsFromString","clearedString","getMentionBbCode","dialogId","settings","Extension","getSettings","UserUtil","getLastDateText","bot","network","lastActivityDate","isOnline","isMobileOnline","mobileLastDate","lastSeenText","getLastSeenText","idle","getIdleText","getStatusTextForLastDate","status","phraseCode","gender","absent","vacationText","DateFormatter","formatByCode","DateCode","shortDateFormat","DateTimeFormat","format","getOnlineLimit","FIVE_MINUTES","_Loc$getMessage","getStatusText","_Loc$getMessage2","formatLastActivityDate","isBirthdayToday","birthday","limitOnline","get","FIFTEEN_MINUTES","getProfileLink","userId","getCalendarLink","path","FileUtil","getFileExtension","fileName","splice","getIconTypeByFilename","extension","getIconTypeByExtension","icon","getFileTypeByExtension","FileType","file","normalizedExtension","image","video","audio","formatFileSize","fileSize","resultFileSize","sizes","KILOBYTE_SIZE","position","roundedSize","round","getShortFileName","maxLength","DELIMITER","DOT_LENGTH","SYMBOLS_TO_TAKE_BEFORE_EXTENSION","extensionLength","fileNameWithoutExtension","availableLength","trim","getViewerDataAttributes","viewerAttributes","dataAttributes","Object","entries","forEach","key","value","toKebabCase","createDownloadLink","urlDownload","anchorTag","style","setAttribute","isImage","fileType","getBase64","reader","FileReader","Event","bind","fullBase64","commaPosition","cutBase64","readAsDataURL","LETTER_CODE_PREFIX","DIGIT_CODE_PREFIX","CTRL","ALT","SHIFT","MODIFIERS","Set","_event","babelHelpers","classPrivateFieldLooseKey","_prepareCombination","_checkCombination","_checkModifiers","_checkShift","_checkAlt","_checkCtrl","_splitCombinationIntoKeyCodes","KeyChecker","constructor","event","defineProperty","_splitCombinationIntoKeyCodes2","_checkCtrl2","_checkAlt2","_checkShift2","_checkModifiers2","_checkCombination2","_prepareCombination2","writable","classPrivateFieldLooseBase","isCmdOrCtrl","metaKey","ctrlKey","isShift","shiftKey","isAltOrOption","altKey","isCombination","rawCombination","combinationList","some","combination","isExactCombination","Array","isStringFilled","exact","keyCodes","keyCode","missingShift","excessShift","missingAlt","excessAlt","missingCtrl","excessCtrl","withoutModifiers","has","map","singleLetterRegexp","singleDigitRegexp","KeyUtil","rawCombinationList","DomUtil","recursiveBackwardNodeSearch","node","className","maxNodeLevel","DialogUtil","isDialogId","isExternalId","isGroupExternalId","isCrmExternalId","GROUP_PREFIX","CRM_PREFIX","isLinesExternalId","LINES_PREFIX","isLinesHistoryId","ConferenceUtil","isValidUrl","isValidCode","isCurrentPortal","host","location","getCodeFromUrl","getUrlByCode","origin","getCodeByOptions","options","getWindowNameByCode","CallUtil","Utils","browser","device","platform","rest","user","dom","conference","call","Lib","Main","Im","V2","Const"],"sources":["utils.bundle.js"],"mappings":"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"}