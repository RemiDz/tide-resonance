'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Settings } from '@/types/settings'
import type { TidalState } from '@/types/tidal'
export type NotificationPermissionState = NotificationPermission | 'unsupported'

export function useTideNotifications(settings: Settings, tidalState: TidalState | null) {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('default')
  const [error, setError] = useState('')
  const fired = useRef(new Set<string>())
  useEffect(() => {
    // Read browser permission only after hydration; this never requests it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPermissionState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)
  }, [])
  const requestPermission = useCallback(async () => {
    setError('')
    if (typeof Notification === 'undefined') { setPermissionState('unsupported'); return false }
    try {
      const result = await Notification.requestPermission()
      setPermissionState(result)
      return result === 'granted'
    } catch { setPermissionState('unsupported'); setError('Tide reminders are not supported in this browser.'); return false }
  }, [])
  const stationId = tidalState?.station.id, stationName = tidalState?.station.name
  const nextHigh = tidalState?.nextHigh?.time.getTime(), nextLow = tidalState?.nextLow?.time.getTime()
  useEffect(() => {
    if (!settings.alertsEnabled || permissionState !== 'granted' || !stationId) return
    const timers: ReturnType<typeof setTimeout>[] = []
    for (const [time, type, enabled] of [[nextHigh, 'High', settings.alertHigh], [nextLow, 'Low', settings.alertLow]] as const) {
      if (time === undefined || !enabled) continue
      const key = stationId + ':' + time + ':' + settings.alertTiming
      const delay = time - settings.alertTiming * 60000 - Date.now()
      if (delay < -60000 || fired.current.has(key)) continue
      timers.push(setTimeout(() => {
        // A suspended mobile page may wake after the turn has passed.
        if (Date.now() >= time || fired.current.has(key)) return
        fired.current.add(key)
        if (fired.current.size > 100) fired.current.delete(fired.current.values().next().value!)
        try {
          new Notification('Tidara · ' + type.toLowerCase() + ' water', {
            body: type + ' water in about ' + Math.max(1, Math.round((time - Date.now()) / 60000)) + ' minutes at ' + stationName,
            tag: key,
          })
        } catch { setError('This browser cannot deliver tide reminders.'); setPermissionState('unsupported') }
      }, Math.max(0, delay)))
    }
    return () => timers.forEach(clearTimeout)
  }, [settings.alertsEnabled, settings.alertTiming, settings.alertHigh, settings.alertLow, permissionState, stationId, stationName, nextHigh, nextLow])
  return { permissionState, requestPermission, error }
}
