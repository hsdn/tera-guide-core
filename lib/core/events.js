"use strict";

const path = require("path");

// List of available game events
const gameEvents = [
	"enter_game",
	"me.change_zone",
	"me.resurrect",
	"me.die"
];

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
		this.__deps = deps;
	}

	init() {
		gameEvents.forEach(value => {
			const event = value.split(".");

			// Use the tera-game-state
			let game = this.__deps.mod.game;

			try {
				// Load event callback function from file
				const callback = require(path.resolve(__dirname, "events", "game", ...event));

				// Apply "me" submodule
				if (event[0] === "me")
					game = game.me;

				// Bind event callback function
				game.on(event[event.length - 1], callback.bind(null, this.__deps));
			} catch (e) {
				this.__deps.mod.error(e);
			}
		});
	}
}

module.exports = Events;