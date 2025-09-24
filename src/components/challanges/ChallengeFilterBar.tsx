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
      className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          value={filters.search}
          onChange={e => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="🔍 Search challenge..."
          className="w-full sm:w-auto flex-1 px-4 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          style={{ minWidth: 160 }}
        />
        {showStatusFilter && (
          <select
            value={filters.status || 'all'}
            onChange={e => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full sm:w-auto flex-1 px-4 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          >
            <option value="all">All Status</option>
            <option value="unsolved">Unsolved</option>
            <option value="solved">Solved</option>
          </select>
        )}
        <select
          value={filters.category}
          onChange={e => onFilterChange({ ...filters, category: e.target.value })}
          className="w-full sm:w-auto flex-1 px-4 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={filters.difficulty}
          onChange={e => onFilterChange({ ...filters, difficulty: e.target.value })}
          className="w-full sm:w-auto flex-1 px-4 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
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
        <button
          onClick={onClear}
          className="w-full sm:w-auto px-4 py-2 text-base text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition"
        >
          Clear
        </button>
      </div>
    </motion.div>
  );
}
