"use strict";

const path = require("path");
const fs = require("fs");
const readdir = require("util").promisify(fs.readdir);
const readline = require("readline");

const Guide = require("./guide");

/**
 * @typedef {import("../../index").deps} deps
 */

class Zone {
	/**
	 * Creates an instance of Zone.
	 * @param {deps} deps
	 * @memberof Zone
	 */
	constructor(deps) {
		this.__deps = deps;

		// Default zone settings
		this.__defaultSettings = Object.freeze({
			"name": undefined,
			"verbose": true,
			"spawnObject": true
		});

		// Entered zone id
		this.__id = undefined;

		// Instance of loaded guide
		this.__guide = undefined;

		// Settings of entered zone
		this.__settings = undefined;

		// Guide loaded status
		this.__loaded = false;

		// Migrate settings (compat)
		this.__migrateSettings();
	}

	/**
	 * Initialize dungeon zones configuration.
	 * @memberof Zone
	 */
	async init() {
		// Create a list of available guide ids
		const availableGuides = new Set();

		// Read directory of the available guides
		(await readdir(this.getGuidePath()))
			.forEach(file => {
				if (!file.endsWith(".js")) return;

				const zoneId = file.split(".")[0];

				// Checking the dungeon id for a number, if it is a number add to the settings
				if (!this.__deps.mod.settings.dungeons[zoneId] && !isNaN(parseInt(zoneId)))
					this.__deps.mod.settings.dungeons[zoneId] = { "name": undefined, ...this.__defaultSettings };

				// Add id to list of available guide ids
				availableGuides.add(zoneId);
			});

		// Remove old configuration
		Object.keys(this.__deps.mod.settings.dungeons).forEach(zoneId => {
			if (!availableGuides.has(zoneId))
				delete this.__deps.mod.settings.dungeons[zoneId];
		});

		let queredFromClient = false;

		// Try to query a list of dungeon names and apply them to settings
		try {
			await this.queryDungeonNamesFromClient((zoneId, name) => {
				queredFromClient = true;
				if (!this.__deps.mod.settings.dungeons[zoneId])
					return;
				this.__deps.mod.settings.dungeons[zoneId].name = name;
			});
		} catch (e) {
			this.__deps.mod.warn(e);
		}

		// If the client functions is not available, try to read dungeon list
		// from guides directory, as dungeon name uses first line of the guide file
		if (!queredFromClient)
			await this.queryDungeonNamesFromFiles((zoneId, name) => {
				if (!this.__deps.mod.settings.dungeons[zoneId])
					return;
				this.__deps.mod.settings.dungeons[zoneId].name = name;
			});
	}

	/**
	 * Load zone.
	 * @param {string} [id=undefined] Zone identifier.
	 * @param {boolean} [debugMode=false] Force enable debug messages.
	 * @return {void}
	 * @memberof Zone
	 */
	load(id = undefined, debugMode = false) {
		// Return if guide is loaded and zone id not changed
		if (this.__loaded && id.toString() === this.__guide.id && !debugMode)
			return;

		// Unload current loaded guide
		this.unload(debugMode);

		// Set zone id of the entered zone
		if (id !== undefined)
			this.__id = id.toString();

		// Return if module disabled
		if (!this.__deps.mod.settings.enabled)
			return;

		// Send debug message
		if (!debugMode)
			this.__deps.handlers.send.debug(false, `Entered zone: ${this.__id}`);

		// Check the entered zone id and set settings for them
		if (this.__id === "test")
			this.__settings = { ...this.__defaultSettings, "name": "Test Guide" };
		else if (this.__deps.mod.settings.dungeons[this.__id])
			this.__settings = this.__deps.mod.settings.dungeons[this.__id];
		else {
			if (debugMode)
				this.__deps.handlers.send.debug(true, `Guide "${this.__id}" is not found.`);
			return;
		}

		// Create an instance of Guide
		const guide = new Guide(this.__deps, this.__id);

		try {
			// Try to load a guide for the entered zone
			guide.load(debugMode);
		} catch (e) {
			if (e.code === "ENOENT")
				return this.__deps.mod.warn(`Script file for the guide "${this.__id}" is not a loadable.`);

			return this.__deps.mod.error(`Unable to load a script for the guide "${this.__id}":\n`, e);
		}

		// Set an instance of Guide
		this.__guide = guide;

		// Send debug message
		this.__deps.handlers.send.debug(debugMode, `Guide "${guide.id}" loaded.`);

		// Send welcome text
		this.__deps.handlers.send.welcomeMessage(debugMode);

		// Set guide as a loaded
		this.__loaded = true;
	}

