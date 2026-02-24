'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { TidalState, TideExtreme, TidalPhase } from '@/types/tidal'
import { getPhaseColour, getPhaseLabel, getPhaseArrow } from '@/lib/colour-utils'
import { phaseGuidance } from '@/data/phaseGuidance'
import { energyGuidance, practitionerAdvice } from '@/data/promoGuidance'
import { formatTime12h } from '@/lib/tidal-narrative'
import { getExtremes } from '@/lib/tideEngine'
import { CardShell, FONT_DISPLAY, FONT_BODY, FONT_MONO } from './CardShell'
import { CardFooter } from './CardFooter'

export interface CardImage {
  dataUrl: string
  slug: string
  cardNum: number
}

export type Format = 'post' | 'story' | 'tiktok'

interface PromoCardsProps {
  tidalState: TidalState
  format: Format
  onImagesReady: (images: CardImage[]) => void
}

const OUTPUT_DIMS: Record<Format, { width: number; height: number }> = {
  post: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  tiktok: { width: 1080, height: 1920 },
}

const DISPLAY_DIMS: Record<Format, { width: number; height: number }> = {
  post: { width: 320, height: 320 },
  story: { width: 270, height: 480 },
  tiktok: { width: 270, height: 480 },
}

const CARD_SLUGS = ['phase', 'conditions', 'energy', 'advice', 'cta', 'forecast'] as const
const TOTAL_CARDS = 6

