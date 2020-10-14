"use strict";

/**
 * @typedef {import("../../index").deps} deps
 */

// Messages colors
global.cr = "</font><font color=\"#ff0000\">"; // red
global.co = "</font><font color=\"#ff7700\">"; // orange
global.cy = "</font><font color=\"#ffff00\">"; // yellow
global.cg = "</font><font color=\"#00ff00\">"; // green
global.cdb = "</font><font color=\"#2727ff\">"; // dark blue
global.cb = "</font><font color=\"#0077ff\">"; // blue
global.cv = "</font><font color=\"#7700ff\">"; // violet
global.cp = "</font><font color=\"#ff00ff\">"; // pink
global.clp = "</font><font color=\"#ff77ff\">"; // light pink
global.clb = "</font><font color=\"#00ffff\">"; // light blue
global.cbl = "</font><font color=\"#000000\">"; // black
global.cgr = "</font><font color=\"#777777\">"; // gray
global.cw = "</font><font color=\"#ffffff\">"; // white

// GUI colors
global.gcr = "#fe6f5e"; // red
global.gcg = "#4de19c"; // green
global.gcy = "#c0b94d"; // yellow
global.gcgr = "#778899"; // gray

class Functions {
	/**
	 * Creates an instance of Functions.
	 * @param {deps} deps
	 * @memberof Functions
	 */
	constructor(deps) {
		this.mod = deps.mod;
		this.params = deps.params;

		// Assign custom colors
		Object.assign(global, this.params.colors.general);
		Object.assign(global, this.params.colors.gui);
	}

	destructor() {
		Object.keys(this.params.colors.general).forEach(key => { delete global[key]; });
		Object.keys(this.params.colors.gui).forEach(key => { delete global[key]; });
	}

	// Makes sure the event passes the class position check
	classPositionCheck(class_position) {
		const { player, effect } = this.mod.require.library;

		// if it's not defined we assume that it's for everyone
		if (!class_position) return true;

		// If it's an array
		if (Array.isArray(class_position)) {
			// If one of the class_positions pass, we can accept it
			for (let ent of class_position) {
				if (this.classPositionCheck(ent)) return true;
			}
			// All class_positions failed, so we return false
			return false;
		}

		switch (class_position) {
			case "tank":
				// if it's a warrior with dstance abnormality
				if (player.job === 0) {
					// Loop thru tank abnormalities
					for (let id of [100200, 100201]) {
						// if we have the tank abnormality return true
						if (effect.hasAbnormality(id)) return true;
					}
				}

				// if it's a tank return true
				if ([1, 10].includes(player.job)) return true;
				break;

			case "dps":
				// If it's a warrior with dstance abnormality
				if (player.job === 0) {
					// Loop thru tank abnormalities
					for (let id of [100200, 100201]) {
						// if we have the tank abnormality return false
						if (effect.hasAbnormality(id)) return false;
					}
					// warrior didn't have tank abnormality
					return true;
				}

				// if it's a dps return true
				if ([2, 3, 4, 5, 8, 9, 11, 12].includes(player.job)) return true;
				break;

			case "heal":
				// if it's a healer return true
				if ([6, 7].includes(player.job)) return true;
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
				this.mod.warn(`Failed to find class position: ${class_position}`);
		}

		return false;
	}

	// Replace special chars with html entities
	escapeHtml(text) {
		let map = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;",
			"'": "&#039;"
		};

		return text.replace(new RegExp("[&<>\"']", "g"), function (key) {
			return map[key];
		});
	}
}

module.exports = Functions;