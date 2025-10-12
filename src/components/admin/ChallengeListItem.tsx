import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Challenge } from '@/types'

interface ChallengeListItemProps {
  challenge: Challenge
  onEdit: (challenge: Challenge) => void
  onDelete: (id: string) => void
  onViewFlag: (id: string) => void
  onToggleActive: (id: string, checked: boolean) => Promise<void>
}

const DifficultyBadge: React.FC<{ difficulty?: string }> = ({ difficulty }) => {
  const base = 'inline-block min-w-[64px] text-center text-xs font-semibold'
  if (difficulty === 'Easy') return <Badge className={'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white ' + base}>{difficulty}</Badge>
  if (difficulty === 'Medium') return <Badge className={'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-white ' + base}>{difficulty}</Badge>
  return <Badge className={'bg-red-100 text-red-800 dark:bg-red-600 dark:text-white ' + base}>{difficulty ?? 'N/A'}</Badge>
}

const ChallengeListItem: React.FC<ChallengeListItemProps> = ({
  challenge,
  onEdit,
  onDelete,
  onViewFlag,
  onToggleActive,
}) => {
  return (
  <div className="w-full px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 order-2 sm:order-1">
          <DifficultyBadge difficulty={challenge.difficulty} />

          <div className="min-w-0">
            <div className="font-medium truncate text-gray-900 dark:text-white">{challenge.title}</div>
            <div className="text-xs text-muted-foreground dark:text-gray-300 truncate flex items-center gap-2">
              <span className="truncate">{challenge.category} • {challenge.points} pts</span>
              {challenge.is_dynamic && (
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-600 dark:text-white px-1 py-0.5">
                  <span className="inline-block min-w-[14px] text-center text-[10px] leading-4 font-semibold">D</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-start sm:justify-end order-1 sm:order-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-300">
              <span className="hidden sm:inline">Active</span>
              <Switch checked={challenge.is_active} onCheckedChange={async (checked) => onToggleActive(challenge.id, checked)} />
            </label>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(challenge)} aria-label={`Edit ${challenge.title}`}>✏️</Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(challenge.id)} aria-label={`Delete ${challenge.title}`}>🗑️</Button>
            <Button variant="ghost" size="sm" onClick={() => onViewFlag(challenge.id)} aria-label={`View flag for ${challenge.title}`}>
              <span className="hidden sm:inline">🏳️ View Flag</span>
              <span className="sm:hidden">🏳️</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChallengeListItem
