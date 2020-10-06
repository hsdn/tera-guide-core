"use strict";

module.exports = {
	"hook": ["S_DUNGEON_EVENT_MESSAGE", 2, DEFAULT_HOOK_SETTINGS],
	"name": "Dungeon Message",
	"color": clb,
};

module.exports.callback = (that, mod, guide, debug, event) => {

	// Parse message
	const result = /@dungeon:(\d+)/g.exec(event.message);

	if (result)
		// Call event handler
		guide.handleEvent({ "huntingZoneId": 0, "templateId": 0 }, parseInt(result[1]), "dm", debug);
};