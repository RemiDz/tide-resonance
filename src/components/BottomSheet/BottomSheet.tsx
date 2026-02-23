'use client'

import { useState, useEffect, useCallback } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setClosing(false)
    }
  }, [open])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      onClose()
    }, 200)
  }, [onClose])

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
        className={`bottom-sheet-panel ${closing ? 'bottom-sheet-panel--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="bottom-sheet-handle" />

        {children}
      </div>
    </>
  )
}
