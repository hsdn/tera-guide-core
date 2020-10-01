'use strict';

module.exports = (mod, lang, params, guide) => {

	const voice = require("../voice");
	const { player } = mod.require.library;

	// Add module command
	mod.command.add(params.command, {

		debug(arg1) {
			if (!arg1) arg1 = "status";

			if (arg1 === "status") {
				for (let [key, value] of Object.entries(mod.settings.debug)) {
					mod.command.message(`debug(${key}): ${value ? "enabled" : "disabled"}.`);
				}
				return;
			} else if (mod.settings.debug[arg1] === undefined)
				return mod.command.message(`Invalid sub command for debug mode. ${arg1}`);

			mod.settings.debug[arg1] = !mod.settings.debug[arg1];
			mod.command.message(`Guide module debug(${arg1}) mode has been ${mod.settings.debug[arg1] ? "enabled" : "disabled"}.`);
		},

		event(arg1, arg2) {
			// If arg1 is "load", load guide from arg2 specified
			if (arg1 === "load") {
				if (!arg2)
					return mod.command.message(`Invalid values for sub command "event" ${arg1}`);

				return guide.load(arg2, true);
			}

			// If arg1 is "reload", reload current loaded guide
			if (arg1 === "reload") {
				if (!guide.obj.loaded)
					return mod.command.message("Guide not loaded");

				return guide.load(guide.obj.id, true);
			}

			// If we didn't get a second argument or the argument value isn't an event type, we return
			if (arg1 === "trigger" ? (!guide.obj.context[arg2]) : (!arg1 || !guide.handlers[arg1] || !arg2))
				return mod.command.message(`Invalid values for sub command "event" ${arg1} | ${arg2}`);

			// if arg2 is "trigger". It means we want to trigger a event
			if (arg1 === "trigger") {
				guide.handlers.start_events(guide.obj.context[arg2], player);
			} else {
				try {
					// Call a function handler with the event we got from arg2 with yourself as the entity
					guide.handlers[arg1](JSON.parse(arg2), player);
				} catch (e) {
					mod.command.message(`Invalid values for sub command "event" ${arg1} | ${arg2}`);
					mod.command.message(cr + e.toString());
				}
			}
		},

		spawnObject(arg1) {
			if (arg1) {
				if (mod.settings.dungeons[arg1]) {
					mod.settings.dungeons[arg1].spawnObject = !mod.settings.dungeons[arg1].spawnObject;
					guide.handlers.text({
						"sub_type": "CGMSG",
						"message": `${lang.strings.spawnObject} ${lang.strings.fordungeon} "${mod.settings.dungeons[arg1].name}": ${cy}${mod.settings.dungeons[arg1].spawnObject ? lang.strings.enabled : lang.strings.disabled}`
					});

					// Reload settings for entered guide
					Object.assign(guide.obj, mod.settings.dungeons[arg1]);
				} else {
					guide.handlers.text({
						"sub_type": "CRMSG",
						"message": lang.strings.dgnotfound
					});
				}
			} else {
				mod.settings.spawnObject = !mod.settings.spawnObject;
				guide.handlers.text({
					"sub_type": "CGMSG",
					"message": `${lang.strings.spawnObject}: ${cy}${mod.settings.spawnObject ? lang.strings.enabled : lang.strings.disabled}`
				});
			}
		},

		verbose(arg1) {
			if (arg1) {
				if (mod.settings.dungeons[arg1]) {
					mod.settings.dungeons[arg1].verbose = !mod.settings.dungeons[arg1].verbose;
					guide.handlers.text({
						"sub_type": "CGMSG",
						"message": `${lang.strings.verbose} ${lang.strings.fordungeon} "${mod.settings.dungeons[arg1].name}": ${cy}${mod.settings.dungeons[arg1].verbose ? lang.strings.enabled : lang.strings.disabled}`
					});

					// Reload settings for entered guide
					Object.assign(guide.obj, mod.settings.dungeons[arg1]);
				} else {
					guide.handlers.text({
						"sub_type": "CRMSG",
						"message": lang.strings.dgnotfound
					});
				}
			} else {
				guide.handlers.text({
					"sub_type": "CRMSG",
					"message": lang.strings.dgnotspecified
				});
			}
		},

		voice() {
			mod.settings.speaks = !mod.settings.speaks;

			guide.handlers.text({
				"sub_type": "CGMSG",
				"message": `${lang.strings.speaks}: ${cy}${mod.settings.speaks ? lang.strings.enabled : lang.strings.disabled}`
			});
		},

		stream() {
			mod.settings.stream = !mod.settings.stream;

			guide.handlers.text({
				"sub_type": "CGMSG",
				"message": `${lang.strings.stream}: ${cy}${mod.settings.stream ? lang.strings.enabled : lang.strings.disabled}`
			});
		},

		lNotice() {
			mod.settings.lNotice = !mod.settings.lNotice;
			guide.handlers.text({
				"sub_type": "CGMSG",
				"message": `${lang.strings.lNotice}: ${cy}${mod.settings.lNotice ? lang.strings.enabled : lang.strings.disabled}`
			});
		},

		gNotice() {
			mod.settings.gNotice = !mod.settings.gNotice;

			guide.handlers.text({
				"sub_type": "CGMSG",
				"message": `${lang.strings.gNotice}: ${cy}${mod.settings.gNotice ? lang.strings.enabled : lang.strings.disabled}`
			});
		},

		dungeons() {
			for (const [id, dungeon] of Object.entries(mod.settings.dungeons)) {
				if (!dungeon["name"]) continue;

				guide.handlers.text({
					"sub_type": "PRMSG",
					"message": `${cw}${id} - ${cy}${dungeon.name}`
				});
			}
		},

		gui() {
			guiHandler("index", "TERA-Guide");
		},

		help() {
			for (const helpstring of lang.strings.helpbody) {
				guide.handlers.text({
					"sub_type": helpstring[1],
					"message": helpstring[0]
				});
			}
		},

		guivoicetest() {
			voice.speak(lang.strings.voicetest, mod.settings.rate);
			guide.handlers.text({
				"sub_type": "CGMSG",
				"message": lang.strings.voicetest
			});
		},

		$default(arg1) {
			// Enable/Disable the module
			if (arg1 === undefined) {
				mod.settings.enabled = !mod.settings.enabled;

				guide.handlers.text({
					"sub_type": "CGMSG",
					"message": `${lang.strings.module}: ${cy}${mod.settings.enabled ? lang.strings.enabled : lang.strings.disabled}`,
				});
			// Set messages text color
			} else if (["cr", "co", "cy", "cg", "cv", "cb", "clb", "cdb", "cp", "clp", "cw", "cgr", "cbl"].includes(arg1)) {
				mod.settings.cc.splice(0, 1, eval(arg1));

				guide.handlers.text({
					"sub_type": "PRMSG",
					"message": lang.strings.colorchanged
				});
				if (!mod.settings.lNotice && !mod.settings.stream)
					guide.handlers.send.dungeonEvent(lang.strings.colorchanged, mod.settings.cc, spg);
			// Set voice rate
			} else if (parseInt(arg1) >= 1 && parseInt(arg1) <= 10) {
				guide.handlers.text({
					"sub_type": "CGMSG",
					"message": `${lang.strings.ratechanged} ${cy}${arg1}`
				});

				mod.settings.rate.splice(0, 1, parseInt(arg1));
			// Unknown command
			} else {
				guide.handlers.text({
					"sub_type": "CRMSG",
					"message": lang.strings.unknowncommand
				});
			}
		}
	});

	// Remove the chat command when the mod gets unloaded 
	this.destructor = async () => {
		mod.command.remove(params.command);
	};
};