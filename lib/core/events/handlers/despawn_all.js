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

	that.despawn_all = (event = {}, ent = false, speed = 1.0) => {
		// Create timer for specified delay
		that.delay(() => {
			Object.keys(deps.guide.obj.data.items).forEach(gameId => {
				// Call handler to despawn a spawned item
				that.despawn({ "id": gameId, "sub_type": deps.guide.obj.data.items[gameId] });
			});
		}, event.delay, speed);
	};
};