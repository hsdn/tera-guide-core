"use strict";

const Voice = require("./voice");

// Default voice gender
const defaultGender = "female";

/**
 * @typedef {import("../index").deps} deps
 */

class Speech {
	/**
	 * Creates an instance of Speech.
	 * @param {deps} deps
	 * @memberof Speech
	 */
	constructor(deps) {
		this.__mod = deps.mod;
		this.__lang = deps.lang;
		this.__voice = new Voice();

		// Selected voices settings
		this.selectedVoices = {};

		// List of installed voices
		this.installedVoices = [];

		// Migrate settings (compat)
		this.__migrateSettings();
	}

	/**
	 * Initialize speech params.
	 * @memberof Speech
	 */
	init() {
		this.selectedVoices = { "male": false, "female": false };

		// Set speech voices
		this.__voice.init()
			.then(() => this.__voice.getVoices())
			.then(voices => {
				if (this.__lang.language === this.__lang.systemLanguage)
					voices.forEach(val => {
						// If the game language is the same as system language, set the voices of system culture
						if (val.culture === this.__lang.systemCulture)
							return this.selectedVoices[val.gender.toLowerCase()] = val.name;
					});
				else
					voices.forEach(val => {
						// Otherwise, set any voice that matches the game language
						if (val.lang === this.__lang.language)
							return this.selectedVoices[val.gender.toLowerCase()] = val.name;
					});

				// Set list of installed voices
				this.installedVoices = voices;
			})
			.catch(() => {
				// continue regardless of error
			});
	}

	/**
	 * Play speech.
	 * @param {string} message
	 * @memberof Speech
	 */
	play(message) {
		// Select params
		const rate = Math.min(this.__mod.settings.speech.rate || 1, 10);
		const volume = Math.min(this.__mod.settings.speech.volume || 100, 100);
		const gender = (this.__mod.settings.speech.gender || defaultGender).toLowerCase();

		// Select the voice
		let voice = this.selectedVoices[gender];

		// Check available genders
		if (!voice && gender === "male") voice = this.selectedVoices.female;
		if (!voice && gender === "female") voice = this.selectedVoices.male;

		// Speak the message
		this.__voice.init()
			.then(() => this.__voice.speak(message, rate, voice, volume))
			.catch(() => {
				// continue regardless of error
			});
	}

	/**
	 * Stop speech.
	 * @memberof Speech
	 */
	stop() {
		this.__voice.stop();
	}

	__migrateSettings() {
		if (!this.__mod.settings.speech) {
			this.__mod.settings.speech = {
				"enabled": this.__mod.settings.speaks || true,
				"rate": parseInt(this.__mod.settings.rate || 1),
				"volume": 100,
				"gender": defaultGender
			};

			delete this.__mod.settings.speaks;
			delete this.__mod.settings.rate;
		}
	}

	destructor() {
		this.stop();
	}
}

module.exports = Speech;