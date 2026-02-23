'use client'

import type { TidalState } from '@/types/tidal'
import { buildTidalNarrative } from '@/lib/tidal-narrative'

interface HeaderProps {
  tidalState: TidalState
}

export function Header({ tidalState }: HeaderProps) {
  const narrative = buildTidalNarrative(tidalState)

  return (
    <header className="relative z-10 pt-10 pb-2 px-5">
      {/* Station name — tappable placeholder for station picker */}
      <button
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'block',
        }}
      >
        <p
          style={{
            fontSize: '0.9375rem',
            fontWeight: 300,
            color: 'var(--text-secondary)',
          }}
        >
          {'\u224B'} {tidalState.station.name}
        </p>
      </button>

      {/* Warm tidal sentence */}
      <p
        style={{
          fontSize: '0.8125rem',
          fontWeight: 300,
          color: 'var(--text-muted)',
          marginTop: 4,
          transition: 'color 2.5s ease-out',
        }}
      >
        {narrative}
      </p>
    </header>
  )
}
