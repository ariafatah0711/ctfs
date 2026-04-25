import React from 'react';
import APP from '@/config';
import { motion } from 'framer-motion';
import { Settings, LayoutGrid, List, Zap } from 'lucide-react';
import { useFilterContext } from '@/contexts/FilterContext';
import { Switch } from '@/components/ui/switch';
import { formatEventTimingLabel } from '@/lib/utils';

function LayoutToggle() {
  const { layoutMode, setLayoutMode } = useFilterContext()

  return (
    <button
      type="button"
      onClick={() => setLayoutMode(layoutMode === 'compact' ? 'grouped' : 'compact')}
      title={layoutMode === 'compact' ? 'Switch to grouped view' : 'Switch to compact view'}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
    >
      {layoutMode === 'compact' ? <LayoutGrid size={16} /> : <List size={16} />}
    </button>
  )
}

type EventItem = {
  id: string;
  name: string;
  start_time?: string | null;
  end_time?: string | null;
};

type Props = {
  filters: {
    status?: string;
    category: string;
    difficulty: string;
    search: string;
  };
  events?: EventItem[];
  selectedEventId?: string | null | 'all';
  onEventChange?: (eventId: string | null | 'all') => void;
  hideAllEventOption?: boolean;
  hideMainEventOption?: boolean;
  includeEndedEvents?: boolean;
  showEventState?: boolean;
  upcomingVisibilityWindowDays?: number | null;
  settings?: {
    hideMaintenance: boolean;
    highlightTeamSolves: boolean;
  };
  categories: string[];
  difficulties: string[];
  onFilterChange: (filters: any) => void;
  onSettingsChange?: (settings: { hideMaintenance: boolean; highlightTeamSolves: boolean }) => void;
  onClear: () => void;
  showStatusFilter?: boolean;
};

