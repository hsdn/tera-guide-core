'use strict';

const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const readdir = promisify(fs.readdir);
const readline = require("readline");

const Handlers = require("./handlers");

// Zone type codes (default skill id range is 100-200)
global.SP = 1; // skill id range is 1000-3000
global.ES = 2; // skill id range is 100-200-3000

class Guide {

	constructor(mod, lang, dispatch, params) {
		this.mod = mod;
		this.lang = lang;
		this.dispatch = dispatch;

		this.obj = {
			id: undefined,     // zone id
			name: undefined,   // zone dungeon name
			type: false,       // type of zone skill id range
			ent: false,        // last ent of triggered event by func handler
			loaded: false,     // boolean of guide loading status
			context: null,     // object of guide context
			spawned_items: {}, // list of spawned items, uses for force despawn its
			spawned_npcs: {},  // list of spawned NPCs, used in spawn/despawn hooks
			marker_ids: {},    // list of marked gameIds
			mobs_hp: {}        // list of values with NPCs (mobs) last hp
		};

		this.defaultSettings = {
			verbose: true,
			spawnObject: true
		};

		Object.assign(this.obj, this.defaultSettings);

		this.handlers = new Handlers(mod, lang, dispatch, params, this);
	}

	async init() {
		// Translation strings
		let strings = {};
		let defaultStrings = require("../lang/dungeons");

		try {
			strings = require(path.resolve(this.mod.info.path, "lang", "dungeons"));
		} catch (e) {}

		// Load the ids of the available guides
		const guideFiles = await readdir(path.resolve(this.mod.info.path, "guides"));

		for (const file of guideFiles) {
			if (!file.endsWith(".js")) continue;
			const zoneId = file.split(".")[0];

			if (!this.mod.settings.dungeons[zoneId])
				this.mod.settings.dungeons[zoneId] = Object.assign({ name: undefined }, this.defaultSettings);

			if(defaultStrings[zoneId])
				this.mod.settings.dungeons[zoneId].name = defaultStrings[zoneId][this.lang.language] || defaultStrings[zoneId][this.lang.defaultLanguage];

			if(strings[zoneId])
				this.mod.settings.dungeons[zoneId].name = strings[zoneId][this.lang.language] || strings[zoneId][this.lang.defaultLanguage] || defaultStrings[zoneId][this.lang.defaultLanguage];
		}

		// Grab a list of dungeon names, and apply them to settings
		const dungeons = new Map();
		try {
			const resOne = await this.mod.queryData("/EventMatching/EventGroup/Event@type=?", ["Dungeon"], true, true, ["id"]);
			let allDungeons = resOne.map(e => {
				const zoneId = e.children.find(x => x.name == "TargetList").children.find(x => x.name == "Target").attributes.id;
				let dungeon = dungeons.get(zoneId);

				if (!dungeon){
					dungeon = { id: zoneId, name: "" };
					dungeons.set(zoneId, dungeon);
				}

				return dungeon;
			});

			const resTwo = await this.mod.queryData("/StrSheet_Dungeon/String@id=?", [[... dungeons.keys()]], true);
			for (const res of resTwo){
				const id = res.attributes.id.toString();
				const name = res.attributes.string.toString();

				if (!this.mod.settings.dungeons[id] || this.mod.settings.dungeons[id]["name"]) continue;

				this.mod.settings.dungeons[id].name = name;
			}
		} catch (e) {
			this.mod.warn(e);

			// If client functions not available, try to read dungeon list 
			// from "guides" directory, as dungeon name uses first line of the guide file
			const guideFiles = await readdir(path.resolve(this.mod.info.path, "guides"));
			for (const file of guideFiles) {
				if (!file.endsWith(".js")) continue;
				const zoneId = file.split(".")[0];

				if (!this.mod.settings.dungeons[zoneId] || this.mod.settings.dungeons[zoneId]["name"]) continue;

				let lineReader = readline.createInterface({
					input: fs.createReadStream(path.resolve(this.mod.info.path, "guides", file))
				});

				// Get first line of file and set as dungeon name
				lineReader.on("line", function (line) {
					const name = line.replace(/^[\/\s]+/g, "") || zoneId;
					this.mod.settings.dungeons[zoneId].name = name;
					lineReader.close();
					lineReader.removeAllListeners();
				});
			}
		}
	}

