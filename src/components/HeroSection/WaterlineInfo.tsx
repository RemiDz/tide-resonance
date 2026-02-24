'use client'

import { useMemo, useState, useEffect } from 'react'
import type { TideExtreme } from '@/types/tidal'
import { formatTime12h, formatTimeUntil } from '@/lib/tidal-narrative'

const SVG_WIDTH = 800
const SVG_HEIGHT = 400

interface WaterlineInfoProps {
  baseY: number
  currentHeight: number
  extremes24h: TideExtreme[]
  nextHigh: TideExtreme | null
  nextLow: TideExtreme | null
  currentPhase: string
}

const TIME_MARKERS = [
  { hour: 6, label: '6AM' },
  { hour: 9, label: '9AM' },
  { hour: 12, label: '12PM' },
  { hour: 15, label: '3PM' },
  { hour: 18, label: '6PM' },
  { hour: 21, label: '9PM' },
]

export function WaterlineInfo({
  baseY,
  currentHeight,
  extremes24h,
  nextHigh,
  nextLow,
  currentPhase,
}: WaterlineInfoProps) {
  // Countdown ticks every 60s
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  // H/L reference line Y positions
  const { highY, lowY } = useMemo(() => {
    if (extremes24h.length === 0) return { highY: null, lowY: null }
    const heights = extremes24h.map((e) => e.height)
    const min = Math.min(...heights)
    const max = Math.max(...heights)
    const range = max - min || 1
    // Map to SVG Y: high tide → 25%, low tide → 75% of SVG_HEIGHT
    const hFrac = range === 0 ? 0.5 : 1
    const lFrac = range === 0 ? 0.5 : 0
    return {
      highY: SVG_HEIGHT * (0.75 - hFrac * 0.5),
      lowY: SVG_HEIGHT * (0.75 - lFrac * 0.5),
    }
  }, [extremes24h])

  // Time axis: map hours to SVG X (0–24h → 0–800)
  const nowX = useMemo(() => {
    const now = new Date()
    const frac = (now.getHours() * 60 + now.getMinutes()) / (24 * 60)
    return frac * SVG_WIDTH
  }, [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  // Next event
  const nextEvent = useMemo(() => {
    // Find nearest future extreme
    const now = Date.now()
    const upcoming = [nextHigh, nextLow].filter(
      (e): e is TideExtreme => e !== null && e.time.getTime() > now,
    )
    if (upcoming.length === 0) return null
    upcoming.sort((a, b) => a.time.getTime() - b.time.getTime())
    const event = upcoming[0]
    return {
      label: event.type === 'high' ? 'High water' : 'Low water',
      time: formatTime12h(event.time),
      countdown: formatTimeUntil(event.time),
      arrow: event.type === 'high' ? '\u2191' : '\u2193',
    }
  }, [nextHigh, nextLow, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <g>
      {/* H reference dashed line */}
      {highY !== null && (
        <>
          <line
            x1={30}
            y1={highY}
            x2={SVG_WIDTH - 10}
            y2={highY}
            stroke="white"
            strokeWidth={0.5}
            strokeOpacity={0.15}
            strokeDasharray="6 6"
          />
          <text
            x={10}
            y={highY + 3}
            fontSize={7}
            fontFamily="var(--font-jetbrains), monospace"
            fill="white"
            fillOpacity={0.25}
          >
            H
          </text>
        </>
      )}

      {/* L reference dashed line */}
      {lowY !== null && (
        <>
          <line
            x1={30}
            y1={lowY}
            x2={SVG_WIDTH - 10}
            y2={lowY}
            stroke="white"
            strokeWidth={0.5}
            strokeOpacity={0.15}
            strokeDasharray="6 6"
          />
          <text
            x={10}
            y={lowY + 3}
            fontSize={7}
            fontFamily="var(--font-jetbrains), monospace"
            fill="white"
            fillOpacity={0.25}
          >
            L
          </text>
        </>
      )}

      {/* Height label at water surface */}
      <text
        x={SVG_WIDTH - 16}
        y={baseY - 8}
        textAnchor="end"
        fontSize={8}
        fontFamily="var(--font-jetbrains), monospace"
        fill="white"
        fillOpacity={0.6}
        style={{ transition: 'y 2.5s ease-out' } as React.CSSProperties}
      >
        {currentHeight.toFixed(1)}m
      </text>

      {/* Time markers along bottom */}
      {TIME_MARKERS.map((tm) => {
        const x = (tm.hour / 24) * SVG_WIDTH
        return (
          <text
            key={tm.hour}
            x={x}
            y={392}
            textAnchor="middle"
            fontSize={7}
            fontFamily="var(--font-jetbrains), monospace"
            fill="white"
            fillOpacity={0.15}
          >
            {tm.label}
          </text>
        )
      })}

      {/* NOW dot on time axis */}
      <circle
        cx={nowX}
        cy={388}
        r={2}
        fill="white"
        fillOpacity={0.8}
      />

      {/* Next event callout */}
      {nextEvent && (
        <g>
          {/* Dark scrim background */}
          <rect
            x={SVG_WIDTH - 175}
            y={baseY + 40}
            width={155}
            height={32}
            rx={4}
            fill="rgba(5,8,16,0.6)"
          />
          <text
            x={SVG_WIDTH - 168}
            y={baseY + 55}
            fontSize={7.5}
            fontFamily="var(--font-jetbrains), monospace"
            fill="white"
            fillOpacity={0.5}
          >
            {nextEvent.label} {'\u00B7'} {nextEvent.time}
          </text>
          <text
            x={SVG_WIDTH - 168}
            y={baseY + 67}
            fontSize={7.5}
            fontFamily="var(--font-jetbrains), monospace"
            fill="white"
            fillOpacity={0.35}
          >
            {nextEvent.arrow} in {nextEvent.countdown}
          </text>
        </g>
      )}
    </g>
  )
}
