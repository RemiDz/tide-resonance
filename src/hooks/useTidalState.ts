'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GeoLocation, TidalState } from '@/types/tidal'
import { findNearestStation, computeTidalState } from '@/lib/tideEngine'

const REFRESH_INTERVAL_MS = 60_000 // re-compute every 60 seconds

interface UseTidalStateResult {
  tidalState: TidalState | null
  isLoading: boolean
  error: string | null
}

export function useTidalState(location: GeoLocation | null): UseTidalStateResult {
  const [tidalState, setTidalState] = useState<TidalState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track the last location we resolved so we don't re-search needlessly
  const lastLocationKey = useRef<string | null>(null)
  const resolvedStation = useRef<{
    station: NonNullable<Awaited<ReturnType<typeof findNearestStation>>>['station']
    distanceKm: number
  } | null>(null)

  const compute = useCallback(async () => {
    if (!location) return

    try {
      const locKey = `${location.latitude},${location.longitude}`

      // Only re-search for station if location actually changed
      if (locKey !== lastLocationKey.current) {
        setIsLoading(true)
        setError(null)

        const result = await findNearestStation(
          location.latitude,
          location.longitude
        )

        if (!result) {
          setError('No tide station found near your location')
          setIsLoading(false)
          return
        }

        resolvedStation.current = result
        lastLocationKey.current = locKey
      }

      if (!resolvedStation.current) return

      const state = await computeTidalState(
        resolvedStation.current.station,
        resolvedStation.current.distanceKm
      )

      setTidalState(state)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to compute tidal state'
      )
    } finally {
      setIsLoading(false)
    }
  }, [location])

  // Initial computation + recompute when location changes
  useEffect(() => {
    compute()
  }, [compute])

  // Live refresh every 60 seconds
  useEffect(() => {
    if (!location) return
    const interval = setInterval(compute, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [location, compute])

  return { tidalState, isLoading, error }
}
