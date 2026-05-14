'use client'

import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import APP from '@/config'
import { Loader, EmptyState } from '@/shared/components'
import type { ChallengeWithSolve } from '@/shared/types'
import type { ChallengeFilterSettings, EventSelectorValue } from '../../types'
import ChallengeCard from '../ChallengeCard'
import ChallengeEmptyState from './ChallengeEmptyState'

type ChallengeListContentProps = {
  initialLoading: boolean
  eventMembershipLoading: boolean
  eventMembershipEventId?: string | null
  eventId: EventSelectorValue
  eventJoinBlocked: boolean
  filteredChallenges: ChallengeWithSolve[]
  challenges: ChallengeWithSolve[]
  sortedFilteredChallenges: ChallengeWithSolve[]
  grouped: Record<string, ChallengeWithSolve[]>
  orderedKeys: string[]
  layoutMode: 'grouped' | 'compact'
  filterSettings: ChallengeFilterSettings
  selectedEventObj: unknown
  selectedEventStart: Date | null
  selectedEventNotStarted: boolean
  selectedEventEnded: boolean
  nowDate: Date
  formatRemaining: (ms: number) => string
  onOpenChallenge: (challenge: ChallengeWithSolve) => void
}

const INITIAL_CHALLENGE_RENDER_COUNT = 28
const CHALLENGE_RENDER_CHUNK_SIZE = 36

function scheduleChallengeRender(callback: () => void) {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 120 })
    return () => window.cancelIdleCallback(id)
  }

  const id = globalThis.setTimeout(callback, 60)
  return () => globalThis.clearTimeout(id)
}

export default function ChallengeListContent({
  initialLoading,
  eventMembershipLoading,
  eventMembershipEventId,
  eventId,
  eventJoinBlocked,
  filteredChallenges,
  challenges,
  sortedFilteredChallenges,
  grouped,
  orderedKeys,
  layoutMode,
  filterSettings,
  selectedEventObj,
  selectedEventStart,
  selectedEventNotStarted,
  selectedEventEnded,
  nowDate,
  formatRemaining,
  onOpenChallenge,
}: ChallengeListContentProps) {
  const totalVisibleChallenges = layoutMode === 'compact'
    ? sortedFilteredChallenges.length
    : filteredChallenges.length
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_CHALLENGE_RENDER_COUNT, totalVisibleChallenges)
  )

  useEffect(() => {
    setVisibleCount(Math.min(INITIAL_CHALLENGE_RENDER_COUNT, totalVisibleChallenges))
  }, [layoutMode, orderedKeys, sortedFilteredChallenges, totalVisibleChallenges])

  useEffect(() => {
    if (visibleCount >= totalVisibleChallenges) return

    return scheduleChallengeRender(() => {
      setVisibleCount((current) =>
        Math.min(current + CHALLENGE_RENDER_CHUNK_SIZE, totalVisibleChallenges)
      )
    })
  }, [totalVisibleChallenges, visibleCount])

  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader color="text-blue-500" />
      </div>
    )
  }

  if (eventMembershipLoading && eventMembershipEventId !== eventId) {
    return (
      <div className="flex justify-center py-10">
        <Loader color="text-blue-500" />
      </div>
    )
  }

  if (eventJoinBlocked) {
    return (
      <EmptyState
        icon={<Lock className="w-full h-full" />}
        title="Access Restricted"
        description="Please join the event to unlock these challenges."
        containerHeight="py-16"
      />
    )
  }

  if (filteredChallenges.length === 0) {
    return (
      <ChallengeEmptyState
        eventId={eventId}
        selectedEventObj={selectedEventObj}
        selectedEventStart={selectedEventStart}
        selectedEventNotStarted={selectedEventNotStarted}
        selectedEventEnded={selectedEventEnded}
        nowDate={nowDate}
        challengesCount={challenges.length}
        formatRemaining={formatRemaining}
      />
    )
  }

  if (layoutMode === 'compact') {
    const visibleChallenges = sortedFilteredChallenges.slice(0, visibleCount)

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-max">
        {visibleChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="relative overflow-visible w-full"
          >
            <ChallengeCard
              challenge={challenge}
              highlightTeamSolves={filterSettings.highlightTeamSolves}
              onOpenChallenge={onOpenChallenge}
            />
          </div>
        ))}
      </div>
    )
  }

  let remainingVisibleChallenges = visibleCount

  return (
    <>
      {orderedKeys.map((category) => {
        const categoryChallenges = grouped[category] ?? []
        const categoryVisibleCount = Math.min(
          categoryChallenges.length,
          Math.max(remainingVisibleChallenges, 0)
        )
        const visibleChallenges = categoryChallenges.slice(0, categoryVisibleCount)
        remainingVisibleChallenges -= categoryVisibleCount

        if (visibleChallenges.length === 0) return null

        return (
          <div
            key={category}
            className="mb-12 relative z-0"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="w-1.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-full" />
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                {eventId === 'all' && String(category).toLowerCase() === 'intro'
                  ? `Intro (${String(APP.eventMainLabel || 'Main')})`
                  : category}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-max">
              {visibleChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="relative overflow-visible w-full"
                >
                  <ChallengeCard
                    challenge={challenge}
                    highlightTeamSolves={filterSettings.highlightTeamSolves}
                    onOpenChallenge={onOpenChallenge}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
