'use client'
import { useState, useEffect } from 'react'
import type { GeoLocation } from '@/types/tidal'
import { DEFAULT_LOCATION } from '@/lib/settings'

export function useGeolocation(enabled = true): GeoLocation | null {
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION)
  useEffect(() => {
    if (!enabled || !navigator.geolocation) return
    let active = true
    navigator.geolocation.getCurrentPosition(position => {
      if (active) setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, source: 'device' })
    }, () => { /* Keep the explicitly labelled default coast. */ }, { timeout: 8000, maximumAge: 300000 })
    return () => { active = false }
  }, [enabled])
  return enabled ? location : null
}
