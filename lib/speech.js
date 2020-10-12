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
		this.defaultVoice = false;
		this.preferVoice = false;
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

			let gender = this.mod.settings.speech.gender || defaultGender;

			gender = gender.toLowerCase();
			gender = gender.charAt(0).toUpperCase() + gender.slice(1);

			// Set default voice
			if (this.systemLanguage === this.lang.defaultLanguage)
				// If the systemLanguage is the same as defaultLanguage, set the voice of systemLanguage
				voices.forEach(val => {
					if (val.culture === this.lang.systemCulture && val.gender === gender)
						return this.defaultVoice = val.name;
				});
			else
				// Otherwise, set any voice that matches the defaultLanguage
				voices.forEach(val => {
					if (val.lang == this.lang.defaultLanguage && val.gender === gender)
						return this.defaultVoice = val.name;
				});

			// Set prefer voice
			voices.forEach(val => {
				if (val.culture == this.lang.systemCulture && val.gender === gender)
					return this.preferVoice = val.name;
			});
		});
	}

	// Play speech
	play(message) {
		const rate = Math.min(this.mod.settings.speech.rate || 1, 10);
		const volume = Math.min(this.mod.settings.speech.volume || 100, 100);
		const voice = this.lang.language === this.lang.defaultLanguage ? this.defaultVoice : this.preferVoice;

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