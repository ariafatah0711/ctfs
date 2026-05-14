import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { LeaderboardEntry } from '@/shared/types'
import { SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS } from '@/shared/styles'

interface ScoreboardTableProps {
  leaderboard: LeaderboardEntry[]
  currentUsername?: string
  /** Optional event filter to include when linking to the full scoreboard */
  eventId?: string | null | 'all'
  /** Optional label to show for the score column (defaults to "Score") */
  scoreColumnLabel?: string
  /** Optional renderer for the score column; receives the entry and should return a node */
  scoreColumnRenderer?: (entry: LeaderboardEntry) => React.ReactNode
  /** Whether to show the "Show All" link when on the main scoreboard page (defaults to true) */
  showAllLink?: boolean
}

const ScoreboardTable: React.FC<ScoreboardTableProps> = ({ leaderboard, currentUsername, eventId, scoreColumnLabel, scoreColumnRenderer, showAllLink = true }) => {
  const pathname = usePathname()

  return (
    <Card className={SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Ranking</CardTitle>
        {pathname === '/scoreboard' &&
          showAllLink &&
          leaderboard.length >= 100 &&
          (() => {
            let href = '/scoreboard/all'
            if (eventId !== undefined && eventId !== 'all') {
              if (eventId === null) {
                href += '?event_id=main'
              } else {
                href += `?event_id=${encodeURIComponent(String(eventId))}`
              }
            }
            return (
              <Link href={href}>
                <Button variant="default" size="sm">Show All</Button>
              </Link>
            )
          })()}
      </CardHeader>
      <CardContent>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center text-gray-700 dark:text-gray-200">Rank</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200">User</TableHead>
                <TableHead className="w-24 text-center text-gray-700 dark:text-gray-200">{scoreColumnLabel ?? 'Score'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, i) => {
                const isCurrentUser = entry.username === currentUsername
                return (
                  <TableRow
                    key={entry.username}
                    className={`
                      transition-colors duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-600
                      ${isCurrentUser
                        ? 'bg-gray-100 dark:bg-gray-700 font-semibold'
                        : ''
                      }
                    `}
                  >
                    <TableCell className="text-center font-mono text-gray-600 dark:text-gray-300">{i + 1}</TableCell>
                    <TableCell>
                      <Link
                        href={`/user/${encodeURIComponent(entry.username)}`}
                        className={`hover:underline ${isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'hover:text-blue-600 dark:hover:text-blue-400'
                          } max-w-[120px] md:max-w-xs truncate whitespace-nowrap block`}
                        title={entry.username}
                      >
                        {entry.username}
                      </Link>
                    </TableCell>
                    <TableCell className="w-24 text-center font-medium text-gray-900 dark:text-white">
                      <span>
                        {scoreColumnRenderer ? scoreColumnRenderer(entry) : entry.score}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScoreboardTable
