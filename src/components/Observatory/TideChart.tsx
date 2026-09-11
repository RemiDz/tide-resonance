'use client'
import { useEffect, useId, useRef, useState } from 'react'
import type { TideExtreme, TidePoint, TideStation } from '@/types/tidal'
import type { Settings } from '@/types/settings'
import { formatHeight, formatTideTime, heightValue, heightUnit } from '@/lib/tide-time'

interface Props { points: TidePoint[]; extremes: TideExtreme[]; station: TideStation; settings: Settings; now?: Date }
export function TideChart({ points, extremes, station, settings, now }: Props) {
  const gradient = useId().replaceAll(':', '')
  const [cursor, setCursor] = useState<number | null>(null)
  const container = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(720)
  useEffect(() => {
    if (!container.current || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(entries => {
      const measured = entries[0]?.contentRect.width
      if (measured) setWidth(Math.max(280, Math.round(measured)))
    })
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  if (points.length < 2) return <p className="td-note">No curve is available for this day.</p>
  const W = width, H = 238, left = width < 450 ? 34 : 48, right = W - 16, top = 28, bottom = H - 36
  const start = +points[0].time, end = +points[points.length - 1].time
  const values = [...points, ...extremes].map(point => heightValue(point.height, settings.units))
  const min = Math.floor(Math.min(...values) * 2) / 2 - 0.15
  const max = Math.ceil(Math.max(...values) * 2) / 2 + 0.15
  const x = (time: Date) => left + ((+time - start) / (end - start)) * (right - left)
  const y = (height: number) => bottom - ((heightValue(height, settings.units) - min) / (max - min)) * (bottom - top)
  const curve = points.map((point, i) => (i ? 'L' : 'M') + x(point.time).toFixed(2) + ',' + y(point.height).toFixed(2)).join(' ')
  const selected = cursor === null ? null : points[Math.min(points.length - 1, cursor)]
  const current = now && +now >= start && +now < end ? points.reduce((best, point) => Math.abs(+point.time - +now) < Math.abs(+best.time - +now) ? point : best) : null
  const highlight = selected ?? current
  const inspect = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const position = ((event.clientX - rect.left) / rect.width * W - left) / (right - left)
    setCursor(Math.round(Math.max(0, Math.min(1, position)) * (points.length - 1)))
  }
  return <div className="td-chart" ref={container}>
    <div className="td-chart-caption"><span>HEIGHT · {heightUnit(settings.units).toUpperCase()} / {station.datum}</span>
      <span aria-live="polite">{selected ? formatTideTime(selected.time, station.timezone, settings.timeFormat) + ' · ' + formatHeight(selected.height, settings.units) : 'Touch the curve to explore'}</span>
    </div>
    <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label={'Predicted tide curve for ' + station.name + '. Exact high and low tides are listed alongside.'}
      onPointerMove={inspect} onPointerDown={inspect} onPointerLeave={() => setCursor(null)}>
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#98d4c4" stopOpacity=".24"/><stop offset="100%" stopColor="#98d4c4" stopOpacity="0"/></linearGradient></defs>
      {[0, 1, 2, 3].map(i => {
        const value = min + (max - min) * i / 3
        const position = bottom - (bottom - top) * i / 3
        return <g key={i}><line x1={left} x2={right} y1={position} y2={position} stroke="currentColor" opacity=".09" strokeDasharray="3 6"/><text x={left - 12} y={position + 4} textAnchor="end">{value.toFixed(1)}</text></g>
      })}
      <path d={curve + ' L' + right + ',' + bottom + ' L' + left + ',' + bottom + ' Z'} fill={'url(#' + gradient + ')'}/>
      <path d={curve} fill="none" stroke="#abdcca" strokeWidth="2" strokeLinejoin="round"/>
      {extremes.map(point => <g key={+point.time}><circle cx={x(point.time)} cy={y(point.height)} r="4" fill="#0c2227" stroke="#dbccad" strokeWidth="1.5"/><text x={x(point.time)} y={y(point.height) + (point.type === 'high' ? -12 : 21)} textAnchor="middle" className="td-chart-turn">{point.type === 'high' ? 'H' : 'L'}</text></g>)}
      {highlight && <g><line x1={x(highlight.time)} x2={x(highlight.time)} y1={top} y2={bottom} stroke="#d9c5a3" opacity=".5" strokeDasharray="3 4"/><circle cx={x(highlight.time)} cy={y(highlight.height)} r="10" fill="#cde5d9" opacity=".12"/><circle cx={x(highlight.time)} cy={y(highlight.height)} r="4" fill="#f6ecd9"/></g>}
      {[0, 1, 2, 3, 4].map(i => {
        const date = new Date(start + (end - start) * i / 4)
        return <text key={i} x={left + (right - left) * i / 4} y={H - 8} textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}>{formatTideTime(date, station.timezone, settings.timeFormat)}</text>
      })}
    </svg>
    <input className="td-chart-access" aria-label="Explore the predicted tide by time" type="range" min="0" max={points.length - 1} value={cursor ?? 0}
      aria-valuetext={formatTideTime(points[cursor ?? 0].time, station.timezone, settings.timeFormat) + ', ' + formatHeight(points[cursor ?? 0].height, settings.units)}
      onChange={event => setCursor(Number(event.target.value))} onBlur={() => setCursor(null)}/>
  </div>
}

export function MiniCurve({ points }: { points: TidePoint[] }) {
  const heights = points.map(point => point.height)
  const min = Math.min(...heights), range = Math.max(...heights) - min || 1
  const path = points.map((point, i) => (i ? 'L' : 'M') + (i / (points.length - 1) * 130).toFixed(1) + ',' + (33 - (point.height - min) / range * 26).toFixed(1)).join(' ')
  return <svg className="td-mini-curve" viewBox="0 0 130 40" aria-hidden="true"><path d={path} fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
}
