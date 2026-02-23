import type { TidalState } from '@/types/tidal'

export function formatTimeUntil(target: Date): string {
  const diffMs = target.getTime() - Date.now()
  if (diffMs <= 0) return 'now'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
}

export function formatTime12h(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * One warm sentence — no countdowns, no times, no technical data.
 * The tide is felt, not explained.
 */
export function buildTidalNarrative(state: TidalState): string {
  const { currentPhase, phaseProgress } = state

  switch (currentPhase) {
    case 'RISING': {
      if (phaseProgress < 0.33) return 'The tide is beginning to rise'
      if (phaseProgress < 0.66) return 'The tide is rising steadily'
      return 'The tide is approaching its peak'
    }
    case 'HIGH_SLACK':
      return 'The tide rests at high water'
    case 'FALLING': {
      if (phaseProgress < 0.33) return 'The tide has begun to ebb'
      if (phaseProgress < 0.66) return 'The tide is gently ebbing'
      return 'The tide is settling toward low water'
    }
    case 'LOW_SLACK':
      return 'The tide rests in stillness'
  }
}
