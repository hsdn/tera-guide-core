"use strict";

/**
 * @typedef {import("../../handlers")} handlers
 * @typedef {import("../../handlers").deps} deps
 */

/**
 * Exports.
 * @param {handlers} that
 * @param {deps} deps
 */
module.exports = (that, deps) => {

	that.text = (event = {}, ent = false, speed = 1.0) => {
		// Fetch the message
		const message = 
			event[`message_${deps.lang.languageUC}`] || event[`message_${deps.lang.language}`] || event["message"] ||
			event[`text_${deps.lang.languageUC}`] || event[`text_${deps.lang.language}`] || event["text"];

		// Make sure sub_type is defined
		if (!event.sub_type) return deps.mod.error("Text handler needs a sub_type");

		// Make sure message is defined
		if (!message) return deps.mod.error("Text handler needs a message");

		// Set voice param if undefined
		if (event.speech === undefined) event.speech = true;

		// Play the voice for specified types
		if (["message", "alert", "warning", "notification", "speech"].includes(event.sub_type)) {
			// Ignoring if verbose mode is disabled
			if (!deps.guide.obj.verbose) return;
	
			// Play the voice of text message
			if (event.speech)
				that.delay(() => { that.send.voice(message); }, event.delay, speed);

			// Ignoring sending a text message if "speech" sub_type specified
			if (event.sub_type == "speech") return;
		}

		// Create timer for specified delay
		that.delay(() => {
			switch (event.sub_type) {
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
					return that.send.proxy(message, event.sub_type);
			}
		}, event.delay, speed);
	};
};