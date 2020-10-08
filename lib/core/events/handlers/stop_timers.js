"use strict";

module.exports = (that, mod, guide) => {

	that.stop_timers = (event = {}, ent = false, speed = 1.0) => {
		// Create timer for specified delay
		that.delay(() => { mod.clearAllTimeouts(); }, event.delay, speed);
	};
};