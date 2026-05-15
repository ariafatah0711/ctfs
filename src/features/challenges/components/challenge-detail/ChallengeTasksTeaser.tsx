'use client'

import { ArrowRight, ClipboardList } from 'lucide-react'
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
          className="flex select-none items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          <ClipboardList className="h-4 w-4 text-gray-400" />
          <span>Answer Questions to Get the Flag</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
