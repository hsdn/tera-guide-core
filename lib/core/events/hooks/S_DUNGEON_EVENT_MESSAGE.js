"use strict";

/**
 * @typedef {import("../../hooks").deps} deps
 * @typedef {import("../../guide")} guide
 */

module.exports.debug = Object.freeze({
	"name": "Dungeon Message",
	"color": clb
});

/**
 * @param {deps} deps
 * @param {guide} guide
 * @param {Object} event
 */
module.exports.callback = (deps, guide, event) => {

	const result = /@dungeon:(\d+)/g.exec(event.message);

	if (result)
		return guide.handleEvent(["dm", 0, 0, parseInt(result[1])], { "huntingZoneId": 0, "templateId": 0 }, module.exports.debug);
};