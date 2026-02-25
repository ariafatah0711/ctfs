'use client'

import React from 'react'
import { getEvents, filterStartedEvents } from '@/lib/events'
import type { Event } from '@/types'
import { getSelectedEventSetting, setSelectedEventSetting } from '@/lib/settings'
import { useAuth } from '@/contexts/AuthContext'

export type SelectedEvent = 'all' | 'main' | string

type EventContextValue = {
  events: Event[]
  startedEvents: Event[]
  eventsLoading: boolean
  selectedEvent: SelectedEvent
  setSelectedEvent: (value: SelectedEvent) => void
  refreshEvents: () => Promise<void>
}

const EventContext = React.createContext<EventContextValue | null>(null)

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = React.useState(false)
  const [selectedEvent, setSelectedEventState] = React.useState<SelectedEvent>(() => {
    if (typeof window === 'undefined') return 'all'
    try {
      const stored = getSelectedEventSetting()
      if (!stored) return 'all'
      const v = String(stored).trim()
      if (!v || v === 'undefined') return 'all'
      if (v === 'null') return 'main'
      return v
    } catch {
      return 'all'
    }
  })

  // Persist selection to localStorage
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setSelectedEventSetting(String(selectedEvent))
    } catch {
      // ignore
    }
  }, [selectedEvent])

  const refreshEvents = React.useCallback(async () => {
    setEventsLoading(true)
    try {
      const data = await getEvents()
      setEvents(data || [])
    } catch {
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }, [])

  // Fetch events after auth finishes loading or when user changes
  const { user, loading } = useAuth()

  React.useEffect(() => {
    if (!loading) {
      // refresh so event list reflects current user's permissions/state
      refreshEvents()
    }
  }, [loading, user, refreshEvents])

  const startedEvents = React.useMemo(() => filterStartedEvents(events || []), [events])

  const setSelectedEvent = React.useCallback((value: SelectedEvent) => {
    setSelectedEventState(value)
  }, [])

  const ctx: EventContextValue = {
    events,
    startedEvents,
    eventsLoading,
    selectedEvent,
    setSelectedEvent,
    refreshEvents,
  }

  return <EventContext.Provider value={ctx}>{children}</EventContext.Provider>
}

export function useEventContext() {
  const ctx = React.useContext(EventContext)
  if (!ctx) throw new Error('useEventContext must be used within <EventProvider>')
  return ctx
}
