import { Cache, Loc, Tag, Text as TextFormat, Type, Dom } from 'main.core';
import Dummy from './dummy';
import { Selector } from 'crm.form.fields.selector';

export default class MyReference extends Dummy
{
	#field: string;
	#actionButton: HTMLElement;
	#cache = new Cache.MemoryCache();

	/**
	 * Sets new data.
	 * @param {any} data
	 */
	setData(data: any)
	{
		this.data = data ? data : {};
		this.#field = this.data.field ?? '';
	}

	/**
	 * Calls when block has placed on document.
	 */
	onPlaced()
	{
		this.#onActionClick();
	}

	/**
	 * Calls when action button was clicked.
	 */
	#onActionClick()
	{
		this.#getCrmFieldSelectorPanel()
			.show()
			.then((selectedName: Array<string>) => {
				if (selectedName.length === 0)
				{
					return;
				}

				Dom.removeClass(this.block.getLayout(), '--invalid');
				this.#field = selectedName[0];
				this.setData({
					field: this.#field,
				});
				setTimeout(() => {
					this.block.assign();
				}, 0);
			});
	}

	/**
	 * Returns action button for edit content.
	 * @return {HTMLElement | null}
	 */
	getActionButton(): ?HTMLElement
	{
		if (Type.isUndefined(Selector))
		{
			return null;
		}

		this.#actionButton = Tag.render`
			<div class="sign-document__block-style-btn --funnel">
				<button onclick="${this.#onActionClick.bind(this)}" data-role="action">
				</button>
			</div>
		`;

		this.#setActionButtonLabel();

		return this.#actionButton;
	}

	/**
	 * Sets label to action button.
	 */
	#setActionButtonLabel()
	{
		if (!this.#actionButton)
		{
			return;
		}

		const actionButton = this.#actionButton.querySelector('button');
		const defaultCaption = Loc.getMessage('SIGN_JS_DOCUMENT_REFERENCE_ACTION_BUTTON');
		if (!this.#field)
		{
			actionButton.textContent = defaultCaption;
			return;
		}

		const fieldSelector = this.#cache.get('fieldSelector') ?? this.#getCrmFieldSelectorPanel();
		const fieldsList = fieldSelector.getFieldsList();
		const fields = [
			...fieldsList?.COMPANY?.FIELDS ?? [],
			...fieldsList?.SMART_DOCUMENT?.FIELDS ?? []
		];
		const field = fields.find((field) => field.name === this.#field);
		const caption = field ? field.caption : defaultCaption;
		actionButton.textContent = caption;
	}

	/**
	 * Returns type's content in view mode.
	 * @return {HTMLElement | string}
	 */
	getViewContent(): HTMLElement | string
	{
		this.#setActionButtonLabel();

		const { width, height } = this.block.getPosition();

		if (this.data.src)
		{
			return Tag.render`
				<div style="width: ${width - 14}px; height: ${height - 14}px; background: url(${this.data.src}) no-repeat top; background-size: cover;">
				</div>
			`;
		}
		else
		{
			const className = !this.data.text ? 'sign-document__block-content_member-nodata' : '';

			return Tag.render`
				<div class="${className}">
					${TextFormat.encode(this.data.text || Loc.getMessage('SIGN_JS_DOCUMENT_MEMBER_NO_DATA_MY_BLOCKS'))}
				</div>
			`;
		}
	}

	#getCrmFieldSelectorPanel(): Selector
	{
		const blocksManager = this.block.blocksManager;
		const member = blocksManager.getMemberByPart(this.block.getMemberPart());
		const { presetId } = member;

		return this.#cache.remember('fieldSelector', () => new Selector({
			multiple: false,
			controllerOptions: {
				hideVirtual: 1,
				hideRequisites: 1,
				hideSmartDocument: 1,
				presetId,
			},
			presetId,
			filter: {
				'+categories': [
					'COMPANY',
					'SMART_DOCUMENT',
				],
				'+fields': [
					'list',
					'string',
					'date',
					'typed_string',
					'text',
					'datetime',
					'enumeration',
					'address',
					'url',
					'money',
					'boolean',
					'double',
					'integer',
				],
				'-fields': [
					this.#getFieldNegativeFilter()
				]
			},
		}));
	}

	#getFieldNegativeFilter(): (Object) => boolean
	{
		const blackList = this.#getFieldsNameBlackList();
		return (field) => {
			return blackList.some((blankListFieldName) => field.name === blankListFieldName)
		}
	}

	#getFieldsNameBlackList(): Array<string>
	{
		return [
			'COMPANY_LINK',
			'COMPANY_REG_ADDRESS',
			'COMPANY_ORIGIN_VERSION'
		];
	}

	getStyles(): { [p: string]: string }
	{
		return { ...super.getStyles(), ...MyReference.defaultTextBlockPaddingStyles };
	}
}
