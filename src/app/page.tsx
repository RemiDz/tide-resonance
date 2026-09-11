'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { GeoLocation, TideStation } from '@/types/tidal'
import { useTidalState } from '@/hooks/useTidalState'
import { useSettings } from '@/hooks/useSettings'
import { useAudioDrone } from '@/hooks/useAudioDrone'
import { useTideNotifications } from '@/hooks/useTideNotifications'
import { DEFAULT_LOCATION, readStored, sanitizeLocation, storeValue } from '@/lib/settings'
import { findNearestStation } from '@/lib/tideEngine'
import { formatHeight, formatTideTime, heightValue, heightUnit } from '@/lib/tide-time'
import { Icon } from '@/components/Observatory/Icon'
import { TideOutlook } from '@/components/Observatory/TideOutlook'
import { Preferences } from '@/components/Observatory/Preferences'

const phases = {
  RISING: { label: 'The tide is rising', thought: 'Room for new beginnings.', description: 'As the water gathers, take a slow breath. Choose one small thing you would like to invite into your day.' },
  FALLING: { label: 'The tide is ebbing', thought: 'A moment to let go.', description: 'As the water recedes, soften your shoulders. Leave a little space for the things that can wait.' },
  HIGH_SLACK: { label: 'Near high water', thought: 'Be here, fully.', description: 'The water is close to its highest point. Pause for a moment and notice what is already around you.' },
  LOW_SLACK: { label: 'Near low water', thought: 'Stillness has its own rhythm.', description: 'The coast is opening up. Take a quiet moment to rest before the next tide begins.' },
}
function countdown(time: Date, now: Date) {
  const minutes = Math.max(0, Math.ceil((+time - +now) / 60000))
  return minutes >= 60 ? Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'm' : minutes + 'm'
}
function coordinate(value: number, positive: string, negative: string) { return Math.abs(value).toFixed(3) + '° ' + (value >= 0 ? positive : negative) }

