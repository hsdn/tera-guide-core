"use strict";

module.exports = (that, mod, guide) => {

	that.func = (event = {}, ent = false, speed = 1.0) => {
		// Make sure func is defined
		if (!event.func) return mod.error("Func handler needs a func");

		// Set ent to guide from the triggered event for use in called function
		guide.obj.ent = ent;

		// Create timer for specified delay
		that.__delayEvent(() => {
			// Try to call the function
			try {
				// If load() function is exists, use old calling method (for compat)
				if (typeof guide.obj.context.load === "function")
					return event.func.call(null, that, event, ent, guide.dispatch);

				// Call function with defined args
				if (event.args)
					return event.func(...event.args, ent, event, that);
				else
					return event.func(ent, event, that);
			} catch (e) {
				mod.error(e);
			}
		}, event.delay, speed);
	};
};