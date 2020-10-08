"use strict";

module.exports = {
	"hook": ["S_ABNORMALITY_END", 1, HOOK_SETTINGS.LAST],
	"name": "Abnormality end",
	"color": cp,
};

module.exports.callback = (mod, guide, event) => {

	const { entity, player } = mod.require.library;

	// Removes an abnormality to me
	if (player.isMe(event.target)) {
		// Set event key
		const key = `ar-0-0-${event.id}`;

		// Call event
		return guide.handleEvent(key, { "huntingZoneId": 0, "templateId": 0 }, "ar", module.exports);
	}

	// If the boss/mob get"s a abnormality applied to it
	const target_ent = entity["mobs"][event.target.toString()];

	// Removes an abnormality from mob/boss
	if (target_ent) {
		// Set ent
		const ent = { "huntingZoneId": 0, "templateId": 0, ...target_ent };

		// Set event key
		const key = `ad-${ent.huntingZoneId}-${ent.templateId}-${event.id}`;

		// Call event
		return guide.handleEvent(key, ent, "ad", module.exports);
	}
};