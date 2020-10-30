"use strict";

/**
 * @typedef {import("../index").deps} deps
 */

class Dispatch {
	/**
	 * Creates an instance of Dispatch.
	 * @param {deps} deps
	 * @memberof Dispatch
	 */
	constructor(deps) {
		this._mod = deps.mod;
		this._dispatch = deps.mod;

		this.__hooks = [];
	}

	/**
	 * Add hook.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	hook(...args) {
		this.__hooks.push(this._mod.hook(...args));
	}

	/**
	 * Add hook once.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	hookOnce(...args) {
		this._mod.hookOnce(...args);
	}

	/**
	 * Remove hook.
	 * @memberof Dispatch
	 */
	unhook() {
		throw new Error("Unhook not supported for TERA-Guide");
	}

	/**
	 * Remove all loaded hooks.
	 * @memberof Dispatch
	 */
	unhookAll() {
		this.__hooks.forEach(hook => this._mod.unhook(hook));
		this.__hooks = [];
	}

	/**
	 * Require a module.
	 * @readonly
	 * @memberof Dispatch
	 */
	get require() {
		return this._mod.require;
	}

	/**
	 * Set timeout.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	setTimeout(...args) {
		return this._mod.setTimeout(...args);
	}

	/**
	 * Clear timeout.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	clearTimeout(...args) {
		return this._mod.clearTimeout(...args);
	}

	/**
	 * Send packet.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	toServer(...args) {
		return this.send(...args);
	}

	/**
	 * Send packet.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	toClient(...args) {
		return this.send(...args);
	}

	/**
	 * Send packet.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	send(...args) {
		return this._mod.send(...args);
	}

	/**
	 * Removes all loaded hooks.
	 * @memberof Dispatch
	 */
	destructor() {
		this.unhookAll();
	}
}

module.exports = Dispatch;