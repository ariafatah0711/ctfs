'use client'

import type { ChallengeDialogTab } from '../../types'

type ChallengeDialogTabsProps = {
  challengeId: string
  tabs: Array<{ key: ChallengeDialogTab; label: string }>
  activeTab: ChallengeDialogTab
  onTabChange: (tab: ChallengeDialogTab, challengeId?: string) => void
}

export default function ChallengeDialogTabs({
  challengeId,
  tabs,
  activeTab,
  onTabChange,
}: ChallengeDialogTabsProps) {
  return (
    <div className="flex p-1 gap-1 bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`flex-1 px-3 py-1.5 rounded-lg font-bold text-xs text-center transition-all ${activeTab === tab.key
            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          onClick={() => onTabChange(tab.key, challengeId)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
