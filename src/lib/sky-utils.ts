import SunCalc from 'suncalc'

export interface SkyState {
  timeOfDay: 'night' | 'dawn' | 'day' | 'dusk'
  skyGradient: [string, string, string]
  moonPhase: number      // 0–1 (0 = new, 0.5 = full)
  moonFraction: number   // illuminated fraction 0–1
  moonAltitude: number   // radians — positive = above horizon
}

const SKY_GRADIENTS: Record<string, [string, string, string]> = {
  night: ['#030610', '#050a18', '#0a1628'],
  dawn:  ['#1a1030', '#2d1b4e', '#4a2040'],
  day:   ['#0a1628', '#15294d', '#1e3a5f'],
  dusk:  ['#0d0a1e', '#1a1040', '#2a1535'],
}

export function computeSkyState(now: Date, lat: number, lon: number): SkyState {
  const times = SunCalc.getTimes(now, lat, lon)
  const moonIllum = SunCalc.getMoonIllumination(now)
  const moonPos = SunCalc.getMoonPosition(now, lat, lon)

  const t = now.getTime()

  let timeOfDay: SkyState['timeOfDay'] = 'night'
  if (t >= times.dawn.getTime() && t < times.sunrise.getTime()) {
    timeOfDay = 'dawn'
  } else if (t >= times.sunrise.getTime() && t < times.sunset.getTime()) {
    timeOfDay = 'day'
  } else if (t >= times.sunset.getTime() && t < times.dusk.getTime()) {
    timeOfDay = 'dusk'
  }

  return {
    timeOfDay,
    skyGradient: SKY_GRADIENTS[timeOfDay],
    moonPhase: moonIllum.phase,
    moonFraction: moonIllum.fraction,
    moonAltitude: moonPos.altitude,
  }
}
