"use strict";

/**
 * @typedef {import("../../handlers")} handlers
 * @typedef {import("../../handlers").deps} deps
 */

/**
 * Exports.
 * @param {handlers} that
 * @param {deps} deps
 */
module.exports = (that, deps) => {

	that.func = (event = {}, ent = false, speed = 1.0) => {
		// Make sure func is defined
		if (!event.func) return deps.mod.error("Func handler needs a func");

		// Set ent to guide from the triggered event for use in called function
		deps.guide.obj.ent = ent;

		// Create timer for specified delay
		that.delay(() => {
			// Try to call the function
			try {
				// If load() function is exists, use old calling method (for compat)
				if (typeof deps.guide.obj.context.load === "function")
					return event.func.call(null, that, event, ent, deps.dispatch);

				// Call function with defined args
				if (event.args)
					return event.func(...event.args, ent, event, that);
				else
					return event.func(ent, event, that);
			} catch (e) {
				deps.mod.error(e);
			}
		}, event.delay, speed);
	};
};