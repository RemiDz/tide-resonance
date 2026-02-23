'use client'

import { useState, useEffect } from 'react'
import type { TidalState } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'
import { phaseGuidance } from './phaseGuidance'

interface SessionCardProps {
  tidalState: TidalState
}

function formatTimeUntil(target: Date): string {
  const diffMs = target.getTime() - Date.now()
  if (diffMs <= 0) return 'now'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${minutes}m`
}

function getNextExtreme(state: TidalState) {
  const { nextHigh, nextLow } = state
  if (!nextHigh && !nextLow) return null
  if (!nextHigh) return nextLow
  if (!nextLow) return nextHigh
  return nextHigh.time < nextLow.time ? nextHigh : nextLow
}

export function SessionCard({ tidalState }: SessionCardProps) {
  const guidance = phaseGuidance[tidalState.currentPhase]
  const colour = getPhaseColour(tidalState.currentPhase)
  const nextExtreme = getNextExtreme(tidalState)

  // Live countdown — update every minute
  const [countdown, setCountdown] = useState(() =>
    nextExtreme ? formatTimeUntil(nextExtreme.time) : ''
  )

  useEffect(() => {
    if (!nextExtreme) return
    setCountdown(formatTimeUntil(nextExtreme.time))
    const interval = setInterval(() => {
      setCountdown(formatTimeUntil(nextExtreme.time))
    }, 60_000)
    return () => clearInterval(interval)
  }, [nextExtreme])

  return (
    <div
      className="glass-card"
      style={{
        '--phase-color': colour,
        transition: 'box-shadow 2.5s ease-out',
      } as React.CSSProperties}
    >
      {/* Section label */}
      <p className="text-label mb-5" style={{ color: 'var(--text-muted)' }}>
        Session Guidance
      </p>

      {/* Phase title — large, phase-coloured */}
      <p
        className="mb-1.5"
        style={{
          fontSize: '1.25rem',
          fontWeight: 500,
          color: colour,
          transition: 'color 2.5s ease-out',
        }}
      >
        {guidance.arrow} {guidance.label}
      </p>

      {/* Qualities — muted, italic */}
      <p
        className="mb-5"
        style={{
          fontSize: '0.875rem',
          fontStyle: 'italic',
          color: 'var(--text-secondary)',
        }}
      >
        {guidance.qualities}
      </p>

      {/* Divider — phase coloured at low opacity */}
      <div
        className="mb-5"
        style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${colour}33, transparent)`,
        }}
      />

      {/* Description paragraph */}
      <p
        className="mb-5"
        style={{
          fontSize: '0.9375rem',
          fontWeight: 300,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}
      >
        {guidance.description}
      </p>

      {/* Suggestions — diamond bullets */}
      <div className="space-y-3 mb-5">
        {guidance.suggestions.map((suggestion, i) => (
          <div key={i} className="flex gap-3">
            <span
              className="flex-shrink-0 mt-0.5"
              style={{ color: colour, fontSize: '0.75rem', opacity: 0.7 }}
            >
              {'\u25C8'}
            </span>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: 300,
                color: 'var(--text-primary)',
                lineHeight: 1.6,
              }}
            >
              {suggestion}
            </p>
          </div>
        ))}
      </div>

      {/* Instruments */}
      <p
        className="mb-5"
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>Instruments: </span>
        {guidance.instruments}
      </p>

      {/* Next phase preview with countdown */}
      {nextExtreme && (
        <div
          className="pt-4"
          style={{
            borderTop: `1px solid rgba(255, 255, 255, 0.04)`,
          }}
        >
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Next phase: </span>
            {guidance.nextPhasePreview}
            <span style={{ color: colour, marginLeft: 6 }}>
              in {countdown}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
