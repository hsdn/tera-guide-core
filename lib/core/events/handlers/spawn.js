/* eslint-disable no-param-reassign */
"use strict";

const { Spawn, applyDistance } = require("../../../spawn");

// Used for item unique id in spawn handler
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
		if (event["func"]) {
			// Make sure args is defined
			if (!event["args"]) return mod.error("Spawn handler needs a args");

			// Set delay for timers
			const delay = parseInt(event["delay"]);

			try {
				// Create timer for specified delay
				that.__delayEvent(() => {
					// Create a Spawn class
					const instance = new Spawn(ent, mod, that, speed);

					if (!instance[event["func"]])
						mod.error(`An event has invalid func: ${event["func"]}`);

					instance[event["func"]](...event["args"]);
				}, delay, speed);
			} catch (e) {
				mod.error(e);
			}

			return;
		}

		// Make sure id is defined
		if (!event["id"]) return mod.error("Spawn handler needs a id");

		// Make sure sub_delay is defined
		if (!event["sub_delay"]) return mod.error("Spawn handler needs a sub_delay");

		// Set delays for timers
		const delay = parseInt(event["delay"]);
		const sub_delay = parseInt(event["sub_delay"]);

		// Set sub_type to be collection as default for backward compatibility
		const sub_type = event["sub_type"] || "collection";

		// The unique spawned id self item will be using.
		const item_unique_id = event["force_gameId"] || uint64--;

		// Create timer for specified delay
		that.__delayEvent(() => {
			// The location of the item spawned
			let loc = ent["loc"].clone();

			// if pos is set, we use that
			if (event["pos"]) loc = event["pos"];

			loc.w = (ent["loc"].w || 0) + (event["offset"] || 0);

			applyDistance(loc, event["distance"] || 0, event["degrees"] || 0, 0);

			let sending_event = {
				"gameId": item_unique_id,
				"loc": loc,
				"w": loc.w
			};

			// Create the sending event
			switch (sub_type) {
				// If it"s type collection, it"s S_SPAWN_COLLECTION
				case "collection":
					Object.assign(sending_event, {
						"id": event["id"],
						"amount": 1,
						"extractor": false,
						"extractorDisabled": false,
						"extractorDisabledTime": 0
					});
					break;

				// If it"s type item, it"s S_SPAWN_DROPITEM
				case "item":
					Object.assign(sending_event, {
						"item": event["id"],
						"amount": 1,
						"expiry": 0,
						"explode": false,
						"masterwork": false,
						"enchant": 0,
						"debug": false,
						"owners": []
					});
					break;

				// If it's type build_object, it's S_SPAWN_BUILD_OBJECT
				case "build_object":
					Object.assign(sending_event, {
						"itemId": event["id"],
						"unk": 0,
						"ownerName": event["ownerName"] || "",
						"message": event["message"] || ""
					});
					break;

				// If we haven't implemented the sub_type the event asks for
				default:
					return mod.error(`Invalid sub_type for spawn handler: ${event["sub_type"]}`);
			}

			// Add entry to spawned objects list for its bath despawn
			guide.obj.data.items[item_unique_id] = sub_type;

			// Spawn item by type
			switch (sub_type) {
				case "collection":
					mod.toClient("S_SPAWN_COLLECTION", 4, sending_event);
					break;

				case "item":
					mod.toClient("S_SPAWN_DROPITEM", 8, sending_event);
					break;

				case "build_object":
					mod.toClient("S_SPAWN_BUILD_OBJECT", 2, sending_event);
					break;
			}

			// Call handler to despawn a spawned item
			that.despawn({
				"id": item_unique_id,
				"sub_type": sub_type,
				"delay": sub_delay
			}, ent, speed);

		}, delay, speed);
	};

	// Alias function
	that.spawn_func = (...args) => {
		that.spawn(...args);
	};
};