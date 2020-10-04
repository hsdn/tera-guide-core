"use strict";

class Dispatch {

	constructor(deps) {
		this._mod = deps.mod;
		this._dispatch = deps.mod;
		this._hooks = [];
	}

	hook(...args) {
		this._hooks.push(this._dispatch.hook(...args));
	}

	hookOnce(...args) {
		this._dispatch.hookOnce(...args);
	}

	unhook() {
		throw new Error("Unhook not supported for TERA-Guide");
	}

	_remove_all_hooks() {
		for (const hook of this._hooks) this._dispatch.unhook(hook);
		this._hooks = [];
	}

	get require() {
		return this._dispatch.require;
	}

	setTimeout(...args) {
		return this._dispatch.setTimeout(...args);
	}

	clearTimeout(...args) {
		return this._dispatch.clearTimeout(...args);
	}

	toServer(...args) { 
		return this.send(...args); 
	}

	toClient(...args) {
		return this.send(...args); 
	}

	send(...args) {
		return this._dispatch.send(...args);
	}

	destructor() {
		this._remove_all_hooks();
	}
}

module.exports = Dispatch;