'use client'

interface BioParticlesProps {
  phaseColour: string
}

// 12 procedurally configured particles
const PARTICLES = [
  { left: '8%',  bottom: '10%', size: 2,   dur: '4s',   delay: '0s' },
  { left: '15%', bottom: '22%', size: 1.5, dur: '5.5s', delay: '0.5s' },
  { left: '22%', bottom: '14%', size: 2.5, dur: '6s',   delay: '1.2s' },
  { left: '30%', bottom: '8%',  size: 2,   dur: '4.5s', delay: '0.3s' },
  { left: '38%', bottom: '18%', size: 1.5, dur: '5s',   delay: '2.1s' },
  { left: '45%', bottom: '12%', size: 3,   dur: '7s',   delay: '0.8s' },
  { left: '53%', bottom: '26%', size: 2,   dur: '5.5s', delay: '1.5s' },
  { left: '60%', bottom: '9%',  size: 1.5, dur: '4.8s', delay: '0.2s' },
  { left: '68%', bottom: '20%', size: 2.5, dur: '6.5s', delay: '1.8s' },
  { left: '75%', bottom: '15%', size: 2,   dur: '5s',   delay: '0.6s' },
  { left: '82%', bottom: '28%', size: 1.5, dur: '4.2s', delay: '2.5s' },
  { left: '90%', bottom: '11%', size: 2,   dur: '6s',   delay: '1.0s' },
]

export function BioParticles({ phaseColour }: BioParticlesProps) {
  return (
    <>
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: phaseColour,
            opacity: 0.25,
            animation: `bioPulse ${p.dur} ease-in-out infinite ${p.delay}`,
            boxShadow: `0 0 ${p.size * 2}px ${phaseColour}30`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}
