import type { Settings } from '@/types/settings'

const dateFormats = new Map<string, Intl.DateTimeFormat>()
export function stationDateKey(date: Date, timeZone: string): string {
  if (!Number.isFinite(+date)) throw new Error('Invalid date')
  let formatter = dateFormats.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    dateFormats.set(timeZone, formatter)
  }
  const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}
function midnight(key: string, timeZone: string): Date {
  const utc = Date.parse(key + 'T00:00:00Z')
  let low = utc - 36 * 3600000, high = utc + 36 * 3600000
  // First instant of the civil date also handles skipped/repeated midnight.
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2)
    if (stationDateKey(new Date(mid), timeZone) < key) low = mid
    else high = mid
  }
  return new Date(high)
}
export function stationDayBounds(date: Date, timeZone: string, offset = 0) {
  const key = stationDateKey(date, timeZone)
  const civil = new Date(key + 'T12:00:00Z')
  civil.setUTCDate(civil.getUTCDate() + offset)
  const first = civil.toISOString().slice(0, 10)
  civil.setUTCDate(civil.getUTCDate() + 1)
  return { start: midnight(first, timeZone), end: midnight(civil.toISOString().slice(0, 10), timeZone), key: first }
}
export function formatTideTime(date: Date, timeZone: string, format: Settings['timeFormat'] = '24h') {
  return date.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: format === '12h' })
}
export function heightValue(metres: number, units: Settings['units']) { return units === 'feet' ? metres / 0.3048 : metres }
export function heightUnit(units: Settings['units']) { return units === 'feet' ? 'ft' : 'm' }
export function formatHeight(metres: number, units: Settings['units'], decimals = 2) {
  return `${heightValue(metres, units).toFixed(decimals)} ${heightUnit(units)}`
}
