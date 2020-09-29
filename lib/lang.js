'use strict';

const path = require("path");

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

		// Current language strings
		this.strings = {};
	}

	init() {
		const strings = require(path.resolve(this.mod.info.path, "lang", "strings"));

		// Set client language
		if (!this.mod.settings.language || this.mod.settings.language == "auto") {
			this.language = languages[this.mod.game.language] || languages[0];
		} else {
			this.language = this.mod.settings.language.toLowerCase();
		}

		// Set client language in upper case
		this.uclanguage = this.language.toUpperCase();

		// Set language strings
		this.strings = strings.general[this.language] || strings.general["en"];
	}
};

module.exports = Lang;