export function PromoCards({ tidalState, format, onImagesReady }: PromoCardsProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [rendering, setRendering] = useState(false)
  const [weekExtremes, setWeekExtremes] = useState<TideExtreme[]>([])

  const outDim = OUTPUT_DIMS[format]
  const dispDim = DISPLAY_DIMS[format]
  const phaseColor = getPhaseColour(tidalState.currentPhase)
  const isStory = format !== 'post'
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
      } catch { /* silently fail */ }
    }
    load()
    return () => { cancelled = true }
  }, [tidalState.station.id])

  // Capture cards with html2canvas — render at display size, upscale via scale
  const captureCards = useCallback(async () => {
    setRendering(true)
    try {
      const { default: html2canvas } = await import('html2canvas-pro')
      await document.fonts.ready

      const scaleFactor = outDim.width / dispDim.width
      const images: CardImage[] = []

      for (let i = 0; i < TOTAL_CARDS; i++) {
        const el = cardRefs.current[i]
        if (!el) continue
        const canvas = await html2canvas(el, {
          scale: scaleFactor,
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
  }, [outDim.width, dispDim.width, onImagesReady])

  // Re-capture when data or format changes
  useEffect(() => {
    const timer = setTimeout(captureCards, 500)
    return () => clearTimeout(timer)
  }, [tidalState, format, weekExtremes, captureCards])

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[i] = el
  }

  const shellProps = { isStory, isTiktok, color: phaseColor }

  return (
    <>
      {/* Off-screen rendering container */}
      <div style={{ position: 'fixed', left: -9999, top: 0, pointerEvents: 'none' as const, opacity: 1 }}>
        <div ref={setRef(0)}>
          <CardShell {...shellProps} cardNum={1}>
            <PhaseCard tidalState={tidalState} color={phaseColor} isStory={isStory} />
            <CardFooter cardNum={1} isStory={isStory} color={phaseColor} />
          </CardShell>
        </div>
        <div ref={setRef(1)}>
          <CardShell {...shellProps} cardNum={2}>
            <ConditionsCard tidalState={tidalState} color={phaseColor} isStory={isStory} />
            <CardFooter cardNum={2} isStory={isStory} color={phaseColor} />
          </CardShell>
        </div>
        <div ref={setRef(2)}>
          <CardShell {...shellProps} cardNum={3}>
            <EnergyCard phase={tidalState.currentPhase} color={phaseColor} station={tidalState.station.name} isStory={isStory} />
            <CardFooter cardNum={3} isStory={isStory} color={phaseColor} />
          </CardShell>
        </div>
        <div ref={setRef(3)}>
          <CardShell {...shellProps} cardNum={4}>
            <AdviceCard phase={tidalState.currentPhase} color={phaseColor} isStory={isStory} />
            <CardFooter cardNum={4} isStory={isStory} color={phaseColor} />
          </CardShell>
        </div>
        <div ref={setRef(4)}>
          <CardShell {...shellProps} cardNum={5}>
            <CTACard tidalState={tidalState} color={phaseColor} isStory={isStory} />
            <CardFooter cardNum={5} isStory={isStory} color={phaseColor} />
          </CardShell>
        </div>
        <div ref={setRef(5)}>
          <CardShell {...shellProps} cardNum={6}>
            <ForecastCard station={tidalState.station.name} color={phaseColor} weekExtremes={weekExtremes} isStory={isStory} />
            <CardFooter cardNum={6} isStory={isStory} color={phaseColor} />
          </CardShell>
        </div>
      </div>

      {rendering && (
        <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jetbrains), monospace' }}>
          Rendering cards...
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 1: Tidal Phase
   ═══════════════════════════════════════════════════════════════ */

function PhaseCard({ tidalState, color, isStory }: { tidalState: TidalState; color: string; isStory: boolean }) {
  const guidance = phaseGuidance[tidalState.currentPhase]
  const arrow = getPhaseArrow(tidalState.currentPhase)
  const label = getPhaseLabel(tidalState.currentPhase)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      {/* Title */}
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(240,238,248,0.6)', textShadow: `0 0 8px ${color}40`, marginBottom: 2 }}>
        TIDE RESONANCE
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 7, color: 'rgba(200,196,220,0.5)', letterSpacing: '0.05em', marginBottom: isStory ? 16 : 8 }}>
        Live Tidal Phase
      </div>

      {/* Large phase symbol */}
      <div style={{ fontSize: 48, color, lineHeight: 1, textShadow: `0 0 16px ${color}60`, marginBottom: 4 }}>
        {arrow}
      </div>

      {/* Phase badge */}
      <div style={{
        display: 'inline-block',
        padding: '3px 12px',
        borderRadius: 20,
        background: `${color}30`,
        border: `1px solid ${color}40`,
        fontFamily: FONT_BODY,
        fontSize: 12,
        fontWeight: 700,
        color,
        marginBottom: isStory ? 12 : 6,
      }}>
        {label}
      </div>

      {/* Water height */}
      <div style={{ fontFamily: FONT_MONO, fontSize: isStory ? 42 : 36, fontWeight: 800, color, textShadow: `0 0 12px ${color}50`, marginBottom: 4, letterSpacing: '-0.02em' }}>
        {tidalState.currentHeight.toFixed(2)}m
      </div>

      {/* Guidance */}
      <div style={{ fontSize: 10, color: 'rgba(240,238,248,0.9)', maxWidth: 200, lineHeight: 1.5, fontFamily: FONT_BODY }}>
        {guidance.description[0]}
      </div>

      {/* Story mode: stats box */}
      {isStory && (
        <div style={{
          marginTop: 16,
          width: '85%',
          background: '#0a1628',
          border: `1px solid ${color}25`,
          borderRadius: 8,
          padding: '8px 14px',
        }}>
          <StatsRow label="Rate" value={`${tidalState.rateOfChange > 0 ? '+' : ''}${tidalState.rateOfChange.toFixed(2)} m/hr`} color={color} />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />
          <StatsRow label="Range" value={`${computeRange(tidalState).toFixed(2)}m`} color={color} />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />
          {tidalState.nextHigh && (
            <StatsRow label="Next High" value={formatTime12h(tidalState.nextHigh.time)} color={color} />
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 2: Current Conditions
   ═══════════════════════════════════════════════════════════════ */

function ConditionsCard({ tidalState, color, isStory }: { tidalState: TidalState; color: string; isStory: boolean }) {
  const range = computeRange(tidalState)
  const progress = computeProgress(tidalState)
  const rateUp = tidalState.rateOfChange >= 0

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
      {/* Title */}
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(240,238,248,0.6)', textShadow: `0 0 8px ${color}40`, marginBottom: 2 }}>
        CURRENT CONDITIONS
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(200,196,220,0.5)', marginBottom: isStory ? 20 : 12 }}>
        Live Tidal Data
      </div>

      {/* Water height section */}
      <div style={{ width: '85%', textAlign: 'left' as const }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(200,196,220,0.5)', marginBottom: 4 }}>
          Water Height
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color, textShadow: `0 0 10px ${color}40`, marginBottom: 6 }}>
          {tidalState.currentHeight.toFixed(2)}m
        </div>
        {/* Progress bar */}
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(200,196,220,0.12)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.max(3, Math.min(100, progress * 100))}%`,
            borderRadius: 4,
            background: color,
            boxShadow: `0 0 8px ${color}60`,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 7, color: 'rgba(200,196,220,0.4)' }}>Low</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 7, color: 'rgba(200,196,220,0.4)' }}>High</span>
        </div>
      </div>

      {/* Stats box */}
      <div style={{
        width: '85%',
        marginTop: isStory ? 20 : 12,
        background: '#0a1628',
        border: `1px solid ${color}25`,
        borderRadius: 10,
        padding: '12px 14px',
      }}>
        {/* Rate of change */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22, color: rateUp ? '#4caf50' : '#ffab40' }}>{rateUp ? '\u2191' : '\u2193'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(200,196,220,0.5)' }}>Rate of Change</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: rateUp ? '#4caf50' : '#ffab40' }}>
              {rateUp ? '+' : ''}{tidalState.rateOfChange.toFixed(2)} m/hr
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
        {/* Tidal range */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(200,196,220,0.5)' }}>Tidal Range</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: 'rgba(240,238,248,0.9)' }}>{range.toFixed(2)}m</span>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
        {/* Station */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(200,196,220,0.5)' }}>Station</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color }}>{tidalState.station.name}</span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 3: Tidal Energy
   ═══════════════════════════════════════════════════════════════ */

function getIntensityLabel(pct: number): { text: string; color: string } {
  if (pct <= 0.3) return { text: 'Gentle', color: '#4fc3f7' }
  if (pct <= 0.5) return { text: 'Moderate', color: '#4fc3f7' }
  if (pct <= 0.7) return { text: 'Active', color: '#ffab40' }
  return { text: 'Strong', color: '#e0f7fa' }
}

function EnergyCard({ phase, color, station, isStory }: { phase: TidalPhase; color: string; station: string; isStory: boolean }) {
  const areas = energyGuidance[phase]
  const label = getPhaseLabel(phase)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(240,238,248,0.6)', textShadow: `0 0 8px ${color}40`, marginBottom: 2 }}>
        TIDAL ENERGY
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(200,196,220,0.5)', marginBottom: isStory ? 16 : 8 }}>
        {label} Phase · {station}
      </div>

      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: isStory ? 12 : 6, textAlign: 'left' as const }}>
        {areas.map((area, i) => {
          const intensity = getIntensityLabel(area.intensity)
          return (
            <div key={i}>
              {/* Header: emoji + label + intensity */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 12, marginRight: 4 }}>{area.emoji}</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: 'rgba(240,238,248,0.85)', flex: 1 }}>{area.label}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 8, fontWeight: 600, color: intensity.color }}>{intensity.text}</span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(200,196,220,0.12)', overflow: 'hidden', marginBottom: 3 }}>
                <div style={{
                  height: '100%',
                  width: `${area.intensity * 100}%`,
                  borderRadius: 3,
                  background: color,
                  boxShadow: `0 0 6px ${color}50`,
                }} />
              </div>
              {/* Description */}
              <div style={{ fontFamily: FONT_BODY, fontSize: 8, color: 'rgba(200,196,220,0.55)', lineHeight: 1.4 }}>
                {area.guidance}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 4: Practitioner Guide
   ═══════════════════════════════════════════════════════════════ */

function AdviceCard({ phase, color, isStory }: { phase: TidalPhase; color: string; isStory: boolean }) {
  const advice = practitionerAdvice[phase]
  const items = [
    { label: 'SESSION TYPE', value: advice.sessionType },
    { label: 'INSTRUMENTS', value: advice.instruments },
    { label: 'FREQUENCIES', value: advice.frequencies },
    { label: 'CLIENT GUIDANCE', value: advice.clientGuidance },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(240,238,248,0.6)', textShadow: `0 0 8px ${color}40`, marginBottom: 2 }}>
        PRACTITIONER GUIDE
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(200,196,220,0.5)', marginBottom: isStory ? 16 : 10 }}>
        Phase-Aligned Recommendations
      </div>

      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: isStory ? 10 : 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: '#0a1628',
            border: `1px solid ${color}25`,
            borderRadius: 8,
            padding: '10px 12px',
            textAlign: 'left' as const,
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', color, marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: 'rgba(240,238,248,0.9)', lineHeight: 1.5 }}>
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

function CTACard({ tidalState, color, isStory }: { tidalState: TidalState; color: string; isStory: boolean }) {
  const highs = tidalState.extremes24h.filter((e) => e.type === 'high').length
  const lows = tidalState.extremes24h.filter((e) => e.type === 'low').length

  // Simple cosine wave SVG path
  const svgW = 240
  const svgH = isStory ? 120 : 80
  const mid = svgH / 2
  const amp = svgH * 0.35
  const hi = mid - amp
  const lo = mid + amp

  const curvePath = [
    `M 0,${mid}`,
    `C ${svgW * 0.12},${lo} ${svgW * 0.25},${lo} ${svgW * 0.25},${mid}`,
    `C ${svgW * 0.25},${hi} ${svgW * 0.37},${hi} ${svgW * 0.5},${mid}`,
    `C ${svgW * 0.5},${lo} ${svgW * 0.62},${lo} ${svgW * 0.75},${mid}`,
    `C ${svgW * 0.75},${hi} ${svgW * 0.87},${hi} ${svgW},${mid}`,
  ].join(' ')

  const fillPath = `${curvePath} L ${svgW},${svgH} L 0,${svgH} Z`

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(240,238,248,0.6)', textShadow: `0 0 8px ${color}40`, marginBottom: 2 }}>
        TIDE RESONANCE
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(200,196,220,0.5)', marginBottom: isStory ? 20 : 12 }}>
        Align with the Ocean&apos;s Rhythm
      </div>

      {/* Mini tidal curve */}
      <div style={{ width: '80%', marginBottom: 8 }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto' }}>
          <defs>
            <linearGradient id="cta-fill-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#cta-fill-g)" />
          <path d={curvePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          {/* High markers */}
          <text x={svgW * 0.25} y={hi - 6} textAnchor="middle" fill="rgba(200,196,220,0.5)" fontSize={5} fontFamily={FONT_MONO}>{'\u25B2'} High</text>
          <text x={svgW * 0.75} y={hi - 6} textAnchor="middle" fill="rgba(200,196,220,0.5)" fontSize={5} fontFamily={FONT_MONO}>{'\u25B2'} High</text>
          {/* Low markers */}
          <text x={svgW * 0.0} y={lo + 10} textAnchor="start" fill="rgba(200,196,220,0.4)" fontSize={5} fontFamily={FONT_MONO}>{'\u25BC'} Low</text>
          <text x={svgW * 0.5} y={lo + 10} textAnchor="middle" fill="rgba(200,196,220,0.4)" fontSize={5} fontFamily={FONT_MONO}>{'\u25BC'} Low</text>
        </svg>
      </div>

      {/* Summary */}
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: 'rgba(240,238,248,0.85)', marginBottom: isStory ? 16 : 8 }}>
        Today: {highs} high tide{highs !== 1 ? 's' : ''}, {lows} low tide{lows !== 1 ? 's' : ''}
      </div>

      {/* CTA box */}
      <div style={{
        width: '85%',
        padding: 12,
        borderRadius: 10,
        border: `1px solid ${color}30`,
        background: `${color}10`,
        textAlign: 'center' as const,
      }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700, color: 'rgba(240,238,248,0.95)', marginBottom: 6 }}>
          Track the tide in real time
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color, letterSpacing: '0.05em', marginBottom: 4 }}>
          tidara.app
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: 'rgba(200,196,220,0.5)' }}>
          Free · No account · Works offline
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARD 6: 7-Day Tidal Calendar
   ═══════════════════════════════════════════════════════════════ */

function ForecastCard({ station, color, weekExtremes, isStory }: { station: string; color: string; weekExtremes: TideExtreme[]; isStory: boolean }) {
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
      result.push({ label, isToday: d === 0, extremes: weekExtremes.filter((e) => e.time.toDateString() === key) })
    }
    return result
  }, [weekExtremes])

  const trackHeight = isStory ? 260 : 160

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(240,238,248,0.6)', textShadow: `0 0 8px ${color}40`, marginBottom: 2 }}>
        7-DAY TIDAL CALENDAR
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(200,196,220,0.5)', marginBottom: isStory ? 16 : 8 }}>
        {station}
      </div>

      <div style={{ width: '90%', display: 'flex', gap: 2 }}>
        {/* Time scale */}
        <div style={{ width: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: trackHeight, paddingTop: 18 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 5, color: 'rgba(200,196,220,0.35)' }}>00:00</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 5, color: 'rgba(200,196,220,0.35)' }}>12:00</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 5, color: 'rgba(200,196,220,0.35)' }}>23:59</span>
        </div>

        {/* 7 columns */}
        {days.map((day, i) => (
          <div key={i} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: day.isToday ? `${color}08` : 'transparent',
            borderRadius: 6,
            padding: '0 1px',
          }}>
            {/* Day label */}
            <div style={{
              fontFamily: FONT_MONO,
              fontSize: 7,
              fontWeight: day.isToday ? 700 : 400,
              color: day.isToday ? color : 'rgba(200,196,220,0.4)',
              marginBottom: 4,
              paddingTop: 4,
            }}>
              {day.label}
            </div>

            {/* Vertical track with markers */}
            <div style={{ position: 'relative', width: '100%', height: trackHeight - 20 }}>
              {/* Track line */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 2,
                transform: 'translateX(-50%)',
                background: day.isToday ? `${color}40` : 'rgba(200,196,220,0.08)',
                borderRadius: 1,
              }} />

              {/* Extreme markers positioned by time of day */}
              {day.extremes.map((ext, j) => {
                const hrs = ext.time.getHours() + ext.time.getMinutes() / 60
                const yPct = (hrs / 24) * 100
                const isHigh = ext.type === 'high'
                const timeStr = ext.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

                return (
                  <div key={j} style={{ position: 'absolute', left: '50%', top: `${yPct}%`, transform: 'translate(-50%, -50%)', textAlign: 'center' as const }}>
                    <div style={{
                      fontSize: 8,
                      color: isHigh ? color : 'rgba(200,196,220,0.5)',
                      lineHeight: 1,
                    }}>
                      {isHigh ? '\u25C6' : '\u25C7'}
                    </div>
                    <div style={{
                      fontFamily: FONT_MONO,
                      fontSize: 5,
                      color: 'rgba(200,196,220,0.4)',
                      whiteSpace: 'nowrap' as const,
                      marginTop: 1,
                    }}>
                      {timeStr}
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
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function StatsRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 8, color: 'rgba(200,196,220,0.5)' }}>{label}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: 'rgba(240,238,248,0.9)' }}>{value}</span>
    </div>
  )
}

function computeRange(tidalState: TidalState): number {
  const heights = tidalState.extremes24h.map((e) => e.height)
  if (heights.length === 0) return 0
  return Math.max(...heights) - Math.min(...heights)
}

function computeProgress(tidalState: TidalState): number {
  const heights = tidalState.extremes24h.map((e) => e.height)
  if (heights.length === 0) return 0.5
  const min = Math.min(...heights)
  const max = Math.max(...heights)
  const range = max - min
  return range > 0 ? (tidalState.currentHeight - min) / range : 0.5
}
