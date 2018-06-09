const { Client } = require('klasa');
const { loadavg } = require('os');

const Leaderboard = require('./util/Leaderboard');
const Moderation = require('./util/Moderation');
const APIStore = require('./structures/APIStore');
const RawEventStore = require('./structures/RawEventStore');
const { Server } = require('ipc-link');
const ConnectFourManager = require('./util/Games/ConnectFourManager');

module.exports = class Skyra extends Client {

	/**
	 * @typedef  {Object} SkyraUsageStatus
	 * @property {number[]} cpu
	 * @property {number[]} prc
	 * @property {number[]} ram
	 * @property {number[]} cmd
	 */

	constructor(options) {
		super(options);

		/**
		 * The version of Skyra
		 * @since 2.0.0
		 * @type {string}
		 */
		this.version = require('../../config').version;

		/**
		 * The loaded Leaderboard singleton instance
		 * @since 3.0.0
		 * @type {Leaderboard}
		 */
		this.leaderboard = new Leaderboard(this);

		/**
		 * The loaded Moderation singleton instance
		 * @since 3.0.0
		 * @type {Moderation}
		 */
		this.moderation = new Moderation(this);

		/**
		 * The API handler
		 * @since 3.0.0
		 * @type {APIStore}
		 */
		this.ipcPieces = new APIStore(this);

		/**
		 * The Raw Event store
		 * @since 3.0.0
		 * @type {RawEventStore}
		 */
		this.rawEvents = new RawEventStore(this);

		// Register the API handler
		this.registerStore(this.ipcPieces)
			.registerStore(this.rawEvents);

		// Create the IPC controller singleton
		this.ipc = new Server('skyra-dashboard', { retry: 1500, silent: true })
			.on('message', (message) => this.emit('apiMessage', message))
			.on('error', (error) => this.emit('error', error))
			.on('connect', () => this.emit('verbose', 'IPC Channel Connected'))
			.on('disconnect', () => this.emit('warn', 'IPC Channel Disconnected'))
			.on('destroy', () => this.emit('warn', 'IPC Channel Destroyed'))
			.on('socket.disconnected', (socket, destroyedSocketID) => this.emit('verbose', `The Socket ${destroyedSocketID} has disconnected!`))
			.once('start', () => console.log(`[IPC] Successfully started`))
			.start();

		/**
		 * A cached dictionary of usernames for optimization with memory sweeping
		 * @since 3.0.0
		 * @type {Map<string, string>}
		 */
		this.dictionaryName = new Map();

		/**
		 * The UsageStatus object containing Skyra's metrics in the last 12 hours,
		 * with an update every 5 minutes
		 * @since 2.0.0
		 * @type {SkyraUsageStatus}
		 */
		this.usageStatus = Object.seal({
			/**
			 * The CPU usage in the last 12 hours for each 5 minutes
			 * @type {number[]}
			 */
			cpu: new Array(96).fill(0),

			/**
			 * The RAM usage in the heap total in the last 12 hours for each 5 minutes
			 * @type {number[]}
			 */
			prc: new Array(96).fill(0),

			/**
			 * The RAM usage in the heap used in the last 12 hours for each 5 minutes
			 * @type {number[]}
			 */
			ram: new Array(96).fill(0),

			/**
			 * The amount of times any command got executed in the last 12 hours for each 5 minutes
			 * @type {number[]}
			 */
			cmd: new Array(96).fill(0)
		});

		// Update the stats
		this.updateStats();

		Object.defineProperties(this, {
			/**
			 * The ConnectFour manager
			 * @name Skyra#connectFour
			 * @since 3.0.0
			 * @type {ConnectFourManager}
			 */
			connectFour: { value: new ConnectFourManager(this) },
			/**
			 * @type {NodeJS.Timer}
			 * @name Skyra#_updateStatsInterval
			 * @since 3.0.0
			 * @private
			 */
			_updateStatsInterval: { value: this.setInterval(this.updateStats.bind(this), 300000) },

			/**
			 * @type {boolean}
			 * @name Skyra#_skyraReady
			 * @since 3.1.0
			 * @private
			 */
			_skyraReady: { value: false, writable: true }
		});
	}

	/**
	 * Fetch a username
	 * @since 3.0.0
	 * @param {string} userID The user ID to fetch
	 * @returns {Promise<string>}
	 */
	async fetchUsername(userID) {
		const entry = this.dictionaryName.get(userID);
		if (entry) return entry;
		const user = await this.users.fetch(userID);
		this.dictionaryName.set(userID, user.username);
		return user.username;
	}

	/**
	 * Update the stats
	 * @since 2.1.0
	 */
	updateStats() {
		const { heapTotal, heapUsed } = process.memoryUsage();

		this.usageStatus.cpu.shift();
		this.usageStatus.cpu.push(((loadavg()[0] * 10000) | 0) / 100);

		this.usageStatus.prc.shift();
		this.usageStatus.prc.push(((100 * (heapTotal / 1048576)) | 0) / 100);

		this.usageStatus.ram.shift();
		this.usageStatus.ram.push(((100 * (heapUsed / 1048576)) | 0) / 100);

		this.usageStatus.cmd.shift();
		this.usageStatus.cmd.push(0);
	}

	/**
	 * Override for Client#destroy to clear intervals and cache
	 * @since 3.0.0
	 */
	dispose() {
		// Clear the leaderboards and their timers
		this.leaderboard.dispose();
		this.dictionaryName.clear();

		// Clear all the timeouts and caches for all Guild#security
		for (const guild of this.guilds.values()) {
			guild.security.dispose();
			guild.starboard.dispose();
		}
	}

};
