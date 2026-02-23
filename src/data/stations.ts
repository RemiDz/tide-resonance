export interface CuratedStation {
  name: string
  latitude: number
  longitude: number
  country: string
}

export const curatedStations: CuratedStation[] = [
  // UK
  { name: 'Whitby', latitude: 54.486, longitude: -0.615, country: 'United Kingdom' },
  { name: 'Brighton', latitude: 50.815, longitude: -0.137, country: 'United Kingdom' },
  { name: 'Bristol (Avonmouth)', latitude: 51.511, longitude: -2.712, country: 'United Kingdom' },
  { name: 'London Bridge', latitude: 51.507, longitude: -0.087, country: 'United Kingdom' },
  { name: 'Liverpool', latitude: 53.450, longitude: -3.018, country: 'United Kingdom' },

  // US
  { name: 'San Francisco', latitude: 37.807, longitude: -122.465, country: 'United States' },
  { name: 'Miami', latitude: 25.768, longitude: -80.132, country: 'United States' },
  { name: 'Seattle', latitude: 47.602, longitude: -122.339, country: 'United States' },
  { name: 'New York (The Battery)', latitude: 40.700, longitude: -74.014, country: 'United States' },

  // Other
  { name: 'Sydney', latitude: -33.856, longitude: 151.226, country: 'Australia' },
  { name: 'Tokyo', latitude: 35.652, longitude: 139.770, country: 'Japan' },
  { name: 'Lisbon', latitude: 38.708, longitude: -9.133, country: 'Portugal' },
  { name: 'Cape Town', latitude: -33.904, longitude: 18.437, country: 'South Africa' },
]
