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
			event.command.split(";").forEach(cmd => {
				try {
					this.__deps.mod.command.exec(cmd);
				} catch (e) {
					return;
				}
			});

			return false;
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
				if (body.length >= 16000)
					throw "GUI data limit exceeded, some values may be missing.";

				if (data.command)
					body += `<a href="admincommand:/@${data.command}">${data.text}</a>`;
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
	 * @param {string} page Page indetifier.
	 * @memberof Gui
	 */
	show(page) {
		const guide = this.__deps.guide;
		const cmd = this.__deps.params.command[0];
		const str = this.__deps.lang.strings;
		const cfg = this.__deps.mod.settings;
		const voices = this.__deps.speech.selectedVoices;

		const title = "TERA-Guide";
		let tmpData = [];

		switch (page) {
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
					{ "text": "<br><br>" },
				);

				// Voice gender setting
				if (voices.male !== false && voices.female !== false) {
					tmpData.push({ "text": `<font color="${gcy}" size="+20">${str.voice}:</font>` }, { "text": "&#09;&#09;" });

					Object.keys(voices).forEach(gender => {
						tmpData.push({ "text": `<font color="${cfg.speech.gender == gender ? gcg : gcr}" size="+18">[${str[gender]}]</font>`, "command": `${cmd} ${gender};${cmd} gui` }, { "text": "&nbsp;&nbsp;" });
					});
					tmpData.push({ "text": "<br>" });
				}

				// Voice speech rate setting
				tmpData.push({ "text": `<font color="${gcy}" size="+20">${str.rate}:</font>` }, { "text": "&#09;&#09;" });
				for (let i = 1; i <= 10; i++) {
					tmpData.push({ "text": `<font color="${cfg.speech.rate == i ? gcg : gcr}" size="+18">[${i}]</font>`, "command": `${cmd} ${i};${cmd} gui` }, { "text": "&nbsp;&nbsp;" });
				}
				tmpData.push(
					{ "text": "&nbsp;&nbsp;" },
					{ "text": `<font size="+18">[${str.test}]</font>`, "command": `${cmd} guivoicetest` },
					{ "text": "<br>" }
				);

				// Messages color setting
				tmpData.push(
					{ "text": `<font color="${gcy}" size="+20">${str.color}:</font>` }, { "text": "&#09;&#09;" }
				);
				["cr", "co", "cy", "cg", "cv", "cb", "clb", "cdb", "cp", "clp", "cw", "cgr", "cbl"].forEach(color => {
					let cc = global[color];

					tmpData.push({ "text": `<font color="${cfg.cc[0] === cc ? gcg : gcr}" size="+18">[${color.substr(1).toUpperCase()}]</font>`, "command": `${cmd} ${color};${cmd} gui` }, { "text": "&nbsp;&nbsp;" });
				});

				// Dungeon settings
				tmpData.push(
					{ "text": "<br><br>" },
					{ "text": `<font color="${gcy}" size="+20">${str.dungeons}:</font><br>` }
				);
				Object.keys(cfg.dungeons).forEach(id => {
					const dungeon = cfg.dungeons[id];
					if (!dungeon.name) return;

					tmpData.push(
						{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
						{ "text": `<font color="${dungeon.spawnObject ? gcg : gcr}" size="+18">[${str.objects}]</font>`, "command": `${cmd} spawnObject ${id};${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
						{ "text": `<font color="${dungeon.verbose ? gcg : gcr}" size="+18">[${str.verbose}]</font>`, "command": `${cmd} verbose ${id};${cmd} gui` }, { "text": "&nbsp;&#8212;&nbsp;" },
						{ "text": `<font color="${gcgr}" size="+20">${dungeon.name}</font>` },
						{ "text": "<br>" }
					);
				});
				break;

			// Debug menu
			case "debug":
				// Debug Settings
				tmpData.push({ "text": `<font color="${gcy}" size="+20">Debug options:</font>` }, { "text": "&nbsp;&nbsp;" });

				Object.keys(cfg.debug).forEach(key => {
					tmpData.push({ "text": `<font color="${cfg.debug[key] ? gcg : gcr}" size="+18">[${key}]</font>`, "command": `${cmd} debug ${key};${cmd} debug gui` }, { "text": "&nbsp;&nbsp;" });
				});

				tmpData.push({ "text": "<br>" });

				if (!guide.obj.loaded) {
					tmpData.push(
						{ "text": "<br>" },
						{ "text": `<font color="${gcr}" size="+20">Guide not loaded.</font>` }, { "text": "<br>" },
						{ "text": "<br>" },
					);

					// Dungeons
					tmpData.push({ "text": `<font color="${gcy}" size="+20">Available guides:</font><br>` });
					Object.keys(cfg.dungeons).forEach(id => {
						const dungeon = cfg.dungeons[id];
						if (!dungeon.name)
							dungeon.name = `[${id}]`;
	
						tmpData.push(
							{ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
							{ "text": "<font size=\"+18\">[Load]</font>", "command": `${cmd} event load ${id};${cmd} debug gui` }, { "text": "&nbsp;&#8212;&nbsp;" },
							{ "text": `<font color="${gcgr}" size="+20">${id}. ${dungeon.name}</font>` },
							{ "text": "<br>" }
						);
					});

					break;
				}

				// Basic info
				tmpData.push(
					{ "text": `<font color="${gcy}" size="+20">Guide ID:</font>` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font size="+20">${guide.obj.id}</font>` }, { "text": "<br>" },
					{ "text": `<font color="${gcy}" size="+20">Guide name:</font>` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font size="+20">${guide.obj.name || "not defined" }</font>` }, { "text": "<br>" },
					{ "text": `<font color="${gcy}" size="+20">Guide type:</font>` }, { "text": "&nbsp;&nbsp;" },
					// eslint-disable-next-line no-nested-ternary
					{ "text": `<font size="+20">${guide.obj.type === SP ? "SP" : (guide.obj.type === ES ? "ES" : "standard")}</font>` }, { "text": "<br>" },
				);

				// Actions
				tmpData.push(
					{ "text": `<font color="${gcy}" size="+20">Actions:</font>` },{ "text": "&nbsp;&nbsp;" },
					{ "text": "<font size=\"+20\">[Reload guide]</font>", "command": `${cmd} event reload;${cmd} debug gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": "<font size=\"+20\">[Unload guide]</font>", "command": `${cmd} event unload;${cmd} debug gui` }, { "text": "<br>" },
					{ "text": "<br>" },
				);

				// Event list
				tmpData.push({ "text": `<font color="${gcy}" size="+20">Loaded events:</font>` }, { "text": "<br>" });
				if (guide.eventNames().length > 1) {
					guide.eventNames().forEach(key => {
						if (key === "error") return;

						tmpData.push({ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" });
						tmpData.push({ "text": "<font size=\"+18\">[Trigger]</font>", "command": `${cmd} event trigger '${key}';${cmd} debug gui` }, { "text": "&nbsp;&#8212;&nbsp;" });
						tmpData.push({ "text": `<font color="${gcgr}" size="+20">${key} (entries: ${guide.listenerCount(key)})</font>` });
						tmpData.push({ "text": "<br>" });
					});
				} else
					tmpData.push({ "text": `<font color="${gcr}" size="+18">No added events.</font>` }, { "text": "<br>" });

				tmpData.push({ "text": "<br>" });

				// Hook list
				tmpData.push({ "text": `<font color="${gcy}" size="+20">Loaded hooks:</font><br>` });
				if (Object.keys(guide.obj.hooks).length !== 0) {
					Object.keys(guide.obj.hooks).forEach(name => {
						tmpData.push({ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" });
						tmpData.push({ "text": `<font color="${gcgr}" size="+20">${name} (keys: ${guide.obj.hooks[name].keys.join(", ")})</font>` });
						tmpData.push({ "text": "<br>" });
					});
				} else
					tmpData.push({ "text": `<font color="${gcr}" size="+18">No loaded hooks.</font>` }, { "text": "<br>" });

				break;
		}

		// Parse the GUI data
		this.parse(tmpData, 
			`<font>${title}</font> | ` +
			`<font color="${gcr}" size="+16">${str.red}</font><font color="${gcgr}" size="+16"> = ${str.disabled}, ` +
			`<font color="${gcg}" size="+16">${str.green}</font><font color="${gcgr}" size="+16"> = ${str.enabled}</font>`
		);

		tmpData = [];
	}
}

module.exports = Gui;