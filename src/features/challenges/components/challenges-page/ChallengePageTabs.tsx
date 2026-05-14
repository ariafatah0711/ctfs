'use client'

import { Flag, Zap } from 'lucide-react'
import { SegmentedTabs } from '@/shared/components'
import type { ChallengesMainTab } from '../../types'

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <SegmentedTabs
        items={[
          { value: 'challenges', label: 'Challenges', icon: Flag },
          { value: 'events', label: 'Events', icon: Zap },
        ]}
        value={currentTab}
        onChange={onTabChange}
        variant="panel"
      />
      {selectedEventName && (
        <div className="flex items-center gap-3 bg-white/60 dark:bg-[#111622]/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full shadow-sm h-[38px]">
          <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-[250px] tracking-tight">
            {selectedEventName}
          </span>

          {eventStats && (
            <>
              <div className="w-[4px] h-[4px] rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                <Flag size={13} strokeWidth={2.5} />
                <span>
                  {eventStats.solvedCount} / {eventStats.totalCount}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
