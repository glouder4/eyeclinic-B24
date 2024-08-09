import { FieldsetViewer } from 'crm.requisite.fieldset-viewer';
import { Loc, Tag } from 'main.core';

import Dummy from './dummy';

export default class MyRequisites extends Dummy
{
	/**
	 * Returns true if block is in singleton mode.
	 * @return {boolean}
	 */
	isSingleton(): boolean
	{
		return true;
	}

	/**
	 * Returns initial dimension of block.
	 * @return {width: number, height: number}
	 */
	getInitDimension(): { width: number, height: number }
	{
		return {
			width: 250,
			height: 220,
		};
	}

	/**
	 * Calls when action button was clicked.
	 * @param {PointerEvent} event
	 */
	#onActionClick(event: PointerEvent)
	{
		const blocksManager = this.block.blocksManager;
		const config = blocksManager.getConfig();

		event.stopPropagation();
		const member = blocksManager.getMemberByPart(1);
		const { cid, entityTypeId, presetId } = member;
		(new FieldsetViewer({
			entityTypeId,
			entityId: cid,
			events: {
				onClose: () => {
					this.block.assign();
				},
			},
			fieldListEditorOptions: {
				fieldsPanelOptions: {
					filter: {
						'+categories': [
							'COMPANY',
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
					},
					presetId,
					controllerOptions: {
						hideVirtual: 1,
						hideRequisites: 0,
						hideSmartDocument: 1,
						presetId,
					},
				},
			},
		}))
			.show()
		;
	}

	/**
	 * Returns action button for edit content.
	 * @return {HTMLElement}
	 */
	getActionButton(): HTMLElement
	{
		return Tag.render`
			<div class="sign-document__block-style-btn --funnel">
				<button onclick="${this.#onActionClick.bind(this)}" data-role="action" data-id="action-${this.block.getCode()}">
					${Loc.getMessage('SIGN_JS_DOCUMENT_REQUISITES_ACTION_BUTTON')}
				</button>
			</div>
		`;
	}

	getStyles(): { [p: string]: string }
	{
		return { ...super.getStyles(), ...MyRequisites.defaultTextBlockPaddingStyles };
	}
}
