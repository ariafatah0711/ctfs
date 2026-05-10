'use client'

import { motion } from 'framer-motion'
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
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {sortedFilteredChallenges.map((challenge) => (
          <div key={challenge.id} className="relative">
            <ChallengeCard
              challenge={challenge}
              highlightTeamSolves={filterSettings.highlightTeamSolves}
              showCategory={true}
              onClick={() => onOpenChallenge(challenge)}
            />
          </div>
        ))}
      </motion.div>
    )
  }

  return (
    <>
      {orderedKeys.map((category) => (
        <div key={category} className="mb-12">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="w-1.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-full" />
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
              {eventId === 'all' && String(category).toLowerCase() === 'intro'
                ? `Intro (${String(APP.eventMainLabel || 'Main')})`
                : category}
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {grouped[category].map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                highlightTeamSolves={filterSettings.highlightTeamSolves}
                onClick={() => onOpenChallenge(challenge)}
              />
            ))}
          </motion.div>
        </div>
      ))}
    </>
  )
}
