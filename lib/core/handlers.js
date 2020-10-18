"use strict";

const path = require("path");
const Send = require("../send");

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

/**
 * @typedef {import("../../index").deps} deps
 */

class Handlers {
	/**
	 * Creates an instance of Handlers.
	 * @param {deps} deps
	 * @memberof Handlers
	 */
	constructor(deps) {
		this.__deps = deps;
		this.__send = new Send(deps);
	}

	init() {
		handlers.forEach(func => {
			try {
				// Load handler from file and initialize
				require(path.resolve(__dirname, "events", "handlers", func))(this, this.__deps);
			} catch (e) {
				this.__deps.mod.error(e);
			}
		});
	}

	/**
	 * Apply triggered event.
	 * @param {Object} event Data of event.
	 * @param {Object} ent Entity object from event.
	 * @param {number} [speed=1.0] Divider for timers.
	 * @param {string} [key=null] Event key.
	 * @memberof Handlers
	 */
	apply(event, ent, speed = 1.0, key = null) {
		Object.assign(event, { "_key": key });

		// The function couldn"t be found, so it"s an invalid type
		if (!this[event.type] || ["init", "apply", "delay"].includes(event.type))
			return this.__deps.mod.warn(`An event has invalid type: ${event.type}`);

		// Check filter function
		const check_func = typeof event.check_func === "function" ? event.check_func(ent, event) : true;

		// Start the event
		if (this.__deps.functions.classPositionCheck(event.class_position) && check_func) {
			// Call the handler for event
			this[event.type](event, ent, speed, key);
		}
	}

	/**
	 * Create timer for specified delay.
	 * @param {*} callback Callback function.
	 * @param {number} delay Timer delay in milliseconds.
	 * @param {number} speed Divider for timer.
	 * @param {*} args Callback function arguments.
	 * @return {(Object|boolean)} Timer object of false.
	 * @memberof Handlers
	 */
	delay(callback, delay, speed, ...args) {
		const delayNumber = parseInt(delay);

		if (!isNaN(delayNumber) && delayNumber > 0)
			return this.__deps.mod.setTimeout(callback, delayNumber / speed, this, ...args);
		else
			callback(this, ...args);

		return false;
	}

	/**
	 * Get instance of Send.
	 * @readonly
	 * @memberof Handlers
	 */
	get send() {
		return this.__send;
	}
}

module.exports = Handlers;