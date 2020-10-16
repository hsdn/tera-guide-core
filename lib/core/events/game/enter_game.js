"use strict";

/**
 * @typedef {import("../../events").deps} deps
 */

/**
 * Event callback.
 * @param {deps} deps
 */
module.exports = deps => {
	// Set client language
	deps.lang.init();

	// Appy names translation for dungeons configuration
	deps.lang.applyDungeons();

	// Set speech voice
	deps.speech.init();
};