"use strict";

const debug = {
	"name": "Abnormality end",
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

	// Removes an abnormality to me
	if (player.isMe(event.target))
		return deps.guide.handleEvent(`ar-0-0-${event.id}`, { "huntingZoneId": 0, "templateId": 0 }, { ...debug, "key": "ar" });

	// If the boss/mob get"s a abnormality applied to it
	const target_ent = entity["mobs"][event.target.toString()];

	// Removes an abnormality from mob/boss
	if (target_ent)
		return deps.guide.handleEvent(`ad-0-0-${event.id}`, { "huntingZoneId": 0, "templateId": 0, ...target_ent }, { ...debug, "key": "ad" });
};