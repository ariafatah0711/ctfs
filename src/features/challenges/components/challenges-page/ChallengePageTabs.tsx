'use client'

import { Flag, Zap } from 'lucide-react'
import { SegmentedTabs } from '@/shared/components'
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
    <SegmentedTabs
      items={[
        { value: 'challenges', label: 'Challenges', icon: Flag },
        { value: 'events', label: 'Events', icon: Zap },
      ]}
      value={currentTab}
      onChange={onTabChange}
      variant="panel"
    />
  )
}
