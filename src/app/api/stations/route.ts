import { stationMetadata } from '@/lib/station-metadata'

export const runtime = 'nodejs'
let database: Promise<typeof import('@neaps/tide-database')> | null = null
const headers = { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }
function fail(error: string, status = 400) { return Response.json({ error }, { status }) }

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const id = params.get('id'), q = params.get('q')
  const limit = Number(params.get('limit') ?? 20), distance = Number(params.get('distance') ?? 50)
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isFinite(distance) || distance < 1 || distance > 200) return fail('Invalid station search limits.')
  if (id !== null && (id.length === 0 || id.length > 200)) return fail('Invalid station identifier.')
  if (q !== null && (q.trim().length < 2 || q.length > 120)) return fail('Enter between 2 and 120 characters to search.')
  const latText = params.get('lat'), lonText = params.get('lon')
  const latitude = Number(latText), longitude = Number(lonText)
  if (id === null && q === null && (latText === null || lonText === null || !latText.trim() || !lonText.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)) return fail('Invalid location coordinates.')
  try {
    const db = await (database ??= import('@neaps/tide-database').catch(error => { database = null; throw error }))
    if (id !== null) {
      const station = db.stations.find(station => station.id === id)
      if (!station) return fail('This station is unavailable. Please choose another coast.', 404)
      const reference = station.type === 'subordinate' ? db.stations.find(item => item.id === station.offsets?.reference) : undefined
      if (station.type === 'subordinate' && (!reference || reference.type !== 'reference')) return fail('This station has no usable reference. Please choose another coast.', 422)
      return Response.json({ station, ...(reference ? { reference } : {}) }, { headers })
    }
    if (q !== null) return Response.json(db.search(q.trim(), { maxResults: limit }).map(stationMetadata), { headers })
    return Response.json(db.near({ latitude, longitude, maxDistance: distance, maxResults: limit }).map(([raw, distanceKm]) => ({ station: stationMetadata(raw), distanceKm })), { headers })
  } catch {
    return fail('The station catalogue could not be loaded. Please try again.', 503)
  }
}
