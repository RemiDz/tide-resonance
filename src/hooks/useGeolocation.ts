'use client'

import { useState, useEffect } from 'react'
import type { GeoLocation } from '@/types/tidal'

const WHITBY_FALLBACK: GeoLocation = {
  latitude: 54.486,
  longitude: -0.615,
  source: 'fallback',
  label: 'Whitby',
}

/**
 * Device geolocation hook with fallback.
 * When enabled=false, returns null (doesn't prompt for location).
 * When enabled=true, attempts device geolocation and falls back to Whitby.
 */
export function useGeolocation(enabled = true): GeoLocation | null {
  const [location, setLocation] = useState<GeoLocation | null>(
    enabled ? WHITBY_FALLBACK : null
  )

  useEffect(() => {
    if (!enabled) {
      setLocation(null)
      return
    }

    // Start with fallback immediately
    setLocation(WHITBY_FALLBACK)

    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: 'device',
        })
      },
      () => {
        // Geolocation denied or unavailable — keep fallback
      },
      { timeout: 8000, maximumAge: 300_000 }
    )
  }, [enabled])

  return location
}
