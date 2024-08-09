/* eslint-disable */
this.BX = this.BX || {};
this.BX.Messenger = this.BX.Messenger || {};
this.BX.Messenger.v2 = this.BX.Messenger.v2 || {};
this.BX.Messenger.v2.Component = this.BX.Messenger.v2.Component || {};
(function (exports,im_v2_component_message_base,im_v2_component_message_elements,im_v2_const,im_v2_lib_parser) {
	'use strict';

	// @vue/component
	const SmileMessage = {
	  name: 'SmileMessage',
	  components: {
	    BaseMessage: im_v2_component_message_base.BaseMessage,
	    MessageStatus: im_v2_component_message_elements.MessageStatus,
	    ReactionList: im_v2_component_message_elements.ReactionList,
	    ReactionSelector: im_v2_component_message_elements.ReactionSelector,
	    ContextMenu: im_v2_component_message_elements.ContextMenu
	  },
	  props: {
	    item: {
	      type: Object,
	      required: true
	    },
	    dialogId: {
	      type: String,
	      required: true
	    },
	    menuIsActiveForId: {
	      type: [String, Number],
	      default: 0
	    }
	  },
	  computed: {
	    message() {
	      return this.item;
	    },
	    text() {
	      return im_v2_lib_parser.Parser.decodeSmile(this.message.text, {
	        ratioConfig: {
	          Default: 1,
	          Big: 3
	        },
	        enableBigSmile: true
	      });
	    }
	  },
	  template: `
		<BaseMessage
			:dialogId="dialogId"
			:item="item"
			:withBackground="false"
			:withDefaultContextMenu="false"
		>
			<div class="bx-im-message-smile__container">
				<div class="bx-im-message-smile__content-container">
					<span class="bx-im-message-smile__text" v-html="text"></span>
					<div class="bx-im-message-smile__message-status-container">
						<MessageStatus :item="message" :isOverlay="true" />
					</div>
					<ReactionSelector :messageId="message.id" />
				</div>
				<ContextMenu :message="message" :menuIsActiveForId="menuIsActiveForId" />
			</div>
			<div class="bx-im-message-smile__reactions-container">
				<ReactionList :messageId="message.id" class="bx-im-message-smile__reactions" />
			</div>
		</BaseMessage>
	`
	};

	exports.SmileMessage = SmileMessage;

}((this.BX.Messenger.v2.Component.Message = this.BX.Messenger.v2.Component.Message || {}),BX.Messenger.v2.Component.Message,BX.Messenger.v2.Component.Message,BX.Messenger.v2.Const,BX.Messenger.v2.Lib));
//# sourceMappingURL=smile.bundle.js.map
