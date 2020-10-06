"use strict";

module.exports = {
	"hook": ["S_ABNORMALITY_REFRESH", 2, HOOK_SETTINGS.LAST],
	"name": "Abnormality refresh",
	"color": cp,
};

module.exports.callback = (that, mod, guide, debug, event) => {

	const { entity, player } = mod.require.library;

	// Applies an abnormality to me by nothing/server
	if (player.isMe(event.target))
		return guide.handleEvent({ "huntingZoneId": 0, "templateId": 0 }, event.id, "ae", debug);

	// If the boss/mob get"s a abnormality applied to it
	const target_ent = entity["mobs"][event.target.toString()];

	// Applies an abnormality to mob/boss
	if (target_ent)
		return guide.handleEvent(target_ent, event.id, "ab", debug);
};