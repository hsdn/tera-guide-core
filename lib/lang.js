'use strict';

const path = require("path");

// Default language
const defaultLanguage = "en";

// Supported languages by client
const languages = {
	0: "en",
	1: "kr",
	3: "jp",
	4: "de",
	5: "fr",
	7: "tw",
	8: "ru"
};

class Lang {
	constructor(mod) {
		this.mod = mod;

		// Detected language
		this.language = null;
		this.uclanguage = null;
		this.defaultLanguage = defaultLanguage;

		// Current language strings
		this.strings = {};
	}

	init() {
		const defaultStrings = require("./lang/strings");
		let strings = {};

		try {
			strings = require(path.resolve(this.mod.info.path, "lang", "strings"));
		} catch (e) {}

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
};

module.exports = Lang;