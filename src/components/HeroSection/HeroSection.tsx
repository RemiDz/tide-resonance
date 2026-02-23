'use client'

import { useMemo } from 'react'
import type { TidalState } from '@/types/tidal'
import { getPhaseColour, getPhaseLabel } from '@/lib/colour-utils'

interface HeroSectionProps {
  tidalState: TidalState
  onStationTap?: () => void
}

export function HeroSection({ tidalState, onStationTap }: HeroSectionProps) {
  const { currentPhase, currentHeight, extremes24h, station } = tidalState
  const phaseColour = getPhaseColour(currentPhase)
  const phaseLabel = getPhaseLabel(currentPhase)

  // Calculate water position: 0 = lowest, 1 = highest based on today's range
  const waterFraction = useMemo(() => {
    if (extremes24h.length === 0) return 0.5
    const heights = extremes24h.map((e) => e.height)
    const min = Math.min(...heights)
    const max = Math.max(...heights)
    const range = max - min
    if (range === 0) return 0.5
    return Math.max(0, Math.min(1, (currentHeight - min) / range))
  }, [currentHeight, extremes24h])

  // Water level: high = near top (~20%), low = near bottom (~85%)
  const waterY = 85 - waterFraction * 65

  return (
    <div style={{ padding: '24px 20px 0' }}>
      {/* Water Level Visual */}
      <div
        className="hero-water"
        style={{
          position: 'relative',
          height: 200,
          borderRadius: 20,
          overflow: 'hidden',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
        }}
      >
        {/* Water body */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: `${waterY}%`,
            background: `linear-gradient(180deg, ${phaseColour}18 0%, ${phaseColour}08 100%)`,
            transition: 'top 2.5s ease-out, background 2.5s ease-out',
          }}
        />

        {/* Bioluminescent glow below waterline */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${waterY + 10}%`,
            transform: 'translateX(-50%)',
            width: '80%',
            height: '40%',
            background: `radial-gradient(ellipse at center, ${phaseColour}12 0%, transparent 70%)`,
            transition: 'top 2.5s ease-out',
            pointerEvents: 'none',
          }}
        />

        {/* Animated SVG wave on surface */}
        <svg
          viewBox="0 0 800 40"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${waterY}%`,
            transform: 'translateY(-50%)',
            width: '100%',
            height: 40,
            transition: 'top 2.5s ease-out',
            overflow: 'visible',
          }}
        >
          <path
            d="M 0 20 Q 100 8 200 20 T 400 20 T 600 20 T 800 20 T 1000 20 T 1200 20"
            fill="none"
            stroke={phaseColour}
            strokeWidth={1.5}
            strokeOpacity={0.4}
            style={{ animation: 'heroWaveDrift 6s linear infinite' }}
          />
          <path
            d="M -200 22 Q -100 12 0 22 T 200 22 T 400 22 T 600 22 T 800 22 T 1000 22"
            fill="none"
            stroke={phaseColour}
            strokeWidth={1}
            strokeOpacity={0.2}
            style={{ animation: 'heroWaveDrift 8s linear infinite reverse' }}
          />
        </svg>

        {/* Horizon line */}
        <div
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            top: `${waterY}%`,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${phaseColour}30, transparent)`,
            transition: 'top 2.5s ease-out',
          }}
        />

        {/* Height readout */}
        <div
          style={{
            position: 'absolute',
            right: 16,
            top: 12,
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          {currentHeight.toFixed(1)}m
        </div>
      </div>

      {/* Phase Name */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 20,
        }}
      >
        <div
          style={{
            fontSize: '1.375rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '-0.01em',
            transition: 'color 2.5s ease-out',
          }}
        >
          {phaseLabel}
        </div>

        {/* Live badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 8,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: phaseColour,
              animation: 'bioPulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.625rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Live
          </span>
        </div>

        {/* Station name */}
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
            transition: 'color 0.2s ease',
          }}
        >
          {station.name}
        </button>
      </div>
    </div>
  )
}
