"use strict";

module.exports = {
	"hook": ["S_ABNORMALITY_END", 1, HOOK_SETTINGS.LAST],
	"name": "Abnormality end",
	"color": cp,
};

module.exports.callback = (that, mod, guide, debug, event) => {

	const { entity, player } = mod.require.library;

	// Applies an abnormality to me
	if (player.isMe(event.target))
		return guide.handleEvent({ "huntingZoneId": 0, "templateId": 0 }, event.id, "ar", debug);

	// If the boss/mob get"s a abnormality applied to it
	const target_ent = entity["mobs"][event.target.toString()];

	// Applies an abnormality to mob/boss
	if (target_ent)
		return guide.handleEvent({ "huntingZoneId": 0, "templateId": 0, ...target_ent }, event.id, "ad", debug);
};