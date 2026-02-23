import type { TidalPhase } from '@/types/tidal'

// Per-phase breath ratios (inhale : holdTop : exhale : holdBottom)
// The tide secretly shapes the breath — felt, not explained.
const PHASE_RATIOS: Record<TidalPhase, { inhale: number; holdTop: number; exhale: number; holdBottom: number }> = {
  RISING:     { inhale: 7, holdTop: 2, exhale: 5, holdBottom: 2 },  // longer inhale
  HIGH_SLACK: { inhale: 6, holdTop: 3, exhale: 6, holdBottom: 1 },  // balanced, long hold at top
  FALLING:    { inhale: 5, holdTop: 2, exhale: 7, holdBottom: 2 },  // longer exhale
  LOW_SLACK:  { inhale: 5, holdTop: 1, exhale: 5, holdBottom: 3 },  // balanced, long rest at bottom
}

export interface BreathTimings {
  inhale: number      // ms
  holdTop: number     // ms
  exhale: number      // ms
  holdBottom: number  // ms
  inhaleSecs: number  // countdown seconds (rounded)
  holdTopSecs: number
  exhaleSecs: number
  holdBottomSecs: number
}

export function getBreathTimings(phase: TidalPhase, cycleDuration: number): BreathTimings {
  const ratios = PHASE_RATIOS[phase]
  const totalParts = ratios.inhale + ratios.holdTop + ratios.exhale + ratios.holdBottom
  const partMs = (cycleDuration * 1000) / totalParts

  const inhale = ratios.inhale * partMs
  const holdTop = ratios.holdTop * partMs
  const exhale = ratios.exhale * partMs
  const holdBottom = ratios.holdBottom * partMs

  return {
    inhale,
    holdTop,
    exhale,
    holdBottom,
    inhaleSecs: Math.round(inhale / 1000),
    holdTopSecs: Math.round(holdTop / 1000),
    exhaleSecs: Math.round(exhale / 1000),
    holdBottomSecs: Math.round(holdBottom / 1000),
  }
}
