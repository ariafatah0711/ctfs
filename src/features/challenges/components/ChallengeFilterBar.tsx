'use client'

import React from 'react'
import { getChallengeFilterDirtyState } from '../lib'
import type {
  ChallengeEventFilterItem,
  ChallengeFilterSettings,
  ChallengeFilterState,
  ChallengeSortMode,
  EventSelectorValue,
} from '../types'
import ChallengeFilterControls from './challenge-filter-bar/ChallengeFilterControls'
import EventFilterPills from './challenge-filter-bar/EventFilterPills'

type Props = {
  filters: ChallengeFilterState
  events?: ChallengeEventFilterItem[]
  selectedEventId?: EventSelectorValue
  onEventChange?: (eventId: EventSelectorValue) => void
  hideAllEventOption?: boolean
  hideMainEventOption?: boolean
  includeEndedEvents?: boolean
  // When false, do not show timing/visual state (colors/icons) for events.
  // Useful for admin views where timing badges are not desired.
  showEventState?: boolean
  // Controls which upcoming events appear in the event pill filter.
  // Default: 30 days. Set to null to show all upcoming events (useful for admin).
  upcomingVisibilityWindowDays?: number | null
  settings?: ChallengeFilterSettings
  categories: string[]
  difficulties: string[]
  onFilterChange: (filters: any) => void
  onSettingsChange?: (settings: ChallengeFilterSettings) => void
  onClear: () => void
  showStatusFilter?: boolean
  sortMode?: ChallengeSortMode
  onSortModeChange?: () => void
}

export default function ChallengeFilterBar({
  filters,
  events,
  selectedEventId,
  onEventChange,
  hideAllEventOption = false,
  hideMainEventOption = false,
  includeEndedEvents = false,
  showEventState = true,
  upcomingVisibilityWindowDays = 30,
  settings,
  categories,
  difficulties,
  onFilterChange,
  onSettingsChange,
  onClear,
  showStatusFilter = true,
  sortMode = 'default',
  onSortModeChange,
}: Props) {
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const dirtyState = getChallengeFilterDirtyState(filters, selectedEventId)

  return (
    <div
      data-tour="challenge-filter-bar"
      className="relative z-20 w-full bg-white/50 dark:bg-gray-900/50 border border-blue-500/20 dark:border-blue-500/10 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-sm shadow-blue-500/5"
    >
      {events && onEventChange && (
        <EventFilterPills
          events={events}
          selectedEventId={selectedEventId}
          onEventChange={onEventChange}
          hideAllEventOption={hideAllEventOption}
          hideMainEventOption={hideMainEventOption}
          includeEndedEvents={includeEndedEvents}
          showEventState={showEventState}
          upcomingVisibilityWindowDays={upcomingVisibilityWindowDays}
          isEventDirty={dirtyState.isEventDirty}
          anyFilterDirty={dirtyState.anyFilterDirty}
        />
      )}

      <ChallengeFilterControls
        filters={filters}
        settings={settings}
        categories={categories}
        difficulties={difficulties}
        dirtyState={dirtyState}
        settingsOpen={settingsOpen}
        showStatusFilter={showStatusFilter}
        sortMode={sortMode}
        onFilterChange={onFilterChange}
        onSettingsOpenChange={setSettingsOpen}
        onSettingsChange={onSettingsChange}
        onClear={onClear}
        onSortModeChange={onSortModeChange}
      />
    </div>
  )
}
