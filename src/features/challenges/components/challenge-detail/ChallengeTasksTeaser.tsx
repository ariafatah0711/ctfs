'use client'

import { ClipboardList } from 'lucide-react'
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
      <p className="text-xs text-gray-400 inline-flex items-center gap-1">
        <ClipboardList className="h-3.5 w-3.5" /> Tasks
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onTabChange('question', challengeId)}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs rounded-md shadow flex items-center gap-2 group transition-all"
        >
          <span>Jawab semua questions untuk mendapatkan flag</span>
          <span className="group-hover:translate-x-1 transition-transform">â†’</span>
        </button>
      </div>
    </div>
  )
}
