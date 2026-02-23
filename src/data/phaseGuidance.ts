import type { TidalPhase } from '@/types/tidal'

export interface PhaseGuidance {
  arrow: string
  label: string
  qualities: string
  description: string[]
}

export const phaseGuidance: Record<TidalPhase, PhaseGuidance> = {
  RISING: {
    arrow: '\u2191',
    label: 'Rising Tide',
    qualities: 'Building \xB7 Expansion \xB7 Momentum',
    description: [
      'Energy is building naturally',
      'A time for starting, creating, moving forward',
      'The ocean gathers strength',
    ],
  },
  HIGH_SLACK: {
    arrow: '\u25C6',
    label: 'High Water',
    qualities: 'Fullness \xB7 Peak \xB7 Abundance',
    description: [
      'The ocean has reached its peak',
      'A moment of maximum energy and fullness',
      'Stillness at the crest before release',
    ],
  },
  FALLING: {
    arrow: '\u2193',
    label: 'Ebbing Tide',
    qualities: 'Release \xB7 Letting Go \xB7 Cleansing',
    description: [
      'Energy is naturally receding',
      'A time for releasing what no longer serves',
      'The ocean draws back, clearing the shore',
    ],
  },
  LOW_SLACK: {
    arrow: '\u25C7',
    label: 'Low Water',
    qualities: 'Stillness \xB7 Rest \xB7 Reflection',
    description: [
      'The ocean rests at its lowest point',
      'A time for quiet reflection and integration',
      'Deep stillness before the next cycle begins',
    ],
  },
}
