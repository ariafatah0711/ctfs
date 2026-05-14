'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChallengesMainTab, EventSelectorValue } from '../types'

const FOCUS_MODE_STORAGE_KEY = 'nxctf:challengeFocusMode'

type StoredFocusMode = {
  enabled: boolean
  eventKey: string
}

function getFocusModeEventKey(eventId: EventSelectorValue) {
  if (eventId === null) return 'main'
  return eventId || 'all'
}

function readStoredFocusMode(): StoredFocusMode {
  if (typeof window === 'undefined') return { enabled: false, eventKey: 'all' }

  try {
    const raw = localStorage.getItem(FOCUS_MODE_STORAGE_KEY)
    if (!raw) return { enabled: false, eventKey: 'all' }

    if (raw === 'true' || raw === 'false') {
      return { enabled: false, eventKey: 'legacy' }
    }

    const parsed = JSON.parse(raw)
    return {
      enabled: parsed?.enabled === true,
      eventKey: typeof parsed?.eventKey === 'string' ? parsed.eventKey : 'legacy',
    }
  } catch {
    return { enabled: false, eventKey: 'all' }
  }
}

function writeStoredFocusMode(enabled: boolean, eventKey: string) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(FOCUS_MODE_STORAGE_KEY, JSON.stringify({ enabled, eventKey }))
  } catch { }
}

export function useChallengeFocusMode({
  currentTab,
  eventId,
}: {
  currentTab: ChallengesMainTab
  eventId: EventSelectorValue
}) {
  const eventKey = useMemo(() => getFocusModeEventKey(eventId), [eventId])
  const [focusMode, setFocusModeState] = useState(false)
  const previousEventKeyRef = useRef(eventKey)
  const hardNavigationRef = useRef(false)

  const setFocusMode = useCallback((enabled: boolean) => {
    setFocusModeState(enabled)
    writeStoredFocusMode(enabled, eventKey)
  }, [eventKey])

  useEffect(() => {
    if (currentTab !== 'challenges') return

    const stored = readStoredFocusMode()
    if (stored.enabled && stored.eventKey === eventKey) {
      setFocusModeState(true)
      previousEventKeyRef.current = eventKey
      return
    }

    if (stored.enabled && stored.eventKey !== eventKey) {
      writeStoredFocusMode(false, eventKey)
    }

    setFocusModeState(false)
    previousEventKeyRef.current = eventKey
  }, [currentTab, eventKey])

  useEffect(() => {
    const markHardNavigation = () => {
      hardNavigationRef.current = true
    }

    window.addEventListener('beforeunload', markHardNavigation)
    return () => window.removeEventListener('beforeunload', markHardNavigation)
  }, [])

  useEffect(() => {
    return () => {
      if (hardNavigationRef.current) return
      if (readStoredFocusMode().enabled) {
        writeStoredFocusMode(false, eventKey)
      }
    }
  }, [eventKey])

  useEffect(() => {
    if (currentTab === 'challenges' || !focusMode) return
    setFocusMode(false)
  }, [currentTab, focusMode, setFocusMode])

  useEffect(() => {
    if (previousEventKeyRef.current === eventKey) return

    previousEventKeyRef.current = eventKey
    if (focusMode || readStoredFocusMode().enabled) {
      setFocusMode(false)
    }
  }, [eventKey, focusMode, setFocusMode])

  return {
    focusMode,
    setFocusMode,
  }
}
