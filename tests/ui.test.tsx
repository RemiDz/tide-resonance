import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { installLocalStationApi } from './local-api'
after(installLocalStationApi())
import { JSDOM } from 'jsdom'
import { act, createElement, useEffect } from 'react'
import type { Root } from 'react-dom/client'
import type { GeoLocation, TidalState, TideStation } from '../src/types/tidal'
import { DEFAULT_SETTINGS } from '../src/lib/settings'
import { useTidalState } from '../src/hooks/useTidalState'
import { useSettings } from '../src/hooks/useSettings'
import { useAudioDrone } from '../src/hooks/useAudioDrone'
import { useTideNotifications } from '../src/hooks/useTideNotifications'
import { createOceanDrone } from '../src/lib/ocean-audio'
import { BottomSheet } from '../src/components/BottomSheet/BottomSheet'
import { TideOutlook } from '../src/components/Observatory/TideOutlook'
import { getStation, computeTidalState } from '../src/lib/tideEngine'

let dom: JSDOM, createRoot: typeof import('react-dom/client').createRoot
before(async () => {
  dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://tidara.test', pretendToBeVisual: true })
  Object.defineProperties(globalThis, {
    self: { value: dom.window, configurable: true },
    window: { value: dom.window, configurable: true },
    document: { value: dom.window.document, configurable: true },
    navigator: { value: dom.window.navigator, configurable: true },
    localStorage: { value: dom.window.localStorage, configurable: true },
    HTMLElement: { value: dom.window.HTMLElement, configurable: true },
    IS_REACT_ACT_ENVIRONMENT: { value: true, configurable: true },
  })
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; (this.querySelector('button,input') as HTMLElement)?.focus() }
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false }
  createRoot = (await import('react-dom/client')).createRoot
})
after(() => dom.window.close())
async function mount(element: React.ReactNode) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => { root.render(element) })
  return { root, container, async cleanup() { await act(async () => root.unmount()); container.remove() } }
}
async function render(root: Root, element: React.ReactNode) { await act(async () => root.render(element)) }
async function settle(predicate: () => boolean) {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)) })
  }
  assert.ok(predicate(), 'UI did not reach the expected state')
}
function deferred<T>() {
  let resolve!: (result: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}
const baseStation: TideStation = { id: 'a', name: 'Coast A', latitude: 51, longitude: 0, timezone: 'Europe/London', country: 'GB', continent: 'Europe', type: 'reference', datum: 'LAT', source: 'Fixture', sourceUrl: 'https://example.com' }
function fakeState(station = baseStation): TidalState {
  const now = new Date('2026-09-11T12:00:00Z')
  return { station, distanceKm: 0, currentHeight: 2, currentPhase: 'RISING', phaseProgress: 0.5, rateOfChange: 0.1,
    previousHigh: null, previousLow: null, nextHigh: { type: 'high', height: 3, time: new Date(+now + 3600000) }, nextLow: { type: 'low', height: 1, time: new Date(+now + 7 * 3600000) },
    extremes24h: [], timeline24h: [], computedAt: now, dayStart: new Date('2026-09-10T23:00:00Z'), dayEnd: new Date('2026-09-11T23:00:00Z') }
}

test('an older tide request cannot overwrite a newer station selection', async t => {
  const a = deferred<TidalState>(), b = deferred<TidalState>()
  const coastB = { ...baseStation, id: 'b', name: 'Coast B' }
  const services = {
    findNearestStation: async () => ({ station: baseStation, distanceKm: 0 }),
    getStation: async (id: string) => id === 'a' ? baseStation : coastB,
    computeTidalState: async (station: TideStation) => station.id === 'a' ? a.promise : b.promise,
  }
  function Harness({ location }: { location: GeoLocation }) {
    const result = useTidalState(location, services)
    return <output>{result.tidalState?.station.id ?? (result.error || 'loading')}</output>
  }
  const view = await mount(<Harness location={{ latitude: 51, longitude: 0, source: 'manual', stationId: 'a' }}/>)
  t.after(view.cleanup)
  await render(view.root, <Harness location={{ latitude: 51, longitude: 0, source: 'manual', stationId: 'b' }}/>)
  await act(async () => b.resolve(fakeState(coastB)))
  assert.equal(view.container.textContent, 'b')
  await act(async () => a.resolve(fakeState()))
  assert.equal(view.container.textContent, 'b')
})

test('settings hydrate saved values and remain usable with blocked persistence', async t => {
  localStorage.setItem('tr-settings', JSON.stringify({ units: 'feet', droneVolume: 200 }))
  let current: ReturnType<typeof useSettings> | undefined
  function Harness() { const result = useSettings(); useEffect(() => { current = result }, [result]); return <output>{result.settings.units}</output> }
  const view = await mount(<Harness/>)
  t.after(() => { localStorage.clear(); return view.cleanup() })
  assert.equal(view.container.textContent, 'feet')
  assert.equal(current!.settings.droneVolume, 100)
  const original = dom.window.Storage.prototype.setItem
  dom.window.Storage.prototype.setItem = () => { throw new Error('Quota exceeded') }
  try {
    await act(async () => current!.updateSetting('units', 'metres'))
    assert.equal(view.container.textContent, 'metres')
  } finally { dom.window.Storage.prototype.setItem = original }
})

test('preferences dialog closes on Escape, restores focus and releases scroll lock', async t => {
  const trigger = document.createElement('button'); trigger.textContent = 'Open'; document.body.append(trigger); trigger.focus()
  let closed = 0
  const view = await mount(<BottomSheet open onClose={() => { closed++ }}><button>Close</button></BottomSheet>)
  t.after(async () => { await view.cleanup(); trigger.remove() })
  const dialog = view.container.querySelector('dialog')!
  assert.equal(dialog.open, true)
  assert.equal(document.body.style.overflow, 'hidden')
  await act(async () => { dialog.dispatchEvent(new dom.window.Event('cancel', { bubbles: false, cancelable: true })) })
  assert.equal(closed, 1)
  await render(view.root, <BottomSheet open={false} onClose={() => { closed++ }}><button>Close</button></BottomSheet>)
  assert.equal(dialog.open, false)
  assert.equal(document.body.style.overflow, '')
  assert.ok(document.activeElement === trigger, 'Dialog should restore focus to its opener')
})

test('forecast day selection and unit changes update the displayed tide data', async t => {
  const station = await getStation('noaa/8518750')
  const state = await computeTidalState(station, 0, new Date('2026-09-11T12:00:00Z'))
  const view = await mount(<TideOutlook state={state} settings={DEFAULT_SETTINGS}/>)
  t.after(view.cleanup)
  await settle(() => view.container.querySelectorAll('button.td-day').length === 7)
  const day = view.container.querySelectorAll<HTMLButtonElement>('button.td-day')[1]
  await act(async () => day.click())
  assert.equal(day.getAttribute('aria-pressed'), 'true')
  assert.match(view.container.querySelector('.td-panel-heading')!.textContent!, /12 Sept/)
  await render(view.root, <TideOutlook state={state} settings={{ ...DEFAULT_SETTINGS, units: 'feet', timeFormat: '12h' }}/>)
  assert.match(view.container.querySelector('.td-turn-height')!.textContent!, /ft/)
  assert.match(view.container.querySelector('.td-turn strong')!.textContent!, /am|pm/i)
  assert.ok(view.container.querySelector('input[aria-label="Explore the predicted tide by time"]'))
})

class Param {
  value = 0
  cancelScheduledValues() {}
  setValueAtTime(value: number) { this.value = value }
  linearRampToValueAtTime(value: number) { this.value = value }
}
class AudioNodeMock {
  connections: unknown[] = []
  gain = new Param(); frequency = new Param(); pan = new Param(); Q = new Param()
  type = ''; loop = false; buffer: unknown; starts = 0; stops = 0
  connect(target: unknown) { this.connections.push(target); return target }
  disconnect() { this.connections = [] }
  start() { this.starts++ }
  stop() { this.stops++ }
}
class AudioContextMock {
  currentTime = 0; sampleRate = 64; state = 'suspended'; onstatechange: (() => void) | null = null
  destination = new AudioNodeMock(); nodes: AudioNodeMock[] = []; resumeCalls = 0; closed = 0
  node() { const node = new AudioNodeMock(); this.nodes.push(node); return node }
  createGain() { return this.node() }
  createOscillator() { return this.node() }
  createStereoPanner() { return this.node() }
  createBufferSource() { return this.node() }
  createBiquadFilter() { return this.node() }
  createBuffer(channels: number, length: number) { return { getChannelData: () => new Float32Array(length) } }
  async resume() { this.resumeCalls++; this.state = 'running'; this.onstatechange?.() }
  async close() { this.closed++; this.state = 'closed'; this.onstatechange?.() }
}

test('volume zero stays silent even when the modulation oscillator is active', () => {
  const context = new AudioContextMock()
  const graph = createOceanDrone(context as unknown as AudioContext)
  graph.update({ ...DEFAULT_SETTINGS, droneVolume: 80 }, fakeState())
  assert.ok(graph.master.gain.value > 0)
  graph.update({ ...DEFAULT_SETTINGS, droneVolume: 0 }, fakeState())
  assert.equal(graph.master.gain.value, 0)
  assert.ok(context.nodes.every(node => !node.connections.includes(graph.master.gain)), 'No modulator may bypass the final volume control')
  assert.ok(context.nodes.some(node => node.connections.includes(graph.modulation.gain)))
  graph.dispose(); graph.dispose()
  assert.equal(context.closed, 1)
  assert.ok(context.nodes.filter(node => node.starts > 0).every(node => node.stops === 1))
})

test('audio waits for play, resumes from the gesture and cleans up on unmount', async () => {
  const contexts: AudioContextMock[] = []
  class Context extends AudioContextMock { constructor() { super(); contexts.push(this) } }
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: Context })
  let current: ReturnType<typeof useAudioDrone> | undefined
  function Harness() { const result = useAudioDrone({ ...DEFAULT_SETTINGS, droneEnabled: true }, null); useEffect(() => { current = result }, [result]); return <output>{String(result.isPlaying)}</output> }
  const view = await mount(<Harness/>)
  try {
    assert.equal(contexts.length, 0)
    await act(async () => { await current!.start() })
    assert.equal(contexts[0].resumeCalls, 1)
    assert.equal(view.container.textContent, 'true')
  } finally { await view.cleanup() }
  assert.equal(contexts[0].closed, 1)
})

