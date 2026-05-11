'use client'

import React from 'react'
import { ArrowLeft, ChartColumnDecreasing, Flag } from 'lucide-react'
import { UserTabs } from '../ui'

type ProfileTabsProps = {
  activeTab: 'profile' | 'stats'
  setActiveTab: (tab: 'profile' | 'stats') => void
  onBack?: () => void
  editAction?: React.ReactNode
}

export default function ProfileTabs({ activeTab, setActiveTab, onBack, editAction }: ProfileTabsProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/50 px-4 py-2 text-sm font-semibold text-gray-600 backdrop-blur transition hover:border-blue-500/40 hover:text-blue-600 dark:border-white/10 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        )}
        {editAction}
      </div>

      <UserTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { value: 'profile', label: 'Challenges', icon: Flag },
          { value: 'stats', label: 'Stats', icon: ChartColumnDecreasing },
        ]}
      />
    </div>
  )
}
