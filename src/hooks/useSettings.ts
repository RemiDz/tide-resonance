'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Settings } from '@/types/settings'

const STORAGE_KEY = 'tr-settings'

function detectTimeFormat(): '12h' | '24h' {
  try {
    const formatted = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions()
    return formatted.hourCycle === 'h12' || formatted.hourCycle === 'h11' ? '12h' : '24h'
  } catch {
    return '12h'
  }
}

function loadSettings(): Settings {
  const defaults: Settings = {
    units: 'metres',
    timeFormat: detectTimeFormat(),
    droneEnabled: false,
    droneVolume: 50,
    droneFrequency: 432,
    alertsEnabled: false,
    alertTiming: 30,
    alertHigh: true,
    alertLow: true,
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Settings>
      return { ...defaults, ...parsed }
    }
  } catch {
    // ignore corrupt storage
  }
  return defaults
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  // Sync to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  return { settings, updateSetting }
}
