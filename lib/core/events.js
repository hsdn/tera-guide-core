"use strict";

/**
 * @typedef {import("../../index").deps} deps
 */

class Events {
	/**
	 * Creates an instance of Events.
	 * @param {deps} deps
	 * @memberof Events
	 */
	constructor(deps) {
		const { mod, lang, guide } = deps;

		mod.game.initialize("me");

		// Enter the game
		mod.game.on("enter_game", () => {
			// Set client language
			lang.init();

			// Appy names translation for dungeons configuration
			lang.applyDungeons();
		});

		// Change zone
		mod.game.me.on("change_zone", zone => {
			guide.load(zone);
		});

		// Exit the game
		mod.game.on("leave_game", () => {
			mod.clearAllTimeouts();
			mod.clearAllIntervals();
		});
	}
}

module.exports = Events;