"use strict";

module.exports = (that, mod, guide) => {

	that.despawn_all = (event = {}, ent = false, speed = 1.0) => {
		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Create timer for specified delay
		that.__delayEvent(() => {
			Object.keys(guide.obj.data.items).forEach(gameId => {
				// Call handler to despawn a spawned item
				that.despawn({ "id": gameId, "sub_type": guide.obj.data.items[gameId] });
			});
		}, delay, speed);
	};
};