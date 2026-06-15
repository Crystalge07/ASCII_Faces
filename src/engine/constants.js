export const CANVAS_W = 20;
export const CANVAS_H = 12;

// z-order: index 0 paints first (underneath), last paints on top.
export const LAYER_ORDER = ['head', 'eyes', 'nose', 'mouth'];

// Authored space handling — see "Transparency" in spec.
export const TRANSPARENT_CHAR = ' '; // a space in a part = leave cell underneath

// Canvas row where the bottom ink line of every head should land (0-indexed).
export const HEAD_CHIN_ROW = 10;

// TODO: introduce a sentinel char (e.g. backtick) to force-paint opaque spaces.
