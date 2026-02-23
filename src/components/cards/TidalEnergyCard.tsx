'use client'

import type { TidalPhase } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'
import { phaseGuidance } from '@/data/phaseGuidance'
import { InfoCard } from '@/components/InfoCard'

interface TidalEnergyCardProps {
  phase: TidalPhase
}

export function TidalEnergyCard({ phase }: TidalEnergyCardProps) {
  const guidance = phaseGuidance[phase]
  const colour = getPhaseColour(phase)

  return (
    <InfoCard title="Tidal Energy">
      {/* Phase arrow + name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: '1.25rem', color: colour }}>{guidance.arrow}</span>
        <span
          style={{
            fontSize: '1.125rem',
            fontWeight: 500,
            color: colour,
            transition: 'color 2.5s ease-out',
          }}
        >
          {guidance.label}
        </span>
      </div>

      {/* Qualities */}
      <div
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          marginBottom: 16,
          letterSpacing: '0.02em',
        }}
      >
        {guidance.qualities}
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {guidance.suggestions.map((s, i) => (
          <div
            key={i}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              paddingLeft: 12,
              borderLeft: `2px solid ${colour}20`,
            }}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Instruments */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
        }}
      >
        {guidance.instruments}
      </div>
    </InfoCard>
  )
}
