"use strict";

const path = require("path");

// Hook settings
const HOOK_SETTINGS = Object.freeze({
	"LAST": { "order": 10000, "filter": { "fake": false, "modified": null } },
	"FIRST": { "order": -10000, "filter": { "fake": false } }
});

// Configuration of hooks
const hooks = {
	"S_ACTION_STAGE": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["s"]
	},
	"S_ABNORMALITY_BEGIN": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["am", "ae", "ab"]
	},
	"S_ABNORMALITY_REFRESH": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["am", "ae", "ab"]
	},
	"S_ABNORMALITY_END": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["ar", "ad"]
	},
	"S_BOSS_GAGE_INFO": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["h"]
	},
	"S_SPAWN_NPC": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["ns", "nd"]
	},
	"S_DESPAWN_NPC": {
		"settings": HOOK_SETTINGS.FIRST,
		"keys": ["nd"]
	},
	"S_DUNGEON_EVENT_MESSAGE": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["dm"]
	},
	"S_QUEST_BALLOON": {
		"settings": HOOK_SETTINGS.LAST,
		"keys": ["qb"]
	},
};

/**
 * @typedef {import("../../index").deps} deps
 */

class Hooks {
	/**
	 * Creates an instance of Hooks.
	 * @param {deps} deps
	 * @memberof Hooks
	 */
	constructor(deps) {
		this.__deps = deps;
	}

	/**
	 * Load all specified hooks.
	 * @param {string[]} keys Array of keys for loading the hooks.
	 * @param {boolean} [debug_enabled=false] Force enable debug messages.
	 * @memberof Hooks
	 */
	load(keys, debug_enabled = false) {
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
				if (this.__deps.guide.obj.hooks[name] || (!keys.includes(key) && !debug)) return;

				try {
					// Load hook from file
					const loaded = require(path.resolve(__dirname, "events", "hooks", name));

					// Add hook
					this.__deps.guide.obj.hooks[name] = {
						"keys": entry.keys,
						"hook": this.__deps.mod.hook(...this.__deps.proto.getData(name), entry.settings, event => {
							loaded.callback(this.__deps, event);
						})
					};

					this.__deps.handlers.send.debug(debug_enabled || this.__deps.mod.settings.debug.all, `Add hook: ${name} [${entry.keys.toString()}]`);
				}
				catch (e) {
					return this.__deps.mod.error(e);
				}
			});
		});
	}

	/**
	 * Unhook all loaded hooks.
	 * @param {boolean} [debug_enabled=false] Force enable debug messages.
	 * @memberof Hooks
	 */
	unload(debug_enabled = false) {
		Object.keys(this.__deps.guide.obj.hooks).forEach(name => {
			const entry = this.__deps.guide.obj.hooks[name];

			// Delete hook
			this.__deps.mod.unhook(entry.hook);
			this.__deps.handlers.send.debug(debug_enabled || this.__deps.mod.settings.debug.all, `Remove hook: ${name} [${entry.keys.toString()}]`);

			delete this.__deps.guide.obj.hooks[name];
		});
	}

	destructor() {
		this.unload();
	}
}

module.exports = Hooks;