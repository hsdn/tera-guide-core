/* eslint-disable no-param-reassign */
"use strict";

const { Spawn, applyDistance } = require("../../../spawn");

// Used for item unique id
let uint64 = 0xFFFFFFFA;

module.exports = (that, mod, guide) => {

	that.spawn = (event = {}, ent = false, speed = 1.0) => {
		// Ignore if streamer mode is enabled
		if (mod.settings.stream) return;

		// Ignore if spawnObject is disabled
		if (!mod.settings.spawnObject || !guide.obj.spawnObject) return;

		// Check ent is defined
		if (!ent) ent = guide.obj.ent;
		if (!ent) return mod.error("Spawn handler has invalid entity or not specified");

		// If func is defined, try to call the spawn function from the lib and return
		if (event.func) {
			// Make sure args is defined
			if (!event.args) return mod.error("Spawn handler needs a args");

			try {
				// Create timer for specified delay
				that.delay(() => {
					// Create a Spawn class
					const instance = new Spawn(ent, mod, that, speed);

					if (!instance[event.func])
						mod.error(`An event has invalid func: ${event.func}`);

					instance[event.func](...event.args);
				}, event.delay, speed);
			} catch (e) {
				mod.error(e);
			}

			return;
		}

		// Make sure id is defined
		if (!event.id) return mod.error("Spawn handler needs a id");

		// Make sure sub_delay is defined
		if (!event.sub_delay) return mod.error("Spawn handler needs a sub_delay");

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

			loc.w = (ent.loc.w || 0) + (event.offset || 0);

			applyDistance(loc, event.distance || 0, event.degrees || 0, 0);

			let bonfire_id = 1;
			let sending_event = {
				"gameId": item_unique_id,
				"loc": loc,
				"w": loc.w
			};

			// Spawn item for specified type
			switch (sub_type) {
				case "bonfire":
					// Set bonfire type
					switch (event.id) {
						case "normal": bonfire_id = 1; break; // normal bonfire
						case "fire": bonfire_id = 2; break; // fire without stand
						case "santa": bonfire_id = 6; break; // santa candle
						case "blue": bonfire_id = 8; break; // blue fire
						case "purple": bonfire_id = 9; break; // purple fire
						case "sacrifice": bonfire_id = 10; break; // flame of sacrifice
					}
					mod.toClient("S_SPAWN_BONFIRE", 2, {
						"id": bonfire_id,
						"status": 0,
						...sending_event
					});
					break;

				case "collection":
					mod.toClient("S_SPAWN_COLLECTION", 4, {
						"id": event.id,
						"amount": 1,
						"extractor": false,
						"extractorDisabled": false,
						"extractorDisabledTime": 0,
						...sending_event
					});
					break;

				case "item":
					mod.toClient("S_SPAWN_DROPITEM", 8, {
						"item": event.id,
						"amount": 1,
						"expiry": 0,
						"explode": false,
						"masterwork": false,
						"enchant": 0,
						"debug": false,
						"owners": [],
						...sending_event
					});
					break;

				case "build_object":
					mod.toClient("S_SPAWN_BUILD_OBJECT", 2, {
						"itemId": event.id,
						"unk": 0,
						"ownerName": event.ownerName || "",
						"message": event.message || "",
						...sending_event
					});
					break;

				// If we haven't implemented the sub_type the event asks for
				default:
					return mod.error(`Invalid sub_type for spawn handler: ${sub_type}`);
			}

			// Add entry to spawned objects list for its batсh despawn
			guide.obj.data.items[item_unique_id] = sub_type;

			// Call handler to despawn a spawned item
			that.despawn({ "id": item_unique_id, "sub_type": sub_type, "delay": event.sub_delay }, ent, speed);

		}, event.delay, speed);
	};

	// Alias function
	that.spawn_func = (...args) => {
		that.spawn(...args);
	};
};