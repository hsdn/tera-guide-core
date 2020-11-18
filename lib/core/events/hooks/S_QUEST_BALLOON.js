"use strict";

/**
 * @typedef {import("../../hooks").deps} deps
 * @typedef {import("../../guide")} guide
 */

module.exports.debug = Object.freeze({
	"name": "Quest Balloon",
	"color": cb
});

/**
 * @param {deps} deps
 * @param {guide} guide
 * @param {Object} event
 */
module.exports.callback = (deps, guide, event) => {

	const { entity } = deps.mod.require.library;

	const source_ent = entity.mobs[event.source.toString()];
	const result = /@(monsterBehavior|dungeon):(\d+)/g.exec(event.message);

	if (result && source_ent)
		return guide.handleEvent(["qb", source_ent.huntingZoneId, source_ent.templateId, parseInt(result[2])], source_ent, module.exports.debug);
};