"use strict";

const { exec } = require("child_process");

exports.speak = function(message, rate) {

	const command =
		`${"powershell.exe Add-Type -AssemblyName System.speech; " +
		"$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; " +
		"$speak.Rate = "}${ rate }; ` +
		"[Console]::InputEncoding = [System.Text.Encoding]::UTF8; " +
		"$speak.Speak([Console]::In.ReadToEnd()); " + 
		"exit";

	const format_message = (msg) => {
		const unescape_map = {
			"&amp;": "&",
			"&lt;": "<",
			"&gt;": ">",
			"&quot;": "\"",
			"&#039;": "'"
		};

		msg = msg.toLowerCase();

		for (const [key, value] of Object.entries(unescape_map)) {
			msg = msg.replace(new RegExp(key, "g"), value);
		}

		for (const value of ["<-","->","<",">"]) {
			msg = msg.replace(new RegExp(value, "g"), " ");
		}

		return msg;
	};

	exec(command).stdin.end(format_message(message));
};