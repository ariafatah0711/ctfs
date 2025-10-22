import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from '../ui/button'
import { LeaderboardEntry } from '@/types'
interface ScoreboardTableProps {
  leaderboard: LeaderboardEntry[]
  currentUsername?: string
}

const ScoreboardTable: React.FC<ScoreboardTableProps> = ({ leaderboard, currentUsername }) => {
  const pathname = usePathname()

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Ranking</CardTitle>
        {pathname === '/scoreboard' && (
          <Link href="/scoreboard/all">
            <Button variant="default" size="sm">Show All</Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-center text-gray-700 dark:text-gray-200">Rank</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-200">User</TableHead>
              <TableHead className="text-center text-gray-700 dark:text-gray-200">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry, i) => {
              const isCurrentUser = entry.username === currentUsername
              return (
                  <TableRow
                    key={entry.username}
                    className={`
                      transition-colors hover:bg-gray-100 dark:hover:bg-gray-600
                      ${
                        isCurrentUser
                          ? 'bg-gray-100 dark:bg-gray-700 font-semibold'
                          : ''
                      }
                    `}
                  >
                  <TableCell className="text-center font-mono text-gray-600 dark:text-gray-300">{i + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`/user/${encodeURIComponent(entry.username)}`}
                      className={`hover:underline ${
                        isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'hover:text-blue-600 dark:hover:text-blue-400'
                      } max-w-[120px] md:max-w-xs truncate whitespace-nowrap block`}
                      title={entry.username}
                    >
                      {entry.username}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center font-medium text-gray-900 dark:text-white">{entry.score}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default ScoreboardTable
