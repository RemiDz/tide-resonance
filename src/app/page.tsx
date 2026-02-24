'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GeoLocation, TidalState } from '@/types/tidal'
import { useTidalState } from '@/hooks/useTidalState'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useSettings } from '@/hooks/useSettings'
import { useAudioDrone } from '@/hooks/useAudioDrone'
import { useTideNotifications } from '@/hooks/useTideNotifications'
import { getPhaseColour } from '@/lib/colour-utils'
import { OceanBackground } from '@/components/OceanBackground'
import { Welcome } from '@/components/Welcome'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { TidalEnergyCard } from '@/components/cards/TidalEnergyCard'
import { CurrentTideCard } from '@/components/cards/CurrentTideCard'
import { TideTimesCard } from '@/components/cards/TideTimesCard'
import { NextTurnCard } from '@/components/cards/NextTurnCard'
import { StationInfoCard } from '@/components/cards/StationInfoCard'
import { TidalCalendar } from '@/components/TidalCalendar'
import { SettingsSheet } from '@/components/SettingsSheet'
import { Footer } from '@/components/Footer'

export default function TideResonancePage() {
  // --- Settings ---
  const { settings, updateSetting } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)

  // --- Audio + Notifications (drone hook called after displayState below) ---

  // --- Welcome flow state ---
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null)
  const [welcomeLocation, setWelcomeLocation] = useState<GeoLocation | null>(null)
  const [initialState, setInitialState] = useState<TidalState | null>(null)

  // Check localStorage on mount
  useEffect(() => {
    setHasSeenWelcome(localStorage.getItem('hasSeenWelcome') === 'true')
  }, [])

  // For returning users — device geolocation
  const geoLocation = useGeolocation(hasSeenWelcome === true && !welcomeLocation)

  // Active location: welcome-provided or geolocation
  const activeLocation = welcomeLocation ?? geoLocation

  // Tidal state from hook (recomputes every 60s)
  const { tidalState, isLoading, error } = useTidalState(activeLocation)

  // Display state: live hook state, or initial state from welcome while loading
  const displayState = tidalState ?? initialState

  // Audio drone + notifications (both need displayState)
  useAudioDrone(settings, displayState)
  const { permissionState: notificationPermission } = useTideNotifications(settings, displayState)

  const handleWelcomeComplete = useCallback(
    (loc: GeoLocation, state?: TidalState) => {
      setWelcomeLocation(loc)
      if (state) setInitialState(state)
      setHasSeenWelcome(true)
    },
    []
  )

  const handleRelocate = useCallback(() => {
    setWelcomeLocation(null)
  }, [])

  const handleSelectStation = useCallback((lat: number, lon: number) => {
    setWelcomeLocation({ latitude: lat, longitude: lon, source: 'manual' })
  }, [])

  const phaseColour = displayState
    ? getPhaseColour(displayState.currentPhase)
    : undefined

  // --- Render ---

  // Still checking localStorage
  if (hasSeenWelcome === null) {
    return (
      <div>
        <OceanBackground />
      </div>
    )
  }

  // First-time user — welcome flow
  if (!hasSeenWelcome) {
    return (
      <div>
        <OceanBackground />
        <Welcome onComplete={handleWelcomeComplete} />
      </div>
    )
  }

  // Main app — scrollable card layout
  return (
    <div
      data-phase={displayState?.currentPhase}
      style={
        phaseColour
          ? ({ '--phase-color': phaseColour } as React.CSSProperties)
          : undefined
      }
    >
      <OceanBackground />

      <main
        className="relative z-[1]"
        style={{
          minHeight: '100dvh',
          paddingTop: 'calc(48px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Loading state */}
        {isLoading && !displayState && (
          <div
            style={{
              minHeight: '100dvh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div className="skeleton" style={{ height: 12, width: 128, margin: '0 auto 16px' }} />
              <div className="skeleton" style={{ height: 200, width: '80vw', maxWidth: 360, borderRadius: 20 }} />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !displayState && (
          <div
            style={{
              minHeight: '100dvh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
            }}
          >
            <div className="glass-card" style={{ textAlign: 'center', maxWidth: 320 }}>
              <p
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                }}
              >
                Unable to load tidal data
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Main content — loaded */}
        {displayState && (
          <>
            <Header onOpenSettings={() => setSettingsOpen(true)} />
            <HeroSection tidalState={displayState} />

            {/* Card Stack */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: '24px 20px',
              }}
            >
              <TidalEnergyCard phase={displayState.currentPhase} />
              <CurrentTideCard tidalState={displayState} />
              <TideTimesCard tidalState={displayState} />
              <NextTurnCard tidalState={displayState} />
              <StationInfoCard tidalState={displayState} />
            </div>

            {/* 7-Day Calendar */}
            <TidalCalendar station={displayState.station} />

            <Footer />

            <SettingsSheet
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              station={displayState.station}
              settings={settings}
              onUpdateSetting={updateSetting}
              onSelectStation={handleSelectStation}
              onRelocate={handleRelocate}
              notificationPermission={notificationPermission}
            />
          </>
        )}
      </main>
    </div>
  )
}
