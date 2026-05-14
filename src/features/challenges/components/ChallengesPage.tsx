'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

import { Loader } from '@/shared/components'
import PageBackground from '@/shared/components/PageBackground'
import { useChallengesPageData } from '../hooks/useChallengesPageData'
import EventsTab from './EventsTab'
import ChallengePageTabs from './challenges-page/ChallengePageTabs'
import ChallengesTabPanel from './challenges-page/ChallengesTabPanel'

const ChallengeDialogs = dynamic(() => import('./challenges-page/ChallengeDialogs'), {
  ssr: false,
  loading: () => null,
})

const ChallengeWatermark = dynamic(() => import('./challenges-page/ChallengeWatermark'), {
  ssr: false,
  loading: () => null,
})

const ChallengeJoyride = dynamic(() => import('./ChallengeJoyride'), {
  ssr: false,
  loading: () => null,
})

function useIdleMount(delay = 1200) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (mounted) return

    const mount = () => setMounted(true)

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(mount, { timeout: delay })
      return () => window.cancelIdleCallback(id)
    }

    const id = globalThis.setTimeout(mount, delay)
    return () => globalThis.clearTimeout(id)
  }, [delay, mounted])

  return mounted
}

export default function ChallengesPage() {
  const data = useChallengesPageData()
  const renderDeferredDecorations = useIdleMount()
  const renderDialogs = data.isJoinDialogOpen || !!data.selectedChallenge

  if (data.loading) return <Loader fullscreen />
  if (!data.user) return null

  return (
    <PageBackground
      className="flex flex-col overflow-hidden"
      selectionClassName="selection:bg-blue-500/30"
      showOrbs={false}
    >
      <main className="flex-1 flex flex-col relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-6 lg:py-8 w-full space-y-6 md:space-y-8">
          <ChallengePageTabs
            currentTab={data.currentTab}
            onTabChange={data.setCurrentTab}
          />

          {renderDeferredDecorations && <ChallengeWatermark />}

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

      {renderDialogs && <ChallengeDialogs data={data} />}
      {renderDeferredDecorations && <ChallengeJoyride />}
    </PageBackground>
  )
}
