'use client'

import { useEffect, useRef, useState } from 'react'
import type { Settings } from '@/types/settings'
import type { TidalState } from '@/types/tidal'

type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

export function useTideNotifications(settings: Settings, tidalState: TidalState | null) {
  const [permissionState, setPermissionState] = useState<PermissionState>('default')
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Check initial permission state
  useEffect(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      setPermissionState('unsupported')
      return
    }
    setPermissionState(Notification.permission as PermissionState)
  }, [])

  // Request permission when alerts enabled
  useEffect(() => {
    if (!settings.alertsEnabled) return
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'granted') {
      setPermissionState('granted')
      return
    }
    if (Notification.permission === 'denied') {
      setPermissionState('denied')
      return
    }

    Notification.requestPermission().then((result) => {
      setPermissionState(result as PermissionState)
    })
  }, [settings.alertsEnabled])

  // Schedule notifications
  useEffect(() => {
    // Clear existing timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    if (!settings.alertsEnabled || !tidalState) return
    if (permissionState !== 'granted') return

    const now = Date.now()
    const offsetMs = settings.alertTiming * 60 * 1000

    const schedule = (extreme: { time: Date; type: 'high' | 'low' } | null, label: string) => {
      if (!extreme) return
      const fireAt = extreme.time.getTime() - offsetMs
      const delay = fireAt - now
      if (delay <= 0) return

      const timer = setTimeout(() => {
        new Notification('Tide Resonance', {
          body: `${label} in ${settings.alertTiming} minutes at ${tidalState.station.name}`,
        })
      }, delay)

      timersRef.current.push(timer)
    }

    if (settings.alertHigh) schedule(tidalState.nextHigh, 'High Water')
    if (settings.alertLow) schedule(tidalState.nextLow, 'Low Water')

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [
    settings.alertsEnabled,
    settings.alertTiming,
    settings.alertHigh,
    settings.alertLow,
    tidalState,
    permissionState,
  ])

  return { permissionState }
}
