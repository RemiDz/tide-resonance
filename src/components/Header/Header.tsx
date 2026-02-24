'use client'

import { useState, useEffect, useRef } from 'react'

interface HeaderProps {
  onOpenSettings: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const thresholdRef = useRef(0)

  // Calculate hero height on mount and listen for scroll
  useEffect(() => {
    // Hero is 38vh, min 240, max 380
    const vh = window.innerHeight * 0.38
    thresholdRef.current = Math.max(240, Math.min(380, vh))

    const handleScroll = () => {
      setScrolled(window.scrollY > thresholdRef.current * 0.6)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: scrolled ? 'rgba(5, 8, 16, 0.6)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease',
      }}
    >
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        {/* Left — Live indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4ade80',
              animation: 'bioPulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-muted)',
            }}
          >
            Live
          </span>
        </div>

        {/* Centre — App name */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-body), system-ui, sans-serif',
            fontWeight: 200,
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: 'rgba(255, 255, 255, 0.55)',
            whiteSpace: 'nowrap',
          }}
        >
          Tide Resonance
        </div>

        {/* Right — Settings gear */}
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            margin: -8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
