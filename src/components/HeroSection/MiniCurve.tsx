'use client'

import { useMemo } from 'react'
import type { TidePoint, TideExtreme } from '@/types/tidal'
import { mapToSVG, catmullRomToBezierPath, getNowPosition } from '@/components/TidalCurve/curveUtils'
import { formatTime12h } from '@/lib/tidal-narrative'

const SVG_WIDTH = 800

interface MiniCurveProps {
  baseY: number
  timeline24h: TidePoint[]
  extremes24h: TideExtreme[]
}

export function MiniCurve({ baseY, timeline24h, extremes24h }: MiniCurveProps) {
  // Render area: from baseY+30 down to y=360
  const curveTop = baseY + 30
  const curveBottom = 360
  const curveHeight = curveBottom - curveTop

  // Only render if we have enough space and data
  if (curveHeight < 30 || timeline24h.length < 2) return null

  const viewBox = { width: SVG_WIDTH, height: curveHeight }
  const padding = { top: 4, right: 16, bottom: 12, left: 16 }

  const { curvePath, nowPos, extremeLabels } = useMemo(() => { // eslint-disable-line react-hooks/rules-of-hooks
    const svgPoints = mapToSVG(timeline24h, viewBox, padding)
    const path = catmullRomToBezierPath(svgPoints)
    const now = new Date()
    const nPos = getNowPosition(timeline24h, svgPoints, now)

    // Extreme positions for labels
    const labels = extremes24h.map((ext) => {
      const extPoint: TidePoint = { time: ext.time, height: ext.height }
      const extSvg = mapToSVG([extPoint], viewBox, padding)
      // Find closest timeline point for better positioning
      const closest = timeline24h.reduce((prev, curr) =>
        Math.abs(curr.time.getTime() - ext.time.getTime()) <
        Math.abs(prev.time.getTime() - ext.time.getTime())
          ? curr
          : prev,
      )
      const closestIdx = timeline24h.indexOf(closest)
      const pos = svgPoints[closestIdx] ?? extSvg[0]
      return {
        x: pos?.x ?? 0,
        y: pos?.y ?? 0,
        label: formatTime12h(ext.time).replace(/\s/g, ''),
        type: ext.type,
      }
    })

    return { curvePath: path, nowPos: nPos, extremeLabels: labels }
  }, [timeline24h, extremes24h, curveHeight]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <g transform={`translate(0, ${curveTop})`}>
      {/* Thin curve line */}
      <path
        d={curvePath}
        fill="none"
        stroke="white"
        strokeWidth={1.5}
        strokeOpacity={0.15}
      />

      {/* Extreme dots + time labels */}
      {extremeLabels.map((ext, i) => (
        <g key={i}>
          <circle
            cx={ext.x}
            cy={ext.y}
            r={1.5}
            fill="white"
            fillOpacity={0.3}
          />
          <text
            x={ext.x}
            y={ext.type === 'high' ? ext.y - 10 : ext.y + 16}
            textAnchor="middle"
            fontSize={18}
            fontFamily="var(--font-jetbrains), monospace"
            fill="white"
            fillOpacity={0.40}
          >
            {ext.label}
          </text>
        </g>
      ))}

      {/* NOW dot */}
      {nowPos && (
        <circle
          cx={nowPos.x}
          cy={nowPos.y}
          r={2.5}
          fill="white"
          fillOpacity={0.7}
        />
      )}
    </g>
  )
}
