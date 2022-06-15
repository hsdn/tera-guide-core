/* eslint-disable no-case-declarations */
"use strict";

// Hook settings
const HOOK_SETTINGS = Object.freeze({
	"LAST": { "order": 100010 },
	"LASTA": { "order": 100010, "filter": { "fake": false, "silenced": false, "modified": null } }
});

/**
 * @typedef {import("../../index").deps} deps
 */

class Gui {
	/**
	 * Creates an instance of Gui.
	 * @param {deps} deps
	 * @memberof Gui
	 */
	constructor(deps) {
		this.__deps = deps;
	}

	init() {
		// Hooks for working a commands sended with GUI
		this.__deps.mod.hook(...this.__deps.proto.getData("C_CONFIRM_UPDATE_NOTIFICATION"), HOOK_SETTINGS.LAST, () => false);
		this.__deps.mod.hook(...this.__deps.proto.getData("C_ADMIN"), HOOK_SETTINGS.LASTA, event => {
			if (event.command.includes(";")) {
				event.command.split(";").forEach(cmd => {
					try {
						this.__deps.mod.command.exec(cmd);
					} catch (e) {
						return;
					}
				});

				return false;
			}
		});
	}

	/**
	 * Parser function.
	 * @param {string[]} array Array of GUI elements.
	 * @param {string} title Title of GUI window.
	 * @memberof Gui
	 */
	parse(array, title) {
		let body = "";

		try {
			array.forEach(data => {
				if (data.command)
					body += `<a href="admincommand:/@${data.command};">${data.text}</a>`;
				else if (!data.command)
					body += `${data.text}`;
				else
					return;
			});
		} catch (e) {
			body += e;
		}

		this.__deps.mod.send(...this.__deps.proto.getData("S_ANNOUNCE_UPDATE_NOTIFICATION"), { "id": 0, title, body });
	}

