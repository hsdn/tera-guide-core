"use strict";

module.exports = (that, mod, guide) => {

	that.despawn = (event = {}, ent = false, speed = 1.0) => {
		// Make sure id is defined
		if (!event.id) return mod.error("Spawn handler needs a id");

		// Returns if item already despawned
		if (!guide.obj.data.items[event.id]) return;

		// Create timer for specified delay
		that.__delayEvent(() => {
			// Set sub_type to be collection as default for backward compatibility
			const sub_type = event.sub_type || "collection";

			const despawn_event = {
				"gameId": event.id,
				"unk": 0, // used in S_DESPAWN_BUILD_OBJECT
				"collected": false // used in S_DESPAWN_COLLECTION
			};

			// Delete despawned item from the list
			delete guide.obj.data.items[despawn_event.gameId];

			// Despawn item by type
			switch (sub_type) {
				case "collection":
					return mod.toClient("S_DESPAWN_COLLECTION", 2, despawn_event);

				case "item":
					return mod.toClient("S_DESPAWN_DROPITEM", 4, despawn_event);

				case "build_object":
					return mod.toClient("S_DESPAWN_BUILD_OBJECT", 2, despawn_event);

				default:
					return mod.error(`Invalid sub_type for despawn handler: ${event.sub_type}`);
			}
		}, event.delay, speed);
	};
};