'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import type { GeoLocation, TidalState } from '@/types/tidal'
import { useTidalState } from '@/hooks/useTidalState'
import { useGeolocation } from '@/hooks/useGeolocation'
import { getPhaseColour } from '@/lib/colour-utils'
import { getBreathTimings } from '@/lib/breath-ratios'
import { DURATION } from '@/lib/motion-constants'
import { OceanBackground } from '@/components/OceanBackground'
import { Welcome } from '@/components/Welcome'
import { Header } from '@/components/Header'
import { BreathOrb } from '@/components/BreathOrb'
import { ActionBar } from '@/components/ActionBar'
import { GuideSheet } from '@/components/GuideSheet'
import { TideInfoSheet } from '@/components/TideInfoSheet'
import { SettingsSheet } from '@/components/SettingsSheet'

export default function TideResonancePage() {
  // --- Welcome flow state ---
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null)
  const [welcomeLocation, setWelcomeLocation] = useState<GeoLocation | null>(null)
  const [initialState, setInitialState] = useState<TidalState | null>(null)

  // --- Sheet state ---
  const [guideOpen, setGuideOpen] = useState(false)
  const [tideInfoOpen, setTideInfoOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // --- Breath state ---
  const [breathSpeed, setBreathSpeed] = useState(1.0)
  const [breathEnabled] = useState(true)

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

  const handleWelcomeComplete = useCallback(
    (loc: GeoLocation, state?: TidalState) => {
      setWelcomeLocation(loc)
      if (state) setInitialState(state)
      setHasSeenWelcome(true)
    },
    []
  )

  const now = useMemo(() => new Date(), [])

  const phaseColour = displayState
    ? getPhaseColour(displayState.currentPhase)
    : undefined

  // Compute tide-shaped breath timings
  const cycleDuration = DURATION.BREATH_CYCLE / breathSpeed
  const breathTimings = useMemo(
    () => displayState ? getBreathTimings(displayState.currentPhase, cycleDuration) : null,
    [displayState, cycleDuration]
  )

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

  // Main app — single screen, no scroll
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
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Loading state */}
        {isLoading && !displayState && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="skeleton h-3 w-32 mx-auto mb-4" />
              <div className="skeleton h-[240px] w-[240px] rounded-full mx-auto" />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !displayState && (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="glass-card text-center max-w-sm">
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
        {displayState && breathTimings && (
          <>
            {/* Header — compact, top */}
            <Header tidalState={displayState} />

            {/* Breath Orb — centred in remaining space */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BreathOrb
                phase={displayState.currentPhase}
                timings={breathTimings}
                enabled={breathEnabled}
              />
            </div>

            {/* Action Bar — anchored at bottom */}
            <ActionBar
              onSettingsOpen={() => setSettingsOpen(true)}
              onTideInfoOpen={() => setTideInfoOpen(true)}
              onGuideOpen={() => setGuideOpen(true)}
            />
          </>
        )}
      </main>

      {/* Bottom Sheets — hidden until tapped */}
      {displayState && (
        <>
          <TideInfoSheet
            open={tideInfoOpen}
            onClose={() => setTideInfoOpen(false)}
            tidalState={displayState}
            now={now}
          />
          <GuideSheet
            open={guideOpen}
            onClose={() => setGuideOpen(false)}
            tidalState={displayState}
          />
          <SettingsSheet
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            tidalState={displayState}
            breathSpeed={breathSpeed}
            onBreathSpeedChange={setBreathSpeed}
          />
        </>
      )}
    </div>
  )
}
