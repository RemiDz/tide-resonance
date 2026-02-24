export interface CuratedStation {
  name: string
  latitude: number
  longitude: number
  country: string
  region: 'UK & Ireland' | 'Europe' | 'Americas' | 'Asia Pacific' | 'Africa'
}

export const curatedStations: CuratedStation[] = [
  // UK & Ireland
  { name: 'Whitby', latitude: 54.486, longitude: -0.615, country: 'United Kingdom', region: 'UK & Ireland' },
  { name: 'North Shields', latitude: 55.007, longitude: -1.440, country: 'United Kingdom', region: 'UK & Ireland' },
  { name: 'Brighton', latitude: 50.815, longitude: -0.137, country: 'United Kingdom', region: 'UK & Ireland' },
  { name: 'Bristol', latitude: 51.511, longitude: -2.712, country: 'United Kingdom', region: 'UK & Ireland' },
  { name: 'London Bridge', latitude: 51.507, longitude: -0.087, country: 'United Kingdom', region: 'UK & Ireland' },
  { name: 'Liverpool', latitude: 53.450, longitude: -3.018, country: 'United Kingdom', region: 'UK & Ireland' },
  { name: 'Dublin', latitude: 53.347, longitude: -6.220, country: 'Ireland', region: 'UK & Ireland' },

  // Europe
  { name: 'Lisbon', latitude: 38.708, longitude: -9.133, country: 'Portugal', region: 'Europe' },
  { name: 'Amsterdam', latitude: 52.379, longitude: 4.897, country: 'Netherlands', region: 'Europe' },
  { name: 'Reykjavik', latitude: 64.153, longitude: -21.946, country: 'Iceland', region: 'Europe' },

  // Americas
  { name: 'San Francisco', latitude: 37.807, longitude: -122.465, country: 'United States', region: 'Americas' },
  { name: 'New York', latitude: 40.700, longitude: -74.014, country: 'United States', region: 'Americas' },
  { name: 'Miami', latitude: 25.768, longitude: -80.132, country: 'United States', region: 'Americas' },
  { name: 'Seattle', latitude: 47.602, longitude: -122.339, country: 'United States', region: 'Americas' },

  // Asia Pacific
  { name: 'Sydney', latitude: -33.856, longitude: 151.226, country: 'Australia', region: 'Asia Pacific' },
  { name: 'Tokyo', latitude: 35.652, longitude: 139.770, country: 'Japan', region: 'Asia Pacific' },
  { name: 'Hong Kong', latitude: 22.286, longitude: 114.188, country: 'China', region: 'Asia Pacific' },

  // Africa
  { name: 'Cape Town', latitude: -33.904, longitude: 18.437, country: 'South Africa', region: 'Africa' },
]

export function getStationsByRegion(): Record<string, CuratedStation[]> {
  const groups: Record<string, CuratedStation[]> = {}
  for (const s of curatedStations) {
    if (!groups[s.region]) groups[s.region] = []
    groups[s.region].push(s)
  }
  return groups
}
