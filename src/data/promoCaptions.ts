export interface CaptionVars {
  hook: string
  station: string
  phase: string
  qualities: string
  guidance: string
  height: string
}

export type Platform = 'instagram' | 'twitter' | 'tiktok' | 'whatsapp'

export function buildCaption(platform: Platform, vars: CaptionVars): string {
  const { hook, station, phase, qualities, guidance, height } = vars

  switch (platform) {
    case 'instagram':
      return `${hook} \u{1F30A}

The tide at ${station} is currently ${phase} — ${qualities}

${guidance}

Track tidal energy for your sound healing practice — link in bio \u{1F517}

#tidehealing #tidalrhythms #soundhealing #moonandtides #oceanhealing #432hz #528hz #frequencyhealing #soundhealingpractitioner #naturalrhythms #tidalenergy #coastalwellness #binauralbeats #energyhealing`

    case 'twitter':
      return `${hook} \u{1F30A}

${phase} at ${station}. ${guidance}

Track it live: tidara.app

#TidalResonance #SoundHealing #OceanEnergy`

    case 'tiktok':
      return `${hook} \u{1F30A}\u2728

Tide is ${phase} right now (${height}m). ${qualities}

Sound healers — are you tracking this? Link in bio \u{1F446}

#tidalhealing #soundhealing #oceanenergy #432hz #tidehealing #naturalrhythms #fyp`

    case 'whatsapp':
      return `Hey! The tide at ${station} is ${phase} right now (${height}m). ${guidance} If you work with natural cycles, check out tidara.app — it tracks tidal energy for practitioners. Free and works offline.`
  }
}
