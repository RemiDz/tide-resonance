'use client'

import { useState, useEffect } from 'react'
import type { TideStation, TideExtreme } from '@/types/tidal'
import { formatTime12h } from '@/lib/tidal-narrative'
import { getExtremes } from '@/lib/tideEngine'

interface TidalCalendarProps {
  station: TideStation
}

interface DayData {
  label: string
  isToday: boolean
  extremes: TideExtreme[]
}

const CALENDAR_INFO =
  'Plan ahead using the 7-day tidal forecast. Each day shows the predicted high and low water times with heights. Tidal patterns shift between spring tides (larger range, around new and full moon) and neap tides (smaller range, around quarter moons). The mini curves show the shape of each day\u2019s tidal cycle at a glance.'

export function TidalCalendar({ station }: TidalCalendarProps) {
  const [days, setDays] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [infoOpen, setInfoOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const now = new Date()
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)

      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      end.setHours(23, 59, 59, 999)

      try {
        const extremes = await getExtremes(station.id, start, end)
        if (cancelled) return

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const result: DayData[] = []

        for (let d = 0; d < 7; d++) {
          const date = new Date(start)
          date.setDate(date.getDate() + d)
          const key = date.toDateString()
          const isToday = d === 0
          const label = isToday ? 'Today' : dayNames[date.getDay()]

          const dayExtremes = extremes.filter((e) => e.time.toDateString() === key)
          result.push({ label, isToday, extremes: dayExtremes })
        }

        setDays(result)
      } catch {
        // Silently fail — calendar is supplementary
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [station.id])

  if (loading) {
    return (
      <div style={{ padding: '0 20px 16px' }}>
        <SectionHeader infoOpen={infoOpen} onToggleInfo={() => setInfoOpen(!infoOpen)} />
        <div className="skeleton" style={{ height: 160, borderRadius: 12 }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '0 20px 16px' }}>
      <SectionHeader infoOpen={infoOpen} onToggleInfo={() => setInfoOpen(!infoOpen)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {days.map((day, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
              padding: '8px 0',
              borderBottom: i < days.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
            }}
          >
            {/* Day label */}
            <div
              style={{
                width: 48,
                flexShrink: 0,
                fontSize: '0.8125rem',
                fontWeight: day.isToday ? 500 : 400,
                color: day.isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {day.label}
            </div>

            {/* Extremes */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px 16px',
                flex: 1,
              }}
            >
              {day.extremes.map((ext, j) => {
                const isHigh = ext.type === 'high'
                return (
                  <span
                    key={j}
                    style={{
                      fontFamily: 'var(--font-jetbrains), monospace',
                      fontSize: '0.75rem',
                      color: day.isToday ? 'var(--text-primary)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: '0.5rem', marginRight: 3 }}>
                      {isHigh ? '\u25B2' : '\u25BC'}
                    </span>
                    {formatTime12h(ext.time)}
                  </span>
                )
              })}
              {day.extremes.length === 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>&mdash;</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expandable info */}
      <div className="info-expand" data-open={infoOpen}>
        <div style={{ overflow: 'hidden' }}>
          <div className="info-expand-content">
            <div
              style={{
                borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                marginTop: 12,
                paddingTop: 14,
              }}
            >
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.45)',
                  lineHeight: 1.7,
                  maxWidth: 480,
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                {CALENDAR_INFO}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  infoOpen,
  onToggleInfo,
}: {
  infoOpen: boolean
  onToggleInfo: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}
    >
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
        7-Day Forecast
      </div>
      <button
        onClick={onToggleInfo}
        aria-label={infoOpen ? 'Hide info' : 'Show info'}
        aria-expanded={infoOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          margin: '-12px -12px -12px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle
            cx="9"
            cy="9"
            r="8"
            stroke="white"
            strokeOpacity={infoOpen ? 0.5 : 0.25}
            strokeWidth="1"
            style={{ transition: 'stroke-opacity 0.2s ease' }}
          />
          <text
            x="9"
            y="13"
            textAnchor="middle"
            fontSize="11"
            fontFamily="serif"
            fill="white"
            fillOpacity={infoOpen ? 0.5 : 0.25}
            fontStyle="italic"
            style={{ transition: 'fill-opacity 0.2s ease' }}
          >
            i
          </text>
        </svg>
      </button>
    </div>
  )
}
