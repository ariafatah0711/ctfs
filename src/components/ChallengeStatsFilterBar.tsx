import React from 'react'

type Props = {
  userScore: number
  solvedCount: number
  totalChallenges: number
  filteredCount: number
  filters: {
    status: string
    category: string
    difficulty: string
    search: string
  }
  categories: string[]
  difficulties: string[]
  onFilterChange: (filters: any) => void
  onClear: () => void
}

export default function ChallengeStatsFilterBar({
  userScore,
  solvedCount,
  totalChallenges,
  filteredCount,
  filters,
  categories,
  difficulties,
  onFilterChange,
  onClear,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-blue-600">
            🏆 <b>{userScore}</b>
          </span>
          <span className="flex items-center gap-1 text-green-600">
            ✓ <b>{solvedCount}</b>
          </span>
          <span className="flex items-center gap-1 text-purple-600">
            📊 <b>{totalChallenges}</b>
          </span>
          <span className="flex items-center gap-1 text-yellow-600">
            📈 <b>
              {totalChallenges > 0 ? Math.round((solvedCount / totalChallenges) * 100) : 0}%
            </b>
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {filteredCount} of {totalChallenges} challenges
        </span>
      </div>
      <div className="flex flex-wrap gap-1 items-center mb-2">
        <input
          type="text"
          value={filters.search}
          onChange={e => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="🔍 Search..."
          className="px-2 py-1 text-xs border border-gray-300 rounded"
          style={{ minWidth: 100 }}
        />
        <select
          value={filters.status}
          onChange={e => onFilterChange({ ...filters, status: e.target.value })}
          className="px-2 py-1 text-xs border border-gray-300 rounded"
        >
          <option value="all">All</option>
          <option value="unsolved">Unsolved</option>
          <option value="solved">Solved</option>
        </select>
        <select
          value={filters.category}
          onChange={e => onFilterChange({ ...filters, category: e.target.value })}
          className="px-2 py-1 text-xs border border-gray-300 rounded"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={filters.difficulty}
          onChange={e => onFilterChange({ ...filters, difficulty: e.target.value })}
          className="px-2 py-1 text-xs border border-gray-300 rounded"
        >
          <option value="all">All Difficulties</option>
          {difficulties.map(difficulty => (
            <option key={difficulty} value={difficulty}>{difficulty}</option>
          ))}
        </select>
        <button
          onClick={onClear}
          className="text-xs text-blue-600 hover:underline ml-2"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
