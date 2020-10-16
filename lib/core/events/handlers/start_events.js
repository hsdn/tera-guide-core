/* eslint-disable no-param-reassign */
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

	that.start_events = (events = [], ent = false, speed = 1.0, key = false) => {
		// If event arg specified as object, call the recursion and return
		if (!Array.isArray(events)) {
			if (!events.args)
				return deps.mod.error("Event handler, called with object needs a args");

			// Create timer for specified delay
			return that.delay(() => { that.start_events(events.args, ent, speed, key); }, events.delay, speed);
		}

		// Loop over the events
		Object.keys(events).forEach(entry => { that.apply(events[entry], ent, speed, key); });
	};

	// Alias function
	that.event = (...args) => {
		that.start_events(...args);
	};
};