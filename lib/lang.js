"use strict";

const exec = require("child_process").exec;
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

/**
 * @typedef {import("../index").deps} deps
 */

class Lang {
	/**
	 * Creates an instance of Lang.
	 * @param {deps} deps
	 * @memberof Lang
	 */
	constructor(deps) {
		this.__mod = deps.mod;

		// Degault language
		this.defaultLanguage = defaultLanguage;

		// Client language
		this.language = null;
		this.languageUC = null;

		// System language
		this.systemCulture = null;
		this.systemLanguage = null;

		// Current language strings
		this.strings = {};
	}

	/**
	 * Initialize language params.
	 * @memberof Lang
	 */
	init() {
		const defaultStrings = require("./lang/strings");
		let strings = {};

		try {
			strings = require(path.resolve(this.__mod.info.path, "lang", "strings"));
		} catch (e) {
			// continue regardless of error
		}

		// Correct case
		this.__mod.settings.language = this.__mod.settings.language.toLowerCase();

		// Set client language
		if (!this.__mod.settings.language || this.__mod.settings.language == "auto")
			this.language = languages[this.__mod.game.language] || languages["0"];
		else
			this.language = this.__mod.settings.language;

		// Set client language in upper case
		this.languageUC = this.language.toUpperCase();

		// Set language strings
		if (strings.general !== undefined) {
			// Assign default language strings
			if (strings.general[defaultLanguage])
				strings.general[defaultLanguage] = { ...defaultStrings.general[defaultLanguage], ...strings.general[defaultLanguage] };

			// Assign translated strings by language
			if (strings.general[this.language])
				strings.general[this.language] = { ...defaultStrings.general[defaultLanguage], ...strings.general[this.language] };

			this.strings = strings.general[this.language] || strings.general[defaultLanguage];
		} else
			this.strings = defaultStrings.general[defaultLanguage];

		// Set system language
		this.__getSystemCulture((e, data) => {
			if (e) return;

			this.systemCulture = data.trim();
			this.systemLanguage = this.systemCulture.split("-")[0];
		});
	}

	/**
	 * Apply translation for dungeons list.
	 * @memberof Lang
	 */
	applyDungeons() {
		const defaultStrings = require("./lang/dungeons");
		let strings = {};

		try {
			strings = require(path.resolve(this.__mod.info.path, "lang", "dungeons"));
		} catch (e) {
			// continue regardless of error
		}

		// Apply translation
		Object.keys(this.__mod.settings.dungeons).forEach(zoneId => {
			// Read default strings
			if(defaultStrings[zoneId])
				this.__mod.settings.dungeons[zoneId].name = defaultStrings[zoneId][this.language] || defaultStrings[zoneId][this.defaultLanguage];

			// Read custom strings
			if(strings[zoneId] && strings[zoneId][this.language])
				this.__mod.settings.dungeons[zoneId].name = strings[zoneId][this.language];
		});
	}

	__getSystemCulture(callback) {
		exec("powershell [CultureInfo]::InstalledUICulture.Name", callback);
	}
}

module.exports = Lang;