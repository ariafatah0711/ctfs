'use client'

import { useMemo } from 'react'
import APP from '@/config'
import { filterChallengesByState } from '../../lib'
import type { useChallengesPageData } from '../../hooks/useChallengesPageData'
import ChallengeFilterBar from '../ChallengeFilterBar'
import DesktopChallengeFilterSidebar from '../challenge-filter-bar/DesktopChallengeFilterSidebar'
import ChallengeListContent from './ChallengeListContent'

type ChallengesPageData = ReturnType<typeof useChallengesPageData>

type ChallengesTabPanelProps = {
  data: ChallengesPageData
  focusMode: boolean
  onFocusModeChange: (enabled: boolean) => void
  selectedEventName?: string
  eventStats?: { solvedCount: number; totalCount: number } | null
}

export default function ChallengesTabPanel({
  data,
  focusMode,
  onFocusModeChange,
  selectedEventName,
  eventStats,
}: ChallengesTabPanelProps) {
  const sidebarCounts = useMemo(() => {
    const challengesForCounts = filterChallengesByState({
      challenges: data.challenges,
      events: data.enrichedEvents,
      eventId: data.eventId,
      filters: { ...data.filters, category: 'all' },
      settings: data.filterSettings,
      nowMs: data.nowDate.getTime(),
    })

    return challengesForCounts.reduce(
      (acc, challenge) => {
        acc.totalCount += 1
        acc.categoryCounts[challenge.category] = (acc.categoryCounts[challenge.category] ?? 0) + 1
        return acc
      },
      { categoryCounts: {} as Record<string, number>, totalCount: 0 }
    )
  }, [data.challenges, data.enrichedEvents, data.eventId, data.filterSettings, data.filters, data.nowDate])

  return (
    <div className="xl:grid xl:grid-cols-[72px_minmax(0,1fr)] xl:gap-4 2xl:gap-5">
      <DesktopChallengeFilterSidebar
        filters={data.filters}
        categories={data.categories}
        categoryCounts={sidebarCounts.categoryCounts}
        totalCount={sidebarCounts.totalCount}
        onFilterChange={data.setFilters}
      />

      <div className="min-w-0 space-y-6">
        <ChallengeFilterBar
          filters={data.filters}
          events={data.enrichedEvents}
          selectedEventId={data.eventId}
          onEventChange={data.attemptEventSelect}
          sortMode={data.sortMode}
          onSortModeChange={() => data.setSortMode((prev) => prev === 'default' ? 'newest' : 'default')}
          hideMainEventOption={APP.hideEventMain}
          settings={data.filterSettings}
          categories={data.categories}
          difficulties={data.difficulties}
          onFilterChange={data.setFilters}
          onSettingsChange={data.setFilterSettings}
          onClear={() => data.setFilters({ status: 'all', category: 'all', difficulty: 'all', search: '', feature: 'N' })}
          hideSidebarFiltersOnDesktop
          focusMode={focusMode}
          onFocusModeChange={onFocusModeChange}
          selectedEventName={selectedEventName}
          eventStats={eventStats}
        />

        <div data-tour="challenge-list" data-challenge-list-anchor>
          <ChallengeListContent
            initialLoading={data.initialLoading}
            eventMembershipLoading={data.eventMembershipLoading}
            eventMembershipEventId={data.eventMembership?.event_id}
            eventId={data.eventId}
            eventJoinBlocked={data.eventJoinBlocked}
            filteredChallenges={data.filteredChallenges}
            challenges={data.challenges}
            sortedFilteredChallenges={data.sortedFilteredChallenges}
            grouped={data.grouped}
            orderedKeys={data.orderedKeys}
            layoutMode={data.layoutMode}
            filterSettings={data.filterSettings}
            selectedEventObj={data.selectedEventObj}
            selectedEventStart={data.selectedEventStart}
            selectedEventNotStarted={data.selectedEventNotStarted}
            selectedEventEnded={data.selectedEventEnded}
            nowDate={data.nowDate}
            formatRemaining={data.formatRemaining}
            onOpenChallenge={data.openChallenge}
          />
        </div>
      </div>
    </div>
  )
}
