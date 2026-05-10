import React from 'react'
import ChallengeFilterBar from '@/features/challenges/components/ChallengeFilterBar'
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/shared/ui'
import { DEFAULT_EVENT_FILTERS } from '../lib'
import type { ChallengeLite, Event, FilterState } from '../types'

interface BulkAssignChallengesCardProps {
  events: Event[]
  filters: FilterState
  onFilterChange: React.Dispatch<React.SetStateAction<FilterState>>
  categories: string[]
  difficulties: string[]
  onSelectAllFiltered: () => void
  onClearSelection: () => void
  bulkEventId: string
  onBulkEventChange: (eventId: string) => void
  onBulkAssign: () => void
  onBulkRemove: () => void
  bulkSubmitting: boolean
  filteredChallenges: ChallengeLite[]
  selectedIds: string[]
  onToggleSelect: (challengeId: string) => void
}

const BulkAssignChallengesCard: React.FC<BulkAssignChallengesCardProps> = ({
  events,
  filters,
  onFilterChange,
  categories,
  difficulties,
  onSelectAllFiltered,
  onClearSelection,
  bulkEventId,
  onBulkEventChange,
  onBulkAssign,
  onBulkRemove,
  bulkSubmitting,
  filteredChallenges,
  selectedIds,
  onToggleSelect,
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <CardTitle className="text-gray-900 dark:text-white">Bulk Assign Challenges</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-300">Select multiple challenges, then assign or remove event.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAllFiltered}>Select All</Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>Clear</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="flex-1">
            <Label>Target Event</Label>
            <select
              value={bulkEventId}
              onChange={(event) => onBulkEventChange(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            >
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={onBulkAssign} disabled={bulkSubmitting} className="min-w-[96px]">Assign</Button>
            <Button variant="secondary" onClick={onBulkRemove} disabled={bulkSubmitting} className="min-w-[120px]">Remove Event</Button>
          </div>
        </div>

        <div className="mt-3">
          <ChallengeFilterBar
            filters={filters}
            categories={categories}
            difficulties={difficulties}
            onFilterChange={onFilterChange}
            onClear={() => onFilterChange(DEFAULT_EVENT_FILTERS)}
            showStatusFilter={false}
          />
        </div>

        <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md max-h-[360px] overflow-auto bg-white dark:bg-gray-800">
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">No challenges found</div>
          ) : (
            filteredChallenges.map((challenge) => (
              <label key={challenge.id} className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(challenge.id)}
                  onChange={() => onToggleSelect(challenge.id)}
                  className="h-4 w-4 accent-primary-500"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{challenge.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                    {challenge.category || 'Uncategorized'} {'\u2022'} {challenge.difficulty || 'Unknown'} {'\u2022'} {challenge.event_id ? 'Event' : 'Main'}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Selected: {selectedIds.length}</div>
      </CardContent>
    </Card>
  )
}

export default BulkAssignChallengesCard

