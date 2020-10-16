"use strict";

const debug = {
	"name": "Quest Balloon",
	"color": cb,
	"key": "qb"
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

	const { entity } = deps.mod.require.library;

	const source_ent = entity["mobs"][event.source.toString()];
	const result = /@monsterBehavior:(\d+)/g.exec(event.message);

	if (result && source_ent)
		return deps.guide.handleEvent(`qb-${source_ent.huntingZoneId}-${source_ent.templateId}-${parseInt(result[1])}`, source_ent, debug);
};