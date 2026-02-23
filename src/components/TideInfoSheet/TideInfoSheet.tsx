'use client'

import { useState, useEffect, useMemo } from 'react'
import type { TidalState, TideExtreme } from '@/types/tidal'
import { getPhaseColour } from '@/lib/colour-utils'
import { formatTime12h } from '@/lib/tidal-narrative'
import { BottomSheet } from '@/components/BottomSheet'
import { TidalCurve } from '@/components/TidalCurve'

interface TideInfoSheetProps {
  open: boolean
  onClose: () => void
  tidalState: TidalState
  now: Date
}

interface DayExtremes {
  date: Date
  extremes: TideExtreme[]
}

function formatDayLabel(date: Date, isToday: boolean): string {
  if (isToday) return 'Today'
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function TideInfoSheet({ open, onClose, tidalState, now }: TideInfoSheetProps) {
  const colour = getPhaseColour(tidalState.currentPhase)
  const [days, setDays] = useState<DayExtremes[]>([])
  const [loadingWeek, setLoadingWeek] = useState(true)

  // Today's high/low from current extremes
  const todayExtremes = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tidalState.extremes24h.filter(
      (e) => e.time >= today && e.time < tomorrow
    )
  }, [tidalState.extremes24h])

  // Load 7-day calendar
  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function loadWeek() {
      try {
        const { getExtremes } = await import('@/lib/tideEngine')

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const endDate = new Date(today)
        endDate.setDate(endDate.getDate() + 7)
        endDate.setHours(23, 59, 59, 999)

        const allExtremes = await getExtremes(tidalState.station.id, today, endDate)

        const dayMap = new Map<string, DayExtremes>()
        for (let i = 0; i < 7; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() + i)
          const key = d.toDateString()
          dayMap.set(key, { date: d, extremes: [] })
        }

        for (const ext of allExtremes) {
          const key = ext.time.toDateString()
          const day = dayMap.get(key)
          if (day) day.extremes.push(ext)
        }

        if (!cancelled) {
          setDays(Array.from(dayMap.values()))
          setLoadingWeek(false)
        }
      } catch {
        if (!cancelled) setLoadingWeek(false)
      }
    }

    loadWeek()
    return () => { cancelled = true }
  }, [open, tidalState.station.id])

  const todayStr = new Date().toDateString()

  return (
    <BottomSheet open={open} onClose={onClose}>
      {/* Tidal Curve — the hero visual */}
      <div style={{ marginBottom: 16 }}>
        <TidalCurve
          timeline={tidalState.timeline24h}
          extremes={tidalState.extremes24h}
          phase={tidalState.currentPhase}
          now={now}
        />
      </div>

      {/* Today's highs/lows */}
      {todayExtremes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p
            className="text-label"
            style={{ color: 'var(--text-muted)', marginBottom: 8 }}
          >
            Today
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {todayExtremes.map((ext, i) => (
              <span
                key={i}
                className="text-data"
                style={{
                  fontSize: '0.8125rem',
                  color: ext.type === 'high' ? '#e0f7fa' : '#7986cb',
                }}
              >
                <span style={{ opacity: 0.6 }}>
                  {ext.type === 'high' ? 'High' : 'Low'}
                </span>{' '}
                {formatTime12h(ext.time)}{' '}
                <span style={{ opacity: 0.4 }}>{ext.height.toFixed(1)}m</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Connection line */}
      <p
        style={{
          fontSize: '0.75rem',
          fontStyle: 'italic',
          color: 'var(--text-muted)',
          marginBottom: 16,
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          paddingTop: 12,
        }}
      >
        The tide is connected to your breath rhythm
      </p>

      {/* 7-day calendar */}
      <p
        className="text-label"
        style={{ color: 'var(--text-muted)', marginBottom: 8 }}
      >
        7-Day Tides
      </p>

      {loadingWeek ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-10 rounded-lg" />
          ))}
        </div>
      ) : (
        <div>
          {days.map((day) => {
            const isToday = day.date.toDateString() === todayStr

            return (
              <div
                key={day.date.toDateString()}
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                }}
              >
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: isToday ? 500 : 300,
                    color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                    marginBottom: 4,
                  }}
                >
                  {formatDayLabel(day.date, isToday)}
                  {isToday && (
                    <span
                      className="ml-2 inline-block w-1 h-1 rounded-full"
                      style={{ backgroundColor: '#4fc3f7', verticalAlign: 'middle' }}
                    />
                  )}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {day.extremes.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      No data
                    </span>
                  ) : (
                    day.extremes.map((ext, i) => (
                      <span
                        key={i}
                        className="text-data"
                        style={{
                          fontSize: '0.75rem',
                          color: ext.type === 'high' ? '#e0f7fa' : '#7986cb',
                        }}
                      >
                        <span style={{ opacity: 0.6 }}>
                          {ext.type === 'high' ? 'H' : 'L'}
                        </span>{' '}
                        {formatTime(ext.time)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </BottomSheet>
  )
}
