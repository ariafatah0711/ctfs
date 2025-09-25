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

const ChallengeListItem: React.FC<ChallengeListItemProps> = ({
  challenge,
  onEdit,
  onDelete,
  onViewFlag,
  onToggleActive,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-2">
      <div className="flex items-center gap-2 truncate">
        <Badge className={challenge.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : challenge.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}>
          {challenge.difficulty}
        </Badge>
        <div className="min-w-0">
          <div className="font-medium truncate text-gray-900 dark:text-white">{challenge.title}</div>
          <div className="text-xs text-muted-foreground dark:text-gray-300 truncate">{challenge.category} • {challenge.points} pts</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Switch checked={challenge.is_active} onCheckedChange={async (checked) => onToggleActive(challenge.id, checked)} />
        <Button variant="ghost" size="sm" onClick={() => onEdit(challenge)}>✏️</Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(challenge.id)}>🗑️</Button>
        <Button variant="ghost" size="sm" onClick={() => onViewFlag(challenge.id)}>
          <span className="hidden sm:inline">🏳️ View Flag</span>
          <span className="sm:hidden">🏳️ Flag</span>
        </Button>
      </div>
    </div>
  )
}

export default ChallengeListItem
