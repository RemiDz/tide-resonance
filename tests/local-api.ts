import { GET } from '../src/app/api/stations/route'

// Exercise the real local endpoint without external network requests.
export function installLocalStationApi() {
  const original = globalThis.fetch
  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    if (url.startsWith('/api/stations?')) return GET(new Request('https://tidara.test' + url, init))
    return original(input, init)
  }
  return () => { globalThis.fetch = original }
}
