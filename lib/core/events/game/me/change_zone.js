"use strict";

/**
 * @typedef {import("../../../events").deps} deps
 */

/**
 * Event callback.
 * @param {deps} deps
 */
module.exports = (deps, zone) => {
	deps.guide.load(zone);
};