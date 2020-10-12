"use strict";

/**
 * @typedef {import("../index").deps} deps
 */

const Voice = require("./voice");

// Default voice gender
const defaultGender = "female";


class Speech {
	/**
	 * Creates an instance of Speech.
	 * @param {deps} deps
	 * @memberof Speech
	 */
	constructor(deps) {
		this.mod = deps.mod;
		this.lang = deps.lang;

		this.voice = new Voice();

		// Speech settings
		this.defaultVoices = {};
		this.preferVoices = {};

		// List of installed voices
		this.installedVoices = [];
	}

	// Initialize
	init() {
		// Migrate settings (compat)
		if (!this.mod.settings.speech) {
			this.mod.settings.speech = {
				"enabled": this.mod.settings.speaks || true,
				"rate": parseInt(this.mod.settings.rate || 1),
				"volume": 100,
				"gender": defaultGender
			};

			delete this.mod.settings.speaks;
			delete this.mod.settings.rate;
		}

		// Set speech voices
		this.voice.getInstalledVoices((e, voices) => {
			if (e) return;

			this.defaultVoices = { "male": false, "female": false };
			this.preferVoices = { "male": false, "female": false };

			// Set default voices
			if (this.lang.defaultLanguage === this.lang.systemLanguage)
				// If the default language is the same as system language, set the voice of system culture
				voices.forEach(val => {
					if (val.culture === this.lang.systemCulture)
						return this.defaultVoices[val.gender.toLowerCase()] = val.name;
				});
			else
				// Otherwise, set any voice that matches the default language
				voices.forEach(val => {
					if (val.lang === this.lang.defaultLanguage)
						return this.defaultVoices[val.gender.toLowerCase()] = val.name;
				});

			// Set prefer voices
			if (this.lang.language === this.lang.systemLanguage)
				// If the game language is the same as system language, set the voice of system culture
				voices.forEach(val => {
					if (val.culture === this.lang.systemCulture)
						return this.preferVoices[val.gender.toLowerCase()] = val.name;
				});
			else
				// Otherwise, set any voice that matches the game language
				voices.forEach(val => {
					if (val.lang === this.lang.language)
						return this.preferVoices[val.gender.toLowerCase()] = val.name;
				});

			if (this.preferVoices.male === false && this.preferVoices.female === false)
				this.preferVoices = this.defaultVoices;

			// Set list of installed voices
			this.installedVoices = voices;
		});
	}

	// Play speech
	play(message) {
		// Select params
		const rate = Math.min(this.mod.settings.speech.rate || 1, 10);
		const volume = Math.min(this.mod.settings.speech.volume || 100, 100);
		const gender = (this.mod.settings.speech.gender || defaultGender).toLowerCase();

		// Select the voice
		let voice = this.preferVoices[gender];

		// Check available genders
		if (!voice && gender === "male") voice = this.preferVoices.female;
		if (!voice && gender === "female") voice = this.preferVoices.male;

		this.voice.speak(message, rate, volume, voice, e => {
			if (e) return this.mod.warn(e);
		});
	}

	// Stop speech
	stop() {
		this.voice.stop();
	}

	destructor() {
		this.stop();
	}
}

module.exports = Speech;