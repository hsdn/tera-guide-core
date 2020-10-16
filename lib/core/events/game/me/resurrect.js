"use strict";

const debug = {
	"name": "Resurrect",
	"key": "resurrect",
	"color": cg,
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

	return deps.guide.handleEvent("resurrect", player, debug);
};