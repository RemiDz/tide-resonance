'use client'

import { useState, useMemo, useCallback } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useTidalState } from '@/hooks/useTidalState'
import { getPhaseColour, getPhaseLabel, getPhaseArrow } from '@/lib/colour-utils'
import { phaseGuidance } from '@/data/phaseGuidance'
import { formatTime12h } from '@/lib/tidal-narrative'
import { OceanBackground } from '@/components/OceanBackground'
import { TidalCurve } from '@/components/TidalCurve'
import { PromoCards, type CardImage } from '@/components/promo/PromoCards'
import { PROMO_HOOKS } from '@/data/promoHooks'
import { buildCaption, type Platform } from '@/data/promoCaptions'
import { getDayHash, downloadAllCards, downloadCard, formatDateISO } from '@/lib/promo-utils'

type Format = 'post' | 'story' | 'tiktok'

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: 'post', label: 'Post 1:1' },
  { value: 'story', label: 'Story 9:16' },
  { value: 'tiktok', label: 'TikTok 9:16' },
]

const DISPLAY_SIZES: Record<Format, { width: number; height: number }> = {
  post: { width: 320, height: 320 },
  story: { width: 270, height: 480 },
  tiktok: { width: 270, height: 480 },
}

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'whatsapp', label: 'WhatsApp / DM' },
]

