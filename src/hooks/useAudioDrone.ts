'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Settings } from '@/types/settings'
import type { TidalState } from '@/types/tidal'
import { createOceanDrone } from '@/lib/ocean-audio'

export function useAudioDrone(settings: Settings, tidalState: TidalState | null) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')
  const drone = useRef<ReturnType<typeof createOceanDrone> | null>(null)
  const generation = useRef(0)
  const stop = useCallback(() => {
    generation.current++
    drone.current?.dispose(); drone.current = null
    setIsPlaying(false); setIsStarting(false)
  }, [])
  const start = useCallback(async () => {
    const version = ++generation.current
    setError(''); setIsStarting(true)
    let ctx: AudioContext | undefined
    try {
      const AudioConstructor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioConstructor) throw new Error('Audio is unavailable in this browser.')
      if (!drone.current) {
        ctx = new AudioConstructor()
        drone.current = createOceanDrone(ctx)
      } else ctx = drone.current.ctx
      const current = drone.current
      current.update(settings, tidalState)
      // Called directly by the play button, while the user gesture is active.
      await ctx.resume()
      if (version !== generation.current) return false
      ctx.onstatechange = () => { if (version === generation.current) setIsPlaying(ctx?.state === 'running') }
      if (ctx.state !== 'running') throw new Error('Audio is paused by your browser. Tap play to try again.')
      setIsPlaying(true)
      return true
    } catch (reason) {
      if (version === generation.current) {
        drone.current?.dispose(); drone.current = null
        if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => {})
        setIsPlaying(false)
        setError(reason instanceof Error ? reason.message : 'Audio could not start. Tap play to try again.')
      }
      return false
    } finally { if (version === generation.current) setIsStarting(false) }
  }, [settings, tidalState])
  useEffect(() => { drone.current?.update(settings, tidalState) }, [settings, tidalState])
  useEffect(() => () => { generation.current++; drone.current?.dispose(); drone.current = null }, [])
  return { isPlaying, isStarting, error, start, stop }
}
