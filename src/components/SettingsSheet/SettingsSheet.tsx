'use client'

import { useState, useRef, useCallback } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { searchStations } from '@/lib/tideEngine'
import { getStationsByRegion } from '@/data/stations'
import type { TideStation } from '@/types/tidal'
import type { Settings } from '@/types/settings'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  station: TideStation
  settings: Settings
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onSelectStation: (lat: number, lon: number) => void
  onRelocate: () => void
  notificationPermission: 'granted' | 'denied' | 'default' | 'unsupported'
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// TogglePair — pill group for 2–3 options (string | number values)
// ---------------------------------------------------------------------------

function TogglePair<T extends string | number>({
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
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
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

// ---------------------------------------------------------------------------
// ToggleSwitch — on/off pill
// ---------------------------------------------------------------------------

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: 40,
        height: 22,
        borderRadius: 11,
        border: 'none',
        cursor: 'pointer',
        background: checked
          ? 'color-mix(in srgb, var(--phase-color) 40%, transparent)'
          : 'rgba(255, 255, 255, 0.08)',
        transition: 'background 0.2s ease',
        flexShrink: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: checked ? 'var(--phase-color)' : 'rgba(255, 255, 255, 0.3)',
          transition: 'left 0.2s ease, background 0.2s ease',
        }}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// VolumeSlider
// ---------------------------------------------------------------------------

function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="volume-slider"
        style={{
          flex: 1,
          height: 4,
          appearance: 'none',
          WebkitAppearance: 'none',
          background: `linear-gradient(to right, var(--phase-color) ${value}%, rgba(255,255,255,0.08) ${value}%)`,
          borderRadius: 2,
          outline: 'none',
          cursor: 'pointer',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          width: 32,
          textAlign: 'right',
        }}
      >
        {value}%
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const stationsByRegion = getStationsByRegion()
const regionOrder = ['UK & Ireland', 'Europe', 'Americas', 'Asia Pacific', 'Africa']

