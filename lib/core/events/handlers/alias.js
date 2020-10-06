"use strict";

module.exports = (that, mod, guide) => {

	that.alias = (event = {}, ent = false, speed = 1.0) => {
		// Make sure id is defined
		if (!event["id"]) return mod.error("Alias handler needs a id");

		// Return if handler try call itself (loop protection)
		if (event["id"] == event["_key"]) return mod.error("Cannot use alias handler to call itself");

		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Create timer for specified delay
		that.__delayEvent(() => {
			// Check entry
			if (!guide.obj.context[event["id"]])
				return mod.error("Alias handler has invalid id specified");

			// Get triggered entry of events
			const entry = guide.obj.context[event["id"]];
			// Call event handler
			if (entry)
				that.start_events(entry, ent, speed);
		}, delay, speed);
	};
};