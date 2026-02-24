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
    { emoji: '\u{1F9D8}', label: 'Practice', guidance: 'Dynamic flow sequences — build energy', intensity: 0.65 },
    { emoji: '\u{1F3B5}', label: 'Sound', guidance: 'Ascending scales, frame drums, rhythmic patterns', intensity: 0.7 },
    { emoji: '\u{1F486}', label: 'Bodywork', guidance: 'Deep tissue, joint mobilisation, activation', intensity: 0.5 },
    { emoji: '\u{1F9E0}', label: 'Mindset', guidance: 'Set intentions, envision growth, plan forward', intensity: 0.8 },
  ],
  HIGH_SLACK: [
    { emoji: '\u{1F9D8}', label: 'Practice', guidance: 'Peak energy practices — power holds, breathwork', intensity: 0.95 },
    { emoji: '\u{1F3B5}', label: 'Sound', guidance: 'Crystal bowls, overtone singing, full spectrum', intensity: 0.85 },
    { emoji: '\u{1F486}', label: 'Bodywork', guidance: 'Energy work, chakra balancing, Reiki', intensity: 0.75 },
    { emoji: '\u{1F9E0}', label: 'Mindset', guidance: 'Manifestation, gratitude, abundance focus', intensity: 0.9 },
  ],
  FALLING: [
    { emoji: '\u{1F9D8}', label: 'Practice', guidance: 'Gentle releasing sequences — yin, restorative', intensity: 0.6 },
    { emoji: '\u{1F3B5}', label: 'Sound', guidance: 'Descending tones, ocean drum, soft gongs', intensity: 0.5 },
    { emoji: '\u{1F486}', label: 'Bodywork', guidance: 'Lymphatic drainage, gentle effleurage', intensity: 0.7 },
    { emoji: '\u{1F9E0}', label: 'Mindset', guidance: 'Let go of tension, cleanse, forgive', intensity: 0.65 },
  ],
  LOW_SLACK: [
    { emoji: '\u{1F9D8}', label: 'Practice', guidance: 'Restorative, stillness, yoga nidra', intensity: 0.3 },
    { emoji: '\u{1F3B5}', label: 'Sound', guidance: 'Silence, single sustained tone, 432 Hz drone', intensity: 0.25 },
    { emoji: '\u{1F486}', label: 'Bodywork', guidance: 'Craniosacral therapy, feather-light touch', intensity: 0.4 },
    { emoji: '\u{1F9E0}', label: 'Mindset', guidance: 'Deep meditation, integration, inner listening', intensity: 0.35 },
  ],
}

export const practitionerAdvice: Record<TidalPhase, PractitionerAdvice> = {
  RISING: {
    sessionType: 'Expansive session — build and channel rising energy',
    instruments: 'Frame drums, didgeridoo, rattles, voice',
    frequencies: '432 Hz base, ascending intervals, perfect fifths',
    clientGuidance: 'Focus on intention setting, new beginnings, creative projects',
  },
  HIGH_SLACK: {
    sessionType: 'Peak session — harness maximum energetic potential',
    instruments: 'Crystal bowls, monochord, voice, full gong',
    frequencies: '528 Hz heart centre, overtone series, harmonic cascade',
    clientGuidance: 'Manifestation work, gratitude practices, celebrating fullness',
  },
  FALLING: {
    sessionType: 'Release session — guide gentle letting go',
    instruments: 'Ocean drum, rain stick, soft singing bowls',
    frequencies: 'Descending scales, 396 Hz release, minor intervals',
    clientGuidance: 'Releasing old patterns, emotional cleansing, cord cutting',
  },
  LOW_SLACK: {
    sessionType: 'Stillness session — deep rest and integration',
    instruments: 'Single Tibetan bowl, shruti box, silence',
    frequencies: '174 Hz grounding, binaural 4 Hz delta, minimal tones',
    clientGuidance: 'Deep meditation, past-life work, shadow integration',
  },
}
