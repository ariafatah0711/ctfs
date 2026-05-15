'use client'

import { ArrowRight, ClipboardList } from 'lucide-react'
import { SURFACE_GLASS_CONTROL_COMPACT_CLASS } from '@/shared/styles'
import type { ChallengeDialogTab } from '../../types'

type ChallengeTasksTeaserProps = {
  challengeId: string
  onTabChange: (tab: ChallengeDialogTab, challengeId?: string) => void
}

export default function ChallengeTasksTeaser({
  challengeId,
  onTabChange,
}: ChallengeTasksTeaserProps) {
  return (
    <div>
      <p className="select-none text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5 opacity-80">
        <ClipboardList className="h-4 w-4" />
        <span>Tasks</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          title="Answer all questions to get the flag"
          aria-label="Answer all questions to get the flag"
          onClick={() => onTabChange('question', challengeId)}
          className={`flex select-none items-center gap-2 px-4 py-2 text-sm font-bold ${SURFACE_GLASS_CONTROL_COMPACT_CLASS}`}
        >
          <ClipboardList className="h-4 w-4 text-gray-400" />
          <span>Answer Questions to Get the Flag</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
