'use client'

import { Clock3 } from 'lucide-react'
import { SURFACE_FILTER_ITEM_CLASS, SURFACE_FILTER_ITEM_ACTIVE_CLASS } from '@/shared/styles'
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
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition ${isDefaultSort
        ? SURFACE_FILTER_ITEM_CLASS
        : SURFACE_FILTER_ITEM_ACTIVE_CLASS
        }`}
    >
      <Clock3 size={16} className={isDefaultSort ? 'opacity-70' : 'animate-pulse'} />
    </button>
  )
}
