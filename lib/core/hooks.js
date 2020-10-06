"use strict";

const path = require("path");

global.DEFAULT_HOOK_SETTINGS = { "order": -100, "filter": { "fake": false, "silenced": false, "modified": null } };

class Hooks {

	constructor(deps, guide) {
		this.mod = deps.mod;
		this.guide = guide;
		this.handlers = this.guide.handlers;

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
		let self = this;

		// Search the hook by presented keys
		Object.keys(self.config).forEach(name => {
			const entry = self.config[name];

			entry.forEach(key => {
				// Set debug default value
				if (!self.mod.settings.debug[key])
					self.mod.settings.debug[key] = false;

				// Get debug value for affected entry
				const debug = self.mod.settings.debug.all || self.mod.settings.debug[key];

				// Return if hook already added or not exists in list of keys and debug is false
				if (self.guide.obj.hooks[name] || (!keys.includes(key) && !debug)) return;

				try {
					// Load hook from file
					const loaded = require(path.resolve(__dirname, "events", "hooks", name));

					// Set debug parameters
					const debug_data = { "name": loaded.name, "color": loaded.color };

					// Add hook
					self.guide.obj.hooks[name] = {
						"keys": entry,
						"hook": self.mod.hook(...loaded.hook.concat([event => {
							loaded.callback(self, self.mod, self.guide, debug_data, event);
						}]))
					};

					// Remove cached hook file from require cache
					try {
						delete require.cache[require.resolve(path.resolve(__dirname, "events", "hooks", name))];
					} catch (e) {
						// continue regardless of error
					}

					self.handlers.send.debug(debug_enabled, `Add hook: ${name} [${entry.toString()}]`);
				}
				catch (e) {
					return self.mod.error(e);
				}
			});
		});
	}

	// Unhook all loaded hooks
	unload(debug_enabled = false) {
		let self = this;

		Object.keys(this.guide.obj.hooks).forEach(name => {
			const entry = self.guide.obj.hooks[name];

			// Delete hook
			self.mod.unhook(entry.hook);
			self.handlers.send.debug(debug_enabled, `Remove hook: ${name} [${entry.keys.toString()}]`);
		});
	}

	destructor() {
		this.unload();
	}
}

module.exports = Hooks;