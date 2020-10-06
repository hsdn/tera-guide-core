"use strict";

module.exports = (that, mod, guide) => {

	that.marker_add = (event = {}, ent = false, speed = 1.0) => {
		// Ignore if streamer mode is enabled or verbose is disabled
		if (mod.settings.stream || !guide.obj.verbose) return;

		// Check ent is defined
		if (!ent) ent = guide.obj.ent;

		// Set gameId
		if (!event["id"]) event["id"] = ent.gameId || false;
		if (!event["id"]) return mod.error("Marker add handler needs a gameId (id)");

		// Set delays for timers
		const delay = parseInt(event["delay"]);
		const sub_delay = parseInt(event["sub_delay"]);

		// Create timer for specified delay
		that.__delayEvent(() => {
			// Clear remove timer if added new marker for existing id
			if (guide.obj.data.markers[event["id"]] && guide.obj.data.markers[event["id"]].timer !== false)
				mod.clearTimeout(guide.obj.data.markers[event["id"]].timer);

			// Create timer for remove a added marker
			const timer = that.__delayEvent(() => {
				that.marker_remove({ "id": event["id"] }, ent, speed);
			}, sub_delay, speed);

			// Add the marker
			guide.obj.data.markers[event["id"]] = {
				"color": event["color"],
				"timer": timer
			};

			// Reset markers by new list
			let targets = [];
			Object.keys(guide.obj.data.markers).forEach(gameId => {
				let color = 0;

				switch (guide.obj.data.markers[gameId].color) {
					case "yellow": color = 1; break;
					case "blue": color = 2; break;
				}

				targets.push({ "target": gameId, "color": color });
			});

			mod.toClient("S_PARTY_MARKER", 1, { "markers": targets });
		}, delay, speed);
	};

	// Alias function
	that.marker = (...args) => {
		that.marker_add(...args);
	};
};