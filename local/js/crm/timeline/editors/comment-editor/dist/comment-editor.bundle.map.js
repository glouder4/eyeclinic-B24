{"version":3,"file":"comment-editor.bundle.map.js","names":["this","BX","Crm","Timeline","exports","main_core","main_loader","ui_notification","_commentId","babelHelpers","classPrivateFieldLooseKey","_editorName","_editorContainer","_editor","_postForm","_commentMessage","_loader","_onEditorHtmlLoad","_onRunRequestError","_showEditor","_showLoader","CommentEditor","constructor","commentId","Object","defineProperty","value","_showLoader2","_showEditor2","_onRunRequestError2","_onEditorHtmlLoad2","writable","Error","classPrivateFieldLooseBase","Text","toInteger","util","getRandomString","show","editorContainer","Type","isDomNode","oEditor","SetContent","ReInitIframe","ajax","runAction","data","id","name","then","result","assets","assetsToLoad","hasOwnProperty","css","js","load","Promise","all","string","map","stringValue","Runtime","html","catch","getContent","content","GetContent","trim","isStringFilled","UI","Notification","Center","notify","message","getHtmlContent","currentViewName","iframeView","GetValue","getAttachments","attachmentList","eventNode","querySelectorAll","forEach","input","push","isObject","LHEPostForm","setTimeout","bind","isArray","errors","length","autoHideDelay","status","getHandler","BXHtmlEditor","Get","onCustomEvent","dom","textareaCont","style","opacity","iframeCont","Focus","showLoader","Loader","size","offset","top","hide","Editors"],"sources":["comment-editor.bundle.js"],"mappings":"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"}