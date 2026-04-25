import React from 'react'
import APP from '@/config'
import { Zap, Search } from 'lucide-react'
import { formatEventTimingLabel } from '@/lib/utils'

type EventItem = {
  id: string
  name: string
  start_time?: string | null
  end_time?: string | null
}

type Props = {
  filters: { status?: string; category: string; difficulty: string; search: string }
  events?: EventItem[]
  selectedEventId?: string | null | 'all'
  onEventChange?: (eventId: string | null | 'all') => void
  showEventState?: boolean
  upcomingVisibilityWindowDays?: number | null
  categories: string[]
  difficulties: string[]
  onFilterChange: (filters: any) => void
  onClear: () => void
  showStatusFilter?: boolean
}

export default function ChallengeFilterSidebar({
  filters,
  events,
  selectedEventId,
  onEventChange,
  showEventState = true,
  upcomingVisibilityWindowDays = 30,
  categories,
  difficulties,
  onFilterChange,
  onClear,
  showStatusFilter = true,
}: Props) {
  const mainLabel = String(APP.eventMainLabel || 'Main')
  const getTiming = (evt?: EventItem) => formatEventTimingLabel(evt)

  // Match horizontal filter logic: sorting, state detection, and dirty input styles
  const UPCOMING_VISIBLE_WINDOW_MS =
    upcomingVisibilityWindowDays === null
      ? Number.POSITIVE_INFINITY
      : Math.max(0, upcomingVisibilityWindowDays) * 24 * 60 * 60 * 1000

  const sortedEvents = React.useMemo(() => {
    if (!events) return []
    const now = Date.now()
    const visibleEvents = events.filter((evt) => {
      if (!evt) return false
      if (!evt.end_time) return true
      return now <= new Date(evt.end_time).getTime()
    })

    const filteredUpcoming = visibleEvents.filter((evt) => {
      if (typeof selectedEventId === 'string' && selectedEventId !== 'all' && evt.id === selectedEventId) return true
      if (!evt.start_time) return true
      const start = new Date(evt.start_time).getTime()
      if (Number.isNaN(start)) return true
      const remaining = start - now
      if (remaining <= 0) return true
      if (remaining > UPCOMING_VISIBLE_WINDOW_MS) return false
      return true
    })

    const getState = (evt: EventItem) => {
      const start = evt.start_time ? new Date(evt.start_time).getTime() : null
      const end = evt.end_time ? new Date(evt.end_time).getTime() : null
      if (!start && !end) return 'permanent' as const
      if (end && now > end) return 'ended' as const
      if (start && now < start) return 'upcoming' as const
      return 'ongoing' as const
    }

    return [...filteredUpcoming].sort((a, b) => {
      const stateA = getState(a)
      const stateB = getState(b)
      const statePriority: Record<typeof stateA, number> = {
        permanent: 0,
        ongoing: 1,
        upcoming: 2,
        ended: 3,
      }

      if (stateA !== stateB) return statePriority[stateA] - statePriority[stateB]

      if (stateA === 'permanent') {
        const aStart = a.start_time ? new Date(a.start_time).getTime() : 0
        const bStart = b.start_time ? new Date(b.start_time).getTime() : 0
        return aStart - bStart || a.name.localeCompare(b.name)
      }

      if (stateA === 'ongoing') {
        const aEnd = a.end_time ? new Date(a.end_time).getTime() : Infinity
        const bEnd = b.end_time ? new Date(b.end_time).getTime() : Infinity
        return aEnd - bEnd
      }

      if (stateA === 'upcoming') {
        const aStart = a.start_time ? new Date(a.start_time).getTime() : Infinity
        const bStart = b.start_time ? new Date(b.start_time).getTime() : Infinity
        return aStart - bStart
      }

      if (stateA === 'ended') {
        const aEnd = a.end_time ? new Date(a.end_time).getTime() : 0
        const bEnd = b.end_time ? new Date(b.end_time).getTime() : 0
        return bEnd - aEnd
      }

      return 0
    })
  }, [events, selectedEventId, upcomingVisibilityWindowDays])

  // Dirty flags for inputs (match horizontal bar)
  const defaultFilters = { status: 'all', category: 'all', difficulty: 'all', search: '' }
  const isStatusDirty = (filters.status || 'all') !== defaultFilters.status
  const isCategoryDirty = (filters.category || 'all') !== defaultFilters.category
  const isDifficultyDirty = (filters.difficulty || 'all') !== defaultFilters.difficulty
  const isSearchDirty = (String(filters.search || '').trim() !== defaultFilters.search)

  // normalize difficulties and categories similar to ChallengeFilterBar
  const categoryOrder = APP.challengeCategories || []
  const sortedCategories = [
    ...categoryOrder.filter((cat: string) => categories.includes(cat)),
    ...categories.filter((cat: string) => !categoryOrder.includes(cat)),
  ]

  const difficultyOrder = Object.keys(APP.difficultyStyles || {})
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  const normalizedDifficulties = Array.from(new Set(difficulties.map(capitalize)))
  const sortedDifficulties = [
    ...difficultyOrder.filter((d: string) => normalizedDifficulties.includes(d)),
    ...normalizedDifficulties.filter((d: string) => !difficultyOrder.includes(d)),
  ]

  const getEventVisualState = (evt?: EventItem) => {
    if (!evt) return 'ongoing'
    const now = Date.now()
    const start = evt.start_time ? new Date(evt.start_time).getTime() : null
    const end = evt.end_time ? new Date(evt.end_time).getTime() : null

    if (start && now < start) {
      const diff = start - now
      // treat far future as upcoming
      return diff <= (upcomingVisibilityWindowDays === null ? Infinity : upcomingVisibilityWindowDays * 24 * 60 * 60 * 1000)
        ? 'upcoming-soon'
        : 'upcoming'
    }

    if (end && now > end) return 'ended'
    if (end && end - now <= (upcomingVisibilityWindowDays === null ? Infinity : upcomingVisibilityWindowDays * 24 * 60 * 60 * 1000)) return 'ending-soon'
    return 'ongoing'
  }

  const shouldShowTimingAlways = (evt?: EventItem) => {
    if (!evt || !evt.end_time) return false
    const now = Date.now()
    const end = new Date(evt.end_time).getTime()
    if (Number.isNaN(end)) return false
    const windowMs = upcomingVisibilityWindowDays === null ? Infinity : upcomingVisibilityWindowDays * 24 * 60 * 60 * 1000
    return end > now && end - now <= windowMs
  }

  const stateStyles: Record<string, string> = {
    'upcoming-soon': 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    'ending-soon': 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    'ongoing': 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    'ended': 'opacity-50',
    'upcoming': '',
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:gap-4 lg:w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Search</label>
          <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            className={`flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${filters.search && String(filters.search).trim() !== '' ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} transition ${isSearchDirty ? 'ring-2' : ''}`}
            placeholder="Search challenges..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Status</label>
        {showStatusFilter ? (
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${filters.status && filters.status !== 'all' ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} ${isStatusDirty ? 'ring-2' : ''}`}
          >
            <option value="all">All</option>
            <option value="unsolved">Unsolved</option>
            <option value="solved">Solved</option>
          </select>
        ) : null}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${filters.category && filters.category !== 'all' ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} ${isCategoryDirty ? 'ring-2' : ''}`}
        >
          <option value="all">All Categories</option>
          {sortedCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Difficulty</label>
        <select
          value={filters.difficulty}
          onChange={(e) => onFilterChange({ ...filters, difficulty: e.target.value })}
          className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${filters.difficulty && filters.difficulty !== 'all' ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} ${isDifficultyDirty ? 'ring-2' : ''}`}
        >
          <option value="all">All Difficulties</option>
          {sortedDifficulties.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-auto">
        {events && (
          <div className="mt-1 flex flex-col gap-2">
            <button
              onClick={() => onEventChange && onEventChange('all')}
              className={`text-left px-3 py-2 rounded ${selectedEventId === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              All
            </button>
            {!APP.hideEventMain && (
              <button
                onClick={() => onEventChange && onEventChange(null)}
                className={`text-left px-3 py-2 rounded ${!selectedEventId ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                {mainLabel}
              </button>
            )}
            {events.map((evt) => {
              const timing = getTiming(evt)
              const state = getEventVisualState(evt)
              const style = selectedEventId === evt.id
                ? 'bg-indigo-600 text-white'
                : `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${showEventState ? stateStyles[state] : ''}`

              return (
                <button
                  key={evt.id}
                  onClick={() => onEventChange && onEventChange(evt.id)}
                  className={`text-left px-3 py-2 rounded flex items-center justify-between ${style}`}
                >
                  <div className="flex items-center gap-2">
                    {showEventState && state === 'upcoming-soon' && <Zap className="w-4 h-4 text-yellow-500" />}
                    {showEventState && state === 'ending-soon' && <Zap className="w-4 h-4 text-purple-500" />}
                    {showEventState && (state === 'ongoing') && <Zap className="w-4 h-4 text-green-500" />}
                    <span className="truncate">{evt.name}</span>
                  </div>
                  {showEventState && (selectedEventId === evt.id || shouldShowTimingAlways(evt)) && timing && (
                    <span className="text-xs opacity-80 ml-2 hidden sm:inline">{timing}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          onClick={() => onClear && onClear()}
          className="w-full px-3 py-2 rounded bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm"
        >
          Clear Filters
        </button>
      </div>
    </aside>
  )
}
