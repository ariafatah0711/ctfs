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
