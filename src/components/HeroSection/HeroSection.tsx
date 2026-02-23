'use client'

import { useMemo, useRef, useEffect, useCallback } from 'react'
import type { TidalState } from '@/types/tidal'
import { getPhaseColour, getPhaseLabel } from '@/lib/colour-utils'

interface HeroSectionProps {
  tidalState: TidalState
  onStationTap?: () => void
}

// Wave layer configuration
const WAVE_LAYERS = [
  { amplitude: 12, frequency: 1.2, speed: 0.4, opacity: 0.35, width: 2 },
  { amplitude: 8, frequency: 1.8, speed: 0.6, opacity: 0.25, width: 1.5 },
  { amplitude: 4, frequency: 2.8, speed: 0.9, opacity: 0.15, width: 1 },
  { amplitude: 2, frequency: 4.2, speed: 1.3, opacity: 0.1, width: 0.8 },
]

const SVG_WIDTH = 800
const SVG_HEIGHT = 400
const STEP = 4

function generateWavePath(
  baseY: number,
  time: number,
  amplitude: number,
  frequency: number,
  phase: number,
): string {
  const points: string[] = []
  for (let x = 0; x <= SVG_WIDTH; x += STEP) {
    const nx = x / SVG_WIDTH
    const y =
      baseY +
      Math.sin(nx * Math.PI * 2 * frequency + time + phase) * amplitude +
      Math.sin(nx * Math.PI * 2 * frequency * 2.3 + time * 1.5) * (amplitude * 0.3) +
      Math.sin(nx * Math.PI * 2 * frequency * 0.7 + time * 0.7) * (amplitude * 0.2)
    points.push(`${x},${y.toFixed(1)}`)
  }
  return (
    `M0,${baseY} ` +
    points.map((p) => `L${p}`).join(' ') +
    ` L${SVG_WIDTH},${SVG_HEIGHT} L0,${SVG_HEIGHT} Z`
  )
}

export function HeroSection({ tidalState, onStationTap }: HeroSectionProps) {
  const { currentPhase, currentHeight, extremes24h, station } = tidalState
  const phaseColour = getPhaseColour(currentPhase)
  const phaseLabel = getPhaseLabel(currentPhase)

  const svgRef = useRef<SVGSVGElement>(null)
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const animRef = useRef<number>(0)

  // Calculate water position: 0 = lowest, 1 = highest
  const waterFraction = useMemo(() => {
    if (extremes24h.length === 0) return 0.5
    const heights = extremes24h.map((e) => e.height)
    const min = Math.min(...heights)
    const max = Math.max(...heights)
    const range = max - min
    if (range === 0) return 0.5
    return Math.max(0, Math.min(1, (currentHeight - min) / range))
  }, [currentHeight, extremes24h])

  // Water surface Y in SVG coords: high tide ~25%, low tide ~75%
  const baseY = SVG_HEIGHT * (0.75 - waterFraction * 0.5)

  const animate = useCallback(() => {
    const time = performance.now() / 1000
    WAVE_LAYERS.forEach((layer, i) => {
      const path = pathRefs.current[i]
      if (path) {
        path.setAttribute(
          'd',
          generateWavePath(
            baseY + i * 3,
            time * layer.speed,
            layer.amplitude,
            layer.frequency,
            i * 1.2,
          ),
        )
      }
    })
    animRef.current = requestAnimationFrame(animate)
  }, [baseY])

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [animate])

  return (
    <div>
      {/* Immersive water scene — full width, edge-to-edge */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '38vh',
          minHeight: 240,
          maxHeight: 380,
          overflow: 'hidden',
        }}
      >
        {/* Sky / above waterline — dark with faint stars */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #030610 0%, #050a18 50%, #0a1628 100%)',
          }}
        />

        {/* Faint stars above waterline */}
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

        {/* Animated wave layers SVG */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <defs>
            {/* Surface glow filter */}
            <filter id="surface-glow" x="-10%" y="-20%" width="120%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Underwater caustic pattern */}
            <filter id="hero-caustics" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="2">
                <animate attributeName="seed" from="1" to="10" dur="20s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" scale="8" />
            </filter>
          </defs>

          {/* Deep water gradient below waves */}
          <rect
            x="0"
            y={baseY}
            width={SVG_WIDTH}
            height={SVG_HEIGHT - baseY}
            fill={`url(#deep-water-grad-${currentPhase})`}
            opacity={0.6}
          />
          <defs>
            <linearGradient
              id={`deep-water-grad-${currentPhase}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={phaseColour} stopOpacity={0.15} />
              <stop offset="40%" stopColor="#050a18" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#030610" stopOpacity={1} />
            </linearGradient>
          </defs>

          {/* Underwater caustic light */}
          <rect
            x="0"
            y={baseY + 20}
            width={SVG_WIDTH}
            height={SVG_HEIGHT - baseY - 20}
            fill={phaseColour}
            opacity={0.03}
            filter="url(#hero-caustics)"
          />

          {/* Wave paths — rendered back to front */}
          {WAVE_LAYERS.map((layer, i) => (
            <path
              key={i}
              ref={(el) => { pathRefs.current[i] = el }}
              fill={phaseColour}
              fillOpacity={layer.opacity}
              stroke="none"
            />
          ))}

          {/* Surface glow line */}
          <line
            x1="0"
            y1={baseY}
            x2={SVG_WIDTH}
            y2={baseY}
            stroke={phaseColour}
            strokeWidth={2}
            strokeOpacity={0.2}
            filter="url(#surface-glow)"
            style={{ transition: 'y1 2.5s ease-out, y2 2.5s ease-out' }}
          />
        </svg>

        {/* Bioluminescent particles below waterline */}
        <div
          style={{
            position: 'absolute',
            left: '20%',
            bottom: '15%',
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: phaseColour,
            opacity: 0.3,
            animation: 'bioPulse 4s ease-in-out infinite',
            boxShadow: `0 0 6px ${phaseColour}40`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '65%',
            bottom: '25%',
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: phaseColour,
            opacity: 0.2,
            animation: 'bioPulse 5s ease-in-out infinite 1s',
            boxShadow: `0 0 4px ${phaseColour}30`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '42%',
            bottom: '10%',
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: phaseColour,
            opacity: 0.25,
            animation: 'bioPulse 6s ease-in-out infinite 2s',
            boxShadow: `0 0 5px ${phaseColour}35`,
          }}
        />

        {/* Height readout — small, muted, near water surface */}
        <div
          style={{
            position: 'absolute',
            right: 16,
            top: `calc(${(baseY / SVG_HEIGHT) * 100}% - 20px)`,
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '0.625rem',
            color: 'var(--text-muted)',
            opacity: 0.6,
            transition: 'top 2.5s ease-out',
          }}
        >
          {currentHeight.toFixed(1)}m
        </div>
      </div>

      {/* Phase name + Live + Station — below hero, overlapping bottom edge */}
      <div
        style={{
          textAlign: 'center',
          marginTop: -12,
          position: 'relative',
          zIndex: 1,
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

        {/* Live badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            padding: '3px 10px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.04)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4caf50',
              animation: 'bioPulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.5625rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Live
          </span>
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
            {station.name}
          </button>
        </div>
      </div>
    </div>
  )
}
