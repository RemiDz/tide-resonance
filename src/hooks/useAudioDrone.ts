'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Settings } from '@/types/settings'
import type { TidalPhase, TidalState } from '@/types/tidal'

// ---------------------------------------------------------------------------
// Noise buffer helper
// ---------------------------------------------------------------------------

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * seconds
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

// ---------------------------------------------------------------------------
// Ocean drone graph
// ---------------------------------------------------------------------------

interface OceanDrone {
  masterGain: GainNode
  sub: OscillatorNode
  binauralLeft: OscillatorNode
  binauralRight: OscillatorNode
  overtone: OscillatorNode
  noise: AudioBufferSourceNode
  lfo: OscillatorNode
  overtoneGain: GainNode
  noiseFilter: BiquadFilterNode
  noiseGain: GainNode
  lfoNode: OscillatorNode
  ctx: AudioContext
}

function createOceanDrone(baseFreq: number, volume: number): OceanDrone {
  const ctx = new AudioContext()

  // Master gain — fade in over 2 seconds
  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0, ctx.currentTime)
  masterGain.gain.linearRampToValueAtTime(
    (volume / 100) * 0.3,
    ctx.currentTime + 2
  )
  masterGain.connect(ctx.destination)

  // === LAYER 1: Deep sub-drone ===
  const sub = ctx.createOscillator()
  sub.type = 'sine'
  sub.frequency.value = baseFreq / 4
  const subGain = ctx.createGain()
  subGain.gain.value = 0.25
  sub.connect(subGain)
  subGain.connect(masterGain)

  // === LAYER 2: Binaural beat pair ===
  const binauralLeft = ctx.createOscillator()
  const binauralRight = ctx.createOscillator()
  binauralLeft.type = 'sine'
  binauralRight.type = 'sine'
  binauralLeft.frequency.value = baseFreq
  binauralRight.frequency.value = baseFreq + 3 // 3 Hz binaural beat

  const panLeft = ctx.createStereoPanner()
  const panRight = ctx.createStereoPanner()
  panLeft.pan.value = -0.8
  panRight.pan.value = 0.8

  const binauralGain = ctx.createGain()
  binauralGain.gain.value = 0.15

  binauralLeft.connect(panLeft)
  binauralRight.connect(panRight)
  panLeft.connect(binauralGain)
  panRight.connect(binauralGain)
  binauralGain.connect(masterGain)

  // === LAYER 3: Harmonic overtone (perfect fifth) ===
  const overtone = ctx.createOscillator()
  overtone.type = 'sine'
  overtone.frequency.value = baseFreq * 1.5
  const overtoneGain = ctx.createGain()
  overtoneGain.gain.value = 0.06
  overtone.connect(overtoneGain)
  overtoneGain.connect(masterGain)

  // === LAYER 4: Ocean texture — filtered noise ===
  const noiseBuffer = createNoiseBuffer(ctx, 2)
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer
  noise.loop = true

  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = 300
  noiseFilter.Q.value = 0.5

  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.08

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(masterGain)

  // === LAYER 5: Slow LFO modulation ===
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.07 // ~14 second cycle
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.08
  lfo.connect(lfoGain)
  lfoGain.connect(masterGain.gain) // Modulate master volume

  // Start everything
  sub.start()
  binauralLeft.start()
  binauralRight.start()
  overtone.start()
  noise.start()
  lfo.start()

  return {
    masterGain,
    sub,
    binauralLeft,
    binauralRight,
    overtone,
    noise,
    lfo,
    overtoneGain,
    noiseFilter,
    noiseGain,
    lfoNode: lfo,
    ctx,
  }
}

// ---------------------------------------------------------------------------
// Phase-based sound modulation
// ---------------------------------------------------------------------------

