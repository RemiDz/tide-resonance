'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { TidalState, TideExtreme, TidalPhase } from '@/types/tidal'
import { getPhaseColour, getPhaseLabel, getPhaseArrow } from '@/lib/colour-utils'
import { phaseGuidance } from '@/data/phaseGuidance'
import { energyGuidance, practitionerAdvice } from '@/data/promoGuidance'
import { formatTime12h } from '@/lib/tidal-narrative'
import { formatDateISO } from '@/lib/promo-utils'
import { getExtremes } from '@/lib/tideEngine'
import { mapToSVG, catmullRomToBezierPath } from '@/components/TidalCurve/curveUtils'
import { CardShell } from './CardShell'
import { CardFooter } from './CardFooter'

export interface CardImage {
  dataUrl: string
  slug: string
  cardNum: number
}

type Format = 'post' | 'story' | 'tiktok'

interface PromoCardsProps {
  tidalState: TidalState
  format: Format
  onImagesReady: (images: CardImage[]) => void
}

const DIMENSIONS: Record<Format, { width: number; height: number }> = {
  post: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  tiktok: { width: 1080, height: 1920 },
}

const CARD_SLUGS = ['phase', 'conditions', 'energy', 'advice', 'cta', 'forecast'] as const

const TOTAL_CARDS = 6

