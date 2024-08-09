import { ajax, Text } from 'main.core';
import { UI } from 'ui.notification';

const postHeaders = {
	preparePost: false,
	headers: [{
		name: 'Content-Type',
		value: 'application/json'
	}]
};

export class Api
{
	#get(endpoint: string): Promise
	{
		return this.#request('GET', endpoint);
	}


	#post(endpoint: string, data: Object = null, notifyError: boolean): Promise
	{
		return this.#request('POST', endpoint, data, notifyError);
	}

	async #request(
		method: string,
		endpoint: string,
		data: ?Object,
		notifyError: ?boolean = true
	)
	{
		const config = { method };
		if (method === 'POST')
		{
			Object.assign(config, { data }, {
				preparePost: false,
				headers: [{
					name: 'Content-Type',
					value: 'application/json'
				}]
			});
		}

		try
		{
			const response = await ajax.runAction(endpoint, config);
			if (response.errors?.length > 0)
			{
				throw new Error(response.errors[0].message);
			}

			return response.data;
		}
		catch(ex)
		{
			if (!notifyError)
			{
				return ex;
			}

			const { errors = [], message = `Error in ${endpoint}` } = ex;
			const content = ex.errors[0]?.message ?? message;
			UI.Notification.Center.notify({
				content: Text.encode(content),
				autoHideDelay: 4000
			});

			throw ex;
		}
	}

	register(blankId: string): Promise
	{
		return this.#post('sign.api_v1.document.register', { blankId });
	}

	upload(uid: string): Promise
	{
		return this.#post('sign.api_v1.document.upload', { uid });
	}

	getPages(uid: string): Promise
	{
		return this.#post('sign.api_v1.document.pages.list', { uid }, false);
	}

	loadBlanks(page: number): Promise
	{
		return this.#post('sign.api_v1.document.blank.list', { page });
	}

	createBlank(files: Array<string>): Promise
	{
		return this.#post('sign.api_v1.document.blank.create', { files });
	}

	saveBlank(documentUid: string, blocks: []): Promise
	{
		return this.#post('sign.api_v1.document.blank.block.save', { documentUid, blocks }, false);
	}

	loadBlocksData(documentUid: string, blocks: []): Promise
	{
		return this.#post('sign.api_v1.document.blank.block.loadData', { documentUid, blocks });
	}

	changeDocument(uid: string, blankId: number): Promise
	{
		return this.#post('sign.api_v1.document.changeBlank', { uid, blankId });
	}

	loadDocument(uid: string): Promise
	{
		return this.#post('sign.api_v1.document.load', { uid });
	}

	configureDocument(uid: string): Promise
	{
		return this.#post('sign.api_v1.document.configure', { uid });
	}

	loadBlocksByDocument(documentUid: string): Promise
	{
		return this.#post('sign.api_v1.document.blank.block.loadByDocument', {
			documentUid
		});
	}

	startSigning(uid: string): Promise
	{
		return this.#post('sign.api_v1.document.signing.start', { uid });
	}

	addMember(
		documentUid: string,
		entityType: string,
		entityId: number,
		party: number,
		presetId: number
	): Promise
	{
		return this.#post('sign.api_v1.document.member.add', {
			documentUid,
			entityType,
			entityId,
			party,
			presetId
		});
	}

	removeMember(uid: string): Promise
	{
		return this.#post('sign.api_v1.document.member.remove', { uid });
	}

	loadMembers(documentUid: string): Promise
	{
		return this.#post('sign.api_v1.document.member.load', { documentUid });
	}

	modifyCommunicationChannel(uid: String, channelType: string, channelValue: string)
	{
		return this.#post('sign.api_v1.document.member.modifyCommunicationChannel', {
			uid,
			channelType,
			channelValue
		});
	}

	loadCommunications(uid: String)
	{
		return this.#post('sign.api_v1.document.member.loadCommunications', { uid });
	}

	modifyTitle(uid: string, title: string): Promise
	{
		return this.#post('sign.api_v1.document.modifyTitle', {
			uid,
			title
		});
	}

	modifyInitiator(uid: string, initiator: string): Promise
	{
		return this.#post('sign.api_v1.document.modifyInitiator', {
			uid,
			initiator
		});
	}

	refreshEntityNumber(documentUid: string): Promise
	{
		return this.#post('sign.api_v1.document.refreshEntityNumber', {
			documentUid,
		});
	}

	loadRestrictions(): Promise
	{
		return this.#post('sign.api_v1.portal.hasRestrictions');
	}

	saveStamp(memberUid: String, fileId: string): Promise
	{
		return this.#post('sign.api_v1.document.member.saveStamp', {
			memberUid, fileId
		});
	}
}