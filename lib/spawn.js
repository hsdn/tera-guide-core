/* eslint-disable no-param-reassign */
"use strict";

/** @type {number} Item id of "Tier 21 Superior Twin Swords" */
const HIGHLIGHT_ITEM = 110684;

/** @type {number} Item id of "Annihilation Disc (x1 effect)" */
const HIGHLIGHT_ITEM_BLUE = 89542;

/** @type {number} Item id of "Annihilation Disc (x2 effect)" */
const HIGHLIGHT_ITEM_PURPLE = 89543;

/** @type {number} Item id of "Zenobia's Breeze Crate" */
const HIGHLIGHT_ITEM_RED = 206960;

/** @type {number} Item id of "Velika Banquet Coin" */
const MARKER_ITEM = 88704;

/**
 * @class Spawn
 */
class Spawn {
	/**
	 * Creates an instance of Spawn.
	 * @param {object} entity Object of the binding point (S_ACTION_STAGE)
	 * @param {object} mod Instance of module
	 * @param {object} handlers Object of function_event_handlers (see index.js)
	 * @param {number} [speed=1.0] Divider for timers
	 * @memberof Spawn
	 */
	constructor(entity, mod, handlers, speed = 1.0) {
		this.entity = entity;
		this.mod = mod;
		this.handlers = handlers;
		this.speed = speed;
	}

	/**
	 * Spawn specified item.
	 * @param {number} item Item identifier of the spawned item
	 * @param {number} angle Offset angle relative to binding point (e.g. boss)
	 * @param {number} distance Offset distance relative to binding point (1 meter = 25 units)
	 * @param {number} delay Object spawn time delay
	 * @param {number} duration The lifetime of the object (before its despawn)
	 * @memberof Spawn
	 */
	item(item, angle, distance, delay, duration) {
		angle = Math.PI * angle / 180;

		this.object("item", false, item,
			0, 0,
			angle, distance,
			delay, duration,
			null
		);
	}

	/**
	 * Spawn a marker item.
	 * @param {boolean} target Using "dest" instead of "loc" when defining an anchor point
	 * @param {number} angle Offset angle relative to binding point (e.g. boss)
	 * @param {number} distance Offset distance relative to binding point (1 meter = 25 units)
	 * @param {number} delay Object spawn time delay
	 * @param {number} duration The lifetime of the object (before its despawn)
	 * @param {(string|boolean)} highlight Turn on the highlight marker
	 * @param {string[]} label Array of text label
	 * @memberof Spawn
	 */
	marker(target, angle, distance, delay, duration, highlight, label) {
		if (!label) {
			label = ["SAFE SPOT", "SAFE"];
		}

		angle = Math.PI * angle / 180;

		// Spawn a marker board item
		this.object("build_object", target, 1,
			0, 0,
			angle, distance,
			delay, duration,
			label
		);

		// Add highlight point to the marker if highlight param is true
		// Also allow to specify color of the highlight item
		if (highlight) {
			let item = HIGHLIGHT_ITEM;

			switch (highlight) {
				case "blue": item = HIGHLIGHT_ITEM_BLUE; break;
				case "purple": item = HIGHLIGHT_ITEM_PURPLE; break;
				case "red": item = HIGHLIGHT_ITEM_RED; break;
			}

			this.object("item", target, item,
				0, 0,
				angle, distance,
				delay, duration,
				null
			);
		}
	}

	/**
	 * Spawn a point.
	 * @param {number} item Item identifier of the spawned item
	 * @param {number} angle Offset angle relative to binding point (e.g. boss)
	 * @param {number} distance Offset distance relative to binding point (1 meter = 25 units)
	 * @param {number} delay Object spawn time delay
	 * @param {number} duration The lifetime of the object (before its despawn)
	 * @memberof Spawn
	 */
	point(item, angle, distance, delay, duration) {
		angle = Math.PI * angle / 180;

		this.object("collection", false, item,
			0, 0,
			angle, distance,
			delay, duration,
			null
		);
	}

	/**
	 * Spawn a vector figure.
	 * @param {number} item Item identifier of the spawned items
	 * @param {number} offsetAngle Offset angle relative to binding point (e.g. boss)
	 * @param {number} offsetDistance Offset distance relative to binding point (1 meter = 25 units)
	 * @param {number} angle Angle of the vector direction
	 * @param {number} length The length of the vector in units (1 meter = 25 units)
	 * @param {number} delay Object spawn time delay
	 * @param {number} duration The lifetime of the object (before its despawn)
	 * @memberof Spawn
	 */
	vector(item, offsetAngle, offsetDistance, angle, length, delay, duration) {
		angle = angle * Math.PI / 180;

		for (let radius = 50; radius <= length; radius += 50) {
			this.object("collection", false, item,
				offsetAngle, offsetDistance,
				angle, radius,
				delay, duration,
				null
			);
		}
	}

	/**
	 * Spawn a circle figure.
	 * @param {number} target Using "dest" instead of "loc" when defining an anchor point
	 * @param {number} item Item identifier of the spawned items
	 * @param {number} offsetAngle Offset angle relative to binding point (e.g. boss)
	 * @param {number} offsetDistance Offset distance relative to binding point (1 meter = 25 units)
	 * @param {number} interval The factor of the multiplicity of objects in a circle (less value - more objects)
	 * @param {number} radius The radius of the circle in units (1 meter = 25 units)
	 * @param {number} delay Object spawn time delay
	 * @param {number} duration The lifetime of the object (before its despawn)
	 * @memberof Spawn
	 */
	circle(target, item, offsetAngle, offsetDistance, interval, radius, delay, duration) {
		for (let angle = -Math.PI; angle <= Math.PI; angle += Math.PI * interval / 180) {
			this.object("collection", target, item,
				offsetAngle, offsetDistance,
				angle, radius,
				delay, duration,
				null
			);
		}
	}

