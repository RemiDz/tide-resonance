'use client'

import { useMemo, useState, useEffect } from 'react'
import type { TidalState, TidalPhase, TideExtreme } from '@/types/tidal'
import { getPhaseColour, getPhaseLabel } from '@/lib/colour-utils'
import { computeSkyState, type SkyState } from '@/lib/sky-utils'
import { formatTimeUntil, formatTime12h } from '@/lib/tidal-narrative'
import { SkyLayer } from './SkyLayer'
import { WavesSVG, SVG_HEIGHT } from './WavesSVG'
import { WaterlineInfo } from './WaterlineInfo'
import { MiniCurve } from './MiniCurve'
import { BioParticles } from './BioParticles'
import { PhaseLabel } from './PhaseLabel'

// ---------------------------------------------------------------------------
// Next Turn Overlay — centred in the sky area
// ---------------------------------------------------------------------------

interface NextTurnOverlayProps {
  nextHigh: TideExtreme | null
  nextLow: TideExtreme | null
  currentPhase: TidalPhase
}

function NextTurnOverlay({ nextHigh, nextLow, currentPhase }: NextTurnOverlayProps) {
  // Tick every 60s for countdown
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const isSlack = currentPhase === 'HIGH_SLACK' || currentPhase === 'LOW_SLACK'

  // Slack states
  if (isSlack) {
    const isHighSlack = currentPhase === 'HIGH_SLACK'
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
          zIndex: 3,
          pointerEvents: 'none',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(18px, 5vw, 24px)',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          {isHighSlack ? 'High Water Now' : 'Low Water Now'}
        </div>
        <div
          style={{
            fontSize: 'clamp(13px, 3.5vw, 14px)',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: 6,
          }}
        >
          {isHighSlack ? 'Ebbing begins shortly' : 'Rising begins shortly'}
        </div>
      </div>
    )
  }

  // Normal: find the next event
  const nextEvents = [
    nextLow ? { type: 'low' as const, extreme: nextLow } : null,
    nextHigh ? { type: 'high' as const, extreme: nextHigh } : null,
  ]
    .filter(Boolean)
    .sort((a, b) => a!.extreme.time.getTime() - b!.extreme.time.getTime())

  const next = nextEvents[0]
  const after = nextEvents[1]

  if (!next) return null

  const nextLabel = next.type === 'high' ? 'High Water' : 'Low Water'
  const nextColour = next.type === 'high' ? '#4fc3f7' : '#7986cb'
  const countdown = formatTimeUntil(next.extreme.time)

  const afterLabel = after
    ? after.type === 'high'
      ? 'rising to High Water'
      : 'ebbing to Low Water'
    : null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
        zIndex: 3,
        pointerEvents: 'none',
        padding: '0 20px',
      }}
    >
      {/* Primary: "Low Water in 3h 46m" */}
      <div
        style={{
          fontSize: 'clamp(18px, 5vw, 24px)',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        <span style={{ color: nextColour }}>{nextLabel}</span>
        {countdown === 'now' ? '' : <> in {countdown}</>}
      </div>

      {/* Secondary: "Then rising to High Water at 8:19 PM" */}
      {after && afterLabel && (
        <div
          style={{
            fontSize: 'clamp(13px, 3.5vw, 14px)',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: 6,
          }}
        >
          Then {afterLabel}
          <br />
          at {formatTime12h(after.extreme.time)}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main HeroSection
// ---------------------------------------------------------------------------

interface HeroSectionProps {
  tidalState: TidalState
  onStationTap?: () => void
}

const DEFAULT_SKY: SkyState = {
  timeOfDay: 'night',
  skyGradient: ['#030610', '#050a18', '#0a1628'],
  moonPhase: 0,
  moonFraction: 0,
  moonAltitude: -1,
}

export function HeroSection({ tidalState, onStationTap }: HeroSectionProps) {
  const {
    currentPhase,
    currentHeight,
    extremes24h,
    timeline24h,
    nextHigh,
    nextLow,
    station,
  } = tidalState

  const phaseColour = getPhaseColour(currentPhase)
  const phaseLabel = getPhaseLabel(currentPhase)

  // Sky state: computed once on mount + every 10 minutes
  const [skyState, setSkyState] = useState<SkyState>(DEFAULT_SKY)
  useEffect(() => {
    const update = () => {
      setSkyState(computeSkyState(new Date(), station.latitude, station.longitude))
    }
    update()
    const id = setInterval(update, 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [station.latitude, station.longitude])

  // Water position: 0 = lowest, 1 = highest
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

  return (
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
      {/* Layer 1: Sky gradient + stars */}
      <SkyLayer skyState={skyState} />

      {/* Next Turn info — centred in sky area */}
      <NextTurnOverlay
        nextHigh={nextHigh}
        nextLow={nextLow}
        currentPhase={currentPhase}
      />

      {/* Layer 3: Animated waves + caustics + foam */}
      <WavesSVG baseY={baseY} phaseColour={phaseColour} currentPhase={currentPhase}>
        {/* Layer 2: H/L lines, timeline */}
        <WaterlineInfo
          baseY={baseY}
          currentHeight={currentHeight}
          extremes24h={extremes24h}
        />
        {/* Layer 4: Mini 24h tidal curve in underwater area */}
        <MiniCurve
          baseY={baseY}
          timeline24h={timeline24h}
          extremes24h={extremes24h}
        />
      </WavesSVG>

      {/* Bioluminescent particles — CSS-only, below waterline */}
      <BioParticles phaseColour={phaseColour} />

      {/* Layer 5: Phase name + station — inside hero with scrim */}
      <PhaseLabel
        phaseLabel={phaseLabel}
        stationName={station.name}
        onStationTap={onStationTap}
      />
    </div>
  )
}
