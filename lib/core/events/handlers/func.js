"use strict";

/**
 * @typedef {import("../../handlers").deps} deps
 * @typedef {import("../../handlers").data} data
 */

/**
 * @param {deps} deps
 * @param {Object} data
 * @param {Object} event
 * @param {Object} ent
 */
module.exports.func = (deps, data, event, ent) => {
	// Check guide is loaded
	if (!deps.zone.loaded) return deps.mod.error("Guide is not loaded");

	// Make sure func is defined
	if (!event.func) return deps.mod.error("Func handler needs a func");

	// Check args is defined
	if (!event.args) event.args = [];

	// Create array if not given
	if (!Array.isArray(event.args)) event.args = [event.args];

	// Set ent to guide from the triggered event for use in called function
	deps.zone.guide.data.ent = ent;

	// Try to call the function
	try {
		// COMPAT: If load() function is exists, use old calling method
		if (typeof deps.zone.guide.context.load === "function")
			return event.func.call(null, deps.handlers.types, event, ent, deps.dispatch);

		// Call function
		return event.func(...event.args, ent, event, deps.handlers.types);
	} catch (e) {
		deps.mod.error(e);
	}
};