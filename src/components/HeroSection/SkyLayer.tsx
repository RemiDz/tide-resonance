'use client'

import type { SkyState } from '@/lib/sky-utils'

interface SkyLayerProps {
  skyState: SkyState
}

export function SkyLayer({ skyState }: SkyLayerProps) {
  const [g0, g1, g2] = skyState.skyGradient

  return (
    <>
      {/* Sky gradient — time-of-day aware */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${g0} 0%, ${g1} 50%, ${g2} 100%)`,
          transition: 'background 10s ease',
        }}
      />

      {/* Faint stars */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 45% 12%, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 72% 28%, rgba(255,255,255,0.25), transparent),
            radial-gradient(1px 1px at 88% 8%, rgba(255,255,255,0.15), transparent),
            radial-gradient(1px 1px at 30% 35%, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 60% 5%, rgba(255,255,255,0.18), transparent),
            radial-gradient(1px 1px at 8% 10%, rgba(255,255,255,0.22), transparent)
          `,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
