/* eslint-disable */
this.BX = this.BX || {};
this.BX.Sign = this.BX.Sign || {};
(function (exports,main_popup,ui_uploader_tileWidget,ui_uploader_core,sign_v2_api,main_core_events,main_core,main_loader) {
	'use strict';

	let _ = t => t,
	  _t,
	  _t2;
	class ListItem {
	  constructor(props) {
	    this.props = props;
	  }
	  createListItem(settings = {}) {
	    const {
	      events = {},
	      children = []
	    } = settings;
	    const {
	      title,
	      description = '',
	      modifier
	    } = this.props;
	    const titleNode = main_core.Tag.render(_t || (_t = _`
			<span
				class="sign-blank-selector__list_item-title"
				title="${0}"
			>
				${0}
			</span>
		`), main_core.Text.encode(title), main_core.Text.encode(title));
	    const descriptionNode = main_core.Tag.render(_t2 || (_t2 = _`
			<span class="sign-blank-selector__list_item-info">
				${0}
			</span>
		`), main_core.Text.encode(description).replaceAll('[br]', '<br />'));
	    return main_core.Dom.create('div', {
	      attrs: {
	        className: `sign-blank-selector__list_item --${modifier}`
	      },
	      events,
	      children: [...children, titleNode, descriptionNode]
	    });
	  }
	  getLayout() {
	    if (!this.layout) {
	      this.layout = this.createListItem();
	    }
	    return this.layout;
	  }
	}

	let _$1 = t => t,
	  _t$1;
	var _statusNode = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("statusNode");
	var _loader = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("loader");
	class Blank extends ListItem {
	  constructor(props) {
	    super({
	      ...props,
	      modifier: 'blank'
	    });
	    Object.defineProperty(this, _statusNode, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _loader, {
	      writable: true,
	      value: void 0
	    });
	    babelHelpers.classPrivateFieldLooseBase(this, _statusNode)[_statusNode] = main_core.Tag.render(_t$1 || (_t$1 = _$1`
			<div class="sign-blank-selector__list_item-status"></div>
		`));
	    babelHelpers.classPrivateFieldLooseBase(this, _loader)[_loader] = new main_loader.Loader({
	      size: 30,
	      target: babelHelpers.classPrivateFieldLooseBase(this, _statusNode)[_statusNode]
	    });
	  }
	  createListItem() {
	    return super.createListItem({
	      children: [babelHelpers.classPrivateFieldLooseBase(this, _statusNode)[_statusNode]]
	    });
	  }
	  focus() {
	    this.getLayout().focus();
	  }
	  select() {
	    main_core.Dom.addClass(this.layout, '--active');
	  }
	  deselect(relatedTarget) {
	    main_core.Dom.removeClass(this.layout, '--active');
	  }
	  remove() {
	    main_core.Dom.remove(this.getLayout());
	  }
	  set id(id) {
	    this.getLayout().dataset.id = id;
	  }
	  set ready(isReady) {
	    if (!isReady) {
	      babelHelpers.classPrivateFieldLooseBase(this, _loader)[_loader].show();
	      return;
	    }
	    const layout = this.getLayout();
	    layout.tabIndex = '0';
	    babelHelpers.classPrivateFieldLooseBase(this, _loader)[_loader].hide();
	    main_core.Dom.addClass(layout, '--loaded');
	  }
	}

	let _$2 = t => t,
	  _t$2,
	  _t2$1,
	  _t3,
	  _t4,
	  _t5,
	  _t6;
	const uploaderOptions = {
	  controller: 'sign.upload.blankUploadController',
	  acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.rtf', '.odt'],
	  multiple: true,
	  autoUpload: false,
	  maxFileSize: 50 * 1024 * 1024,
	  imageMaxFileSize: 10 * 1024 * 1024,
	  maxTotalFileSize: 50 * 1024 * 1024
	};
	const errorPopupOptions = {
	  id: 'qwerty',
	  padding: 20,
	  offsetLeft: 40,
	  offsetTop: -12,
	  angle: true,
	  darkMode: true,
	  width: 300,
	  autoHide: true,
	  cacheable: false,
	  bindOptions: {
	    position: 'bottom'
	  }
	};
	var _tileWidget = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("tileWidget");
	var _tileWidgetContainer = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("tileWidgetContainer");
	var _uploadButtonsContainer = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("uploadButtonsContainer");
	var _relatedTarget = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("relatedTarget");
	var _blanksContainer = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("blanksContainer");
	var _page = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("page");
	var _loadMoreButton = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("loadMoreButton");
	var _api = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("api");
	var _config = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("config");
	var _checkForFilesValid = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("checkForFilesValid");
	var _onFileBeforeAdd = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("onFileBeforeAdd");
	var _getImagesLimit = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("getImagesLimit");
	var _onFileAdd = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("onFileAdd");
	var _onFileRemove = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("onFileRemove");
	var _onUploadStart = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("onUploadStart");
	var _toggleTileVisibility = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("toggleTileVisibility");
	var _createUploadButtons = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("createUploadButtons");
	var _resumeUploading = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("resumeUploading");
	var _loadBlanks = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("loadBlanks");
	var _setupBlank = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("setupBlank");
	class BlankSelector extends main_core_events.EventEmitter {
	  constructor(config) {
	    super();
	    Object.defineProperty(this, _setupBlank, {
	      value: _setupBlank2
	    });
	    Object.defineProperty(this, _loadBlanks, {
	      value: _loadBlanks2
	    });
	    Object.defineProperty(this, _resumeUploading, {
	      value: _resumeUploading2
	    });
	    Object.defineProperty(this, _createUploadButtons, {
	      value: _createUploadButtons2
	    });
	    Object.defineProperty(this, _toggleTileVisibility, {
	      value: _toggleTileVisibility2
	    });
	    Object.defineProperty(this, _onUploadStart, {
	      value: _onUploadStart2
	    });
	    Object.defineProperty(this, _onFileRemove, {
	      value: _onFileRemove2
	    });
	    Object.defineProperty(this, _onFileAdd, {
	      value: _onFileAdd2
	    });
	    Object.defineProperty(this, _getImagesLimit, {
	      value: _getImagesLimit2
	    });
	    Object.defineProperty(this, _onFileBeforeAdd, {
	      value: _onFileBeforeAdd2
	    });
	    Object.defineProperty(this, _checkForFilesValid, {
	      value: _checkForFilesValid2
	    });
	    Object.defineProperty(this, _tileWidget, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _tileWidgetContainer, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _uploadButtonsContainer, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _relatedTarget, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _blanksContainer, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _page, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _loadMoreButton, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _api, {
	      writable: true,
	      value: void 0
	    });
	    Object.defineProperty(this, _config, {
	      writable: true,
	      value: void 0
	    });
	    this.setEventNamespace('BX.Sign.V2.BlankSelector');
	    this.subscribeFromOptions(config == null ? void 0 : config.events);
	    babelHelpers.classPrivateFieldLooseBase(this, _config)[_config] = config;
	    this.selectedBlankId = 0;
	    this.blanks = new Map();
	    babelHelpers.classPrivateFieldLooseBase(this, _page)[_page] = 0;
	    const uploadButtons = babelHelpers.classPrivateFieldLooseBase(this, _createUploadButtons)[_createUploadButtons]();
	    const dragArea = main_core.Tag.render(_t$2 || (_t$2 = _$2`
			<label class="sign-blank-selector__list_drag-area-label">
				${0}
			</label>
		`), main_core.Loc.getMessage('SIGN_BLANK_SELECTOR_DRAG_AREA'));
	    const widgetOptions = {
	      slots: {
	        afterDropArea: {
	          computed: {
	            title: () => main_core.Loc.getMessage('SIGN_BLANK_SELECTOR_CLEAR_ALL')
	          },
	          methods: {
	            clear: () => {
	              this.clearFiles({
	                removeFromServer: false
	              });
	            }
	          },
	          template: `
						<span
							class="sign-blank-selector__tile-widget_clear-btn"
							:title="title"
							@click="clear()"
						>
						</span>
					`
	        }
	      }
	    };
	    babelHelpers.classPrivateFieldLooseBase(this, _uploadButtonsContainer)[_uploadButtonsContainer] = main_core.Tag.render(_t2$1 || (_t2$1 = _$2`
			<div class="sign-blank-selector__list --with-buttons">
				${0}
				${0}
			</div>
		`), uploadButtons, dragArea);
	    babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget] = new ui_uploader_tileWidget.TileWidget({
	      ...uploaderOptions,
	      ...config.uploaderOptions,
	      dropElement: babelHelpers.classPrivateFieldLooseBase(this, _uploadButtonsContainer)[_uploadButtonsContainer],
	      browseElement: [...uploadButtons, dragArea],
	      events: {
	        [ui_uploader_core.UploaderEvent.BEFORE_FILES_ADD]: event => babelHelpers.classPrivateFieldLooseBase(this, _onFileBeforeAdd)[_onFileBeforeAdd](event),
	        [ui_uploader_core.UploaderEvent.FILE_ADD]: event => babelHelpers.classPrivateFieldLooseBase(this, _onFileAdd)[_onFileAdd](event),
	        [ui_uploader_core.UploaderEvent.FILE_REMOVE]: event => babelHelpers.classPrivateFieldLooseBase(this, _onFileRemove)[_onFileRemove](event),
	        [ui_uploader_core.UploaderEvent.UPLOAD_START]: event => babelHelpers.classPrivateFieldLooseBase(this, _onUploadStart)[_onUploadStart](event)
	      }
	    }, widgetOptions);
	    babelHelpers.classPrivateFieldLooseBase(this, _relatedTarget)[_relatedTarget] = null;
	    main_core.Event.bind(document, 'mousedown', event => {
	      babelHelpers.classPrivateFieldLooseBase(this, _relatedTarget)[_relatedTarget] = event.target;
	    });
	    babelHelpers.classPrivateFieldLooseBase(this, _blanksContainer)[_blanksContainer] = main_core.Tag.render(_t3 || (_t3 = _$2`
			<div
				class="sign-blank-selector__list"
				onfocusin="${0}"
				onfocusout="${0}"
			></div>
		`), ({
	      target
	    }) => {
	      this.selectBlank(+target.dataset.id);
	    }, ({
	      target
	    }) => {
	      this.resetSelectedBlank(+target.dataset.id, babelHelpers.classPrivateFieldLooseBase(this, _relatedTarget)[_relatedTarget]);
	    });
	    babelHelpers.classPrivateFieldLooseBase(this, _tileWidgetContainer)[_tileWidgetContainer] = main_core.Tag.render(_t4 || (_t4 = _$2`
			<div class="sign-blank-selector__tile-widget"></div>
		`));
	    babelHelpers.classPrivateFieldLooseBase(this, _loadMoreButton)[_loadMoreButton] = main_core.Tag.render(_t5 || (_t5 = _$2`
			<button
				class="ui-btn ui-btn-light-border sign-blank-selector__load-more-btn --hidden"
				onclick="${0}"
			>
				${0}
			</button>
		`), () => babelHelpers.classPrivateFieldLooseBase(this, _loadBlanks)[_loadBlanks](babelHelpers.classPrivateFieldLooseBase(this, _page)[_page] + 1), main_core.Loc.getMessage('SIGN_BLANK_SELECTOR_LOAD_MORE'));
	    babelHelpers.classPrivateFieldLooseBase(this, _api)[_api] = new sign_v2_api.Api();
	  }
	  async createBlank() {
	    const uploader = babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].getUploader();
	    const files = uploader.getFiles();
	    const [firstFile] = files;
	    await babelHelpers.classPrivateFieldLooseBase(this, _resumeUploading)[_resumeUploading]();
	    const blank = firstFile.getCustomData(firstFile.getId());
	    try {
	      const filesIds = files.map(file => file.getServerFileId());
	      const data = await babelHelpers.classPrivateFieldLooseBase(this, _api)[_api].createBlank(filesIds);
	      const blankId = data.id;
	      babelHelpers.classPrivateFieldLooseBase(this, _setupBlank)[_setupBlank](blankId, blank);
	      return blankId;
	    } catch (ex) {
	      blank.remove();
	      throw ex;
	    }
	  }
	  resetSelectedBlank(blankId, relatedTarget) {
	    const blank = this.blanks.get(this.selectedBlankId);
	    this.selectedBlankId = 0;
	    blank == null ? void 0 : blank.deselect();
	    this.emit('toggleSelection', {
	      blankId,
	      relatedTarget,
	      selected: false
	    });
	  }
	  selectBlank(blankId) {
	    if (blankId !== this.selectedBlankId) {
	      this.resetSelectedBlank();
	    }
	    this.selectedBlankId = blankId;
	    babelHelpers.classPrivateFieldLooseBase(this, _toggleTileVisibility)[_toggleTileVisibility](false);
	    const blank = this.blanks.get(blankId);
	    blank.select();
	    this.emit('toggleSelection', {
	      selected: true
	    });
	  }
	  deleteBlank(blankId) {
	    const lastBlank = this.blanks.get(blankId);
	    if (lastBlank) {
	      this.blanks.delete(blankId);
	      lastBlank.remove();
	    }
	  }
	  clearFiles(options) {
	    const uploader = babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].getUploader();
	    uploader.removeFiles(options);
	  }
	  isFilesReadyForUpload() {
	    if (babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].getUploader().getFiles().length === 0) {
	      return false;
	    }
	    return babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].getUploader().getFiles().every(file => file.getErrors().length <= 0);
	  }
	  getLayout() {
	    babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].renderTo(babelHelpers.classPrivateFieldLooseBase(this, _tileWidgetContainer)[_tileWidgetContainer]);
	    babelHelpers.classPrivateFieldLooseBase(this, _toggleTileVisibility)[_toggleTileVisibility](false);
	    const selectorContainer = main_core.Tag.render(_t6 || (_t6 = _$2`
			<div class="sign-blank-selector">
				<p class="sign-blank-selector__add-title">
					${0}
				</p>
				${0}
				${0}
				<p class="sign-blank-selector__templates_title">
					${0}
				</p>
				${0}
				${0}
			</div>`), main_core.Loc.getMessage('SIGN_BLANK_SELECTOR_ADD_TITLE'), babelHelpers.classPrivateFieldLooseBase(this, _tileWidgetContainer)[_tileWidgetContainer], babelHelpers.classPrivateFieldLooseBase(this, _uploadButtonsContainer)[_uploadButtonsContainer], main_core.Loc.getMessage('SIGN_BLANK_SELECTOR_RECENT_TEMPLATES_TITLE'), babelHelpers.classPrivateFieldLooseBase(this, _blanksContainer)[_blanksContainer], babelHelpers.classPrivateFieldLooseBase(this, _loadMoreButton)[_loadMoreButton]);
	    if (babelHelpers.classPrivateFieldLooseBase(this, _page)[_page] === 0) {
	      babelHelpers.classPrivateFieldLooseBase(this, _loadBlanks)[_loadBlanks](1);
	    }
	    return selectorContainer;
	  }
	}
	function _checkForFilesValid2(addedFiles) {
	  const isImage = file => file.getType().includes('image/');
	  const allAddedImages = addedFiles.every(file => isImage(file));
	  const validExtension = addedFiles.every(file => {
	    // TODO merge with this.#config.uploaderOptions.acceptedFileTypes
	    return uploaderOptions.acceptedFileTypes.includes(`.${file.getExtension()}`);
	  });
	  if (!validExtension || addedFiles.length > 1 && !allAddedImages) {
	    return false;
	  }
	  const uploader = babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].getUploader();
	  const files = uploader.getFiles();
	  const filesLength = files.length;
	  const imagesLimit = babelHelpers.classPrivateFieldLooseBase(this, _getImagesLimit)[_getImagesLimit]();
	  if (filesLength === 0 && addedFiles.length === 1) {
	    return true;
	  }
	  const allExistImages = files.every(file => isImage(file));
	  const valid = allAddedImages && allExistImages && imagesLimit - filesLength >= addedFiles.length;
	  return valid;
	}
	function _onFileBeforeAdd2(event) {
	  const {
	    files: addedFiles
	  } = event.getData();
	  const valid = babelHelpers.classPrivateFieldLooseBase(this, _checkForFilesValid)[_checkForFilesValid](addedFiles);
	  if (valid) {
	    return;
	  }
	  let bindElement = babelHelpers.classPrivateFieldLooseBase(this, _uploadButtonsContainer)[_uploadButtonsContainer].firstElementChild;
	  if (main_core.Dom.hasClass(babelHelpers.classPrivateFieldLooseBase(this, _uploadButtonsContainer)[_uploadButtonsContainer], '--hidden')) {
	    const {
	      $refs: {
	        container
	      }
	    } = babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].getRootComponent();
	    bindElement = container.firstElementChild;
	  }
	  const errorPopup = new main_popup.Popup({
	    ...errorPopupOptions,
	    bindElement,
	    content: main_core.Loc.getMessage('SIGN_BLANK_SELECTOR_UPLOAD_HINT', {
	      '%imageCountLimit%': babelHelpers.classPrivateFieldLooseBase(this, _getImagesLimit)[_getImagesLimit]()
	    })
	  });
	  errorPopup.show();
	  event.preventDefault();
	}
	function _getImagesLimit2() {
	  var _babelHelpers$classPr, _babelHelpers$classPr2;
	  return main_core.Type.isInteger(parseInt((_babelHelpers$classPr = babelHelpers.classPrivateFieldLooseBase(this, _config)[_config]) == null ? void 0 : _babelHelpers$classPr.imagesCountLimitForBlankUpload, 10)) ? (_babelHelpers$classPr2 = babelHelpers.classPrivateFieldLooseBase(this, _config)[_config]) == null ? void 0 : _babelHelpers$classPr2.imagesCountLimitForBlankUpload : 20;
	}
	function _onFileAdd2() {
	  babelHelpers.classPrivateFieldLooseBase(this, _toggleTileVisibility)[_toggleTileVisibility](true);
	  this.emit('addFile');
	}
	function _onFileRemove2(event) {
	  this.emit('removeFile');
	  const {
	    file: removedFile
	  } = event.getData();
	  const uploader = babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].getUploader();
	  const files = uploader.getFiles();
	  if (files.length === 0) {
	    babelHelpers.classPrivateFieldLooseBase(this, _toggleTileVisibility)[_toggleTileVisibility](false);
	    this.emit('clearFiles');
	  }
	}
	function _onUploadStart2() {
	  const uploader = babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].getUploader();
	  const [firstFile] = uploader.getFiles();
	  const title = firstFile.getName();
	  const fileId = firstFile.getId();
	  const uploadingBlank = new Blank({
	    title
	  });
	  uploadingBlank.ready = false;
	  main_core.Dom.prepend(uploadingBlank.getLayout(), babelHelpers.classPrivateFieldLooseBase(this, _blanksContainer)[_blanksContainer]);
	  firstFile.setCustomData(fileId, uploadingBlank);
	}
	function _toggleTileVisibility2(shouldShow) {
	  const hiddenClass = '--hidden';
	  if (shouldShow) {
	    main_core.Dom.removeClass(babelHelpers.classPrivateFieldLooseBase(this, _tileWidgetContainer)[_tileWidgetContainer], hiddenClass);
	    main_core.Dom.addClass(babelHelpers.classPrivateFieldLooseBase(this, _uploadButtonsContainer)[_uploadButtonsContainer], hiddenClass);
	    return;
	  }
	  main_core.Dom.addClass(babelHelpers.classPrivateFieldLooseBase(this, _tileWidgetContainer)[_tileWidgetContainer], hiddenClass);
	  main_core.Dom.removeClass(babelHelpers.classPrivateFieldLooseBase(this, _uploadButtonsContainer)[_uploadButtonsContainer], hiddenClass);
	}
	function _createUploadButtons2() {
	  const buttons = {
	    img: {
	      title: main_core.Loc.getMessage('SIGN_BLANK_SELECTOR_CREATE_NEW_PIC'),
	      description: `jpeg, png`
	    },
	    pdf: {
	      title: main_core.Loc.getMessage('SIGN_BLANK_SELECTOR_NEW_PDF'),
	      description: `Adobe Acrobat`
	    },
	    doc: {
	      title: main_core.Loc.getMessage('SIGN_BLANK_SELECTOR_CREATE_NEW_DOC'),
	      description: `Microsoft Word`
	    }
	  };
	  const entries = Object.entries(buttons);
	  return entries.map(([key, {
	    title,
	    description
	  }]) => {
	    return new ListItem({
	      title,
	      description,
	      modifier: key
	    }).getLayout();
	  });
	}
	async function _resumeUploading2() {
	  const uploader = babelHelpers.classPrivateFieldLooseBase(this, _tileWidget)[_tileWidget].getUploader();
	  const pendingFiles = uploader.getFiles();
	  uploader.setMaxParallelUploads(pendingFiles.length);
	  const uploadPromise = new Promise(resolve => {
	    uploader.subscribeOnce('onUploadComplete', resolve);
	  });
	  uploader.start();
	  await uploadPromise;
	}
	async function _loadBlanks2(page) {
	  const loader = new main_loader.Loader({
	    target: babelHelpers.classPrivateFieldLooseBase(this, _blanksContainer)[_blanksContainer],
	    size: 80,
	    mode: 'custom'
	  });
	  loader.show();
	  try {
	    const data = await babelHelpers.classPrivateFieldLooseBase(this, _api)[_api].loadBlanks(page);
	    const blanksOnPage = 10;
	    if (data.length < blanksOnPage) {
	      main_core.Dom.addClass(babelHelpers.classPrivateFieldLooseBase(this, _loadMoreButton)[_loadMoreButton], '--hidden');
	    } else {
	      main_core.Dom.removeClass(babelHelpers.classPrivateFieldLooseBase(this, _loadMoreButton)[_loadMoreButton], '--hidden');
	    }
	    if (data.length > 0) {
	      data.forEach(({
	        title,
	        id
	      }) => {
	        const blank = new Blank({
	          title
	        });
	        babelHelpers.classPrivateFieldLooseBase(this, _setupBlank)[_setupBlank](id, blank);
	        main_core.Dom.append(blank.getLayout(), babelHelpers.classPrivateFieldLooseBase(this, _blanksContainer)[_blanksContainer]);
	      });
	      babelHelpers.classPrivateFieldLooseBase(this, _page)[_page] = page;
	    }
	  } catch (ex) {
	    main_core.Dom.removeClass(babelHelpers.classPrivateFieldLooseBase(this, _loadMoreButton)[_loadMoreButton], '--hidden');
	  }
	  loader.destroy();
	}
	function _setupBlank2(blankId, blank) {
	  blank.id = blankId;
	  blank.ready = true;
	  this.blanks.set(blankId, blank);
	}

	exports.BlankSelector = BlankSelector;

}((this.BX.Sign.V2 = this.BX.Sign.V2 || {}),BX.Main,BX.UI.Uploader,BX.UI.Uploader,BX.Sign.V2,BX.Event,BX,BX));
//# sourceMappingURL=blank-selector.bundle.js.map
