'use client'

import { BottomSheet } from '@/components/BottomSheet'
import type { TideStation } from '@/types/tidal'
import type { Settings } from '@/types/settings'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  station: TideStation
  settings: Settings
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onRelocate: () => void
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '0.625rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: 'rgba(255, 255, 255, 0.05)',
        margin: '20px 0',
      }}
    />
  )
}

function TogglePair<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 2, borderRadius: 10, overflow: 'hidden' }}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
              fontSize: '0.8125rem',
              fontWeight: 400,
              borderRadius: 10,
              transition: 'background 0.2s ease, color 0.2s ease',
              background: active
                ? 'color-mix(in srgb, var(--phase-color) 25%, transparent)'
                : 'rgba(255, 255, 255, 0.04)',
              color: active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function SettingsSheet({
  open,
  onClose,
  station,
  settings,
  onUpdateSetting,
  onRelocate,
}: SettingsSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      {/* LOCATION */}
      <SectionHeader>Location</SectionHeader>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: '0.9375rem',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {station.name}
        </div>
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginTop: 2,
          }}
        >
          {station.country}
        </div>
      </div>

      <button
        onClick={() => {
          onRelocate()
          onClose()
        }}
        style={{
          width: '100%',
          padding: '10px 0',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.04)',
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: 'var(--font-body), system-ui, sans-serif',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
        }}
      >
        Use My Location
      </button>

      <Divider />

      {/* DISPLAY */}
      <SectionHeader>Display</SectionHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: 8,
            }}
          >
            Units
          </div>
          <TogglePair
            options={[
              { label: 'Metres', value: 'metres' as const },
              { label: 'Feet', value: 'feet' as const },
            ]}
            value={settings.units}
            onChange={(v) => onUpdateSetting('units', v)}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: 8,
            }}
          >
            Time Format
          </div>
          <TogglePair
            options={[
              { label: '12h', value: '12h' as const },
              { label: '24h', value: '24h' as const },
            ]}
            value={settings.timeFormat}
            onChange={(v) => onUpdateSetting('timeFormat', v)}
          />
        </div>
      </div>

      <Divider />

      {/* ABOUT */}
      <SectionHeader>About</SectionHeader>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.4)',
        }}
      >
        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Tide Resonance v1.0</span>
        <span>Part of the Harmonic Waves ecosystem</span>
        <span>Crafted by Remigijus Dzingelevičius</span>
        <span>Data: Harmonic tidal prediction from 8,000+ global stations</span>
      </div>
    </BottomSheet>
  )
}
