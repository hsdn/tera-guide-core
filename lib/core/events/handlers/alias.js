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
module.exports.alias = (deps, data, event, ent, key) => {
	// Check guide is loaded
	if (!deps.zone.loaded) return deps.mod.error("Guide is not loaded");

	// Make sure id is defined
	if (!event.id) return deps.mod.error("Alias handler needs a id");

	// Return if handler try call itself (loop protection)
	if (event.id == key) return deps.mod.error("Cannot use alias handler to call itself");

	// Create timer for specified delay
	deps.zone.guide.emit(event.id, ent);
};