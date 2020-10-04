"use strict";

class Events {

	constructor(deps) {
		const { mod, lang, guide } = deps;

		mod.game.initialize("me");

		// Enter the game
		mod.game.on("enter_game", () => {
			lang.init();
			guide.init();
		});

		// Change zone
		mod.game.me.on("change_zone", (zone) => {
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