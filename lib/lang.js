"use strict";

/**
 * @typedef {import("../index").deps} deps
 */

const path = require("path");

// Default language
const defaultLanguage = "en";

// Supported languages by client
const languages = {
	"0": "en",
	"1": "kr",
	"3": "jp",
	"4": "de",
	"5": "fr",
	"7": "tw",
	"8": "ru"
};

class Lang {
	/**
	 * Creates an instance of Lang.
	 * @param {deps} deps
	 * @memberof Lang
	 */
	constructor(deps) {
		this.mod = deps.mod;

		// Detected language
		this.language = null;
		this.uclanguage = null;
		this.defaultLanguage = defaultLanguage;

		// Current language strings
		this.strings = {};
	}

	// Initialize language params
	init() {
		const defaultStrings = require("./lang/strings");
		let strings = {};

		try {
			strings = require(path.resolve(this.mod.info.path, "lang", "strings"));
		} catch (e) {
			// continue regardless of error
		}

		// Assign default strings
		if (strings.general[defaultLanguage])
			Object.assign(defaultStrings.general[defaultLanguage], strings.general[defaultLanguage]);

		strings.general[defaultLanguage] = defaultStrings.general[defaultLanguage];

		// Set client language
		if (!this.mod.settings.language || this.mod.settings.language == "auto")
			this.language = languages[this.mod.game.language] || languages[0];
		else
			this.language = this.mod.settings.language.toLowerCase();

		// Set client language in upper case
		this.uclanguage = this.language.toUpperCase();

		// Assign translated strings by language
		if (strings.general[this.language])
			Object.assign(defaultStrings.general[defaultLanguage], strings.general[this.language]);

		// Set language strings
		this.strings = defaultStrings.general[defaultLanguage];
	}

	// Apply translation for dungeons list
	applyDungeons() {
		const defaultStrings = require("./lang/dungeons");
		let strings = {};

		try {
			strings = require(path.resolve(this.mod.info.path, "lang", "dungeons"));
		} catch (e) {
			// continue regardless of error
		}

		// Apply translation
		Object.keys(this.mod.settings.dungeons).forEach(zoneId => {
			// Read default strings
			if(defaultStrings[zoneId])
				this.mod.settings.dungeons[zoneId].name = defaultStrings[zoneId][this.language] || defaultStrings[zoneId][this.defaultLanguage];

			// Read custom strings
			if(strings[zoneId] && strings[zoneId][this.language])
				this.mod.settings.dungeons[zoneId].name = strings[zoneId][this.language];
		});
	}
}

module.exports = Lang;