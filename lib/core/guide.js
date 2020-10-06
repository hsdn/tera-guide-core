"use strict";

const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const readdir = promisify(fs.readdir);
const readline = require("readline");

const Handlers = require("./handlers");
const Hooks = require("./hooks");

// Zone type codes (default skill id range is 100-200)
global.SP = 1; // skill id range is 1000-3000
global.ES = 2; // skill id range is 100-200-3000

class Guide {

	constructor(deps) {
		this.mod = deps.mod;
		this.lang = deps.lang;
		this.dispatch = deps.dispatch;

		this.obj = {
			"id": undefined, // zone id
			"name": undefined, // zone dungeon name
			"last_id": undefined, // zone id of last entered zone
			"type": false, // type of zone skill id range
			"ent": false, // last ent of triggered event by func handler
			"loaded": false, // boolean of guide loading status
			"context": null, // object of guide context
			"hooks": {}, // list of loaded hooks
			"data": {
				"markers": {}, // list of marked gameIds
				"items": {}, // list of spawned items, uses for force despawn its
				"hp": {}, // list of values with NPCs (mobs) last hp
				"npc": {}, // list of spawned NPCs, used in spawn/despawn hooks
			}
		};

		this.defaultSettings = {
			"verbose": true,
			"spawnObject": true
		};

		Object.assign(this.obj, this.defaultSettings);

		this.handlers = new Handlers(deps, this);
		this.hooks = new Hooks(deps, this);
	}

	async init() {
		let self = this;

		// Load the ids of the available guides
		let guideFiles = await readdir(path.resolve(this.mod.info.path, "guides"));

		guideFiles.forEach(file => {
			if (!file.endsWith(".js")) return;
			const zoneId = file.split(".")[0];

			if (!self.mod.settings.dungeons[zoneId] && !isNaN(parseInt(zoneId)))
				self.mod.settings.dungeons[zoneId] = { "name": undefined, ...self.defaultSettings };
		});

		// Grab a list of dungeon names, and apply them to settings
		try {
			const dungeons = new Map();

			// Read list of available dungeons
			(await this.mod.queryData("/EventMatching/EventGroup/Event@type=?", ["Dungeon"], true, true, ["id"])).map(e => {
				const zoneId = e.children.find(x => x.name == "TargetList").children.find(x => x.name == "Target").attributes.id;
				let dungeon = dungeons.get(zoneId);

				if (!dungeon){
					dungeon = { "id": zoneId, "name": "" };
					dungeons.set(zoneId, dungeon);
				}

				return dungeon;
			});

			// Read list of dungeon name strings
			(await this.mod.queryData("/StrSheet_Dungeon/String@id=?", [[...dungeons.keys()]], true)).forEach(res => {
				const id = res.attributes.id.toString();
				const name = res.attributes.string.toString();

				if (!self.mod.settings.dungeons[id]) return;

				self.mod.settings.dungeons[id].name = name;
			});
		} catch (e) {
			this.mod.warn(e);

			// If client functions not available, try to read dungeon list 
			// from "guides" directory, as dungeon name uses first line of the guide file
			guideFiles.forEach(file => {
				if (!file.endsWith(".js")) return;
				const zoneId = file.split(".")[0];

				if (!self.mod.settings.dungeons[zoneId]) return;

				let lineReader = readline.createInterface({
					"input": fs.createReadStream(path.resolve(self.mod.info.path, "guides", file))
				});

				// Get first line of file and set as dungeon name
				lineReader.on("line", line => {
					const name = line.trim().replace(new RegExp("^[/ ]+", "g"), "") || zoneId;
					self.mod.settings.dungeons[zoneId].name = name;
					lineReader.close();
					lineReader.removeAllListeners();
				});
			});
		}
	}

