"use strict";

class Commands {

	constructor(deps) {
		const { mod, lang, params, gui, guide } = deps;
		const { handlers, hooks } = guide;
		const { player } = mod.require.library;

		this.mod = mod;
		this.params = params;

		const voice = require("../voice");

		// Add module command
		mod.command.add(params.command, {

			debug(arg1) {
				// eslint-disable-next-line no-param-reassign
				if (!arg1) arg1 = "status";

				if (arg1 === "status") {
					Object.keys(mod.settings.debug).forEach(key => {
						mod.command.message(`${cw}Debug(${cy}${key}${cw}): ${mod.settings.debug[key] ? `${cg}enabled` : `${cr}disabled`}.`);
					});
					return;
				} else if (mod.settings.debug[arg1] === undefined)
					return mod.command.message(`${cr}Invalid sub command for debug mode: ${cw}${arg1}`);

				mod.settings.debug[arg1] = !mod.settings.debug[arg1];

				mod.command.message(`${cw}Debug(${cy}${arg1}${cw}) mode has been ${mod.settings.debug[arg1] ? `${cg}enabled` : `${cr}disabled`}.`);

				// Load required hook if guide loaded
				if (guide.obj.loaded)
					hooks.load([arg1], true);
			},

			event(arg1, arg2) {
				if (!mod.settings.enabled)
					return mod.command.message(`${cr}Module is disabled`);

				// If arg1 is "load", load guide from arg2 specified
				if (arg1 === "load") {
					if (!arg2)
						return mod.command.message(`${cr}Debug (event) invalid values: ${cw}${arg1}`);

					return guide.load(arg2, true);
				}

				// If arg1 is "reload", reload current loaded guide
				if (arg1 === "reload") {
					if (!guide.obj.loaded)
						return mod.command.message(`${cr}Guide not loaded`);

					return guide.load(guide.obj.id, true);
				}

				if (arg1 === "unload") {
					if (!guide.obj.loaded)
						return mod.command.message(`${cr}Guide not loaded`);

					return guide.unload(true);
				}

				// If we didn't get a second argument or the argument value isn't an event type, we return
				if (arg1 === "trigger" ? (!guide.obj.context[arg2]) : (!arg1 || !handlers[arg1] || !arg2))
					return mod.command.message(`${cr}Debug (event) invalid values: ${cw}${arg1} | ${arg2}`);

				// if arg2 is "trigger". It means we want to trigger a event
				if (arg1 === "trigger") {
					handlers.start_events(guide.obj.context[arg2], player, 1.0, arg2);
				} else {
					try {
						// Call a function handler with the event we got from arg2 with yourself as the entity
						handlers[arg1](JSON.parse(arg2), player);
					} catch (e) {
						mod.command.message(`${cr}Debug (event) invalid values: ${cw}${arg1} | ${arg2}`);
						mod.command.message(cr + e.toString());
					}
				}
			},

			spawnObject(arg1) {
				if (arg1) {
					if (mod.settings.dungeons[arg1]) {
						mod.settings.dungeons[arg1].spawnObject = !mod.settings.dungeons[arg1].spawnObject;
						handlers.text({
							"sub_type": "CGMSG",
							"message": `${lang.strings.spawnObject} ${lang.strings.fordungeon} "${mod.settings.dungeons[arg1].name}": ${cy}${mod.settings.dungeons[arg1].spawnObject ? lang.strings.enabled : lang.strings.disabled}`
						});

						// Reload settings for entered guide
						Object.assign(guide.obj, mod.settings.dungeons[arg1]);
					} else {
						handlers.text({
							"sub_type": "CRMSG",
							"message": lang.strings.dgnotfound
						});
					}
				} else {
					mod.settings.spawnObject = !mod.settings.spawnObject;
					handlers.text({
						"sub_type": "CGMSG",
						"message": `${lang.strings.spawnObject}: ${cy}${mod.settings.spawnObject ? lang.strings.enabled : lang.strings.disabled}`
					});
				}
			},

			verbose(arg1) {
				if (arg1) {
					if (mod.settings.dungeons[arg1]) {
						mod.settings.dungeons[arg1].verbose = !mod.settings.dungeons[arg1].verbose;
						handlers.text({
							"sub_type": "CGMSG",
							"message": `${lang.strings.verbose} ${lang.strings.fordungeon} "${mod.settings.dungeons[arg1].name}": ${cy}${mod.settings.dungeons[arg1].verbose ? lang.strings.enabled : lang.strings.disabled}`
						});

						// Reload settings for entered guide
						Object.assign(guide.obj, mod.settings.dungeons[arg1]);
					} else {
						handlers.text({
							"sub_type": "CRMSG",
							"message": lang.strings.dgnotfound
						});
					}
				} else {
					handlers.text({
						"sub_type": "CRMSG",
						"message": lang.strings.dgnotspecified
					});
				}
			},

			voice() {
				mod.settings.speaks = !mod.settings.speaks;

				handlers.text({
					"sub_type": "CGMSG",
					"message": `${lang.strings.speaks}: ${cy}${mod.settings.speaks ? lang.strings.enabled : lang.strings.disabled}`
				});
			},

			stream() {
				mod.settings.stream = !mod.settings.stream;

				handlers.text({
					"sub_type": "CGMSG",
					"message": `${lang.strings.stream}: ${cy}${mod.settings.stream ? lang.strings.enabled : lang.strings.disabled}`
				});
			},

			lNotice() {
				mod.settings.lNotice = !mod.settings.lNotice;
				handlers.text({
					"sub_type": "CGMSG",
					"message": `${lang.strings.lNotice}: ${cy}${mod.settings.lNotice ? lang.strings.enabled : lang.strings.disabled}`
				});
			},

			gNotice() {
				mod.settings.gNotice = !mod.settings.gNotice;

				handlers.text({
					"sub_type": "CGMSG",
					"message": `${lang.strings.gNotice}: ${cy}${mod.settings.gNotice ? lang.strings.enabled : lang.strings.disabled}`
				});
			},

			dungeons() {
				Object.keys(mod.settings.dungeons).forEach(key => {
					if (!mod.settings.dungeons[key].name) return;

					handlers.text({
						"sub_type": "PRMSG",
						"message": `${cw}${key} - ${cy}${mod.settings.dungeons[key].name}`
					});
				});
			},

			gui() {
				gui.show("index", "TERA-Guide");
			},

			help() {
				lang.strings.helpbody.forEach(helpstring => {
					handlers.text({
						"sub_type": helpstring[1],
						"message": helpstring[0]
					});
				});
			},

			guivoicetest() {
				voice.speak(lang.strings.voicetest, mod.settings.rate);
				handlers.text({
					"sub_type": "CGMSG",
					"message": lang.strings.voicetest
				});
			},

			$default(arg1) {
				// Enable/Disable the module
				if (arg1 === undefined) {
					mod.settings.enabled = !mod.settings.enabled;

					// Unload guide if disables module
					if (!mod.settings.enabled)
						guide.unload();
					else if (!guide.obj.loaded)
						guide.load(guide.obj.last_id);

					handlers.text({
						"sub_type": "CGMSG",
						"message": `${lang.strings.module}: ${cy}${mod.settings.enabled ? lang.strings.enabled : lang.strings.disabled}`,
					});
				// Set messages text color
				} else if (["cr", "co", "cy", "cg", "cv", "cb", "clb", "cdb", "cp", "clp", "cw", "cgr", "cbl"].includes(arg1)) {
					mod.settings.cc.splice(0, 1, global[arg1]);

					handlers.text({
						"sub_type": "PRMSG",
						"message": lang.strings.colorchanged
					});
					if (!mod.settings.lNotice && !mod.settings.stream)
						handlers.send.dungeonEvent(lang.strings.colorchanged, mod.settings.cc, spg);
				// Set voice rate
				} else if (parseInt(arg1) >= 1 && parseInt(arg1) <= 10) {
					handlers.text({
						"sub_type": "CGMSG",
						"message": `${lang.strings.ratechanged} ${cy}${arg1}`
					});

					mod.settings.rate.splice(0, 1, parseInt(arg1));
				// Unknown command
				} else {
					handlers.text({
						"sub_type": "CRMSG",
						"message": lang.strings.unknowncommand
					});
				}
			}
		});
	}

	destructor() {
		this.mod.command.remove(this.params.command);
	}
}

module.exports = Commands;