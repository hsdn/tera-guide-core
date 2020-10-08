"use strict";

/**
 * @typedef {import("../../index").deps} deps
 */

const path = require("path");

// Hook settings
global.HOOK_SETTINGS = Object.freeze({
	"LAST": { "order": 10000, "filter": { "fake": false, "modified": null } },
	"FIRST": { "order": -10000, "filter": { "fake": false } }
});

class Hooks {
	/**
	 * Creates an instance of Hooks.
	 * @param {deps} deps
	 * @memberof Hooks
	 */
	constructor(deps) {
		this.deps = deps;

		// Configuration of keys
		this.config = {
			"S_ACTION_STAGE": ["s"],
			"S_ABNORMALITY_BEGIN": ["am", "ae", "ab"],
			"S_ABNORMALITY_REFRESH": ["am", "ae", "ab"],
			"S_ABNORMALITY_END": ["ar", "ad"],
			"S_BOSS_GAGE_INFO": ["h"],
			"S_SPAWN_NPC": ["ns", "nd"],
			"S_DESPAWN_NPC": ["nd"],
			"S_DUNGEON_EVENT_MESSAGE": ["dm"],
			"S_QUEST_BALLOON": ["qb"],
		};
	}

	// Load all specified hooks
	load(keys, debug_enabled = false) {
		// Search the hook by presented keys
		Object.keys(this.config).forEach(name => {
			const entry = this.config[name];

			entry.forEach(key => {
				// Set debug default value
				if (!this.deps.mod.settings.debug[key])
					this.deps.mod.settings.debug[key] = false;

				// Get debug value for affected entry
				const debug = this.deps.mod.settings.debug.all || this.deps.mod.settings.debug[key];

				// Return if hook already added or not exists in list of keys and debug is false
				if (this.deps.guide.obj.hooks[name] || (!keys.includes(key) && !debug)) return;

				try {
					// Load hook from file
					const loaded = require(path.resolve(__dirname, "events", "hooks", name));

					// Add hook
					this.deps.guide.obj.hooks[name] = {
						"keys": entry,
						"hook": this.deps.mod.hook(...loaded.hook.concat([event => {
							loaded.callback(this.deps.mod, this.deps.guide, event);
						}]))
					};

					// Remove cached hook file from require cache
					try {
						delete require.cache[require.resolve(path.resolve(__dirname, "events", "hooks", name))];
					} catch (e) {
						// continue regardless of error
					}

					this.deps.handlers.send.debug(debug_enabled || this.deps.mod.settings.debug.all, `Add hook: ${name} [${entry.toString()}]`);
				}
				catch (e) {
					return this.deps.mod.error(e);
				}
			});
		});
	}

	// Unhook all loaded hooks
	unload(debug_enabled = false) {
		Object.keys(this.deps.guide.obj.hooks).forEach(name => {
			const entry = this.deps.guide.obj.hooks[name];

			// Delete hook
			this.deps.mod.unhook(entry.hook);
			this.deps.handlers.send.debug(debug_enabled || this.deps.mod.settings.debug.all, `Remove hook: ${name} [${entry.keys.toString()}]`);

			delete this.deps.guide.obj.hooks[name];
		});
	}

	destructor() {
		this.unload();
	}
}

module.exports = Hooks;