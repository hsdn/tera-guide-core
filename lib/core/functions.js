'use strict';

module.exports = (mod, guide, lang, dispatch, params) => {

	const spawn = require("../spawn");
	const voice = require("../voice");
	const path = require("path");
	const command = mod.command;
	const { player, library } = mod.require.library;

	// Zone type codes (default skill id range is 100-200)
	global.SP = 1; // skill id range is 1000-3000
	global.ES = 2; // skill id range is 100-200-3000

	// Dungeon messages types
	global.spt = 31; // text notice
	global.spg = 42; // green message
	global.spb = 43; // blue message
	global.spr = 44; // red message
	global.spi = 66; // blue info message
	global.spn = 49; // left side notice

	// Messages colors
	global.cr = '</font><font color="#ff0000">';  // red
	global.co = '</font><font color="#ff7700">';  // orange
	global.cy = '</font><font color="#ffff00">';  // yellow
	global.cg = '</font><font color="#00ff00">';  // green
	global.cdb = '</font><font color="#2727ff">'; // dark blue
	global.cb = '</font><font color="#0077ff">';  // blue
	global.cv = '</font><font color="#7700ff">';  // violet
	global.cp = '</font><font color="#ff00ff">';  // pink
	global.clp = '</font><font color="#ff77ff">'; // light pink
	global.clb = '</font><font color="#00ffff">'; // light blue
	global.cbl = '</font><font color="#000000">'; // black
	global.cgr = '</font><font color="#777777">'; // gray
	global.cw = '</font><font color="#ffffff">';  // white

	// Assign custom colors
	if (params.colors.general)
		Object.assign(global, params.colors.general);

	// Used for item unique id in spawn handler
	let uint64 = 0xFFFFFFFA;

	// Tank class ids(brawler + lancer)
	const TANK_CLASS_IDS = [1, 10];
	// Dps class ids(not counting warrior)
	const DPS_CLASS_IDS = [2, 3, 4, 5, 8, 9, 11, 12];
	// Healer class ids
	const HEALER_CLASS_IDS = [6, 7];
	// Warrior Defence stance abnormality ids
	const WARRIOR_TANK_IDS = [100200, 100201];


	/** SEND MESSAGE FUNCTIONS **/

	// Basic message
	global.sendMessage = (message) => {
		// If streamer mode is enabled send message to the proxy-channel
		if (mod.settings.stream)
			return command.message(mod.settings.cc + message);

		if (mod.settings.lNotice) {
			// Send message as a Team leader notification
			let sending_event = {
				channel: 21, // 21 = team leader, 25 = raid leader, 1 = party, 2 = guild
				message
			};
			if (params.chat_name)
				Object.assign(sending_event, { name: params.chat_name });

			mod.toClient("S_CHAT", 3, sending_event);
		} else
			// Send message as a green colored Dungeon Event
			sendDungeonEvent(message, mod.settings.cc, spg);

		// Send message to party if gNotice is enabled
		if (mod.settings.gNotice)
			mod.toClient("S_CHAT", 3, {
				channel: 1,
				message
			});
	}

	// Notification message
	global.sendNotification = (message) => {
		// If streamer mode is enabled send message to the proxy-channel
		if (mod.settings.stream)
			return command.message(clb + "[Notice] " + mod.settings.cc + message);

		// Send message as a Raid leader notification
		let sending_event = {
			channel: 25,
			authorName: "guide",
			message
		};
		if (params.chat_name)
			Object.assign(sending_event, { name: params.chat_name });

		mod.toClient("S_CHAT", 3, sending_event);

		// Send message to party if gNotice is enabled
		if (mod.settings.gNotice)
			mod.toClient("S_CHAT", 3, {
				channel: 1,
				message
			});
	}

	// Alert message
	global.sendAlert = (message, cc, spc) => {
		// If streamer mode is enabled send message to the proxy-channel
		if (mod.settings.stream)
			return command.message(cc + "[Alert] " + mod.settings.cc + message);

		// Send message as a Raid leader notification
		if (mod.settings.lNotice) {
			let sending_event = {
				channel: 25,
				authorName: "guide",
				message
			};
			if (params.chat_name)
				Object.assign(sending_event, { name: params.chat_name });

			mod.toClient("S_CHAT", 3, sending_event);
		} else
			// Send message as a color-specified Dungeon Event
			sendDungeonEvent(message, mod.settings.cc, spc);

		// Send message to party if gNotice or gAlert is enabled
		if (mod.settings.gNotice/* || mod.settings.gAlert*/)
			mod.toClient("S_CHAT", 3, {
				channel: 1,
				message
			});
	}

	// Dungeon Event message
	global.sendDungeonEvent = (message, spcc, type) => {
		// If streamer mode is enabled send message to the proxy-channel
		if (mod.settings.stream)
			return command.message(spcc + message);

		// Send a color-specified Dungeon Event message
		mod.toClient("S_DUNGEON_EVENT_MESSAGE", 2, {
			type: type,
			chat: 0,
			channel: 27,
			message: spcc + message
		});
	}

	// Write generic debug message used when creating guides
	global.sendDebug = (enabled, ...args) => {
		if (!enabled) return;

		if (mod.settings.debug.chat)
			command.message(args.toString());

		console.log("[Guide]", ...args);
	}


	/** EVENT HANDLERS FOR TYPES **/

	// Spawn handler
	global.spawnHandler = (event, ent = false, speed = 1.0) => {
		// Ignore if streamer mode is enabled
		if (mod.settings.stream) return;

		// Ignore if spawnObject is disabled
		if (!mod.settings.spawnObject) return;
		if (!guide.spawnObject) return;

		// Check ent is defined
		if (!ent) ent = guide.ent;
		if (!ent) return mod.error("Spawn handler has invalid entity or not specified");

		// If func is defined, try to call the spawn function from the lib and return
		if (event["func"]) {
			// Make sure args is defined
			if (!event["args"]) return mod.error("Spawn handler needs a args");

			// Create a Spawn class
			const instance = new (spawn.Spawn)(ent, mod);

			try {
				// Create timer for specified delay
				const delay = parseInt(event["delay"]);

				if (delay > 0) {
					mod.setTimeout(() => {
						instance[event["func"]](...event["args"]);
					}, delay / speed);
				} else {
					instance[event["func"]](...event["args"]);
				}
			} catch (e) {
				mod.error(e);
			}

			return;
		}

		// Make sure id is defined
		if (!event["id"]) return mod.error("Spawn handler needs a id");

		// Make sure sub_delay is defined
		if (!event["sub_delay"]) return mod.error("Spawn handler needs a sub_delay");

		// Set sub_type to be collection as default for backward compatibility
		const sub_type = event["sub_type"] || "collection";

		// The unique spawned id this item will be using.
		const item_unique_id = event["force_gameId"] || uint64--;

		// The location of the item spawned
		let loc = ent["loc"].clone();

		// if pos is set, we use that
		if (event["pos"]) loc = event["pos"];

		loc.w = (ent["loc"].w || 0) + (event["offset"] || 0);

		library.applyDistance(loc, event["distance"] || 0, event["degrees"] || 0);

		let sending_event = {
			gameId: item_unique_id,
			loc: loc,
			w: loc.w
		};

		// Create the sending event
		switch (sub_type) {
			// If it"s type collection, it"s S_SPAWN_COLLECTION
			case "collection":
				Object.assign(sending_event, {
					id: event["id"],
					amount: 1,
					extractor: false,
					extractorDisabled: false,
					extractorDisabledTime: 0
				});
				break;

			// If it"s type item, it"s S_SPAWN_DROPITEM
			case "item":
				Object.assign(sending_event, {
					item: event["id"],
					amount: 1,
					expiry: 0,
					explode: false,
					masterwork: false,
					enchant: 0,
					debug: false,
					owners: []
				});
				break;

			// If it's type build_object, it's S_SPAWN_BUILD_OBJECT
			case "build_object":
				Object.assign(sending_event, {
					itemId: event["id"],
					unk: 0,
					ownerName: event["ownerName"] || "",
					message: event["message"] || ""
				});
				break;

			// If we haven't implemented the sub_type the event asks for
			default:
				return mod.error(`Invalid sub_type for spawn handler: ${event['sub_type']}`);
		}

		// Callback function
		const callback = (sub_type, sending_event) => {
			// Add entry to spawned objects list for its bath despawn
			guide.spawned_items[sending_event.gameId] = sub_type;

			// Spawn item by type
			switch (sub_type) {
				case "collection":
					return mod.toClient("S_SPAWN_COLLECTION", 4, sending_event);

				case "item":
					return mod.toClient("S_SPAWN_DROPITEM", 8, sending_event);

				case "build_object":
					return mod.toClient("S_SPAWN_BUILD_OBJECT", 2, sending_event);
			}
		}

		const delay = parseInt(event["delay"]);

		// Create timer for specified delay
		if (delay > 0)
			mod.setTimeout(callback, delay / speed, sub_type, sending_event);
		else
			callback(sub_type, sending_event);

		// Create timer for despawn a spawned item
		mod.setTimeout(despawnHandler, parseInt(event["sub_delay"]) / speed, {
			id: item_unique_id,
			sub_type: sub_type
		});
	};

	// Despawn handler for objects, spawned by "force_gameId"
	global.despawnHandler = (event) => {
		// Make sure id is defined
		if (!event['id']) return mod.error("Spawn handler needs a id");

		// Returns if item already despawned
		if (!guide.spawned_items[event["id"]]) return;

		// Set sub_type to be collection as default for backward compatibility
		const sub_type = event["sub_type"] || "collection";

		const despawn_event = {
			gameId: event["id"],
			unk: 0, // used in S_DESPAWN_BUILD_OBJECT
			collected: false // used in S_DESPAWN_COLLECTION
		};

		// Delete despawned item from the list
		delete guide.spawned_items[despawn_event.gameId];

		// Despawn item by type
		switch (sub_type) {
			case "collection":
				return mod.toClient("S_DESPAWN_COLLECTION", 2, despawn_event);

			case "item":
				return mod.toClient("S_DESPAWN_DROPITEM", 4, despawn_event);

			case "build_object":
				return mod.toClient("S_DESPAWN_BUILD_OBJECT", 2, despawn_event);

			default:
				return mod.error(`Invalid sub_type for despawn handler: ${event["sub_type"]}`);
		}
	};

	// Despawn handler for force despawn all spawned objects
	global.despawnAllHandler = () => {
		for (const [gameId, sub_type] of Object.entries(guide.spawned_items)) {
			// Call handler to despawn
			despawnHandler({ id: gameId, sub_type: sub_type });
		}

		// Final list cleanup
		guide.spawned_items = {};
	};

	// Text handler
	global.textHandler = (event, ent = false, speed = 1.0) => {
		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Fetch the message
		const message = event[`message_${lang.uclanguage}`] || event[`message_${lang.language}`] || event["message"];

		// Make sure sub_type is defined
		if (!event["sub_type"]) return mod.error("Text handler needs a sub_type");

		// Make sure message is defined
		if (!message) return mod.error("Text handler needs a message");

		// Play the voice for specified types
		if (["message", "alert", "warning", "notification", "msgcp", "msgcg", "speech"].includes(event["sub_type"])) {
			// Ignoring if verbose mode is disabled
			if (!guide.verbose) return;

			// Play the voice of text message
			if (voice && mod.settings.speaks) {
				if (delay - 600 > 0)
					mod.setTimeout(voice.speak, delay - 600 / speed, message, mod.settings.rate);
				else
					voice.speak(message, mod.settings.rate);
			}

			// Ignoring sending a text message if "speech" sub_type specified
			if (event["sub_type"] == "speech") return;
		}

		// Callback function
		const callback = (sub_type, message) => {
			switch (sub_type) {
				// Basic message
				case "message":
					sendMessage(message);
					break;

				// Alert message red
				case "alert":
					sendAlert(message, cr, spr);
					break;

				// Alert message blue
				case "warning":
					sendAlert(message, clb, spb);
					break;

				// Notification message
				case "notification":
					sendNotification(message);
					break;

				// Pink dungeon event message
				case "msgcp":
					sendDungeonEvent(message, cp, spg);
					break;

				// Green dungeon event message
				case "msgcg":
					sendDungeonEvent(message, cg, spg);
					break;

				// Debug or test message to the proxy-channel and log console
				case "MSG":
					command.message(cr + message);
					console.log(cr + message);
					break;

				// Color-specified proxy-channel messages
				case "COMSG":
					command.message(co + message);
					break;

				case "CYMSG":
					command.message(cy + message);
					break;

				case "CGMSG":
					command.message(cg + message);
					break;

				case "CDBMSG":
					command.message(cdb + message);
					break;

				case "CBMSG":
					command.message(cb + message);
					break;

				case "CVMSG":
					command.message(cv + message);
					break;

				case "CPMSG":
					command.message(cp + message);
					break;

				case "CLPMSG":
					command.message(clp + message);
					break;

				case "CLBMSG":
					command.message(clb + message);
					break;

				case "CBLMSG":
					command.message(cbl + message);
					break;

				case "CGRMSG":
					command.message(cgr + message);
					break;

				case "CWMSG":
					command.message(cw + message);
					break;

				case "CRMSG":
					command.message(cr + message);
					break;

				// Default color proxy-channel message
				case "PRMSG":
					command.message(mod.settings.cc + message);
					break;

				// Invalid sub_type value
				default:
					return mod.error(`Invalid sub_type for text handler: ${event['sub_type']}`);
			}
		}

		// Create timer for specified delay
		if (delay > 0)
			mod.setTimeout(callback, delay / speed, event["sub_type"], message);
		else
			callback(event["sub_type"], message);
	};

	// Func handler
	global.funcHandler = (event, ent = false, speed = 1.0) => {
		// Make sure func is defined
		if (!event["func"]) return mod.error("Func handler needs a func");

		// Set ent to guide from the triggered event for use in called function
		guide.ent = ent;

		// Callback function
		const callback = (event) => {
			// Try to call the function
			try {
				// If load() function is exists, use old calling method (for compat)
				if (typeof guide.context.load === "function")
					return event["func"].call(null, eventHandlers, event, ent, dispatch);

				// Call function with defined args
				if (event["args"])
					return event["func"](...event["args"], ent, event, eventHandlers);
				else
					return event["func"](ent, event, eventHandlers);
			} catch (e) {
				mod.error(e);
			}
		}

		const delay = parseInt(event["delay"]);

		// Create timer for specified delay
		if (delay > 0)
			mod.setTimeout(callback, delay / speed, event);
		else
			callback(event);
	};

	// Clear timers handler
	global.stopTimersHandler = () => {
		mod.clearAllTimeouts();
		mod.clearAllIntervals();
	};

	// An object of types and their corresponding function handlers
	global.eventHandlers = {
		spawn: spawnHandler,
		spawn_func: spawnHandler,
		despawn: despawnHandler,
		despawn_all: despawnAllHandler,
		text: textHandler,
		func: funcHandler,
		stop_timers: stopTimersHandler
	};


	/** EVENT PROCESSING FUNCTIONS **/

	// Event handler to process of handled events
	global.eventHandler = (events = [], ent = false, speed = 1.0) => {
		// Check ent is defined
		if (!ent) ent = guide.ent;

		// Loop over the events
		for (let event of events) {
			const func = eventHandlers[event["type"]];
			// The function couldn"t be found, so it"s an invalid type
			if (!func)
				mod.error(`An event has invalid type: ${event["type"]}`);
			// If the function is found and it passes the class position check, we start the event
			else if (classPositionCheck(event["class_position"]))
				func(event, ent);
		}
	};

	// Handle events such as boss skill and abnormalities triggered
	global.handleEvent = (ent, id, prefix, debug_data, speed = 1.0, stage = false) => {
		const unique_id = `${prefix}-${ent["huntingZoneId"]}-${ent["templateId"]}`;
		const id_string = (id !== false) ? `-${id}` : "";
		const stage_string = (stage !== false) ? `-${stage}` : "";
		const key = unique_id + id_string;
		const entry = (stage !== false) ? guide.context[key + stage_string] : guide.context[key];

		// Send debug info if enabled
		if (debug_data.enabled) {
			const defined = entry ? " [defined]" : "";
			console.log(`[Guide]`, `${debug_data.name}: ${key + stage_string}${defined}`);

			if (mod.settings.debug.chat)
				command.message(`${cw}${debug_data.name}: ${debug_data.color}${key + stage_string}${cw}${defined}`);
		}

		// Call event handler
		if (entry)
			eventHandler(entry, ent, speed);
	};

	// Makes sure the event passes the class position check
	function classPositionCheck(class_position) {
		// if it's not defined we assume that it's for everyone
		if (!class_position) return true;

		// If it's an array
		if (Array.isArray(class_position)) {
			// If one of the class_positions pass, we can accept it
			for (let ent of class_position) {
				if (classPositionCheck(ent)) return true;
			}
			// All class_positions failed, so we return false
			return false;
		}

		switch (class_position) {
			case "tank":
				// if it's a warrior with dstance abnormality
				if (player.job === 0) {
					// Loop thru tank abnormalities
					for (let id of WARRIOR_TANK_IDS) {
						// if we have the tank abnormality return true
						if (effect.hasAbnormality(id)) return true;
					}
				}

				// if it's a tank return true
				if (TANK_CLASS_IDS.includes(player.job)) return true;
				break;

			case "dps":
				// If it's a warrior with dstance abnormality
				if (player.job === 0) {
					// Loop thru tank abnormalities
					for (let id of WARRIOR_TANK_IDS) {
						// if we have the tank abnormality return false
						if (effect.hasAbnormality(id)) return false;
					}
					// warrior didn't have tank abnormality
					return true;
				}

				// if it's a dps return true
				if (DPS_CLASS_IDS.includes(player.job)) return true;
				break;

			case "heal":
				// if it's a healer return true
				if (HEALER_CLASS_IDS.includes(player.job)) return true;
				break;

			case "priest":
				if (player.job === 6) return true; // For Priest specific actions (eg Arise)
				break;

			case "mystic":
				if (player.job === 7) return true; // For Mystic specific actions
				break;

			case "lancer":
				if (player.job === 1) return true; // For Lancer specific actions (eg Blue Shield)
				break;

			default:
				mod.warn(`Failed to find class position: ${position}`);
		}

		return false;
	}

	// Unload guide script
	global.unloadHandler = () => {
		// Clear old data and set guide as not loaded
		guide.ent = false;
		guide.type = false;
		guide.context = {};
		guide.spawned_npcs = {};
		guide.mobs_hp = {};

		// Clear out the timers
		stopTimersHandler();

		// Clear out previous hooks, that our previous guide module hooked
		dispatch._remove_all_hooks();

		// Force despawn for all spawned objects and clear guide.spawned_items
		despawnAllHandler();

		// Remove potential cached guide from require cache, so that we don"t need to relog to refresh guide
		try {
			if (guide.id) {
				delete require.cache[require.resolve(path.resolve(mod.info.path, "guides", guide.id.toString()))];
			}
		} catch (e) {}

		// Set guide as unloaded
		guide.loaded = false;
		guide.id = undefined;
		guide.name = undefined;
	};

	// Load guide script
	global.loadHandler = (zone, debug_enabled = false) => {
		// Unload current loaded guide
		unloadHandler();

		// Send debug message
		sendDebug(mod.settings.debug.all, `Entered zone: ${zone}`);

		// Check guide and attach settings from config
		if (zone == "test") { // load test guide data
			guide.id = zone;
			guide.name = "Test Guide";
			Object.assign(guide, defaultSettings);
		} else if (mod.settings.dungeons[zone]) {
			guide.id = parseInt(zone);
			Object.assign(guide, mod.settings.dungeons[zone]);
		} else
			return sendDebug(debug_enabled, `Zone "${zone}" is not found`);

		// Try to load guide script
		try {
			const object = require(path.resolve(mod.info.path, "guides", guide.id.toString()));
	
			if (typeof object === "function") {
				// Set zone type from exports
				guide.type = object.type || false;

				// Call the object as a function
				try {
					guide.context = object(dispatch, guide, lang, eventHandlers);
				} catch (e) {
					return mod.error(e);
				}
			} else {
				guide.context = object;

				// Try to call the compat function load()
				try {
					guide.context.load(dispatch, guide, lang, eventHandlers);
				} catch (e) {
					return mod.error(e);
				}

				// Set zone type from compat
				try {
					if (require("../compat/data/spZones")["ids"].includes(guide.id))
						guide.type = SP;
					else if (require("../compat/data/esZones")["ids"].includes(guide.id))
						guide.type = ES;
				} catch (e) {}
			}
		} catch (e) {
			return sendDebug(debug_enabled, `Guide "${zone}" is not found`);
		}

		// Send debug message
		sendDebug(mod.settings.debug.all || debug_enabled, 
			`Guide type is: ${guide.type === SP ? "SP" : (guide.type === ES ? "ES" : "not set")}`
		);

		// Send welcome message
		textHandler({
			"sub_type": "PRMSG",
			"delay": 5000,
			"message": `${lang.strings.enterdg}: ${cr}${guide.name} ${cw}[${guide.id}]`
		});
		textHandler({
			"sub_type": "CGMSG",
			"delay": 5000,
			"message": `${lang.strings.helpheader}\n` +
				`${lang.strings.stream}: ${mod.settings.stream ? lang.strings.enabled : lang.strings.disabled}\n` +
				`${lang.strings.gNotice}: ${mod.settings.gNotice ? lang.strings.enabled : lang.strings.disabled}\n` +
				`${lang.strings.speaks}: ${mod.settings.speaks ? lang.strings.enabled : lang.strings.disabled}`
		});

		// Set guide as loaded
		guide.loaded = true;
	};
};


/** EXPORT COMPAT FUNCTIONS **/

module.exports.lib = require("../compat/lib");
module.exports.spawn = require("../spawn");