function updatePhaseSound(
  drone: OceanDrone,
  phase: TidalPhase,
  progress: number
) {
  const t = drone.ctx.currentTime

  switch (phase) {
    case 'RISING':
      // Gradually increase harmonic richness and brightness
      drone.overtoneGain.gain.linearRampToValueAtTime(0.06 + progress * 0.06, t + 2)
      drone.noiseFilter.frequency.linearRampToValueAtTime(300 + progress * 200, t + 2)
      drone.noiseGain.gain.linearRampToValueAtTime(0.08 + progress * 0.04, t + 2)
      drone.lfoNode.frequency.linearRampToValueAtTime(0.07 + progress * 0.03, t + 2)
      break
    case 'HIGH_SLACK':
      // Maximum richness, widest sound
      drone.overtoneGain.gain.linearRampToValueAtTime(0.12, t + 2)
      drone.noiseFilter.frequency.linearRampToValueAtTime(500, t + 2)
      drone.noiseGain.gain.linearRampToValueAtTime(0.12, t + 2)
      drone.lfoNode.frequency.linearRampToValueAtTime(0.1, t + 2)
      break
    case 'FALLING':
      // Gradually reduce, darken the sound
      drone.overtoneGain.gain.linearRampToValueAtTime(0.06 - progress * 0.04, t + 2)
      drone.noiseFilter.frequency.linearRampToValueAtTime(300 - progress * 150, t + 2)
      drone.noiseGain.gain.linearRampToValueAtTime(0.08 - progress * 0.04, t + 2)
      drone.lfoNode.frequency.linearRampToValueAtTime(0.07 - progress * 0.02, t + 2)
      break
    case 'LOW_SLACK':
      // Minimal, deep, almost silent
      drone.overtoneGain.gain.linearRampToValueAtTime(0.02, t + 2)
      drone.noiseFilter.frequency.linearRampToValueAtTime(150, t + 2)
      drone.noiseGain.gain.linearRampToValueAtTime(0.04, t + 2)
      drone.lfoNode.frequency.linearRampToValueAtTime(0.05, t + 2)
      break
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAudioDrone(settings: Settings, tidalState: TidalState | null) {
  const [isPlaying, setIsPlaying] = useState(false)
  const droneRef = useRef<OceanDrone | null>(null)

  // Stop helper — fade out over 1 second, then cleanup
  const stopDrone = useCallback(() => {
    const drone = droneRef.current
    if (!drone) return
    droneRef.current = null

    const t = drone.ctx.currentTime
    drone.masterGain.gain.linearRampToValueAtTime(0, t + 1)

    setTimeout(() => {
      try {
        drone.sub.stop()
        drone.binauralLeft.stop()
        drone.binauralRight.stop()
        drone.overtone.stop()
        drone.noise.stop()
        drone.lfo.stop()
      } catch { /* already stopped */ }
      drone.ctx.close()
    }, 1100)

    setIsPlaying(false)
  }, [])

  // Start / stop based on droneEnabled
  useEffect(() => {
    if (!settings.droneEnabled) {
      stopDrone()
      return
    }

    // Start drone
    try {
      const drone = createOceanDrone(settings.droneFrequency, settings.droneVolume)
      droneRef.current = drone
      setIsPlaying(true)

      // Apply current phase immediately if available
      if (tidalState) {
        updatePhaseSound(drone, tidalState.currentPhase, tidalState.phaseProgress)
      }
    } catch {
      setIsPlaying(false)
    }

    return () => {
      stopDrone()
    }
  }, [settings.droneEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update base frequency — requires rebuilding oscillators
  useEffect(() => {
    const drone = droneRef.current
    if (!drone) return
    const t = drone.ctx.currentTime
    const baseFreq = settings.droneFrequency

    drone.sub.frequency.linearRampToValueAtTime(baseFreq / 4, t + 1)
    drone.binauralLeft.frequency.linearRampToValueAtTime(baseFreq, t + 1)
    drone.binauralRight.frequency.linearRampToValueAtTime(baseFreq + 3, t + 1)
    drone.overtone.frequency.linearRampToValueAtTime(baseFreq * 1.5, t + 1)
  }, [settings.droneFrequency])

  // Update volume
  useEffect(() => {
    const drone = droneRef.current
    if (!drone) return
    const t = drone.ctx.currentTime
    drone.masterGain.gain.linearRampToValueAtTime(
      (settings.droneVolume / 100) * 0.3,
      t + 0.5
    )
  }, [settings.droneVolume])

  // Update tidal phase modulation
  useEffect(() => {
    const drone = droneRef.current
    if (!drone || !tidalState) return
    updatePhaseSound(drone, tidalState.currentPhase, tidalState.phaseProgress)
  }, [tidalState?.currentPhase, tidalState?.phaseProgress])

  return { isPlaying }
}
