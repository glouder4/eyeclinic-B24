export type ImRecentProviderItem = {
	id: string,
	entityId: string,
	entityType: string,
	title: string,
	avatar: string,
	sort: number,
	customData: {
		id: number,
		dateUpdate: string,
		avatar: string,
		color: string,
		description: string,
		dialogId: string,
		diskFolderId: number,
		entityData1: string,
		entityData2: string,
		entityData3: string,
		entityId: string,
		entityType: string,
		extranet: boolean,
		name: string,
		owner: number,
		active: boolean,
		firstName: string,
		lastName: string,
		workPosition: string,
		avatarHr: string,
		gender: string,
		birthday: string,
		network: boolean,
		bot: boolean,
		connector: boolean,
		externalAuthId: string,
		status: boolean,
		idle: boolean,
		lastActivityDate: boolean,
		mobileLastDate: boolean,
		desktopLastDate: boolean,
		absent: boolean,
		departments: Array<number>,
		phones: boolean,
	},
};