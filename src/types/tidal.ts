// Station types (aligned with @neaps/tide-database)
export interface TideStation {
  id: string
  name: string
  latitude: number
  longitude: number
  country: string
  continent: string
  timezone: string
  type: 'reference' | 'subordinate'
}

// Prediction results
export interface TideExtreme {
  time: Date
  height: number
  type: 'high' | 'low'
}

export interface TidePoint {
  time: Date
  height: number
}

// Current tidal state
export type TidalPhase = 'RISING' | 'FALLING' | 'HIGH_SLACK' | 'LOW_SLACK'

export interface TidalState {
  station: TideStation
  distanceKm: number
  currentHeight: number
  currentPhase: TidalPhase
  phaseProgress: number // 0-1 within current phase
  rateOfChange: number // meters/hour
  nextHigh: TideExtreme | null
  nextLow: TideExtreme | null
  previousHigh: TideExtreme | null
  previousLow: TideExtreme | null
  extremes24h: TideExtreme[]
  timeline24h: TidePoint[]
}

// Geolocation
export interface GeoLocation {
  latitude: number
  longitude: number
  source: 'device' | 'fallback' | 'manual'
  label?: string
}
