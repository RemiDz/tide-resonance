'use client'

/* ── Font constants ────────────────────────────────── */
export const FONT_DISPLAY = "'Playfair Display', Georgia, serif"
export const FONT_BODY = "'Inter', system-ui, sans-serif"
export const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace"

/* ── Deterministic star field ──────────────────────── */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 73 + 17) % 100,
  y: (i * 47 + 31) % 100,
  size: (i % 3) + 1,
  opacity: 0.2 + (i % 5) * 0.1,
}))

function StarField() {
  return (
    <>
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            backgroundColor: '#C8C4DC',
            opacity: s.opacity,
            pointerEvents: 'none' as const,
          }}
        />
      ))}
    </>
  )
}

/* ── CardShell ─────────────────────────────────────── */
interface CardShellProps {
  children: React.ReactNode
  isStory: boolean
  isTiktok: boolean
  color: string
  cardNum: number
}

export function CardShell({ children, isStory, isTiktok, color, cardNum }: CardShellProps) {
  const w = isStory ? 270 : 320
  const h = isStory ? 480 : 320

  return (
    <div
      style={{
        width: w,
        height: h,
        background: 'linear-gradient(160deg, #050810 0%, #0a1628 35%, #0c1832 65%, #0a1628 100%)',
        borderRadius: 16,
        border: `1px solid ${color}35`,
        padding: isTiktok ? '45px 20px 70px' : isStory ? '20px 20px 16px' : '16px 16px 12px',
        boxShadow: `0 4px 30px rgba(0,0,0,0.5), 0 0 40px ${color}15`,
        position: 'relative' as const,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        textAlign: 'center' as const,
        fontFamily: FONT_BODY,
        color: 'rgba(255,255,255,0.85)',
        boxSizing: 'border-box' as const,
      }}
    >
      <StarField />

      {/* Accent top stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}90, transparent)`,
          pointerEvents: 'none' as const,
        }}
      />

      {/* Card number */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 12,
          fontSize: 8,
          color: '#C8C4DC',
          fontFamily: FONT_MONO,
        }}
      >
        {cardNum}/6
      </div>

      {/* Accent glow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: isStory ? '30%' : '35%',
          transform: 'translate(-50%, -50%)',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}30 0%, ${color}10 40%, transparent 70%)`,
          pointerEvents: 'none' as const,
        }}
      />

      {children}
    </div>
  )
}
