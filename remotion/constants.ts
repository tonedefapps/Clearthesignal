export const COLORS = {
  bg: '#1e1e35',
  spiral: '#6b6fad',
  tail: '#c4673a',
  node: '#a8c4e0',
  centerMid: '#8f93c9',
  ambient: '#d4c4a8',
}

// Tail: from red-rock origin (116,14) down to spiral junction (101,44)
export const TAIL_PATH = 'M 116 14 C 113 24 108 34 101 44'

// Spiral reversed: from junction (101,44) inward to center node (71,60)
export const SPIRAL_PATH =
  'M 101 44 ' +
  'C 110 66 102 91 78 100 ' +
  'C 57 107 35 100 27 80 ' +
  'C 20 62 26 43 44 36 ' +
  'C 59 30 75 35 82 50 ' +
  'C 88 63 85 79 71 86 ' +
  'C 61 91 48 88 43 77 ' +
  'C 38 67 41 55 52 50 ' +
  'C 60 46 71 53 71 60'

// Junction node: appears when tail finishes
export const JUNCTION_NODE = { cx: 101, cy: 44, r: 2.5, opacity: 0.85 }

// Constellation nodes, ordered by approximate appearance along the reversed spiral.
// t = fraction of spiral progress (0–1) when the orb reaches this star.
export const SPIRAL_NODES = [
  { cx: 60,  cy: 100, r: 2.5, t: 0.10, opacity: 0.82 }, // bottom dip
  { cx: 30,  cy: 60,  r: 2.8, t: 0.28, opacity: 0.92 }, // outer left
  { cx: 60,  cy: 34,  r: 2.5, t: 0.40, opacity: 0.85 }, // top
  { cx: 80,  cy: 60,  r: 2.8, t: 0.53, opacity: 0.95 }, // outer right
  { cx: 60,  cy: 87,  r: 2.5, t: 0.63, opacity: 0.88 }, // lower inner
  { cx: 43,  cy: 77,  r: 2.8, t: 0.73, opacity: 0.95 }, // lower left inner
  { cx: 60,  cy: 50,  r: 2.5, t: 0.84, opacity: 0.88 }, // inner upper
  { cx: 71,  cy: 60,  r: 2.8, t: 0.94, opacity: 0.95 }, // inner right
]

// Ambient background stars (fixed positions from SpiralIcon)
export const AMBIENT_STARS = [
  { cx: 18,  cy: 22,  r: 1.2, opacity: 0.16 },
  { cx: 95,  cy: 18,  r: 1.0, opacity: 0.13 },
  { cx: 104, cy: 88,  r: 1.2, opacity: 0.14 },
  { cx: 14,  cy: 96,  r: 1.0, opacity: 0.13 },
  { cx: 108, cy: 48,  r: 0.8, opacity: 0.12 },
  { cx: 22,  cy: 58,  r: 0.8, opacity: 0.12 },
]

// Orb shoots off beyond origin in the direction of the tail extension.
// Direction from junction (101,44) → origin (116,14), normalized.
export const FLY_OFF_DIR = { x: 0.447, y: -0.894 }

export const FPS = 30

// Intro: origin appears → tail draws → spiral draws → center glow → wordmark
// Total 3 seconds
export const INTRO_FRAMES = 90

// Outro: hold → wordmark out → spiral retracts → tail retracts → orb flies off → fade
// Total 4 seconds
export const OUTRO_FRAMES = 120

// How far the orb travels beyond origin (in SVG units) and max scale on fly-off
export const FLY_OFF_DISTANCE = 90
export const FLY_OFF_MAX_SCALE = 6

// Frame ranges used by both compositions
export const FRAMES = {
  // Intro
  ORIGIN_FADE:    [0,  8]  as [number, number],
  TAIL_DRAW:      [8,  22] as [number, number],
  SPIRAL_DRAW:    [22, 68] as [number, number],
  CENTER_GLOW:    [68, 78] as [number, number],
  WORDMARK_FADE:  [76, 88] as [number, number],

  // Outro — 120 frames total (4s)
  // Frames 0-30: brand lingers at full visibility before anything moves
  O_WORDMARK_OUT: [30, 44] as [number, number], // wordmark fades slowly
  O_CENTER_OUT:   [36, 48] as [number, number], // center glow collapses
  O_SPIRAL_OUT:   [44, 84] as [number, number], // spiral retracts (40 frames)
  O_TAIL_OUT:     [84, 98] as [number, number], // tail retracts (14 frames)
  O_FLY_OFF:      [96, 116] as [number, number], // orb flies off, grows (20 frames)
  O_FADE_OUT:     [108, 120] as [number, number], // fade to black
}
