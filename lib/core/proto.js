"use strict";

// Proto data
const protoData = {
	"C_ADMIN": {
		"default": 1
	},
	"C_CONFIRM_UPDATE_NOTIFICATION": {
		"default": "raw"
	},
	"S_ABNORMALITY_BEGIN": {
		"default": 4
	},
	"S_ABNORMALITY_END": {
		"default": 1
	},
	"S_ABNORMALITY_REFRESH": {
		"default": 2
	},
	"S_ACTION_STAGE": {
		"default": 9
	},
	"S_ANNOUNCE_UPDATE_NOTIFICATION": {
		"default": 1
	},
	"S_BOSS_GAGE_INFO": {
		"default": 3
	},
	"S_CHAT": {
		"default": 3
	},
	"S_DESPAWN_BONFIRE": {
		"default": 2
	},
	"S_DESPAWN_BUILD_OBJECT": {
		"default": 2
	},
	"S_DESPAWN_COLLECTION": {
		"default": 2
	},
	"S_DESPAWN_DROPITEM": {
		"default": 4
	},
	"S_DESPAWN_NPC": {
		"default": 3
	},
	"S_DUNGEON_EVENT_MESSAGE": {
		"default": 2
	},
	"S_PARTY_MARKER": {
		"default": 1
	},
	"S_QUEST_BALLOON": {
		"default": 1
	},
	"S_SPAWN_BONFIRE": {
		"default": 2
	},
	"S_SPAWN_BUILD_OBJECT": {
		"default": 2
	},
	"S_SPAWN_COLLECTION": {
		"default": 4
	},
	"S_SPAWN_DROPITEM": {
		"default": 8,
		"99": 9
	},
	"S_SPAWN_NPC": {
		"default": 11
	},
};

/**
 * @typedef {import("../../index.js").deps} deps
 */

class Proto {
	/**
	 * Creates an instance of Proto.
	 * @param {deps} deps
	 * @memberof Proto
	 */
	constructor(deps) {
		this.__mod = deps.mod;
	}

	/**
	 * Get array of arguments data.
	 * @param {string} name Packet name.
	 * @return {*} Packet arguments data.
	 * @memberof Proto
	 */
	getData(name) {
		let version = protoData[name][this.__mod.majorPatchVersion];

		return version ? [name, version] : [name, protoData[name].default];
	}
}

module.exports = Proto;