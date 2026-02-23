'use client'

import { useMemo } from 'react'
import { PARTICLES } from '@/lib/motion-constants'

// Seeded pseudo-random for consistent particle placement across renders
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

interface ParticleData {
  y: string
  size: string
  opacity: number
  duration: string
  delay: string
  color: string
  blur: string
  wanderY: string
  wanderX: string
  wanderX2: string
}

function generateParticles(): ParticleData[] {
  const rand = seededRandom(42)
  const particles: ParticleData[] = []

  for (let i = 0; i < PARTICLES.COUNT; i++) {
    const roll = rand()
    // 75% cyan, 25% faint violet
    const color = roll < 0.75
      ? `rgba(79, 195, 247, ${0.6 + rand() * 0.4})`
      : `rgba(121, 134, 203, ${0.5 + rand() * 0.5})`

    const size = PARTICLES.MIN_SIZE + rand() * (PARTICLES.MAX_SIZE - PARTICLES.MIN_SIZE)
    const opacity = PARTICLES.MIN_OPACITY + rand() * (PARTICLES.MAX_OPACITY - PARTICLES.MIN_OPACITY)
    const duration = PARTICLES.MIN_DURATION + rand() * (PARTICLES.MAX_DURATION - PARTICLES.MIN_DURATION)
    const delay = -(rand() * duration) // negative delay = start mid-animation
    const wanderY = 5 + rand() * 20 // vertical wander amplitude in px

    particles.push({
      y: `${5 + rand() * 90}%`,
      size: `${size}px`,
      opacity,
      duration: `${duration}s`,
      delay: `${delay}s`,
      color,
      blur: size > 2 ? '0.5px' : '0px',
      wanderY: `${wanderY}px`,
      wanderX: `${(rand() - 0.5) * 30}px`,
      wanderX2: `${(rand() - 0.5) * 20}px`,
    })
  }

  return particles
}

export function OceanBackground() {
  const particles = useMemo(() => generateParticles(), [])

  return (
    <>
      {/* Layer 1: Multi-stop radial gradient atmosphere */}
      <div className="ocean-atmosphere" aria-hidden="true" />

      {/* Layer 2: Water caustics — subtle shifting interference */}
      <div className="water-caustics" aria-hidden="true" />

      {/* Layer 3: Bioluminescent particles — drifting plankton */}
      <div className="particles-container" aria-hidden="true">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              '--y': p.y,
              '--size': p.size,
              '--particle-opacity': p.opacity,
              '--particle-color': p.color,
              '--particle-blur': p.blur,
              '--drift-duration': p.duration,
              '--drift-delay': p.delay,
              '--wander-y': p.wanderY,
              '--wander-x': p.wanderX,
              '--wander-x2': p.wanderX2,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Layer 4: Depth vignette — darker edges, light filtering from above */}
      <div className="depth-vignette" aria-hidden="true" />
    </>
  )
}
