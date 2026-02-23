'use client'

export function Header() {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '12px 20px 0',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Sound icon placeholder — disabled for now */}
      <button
        disabled
        aria-label="Sound"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'default',
          padding: 8,
          borderRadius: 8,
          color: 'var(--text-muted)',
          fontSize: '1rem',
          opacity: 0.4,
        }}
      >
        {'\u266B'}
      </button>
    </header>
  )
}
