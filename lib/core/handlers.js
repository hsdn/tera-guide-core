"use strict";

const EventEmitter = require("events").EventEmitter;
const path = require("path");
const Send = require("../send");

// List of available handler files
const handlerFiles = [
	"start_events",
	"stop_timers",
	"text",
	"despawn",
	"despawn_all",
	"spawn",
	"marker_add",
	"marker_remove",
	"marker_remove_all",
	"func",
	"alias"
];

/**
 * Temporary data used in handler functions.
 * @typedef {Object} data
 * @property {Map} markers List of marked gameIds.
 * @property {Map} spawns List of spawned items, uses for force despawn its.
 */

/**
 * @typedef {import("../../index").deps} deps
 */

class Handlers extends EventEmitter {
	/**
	 * Creates an instance of Handlers.
	 * @param {deps} deps
	 * @memberof Handlers
	 */
	constructor(deps) {
		super();

		this.__deps = deps;
		this.__types = {};

		// Create an instance of Send
		this.__send = new Send(deps);

		// Temporary data used in handler functions
		this.__data = {
			"markers": new Map(),
			"spawns": new Map()
		};
	}

	// Load handler types
	init() {
		handlerFiles.forEach(handlerFile => {
			try {
				// Load types from file
				const types = require(path.resolve(__dirname, "events", "handlers", handlerFile));

				Object.keys(types).forEach(type => {
					// Bind the handler function
					this.on(type, (...args) => types[type](this.__deps, this.__data, ...args));

					// Add a wrapper function to types array
					this.__types[type] = (event, ...args) => {
						// Emit handler function with array as event or undefined
						if (event === undefined || Array.isArray(event))
							return this.emit(type, event, ...args);

						// Trigger the handler event with type
						return this.trigger({ "type": type, ...event }, ...args);
					};
				});
			} catch (e) {
				this.emit("error", e);
			}
		});

		// Add error event listener
		this.on("error", e => this.__deps.mod.error(e));
	}

	/**
	 * Trigger handler event.
	 * @param {Object} [event={}] Data of event.
	 * @param {Object} [ent=null] Entity object.
	 * @param {string} [key=null] Current event key.
	 * @return {(Object|boolean)} Timer object of false.
	 * @memberof Handlers
	 */
	trigger(event = {}, ent = null, key = null) {
		if (typeof event !== "object" || event === null)
			return this.emit("error", "An event is not valid object");

		if (event.type === undefined)
			return this.emit("error", "An event needs a handler type");

		if (this.listenerCount(event.type) === 0)
			return this.emit("error", `An event has invalid type: ${event.type}`);

		Object.assign(event, { "_key": key });

		// Create a timer for delay if it is specified
		return this.delay(() => {
			const positionCheck = this.__deps.functions.classPositionCheck(event.class_position);
			const funcCheck = typeof event.check_func === "function" ? event.check_func(ent, event) : true;

			if (positionCheck && funcCheck)
				// Emit the handler function
				return this.emit(event.type, event, ent, key);
		},
		event.delay);
	}

	/**
	 * Create timer for specified delay.
	 * @param {TimerHandler} handler Handler function.
	 * @param {number} delay Timer delay in milliseconds.
	 * @param {*[]} args Handler function arguments.
	 * @return {(Object|boolean)} Timer object of false.
	 * @memberof Handlers
	 */
	delay(handler, delay, ...args) {
		const delayNumber = parseInt(delay);

		if (!isNaN(delayNumber) && delayNumber > 0)
			return this.__deps.mod.setTimeout(handler, delayNumber, ...args);
		else
			handler(...args);

		return false;
	}

	/**
	 * Clear out temporary data maps.
	 * @memberof Handlers
	 */
	clearData() {
		Object.keys(this.__data).forEach(key => this.__data[key].clear());
	}

	/**
	 * Get types object.
	 * @readonly
	 * @memberof Handlers
	 */
	get types() {
		return this.__types;
	}

	/**
	 * Get instance of Send.
	 * @readonly
	 * @memberof Handlers
	 */
	get send() {
		return this.__send;
	}

	/**
	 * Get data object.
	 * @readonly
	 * @memberof Handlers
	 */
	get data() {
		return this.__data;
	}
}

module.exports = Handlers;