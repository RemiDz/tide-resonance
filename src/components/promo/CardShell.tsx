'use client'

import { useMemo } from 'react'
import { generateStarField } from '@/lib/promo-utils'

interface CardShellProps {
  children: React.ReactNode
  width: number
  height: number
  phaseColor: string
  cardNum: number
  totalCards: number
  tiktokSafe?: boolean
}

export function CardShell({
  children,
  width,
  height,
  phaseColor,
  cardNum,
  totalCards,
  tiktokSafe,
}: CardShellProps) {
  const stars = useMemo(() => generateStarField(60, 42 + cardNum), [cardNum])

  const pad = tiktokSafe ? { top: 45, bottom: 70 } : { top: 0, bottom: 0 }

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        background: 'linear-gradient(160deg, #050810 0%, #0a1628 35%, #0c1832 65%, #0a1628 100%)',
        border: `1px solid ${phaseColor}35`,
        borderRadius: 16,
        boxShadow: `0 4px 30px rgba(0,0,0,0.5), 0 0 40px ${phaseColor}15`,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        color: 'rgba(255,255,255,0.85)',
      }}
    >
      {/* Star field */}
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: 'white',
            opacity: s.opacity,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Accent stripe at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${phaseColor}, transparent)`,
        }}
      />

      {/* Phase colour glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          right: '10%',
          bottom: '40%',
          background: `radial-gradient(ellipse at 50% 40%, ${phaseColor}15, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Card number */}
      <div
        style={{
          position: 'absolute',
          top: pad.top + 16,
          right: 20,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.05em',
        }}
      >
        {cardNum}/{totalCards}
      </div>

      {/* Content area */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingTop: pad.top,
          paddingBottom: pad.bottom,
        }}
      >
        {children}
      </div>
    </div>
  )
}
