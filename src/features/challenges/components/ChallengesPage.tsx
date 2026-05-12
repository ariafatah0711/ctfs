'use client'

import dynamic from 'next/dynamic'

import { Loader } from '@/shared/components'
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
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 selection:bg-blue-500/30 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

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
    </div>
  )
}
