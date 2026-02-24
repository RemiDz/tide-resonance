'use client'

import { useState } from 'react'

interface InfoCardProps {
  title: string
  children: React.ReactNode
  infoText?: string
}

export function InfoCard({ title, children, infoText }: InfoCardProps) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className="glass-card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '0.625rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
          }}
        >
          {title}
        </div>
        {infoText && (
          <button
            onClick={() => setInfoOpen(!infoOpen)}
            aria-label={infoOpen ? 'Hide info' : 'Show info'}
            aria-expanded={infoOpen}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              margin: '-12px -12px -12px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle
                cx="9"
                cy="9"
                r="8"
                stroke="white"
                strokeOpacity={infoOpen ? 0.5 : 0.25}
                strokeWidth="1"
                style={{ transition: 'stroke-opacity 0.2s ease' }}
              />
              <text
                x="9"
                y="13"
                textAnchor="middle"
                fontSize="11"
                fontFamily="serif"
                fill="white"
                fillOpacity={infoOpen ? 0.5 : 0.25}
                fontStyle="italic"
                style={{ transition: 'fill-opacity 0.2s ease' }}
              >
                i
              </text>
            </svg>
          </button>
        )}
      </div>
      {children}

      {/* Expandable info section */}
      {infoText && (
        <div className="info-expand" data-open={infoOpen}>
          <div style={{ overflow: 'hidden' }}>
            <div className="info-expand-content">
              <div
                style={{
                  borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                  marginTop: 16,
                  paddingTop: 14,
                }}
              >
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'rgba(255, 255, 255, 0.45)',
                    lineHeight: 1.7,
                    maxWidth: 480,
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  {infoText}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
