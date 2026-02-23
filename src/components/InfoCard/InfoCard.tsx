'use client'

interface InfoCardProps {
  title: string
  children: React.ReactNode
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="glass-card">
      <div
        style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '0.625rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}
