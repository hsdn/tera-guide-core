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
 * Apply distance to specified binding point.
 * @param {Object} loc Entity object of the binding point
 * @param {number} offsetDistance Offset distance relative to binding point
 * @param {number} offsetAngle Offset angle relative to binding point
 * @return {Object} loc Entity object of the binding point
 */
function applyDistance(loc, offsetDistance, offsetAngle) {
	const r = loc.w;
	const rads = offsetAngle * Math.PI / 180;
	const finalrad = r - rads;

	loc.x += Math.cos(finalrad) * offsetDistance;
	loc.y += Math.sin(finalrad) * offsetDistance;

	return loc;
}

/**
 * @class Util
 */
class Util {
	/**
	 * Creates an instance of Util.
	 * @param {Object} mod Instance of module
	 * @memberof Util
	 */
	constructor(mod) {
		this.mod = mod;
	}

	/**
	 * Create timer for specified delay.
	 * @param {TimerHandler} handler Handler function
	 * @param {number} delay Timer delay in milliseconds
	 * @param {*[]} args Handler function arguments
	 * @return {(Object|boolean)} Timer object of false
	 * @memberof Util
	 */
	delay(handler, delay, ...args) {
		const delayNumber = parseInt(delay);

		if (!isNaN(delayNumber) && delayNumber > 0)
			return this.mod.setTimeout(handler, delayNumber, ...args);
		else
			handler(...args);

		return false;
	}
}

/**
 * @class Spawn
 */
