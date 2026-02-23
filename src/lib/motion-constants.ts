// Centralized animation constants for Tide Resonance
// Deep ocean: organic, sine-wave easing, nothing linear or metronomic

// Organic wave easing — accelerates in middle, decelerates at extremes
export const EASING = {
  WAVE: [0.45, 0.05, 0.55, 0.95] as const,
  CURRENT: [0.4, 0.0, 0.2, 1.0] as const,
  CARD_ENTER: [0.16, 1, 0.3, 1] as const,
  EASE_OUT: [0.0, 0.0, 0.2, 1.0] as const,
} as const

// CSS cubic-bezier string for inline styles
export const EASING_CSS = {
  WAVE: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
  CURRENT: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
} as const

export const DURATION = {
  // Interactions
  INTERACTION: 0.25,
  CARD_ENTER: 0.9,
  // Ambient
  NOW_GLOW: 3,
  SHIMMER: 30,
  UNDULATE: 8,
  CAUSTIC_1: 23,
  CAUSTIC_2: 31,
  // Phase colour transition
  PHASE_TRANSITION: 2.5,
} as const

export const PARTICLES = {
  COUNT: 40,
  MIN_OPACITY: 0.1,
  MAX_OPACITY: 0.5,
  MIN_DURATION: 60,  // seconds to cross screen
  MAX_DURATION: 120,
  MIN_SIZE: 1,       // px
  MAX_SIZE: 3,
} as const
