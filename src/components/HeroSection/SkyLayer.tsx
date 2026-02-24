'use client'

import { useEffect, useState } from 'react'
import type { SkyState } from '@/lib/sky-utils'
import type { TidalPhase } from '@/types/tidal'

interface SkyLayerProps {
  skyState: SkyState
  currentPhase: TidalPhase
}

export function SkyLayer({ skyState, currentPhase }: SkyLayerProps) {
  const [g0, g1, g2] = skyState.skyGradient
  const showMoon = skyState.moonAltitude > 0

  // Moon crescent offset: 0 = new moon (fully shadowed), 0.5 = full (no shadow)
  const moonOffset = Math.cos(skyState.moonPhase * 2 * Math.PI)

  const isRising = currentPhase === 'RISING'
  const isFalling = currentPhase === 'FALLING'
  const showChevron = isRising || isFalling

  // Pulse animation for rising chevron
  const [chevronOpacity, setChevronOpacity] = useState(0.5)
  useEffect(() => {
    if (!isRising) return
    const id = setInterval(() => {
      setChevronOpacity((prev) => (prev === 0.5 ? 0.3 : 0.5))
    }, 2000)
    return () => clearInterval(id)
  }, [isRising])

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

      {/* Moon — only when above horizon */}
      {showMoon && (
        <svg
          width="8"
          height="8"
          viewBox="0 0 16 16"
          style={{
            position: 'absolute',
            top: '12%',
            right: '15%',
            opacity: 0.4,
            filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.3))',
          }}
        >
          <defs>
            <clipPath id="moon-clip">
              <circle cx="8" cy="8" r="7" />
            </clipPath>
          </defs>
          {/* Lit side */}
          <circle cx="8" cy="8" r="7" fill="rgba(255,255,255,0.9)" clipPath="url(#moon-clip)" />
          {/* Shadow circle offset by phase */}
          <circle
            cx={8 + moonOffset * 7}
            cy="8"
            r="7"
            fill="rgba(3,6,16,0.95)"
            clipPath="url(#moon-clip)"
          />
        </svg>
      )}

      {/* Phase direction chevron */}
      {showChevron && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          style={{
            position: 'absolute',
            top: '14%',
            left: '10%',
            opacity: isRising ? chevronOpacity : 0.5,
            transition: 'opacity 1s ease',
          }}
        >
          {isRising ? (
            <polyline
              points="3,10 7,4 11,10"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <polyline
              points="3,4 7,10 11,4"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}
    </>
  )
}
