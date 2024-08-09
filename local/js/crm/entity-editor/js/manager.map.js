{"version":3,"file":"manager.map.js","names":["BX","namespace","Crm","EntityEditorDupManager","this","_id","_settings","_groupInfos","_isEnabled","_serviceUrl","_entityTypeName","_form","_controller","prototype","initialize","id","settings","type","isNotEmptyString","util","getRandomString","prop","getBoolean","getObject","getString","get","_ignoredItems","getArray","CrmDupController","create","serviceUrl","entityTypeName","form","clientSearchBox","enableEntitySelect","searcSummaryPosition","ignoredItems","isEnabled","search","initialSearch","getGroupInfo","groupId","hasOwnProperty","getGroup","ensureGroupRegistered","group","registerGroup","registerField","config","field","unregisterField","self","EntityBizprocManager","_moduleId","_entity","_documentType","_autoExecuteType","_containerId","_fieldName","_validParameters","_formInput","_editor","_starter","_hasParameters","getInteger","_contentNode","Bizproc","Starter","moduleId","entity","documentType","onBeforeSave","result","promise","Promise","deferredWaiter","window","setTimeout","delegate","fulfill","getStatus","showAutoStartParametersPopup","contentNode","callback","onFillParameters","bind","e","console","log","onAfterSave","data","parameters","getFormElement","props","name","appendChild","value","messages","items","EntityRestPlacementManager","getSetting","bottomButton","proxy","openMarketplace","defer","initializeInterface","rest","Marketplace","open","PLACEMENT","AppLayout","PlacementInterface","initializePlacement","entityTypeId","_entityTypeId","entityId","_entityId","resizeWindow","params","cb","f","layoutName","height","parseInt","style","p","pos","width","reloadData","EntityEvent","fireUpdate"],"sources":["manager.js"],"mappings":"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"}