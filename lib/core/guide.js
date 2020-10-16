"use strict";

const EventEmitter = require("events").EventEmitter;
const path = require("path");
const fs = require("fs");
const readdir = require("util").promisify(fs.readdir);
const readline = require("readline");

// Zone type codes
global.SP = 1;
global.ES = 2;

/**
 * @typedef {import("../../index").deps} deps
 */

class Guide extends EventEmitter {
	/**
	 * Creates an instance of Guide.
	 * @param {deps} deps
	 * @memberof Guide
	 */
	constructor(deps) {
		super();

		this.__mod = deps.mod;
		this.__lang = deps.lang;
		this.__dispatch = deps.dispatch;
		this.__handlers = deps.handlers;
		this.__hooks = deps.hooks;

		// Set max listeners number
		this.setMaxListeners(30);

		this.obj = {
			"id": undefined, // zone id
			"lastId": undefined, // zone id of last entered zone
			"name": undefined, // zone dungeon name
			"type": false, // type of zone skill id range
			"loaded": false, // boolean of guide loading status
			"context": null, // object of guide context
			"ent": false, // last entity of triggered event by func handler
			"hooks": {}, // list of loaded hooks
			"data": {
				"markers": {}, // list of marked gameIds
				"items": {}, // list of spawned items, uses for force despawn its
				"hp": {}, // list of values with NPCs (mobs) last hp
			}
		};

		this.__defaultSettings = {
			"verbose": true,
			"spawnObject": true
		};

		Object.assign(this.obj, this.__defaultSettings);

		// Migrate settings (compat)
		this.__migrateSettings();
	}

	async init() {
		// Available guide ids
		let availableGuides = [];

		// Load the ids of the available guides
		let guideFiles = await readdir(path.resolve(this.__mod.info.path, "guides"));

		guideFiles.forEach(file => {
			if (!file.endsWith(".js")) return;
			const zoneId = file.split(".")[0];

			availableGuides.push(zoneId);

			if (!this.__mod.settings.dungeons[zoneId] && !isNaN(parseInt(zoneId)))
				this.__mod.settings.dungeons[zoneId] = { "name": undefined, ...this.__defaultSettings };
		});

		// Remove old configuration
		Object.keys(this.__mod.settings.dungeons).forEach(zoneId => {
			if (!availableGuides.includes(zoneId))
				delete this.__mod.settings.dungeons[zoneId];
		});

		// Grab a list of dungeon names, and apply them to settings
		try {
			const dungeons = new Map();

			// Read list of available dungeons
			(await this.__mod.queryData("/EventMatching/EventGroup/Event@type=?", ["Dungeon"], true, true, ["id"])).map(e => {
				const zoneId = e.children.find(x => x.name == "TargetList").children.find(x => x.name == "Target").attributes.id;
				let dungeon = dungeons.get(zoneId);

				if (!dungeon){
					dungeon = { "id": zoneId, "name": "" };
					dungeons.set(zoneId, dungeon);
				}

				return dungeon;
			});

			// Read list of dungeon name strings
			(await this.__mod.queryData("/StrSheet_Dungeon/String@id=?", [[...dungeons.keys()]], true)).forEach(res => {
				const id = res.attributes.id.toString();
				const name = res.attributes.string.toString();

				if (!this.__mod.settings.dungeons[id]) return;

				this.__mod.settings.dungeons[id].name = name;
			});
		} catch (e) {
			this.__mod.warn(e);

			// If client functions not available, try to read dungeon list 
			// from "guides" directory, as dungeon name uses first line of the guide file
			guideFiles.forEach(file => {
				if (!file.endsWith(".js")) return;
				const zoneId = file.split(".")[0];

				if (!this.__mod.settings.dungeons[zoneId]) return;

				let lineReader = readline.createInterface({
					"input": fs.createReadStream(path.resolve(this.__mod.info.path, "guides", file))
				});

				// Get first line of file and set as dungeon name
				lineReader.on("line", line => {
					const name = line.trim().replace(new RegExp("^[/ ]+", "g"), "") || zoneId;

					this.__mod.settings.dungeons[zoneId].name = name;

					lineReader.close();
					lineReader.removeAllListeners();
				});
			});
		}
	}

