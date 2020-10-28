/* eslint-disable no-param-reassign */
"use strict";

/**
 * @typedef {import("../../handlers").deps} deps
 * @typedef {import("../../handlers").data} data
 */

/**
 * @param {deps} deps
 * @param {data} data
 * @param {Object} event
 * @param {Object} ent
 * @param {string} key
 */
module.exports.start_events = (deps, data, event, ent, key) => {
	// If event arg specified as object, call the recursion and return
	if (!Array.isArray(event)) {
		if (!event.args || !Array.isArray(event.args))
			return deps.mod.error("Event handler, called with object needs a args with array");

		return deps.handlers.types.start_events(event.args, ent, key);
	}

	const events = event;

	// Loop over the events
	Object.keys(events).forEach(entry => deps.handlers.trigger(events[entry], ent, key));
};

// Alias function
module.exports.event = module.exports.start_events;