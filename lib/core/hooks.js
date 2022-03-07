"use strict";

const path = require("path");

// Hook settings
const HOOK_SETTINGS = Object.freeze({
	"LAST": { "order": 10000, "filter": { "fake": false, "modified": null } },
	"FIRST": { "order": -10000, "filter": { "fake": false } }
});

// Configuration of hooks
const hooks = Object.freeze({
	"S_ACTION_STAGE": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["s"]
	},
	"S_ACTION_END": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["e"]
	},
	"S_ABNORMALITY_BEGIN": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["am", "ae", "ab", "ap", "af", "ar", "ad", "at"]
	},
	"S_ABNORMALITY_REFRESH": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["ae", "ab", "ar", "ad", "at"]
	},
	"S_ABNORMALITY_END": {
		"settings": HOOK_SETTINGS.FIRST,
		"keys": ["ar", "ad", "at"]
	},
	"S_BOSS_GAGE_INFO": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["h"]
	},
	"S_SPAWN_NPC": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["ns"]
	},
	"S_DESPAWN_NPC": {
		"settings": HOOK_SETTINGS.FIRST,
		"keys": ["nd"]
	},
	"S_DUNGEON_EVENT_MESSAGE": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["dm"]
	},
	"S_NPC_STATUS": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["rb", "re"]
	},
	"S_QUEST_BALLOON": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["qb"]
	}
});

/**
 * @typedef {import("../../index").deps} deps
 * @typedef {import("./guide")} guide
 */

class Hooks {
	/**
	 * Creates an instance of Hooks.
	 * @param {deps} deps
	 * @param {guide} guide
	 * @memberof Hooks
	 */
	constructor(deps, guide) {
		this.__deps = deps;
		this.__guide = guide;

		// List of loaded hooks
		this.__list = new Map();
	}

	/**
	 * Load all specified hooks.
	 * @param {string[]} keys Array of keys for loading the hooks.
	 * @param {boolean} [debugMode=false] Force enable debug messages.
	 * @memberof Hooks
	 */
	load(keys, debugMode = false) {
		// Search the hook by presented keys
		Object.keys(hooks).forEach(name => {
			const entry = hooks[name];

			entry.keys.forEach(key => {
				// Set debug default value
				if (!this.__deps.mod.settings.debug[key])
					this.__deps.mod.settings.debug[key] = false;

				// Get debug value for affected entry
				const debug = this.__deps.mod.settings.debug.all || this.__deps.mod.settings.debug[key];

				// Return if hook already added or not exists in list of keys and debug is false
				if (this.__list.has(name) || (!keys.includes(key) && !debug)) return;

				try {
					// Load hook from file
					const loaded = require(path.resolve(__dirname, "events", "hooks", name));

					// Add hook
					this.__list.set(name, {
						"keys": entry.keys,
						"debug": loaded.debug,
						"hook": this.__deps.mod.hook(...this.__deps.proto.getData(name), entry.settings, event => {
							loaded.callback(this.__deps, this.__guide, event);
						})
					});

					this.__deps.handlers.send.debug(debugMode, `Add hook: ${loaded.debug.name}`);
				} catch (e) {
					this.__deps.mod.error(e);
				}
			});
		});
	}

	/**
	 * Unhook all loaded hooks.
	 * @param {boolean} [debugMode=false] Force enable debug messages.
	 * @memberof Hooks
	 */
	unload(debugMode = false) {
		this.__list.forEach((attr, name) => {
			// Delete hook
			this.__deps.mod.unhook(attr.hook);
			this.__deps.handlers.send.debug(debugMode, `Remove hook: ${attr.debug.name}`);

			this.__list.delete(name);
		});
	}

	/**
	 * Get hooks map.
	 * @readonly
	 * @memberof Hooks
	 */
	get list() {
		return this.__list;
	}
}

module.exports = Hooks;