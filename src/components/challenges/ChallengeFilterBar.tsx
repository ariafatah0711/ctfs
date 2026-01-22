import React from 'react';
import APP from '@/config';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

type Props = {
  filters: {
    status?: string;
    category: string;
    difficulty: string;
    search: string;
  };
  events?: { id: string; name: string; start_time?: string | null; end_time?: string | null }[];
  selectedEventId?: string | null | 'all';
  onEventChange?: (eventId: string | null | 'all') => void;
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
  settings,
  categories,
  difficulties,
  onFilterChange,
  onSettingsChange,
  onClear,
  showStatusFilter = true,
}: Props) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const resolvedSettings = settings ?? { hideMaintenance: false, highlightTeamSolves: true };
  // Ambil urutan dari config
  const categoryOrder = APP.challengeCategories || [];
  const difficultyOrder = Object.keys(APP.difficultyStyles || {});

  const sortedEvents = React.useMemo(() => {
    if (!events) return [];
    const now = new Date().getTime();
    return [...events].sort((a, b) => {
      const aNoEnd = !a.end_time;
      const bNoEnd = !b.end_time;

      // Both have no end_time - sort by name
      if (aNoEnd && bNoEnd) return a.name.localeCompare(b.name);

      // One has no end_time - that comes first (ongoing)
      if (aNoEnd !== bNoEnd) return aNoEnd ? -1 : 1;

      const aEndTime = new Date(a.end_time!).getTime();
      const bEndTime = new Date(b.end_time!).getTime();

      const aEnded = now > aEndTime;
      const bEnded = now > bEndTime;

      // Different ended status - not ended comes first, ended comes last
      if (aEnded !== bEnded) return aEnded ? 1 : -1;

      // Both ended or both not ended - sort by end_time ascending (nearest first)
      return aEndTime - bEndTime;
    });
  }, [events]);

  const getEventTimingLabel = (evt?: { start_time?: string | null; end_time?: string | null }) => {
    if (!evt) return null;
    const now = new Date();
    const start = evt.start_time ? new Date(evt.start_time) : null;
    const end = evt.end_time ? new Date(evt.end_time) : null;

    const formatRemaining = (ms: number) => {
      const totalMinutes = Math.max(0, Math.floor(ms / 60000));
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    if (start && now < start) {
      return `Starts in ${formatRemaining(start.getTime() - now.getTime())}`;
    }
    if (end && now > end) {
      return 'Ended';
    }
    if (end) {
      return `Ends in ${formatRemaining(end.getTime() - now.getTime())}`;
    }
    if (start) {
      return 'Ongoing';
    }
    return null;
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 mb-0"
    >
      {events && onEventChange && (
        <div className="w-full flex flex-wrap gap-2 py-2 mb-3">
          <button
            type="button"
            onClick={() => onEventChange('all')}
            className={`px-3 py-1.5 text-sm rounded-full border transition ${selectedEventId === 'all' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onEventChange(null)}
            className={`px-3 py-1.5 text-sm rounded-full border transition ${!selectedEventId ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            Main
          </button>
          {sortedEvents.map(evt => (
            <button
              key={evt.id}
              type="button"
              onClick={() => onEventChange(evt.id)}
              className={`px-3 py-1.5 text-sm rounded-full border transition ${selectedEventId === evt.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <span>{evt.name}</span>
              {getEventTimingLabel(evt) && (
                <span className="ml-2 text-[10px] opacity-80">{getEventTimingLabel(evt)}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <form className="w-full flex flex-wrap gap-3 items-center">
        <label htmlFor="search" className="sr-only">Search challenges</label>
        <div className="flex-1 min-w-[180px]">
          <input
          id="search"
          type="text"
          value={filters.search}
          onChange={e => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Search challenge..."
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
        />
        </div>

        {showStatusFilter && (
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="status" className="sr-only">Status</label>
            <select
              id="status"
              value={filters.status || 'all'}
              onChange={e => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
            >
              <option value="all">All Status</option>
              <option value="unsolved">Unsolved</option>
              <option value="solved">Solved</option>
            </select>
          </div>
        )}

        <div className="flex-1 min-w-[140px]">
          <label htmlFor="category" className="sr-only">Category</label>
          <select
            id="category"
            value={filters.category}
            onChange={e => onFilterChange({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
          >
            <option value="all">All Categories</option>
            {sortedCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label htmlFor="difficulty" className="sr-only">Difficulty</label>
          <select
            id="difficulty"
            value={filters.difficulty}
            onChange={e => onFilterChange({ ...filters, difficulty: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
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
            className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition"
            aria-label="Clear filters"
          >
            Clear
          </button>
        </div>

        {/* Settings */}
        {onSettingsChange && (
          <div className="relative flex-none ml-auto">
            <button
              type="button"
              onClick={() => setSettingsOpen(v => !v)}
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
        )}
      </form>
    </motion.div>
  );
}