export default function PromoPage() {
  const location = useGeolocation(true)
  const { tidalState, isLoading } = useTidalState(location)

  const [format, setFormat] = useState<Format>('post')
  const [cardImages, setCardImages] = useState<CardImage[]>([])
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)

  // Hook selection
  const phase = tidalState?.currentPhase ?? 'RISING'
  const hooks = PROMO_HOOKS[phase]
  const [selectedHookIndex, setSelectedHookIndex] = useState(() => getDayHash(new Date()))

  const selectedHook = hooks[selectedHookIndex] ?? hooks[0]

  const shuffle = useCallback(() => {
    setSelectedHookIndex((prev) => (prev + 1) % 5)
  }, [])

  const handleImagesReady = useCallback((images: CardImage[]) => {
    setCardImages(images)
  }, [])

  const phaseColour = tidalState ? getPhaseColour(tidalState.currentPhase) : '#4fc3f7'

  // Caption variables
  const captionVars = useMemo(() => {
    if (!tidalState) return null
    const g = phaseGuidance[tidalState.currentPhase]
    return {
      hook: selectedHook,
      station: tidalState.station.name,
      phase: g.label,
      qualities: g.qualities,
      guidance: g.description[0],
      height: tidalState.currentHeight.toFixed(2),
    }
  }, [tidalState, selectedHook])

  const handleCopy = useCallback(async (platform: Platform) => {
    if (!captionVars) return
    const text = buildCaption(platform, captionVars)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPlatform(platform)
      setTimeout(() => setCopiedPlatform(null), 2000)
    } catch {
      // Fallback — silently fail
    }
  }, [captionVars])

  const handleDownloadAll = useCallback(async () => {
    if (cardImages.length === 0) return
    await downloadAllCards(cardImages, formatDateISO(new Date()))
  }, [cardImages])

  const handleDownloadSingle = useCallback((img: CardImage) => {
    const dateStr = formatDateISO(new Date())
    downloadCard(img.dataUrl, `tide-resonance-${img.cardNum}-${img.slug}-${dateStr}.png`)
  }, [])

  // Format date
  const dateDisplay = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const displaySize = DISPLAY_SIZES[format]

  // --- Render ---

  if (isLoading && !tidalState) {
    return (
      <div>
        <OceanBackground />
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '0.875rem' }}>
            Loading Content Studio...
          </div>
        </div>
      </div>
    )
  }

  if (!tidalState) return null

  const guidance = phaseGuidance[tidalState.currentPhase]
  const heights = tidalState.extremes24h.map((e) => e.height)
  const minH = heights.length > 0 ? Math.min(...heights) : 0
  const maxH = heights.length > 0 ? Math.max(...heights) : 5
  const range = maxH - minH

  // Next tide
  const nextTide = tidalState.nextHigh && tidalState.nextLow
    ? (tidalState.nextHigh.time < tidalState.nextLow.time ? tidalState.nextHigh : tidalState.nextLow)
    : tidalState.nextHigh ?? tidalState.nextLow

  return (
    <div
      data-phase={tidalState.currentPhase}
      style={{ '--phase-color': phaseColour } as React.CSSProperties}
    >
      <OceanBackground />

      <main
        className="relative z-[1]"
        style={{
          minHeight: '100dvh',
          maxWidth: 900,
          margin: '0 auto',
          padding: '48px 20px 80px',
        }}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <header style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: 500,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '0.02em',
            }}
          >
            Tide Resonance — Content Studio
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              margin: '8px 0 16px',
            }}
          >
            {dateDisplay}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
            >
              Current Phase: {getPhaseLabel(tidalState.currentPhase)} {getPhaseArrow(tidalState.currentPhase)}
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: phaseColour,
                boxShadow: `0 0 8px ${phaseColour}60`,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
            >
              {tidalState.currentHeight.toFixed(2)}m
            </span>
          </div>
        </header>

        {/* ── Quick Stats Bar ──────────────────────────────── */}
        <div className="glass-card" style={{ marginBottom: 24, padding: '16px 20px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 24px',
              justifyContent: 'center',
              alignItems: 'baseline',
            }}
          >
            <StatChip label="Phase" value={`${getPhaseArrow(tidalState.currentPhase)} ${getPhaseLabel(tidalState.currentPhase)}`} color={phaseColour} />
            <StatChip label="Height" value={`${tidalState.currentHeight.toFixed(2)}m`} color={phaseColour} />
            <StatChip label="Rate" value={`${tidalState.rateOfChange > 0 ? '+' : ''}${tidalState.rateOfChange.toFixed(2)} m/hr`} color={phaseColour} />
            <StatChip label="Range" value={`${range.toFixed(2)}m`} color={phaseColour} />
            {nextTide && (
              <StatChip
                label={`Next ${nextTide.type === 'high' ? 'High' : 'Low'}`}
                value={formatTime12h(nextTide.time)}
                color={phaseColour}
              />
            )}
          </div>
        </div>

        {/* ── 24-Hour Tidal Curve ──────────────────────────── */}
        <div className="glass-card" style={{ marginBottom: 32, padding: '20px' }}>
          <div
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.625rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: 12,
            }}
          >
            24-Hour Tidal Curve
          </div>
          <TidalCurve
            timeline={tidalState.timeline24h}
            extremes={tidalState.extremes24h}
            phase={tidalState.currentPhase}
            now={new Date()}
          />
        </div>

        {/* ── Format Toggle ────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFormat(opt.value)}
              style={{
                padding: '8px 20px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.03em',
                background: format === opt.value ? phaseColour : 'rgba(255,255,255,0.06)',
                color: format === opt.value ? '#050810' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Shareable Cards ──────────────────────────────── */}
        <PromoCards
          tidalState={tidalState}
          format={format}
          onImagesReady={handleImagesReady}
        />

        {cardImages.length > 0 && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: format === 'post'
                  ? 'repeat(auto-fill, minmax(300px, 1fr))'
                  : 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              {cardImages.map((img) => (
                <div key={img.cardNum} style={{ position: 'relative' }}>
                  <img
                    src={img.dataUrl}
                    alt={`Card ${img.cardNum}: ${img.slug}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  />
                  <button
                    onClick={() => handleDownloadSingle(img)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                    }}
                    title="Download this card"
                  >
                    \u2193
                  </button>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <button
                onClick={handleDownloadAll}
                style={{
                  padding: '12px 32px',
                  borderRadius: 12,
                  border: `1px solid ${phaseColour}40`,
                  background: `${phaseColour}15`,
                  color: phaseColour,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-jetbrains), monospace',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                }}
              >
                Download All 6 Cards
              </button>
            </div>
          </>
        )}

        {/* ── Opening Hooks ────────────────────────────────── */}
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: '0.625rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
              }}
            >
              Opening Hooks — {getPhaseLabel(tidalState.currentPhase)}
            </div>
            <button
              onClick={shuffle}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                color: 'var(--text-secondary)',
                padding: '4px 8px',
              }}
              title="Shuffle hooks"
            >
              {'\u21BB'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hooks.map((hook, i) => (
              <button
                key={i}
                onClick={() => setSelectedHookIndex(i)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: i === selectedHookIndex
                    ? `1px solid ${phaseColour}50`
                    : '1px solid rgba(255,255,255,0.04)',
                  background: i === selectedHookIndex
                    ? `${phaseColour}10`
                    : 'rgba(255,255,255,0.02)',
                  color: i === selectedHookIndex
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-body), sans-serif',
                  boxShadow: i === selectedHookIndex
                    ? `0 0 20px ${phaseColour}15`
                    : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {hook}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ready-to-Copy Captions ───────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {PLATFORMS.map(({ key, label }) => {
            const text = captionVars ? buildCaption(key, captionVars) : ''
            const isCopied = copiedPlatform === key
            return (
              <div key={key} className="glass-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-jetbrains), monospace',
                      fontSize: '0.625rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {label}
                  </div>
                  <button
                    onClick={() => handleCopy(key)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 8,
                      border: `1px solid ${isCopied ? '#4caf50' : phaseColour}40`,
                      background: isCopied ? '#4caf5020' : `${phaseColour}10`,
                      color: isCopied ? '#4caf50' : phaseColour,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-jetbrains), monospace',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isCopied ? '\u2713 Copied!' : 'Copy'}
                  </button>
                </div>
                <pre
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                    fontFamily: 'var(--font-body), sans-serif',
                  }}
                >
                  {text}
                </pre>
              </div>
            )
          })}
        </div>

        {/* ── Content Calendar Hints ───────────────────────── */}
        <div className="glass-card">
          <div
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.625rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: 20,
            }}
          >
            Content Calendar Hints
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 10, fontWeight: 500 }}>
              {'\uD83D\uDCA1'} Best times to post
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 8 }}>
              <div>Instagram: 9–11am, 7–9pm</div>
              <div>TikTok: 7–9am, 12–3pm, 7–11pm</div>
              <div>Twitter: 8–10am, 12–1pm</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 10, fontWeight: 500 }}>
              {'\uD83D\uDCC5'} Content ideas — {getPhaseLabel(tidalState.currentPhase)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 8 }}>
              <PhaseContentIdea phase={tidalState.currentPhase} />
              <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>
                Weekly: Tidal cycle recap — how the week&apos;s tides aligned with your practice
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Evergreen: Why sound healers track the tide — the science behind tidal resonance
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ── Helper Components ───────────────────────────────────────── */

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{label}</span>
      <span
        style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function PhaseContentIdea({ phase }: { phase: string }) {
  switch (phase) {
    case 'RISING':
      return <div>Energy is building — share momentum-themed content about starting, creating, and moving forward</div>
    case 'HIGH_SLACK':
      return <div>Peak energy moment — post about fullness, abundance, and gratitude</div>
    case 'FALLING':
      return <div>Releasing energy — content about letting go, cleansing, and making space</div>
    case 'LOW_SLACK':
      return <div>Deep stillness — meditation, reflection, and integration content</div>
    default:
      return null
  }
}
