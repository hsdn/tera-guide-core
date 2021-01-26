/* eslint-disable no-param-reassign */
"use strict";

const Spawn = require("../../../spawn").Spawn;

// Used for item unique id
let uint64 = 0xFFFFFFFA;

/**
 * @typedef {import("../../handlers").deps} deps
 * @typedef {import("../../handlers").data} data
 */

/**
 * @param {deps} deps
 * @param {data} data
 * @param {Object} event
 * @param {Object} ent
 */
module.exports.spawn = (deps, data, event, ent) => {
	// Ignore if streamer mode is enabled
	if (deps.mod.settings.stream) return;

	// Ignore if spawnObject is disabled
	if (!deps.mod.settings.spawnObject || (deps.zone.loaded && !deps.zone.settings.spawnObject)) return;

	// Check ent is defined
	if (!ent && deps.zone.loaded) ent = deps.zone.guide.data.ent;
	if (!ent) return deps.mod.error("Spawn handler has invalid entity or not specified");

	// If func is defined, try to call the spawn function from the lib and return
	if (event.func) {
		// Make sure args is defined
		if (!event.args || !Array.isArray(event.args))
			return deps.mod.error("Spawn handler needs a args with array");

		try {
			// Create a Spawn class
			const instance = new Spawn(ent, deps.mod, deps.handlers.types, event);

			if (instance[event.func] === undefined)
				deps.mod.error(`An event has invalid func: ${event.func}`);

			instance[event.func](...event.args);
		} catch (e) {
			deps.mod.error(e);
		}

		return;
	}

	// Make sure id is defined
	if (!event.id) return deps.mod.error("Spawn handler needs a id");

	// Make sure sub_delay is defined
	if (!event.sub_delay) return deps.mod.error("Spawn handler needs a sub_delay");

	// Set sub_type to be collection as default for backward compatibility
	const subType = event.sub_type || "collection";

	// The unique spawned id self item will be using.
	const itemUniqueId = event.force_gameId || uint64--;

	// The location of the item spawned
	let loc = ent.loc.clone();

	// if pos is set, we use handlers
	if (event.pos) loc = event.pos;

	// Apply position
	loc.w = (ent.loc.w || 0) + (event.offset || 0);
	loc = Spawn.applyDistance(loc, event.distance || 0, event.angle || 0);

	// Bonfire types
	const bonfireTypes = {
		"normal": 1, // normal bonfire
		"fire": 2, // fire without stand
		"santa": 6, // santa candle
		"blue": 8, // blue fire
		"purple": 9, // purple fire
		"sacrifice": 10 // flame of sacrifice
	};

	// Spawn item for specified type
	switch (subType) {
		case "bonfire":
			deps.mod.send(...deps.proto.getData("S_SPAWN_BONFIRE"), {
				"gameId": itemUniqueId,
				"id": bonfireTypes[event.id] || 1,
				"loc": loc,
				"status": 0
			});
			break;

		case "collection":
			deps.mod.send(...deps.proto.getData("S_SPAWN_COLLECTION"), {
				"gameId": itemUniqueId,
				"id": event.id,
				"amount": 1,
				"loc": loc,
				"w": loc.w,
				"extractor": false,
				"extractorDisabled": false,
				"extractorDisabledTime": 0
			});
			break;

		case "item":
			deps.mod.send(...deps.proto.getData("S_SPAWN_DROPITEM"), {
				"gameId": itemUniqueId,
				"loc": loc,
				"item": event.id,
				"amount": 1,
				"expiry": 0,
				"explode": false,
				"masterwork": false,
				"enchant": 0,
				"debug": false,
				"owners": []
			});
			break;

		case "build_object":
			deps.mod.send(...deps.proto.getData("S_SPAWN_BUILD_OBJECT"), {
				"gameId": itemUniqueId,
				"itemId": event.id,
				"loc": loc,
				"w": loc.w,
				"unk": 0,
				"ownerName": event.ownerName || "",
				"message": event.message || ""
			});
			break;

		default:
			return deps.mod.error(`Invalid sub_type for spawn handler: ${subType}`);
	}

	// Add entry to spawned objects list for its batсh despawn
	data.spawns.set(itemUniqueId, event);

	// Call handler to despawn a spawned item
	deps.handlers.types.despawn({ "id": itemUniqueId, "sub_type": subType, "delay": event.sub_delay }, ent);
};

// Alias function
module.exports.spawn_func = module.exports.spawn;