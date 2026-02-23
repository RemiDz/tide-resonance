'use client'

export function AboutCard() {
  return (
    <div
      className="glass-card glass-card--subtle"
      style={{ '--phase-color': '#4fc3f7' } as React.CSSProperties}
    >
      {/* Section label */}
      <p className="text-label mb-5" style={{ color: 'var(--text-muted)' }}>
        About Tidal Sound Healing
      </p>

      <div className="space-y-4">
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
          }}
        >
          The ocean's tidal rhythm is one of Earth's most ancient cycles,
          governed by the gravitational pull of the moon and sun.
        </p>

        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
          }}
        >
          For thousands of years, coastal communities have recognised the tide's
          influence on the body and mind. Modern research confirms that natural
          rhythmic patterns support nervous system regulation through a process
          called entrainment.
        </p>

        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
          }}
        >
          By synchronising breath and sound with the tidal rhythm, practitioners
          can create a session that feels connected to something larger than the
          room — because it genuinely is.
        </p>

        {/* Data source note */}
        <div
          className="pt-4 mt-2"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 300,
              color: 'var(--text-muted)',
              lineHeight: 1.7,
            }}
          >
            Data: Client-side harmonic analysis from 6,300+ global tidal
            stations. No internet required after initial load.
          </p>
        </div>
      </div>
    </div>
  )
}
