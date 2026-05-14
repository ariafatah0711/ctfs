'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, EyeOff, LayoutGrid, ListFilter, Search, X } from 'lucide-react'
import type { ElementType } from 'react'
import APP from '@/config'
import {
  SURFACE_FILTER_ITEM_ACTIVE_CLASS,
  SURFACE_FILTER_ITEM_CLASS,
} from '@/shared/styles'
import {
  getCategoryDetails,
  getCategoryIcon,
  getSortedFilterValues,
} from '../../lib'
import type { ChallengeFilterState } from '../../types'

type DesktopChallengeFilterSidebarProps = {
  filters: ChallengeFilterState
  categories: string[]
  difficulties: string[]
  onFilterChange: (filters: any) => void
}

export default function DesktopChallengeFilterSidebar({
  filters,
  categories,
  difficulties,
  onFilterChange,
}: DesktopChallengeFilterSidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const categoryOrder = APP.challengeCategories || []
  const difficultyOrder = Object.keys(APP.difficultyStyles || {})
  const selectedCategory = filters.category || 'all'
  const selectedDifficulty = filters.difficulty || 'all'
  const selectedFeature = filters.feature || 'N'
  const searchQuery = String(filters.search || '').trim()
  const searchTitle = searchQuery
    ? `Search: ${searchQuery}. Click to edit search.`
    : 'Search challenges'
  const showUnsolvedOnly = filters.status === 'unsolved'
  const showSolvedOnly = filters.status === 'solved'
  const statusLabel = showSolvedOnly ? 'Solved' : showUnsolvedOnly ? 'Unsolved' : 'All Status'
  const statusTitle = showSolvedOnly
    ? 'Showing solved only. Click to show unsolved only.'
    : showUnsolvedOnly
      ? 'Showing unsolved only. Click to show all statuses.'
      : 'Showing all statuses. Click to show unsolved only.'
  const StatusIcon = showSolvedOnly ? CheckCircle2 : showUnsolvedOnly ? EyeOff : ListFilter
  const { sortedCategories, sortedDifficulties } = getSortedFilterValues({
    categories,
    difficulties,
    categoryOrder,
    difficultyOrder,
  })

  useEffect(() => {
    const handleSearchOpen = () => setSearchOpen(true)

    document.addEventListener('challenge-search-open', handleSearchOpen)
    return () => document.removeEventListener('challenge-search-open', handleSearchOpen)
  }, [])

  const scrollToChallengeFilter = () => {
    const anchor = document.querySelector<HTMLElement>('[data-tour="challenge-filter-bar"]')
    if (!anchor) return

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const top = anchor.getBoundingClientRect().top + window.scrollY - 72
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
      })
    })
  }

  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category })
    scrollToChallengeFilter()
  }

  const handleStatusToggle = () => {
    onFilterChange({
      ...filters,
      status: showUnsolvedOnly ? 'all' : 'unsolved',
    })
    scrollToChallengeFilter()
  }

  const handleDifficultyChange = (difficulty: string) => {
    onFilterChange({ ...filters, difficulty })
    scrollToChallengeFilter()
  }

  const handleFeatureChange = (feature: string) => {
    onFilterChange({ ...filters, feature })
    scrollToChallengeFilter()
  }

  return (
    <>
      <aside
        data-tour="challenge-sidebar-filters"
        className="relative z-20 hidden max-h-[calc(100vh-8.75rem)] overflow-y-auto xl:block"
      >
        <div className="flex w-[176px] flex-col gap-1.5 rounded-2xl border border-blue-500/20 bg-white/60 p-2 shadow-sm shadow-blue-500/5 backdrop-blur-md dark:border-blue-500/10 dark:bg-gray-900/60">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            title={searchTitle}
            aria-label={searchTitle}
            className={iconButtonClass(Boolean(searchQuery))}
          >
            <Search size={19} />
            <span className={searchQuery ? 'truncate normal-case' : 'truncate'}>
              {searchQuery || 'Search'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleStatusToggle}
            title={statusTitle}
            aria-label={statusTitle}
            className={iconButtonClass(showUnsolvedOnly || showSolvedOnly)}
          >
            <StatusIcon size={19} />
            <span className="truncate">{statusLabel}</span>
          </button>

          <label htmlFor="desktop-sidebar-difficulty" className="sr-only">
            Difficulty
          </label>
          <select
            id="desktop-sidebar-difficulty"
            value={selectedDifficulty}
            onChange={(event) => handleDifficultyChange(event.target.value)}
            className={`h-9 w-full rounded-xl border px-3 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500/30 ${selectedDifficulty !== 'all'
              ? SURFACE_FILTER_ITEM_ACTIVE_CLASS
              : SURFACE_FILTER_ITEM_CLASS
            }`}
            title="Filter by difficulty"
            aria-label="Filter by difficulty"
          >
            <option value="all">All Difficulties</option>
            {sortedDifficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>

          <label htmlFor="desktop-sidebar-feature" className="sr-only">
            Feature
          </label>
          <select
            id="desktop-sidebar-feature"
            value={selectedFeature}
            onChange={(event) => handleFeatureChange(event.target.value)}
            className={`h-9 w-full rounded-xl border px-3 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500/30 ${selectedFeature !== 'N'
              ? SURFACE_FILTER_ITEM_ACTIVE_CLASS
              : SURFACE_FILTER_ITEM_CLASS
            }`}
            title="Filter by challenge feature"
            aria-label="Filter by challenge feature"
          >
            <option value="N">All Features</option>
            <option value="T">Tasks</option>
            <option value="S">Services</option>
          </select>

          <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

          <div className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Categories
          </div>

          <div className="flex flex-col gap-2">
            <CategoryButton
              label="All Categories"
              active={selectedCategory === 'all'}
              icon={LayoutGrid}
              iconClassName="text-current"
              onClick={() => handleCategoryChange('all')}
            />

            {sortedCategories.map((category) => {
              const CategoryIcon = getCategoryIcon(category)
              const { color } = getCategoryDetails(category)

              return (
                <CategoryButton
                  key={category}
                  label={category}
                  active={selectedCategory === category}
                  icon={CategoryIcon}
                  iconClassName={color}
                  onClick={() => handleCategoryChange(category)}
                />
              )
            })}
          </div>
        </div>
      </aside>

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 hidden items-start justify-center bg-gray-950/20 px-4 pt-28 backdrop-blur-sm xl:flex"
          onClick={() => setSearchOpen(false)}
        >
          <form
            className="relative w-full max-w-xl rounded-2xl border border-blue-500/20 bg-white/95 p-3 shadow-2xl shadow-blue-500/10 dark:border-blue-500/10 dark:bg-gray-950/95"
            onSubmit={(event) => {
              event.preventDefault()
              setSearchOpen(false)
              scrollToChallengeFilter()
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Search
              size={18}
              className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <label htmlFor="desktop-sidebar-search" className="sr-only">
              Search challenges
            </label>
            <input
              id="desktop-sidebar-search"
              type="text"
              value={filters.search}
              onChange={(event) => onFilterChange({ ...filters, search: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearchOpen(false)
              }}
              placeholder="Search challenge..."
              autoFocus
              className="h-12 w-full rounded-xl border border-gray-200 bg-white/80 pl-11 pr-12 text-base font-semibold text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-800 dark:bg-gray-900/80 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              title="Close search"
              aria-label="Close search"
              className="absolute right-5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <X size={17} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

function iconButtonClass(active: boolean) {
  return `relative inline-flex h-9 w-full items-center gap-2 rounded-xl border px-3 text-left text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${active
    ? SURFACE_FILTER_ITEM_ACTIVE_CLASS
    : SURFACE_FILTER_ITEM_CLASS
  }`
}

type CategoryButtonProps = {
  label: string
  active: boolean
  icon: ElementType
  iconClassName: string
  onClick: () => void
}

function CategoryButton({
  label,
  active,
  icon: Icon,
  iconClassName,
  onClick,
}: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={iconButtonClass(active)}
      title={`Filter by ${label}`}
      aria-label={`Filter by ${label}`}
    >
      <Icon size={19} className={`shrink-0 ${active ? 'text-white' : iconClassName}`} />
      <span className="truncate">{label}</span>
    </button>
  )
}
