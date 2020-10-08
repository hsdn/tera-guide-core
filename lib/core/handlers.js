/* eslint-disable no-param-reassign */
"use strict";

/**
 * @typedef {import("../../index").deps} deps
 */

const path = require("path");
const Voice = require("../voice");
const Send = require("../send");

class Handlers {
	/**
	 * Creates an instance of Handlers.
	 * @param {deps} deps
	 * @memberof Handlers
	 */
	constructor(deps) {
		this.__deps = deps;

		// List of available handler files
		this.__handlers = [
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

		this.voice = new Voice();
		this.send = new Send(deps);
	}

	init() {
		this.__handlers.forEach(func => {
			try {
				// Load handler from file and initialize
				require(path.resolve(__dirname, "events", "handlers", func))(this, this.__deps.mod, this.__deps.guide);

				// Remove cached file from require cache
				try {
					delete require.cache[require.resolve(path.resolve(__dirname, "events", "handlers", func))];
				} catch (e) {
					// continue regardless of error
				}
			} catch (e) {
				this.__deps.mod.error(e);
			}
		});
	}

	// Apply triggered event
	apply(event, ent, speed = 1.0, key = null) {
		Object.assign(event, { "_key": key });

		// The function couldn"t be found, so it"s an invalid type
		if (!this[event.type] || ["init", "apply", "delay"].includes(event.type))
			return this.__deps.mod.warn(`An event has invalid type: ${event.type}`);

		// If the function is found and it passes the class position check, we start the event
		if (this.__deps.functions.classPositionCheck(event.class_position)) {
			// Call the handler for event
			this[event.type](event, ent, speed, key);
		}
	}

	// Create timer for specified delay
	delay(callback, delay, speed, ...args) {
		delay = parseInt(delay);

		if (!isNaN(delay) && delay > 0)
			return this.__deps.mod.setTimeout(callback, delay / speed, this, ...args);
		else
			callback(this, ...args);

		return false;
	}

	destructor() {
		this.voice.stop();
	}
}

module.exports = Handlers;