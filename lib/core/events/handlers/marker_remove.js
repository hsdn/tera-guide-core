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

	that.marker_remove = (event = {}, ent = false, speed = 1.0) => {
		// Check ent is defined
		if (!ent) ent = deps.guide.obj.ent;

		// Set gameId
		if (!event.id) event.id = ent.gameId || false;
		if (!event.id) return deps.mod.error("Marker_remove handler needs a gameId (id)");

		// Returns if marker already removed
		if (!deps.guide.obj.data.markers[event.id]) return;

		// Create timer for specified delay
		that.delay(() => {
			// Marker colors
			const colors = { "red": 0, "yellow": 1, "blue": 2 };

			// Remove from data object
			delete deps.guide.obj.data.markers[event.id];

			// Reset markers by new list
			let targets = [];
			Object.keys(deps.guide.obj.data.markers).forEach(gameId => {
				targets.push({ "target": gameId, "color": colors[deps.guide.obj.data.markers[gameId].color] || 0 });
			});

			deps.mod.send(...deps.proto.getData("S_PARTY_MARKER"), { "markers": targets });
		}, event.delay, speed);
	};
};