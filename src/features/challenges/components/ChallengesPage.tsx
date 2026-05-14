'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import APP from '@/config'

import { Loader } from '@/shared/components'
import PageBackground from '@/shared/components/PageBackground'
import { useChallengeFocusMode } from '../hooks/useChallengeFocusMode'
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
  const { focusMode, setFocusMode } = useChallengeFocusMode({
    currentTab: data.currentTab,
    eventId: data.eventId,
  })

  useEffect(() => {
    if (data.currentTab !== 'challenges') return

    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (event.key !== '/') return
      if (event.ctrlKey || event.metaKey || event.altKey) return

      const target = event.target as HTMLElement | null
      const isTyping = target
        && (
          target.tagName === 'INPUT'
          || target.tagName === 'TEXTAREA'
          || target.tagName === 'SELECT'
          || target.isContentEditable
        )

      if (isTyping) return

      event.preventDefault()

      if (window.matchMedia('(min-width: 1280px)').matches) {
        document.dispatchEvent(new Event('challenge-search-open'))
        return
      }

      document.getElementById('challenge-filter-search')?.focus()
    }

    window.addEventListener('keydown', handleSearchShortcut)
    return () => window.removeEventListener('keydown', handleSearchShortcut)
  }, [data.currentTab])

  if (data.loading) return <Loader fullscreen />
  if (!data.user) return null

  const getSelectedEventName = () => {
    if (data.eventId === 'all') return 'All Challenges'
    if (data.eventId === null) return APP.eventMainLabel || 'Platform Default'
    if (data.selectedEventObj) return data.selectedEventObj.name
    return data.eventId ? 'Selected Event' : undefined
  }

  const getSelectedEventStats = () => {
    if (!data.challenges) return null

    const currentEventChallenges = data.eventId === 'all'
      ? data.challenges
      : data.eventId === null
        ? data.challenges.filter(c => !c.event_id)
        : data.challenges.filter(c => c.event_id === data.eventId)

    const totalCount = currentEventChallenges.length
    const solvedCount = currentEventChallenges.filter(c => c.is_solved).length

    if (totalCount === 0) return null

    return { solvedCount, totalCount }
  }

  return (
    <PageBackground
      className="flex flex-col"
      selectionClassName="selection:bg-blue-500/30"
      showOrbs={false}
    >
      <main className="flex-1 flex flex-col relative z-10">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${focusMode
          ? 'py-2 lg:py-3 space-y-3 md:space-y-4'
          : 'py-6 lg:py-8 space-y-6 md:space-y-8'
        }`}>
          {!focusMode && (
            <ChallengePageTabs
              currentTab={data.currentTab}
              onTabChange={data.setCurrentTab}
              selectedEventName={getSelectedEventName()}
              eventStats={getSelectedEventStats()}
            />
          )}

          {renderDeferredDecorations && <ChallengeWatermark />}

          {data.currentTab === 'challenges' && (
            <ChallengesTabPanel
              data={data}
              focusMode={focusMode}
              onFocusModeChange={setFocusMode}
              selectedEventName={getSelectedEventName()}
              eventStats={getSelectedEventStats()}
            />
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
