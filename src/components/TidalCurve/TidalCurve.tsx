'use client'

import { useMemo, useEffect, useState } from 'react'
import type { TidePoint, TideExtreme, TidalPhase } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'
import {
  mapToSVG,
  catmullRomToBezierPath,
  getNowPosition,
  areaPath,
  type ViewBox,
  type Padding,
} from './curveUtils'

const VIEWBOX: ViewBox = { width: 800, height: 240 }
const PADDING: Padding = { top: 36, right: 16, bottom: 36, left: 16 }
const TIME_LABELS = [0, 3, 6, 9, 12, 15, 18, 21]

interface TidalCurveProps {
  timeline: TidePoint[]
  extremes: TideExtreme[]
  phase: TidalPhase
  now: Date
}

export function TidalCurve({ timeline, extremes, phase, now }: TidalCurveProps) {
  const phaseColour = getPhaseColour(phase)

  // Live NOW position — update every 60s
  const [liveNow, setLiveNow] = useState(now)
  useEffect(() => {
    const interval = setInterval(() => setLiveNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const computed = useMemo(() => {
    const svgPts = mapToSVG(timeline, VIEWBOX, PADDING)
    const curve = catmullRomToBezierPath(svgPts)
    const fill = areaPath(curve, svgPts, VIEWBOX, PADDING)
    const nowP = getNowPosition(timeline, svgPts, liveNow)

    // Map extremes to SVG positions
    const extSVG = extremes.map((ext) => {
      const pos = getNowPosition(timeline, svgPts, ext.time)
      return { ...ext, pos }
    }).filter((e) => e.pos !== null)

    // Time axis labels
    const dayStart = new Date(liveNow)
    dayStart.setHours(0, 0, 0, 0)
    const dayRange = 24 * 60 * 60 * 1000 - 1
    const plotW = VIEWBOX.width - PADDING.left - PADDING.right

    const timeLabelPositions = TIME_LABELS.map((hr) => {
      const ms = hr * 60 * 60 * 1000
      const x = PADDING.left + (ms / dayRange) * plotW
      return { x, label: `${String(hr).padStart(2, '0')}:00` }
    })

    // Now X fraction for gradient split
    const nowXFrac = nowP ? (nowP.x / VIEWBOX.width) * 100 : 50

    return { svgPts, curve, fill, nowP, extSVG, timeLabelPositions, nowXFrac }
  }, [timeline, extremes, liveNow])

  const { curve, fill, nowP, extSVG, timeLabelPositions, nowXFrac } = computed

  return (
    <div className="w-full" style={{ animation: 'curveUndulate 8s ease-in-out infinite' }}>
      <svg
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="24-hour tidal curve"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Stroke gradient: muted past → bright at NOW → full future */}
          <linearGradient id="curve-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={phaseColour} stopOpacity={0.3} />
            <stop offset={`${Math.max(0, nowXFrac - 2)}%`} stopColor={phaseColour} stopOpacity={0.4} />
            <stop offset={`${nowXFrac}%`} stopColor={phaseColour} stopOpacity={1} />
            <stop offset={`${Math.min(100, nowXFrac + 2)}%`} stopColor={phaseColour} stopOpacity={1} />
            <stop offset="100%" stopColor={phaseColour} stopOpacity={0.8} />
          </linearGradient>

          {/* Area fill: water depth below curve */}
          <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={phaseColour} stopOpacity={0.12} />
            <stop offset="100%" stopColor={phaseColour} stopOpacity={0.01} />
          </linearGradient>

          {/* Left/right fade mask on fill */}
          <linearGradient id="fill-fade-x" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity={0} />
            <stop offset="5%" stopColor="white" stopOpacity={1} />
            <stop offset="95%" stopColor="white" stopOpacity={1} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </linearGradient>

          {/* Past dimming mask */}
          <linearGradient id="past-dim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity={0.35} />
            <stop offset={`${Math.max(0, nowXFrac - 1)}%`} stopColor="white" stopOpacity={0.4} />
            <stop offset={`${nowXFrac}%`} stopColor="white" stopOpacity={1} />
            <stop offset="100%" stopColor="white" stopOpacity={1} />
          </linearGradient>

          <mask id="fill-mask">
            <rect width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#fill-fade-x)" />
          </mask>

          <mask id="dim-mask">
            <rect width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#past-dim)" />
          </mask>

          {/* Glow filter for curve line */}
          <filter id="curve-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow for NOW dot */}
          <filter id="now-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Time axis labels */}
        {timeLabelPositions.map((tl, i) => (
          <text
            key={i}
            x={tl.x}
            y={VIEWBOX.height - 6}
            textAnchor="middle"
            fill="rgba(255,255,255,0.25)"
            fontSize={9}
            fontFamily="var(--font-jetbrains), monospace"
          >
            {tl.label}
          </text>
        ))}

        {/* Time axis tick marks */}
        {timeLabelPositions.map((tl, i) => (
          <line
            key={`tick-${i}`}
            x1={tl.x}
            y1={VIEWBOX.height - PADDING.bottom}
            x2={tl.x}
            y2={VIEWBOX.height - PADDING.bottom + 4}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.5}
          />
        ))}

        {/* Water fill under curve — fades at edges */}
        {fill && (
          <g mask="url(#fill-mask)">
            <path d={fill} fill="url(#curve-fill)" />
          </g>
        )}

        {/* Main curve stroke with glow — past dimmed, future bright */}
        {curve && (
          <g mask="url(#dim-mask)">
            <path
              d={curve}
              fill="none"
              stroke={phaseColour}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#curve-glow)"
              opacity={0.9}
            />
          </g>
        )}

        {/* Shimmer — a bright spot that travels along the curve */}
        {curve && nowP && (
          <circle
            r={3}
            fill={phaseColour}
            opacity={0.6}
            filter="url(#now-glow)"
          >
            <animateMotion
              dur="30s"
              repeatCount="indefinite"
              path={curve}
            />
          </circle>
        )}

        {/* High/Low extreme markers and labels */}
        {extSVG.map((ext, i) => {
          const isHigh = ext.type === 'high'
          const timeStr = ext.time.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
          const heightStr = `${ext.height.toFixed(1)}m`
          const arrow = isHigh ? '\u25B2' : '\u25BC'
          const labelY = isHigh ? ext.pos!.y - 8 : ext.pos!.y + 10

          return (
            <g key={i}>
              {/* Small dot at extreme */}
              <circle
                cx={ext.pos!.x}
                cy={ext.pos!.y}
                r={2.5}
                fill={phaseColour}
                opacity={0.7}
              />
              {/* Time + height label */}
              <text
                x={ext.pos!.x}
                y={labelY}
                textAnchor="middle"
                fill="rgba(255,255,255,0.45)"
                fontSize={8.5}
                fontFamily="var(--font-jetbrains), monospace"
              >
                {timeStr}
              </text>
              <text
                x={ext.pos!.x}
                y={labelY + (isHigh ? -10 : 10)}
                textAnchor="middle"
                fill="rgba(255,255,255,0.35)"
                fontSize={8}
                fontFamily="var(--font-jetbrains), monospace"
              >
                {heightStr} {arrow}
              </text>
            </g>
          )
        })}

        {/* NOW marker — the most prominent element */}
        {nowP && (
          <g>
            {/* Concentric pulsing rings (like a pebble in water) */}
            {[0, 1, 2].map((ring) => (
              <circle
                key={ring}
                cx={nowP.x}
                cy={nowP.y}
                r={6}
                fill="none"
                stroke={phaseColour}
                strokeWidth={1}
                opacity={0}
                style={{
                  animation: `nowRipple 3s ease-out infinite`,
                  animationDelay: `${ring * 0.6}s`,
                  transformBox: 'fill-box' as const,
                  transformOrigin: 'center center',
                }}
              />
            ))}

            {/* Glow dot — pulsing */}
            <circle
              cx={nowP.x}
              cy={nowP.y}
              r={5}
              fill={phaseColour}
              filter="url(#now-glow)"
              style={{ animation: 'nowGlow 3s ease-in-out infinite' }}
            />

            {/* Bright center */}
            <circle
              cx={nowP.x}
              cy={nowP.y}
              r={2}
              fill="white"
              opacity={0.9}
            />

            {/* "Now" label */}
            <text
              x={nowP.x}
              y={VIEWBOX.height - PADDING.bottom + 15}
              textAnchor="middle"
              fill={phaseColour}
              fontSize={8}
              fontFamily="var(--font-mono), monospace"
              fontWeight={500}
              letterSpacing="0.05em"
            >
              Now
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
