'use client'

import { useMemo, useState, useEffect } from 'react'
import type { TideExtreme } from '@/types/tidal'

const SVG_WIDTH = 800
const SVG_HEIGHT = 400

interface WaterlineInfoProps {
  baseY: number
  currentHeight: number
  extremes24h: TideExtreme[]
}

const TIME_MARKERS = [
  { hour: 6, label: '6AM' },
  { hour: 12, label: '12PM' },
  { hour: 18, label: '6PM' },
]

export function WaterlineInfo({
  baseY,
  currentHeight,
  extremes24h,
}: WaterlineInfoProps) {
  // Tick every 60s for NOW dot position
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
    const hFrac = range === 0 ? 0.5 : 1
    const lFrac = range === 0 ? 0.5 : 0
    return {
      highY: SVG_HEIGHT * (0.75 - hFrac * 0.5),
      lowY: SVG_HEIGHT * (0.75 - lFrac * 0.5),
    }
  }, [extremes24h])

  // Time axis: map hours to SVG X
  const nowX = useMemo(() => {
    const now = new Date()
    const frac = (now.getHours() * 60 + now.getMinutes()) / (24 * 60)
    return frac * SVG_WIDTH
  }, [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <g>
      {/* H reference dashed line */}
      {highY !== null && (
        <>
          <line
            x1={40}
            y1={highY}
            x2={SVG_WIDTH - 10}
            y2={highY}
            stroke="white"
            strokeWidth={0.5}
            strokeOpacity={0.15}
            strokeDasharray="6 6"
          />
          <text
            x={12}
            y={highY + 5}
            fontSize={16}
            fontFamily="var(--font-jetbrains), monospace"
            fill="white"
            fillOpacity={0.30}
          >
            H
          </text>
        </>
      )}

      {/* L reference dashed line */}
      {lowY !== null && (
        <>
          <line
            x1={40}
            y1={lowY}
            x2={SVG_WIDTH - 10}
            y2={lowY}
            stroke="white"
            strokeWidth={0.5}
            strokeOpacity={0.15}
            strokeDasharray="6 6"
          />
          <text
            x={12}
            y={lowY + 5}
            fontSize={16}
            fontFamily="var(--font-jetbrains), monospace"
            fill="white"
            fillOpacity={0.30}
          >
            L
          </text>
        </>
      )}

      {/* Height label at water surface */}
      <text
        x={SVG_WIDTH - 16}
        y={baseY - 10}
        textAnchor="end"
        fontSize={20}
        fontFamily="var(--font-jetbrains), monospace"
        fill="white"
        fillOpacity={0.50}
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
            fontSize={16}
            fontFamily="var(--font-jetbrains), monospace"
            fill="white"
            fillOpacity={0.30}
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
    </g>
  )
}
