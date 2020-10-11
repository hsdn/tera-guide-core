"use strict";

/**
 * Deps.
 * @typedef {Object} deps
 * @property {*} mod
 * @property {*} params
 * @property {import('./lib/lang')} lang
 * @property {import('./lib/dispatch')} dispatch
 * @property {import('./lib/core/functions')} functions
 * @property {import('./lib/core/handlers')} handlers
 * @property {import('./lib/core/hooks')} hooks
 * @property {import('./lib/core/guide')} guide
 * @property {import('./lib/core/events')} events
 * @property {import('./lib/core/gui')} gui
 * @property {import('./lib/core/commands')} commands
 */

const submodules = [
	["lang", require("./lib/lang")],
	["dispatch", require("./lib/dispatch")],
	["functions", require("./lib/core/functions")],
	["handlers", require("./lib/core/handlers")],
	["hooks", require("./lib/core/hooks")],
	["guide", require("./lib/core/guide")],
	["events", require("./lib/core/events")],
	["gui", require("./lib/core/gui")],
	["commands", require("./lib/core/commands")],
];

class TeraGuideCore {
	constructor() {
		this.params = {
			"colors": { "gui": {}, "general": {} },
			"command": ["guide"],
			"chat_name": "Guide",
		};
	}

	load(mod, params = {}) {
		Object.assign(this.params, params);

		/** 
		 * @type {deps}
		 */
		let deps = { "mod": mod, "params": this.params };

		// Load the submodules
		submodules.forEach(submodule => {
			deps[submodule[0]] = new submodule[1](deps);
		});

		// Initialize the submodules
		Object.keys(deps).forEach(key => {
			if (key !== "mod" && typeof deps[key].init === "function") {
				deps[key].init();
			}
		});

		this.destructor = () => {
			Object.keys(deps).forEach(key => {
				if (key !== "mod" && typeof deps[key].destructor === "function") {
					deps[key].destructor();
				}
			});
		};
	}
}

module.exports.NetworkMod = function Require(mod, ...args) {
	if(mod.info.name !== "tera-guide-core")
		throw new Error(`Tried to require tera-guide-core module: ${mod.info.name}`);

	return new TeraGuideCore(mod, ...args);
};

module.exports.RequireInterface = (globalMod, clientMod, networkMod) => networkMod;