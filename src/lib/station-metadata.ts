import type { Station } from '@neaps/tide-database'
import type { TideStation } from '@/types/tidal'

export function stationDatum(raw: Station): string {
  if (raw.type === 'subordinate') return raw.chart_datum || 'MSL'
  return Number.isFinite(raw.datums?.MSL) && Number.isFinite(raw.datums?.[raw.chart_datum]) ? raw.chart_datum : 'MSL'
}
export function stationMetadata(raw: Station): TideStation {
  return { id: raw.id, name: raw.name, latitude: raw.latitude, longitude: raw.longitude,
    country: raw.country, continent: raw.continent, timezone: raw.timezone || 'UTC', type: raw.type,
    datum: stationDatum(raw), source: raw.source.name, sourceUrl: raw.source.url }
}
