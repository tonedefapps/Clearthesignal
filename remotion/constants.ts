export const COLORS = {
  bg: '#1e1e35',
  spiral: '#6b6fad',
  tail: '#c4673a',
  node: '#a8c4e0',
  centerMid: '#8f93c9',
  ambient: '#d4c4a8',
}

// Tail: from red-rock terminal star (116,14) down to spiral junction (104,60)
export const TAIL_PATH = 'M 116 14 L 104 60'

// Reversed paths for outro outward traversal
export const REVERSE_SPIRAL_PATH =
  'M 60 60 ' +
  'L 68 46 ' +
  'L 76 51 ' +
  'L 80 60 ' +
  'L 79 71 ' +
  'L 72 81 ' +
  'L 60 86 ' +
  'L 46 84 ' +
  'L 34 75 ' +
  'L 28 60 ' +
  'L 31 43 ' +
  'L 42 29 ' +
  'L 60 22 ' +
  'L 80 25 ' +
  'L 96 39 ' +
  'L 104 60'

export const REVERSE_TAIL_PATH = 'M 104 60 L 116 14'

// Spiral reversed: from junction (104,60) inward to center (60,60)
export const SPIRAL_PATH =
  'M 104 60 ' +
  'L 96 39 ' +
  'L 80 25 ' +
  'L 60 22 ' +
  'L 42 29 ' +
  'L 31 43 ' +
  'L 28 60 ' +
  'L 34 75 ' +
  'L 46 84 ' +
  'L 60 86 ' +
  'L 72 81 ' +
  'L 79 71 ' +
  'L 80 60 ' +
  'L 76 51 ' +
  'L 68 46 ' +
  'L 60 60'

// Junction node: appears when tail finishes, at spiral entry point
export const JUNCTION_NODE = { cx: 104, cy: 60, r: 1.8, opacity: 0.96 }

// Constellation nodes ordered by appearance along the reversed (outer→inner) spiral.
// t = fraction of spiral progress (0=junction at 104,60, 1=center at 60,60).
// Magnitude gradient: outermost nodes are largest/brightest.
export const SPIRAL_NODES = [
  { cx: 96,  cy: 39,  r: 1.7, t: 0.10, opacity: 0.95 },
  { cx: 80,  cy: 25,  r: 1.6, t: 0.19, opacity: 0.93 },
  { cx: 60,  cy: 22,  r: 1.6, t: 0.27, opacity: 0.92 },
  { cx: 42,  cy: 29,  r: 1.5, t: 0.35, opacity: 0.91 },
  { cx: 31,  cy: 43,  r: 1.5, t: 0.43, opacity: 0.89 },
  { cx: 28,  cy: 60,  r: 1.4, t: 0.50, opacity: 0.88 },
  { cx: 34,  cy: 75,  r: 1.4, t: 0.57, opacity: 0.87 },
  { cx: 46,  cy: 84,  r: 1.3, t: 0.64, opacity: 0.85 },
  { cx: 60,  cy: 86,  r: 1.3, t: 0.70, opacity: 0.84 },
  { cx: 72,  cy: 81,  r: 1.2, t: 0.75, opacity: 0.81 },
  { cx: 79,  cy: 71,  r: 1.2, t: 0.80, opacity: 0.78 },
  { cx: 80,  cy: 60,  r: 1.1, t: 0.85, opacity: 0.75 },
  { cx: 76,  cy: 51,  r: 1.1, t: 0.89, opacity: 0.72 },
  { cx: 68,  cy: 46,  r: 1.0, t: 0.93, opacity: 0.68 },
]

