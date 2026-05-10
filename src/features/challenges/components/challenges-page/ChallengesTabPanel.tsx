'use client'

import APP from '@/config'
import type { useChallengesPageData } from '../../hooks/useChallengesPageData'
import ChallengeFilterBar from '../ChallengeFilterBar'
import ChallengeListContent from './ChallengeListContent'

type ChallengesPageData = ReturnType<typeof useChallengesPageData>

type ChallengesTabPanelProps = {
  data: ChallengesPageData
}

export default function ChallengesTabPanel({ data }: ChallengesTabPanelProps) {
  return (
    <>
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
      />

      <div>
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
    </>
  )
}
