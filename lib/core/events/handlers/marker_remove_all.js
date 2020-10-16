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

	that.marker_remove_all = (event = {}, ent = false, speed = 1.0) => {
		// Create timer for specified delay
		that.delay(() => {
			Object.keys(deps.guide.obj.data.markers).forEach(gameId => {
				// Clear marker remove timer
				if (deps.guide.obj.data.markers[gameId].timer !== false)
					deps.mod.clearTimeout(deps.guide.obj.data.markers[gameId].timer);

				// Call handler to marker remove
				that.marker_remove({ "id": gameId });
			});
		}, event.delay, speed);
	};
};