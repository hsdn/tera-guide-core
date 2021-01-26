"use strict";

/**
 * @typedef {import("../../handlers").deps} deps
 * @typedef {import("../../handlers").data} data
 */

/**
 * @param {deps} deps
 * @param {data} data
 * @param {Object} event
 */
module.exports.text = (deps, data, event) => {
	// Fetch the message
	const message = deps.lang.getEventText(event);

	// Make sure sub_type is defined
	if (!event.sub_type) return deps.mod.error("Text handler needs a sub_type");

	// Make sure message is defined
	if (!message) return deps.mod.error("Text handler needs a message");

	// Set voice param if undefined
	if (event.speech === undefined) event.speech = true;

	// Play the voice for specified types
	if (["message", "alert", "warning", "notification", "speech"].includes(event.sub_type)) {
		// Ignoring if verbose mode is disabled
		if (deps.zone.loaded && !deps.zone.settings.verbose) return;

		// Play the voice of text message
		if (event.speech)
			deps.handlers.send.voice(message);

		// Ignoring sending a text message if "speech" sub_type specified
		if (event.sub_type === "speech") return;
	}

	switch (event.sub_type) {
		// Basic message green
		case "message":
			return deps.handlers.send.message(message);

		// Alert message red
		case "alert":
			return deps.handlers.send.alert(message, cr, spr);

		// Alert message blue
		case "warning":
			return deps.handlers.send.alert(message, clb, spb);

		// Notification message
		case "notification":
			return deps.handlers.send.notification(message);

		// Default message (proxy channel)
		default:
			return deps.handlers.send.proxy(message, event.sub_type);
	}
};