	/**
	 * Handler for generate context.
	 * @param {string} section Section indetifier.
	 * @param {number} pageNumber Page indetifier.
	 * @memberof Gui
	 */
	show(section, pageNumber = 1) {
		const { mod, params, speech, zone, functions, lang } = this.__deps;

		const cmd = params.command[0];
		const str = lang.strings;
		const cfg = mod.settings;
		const voices = speech.selectedVoices;

		const page = pageNumber - 1;
		const title = "TERA-Guide";

		let tmpData = [];

		switch (section) {
			// Main menu
			case "index":
				// Basic settings
				tmpData.push(
					{ "text": `<font color="${gcy}" size="+20">${str.settings}:</font>` },
					{ "text": "<br>" }, { "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.spawnObject ? gcg : gcr}" size="+18">[${str.spawnObject}]</font>`, "command": `${cmd} spawnObject;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.speech.enabled ? gcg : gcr}" size="+18">[${str.speaks}]</font>`, "command": `${cmd} voice;${cmd} gui` },
					{ "text": "<br>" }, { "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.lNotice ? gcg : gcr}" size="+18">[${str.lNotice}]</font>`, "command": `${cmd} lNotice;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.gNotice ? gcg : gcr}" size="+18">[${str.gNotice}]</font>`, "command": `${cmd} gNotice;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": "<br>" }, { "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.stream ? gcg : gcr}" size="+18">[${str.stream}]</font>`, "command": `${cmd} stream;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": "<br><br>" }
				);

				// Language setting
				tmpData.push({ "text": `<font color="${gcy}" size="+20">${str.language}:</font>` }, { "text": "&#09;&#09;" });
				["auto", ...params.languages].forEach(language => {
					tmpData.push({ "text": `<font color="${cfg.language == language ? gcg : gcr}" size="+18">[${language}]</font>`, "command": `${cmd} ${language};${cmd} gui` }, { "text": "&nbsp;&nbsp;" });
				});
				tmpData.push({ "text": "<br>" });

				// Voice gender setting
				if (voices.male !== false && voices.female !== false) {
					tmpData.push({ "text": `<font color="${gcy}" size="+20">${str.voice}:</font>` }, { "text": "&#09;&#09;" });

					Object.keys(voices).forEach(gender =>
						tmpData.push({ "text": `<font color="${cfg.speech.gender == gender ? gcg : gcr}" size="+18">[${str[gender]}]</font>`, "command": `${cmd} ${gender};${cmd} gui` }, { "text": "&nbsp;&nbsp;" })
					);
					tmpData.push({ "text": "<br>" });
				}

				// Voice speech rate setting
				tmpData.push({ "text": `<font color="${gcy}" size="+20">${str.rate}:</font>` }, { "text": "&#09;&#09;" });
				for (let i = 1; i <= 10; i++) {
					tmpData.push({ "text": `<font color="${cfg.speech.rate == i ? gcg : gcr}" size="+18">[${i}]</font>`, "command": `${cmd} ${i};${cmd} gui` }, { "text": "&nbsp;&nbsp;" });
				}
				tmpData.push(
					{ "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${gcb}" size="+18">[${str.test}]</font>`, "command": `${cmd} guivoicetest` },
					{ "text": "<br>" }
				);

				// Messages color setting
				tmpData.push(
					{ "text": `<font color="${gcy}" size="+20">${str.color}:</font>` }, { "text": "&#09;&#09;" }
				);
				["cr", "co", "cy", "cg", "cv", "cb", "clb", "cdb", "cp", "clp", "cw", "cgr", "cbl"].forEach(color => {
					const cc = global[color];

					tmpData.push({ "text": `<font color="${cfg.cc[0] === cc ? gcg : gcr}" size="+18">[${color.substr(1).toUpperCase()}]</font>`, "command": `${cmd} ${color};${cmd} gui` }, { "text": "&nbsp;&nbsp;" });
				});

				// Dungeon settings
				tmpData.push(
					{ "text": "<br><br>" },
					{ "text": `<font color="${gcy}" size="+20">${str.dungeons}:</font><br>` },
					{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
					{ "text": `<font color="${gcy}" size="+16">O</font><font color="${gcgr}" size="+16"> = ${str.objects}, </font>` },
					{ "text": `<font color="${gcy}" size="+16">M</font><font color="${gcgr}" size="+16"> = ${str.verbose}</font><br>` }
				);
				Object.keys(cfg.dungeons).forEach(id => {
					const dungeon = cfg.dungeons[id];
					if (!dungeon.name) return;

					tmpData.push(
						{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
						{ "text": `<font color="${dungeon.spawnObject ? gcg : gcr}" size="+18">[O]</font>`, "command": `${cmd} spawnObject ${id};${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
						{ "text": `<font color="${dungeon.verbose ? gcg : gcr}" size="+18">[M]</font>`, "command": `${cmd} verbose ${id};${cmd} gui` }, { "text": "&nbsp;&#8212;&nbsp;" },
						{ "text": `<font color="${gcgr}" size="+20">${dungeon.name}</font>` },
						{ "text": "<br>" }
					);
				});
				break;

			// Debug menu
			case "debug":
				// Debug Settings
				tmpData.push({ "text": `<font color="${gcy}" size="+20">Debug options:</font>` }, { "text": "&nbsp;&nbsp;" });

				Object.keys(cfg.debug).forEach(key =>
					tmpData.push({ "text": `<font color="${cfg.debug[key] ? gcg : gcr}" size="+18">[${key}]</font>`, "command": `${cmd} debug ${key};${cmd} debug gui ${page + 1}` }, { "text": "&nbsp;&nbsp;" })
				);

				tmpData.push({ "text": "<br>" });

				if (!zone.loaded) {
					tmpData.push(
						{ "text": "<br>" },
						{ "text": `<font color="${gcv}" size="+20">Guide not loaded.</font>` }, { "text": "<br>" },
						{ "text": "<br>" }
					);

					// Dungeons
					tmpData.push({ "text": `<font color="${gcy}" size="+20">Available guides:</font><br>` });
					tmpData.push(
						{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
						{ "text": `<font color="${gcb}" size="+20">[test] Test Guide</font>`, "command": `${cmd} event load test;${cmd} debug gui` }, { "text": "<br>" }
					);
					Object.keys(cfg.dungeons).forEach(id => {
						const dungeon = cfg.dungeons[id];
						if (!dungeon.name)
							dungeon.name = `[${id}]`;

						tmpData.push(
							{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
							{ "text": `<font color="${gcb}" size="+20">[${id}] ${dungeon.name}</font>`, "command": `${cmd} event load ${id};${cmd} debug gui` }, { "text": "<br>" }
						);
					});
				} else {
					// Basic info
					tmpData.push(
						{ "text": `<font color="${gcy}" size="+20">Guide ID:</font>` }, { "text": "&nbsp;&nbsp;" },
						{ "text": `<font size="+20">${zone.guide.id}</font>` }, { "text": "<br>" },
						{ "text": `<font color="${gcy}" size="+20">Guide name:</font>` }, { "text": "&nbsp;&nbsp;" },
						{ "text": `<font size="+20">${zone.settings.name || "not defined" }</font>` }, { "text": "<br>" },
						{ "text": `<font color="${gcy}" size="+20">Guide type:</font>` }, { "text": "&nbsp;&nbsp;" },
						// eslint-disable-next-line no-nested-ternary
						{ "text": `<font size="+20">${zone.guide.type === SP ? "SP" : (zone.guide.type === ES ? "ES" : "standard")}</font>` }, { "text": "<br>" }
					);

					// Actions
					tmpData.push(
						{ "text": `<font color="${gcy}" size="+20">Actions:</font>` }, { "text": "&nbsp;&nbsp;" },
						{ "text": `<font color="${gcb}" size="+20">[Reload guide]</font>`, "command": `${cmd} event reload;${cmd} debug gui ${page + 1}` }, { "text": "&nbsp;&nbsp;" },
						{ "text": `<font color="${gcb}" size="+20">[Unload guide]</font>`, "command": `${cmd} event unload;${cmd} debug gui` }, { "text": "<br>" },
						{ "text": "<br>" }
					);

					// Event list
					tmpData.push({ "text": `<font color="${gcy}" size="+20">Loaded events:</font>` }, { "text": "<br>" });

					const perPage = 40;
					const events = zone.guide.eventNames().slice(1, zone.guide.eventNames().length);
					const items = events.slice(perPage * page, (perPage * page) + perPage);

					if (items.length > 1) {
						items.forEach((key, index) => {
							const message = functions.formatMessage(zone.guide.getEventMessage(key));

							tmpData.push(
								{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
								{ "text": `<font color="${gcgr}" size="+20">${(index + (perPage * page) + 1).toString().padStart(2, "0")}.</font>` }, { "text": "&nbsp;&nbsp;" },
								{ "text": `<font color="${gcb}" size="+20">${key}</font>`, "command": `${cmd} event trigger '${key}'` }, { "text": "&nbsp;&#8212;&nbsp;" }
							);

							if (message.length > 0)
								tmpData.push({ "text": `<font size="+18">${message}</font>` }, { "text": "&nbsp;&nbsp;" });

							tmpData.push({ "text": `<font color="${gcgr}" size="+20">(${zone.guide.listenerCount(key)})</font>` }, { "text": "<br>" });
						});
					} else
						tmpData.push(
							{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
							{ "text": `<font color="${gcv}" size="+20">No added events.</font>` }, { "text": "<br>" }
						);

					tmpData.push({ "text": "<br>" });

					// Pages
					if (page > 0 || page < (events.length / perPage) - 1) {
						if (page > 0)
							tmpData.push({ "text": `<font color="${gcb}" size="+20">[Prev page]</font>`, "command": `${cmd} debug gui ${page + 1 - 1}` }, { "text": "&nbsp;&nbsp;" });
						tmpData.push({ "text": `<font color="${gcy}" size="+20">&lt;${page + 1}&gt;</font>` }, { "text": "&nbsp;&nbsp;" });
						if (page < (events.length / perPage) - 1)
							tmpData.push({ "text": `<font color="${gcb}" size="+20">[Next page]</font>`, "command": `${cmd} debug gui ${page + 2}` });
						tmpData.push({ "text": "<br>" }, { "text": "<br>" });
					}

					// Hook list
					tmpData.push({ "text": `<font color="${gcy}" size="+20">Loaded hooks:</font><br>` });
					if (zone.loaded && zone.guide.hooks.list.size !== 0) {
						zone.guide.hooks.list.forEach(attr => tmpData.push(
							{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
							{ "text": `<font size="+20">${attr.debug.name}</font>` }, { "text": "&nbsp;" },
							{ "text": `<font color="${gcgr}" size="+20">(${attr.keys.join(", ")})</font>` },
							{ "text": "<br>" }
						));
					} else
						tmpData.push(
							{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
							{ "text": `<font color="${gcv}" size="+20">No loaded hooks.</font>` }, { "text": "<br>" }
						);
				}
				break;
		}

		// Parse the GUI data
		this.parse(tmpData,
			`<font>${title}</font> | ` +
			`<font color="${gcr}" size="+16">${str.red}</font><font color="${gcgr}" size="+16"> = ${str.disabled}, </font>` +
			`<font color="${gcg}" size="+16">${str.green}</font><font color="${gcgr}" size="+16"> = ${str.enabled}</font>`
		);

		tmpData = [];
	}
}

module.exports = Gui;