"use strict";

module.exports = {
	"hook": ["S_DESPAWN_NPC", 3, HOOK_SETTINGS.FIRST],
	"name": "Despawn",
	"color": cv,
};

module.exports.callback = (mod, guide, event) => {

	const { entity } = mod.require.library;

	// Get mob ent
	const ent = entity["mobs"][event.gameId.toString()];

	if (ent) {
		// Set event key
		const key = `nd-${ent.huntingZoneId}-${ent.templateId}`;

		// Call event
		return guide.handleEvent(key, ent, "nd", module.exports);
	}
};