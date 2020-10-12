/* eslint-disable no-param-reassign */
/* Copyright (c) 2010 Marak Squires http://github.com/marak/say.js/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

"use strict";

const childProcess = require("child_process");
const COMMAND = "powershell";

class Voice {
	constructor () {
		this.child = null;
	}

	speak(text, speed, volume, voice, callback) {
		if (typeof callback !== "function") {
			callback = () => {
				// nothing there
			};
		}

		if (!text)
			return setImmediate(() => {
				callback(new TypeError("Voice.speak(): must provide text parameter"));
			});

		let args = [];
		let pipedData = "";
		let options = {};

		let psCommand = "Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;";

		if (voice)
			psCommand += `$speak.SelectVoice('${voice}');`;

		if (volume)
			psCommand += `$speak.Volume = ${volume};`;

		if (speed)
			psCommand += `$speak.Rate = ${speed};`;

		psCommand += "[Console]::InputEncoding = [System.Text.Encoding]::UTF8;";
		psCommand += "$speak.Speak([Console]::In.ReadToEnd())";

		args.push(psCommand);
		options.shell = true;

		this.child = childProcess.spawn(COMMAND, args, options);

		this.child.stdin.setEncoding("utf8");
		this.child.stderr.setEncoding("utf8");

		pipedData += this.formatText(text);

		if (pipedData)
			this.child.stdin.end(pipedData);

		this.child.stderr.once("data", data => {
			// we can't stop execution from this function
			callback(new Error(data));
		});

		this.child.addListener("exit", (code, signal) => {
			if (code === null || signal !== null)
				return callback(new Error(`Voice.speak(): could not talk, had an error [code: ${code}] [signal: ${signal}]`));

			this.child = null;

			callback(null);
		});
	}

	stop(callback) {
		if (typeof callback !== "function")
			callback = () => {
				// nothing there
			};

		if (!this.child)
			return setImmediate(() => {
				callback(new Error("Voice.stop(): no speech to kill"));
			});

		this.child.stdin.pause();
		childProcess.exec(`taskkill /pid ${this.child.pid} /T /F`);

		this.child = null;
		callback(null);
	}

	getInstalledVoices(callback) {
		if (typeof callback !== "function")
			callback = () => {
				// nothing there
			};

		let args = [];
		let psCommand = "Add-Type -AssemblyName System.speech;$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;";

		psCommand += "$speak.GetInstalledVoices() | Select-Object -ExpandProperty VoiceInfo | Select-Object -Property Culture, Gender, Name";

		args.push(psCommand);

		let voices = [];
		this.child = childProcess.spawn(COMMAND, args);

		this.child.stdin.setEncoding("utf8");
		this.child.stderr.setEncoding("utf8");

		this.child.stderr.once("data", data => {
			// we can't stop execution from this function
			callback(new Error(data));
		});

		this.child.stdout.on("data", data => {
			voices += data;
		});

		this.child.addListener("exit", (code, signal) => {
			if (code === null || signal !== null)
				return callback(new Error(`Voice.getInstalledVoices(): could not get installed voices, had an error [code: ${code}] [signal: ${signal}]`));

			let voicesArray = [];

			if (voices.length > 0) {
				voices.split("\r\n").forEach(val => {
					val = val.replace(/ +/g, " ").trim().split(" ");

					if (!val[0] || val[0] === "Culture" || val[0][0] === "-") return;

					voicesArray.push({
						"culture": val[0],
						"gender": val[1],
						"name": val.slice(2).join(" "),
						"lang": val[0].split("-")[0]
					});
				});
			}

			this.child = null;
			callback(null, voicesArray);
		});

		this.child.stdin.end();
	}

	formatText(text) {
		const unescapeMap = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#039;": "'" };
		const removeChars = ["<-", "->", "<", ">"];

		let formattedText = text.toLowerCase();

		Object.keys(unescapeMap).forEach(key => {
			formattedText = formattedText.replace(new RegExp(key, "g"), unescapeMap[key]);
		});

		removeChars.forEach(val => {
			formattedText = formattedText.replace(new RegExp(val, "g"), " ");
		});

		return formattedText;
	}
}

module.exports = Voice;