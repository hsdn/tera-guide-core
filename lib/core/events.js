'use strict';

const LOAD_SUBMODULES = ["functions", "commands", "gui"];

module.exports = (mod, lang, dispatch, params) => {

	const { Guide } = require("./guide");
	const { player, entity } = mod.require.library;

	// Load core
	const guide = new Guide(mod, lang, dispatch, params);

	// Load submodules
	for (let name of LOAD_SUBMODULES)
		require(`./${name}`)(mod, lang, params, guide);


	// Enter the game
	mod.game.on("enter_game", () => {
		lang.init();
		guide.init();
	});

	// Change zone
	mod.game.me.on("change_zone", (zone, quick) => {
		guide.load(zone);
	});

	// Exit the game
	mod.game.on("leave_game", () => {
		mod.clearAllTimeouts();
		mod.clearAllIntervals();
	});

	// Boss skill action
	mod.hook("S_ACTION_STAGE", 9, { order: 15 }, e => {
		// Return if any of the below is false
		if (!mod.settings.enabled || !guide.obj.loaded || !e.skill.npc) return;
		if (!guide.obj.verbose && !guide.obj.spawnObject) return;

		let skillid = e.skill.id % 1000; // skill id range 100-200
		let eskillid = e.skill.id > 3000 ? e.skill.id : e.skill.id % 1000;
		const ent = entity["mobs"][e.gameId.toString()];

		// Due to a bug for some bizare reason we do this ugly hack
		e.loc.w = e.w;

		// We've confirmed it's a mob, so it's plausible we want to act on this
		if (guide.obj.type === SP)
			skillid = e.skill.id; // skill id range 1000-3000
		else if (guide.obj.type === ES)
			skillid = eskillid; // skill id range 100-200-3000

		if (ent)
			guide.handleEvent(Object.assign({}, ent, e), skillid, "s", {
				enabled: mod.settings.debug.all || mod.settings.debug.skill || (ent.templateId % 1 === 0 ? mod.settings.debug.boss : false),
				name: "Skill",
				color: cy
			}, e.speed, e.stage);
	});

	// Abnormality events
	mod.hook("S_ABNORMALITY_BEGIN", 4, { order: 15 }, abnormality_triggered);
	mod.hook("S_ABNORMALITY_REFRESH", 2, { order: 15 }, abnormality_triggered);

	// Abnormality triggered
	function abnormality_triggered(e) {
		// Return if any of the below is false
		if (!mod.settings.enabled || !guide.obj.loaded) return;
		if (!guide.obj.verbose && !guide.obj.spawnObject) return;

		// avoid errors ResidentSleeper (neede for abnormality refresh)
		if (!e.source) e.source = 0n;

		// If the boss/mob get"s a abnormality applied to it
		const target_ent = entity["mobs"][e.target.toString()];

		// If the boss/mob is the cause for the abnormality
		const source_ent = entity["mobs"][e.source.toString()];

		// Data for the debug
		const debug_data = {
			enabled: mod.settings.debug.all || mod.settings.debug.abnormal,
			name: "Abnormality",
			color: cp
		};

		// If the mob/boss applies an abnormality to me, it"s plausible we want to act on this
		if (source_ent && player.isMe(e.target))
			guide.handleEvent(source_ent, e.id, "am", debug_data);

		// If "nothing"/server applies an abnormality to me, it"s plausible we want to act on  (spam rip)
		if (player.isMe(e.target) && 0 == (e.source || 0))
			guide.handleEvent({
				huntingZoneId: 0,
				templateId: 0
			}, e.id, "ae", debug_data);

		// If it"s a mob/boss getting an abnormality applied to itself, it"s plausible we want to act on it
		if (target_ent)
			guide.handleEvent(target_ent, e.id, "ab", debug_data);
	}

	// Boss health bar event
	mod.hook("S_BOSS_GAGE_INFO", 3, e => {
		// Return if any of the below is false
		if (!mod.settings.enabled || !guide.obj.loaded) return;
		if (!guide.obj.verbose && !guide.obj.spawnObject) return;

		const ent = entity["mobs"][e.id.toString()];
		const hp = Math.floor(Number(e.curHp) / Number(e.maxHp) * 100);
		const key = `${ent.huntingZoneId}-${ent.templateId}`;

		// Check mob's hp of existing value for single call the event
		if (ent && guide.obj.mobs_hp[key] == hp) return;

		guide.obj.mobs_hp[key] = hp;

		// We"ve confirmed it"s a mob, so it"s plausible we want to act on this
		guide.handleEvent(ent, hp, "h", {
			enabled: mod.settings.debug.all || mod.settings.debug.hp,
			name: "Health",
			color: cr
		});
	});

	// Spawn NPC event
	mod.hook("S_SPAWN_NPC", 11, (e) => {
		// Return if any of the below is false
		if (!mod.settings.enabled || !guide.obj.loaded) return;
		if (!guide.obj.verbose && !guide.obj.spawnObject) return;

		const ent = entity["mobs"][e.gameId.toString()];

		if (ent) {
			guide.handleEvent(ent, false, "ns", {
				enabled: mod.settings.debug.all || mod.settings.debug.spawn,
				name: "Spawn",
				color: co
			});

			guide.obj.spawned_npcs[e.gameId.toString()] = ent;
		}
	});

	// Despawn NPC event
	mod.hook("S_DESPAWN_NPC", 3, { order: -100 }, (e) => {
		// Return if any of the below is false
		if (!mod.settings.enabled || !guide.obj.loaded) return;
		if (!guide.obj.verbose && !guide.obj.spawnObject) return;

		const ent = guide.obj.spawned_npcs[e.gameId.toString()];

		if (ent) {
			guide.handleEvent(ent, false, "nd", {
				enabled: mod.settings.debug.all || mod.settings.debug.spawn,
				name: "Despawn",
				color: cv
			});

			// Delete despawned NPC from list
			delete guide.obj.spawned_npcs[e.gameId];
		}
	});

	// Dungeon Message event
	mod.hook("S_DUNGEON_EVENT_MESSAGE", 2, e => {
		// Return if any of the below is false
		if (!mod.settings.enabled || !guide.obj.loaded) return;
		if (!guide.obj.verbose && !guide.obj.spawnObject) return;

		const result = /@dungeon:(\d+)/g.exec(e.message);

		if (result)
			guide.handleEvent({
				huntingZoneId: 0,
				templateId: 0
			}, parseInt(result[1]), "dm", {
				enabled: mod.settings.debug.all || mod.settings.debug.dm,
				name: "Dungeon Message",
				color: clb
			});
	});

	// Quest Balloon event
	mod.hook("S_QUEST_BALLOON", 1, e => {
		// Return if any of the below is false
		if (!mod.settings.enabled || !guide.obj.loaded) return;
		if (!guide.obj.verbose && !guide.obj.spawnObject) return;

		const source_ent = entity["mobs"][e.source.toString()];
		const result = /@monsterBehavior:(\d+)/g.exec(e.message);

		if (result && source_ent)
			guide.handleEvent(source_ent, parseInt(result[1]), "qb", {
				enabled: mod.settings.debug.all || mod.settings.debug.qb,
				name: "Quest Balloon",
				color: cb
			});
	});

	// Clear out all timers when the mod gets unloaded
	this.destructor = async () => {
		mod.clearAllTimeouts();
		mod.clearAllIntervals();
	};
};