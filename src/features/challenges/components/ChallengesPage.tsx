'use client'

import { Loader } from '@/shared/components'
import { useChallengesPageData } from '../hooks/useChallengesPageData'
import EventsTab from './EventsTab'
import ChallengeDialogs from './challenges-page/ChallengeDialogs'
import ChallengePageTabs from './challenges-page/ChallengePageTabs'
import ChallengeWatermark from './challenges-page/ChallengeWatermark'
import ChallengesTabPanel from './challenges-page/ChallengesTabPanel'

export default function ChallengesPage() {
  const data = useChallengesPageData()

  if (data.loading) return <Loader fullscreen color="text-orange-500" />
  if (!data.user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <ChallengePageTabs
          currentTab={data.currentTab}
          onTabChange={data.setCurrentTab}
        />

        <ChallengeWatermark />

        {data.currentTab === 'challenges' && (
          <ChallengesTabPanel data={data} />
        )}

        {data.currentTab === 'events' && (
          <EventsTab
            events={data.enrichedEvents}
            selectedEventId={data.eventId}
            onEventSelect={data.attemptEventSelect}
          />
        )}
      </div>

      <ChallengeDialogs data={data} />
    </div>
  )
}
