"use strict";

module.exports = {
	"hook": ["S_SPAWN_NPC", 11, HOOK_SETTINGS.LAST],
	"name": "Spawn",
	"color": co,
};

module.exports.callback = (mod, guide, event) => {

	const { entity } = mod.require.library;

	// Get mob ent
	const ent = entity["mobs"][event.gameId.toString()];

	if (ent) {
		// Set event key
		const key = `ns-${ent.huntingZoneId}-${ent.templateId}`;

		// Call event
		return guide.handleEvent(key, ent, "ns", module.exports);
	}
};