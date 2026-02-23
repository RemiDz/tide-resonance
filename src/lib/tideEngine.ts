import type {
  TideStation,
  TideExtreme,
  TidePoint,
  TidalPhase,
  TidalState,
} from '@/types/tidal'

// ---------------------------------------------------------------------------
// Lazy-loaded database reference (avoids blocking initial page load)
// ---------------------------------------------------------------------------

let _dbModule: typeof import('@neaps/tide-database') | null = null

async function getDatabase() {
  if (!_dbModule) {
    _dbModule = await import('@neaps/tide-database')
  }
  return _dbModule
}

// ---------------------------------------------------------------------------
// Station helpers — map @neaps Station to our TideStation shape
// ---------------------------------------------------------------------------

function toTideStation(s: { id: string; name: string; latitude: number; longitude: number; country: string; continent: string; timezone: string; type: 'reference' | 'subordinate' }): TideStation {
  return {
    id: s.id,
    name: s.name,
    latitude: s.latitude,
    longitude: s.longitude,
    country: s.country,
    continent: s.continent,
    timezone: s.timezone,
    type: s.type,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Find the nearest station to a given coordinate.
 * Returns the station and the distance in km, or null if none found.
 */
export async function findNearestStation(
  lat: number,
  lon: number
): Promise<{ station: TideStation; distanceKm: number } | null> {
  const db = await getDatabase()
  const result = db.nearest({ latitude: lat, longitude: lon })
  if (!result) return null
  const [raw, dist] = result
  return { station: toTideStation(raw), distanceKm: dist }
}

/**
 * Search stations by name (fuzzy text search).
 */
export async function searchStations(
  query: string,
  maxResults = 20
): Promise<TideStation[]> {
  const db = await getDatabase()
  const results = db.search(query, { maxResults })
  return results.map(toTideStation)
}

/**
 * Find multiple stations near a coordinate.
 */
export async function getStationsNear(
  lat: number,
  lon: number,
  maxDistance = 50,
  maxResults = 10
): Promise<{ station: TideStation; distanceKm: number }[]> {
  const db = await getDatabase()
  const results = db.near({
    latitude: lat,
    longitude: lon,
    maxDistance,
    maxResults,
  })
  return results.map(([raw, dist]) => ({
    station: toTideStation(raw),
    distanceKm: dist,
  }))
}

// ---------------------------------------------------------------------------
// Prediction helpers
// ---------------------------------------------------------------------------

/**
 * Build a tide predictor for a given station id.
 * Handles both reference and subordinate stations.
 */
async function buildPredictor(stationId: string) {
  const { createTidePredictor } = await import('@neaps/tide-predictor')
  const db = await getDatabase()

  const raw = db.stations.find((s) => s.id === stationId)
  if (!raw) throw new Error(`Station "${stationId}" not found in database`)

  if (raw.type === 'reference') {
    const predictor = createTidePredictor(raw.harmonic_constituents)
    return { predictor, offsets: undefined }
  }

  // Subordinate — resolve the reference station
  if (!raw.offsets) {
    throw new Error(`Subordinate station "${stationId}" has no offsets`)
  }

  const ref = db.stations.find((s) => s.id === raw.offsets!.reference)
  if (!ref) {
    throw new Error(
      `Reference station "${raw.offsets.reference}" not found for subordinate "${stationId}"`
    )
  }

  const predictor = createTidePredictor(ref.harmonic_constituents)
  return {
    predictor,
    offsets: {
      height: raw.offsets.height,
      time: raw.offsets.time,
    },
  }
}

/**
 * Get high/low tide extremes between two dates.
 */
export async function getExtremes(
  stationId: string,
  start: Date,
  end: Date
): Promise<TideExtreme[]> {
  const { predictor, offsets } = await buildPredictor(stationId)

  const raw = predictor.getExtremesPrediction({
    start,
    end,
    labels: { high: 'High', low: 'Low' },
    ...(offsets ? { offsets } : {}),
  })

  return raw.map((e) => ({
    time: e.time,
    height: e.level,
    type: e.high ? ('high' as const) : ('low' as const),
  }))
}

/**
 * Get a continuous water-level timeline between two dates.
 * @param fidelity  Seconds between points (default 600 = 10 minutes)
 */
export async function getTimeline(
  stationId: string,
  start: Date,
  end: Date,
  fidelity = 600
): Promise<TidePoint[]> {
  const { predictor } = await buildPredictor(stationId)

  const raw = predictor.getTimelinePrediction({
    start,
    end,
    timeFidelity: fidelity,
  })

  return raw.map((p) => ({ time: p.time, height: p.level }))
}

/**
 * Get the water height at a single moment in time.
 */
export async function getCurrentHeight(
  stationId: string,
  time: Date
): Promise<number> {
  const { predictor } = await buildPredictor(stationId)
  const point = predictor.getWaterLevelAtTime({ time })
  return point.level
}

// ---------------------------------------------------------------------------
// Full tidal-state computation
// ---------------------------------------------------------------------------

/**
 * Compute a complete TidalState snapshot for a station.
 * This is the primary function consumed by the useTidalState hook.
 */
export async function computeTidalState(
  station: TideStation,
  distanceKm: number
): Promise<TidalState> {
  const now = new Date()

  // 48-hour window for extremes: yesterday 00:00 → tomorrow 23:59
  const extremesStart = new Date(now)
  extremesStart.setDate(extremesStart.getDate() - 1)
  extremesStart.setHours(0, 0, 0, 0)

  const extremesEnd = new Date(now)
  extremesEnd.setDate(extremesEnd.getDate() + 1)
  extremesEnd.setHours(23, 59, 59, 999)

  // 24-hour window for timeline: today 00:00 → today 23:59
  const timelineStart = new Date(now)
  timelineStart.setHours(0, 0, 0, 0)

  const timelineEnd = new Date(now)
  timelineEnd.setHours(23, 59, 59, 999)

  // Fetch extremes + timeline + current height in parallel
  const [extremes48h, timeline24h, currentHeight] = await Promise.all([
    getExtremes(station.id, extremesStart, extremesEnd),
    getTimeline(station.id, timelineStart, timelineEnd),
    getCurrentHeight(station.id, now),
  ])

  // Filter extremes to today only for the 24h list
  const todayStart = timelineStart.getTime()
  const todayEnd = timelineEnd.getTime()
  const extremes24h = extremes48h.filter(
    (e) => e.time.getTime() >= todayStart && e.time.getTime() <= todayEnd
  )

  // Find previous and next extremes relative to now
  const nowMs = now.getTime()

  const pastExtremes = extremes48h
    .filter((e) => e.time.getTime() <= nowMs)
    .sort((a, b) => b.time.getTime() - a.time.getTime())

  const futureExtremes = extremes48h
    .filter((e) => e.time.getTime() > nowMs)
    .sort((a, b) => a.time.getTime() - b.time.getTime())

  const previousHigh = pastExtremes.find((e) => e.type === 'high') ?? null
  const previousLow = pastExtremes.find((e) => e.type === 'low') ?? null
  const nextHigh = futureExtremes.find((e) => e.type === 'high') ?? null
  const nextLow = futureExtremes.find((e) => e.type === 'low') ?? null

  // Determine current phase
  const lastExtreme = pastExtremes[0] ?? null
  const nextExtreme = futureExtremes[0] ?? null

  let currentPhase: TidalPhase = 'RISING'
  let phaseProgress = 0

  if (lastExtreme && nextExtreme) {
    const phaseDuration = nextExtreme.time.getTime() - lastExtreme.time.getTime()
    const elapsed = nowMs - lastExtreme.time.getTime()
    phaseProgress = phaseDuration > 0 ? Math.min(elapsed / phaseDuration, 1) : 0

    // Slack windows: within 5% of phase boundaries
    const SLACK_THRESHOLD = 0.05

    if (lastExtreme.type === 'low' && nextExtreme.type === 'high') {
      // Between a low and a high → rising
      if (phaseProgress < SLACK_THRESHOLD) {
        currentPhase = 'LOW_SLACK'
      } else if (phaseProgress > 1 - SLACK_THRESHOLD) {
        currentPhase = 'HIGH_SLACK'
      } else {
        currentPhase = 'RISING'
      }
    } else {
      // Between a high and a low → falling
      if (phaseProgress < SLACK_THRESHOLD) {
        currentPhase = 'HIGH_SLACK'
      } else if (phaseProgress > 1 - SLACK_THRESHOLD) {
        currentPhase = 'LOW_SLACK'
      } else {
        currentPhase = 'FALLING'
      }
    }
  }

  // Rate of change — difference over past 10 minutes
  const tenMinAgo = new Date(nowMs - 10 * 60 * 1000)
  let rateOfChange = 0
  try {
    const heightTenMinAgo = await getCurrentHeight(station.id, tenMinAgo)
    const deltaH = currentHeight - heightTenMinAgo
    rateOfChange = deltaH * 6 // 10 min → per hour
  } catch {
    // If rate calc fails, leave as 0
  }

  return {
    station,
    distanceKm,
    currentHeight,
    currentPhase,
    phaseProgress,
    rateOfChange,
    nextHigh,
    nextLow,
    previousHigh,
    previousLow,
    extremes24h,
    timeline24h,
  }
}
