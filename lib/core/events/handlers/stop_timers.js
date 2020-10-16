"use strict";

/**
 * @typedef {import("../../handlers")} handlers
 * @typedef {import("../../handlers").deps} deps
 */

/**
 * Exports.
 * @param {handlers} that
 * @param {deps} deps
 */
module.exports = (that, deps) => {

	that.stop_timers = (event = {}, ent = false, speed = 1.0) => {
		// Create timer for specified delay
		that.delay(() => { deps.mod.clearAllTimeouts(); }, event.delay, speed);
	};
};