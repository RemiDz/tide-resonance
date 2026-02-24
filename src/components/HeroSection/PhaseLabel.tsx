'use client'

interface PhaseLabelProps {
  phaseLabel: string
  stationName: string
  onStationTap?: () => void
}

export function PhaseLabel({ phaseLabel, stationName, onStationTap }: PhaseLabelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      {/* Dark gradient scrim for text legibility */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to top, rgba(5,8,16,0.7) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          paddingBottom: 8,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '-0.01em',
          }}
        >
          {phaseLabel}
        </div>

        {/* Station name */}
        <div>
          <button
            onClick={onStationTap}
            style={{
              marginTop: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              padding: '4px 8px',
              borderRadius: 8,
            }}
          >
            {stationName}
          </button>
        </div>
      </div>
    </div>
  )
}
