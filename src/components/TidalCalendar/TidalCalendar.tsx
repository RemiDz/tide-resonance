'use client'

import { useState, useEffect } from 'react'
import type { TideStation, TideExtreme } from '@/types/tidal'

interface TidalCalendarProps {
  station: TideStation
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

export function TidalCalendar({ station }: TidalCalendarProps) {
  const [days, setDays] = useState<DayExtremes[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadWeek() {
      try {
        const { getExtremes } = await import('@/lib/tideEngine')

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const endDate = new Date(today)
        endDate.setDate(endDate.getDate() + 7)
        endDate.setHours(23, 59, 59, 999)

        const allExtremes = await getExtremes(station.id, today, endDate)

        // Group by day
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
          if (day) {
            day.extremes.push(ext)
          }
        }

        if (!cancelled) {
          setDays(Array.from(dayMap.values()))
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    loadWeek()
    return () => { cancelled = true }
  }, [station.id])

  const todayStr = new Date().toDateString()

  return (
    <div
      className="glass-card"
      style={{ '--phase-color': '#4fc3f7' } as React.CSSProperties}
    >
      {/* Section label */}
      <p className="text-label mb-2" style={{ color: 'var(--text-muted)' }}>
        Tidal Calendar
      </p>

      <p
        className="mb-5"
        style={{
          fontSize: '0.875rem',
          fontWeight: 300,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        Plan your sessions around the ocean's rhythm.
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {days.map((day) => {
            const isToday = day.date.toDateString() === todayStr

            return (
              <div
                key={day.date.toDateString()}
                className="py-3"
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                }}
              >
                {/* Day label */}
                <p
                  className="mb-1.5"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: isToday ? 500 : 300,
                    color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
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

                {/* Extremes row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {day.extremes.length === 0 ? (
                    <span
                      style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                    >
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
    </div>
  )
}
