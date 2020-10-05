"use strict";

class Hooks {

	constructor(deps, guide) {
		this.mod = deps.mod;
		this.guide = guide;
		this.handlers = this.guide.handlers;

		const { player, entity } = this.mod.require.library;

		this.player = player;
		this.entity = entity;

		// Configuration of available hooks
		this.config = {
			"S_ACTION_STAGE": { "version": 9, "order": 15, "keys": ["s"] },
			"S_ABNORMALITY_BEGIN": { "version": 4, "order": 15, "keys": ["am", "ae", "ab"] },
			"S_ABNORMALITY_REFRESH": { "version": 2, "order": 15, "keys": ["am", "ae", "ab"] },
			"S_ABNORMALITY_END": { "version": 1, "order": 15, "keys": ["ar", "ad"] },
			"S_BOSS_GAGE_INFO": { "version": 3, "order": 0, "keys": ["h"] },
			"S_SPAWN_NPC": { "version": 11, "order": 0, "keys": ["ns"] },
			"S_DESPAWN_NPC": { "version": 3, "order": -100, "keys": ["nd"] },
			"S_DUNGEON_EVENT_MESSAGE": { "version": 2, "order": 0, "keys": ["dm"] },
			"S_QUEST_BALLOON": { "version": 1, "order": 0, "keys": ["qb"] },
		};
	}

	// Load all specified hooks
	load(keys, debug_enabled = false) {
		let self = this;

		// Search the hook by presented keys
		Object.keys(this.config).forEach(name => {
			const entry = self.config[name];

			entry.keys.forEach(key => {
				// Set debug default value
				if (!self.mod.settings.debug[key])
					self.mod.settings.debug[key] = false;

				// Get debug value for affected entry
				const debug = self.mod.settings.debug.all || self.mod.settings.debug[key];

				// Return if hook already added or not exists in list of keys and debug is false
				if (self.guide.obj.hooks[name] || (!keys.includes(key) && !debug)) return;

				// Try to add hook to module
				try {
					self.guide.obj.hooks[name] = { "hook": self.mod.hook(name, entry.version, { "order": entry.order }, event => {
						self[name.toLowerCase()](event, debug);
					}), ...entry };
				}
				catch (e) {
					return self.mod.error(e);
				}

				self.handlers.send.debug(debug_enabled, `Add hook: ${name} [${entry.keys.toString()}]`);
			});
		});
	}

	// Unhook all loaded hooks
	unload(debug_enabled = false) {
		let self = this;

		Object.keys(this.guide.obj.hooks).forEach(name => {
			const entry = self.guide.obj.hooks[name];

			self.mod.unhook(entry.hook);
			self.handlers.send.debug(debug_enabled, `Remove hook: ${name} [${entry.keys.toString()}]`);
		});

		this.guide.obj.hooks = {};
	}


	/** AVAILABLE HOOK CALLBACKS **/

	// Boss skill action
	s_action_stage(event, debug_enabled) {
		// Return if skill of not NPC
		if (!event.skill.npc) return;

		// Get mob ent
		const ent = this.entity["mobs"][event.gameId.toString()];

		if (ent) {
			let skillid = 0;

			// Get range for skill ids of zone type
			if (this.guide.obj.type === SP)
				// Skill id range 1000-3000 (SP)
				skillid = event.skill.id;
			else if (this.guide.obj.type === ES)
				// Skill id range 100-200-3000 (ES)
				skillid = event.skill.id > 3000 ? event.skill.id : event.skill.id % 1000;
			else
				// Skill id range 100-200 (not set)
				skillid = event.skill.id % 1000;

			// Due to a bug for some bizare reason we do this ugly hack
			event["loc"].w = event.w;

			this.guide.handleEvent({ ...ent, ...event }, skillid, "s", {
				"enabled": debug_enabled,
				"name": "Skill",
				"color": cy
			}, event.speed, event.stage);
		}
	}

