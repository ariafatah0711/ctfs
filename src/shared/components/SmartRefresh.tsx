'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

/**
 * SmartRefresh Component
 *
 * Intercepts browser refresh (Ctrl+R, Cmd+R, F5) and performs a data-only refresh
 * using Next.js router.refresh() instead of a full page reload.
 *
 * Benefits:
 * - Preserves filter state (stored in localStorage via FilterContext)
 * - Preserves scroll position
 * - Preserves selected challenge context
 * - Only re-fetches fresh data without losing user context
 *
 * Ctrl+Shift+R = Full page reload (power user escape hatch)
 */
export default function SmartRefresh() {
  const router = useRouter()
  const isRefreshing = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const isKeyR = e.key.toLowerCase() === 'r'
      const isF5 = e.key === 'F5'
      const isShift = e.shiftKey

      // Full page reload: Ctrl+Shift+R or Cmd+Shift+R
      if (isCtrlOrCmd && isKeyR && isShift) {
        // Allow browser's default behavior - full reload
        return
      }

      // Data-only refresh: Ctrl+R, Cmd+R, or F5
      if ((isCtrlOrCmd && isKeyR) || isF5) {
        e.preventDefault()

        // Prevent multiple rapid refresh requests
        if (isRefreshing.current) {
          return
        }

        isRefreshing.current = true
        try {
          router.refresh()
          toast.success('Data refreshed', { duration: 2000 })
        } catch (err) {
          console.error('Refresh failed:', err)
          toast.error('Refresh failed', { duration: 2000 })
        } finally {
          // Reset after a delay to allow the refresh to settle
          setTimeout(() => {
            isRefreshing.current = false
          }, 1000)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  return null
}
