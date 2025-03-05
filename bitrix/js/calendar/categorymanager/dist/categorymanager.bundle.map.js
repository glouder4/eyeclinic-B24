{"version":3,"file":"categorymanager.bundle.map.js","names":["this","BX","exports","calendar_sectionmanager","main_core","calendar_util","Category","constructor","data","updateData","calendarContext","Util","getCalendarContext","rooms","id","parseInt","ID","name","NAME","addRoom","room","push","getId","setCheckboxStatus","checkboxStatus","CategoryManager$$1","SectionManager","config","super","setCategories","categories","setConfig","sortCategories","permissions","perm","locationContext","categoryIndex","sort","a","b","toLowerCase","forEach","category","i","params","categoryData","length","getCategories","getCategory","createCategory","Promise","resolve","checkName","ajax","runAction","then","response","getBX","Event","EventEmitter","emit","BaseEvent","categoryList","updateLocationContext","Calendar","displayError","errors","updateCategory","toAddCategory","toRemoveCategory","deleteCategory","reload","trim","isEmpty","Loc","getMessage","static","param","Type","isArray","undefined","canDo","action","unsetRooms","map","handlePullCategoryChanges","command","categoryId","reloadCategoriesFromDatabase","reloadDataDebounce","Controls","Location","setLocationList","unsetCategoryRooms","getCategoriesWithRooms","categoriesWithRooms","default","categoryIndexForRoom","roomsManagerFromDB","reloadRoomsFromDatabase","setValues","bind","getCategoryRooms","categoryRooms","CategoryManager"],"sources":["categorymanager.bundle.js"],"mappings":"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"}