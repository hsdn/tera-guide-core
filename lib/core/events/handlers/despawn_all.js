"use strict";

/**
 * @typedef {import("../../handlers").deps} deps
 * @typedef {import("../../handlers").data} data
 */

/**
 * @param {deps} deps
 * @param {data} data
 * @param {Object} [event={}]
 */
module.exports.despawn_all = (deps, data, event = {}) => {
	data.spawns.forEach((attr, gameId) => {
		// If a event.tag is set, compare it and skip despawn if it does not match
		if (event.tag && event.tag != attr.tag)
			return;

		// Call handler to despawn a spawned item
		deps.handlers.types.despawn({ "id": gameId, "sub_type": attr.sub_type });
	});
};