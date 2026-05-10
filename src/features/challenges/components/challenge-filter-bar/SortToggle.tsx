'use client'

import { Clock3 } from 'lucide-react'
import type { ChallengeSortMode } from '../../types'

type SortToggleProps = {
  sortMode: ChallengeSortMode
  onToggle: () => void
}

export default function SortToggle({ sortMode, onToggle }: SortToggleProps) {
  const isDefaultSort = sortMode === 'default'

  return (
    <button
      type="button"
      data-tour="challenge-sort-toggle"
      onClick={onToggle}
      title={sortMode === 'default' ? 'Switch to newest first' : 'Switch to default sort'}
      aria-label="Toggle challenge sorting"
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded transition ${
        isDefaultSort
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          : 'border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-500 dark:bg-orange-950/40 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-950/60'
      }`}
    >
      <Clock3 size={16} className={isDefaultSort ? 'opacity-70' : 'animate-pulse'} />
    </button>
  )
}
