"use strict";

/**
 * @typedef {import("../../hooks").deps} deps
 * @typedef {import("../../guide")} guide
 */

module.exports.debug = Object.freeze({
	"name": "Spawn",
	"color": cg
});

/**
 * @param {deps} deps
 * @param {guide} guide
 * @param {Object} event
 */
module.exports.callback = (deps, guide, event) => {

	const { entity } = deps.mod.require.library;

	// Get mob ent
	const ent = entity.mobs[event.gameId.toString()];

	if (ent)
		return guide.handleEvent(["ns", ent.huntingZoneId, ent.templateId], ent, { "name": "Spawn", "color": co });
};