	// Load guide script
	load(zone, debug_enabled = false) {
		// Unload current loaded guide
		this.unload();

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
			return this.handlers.send.debug(debug_enabled, `Zone "${zone}" is not found`);

		// Try to load guide script
		try {
			const object = require(path.resolve(this.mod.info.path, "guides", this.obj.id.toString()));
	
			if (typeof object === "function") {
				// Set zone type from exports
				this.obj.type = object.type || false;

				// Call the object as a function
				try {
					this.obj.context = object(this.dispatch, this.handlers, this.obj, this.lang);
				} catch (e) {
					throw e;
				}
			} else {
				this.obj.context = object;

				// Try to call the compat function load()
				try {
					this.obj.context.load(this.dispatch, this.obj, this.lang, this.handlers);
				} catch (e) {
					throw e;
				}
				// Set zone type from compat
				try {
					if (require("../compat/data/spZones")["ids"].includes(this.obj.id))
						this.obj.type = SP;
					else if (require("../compat/data/esZones")["ids"].includes(this.obj.id))
						this.obj.type = ES;
				} catch (e) {}
			}
		} catch (e) {
			return this.mod.error(e);
		}

		// Send debug message
		this.handlers.send.debug(this.mod.settings.debug.all || debug_enabled, 
			`Guide type is: ${this.obj.type === SP ? "SP" : (this.obj.type === ES ? "ES" : "not set")}`
		);

		// Send welcome message
		this.handlers.text({
			"sub_type": "CGMSG",
			"delay": debug_enabled ? 0 : 5000,
			"message": `${cy}${this.lang.strings.enterdg}: ${cr}${this.obj.name} ${cw}[${this.obj.id}]\n` +
				`${cg}${this.lang.strings.helpheader}\n` +
				`${cg}${this.lang.strings.stream}: ${cy}${this.mod.settings.stream ? this.lang.strings.enabled : this.lang.strings.disabled}${cg}\n` +
				`${cg}${this.lang.strings.speaks}: ${cy}${this.mod.settings.speaks ? this.lang.strings.enabled : this.lang.strings.disabled}${cg}`
		});

		// Set guide as loaded
		this.obj.loaded = true;
	}

	// Unload guide script
	unload() {
		// Clear out the timers
		this.handlers.stop_timers();

		// Clear out previous hooks, that our previous guide module hooked
		this.dispatch._remove_all_hooks();

		// Force despawn for all spawned objects and clear obj.spawned_items
		this.handlers.despawn_all();

		// Force remove all markers from ids and clear obj.marker_ids
		this.handlers.marker_remove_all();

		// Remove cached guide from require cache
		try {
			if (this.obj.id)
				delete require.cache[require.resolve(path.resolve(this.mod.info.path, "guides", this.obj.id.toString()))];
		} catch (e) {}

		// Clear old data and set guide as not loaded
		Object.assign(this.obj, {
			loaded: false,
			id: undefined,
			name: undefined,
			ent: false,
			type: false,
			context: {},
			spawned_npcs: {},
			mobs_hp: {}
		});
	}

	// Handle events
	handleEvent(ent, id, prefix, debug_data, speed = 1.0, stage = false) {
		const unique_id = `${prefix}-${ent["huntingZoneId"]}-${ent["templateId"]}`;
		const id_string = (id !== false) ? `-${id}` : "";
		const stage_string = (stage !== false) ? `-${stage}` : "";
		const key = unique_id + id_string;

		// Get triggered entry of events
		const entry = (stage !== false) ? this.obj.context[key + stage_string] : this.obj.context[key];

		// Send debug info if enabled
		if (debug_data.enabled) {
			const defined = entry ? " [defined]" : "";
			console.log(`[Guide]`, `${debug_data.name}: ${key + stage_string}${defined}`);

			if (this.mod.settings.debug.chat)
				this.mod.command.message(`${cw}${debug_data.name}: ${debug_data.color}${key + stage_string}${cw}${defined}`);
		}

		// Call event handler
		if (entry)
			this.handlers.start_events(entry, ent, speed);
	}
}

module.exports = {
	Guide,
	lib: require("../compat/lib"),
	spawn: require("../spawn")
};