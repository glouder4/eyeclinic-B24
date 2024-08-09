import { Lottie } from 'ui.lottie';

import { Button as MessengerButton, ButtonColor, ButtonSize } from 'im.v2.component.elements';

import { PromoPopup } from './promo-popup';
import ConferenceAnimation from './animations/conference.json';

import '../../../css/conference-promo.css';

import type { JsonObject } from 'main.core';

// @vue/component
export const ConferencePromo = {
	components: { PromoPopup, MessengerButton },
	emits: ['continue', 'close'],
	data(): JsonObject
	{
		return {};
	},
	computed:
	{
		ButtonColor: () => ButtonColor,
		ButtonSize: () => ButtonSize,
	},
	mounted()
	{
		Lottie.loadAnimation({
			animationData: ConferenceAnimation,
			container: this.$refs.animationContainer,
			renderer: 'svg',
			loop: true,
			autoplay: true,
		});
	},
	methods:
	{
		loc(phraseCode: string): string
		{
			return this.$Bitrix.Loc.getMessage(phraseCode);
		},
	},
	template: `
		<PromoPopup @close="$emit('close')">
			<div class="bx-im-group-chat-promo__container">
				<div class="bx-im-group-chat-promo__header">
					<div class="bx-im-group-chat-promo__title">
						{{ loc('IM_RECENT_CREATE_CHAT_PROMO_CONFERENCE_TITLE') }}
					</div>
					<div class="bx-im-group-chat-promo__close" @click="$emit('close')"></div>
				</div>
				<div class="bx-im-group-chat-promo__content">
					<div class="bx-im-group-chat-promo__content_image" ref="animationContainer"></div>
					<div class="bx-im-group-chat-promo__content_item">
						<div class="bx-im-group-chat-promo__content_icon --camera"></div>
						<div class="bx-im-group-chat-promo__content_text">
							{{ loc('IM_RECENT_CREATE_CHAT_PROMO_CONFERENCE_DESCRIPTION_1') }}
						</div>
					</div>
					<div class="bx-im-group-chat-promo__content_item">
						<div class="bx-im-group-chat-promo__content_icon --link"></div>
						<div class="bx-im-group-chat-promo__content_text">
							{{ loc('IM_RECENT_CREATE_CHAT_PROMO_CONFERENCE_DESCRIPTION_2') }}
						</div>
					</div>
					<div class="bx-im-group-chat-promo__content_item">
						<div class="bx-im-group-chat-promo__content_icon --like"></div>
						<div class="bx-im-group-chat-promo__content_text">
							{{ loc('IM_RECENT_CREATE_CHAT_PROMO_CONFERENCE_DESCRIPTION_3') }}
						</div>
					</div>
				</div>
				<div class="bx-im-group-chat-promo__button-panel">
					<MessengerButton
						:size="ButtonSize.XL"
						:color="ButtonColor.Primary"
						:isRounded="true" 
						:text="loc('IM_RECENT_CREATE_CHAT_PROMO_GROUP_CHAT_CONTINUE')"
						@click="$emit('continue')"
					/>
					<MessengerButton
						:size="ButtonSize.XL"
						:color="ButtonColor.Link"
						:isRounded="true"
						:text="loc('IM_RECENT_CREATE_CHAT_PROMO_GROUP_CHAT_CANCEL')"
						@click="$emit('close')"
					/>
				</div>
			</div>
		</PromoPopup>
	`,
};
