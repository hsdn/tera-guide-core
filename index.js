'use strict';

const LOAD_CLASSES = ["lang", "dispatch"];
const LOAD_MODULES = ["functions", "gui", "commands", "events"];

class NetworkMod {
	constructor() {
		this.guide = {
			id: undefined,     // zone id
			name: undefined,   // zone dungeon name (translated)
			type: false,       // type of zone skill id range
			ent: false,        // last ent of triggered event by function handler
			loaded: false,     // boolean of guide loading status
			context: null,     // object of guide context
			spawned_npcs: {},  // list of spawned NPCs, used in spawn/despawn hooks
			spawned_items: {}, // list of spawned items, uses for force despawn its
			mobs_hp: {}        // list of values with NPCs (mobs) last hp
		};

		global.defaultSettings = {
			verbose: true,
			spawnObject: true
		};

		Object.assign(this.guide, defaultSettings);
	}

	load(mod) {
		this.mod = mod;

		try {
			for (let name of LOAD_CLASSES) {
				let instance = require(`./lib/${name}`);
				this[name] = new instance(this.mod);
			}

			for (let name of LOAD_MODULES) {
				require(`./lib/core/${name}`)(this.mod, this.guide, this.lang, this.dispatch);
			}
		} catch(e) {
			throw e;
		}
	}
}

module.exports = NetworkMod;