"use strict";

module.exports = {
	"hook": ["S_BOSS_GAGE_INFO", 3, DEFAULT_HOOK_SETTINGS],
	"name": "Health",
	"color": cr,
};

module.exports.callback = (that, mod, guide, debug, event) => {

	const { entity } = mod.require.library;

	// Get mob ent
	const ent = entity["mobs"][event.id.toString()];

	if (ent) {
		// Calculate hp number
		const hp = Math.floor(Number(event.curHp) / Number(event.maxHp) * 100);

		// Check mob's hp of existing value for single call the event
		if (guide.obj.data.hp[event.id.toString()] == hp) return;

		// Add mob hp to list
		guide.obj.data.hp[event.id.toString()] = hp;

		// Call event handler
		guide.handleEvent(ent, hp, "h", debug);
	}
};