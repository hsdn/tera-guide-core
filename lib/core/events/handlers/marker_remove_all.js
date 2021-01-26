"use strict";

/**
 * @typedef {import("../../handlers").deps} deps
 * @typedef {import("../../handlers").data} data
 */

/**
 * @param {deps} deps
 * @param {data} data
 */
module.exports.marker_remove_all = (deps, data) => {
	data.markers.forEach((attr, gameId) =>
		// Call handler to marker remove
		deps.handlers.types.marker_remove({ "id": gameId })
	);
};