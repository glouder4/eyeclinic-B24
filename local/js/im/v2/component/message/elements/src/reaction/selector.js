import { Type } from 'main.core';
import { ReactionsSelect, reactionType as ReactionType } from 'ui.reactions-select';

import { UserRole } from 'im.v2.const';

import { ReactionService } from './classes/reaction-service';

import './selector.css';

import type { ImModelDialog, ImModelMessage, ImModelReactions } from 'im.v2.model';

const SHOW_DELAY = 500;
const HIDE_DELAY = 800;

// @vue/component
export const ReactionSelector = {
	props:
	{
		messageId: {
			type: [String, Number],
			required: true,
		},
	},
	computed:
	{
		reactionsData(): ImModelReactions
		{
			return this.$store.getters['messages/reactions/getByMessageId'](this.messageId);
		},
		ownReactionSet(): boolean
		{
			return this.reactionsData?.ownReactions?.size > 0;
		},
		isGuest(): boolean
		{
			const message: ImModelMessage = this.$store.getters['messages/getById'](this.messageId);
			const dialog: ImModelDialog = this.$store.getters['dialogues/getByChatId'](message.chatId);

			return dialog.role === UserRole.guest;
		},
		canSetReactions(): boolean
		{
			return Type.isNumber(this.messageId) && !this.isGuest;
		},
	},
	methods:
	{
		startShowTimer()
		{
			this.clearHideTimer();
			if (this.selector?.isShown())
			{
				return;
			}
			this.showTimeout = setTimeout(() => {
				this.showSelector();
			}, SHOW_DELAY);
		},
		clearShowTimer()
		{
			clearTimeout(this.showTimeout);
			this.startHideTimer();
		},
		showSelector()
		{
			this.selector = new ReactionsSelect({
				name: 'im-base-message-reaction-selector',
				position: this.$refs.selector,
			});
			this.subscribeToSelectorEvents();
			this.selector.show();
		},
		subscribeToSelectorEvents()
		{
			this.selector.subscribe('select', (selectEvent) => {
				const { reaction } = selectEvent.getData();
				this.getReactionService().setReaction(this.messageId, reaction);
				this.selector?.hide();
			});

			this.selector.subscribe('mouseleave', this.startHideTimer);

			this.selector.subscribe('mouseenter', () => {
				clearTimeout(this.hideTimeout);
			});

			this.selector.subscribe('hide', () => {
				clearTimeout(this.hideTimeout);
				this.selector = null;
			});
		},
		startHideTimer()
		{
			this.hideTimeout = setTimeout(() => {
				this.selector?.hide();
			}, HIDE_DELAY);
		},
		clearHideTimer()
		{
			clearTimeout(this.hideTimeout);
		},
		onIconClick()
		{
			this.clearShowTimer();
			if (this.ownReactionSet)
			{
				const [currentReaction] = [...this.reactionsData.ownReactions];
				this.getReactionService().removeReaction(this.messageId, currentReaction);

				return;
			}

			this.getReactionService().setReaction(this.messageId, ReactionType.like);
		},
		getReactionService(): ReactionService
		{
			if (!this.reactionService)
			{
				this.reactionService = new ReactionService();
			}

			return this.reactionService;
		},
	},
	template: `
		<div v-if="canSetReactions" class="bx-im-reaction-selector__container">
			<div
				@click="onIconClick"
				@mouseenter="startShowTimer"
				@mouseleave="clearShowTimer"
				class="bx-im-reaction-selector__selector"
				ref="selector"
			>
				<div class="bx-im-reaction-selector__icon" :class="{'--active': ownReactionSet}"></div>
			</div>
		</div>
	`,
};
