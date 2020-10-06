"use strict";

module.exports = {
	"hook": ["S_SPAWN_NPC", 11, HOOK_SETTINGS.LAST],
	"name": "Spawn",
	"color": co,
};

module.exports.callback = (that, mod, guide, debug, event) => {

	const { entity } = mod.require.library;

	// Get mob ent
	const ent = entity["mobs"][event.gameId.toString()];

	if (ent) {
		// Call event handler
		guide.handleEvent(ent, false, "ns", debug);
	}
};