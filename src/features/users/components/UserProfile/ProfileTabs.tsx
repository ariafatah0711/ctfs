'use client'

import React from 'react'
import { ChartColumnDecreasing, Flag } from 'lucide-react'
import { UserTabs } from '../ui'
import BackButton from '@/shared/components/BackButton'

type ProfileTabsProps = {
  activeTab: 'profile' | 'stats'
  setActiveTab: (tab: 'profile' | 'stats') => void
  onBack?: () => void
  editAction?: React.ReactNode
}

export default function ProfileTabs({ activeTab, setActiveTab, onBack, editAction }: ProfileTabsProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center justify-center gap-3 sm:justify-start">
        {onBack && (
          <BackButton
            onClick={onBack}
            label="Back"
            className="h-10 rounded-xl border border-gray-200/50 bg-white/50 px-4 hover:bg-white dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-800"
          />
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
