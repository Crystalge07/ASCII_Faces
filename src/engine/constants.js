export const CANVAS_W = 24;
export const CANVAS_H = 16;

// z-order: index 0 paints first (underneath), last paints on top.
export const LAYER_ORDER = ['head', 'hair', 'eyes', 'nose', 'mouth'];

// Authored space handling — see "Transparency" in spec.
export const TRANSPARENT_CHAR = ' '; // a space in a part = leave cell underneath

// TODO: introduce a sentinel char (e.g. backtick) to force-paint opaque spaces.
