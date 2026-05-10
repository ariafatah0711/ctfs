'use client'

import APP from '@/config'
import {
  getFeatureFilterTitle,
  getNextFeatureFilterMode,
  getSortedFilterValues,
  type ChallengeFilterDirtyState,
} from '../../lib'
import type {
  ChallengeFeatureFilter,
  ChallengeFilterSettings,
  ChallengeFilterState,
  ChallengeSortMode,
} from '../../types'
import FilterSelect from './FilterSelect'
import FilterSettingsMenu from './FilterSettingsMenu'
import LayoutToggle from './LayoutToggle'
import SortToggle from './SortToggle'

type ChallengeFilterControlsProps = {
  filters: ChallengeFilterState
  settings?: ChallengeFilterSettings
  categories: string[]
  difficulties: string[]
  dirtyState: ChallengeFilterDirtyState
  settingsOpen: boolean
  showStatusFilter: boolean
  sortMode: ChallengeSortMode
  onFilterChange: (filters: any) => void
  onSettingsOpenChange: (open: boolean) => void
  onSettingsChange?: (settings: ChallengeFilterSettings) => void
  onClear: () => void
  onSortModeChange?: () => void
}

export default function ChallengeFilterControls({
  filters,
  settings,
  categories,
  difficulties,
  dirtyState,
  settingsOpen,
  showStatusFilter,
  sortMode,
  onFilterChange,
  onSettingsOpenChange,
  onSettingsChange,
  onClear,
  onSortModeChange,
}: ChallengeFilterControlsProps) {
  const resolvedSettings = settings ?? { hideMaintenance: false, highlightTeamSolves: true }
  const categoryOrder = APP.challengeCategories || []
  const difficultyOrder = Object.keys(APP.difficultyStyles || {})
  const { sortedCategories, sortedDifficulties } = getSortedFilterValues({
    categories,
    difficulties,
    categoryOrder,
    difficultyOrder,
  })
  const featureMode = filters.feature || 'N'
  const nextFeatureMode = getNextFeatureFilterMode(featureMode as ChallengeFeatureFilter)
  const featureButtonTitle = getFeatureFilterTitle(featureMode as ChallengeFeatureFilter)

  return (
    <form
      className="w-full flex flex-wrap gap-3 items-center"
      onSubmit={(event) => event.preventDefault()}
    >
      <label htmlFor="search" className="sr-only">Search challenges</label>
      <div className="flex-1 min-w-[180px]">
        <input
          id="search"
          type="text"
          value={filters.search}
          onChange={(event) => onFilterChange({ ...filters, search: event.target.value })}
          placeholder="Search challenge..."
          className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${filters.search && String(filters.search).trim() !== '' ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} transition ${dirtyState.isSearchDirty ? 'ring-2' : ''}`}
        />
      </div>

      {showStatusFilter && (
        <FilterSelect
          id="status"
          label="Status"
          value={filters.status || 'all'}
          onChange={(value) => onFilterChange({ ...filters, status: value })}
          isDirty={dirtyState.isStatusDirty}
          isActive={Boolean(filters.status && filters.status !== 'all')}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'unsolved', label: 'Unsolved' },
            { value: 'solved', label: 'Solved' },
          ]}
        />
      )}

      <FilterSelect
        id="category"
        label="Category"
        value={filters.category}
        onChange={(value) => onFilterChange({ ...filters, category: value })}
        isDirty={dirtyState.isCategoryDirty}
        isActive={Boolean(filters.category && filters.category !== 'all')}
        options={[
          { value: 'all', label: 'All Categories' },
          ...sortedCategories.map((category) => ({ value: category, label: category })),
        ]}
      />

      <FilterSelect
        id="difficulty"
        label="Difficulty"
        value={filters.difficulty}
        onChange={(value) => onFilterChange({ ...filters, difficulty: value })}
        isDirty={dirtyState.isDifficultyDirty}
        isActive={Boolean(filters.difficulty && filters.difficulty !== 'all')}
        options={[
          { value: 'all', label: 'All Difficulties' },
          ...sortedDifficulties.map((difficulty) => ({ value: difficulty, label: difficulty })),
        ]}
      />

      <div className="flex-none">
        <button
          type="button"
          data-tour="challenge-feature-filter"
          onClick={() => onFilterChange({ ...filters, feature: nextFeatureMode })}
          title={featureButtonTitle}
          aria-label={featureButtonTitle}
          className={`inline-flex h-9 w-9 items-center justify-center rounded border text-[11px] font-bold transition ${featureMode === 'N'
            ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            : featureMode === 'T'
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-blue-500 border-blue-500 text-white'
            }`}
        >
          {featureMode}
        </button>
      </div>

      <div className="flex-none min-w-[100px]">
        <button
          type="button"
          onClick={onClear}
          className={`w-full px-3 py-2 text-sm rounded transition ${dirtyState.anyFilterDirty ? 'bg-amber-500 text-white hover:bg-amber-600' : 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800'}`}
          aria-label="Clear filters"
        >
          Clear
        </button>
      </div>

      {onSettingsChange && (
        <div className="relative flex-none ml-auto flex items-center gap-2">
          {onSortModeChange && <SortToggle sortMode={sortMode} onToggle={onSortModeChange} />}

          <LayoutToggle />

          <FilterSettingsMenu
            open={settingsOpen}
            settings={resolvedSettings}
            onOpenChange={onSettingsOpenChange}
            onSettingsChange={onSettingsChange}
          />
        </div>
      )}
    </form>
  )
}
