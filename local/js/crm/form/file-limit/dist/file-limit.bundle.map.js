{"version":3,"file":"file-limit.bundle.map.js","names":["this","BX","Crm","exports","main_core","ui_sidepanel_layout","main_core_events","_templateObject","_templateObject2","_templateObject3","_templateObject4","ownKeys","object","enumerableOnly","keys","Object","getOwnPropertySymbols","symbols","filter","sym","getOwnPropertyDescriptor","enumerable","push","apply","_objectSpread","target","i","arguments","length","source","forEach","key","babelHelpers","defineProperty","getOwnPropertyDescriptors","defineProperties","_classPrivateMethodInitSpec","obj","privateSet","_checkPrivateRedeclaration","add","_classPrivateFieldInitSpec","privateMap","value","set","privateCollection","has","TypeError","_classPrivateMethodGet","receiver","fn","_classStaticPrivateFieldSpecSet","classConstructor","descriptor","_classCheckPrivateStaticAccess","_classCheckPrivateStaticFieldDescriptor","_classApplyDescriptorSet","call","writable","_classStaticPrivateFieldSpecGet","_classApplyDescriptorGet","action","undefined","get","_data","WeakMap","_ui","_render","WeakSet","_createLimitPercentageBlock","_getLimitPercentageText","FileLimit","_EventEmitter","inherits","_babelHelpers$getProt","_this","classCallCheck","_len","args","Array","_key","possibleConstructorReturn","getPrototypeOf","concat","assertThisInitialized","limitMb","currentBytes","canChange","container","HTMLElement","limit","block","input","HTMLInputElement","percentage","createClass","open","resolver","promise","Promise","resolve","instance","SidePanel","Instance","width","cacheable","events","onCloseComplete","getValue","contentCallback","Layout","createContent","extensions","title","Loc","getMessage","design","section","content","load","buttons","_ref","SaveButton","closeButton","onclick","btn","setDisabled","UI","Notification","Center","notify","setWaiting","save","then","close","classPrivateFieldGet","_this2","ajax","runAction","json","response","classPrivateFieldSet","data","_render2","_babelHelpers$classPr","_this3","classList","remove","Type","isInteger","isStringFilled","reject","Number","emit","_instance","EventEmitter","_createLimitPercentageBlock2","Tag","render","taggedTemplateLiteral","Math","ceil","percentageBlock","colorAlertStyle","addClass","innerText","_getLimitPercentageText2","min","isNull","Hide","percentageText","replace","Form","Event"],"sources":["file-limit.bundle.js"],"mappings":"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"}