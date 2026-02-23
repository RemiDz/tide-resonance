'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { TidalPhase } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'
import { EASING_CSS } from '@/lib/motion-constants'
import type { BreathTimings } from '@/lib/breath-ratios'

type BreathPhase = 'inhale' | 'hold-top' | 'exhale' | 'hold-bottom'

const BREATH_LABELS: Record<BreathPhase, string> = {
  inhale: 'I N H A L E',
  'hold-top': 'H O L D',
  exhale: 'E X H A L E',
  'hold-bottom': 'R E S T',
}

interface BreathOrbProps {
  phase: TidalPhase
  timings: BreathTimings
  enabled?: boolean
}

export function BreathOrb({ phase, timings, enabled = true }: BreathOrbProps) {
  const phaseColour = getPhaseColour(phase)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale')
  const [scale, setScale] = useState(0.9)
  const [countdown, setCountdown] = useState(timings.inhaleSecs)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const timingsRef = useRef(timings)
  timingsRef.current = timings

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds)
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : prev))
    }, 1000)
  }, [])

  const runCycle = useCallback(() => {
    if (!enabled) return

    const t = timingsRef.current

    // Inhale
    setBreathPhase('inhale')
    setScale(1.1)
    startCountdown(t.inhaleSecs)

    timeoutRef.current = setTimeout(() => {
      // Hold at top
      setBreathPhase('hold-top')
      startCountdown(t.holdTopSecs)

      timeoutRef.current = setTimeout(() => {
        // Exhale
        setBreathPhase('exhale')
        setScale(0.9)
        startCountdown(t.exhaleSecs)

        timeoutRef.current = setTimeout(() => {
          // Rest at bottom
          setBreathPhase('hold-bottom')
          startCountdown(t.holdBottomSecs)

          timeoutRef.current = setTimeout(() => {
            runCycle()
          }, t.holdBottom)
        }, t.exhale)
      }, t.holdTop)
    }, t.inhale)
  }, [enabled, startCountdown])

  useEffect(() => {
    if (enabled) {
      runCycle()
    } else {
      setScale(1)
      setBreathPhase('inhale')
      setCountdown(0)
    }

    return clearTimers
  }, [enabled, runCycle, clearTimers])

  const isExpanding = breathPhase === 'inhale'
  const isContracting = breathPhase === 'exhale'
  const transitionDuration = isExpanding
    ? timings.inhale
    : isContracting
      ? timings.exhale
      : 300

  const ringBaseScale = scale
  const rings = [
    { sizePct: 120, delay: 0 },
    { sizePct: 160, delay: 0.1 },
    { sizePct: 200, delay: 0.2 },
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Orb container — 240px mobile, 300px desktop */}
      <div className="relative w-[240px] h-[240px] md:w-[300px] md:h-[300px]">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${phaseColour}18 0%, transparent 70%)`,
            transform: `scale(${scale * 1.5})`,
            transition: `transform ${transitionDuration}ms ${EASING_CSS.WAVE}, background 2.5s ease-out`,
            willChange: 'transform',
          }}
        />

        {/* Glow rings */}
        {rings.map((ring, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${ring.sizePct}%`,
              height: `${ring.sizePct}%`,
              top: `${(100 - ring.sizePct) / 2}%`,
              left: `${(100 - ring.sizePct) / 2}%`,
              border: `1px solid rgba(255, 255, 255, ${0.04 + i * 0.02})`,
              transform: `scale(${ringBaseScale})`,
              transition: `transform ${transitionDuration}ms ${EASING_CSS.WAVE} ${ring.delay}s`,
              willChange: 'transform',
            }}
          />
        ))}

        {/* Core orb */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            width: '75%',
            height: '75%',
            top: '12.5%',
            left: '12.5%',
            background: `radial-gradient(circle at 45% 40%, ${phaseColour}4D 0%, ${phaseColour}1A 40%, transparent 70%)`,
            transform: `scale(${scale})`,
            transition: `transform ${transitionDuration}ms ${EASING_CSS.WAVE}, background 2.5s ease-out`,
            willChange: 'transform',
          }}
        >
          {/* Water caustic textures */}
          <div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: `
                radial-gradient(ellipse 60% 40% at 35% 35%, ${phaseColour}33 0%, transparent 60%),
                radial-gradient(ellipse 40% 60% at 65% 60%, rgba(255,255,255,0.06) 0%, transparent 50%)
              `,
              animation: 'orbCaustic1 7s ease-in-out infinite',
            }}
          />
          <div
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              background: `
                radial-gradient(ellipse 50% 35% at 55% 45%, ${phaseColour}26 0%, transparent 55%),
                radial-gradient(ellipse 35% 50% at 30% 70%, rgba(255,255,255,0.04) 0%, transparent 60%)
              `,
              animation: 'orbCaustic2 11s ease-in-out infinite',
            }}
          />

          {/* Countdown number — centred inside orb */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 1 }}
          >
            <span
              className="breath-countdown"
              style={{
                fontFamily: 'var(--font-body), system-ui, sans-serif',
                fontWeight: 200,
                fontSize: '2rem',
                color: phaseColour,
                opacity: 0.5,
                transition: 'color 2.5s ease-out',
              }}
            >
              {enabled && countdown > 0 ? countdown : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Breath phase text — 18px, spaced, crossfade */}
      <div className="relative h-7 flex items-center justify-center">
        {(Object.keys(BREATH_LABELS) as BreathPhase[]).map((bp) => (
          <span
            key={bp}
            className="absolute"
            style={{
              fontFamily: 'var(--font-body), system-ui, sans-serif',
              fontWeight: 200,
              fontSize: '1.125rem',
              letterSpacing: '0.2em',
              color: phaseColour,
              opacity: breathPhase === bp ? 0.7 : 0,
              transition: 'opacity 0.6s ease-out, color 2.5s ease-out',
            }}
          >
            {BREATH_LABELS[bp]}
          </span>
        ))}
      </div>
    </div>
  )
}
