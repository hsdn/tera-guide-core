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
 */
module.exports.marker_remove = (deps, data, event, ent) => {
	// Check ent is defined
	if (!ent && deps.zone.loaded) ent = deps.zone.guide.data.ent;

	// Set gameId
	if (!event.id) event.id = ent.gameId || false;
	if (!event.id) return deps.mod.error("Marker_remove handler needs a gameId (id)");

	// Returns if marker already removed
	if (!data.markers.has(event.id)) return;

	// Clear remove timer for existing id
	if (data.markers.get(event.id).timer !== false)
		deps.mod.clearTimeout(data.markers.get(event.id).timer);

	// Marker colors
	const colors = { "red": 0, "yellow": 1, "blue": 2 };

	// Remove from data object
	data.markers.delete(event.id);

	// Reset markers by new list
	const targets = [];

	data.markers.forEach((attr, gameId) =>
		targets.push({ "target": gameId, "color": colors[attr.color] || 0 })
	);

	deps.mod.send(...deps.proto.getData("S_PARTY_MARKER"), { "markers": targets });
};