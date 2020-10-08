"use strict";

module.exports = {
	"hook": ["S_DUNGEON_EVENT_MESSAGE", 2, HOOK_SETTINGS.LAST],
	"name": "Dungeon Message",
	"color": clb,
};

module.exports.callback = (mod, guide, event) => {

	// Parse message
	const result = /@dungeon:(\d+)/g.exec(event.message);

	if (result) {
		// Set event key
		const key = `dm-0-0-${parseInt(result[1])}`;

		// Call event
		return guide.handleEvent(key, { "huntingZoneId": 0, "templateId": 0 }, "dm", module.exports);
	}
};