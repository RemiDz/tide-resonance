import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GET } from '../src/app/api/stations/route'
import { curatedStations } from '../src/data/stations'
import { stationClient } from '../src/lib/station-client'

test('station endpoint validates inputs and never sends the whole catalogue', async () => {
  for (const query of ['', 'lat=NaN&lon=0', 'lat=91&lon=0', 'lat=&lon=0', 'q=a', 'q=whitby&limit=500', 'id=']) {
    const response = await GET(new Request('https://tidara.test/api/stations?' + query))
    assert.equal(response.status, 400, query)
  }
  const unknown = await GET(new Request('https://tidara.test/api/stations?id=not-real'))
  assert.equal(unknown.status, 404)
  const response = await GET(new Request('https://tidara.test/api/stations?q=Whitby&limit=3'))
  const text = await response.text()
  const stations = JSON.parse(text)
  assert.ok(stations.length > 0 && stations.length <= 3)
  assert.ok(stations.every((station: Record<string, unknown>) => !('harmonic_constituents' in station)))
  assert.ok(text.length < 10000)
})

test('all featured coast shortcuts resolve to a station within 50 km', async () => {
  for (const coast of curatedStations) {
    const response = await GET(new Request('https://tidara.test/api/stations?lat=' + coast.latitude + '&lon=' + coast.longitude + '&distance=50&limit=1'))
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.length, 1, coast.name)
    assert.ok(result[0].distanceKm <= 50, coast.name)
  }
})

test('secondary station response carries its own offsets and parent harmonics', async () => {
  const response = await GET(new Request('https://tidara.test/api/stations?id=noaa%2F1610367'))
  const data = await response.json()
  assert.equal(data.station.id, 'noaa/1610367')
  assert.equal(data.reference.id, data.station.offsets.reference)
  assert.ok(data.reference.harmonic_constituents.length > 0)
  assert.match(response.headers.get('Cache-Control')!, /max-age=3600/)
})

test('failed station downloads can be retried and successful downloads are cached', async () => {
  const original = globalThis.fetch
  let requests = 0
  globalThis.fetch = async () => {
    requests++
    if (requests === 1) throw new TypeError('Network offline')
    return Response.json([{ id: 'test' }])
  }
  try {
    await assert.rejects(stationClient.search('retry-fixture', 1), /Connect to the internet/)
    const response = await stationClient.search('retry-fixture', 1)
    assert.equal(response[0].id, 'test')
    await stationClient.search('retry-fixture', 1)
    assert.equal(requests, 2)
  } finally { globalThis.fetch = original }
})
