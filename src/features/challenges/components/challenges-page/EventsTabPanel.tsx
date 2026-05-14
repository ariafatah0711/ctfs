'use client'

import EventsTab from '../EventsTab'
import AllEventsButton from '../events-tab/AllEventsButton'
import type { ChallengesMainTab, EnrichedChallengeEvent } from '../../types'
import ChallengePageTabs from './ChallengePageTabs'

type EventsTabPanelProps = {
  currentTab: ChallengesMainTab
  events: EnrichedChallengeEvent[]
  selectedEventId?: string | null | 'all'
  onTabChange: (tab: ChallengesMainTab) => void
  onEventSelect: (eventId: string | null | 'all') => void
}

export default function EventsTabPanel({
  currentTab,
  events,
  selectedEventId,
  onTabChange,
  onEventSelect,
}: EventsTabPanelProps) {
  return (
    <div className="xl:grid xl:grid-cols-[176px_minmax(0,1fr)] xl:gap-4 2xl:gap-5">
      <div className="relative z-30 mb-4 flex flex-col gap-4 xl:sticky xl:top-[4.5rem] xl:mb-0 xl:self-start 2xl:gap-5">
        <ChallengePageTabs
          currentTab={currentTab}
          onTabChange={onTabChange}
          showSummary={false}
          className="xl:w-[176px] [&_button]:xl:w-[176px]"
        />
      </div>

      <div className="min-w-0 space-y-4 2xl:space-y-5">
        <AllEventsButton
          selected={selectedEventId === 'all'}
          onSelect={() => onEventSelect('all')}
        />

        <EventsTab
          events={events}
          selectedEventId={selectedEventId}
          onEventSelect={onEventSelect}
          showAllEventsButton={false}
        />
      </div>
    </div>
  )
}