// Full starfield — mirrors SpiralIcon.tsx starfield
export const AMBIENT_STARS = [
  // top edge
  { cx: 0,   cy: 4,   r: 0.70, opacity: 0.26 },
  { cx: 13,  cy: 1,   r: 0.55, opacity: 0.19 },
  { cx: 27,  cy: 6,   r: 0.82, opacity: 0.28 },
  { cx: 41,  cy: 2,   r: 0.48, opacity: 0.16 },
  { cx: 57,  cy: 7,   r: 0.64, opacity: 0.22 },
  { cx: 71,  cy: 1,   r: 0.44, opacity: 0.15 },
  { cx: 85,  cy: 5,   r: 0.76, opacity: 0.26 },
  { cx: 99,  cy: 3,   r: 0.52, opacity: 0.18 },
  { cx: 112, cy: 7,   r: 0.68, opacity: 0.23 },
  { cx: 120, cy: 2,   r: 0.60, opacity: 0.20 },
  // bottom edge
  { cx: 0,   cy: 117, r: 0.72, opacity: 0.25 },
  { cx: 15,  cy: 120, r: 0.50, opacity: 0.17 },
  { cx: 31,  cy: 114, r: 0.66, opacity: 0.22 },
  { cx: 47,  cy: 119, r: 0.42, opacity: 0.14 },
  { cx: 62,  cy: 116, r: 0.78, opacity: 0.26 },
  { cx: 77,  cy: 120, r: 0.46, opacity: 0.16 },
  { cx: 91,  cy: 115, r: 0.60, opacity: 0.20 },
  { cx: 106, cy: 119, r: 0.54, opacity: 0.18 },
  { cx: 119, cy: 113, r: 0.74, opacity: 0.25 },
  // left edge
  { cx: 2,   cy: 17,  r: 0.68, opacity: 0.23 },
  { cx: 0,   cy: 31,  r: 0.58, opacity: 0.20 },
  { cx: 3,   cy: 46,  r: 0.80, opacity: 0.27 },
  { cx: 1,   cy: 60,  r: 0.52, opacity: 0.18 },
  { cx: 4,   cy: 74,  r: 0.74, opacity: 0.25 },
  { cx: 0,   cy: 88,  r: 0.60, opacity: 0.20 },
  { cx: 3,   cy: 102, r: 0.66, opacity: 0.22 },
  // right edge
  { cx: 118, cy: 21,  r: 0.62, opacity: 0.21 },
  { cx: 120, cy: 35,  r: 0.76, opacity: 0.26 },
  { cx: 117, cy: 49,  r: 0.50, opacity: 0.17 },
  { cx: 120, cy: 63,  r: 0.70, opacity: 0.24 },
  { cx: 118, cy: 77,  r: 0.44, opacity: 0.15 },
  { cx: 120, cy: 91,  r: 0.80, opacity: 0.27 },
  { cx: 117, cy: 105, r: 0.56, opacity: 0.19 },
  // interior
  { cx: 18,  cy: 14,  r: 0.86, opacity: 0.29 },
  { cx: 44,  cy: 11,  r: 0.44, opacity: 0.15 },
  { cx: 68,  cy: 15,  r: 0.60, opacity: 0.20 },
  { cx: 95,  cy: 12,  r: 0.38, opacity: 0.12 },
  { cx: 9,   cy: 27,  r: 0.52, opacity: 0.17 },
  { cx: 33,  cy: 22,  r: 0.74, opacity: 0.25 },
  { cx: 58,  cy: 29,  r: 0.40, opacity: 0.13 },
  { cx: 81,  cy: 24,  r: 0.88, opacity: 0.30 },
  { cx: 107, cy: 28,  r: 0.46, opacity: 0.15 },
  { cx: 21,  cy: 38,  r: 0.92, opacity: 0.31 },
  { cx: 48,  cy: 35,  r: 0.36, opacity: 0.12 },
  { cx: 73,  cy: 42,  r: 0.62, opacity: 0.21 },
  { cx: 97,  cy: 36,  r: 0.48, opacity: 0.16 },
  { cx: 12,  cy: 51,  r: 0.58, opacity: 0.19 },
  { cx: 38,  cy: 47,  r: 0.42, opacity: 0.14 },
  { cx: 64,  cy: 53,  r: 0.34, opacity: 0.11 },
  { cx: 88,  cy: 48,  r: 0.80, opacity: 0.27 },
  { cx: 108, cy: 54,  r: 0.50, opacity: 0.17 },
  { cx: 25,  cy: 63,  r: 0.76, opacity: 0.26 },
  { cx: 50,  cy: 68,  r: 0.38, opacity: 0.13 },
  { cx: 72,  cy: 61,  r: 0.54, opacity: 0.18 },
  { cx: 94,  cy: 66,  r: 0.34, opacity: 0.11 },
  { cx: 110, cy: 62,  r: 0.66, opacity: 0.22 },
  { cx: 11,  cy: 76,  r: 0.44, opacity: 0.15 },
  { cx: 36,  cy: 71,  r: 0.84, opacity: 0.28 },
  { cx: 57,  cy: 77,  r: 0.36, opacity: 0.12 },
  { cx: 81,  cy: 73,  r: 0.60, opacity: 0.20 },
  { cx: 103, cy: 79,  r: 0.46, opacity: 0.15 },
  { cx: 18,  cy: 87,  r: 0.70, opacity: 0.24 },
  { cx: 43,  cy: 83,  r: 0.32, opacity: 0.10 },
  { cx: 66,  cy: 90,  r: 0.54, opacity: 0.18 },
  { cx: 90,  cy: 85,  r: 0.78, opacity: 0.26 },
  { cx: 109, cy: 91,  r: 0.40, opacity: 0.13 },
  { cx: 13,  cy: 100, r: 0.86, opacity: 0.29 },
  { cx: 38,  cy: 96,  r: 0.40, opacity: 0.13 },
  { cx: 62,  cy: 102, r: 0.62, opacity: 0.21 },
  { cx: 84,  cy: 98,  r: 0.34, opacity: 0.11 },
  { cx: 105, cy: 103, r: 0.72, opacity: 0.24 },
]

// Direction from junction (104,60) → terminal star (116,14), normalized
export const FLY_OFF_DIR = { x: 0.252, y: -0.968 }

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
  // Orb travels outward (center→junction→terminal star→off), then wordmark lands and fades
  O_HOLD:         [0,  10]  as [number, number], // brief hold at center glow
  O_CENTER_OUT:   [8,  22]  as [number, number], // center glow collapses as orb departs
  O_SPIRAL_OUT:   [10, 65]  as [number, number], // orb travels center→junction (55 frames)
  O_TAIL_OUT:     [65, 78]  as [number, number], // orb travels junction→terminal star (13 frames)
  O_FLY_OFF:      [76, 96]  as [number, number], // orb flies off, grows (20 frames)
  O_WORDMARK_IN:  [90, 108] as [number, number], // wordmark fades in after orb gone
  O_FADE_OUT:     [110, 120] as [number, number], // fade to black
}
