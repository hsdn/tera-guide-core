"use strict";

const os = require("os");
const Powershell = require("./utils/powershell");

class Voice {
	constructor() {
		this.__ps = new Powershell();
	}

	/**
	 * Initialize SpeechSynthesizer.
	 * @memberof Voice
	 */
	init() {
		this.__ps.addCommand("Add-Type -AssemblyName System.speech");
		this.__ps.addCommand("$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer");

		return this.__ps.start().then(() => this.__ps.invoke()
			.catch(error => {
				if (error.name === "PS_CMD_FAIL_ERROR")
					this.__ps.stop();

				throw error;
			})
		);
	}

	/**
	 * Speak text.
	 * @param {*} text Text message to speech.
	 * @param {number} [rate=1] Speech rate.
	 * @param {(string|boolean)} [voice=false] Voice name.
	 * @param {number} [volume=100] Speech volume.
	 * @param {boolean} [async=true] Use SpeakAsync method.
	 * @memberof Voice
	 */
	speak(text, rate = 1, voice = false, volume = 100, async = true) {
		if (rate) this.__ps.addCommand(`$speak.Rate = ${parseInt(rate)}`);
		if (voice) this.__ps.addCommand(`$speak.SelectVoice("${voice}")`);
		if (volume) this.__ps.addCommand(`$speak.Volume = ${parseInt(volume)}`);

		if (async) {
			this.__ps.addCommand("$speak.SpeakAsyncCancelAll()");
			this.__ps.addCommand(`$speak.SpeakAsync('${this.__formatText(text)}')`);
		} else
			this.__ps.addCommand(`$speak.Speak('${this.__formatText(text)}')`);

		return this.__ps.invoke();
	}

	/**
	 * Get list of available voices.
	 * @memberof Voice
	 */
	getVoices() {
		this.__ps.addCommand("$speak.GetInstalledVoices() | Select-Object -ExpandProperty VoiceInfo | Select-Object -Property Culture, Gender, Name");

		return this.__ps.invoke().then(data => {
			const voices = [];

			data.trim().split(os.EOL).forEach(val => {
				const parts = val.replace(/ +/g, " ").trim().split(" ");

				if (!parts[0] || parts[0] === "Culture" || parts[0][0] === "-") return;

				voices.push({
					"culture": parts[0],
					"gender": parts[1].toLowerCase(),
					"name": parts.slice(2).join(" "),
					"lang": parts[0].split("-")[0]
				});
			});

			return voices;
		});
	}

	/**
	 * Close process.
	 * @memberof Voice
	 */
	stop() {
		return this.__ps.stop();
	}

	__formatText(text) {
		const unescapeMap = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#039;": "'", "'": "\\'" };
		const removeChars = ["<-", "->", "<", ">"];

		let formattedText = text.toLowerCase();

		Object.keys(unescapeMap).forEach(key => formattedText = formattedText.replace(new RegExp(key, "g"), unescapeMap[key]));
		removeChars.forEach(val => formattedText = formattedText.replace(new RegExp(val, "g"), " "));

		return formattedText;
	}
}

module.exports = Voice;