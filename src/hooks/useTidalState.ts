'use client'
import { useState, useEffect, useCallback } from 'react'
import type { GeoLocation, TidalState } from '@/types/tidal'
import { findNearestStation, computeTidalState, getStation } from '@/lib/tideEngine'

const defaultServices = { findNearestStation, computeTidalState, getStation }
export function useTidalState(location: GeoLocation | null, services = defaultServices) {
  const [snapshot, setSnapshot] = useState<{ key: string; data: TidalState | null; loading: boolean; error: string | null }>({ key: '', data: null, loading: true, error: null })
  const [revision, setRevision] = useState(0)
  const refresh = useCallback(() => setRevision(value => value + 1), [])
  const latitude = location?.latitude, longitude = location?.longitude, stationId = location?.stationId
  const key = [latitude, longitude, stationId].join(':')
  useEffect(() => {
    let active = true, computing = false
    let station: Awaited<ReturnType<typeof findNearestStation>> = null
    const available = latitude !== undefined && longitude !== undefined
    setSnapshot({ key, data: null, loading: available, error: null })
    if (!available) return
    const compute = async () => {
      if (computing || !active) return
      computing = true
      try {
        if (!station) station = stationId ? { station: await services.getStation(stationId), distanceKm: 0 } : await services.findNearestStation(latitude, longitude)
        if (!active) return
        if (!station) throw new Error('No tide station was found within 50 km. Choose a coast to continue.')
        const next = await services.computeTidalState(station.station, station.distanceKm)
        if (active) setSnapshot({ key, data: next, loading: false, error: null })
      } catch (reason) {
        if (active) setSnapshot(previous => ({ ...previous, loading: false, error: reason instanceof Error ? reason.message : 'The tide forecast could not be calculated.' }))
      } finally { computing = false }
    }
    void compute()
    const tick = setInterval(() => { if (!document.hidden) void compute() }, 60000)
    const onVisible = () => { if (!document.hidden) void compute() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { active = false; clearInterval(tick); document.removeEventListener('visibilitychange', onVisible) }
  }, [latitude, longitude, stationId, key, revision, services])
  const current = snapshot.key === key ? snapshot : { data: null, loading: location !== null, error: null }
  return { tidalState: current.data, isLoading: current.loading, error: current.error, refresh }
}
