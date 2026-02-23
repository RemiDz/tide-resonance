import type { TidalPhase } from '@/types/tidal'

// Phase colours per spec — bioluminescent deep ocean palette
const PHASE_COLOURS: Record<TidalPhase, string> = {
  RISING: '#4fc3f7',     // Bioluminescent cyan
  HIGH_SLACK: '#e0f7fa', // Bright white-cyan
  FALLING: '#7986cb',    // Deep indigo
  LOW_SLACK: '#1a237e',  // Abyssal navy
}

// Phase display labels — using spec terminology
const PHASE_LABELS: Record<TidalPhase, string> = {
  RISING: 'Rising Tide',
  HIGH_SLACK: 'High Water',
  FALLING: 'Ebbing Tide',
  LOW_SLACK: 'Low Water',
}

// Phase direction arrows
const PHASE_ARROWS: Record<TidalPhase, string> = {
  RISING: '\u2191',      // ↑
  HIGH_SLACK: '\u25C6',  // ◆
  FALLING: '\u2193',     // ↓
  LOW_SLACK: '\u25C7',   // ◇
}

export function getPhaseColour(phase: TidalPhase): string {
  return PHASE_COLOURS[phase]
}

export function getPhaseLabel(phase: TidalPhase): string {
  return PHASE_LABELS[phase]
}

export function getPhaseArrow(phase: TidalPhase): string {
  return PHASE_ARROWS[phase]
}

export function getPhaseCSS(phase: TidalPhase): string {
  const map: Record<TidalPhase, string> = {
    RISING: 'var(--phase-rising)',
    FALLING: 'var(--phase-falling)',
    HIGH_SLACK: 'var(--phase-high-slack)',
    LOW_SLACK: 'var(--phase-low-slack)',
  }
  return map[phase]
}