	// Load guide script
	load(zone, debug_enabled = false) {
		// Set zone id as the last entered zone
		this.obj.last_id = zone;

		// Unload current loaded guide
		this.unload();

		// Return if below is false
		if (!this.mod.settings.enabled) return;

		// Send debug message
		this.handlers.send.debug(this.mod.settings.debug.all, `Entered zone: ${zone}`);

		// Check guide and attach settings from config
		if (zone == "test") { // load test guide data
			this.obj.id = zone;
			this.obj.name = "Test Guide";
			Object.assign(this.obj, this.defaultSettings);
		} else if (this.mod.settings.dungeons[zone]) {
			this.obj.id = parseInt(zone);
			Object.assign(this.obj, this.mod.settings.dungeons[zone]);
		} else
			return this.handlers.send.debug(debug_enabled, `Guide "${zone}" is not found`);

		// Try to load guide script
		try {
			const object = require(path.resolve(this.mod.info.path, "guides", this.obj.id.toString()));
	
			// Remove cached guide from require cache
			try {
				delete require.cache[require.resolve(path.resolve(this.mod.info.path, "guides", this.obj.id.toString()))];
			} catch (e) {
				// continue regardless of error
			}

			if (typeof object === "function") {
				// Set zone type from exports
				this.obj.type = object.type || false;

				// Call the object as a function
				this.obj.context = object(this.dispatch, this.handlers, this.obj, this.lang);
			} else {
				this.obj.context = object;

				// Try to call the compat function load()
				this.obj.context.load(this.dispatch, this.obj, this.lang, this.handlers);

				// Set zone type from compat
				try {
					if (require("../compat/data/spZones")["ids"].includes(this.obj.id))
						this.obj.type = SP; // eslint-disable-line
					else if (require("../compat/data/esZones")["ids"].includes(this.obj.id))
						this.obj.type = ES; // eslint-disable-line
				} catch (e) {
					// continue regardless of error
				}
			}
		} catch (e) {
			return this.mod.error(e);
		}

		// Send debug message
		this.handlers.send.debug(this.mod.settings.debug.all || debug_enabled, 
			// eslint-disable-next-line no-nested-ternary
			`Guide type is: ${this.obj.type === SP ? "SP" : (this.obj.type === ES ? "ES" : "not set")}`
		);

		// Send welcome message
		this.handlers.text({
			"sub_type": "CGMSG",
			"delay": debug_enabled ? 0 : 5000,
			"message": `${cy}${this.lang.strings.enterdg}: ${cb}${this.obj.name} ${cw}[${this.obj.id}]\n` +
				`${cg}${this.lang.strings.helpheader}\n` +
				`${cg}${this.lang.strings.stream}: ${cy}${this.mod.settings.stream ? this.lang.strings.enabled : this.lang.strings.disabled}${cg}\n` +
				`${cg}${this.lang.strings.speaks}: ${cy}${this.mod.settings.speaks ? this.lang.strings.enabled : this.lang.strings.disabled}${cg}`
		});

		// Set guide as loaded
		this.obj.loaded = true;

		// Set keys for loading hooks
		let keys = [];
		Object.keys(this.obj.context).forEach(keystring => {
			const key = keystring.split("-")[0];
			if (key != "load" && !keys.includes(key))
				keys.push(key);
		});

		// Load affected hooks
		this.hooks.load(keys, debug_enabled);
	}

	// Unload guide script
	unload(debug_enabled = false) {
		// Clear out the timers
		this.handlers.stop_timers();

		// Clear out previous hooks, that our previous guide module hooked
		this.hooks.unload(debug_enabled);
		this.dispatch._remove_all_hooks();

		// Force despawn for all spawned objects and clear obj.spawned_items
		this.handlers.despawn_all();

		// Force remove all markers from ids and clear obj.marker_ids
		this.handlers.marker_remove_all();

		this.handlers.send.debug(debug_enabled, `Guide "${this.obj.id}" has been unloaded`);

		// Clear old data and set guide as not loaded
		Object.assign(this.obj, {
			"loaded": false,
			"id": undefined,
			"name": undefined,
			"ent": false,
			"type": false,
			"context": {},
		});

		Object.keys(this.obj.data).forEach(key => {
			this.obj.data[key] = {};
		});
	}

	// Handle events
	handleEvent(ent, actid, prefix, debug, speed = 1.0, stage = false) {
		// Get key string
		let key = `${prefix}-${ent["huntingZoneId"]}-${ent["templateId"]}`;

		if (actid !== false) key += `-${actid}`;
		if (stage !== false) key += `-${stage}`;

		// Get triggered entry of events
		const entry = this.obj.context[key];

		// Send debug info if enabled
		if (this.mod.settings.debug.all || this.mod.settings.debug[prefix]) {
			const defined = entry ? " [defined]" : "";
			console.log("[Guide]", `${debug.name}: ${key}${defined}`);

			if (this.mod.settings.debug.chat)
				this.mod.command.message(`${cw}${debug.name}: ${debug.color}${key}${cw}${defined}`);
		}

		// Call event handler
		if (entry)
			this.handlers.start_events(entry, ent, speed, key);
	}

	destructor() {
		this.mod.clearAllTimeouts();
		this.mod.clearAllIntervals();
	}
}

module.exports = Guide;

Object.assign(module.exports, {
	"lib": require("../compat/lib"),
	"spawn": require("../spawn")
});