/* eslint-disable no-param-reassign */
"use strict";

module.exports = (that, mod, guide) => {

	that.marker_remove = (event = {}, ent = false, speed = 1.0) => {
		// Check ent is defined
		if (!ent) ent = guide.obj.ent;

		// Set gameId
		if (!event.id) event.id = ent.gameId || false;
		if (!event.id) return mod.error("Marker remove handler needs a gameId (id)");

		// Returns if marker already removed
		if (!guide.obj.data.markers[event.id]) return;

		// Create timer for specified delay
		that.__delayEvent(() => {
			delete guide.obj.data.markers[event.id];

			// Reset markers by new list
			let targets = [];
			Object.keys(guide.obj.data.markers).forEach(gameId => {
				let color = 0;

				switch (guide.obj.data.markers[gameId].color) {
					case "yellow": color = 1; break;
					case "blue": color = 2; break;
				}

				targets.push({ "target": gameId, "color": color });
			});

			mod.toClient("S_PARTY_MARKER", 1, { "markers": targets });
		}, event.delay, speed);
	};
};