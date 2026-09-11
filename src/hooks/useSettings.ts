'use client'
import { useState, useCallback, useEffect } from 'react'
import type { Settings } from '@/types/settings'
import { DEFAULT_SETTINGS, readStored, sanitizeSettings, storeValue } from '@/lib/settings'
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  // Storage is browser-only; hydrate after the server-compatible first render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSettings(sanitizeSettings(readStored('tr-settings'))) }, [])
  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(previous => {
      const next = sanitizeSettings({ ...previous, [key]: value })
      storeValue('tr-settings', next)
      return next
    })
  }, [])
  return { settings, updateSetting }
}
