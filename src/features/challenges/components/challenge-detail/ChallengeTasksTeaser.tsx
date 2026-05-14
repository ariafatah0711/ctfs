'use client'

import { ClipboardList, ArrowBigRightDash } from 'lucide-react'
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
          onClick={() => onTabChange('question', challengeId)}
          className="select-none px-4 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/20 font-bold text-sm rounded-lg shadow-sm flex items-center gap-2 group transition-all"
        >
          <span>Jawab semua questions untuk mendapatkan flag</span>
          <ArrowBigRightDash className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
