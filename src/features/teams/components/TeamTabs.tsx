'use client'

import React from 'react'
import { ArrowLeft, Flag, Users, Wrench, LayoutDashboard } from 'lucide-react'
import { UserTabs } from '@/features/users/components/ui/UserTabs'

type TeamTabsProps = {
  activeTab: 'overview' | 'members' | 'solves' | 'manage'
  setActiveTab: (tab: 'overview' | 'members' | 'solves' | 'manage') => void
  onBack?: () => void
  canManage?: boolean
}

export default function TeamTabs({ activeTab, setActiveTab, onBack, canManage }: TeamTabsProps) {
  const tabs = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'members', label: 'Members', icon: Users },
    { value: 'solves', label: 'Solves', icon: Flag },
  ]

  if (canManage) {
    tabs.push({ value: 'manage', label: 'Manage', icon: Wrench })
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center justify-center gap-2 sm:justify-start">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white/50 px-4 text-xs font-semibold text-gray-600 backdrop-blur transition hover:border-blue-500/40 hover:text-blue-600 dark:border-white/10 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:text-blue-400 sm:h-10 sm:px-4 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">Go Back</span>
            <span className="xs:hidden">Back</span>
          </button>
        )}
      </div>

      <UserTabs
        activeTab={activeTab}
        onChange={setActiveTab as any}
        tabs={tabs as any}
      />
    </div>
  )
}
