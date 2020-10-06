"use strict";

const voice = require("../../../voice");

module.exports = (that, mod, guide) => {

	that.text = (event = {}, ent = false, speed = 1.0) => {
		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Fetch the message
		const message = event[`message_${guide.lang.uclanguage}`] || event[`message_${guide.lang.language}`] || event["message"];

		// Make sure sub_type is defined
		if (!event["sub_type"]) return mod.error("Text handler needs a sub_type");

		// Make sure message is defined
		if (!message) return mod.error("Text handler needs a message");

		// Play the voice for specified types
		if (["message", "alert", "warning", "notification", "speech"].includes(event["sub_type"])) {
			// Ignoring if verbose mode is disabled
			if (!guide.obj.verbose) return;

			// Play the voice of text message
			if (voice && mod.settings.speaks)
				that.__delayEvent(() => { voice.speak(message, mod.settings.rate); }, delay - 600, speed);

			// Ignoring sending a text message if "speech" sub_type specified
			if (event["sub_type"] == "speech") return;
		}

		// Create timer for specified delay
		that.__delayEvent(() => {
			switch (event["sub_type"]) {
				// Basic message green
				case "message":
					return that.send.message(message);

				// Alert message red
				case "alert":
					return that.send.alert(message, cr, spr);

				// Alert message blue
				case "warning":
					return that.send.alert(message, clb, spb);

				// Notification message
				case "notification":
					return that.send.notification(message);

				// Default message (proxy channel)
				default:
					return that.send.proxy(message, event["sub_type"]);
			}
		}, delay, speed);
	};
};