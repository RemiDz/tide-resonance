export interface Settings {
  // Display
  units: 'metres' | 'feet'
  timeFormat: '12h' | '24h'

  // Sound / Drone
  droneEnabled: boolean
  droneVolume: number          // 0-100
  droneFrequency: 432 | 440 | 528

  // Notifications
  alertsEnabled: boolean
  alertTiming: 15 | 30 | 60   // minutes before event
  alertHigh: boolean
  alertLow: boolean
}
