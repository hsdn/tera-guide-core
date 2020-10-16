"use strict";

const debug = {
	"name": "Abnormality begin",
	"color": cp,
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

	// Return if abnormality is applied by player
	if (event.source && (player.isMe(event.source) || player.playersInParty.includes(event.source))) return;

	// Set source ent for avoid errors
	if (!event.source) event.source = 0n;

	// If the boss/mob is the cause for the abnormality
	const source_ent = entity["mobs"][event.source.toString()];

	// Applies an abnormality to me
	if (player.isMe(event.target)) {
		// by mob/boss
		if (source_ent)
			return deps.guide.handleEvent(`am-${source_ent.huntingZoneId}-${source_ent.templateId}-${event.id}`, source_ent, { ...debug, "key": "am" });

		// by nothing/server
		if ((event.source || 0) == 0)
			return deps.guide.handleEvent(`ae-0-0-${event.id}`, { "huntingZoneId": 0, "templateId": 0 }, { ...debug, "key": "ae" });
	}

	// If the boss/mob get's a abnormality applied to it
	const target_ent = entity["mobs"][event.target.toString()];

	// Applies an abnormality to mob/boss
	if (target_ent)
		return deps.guide.handleEvent(`ab-${target_ent.huntingZoneId}-${target_ent.templateId}-${event.id}`, target_ent, { ...debug, "key": "ab" });
};