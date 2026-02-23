'use client'

import { useEffect, useState } from 'react'
import type { TidalState } from '@/types/tidal'
import type { TideStation } from '@/types/tidal'

// Verification page — temporary, replaced by real UI in Phase 2

interface SearchResult {
  stations: TideStation[]
}

export default function VerificationPage() {
  const [tidalState, setTidalState] = useState<TidalState | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [nearestResult, setNearestResult] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function verify() {
      try {
        setLoading(true)

        const {
          findNearestStation,
          searchStations,
          computeTidalState,
        } = await import('@/lib/tideEngine')

        // 1. Test: Find nearest station to Whitby (54.486, -0.615)
        console.log('--- TIDE RESONANCE DATA VERIFICATION ---')
        console.log('Testing with Whitby coordinates: 54.486, -0.615')

        const nearest = await findNearestStation(54.486, -0.615)
        if (!nearest) {
          setError('No station found near Whitby')
          return
        }

        console.log('Nearest station:', nearest.station.name)
        console.log('Distance:', nearest.distanceKm.toFixed(1), 'km')
        setNearestResult(
          `${nearest.station.name} (${nearest.distanceKm.toFixed(1)} km)`
        )

        // 2. Compute full tidal state
        const state = await computeTidalState(
          nearest.station,
          nearest.distanceKm
        )
        console.log('Tidal state:', state)
        setTidalState(state)

        // 3. Test station search
        const liverpool = await searchStations('Liverpool')
        const london = await searchStations('London')
        console.log('Search "Liverpool":', liverpool.map((s) => s.name))
        console.log('Search "London":', london.map((s) => s.name))
        setSearchResults({
          stations: [...liverpool.slice(0, 3), ...london.slice(0, 3)],
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('Verification error:', msg)
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 32, fontFamily: 'monospace', color: '#ccc', background: '#111', minHeight: '100vh' }}>
        <h1>Tide Resonance — Data Verification</h1>
        <p>Loading tidal predictions for Whitby...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 32, fontFamily: 'monospace', color: '#f66', background: '#111', minHeight: '100vh' }}>
        <h1>Tide Resonance — Error</h1>
        <pre>{error}</pre>
      </div>
    )
  }

  return (
    <div style={{ padding: 32, fontFamily: 'monospace', color: '#ccc', background: '#111', minHeight: '100vh', fontSize: 13 }}>
      <h1 style={{ color: '#0ff', marginBottom: 24 }}>
        Tide Resonance — Data Verification
      </h1>

      <Section title="Nearest Station">
        <p>{nearestResult}</p>
      </Section>

      {tidalState && (
        <>
          <Section title="Station">
            <pre>{JSON.stringify(tidalState.station, null, 2)}</pre>
          </Section>

          <Section title="Current State">
            <Row label="Height" value={`${tidalState.currentHeight.toFixed(3)} m`} />
            <Row label="Phase" value={tidalState.currentPhase} />
            <Row label="Phase progress" value={`${(tidalState.phaseProgress * 100).toFixed(1)}%`} />
            <Row label="Rate of change" value={`${tidalState.rateOfChange.toFixed(3)} m/hr`} />
          </Section>

          <Section title="Next Extremes">
            <Row
              label="Next High"
              value={
                tidalState.nextHigh
                  ? `${tidalState.nextHigh.height.toFixed(3)} m @ ${tidalState.nextHigh.time.toLocaleTimeString()}`
                  : 'N/A'
              }
            />
            <Row
              label="Next Low"
              value={
                tidalState.nextLow
                  ? `${tidalState.nextLow.height.toFixed(3)} m @ ${tidalState.nextLow.time.toLocaleTimeString()}`
                  : 'N/A'
              }
            />
            <Row
              label="Prev High"
              value={
                tidalState.previousHigh
                  ? `${tidalState.previousHigh.height.toFixed(3)} m @ ${tidalState.previousHigh.time.toLocaleTimeString()}`
                  : 'N/A'
              }
            />
            <Row
              label="Prev Low"
              value={
                tidalState.previousLow
                  ? `${tidalState.previousLow.height.toFixed(3)} m @ ${tidalState.previousLow.time.toLocaleTimeString()}`
                  : 'N/A'
              }
            />
          </Section>

          <Section title={`Today's Extremes (${tidalState.extremes24h.length})`}>
            {tidalState.extremes24h.map((e, i) => (
              <Row
                key={i}
                label={e.type.toUpperCase()}
                value={`${e.height.toFixed(3)} m @ ${e.time.toLocaleTimeString()}`}
              />
            ))}
          </Section>

          <Section title={`24h Timeline (${tidalState.timeline24h.length} points)`}>
            <p style={{ color: '#888' }}>
              First: {tidalState.timeline24h[0]?.height.toFixed(3)} m @{' '}
              {tidalState.timeline24h[0]?.time.toLocaleTimeString()}
            </p>
            <p style={{ color: '#888' }}>
              Last: {tidalState.timeline24h[tidalState.timeline24h.length - 1]?.height.toFixed(3)} m @{' '}
              {tidalState.timeline24h[tidalState.timeline24h.length - 1]?.time.toLocaleTimeString()}
            </p>
          </Section>
        </>
      )}

      {searchResults && (
        <Section title="Station Search Test">
          {searchResults.stations.map((s, i) => (
            <Row key={i} label={s.country} value={s.name} />
          ))}
        </Section>
      )}

      <Section title="Raw JSON (scroll)">
        <pre style={{ maxHeight: 400, overflow: 'auto', fontSize: 11 }}>
          {JSON.stringify(tidalState, null, 2)}
        </pre>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ color: '#0aa', fontSize: 15, marginBottom: 8, borderBottom: '1px solid #333', paddingBottom: 4 }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p style={{ margin: '2px 0' }}>
      <span style={{ color: '#888', width: 140, display: 'inline-block' }}>{label}:</span>
      <span style={{ color: '#eee' }}>{value}</span>
    </p>
  )
}
