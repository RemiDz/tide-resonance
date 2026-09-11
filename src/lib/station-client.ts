import type { Station } from '@neaps/tide-database'
import type { TideStation } from '@/types/tidal'

export interface StationModel { station: Station; reference?: Station }
export interface NearbyStation { station: TideStation; distanceKm: number }
const cache = new Map<string, Promise<unknown>>()
async function query<T>(params: Record<string, string | number>): Promise<T> {
  const key = new URLSearchParams(Object.entries(params).map(([name, value]) => [name, String(value)])).toString()
  let pending = cache.get(key)
  if (!pending) {
    pending = (async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)
      try {
        const response = await fetch('/api/stations?' + key, { signal: controller.signal })
        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || 'Station information is unavailable. Please try again.')
        }
        return await response.json()
      } catch (reason) {
        if (reason instanceof TypeError || (reason instanceof Error && reason.name === 'AbortError')) throw new Error('Connect to the internet to load this coast, then try again.')
        throw reason
      } finally { clearTimeout(timeout) }
    })()
    if (cache.size >= 80) cache.delete(cache.keys().next().value!)
    cache.set(key, pending)
    pending.catch(() => { if (cache.get(key) === pending) cache.delete(key) })
  }
  return pending as Promise<T>
}
export const stationClient = {
  getModel: (id: string) => query<StationModel>({ id }),
  search: (q: string, limit: number) => query<TideStation[]>({ q, limit }),
  near: (lat: number, lon: number, distance = 50, limit = 10) => query<NearbyStation[]>({ lat, lon, distance, limit }),
}