export default function TidaraPage() {
  const { settings, updateSetting } = useSettings()
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [locating, setLocating] = useState(false), [locationError, setLocationError] = useState('')
  const locateVersion = useRef(0)
  useEffect(() => {
    const stored = sanitizeLocation(readStored('tidara-location'))
    // Hydrate browser storage after SSR, preserving the initial server markup.
    if (stored) setLocation(stored)
    // Cancel outstanding requests, using the current generation at unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { locateVersion.current++ }
  }, [])
  const { tidalState: state, error, refresh } = useTidalState(location)
  const audio = useAudioDrone(settings, state)
  const notifications = useTideNotifications(settings, state)
  const selectStation = useCallback((station: TideStation) => {
    locateVersion.current++
    setLocating(false); setLocationError('')
    const selected: GeoLocation = { latitude: station.latitude, longitude: station.longitude, stationId: station.id, source: 'manual', label: station.name }
    setLocation(selected); storeValue('tidara-location', selected); setPreferencesOpen(false)
  }, [])
  const locate = () => {
    setLocationError('')
    if (!navigator.geolocation) { setLocationError('Location is unavailable. Search for a coast instead.'); return }
    const version = ++locateVersion.current
    setLocating(true)
    navigator.geolocation.getCurrentPosition(position => {
      void findNearestStation(position.coords.latitude, position.coords.longitude).then(result => {
        if (version !== locateVersion.current) return
        if (!result) throw new Error('No tide station was found within 50 km. Search for a coast instead.')
        selectStation(result.station)
      }).catch(reason => {
        if (version === locateVersion.current) { setLocationError(reason instanceof Error ? reason.message : 'Your coast could not be found.'); setLocating(false) }
      })
    }, reason => {
      if (version !== locateVersion.current) return
      setLocating(false)
      setLocationError(reason.code === 1 ? 'Location access is turned off. Search for a coast or allow access in your browser.' : 'Your location could not be found. Try again or search for a coast.')
    }, { timeout: 10000, maximumAge: 300000 })
  }
  const closePreferences = () => { locateVersion.current++; setLocating(false); setPreferencesOpen(false) }
  const toggleAudio = async () => {
    if (audio.isPlaying) { audio.stop(); updateSetting('droneEnabled', false) }
    else if (await audio.start()) updateSetting('droneEnabled', true)
  }
  const toggleAlerts = async () => {
    if (settings.alertsEnabled && notifications.permissionState === 'granted') updateSetting('alertsEnabled', false)
    else updateSetting('alertsEnabled', await notifications.requestPermission())
  }
  const phase = state ? phases[state.currentPhase] : null
  const next = state ? [state.nextHigh, state.nextLow].filter(point => point !== null).sort((a, b) => +a.time - +b.time)[0] : null
  const stationTime = state ? formatTideTime(state.computedAt, state.station.timezone, settings.timeFormat) : ''
  return <div className="tidara">
    <a className="td-skip" href="#tide-forecast">Skip to tide forecast</a>
    <div className="td-backdrop" aria-hidden="true"><Image src="/images/tidara-coast.webp" alt="" fill priority sizes="100vw"/></div>
    <header className="td-header td-shell">
      <Link href="/" className="td-brand" aria-label="Tidara home"><Icon name="wave"/><span>tidara<span className="td-brand-period">.</span></span></Link>
      <nav className="td-nav" aria-label="Main navigation"><a href="#tide-forecast">Your coast</a><a href="#ocean-ritual">The ritual</a></nav>
      <button className="td-icon-button td-settings-button" aria-label="Open preferences" onClick={() => setPreferencesOpen(true)}><Icon name="settings"/></button>
    </header>
    <main className="td-shell">
      <section className="td-hero" aria-labelledby="hero-title">
        <div className="td-hero-copy"><p className="td-eyebrow"><span className="td-small-line"/>IN RHYTHM WITH THE OCEAN</p>
          <h1 id="hero-title">Let the tide<br/><em>set the pace.</em></h1>
          <p className="td-hero-intro">A quieter way to follow the water.<br/>Find your coast. Feel its rhythm.</p>
          <button className="td-coast-button" onClick={() => setPreferencesOpen(true)}><Icon name="pin"/><span>{state?.station.name ?? location.label ?? 'Choose your coast'}</span><Icon name="down"/></button>
          {state && phase ? <div className="td-hero-reading">
            <div className="td-height"><strong>{heightValue(state.currentHeight, settings.units).toFixed(2)}</strong><span>{heightUnit(settings.units)}<small>{state.station.datum}</small></span></div>
            <div className="td-phase"><span><i/>{phase.label}</span><small>{state.rateOfChange < 0 ? '−' : '+'}{formatHeight(Math.abs(state.rateOfChange), settings.units)} / hr</small></div>
          </div> : <div className="td-hero-loading" role="status"><span className="td-loading-line"/>{error ? 'Your coast is waiting.' : 'Finding the ocean’s rhythm…'}</div>}
          {error && <div className="td-inline-error" role="alert"><p>{error}</p><button className="td-text-button" onClick={refresh}>Try again</button><button className="td-text-button" onClick={() => setPreferencesOpen(true)}>Choose another coast</button></div>}
        </div>
        {state && next && <div className="td-orbit-card">
          <div className="td-orbit"><svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="104" fill="none" stroke="currentColor" strokeOpacity=".12"/><circle cx="110" cy="110" r="96" fill="none" stroke="currentColor" strokeOpacity=".15" strokeDasharray="1 7"/><circle cx="110" cy="110" r="104" fill="none" stroke="#d6c4a3" strokeWidth="1.8" strokeDasharray={653.45 * state.phaseProgress + ' 653.45'} transform="rotate(-90 110 110)"/></svg>
            <div className="td-orbit-content"><Icon name={next.type === 'high' ? 'up' : 'ebb'}/><span className="td-eyebrow">NEXT {next.type.toUpperCase()} WATER</span><strong>{formatTideTime(next.time, state.station.timezone, settings.timeFormat)}</strong><span className="td-orbit-countdown">in {countdown(next.time, state.computedAt)}</span></div>
          </div><span className="td-orbit-height">{formatHeight(next.height, settings.units)} <span>predicted height</span></span>
        </div>}
        <div className="td-hero-footer"><span>{state ? coordinate(state.station.latitude, 'N', 'S') + ' / ' + coordinate(state.station.longitude, 'E', 'W') : 'A COASTAL COMPANION'}</span><span className="td-prediction-status"><i/>{state ? 'PREDICTED TIDE · ' + stationTime + ' LOCAL' : 'TIDES · STILLNESS · SOUND'}</span></div>
      </section>
      {state && <TideOutlook key={state.station.id} state={state} settings={settings}/>}
      <section className="td-section" id="ocean-ritual">
        <div className="td-section-heading"><div><p className="td-eyebrow">02 / A MOMENT FOR YOU</p><h2>Come back to the present.</h2></div><span className="td-section-aside">Let the ocean be your invitation.</span></div>
        <div className="td-ritual-grid">
          <article className="td-reflection td-surface"><span className="td-reflection-mark"><Icon name="wave"/></span><p className="td-eyebrow">{phase?.label ?? 'A SMALL DAILY RITUAL'}</p><h3>{phase?.thought ?? 'A little space to breathe.'}</h3><p>{phase?.description ?? 'Pause for a moment. Follow the water, take a slow breath and return to your day with a little more space.'}</p><span className="td-reflection-foot">A reflection inspired by the tide.</span></article>
          <article className="td-sound td-surface">
            <div className="td-sound-heading"><div><p className="td-eyebrow">THE SOUND OF STILLNESS</p><h3>Ocean resonance</h3></div><span className={'td-sound-status ' + (audio.isPlaying ? 'is-playing' : '')}>{audio.isPlaying ? 'PLAYING' : 'READY WHEN YOU ARE'}</span></div>
            <div className="td-sound-player"><button className="td-play" aria-label={audio.isPlaying ? 'Pause ocean resonance' : 'Play ocean resonance'} onClick={() => void toggleAudio()} disabled={audio.isStarting}><Icon name={audio.isPlaying ? 'pause' : 'play'}/></button>
              <div className={'td-waveform ' + (audio.isPlaying ? 'is-playing' : '')} aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <i key={i} style={{ height: 8 + Math.abs(Math.sin(i * 1.73)) * 34, animationDelay: -(i % 7) * 0.21 + 's' }}/>)}</div>
              <div className="td-frequency-value">{settings.droneFrequency}<span>Hz</span></div>
            </div>
            <p className="td-note">Layered tones and a soft ocean texture, gently shaped by the tide.</p>
            <div className="td-sound-controls"><div className="td-segment" role="group" aria-label="Sound frequency">{([432, 440, 528] as const).map(frequency => <button key={frequency} aria-pressed={settings.droneFrequency === frequency} onClick={() => updateSetting('droneFrequency', frequency)}>{frequency} Hz</button>)}</div><label className="td-volume">Volume <input type="range" min="0" max="100" value={settings.droneVolume} onChange={event => updateSetting('droneVolume', Number(event.target.value))}/><output>{settings.droneVolume}%</output></label></div>
            {audio.error && <p className="td-error" role="alert">{audio.error}</p>}
          </article>
        </div>
      </section>
      <footer className="td-footer"><div className="td-footer-top"><Link href="/" className="td-brand"><Icon name="wave"/><span>tidara.</span></Link><p>The ocean moves. You find your rhythm.</p><span className="td-made-by">By Harmonic Waves</span></div>
        <details className="td-data-details"><summary>About these tides <Icon name="down"/></summary><div><p>Tidara calculates astronomical tide predictions and updates the current reading every minute while open. Heights are relative to the station’s stated vertical datum. These are predictions, not measured water levels; use official local information for navigation and coastal safety.</p>
          {state && <p>Station: {state.station.name} · {state.station.type === 'reference' ? 'Harmonic reference station' : 'Secondary station with corrected high and low tides; its continuous curve is an approximation'} · Datum: {state.station.datum}. Source: <a href={state.station.sourceUrl} target="_blank" rel="noopener noreferrer">{state.station.source}</a>.</p>}
          <p>Tide harmonic constituents from the <a href="https://github.com/openwatersio/tide-database" target="_blank" rel="noopener noreferrer">Neaps tide database</a>. The seascape is an artistic backdrop and does not depict current conditions. Sound and reflections are offered for personal relaxation.</p></div></details>
        <div className="td-footer-bottom"><span>MADE FOR A SLOWER MOMENT</span><span>FOLLOW THE WATER.</span></div>
      </footer>
    </main>
    <Preferences open={preferencesOpen} onClose={closePreferences} station={state?.station} settings={settings} onUpdate={updateSetting} onSelect={selectStation} onLocate={locate} locating={locating} locationError={locationError} notificationPermission={notifications.permissionState} onToggleAlerts={() => void toggleAlerts()} notificationError={notifications.error}/>
  </div>
}
