export const CollectionTop2List = {
	props: [
		'apps', 'scrollable', 'styleNumber',
	],
	mounted: function() {
		BX.addCustomEvent("SidePanel.Slider:onMessage", this.onMessageSlider);
	},
	methods: {
		getBlockStyle: function () {
			if (this.scrollable) {
				return 'calc(var(--market-top-preview-size) - (var(--market-toplist-carousel-block-gap-x) * ' + (this.styleNumber - 1) + ' / ' + this.styleNumber + '))';
			}

			return 'calc(50% - ((var(--market-toplist-carousel-block-gap-x) / 2)))';
		},
		onMessageSlider: function (event) {
			if (event.eventId === 'total-fav-number') {
				this.apps.forEach((app, index) => {
					if (app.CODE === event.data.appCode) {
						this.apps[index]['IS_FAVORITE'] = event.data.currentValue;
					}
				});
			}
		},
	},
	template: `
		<a class="market-toplist-inner-carousel-block"
		   v-for="appItem in apps"
		   :href="$root.getDetailUri(appItem.CODE)"
		   :style="{
			'min-width': getBlockStyle(),
			'width': getBlockStyle(),
			'max-width': getBlockStyle(),
			'flex-basis': getBlockStyle(),
		   }"
		   :data-market-app-code="appItem.CODE"
		   :title="appItem.NAME"
		>
			<div class="market-toplist-item-labels"
				 v-if="appItem.LABELS"
			>
				<div class="market-toplist-item-label-item"
					 v-for="label in appItem.LABELS"
					 :style="{'background': label.COLOR_2}"
				>
					{{ label.TEXT }}
				</div>
			</div>
			<span class="market-toplist-item-cover">
				<img :src="appItem.ICON" alt="">
			</span>
			<span class="market-toplist-item-info-container">
				<h3 class="market-toplist-item-info-title">{{ appItem.NAME }}</h3>
				<span class="market-toplist-item-info">
					<span class="market-toplist-item-info-stats">
						<!-- TODO like, dislike-->
						<span class="market-toplist-item-info-stats-like">
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path opacity="0.75" fill-rule="evenodd" clip-rule="evenodd"
						  d="M9.41135 3.88884L7.03215 3.8893C6.96365 3.8893 6.89749 3.84973 6.87186 3.78689C6.76469 3.51923 6.76888 3.21758 6.8863 2.95177C7.08341 2.37874 7.10577 1.75961 6.95107 1.17354C6.78938 0.770412 6.74651 0.0339819 6.00051 0C5.76706 0.0344474 5.56344 0.174565 5.44601 0.378922C5.42505 0.415231 5.41619 0.458058 5.41619 0.499488C5.41619 0.499488 5.45047 1.21456 5.41619 1.71167C5.38191 2.20877 4.42975 3.475 3.82447 4.27893C3.78626 4.33014 3.73267 4.36365 3.6693 4.37343C3.44237 4.40738 3.00952 4.46486 2.85349 4.48545C2.81698 4.49027 2.79562 4.53609 2.79562 4.5576C2.79562 5.56255 2.79562 7.06585 2.79562 9.06749C2.79562 9.08409 2.81565 9.12024 2.85126 9.12611C2.97349 9.14627 3.27922 9.20214 3.58776 9.30128C3.97544 9.42557 4.29835 9.71977 4.94464 9.93762C4.97865 9.94926 5.0164 9.95531 5.05228 9.95531H8.08709C8.47896 9.88549 8.77065 9.55079 8.79069 9.14905C8.79628 8.92515 8.75155 8.70357 8.65976 8.50014C8.64671 8.47081 8.66395 8.44009 8.69563 8.43404C9.08471 8.36328 9.57118 7.62545 8.97195 7.031C8.95611 7.01564 8.9589 6.99469 8.98034 6.98911C9.31071 6.90485 9.56372 6.64137 9.64107 6.31273C9.67089 6.18704 9.66018 6.05716 9.6229 5.9338C9.5791 5.78671 9.5092 5.64891 9.41648 5.52602C9.39318 5.4953 9.40623 5.45527 9.4435 5.44316C9.77247 5.33191 9.99893 5.01769 9.9966 4.66018C10.0343 4.30965 9.75244 3.8893 9.41135 3.88884ZM1.86416 4.07876H0.144296C0.0548311 4.07876 -0.0131994 4.1579 0.00217733 4.24402L1.0012 9.85104C1.01658 9.93716 1.09253 10 1.18153 10H1.81757C1.91588 10 1.99556 9.92226 1.99556 9.82637L2.00954 4.22121C2.00954 4.14254 1.94477 4.07876 1.86416 4.07876Z"
						  fill="#515E68"/>
							</svg>
							0
						</span>
						<span class="market-toplist-item-info-stats-dislike">
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path opacity="0.75" fill-rule="evenodd" clip-rule="evenodd"
						  d="M9.41135 6.11116L7.03215 6.1107C6.96365 6.1107 6.89749 6.15026 6.87186 6.21311C6.76469 6.48077 6.76888 6.78242 6.8863 7.04823C7.08341 7.62126 7.10577 8.24039 6.95107 8.82646C6.78938 9.22959 6.74651 9.96602 6.00051 10C5.76706 9.96555 5.56344 9.82543 5.44601 9.62108C5.42505 9.58477 5.41619 9.54194 5.41619 9.50051C5.41619 9.50051 5.45047 8.78544 5.41619 8.28833C5.38191 7.79123 4.42975 6.525 3.82447 5.72107C3.78626 5.66986 3.73267 5.63635 3.6693 5.62657C3.44237 5.59262 3.00952 5.53513 2.85349 5.51455C2.81697 5.50973 2.79562 5.46391 2.79562 5.4424C2.79562 4.43745 2.79562 2.93415 2.79562 0.932507C2.79562 0.915906 2.81565 0.879757 2.85126 0.873885C2.97349 0.853726 3.27922 0.797863 3.58776 0.698724C3.97544 0.574435 4.29835 0.280234 4.94464 0.0623775C4.97865 0.0507398 5.0164 0.0446878 5.05228 0.0446878L8.08709 0.0446875C8.47896 0.114513 8.77065 0.449213 8.79069 0.850945C8.79628 1.07485 8.75155 1.29643 8.65976 1.49986C8.64671 1.52919 8.66395 1.55991 8.69563 1.56596C9.08471 1.63672 9.57118 2.37455 8.97195 2.969C8.95611 2.98436 8.9589 3.00531 8.98034 3.01089C9.3107 3.09515 9.56372 3.35862 9.64107 3.68727C9.67089 3.81296 9.66018 3.94283 9.6229 4.06619C9.5791 4.21329 9.50921 4.35108 9.41648 4.47398C9.39318 4.5047 9.40623 4.54473 9.4435 4.55684C9.77247 4.66809 9.99893 4.98231 9.9966 5.33982C10.0343 5.69034 9.75244 6.1107 9.41135 6.11116ZM1.86416 5.92124L0.144295 5.92124C0.0548307 5.92124 -0.0131998 5.8421 0.00217696 5.75598L1.0012 0.148962C1.01658 0.0628432 1.09253 -9.55119e-08 1.18153 -1.03292e-07L1.81757 -1.58897e-07C1.91588 -1.67492e-07 1.99556 0.0777386 1.99556 0.173633L2.00954 5.77879C2.00954 5.85746 1.94477 5.92124 1.86416 5.92124Z"
						  fill="#515E68"/>
							</svg>
							0
						</span>
						<div class="market-rating__download">
							<span class="market-rating__download-icon"></span>
							<div class="market-rating__download-amount">{{ appItem.NUM_INSTALLS }}</div>
						</div>
					</span>
					<span class="market-toplist-item-info-favorites"
						  :class="{'--selected': appItem.IS_FAVORITE === 'Y'}"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
							<path
					  d="M2.06479 2.77573L2.06478 2.77574C1.30373 3.51052 0.94519 4.29791 0.898939 5.26294L0.898938 5.26295C0.845606 6.37547 1.29931 7.62581 2.51765 9.15845C2.93744 9.68652 4.06258 10.8338 4.58536 11.2667C5.09058 11.685 6.1463 12.4694 7.11223 13.1591C7.5919 13.5016 8.03948 13.8136 8.37453 14.0381C8.41818 14.0674 8.45939 14.0948 8.49807 14.1203C8.53705 14.0945 8.57861 14.0668 8.62262 14.0373C8.95825 13.8118 9.40665 13.4987 9.88677 13.1555C10.8537 12.4644 11.9091 11.68 12.4082 11.2667L12.4082 11.2667C12.9308 10.834 14.056 9.68667 14.4761 9.15838L14.4761 9.15837C15.4027 7.99295 15.8938 6.96575 16.0594 6.01422C16.1927 5.2479 16.0297 4.33737 15.6507 3.68805L15.6507 3.68804C14.8535 2.32233 13.4589 1.6101 12.0616 1.76241C11.4906 1.82466 11.0592 1.95681 10.6701 2.17688C10.2735 2.40112 9.87318 2.74355 9.40037 3.29085L9.40033 3.29089L9.17381 3.55306L8.49678 4.33665L7.81975 3.55306L7.59323 3.29089L7.5932 3.29086C6.70885 2.26722 6.01623 1.89315 5.03305 1.77207L5.03301 1.77207C4.61762 1.72089 4.37316 1.72575 4.01486 1.78417L2.06479 2.77573ZM2.06479 2.77573C2.63117 2.22887 3.27616 1.90467 4.0148 1.78418L2.06479 2.77573ZM8.84241 14.3362C8.8422 14.3361 8.84196 14.336 8.84169 14.3359L8.84241 14.3362Z"
					  stroke="#C7CCD0" stroke-width="1.78947"/>
						</svg>
					</span>
				</span>
				<span href="" class="market-toplist-item-info-owner"
					  :title="appItem.PARTNER_NAME"
				>{{ appItem.PARTNER_NAME }}</span>
			</span>
		</a>
	`,
}