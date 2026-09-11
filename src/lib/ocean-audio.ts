import type { Settings } from '@/types/settings'
import type { TidalState } from '@/types/tidal'

/** A separate modulation bus keeps the user's master volume authoritative. */
export function createOceanDrone(ctx: AudioContext) {
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)
  const modulation = ctx.createGain()
  modulation.gain.value = 0.65
  modulation.connect(master)
  const sources: (OscillatorNode | AudioBufferSourceNode)[] = []
  const tone = (frequency: number, volume: number, pan = 0) => {
    const oscillator = ctx.createOscillator(), gain = ctx.createGain(), panner = ctx.createStereoPanner()
    oscillator.type = 'sine'; oscillator.frequency.value = frequency
    gain.gain.value = volume; panner.pan.value = pan
    oscillator.connect(gain); gain.connect(panner); panner.connect(modulation)
    sources.push(oscillator)
    return oscillator
  }
  const sub = tone(108, 0.25), left = tone(432, 0.15, -0.8), right = tone(435, 0.15, 0.8)
  const overtone = tone(648, 0.05)
  const noise = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), noiseGain = ctx.createGain()
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  noise.buffer = buffer; noise.loop = true
  filter.type = 'bandpass'; filter.frequency.value = 300; filter.Q.value = 0.5
  noiseGain.gain.value = 0.08
  noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(modulation)
  sources.push(noise)
  const lfo = ctx.createOscillator(), lfoGain = ctx.createGain()
  lfo.frequency.value = 0.07; lfoGain.gain.value = 0.18
  lfo.connect(lfoGain); lfoGain.connect(modulation.gain)
  sources.push(lfo)
  for (const source of sources) source.start()
  let disposed = false
  const ramp = (param: AudioParam, value: number, duration = 0.4) => {
    param.cancelScheduledValues(ctx.currentTime)
    param.setValueAtTime(param.value, ctx.currentTime)
    param.linearRampToValueAtTime(value, ctx.currentTime + duration)
  }
  return {
    ctx, master, modulation,
    update(settings: Settings, state: TidalState | null) {
      if (disposed) return
      const volume = Math.max(0, Math.min(100, settings.droneVolume)) / 100 * 0.3
      if (volume === 0) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(0, ctx.currentTime) }
      else ramp(master.gain, volume)
      ramp(sub.frequency, settings.droneFrequency / 4)
      ramp(left.frequency, settings.droneFrequency); ramp(right.frequency, settings.droneFrequency + 3)
      ramp(overtone.frequency, settings.droneFrequency * 1.5)
      const intensity = !state ? 0.5 : state.currentPhase === 'HIGH_SLACK' ? 1 : state.currentPhase === 'LOW_SLACK' ? 0 : state.currentPhase === 'RISING' ? state.phaseProgress : 1 - state.phaseProgress
      ramp(filter.frequency, 160 + Math.max(0, Math.min(1, intensity)) * 340, 2)
      ramp(lfo.frequency, 0.05 + Math.max(0, Math.min(1, intensity)) * 0.05, 2)
    },
    dispose() {
      if (disposed) return
      disposed = true
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(0, ctx.currentTime)
      ctx.onstatechange = null
      for (const source of sources) { try { source.stop(); source.disconnect() } catch { /* Already ended. */ } }
      master.disconnect(); modulation.disconnect()
      if (ctx.state !== 'closed') void ctx.close().catch(() => {})
    },
  }
}
