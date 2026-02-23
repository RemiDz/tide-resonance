'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GeoLocation, TidalState } from '@/types/tidal'

interface WelcomeProps {
  onComplete: (location: GeoLocation, tidalState?: TidalState) => void
}

type Screen = 'intro' | 'location'

export function Welcome({ onComplete }: WelcomeProps) {
  const [screen, setScreen] = useState<Screen>('intro')
  const [visible, setVisible] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [screen])

  const handleUseLocation = useCallback(async () => {
    setLocating(true)
    setError(null)

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 300_000,
        })
      })

      const loc: GeoLocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        source: 'device',
      }

      const { findNearestStation, computeTidalState } = await import('@/lib/tideEngine')
      const result = await findNearestStation(loc.latitude, loc.longitude)

      if (!result) {
        setError('No tidal station found nearby.')
        setLocating(false)
        return
      }

      const state = await computeTidalState(result.station, result.distanceKm)
      localStorage.setItem('hasSeenWelcome', 'true')
      onComplete(loc, state)
    } catch {
      setError('Location unavailable. Try Whitby instead.')
    } finally {
      setLocating(false)
    }
  }, [onComplete])

  const handleUseFallback = useCallback(async () => {
    setLocating(true)
    setError(null)

    const loc: GeoLocation = {
      latitude: 54.486,
      longitude: -0.615,
      source: 'fallback',
      label: 'Whitby',
    }

    try {
      const { findNearestStation, computeTidalState } = await import('@/lib/tideEngine')
      const result = await findNearestStation(loc.latitude, loc.longitude)
      if (result) {
        const state = await computeTidalState(result.station, result.distanceKm)
        localStorage.setItem('hasSeenWelcome', 'true')
        onComplete(loc, state)
      } else {
        localStorage.setItem('hasSeenWelcome', 'true')
        onComplete(loc)
      }
    } catch {
      localStorage.setItem('hasSeenWelcome', 'true')
      onComplete(loc)
    } finally {
      setLocating(false)
    }
  }, [onComplete])

  return (
    <div
      className="relative z-[1] min-h-screen flex items-center justify-center px-6"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
      }}
    >
      <div className="max-w-sm w-full text-center">
        {/* Screen 1: Intro */}
        {screen === 'intro' && (
          <div className="space-y-5">
            <PulsingIcon>{'\u224B'}</PulsingIcon>
            <FadeLine delay={0}>
              <span style={{ fontSize: '1.125rem', fontWeight: 300 }}>
                Breathe with the ocean.
              </span>
            </FadeLine>
            <FadeLine delay={0.4}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                This app guides your breath using the rhythm of the real tide near you.
              </span>
            </FadeLine>
            <FadeLine delay={0.8}>
              <button
                onClick={() => setScreen('location')}
                className="mt-6 px-8 py-3 rounded-2xl text-sm font-medium transition-all duration-300"
                style={{
                  background: 'rgba(79, 195, 247, 0.1)',
                  border: '1px solid rgba(79, 195, 247, 0.15)',
                  color: '#4fc3f7',
                }}
              >
                Continue {'\u2192'}
              </button>
            </FadeLine>
          </div>
        )}

        {/* Screen 2: Location */}
        {screen === 'location' && (
          <div className="space-y-5">
            <PulsingIcon>{'\u25C9'}</PulsingIcon>
            <FadeLine delay={0}>
              <div className="space-y-3 mt-2">
                <button
                  onClick={handleUseLocation}
                  disabled={locating}
                  className="w-full py-3 rounded-2xl text-sm font-medium transition-all duration-300"
                  style={{
                    background: 'rgba(79, 195, 247, 0.12)',
                    border: '1px solid rgba(79, 195, 247, 0.2)',
                    color: '#4fc3f7',
                    opacity: locating ? 0.5 : 1,
                  }}
                >
                  {locating ? 'Finding your station\u2026' : '\uD83D\uDCCD Find My Coast'}
                </button>
                <button
                  onClick={handleUseFallback}
                  disabled={locating}
                  className="w-full py-3 rounded-2xl text-sm transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Or use Whitby, England
                </button>
              </div>
            </FadeLine>
            {error && (
              <p className="mt-4" style={{ color: '#7986cb', fontSize: '0.8125rem' }}>
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PulsingIcon({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4"
      style={{
        fontSize: '1.5rem',
        color: 'rgba(79, 195, 247, 0.5)',
        animation: 'bioPulse 3s ease-in-out infinite',
      }}
    >
      {children}
    </div>
  )
}

function FadeLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay * 1000)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        lineHeight: 1.8,
        fontWeight: 200,
        color: 'var(--text-primary)',
      }}
    >
      {children}
    </div>
  )
}
