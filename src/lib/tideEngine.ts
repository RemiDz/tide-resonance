import type { Station } from '@neaps/tide-database'
import type { TidePrediction } from '@neaps/tide-predictor'
import type { TideStation, TideExtreme, TidePoint, TidalPhase, TidalState } from '@/types/tidal'
import { stationDayBounds } from './tide-time'

import { stationClient, type NearbyStation } from './station-client'
import { stationDatum, stationMetadata } from './station-metadata'

type Model = { raw: Station; predictor: TidePrediction; datum: string; offsets?: Station['offsets'] }
const models = new Map<string, Promise<Model>>()
function validatePosition(lat: number, lon: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error('Invalid location coordinates.')
}
function validateWindow(start: Date, end: Date) {
  if (!Number.isFinite(+start) || !Number.isFinite(+end) || +end <= +start || +end - +start > 40 * 86400000) throw new Error('Invalid forecast dates.')
}
export async function getStation(id: string): Promise<TideStation> {
  return stationMetadata((await stationClient.getModel(id)).station)
}
export async function findNearestStation(lat: number, lon: number): Promise<NearbyStation | null> {
  validatePosition(lat, lon)
  return (await stationClient.near(lat, lon, 50, 1))[0] ?? null
}
export async function searchStations(query: string, maxResults = 20): Promise<TideStation[]> {
  if (query.trim().length < 2) return []
  return stationClient.search(query.trim().slice(0, 120), Math.min(50, Math.max(1, maxResults)))
}
export async function getStationsNear(lat: number, lon: number, maxDistance = 50, maxResults = 10) {
  validatePosition(lat, lon)
  return stationClient.near(lat, lon, maxDistance, maxResults)
}
async function buildModel(stationId: string): Promise<Model> {
  const cached = models.get(stationId)
  if (cached) return cached
  const promise = (async () => {
    const model = await stationClient.getModel(stationId)
    const raw = model.station
    const reference = raw.type === 'subordinate' ? model.reference : raw
    if (!reference || reference.type !== 'reference') throw new Error('This station has no usable reference. Please choose another coast.')
    const datum = stationDatum(reference)
    const mean = reference.datums?.MSL ?? 0
    const origin = reference.datums?.[datum] ?? mean
    const { createTidePredictor } = await import('@neaps/tide-predictor')
    const predictor = createTidePredictor(reference.harmonic_constituents, { offset: mean - origin })
    return { raw, predictor, datum, offsets: raw.type === 'subordinate' ? raw.offsets : undefined }
  })()
  if (models.size >= 24) models.delete(models.keys().next().value!)
  models.set(stationId, promise)
  promise.catch(() => { if (models.get(stationId) === promise) models.delete(stationId) })
  return promise
}
function extremesFor(model: Model, start: Date, end: Date): TideExtreme[] {
  const offsets = model.offsets
  const padding = offsets ? Math.max(Math.abs(offsets.time.high), Math.abs(offsets.time.low)) * 60000 + 3600000 : 0
  const raw = model.predictor.getExtremesPrediction({ start: new Date(+start - padding), end: new Date(+end + padding) })
  return raw.map(point => {
    const type = point.high ? 'high' as const : 'low' as const
    const height = offsets ? offsets.height.type === 'ratio' ? point.level * offsets.height[type] : point.level + offsets.height[type] : point.level
    return { type, time: new Date(+point.time + (offsets?.time[type] ?? 0) * 60000), height }
  }).filter(point => +point.time >= +start && +point.time < +end).sort((a, b) => +a.time - +b.time)
}
export async function getExtremes(stationId: string, start: Date, end: Date): Promise<TideExtreme[]> {
  validateWindow(start, end)
  return extremesFor(await buildModel(stationId), start, end)
}
/** Secondary stations publish high/low offsets, not a continuous harmonic model. */
export function interpolateSecondaryHeight(extremes: TideExtreme[], time: Date): number {
  const nextIndex = extremes.findIndex(extreme => +extreme.time >= +time)
  if (nextIndex === 0 && +extremes[0].time === +time) return extremes[0].height
  if (nextIndex < 1) throw new Error('No surrounding tide turns are available for this forecast.')
  const previous = extremes[nextIndex - 1], next = extremes[nextIndex]
  const fraction = (+time - +previous.time) / (+next.time - +previous.time)
  return previous.height + (next.height - previous.height) * (1 - Math.cos(Math.PI * fraction)) / 2
}
function heightFor(model: Model, time: Date, extremes?: TideExtreme[]) {
  if (!model.offsets) return model.predictor.getWaterLevelAtTime({ time }).level
  return interpolateSecondaryHeight(extremes ?? extremesFor(model, new Date(+time - 2 * 86400000), new Date(+time + 2 * 86400000)), time)
}
export async function getCurrentHeight(stationId: string, time: Date): Promise<number> {
  if (!Number.isFinite(+time)) throw new Error('Invalid forecast time.')
  return heightFor(await buildModel(stationId), time)
}
export async function getTimeline(stationId: string, start: Date, end: Date, fidelity = 600): Promise<TidePoint[]> {
  validateWindow(start, end)
  if (!Number.isFinite(fidelity) || fidelity < 60 || fidelity > 86400) throw new Error('Invalid forecast interval.')
  const model = await buildModel(stationId)
  const extremes = model.offsets ? extremesFor(model, new Date(+start - 2 * 86400000), new Date(+end + 2 * 86400000)) : undefined
  const points: TidePoint[] = []
  for (let time = +start; time < +end; time += fidelity * 1000) points.push({ time: new Date(time), height: heightFor(model, new Date(time), extremes) })
  points.push({ time: end, height: heightFor(model, end, extremes) })
  return points
}
export async function computeTidalState(station: TideStation, distanceKm: number, now = new Date()): Promise<TidalState> {
  const { start, end } = stationDayBounds(now, station.timezone)
  const [extremes, timeline24h, currentHeight, beforeHeight, afterHeight] = await Promise.all([
    getExtremes(station.id, new Date(+start - 2 * 86400000), new Date(+end + 2 * 86400000)),
    getTimeline(station.id, start, end), getCurrentHeight(station.id, now),
    getCurrentHeight(station.id, new Date(+now - 300000)), getCurrentHeight(station.id, new Date(+now + 300000)),
  ])
  const past = extremes.filter(extreme => +extreme.time <= +now).reverse()
  const future = extremes.filter(extreme => +extreme.time > +now)
  const last = past[0], next = future[0]
  if (!last || !next) throw new Error('No tide turns were found for this coast. Please choose another station.')
  const phaseProgress = Math.max(0, Math.min(1, (+now - +last.time) / (+next.time - +last.time)))
  const rateOfChange = (afterHeight - beforeHeight) * 6
  let currentPhase: TidalPhase = rateOfChange >= 0 ? 'RISING' : 'FALLING'
  if (+now - +last.time <= 15 * 60000) currentPhase = last.type === 'high' ? 'HIGH_SLACK' : 'LOW_SLACK'
  else if (+next.time - +now <= 15 * 60000) currentPhase = next.type === 'high' ? 'HIGH_SLACK' : 'LOW_SLACK'
  return { station, distanceKm, currentHeight, currentPhase, phaseProgress, rateOfChange,
    previousHigh: past.find(point => point.type === 'high') ?? null, previousLow: past.find(point => point.type === 'low') ?? null,
    nextHigh: future.find(point => point.type === 'high') ?? null, nextLow: future.find(point => point.type === 'low') ?? null,
    extremes24h: extremes.filter(point => +point.time >= +start && +point.time < +end), timeline24h,
    computedAt: now, dayStart: start, dayEnd: end }
}
