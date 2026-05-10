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
    <div className="flex p-1.5 gap-1 bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 backdrop-blur-sm rounded-xl w-fit">
      <button
        onClick={() => onTabChange('challenges')}
        className={`px-5 py-2 text-sm font-bold transition-all rounded-lg flex items-center gap-2 ${currentTab === 'challenges'
          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
          }`}
      >
        <Flag size={14} className={currentTab === 'challenges' ? 'animate-pulse' : ''} />
        Challenges
      </button>
      <button
        onClick={() => onTabChange('events')}
        className={`px-5 py-2 text-sm font-bold transition-all rounded-lg flex items-center gap-2 ${currentTab === 'events'
          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50'
          }`}
      >
        <Zap size={14} className={currentTab === 'events' ? 'animate-pulse' : ''} />
        Events
      </button>
    </div>
  )
}
