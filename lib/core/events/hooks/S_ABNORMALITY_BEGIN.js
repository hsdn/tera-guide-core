"use strict";

module.exports = {
	"hook": ["S_ABNORMALITY_BEGIN", 4, DEFAULT_HOOK_SETTINGS],
	"name": "Abnormality begin",
	"color": cp,
};

module.exports.callback = (that, mod, guide, debug, event) => {

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
		if (source_ent)
			return guide.handleEvent(source_ent, event.id, "am", debug);

		// by nothing/server
		if ((event.source || 0) == 0)
			return guide.handleEvent({ "huntingZoneId": 0, "templateId": 0 }, event.id, "ae", debug);
	}

	// If the boss/mob get's a abnormality applied to it
	const target_ent = entity["mobs"][event.target.toString()];

	// Applies an abnormality to mob/boss
	if (target_ent)
		return guide.handleEvent(target_ent, event.id, "ab", debug);
};