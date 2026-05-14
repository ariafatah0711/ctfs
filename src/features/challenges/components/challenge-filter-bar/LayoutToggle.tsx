'use client'

import { LayoutGrid, List } from 'lucide-react'
import { useFilterContext } from '@/features/challenges/contexts/FilterContext'
import { THEME_PRIMARY_PILL_CLASS } from '@/shared/styles'

export default function LayoutToggle() {
  const { layoutMode, setLayoutMode } = useFilterContext()
  const isDefaultLayout = layoutMode === 'grouped'

  return (
    <button
      type="button"
      data-tour="challenge-layout-toggle"
      onClick={() => setLayoutMode(layoutMode === 'compact' ? 'grouped' : 'compact')}
      title={layoutMode === 'compact' ? 'Switch to grouped view' : 'Switch to compact view'}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded transition ${
        isDefaultLayout
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          : `${THEME_PRIMARY_PILL_CLASS} hover:bg-blue-100 dark:hover:bg-blue-950/60`
      }`}
    >
      {layoutMode === 'compact' ? <LayoutGrid size={16} /> : <List size={16} />}
    </button>
  )
}
