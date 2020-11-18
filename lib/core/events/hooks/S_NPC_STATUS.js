"use strict";

/**
 * @typedef {import("../../hooks").deps} deps
 * @typedef {import("../../guide")} guide
 */

module.exports.debug = Object.freeze({
	"name": "NPC Status",
	"color": cgr
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

	if (ent) {
		// Begin mob/boss rage
		if (event.enraged && !guide.data.mobsRage[event.gameId]) {
			guide.data.mobsRage[event.gameId] = true;

			// Call event
			return guide.handleEvent(["rb", ent.huntingZoneId, ent.templateId], ent, { ...module.exports.debug, "name": "Rage Begin" });
		}

		// End of mob/boss rage
		if (!event.enraged && guide.data.mobsRage[event.gameId]) {
			guide.data.mobsRage[event.gameId] = false;

			// Call event
			return guide.handleEvent(["re", ent.huntingZoneId, ent.templateId], ent, { ...module.exports.debug, "name": "Rage End" });
		}
	}
};