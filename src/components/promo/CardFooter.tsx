'use client'

import { FONT_DISPLAY, FONT_MONO } from './CardShell'

interface CardFooterProps {
  cardNum: number
  isStory: boolean
  color: string
}

export function CardFooter({ cardNum, isStory, color }: CardFooterProps) {
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center' as const }}>
      {/* Gradient divider */}
      <div
        style={{
          width: '60%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
          margin: '0 auto',
          marginBottom: isStory ? 12 : 8,
        }}
      />
      {/* App name */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#F0EEF8',
          marginBottom: 3,
          marginTop: 0,
          fontFamily: FONT_DISPLAY,
          letterSpacing: '0.05em',
        }}
      >
        tidara.app
      </p>
      {/* Date */}
      <p
        style={{
          fontSize: 7,
          color: 'rgba(200,196,220,0.6)',
          marginBottom: 4,
          marginTop: 0,
          fontFamily: FONT_MONO,
        }}
      >
        {dateStr}
      </p>
      {/* Page dots */}
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 4 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: i === cardNum - 1 ? color : 'rgba(200,196,220,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
