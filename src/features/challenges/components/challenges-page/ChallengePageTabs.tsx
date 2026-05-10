'use client'

import { Flag, Zap } from 'lucide-react'
import type { ChallengesMainTab } from '../../types'

type ChallengePageTabsProps = {
  currentTab: ChallengesMainTab
  onTabChange: (tab: ChallengesMainTab) => void
}

export default function ChallengePageTabs({
  currentTab,
  onTabChange,
}: ChallengePageTabsProps) {
  return (
    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onTabChange('challenges')}
        className={`px-4 py-2 text-sm font-medium transition border-b-2 ${currentTab === 'challenges'
          ? 'border-orange-500 text-orange-600 dark:text-orange-400'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
      >
        <div className="flex items-center gap-2">
          <Flag size={16} />
          Challenges
        </div>
      </button>
      <button
        onClick={() => onTabChange('events')}
        className={`px-4 py-2 text-sm font-medium transition border-b-2 ${currentTab === 'events'
          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
      >
        <div className="flex items-center gap-2">
          <Zap size={16} />
          Events
        </div>
      </button>
    </div>
  )
}
