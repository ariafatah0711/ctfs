'use client'

import { Flag, Zap } from 'lucide-react'
import { SegmentedTabs } from '@/shared/components'
import type { ChallengesMainTab } from '../../types'
import ChallengeEventSummary from '../ChallengeEventSummary'

type ChallengePageTabsProps = {
  currentTab: ChallengesMainTab
  onTabChange: (tab: ChallengesMainTab) => void
  selectedEventName?: string
  eventStats?: { solvedCount: number; totalCount: number } | null
}

export default function ChallengePageTabs({
  currentTab,
  onTabChange,
  selectedEventName,
  eventStats,
}: ChallengePageTabsProps) {
  return (
    <div
      data-tour="challenge-page-tabs"
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <SegmentedTabs
        items={[
          { value: 'challenges', label: 'Challenges', icon: Flag },
          { value: 'events', label: 'Events', icon: Zap },
        ]}
        value={currentTab}
        onChange={onTabChange}
        variant="panel"
      />
      <ChallengeEventSummary
        selectedEventName={selectedEventName}
        eventStats={eventStats}
      />
    </div>
  )
}
