'use client'
import { useEffect, useRef, useState } from 'react'
import type { Settings } from '@/types/settings'
import type { TidalState } from '@/types/tidal'
import { getWeekForecast, type ForecastDay } from '@/lib/tide-forecast'
import { formatHeight, formatTideTime, stationDateKey } from '@/lib/tide-time'
import { TideChart, MiniCurve } from './TideChart'
import { Icon } from './Icon'

export function TideOutlook({ state, settings }: { state: TidalState; settings: Settings }) {
  const [days, setDays] = useState<ForecastDay[]>([])
  const [selection, setSelection] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const strip = useRef<HTMLDivElement>(null)
  const todayKey = stationDateKey(state.computedAt, state.station.timezone)
  const stationId = state.station.id, timezone = state.station.timezone
  useEffect(() => {
    let active = true
    setDays([]); setSelection(null); setError('')
    void getWeekForecast(state.station, state.computedAt).then(result => { if (active) setDays(result) })
      .catch(() => { if (active) setError('The seven-day outlook could not be calculated.') })
    return () => { active = false }
    // Only rebuild at a new station or a new station-local date.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, timezone, todayKey, revision])
  const today = { key: todayKey, start: state.dayStart, end: state.dayEnd, extremes: state.extremes24h, points: state.timeline24h }
  const selected = selection === null || selection === todayKey ? today : days.find(day => day.key === selection) ?? today
  const isToday = selected.key === todayKey
  const dateLabel = (date: Date, options: Intl.DateTimeFormatOptions) => date.toLocaleDateString('en-GB', { timeZone: timezone, ...options })
  return <section id="tide-forecast" className="td-section">
    <div className="td-section-heading"><div><p className="td-eyebrow">01 / THE TIDE</p><h2>A rhythm, revealed.</h2></div><span className="td-zone">{timezone.replaceAll('_', ' ')}</span></div>
    <div className="td-surface td-outlook">
      <div className="td-outlook-top">
        <div className="td-curve-column">
          <div className="td-panel-heading"><h3>{isToday ? 'The shape of today' : dateLabel(selected.start, { weekday: 'long' })}</h3><span>{dateLabel(selected.start, { day: 'numeric', month: 'short' })}</span></div>
          <TideChart key={selected.key} points={selected.points} extremes={selected.extremes} station={state.station} settings={settings} now={isToday ? state.computedAt : undefined}/>
          <div className="td-chart-key"><span><i className="td-dot-accent"/>Predicted height</span><span><i className="td-dot-gold"/>High & low water</span>{isToday && <span><i className="td-dot-white"/>Now</span>}</div>
        </div>
        <div className="td-turns"><p className="td-eyebrow">THE TURNING POINTS</p>
          {selected.extremes.length === 0 && <p className="td-note">No high or low water falls on this local date.</p>}
          {selected.extremes.map(extreme => <div className="td-turn" key={+extreme.time}>
            <span className={'td-turn-icon ' + (extreme.type === 'high' ? 'is-high' : '')}><Icon name={extreme.type === 'high' ? 'up' : 'ebb'}/></span>
            <div><span>{extreme.type === 'high' ? 'High water' : 'Low water'}</span><strong>{formatTideTime(extreme.time, timezone, settings.timeFormat)}</strong></div><span className="td-turn-height">{formatHeight(extreme.height, settings.units)}</span>
          </div>)}
          <p className="td-turn-note">All times are local to this station.</p>
        </div>
      </div>
      <div className="td-week-heading"><div><p className="td-eyebrow">LOOK A LITTLE AHEAD</p><h3>Seven days by the sea</h3></div><div className="td-week-nav"><button className="td-icon-button" aria-label="Scroll to earlier days" onClick={() => strip.current?.scrollBy({ left: -300, behavior: 'smooth' })}><Icon name="left"/></button><button className="td-icon-button" aria-label="Scroll to later days" onClick={() => strip.current?.scrollBy({ left: 300, behavior: 'smooth' })}><Icon name="right"/></button></div></div>
      {error && <p className="td-error" role="alert">{error} <button className="td-text-button" onClick={() => setRevision(value => value + 1)}>Try again</button></p>}
      <div className="td-week" ref={strip} aria-label="Choose a forecast day">
        {days.length ? days.map((day, index) => {
          const heights = day.points.map(point => point.height)
          return <button key={day.key} className={'td-day ' + (selected.key === day.key ? 'is-selected' : '')} aria-pressed={selected.key === day.key} onClick={() => setSelection(day.key)}>
            <span className="td-day-name">{index === 0 ? 'Today' : dateLabel(day.start, { weekday: 'short' })}<span className="td-day-dot"/></span><span className="td-day-date">{dateLabel(day.start, { day: 'numeric', month: 'short' })}</span>
            <MiniCurve points={day.points}/><span className="td-day-height">{formatHeight(Math.max(...heights), settings.units, 1)}<span>peak</span></span>
          </button>
        }) : !error && Array.from({ length: 7 }, (_, index) => <div className="td-day td-skeleton" key={index} aria-hidden="true"/>)}
      </div>
      <p className="td-outlook-note">{state.station.type === 'subordinate' ? 'Secondary station · the curve is estimated between corrected high and low tides.' : 'Astronomical predictions · wind, waves and storm surge can change actual water levels.'}</p>
    </div>
  </section>
}
