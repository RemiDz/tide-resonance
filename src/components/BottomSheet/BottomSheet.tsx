'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // --- Drag-to-close state ---
  const dragStartY = useRef(0)
  const dragCurrentY = useRef(0)
  const isDragging = useRef(false)

  // --- Open / close in response to prop ---
  useEffect(() => {
    if (open) {
      setVisible(true)
      setClosing(false)
    } else if (visible && !closing) {
      // External close — trigger close animation
      setClosing(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setClosing(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      onClose()
    }, 200)
  }, [onClose, closing])

  // --- Escape key ---
  useEffect(() => {
    if (!visible) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible, handleClose])

  // --- Drag-to-close on handle ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true
    dragStartY.current = e.touches[0].clientY
    dragCurrentY.current = 0
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !panelRef.current) return
    const deltaY = e.touches[0].clientY - dragStartY.current
    dragCurrentY.current = Math.max(0, deltaY) // Only allow downward drag
    panelRef.current.style.transform = `translateY(${dragCurrentY.current}px)`
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !panelRef.current) return
    isDragging.current = false

    if (dragCurrentY.current > 100) {
      // Past threshold — close
      panelRef.current.style.transform = ''
      handleClose()
    } else {
      // Snap back
      panelRef.current.style.transition = 'transform 0.2s ease'
      panelRef.current.style.transform = 'translateY(0)'
      setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.style.transition = ''
        }
      }, 200)
    }
    dragCurrentY.current = 0
  }, [handleClose])

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`bottom-sheet-backdrop ${closing ? 'bottom-sheet-backdrop--closing' : ''}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`bottom-sheet-panel ${closing ? 'bottom-sheet-panel--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          className="bottom-sheet-handle"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none', cursor: 'grab', padding: '8px 0' }}
        />

        {children}
      </div>
    </>
  )
}
