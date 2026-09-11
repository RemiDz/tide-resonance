'use client'
import { useEffect, useRef, useState } from 'react'
import type { Settings } from '@/types/settings'
import type { TideStation } from '@/types/tidal'
import type { NotificationPermissionState } from '@/hooks/useTideNotifications'
import { searchStations, findNearestStation } from '@/lib/tideEngine'
import { curatedStations } from '@/data/stations'
import { BottomSheet } from '@/components/BottomSheet'
import { Icon } from './Icon'

type Update = <K extends keyof Settings>(key: K, value: Settings[K]) => void
interface Props {
  open: boolean; onClose: () => void; station?: TideStation; settings: Settings; onUpdate: Update
  onSelect: (station: TideStation) => void; onLocate: () => void; locating: boolean; locationError: string
  notificationPermission: NotificationPermissionState; onToggleAlerts: () => void; notificationError: string
}
export function Preferences(props: Props) {
  const { open, onClose, settings, onUpdate } = props
  const [query, setQuery] = useState(''), [results, setResults] = useState<TideStation[]>([])
  const [searching, setSearching] = useState(false), [error, setError] = useState('')
  const [choosing, setChoosing] = useState(false)
  const selection = useRef(0)
  useEffect(() => {
    if (!open) return
    setQuery(''); setResults([]); setError(''); setChoosing(false)
    // Invalidate pending selections against the latest generation on close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { selection.current++ }
  }, [open])
  useEffect(() => {
    if (!open) return
    let active = true
    setResults([]); setError('')
    if (query.trim().length < 2) { setSearching(false); return }
    setSearching(true)
    const timer = setTimeout(() => {
      void searchStations(query).then(stations => { if (active) setResults(stations) })
        .catch(() => { if (active) setError('Station search is unavailable. Please try again.') })
        .finally(() => { if (active) setSearching(false) })
    }, 240)
    return () => { active = false; clearTimeout(timer) }
  }, [query, open])
  const chooseCoast = async (latitude: number, longitude: number) => {
    const version = ++selection.current
    setChoosing(true); setError('')
    try {
      const result = await findNearestStation(latitude, longitude)
      if (version !== selection.current) return
      if (!result) throw new Error('No nearby tide station was found.')
      props.onSelect(result.station)
    } catch (reason) { if (version === selection.current) setError(reason instanceof Error ? reason.message : 'This coast could not be loaded.') }
    finally { if (version === selection.current) setChoosing(false) }
  }
  return <BottomSheet open={open} onClose={onClose} label="Your coast and preferences">
    <div className="td-preferences">
      <div className="td-dialog-heading"><div><p className="td-eyebrow">MAKE IT YOURS</p><h2>Your coast, your rhythm.</h2></div><button className="td-icon-button" onClick={onClose} aria-label="Close preferences"><Icon name="close"/></button></div>
      <section className="td-settings-section">
        <h3>Find your coast</h3>
        {props.station && <p className="td-note">Following {props.station.name}</p>}
        <label className="td-search"><Icon name="search"/><input autoComplete="off" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a harbour, town or station" aria-label="Search tide stations"/></label>
        <button className="td-location-action" onClick={props.onLocate} disabled={props.locating || choosing}><Icon name="locate"/>{props.locating ? 'Finding your coast…' : 'Use my location'}<Icon name="right"/></button>
        {props.locationError && <p className="td-error" role="alert">{props.locationError}</p>}
        {searching && <p className="td-note" role="status">Searching the coastline…</p>}
        {error && <p className="td-error" role="alert">{error}</p>}
        {query.trim().length >= 2 ? <div className="td-search-results">
          {!searching && !results.length && !error && <p className="td-note">No stations found. Try a nearby harbour or a shorter name.</p>}
          {results.map(station => <button key={station.id} className="td-station-result" onClick={() => { selection.current++; props.onSelect(station) }}>
            <span><strong>{station.name}</strong><small>{station.country} · {station.timezone.replaceAll('_', ' ')}{station.type === 'subordinate' ? ' · Secondary' : ''}</small></span><Icon name={station.id === props.station?.id ? 'check' : 'right'}/>
          </button>)}
        </div> : <><p className="td-eyebrow td-explore-label">OR EXPLORE A COAST</p><div className="td-coast-chips">{curatedStations.filter(station => ['Whitby', 'Lisbon', 'Reykjavik', 'San Francisco', 'Sydney', 'Cape Town'].includes(station.name)).map(station =>
          <button key={station.name} disabled={choosing || props.locating} onClick={() => void chooseCoast(station.latitude, station.longitude)}>{station.name}</button>)}</div>{choosing && <p className="td-note" role="status">Opening this coast…</p>}</>}
      </section>
      <section className="td-settings-section"><h3>The details</h3>
        <div className="td-setting-row"><span>Water height</span><div className="td-segment" role="group" aria-label="Water height units">{(['metres', 'feet'] as const).map(value => <button key={value} aria-pressed={settings.units === value} onClick={() => onUpdate('units', value)}>{value === 'metres' ? 'Metres' : 'Feet'}</button>)}</div></div>
        <div className="td-setting-row"><span>Clock format</span><div className="td-segment" role="group" aria-label="Clock format">{(['12h', '24h'] as const).map(value => <button key={value} aria-pressed={settings.timeFormat === value} onClick={() => onUpdate('timeFormat', value)}>{value === '12h' ? '12 hour' : '24 hour'}</button>)}</div></div>
      </section>
      <section className="td-settings-section"><div className="td-setting-row"><h3>Tide reminders</h3><button className="td-switch" role="switch" aria-label="Tide reminders" aria-checked={settings.alertsEnabled && props.notificationPermission === 'granted'} disabled={props.notificationPermission === 'unsupported'} onClick={props.onToggleAlerts}><span/></button></div>
        <p className="td-note">Reminders work while Tidara stays open. Mobile browsers may pause them in the background.</p>
        {props.notificationPermission === 'denied' && <p className="td-note">Notifications are blocked in your browser settings.</p>}
        {props.notificationPermission === 'unsupported' && <p className="td-note">Reminders are unavailable in this browser.</p>}
        {props.notificationError && <p className="td-error" role="alert">{props.notificationError}</p>}
        {settings.alertsEnabled && props.notificationPermission === 'granted' && <><div className="td-setting-row"><span>Remind me before</span><div className="td-segment" role="group" aria-label="Reminder timing">{([15, 30, 60] as const).map(minutes => <button key={minutes} aria-pressed={settings.alertTiming === minutes} onClick={() => onUpdate('alertTiming', minutes)}>{minutes}m</button>)}</div></div>
          <div className="td-reminder-types"><label><input type="checkbox" checked={settings.alertHigh} onChange={event => onUpdate('alertHigh', event.target.checked)}/>High water</label><label><input type="checkbox" checked={settings.alertLow} onChange={event => onUpdate('alertLow', event.target.checked)}/>Low water</label></div></>}
      </section>
      <p className="td-settings-credit">A little closer to the ocean.</p>
    </div>
  </BottomSheet>
}
