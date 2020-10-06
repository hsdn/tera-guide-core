"use strict";

module.exports = (that, mod, guide) => {

	that.stop_timers = (event = {}, ent = false, speed = 1.0) => {
		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Create timer for specified delay
		that.__delayEvent(() => {
			mod.clearAllTimeouts();
		}, delay, speed);
	};
};