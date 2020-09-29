'use strict';

module.exports = (mod, guide, lang, dispatch, params) => {

	const voice = require("../voice");
	const command = mod.command;
	const { player } = mod.require.library;

	// Add module command
	command.add(params.command, {

		debug(arg1) {
			if (!arg1) arg1 = "status";

			if (arg1 === "status") {
				for (let [key, value] of Object.entries(mod.settings.debug)) {
					command.message(`debug(${key}): ${value ? "enabled" : "disabled"}.`);
				}
				return;
			} else if (mod.settings.debug[arg1] === undefined)
				return command.message(`Invalid sub command for debug mode. ${arg1}`);

			mod.settings.debug[arg1] = !mod.settings.debug[arg1];
			command.message(`Guide module debug(${arg1}) mode has been ${mod.settings.debug[arg1] ? "enabled" : "disabled"}.`);
		},

		event(arg1, arg2) {
			// If arg1 is "load", load guide from arg2 specified
			if (arg1 === "load") {
				if (!arg2)
					return command.message(`Invalid values for sub command "event" ${arg1}`);

				return loadHandler(arg2, true);
			}

			// If arg1 is "reload", reload current loaded guide
			if (arg1 === "reload") {
				if (!guide.loaded)
					return command.message("Guide not loaded");

				return loadHandler(guide.id, true);
			}

			// If we didn't get a second argument or the argument value isn't an event type, we return
			if (arg1 === "trigger" ? (!guide.context[arg2]) : (!arg1 || !eventHandlers[arg1] || !arg2))
				return command.message(`Invalid values for sub command "event" ${arg1} | ${arg2}`);

			// if arg2 is "trigger". It means we want to trigger a event
			if (arg1 === "trigger") {
				eventHandler(guide.context[arg2], player);
			} else {
				try {
					// Call a function handler with the event we got from arg2 with yourself as the entity
					eventHandlers[arg1](JSON.parse(arg2), player);
				} catch (e) {
					command.message(`Invalid values for sub command "event" ${arg1} | ${arg2}`);
					command.message(cr + e.toString());
				}
			}
		},

		spawnObject(arg1) {
			if (arg1) {
				if (mod.settings.dungeons[arg1]) {
					mod.settings.dungeons[arg1].spawnObject = !mod.settings.dungeons[arg1].spawnObject;
					textHandler({
						"sub_type": "PRMSG",
						"message": `${lang.strings.spawnObject} ${lang.strings.fordungeon} "${mod.settings.dungeons[arg1].name}": ${mod.settings.dungeons[arg1].spawnObject ? lang.strings.enabled : lang.strings.disabled}`
					});

					// Reload settings for entered guide
					Object.assign(guide, mod.settings.dungeons[arg1]);
				} else {
					textHandler({
						"sub_type": "PRMSG",
						"message": lang.strings.dgnotfound
					});
				}
			} else {
				mod.settings.spawnObject = !mod.settings.spawnObject;
				textHandler({
					"sub_type": "PRMSG",
					"message": `${lang.strings.spawnObject} ${mod.settings.spawnObject ? lang.strings.enabled : lang.strings.disabled}`
				});
			}
		},

		verbose(arg1) {
			if (arg1) {
				if (mod.settings.dungeons[arg1]) {
					mod.settings.dungeons[arg1].verbose = !mod.settings.dungeons[arg1].verbose;
					textHandler({
						"sub_type": "PRMSG",
						"message": `${lang.strings.verbose} ${lang.strings.fordungeon} "${mod.settings.dungeons[arg1].name}": ${mod.settings.dungeons[arg1].verbose ? lang.strings.enabled : lang.strings.disabled}`
					});

					// Reload settings for entered guide
					Object.assign(guide, mod.settings.dungeons[arg1]);
				} else {
					textHandler({
						"sub_type": "PRMSG",
						"message": lang.strings.dgnotfound
					});
				}
			} else {
				textHandler({
					"sub_type": "PRMSG",
					"message": lang.strings.dgnotspecified
				});
			}
		},

		voice() {
			mod.settings.speaks = !mod.settings.speaks;

			textHandler({
				"sub_type": "PRMSG",
				"message": `${lang.strings.speaks}: ${mod.settings.speaks ? lang.strings.enabled : lang.strings.disabled}`
			});
		},

		stream() {
			mod.settings.stream = !mod.settings.stream;

			textHandler({
				"sub_type": "PRMSG",
				"message": `${lang.strings.stream}: ${mod.settings.stream ? lang.strings.enabled : lang.strings.disabled}`
			});
		},

		lNotice() {
			mod.settings.lNotice = !mod.settings.lNotice;
			textHandler({
				"sub_type": "PRMSG",
				"message": `${lang.strings.lNotice}: ${mod.settings.lNotice ? lang.strings.enabled : lang.strings.disabled}`
			});
		},

		gNotice() {
			mod.settings.gNotice = !mod.settings.gNotice;

			textHandler({
				"sub_type": "PRMSG",
				"message": `${lang.strings.gNotice}: ${mod.settings.gNotice ? lang.strings.enabled : lang.strings.disabled}`
			});
		},

		dungeons() {
			for (const [id, dungeon] of Object.entries(mod.settings.dungeons)) {
				if (!dungeon.name) continue;

				textHandler({
					"sub_type": "PRMSG",
					"message": `${id} - ${dungeon.name}`
				});
			}
		},

		gui() {
			guiHandler("index", "TERA-Guide");
		},

		help() {
			for (const helpstring of lang.strings.helpbody) {
				textHandler({
					"sub_type": helpstring[1],
					"message": helpstring[0]
				});
			}
		},

		guivoicetest() {
			voice.speak(lang.strings.voicetest, mod.settings.rate);
			textHandler({
				"sub_type": "PRMSG",
				"message": lang.strings.voicetest
			});
		},

		$default(arg1) {
			// Enable/Disable the module
			if (arg1 === undefined) {
				mod.settings.enabled = !mod.settings.enabled;

				textHandler({
					"sub_type": "PRMSG",
					"message": `${lang.strings.module}: ${mod.settings.enabled ? lang.strings.enabled : lang.strings.disabled}`,
				});
			// Set messages text color
			} else if (["cr", "co", "cy", "cg", "cv", "cb", "clb", "cdb", "cp", "clp", "cw", "cgr", "cbl"].includes(arg1)) {
				mod.settings.cc.splice(0, 1, eval(arg1));

				textHandler({
					"sub_type": "PRMSG",
					"message": lang.strings.colorchanged
				});
				if (!mod.settings.lNotice && !mod.settings.stream)
					sendDungeonEvent(lang.strings.colorchanged, mod.settings.cc, spg);
			// Set voice rate
			} else if (parseInt(arg1) >= 1 && parseInt(arg1) <= 10) {
				textHandler({
					"sub_type": "PRMSG",
					"message": `${lang.strings.ratechanged} ${arg1}`
				});

				mod.settings.rate.splice(0, 1, parseInt(arg1));
			// Unknown command
			} else {
				textHandler({
					"sub_type": "PRMSG",
					"message": lang.strings.unknowncommand
				});
			}
		}
	});

	// Remove the chat command when the mod gets unloaded 
	this.destructor = async () => {
		command.remove(params.command);
	};
};