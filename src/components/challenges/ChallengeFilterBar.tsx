import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  filters: {
    status?: string;
    category: string;
    difficulty: string;
    search: string;
  };
  categories: string[];
  difficulties: string[];
  onFilterChange: (filters: any) => void;
  onClear: () => void;
  showStatusFilter?: boolean;
};

export default function ChallengeFilterBar({
  filters,
  categories,
  difficulties,
  onFilterChange,
  onClear,
  showStatusFilter = true,
}: Props) {
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
            {categories.map(category => (
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
            {[...difficulties]
              .sort((a, b) => {
                const order = ["Easy", "Medium", "Hard"];
                const idxA = order.indexOf(a);
                const idxB = order.indexOf(b);
                return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
              })
              .map(difficulty => (
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
      </form>
    </motion.div>
  );
}
