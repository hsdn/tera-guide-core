'use strict';

const Dispatch = require("./lib/dispatch");
const Lang = require("./lib/lang");

class TeraGuideCore {
	constructor() {
		this.params = {
			colors: { gui: {}, general: {} }, // color settings
			command: ["guide"], // module command
			chat_name: "Guide", // set chat author name for notices
		};
	}

	load(mod, params = {}) {
		Object.assign(this.params, params);

		const lang = new Lang(mod);
		const dispatch = new Dispatch(mod);

		require("./lib/core/events")(mod, lang, dispatch, this.params);
	}
}

module.exports.NetworkMod = function Require(mod, ...args) {
	if(mod.info.name !== "tera-guide-core")
		throw new Error(`Tried to require tera-guide-core module: ${mod.info.name}`);

	return new TeraGuideCore(mod, ...args);
}

module.exports.RequireInterface = (globalMod, clientMod, networkMod) => networkMod;