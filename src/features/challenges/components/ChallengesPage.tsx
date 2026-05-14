'use client'

import dynamic from 'next/dynamic'

import { Loader } from '@/shared/components'
import PageBackground from '@/shared/components/PageBackground'
import { useChallengesPageData } from '../hooks/useChallengesPageData'
import EventsTab from './EventsTab'
import ChallengeDialogs from './challenges-page/ChallengeDialogs'
import ChallengePageTabs from './challenges-page/ChallengePageTabs'
import ChallengeWatermark from './challenges-page/ChallengeWatermark'
import ChallengesTabPanel from './challenges-page/ChallengesTabPanel'

const ChallengeJoyride = dynamic(() => import('./ChallengeJoyride'), {
  ssr: false,
})

export default function ChallengesPage() {
  const data = useChallengesPageData()

  if (data.loading) return <Loader fullscreen color="text-blue-500" />
  if (!data.user) return null

  return (
    <PageBackground
      className="flex flex-col overflow-hidden"
      selectionClassName="selection:bg-blue-500/30"
    >
      <main className="flex-1 flex flex-col relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-6 lg:py-8 w-full space-y-6 md:space-y-8">
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
      </main>

      <ChallengeDialogs data={data} />
      <ChallengeJoyride />
    </PageBackground>
  )
}
