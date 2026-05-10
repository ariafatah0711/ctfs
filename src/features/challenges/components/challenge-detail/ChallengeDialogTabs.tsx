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
    <div
      className="grid w-full gap-2"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`w-full px-2 py-1 rounded-t-md font-bold text-sm text-center transition-colors ${activeTab === tab.key ? 'bg-[#35355e] dark:bg-gray-800 text-pink-300 dark:text-pink-200' : 'bg-[#232344] dark:bg-gray-900 text-gray-300 dark:text-gray-400 hover:text-pink-200'}`}
          onClick={() => onTabChange(tab.key, challengeId)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
