'use client'

import APP from '@/config'
import type { useChallengesPageData } from '../../hooks/useChallengesPageData'
import ChallengeFilterBar from '../ChallengeFilterBar'
import DesktopChallengeFilterSidebar from '../challenge-filter-bar/DesktopChallengeFilterSidebar'
import ChallengeListContent from './ChallengeListContent'
import ChallengePageTabs from './ChallengePageTabs'

type ChallengesPageData = ReturnType<typeof useChallengesPageData>

type ChallengesTabPanelProps = {
  data: ChallengesPageData
}

export default function ChallengesTabPanel({
  data,
}: ChallengesTabPanelProps) {
  return (
    <div className="xl:grid xl:grid-cols-[176px_minmax(0,1fr)] xl:gap-8 2xl:gap-10 items-start">
      <div className="relative z-30 flex flex-col gap-4 xl:sticky xl:top-[80px] xl:self-start 2xl:gap-5 [will-change:transform]">
        <ChallengePageTabs
          currentTab={data.currentTab}
          onTabChange={data.setCurrentTab}
          showSummary={false}
          className="xl:w-[176px] [&_button]:xl:w-[176px]"
        />

        <DesktopChallengeFilterSidebar
          filters={data.filters}
          categories={data.categories}
          difficulties={data.difficulties}
          onFilterChange={data.setFilters}
        />
      </div>

      <div className="min-w-0 space-y-4 2xl:space-y-5 [will-change:transform]">
        <ChallengeFilterBar
          filters={data.filters}
          events={data.enrichedEvents}
          selectedEventId={data.eventId}
          onEventChange={data.attemptEventSelect}
          sortMode={data.sortMode}
          onSortModeChange={() => data.setSortMode((prev) => prev === 'default' ? 'newest' : 'default')}
          hideMainEventOption={APP.hideEventMain}
          showSearch={false}
          settings={data.filterSettings}
          categories={data.categories}
          difficulties={data.difficulties}
          onFilterChange={data.setFilters}
          onSettingsChange={data.setFilterSettings}
          onClear={() => data.setFilters({ status: 'all', category: 'all', difficulty: 'all', search: '', feature: 'N' })}
          hideSidebarFiltersOnDesktop
        />

        <div data-tour="challenge-list" data-challenge-list-anchor className="min-w-0">
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
