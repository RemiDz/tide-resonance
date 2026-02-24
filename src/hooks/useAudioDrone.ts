'use client'

import { useEffect, useRef, useState } from 'react'
import type { Settings } from '@/types/settings'

export function useAudioDrone(settings: Settings) {
  const [isPlaying, setIsPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  // Start / stop drone
  useEffect(() => {
    if (!settings.droneEnabled) {
      // Stop if playing
      if (oscRef.current) {
        try { oscRef.current.stop() } catch { /* already stopped */ }
        oscRef.current.disconnect()
        oscRef.current = null
      }
      if (gainRef.current) {
        gainRef.current.disconnect()
        gainRef.current = null
      }
      if (ctxRef.current) {
        ctxRef.current.close()
        ctxRef.current = null
      }
      setIsPlaying(false)
      return
    }

    // Start drone
    try {
      const ctx = new AudioContext()
      const gain = ctx.createGain()
      gain.gain.value = (settings.droneVolume / 100) * 0.3
      gain.connect(ctx.destination)

      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = settings.droneFrequency
      osc.connect(gain)
      osc.start()

      ctxRef.current = ctx
      oscRef.current = osc
      gainRef.current = gain
      setIsPlaying(true)
    } catch {
      // AudioContext creation can fail (e.g. no user gesture yet)
      setIsPlaying(false)
    }

    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop() } catch { /* already stopped */ }
        oscRef.current.disconnect()
        oscRef.current = null
      }
      if (gainRef.current) {
        gainRef.current.disconnect()
        gainRef.current = null
      }
      if (ctxRef.current) {
        ctxRef.current.close()
        ctxRef.current = null
      }
      setIsPlaying(false)
    }
  }, [settings.droneEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update frequency without restarting
  useEffect(() => {
    if (oscRef.current && ctxRef.current) {
      oscRef.current.frequency.setValueAtTime(
        settings.droneFrequency,
        ctxRef.current.currentTime
      )
    }
  }, [settings.droneFrequency])

  // Update volume without restarting
  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setValueAtTime(
        (settings.droneVolume / 100) * 0.3,
        ctxRef.current.currentTime
      )
    }
  }, [settings.droneVolume])

  return { isPlaying }
}
