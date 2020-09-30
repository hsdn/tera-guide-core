'use strict';

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

// GUI colors
global.gcr = '#fe6f5e';  // red
global.gcg = '#4de19c';  // green
global.gcy = '#c0b94d';  // yellow
global.gcgr = '#778899'; // gray


module.exports = (mod, lang, params, guide) => {
	// Assign custom colors
	if (params.colors.general) Object.assign(global, params.colors.general);
	if (params.colors.gui) Object.assign(global, params.colors.gui);
};