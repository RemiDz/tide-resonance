import type { TideExtreme, TidePoint, TideStation } from '@/types/tidal'
import { stationDayBounds } from './tide-time'
import { getExtremes, getTimeline } from './tideEngine'

export interface ForecastDay { key: string; start: Date; end: Date; extremes: TideExtreme[]; points: TidePoint[] }
export async function getWeekForecast(station: TideStation, date: Date): Promise<ForecastDay[]> {
  const bounds = Array.from({ length: 7 }, (_, offset) => stationDayBounds(date, station.timezone, offset))
  const extremes = await getExtremes(station.id, bounds[0].start, bounds[6].end)
  return Promise.all(bounds.map(async day => ({
    ...day,
    extremes: extremes.filter(point => +point.time >= +day.start && +point.time < +day.end),
    points: await getTimeline(station.id, day.start, day.end, 900),
  })))
}
