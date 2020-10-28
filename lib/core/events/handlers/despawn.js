"use strict";

/**
 * @typedef {import("../../handlers").deps} deps
 * @typedef {import("../../handlers").data} data
 */

/**
 * @param {deps} deps
 * @param {data} data
 * @param {Object} event
 */
module.exports.despawn = (deps, data, event) => {
	// Make sure id is defined
	if (!event.id) return deps.mod.error("Despawn handler needs a id");

	// Returns if item already despawned
	if (!data.spawns.has(event.id)) return;

	// Set sub_type to be collection as default for backward compatibility
	const subType = event.sub_type || "collection";

	// Delete despawned item from the list
	data.spawns.delete(event.id);

	// Despawn item by type
	switch (subType) {
		case "bonfire":
			return deps.mod.send(...deps.proto.getData("S_DESPAWN_BONFIRE"), { "gameId": event.id, "unk": 0 });

		case "collection":
			return deps.mod.send(...deps.proto.getData("S_DESPAWN_COLLECTION"), { "gameId": event.id, "collected": false });

		case "item":
			return deps.mod.send(...deps.proto.getData("S_DESPAWN_DROPITEM"), { "gameId": event.id });

		case "build_object":
			return deps.mod.send(...deps.proto.getData("S_DESPAWN_BUILD_OBJECT"), { "gameId": event.id });

		default:
			return deps.mod.error(`Invalid sub_type for despawn handler: ${subType}`);
	}
};