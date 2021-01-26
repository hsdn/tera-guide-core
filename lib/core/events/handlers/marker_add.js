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
module.exports.marker_add = (deps, data, event, ent) => {
	// Ignore if streamer mode is enabled or verbose is disabled
	if (deps.mod.settings.stream || (deps.zone.loaded && !deps.zone.settings.verbose)) return;

	// Check ent is defined
	if (!ent && deps.zone.loaded) ent = deps.zone.guide.data.ent;

	// Set gameId
	if (!event.id) event.id = ent.gameId || false;
	if (!event.id) return deps.mod.error("Marker_add handler needs a id (gameId)");

	// Clear remove timer if added new marker for existing id
	if (data.markers.has(event.id) && data.markers.get(event.id).timer !== false)
		deps.mod.clearTimeout(data.markers.get(event.id).timer);

	// Create timer for remove a added marker
	const timer = deps.handlers.delay(() => deps.handlers.types.marker_remove({ "id": event.id }, ent), event.sub_delay);

	// Add the marker
	data.markers.set(event.id, { "color": event.color, "timer": timer });

	// Marker colors
	const colors = { "red": 0, "yellow": 1, "blue": 2 };

	// Reset markers by new list
	const targets = [];

	data.markers.forEach((attr, gameId) =>
		targets.push({ "target": gameId, "color": colors[attr.color] || 0 })
	);

	deps.mod.send(...deps.proto.getData("S_PARTY_MARKER"), { "markers": targets });
};

// Alias function
module.exports.marker = module.exports.marker_add;