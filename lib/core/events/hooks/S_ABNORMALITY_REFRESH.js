"use strict";

const debug = {
	"name": "Abnormality refresh",
	"color": cp
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

	const { entity, player } = deps.mod.require.library;

	// Applies an abnormality to me by nothing/server
	if (player.isMe(event.target))
		return deps.guide.handleEvent(`ae-0-0-${event.id}`, { "huntingZoneId": 0, "templateId": 0 }, { ...debug, "key": "ae" });

	// If the boss/mob get"s a abnormality applied to it
	const target_ent = entity["mobs"][event.target.toString()];

	// Applies an abnormality to mob/boss
	if (target_ent)
		return deps.guide.handleEvent(`ab-${target_ent.huntingZoneId}-${target_ent.templateId}-${event.id}`, target_ent, { ...debug, "key": "ab" });
};