	/**
	 * Load guide script.
	 * @param {*} zoneId Zone identifier.
	 * @param {boolean} [debug_enabled=false] Force enable debug messages.
	 * @memberof Guide
	 */
	load(zoneId = false, debug_enabled = false) {
		// Check zone id
		const zone = zoneId || this.obj.lastId;

		// Set zone id as the last entered zone
		this.obj.lastId = zone;

		// Unload current loaded guide
		this.unload(debug_enabled);

		// Return if below is false
		if (!this.__mod.settings.enabled) return;

		// Send debug message
		this.__handlers.send.debug(this.__mod.settings.debug.all, `Entered zone: ${zone}`);

		// Check guide and attach settings from config
		if (zone === "test") {
			this.obj.id = zone;
			this.obj.name = "Test Guide";
			Object.assign(this.obj, this.__defaultSettings);
		} else if (this.__mod.settings.dungeons[zone]) {
			this.obj.id = parseInt(zone);
			Object.assign(this.obj, this.__mod.settings.dungeons[zone]);
		} else
			return this.__handlers.send.debug(debug_enabled, `Guide "${zone}" is not found.`);

		// Try to load guide script
		try {
			const object = require(path.resolve(this.__mod.info.path, "guides", this.obj.id.toString()));
	
			// Remove cached guide from require cache
			try {
				delete require.cache[require.resolve(path.resolve(this.__mod.info.path, "guides", this.obj.id.toString()))];
			} catch (e) {
				// continue regardless of error
			}

			if (typeof object === "function") {
				// Set zone type
				this.obj.type = object.type || false;

				// Call the object as a function
				this.obj.context = object(this.__dispatch, this.__handlers, this.obj, this.__lang);
			} else {
				this.obj.context = object;

				// Try to call the compat function load()
				this.obj.context.load(this.__dispatch, this.obj, this.__lang, this.__handlers);

				// Set zone type from compat
				try {
					if (require("../compat/data/spZones")["ids"].includes(this.obj.id))
						this.obj.type = SP;
					else if (require("../compat/data/esZones")["ids"].includes(this.obj.id))
						this.obj.type = ES;
				} catch (e) {
					// continue regardless of error
				}
			}
		} catch (e) {
			return this.__mod.error(e);
		}

		// Set guide as loaded
		this.obj.loaded = true;

		// Add event listners
		this.addEvents();

		// Add affected hooks
		this.addHooks(debug_enabled);

		// Send debug message
		this.__handlers.send.debug(debug_enabled, `Guide "${this.obj.id}" loaded.`);

		// Send welcome text
		this.sendWelcome(debug_enabled);
	}

	/**
	 * Unload guide script.
	 * @param {boolean} [debug_enabled=false] Force enable debug messages.
	 * @memberof Guide
	 */
	unload(debug_enabled = false) {
		// Clear out the timers
		this.__handlers.stop_timers();

		// Clear out previous hooks, that our previous guide module hooked
		this.__hooks.unload(debug_enabled);
		this.__dispatch._remove_all_hooks();

		// Remove all guide events
		this.removeAllListeners();

		// Force despawn for all spawned objects and clear obj.data.items
		this.__handlers.despawn_all();

		// Force remove all markers from ids and clear obj.data.markers
		this.__handlers.marker_remove_all();

		if (this.obj.loaded)
			this.__handlers.send.debug(debug_enabled, `Guide "${this.obj.id}" has been unloaded.`);

		// Clear old data and set guide as not loaded
		Object.assign(this.obj, { "loaded": false, "id": undefined, "name": undefined, "type": false, "context": {}, "ent": false });

		Object.keys(this.obj.data).forEach(key => {
			this.obj.data[key] = {};
		});
	}

