import { after, test } from 'node:test'
import { installLocalStationApi } from './local-api'
after(installLocalStationApi())
import assert from 'node:assert/strict'
import fixture from './noaa-reference.json'
import { getStation, getExtremes, getCurrentHeight, getTimeline, computeTidalState, findNearestStation, interpolateSecondaryHeight } from '../src/lib/tideEngine'
import { stationDateKey, stationDayBounds, formatHeight, formatTideTime } from '../src/lib/tide-time'
import { getWeekForecast } from '../src/lib/tide-forecast'
import { sanitizeSettings, sanitizeLocation, DEFAULT_SETTINGS, readStored, storeValue } from '../src/lib/settings'

for (const source of fixture.stations) test('NOAA independent reference: ' + source.id, async () => {
  const start = new Date('2026-09-11T00:00:00Z'), end = new Date('2026-09-14T00:00:00Z')
  const tides = await getExtremes('noaa/' + source.id, start, end)
  assert.equal(tides.length, source.predictions.length)
  for (let i = 0; i < tides.length; i++) {
    const actual = tides[i], reference = source.predictions[i]
    const time = new Date(reference.t.replace(' ', 'T') + ':00Z')
    assert.equal(actual.type, reference.type === 'H' ? 'high' : 'low')
    assert.ok(Math.abs(+actual.time - +time) < 5 * 60000, source.id + ' turn time differs by over 5 minutes')
    assert.ok(Math.abs(actual.height - Number(reference.v)) < 0.06, source.id + ' height differs by over 6 cm')
  }
})

test('station-local days cover DST transitions and fractional UTC offsets', () => {
  for (const [iso, zone, hours, start] of [
    ['2026-03-29T12:00:00Z', 'Europe/London', 23, '2026-03-29T00:00:00.000Z'],
    ['2026-10-25T12:00:00Z', 'Europe/London', 25, '2026-10-24T23:00:00.000Z'],
    ['2026-03-08T12:00:00Z', 'America/New_York', 23, '2026-03-08T05:00:00.000Z'],
    ['2026-11-01T12:00:00Z', 'America/New_York', 25, '2026-11-01T04:00:00.000Z'],
    ['2026-09-11T12:00:00Z', 'Asia/Kolkata', 24, '2026-09-10T18:30:00.000Z'],
    ['2026-09-11T12:00:00Z', 'Pacific/Chatham', 24, '2026-09-11T11:15:00.000Z'],
  ] as const) {
    const bounds = stationDayBounds(new Date(iso), zone)
    assert.equal((+bounds.end - +bounds.start) / 3600000, hours)
    assert.equal(bounds.start.toISOString(), start)
    assert.equal(stationDateKey(bounds.start, zone), bounds.key)
    assert.equal(stationDateKey(new Date(+bounds.end - 1), zone), bounds.key)
  }
  assert.equal(stationDayBounds(new Date('2026-12-31T23:30:00Z'), 'UTC', 1).key, '2027-01-01')
})

test('formatting honors the chosen units and station clock', () => {
  assert.equal(formatHeight(0.3048, 'feet'), '1.00 ft')
  assert.equal(formatHeight(-0.21, 'metres'), '-0.21 m')
  const now = new Date('2026-09-11T16:20:00Z')
  assert.equal(formatTideTime(now, 'America/New_York', '24h'), '12:20')
  assert.match(formatTideTime(now, 'Europe/London', '12h'), /05:20 pm/i)
})

test('invalid saved preferences and unavailable storage never break startup', () => {
  assert.deepEqual(sanitizeSettings(null), DEFAULT_SETTINGS)
  const invalid = sanitizeSettings({ units: 'yards', timeFormat: 'bad', droneVolume: Infinity, droneFrequency: 99, alertsEnabled: 'true', alertTiming: 9 })
  assert.deepEqual(invalid, DEFAULT_SETTINGS)
  assert.equal(sanitizeSettings({ droneVolume: -10 }).droneVolume, 0)
  assert.equal(sanitizeSettings({ droneVolume: 1000 }).droneVolume, 100)
  assert.equal(sanitizeLocation({ latitude: NaN, longitude: 20 }), null)
  assert.equal(sanitizeLocation({ latitude: 91, longitude: 20 }), null)
  assert.equal(sanitizeLocation({ latitude: 20, longitude: -181 }), null)
  assert.equal(sanitizeLocation({ latitude: 54, longitude: 0, stationId: 'noaa/8518750' })?.stationId, 'noaa/8518750')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked') } })
  assert.equal(readStored('tr-settings'), null)
  assert.doesNotThrow(() => storeValue('tr-settings', DEFAULT_SETTINGS))
  Reflect.deleteProperty(globalThis, 'localStorage')
})

