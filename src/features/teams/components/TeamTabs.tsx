'use client'

import React from 'react'
import { ArrowLeft, Wrench, LayoutDashboard } from 'lucide-react'
import { UserTabs } from '@/features/users/components/ui/UserTabs'
import { SURFACE_GLASS_CONTROL_COMPACT_CLASS } from '@/shared/styles'

type TeamTabValue = 'overview' | 'manage'

type TeamTabsProps = {
  activeTab: TeamTabValue
  setActiveTab: (tab: TeamTabValue) => void
  onBack?: () => void
  canManage?: boolean
  isMember?: boolean
}

export default function TeamTabs({ activeTab, setActiveTab, onBack, canManage, isMember }: TeamTabsProps) {
  const tabs = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  ]

  if (isMember) {
    tabs.push({ value: 'manage', label: canManage ? 'Admin' : 'Settings', icon: Wrench })
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center justify-center gap-2 sm:justify-start">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`inline-flex h-9 items-center gap-2 px-4 text-xs font-semibold sm:h-10 sm:px-4 sm:text-sm ${SURFACE_GLASS_CONTROL_COMPACT_CLASS} rounded-full`}
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
