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
		this._hooks = [];
	}

	/**
	 * Add hook.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	hook(...args) {
		this._hooks.push(this._dispatch.hook(...args));
	}

	/**
	 * Add hook once.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	hookOnce(...args) {
		this._dispatch.hookOnce(...args);
	}

	/**
	 * Remove hooks.
	 * @memberof Dispatch
	 */
	unhook() {
		throw new Error("Unhook not supported for TERA-Guide");
	}

	/**
	 * Removes all loaded hooks.
	 * @memberof Dispatch
	 */
	_remove_all_hooks() {
		for (const hook of this._hooks) this._dispatch.unhook(hook);
		this._hooks = [];
	}

	/**
	 * Require a module.
	 * @readonly
	 * @memberof Dispatch
	 */
	get require() {
		return this._dispatch.require;
	}

	/**
	 * Set timeout.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	setTimeout(...args) {
		return this._dispatch.setTimeout(...args);
	}

	/**
	 * Clear timeout.
	 * @param {*} args
	 * @memberof Dispatch
	 */
	clearTimeout(...args) {
		return this._dispatch.clearTimeout(...args);
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
		return this._dispatch.send(...args);
	}

	/**
	 * Removes all loaded hooks.
	 * @memberof Dispatch
	 */
	destructor() {
		this._remove_all_hooks();
	}
}

module.exports = Dispatch;