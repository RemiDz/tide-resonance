'use client'

import { useMemo, useState, useEffect } from 'react'
import type { TidalState } from '@/types/tidal'
import { getPhaseColour, getPhaseLabel } from '@/lib/colour-utils'
import { computeSkyState, type SkyState } from '@/lib/sky-utils'
import { SkyLayer } from './SkyLayer'
import { WavesSVG, SVG_HEIGHT } from './WavesSVG'
import { WaterlineInfo } from './WaterlineInfo'
import { MiniCurve } from './MiniCurve'
import { BioParticles } from './BioParticles'
import { PhaseLabel } from './PhaseLabel'

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
      {/* Layer 1: Sky gradient + stars + moon + chevron */}
      <SkyLayer skyState={skyState} currentPhase={currentPhase} />

      {/* Layer 3: Animated waves + caustics + foam (contains SVG layers 2 & 4 as children) */}
      <WavesSVG baseY={baseY} phaseColour={phaseColour} currentPhase={currentPhase}>
        {/* Layer 2: H/L lines, timeline, next event (SVG <g> inside WavesSVG) */}
        <WaterlineInfo
          baseY={baseY}
          currentHeight={currentHeight}
          extremes24h={extremes24h}
          nextHigh={nextHigh}
          nextLow={nextLow}
          currentPhase={currentPhase}
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

      {/* Layer 5: Phase name + LIVE badge + station — inside hero with scrim */}
      <PhaseLabel
        phaseLabel={phaseLabel}
        stationName={station.name}
        onStationTap={onStationTap}
      />
    </div>
  )
}
