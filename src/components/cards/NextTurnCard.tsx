'use client'

import { useState, useEffect } from 'react'
import type { TidalState } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'
import { formatTimeUntil, formatTime12h } from '@/lib/tidal-narrative'
import { InfoCard } from '@/components/InfoCard'

interface NextTurnCardProps {
  tidalState: TidalState
}

export function NextTurnCard({ tidalState }: NextTurnCardProps) {
  const { nextHigh, nextLow, currentPhase } = tidalState
  const colour = getPhaseColour(currentPhase)

  // Force re-render every 60s for countdown
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(interval)
  }, [])

  // Next event is whichever comes first
  const nextEvents = [
    nextLow ? { type: 'low' as const, extreme: nextLow } : null,
    nextHigh ? { type: 'high' as const, extreme: nextHigh } : null,
  ]
    .filter(Boolean)
    .sort((a, b) => a!.extreme.time.getTime() - b!.extreme.time.getTime())

  const next = nextEvents[0]
  const after = nextEvents[1]

  if (!next) {
    return (
      <InfoCard title="Next Turn">
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Calculating...
        </div>
      </InfoCard>
    )
  }

  const nextLabel = next.type === 'high' ? 'High Water' : 'Low Water'
  const timeUntil = formatTimeUntil(next.extreme.time)

  const afterLabel = after
    ? after.type === 'high'
      ? 'rising to High Water'
      : 'falling to Low Water'
    : null

  return (
    <InfoCard title="Next Turn">
      {/* Primary: "Low Water in 3h 12m" */}
      <div
        style={{
          fontSize: '1.125rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: after ? 8 : 0,
        }}
      >
        <span style={{ color: colour }}>{nextLabel}</span>
        <span> in {timeUntil}</span>
      </div>

      {/* Secondary: "Then rising to High Water at 7:49 PM" */}
      {after && (
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          Then {afterLabel} at {formatTime12h(after.extreme.time)}
        </div>
      )}
    </InfoCard>
  )
}
