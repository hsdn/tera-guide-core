/* eslint-disable no-param-reassign */
"use strict";

const path = require("path");
const Send = require("../send");

class Handlers {

	constructor(deps, guide) {
		this.__mod = deps.mod;
		this.send = new Send(deps);

		// List of available handler files
		const handlers = [
			"start_events",
			"stop_timers",
			"text",
			"despawn",
			"despawn_all",
			"spawn",
			"marker_add",
			"marker_remove",
			"marker_remove_all",
			"func",
			"alias",
		];

		handlers.forEach(name => {
			try {
				// Load handler from file and initialize
				require(path.resolve(__dirname, "events", "handlers", name))(this, this.__mod, guide);

				// Remove cached file from require cache
				try {
					delete require.cache[require.resolve(path.resolve(__dirname, "events", "handlers", name))];
				} catch (e) {
					// continue regardless of error
				}
			} catch (e) {
				this.__mod.error(e);
			}
		});
	}

	// Create timer for specified delay
	__delayEvent(callback, delay, speed, ...args) {
		delay = parseInt(delay);

		if (!isNaN(delay) && delay > 0)
			return this.__mod.setTimeout(callback, delay / speed, this, ...args);
		else
			callback(this, ...args);

		return false;
	}
}

module.exports = Handlers;