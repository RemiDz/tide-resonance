'use client'

import { useRef, useEffect, useCallback } from 'react'

const SVG_WIDTH = 800
const SVG_HEIGHT = 400
const STEP = 4

const WAVE_LAYERS = [
  { amplitude: 12, frequency: 1.2, speed: 0.4, opacity: 0.35, width: 2 },
  { amplitude: 8, frequency: 1.8, speed: 0.6, opacity: 0.25, width: 1.5 },
  { amplitude: 4, frequency: 2.8, speed: 0.9, opacity: 0.15, width: 1 },
  { amplitude: 2, frequency: 4.2, speed: 1.3, opacity: 0.1, width: 0.8 },
]

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

interface WavesSVGProps {
  baseY: number
  phaseColour: string
  currentPhase: string
  children?: React.ReactNode
}

export function WavesSVG({ baseY, phaseColour, currentPhase, children }: WavesSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const animRef = useRef<number>(0)

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

        {/* Underwater caustic pattern — primary */}
        <filter id="hero-caustics" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="2">
            <animate attributeName="seed" from="1" to="10" dur="20s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="8" />
        </filter>

        {/* Underwater caustic pattern — secondary (offset) */}
        <filter id="hero-caustics-2" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7">
            <animate attributeName="seed" from="5" to="15" dur="28s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>

        {/* Deep water gradient */}
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

      {/* Deep water gradient below waves */}
      <rect
        x="0"
        y={baseY}
        width={SVG_WIDTH}
        height={SVG_HEIGHT - baseY}
        fill={`url(#deep-water-grad-${currentPhase})`}
        opacity={0.6}
      />

      {/* Underwater caustic light — primary */}
      <rect
        x="0"
        y={baseY + 20}
        width={SVG_WIDTH}
        height={SVG_HEIGHT - baseY - 20}
        fill={phaseColour}
        opacity={0.04}
        filter="url(#hero-caustics)"
      />

      {/* Underwater caustic light — secondary (more organic) */}
      <rect
        x="0"
        y={baseY + 30}
        width={SVG_WIDTH}
        height={SVG_HEIGHT - baseY - 30}
        fill={phaseColour}
        opacity={0.025}
        filter="url(#hero-caustics-2)"
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

      {/* Surface foam — bright inner edge line */}
      <line
        x1="0"
        y1={baseY}
        x2={SVG_WIDTH}
        y2={baseY}
        stroke="white"
        strokeWidth={1}
        strokeOpacity={0.35}
        style={{ transition: 'y1 2.5s ease-out, y2 2.5s ease-out' }}
      />

      {/* Injected children (WaterlineInfo, MiniCurve) */}
      {children}
    </svg>
  )
}

export { SVG_WIDTH, SVG_HEIGHT }
