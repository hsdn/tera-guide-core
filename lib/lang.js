"use strict";

/**
 * @typedef {import("../index").deps} deps
 */

const childProcess = require("child_process");
const path = require("path");
const Voice = require("./voice");

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
		this.voice = new Voice();

		// Client language
		this.language = null;
		this.uclanguage = null;

		// System language
		this.systemCulture = null;
		this.systemLanguage = null;

		// Degault language
		this.defaultLanguage = defaultLanguage;

		// Default voice
		this.defaultVoice = false;

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

		// Set system language
		this.getSystemCulture((err, data) => {
			if (err) return;

			this.systemCulture = data.trim();
			this.systemLanguage = this.systemCulture.split("-")[0];

			// Set default voice
			this.voice.getInstalledVoices((e, voices) => {
				if (e) return;

				if (this.systemLanguage === defaultLanguage)
					// If the systemLang is the same as defaultLanguage, set the voice of systemLanguage
					voices.forEach(val => {
						if (val.culture === this.systemCulture && val.gender === "Female")
							return this.defaultVoice = val.name;
					});
				else
					// Otherwise, set any voice that matches the defaultLanguage
					voices.forEach(val => {
						if (val.lang == defaultLanguage && val.gender === "Female")
							return this.defaultVoice = val.name;
					});
			});
		});
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

	// Get system culture
	getSystemCulture(callback) {
		childProcess.exec("powershell [CultureInfo]::InstalledUICulture.Name", callback);
	}
}

module.exports = Lang;