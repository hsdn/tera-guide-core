"use strict";

/**
 * @typedef {import("../../hooks").deps} deps
 * @typedef {import("../../guide")} guide
 */

module.exports.debug = Object.freeze({
	"name": "Abnormality End",
	"color": clp
});

/**
 * @param {deps} deps
 * @param {guide} guide
 * @param {Object} event
 */
module.exports.callback = (deps, guide, event) => {

	const { entity, player } = deps.mod.require.library;

	// Get id used in the list
	const storeId = [event.target, event.id].toString();

	// Get added abnormal data from the list
	const added = guide.data.abnormals.get(storeId);

	// Return if abnormality is not found in the list
	if (!added) return;

	// Delete abnormal data from the list
	guide.data.abnormals.delete(storeId);

	if (player.isMe(added.target)) {
		// Removed abnormality applied to me by nothing or me
		if (!added.source || player.isMe(added.source))
			return guide.handleEvent(["ar", 0, 0, added.id], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);

		// Removed abnormality applied to me by mob (boss)
		const source_ent = entity.mobs[added.source.toString()];

		if (source_ent)
			return guide.handleEvent(["ar", source_ent.huntingZoneId, source_ent.templateId, added.id], source_ent, module.exports.debug);
	} else if (player.playersInParty.has(added.target)) {
		// Removed abnormality applied to party by nothing or me
		if (!added.source || player.isMe(added.source))
			return guide.handleEvent(["at", 0, 0, added.id], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);

		// Removed abnormality applied to party by mob (boss)
		const source_ent = entity.mobs[added.source.toString()];

		if (source_ent)
			return guide.handleEvent(["at", source_ent.huntingZoneId, source_ent.templateId, added.id], source_ent, module.exports.debug);
	} else {
		// Removed abnormality applied to mob (boss)
		const target_ent = entity.mobs[added.target.toString()];

		if (target_ent)
			return guide.handleEvent(["ad", target_ent.huntingZoneId, target_ent.templateId, added.id], target_ent, module.exports.debug);
	}
};