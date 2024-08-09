import type { BaseEvent } from 'main.core.events';

export type BlankSelectorConfig = {
	events?: {
		[key: string]: (event: BaseEvent) => void
	},
	imagesCountLimitForBlankUpload: number,
	uploaderOptions: {
		acceptedFileTypes: [],
		maxFileSize: number,
		imageMaxFileSize: number,
		maxTotalFileSize: number,
	},
};
