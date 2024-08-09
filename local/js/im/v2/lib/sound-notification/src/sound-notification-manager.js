import { Store } from 'ui.vue3.vuex';

import { Core } from 'im.v2.application.core';
import { UserStatus, SoundType, Settings } from 'im.v2.const';
import { DesktopManager } from 'im.v2.lib.desktop';
import { CallManager } from 'im.v2.lib.call';

import { SoundPlayer } from './classes/sound-player';

export class SoundNotificationManager
{
	#store: Store;
	#desktopManager: DesktopManager;
	#soundPlayer: SoundPlayer;

	static instance = null;

	static getInstance(): SoundNotificationManager
	{
		if (!this.instance)
		{
			this.instance = new this();
		}

		return this.instance;
	}

	constructor()
	{
		this.#store = Core.getStore();
		this.#desktopManager = DesktopManager.getInstance();
		this.#soundPlayer = new SoundPlayer();
	}

	playOnce(type: $Keys<typeof SoundType>)
	{
		if (this.#hasActiveCall() || !this.#canPlayInContext())
		{
			return;
		}

		if (!this.#canPlay(type) || this.#isUserDnd())
		{
			return;
		}

		this.#soundPlayer.playSingle(type);
	}

	forcePlayOnce(type: $Keys<typeof SoundType>)
	{
		if (this.#hasActiveCall() || !this.#canPlayInContext())
		{
			return;
		}

		if (!this.#canPlay(type))
		{
			return;
		}

		this.#soundPlayer.playSingle(type);
	}

	playLoop(type: $Keys<typeof SoundType>, timeout: number = 5000, force = false)
	{
		if (this.#hasActiveCall() && !force)
		{
			return;
		}

		if (!this.#canPlayInContext() || !this.#canPlay(type) || this.#isUserDnd())
		{
			return;
		}

		this.#soundPlayer.playLoop(type, timeout);
	}

	stop(type: $Keys<typeof SoundType>)
	{
		this.#soundPlayer.stop(type);
	}

	#canPlayInContext(): boolean
	{
		return DesktopManager.isDesktop() || !this.#desktopManager.isDesktopActive();
	}

	#canPlay(type: $Keys<typeof SoundType>): boolean
	{
		if (this.#isPrioritySoundType(type))
		{
			return true;
		}

		return this.#isSoundEnabled();
	}

	#isUserDnd(): boolean
	{
		const status = this.#store.getters['users/getStatus'](Core.getUserId());

		return status === UserStatus.dnd;
	}

	#isPrioritySoundType(type: $Keys<typeof SoundType>): boolean
	{
		return [SoundType.start, SoundType.dialtone, SoundType.ringtone].includes(type);
	}

	#hasActiveCall(): boolean
	{
		return CallManager.getInstance().hasCurrentCall();
	}

	#isSoundEnabled(): boolean
	{
		return this.#store.getters['application/settings/get'](Settings.notification.enableSound);
	}
}
