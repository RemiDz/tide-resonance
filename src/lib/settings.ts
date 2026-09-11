import type { Settings } from '@/types/settings'
import type { GeoLocation } from '@/types/tidal'
export const DEFAULT_SETTINGS: Settings = {
  units: 'metres', timeFormat: '24h', droneEnabled: false, droneVolume: 35, droneFrequency: 432,
  alertsEnabled: false, alertTiming: 30, alertHigh: true, alertLow: true,
}
export const DEFAULT_LOCATION: GeoLocation = { latitude: 54.486, longitude: -0.615, source: 'fallback', label: 'Whitby' }
export function readStored(key: string): unknown {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : null } catch { return null }
}
export function storeValue(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* In-memory settings still work. */ }
}
export function sanitizeSettings(input: unknown): Settings {
  const s = input && typeof input === 'object' ? input as Partial<Settings> : {}
  const result = { ...DEFAULT_SETTINGS }
  if (s.units === 'metres' || s.units === 'feet') result.units = s.units
  if (s.timeFormat === '12h' || s.timeFormat === '24h') result.timeFormat = s.timeFormat
  if (typeof s.droneVolume === 'number' && Number.isFinite(s.droneVolume)) result.droneVolume = Math.max(0, Math.min(100, s.droneVolume))
  if (s.droneFrequency === 432 || s.droneFrequency === 440 || s.droneFrequency === 528) result.droneFrequency = s.droneFrequency
  if (s.alertTiming === 15 || s.alertTiming === 30 || s.alertTiming === 60) result.alertTiming = s.alertTiming
  for (const key of ['droneEnabled', 'alertsEnabled', 'alertHigh', 'alertLow'] as const) if (typeof s[key] === 'boolean') result[key] = s[key]
  return result
}
export function sanitizeLocation(value: unknown): GeoLocation | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Partial<GeoLocation>
  if (typeof v.latitude !== 'number' || !Number.isFinite(v.latitude) || Math.abs(v.latitude) > 90 ||
      typeof v.longitude !== 'number' || !Number.isFinite(v.longitude) || Math.abs(v.longitude) > 180) return null
  return { latitude: v.latitude, longitude: v.longitude, source: 'manual',
    ...(typeof v.stationId === 'string' && v.stationId.length < 200 ? { stationId: v.stationId } : {}),
    ...(typeof v.label === 'string' ? { label: v.label.slice(0, 160) } : {}) }
}