export function SettingsSheet({
  open,
  onClose,
  station,
  settings,
  onUpdateSetting,
  onSelectStation,
  onRelocate,
  notificationPermission,
}: SettingsSheetProps) {
  // --- Station search state ---
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TideStation[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query)

      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (query.length < 2) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await searchStations(query, 20)
          setSearchResults(results)
        } catch {
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    },
    []
  )

  const handleSelectStation = useCallback(
    (lat: number, lon: number) => {
      onSelectStation(lat, lon)
      setSearchQuery('')
      setSearchResults([])
      onClose()
    },
    [onSelectStation, onClose]
  )

  return (
    <BottomSheet open={open} onClose={onClose}>
      {/* Close button — top right */}
      <button
        onClick={onClose}
        aria-label="Close settings"
        style={{
          position: 'absolute',
          top: 12,
          right: 16,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          margin: -8,
          zIndex: 1,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Title */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '0.625rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--text-muted)',
          marginBottom: 20,
        }}
      >
        Settings
      </div>

      {/* ================================================================
          LOCATION
          ================================================================ */}
      <SectionHeader>Location</SectionHeader>

      {/* Current station */}
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

      {/* Search input */}
      <input
        type="text"
        placeholder="Search coastal location..."
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          color: 'var(--text-primary)',
          fontSize: '0.8125rem',
          fontFamily: 'var(--font-body), system-ui, sans-serif',
          outline: 'none',
          marginBottom: 8,
          boxSizing: 'border-box',
        }}
      />

      {/* Search results */}
      {searchQuery.length >= 2 && (
        <div
          style={{
            maxHeight: 200,
            overflowY: 'auto',
            marginBottom: 12,
            borderRadius: 12,
            border: searchResults.length > 0 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
          }}
        >
          {isSearching && (
            <div
              style={{
                padding: '12px 14px',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
              }}
            >
              Searching...
            </div>
          )}
          {!isSearching && searchResults.length === 0 && (
            <div
              style={{
                padding: '12px 14px',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
              }}
            >
              No stations found
            </div>
          )}
          {!isSearching &&
            searchResults.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectStation(s.latitude, s.longitude)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      marginTop: 1,
                    }}
                  >
                    {s.country}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  ›
                </span>
              </button>
            ))}
        </div>
      )}

      {/* Use My Location */}
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
          background: 'transparent',
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: 'var(--font-body), system-ui, sans-serif',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          marginBottom: 16,
        }}
      >
        Use My Location
      </button>

      {/* Popular stations — shown when not searching */}
      {searchQuery.length < 2 && (
        <div>
          <div
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.5625rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: 8,
            }}
          >
            Popular Stations
          </div>
          {regionOrder.map((region) => {
            const stations = stationsByRegion[region]
            if (!stations) return null
            return (
              <div key={region} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(255, 255, 255, 0.25)',
                    fontWeight: 500,
                    marginBottom: 4,
                    paddingLeft: 2,
                  }}
                >
                  {region}
                </div>
                {stations.map((s) => {
                  const isActive =
                    Math.abs(s.latitude - station.latitude) < 0.01 &&
                    Math.abs(s.longitude - station.longitude) < 0.01
                  return (
                    <button
                      key={`${s.name}-${s.country}`}
                      onClick={() => handleSelectStation(s.latitude, s.longitude)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '7px 8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderRadius: 8,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)')
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          color: isActive
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {s.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {isActive ? '✓' : '›'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      <Divider />

      {/* ================================================================
          DISPLAY
          ================================================================ */}
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

      {/* ================================================================
          SOUND
          ================================================================ */}
      <SectionHeader>Sound</SectionHeader>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: settings.droneEnabled ? 16 : 0,
        }}
      >
        <span style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Ambient Drone
        </span>
        <ToggleSwitch
          checked={settings.droneEnabled}
          onChange={(v) => onUpdateSetting('droneEnabled', v)}
        />
      </div>

      {settings.droneEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            The ambient drone generates a live synthesised tone that shifts with the tidal phase.
          </p>

          <div>
            <div
              style={{
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: 8,
              }}
            >
              Volume
            </div>
            <VolumeSlider
              value={settings.droneVolume}
              onChange={(v) => onUpdateSetting('droneVolume', v)}
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
              Base Frequency
            </div>
            <TogglePair
              options={[
                { label: '432 Hz', value: 432 as const },
                { label: '440 Hz', value: 440 as const },
                { label: '528 Hz', value: 528 as const },
              ]}
              value={settings.droneFrequency}
              onChange={(v) => onUpdateSetting('droneFrequency', v)}
            />
          </div>
        </div>
      )}

      <Divider />

      {/* ================================================================
          NOTIFICATIONS
          ================================================================ */}
      <SectionHeader>Notifications</SectionHeader>

      {notificationPermission === 'unsupported' ? (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Notifications are not available in your browser.
        </p>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: settings.alertsEnabled ? 16 : 0,
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Tide Alerts
            </span>
            <ToggleSwitch
              checked={settings.alertsEnabled}
              onChange={(v) => onUpdateSetting('alertsEnabled', v)}
            />
          </div>

          {settings.alertsEnabled && notificationPermission === 'denied' && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#7986cb',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Notification permission was denied. Enable notifications in your browser settings to
              receive tide alerts.
            </p>
          )}

          {settings.alertsEnabled &&
            (notificationPermission === 'granted' || notificationPermission === 'default') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Get notified before high and low water at your station.
                </p>

                <div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginBottom: 8,
                    }}
                  >
                    Alert me before
                  </div>
                  <TogglePair
                    options={[
                      { label: '15 min', value: 15 as const },
                      { label: '30 min', value: 30 as const },
                      { label: '1 hour', value: 60 as const },
                    ]}
                    value={settings.alertTiming}
                    onChange={(v) => onUpdateSetting('alertTiming', v)}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    High Water Alerts
                  </span>
                  <ToggleSwitch
                    checked={settings.alertHigh}
                    onChange={(v) => onUpdateSetting('alertHigh', v)}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Low Water Alerts
                  </span>
                  <ToggleSwitch
                    checked={settings.alertLow}
                    onChange={(v) => onUpdateSetting('alertLow', v)}
                  />
                </div>
              </div>
            )}
        </>
      )}

      <Divider />

      {/* ================================================================
          ABOUT
          ================================================================ */}
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
