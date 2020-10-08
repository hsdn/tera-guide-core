"use strict";

module.exports = {
	"hook": ["S_QUEST_BALLOON", 1, HOOK_SETTINGS.LAST],
	"name": "Quest Balloon",
	"color": cb,
};

module.exports.callback = (mod, guide, event) => {

	const { entity } = mod.require.library;

	const source_ent = entity["mobs"][event.source.toString()];
	const result = /@monsterBehavior:(\d+)/g.exec(event.message);

	if (result && source_ent) {
		// Set event key
		const key = `qb-${source_ent.huntingZoneId}-${source_ent.templateId}-${parseInt(result[1])}`;

		// Call event
		return guide.handleEvent(key, source_ent, "qb", module.exports);
	}
};