"use strict";

/**
 * @typedef {import("../../events").deps} deps
 */

/**
 * @param {deps} deps
 */
module.exports = deps => {
	// Set client language
	deps.lang.init();

	// Apply translation for strings
	deps.lang.applyStrings();

	// Appy names translation for dungeons configuration
	deps.lang.applyDungeons();

	// Set speech voice
	deps.speech.init();
};