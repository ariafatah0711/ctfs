'use client'

import { LayoutGrid, List } from 'lucide-react'
import { useFilterContext } from '@/features/challenges/contexts/FilterContext'
import { SURFACE_FILTER_ITEM_CLASS } from '@/shared/styles'

export default function LayoutToggle() {
  const { layoutMode, setLayoutMode } = useFilterContext()
  const isDefaultLayout = layoutMode === 'grouped'

  return (
    <button
      type="button"
      data-tour="challenge-layout-toggle"
      onClick={() => setLayoutMode(layoutMode === 'compact' ? 'grouped' : 'compact')}
      title={layoutMode === 'compact' ? 'Switch to grouped view' : 'Switch to compact view'}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition ${isDefaultLayout
        ? SURFACE_FILTER_ITEM_CLASS
        : 'border-blue-600 bg-blue-600 text-white shadow-inner dark:bg-blue-600 dark:border-blue-600'
        }`}
    >
      {layoutMode === 'compact' ? <LayoutGrid size={16} /> : <List size={16} />}
    </button>
  )
}
