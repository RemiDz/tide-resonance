'use client'

interface CardFooterProps {
  phaseColor: string
  cardNum: number
  totalCards: number
  dateStr: string
}

export function CardFooter({ phaseColor, cardNum, totalCards, dateStr }: CardFooterProps) {
  return (
    <div
      style={{
        padding: '0 32px 24px',
        marginTop: 'auto',
      }}
    >
      {/* Gradient divider */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${phaseColor}40, transparent)`,
          marginBottom: 16,
        }}
      />

      {/* Branding */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: '0.02em',
          }}
        >
          tidara.app
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
            marginTop: 4,
          }}
        >
          {dateStr}
        </div>

        {/* Page dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginTop: 12,
          }}
        >
          {Array.from({ length: totalCards }, (_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: i + 1 === cardNum ? phaseColor : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
