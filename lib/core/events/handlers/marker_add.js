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

	that.marker_add = (event = {}, ent = false, speed = 1.0) => {
		// Ignore if streamer mode is enabled or verbose is disabled
		if (deps.mod.settings.stream || !deps.guide.obj.verbose) return;

		// Check ent is defined
		if (!ent) ent = deps.guide.obj.ent;

		// Set gameId
		if (!event.id) event.id = ent.gameId || false;
		if (!event.id) return deps.mod.error("Marker_add handler needs a id (gameId)");

		// Create timer for specified delay
		that.delay(() => {
			// Clear remove timer if added new marker for existing id
			if (deps.guide.obj.data.markers[event.id] && deps.guide.obj.data.markers[event.id].timer !== false)
				deps.mod.clearTimeout(deps.guide.obj.data.markers[event.id].timer);

			// Create timer for remove a added marker
			const timer = that.delay(() => { that.marker_remove({ "id": event.id }, ent, speed); }, event.sub_delay, speed);

			// Add the marker
			deps.guide.obj.data.markers[event.id] = {
				"color": event.color,
				"timer": timer
			};

			// Marker colors
			const colors = { "red": 0, "yellow": 1, "blue": 2 };

			// Reset markers by new list
			let targets = [];

			Object.keys(deps.guide.obj.data.markers).forEach(gameId => {
				targets.push({ "target": gameId, "color": colors[deps.guide.obj.data.markers[gameId].color] || 0 });
			});

			deps.mod.send(...deps.proto.getData("S_PARTY_MARKER"), { "markers": targets });
		}, event.delay, speed);
	};

	// Alias function
	that.marker = (...args) => {
		that.marker_add(...args);
	};
};