{"version":3,"file":"api.bundle.map.js","names":["this","BX","Sign","exports","main_core","ui_notification","_get","babelHelpers","classPrivateFieldLooseKey","_post","_request","Api","constructor","Object","defineProperty","value","_request2","_post2","_get2","register","blankId","classPrivateFieldLooseBase","upload","uid","getPages","loadBlanks","page","createBlank","files","saveBlank","documentUid","blocks","loadBlocksData","changeDocument","loadDocument","configureDocument","loadBlocksByDocument","startSigning","addMember","entityType","entityId","party","presetId","removeMember","loadMembers","modifyCommunicationChannel","channelType","channelValue","loadCommunications","modifyTitle","title","modifyInitiator","initiator","refreshEntityNumber","loadRestrictions","saveStamp","memberUid","fileId","endpoint","data","notifyError","async","method","config","assign","preparePost","headers","name","_response$errors","response","ajax","runAction","errors","length","Error","message","ex","_ex$errors$0$message","_ex$errors$","content","UI","Notification","Center","notify","Text","encode","autoHideDelay","V2"],"sources":["api.bundle.js"],"mappings":"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"}