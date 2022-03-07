"use strict";

/**
 * @typedef {import("../../hooks").deps} deps
 * @typedef {import("../../guide")} guide
 */

module.exports.debug = Object.freeze({
	"name": "Abnormality Begin",
	"color": cp
});

/**
 * @param {deps} deps
 * @param {guide} guide
 * @param {Object} event
 */
module.exports.callback = (deps, guide, event) => {

	const { entity, player } = deps.mod.require.library;

	// Return if abnormality is applied by player in the party
	if (event.source && player.playersInParty.has(event.source.toString())) return;

	// Add abnormal data to the list
	if (guide.hooks.list.has("S_ABNORMALITY_END"))
		guide.data.abnormals.set([event.target, event.id].toString(), event);

	if (player.isMe(event.target)) {
		// Abnormality was applied to me by nothing or me
		if (!event.source || player.isMe(event.source)) {
			guide.handleEvent(["ae", 0, 0, event.id], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);
			guide.handleEvent(["ae", 0, 0, event.id, event.stacks], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);

			return;
		}

		// Abnormality was applied to me by mob (boss)
		const source_ent = entity.mobs[event.source.toString()];

		if (source_ent) {
			guide.handleEvent(["am", source_ent.huntingZoneId, source_ent.templateId, event.id], source_ent, module.exports.debug);
			guide.handleEvent(["am", source_ent.huntingZoneId, source_ent.templateId, event.id, event.stacks], source_ent, module.exports.debug);
		}
	} else if (player.playersInParty.has(event.target)) {
		// Abnormality was applied to party by nothing or me
		if (!event.source || player.isMe(event.source)) {
			guide.handleEvent(["af", 0, 0, event.id], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);
			guide.handleEvent(["af", 0, 0, event.id, event.stacks], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);

			return;
		}

		// Abnormality was applied to party by mob (boss)
		const source_ent = entity.mobs[event.source.toString()];

		if (source_ent) {
			guide.handleEvent(["ap", source_ent.huntingZoneId, source_ent.templateId, event.id], source_ent, module.exports.debug);
			guide.handleEvent(["ap", source_ent.huntingZoneId, source_ent.templateId, event.id, event.stacks], source_ent, module.exports.debug);
		}
	} else {
		// Abnormality was applied to mob (boss)
		const target_ent = entity.mobs[event.target.toString()];

		if (target_ent) {
			guide.handleEvent(["ab", target_ent.huntingZoneId, target_ent.templateId, event.id], target_ent, module.exports.debug);
			guide.handleEvent(["ab", target_ent.huntingZoneId, target_ent.templateId, event.id, event.stacks], target_ent, module.exports.debug);
		}
	}
};