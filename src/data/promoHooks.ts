import type { TidalPhase } from '@/types/tidal'

export const PROMO_HOOKS: Record<TidalPhase, string[]> = {
  RISING: [
    'The ocean is building right now. Can you feel the momentum?',
    'Rising tide energy — this is the time to start something new',
    'Water is climbing. Your energy wants to expand with it',
    'The tide is rising. Nature says: move forward',
    'Building phase. If you\u2019ve been waiting for a sign — this is it',
  ],
  HIGH_SLACK: [
    'The ocean just peaked. Everything is full right now',
    'High water — maximum energy, maximum potential',
    'Peak tide. The ocean is holding its breath before releasing',
    'Fullness in the water, fullness in the field. Feel it',
    'High water moment. Pause and receive before the release begins',
  ],
  FALLING: [
    'The tide is pulling back. Let it take what you don\u2019t need',
    'Ebbing energy — the ocean is cleansing the shore right now',
    'Water is receding. Your body knows it\u2019s time to release',
    'The tide is letting go. Are you?',
    'Ebb phase. Everything the ocean releases makes space for what\u2019s coming',
  ],
  LOW_SLACK: [
    'The ocean is at its quietest. Deep stillness right now',
    'Low water — the space between breaths. Rest here',
    'The tide has reached its lowest point. Integration time',
    'Stillness in the water. Stillness in you',
    'Low tide. The ocean rests before building again. You should too',
  ],
}
