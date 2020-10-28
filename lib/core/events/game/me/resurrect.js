"use strict";

/**
 * @typedef {import("../../../events").deps} deps
 */

/**
 * @param {deps} deps
 */
module.exports = deps => {
	if (!deps.zone.loaded) return;

	const { player } = deps.mod.require.library;

	return deps.zone.guide.handleEvent(["resurrect"], player, { "name": "Resurrect", "color": cv });
};