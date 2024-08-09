{"version":3,"file":"agent-contract.bundle.map.js","names":["this","BX","exports","main_core_events","main_core","main_popup","ui_buttons","AgentContractController","UI","EntityEditorController","constructor","id","settings","super","initialize","onAfterSave","window","top","onCustomEvent","sliders","SidePanel","Instance","getOpenSliders","forEach","slider","getWindow","ControllersFactory","eventName","EventEmitter","subscribe","event","eventArgs","getCompatData","methods","factory","bind","type","controlId","AgentContractModel","EntityModel","isCaptionEditable","getCaption","title","getField","isString","setCaption","caption","setField","prepareCaptionData","data","ModelFactory","GridActions","options","grid","addCustomEvent","_this$grid","reload","bindAnchors","rules","condition","RegExp","allowChangeHistory","cacheable","width","delete","popup","Popup","titleBar","Loc","getMessage","content","buttons","Button","text","color","ButtonColor","SUCCESS","onclick","button","setDisabled","ajax","runAction","then","response","_this$grid2","destroy","catch","errors","Notification","Center","notify","util","htmlspecialchars","message","DANGER","show","deleteList","ids","getRows","getSelectedIds","_this$grid3","_this$grid4","error","Catalog","Event","Main"],"sources":["agent-contract.bundle.js"],"mappings":"AAAAA,KAAKC,GAAKD,KAAKC,IAAM,CAAC,GACrB,SAAUC,EAAQC,EAAiBC,EAAUC,EAAWC,GACxD,aAEA,MAAMC,UAAgCN,GAAGO,GAAGC,uBAC1CC,YAAYC,EAAIC,GACdC,QACAb,KAAKc,WAAWH,EAAIC,EACtB,CACAG,cACEF,MAAME,cACNC,OAAOC,IAAIhB,GAAGiB,cAAc,gCAC5B,IAAIC,EAAUlB,GAAGmB,UAAUC,SAASC,iBACpCH,EAAQI,SAAQC,IACdA,EAAOC,YAAYxB,GAAGiB,cAAc,+BAA+B,GAEvE,EAGF,MAAMQ,EACJhB,YAAYiB,GACVxB,EAAiByB,aAAaC,UAAUF,EAAY,iBAAiBG,IACnE,MAAO,CAAEC,GAAaD,EAAME,gBAC5BD,EAAUE,QAAQ,kBAAoBjC,KAAKkC,QAAQC,KAAKnC,KAAK,GAEjE,CACAkC,QAAQE,EAAMC,EAAWzB,GACvB,GAAIwB,IAAS,iBAAkB,CAC7B,OAAO,IAAI7B,EAAwB8B,EAAWzB,EAChD,CACA,OAAO,IACT,EAGF,MAAM0B,UAA2BrC,GAAGO,GAAG+B,YACrC7B,YAAYC,EAAIC,GACdC,QACAb,KAAKc,WAAWH,EAAIC,EACtB,CACA4B,oBACE,OAAO,IACT,CACAC,aACE,IAAIC,EAAQ1C,KAAK2C,SAAS,SAC1B,OAAO1C,GAAGmC,KAAKQ,SAASF,GAASA,EAAQ,EAC3C,CACAG,WAAWC,GACT9C,KAAK+C,SAAS,QAASD,EACzB,CACAE,mBAAmBC,GACjBA,EAAK,SAAWjD,KAAK2C,SAAS,QAAS,GACzC,EAGF,MAAMO,EACJxC,cACEP,EAAiByB,aAAaC,UAAU,+CAA+CC,IACrF,MAAO,CAAEC,GAAaD,EAAME,gBAC5BD,EAAUE,QAAQ,kBAAoBjC,KAAKkC,QAAQC,KAAKnC,KAAK,GAEjE,CACAkC,QAAQE,EAAMC,EAAWzB,GACvB,GAAIwB,IAAS,iBAAkB,CAC7B,OAAO,IAAIE,EAAmBD,EAAWzB,EAC3C,CACA,OAAO,IACT,EAGF,MAAMuC,EACJzC,YAAY0C,EAAU,CAAC,GACrBpD,KAAKqD,KAAOD,EAAQC,MAAQ,KAC5BpD,GAAGqD,eAAe,gCAAgC,KAChD,IAAIC,GACHA,EAAavD,KAAKqD,OAAS,UAAY,EAAIE,EAAWC,QAAQ,IAEjEvD,GAAGmB,UAAUC,SAASoC,YAAY,CAChCC,MAAO,CAAC,CACNC,UAAW,CAAC,IAAIC,OAAO,mCAAoC,IAAIA,OAAO,uDACtER,QAAS,CACPS,mBAAoB,MACpBC,UAAW,MACXC,MAAO,QAIf,CACAC,OAAOrD,GACL,IAAIsD,EAAQ,IAAI5D,EAAW6D,MAAM,CAC/BvD,GAAI,2CACJwD,SAAU/D,EAAUgE,IAAIC,WAAW,6CACnCC,QAASlE,EAAUgE,IAAIC,WAAW,+CAClCE,QAAS,CAAC,IAAIjE,EAAWkE,OAAO,CAC9BC,KAAMrE,EAAUgE,IAAIC,WAAW,0CAC/BK,MAAOpE,EAAWqE,YAAYC,QAC9BC,QAAS,CAACC,EAAQhD,KAChBgD,EAAOC,cACP3E,EAAU4E,KAAKC,UAAU,sCAAuC,CAC9DhC,KAAM,CACJtC,GAAIA,KAELuE,MAAKC,IACN,IAAIC,EACJnB,EAAMoB,WACLD,EAAcpF,KAAKqD,OAAS,UAAY,EAAI+B,EAAY5B,QAAQ,IAChE8B,OAAMH,IACP,GAAIA,EAASI,OAAQ,CACnBtF,GAAGO,GAAGgF,aAAaC,OAAOC,OAAO,CAC/BpB,QAASrE,GAAG0F,KAAKC,iBAAiBT,EAASI,OAAO,GAAGM,UAEzD,CACA5B,EAAMoB,SAAS,GACf,IAEF,IAAI/E,EAAWkE,OAAO,CACxBC,KAAMrE,EAAUgE,IAAIC,WAAW,wCAC/BK,MAAOpE,EAAWqE,YAAYmB,OAC9BjB,QAAS,CAACC,EAAQhD,KAChBmC,EAAMoB,SAAS,OAIrBpB,EAAM8B,MACR,CACAC,aACE,IAAIC,EAAMjG,KAAKqD,KAAK6C,UAAUC,iBAC9B/F,EAAU4E,KAAKC,UAAU,0CAA2C,CAClEhC,KAAM,CACJgD,IAAKA,KAENf,MAAKC,IACN,IAAIiB,GACHA,EAAcpG,KAAKqD,OAAS,UAAY,EAAI+C,EAAY5C,QAAQ,IAChE8B,OAAMH,IACP,IAAIkB,EACJ,GAAIlB,EAASI,OAAQ,CACnBJ,EAASI,OAAOhE,SAAQ+E,IACtB,GAAIA,EAAMT,QAAS,CACjB5F,GAAGO,GAAGgF,aAAaC,OAAOC,OAAO,CAC/BpB,QAASrE,GAAG0F,KAAKC,iBAAiBU,EAAMT,UAE5C,IAEJ,EACCQ,EAAcrG,KAAKqD,OAAS,UAAY,EAAIgD,EAAY7C,QAAQ,GAErE,EAGFtD,EAAQwB,mBAAqBA,EAC7BxB,EAAQgD,aAAeA,EACvBhD,EAAQiD,YAAcA,CAEvB,EAxJA,CAwJGnD,KAAKC,GAAGsG,QAAUvG,KAAKC,GAAGsG,SAAW,CAAC,EAAGtG,GAAGuG,MAAMvG,GAAGA,GAAGwG,KAAKxG,GAAGO"}