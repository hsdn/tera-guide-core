"use strict";

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

	that.despawn = (event = {}, ent = false, speed = 1.0) => {
		// Make sure id is defined
		if (!event.id) return deps.mod.error("Spawn handler needs a id");

		// Returns if item already despawned
		if (!deps.guide.obj.data.items[event.id]) return;

		// Create timer for specified delay
		that.delay(() => {
			// Set sub_type to be collection as default for backward compatibility
			const sub_type = event.sub_type || "collection";

			// Delete despawned item from the list
			delete deps.guide.obj.data.items[event.id];

			// Despawn item by type
			switch (sub_type) {
				case "bonfire":
					return deps.mod.send(...deps.proto.getData("S_DESPAWN_BONFIRE"), { "gameId": event.id, "unk": 0 });

				case "collection":
					return deps.mod.send(...deps.proto.getData("S_DESPAWN_COLLECTION"), { "gameId": event.id, "collected": false });

				case "item":
					return deps.mod.send(...deps.proto.getData("S_DESPAWN_DROPITEM"), { "gameId": event.id });

				case "build_object":
					return deps.mod.send(...deps.proto.getData("S_DESPAWN_BUILD_OBJECT"), { "gameId": event.id });

				default:
					return deps.mod.error(`Invalid sub_type for despawn handler: ${event.sub_type}`);
			}
		}, event.delay, speed);
	};
};