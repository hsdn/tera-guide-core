"use strict";

/**
 * @typedef {import("../../hooks").deps} deps
 * @typedef {import("../../guide")} guide
 */

module.exports.debug = Object.freeze({
	"name": "Abnormality Refresh",
	"color": cp
});

/**
 * @param {deps} deps
 * @param {guide} guide
 * @param {Object} event
 */
module.exports.callback = (deps, guide, event) => {

	const { entity, player } = deps.mod.require.library;

	// Add abnormal data to the list
	if (guide.hooks.list.has("S_ABNORMALITY_END"))
		guide.data.abnormals.set([event.target, event.id].toString(), event);

	if (player.isMe(event.target)) {
		// Refresh abnormality applied to me by nothing
		guide.handleEvent(["ae", 0, 0, event.id], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);
		guide.handleEvent(["ae", 0, 0, event.id, event.stacks], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);
	} else if (player.playersInParty.has(event.target)) {
		// Refresh abnormality applied to party by nothing
		guide.handleEvent(["af", 0, 0, event.id], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);
		guide.handleEvent(["af", 0, 0, event.id, event.stacks], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);
	} else {
		// Refresh abnormality applied to mob (boss)
		const target_ent = entity.mobs[event.target.toString()];

		if (target_ent) {
			guide.handleEvent(["ab", target_ent.huntingZoneId, target_ent.templateId, event.id], target_ent, module.exports.debug);
			guide.handleEvent(["ab", target_ent.huntingZoneId, target_ent.templateId, event.id, event.stacks], target_ent, module.exports.debug);
		}
	}
};