"use strict";

/**
 * @typedef {import("../../../events").deps} deps
 */

// Player identifier
let playerId = undefined;

/**
 * @param {deps} deps
 * @param {number} zone
 */
module.exports = (deps, zone) => {
	// If player has been changed
	if (deps.mod.game.me.playerId !== playerId) {
		playerId = deps.mod.game.me.playerId;

		// Unload the zone
		deps.zone.unload();
	}

	// Load the zone for entered zone
	deps.zone.load(zone);
};