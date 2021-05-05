import { envParseBoolean } from '#lib/env';
import { Slotmachine } from '#lib/games/Slotmachine';
import { WheelOfFortune } from '#lib/games/WheelOfFortune';
import { Events, Schedules } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Store } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { blue, gray, green, magenta, magentaBright, red, white, yellow } from 'colorette';

@ApplyOptions<EventOptions>({ once: true })
export class UserEvent extends Event {
	private readonly style = this.context.client.dev ? yellow : blue;

	public async run() {
		const { client } = this.context;
		try {
			await Promise.all([
				// Initialize Slotmachine data
				Slotmachine.init().catch((error) => client.logger.fatal(error)),
				// Initialize WheelOfFortune data
				WheelOfFortune.init().catch((error) => client.logger.fatal(error)),
				// Initialize giveaways
				client.giveaways.init().catch((error) => client.logger.fatal(error)),
				this.connectAfk(),
				// Connect Lavalink if configured to do so
				this.connectLavalink(),
				this.initAnalytics()
			]);

			// Setup the stat updating task
			await this.initPostStatsTask().catch((error) => client.logger.fatal(error));
			// Setup the Twitch subscriptions refresh task
			await this.initTwitchRefreshSubscriptionsTask().catch((error) => client.logger.fatal(error));
		} catch (error) {
			client.logger.fatal(error);
		}

		this.printBanner();
		this.printStoreDebugInformation();
	}

	private async initPostStatsTask() {
		const { queue } = this.context.schedule;
		if (!queue.some((task) => task.taskID === Schedules.Poststats)) {
			await this.context.schedule.add(Schedules.Poststats, '*/10 * * * *', {});
		}
	}

	private async initTwitchRefreshSubscriptionsTask() {
		const { queue } = this.context.schedule;
		if (!queue.some((task) => task.taskID === Schedules.TwitchRefreshSubscriptions)) {
			await this.context.schedule.add(Schedules.TwitchRefreshSubscriptions, '@daily');
		}
	}

	private async initSyncResourceAnalyticsTask() {
		const { queue } = this.context.schedule;
		if (!queue.some((task) => task.taskID === Schedules.SyncResourceAnalytics)) {
			await this.context.schedule.add(Schedules.SyncResourceAnalytics, '*/1 * * * *');
		}
	}

	private async initAnalytics() {
		if (envParseBoolean('INFLUX_ENABLED')) {
			const { client } = this.context;
			client.emit(
				Events.AnalyticsSync,
				client.guilds.cache.size,
				client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0)
			);

			await this.initSyncResourceAnalyticsTask().catch((error) => client.logger.fatal(error));
		}
	}

	private async connectLavalink() {
		if (envParseBoolean('AUDIO_ENABLED')) {
			await this.context.client.audio!.connect();
			await this.context.client.audio!.queues.start();
		}
	}

	private async connectAfk() {
		if (!isNullish(Store.injectedContext.afk)) await Store.injectedContext.afk.connect();
	}

	private printBanner() {
		const { client } = this.context;
		const success = green('+');
		const failed = red('-');
		const llc = client.dev ? magentaBright : white;
		const blc = client.dev ? magenta : blue;

		const line01 = llc(String.raw`          /          `);
		const line02 = llc(String.raw`       ${blc('/╬')}▓           `);
		const line03 = llc(String.raw`     ${blc('/▓▓')}╢            `);
		const line04 = llc(String.raw`   [${blc('▓▓')}▓╣/            `);
		const line05 = llc(String.raw`   [╢╢╣▓             `);
		const line06 = llc(String.raw`    %,╚╣╣@\          `);
		const line07 = llc(String.raw`      #,╙▓▓▓\╙N      `);
		const line08 = llc(String.raw`       '╙ \▓▓▓╖╙╦    `);
		const line09 = llc(String.raw`            \@╣▓╗╢%  `);
		const line10 = llc(String.raw`               ▓╣╢╢] `);
		const line11 = llc(String.raw`              /╣▓${blc('▓▓')}] `);
		const line12 = llc(String.raw`              ╢${blc('▓▓/')}   `);
		const line13 = llc(String.raw`             ▓${blc('╬/')}     `);
		const line14 = llc(String.raw`            /        `);

		// Offset Pad
		const pad = ' '.repeat(7);

		console.log(
			String.raw`
${line01}   ________  __   ___  ___  ___  _______        __
${line02}  /"       )|/"| /  ")|"  \/"  |/"      \      /""\
${line03} (:   \___/ (: |/   /  \   \  /|:        |    /    \
${line04}  \___  \   |    __/    \\  \/ |_____/   )   /' /\  \
${line05}   __/  \\  (// _  \    /   /   //      /   //  __'  \
${line06}  /" \   :) |: | \  \  /   /   |:  __   \  /   /  \\  \
${line07} (_______/  (__|  \__)|___/    |__|  \___)(___/    \___)
${line08} ${blc(process.env.CLIENT_VERSION.padStart(55, ' '))}
${line09} ${pad}[${success}] Gateway
${line10} ${pad}[${client.analytics ? success : failed}] Analytics
${line11} ${pad}[${client.audio?.queues?.client.connected ? success : failed}] Audio
${line12} ${pad}[${success}] Moderation
${line13} ${pad}[${success}] Social & Leaderboards
${line14}${client.dev ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.context;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.info(this.styleStore(store, false));
		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: Store<any>, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