	/**
	 * Unload loaded zone.
	 * @param {boolean} [debugMode=false] Force enable debug messages.
	 * @memberof Zone
	 */
	unload(debugMode = false) {
		if (!this.__loaded)
			return;

		// Unload loaded guide
		this.__guide.unload(debugMode);

		// Clear out properties
		this.__guide = undefined;
		this.__settings = undefined;

		// Set guide as not a loaded
		this.__loaded = false;
	}

	/**
	 * Query dungeon names from client.
	 * @param {Function} handler
	 * @memberof Zone
	 */
	async queryDungeonNamesFromClient(handler) {
		const dungeons = new Map();

		// Read list of available dungeons
		(await this.__deps.mod.queryData("/EventMatching/EventGroup/Event@type=?", ["Dungeon"], true, true, ["id"]))
			.map(res => {
				const zoneId = res.children
					.find(x => x.name == "TargetList").children
					.find(x => x.name == "Target").attributes.id;

				let dungeon = dungeons.get(zoneId);

				if (!dungeon) {
					dungeon = { "id": zoneId, "name": "" };
					dungeons.set(zoneId, dungeon);
				}

				return dungeon;
			});

		// Read list of dungeon name strings
		(await this.__deps.mod.queryData("/StrSheet_Dungeon/String@id=?", [[...dungeons.keys()]], true))
			.forEach(res => handler(
				res.attributes.id.toString(),
				res.attributes.string.toString()
			));
	}

	/**
	 * Query dungeon names from the guides files, as name uses first line of the file.
	 * @param {Function} handler
	 * @memberof Zone
	 */
	async queryDungeonNamesFromFiles(handler) {
		// Read directory of the available guides
		(await readdir(this.getGuidePath()))
			.forEach(file => {
				if (!file.endsWith(".js")) return;

				const zoneId = file.split(".")[0];

				const lineReader = readline.createInterface({
					"input": fs.createReadStream(path.resolve(this.__deps.mod.info.path, "guides", file))
				});

				// Get first line of file and set as dungeon name
				lineReader.on("line", line => {
					handler(zoneId, line.trim().replace(new RegExp("^[/ ]+", "g"), "") || zoneId);

					lineReader.close();
					lineReader.removeAllListeners();
				});
			});
	}

	/**
	 * Get path of the guide.
	 * @param {boolean} [useLanguages=false] Allow to use translations folders.
	 * @param {string[]} pathArgs Array of path arguments.
	 * @return {string} Path string.
	 * @memberof Zone
	 */
	getGuidePath(useLanguages = false, ...pathArgs) {
		let resolvedPath = undefined;

		// Try to use path with translation
		if (useLanguages) {
			resolvedPath = path.resolve(this.__deps.mod.info.path, `guides_${this.__deps.lang.languageUC}`, ...pathArgs);

			if (!fs.existsSync(resolvedPath))
				resolvedPath = undefined;
		}

		// Use default path in it's not exists
		if (!resolvedPath)
			resolvedPath = path.resolve(this.__deps.mod.info.path, "guides", ...pathArgs);

		return resolvedPath;
	}

	/**
	 * Get zone id.
	 * @readonly
	 * @memberof Zone
	 */
	get id() {
		return this.__id;
	}

	/**
	 * Get zone settings.
	 * @readonly
	 * @memberof Zone
	 */
	get settings() {
		return this.__settings;
	}

	/**
	 * Get zone loaded status.
	 * @readonly
	 * @memberof Zone
	 */
	get loaded() {
		return this.__loaded;
	}

	/**
	 * Get instance of Guide (if loaded).
	 * @readonly
	 * @memberof Zone
	 */
	get guide() {
		return this.__guide;
	}

	__migrateSettings() {
		if (this.__deps.mod.settings.dungeons === null || typeof this.__deps.mod.settings.dungeons !== "object" || Array.isArray(this.__deps.mod.settings.dungeons))
			this.__deps.mod.settings.dungeons = {};
	}

	destructor() {
		this.unload();
	}
}

module.exports = Zone;