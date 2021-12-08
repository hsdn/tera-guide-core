"use strict";

/**
 * @typedef {import("../../index").deps} deps
 */

class Functions {
	/**
	 * Creates an instance of Functions.
	 * @param {deps} deps
	 * @memberof Functions
	 */
	constructor(deps) {
		this.__deps = deps;
	}

	/**
	 * Сlass position check.
	 * @param {(string|string[])} class_position String or array of game classes.
	 * @return {boolean} True if the player position matches of specified game class.
	 * @memberof Functions
	 */
	classPositionCheck(class_position) {
		const { player, effect } = this.__deps.mod.require.library;

		// if it's not defined we assume that it's for everyone
		if (!class_position) return true;

		// If it's an array
		if (Array.isArray(class_position)) {
			// If one of the class_positions pass, we can accept it
			for (const ent of class_position)
				if (this.classPositionCheck(ent)) return true;

			// All class_positions failed, so we return false
			return false;
		}

		switch (class_position) {
			case "tank":
				// if it's a warrior with dstance abnormality
				if (player.job === 0) {
					// Loop thru tank abnormalities
					for (const id of [100200, 100201])
						// if we have the tank abnormality return true
						if (effect.hasAbnormality(id)) return true;
				}

				// if it's a tank return true
				if ([1, 10].includes(player.job)) return true;
				break;

			case "dps":
				// If it's a warrior with dstance abnormality
				if (player.job === 0) {
					// Loop thru tank abnormalities
					for (const id of [100200, 100201])
						// if we have the tank abnormality return false
						if (effect.hasAbnormality(id)) return false;

					// warrior didn't have tank abnormality
					return true;
				}

				// if it's a dps return true
				if ([2, 3, 4, 5, 8, 9, 11, 12].includes(player.job)) return true;
				break;

			case "heal":
				// if it's a healer return true
				if ([6, 7].includes(player.job)) return true;
				break;

			case "priest":
				if (player.job === 6) return true; // For Priest specific actions (eg Arise)
				break;

			case "mystic":
				if (player.job === 7) return true; // For Mystic specific actions
				break;

			case "lancer":
				if (player.job === 1) return true; // For Lancer specific actions (eg Blue Shield)
				break;

			default:
				this.__deps.mod.warn(`Failed to find class position: ${class_position}`);
		}

		return false;
	}

	/**
	 * Format text of message.
	 * @param {string} message Message text string to format.
	 * @return {string} Formatted message text string.
	 * @memberof Functions
	 */
	formatMessage(message) {
		return this.formatTags(this.escapeHtml(message));
	}

	/**
	 * Format special tags in text.
	 * @param {string} message Text string to format.
	 * @return {string} Formatted text string.
	 * @memberof Functions
	 */
	formatTags(text) {
		return text
			.replace(new RegExp("\\[c=([^\\]]+)\\]", "g"), "<font color='$1'>")
			.replace(new RegExp("\\[/c\\]", "g"), "</font>");
	}

	/**
	 * Strip html tags from the text.
	 * @param {string} message Text string to format.
	 * @return {string} Formatted text string.
	 * @memberof Functions
	 */
	stripTags(text) {
		return text.replace(/<\/?[^>]+>/gi, "");
	}

	/**
	 * Replace special chars with html entities.
	 * @param {string} text Text string to format.
	 * @return {string} Formatted text string.
	 * @memberof Functions
	 */
	escapeHtml(text) {
		const map = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;",
			"'": "&#039;"
		};

		return text.replace(new RegExp("[&<>\"']", "g"), key => map[key]);
	}
}

module.exports = Functions;