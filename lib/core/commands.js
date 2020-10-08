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
		const { mod, lang, params, gui, guide, handlers, hooks } = deps;
		const { player } = mod.require.library;

		this.mod = mod;
		this.params = params;

		// Add module command
		mod.command.add(params.command, {

			"$none": () => {
				// Enable/Disable the module
				mod.settings.enabled = !mod.settings.enabled;

				// Unload guide if disables the module
				if (!mod.settings.enabled)
					guide.unload();
				else if (!guide.obj.loaded)
					guide.load(guide.obj.last_id);

				mod.command.message(`${cg}${lang.strings.module}: ${cy}${mod.settings.enabled ? lang.strings.enabled : lang.strings.disabled}`);
			},

			"$default": (arg1) => {
				// Set messages text color
				if (["cr", "co", "cy", "cg", "cv", "cb", "clb", "cdb", "cp", "clp", "cw", "cgr", "cbl"].includes(arg1)) {
					mod.settings.cc.splice(0, 1, global[arg1]);
					mod.command.message(`${mod.settings.cc}${lang.strings.colorchanged}`);

					if (!mod.settings.lNotice && !mod.settings.stream)
						handlers.send.dungeonEvent(lang.strings.colorchanged, mod.settings.cc, spg);
				// Set voice rate
				} else if (parseInt(arg1) >= 1 && parseInt(arg1) <= 10) {
					mod.settings.rate.splice(0, 1, parseInt(arg1));
					mod.command.message(`${cg}${lang.strings.ratechanged} ${cy}${arg1}`);
				// Unknown command
				} else
					mod.command.message(`${cr}${lang.strings.unknowncommand}`);
			},

			"help": () => {
				lang.strings.helpbody.forEach(helpstring => {
					handlers.text({ "sub_type": helpstring[1], "message": helpstring[0] });
				});
			},

			"debug": (arg1) => {
				// Debug settings status
				if (!arg1 || arg1 === "status") {
					Object.keys(mod.settings.debug).forEach(key => {
						mod.command.message(`${cw}Debug(${cy}${key}${cw}): ${mod.settings.debug[key] ? `${cg}enabled` : `${cr}disabled`}.`);
					});
					return;
				}

				// Change debug setting
				if (mod.settings.debug[arg1] === undefined)
					return mod.command.message(`${cr}Invalid sub command for debug mode: ${cw}${arg1}`);

				mod.settings.debug[arg1] = !mod.settings.debug[arg1];
				mod.command.message(`${cw}Debug(${cy}${arg1}${cw}) mode has been ${mod.settings.debug[arg1] ? `${cg}enabled` : `${cr}disabled`}.`);

				// Load required hook after change setting if guide loaded
				if (guide.obj.loaded)
					hooks.load([arg1], true);
			},

			"event": (arg1, arg2) => {
				if (!mod.settings.enabled)
					return mod.command.message(`${cy}Module is disabled.`);

				// Load guide
				if (["load", "l"].includes(arg1)) {
					if (!arg2)
						return mod.command.message(`${cr}Debug (event load) invalid values: ${cw}${arg1}`);

					return guide.load(arg2, true);
				}

				// Reload loaded guide
				if (["reload", "r"].includes(arg1)) {
					if (!guide.obj.loaded)
						return mod.command.message(`${cy}Guide not loaded.`);

					return guide.load(guide.obj.id, true);
				}

				// Unload loaded guide
				if (["unload", "u"].includes(arg1)) {
					if (!guide.obj.loaded)
						return mod.command.message(`${cy}Guide not loaded.`);

					return guide.unload(true);
				}

				// Trigger specified event entry of guide file
				if (["trigger", "t"].includes(arg1) && arg2) {
					if (guide.listenerCount(arg2) === 0)
						return mod.command.message(`${cr}Debug (event trigger) invalid values: ${cw}${arg2}`);

					// Emit event
					return guide.emit(arg2, player);
				}

				// Execute raw JSON
				if (!arg1 || !arg2)
					return mod.command.message(`${cr}Debug (event) needed valid arguments.`);

				try {
					// Call a handler with the event we got from arg2 with yourself as the entity
					handlers.apply({"type": arg1, ...JSON.parse(arg2)}, player);
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

						// Reload settings for entered guide
						Object.assign(guide.obj, mod.settings.dungeons[arg1]);
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

						// Reload settings for entered guide
						Object.assign(guide.obj, mod.settings.dungeons[arg1]);
					} else
						mod.command.message(`${cr}${lang.strings.dgnotfound}`);
				} else
					mod.command.message(`${cr}${lang.strings.dgnotspecified}`);
			},

			"voice": () => {
				mod.settings.speaks = !mod.settings.speaks;
				mod.command.message(`${cg}${lang.strings.speaks}: ${cy}${mod.settings.speaks ? lang.strings.enabled : lang.strings.disabled}`);
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
				gui.show("index", "TERA-Guide");
			},

			"ui": () => {
				gui.show("index", "TERA-Guide");
			},

			"guivoicetest": () => {
				handlers.voice.speak(lang.strings.voicetest, mod.settings.rate, false, e => {
					if (e) return mod.warn(e);
				});
				mod.command.message(`${cg}${lang.strings.voicetest}`);
			},
		});
	}

	destructor() {
		this.mod.command.remove(this.params.command);
	}
}

module.exports = Commands;