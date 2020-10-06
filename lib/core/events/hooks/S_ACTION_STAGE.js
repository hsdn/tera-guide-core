"use strict";

module.exports = {
	"hook": ["S_ACTION_STAGE", 9, HOOK_SETTINGS.LAST],
	"name": "Skill",
	"color": cy,
};

module.exports.callback = (that, mod, guide, debug, event) => {

	const { entity } = mod.require.library;

	// Return if skill of not NPC
	if (!event.skill.npc) return;

	// Get mob ent
	const ent = entity["mobs"][event.gameId.toString()];

	if (ent) {
		let skillid = 0;

		// Get range for skill ids of zone type
		if (guide.obj.type === SP)
			// Skill id range 1000-3000 (SP)
			skillid = event.skill.id;
		else if (guide.obj.type === ES)
			// Skill id range 100-200-3000 (ES)
			skillid = event.skill.id > 3000 ? event.skill.id : event.skill.id % 1000;
		else
			// Skill id range 100-200 (not set)
			skillid = event.skill.id % 1000;

		// Due to a bug for some bizare reason we do hooks ugly hack
		event["loc"].w = event.w;

		// Call event handler
		guide.handleEvent({ ...ent, ...event }, skillid, "s", debug, event.speed, event.stage);
	}
};