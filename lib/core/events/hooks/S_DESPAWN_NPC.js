"use strict";

module.exports = {
	"hook": ["S_DESPAWN_NPC", 3, DEFAULT_HOOK_SETTINGS],
	"name": "Despawn",
	"color": cv,
};

module.exports.callback = (that, mod, guide, debug, event) => {

	// Get mob ent
	const ent = guide.obj.data.npc[event.gameId.toString()];

	if (ent) {
		// Call event handler
		guide.handleEvent(ent, false, "nd", debug);

		// Delete despawned NPC from list
		delete guide.obj.data.npc[event.gameId];
	}
};