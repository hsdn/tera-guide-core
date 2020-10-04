"use strict";

const submodules = [
	["lang", require("./lib/lang")],
	["dispatch", require("./lib/dispatch")],
	["guide", require("./lib/core/guide")],
	["events", require("./lib/core/events")],
	["functions", require("./lib/core/functions")],
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

		let deps = {
			"mod": mod,
			"params": this.params
		};

		submodules.forEach(submodule => {
			deps[submodule[0]] = new submodule[1](deps);
		});

		this.destructor = () => {
			Object.keys(submodules).forEach(key => {
				if (key !== "mod" && typeof submodules[key].destructor === "function") {
					submodules[key].destructor();
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