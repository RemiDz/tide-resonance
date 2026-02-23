'use client'

import { useMemo } from 'react'
import type { TidalState } from '@/types/tidal'
import { TidalCurve } from '@/components/TidalCurve'
import { InfoCard } from '@/components/InfoCard'

interface TidalCurveCardProps {
  tidalState: TidalState
}

export function TidalCurveCard({ tidalState }: TidalCurveCardProps) {
  const now = useMemo(() => new Date(), [])

  return (
    <InfoCard title="Tidal Curve &middot; 24 Hours">
      <TidalCurve
        timeline={tidalState.timeline24h}
        extremes={tidalState.extremes24h}
        phase={tidalState.currentPhase}
        now={now}
      />
    </InfoCard>
  )
}
