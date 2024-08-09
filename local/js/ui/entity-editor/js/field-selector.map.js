{"version":3,"file":"field-selector.map.js","names":["BX","namespace","UI","EntityEditorFieldSelector","this","_id","_settings","_scheme","_excludedNames","_contentWrapper","_popup","fieldVisibleClass","fieldHiddenClass","_currentSchemeElementName","prototype","initialize","id","settings","prop","get","getArray","getMessage","name","getString","messages","isSchemeElementEnabled","schemeElement","getName","i","length","addClosingListener","listener","Event","EventEmitter","subscribe","removeClosingListener","unsubscribe","isOpened","isShown","setCurrentSchemeElementName","currentSchemeElementName","open","PopupWindow","autoHide","draggable","bindOptions","forceBindPosition","closeByEsc","closeIcon","zIndex","titleBar","content","prepareContent","lightShadow","contentNoPaddings","buttons","PopupWindowButton","text","message","className","events","click","delegate","onAcceptButtonClick","Button","color","Color","LIGHT","onCancelButtonClick","onPopupClose","bind","show","close","create","props","useFieldsSearch","headerWrapper","attrs","children","prepend","prepareContentHeaderSections","prepareContentHeaderSearch","container","columns","getElements","columnCount","column","sections","k","sectionCount","section","effectiveElements","elementChildren","j","childElement","isTransferable","push","sectionContainer","createSectionWrapper","getTitle","fillSectionElements","hiddenElements","hiddenSectionContainer","Loc","appendChild","headerSectionsWrapper","firstElementChild","buttonTitle","itemClass","headerSectionItem","html","input","onFilterSectionSearchInput","searchForm","onFilterSectionSearchInputClear","search","target","value","toLowerCase","getFieldsPopupItems","map","item","title","innerText","indexOf","removeClass","addClass","style","display","type","isArray","fieldsPopupItems","Array","from","querySelectorAll","prepareAnimation","onAnimationEnd","hasClass","getSelectedItems","results","checkBoxes","checkBox","checked","parts","split","sectionName","fieldName","emit","sender","isCanceled","items","destroy","onPopupDestroy","Tag","render","Text","encode","parentName","elements","forEach","itemId","itemWrapper","self","EntityEditorUserSelector","_isInitialized","_onlyUsers","getBoolean","getId","anchor","_mainWindow","SocNetLogDestination","containerWindow","init","extranetUser","userSearchArea","bindMainPopup","node","offsetTop","offsetLeft","callback","select","onSelect","unSelect","showSearchInput","departmentSelectDisable","users","groups","sonetgroups","socnetGroups","department","departmentRelation","buildDepartmentRelation","itemsLast","last","itemsSelected","getObject","isCrmFeed","useClientDatabase","destSort","allowAddUser","allowSearchCrmEmailUsers","allowUserSearch","openDialog","bindNode","closeDialog","bUndeleted","getFunction"],"sources":["field-selector.js"],"mappings":"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"}