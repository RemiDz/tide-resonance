'use client'

import type { TidalState } from '@/types/tidal'
import { InfoCard } from '@/components/InfoCard'

interface StationInfoCardProps {
  tidalState: TidalState
  onChangeStation?: () => void
}

export function StationInfoCard({ tidalState, onChangeStation }: StationInfoCardProps) {
  const { station, distanceKm } = tidalState
  const coordStr = `${Math.abs(station.latitude).toFixed(3)}\u00B0${station.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(station.longitude).toFixed(3)}\u00B0${station.longitude >= 0 ? 'E' : 'W'}`

  return (
    <InfoCard
      title="Station"
      infoText="Your tidal data is calculated using harmonic analysis — a mathematical method that combines the gravitational effects of the moon, sun, and local geography to predict water levels. This runs entirely on your device with no internet connection needed after the initial load. Data covers over 8,000 coastal stations worldwide."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DataRow label="Station" value={station.name} />
        <DataRow label="Distance" value={`${distanceKm.toFixed(0)} km`} />
        <DataRow label="Coordinates" value={coordStr} />
        <DataRow label="Data Source" value="Harmonic prediction" />

        {onChangeStation && (
          <button
            onClick={onChangeStation}
            style={{
              marginTop: 4,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '10px 16px',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
            }}
          >
            Change Station
          </button>
        )}
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
          fontSize: '0.8125rem',
          color: 'var(--text-primary)',
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  )
}
