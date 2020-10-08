"use strict";

module.exports = (that, mod, guide) => {

	that.despawn_all = (event = {}, ent = false, speed = 1.0) => {
		// Create timer for specified delay
		that.delay(() => {
			Object.keys(guide.obj.data.items).forEach(gameId => {
				// Call handler to despawn a spawned item
				that.despawn({ "id": gameId, "sub_type": guide.obj.data.items[gameId] });
			});
		}, event.delay, speed);
	};
};