"use strict";

const debug = {
	"name": "Death",
	"key": "die",
	"color": cr,
};

/**
 * @typedef {import("../../../events").deps} deps
 */

/**
 * Event callback.
 * @param {deps} deps
 */
module.exports = deps => {
	if (!deps.guide.obj.loaded) return;

	const { player } = deps.mod.require.library;

	return deps.guide.handleEvent("die", player, debug);
};