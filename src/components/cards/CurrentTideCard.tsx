'use client'

import { useMemo } from 'react'
import type { TidalState } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'
import { InfoCard } from '@/components/InfoCard'

interface CurrentTideCardProps {
  tidalState: TidalState
}

export function CurrentTideCard({ tidalState }: CurrentTideCardProps) {
  const { currentHeight, rateOfChange, currentPhase, extremes24h } = tidalState
  const colour = getPhaseColour(currentPhase)

  // Calculate tidal range and progress
  const { range, progressFraction } = useMemo(() => {
    if (extremes24h.length === 0) return { range: 0, progressFraction: 0.5 }
    const heights = extremes24h.map((e) => e.height)
    const min = Math.min(...heights)
    const max = Math.max(...heights)
    const r = max - min
    const frac = r > 0 ? Math.max(0, Math.min(1, (currentHeight - min) / r)) : 0.5
    return { range: r, progressFraction: frac }
  }, [currentHeight, extremes24h])

  const rateSign = rateOfChange >= 0 ? '+' : ''
  const rateAbs = Math.abs(rateOfChange)

  return (
    <InfoCard
      title="Current Tide"
      infoText="This shows the live state of the tide at your station. Water height is measured from a reference point called chart datum. The rate of change tells you how quickly the water is moving — faster in mid-tide, slowing as it approaches high or low water. The bar shows where the current level sits between today's lowest and highest predicted points."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <DataRow label="Water Height" value={`${currentHeight.toFixed(2)}m`} />
        <DataRow label="Rate of Change" value={`${rateSign}${rateAbs.toFixed(2)}m/hr`} />
        <DataRow label="Tidal Range" value={`${range.toFixed(1)}m`} />

        {/* Progress bar — low to high */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.5625rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <span>Low</span>
            <span>High</span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.06)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progressFraction * 100}%`,
                background: colour,
                borderRadius: 2,
                opacity: 0.6,
                transition: 'width 2.5s ease-out, background 2.5s ease-out',
              }}
            />
            {/* Current position dot */}
            <div
              style={{
                position: 'absolute',
                left: `${progressFraction * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: colour,
                boxShadow: `0 0 8px ${colour}60`,
                transition: 'left 2.5s ease-out, background 2.5s ease-out',
              }}
            />
          </div>
        </div>
      </div>
    </InfoCard>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}
    >
      <span
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  )
}
