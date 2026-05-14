'use client'

import React from 'react'
import { Lock, Zap } from 'lucide-react'
import APP from '@/config'
import { formatEventTimingLabel } from '@/shared/lib'
import {
  SURFACE_FILTER_ITEM_CLASS,
  SURFACE_FILTER_ITEM_ACTIVE_CLASS,
} from '@/shared/styles'
import {
  getEventVisualState,
  getVisibleSortedEvents,
  shouldShowEventTimingAlways,
} from '../../lib'
import type { ChallengeEventFilterItem, EventSelectorValue } from '../../types'

type EventFilterPillsProps = {
  events: ChallengeEventFilterItem[]
  selectedEventId?: EventSelectorValue
  onEventChange: (eventId: EventSelectorValue) => void
  hideAllEventOption: boolean
  hideMainEventOption: boolean
  includeEndedEvents: boolean
  showEventState: boolean
  upcomingVisibilityWindowDays: number | null
  isEventDirty: boolean
  anyFilterDirty: boolean
}

export default function EventFilterPills({
  events,
  selectedEventId,
  onEventChange,
  hideAllEventOption,
  hideMainEventOption,
  includeEndedEvents,
  showEventState,
  upcomingVisibilityWindowDays,
  isEventDirty,
  anyFilterDirty,
}: EventFilterPillsProps) {
  const mainLabel = String(APP.eventMainLabel || 'Main')
  const sortedEvents = React.useMemo(() => {
    return getVisibleSortedEvents({
      events,
      selectedEventId,
      includeEndedEvents,
      showEventState,
      upcomingVisibilityWindowDays,
    })
  }, [events, includeEndedEvents, selectedEventId, showEventState, upcomingVisibilityWindowDays])

  const selectedEvent = React.useMemo(() => {
    if (typeof selectedEventId !== 'string') return null
    if (selectedEventId === 'all') return null
    return events.find((event) => event.id === selectedEventId) ?? null
  }, [events, selectedEventId])

  const selectedTimingLabel = React.useMemo(() => {
    return selectedEvent ? formatEventTimingLabel(selectedEvent) : null
  }, [selectedEvent])

  const stateStyles = {
    'upcoming-soon': 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    'ending-soon': 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    ongoing: 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    ended: 'opacity-50 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400',
    upcoming: '',
  }

  return (
    <div data-tour="challenge-event-selector" className="mb-3">
      <div className="w-full flex flex-row flex-nowrap sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 py-2">
        {!hideAllEventOption && (
          <button
            type="button"
            onClick={() => onEventChange('all')}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition ${selectedEventId === 'all' ? SURFACE_FILTER_ITEM_ACTIVE_CLASS : SURFACE_FILTER_ITEM_CLASS} ${!isEventDirty && anyFilterDirty ? 'opacity-90' : ''}`}
          >
            All
          </button>
        )}
        {!hideMainEventOption && !APP.hideEventMain && (
          <button
            type="button"
            onClick={() => onEventChange(null)}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition ${!selectedEventId ? SURFACE_FILTER_ITEM_ACTIVE_CLASS : SURFACE_FILTER_ITEM_CLASS}`}
          >
            {mainLabel}
          </button>
        )}
        {sortedEvents.map((event) => {
          const timing = formatEventTimingLabel(event)
          const isSelected = selectedEventId === event.id
          const state = getEventVisualState({
            event,
            showEventState,
            upcomingVisibilityWindowDays,
          })
          const isEndedButAlwaysVisible = state === 'ended' && Boolean(event.always_show_challenges)

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onEventChange(event.id)}
              className={`
                shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1
                ${isEndedButAlwaysVisible && !isSelected ? 'text-[10px] opacity-40 border-dashed' : ''}
                ${isSelected
                  ? SURFACE_FILTER_ITEM_ACTIVE_CLASS
                  : (SURFACE_FILTER_ITEM_CLASS + (showEventState ? ` ${stateStyles[state]}` : ''))
                }
              `}
              title={timing || undefined}
            >
              {showEventState && state === 'upcoming-soon' && (
                <Zap size={10} className="text-yellow-500" />
              )}

              {showEventState && state === 'ending-soon' && (
                <Zap size={10} className="text-purple-500" />
              )}

              {event.isLocked && <Lock size={10} className="opacity-70" />}
              <span>{event.name}</span>

              {showEventState && isEndedButAlwaysVisible && !isSelected && (
                <span className="text-[9px] opacity-70">ended</span>
              )}

              {showEventState && (isSelected || shouldShowEventTimingAlways({
                event,
                showEventState,
                upcomingVisibilityWindowDays,
              })) && timing && (
                  <span className="ml-1 text-[9px] opacity-80 hidden sm:inline normal-case font-medium">
                    {timing}
                  </span>
                )}
            </button>
          )
        })}
      </div>

      {showEventState && selectedTimingLabel && (
        <div className="sm:hidden mt-2 text-xs text-gray-600 dark:text-gray-300">
          {selectedTimingLabel}
        </div>
      )}
    </div>
  )
}
