'use client'

import type { TidalState } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'
import { BottomSheet } from '@/components/BottomSheet'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  tidalState: TidalState
  breathSpeed: number
  onBreathSpeedChange: (speed: number) => void
}

export function SettingsSheet({
  open,
  onClose,
  tidalState,
  breathSpeed,
  onBreathSpeedChange,
}: SettingsSheetProps) {
  const colour = getPhaseColour(tidalState.currentPhase)

  return (
    <BottomSheet open={open} onClose={onClose}>
      <p className="text-label mb-5" style={{ color: 'var(--text-muted)' }}>
        Settings
      </p>

      {/* Station */}
      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginBottom: 8,
          }}
        >
          Station
        </p>
        <button
          className="w-full py-3 rounded-xl text-sm text-left transition-all duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'var(--text-primary)',
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          {'\u224B'} {tidalState.station.name}
          <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.75rem' }}>
            Change
          </span>
        </button>
      </div>

      {/* Breath Speed */}
      <div style={{ marginBottom: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Breath Speed
          </span>
          <span
            className="text-data"
            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
          >
            {breathSpeed.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={breathSpeed}
          onChange={(e) => onBreathSpeedChange(Number(e.target.value))}
          className="w-full"
          style={{
            accentColor: colour,
            height: 2,
            opacity: 0.6,
          }}
        />
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Slower</span>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Faster</span>
        </div>
      </div>

      {/* Sound — placeholder */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          paddingTop: 16,
          marginBottom: 20,
          opacity: 0.4,
        }}
      >
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginBottom: 8,
          }}
        >
          Sound
        </p>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Drone Sound
          </span>
          <span
            style={{
              fontSize: '0.625rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}
          >
            Coming soon
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Carrier Frequency
          </span>
          <div className="flex gap-2">
            {[432, 440, 528].map((hz) => (
              <span
                key={hz}
                className="text-data"
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  padding: '2px 8px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                {hz}Hz
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          paddingTop: 16,
        }}
      >
        <p
          style={{
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          Tide Resonance {'\u00B7'} Harmonic Waves {'\u00B7'} 2026
        </p>
      </div>
    </BottomSheet>
  )
}
