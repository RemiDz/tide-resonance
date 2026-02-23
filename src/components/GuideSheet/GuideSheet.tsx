'use client'

import { useState, useEffect } from 'react'
import type { TidalState } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'
import { phaseGuidance } from '@/components/SessionCard/phaseGuidance'
import { BottomSheet } from '@/components/BottomSheet'

interface GuideSheetProps {
  open: boolean
  onClose: () => void
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

export function GuideSheet({ open, onClose, tidalState }: GuideSheetProps) {
  const guidance = phaseGuidance[tidalState.currentPhase]
  const colour = getPhaseColour(tidalState.currentPhase)
  const nextExtreme = getNextExtreme(tidalState)

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
    <BottomSheet open={open} onClose={onClose}>
      {/* Phase arrow + label */}
      <p
        style={{
          fontSize: '1.125rem',
          fontWeight: 500,
          color: colour,
          transition: 'color 2.5s ease-out',
          marginBottom: 4,
        }}
      >
        {guidance.arrow} {guidance.label}
      </p>

      {/* Qualities */}
      <p
        style={{
          fontSize: '0.8125rem',
          fontStyle: 'italic',
          color: 'var(--text-secondary)',
          marginBottom: 16,
        }}
      >
        {guidance.qualities}
      </p>

      {/* Short bullet fragments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {guidance.suggestions.map((suggestion, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span
              style={{
                color: colour,
                fontSize: '0.6875rem',
                opacity: 0.7,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {'\u25C8'}
            </span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 300,
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              {suggestion}
            </span>
          </div>
        ))}
      </div>

      {/* Instruments */}
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginBottom: 16,
        }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>Instruments: </span>
        {guidance.instruments}
      </p>

      {/* Divider + next phase */}
      {nextExtreme && (
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            paddingTop: 12,
          }}
        >
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Next: </span>
            {guidance.nextPhasePreview}
            <span style={{ color: colour, marginLeft: 6 }}>
              in {countdown}
            </span>
          </p>
        </div>
      )}

      {/* Breath-tide connection */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          paddingTop: 12,
          marginTop: 12,
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontStyle: 'italic',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          Your breath timing shifts subtly with each tidal phase. During rising tide, inhales naturally lengthen. During ebb, exhales deepen.
        </p>
      </div>
    </BottomSheet>
  )
}
