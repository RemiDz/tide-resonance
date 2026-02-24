import type { TidalPhase } from '@/types/tidal'

export interface EnergyArea {
  emoji: string
  label: string
  guidance: string
  intensity: number
}

export interface PractitionerAdvice {
  sessionType: string
  instruments: string
  frequencies: string
  clientGuidance: string
}

export const energyGuidance: Record<TidalPhase, EnergyArea[]> = {
  RISING: [
    { emoji: '\u{1F9D8}', label: 'Practice', guidance: 'Dynamic flow sequences \u2014 build energy', intensity: 0.7 },
    { emoji: '\u{1F3B5}', label: 'Sound', guidance: 'Ascending scales, frame drums, rhythmic patterns', intensity: 0.6 },
    { emoji: '\u{1F486}', label: 'Bodywork', guidance: 'Deep tissue, joint mobilisation, activation', intensity: 0.5 },
    { emoji: '\u{1F9E0}', label: 'Mindset', guidance: 'Set intentions, envision growth, plan forward', intensity: 0.8 },
  ],
  HIGH_SLACK: [
    { emoji: '\u{1F9D8}', label: 'Practice', guidance: 'Peak energy work \u2014 expansive, powerful sessions', intensity: 0.9 },
    { emoji: '\u{1F3B5}', label: 'Sound', guidance: 'Full spectrum, gongs, crystal bowls at volume', intensity: 0.9 },
    { emoji: '\u{1F486}', label: 'Bodywork', guidance: 'Full body integration, energy circulation', intensity: 0.7 },
    { emoji: '\u{1F9E0}', label: 'Mindset', guidance: 'Celebrate abundance, express gratitude, receive', intensity: 0.9 },
  ],
  FALLING: [
    { emoji: '\u{1F9D8}', label: 'Practice', guidance: 'Gentle release sequences \u2014 slow and yielding', intensity: 0.4 },
    { emoji: '\u{1F3B5}', label: 'Sound', guidance: 'Descending tones, ocean drum, soft chimes', intensity: 0.5 },
    { emoji: '\u{1F486}', label: 'Bodywork', guidance: 'Lymphatic drainage, gentle stretching, cooling', intensity: 0.8 },
    { emoji: '\u{1F9E0}', label: 'Mindset', guidance: 'Let go of attachments, forgive, release tension', intensity: 0.6 },
  ],
  LOW_SLACK: [
    { emoji: '\u{1F9D8}', label: 'Practice', guidance: 'Stillness practices \u2014 yin, meditation, savasana', intensity: 0.2 },
    { emoji: '\u{1F3B5}', label: 'Sound', guidance: 'Silence, minimal drone, soft monochord', intensity: 0.3 },
    { emoji: '\u{1F486}', label: 'Bodywork', guidance: 'Light touch, craniosacral, energy holding', intensity: 0.3 },
    { emoji: '\u{1F9E0}', label: 'Mindset', guidance: 'Deep reflection, journaling, inner listening', intensity: 0.9 },
  ],
}

export const practitionerAdvice: Record<TidalPhase, PractitionerAdvice> = {
  RISING: {
    sessionType: 'Expansive session \u2014 build and channel rising energy',
    instruments: 'Frame drums, didgeridoo, rattles, voice',
    frequencies: '432 Hz base, ascending intervals, perfect fifths',
    clientGuidance: 'Focus on intention setting, new beginnings, creative projects',
  },
  HIGH_SLACK: {
    sessionType: 'Peak energy session \u2014 powerful and transformative',
    instruments: 'Gongs, large crystal bowls, full drum kit, voice',
    frequencies: '528 Hz base, full harmonic spectrum, overtone-rich',
    clientGuidance: 'Embrace fullness, celebrate achievements, express gratitude',
  },
  FALLING: {
    sessionType: 'Release session \u2014 gentle, clearing, cleansing',
    instruments: 'Ocean drum, rain stick, soft chimes, singing bowls',
    frequencies: '432 Hz base, descending intervals, minor seconds',
    clientGuidance: 'Release what no longer serves, forgive, let go of tension',
  },
  LOW_SLACK: {
    sessionType: 'Stillness session \u2014 deep rest and integration',
    instruments: 'Monochord, soft singing bowls, tuning forks',
    frequencies: '432 Hz base, sustained drones, minimal movement',
    clientGuidance: 'Deep reflection, inner listening, integration of experiences',
  },
}
