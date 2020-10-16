"use strict";

const debug = {
	"name": "Health",
	"color": cr,
	"key": "h"
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
	const ent = entity["mobs"][event.id.toString()];

	if (ent) {
		// Calculate hp number
		const hp = Math.floor(Number(event.curHp) / Number(event.maxHp) * 100);

		// Check mob's hp of existing value for single call the event
		if (deps.guide.obj.data.hp[event.id.toString()] == hp) return;

		// Add mob hp to list
		deps.guide.obj.data.hp[event.id.toString()] = hp;

		// Call event
		return deps.guide.handleEvent(`h-${ent.huntingZoneId}-${ent.templateId}-${hp}`, ent, debug);
	}
};