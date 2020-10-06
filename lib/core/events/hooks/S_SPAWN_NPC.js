"use strict";

module.exports = {
	"hook": ["S_SPAWN_NPC", 11, DEFAULT_HOOK_SETTINGS],
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

		// Add spawned NPC to list
		guide.obj.data.npc[event.gameId.toString()] = ent;
	}
};