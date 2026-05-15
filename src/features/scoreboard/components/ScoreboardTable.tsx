import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { LeaderboardEntry } from '@/shared/types'
import { cn } from '@/shared/lib/utils'
import {
  BaseScoreboardCard,
  BaseScoreboardColumn,
  BaseScoreboardRankBadge,
  BaseScoreboardTable,
} from './base'

interface ScoreboardTableProps {
  leaderboard: LeaderboardEntry[]
  currentUsername?: string
  /** Optional event filter to include when linking to the full scoreboard */
  eventId?: string | null | 'all'
  /** Optional label to show for the score column (defaults to "Score") */
  scoreColumnLabel?: string
  /** Optional renderer for the score column; receives the entry and should return a node */
  scoreColumnRenderer?: (entry: LeaderboardEntry) => React.ReactNode
  /** Callback to trigger when showing all entries */
  onShowAll?: () => void
  /** Custom label for missing rank badge */
  missingLabel?: string
}

const ScoreboardTable: React.FC<ScoreboardTableProps> = ({
  leaderboard,
  currentUsername,
  eventId,
  scoreColumnLabel,
  scoreColumnRenderer,
  onShowAll,
  missingLabel
}) => {
  const currentUserIndex = currentUsername
    ? leaderboard.findIndex((entry) => entry.username === currentUsername)
    : -1
  const currentUserEntry = currentUserIndex >= 0 ? leaderboard[currentUserIndex] : null
  const currentUserRank = currentUserEntry ? currentUserIndex + 1 : null
  const rowHref = currentUserRank ? `#scoreboard-row-${currentUserRank}` : null
  const resolvedScoreLabel = scoreColumnLabel ?? 'Score'

  const columns: BaseScoreboardColumn<LeaderboardEntry>[] = [
    {
      key: 'rank',
      header: 'Rank',
      headerClassName: 'w-16 text-center',
      cellClassName: 'w-16 text-center font-mono text-gray-500 dark:text-gray-300',
      render: (_entry, index) => index + 1,
    },
    {
      key: 'user',
      header: 'User',
      render: (entry) => {
        const isCurrentUser = entry.username === currentUsername

        return (
          <Link
            href={`/user/${encodeURIComponent(entry.username)}`}
            className={cn(
              'block max-w-[120px] truncate whitespace-nowrap font-medium transition-colors hover:text-blue-600 hover:underline dark:hover:text-blue-400 md:max-w-xs',
              isCurrentUser && 'text-blue-700 dark:text-blue-300'
            )}
            title={entry.username}
          >
            {entry.username}
          </Link>
        )
      },
    },
    {
      key: 'score',
      header: resolvedScoreLabel,
      headerClassName: 'w-24 text-center',
      cellClassName: 'w-24 text-center font-semibold text-gray-900 dark:text-white',
      render: (entry) => scoreColumnRenderer ? scoreColumnRenderer(entry) : entry.score,
    },
  ]

  return (
    <BaseScoreboardCard
      title="Ranking"
      icon={Trophy}
      headerCenter={
        currentUsername ? (
          <BaseScoreboardRankBadge
            label="Your Rank"
            rank={currentUserRank}
            score={currentUserEntry?.score}
            scoreLabel={resolvedScoreLabel}
            rowHref={rowHref}
            missingLabel={missingLabel ?? 'Not ranked yet'}
          />
        ) : null
      }
      action={
        onShowAll &&
        leaderboard.length >= 100 &&
        (
          <Button variant="default" size="sm" onClick={onShowAll}>
            Show All
          </Button>
        )
      }
      contentClassName="p-0"
    >
      <BaseScoreboardTable
        entries={leaderboard}
        columns={columns}
        getRowKey={(entry) => entry.username}
        getRowId={(_entry, index) => `scoreboard-row-${index + 1}`}
        getRowClassName={(entry) =>
          entry.username === currentUsername
            ? 'bg-blue-50/60 font-semibold dark:bg-blue-900/20'
            : undefined
        }
      />
    </BaseScoreboardCard>
  )
}

export default ScoreboardTable
