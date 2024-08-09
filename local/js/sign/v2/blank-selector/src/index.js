import { Tag, Loc, Dom, Event, Type } from 'main.core';
import { Loader } from 'main.loader';
import { Popup } from 'main.popup';
import { EventEmitter, type BaseEvent } from 'main.core.events';
import { TileWidget } from 'ui.uploader.tile-widget';
import { UploaderEvent, type UploaderFile } from 'ui.uploader.core';
import { Api } from 'sign.v2.api';
import { ListItem } from './list-item';
import { Blank } from './blank';
import './style.css';

import type { BlankSelectorConfig } from './types/config';

type BlankSelectorOptions = {
	events?: {
		[key: string]: (event: BaseEvent) => void
	},
	uploaderOptions: {},
};

type RemoveOptions = {
	removeFromServer: boolean;
};

const uploaderOptions = {
	controller: 'sign.upload.blankUploadController',
	acceptedFileTypes: [
		'.jpg', '.jpeg',
		'.png', '.pdf',
		'.doc', '.docx',
		'.rtf', '.odt',
	],
	multiple: true,
	autoUpload: false,
	maxFileSize: 50 * 1024 * 1024,
	imageMaxFileSize: 10 * 1024 * 1024,
	maxTotalFileSize: 50 * 1024 * 1024,
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

export class BlankSelector extends EventEmitter
{
	selectedBlankId: number;
	blanks: Map<string, ListItem>;
	#tileWidget: TileWidget;
	#tileWidgetContainer: HTMLElement;
	#uploadButtonsContainer: HTMLElement;
	#relatedTarget: ?HTMLElement;
	#blanksContainer: HTMLElement;
	#page: number;
	#loadMoreButton: HTMLElement;
	#api: API;
	#config: BlankSelectorConfig;

	constructor(config: BlankSelectorConfig)
	{
		super();
		this.setEventNamespace('BX.Sign.V2.BlankSelector');
		this.subscribeFromOptions(config?.events);
		this.#config = config;
		this.selectedBlankId = 0;
		this.blanks = new Map();
		this.#page = 0;
		const uploadButtons = this.#createUploadButtons();
		const dragArea = Tag.render`
			<label class="sign-blank-selector__list_drag-area-label">
				${Loc.getMessage('SIGN_BLANK_SELECTOR_DRAG_AREA')}
			</label>
		`;
		const widgetOptions = {
			slots: {
				afterDropArea: {
					computed: {
						title: () => Loc.getMessage('SIGN_BLANK_SELECTOR_CLEAR_ALL')
					},
					methods: {
						clear: () => {
							this.clearFiles({ removeFromServer: false });
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
		this.#uploadButtonsContainer = Tag.render`
			<div class="sign-blank-selector__list --with-buttons">
				${uploadButtons}
				${dragArea}
			</div>
		`;
		this.#tileWidget = new TileWidget({
			...uploaderOptions,
			...config.uploaderOptions,
			dropElement: this.#uploadButtonsContainer,
			browseElement: [...uploadButtons, dragArea],
			events: {
				[UploaderEvent.BEFORE_FILES_ADD]: (event) => this.#onFileBeforeAdd(event),
				[UploaderEvent.FILE_ADD]: (event) => this.#onFileAdd(event),
				[UploaderEvent.FILE_REMOVE]: (event) => this.#onFileRemove(event),
				[UploaderEvent.UPLOAD_START]: (event) => this.#onUploadStart(event)
			}
		}, widgetOptions);
		this.#relatedTarget = null;
		Event.bind(document, 'mousedown', (event) => {
			this.#relatedTarget = event.target;
		});
		this.#blanksContainer = Tag.render`
			<div
				class="sign-blank-selector__list"
				onfocusin="${({ target }) => {
					this.selectBlank(+target.dataset.id);
				}}"
				onfocusout="${({ target }) => {
					this.resetSelectedBlank(+target.dataset.id, this.#relatedTarget);
				}}"
			></div>
		`;
		this.#tileWidgetContainer = Tag.render`
			<div class="sign-blank-selector__tile-widget"></div>
		`;
		this.#loadMoreButton = Tag.render`
			<button
				class="ui-btn ui-btn-light-border sign-blank-selector__load-more-btn --hidden"
				onclick="${() => this.#loadBlanks(this.#page + 1)}"
			>
				${Loc.getMessage('SIGN_BLANK_SELECTOR_LOAD_MORE')}
			</button>
		`;
		this.#api = new Api();
	}

	#checkForFilesValid(addedFiles: UploaderFile[]): boolean
	{
		const isImage = (file) => file.getType().includes('image/');
		const allAddedImages = addedFiles.every((file) => isImage(file));
		const validExtension = addedFiles.every((file) => {
			// TODO merge with this.#config.uploaderOptions.acceptedFileTypes
			return uploaderOptions.acceptedFileTypes.includes(
				`.${file.getExtension()}`
			);
		});
		if (!validExtension || addedFiles.length > 1 && !allAddedImages)
		{
			return false;
		}

		const uploader = this.#tileWidget.getUploader();
		const files = uploader.getFiles();
		const filesLength = files.length;
		const imagesLimit = this.#getImagesLimit();
		if (filesLength === 0 && addedFiles.length === 1)
		{
			return true;
		}

		const allExistImages = files.every((file) => isImage(file));
		const valid = allAddedImages
			&& allExistImages
			&& imagesLimit - filesLength >= addedFiles.length;

		return valid;
	}

	#onFileBeforeAdd(event: BaseEvent)
	{
		const { files: addedFiles } = event.getData();
		const valid = this.#checkForFilesValid(addedFiles);
		if (valid)
		{
			return;
		}

		let bindElement = this.#uploadButtonsContainer.firstElementChild;
		if (Dom.hasClass(this.#uploadButtonsContainer, '--hidden'))
		{
			const {
				$refs: { container }
			} = this.#tileWidget.getRootComponent();
			bindElement = container.firstElementChild;
		}

		const errorPopup = new Popup({
			...errorPopupOptions,
			bindElement,
			content: Loc.getMessage(
				'SIGN_BLANK_SELECTOR_UPLOAD_HINT',
				{ '%imageCountLimit%': this.#getImagesLimit() },
			),
		});
		errorPopup.show();
		event.preventDefault();
	}

	#getImagesLimit(): number
	{
		return Type.isInteger(parseInt(this.#config?.imagesCountLimitForBlankUpload, 10))
			? this.#config?.imagesCountLimitForBlankUpload
			: 20
		;
	}

	#onFileAdd()
	{
		this.#toggleTileVisibility(true);
		this.emit('addFile');
	}

	#onFileRemove(event: BaseEvent)
	{
		this.emit('removeFile');
		const { file: removedFile } = event.getData();
		const uploader = this.#tileWidget.getUploader();
		const files = uploader.getFiles();
		if (files.length === 0)
		{
			this.#toggleTileVisibility(false);
			this.emit('clearFiles');
		}
	}

	#onUploadStart()
	{
		const uploader = this.#tileWidget.getUploader();
		const [firstFile] = uploader.getFiles();
		const title = firstFile.getName();
		const fileId = firstFile.getId();
		const uploadingBlank = new Blank({ title });
		uploadingBlank.ready = false;
		Dom.prepend(uploadingBlank.getLayout(), this.#blanksContainer);
		firstFile.setCustomData(fileId, uploadingBlank);
	}

	#toggleTileVisibility(shouldShow: boolean)
	{
		const hiddenClass = '--hidden';
		if (shouldShow)
		{
			Dom.removeClass(this.#tileWidgetContainer, hiddenClass);
			Dom.addClass(this.#uploadButtonsContainer, hiddenClass);
			return;
		}

		Dom.addClass(this.#tileWidgetContainer, hiddenClass);
		Dom.removeClass(this.#uploadButtonsContainer, hiddenClass);
	}

	#createUploadButtons(): Array<HTMLElement>
	{
		const buttons = {
			img: {
				title: Loc.getMessage('SIGN_BLANK_SELECTOR_CREATE_NEW_PIC'),
				description: `jpeg, png`
			},
			pdf: {
				title: Loc.getMessage('SIGN_BLANK_SELECTOR_NEW_PDF'),
				description: `Adobe Acrobat`
			},
			doc: {
				title: Loc.getMessage('SIGN_BLANK_SELECTOR_CREATE_NEW_DOC'),
				description: `Microsoft Word`
			}
		};
		const entries = Object.entries(buttons);

		return entries.map(([key, { title, description }]) => {
			return new ListItem({
				title,
				description,
				modifier: key
			}).getLayout();
		});
	}

	async #resumeUploading()
	{
		const uploader = this.#tileWidget.getUploader();
		const pendingFiles = uploader.getFiles();
		uploader.setMaxParallelUploads(pendingFiles.length);
		const uploadPromise = new Promise((resolve) => {
			uploader.subscribeOnce('onUploadComplete', resolve);
		});
		uploader.start();
		await uploadPromise;
	}

	async createBlank(): Promise<number>
	{
		const uploader = this.#tileWidget.getUploader();
		const files = uploader.getFiles();
		const [firstFile] = files;
		await this.#resumeUploading();
		const blank = firstFile.getCustomData(firstFile.getId());
		try
		{
			const filesIds = files.map((file) => file.getServerFileId());
			const data = await this.#api.createBlank(filesIds);
			const blankId = data.id;
			this.#setupBlank(blankId, blank);

			return blankId;
		}
		catch (ex)
		{
			blank.remove();
			throw ex;
		}
	}

	async #loadBlanks(page: number)
	{
		const loader = new Loader({
			target: this.#blanksContainer,
			size: 80,
			mode: 'custom'
		});
		loader.show();
		try
		{
			const data = await this.#api.loadBlanks(page);
			const blanksOnPage = 10;
			if (data.length < blanksOnPage)
			{
				Dom.addClass(this.#loadMoreButton, '--hidden');
			}
			else
			{
				Dom.removeClass(this.#loadMoreButton, '--hidden');
			}
			if (data.length > 0)
			{
				data.forEach(({ title, id }) => {
					const blank = new Blank({ title });
					this.#setupBlank(id, blank);
					Dom.append(blank.getLayout(), this.#blanksContainer);
				});
				this.#page = page;
			}
		}
		catch(ex)
		{
			Dom.removeClass(this.#loadMoreButton, '--hidden');
		}

		loader.destroy();
	}

	#setupBlank(blankId: number, blank: Blank)
	{
		blank.id = blankId;
		blank.ready = true;
		this.blanks.set(blankId, blank);
	}

	resetSelectedBlank(blankId: ?number, relatedTarget: ?HTMLElement)
	{
		const blank = this.blanks.get(this.selectedBlankId);
		this.selectedBlankId = 0;

		blank?.deselect();
		this.emit('toggleSelection', {
			blankId,
			relatedTarget,
			selected: false
		});
	}

	selectBlank(blankId: number)
	{
		if (blankId !== this.selectedBlankId)
		{
			this.resetSelectedBlank();
		}

		this.selectedBlankId = blankId;
		this.#toggleTileVisibility(false);
		const blank = this.blanks.get(blankId);
		blank.select();
		this.emit('toggleSelection', { selected: true });
	}

	deleteBlank(blankId: number)
	{
		const lastBlank = this.blanks.get(blankId);
		if (lastBlank)
		{
			this.blanks.delete(blankId);
			lastBlank.remove();
		}
	}

	clearFiles(options: RemoveOptions)
	{
		const uploader = this.#tileWidget.getUploader();
		uploader.removeFiles(options);
	}

	isFilesReadyForUpload(): boolean
	{
		if (this.#tileWidget.getUploader().getFiles().length === 0)
		{
			return false;
		}

		return this.#tileWidget.getUploader().getFiles()
			.every((file: UploaderFile) => file.getErrors().length <= 0);
	}

	getLayout(): HTMLElement
	{
		this.#tileWidget.renderTo(this.#tileWidgetContainer);
		this.#toggleTileVisibility(false);
		const selectorContainer = Tag.render`
			<div class="sign-blank-selector">
				<p class="sign-blank-selector__add-title">
					${Loc.getMessage('SIGN_BLANK_SELECTOR_ADD_TITLE')}
				</p>
				${this.#tileWidgetContainer}
				${this.#uploadButtonsContainer}
				<p class="sign-blank-selector__templates_title">
					${Loc.getMessage('SIGN_BLANK_SELECTOR_RECENT_TEMPLATES_TITLE')}
				</p>
				${this.#blanksContainer}
				${this.#loadMoreButton}
			</div>`;
		if (this.#page === 0)
		{
			this.#loadBlanks(1);
		}

		return selectorContainer;
	}
}