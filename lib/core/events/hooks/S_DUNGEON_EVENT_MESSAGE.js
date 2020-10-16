"use strict";

const debug = {
	"name": "Dungeon Message",
	"color": clb,
	"key": "dm"
};

/**
 * @typedef {import("../../hooks").deps} deps
 */

/**
 * Hook callback.
 * @param {deps} deps
 * @param {Object} event
 */
module.exports.callback = (deps, event) => {

	const result = /@dungeon:(\d+)/g.exec(event.message);

	if (result)
		return deps.guide.handleEvent(`dm-0-0-${parseInt(result[1])}`, { "huntingZoneId": 0, "templateId": 0 }, debug);
};