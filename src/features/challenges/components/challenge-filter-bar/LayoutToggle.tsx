'use client'

import { LayoutGrid, List, ListTree } from 'lucide-react'
import { useFilterContext } from '@/features/challenges/contexts/FilterContext'
import { SURFACE_FILTER_ITEM_CLASS } from '@/shared/styles'
import {
  CHALLENGE_LAYOUT_MODES,
  getNextChallengeLayoutMode,
} from '../../lib'

export default function LayoutToggle() {
  const { layoutMode, setLayoutMode } = useFilterContext()
  const isDefaultLayout = layoutMode === CHALLENGE_LAYOUT_MODES.GROUPED
  const nextLayoutMode = getNextChallengeLayoutMode(layoutMode)
  const title = layoutMode === CHALLENGE_LAYOUT_MODES.GROUPED
    ? 'Switch to category compact view'
    : layoutMode === CHALLENGE_LAYOUT_MODES.CATEGORY_COMPACT
      ? 'Switch to compact view'
      : 'Switch to grouped view'

  return (
    <button
      type="button"
      data-tour="challenge-layout-toggle"
      onClick={() => setLayoutMode(nextLayoutMode)}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition ${isDefaultLayout
        ? SURFACE_FILTER_ITEM_CLASS
        : 'border-blue-600 bg-blue-600 text-white shadow-inner dark:bg-blue-600 dark:border-blue-600'
        }`}
    >
      {layoutMode === CHALLENGE_LAYOUT_MODES.COMPACT
        ? <LayoutGrid size={16} />
        : layoutMode === CHALLENGE_LAYOUT_MODES.CATEGORY_COMPACT
          ? <ListTree size={16} />
          : <List size={16} />}
    </button>
  )
}
