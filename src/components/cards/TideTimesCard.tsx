'use client'

import type { TidalState, TideExtreme } from '@/types/tidal'
import { formatTime12h } from '@/lib/tidal-narrative'
import { getPhaseColour } from '@/lib/colour-utils'
import { InfoCard } from '@/components/InfoCard'

interface TideTimesCardProps {
  tidalState: TidalState
}

export function TideTimesCard({ tidalState }: TideTimesCardProps) {
  const { extremes24h, currentPhase } = tidalState
  const colour = getPhaseColour(currentPhase)
  const now = Date.now()

  return (
    <InfoCard
      title="Today's Tides"
      infoText="These are the predicted times and heights for high and low water at your station today. Tides follow a roughly 12-hour 25-minute cycle, so each day the times shift slightly later. Most locations experience two highs and two lows per day. Actual times may vary slightly due to weather and atmospheric pressure."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {extremes24h.map((ext, i) => (
          <ExtremeRow key={i} extreme={ext} isPast={ext.time.getTime() < now} colour={colour} />
        ))}
        {extremes24h.length === 0 && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            No tide data available
          </div>
        )}
      </div>
    </InfoCard>
  )
}

function ExtremeRow({
  extreme,
  isPast,
  colour,
}: {
  extreme: TideExtreme
  isPast: boolean
  colour: string
}) {
  const isHigh = extreme.type === 'high'
  const arrow = isHigh ? '\u25B2' : '\u25BC'
  const label = isHigh ? 'High' : 'Low'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: isPast ? 0.4 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: '0.625rem',
            color: isPast ? 'var(--text-muted)' : colour,
          }}
        >
          {arrow}
        </span>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: isPast ? 400 : 500,
            color: isPast ? 'var(--text-muted)' : 'var(--text-primary)',
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span
          style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '0.875rem',
            color: isPast ? 'var(--text-muted)' : 'var(--text-primary)',
          }}
        >
          {formatTime12h(extreme.time)}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          {extreme.height.toFixed(1)}m
        </span>
      </div>
    </div>
  )
}
