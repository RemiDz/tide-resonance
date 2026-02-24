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
    <InfoCard
      title="Tidal Energy"
      infoText="The tidal phase reflects the ocean's current energetic quality. As the tide moves through its cycle — rising, peaking, ebbing, and resting — it carries distinct characteristics that coastal cultures have recognised for thousands of years. Many people find that aligning activities with these natural rhythms creates a deeper sense of flow and connection."
    >
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

      {/* Description lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {guidance.description.map((line, i) => (
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
            {line}
          </div>
        ))}
      </div>
    </InfoCard>
  )
}
