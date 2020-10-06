"use strict";

class Gui {

	constructor(deps) {
		this.mod = deps.mod;
		this.lang = deps.lang;
		this.params = deps.params;

		// Hooks for working a commands sended with GUI
		this.mod.hook("C_CONFIRM_UPDATE_NOTIFICATION", "raw", { "order": 100010 }, () => false);
		this.mod.hook("C_ADMIN", 1, { "order": 100010, "filter": { "fake": null, "silenced": false, "modified": null } }, event => {
			event.command.split(";").forEach(cmd => {
				try {
					this.mod.command.exec(cmd);
				} catch (e) {
					return;
				}
			});

			return false;
		});

		// Parser functions
		this.gui = {
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

				deps.mod.toClient("S_ANNOUNCE_UPDATE_NOTIFICATION", 1, { "id": 0, title, body });
			}
		};
	}

	// Handler for generate context
	show(page, title) {
		const cmd = this.params.command[0];
		const str = this.lang.strings;
		const cfg = this.mod.settings;
		let tmpData = [];

		switch (page) {
			// Main menu
			default:
				tmpData.push(
					{ "text": `<font color="${gcy}" size="+20">${str.settings}:</font>` },
					{ "text": "<br>" }, { "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.spawnObject ? gcg : gcr}" size="+18">[${str.spawnObject}]</font>`, "command": `${cmd} spawnObject;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.speaks ? gcg : gcr}" size="+18">[${str.speaks}]</font>`, "command": `${cmd} voice;${cmd} gui` },
					{ "text": "<br>" }, { "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.lNotice ? gcg : gcr}" size="+18">[${str.lNotice}]</font>`, "command": `${cmd} lNotice;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.gNotice ? gcg : gcr}" size="+18">[${str.gNotice}]</font>`, "command": `${cmd} gNotice;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": "<br>" }, { "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.stream ? gcg : gcr}" size="+18">[${str.stream}]</font>`, "command": `${cmd} stream;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": "<br><br>" },
					{ "text": `<font color="${gcy}" size="+20">${str.rate}:</font>` }, { "text": "&#09;&#09;" },
					{ "text": `<font color="${cfg.rate[0] == 1 ? gcg : gcr}" size="+18">[1]</font>`, "command": `${cmd} 1;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.rate[0] == 2 ? gcg : gcr}" size="+18">[2]</font>`, "command": `${cmd} 2;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.rate[0] == 3 ? gcg : gcr}" size="+18">[3]</font>`, "command": `${cmd} 3;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.rate[0] == 4 ? gcg : gcr}" size="+18">[4]</font>`, "command": `${cmd} 4;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.rate[0] == 5 ? gcg : gcr}" size="+18">[5]</font>`, "command": `${cmd} 5;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.rate[0] == 6 ? gcg : gcr}" size="+18">[6]</font>`, "command": `${cmd} 6;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.rate[0] == 7 ? gcg : gcr}" size="+18">[7]</font>`, "command": `${cmd} 7;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.rate[0] == 8 ? gcg : gcr}" size="+18">[8]</font>`, "command": `${cmd} 8;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.rate[0] == 9 ? gcg : gcr}" size="+18">[9]</font>`, "command": `${cmd} 9;${cmd} gui` }, { "text": "&nbsp;&nbsp;" },
					{ "text": `<font color="${cfg.rate[0] == 10 ? gcg : gcr}" size="+18">[10]</font>`, "command": `${cmd} 10;${cmd} gui` }, { "text": "&nbsp;&nbsp;&nbsp;&nbsp;" },
					{ "text": `<font size="+18">[${str.test}]</font>`, "command": `${cmd} guivoicetest` },
					{ "text": "<br>" }
				);
				tmpData.push(
					{ "text": `<font color="${gcy}" size="+20">${str.color}:</font>` }, { "text": "&#09;&#09;" }
				);
				["cr", "co", "cy", "cg", "cv", "cb", "clb", "cdb", "cp", "clp", "cw", "cgr", "cbl"].forEach(color => {
					let cc = global[color];

					tmpData.push({ "text": `<font color="${cfg.cc[0] === cc ? gcg : gcr}" size="+18">[${color.substr(1).toUpperCase()}]</font>`, "command": `${cmd} ${color};${cmd} gui` }, { "text": "&nbsp;&nbsp;" });
				});
				tmpData.push(
					{ "text": "<br><br>" },
					{ "text": `<font color="${gcy}" size="+20">${str.dungeons}:</font><br>` }
				);

				Object.keys(cfg.dungeons).forEach(id => {
					const dungeon = cfg.dungeons[id];
					if (!dungeon.name) return;

					tmpData.push({ "text": "&nbsp;&nbsp;&nbsp;&nbsp;" });
					tmpData.push({ "text": `<font color="${dungeon.spawnObject ? gcg : gcr}" size="+18">[${str.objects}]</font>`, "command": `${cmd} spawnObject ${id};${cmd} gui` }, { "text": "&nbsp;&nbsp;" });
					tmpData.push({ "text": `<font color="${dungeon.verbose ? gcg : gcr}" size="+18">[${str.verbose}]</font>`, "command": `${cmd} verbose ${id};${cmd} gui` }, { "text": "&nbsp;&#8212;&nbsp;" });
					tmpData.push({ "text": `<font color="${gcgr}" size="+20">${dungeon.name}</font>` });
					tmpData.push({ "text": "<br>" });
				});

				this.gui.parse(tmpData, 
					`<font>${title}</font> | ` + 
					`<font color="${gcr}" size="+16">${str.red}</font><font color="${gcgr}" size="+16"> = ${str.disabled}, ` + 
					`<font color="${gcg}" size="+16">${str.green}</font><font color="${gcgr}" size="+16"> = ${str.enabled}</font>`
				);
		}
		tmpData = [];
	}
}

module.exports = Gui;