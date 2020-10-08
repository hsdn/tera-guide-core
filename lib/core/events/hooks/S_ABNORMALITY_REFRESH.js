"use strict";

module.exports = {
	"hook": ["S_ABNORMALITY_REFRESH", 2, HOOK_SETTINGS.LAST],
	"name": "Abnormality refresh",
	"color": cp,
};

module.exports.callback = (mod, guide, event) => {

	const { entity, player } = mod.require.library;

	// Applies an abnormality to me by nothing/server
	if (player.isMe(event.target)) {
		// Set event key
		const key = `ae-0-0-${event.id}`;

		// Call event
		return guide.handleEvent(key, { "huntingZoneId": 0, "templateId": 0 }, "ae", module.exports);
	}

	// If the boss/mob get"s a abnormality applied to it
	const target_ent = entity["mobs"][event.target.toString()];

	// Applies an abnormality to mob/boss
	if (target_ent) {
		// Set event key
		const key = `ab-${target_ent.huntingZoneId}-${target_ent.templateId}-${event.id}`;

		// Call event
		return guide.handleEvent(key, target_ent, "ab", module.exports);
	}
};