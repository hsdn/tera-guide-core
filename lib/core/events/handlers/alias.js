"use strict";

module.exports = (that, mod, guide) => {

	that.alias = (event = {}, ent = false, speed = 1.0) => {
		// Make sure id is defined
		if (!event.id) return mod.error("Alias handler needs a id");

		// Return if handler try call itself (loop protection)
		if (event.id == event._key) return mod.error("Cannot use alias handler to call itself");

		// Create timer for specified delay
		that.delay(() => { guide.emit(event.id, ent, speed); }, event.delay, speed);
	};
};