	/**
	 * Spawn a Semicircle
	 * @param {number} degree1 Degree of the first half of the semicircle (negative values allowed)
	 * @param {number} degree2 Degree of the second half of the semicircle (negative values allowed)
	 * @param {number} item Item identifier of the spawned items
	 * @param {number} offsetAngle Offset angle relative to binding point (e.g. boss)
	 * @param {number} offsetDistance Offset distance relative to binding point (1 meter = 25 units)
	 * @param {number} interval The factor of the multiplicity of objects in a circle (less value - more objects)
	 * @param {number} radius The radius of the circle in units (1 meter = 25 units)
	 * @param {number} delay Object spawn time delay
	 * @param {number} duration The lifetime of the object (before its despawn)
	 * @memberof Spawn
	 */
	semicircle(degree1, degree2, item, offsetAngle, offsetDistance, interval, radius, delay, duration) {
		let db = 0, dg = 0;

		if (degree1 <= 180 && degree2 <= 180) {
			db = -degree1 / 180;
			dg = degree2 / 180;
		} else if (degree1 > 180 && degree2 > 180) {
			db = -degree1 / 180;
			dg = degree2 / 180;
		} else {
			db = -degree1 / 180;
			dg = degree2 / 180;

			for (let angle = -Math.PI * db; angle <= Math.PI; angle += Math.PI * interval / 180) {
				this.object("collection", false, item,
					offsetAngle, offsetDistance,
					angle, radius,
					delay, duration,
					null
				);
			}

			for (let angle = Math.PI ; angle <= Math.PI * dg; angle += Math.PI * interval / 180) {
				this.object("collection", false, item,
					offsetAngle, offsetDistance,
					angle, radius,
					delay, duration,
					null
				);
			}

			return;
		}

		for (let angle = -Math.PI * db; angle <= Math.PI * dg; angle += Math.PI * interval / 180) {
			this.object("collection", false, item,
				offsetAngle, offsetDistance,
				angle, radius,
				delay, duration,
				null
			);
		}
	}

	/**
	 * @param {*} args
	 * @memberof Spawn
	 */
	semi(...args) {
		this.semicircle(...args);
	}

	/**
	 * Spawn a single object.
	 * @param {string} type Type of spawned object (allowed values: "collection", "item", "build_object")
	 * @param {boolean} target Using "dest" instead of "loc" when defining an anchor point
	 * @param {number} item Item identifier of the spawned object items
	 * @param {number} offsetAngle Offset angle relative to binding point (e.g. boss)
	 * @param {number} offsetDistance Offset distance relative to binding point (1 meter = 25 units)
	 * @param {number} angle Angle of the object direction
	 * @param {number} distance Distance (1 meter = 25 units)
	 * @param {number} delay Object spawn time delay
	 * @param {number} duration The lifetime of the object (before its despawn)
	 * @param {string[]} label Array of text label
	 * @memberof Spawn
	 */
	object(type, target, item, offsetAngle, offsetDistance, angle, distance, delay, duration, label) {
		const self = this;

		// Spawn callback function
		const callback = () => {
			// A binding point for a spawned object
			let shield_loc = {};

			// Use "dest" instead of "loc" if it's specified and target is true
			if (target && self.entity["dest"] !== undefined)
				shield_loc = self.entity["dest"].clone();
			// Use "loc" if if it's specified and target is false
			else if (self.entity["loc"] !== undefined)
				shield_loc = self.entity["loc"].clone();
			else
				return;

			// Set value of loc.w for the binding point
			shield_loc.w = self.entity["loc"].w;

			// Apply distance to the binding point
			applyDistance(shield_loc, offsetDistance, 360 - offsetAngle);

			// Spawn a object by specified type
			switch (type) {
				// S_SPAWN_COLLECTION
				case "collection":
					self.handlers.spawn({
						"id": item,
						"sub_delay": duration,
						"distance": distance,
						"offset": angle
					}, {
						"loc": shield_loc
					});
					break;

				// S_SPAWN_DROPITEM
				case "item":
					self.handlers.spawn({
						"sub_type": "item",
						"id": item,
						"sub_delay": duration,
						"distance": distance,
						"offset": angle
					}, {
						"loc": shield_loc
					});
					break;

				// S_SPAWN_BUILD_OBJECT
				case "build_object":
					self.handlers.spawn({
						"sub_type": "build_object",
						"id": item,
						"sub_delay": duration,
						"distance": distance,
						"offset": angle,
						"ownerName": label[0],
						"message": label[1]
					}, {
						"loc": shield_loc
					});
					break;
			}
		};

		// Create a local timer if delay more that zero
		if (delay > 0) {
			this.mod.setTimeout(callback, delay / this.speed);
		} else {
			callback();
		}
	}
}

/**
 * Apply distance to specified binding point.
 * @param {object} loc
 * @param {number} offsetDistance Offset distance relative to binding point
 * @param {number} offsetAngle Offset angle relative to binding point
 * @return {loc} 
 */
function applyDistance(loc, offsetDistance, offsetAngle) {
	const r = loc.w; //(loc.w / 0x8000) * Math.PI;
	const rads = (offsetAngle * Math.PI / 180);
	const finalrad = r - rads;

	loc.x += Math.cos(finalrad) * offsetDistance;
	loc.y += Math.sin(finalrad) * offsetDistance;

	return loc;
}

module.exports = {
	HIGHLIGHT_ITEM,
	HIGHLIGHT_ITEM_BLUE,
	HIGHLIGHT_ITEM_PURPLE,
	HIGHLIGHT_ITEM_RED,
	MARKER_ITEM,
	Spawn,
	applyDistance
};