	/**
	 * Add event listners for guide.
	 * @memberof Guide
	 */
	addEvents() {
		// Add error event listener
		this.on("error", e => { this.__mod.error(e); });

		Object.keys(this.obj.context).forEach(key => {
			const events = this.obj.context[key];
			if (key === "error")
				return this.emit("error", `Cannot use word "${key}" as key.`);

			if (typeof events === "string" && events !== key)
				// Add listener for alias entry
				this.on(key, (ent, speed = 1.0) => {
					this.emit(events, ent, speed);
				});
			else {
				if (!Array.isArray(events))
					return this.emit("error", `Key "${key}" has invalid type.`);

				if (events.length > this.getMaxListeners())
					return this.emit("error", `Limit of records for key "${key}" exceeded.`);

				// Add listeners to event entries
				Object.keys(events).forEach(entry => {
					this.on(key, (ent, speed = 1.0) => {
						this.__handlers.apply(events[entry], ent, speed, key);
					});
				});
			}
		});
	}

	/**
	 * Load affected hooks.
	 * @param {boolean} [debug_enabled=false] Force enable debug messages.
	 * @memberof Guide
	 */
	addHooks(debug_enabled = false) {
		let keys = [];

		Object.keys(this.obj.context).forEach(keystring => {
			const key = keystring.split("-")[0];

			if (!keys.includes(key) && key !== "load")
				keys.push(key);
		});

		this.__hooks.load(keys, debug_enabled);
	}

	/**
	 * Event handler.
	 * @param {string} key Key string for event emit.
	 * @param {Object} ent Entity object from event.
	 * @param {Object} debug Debug information params.
	 * @param {number} [speed=1.0] Divider for timers.
	 * @memberof Guide
	 */
	handleEvent(key, ent, debug, speed = 1.0) {
		// Emit event
		this.emit(key, ent, speed);

		// Send debug messages if enabled
		if (this.__mod.settings.debug.all || this.__mod.settings.debug[debug.key || false]) {
			const defined = this.listeners(key).length > 0 ? " [defined]" : "";

			console.log("[Guide]", `${debug.name}: ${key}${defined}`);

			if (this.__mod.settings.debug.chat)
				this.__mod.command.message(`${cw}${debug.name}: ${debug.color}${key}${cw}${defined}`);
		}
	}

	/**
	 * Send welvome message.
	 * @param {boolean} [debug_enabled=false] Force enable debug messages.
	 * @memberof Guide
	 */
	sendWelcome(debug_enabled = false) {
		// Return if guide not loaded
		if (!this.obj.loaded) return;

		// Return if the player is not in dungeon
		if (!this.__mod.game.me.inDungeon && !debug_enabled) return;

		if (this.obj.name) {
			this.__handlers.text({
				"sub_type": "CGMSG",
				"delay": debug_enabled ? 0 : 5000,
				"message": `${cy}${this.__lang.strings.enterdg}: ${clb}${this.obj.name} ${cw}[${this.obj.id}]`
			});
		}

		this.__handlers.text({
			"sub_type": "CGMSG",
			"delay": debug_enabled ? 0 : 5000,
			"message": `${cg}${this.__lang.strings.helpheader}\n` +
				`${cg}${this.__lang.strings.stream}: ${cy}${this.__mod.settings.stream ? this.__lang.strings.enabled : this.__lang.strings.disabled}${cg}\n` +
				`${cg}${this.__lang.strings.speaks}: ${cy}${this.__mod.settings.speech.enabled ? this.__lang.strings.enabled : this.__lang.strings.disabled}${cg}`
		});
	}

	__migrateSettings() {
		if (!this.__mod.settings.dungeons || typeof this.__mod.settings.dungeons !== "object" || Array.isArray(this.__mod.settings.dungeons))
			this.__mod.settings.dungeons = {};
	}

	destructor() {
		this.__mod.clearAllTimeouts();
		this.__mod.clearAllIntervals();

		this.removeAllListeners();
	}
}

module.exports = Guide;

// Export compat
module.exports.lib = require("../compat/lib");
module.exports.spawn = require("../spawn");