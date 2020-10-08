"use strict";

module.exports = {
	"hook": ["S_ABNORMALITY_BEGIN", 4, HOOK_SETTINGS.LAST],
	"name": "Abnormality begin",
	"color": cp,
};

module.exports.callback = (mod, guide, event) => {

	const { entity, player } = mod.require.library;

	// Return if abnormality is applied by player
	if (event.source && (player.isMe(event.source) || player.playersInParty.includes(event.source))) return;

	// Set source ent for avoid errors
	if (!event.source) event.source = 0n;

	// If the boss/mob is the cause for the abnormality
	const source_ent = entity["mobs"][event.source.toString()];

	// Applies an abnormality to me
	if (player.isMe(event.target)) {
		// by mob/boss
		if (source_ent) {
			// Set event key
			const key = `am-${source_ent.huntingZoneId}-${source_ent.templateId}-${event.id}`;

			// Call event
			return guide.handleEvent(key, source_ent, "am", module.exports);
		}

		// by nothing/server
		if ((event.source || 0) == 0) {
			// Set event key
			const key = `ae-0-0-${event.id}`;

			// Call event
			return guide.handleEvent(key, { "huntingZoneId": 0, "templateId": 0 }, "ae", module.exports);
		}
	}

	// If the boss/mob get's a abnormality applied to it
	const target_ent = entity["mobs"][event.target.toString()];

	// Applies an abnormality to mob/boss
	if (target_ent) {
		// Set event key
		const key = `ab-${target_ent.huntingZoneId}-${target_ent.templateId}-${event.id}`;

		// Call event
		return guide.handleEvent(key, target_ent, "ab", module.exports);
	}
};