"use strict";

module.exports = {
	"hook": ["S_BOSS_GAGE_INFO", 3, HOOK_SETTINGS.LAST],
	"name": "Health",
	"color": cr,
};

module.exports.callback = (mod, guide, event) => {

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

		// Set event key
		const key = `h-${ent.huntingZoneId}-${ent.templateId}-${hp}`;

		// Call event
		return guide.handleEvent(key, ent, "h", module.exports);
	}
};