export default function ChallengeFilterBar({
  filters,
  events,
  selectedEventId,
  onEventChange,
  hideAllEventOption = false,
  hideMainEventOption = false,
  includeEndedEvents = false,
  showEventState = true,
  upcomingVisibilityWindowDays = 30,
  settings,
  categories,
  difficulties,
  onFilterChange,
  onSettingsChange,
  onClear,
  showStatusFilter = true,
}: Props) {
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  // Floating/sticky state when user scrolls past the bar
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [floating, setFloating] = React.useState(false)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let raf = 0
    const onScroll = () => {
      raf && cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        // show floating bar once original bar is scrolled above top threshold
        setFloating(rect.top < 12)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // initial check
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      raf && cancelAnimationFrame(raf)
    }
  }, [])

  const resolvedSettings = settings ?? { hideMaintenance: false, highlightTeamSolves: true }
  const mainLabel = String(APP.eventMainLabel || 'Main')
  const categoryOrder = APP.challengeCategories || []
  const difficultyOrder = Object.keys(APP.difficultyStyles || {})

  const sortedEvents = React.useMemo(() => {
    if (!events) return []
    const now = new Date().getTime()
    const UPCOMING_VISIBLE_WINDOW_MS =
      upcomingVisibilityWindowDays === null
        ? Number.POSITIVE_INFINITY
        : Math.max(0, upcomingVisibilityWindowDays) * 24 * 60 * 60 * 1000

    const visibleEvents = includeEndedEvents
      ? events
      : events.filter(evt => {
          if (!evt.end_time) return true
          return now <= new Date(evt.end_time).getTime()
        })

    const filteredUpcoming = visibleEvents.filter(evt => {
      if (typeof selectedEventId === 'string' && selectedEventId !== 'all' && evt.id === selectedEventId) {
        return true
      }

      if (!evt.start_time) return true
      const start = new Date(evt.start_time).getTime()
      if (Number.isNaN(start)) return true
      const remaining = start - now

      // Only apply the window to upcoming events.
      if (remaining <= 0) return true

      // Hide far-future upcoming events from the filter bar to prevent clutter.
      if (remaining > UPCOMING_VISIBLE_WINDOW_MS) return false
      return true
    })

    const getState = (evt: typeof events[number]) => {
      if (!showEventState) return 'ongoing' as const
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

      if (stateA !== stateB) {
        return statePriority[stateA] - statePriority[stateB]
      }

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
  }, [events, includeEndedEvents, selectedEventId, upcomingVisibilityWindowDays])

  const getEventTimingLabel = (evt?: { start_time?: string | null; end_time?: string | null }) => {
    return formatEventTimingLabel(evt);
  };

  const selectedEvent = React.useMemo(() => {
    if (!events) return null;
    if (typeof selectedEventId !== 'string') return null;
    if (selectedEventId === 'all') return null;
    return events.find(e => e.id === selectedEventId) ?? null;
  }, [events, selectedEventId]);

  const selectedTimingLabel = React.useMemo(() => {
    return selectedEvent ? getEventTimingLabel(selectedEvent) : null;
  }, [selectedEvent]);

  const shouldShowTimingAlways = (evt: EventItem) => {
    if (!showEventState) return false;
    if (!evt.end_time) return false;

    const now = Date.now();
    const end = new Date(evt.end_time).getTime();

    if (Number.isNaN(end)) return false;

    const windowMs =
      upcomingVisibilityWindowDays === null
        ? Infinity
        : upcomingVisibilityWindowDays * 24 * 60 * 60 * 1000;

    return end > now && end - now <= windowMs;
  };

  const getEventVisualState = (evt: EventItem) => {
    if (!showEventState) return 'ongoing';
    const now = Date.now();
    const start = evt.start_time ? new Date(evt.start_time).getTime() : null;
    const end = evt.end_time ? new Date(evt.end_time).getTime() : null;

    const windowMs =
      upcomingVisibilityWindowDays === null
        ? Infinity
        : upcomingVisibilityWindowDays * 24 * 60 * 60 * 1000;

    if (start && now < start) {
      const diff = start - now;
      if (diff <= windowMs) return 'upcoming-soon';
      return 'upcoming';
    }

    if (end && now > end) return 'ended';

    if (end && end - now <= windowMs) return 'ending-soon';

    return 'ongoing';
  };

  // Dirty indicators: whether a control differs from default
  const defaultFilters = { status: 'all', category: 'all', difficulty: 'all', search: '' }
  const isStatusDirty = (filters.status || 'all') !== defaultFilters.status
  const isCategoryDirty = (filters.category || 'all') !== defaultFilters.category
  const isDifficultyDirty = (filters.difficulty || 'all') !== defaultFilters.difficulty
  const isSearchDirty = (String(filters.search || '').trim() !== defaultFilters.search)
  const isEventDirty = selectedEventId !== 'all' && selectedEventId !== undefined && selectedEventId !== null
  const anyFilterDirty = isStatusDirty || isCategoryDirty || isDifficultyDirty || isSearchDirty

  // Sort categories sesuai order di config
  const sortedCategories = [
    ...categoryOrder.filter(cat => categories.includes(cat)),
    ...categories.filter(cat => !categoryOrder.includes(cat))
  ];

  // Normalize difficulties ke format config (capitalize)
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const normalizedDifficulties = Array.from(new Set(difficulties.map(capitalize)));
  const sortedDifficulties = [
    ...difficultyOrder.filter(diff => normalizedDifficulties.includes(diff)),
    ...normalizedDifficulties.filter(diff => !difficultyOrder.includes(diff))
  ];

  // render the inner bar body; pass `isFloating` to alter ids
  const renderBar = (isFloating = false) => (
    <div>
      {events && onEventChange && (
        <div className="mb-3">
          <div className="w-full flex flex-row flex-nowrap sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 py-2">
            {!hideAllEventOption && (
              <button
                type="button"
                onClick={() => onEventChange('all')}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-sm rounded-full border transition ${selectedEventId === 'all' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'} ${!isEventDirty && anyFilterDirty ? 'opacity-90' : ''}`}
              >
                All
              </button>
            )}
            {!hideMainEventOption && !APP.hideEventMain && (
              <button
                type="button"
                onClick={() => onEventChange(null)}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-sm rounded-full border transition ${!selectedEventId ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                {mainLabel}
              </button>
            )}
            {sortedEvents.map(evt => {
              const timing = getEventTimingLabel(evt);
              const isSelected = selectedEventId === evt.id;
              const state = getEventVisualState(evt);

              const stateStyles = {
                'upcoming-soon':
                  'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',

                'ending-soon':
                  'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',

                'ongoing':
                  'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',

                'ended':
                  'opacity-50',

                'upcoming':
                  '',
              } as Record<string, string>;

              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => onEventChange(evt.id)}
                  className={`
                    shrink-0 whitespace-nowrap px-3 py-1.5 text-sm rounded-full border transition flex items-center gap-1
                    ${
                      isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : (`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700
                            hover:bg-gray-50 dark:hover:bg-gray-800` + (showEventState ? ` ${stateStyles[state]}` : ''))
                    }
                  `}
                  title={timing || undefined}
                >
                  {showEventState && state === 'upcoming-soon' && (
                    <Zap size={12} className="text-yellow-500" />
                  )}

                  {showEventState && state === 'ending-soon' && (
                    <Zap size={12} className="text-purple-500" />
                  )}

                  <span>{evt.name}</span>

                  {showEventState && (isSelected || shouldShowTimingAlways(evt)) && timing && (
                    <span className="ml-1 text-[10px] opacity-80 hidden sm:inline">
                      {timing}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {showEventState && selectedTimingLabel && (
            <div className="sm:hidden mt-2 text-xs text-gray-600 dark:text-gray-300">
              {selectedTimingLabel}
            </div>
          )}
        </div>
      )}

      <form className="w-full flex flex-wrap gap-3 items-center" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={isFloating ? 'search-floating' : 'search'} className="sr-only">Search challenges</label>
        <div className="flex-1 min-w-[180px]">
          <input
            id={isFloating ? 'search-floating' : 'search'}
            type="text"
            value={filters.search}
            onChange={e => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search challenge..."
            className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${filters.search && String(filters.search).trim() !== '' ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} transition ${isSearchDirty ? 'ring-2' : ''}`}
          />
        </div>

        {showStatusFilter && (
          <div className="flex-1 min-w-[140px]">
            <label htmlFor={isFloating ? 'status-floating' : 'status'} className="sr-only">Status</label>
            <select
              id={isFloating ? 'status-floating' : 'status'}
              value={filters.status || 'all'}
              onChange={e => onFilterChange({ ...filters, status: e.target.value })}
              className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${filters.status && filters.status !== 'all' ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} ${isStatusDirty ? 'ring-2' : ''}`}
            >
              <option value="all">All Status</option>
              <option value="unsolved">Unsolved</option>
              <option value="solved">Solved</option>
            </select>
          </div>
        )}

        <div className="flex-1 min-w-[140px]">
          <label htmlFor={isFloating ? 'category-floating' : 'category'} className="sr-only">Category</label>
          <select
            id={isFloating ? 'category-floating' : 'category'}
            value={filters.category}
            onChange={e => onFilterChange({ ...filters, category: e.target.value })}
            className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${filters.category && filters.category !== 'all' ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} ${isCategoryDirty ? 'ring-2' : ''}`}
          >
            <option value="all">All Categories</option>
            {sortedCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label htmlFor={isFloating ? 'difficulty-floating' : 'difficulty'} className="sr-only">Difficulty</label>
          <select
            id={isFloating ? 'difficulty-floating' : 'difficulty'}
            value={filters.difficulty}
            onChange={e => onFilterChange({ ...filters, difficulty: e.target.value })}
            className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 ${filters.difficulty && filters.difficulty !== 'all' ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'} ${isDifficultyDirty ? 'ring-2' : ''}`}
          >
            <option value="all">All Difficulties</option>
            {sortedDifficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>

        <div className="flex-none min-w-[100px]">
          <button
            type="button"
            onClick={onClear}
            className={`w-full px-3 py-2 text-sm rounded transition ${anyFilterDirty ? 'bg-amber-500 text-white hover:bg-amber-600' : 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800'}`}
            aria-label="Clear filters"
          >
            Clear
          </button>
        </div>

        {onSettingsChange && (
          <div className="relative flex-none ml-auto flex items-center gap-2">
            <LayoutToggle />

            <div className="relative">
              <button
                type="button"
                onClick={() => setSettingsOpen(v => !v)}
                data-tour="challenge-filter-settings"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                aria-label="Open filter settings"
              >
                <Settings size={16} />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-3 z-40">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Hide maintenance</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Exclude maintenance challenges</p>
                    </div>
                    <Switch
                      checked={resolvedSettings.hideMaintenance}
                      onCheckedChange={(checked) =>
                        onSettingsChange({ ...resolvedSettings, hideMaintenance: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Team solve highlight</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Purple cards for team solves</p>
                    </div>
                    <Switch
                      checked={resolvedSettings.highlightTeamSolves}
                      onCheckedChange={(checked) =>
                        onSettingsChange({ ...resolvedSettings, highlightTeamSolves: checked })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </form>
    </div>
  )

  return (
    <div ref={containerRef}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        data-tour="challenge-filter-bar"
        className={`w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 mb-0 ${floating ? 'invisible' : ''}`}
      >
        {renderBar(false)}
      </motion.div>

      {/* Floating compact copy shown when user scrolls past the bar */}
      {floating && (
        <div className="fixed left-1/2 top-16 z-50 transform -translate-x-1/2 w-[min(96%,72rem)] pointer-events-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            {renderBar(true)}
          </div>
        </div>
      )}
    </div>
  );
}
