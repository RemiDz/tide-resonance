'use client'

export function Header() {
  return (
    <header
      style={{
        height: 'env(safe-area-inset-top, 0px)',
        minHeight: 8,
        position: 'relative',
        zIndex: 10,
      }}
    />
  )
}
