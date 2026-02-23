import type { TidalPhase } from '@/types/tidal'

export interface PhaseGuidance {
  arrow: string
  label: string
  qualities: string
  description: string
  suggestions: string[]
  instruments: string
  nextPhasePreview: string
}

export const phaseGuidance: Record<TidalPhase, PhaseGuidance> = {
  RISING: {
    arrow: '\u2191',
    label: 'Rising Tide',
    qualities: 'Building \xB7 Expansion \xB7 Growth',
    description:
      'The rising tide builds energy naturally. Sessions during this phase benefit from gradually increasing intensity.',
    suggestions: [
      'Sound journeys that build from soft to powerful',
      'Intention-setting ceremonies and manifestation work',
      'Energising breathwork with progressively deeper breaths',
    ],
    instruments: 'Gongs (building crescendos), drums, didgeridoo',
    nextPhasePreview: 'High Water \u2014 peak fullness, culmination',
  },
  HIGH_SLACK: {
    arrow: '\u25C6',
    label: 'High Water',
    qualities: 'Fullness \xB7 Peak Energy \xB7 Culmination',
    description:
      'The tide has reached its peak. This brief window of stillness at maximum energy is powerful for peak experiences.',
    suggestions: [
      'Full immersive sound baths at maximum resonance',
      'Group toning and harmonic chanting',
      'Holding space for peak emotional release',
    ],
    instruments: 'Full gong wash, crystal bowls (sustained), voice',
    nextPhasePreview: 'Ebbing Tide \u2014 release, letting go',
  },
  FALLING: {
    arrow: '\u2193',
    label: 'Ebbing Tide',
    qualities: 'Release \xB7 Letting Go \xB7 Cleansing',
    description:
      'The ebbing tide carries a natural quality of release. This is an ideal time for clearing and dissolving.',
    suggestions: [
      'Sound baths focused on releasing tension and stagnant energy',
      'Breathwork for emotional release and cleansing',
      'Gradually softening sound to guide clients into surrender',
    ],
    instruments: 'Singing bowls (descending patterns), ocean drum, rain stick',
    nextPhasePreview: 'Low Water \u2014 deep stillness, integration',
  },
  LOW_SLACK: {
    arrow: '\u25C7',
    label: 'Low Water',
    qualities: 'Stillness \xB7 The Void \xB7 Integration',
    description:
      'The tide rests at its lowest point. This is the ocean\u2019s pause \u2014 a window of profound silence and integration.',
    suggestions: [
      'Silence-based meditation and deep listening',
      'Integration work after intense sessions',
      'Minimal sound \u2014 single sustained tones, long pauses',
    ],
    instruments: 'Monochord, shruti box (sustained drone), silence',
    nextPhasePreview: 'Rising Tide \u2014 new cycle of building energy',
  },
}