	// Abnormality added
	s_abnormality_begin(event, debug_enabled) {
		// Return if abnormality is applied by player
		if (event.source && (this.player.isMe(event.source) || this.player.playersInParty.includes(event.source))) return;

		// avoid errors ResidentSleeper (neede for abnormality refresh)
		if (!event.source) event.source = 0n;

		// If the boss/mob get"s a abnormality applied to it
		const target_ent = this.entity["mobs"][event.target.toString()];

		// If the boss/mob is the cause for the abnormality
		const source_ent = this.entity["mobs"][event.source.toString()];

		// Data for the debug
		const debug_data = {
			"enabled": debug_enabled,
			"name": "Abnormality begin",
			"color": cp
		};

		// Applies an abnormality to me
		if (this.player.isMe(event.target)) {
			// by mob/boss
			if (source_ent)
				return this.guide.handleEvent(source_ent, event.id, "am", debug_data);

			// by nothing/server
			if ((event.source || 0) == 0)
				return this.guide.handleEvent({
					"huntingZoneId": 0,
					"templateId": 0
				}, event.id, "ae", debug_data);
		}

		// Applies an abnormality to mob/boss
		if (target_ent)
			return this.guide.handleEvent(target_ent, event.id, "ab", debug_data);
	}
	s_abnormality_refresh(...args) {
		this.s_abnormality_begin(...args);
	}

	// Abnormality removed
	s_abnormality_end(event, debug_enabled) {
		// Data for the debug
		const debug_data = {
			"enabled": debug_enabled,
			"name": "Abnormality end",
			"color": cp
		};

		// Applies an abnormality to me
		if (this.player.isMe(event.target))
			return this.guide.handleEvent({
				"huntingZoneId": 0,
				"templateId": 0
			}, event.id, "ar", debug_data);

		// If the boss/mob get"s a abnormality applied to it
		const target_ent = this.entity["mobs"][event.target.toString()];

		// Applies an abnormality to mob/boss
		if (target_ent)
			return this.guide.handleEvent({
				"huntingZoneId": 0,
				"templateId": 0,
				...target_ent
			}, event.id, "ad", debug_data);
	}

	// Boss health bar event
	s_boss_gage_info(event, debug_enabled) {
		// Get mob ent
		const ent = this.entity["mobs"][event.id.toString()];

		if (ent) {
			// Calculate hp number
			const hp = Math.floor(Number(event.curHp) / Number(event.maxHp) * 100);

			// Check mob's hp of existing value for single call the event
			if (this.guide.obj.mobs_hp[event.id.toString()] == hp) return;
			this.guide.obj.mobs_hp[event.id.toString()] = hp;

			// We"ve confirmed it"s a mob, so it"s plausible we want to act on this
			this.guide.handleEvent(ent, hp, "h", {
				"enabled": debug_enabled,
				"name": "Health",
				"color": cr
			});
		}
	}

	// Spawn NPC event
	s_spawn_npc(event, debug_enabled) {
		// Get mob ent
		const ent = this.entity["mobs"][event.gameId.toString()];

		if (ent) {
			this.guide.handleEvent(ent, false, "ns", {
				"enabled": debug_enabled,
				"name": "Spawn",
				"color": co
			});

			// Add spawned NPC to list
			this.guide.obj.spawned_npcs[event.gameId.toString()] = ent;
		}
	}

	// Despawn NPC event
	s_despawn_npc(event, debug_enabled) {
		const ent = this.guide.obj.spawned_npcs[event.gameId.toString()];

		if (ent) {
			this.guide.handleEvent(ent, false, "nd", {
				"enabled": debug_enabled,
				"name": "Despawn",
				"color": cv
			});

			// Delete despawned NPC from list
			delete this.guide.obj.spawned_npcs[event.gameId];
		}
	}

	// Dungeon Message event
	s_dungeon_event_message(event, debug_enabled) {
		const result = /@dungeon:(\d+)/g.exec(event.message);

		if (result)
			this.guide.handleEvent({
				"huntingZoneId": 0,
				"templateId": 0
			}, parseInt(result[1]), "dm", {
				"enabled": debug_enabled,
				"name": "Dungeon Message",
				"color": clb
			});
	}

	// Quest Balloon event
	s_quest_balloon(event, debug_enabled) {
		const source_ent = this.entity["mobs"][event.source.toString()];
		const result = /@monsterBehavior:(\d+)/g.exec(event.message);

		if (result && source_ent)
			this.guide.handleEvent(source_ent, parseInt(result[1]), "qb", {
				"enabled": debug_enabled,
				"name": "Quest Balloon",
				"color": cb
			});
	}
}

module.exports = Hooks;