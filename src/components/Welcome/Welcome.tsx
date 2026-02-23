'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GeoLocation, TidalState } from '@/types/tidal'

interface WelcomeProps {
  onComplete: (location: GeoLocation, tidalState?: TidalState) => void
}

export function Welcome({ onComplete }: WelcomeProps) {
  const [visible, setVisible] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

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
        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: 32,
            letterSpacing: '-0.01em',
          }}
        >
          Tide Resonance
        </h1>

        {/* Location buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleUseLocation}
            disabled={locating}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 16,
              fontSize: '0.875rem',
              fontWeight: 500,
              background: 'rgba(79, 195, 247, 0.12)',
              border: '1px solid rgba(79, 195, 247, 0.2)',
              color: '#4fc3f7',
              cursor: locating ? 'wait' : 'pointer',
              opacity: locating ? 0.5 : 1,
              transition: 'opacity 0.2s ease, background 0.2s ease',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
            }}
          >
            {locating ? 'Finding your station\u2026' : 'Find My Coast'}
          </button>

          <button
            onClick={handleUseFallback}
            disabled={locating}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 16,
              fontSize: '0.875rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              cursor: locating ? 'wait' : 'pointer',
              transition: 'background 0.2s ease',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
            }}
          >
            Use Whitby, England
          </button>
        </div>

        {error && (
          <p
            style={{
              marginTop: 16,
              color: '#7986cb',
              fontSize: '0.8125rem',
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
