"use strict";

// Proto data
const protoData = require("../data/proto");

/**
 * @typedef {import("../../index.js").deps} deps
 */

class Proto {
	/**
	 * Creates an instance of Proto.
	 * @param {deps} deps
	 * @memberof Proto
	 */
	constructor(deps) {
		this.__mod = deps.mod;
	}

	/**
	 * Get array of arguments data.
	 * @param {string} name Packet name.
	 * @return {(string|number)[]} Packet arguments data.
	 * @memberof Proto
	 */
	getData(name) {
		const version = protoData[name][this.__mod.majorPatchVersion];

		return version ? [name, version] : [name, protoData[name].default];
	}
}

module.exports = Proto;