/* eslint-disable no-param-reassign */
"use strict";

const { Spawn, applyDistance } = require("../../../spawn");

// Used for item unique id
let uint64 = 0xFFFFFFFA;

/**
 * @typedef {import("../../handlers")} handlers
 * @typedef {import("../../handlers").deps} deps
 */

/**
 * Exports.
 * @param {handlers} that
 * @param {deps} deps
 */
module.exports = (that, deps) => {

	that.spawn = (event = {}, ent = false, speed = 1.0) => {
		// Ignore if streamer mode is enabled
		if (deps.mod.settings.stream) return;

		// Ignore if spawnObject is disabled
		if (!deps.mod.settings.spawnObject || !deps.guide.obj.spawnObject) return;

		// Check ent is defined
		if (!ent) ent = deps.guide.obj.ent;
		if (!ent) return deps.mod.error("Spawn handler has invalid entity or not specified");

		// If func is defined, try to call the spawn function from the lib and return
		if (event.func) {
			// Make sure args is defined
			if (!event.args) return deps.mod.error("Spawn handler needs a args");

			try {
				// Create timer for specified delay
				that.delay(() => {
					// Create a Spawn class
					const instance = new Spawn(ent, deps.mod, that, speed);

					if (!instance[event.func])
						deps.mod.error(`An event has invalid func: ${event.func}`);

					instance[event.func](...event.args);
				}, event.delay, speed);
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
		const sub_type = event.sub_type || "collection";

		// The unique spawned id self item will be using.
		const item_unique_id = event.force_gameId || uint64--;

		// Create timer for specified delay
		that.delay(() => {
			// The location of the item spawned
			let loc = ent.loc.clone();

			// if pos is set, we use that
			if (event.pos) loc = event.pos;

			// Apply position
			loc.w = (ent.loc.w || 0) + (event.offset || 0);
			applyDistance(loc, event.distance || 0, event.angle || 0, 0);

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
			switch (sub_type) {
				case "bonfire":
					deps.mod.send(...deps.proto.getData("S_SPAWN_BONFIRE"), {
						"gameId": item_unique_id,
						"id": bonfireTypes[event.id] || 1,
						"loc": loc,
						"status": 0
					});
					break;

				case "collection":
					deps.mod.send(...deps.proto.getData("S_SPAWN_COLLECTION"), {
						"gameId": item_unique_id,
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
						"gameId": item_unique_id,
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
						"gameId": item_unique_id,
						"itemId": event.id,
						"loc": loc,
						"w": loc.w,
						"unk": 0,
						"ownerName": event.ownerName || "",
						"message": event.message || ""
					});
					break;

				// If we haven't implemented the sub_type the event asks for
				default:
					return deps.mod.error(`Invalid sub_type for spawn handler: ${sub_type}`);
			}

			// Add entry to spawned objects list for its batсh despawn
			deps.guide.obj.data.items[item_unique_id] = sub_type;

			// Call handler to despawn a spawned item
			that.despawn({ "id": item_unique_id, "sub_type": sub_type, "delay": event.sub_delay }, ent, speed);

		}, event.delay, speed);
	};

	// Alias function
	that.spawn_func = (...args) => {
		that.spawn(...args);
	};
};