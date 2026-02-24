'use client'

import type { SkyState } from '@/lib/sky-utils'
import type { TidalPhase } from '@/types/tidal'

interface SkyLayerProps {
  skyState: SkyState
  currentPhase: TidalPhase
}

function PhaseIndicator({ phase }: { phase: TidalPhase }) {
  const isRising = phase === 'RISING'
  const isFalling = phase === 'FALLING'
  const isSlack = phase === 'HIGH_SLACK' || phase === 'LOW_SLACK'

  if (isSlack) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          opacity: 0.3,
        }}
      >
        <div
          style={{
            width: 12,
            height: 1,
            background: 'rgba(255, 255, 255, 0.5)',
          }}
        />
        <div
          style={{
            width: 12,
            height: 1,
            background: 'rgba(255, 255, 255, 0.5)',
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          width="16"
          height="8"
          viewBox="0 0 16 8"
          style={{
            opacity: 0,
            animation: 'chevronPulse 2.5s ease-in-out infinite',
            animationDelay: isRising
              ? `${(2 - i) * 0.3}s`
              : `${i * 0.3}s`,
          }}
        >
          <path
            d={isRising ? 'M2 6 L8 2 L14 6' : 'M2 2 L8 6 L14 2'}
            stroke={isFalling ? 'rgba(121, 134, 203, 0.6)' : 'rgba(79, 195, 247, 0.6)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ))}
    </div>
  )
}

export function SkyLayer({ skyState, currentPhase }: SkyLayerProps) {
  const [g0, g1, g2] = skyState.skyGradient
  const showMoon = skyState.moonAltitude > 0

  // Moon crescent offset: 0 = new moon (fully shadowed), 0.5 = full (no shadow)
  const moonOffset = Math.cos(skyState.moonPhase * 2 * Math.PI)

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

      {/* Phase direction indicator — animated chevrons */}
      <div
        style={{
          position: 'absolute',
          top: '14%',
          left: '10%',
        }}
      >
        <PhaseIndicator phase={currentPhase} />
      </div>
    </>
  )
}