class Spawn extends Util {
	/**
	 * Creates an instance of thing.
	 * @param {Object} entity Object of the binding point
	 * @param {Object} mod Instance of module
	 * @param {Object} handlers Object of handlers.types
	 * @param {Object} [event={}] Object of triggered event
	 * @memberof Spawn
	 */
	constructor(entity, mod, handlers, event = {}) {
		super(mod);

		this.__entity = entity;
		this.__handlers = handlers;
		this.__event = event;
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
		const thing = new Item(this.__entity, this.__handlers, this.__event);

		thing.setParams(item);
		thing.setPosition(Math.PI * angle / 180, distance);

		this.delay(() => thing.render(duration), delay);
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
		const deg = Math.PI * angle / 180;

		// Spawn a marker board item
		const thing = new BuildObject(this.__entity, this.__handlers, this.__event);

		thing.setParams(1, label || ["SAFE SPOT", "SAFE"]);
		thing.setOffset(target);
		thing.setPosition(deg, distance);

		this.delay(() => thing.render(duration), delay);

		// Add highlight point to the marker if highlight param is true
		// Also allow to specify color of the highlight item
		if (highlight) {
			const items = {
				"blue": HIGHLIGHT_ITEM_BLUE,
				"purple": HIGHLIGHT_ITEM_PURPLE,
				"red": HIGHLIGHT_ITEM_RED
			};

			const item = new Item(this.__entity, this.__handlers, this.__event);

			item.setParams(items[highlight] || HIGHLIGHT_ITEM);
			item.setOffset(target);
			item.setPosition(deg, distance);

			this.delay(() => item.render(duration), delay);
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
		const thing = new Collection(this.__entity, this.__handlers, this.__event);

		thing.setParams(item);
		thing.setPosition(Math.PI * angle / 180, distance);

		this.delay(() => thing.render(duration), delay);
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
		const range = Math.max(length, 0);
		const deg = angle * Math.PI / 180;

		const thing = new Collection(this.__entity, this.__handlers, this.__event);

		thing.setParams(item);
		thing.setOffset(false, offsetAngle, offsetDistance);

		this.delay(() => {
			for (let radius = 50; radius <= range; radius += 50)
				thing.setPosition(deg, radius).render(duration);
		}, delay);
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
		const distance = Math.max(radius, 0);
		const step = Math.max(interval, 0) || Math.max(16 - (distance / 100), 5);

		const thing = new Collection(this.__entity, this.__handlers, this.__event);

		thing.setParams(item);
		thing.setOffset(target, offsetAngle, offsetDistance);

		this.delay(() => {
			for (let angle = -Math.PI; angle <= Math.PI; angle += Math.PI * step / 180)
				thing.setPosition(angle, distance).render(duration);
		}, delay);
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
		const distance = Math.max(radius, 0);
		const step = Math.max(interval, 0) || Math.max(20 - (distance / 100), 6);

		const thing = new Collection(this.__entity, this.__handlers, this.__event);

		thing.setParams(item);
		thing.setOffset(false, offsetAngle, offsetDistance);

		this.delay(() => {
			if ((degree1 <= 180 && degree2 <= 180) || (degree1 > 180 && degree2 > 180))
				for (let angle = -Math.PI * -degree1 / 180; angle <= Math.PI * degree2 / 180; angle += Math.PI * step / 180)
					thing.setPosition(angle, distance).render(duration);
			else {
				for (let angle = -Math.PI * -degree1 / 180; angle <= Math.PI; angle += Math.PI * step / 180)
					thing.setPosition(angle, distance).render(duration);

				for (let angle = Math.PI; angle <= Math.PI * degree2 / 180; angle += Math.PI * step / 180)
					thing.setPosition(angle, distance).render(duration);
			}
		}, delay);
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
	semi(...args) {
		this.semicircle(...args);
	}
}

/**
 * @class Place
 */
class Place {
	/**
	 * Creates an instance of Place.
	 * @param {Object} entity Object of the binding point
	 * @param {Object} handlers Object of handlers.types
	 * @param {Object} [event={}] Object of triggered event
	 * @memberof Place
	 */
	constructor(entity, handlers, event = {}) {
		this.handlers = handlers;
		this.entity = entity;
		this.event = event;
		this.useDest = false;
		this.offsetAngle = 0;
		this.offsetDistance = 0;
		this.params = { "angle": 0, "distance": 0 };
	}

	/**
	 * Spawn an item with the specified properties.
	 * @param {number} duration The lifetime of the item (before its despawn)
	 * @memberof Place
	 */
	render(duration) {
		this.params.sub_delay = duration;

		if (this.event.tag !== undefined)
			this.params.tag = this.event.tag;

		let loc = undefined;

		if (this.useDest && this.entity.dest !== undefined)
			loc = this.entity.dest.clone();
		else if (this.entity.loc !== undefined)
			loc = this.entity.loc.clone();

		if (loc) {
			loc.w = this.entity.loc.w;
			loc = applyDistance(loc, this.offsetDistance, 360 - this.offsetAngle);

			this.handlers.spawn(this.params, { loc });
		}

		return this;
	}

	/**
	 * Set the parameters of the item offset position.
	 * @param {boolean} [useDest=false] Using "dest" instead of "loc" when defining an anchor point
	 * @param {number} [angle=0] Offset angle relative to binding point
	 * @param {number} [distance=0] Offset distance relative to binding point (1 meter = 25 units)
	 * @memberof Place
	 */
	setOffset(useDest = false, angle = 0, distance = 0) {
		this.useDest = useDest;
		this.offsetAngle = angle;
		this.offsetDistance = distance;

		return this;
	}

	/**
	 * Set the parameters for rositing the item.
	 * @param {number} [angle=0] Angle relative to binding point
	 * @param {number} [distance=0] Distance relative to binding point (1 meter = 25 units)
	 * @memberof Place
	 */
	setPosition(angle = 0, distance = 0) {
		this.params.offset = angle;
		this.params.distance = distance;

		return this;
	}

	/**
	 * Set item creation properties.
	 * @param {number} item Item identifier of the spawned item
	 * @param {string} [subType="collection"] Type of item being spawned
	 * @param {Object} [params={}] Object of item creation properties
	 * @memberof Place
	 */
	setParams(item, subType = "collection", params = {}) {
		this.params.id = item;
		this.params.sub_type = subType;

		Object.assign(this.params, params);

		return this;
	}
}

/**
 * @class Collection
 * @extends {Place}
 */
class Collection extends Place {}

/**
 * @class Item
 * @extends {Place}
 */
class Item extends Place {
	/**
	 * Set item creation properties.
	 * @param {number} item item Item identifier of the spawned item
	 * @memberof Item
	 */
	setParams(item) {
		return super.setParams(item, "item");
	}
}

/**
 * @class BuildObject
 * @extends {Place}
 */
class BuildObject extends Place {
	/**
	 * Set item creation properties.
	 * @param {number} item item Item identifier of the spawned item
	 * @param {string[]} label Array of text label
	 * @memberof BuildObject
	 */
	setParams(item, label) {
		return super.setParams(item, "build_object", { "ownerName": label[0], "message": label[1] });
	}
}

module.exports = {
	HIGHLIGHT_ITEM,
	HIGHLIGHT_ITEM_BLUE,
	HIGHLIGHT_ITEM_PURPLE,
	HIGHLIGHT_ITEM_RED,
	MARKER_ITEM,
	applyDistance,
	Spawn
};