test('notification permission is requested only by an explicit action', async t => {
  let requests = 0
  class NotificationMock {
    static permission = 'default'
    static async requestPermission() { requests++; return 'granted' }
  }
  Object.defineProperty(globalThis, 'Notification', { configurable: true, value: NotificationMock })
  let current: ReturnType<typeof useTideNotifications> | undefined
  function Harness() { const result = useTideNotifications({ ...DEFAULT_SETTINGS, alertsEnabled: true }, null); useEffect(() => { current = result }, [result]); return <output>{result.permissionState}</output> }
  const view = await mount(<Harness/>)
  t.after(async () => { await view.cleanup(); Reflect.deleteProperty(globalThis, 'Notification') })
  assert.equal(requests, 0)
  await act(async () => { await current!.requestPermission() })
  assert.equal(requests, 1)
  assert.equal(view.container.textContent, 'granted')
})

test('notification timers survive minute refreshes and deliver a turn only once', async t => {
  const base = new Date('2026-09-11T12:00:00Z')
  const deliveries: string[] = []
  class NotificationMock {
    static permission = 'granted'
    constructor(title: string) { deliveries.push(title) }
  }
  Object.defineProperty(globalThis, 'Notification', { configurable: true, value: NotificationMock })
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: base })
  const state = { ...fakeState(), nextHigh: { type: 'high' as const, height: 3, time: new Date(+base + 15 * 60000 + 100) }, nextLow: null }
  function Harness({ state }: { state: TidalState }) { useTideNotifications({ ...DEFAULT_SETTINGS, alertsEnabled: true, alertTiming: 15 }, state); return null }
  const view = await mount(<Harness state={state}/>)
  t.after(async () => { await view.cleanup(); t.mock.timers.reset(); Reflect.deleteProperty(globalThis, 'Notification') })
  await render(view.root, <Harness state={{ ...state }}/>)
  await act(async () => { t.mock.timers.tick(101) })
  assert.equal(deliveries.length, 1)
  await render(view.root, <Harness state={{ ...state }}/>)
  await act(async () => { t.mock.timers.tick(1000) })
  assert.equal(deliveries.length, 1)
})

test('home page boots without storage, exposes preferences, and never requests location automatically', async t => {
  const { default: Page } = await import('../src/app/page')
  let locationRequests = 0
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition() { locationRequests++ } } })
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Blocked') } })
  const view = await mount(createElement(Page))
  t.after(async () => {
    await view.cleanup()
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: dom.window.localStorage })
  })
  assert.match(view.container.textContent!, /Let the tideset the pace/)
  await settle(() => view.container.querySelector('.td-height') !== null)
  assert.equal(locationRequests, 0)
  const open = view.container.querySelector<HTMLButtonElement>('button[aria-label="Open preferences"]')!
  await act(async () => open.click())
  assert.equal(view.container.querySelector('dialog')?.open, true)
  const feet = [...view.container.querySelectorAll('dialog button')].find(button => button.textContent === 'Feet') as HTMLButtonElement
  await act(async () => feet.click())
  assert.match(view.container.querySelector('.td-height')!.textContent!, /ft/)
})
