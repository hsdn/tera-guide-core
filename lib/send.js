"use strict";

global.spt = 31; // text notice
global.spg = 42; // green message
global.spb = 43; // blue message
global.spr = 44; // red message
global.spi = 66; // blue info message
global.spn = 49; // left side notice

/**
 * @typedef {import("../index").deps} deps
 */

class Send {
	/**
	 * Creates an instance of Send.
	 * @param {deps} deps
	 * @memberof Send
	 */
	constructor(deps) {
		this.__deps = deps;
	}

	/**
	 * Basic message.
	 * @param {string} message Message text to send.
	 * @memberof Send
	 */
	message(message) {
		// If streamer mode is enabled send message to the proxy-channel
		if (this.__deps.mod.settings.stream)
			return this.__deps.mod.command.message(this.__deps.mod.settings.cc + this.__deps.functions.escapeHtml(message));

		let sending_event = {
			"message": this.__deps.mod.settings.cc + this.__deps.functions.escapeHtml(message)
		};

		if (this.__deps.params.chat_name)
			Object.assign(sending_event, { "name": this.__deps.params.chat_name });

		if (this.__deps.mod.settings.lNotice)
			// Send message as a Team leader notification
			this.__deps.mod.send(...this.__deps.proto.getData("S_CHAT"), { ...sending_event, "channel": 21 });
		else
			// Send message as a green colored Dungeon Event
			this.dungeonEvent(message, this.__deps.mod.settings.cc, spg);

		// Send message to party chat if gNotice is enabled
		if (this.__deps.mod.settings.gNotice)
			this.__deps.mod.send(...this.__deps.proto.getData("S_CHAT"), { ...sending_event, "channel": 1 });
	}

	/**
	 * Notification message.
	 * @param {string} message Message text to send.
	 * @memberof Send
	 */
	notification(message) {
		// If streamer mode is enabled send message to the proxy-channel
		if (this.__deps.mod.settings.stream)
			return this.__deps.mod.command.message(`${clb}[Notice] ${this.__deps.mod.settings.cc}${this.__deps.functions.escapeHtml(message)}`);

		let sending_event = {
			"message": this.__deps.functions.escapeHtml(message)
		};

		if (this.__deps.params.chat_name)
			Object.assign(sending_event, { "name": this.__deps.params.chat_name });

		// Send message as a Raid leader notification
		this.__deps.mod.send(...this.__deps.proto.getData("S_CHAT"), { ...sending_event, "channel": 25 });

		// Send message to party chat if gNotice is enabled
		if (this.__deps.mod.settings.gNotice)
			this.__deps.mod.send(...this.__deps.proto.getData("S_CHAT"), { ...sending_event, "channel": 1 });
	}

	/**
	 * Alert message.
	 * @param {string} message Message text to send.
	 * @param {string} cc Color tag for colorize the message text.
	 * @param {string} spc Type of Dungeon Event message.
	 * @memberof Send
	 */
	alert(message, cc, spc) {
		// If streamer mode is enabled send message to the proxy-channel
		if (this.__deps.mod.settings.stream)
			return this.__deps.mod.command.message(`${cc}[Alert] ${this.__deps.mod.settings.cc}${this.__deps.functions.escapeHtml(message)}`);

		let sending_event = {
			"message": this.__deps.functions.escapeHtml(message)
		};

		if (this.__deps.params.chat_name)
			Object.assign(sending_event, { "name": this.__deps.params.chat_name });

		if (this.__deps.mod.settings.lNotice) {
			// Send message as a Raid leader notification
			this.__deps.mod.send(...this.__deps.proto.getData("S_CHAT"), { ...sending_event, "channel": 25 });
		} else
			// Send message as a color-specified Dungeon Event
			this.dungeonEvent(message, this.__deps.mod.settings.cc, spc);

		// Send message to party if gNotice or gAlert is enabled
		if (this.__deps.mod.settings.gNotice) {
			this.__deps.mod.send(...this.__deps.proto.getData("S_CHAT"), { ...sending_event, "channel": 1 });
		}
	}

	/**
	 * Dungeon Event message.
	 * @param {string} message Message text to send.
	 * @param {string} spcc Color tag for colorize the message text.
	 * @param {string} type Type of Dungeon Event message.
	 * @memberof Send
	 */
	dungeonEvent(message, spcc, type) {
		// If streamer mode is enabled send message to the proxy-channel
		if (this.__deps.mod.settings.stream)
			return this.__deps.mod.command.message(spcc + this.__deps.functions.escapeHtml(message));

		// Send a color-specified Dungeon Event message
		this.__deps.mod.send(...this.__deps.proto.getData("S_DUNGEON_EVENT_MESSAGE"), {
			"type": type,
			"chat": 0,
			"channel": 27,
			"message": spcc + this.__deps.functions.escapeHtml(message)
		});
	}

	/**
	 * Proxy message.
	 * @param {string} message Message text to send.
	 * @param {string} type Type of message to send.
	 * @memberof Send
	 */
	proxy(message, type) {
		// Get color code from type string
		const color_code = type.toLowerCase().replace(/msg$/, "");

		// Color-specified proxy-channel messages
		if (global[color_code])
			return this.__deps.mod.command.message(global[color_code] + message);

		switch (type.toLowerCase()) {
			// Debug or test message to the proxy-channel and log console
			case "msg":
				this.__deps.mod.command.message(cp + message);
				console.log(cp + message);
				break;

			// Default color proxy-channel message
			case "prmsg":
			default:
				this.__deps.mod.command.message(this.__deps.mod.settings.cc + message);
		}
	}

	/**
	 * Debug message.
	 * @param {boolean} enabled Enable sending.
	 * @param {*} args Arguments to string.
	 * @memberof Send
	 */
	debug(enabled, ...args) {
		if (!enabled) return;

		if (this.__deps.mod.settings.debug.chat)
			this.__deps.mod.command.message(cgr + args.toString());

		console.log("[Guide]", ...args);
	}

	/**
	 * Play voice message
	 * @param {string} message Message text to generate and play speech.
	 * @param {boolean} [enabled=false] Force enable speech playing.
	 * @memberof Send
	 */
	voice(message, enabled = false) {
		if (!this.__deps.mod.settings.speech.enabled && !this.__deps.mod.settings.speaks && !enabled) return;

		this.__deps.speech.play(message);
	}
}

module.exports = Send;