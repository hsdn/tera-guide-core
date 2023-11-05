"use strict";

/**
 * @typedef {import("../../index").deps} deps
 */

class Commands {
	/**
	 * Creates an instance of Commands.
	 * @param {deps} deps
	 * @memberof Commands
	 */
	constructor(deps) {
		const { mod, lang, params, gui, zone, handlers } = deps;
		const { player } = mod.require.library;

		this.__mod = mod;
		this.__params = params;

		// Add module command
		mod.command.add(params.command, {

			"$none": () => {
				// Enable/Disable the module
				mod.settings.enabled = !mod.settings.enabled;
				mod.command.message(`${cg}${lang.strings.module}: ${cy}${mod.settings.enabled ? lang.strings.enabled : lang.strings.disabled}`);

				if (!mod.settings.enabled)
					// Unload guide if disable the module
					zone.unload();
				else if (!zone.loaded)
					// Load guide if enable the module
					zone.load();
			},

			"$default": (arg1) => {
				// Set messages text color
				if (["cr", "co", "cy", "cg", "cv", "cb", "clb", "cdb", "cp", "clp", "cw", "cgr", "cbl"].includes(arg1)) {
					mod.settings.cc.splice(0, 1, global[arg1]);
					mod.command.message(`${mod.settings.cc}${lang.strings.colorchanged}`);
					handlers.types.text({ "sub_type": "message", "message": lang.strings.colorchanged, "speech": false });
				// Set voice gender
				} else if (["male", "female"].includes(arg1)) {
					mod.settings.speech.gender = arg1;
					mod.command.message(`${cg}${lang.strings.voice}: ${cy}${lang.strings[arg1]}`);
				// Set voice rate
				} else if (parseInt(arg1) >= 1 && parseInt(arg1) <= 10) {
					mod.settings.speech.rate = parseInt(arg1);
					mod.command.message(`${cg}${lang.strings.rate}: ${cy}${arg1}`);
				// Set language
				} else if (["auto", ...this.__params.languages].includes(arg1)) {
					mod.settings.language = arg1;
					// Reinitialize language
					lang.init();
					mod.command.message(`${cg}${lang.strings.language}: ${cy}${arg1}`);
				// Unknown command
				} else
					mod.command.message(`${cr}${lang.strings.unknowncommand}`);
			},

			"help": () => {
				lang.strings.helpbody.forEach(helpstring =>
					handlers.types.text({ "sub_type": helpstring[1], "message": helpstring[0] })
				);
			},

			"debug": (arg1, arg2) => {
				// Debug settings status
				if (!arg1 || arg1 === "status") {
					Object.keys(mod.settings.debug).forEach(key =>
						mod.command.message(`${cw}Debug(${cy}${key}${cw}): ${mod.settings.debug[key] ? `${cg}enabled` : `${cr}disabled`}.`)
					);
					return;
				}

				// Debug gui
				if (["gui", "ui"].includes(arg1)) {
					return gui.show("debug", arg2 || 1);
				}

				// Change debug setting
				if (mod.settings.debug[arg1] === undefined)
					return mod.command.message(`${cr}Invalid sub command for debug mode: ${cw}${arg1}`);

				mod.settings.debug[arg1] = !mod.settings.debug[arg1];
				mod.command.message(`${cw}Debug(${cy}${arg1}${cw}) mode has been ${mod.settings.debug[arg1] ? `${cg}enabled` : `${cr}disabled`}.`);

				// Load required hook after change setting if guide loaded
				if (zone.loaded)
					zone.guide.hooks.load([arg1], true);
			},

			"event": (arg1, arg2) => {
				if (!mod.settings.enabled)
					return mod.command.message(`${cy}Module is disabled.`);

				// Load guide
				if (["load", "l"].includes(arg1)) {
					if (!arg2)
						return mod.command.message(`${cr}Debug (event load) invalid values: ${cw}${arg1}`);

					return zone.load(arg2, true);
				}

				// Reload loaded guide
				if (["reload", "r"].includes(arg1)) {
					if (!zone.loaded)
						return mod.command.message(`${cy}Guide not loaded.`);

					return zone.load(zone.guide.id, true);
				}

				// Unload loaded guide
				if (["unload", "u"].includes(arg1)) {
					if (!zone.loaded)
						return mod.command.message(`${cy}Guide not loaded.`);

					return zone.unload(true);
				}

				// Get guide status
				if (["status", "s"].includes(arg1)) {
					// Guide status
					if (!zone.loaded)
						return mod.command.message(`${cy}Guide not loaded.`);

					mod.command.message(`${cw}Guide ID: ${cy}${zone.guide.id}`);
					mod.command.message(`${cw}Guide name: ${cy}${zone.settings.name || "not defined"}`);
					// eslint-disable-next-line no-nested-ternary
					mod.command.message(`${cw}Guide type: ${cy}${zone.guide.type === SP ? "SP" : (zone.guide.type === ES ? "ES" : "standard")}`);

					// Handlers status
					if (zone.guide.eventNames().length > 1) {
						mod.command.message(`${cw}Added events:`);

						zone.guide.eventNames().forEach(key => {
							if (key !== "error")
								mod.command.message(`${cy}${key} ${cw}(${zone.guide.listenerCount(key)})`);
						});
					} else
						mod.command.message(`${cgr}No added events.`);

					// Hooks status
					if (zone.guide.hooks.list.size !== 0) {
						mod.command.message(`${cw}Loaded hooks:`);

						zone.guide.hooks.list.forEach(attr =>
							mod.command.message(`${cy}${attr.debug.name} ${cw}[${attr.keys.toString()}]`)
						);
					} else
						mod.command.message(`${cgr}No loaded hooks.`);

					return;
				}

				// Trigger specified event entry of guide file
				if (["trigger", "t"].includes(arg1) && arg2) {
					if (!zone.loaded)
						return mod.command.message(`${cy}Guide not loaded.`);

					if (zone.guide.listenerCount(arg2) === 0)
						return mod.command.message(`${cr}Debug (event trigger) invalid values: ${cw}${arg2}`);

					mod.command.message(`${cy}Triggering event: ${cw}${arg2}`);

					// Emit event
					return zone.guide.emit(arg2, player);
				}

				// Execute raw JSON
				if (!arg1 || !arg2)
					return mod.command.message(`${cr}Debug (event) needed valid arguments.`);

				try {
					mod.command.message(`${cy}Triggering event: ${cw}${arg1} | ${arg2}`);

					// Call a handler with the event we got from arg2 with yourself as the entity
					handlers.trigger({ "type": arg1, ...JSON.parse(arg2) }, player);
				} catch (e) {
					mod.command.message(`${cr}Debug (event) invalid values: ${cw}${arg1} | ${arg2}`);
					mod.command.message(cr + e.toString());
				}
			},

			"spawnObject": (arg1) => {
				if (arg1) {
					if (mod.settings.dungeons[arg1]) {
						mod.settings.dungeons[arg1].spawnObject = !mod.settings.dungeons[arg1].spawnObject;
						mod.command.message(`${cg}${lang.strings.spawnObject} ${lang.strings.fordungeon} "${mod.settings.dungeons[arg1].name || arg1}": ${cy}${mod.settings.dungeons[arg1].spawnObject ? lang.strings.enabled : lang.strings.disabled}`);
					} else
						mod.command.message(`${cr}${lang.strings.dgnotfound}`);
				} else {
					mod.settings.spawnObject = !mod.settings.spawnObject;
					mod.command.message(`${cg}${lang.strings.spawnObject}: ${cy}${mod.settings.spawnObject ? lang.strings.enabled : lang.strings.disabled}`);
				}
			},

			"verbose": (arg1) => {
				if (arg1) {
					if (mod.settings.dungeons[arg1]) {
						mod.settings.dungeons[arg1].verbose = !mod.settings.dungeons[arg1].verbose;
						mod.command.message(`${cg}${lang.strings.verbose} ${lang.strings.fordungeon} "${mod.settings.dungeons[arg1].name || arg1}": ${cy}${mod.settings.dungeons[arg1].verbose ? lang.strings.enabled : lang.strings.disabled}`);
					} else
						mod.command.message(`${cr}${lang.strings.dgnotfound}`);
				} else
					mod.command.message(`${cr}${lang.strings.dgnotspecified}`);
			},

			"voice": () => {
				mod.settings.speech.enabled = !mod.settings.speech.enabled;
				mod.command.message(`${cg}${lang.strings.speaks}: ${cy}${mod.settings.speech.enabled ? lang.strings.enabled : lang.strings.disabled}`);
			},

			"stream": () => {
				mod.settings.stream = !mod.settings.stream;
				mod.command.message(`${cg}${lang.strings.stream}: ${cy}${mod.settings.stream ? lang.strings.enabled : lang.strings.disabled}`);
			},

			"lNotice": () => {
				mod.settings.lNotice = !mod.settings.lNotice;
				mod.command.message(`${cg}${lang.strings.lNotice}: ${cy}${mod.settings.lNotice ? lang.strings.enabled : lang.strings.disabled}`);
			},

			"gNotice": () => {
				mod.settings.gNotice = !mod.settings.gNotice;
				mod.command.message(`${cg}${lang.strings.gNotice}: ${cy}${mod.settings.gNotice ? lang.strings.enabled : lang.strings.disabled}`);
			},

			"dungeons": () => {
				Object.keys(mod.settings.dungeons).forEach(key => {
					if (!mod.settings.dungeons[key].name) return;
					mod.command.message(`${cw}${key} - ${cy}${mod.settings.dungeons[key].name}`);
				});
			},

			"gui": () => {
				gui.show("index");
			},

			"ui": () => {
				gui.show("index");
			},

			"guivoicetest": () => {
				handlers.send.voice(lang.strings.voicetest, true);
				mod.command.message(`${cg}${lang.strings.voicetest}`);
			}
		});
	}

	destructor() {
		this.__mod.command.remove(this.__params.command);
	}
}

module.exports = Commands;