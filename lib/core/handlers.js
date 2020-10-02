'use strict';

const { Spawn } = require("../spawn");
const Send = require("../send");
const voice = require("../voice");

// Tank class ids(brawler + lancer)
const TANK_CLASS_IDS = [1, 10];
// Dps class ids(not counting warrior)
const DPS_CLASS_IDS = [2, 3, 4, 5, 8, 9, 11, 12];
// Healer class ids
const HEALER_CLASS_IDS = [6, 7];
// Warrior Defence stance abnormality ids
const WARRIOR_TANK_IDS = [100200, 100201];

class Handlers {

	constructor(mod, lang, dispatch, params, guide) {
		this.mod = mod;
		this.lang = lang;
		this.dispatch = dispatch;
		this.params = params;
		this.guide = guide;

		this.send = new Send(mod, params);

		// Used for item unique id in spawn handler
		this.uint64 = 0xFFFFFFFA;
	}

	// Spawn handler
	spawn(event = {}, ent = false, speed = 1.0) {
		// Ignore if streamer mode is enabled
		if (this.mod.settings.stream) return;

		// Ignore if spawnObject is disabled
		if (!this.mod.settings.spawnObject || !this.guide.obj.spawnObject) return;

		// Check ent is defined
		if (!ent) ent = this.guide.obj.ent;
		if (!ent) return this.mod.error("Spawn handler has invalid entity or not specified");

		// If func is defined, try to call the spawn function from the lib and return
		if (event["func"]) {
			// Make sure args is defined
			if (!event["args"]) return this.mod.error("Spawn handler needs a args");
			
			// Create timer for specified delay
			const delay = parseInt(event["delay"]);

			try {
				this.delayEvent((self, event, ent, speed) => {
					// Create a Spawn class
					const instance = new Spawn(ent, self.mod, self, speed);

					if (!instance[event["func"]])
						self.mod.error(`An event has invalid func: ${event["func"]}`);

					instance[event["func"]](...event["args"]);
				}, delay, speed, event, ent, speed);
			} catch (e) {
				this.mod.error(e);
			}

			return;
		}

		// Make sure id is defined
		if (!event["id"]) return this.mod.error("Spawn handler needs a id");

		// Make sure sub_delay is defined
		if (!event["sub_delay"]) return this.mod.error("Spawn handler needs a sub_delay");

		// Set delays for timers
		const delay = parseInt(event["delay"]);
		const sub_delay = parseInt(event["sub_delay"]);

		// Set sub_type to be collection as default for backward compatibility
		const sub_type = event["sub_type"] || "collection";

		// The unique spawned id self item will be using.
		const item_unique_id = event["force_gameId"] || this.uint64--;

		// Create timer for spawn item
		this.delayEvent((self, event, ent, speed, sub_delay, sub_type, item_unique_id) => {
			const { library } = self.mod.require.library;

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
					return self.mod.error(`Invalid sub_type for spawn handler: ${event['sub_type']}`);
			}

			// Add entry to spawned objects list for its bath despawn
			self.guide.obj.spawned_items[item_unique_id] = sub_type;

			// Spawn item by type
			switch (sub_type) {
				case "collection":
					self.mod.toClient("S_SPAWN_COLLECTION", 4, sending_event);
					break;

				case "item":
					self.mod.toClient("S_SPAWN_DROPITEM", 8, sending_event);
					break;

				case "build_object":
					self.mod.toClient("S_SPAWN_BUILD_OBJECT", 2, sending_event);
					break;
			}

			// Call handler to despawn a spawned item
			self.despawn({
				id: item_unique_id,
				sub_type: sub_type,
				delay: sub_delay
			}, ent, speed);

		}, delay, speed, event, ent, speed, sub_delay, sub_type, item_unique_id);
	}
	spawn_func(...args) {
		this.spawn(...args);
	}

	// Despawn handler for objects, spawned by "force_gameId"
	despawn(event = {}, ent = false, speed = 1.0) {
		// Make sure id is defined
		if (!event['id']) return this.mod.error("Spawn handler needs a id");

		// Returns if item already despawned
		if (!this.guide.obj.spawned_items[event["id"]]) return;

		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Callback function
		this.delayEvent((self, event) => {
			// Set sub_type to be collection as default for backward compatibility
			const sub_type = event["sub_type"] || "collection";

			const despawn_event = {
				gameId: event["id"],
				unk: 0, // used in S_DESPAWN_BUILD_OBJECT
				collected: false // used in S_DESPAWN_COLLECTION
			};

			// Delete despawned item from the list
			delete self.guide.obj.spawned_items[despawn_event.gameId];

			// Despawn item by type
			switch (sub_type) {
				case "collection":
					return self.mod.toClient("S_DESPAWN_COLLECTION", 2, despawn_event);

				case "item":
					return self.mod.toClient("S_DESPAWN_DROPITEM", 4, despawn_event);

				case "build_object":
					return self.mod.toClient("S_DESPAWN_BUILD_OBJECT", 2, despawn_event);

				default:
					return self.mod.error(`Invalid sub_type for despawn handler: ${event["sub_type"]}`);
			}
		}, delay, speed, event);
	}

	// Despawn handler for force despawn all spawned objects
	despawn_all(event = {}, ent = false, speed = 1.0) {
		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Callback function
		this.delayEvent((self) => {
			for (const [gameId, sub_type] of Object.entries(self.guide.obj.spawned_items)) {
				// Call handler to despawn a spawned item
				self.despawn({ id: gameId, sub_type: sub_type });
			}
		}, delay, speed);
	}

	// Text handler
	text(event = {}, ent = false, speed = 1.0) {
		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Fetch the message
		const message = event[`message_${this.lang.uclanguage}`] || event[`message_${this.lang.language}`] || event["message"];

		// Make sure sub_type is defined
		if (!event["sub_type"]) return this.mod.error("Text handler needs a sub_type");

		// Make sure message is defined
		if (!message) return this.mod.error("Text handler needs a message");

		// Play the voice for specified types
		if (["message", "alert", "warning", "notification", "msgcp", "msgcg", "speech"].includes(event["sub_type"])) {
			// Ignoring if verbose mode is disabled
			if (!this.guide.obj.verbose) return;

			// Play the voice of text message
			if (voice && this.mod.settings.speaks) {
				this.delayEvent((self, voice) => {
					voice.speak(message, self.mod.settings.rate);
				}, delay - 600, speed, voice);
			}

			// Ignoring sending a text message if "speech" sub_type specified
			if (event["sub_type"] == "speech") return;
		}

		this.delayEvent((self, event, message) => {
			switch (event["sub_type"]) {
				// Basic message
				case "message":
					self.send.message(message);
					break;

				// Alert message red
				case "alert":
					self.send.alert(message, cr, spr);
					break;

				// Alert message blue
				case "warning":
					self.send.alert(message, clb, spb);
					break;

				// Notification message
				case "notification":
					self.send.notification(message);
					break;

				// Pink dungeon event message
				case "msgcp":
					self.send.dungeonEvent(message, cp, spg);
					break;

				// Green dungeon event message
				case "msgcg":
					self.send.dungeonEvent(message, cg, spg);
					break;

				// Debug or test message to the proxy-channel and log console
				case "MSG":
					self.mod.command.message(cr + message);
					console.log(cr + message);
					break;

				// Color-specified proxy-channel messages
				case "COMSG":
					self.mod.command.message(co + message);
					break;

				case "CYMSG":
					self.mod.command.message(cy + message);
					break;

				case "CGMSG":
					self.mod.command.message(cg + message);
					break;

				case "CDBMSG":
					self.mod.command.message(cdb + message);
					break;

				case "CBMSG":
					self.mod.command.message(cb + message);
					break;

				case "CVMSG":
					self.mod.command.message(cv + message);
					break;

				case "CPMSG":
					self.mod.command.message(cp + message);
					break;

				case "CLPMSG":
					self.mod.command.message(clp + message);
					break;

				case "CLBMSG":
					self.mod.command.message(clb + message);
					break;

				case "CBLMSG":
					self.mod.command.message(cbl + message);
					break;

				case "CGRMSG":
					self.mod.command.message(cgr + message);
					break;

				case "CWMSG":
					self.mod.command.message(cw + message);
					break;

				case "CRMSG":
					self.mod.command.message(cr + message);
					break;

				// Default color proxy-channel message
				case "PRMSG":
					self.mod.command.message(self.mod.settings.cc + message);
					break;

				// Invalid sub_type value
				default:
					return self.mod.error(`Invalid sub_type for text handler: ${event['sub_type']}`);
			}
		}, delay, speed, event, message);
	}

	// Func handler
	func(event = {}, ent = false, speed = 1.0) {
		// Make sure func is defined
		if (!event["func"]) return this.mod.error("Func handler needs a func");

		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Set ent to guide from the triggered event for use in called function
		this.guide.obj.ent = ent;

		this.delayEvent((self, event, ent) => {
			// Try to call the function
			try {
				// If load() function is exists, use old calling method (for compat)
				if (typeof self.guide.obj.context.load === "function")
					return event["func"].call(null, self, event, ent, self.dispatch);

				// Call function with defined args
				if (event["args"])
					return event["func"](...event["args"], ent, event, self);
				else
					return event["func"](ent, event, self);
			} catch (e) {
				self.mod.error(e);
			}
		}, delay, speed, event, ent);
	}

	// Add party marker handler
	marker(event = {}, ent = false, speed = 1.0) {
		// Ignore if streamer mode is enabled or verbose is disabled
		if (this.mod.settings.stream || !this.guide.obj.verbose) return;

		// Check ent is defined
		if (!ent) ent = this.guide.obj.ent;

		// Set gameId
		if (!event["id"]) event["id"] = ent.gameId || false;
		if (!event["id"]) return this.mod.error("Marker add handler needs a gameId (id)");

		// Set delays for timers
		const delay = parseInt(event["delay"]);
		const sub_delay = parseInt(event["sub_delay"]);

		// Create timer for specified delay
		this.delayEvent((self, event, ent, speed, sub_delay) => {
			// Clear remove timer if added new marker for existing id
			if (self.guide.obj.marker_ids[event["id"]] && self.guide.obj.marker_ids[event["id"]].timer !== false)
				self.mod.clearTimeout(self.guide.obj.marker_ids[event["id"]].timer);

			// Create timer for remove a added marker
			const timer = self.delayEvent((self, event, ent, speed) => {
				self.marker_remove({ id: event["id"] }, ent, speed);
			}, sub_delay, speed, event, ent, speed);

			// Add the marker
			self.guide.obj.marker_ids[event["id"]] = {
				color: event["color"],
				timer: timer
			};

			// Reset markers by new list
			let targets = [];
			for (const [gameId, obj] of Object.entries(self.guide.obj.marker_ids)) {
				let color = 0;
				switch (obj.color) {
					case "yellow": color = 1; break;
					case "blue":   color = 2; break;
				}
				targets.push({
					target: gameId,
					color: color
				});
			}
			self.mod.toClient("S_PARTY_MARKER", 1, { markers: targets});

		}, delay, speed, event, ent, speed, sub_delay);
	}
	marker_add(...args) {
		this.marker(...args);
	}

	// Remove party marker handler
	marker_remove(event = {}, ent = false, speed = 1.0) {
		// Check ent is defined
		if (!ent) ent = this.guide.obj.ent;

		// Set gameId
		if (!event["id"]) event["id"] = ent.gameId || false;
		if (!event["id"]) return this.mod.error("Marker remove handler needs a gameId (id)");

		// Returns if marker already removed
		if (!this.guide.obj.marker_ids[event["id"]]) return;

		// Set delays for timers
		const delay = parseInt(event["delay"]);

		// Create timer for specified delay
		this.delayEvent((self, event) => {
			delete self.guide.obj.marker_ids[event["id"]];

			// Reset markers by new list
			let targets = [];
			for (const [gameId, obj] of Object.entries(self.guide.obj.marker_ids)) {
				let color = 0;
				switch (obj.color) {
					case "yellow": color = 1; break;
					case "blue":   color = 2; break;
				}
				targets.push({
					target: gameId,
					color: color
				});
			}
			self.mod.toClient("S_PARTY_MARKER", 1, { markers: targets });

		}, delay, speed, event);
	}

	// Remove all party marker handler
	marker_remove_all(event = {}, ent = false, speed = 1.0) {
		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Callback function
		this.delayEvent((self) => {
			for (const [gameId, obj] of Object.entries(self.guide.obj.marker_ids)) {
				// Clear marker remove timer
				if (obj.timer !== false)
					self.mod.clearTimeout(obj.timer);

				// Call handler to marker remove
				self.marker_remove({ id: gameId });
			}
		}, delay, speed);
	}

	// Clear timers handler
	stop_timers(event = {}, ent = false, speed = 1.0) {
		// Set delay for timers
		const delay = parseInt(event["delay"]);

		// Callback function
		this.delayEvent((self) => {
			self.mod.clearAllTimeouts();
			self.mod.clearAllIntervals();
		}, delay, speed);
	}

	// Event handler to process of handled events
	start_events(events = [], ent = false, speed = 1.0) {
		// Check ent is defined
		if (!ent) ent = this.guide.obj.ent;

		// Loop over the events
		for (let event of events) {
			// The function couldn"t be found, so it"s an invalid type
			if (!this[event["type"]])
				this.mod.error(`An event has invalid type: ${event["type"]}`);
			// If the function is found and it passes the class position check, we start the event
			else if (this.classPositionCheck(event["class_position"]))
				this[event["type"]](event, ent, speed);
		}
	}
	event(...args) {
		this.start_events(...args);
	}

	// Create timer for specified delay
	delayEvent(callback, delay, speed, ...args) {
		if (delay > 0)
			return this.mod.setTimeout(callback, delay / speed, this, ...args);
		else {
			callback(this, ...args);
			return false;
		}
	}

	// Makes sure the event passes the class position check
	classPositionCheck(class_position) {
		const { player, effect } = this.mod.require.library;

		// if it's not defined we assume that it's for everyone
		if (!class_position) return true;

		// If it's an array
		if (Array.isArray(class_position)) {
			// If one of the class_positions pass, we can accept it
			for (let ent of class_position) {
				if (this.classPositionCheck(ent)) return true;
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
				this.mod.warn(`Failed to find class position: ${position}`);
		}

		return false;
	}
}

module.exports = Handlers;