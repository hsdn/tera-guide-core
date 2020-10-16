"use strict";

const debug = {
	"name": "Despawn",
	"color": cv,
	"key": "nd"
};

/**
 * @typedef {import("../../hooks").deps} deps
 */

/**
 * Hook callback.
 * @param {deps} deps
 * @param {Object} event
 */
module.exports.callback = (deps, event) => {

	const { entity } = deps.mod.require.library;

	// Get mob ent
	const ent = entity["mobs"][event.gameId.toString()];

	if (ent)
		return deps.guide.handleEvent(`nd-${ent.huntingZoneId}-${ent.templateId}`, ent, debug);
};