export function PromoCards({ tidalState, format, onImagesReady }: PromoCardsProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [rendering, setRendering] = useState(false)
  const [weekExtremes, setWeekExtremes] = useState<TideExtreme[]>([])

  const dim = DIMENSIONS[format]
  const phaseColor = getPhaseColour(tidalState.currentPhase)
  const dateStr = formatDateISO(new Date())
  const isTiktok = format === 'tiktok'

  // Fetch 7-day extremes for forecast card
  useEffect(() => {
    let cancelled = false
    async function load() {
      const now = new Date()
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      end.setHours(23, 59, 59, 999)
      try {
        const exts = await getExtremes(tidalState.station.id, start, end)
        if (!cancelled) setWeekExtremes(exts)
      } catch {
        // Silently fail
      }
    }
    load()
    return () => { cancelled = true }
  }, [tidalState.station.id])

  // Capture cards with html2canvas
  const captureCards = useCallback(async () => {
    setRendering(true)
    try {
      // Dynamic import to avoid SSR issues
      const { default: html2canvas } = await import('html2canvas-pro')
      await document.fonts.ready

      const images: CardImage[] = []
      for (let i = 0; i < TOTAL_CARDS; i++) {
        const el = cardRefs.current[i]
        if (!el) continue
        const canvas = await html2canvas(el, {
          width: dim.width,
          height: dim.height,
          scale: 1,
          backgroundColor: null,
          useCORS: true,
        })
        images.push({
          dataUrl: canvas.toDataURL('image/png'),
          slug: CARD_SLUGS[i],
          cardNum: i + 1,
        })
      }
      onImagesReady(images)
    } catch (err) {
      console.error('Card capture failed:', err)
    } finally {
      setRendering(false)
    }
  }, [dim.width, dim.height, onImagesReady])

  // Re-capture when data or format changes
  useEffect(() => {
    const timer = setTimeout(captureCards, 500)
    return () => clearTimeout(timer)
  }, [tidalState, format, weekExtremes, captureCards])

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[i] = el
  }

  // Shared card props
  const shellProps = (cardNum: number) => ({
    width: dim.width,
    height: dim.height,
    phaseColor,
    cardNum,
    totalCards: TOTAL_CARDS,
    tiktokSafe: isTiktok,
  })

  const footerProps = (cardNum: number) => ({
    phaseColor,
    cardNum,
    totalCards: TOTAL_CARDS,
    dateStr,
  })

  return (
    <>
      {/* Off-screen rendering container */}
      <div
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          pointerEvents: 'none',
          opacity: 1,
        }}
      >
        <div ref={setRef(0)}>
          <CardShell {...shellProps(1)}>
            <PhaseCard tidalState={tidalState} phaseColor={phaseColor} isStory={format !== 'post'} />
            <CardFooter {...footerProps(1)} />
          </CardShell>
        </div>
        <div ref={setRef(1)}>
          <CardShell {...shellProps(2)}>
            <ConditionsCard tidalState={tidalState} phaseColor={phaseColor} />
            <CardFooter {...footerProps(2)} />
          </CardShell>
        </div>
        <div ref={setRef(2)}>
          <CardShell {...shellProps(3)}>
            <EnergyCard phase={tidalState.currentPhase} phaseColor={phaseColor} station={tidalState.station.name} />
            <CardFooter {...footerProps(3)} />
          </CardShell>
        </div>
        <div ref={setRef(3)}>
          <CardShell {...shellProps(4)}>
            <AdviceCard phase={tidalState.currentPhase} phaseColor={phaseColor} />
            <CardFooter {...footerProps(4)} />
          </CardShell>
        </div>
        <div ref={setRef(4)}>
          <CardShell {...shellProps(5)}>
            <CTACard tidalState={tidalState} phaseColor={phaseColor} />
            <CardFooter {...footerProps(5)} />
          </CardShell>
        </div>
        <div ref={setRef(5)}>
          <CardShell {...shellProps(6)}>
            <ForecastCard
              station={tidalState.station.name}
              phaseColor={phaseColor}
              weekExtremes={weekExtremes}
            />
            <CardFooter {...footerProps(6)} />
          </CardShell>
        </div>
      </div>

      {/* Rendering indicator */}
      {rendering && (
        <div
          style={{
            textAlign: 'center',
            padding: '12px 0',
            fontSize: '0.8125rem',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-jetbrains), monospace',
          }}
        >
          Rendering cards...
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 1: Tidal Phase
   ═══════════════════════════════════════════════════════════════ */

function PhaseCard({
  tidalState,
  phaseColor,
  isStory,
}: {
  tidalState: TidalState
  phaseColor: string
  isStory: boolean
}) {
  const guidance = phaseGuidance[tidalState.currentPhase]
  const arrow = getPhaseArrow(tidalState.currentPhase)
  const label = getPhaseLabel(tidalState.currentPhase)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
      {/* Title */}
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
        TIDE RESONANCE
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', marginBottom: 40 }}>
        Live Tidal Phase
      </div>

      {/* Large phase symbol */}
      <div style={{ fontSize: 64, color: phaseColor, lineHeight: 1, marginBottom: 20 }}>
        {arrow}
      </div>

      {/* Phase name badge */}
      <div style={{
        display: 'inline-block',
        padding: '8px 24px',
        borderRadius: 24,
        background: `${phaseColor}20`,
        border: `1px solid ${phaseColor}40`,
        fontFamily: "'Inter', sans-serif",
        fontSize: 18,
        fontWeight: 500,
        color: phaseColor,
        marginBottom: 28,
      }}>
        {label}
      </div>

      {/* Water height */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 48, fontWeight: 500, color: phaseColor, marginBottom: 24, letterSpacing: '-0.02em' }}>
        {tidalState.currentHeight.toFixed(2)}m
      </div>

      {/* Guidance */}
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center' as const, maxWidth: 400, lineHeight: 1.6, fontStyle: 'italic' as const }}>
        {guidance.description[0]}
      </div>

      {/* Story mode extras */}
      {isStory && (
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column' as const, gap: 12, width: '100%', maxWidth: 400 }}>
          <DataRow label="Rate of change" value={`${tidalState.rateOfChange > 0 ? '+' : ''}${tidalState.rateOfChange.toFixed(2)} m/hr`} phaseColor={phaseColor} />
          <DataRow label="Qualities" value={guidance.qualities} phaseColor={phaseColor} />
          {tidalState.nextHigh && (
            <DataRow label="Next high water" value={formatTime12h(tidalState.nextHigh.time)} phaseColor={phaseColor} />
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 2: Current Conditions
   ═══════════════════════════════════════════════════════════════ */

function ConditionsCard({
  tidalState,
  phaseColor,
}: {
  tidalState: TidalState
  phaseColor: string
}) {
  const heights = tidalState.extremes24h.map((e) => e.height)
  const minH = heights.length > 0 ? Math.min(...heights) : 0
  const maxH = heights.length > 0 ? Math.max(...heights) : 5
  const range = maxH - minH
  const progress = range > 0 ? (tidalState.currentHeight - minH) / range : 0.5

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
        CURRENT CONDITIONS
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', marginBottom: 40 }}>
        Live Tidal Data
      </div>

      {/* Water height with progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Water Height</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 500, color: phaseColor }}>
            {tidalState.currentHeight.toFixed(2)}m
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.max(2, Math.min(100, progress * 100))}%`, borderRadius: 3, background: `linear-gradient(90deg, ${phaseColor}60, ${phaseColor})` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Low</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>High</span>
        </div>
      </div>

      {/* Data rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <DataRow
          label="Rate of change"
          value={`${tidalState.rateOfChange > 0 ? '\u2191 +' : '\u2193 '}${tidalState.rateOfChange.toFixed(2)} m/hr`}
          phaseColor={phaseColor}
        />
        <DataRow
          label="Tidal range"
          value={`${range.toFixed(2)}m`}
          phaseColor={phaseColor}
        />
        <DataRow
          label="Station"
          value={tidalState.station.name}
          phaseColor={phaseColor}
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 3: Energy Guidance
   ═══════════════════════════════════════════════════════════════ */

function EnergyCard({
  phase,
  phaseColor,
  station,
}: {
  phase: TidalPhase
  phaseColor: string
  station: string
}) {
  const areas = energyGuidance[phase]
  const label = getPhaseLabel(phase)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
        TIDAL ENERGY
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', marginBottom: 40 }}>
        {label} Phase \u00B7 {station}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {areas.map((area, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{area.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{area.label}</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, lineHeight: 1.5 }}>
              {area.guidance}
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${area.intensity * 100}%`, borderRadius: 2, background: `linear-gradient(90deg, ${phaseColor}50, ${phaseColor})` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 4: Practitioner Advice
   ═══════════════════════════════════════════════════════════════ */

function AdviceCard({
  phase,
  phaseColor,
}: {
  phase: TidalPhase
  phaseColor: string
}) {
  const advice = practitionerAdvice[phase]
  const items = [
    { label: 'Session type', value: advice.sessionType },
    { label: 'Instruments', value: advice.instruments },
    { label: 'Frequencies', value: advice.frequencies },
    { label: 'Client guidance', value: advice.clientGuidance },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
        PRACTITIONER GUIDE
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', marginBottom: 40 }}>
        Phase-Aligned Recommendations
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: phaseColor, marginBottom: 6 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 5: Call to Action
   ═══════════════════════════════════════════════════════════════ */

function CTACard({
  tidalState,
  phaseColor,
}: {
  tidalState: TidalState
  phaseColor: string
}) {
  const highs = tidalState.extremes24h.filter((e) => e.type === 'high').length
  const lows = tidalState.extremes24h.filter((e) => e.type === 'low').length

  // Build mini curve SVG path
  const miniCurve = useMemo(() => {
    if (tidalState.timeline24h.length < 2) return null
    const vb = { width: 600, height: 120 }
    const pad = { top: 10, right: 10, bottom: 10, left: 10 }
    const pts = mapToSVG(tidalState.timeline24h, vb, pad)
    const path = catmullRomToBezierPath(pts)
    return { vb, path }
  }, [tidalState.timeline24h])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
        TIDE RESONANCE
      </div>

      {/* Mini tidal curve */}
      {miniCurve && (
        <div style={{ width: '100%', maxWidth: 500, marginBottom: 24 }}>
          <svg
            viewBox={`0 0 ${miniCurve.vb.width} ${miniCurve.vb.height}`}
            style={{ width: '100%', height: 'auto' }}
          >
            <defs>
              <linearGradient id="cta-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={phaseColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={phaseColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <path d={miniCurve.path} fill="none" stroke={phaseColor} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
          </svg>
        </div>
      )}

      {/* Summary */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 40, textAlign: 'center' as const }}>
        Today: {highs} high tide{highs !== 1 ? 's' : ''}, {lows} low tide{lows !== 1 ? 's' : ''}
      </div>

      {/* CTA box */}
      <div style={{
        padding: '28px 40px',
        borderRadius: 16,
        border: `1px solid ${phaseColor}30`,
        background: `${phaseColor}08`,
        textAlign: 'center' as const,
        maxWidth: 420,
        width: '100%',
      }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 12 }}>
          Track the tide in real time
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: phaseColor, marginBottom: 12 }}>
          tidara.app
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em' }}>
          Free \u00B7 No account \u00B7 Works offline
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 6: 7-Day Forecast
   ═══════════════════════════════════════════════════════════════ */

function ForecastCard({
  station,
  phaseColor,
  weekExtremes,
}: {
  station: string
  phaseColor: string
  weekExtremes: TideExtreme[]
}) {
  const days = useMemo(() => {
    const now = new Date()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const result: { label: string; isToday: boolean; extremes: TideExtreme[] }[] = []

    for (let d = 0; d < 7; d++) {
      const date = new Date(now)
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() + d)
      const key = date.toDateString()
      const label = d === 0 ? 'Today' : dayNames[date.getDay()]
      const dayExtremes = weekExtremes.filter((e) => e.time.toDateString() === key)
      result.push({ label, isToday: d === 0, extremes: dayExtremes })
    }
    return result
  }, [weekExtremes])

  // Find global min/max for vertical positioning
  const allHeights = weekExtremes.map((e) => e.height)
  const globalMin = allHeights.length > 0 ? Math.min(...allHeights) : 0
  const globalMax = allHeights.length > 0 ? Math.max(...allHeights) : 5
  const globalRange = globalMax - globalMin || 1

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
        7-DAY TIDAL CALENDAR
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', marginBottom: 32 }}>
        {station}
      </div>

      {/* 7 columns */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        {days.map((day, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 4px',
              borderRadius: 10,
              background: day.isToday ? `${phaseColor}12` : 'transparent',
              border: day.isToday ? `1px solid ${phaseColor}25` : '1px solid transparent',
            }}
          >
            {/* Day label */}
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: day.isToday ? 600 : 400,
              color: day.isToday ? phaseColor : 'rgba(255,255,255,0.4)',
              marginBottom: 12,
              letterSpacing: '0.03em',
            }}>
              {day.label}
            </div>

            {/* Extremes as dots positioned vertically */}
            <div style={{ position: 'relative', height: 80, width: '100%' }}>
              {day.extremes.map((ext, j) => {
                const yFrac = 1 - (ext.height - globalMin) / globalRange
                const top = yFrac * 60 + 4
                return (
                  <div key={j} style={{ position: 'absolute', left: '50%', top, transform: 'translateX(-50%)', textAlign: 'center' as const }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: ext.type === 'high' ? phaseColor : 'rgba(255,255,255,0.3)',
                      margin: '0 auto 2px',
                    }} />
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 7,
                      color: 'rgba(255,255,255,0.3)',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {ext.height.toFixed(1)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Shared: Data Row
   ═══════════════════════════════════════════════════════════════ */

function DataRow({
  label,
  value,
  phaseColor,
}: {
  label: string
  value: string
  phaseColor: string
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 500, color: phaseColor }}>
        {value}
      </span>
    </div>
  )
}
