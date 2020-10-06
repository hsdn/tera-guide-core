"use strict";

module.exports = (that, mod, guide) => {

	that.marker_remove_all = (event = {}, ent = false, speed = 1.0) => {
		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Create timer for specified delay
		that.__delayEvent(() => {
			Object.keys(guide.obj.data.markers).forEach(gameId => {
				// Clear marker remove timer
				if (guide.obj.data.markers[gameId].timer !== false)
					mod.clearTimeout(guide.obj.data.markers[gameId].timer);

				// Call handler to marker remove
				that.marker_remove({ "id": gameId });
			});
		}, delay, speed);
	};
};