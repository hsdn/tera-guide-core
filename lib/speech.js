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

		// Selected voices settings
		this.selectedVoices = {};

		// List of installed voices
		this.installedVoices = [];

		// Migrate settings (compat)
		this.migrateSettings();
	}

	// Initialize
	init() {
		this.selectedVoices = { "male": false, "female": false };

		// Set speech voices
		this.voice.getInstalledVoices((e, voices) => {
			if (e) return;

			// Set prefer voices
			if (this.lang.language === this.lang.systemLanguage)
				voices.forEach(val => {
					// If the game language is the same as system language, set the voices of system culture
					if (val.culture === this.lang.systemCulture)
						return this.selectedVoices[val.gender.toLowerCase()] = val.name;
				});
			else
				voices.forEach(val => {
					// Otherwise, set any voice that matches the game language
					if (val.lang === this.lang.language)
						return this.selectedVoices[val.gender.toLowerCase()] = val.name;
				});

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
		let voice = this.selectedVoices[gender];

		// Check available genders
		if (!voice && gender === "male") voice = this.selectedVoices.female;
		if (!voice && gender === "female") voice = this.selectedVoices.male;

		this.voice.speak(message, rate, volume, voice, e => {
			if (e) return this.mod.warn(e);
		});
	}

	// Stop speech
	stop() {
		this.voice.stop();
	}

	// Migrate settings
	migrateSettings() {
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
	}

	destructor() {
		this.stop();
	}
}

module.exports = Speech;