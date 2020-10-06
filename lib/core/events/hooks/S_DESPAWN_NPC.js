"use strict";

module.exports = {
	"hook": ["S_DESPAWN_NPC", 3, HOOK_SETTINGS.FIRST],
	"name": "Despawn",
	"color": cv,
};

module.exports.callback = (that, mod, guide, debug, event) => {

	const { entity } = mod.require.library;

	// Get mob ent
	const ent = entity["mobs"][event.gameId.toString()];

	if (ent) {
		// Call event handler
		guide.handleEvent(ent, false, "nd", debug);
	}
};