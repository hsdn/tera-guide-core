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

	that.alias = (event = {}, ent = false, speed = 1.0) => {
		// Make sure id is defined
		if (!event.id) return deps.mod.error("Alias handler needs a id");

		// Return if handler try call itself (loop protection)
		if (event.id == event._key) return deps.mod.error("Cannot use alias handler to call itself");

		// Create timer for specified delay
		that.delay(() => { deps.guide.emit(event.id, ent, speed); }, event.delay, speed);
	};
};