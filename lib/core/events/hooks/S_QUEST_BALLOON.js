"use strict";

module.exports = {
	"hook": ["S_QUEST_BALLOON", 1, DEFAULT_HOOK_SETTINGS],
	"name": "Quest Balloon",
	"color": cb,
};

module.exports.callback = (that, mod, guide, debug, event) => {

	const { entity } = mod.require.library;

	const source_ent = entity["mobs"][event.source.toString()];
	const result = /@monsterBehavior:(\d+)/g.exec(event.message);

	if (result && source_ent)
		// Call event handler
		guide.handleEvent(source_ent, parseInt(result[1]), "qb", debug);
};