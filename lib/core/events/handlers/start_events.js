"use strict";

// Tank class ids(brawler + lancer)
const TANK_CLASS_IDS = [1, 10];
// Dps class ids(not counting warrior)
const DPS_CLASS_IDS = [2, 3, 4, 5, 8, 9, 11, 12];
// Healer class ids
const HEALER_CLASS_IDS = [6, 7];
// Warrior Defence stance abnormality ids
const WARRIOR_TANK_IDS = [100200, 100201];

module.exports = (that, mod, guide) => {

	that.start_events = (events = [], ent = false, speed = 1.0, key = false) => {
		// If event arg specified as object, call the recursion and return
		if (!Array.isArray(events)) {
			if (!events["args"])
				return mod.error("Event handler, called with object needs a args");

			// Set delay for timers
			const delay = parseInt(events["delay"]);

			// Create timer for specified delay
			that.__delayEvent(() => {
				that.start_events(events["args"], ent, speed, key);
			}, delay, speed);

			return;
		}

		// Check ent is defined
		if (!ent) ent = guide.obj.ent;

		// Loop over the events
		Object.keys(events).forEach(entry => {
			const event = Object.assign(events[entry], { "_key": key });

			// The function couldn"t be found, so it"s an invalid type
			if (!that[event["type"]])
				return mod.warn(`An event has invalid type: ${event["type"]}`);

			// If the function is found and it passes the class position check, we start the event
			if (classPositionCheck(event["class_position"])) {
				// Call the handler for event
				that[event["type"]](event, ent, speed, key);
			}
		});
	};

	// Alias function
	that.event = (...args) => {
		that.start_events(...args);
	};

	// Makes sure the event passes the class position check
	const classPositionCheck = (class_position) => {
		const { player, effect } = mod.require.library;

		// if it's not defined we assume that it's for everyone
		if (!class_position) return true;

		// If it's an array
		if (Array.isArray(class_position)) {
			// If one of the class_positions pass, we can accept it
			for (let ent of class_position) {
				if (classPositionCheck(ent)) return true;
			}
			// All class_positions failed, so we return false
			return false;
		}

		switch (class_position) {
			case "tank":
				// if it's a warrior with dstance abnormality
				if (player.job === 0) {
					// Loop thru tank abnormalities
					for (let id of WARRIOR_TANK_IDS) {
						// if we have the tank abnormality return true
						if (effect.hasAbnormality(id)) return true;
					}
				}

				// if it's a tank return true
				if (TANK_CLASS_IDS.includes(player.job)) return true;
				break;

			case "dps":
				// If it's a warrior with dstance abnormality
				if (player.job === 0) {
					// Loop thru tank abnormalities
					for (let id of WARRIOR_TANK_IDS) {
						// if we have the tank abnormality return false
						if (effect.hasAbnormality(id)) return false;
					}
					// warrior didn't have tank abnormality
					return true;
				}

				// if it's a dps return true
				if (DPS_CLASS_IDS.includes(player.job)) return true;
				break;

			case "heal":
				// if it's a healer return true
				if (HEALER_CLASS_IDS.includes(player.job)) return true;
				break;

			case "priest":
				if (player.job === 6) return true; // For Priest specific actions (eg Arise)
				break;

			case "mystic":
				if (player.job === 7) return true; // For Mystic specific actions
				break;

			case "lancer":
				if (player.job === 1) return true; // For Lancer specific actions (eg Blue Shield)
				break;

			default:
				mod.warn(`Failed to find class position: ${class_position}`);
		}

		return false;
	};
};