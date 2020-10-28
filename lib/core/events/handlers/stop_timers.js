"use strict";

/**
 * @typedef {import("../../handlers").deps} deps
 */

/**
 * @param {deps} deps
 */
module.exports.stop_timers = deps => {
	deps.mod.clearAllTimeouts();
	deps.mod.clearAllIntervals();
};