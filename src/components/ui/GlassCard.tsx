'use client'

import type { TidalPhase } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'

interface GlassCardProps {
  children: React.ReactNode
  phase?: TidalPhase
  subtle?: boolean
  className?: string
}

export function GlassCard({ children, phase, subtle, className = '' }: GlassCardProps) {
  const colour = phase ? getPhaseColour(phase) : undefined

  return (
    <div
      className={`glass-card ${subtle ? 'glass-card--subtle' : ''} ${className}`}
      style={
        colour
          ? ({ '--phase-color': colour } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  )
}
