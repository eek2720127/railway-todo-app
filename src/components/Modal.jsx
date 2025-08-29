// src/components/Modal.jsx
import React, { useEffect, useRef } from 'react'
import './Modal.css'

/**
 * Props:
 * - onClose: () => void
 * - children
 * - ariaLabelledBy (optional): id of the modal title for aria-labelledby
 */
export default function Modal({ onClose, children, ariaLabelledBy }) {
  const rootRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement
    // prevent background scroll
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const root = rootRef.current
    if (!root) return

    // find focusable elements inside modal
    const focusableSelector =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"])'
    const nodes = Array.from(root.querySelectorAll(focusableSelector)).filter(
      (el) =>
        el.offsetWidth > 0 ||
        el.offsetHeight > 0 ||
        el.getClientRects().length > 0
    )

    // focus first element, or modal root as fallback
    if (nodes.length) {
      nodes[0].focus()
    } else {
      root.focus()
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }

      if (e.key === 'Tab') {
        // trap focus
        if (nodes.length === 0) {
          e.preventDefault()
          return
        }
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      // restore overflow & focus
      document.body.style.overflow = prevOverflow
      try {
        previouslyFocusedRef.current?.focus?.()
      } catch {}
    }
  }, [onClose])

  // close on overlay click (but not when clicking inside modal content)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  return (
    <div className="modal_overlay" onMouseDown={handleOverlayClick}>
      <div
        className="modal_content"
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  )
}