test('secondary station curves meet corrected high and low predictions', async () => {
  const id = 'noaa/1610367'
  const turns = await getExtremes(id, new Date('2026-09-11T00:00:00Z'), new Date('2026-09-12T00:00:00Z'))
  for (const turn of turns) assert.ok(Math.abs(await getCurrentHeight(id, turn.time) - turn.height) < 0.001)
  for (let i = 1; i < turns.length; i++) {
    const previous = turns[i - 1], next = turns[i], midpoint = new Date((+previous.time + +next.time) / 2)
    const height = await getCurrentHeight(id, midpoint)
    assert.ok(Math.abs(height - (previous.height + next.height) / 2) < 0.001)
  }
  assert.throws(() => interpolateSecondaryHeight(turns, new Date('2020-01-01')), /surrounding/)
})

test('exact station selection, next turns and end-to-end forecast stay consistent', async () => {
  const station = await getStation('noaa/8518750')
  const now = new Date('2026-09-11T12:00:00Z')
  const state = await computeTidalState(station, 0, now)
  assert.equal(state.station.id, station.id)
  assert.equal(state.station.datum, 'MLLW')
  assert.ok(state.nextHigh && +state.nextHigh.time > +now)
  assert.ok(state.nextLow && +state.nextLow.time > +now)
  assert.ok(state.phaseProgress >= 0 && state.phaseProgress <= 1)
  assert.equal(+state.timeline24h[0].time, +state.dayStart)
  assert.equal(+state.timeline24h.at(-1)!.time, +state.dayEnd)
  const week = await getWeekForecast(station, new Date('2026-10-31T12:00:00Z'))
  assert.equal(week.length, 7)
  assert.equal(new Set(week.map(day => day.key)).size, 7)
  assert.equal((+week[1].end - +week[1].start) / 3600000, 25)
  for (const day of week) for (const turn of day.extremes) assert.equal(stationDateKey(turn.time, station.timezone), day.key)
})

test('forecast rejects invalid inputs instead of hanging or returning nonsense', async () => {
  await assert.rejects(findNearestStation(NaN, 0), /Invalid location/)
  await assert.rejects(getStation('does-not-exist'), /unavailable/)
  const start = new Date('2026-09-11T00:00:00Z'), end = new Date('2026-09-12T00:00:00Z')
  await assert.rejects(getTimeline('noaa/8518750', start, end, 0), /Invalid forecast interval/)
  await assert.rejects(getTimeline('noaa/8518750', end, start), /Invalid forecast dates/)
  await assert.rejects(getCurrentHeight('noaa/8518750', new Date('invalid')), /Invalid forecast time/)
})

test('content studio curve uses actual station-local bounds and handles flat water', async () => {
  const { mapToSVG, getNowPosition } = await import('../src/components/TidalCurve/curveUtils')
  const view = { width: 800, height: 240 }, padding = { left: 16, right: 16, top: 36, bottom: 36 }
  const bounds = stationDayBounds(new Date('2026-11-01T12:00:00Z'), 'America/New_York')
  const points = [{ time: bounds.start, height: 2 }, { time: bounds.end, height: 2 }]
  const mapped = mapToSVG(points, view, padding)
  assert.equal(mapped[0].x, 16)
  assert.equal(mapped[1].x, 784)
  assert.ok(Math.abs(mapped[0].y - 120) < 1e-9)
  assert.equal(getNowPosition(points, mapped, new Date(+bounds.start - 1)), null)
  assert.ok(Number.isFinite(getNowPosition(points, mapped, new Date((+bounds.start + +bounds.end) / 2))!.x))
})
