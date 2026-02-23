'use client'

import type { TidalPhase } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'

interface ControlsProps {
  phase: TidalPhase
  breathEnabled: boolean
  onBreathToggle: () => void
  breathSpeed: number // 0.5 to 2.0
  onBreathSpeedChange: (speed: number) => void
  onChangeStation: () => void
}

export function Controls({
  phase,
  breathEnabled,
  onBreathToggle,
  breathSpeed,
  onBreathSpeedChange,
  onChangeStation,
}: ControlsProps) {
  const colour = getPhaseColour(phase)

  return (
    <div className="glass-card glass-card--subtle">
      <div className="space-y-5">
        {/* Breath guide toggle */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="breath-toggle"
            className="text-label"
            style={{ color: 'var(--text-muted)' }}
          >
            Breath Guide
          </label>
          <button
            id="breath-toggle"
            role="switch"
            aria-checked={breathEnabled}
            onClick={onBreathToggle}
            className="relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{
              backgroundColor: breathEnabled
                ? `${colour}40`
                : 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300"
              style={{
                backgroundColor: breathEnabled ? colour : 'rgba(255, 255, 255, 0.3)',
                transform: breathEnabled ? 'translateX(20px)' : 'translateX(0)',
                boxShadow: breathEnabled ? `0 0 8px ${colour}60` : 'none',
              }}
            />
          </button>
        </div>

        {/* Breath speed slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="breath-speed"
              className="text-label"
              style={{ color: 'var(--text-muted)' }}
            >
              Breath Speed
            </label>
            <span
              className="text-data text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {breathSpeed.toFixed(1)}x
            </span>
          </div>
          <input
            id="breath-speed"
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={breathSpeed}
            onChange={(e) => onBreathSpeedChange(parseFloat(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${colour}50 0%, ${colour}50 ${((breathSpeed - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.08) ${((breathSpeed - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.08) 100%)`,
              accentColor: colour,
            }}
          />
        </div>

        {/* Change station */}
        <button
          onClick={onChangeStation}
          className="w-full py-2.5 rounded-xl text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
          }}
        >
          Change Station
        </button>
      </div>
    </div>
  )
}
