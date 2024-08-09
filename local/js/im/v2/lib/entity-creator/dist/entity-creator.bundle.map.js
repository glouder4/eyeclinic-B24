{"version":3,"file":"entity-creator.bundle.map.js","names":["this","BX","Messenger","v2","exports","main_core_events","rest_client","ai_picker","calendar_sliderloader","im_v2_application_core","im_v2_const","REQUEST_METHODS","Object","freeze","task","RestMethod","imChatTaskPrepare","meeting","imChatCalendarPrepare","CALENDAR_ON_ENTRY_SAVE_EVENT","_chatId","babelHelpers","classPrivateFieldLooseKey","_restClient","_onCalendarEntrySaveHandler","_calendarSliderId","_createMeeting","_createAiText","_createTask","_requestPreparedParams","_openTaskSlider","_openCalendarSlider","_onCalendarEntrySave","EntityCreator","constructor","chatId","defineProperty","value","_onCalendarEntrySave2","_openCalendarSlider2","_openTaskSlider2","_requestPreparedParams2","_createTask2","_createAiText2","_createMeeting2","writable","classPrivateFieldLooseBase","Core","getRestClient","createAiTextForChat","startMessage","createTaskForChat","createTaskForMessage","messageId","createMeetingForChat","createMeetingForMessage","queryParams","CHAT_ID","then","sliderParams","params","bind","sliderId","EventEmitter","subscribeOnce","picker","Picker","moduleId","contextId","history","onSelect","item","emit","EventType","textarea","insertText","text","data","replace","setLangSpace","LangSpace","link","requestMethod","query","callMethod","result","catch","error","console","sliderUri","SidePanel","Instance","open","requestParams","cacheable","window","top","Calendar","SliderLoader","show","event","eventData","getData","CALENDAR_ID","responseData","entryId","imChatCalendarAdd","Lib","Event","AI","Application","Const"],"sources":["entity-creator.bundle.js"],"mappings":"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"}