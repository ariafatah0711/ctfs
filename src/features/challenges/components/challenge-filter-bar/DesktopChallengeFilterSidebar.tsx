'use client'

import { useEffect, useState } from 'react'
import { EyeOff, ListFilter, Puzzle, Search, X } from 'lucide-react'
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
  categoryCounts: Record<string, number>
  totalCount: number
  onFilterChange: (filters: any) => void
}

export default function DesktopChallengeFilterSidebar({
  filters,
  categories,
  categoryCounts,
  totalCount,
  onFilterChange,
}: DesktopChallengeFilterSidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const categoryOrder = APP.challengeCategories || []
  const selectedCategory = filters.category || 'all'
  const showUnsolvedOnly = filters.status === 'unsolved'
  const { sortedCategories } = getSortedFilterValues({
    categories,
    difficulties: [],
    categoryOrder,
    difficultyOrder: [],
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

  return (
    <>
      <aside
        data-tour="challenge-sidebar-filters"
        className="sticky top-[4.5rem] hidden max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1 xl:block"
      >
        <div className="flex w-[64px] flex-col items-center gap-2 rounded-2xl border border-blue-500/20 bg-white/60 p-2 shadow-sm shadow-blue-500/5 backdrop-blur-md dark:border-blue-500/10 dark:bg-gray-900/60">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            title="Search challenges"
            aria-label="Search challenges"
            className={iconButtonClass(Boolean(filters.search))}
          >
            <Search size={19} />
          </button>

          <button
            type="button"
            onClick={handleStatusToggle}
            title={showUnsolvedOnly ? 'Show all challenges' : 'Show unsolved only'}
            aria-label={showUnsolvedOnly ? 'Show all challenges' : 'Show unsolved only'}
            className={iconButtonClass(showUnsolvedOnly)}
          >
            {showUnsolvedOnly ? <EyeOff size={19} /> : <ListFilter size={19} />}
          </button>

          <div className="h-px w-8 bg-gray-200 dark:bg-gray-800" />

          <div className="flex flex-col items-center gap-2">
            <CategoryButton
              label="All"
              count={totalCount}
              active={selectedCategory === 'all'}
              icon={Puzzle}
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
                  count={categoryCounts[category] ?? 0}
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
  return `relative inline-flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${active
    ? SURFACE_FILTER_ITEM_ACTIVE_CLASS
    : SURFACE_FILTER_ITEM_CLASS
  }`
}

type CategoryButtonProps = {
  label: string
  count: number
  active: boolean
  icon: ElementType
  iconClassName: string
  onClick: () => void
}

function CategoryButton({
  label,
  count,
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
      title={`${label} (${count})`}
      aria-label={`Filter by ${label}, ${count} challenges`}
    >
      <Icon size={19} className={`shrink-0 ${active ? 'text-white' : iconClassName}`} />
      {active && count > 0 && (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-white px-1 text-center font-mono text-[10px] leading-5 text-blue-600">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
