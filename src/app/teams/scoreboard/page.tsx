'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Users } from 'lucide-react'
import TitlePage from '@/components/custom/TitlePage'
import Loader from '@/components/custom/loading'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import TeamScoreboardChart from '@/components/teams/TeamScoreboardChart'
import { getTeamScoreboard, getTopTeamProgressByNames, TeamProgressSeries, TeamScoreboardEntry } from '@/lib/teams'

export default function TeamScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<TeamScoreboardEntry[]>([])
  const [series, setSeries] = useState<TeamProgressSeries[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setLoading(true)
      const { entries: data } = await getTeamScoreboard(200, 0)
      const list = data || []
      setEntries(list)

      const topNames = list.slice(0, 10).map((t) => t.team_name)
      const progressMap = await getTopTeamProgressByNames(topNames)
      const orderedSeries = topNames
        .map((name) => progressMap[name])
        .filter(Boolean) as TeamProgressSeries[]
      setSeries(orderedSeries)

      setLoading(false)
    }
    fetchData()
  }, [user])

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-orange-500" />
      </div>
    )
  }

  if (!user) return null

  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <TitlePage icon={<Trophy size={30} className="text-yellow-500 dark:text-yellow-300" />}>Team Scoreboard</TitlePage>

        {!loading && series.length > 0 && (
          <TeamScoreboardChart series={series} isDark={isDark} />
        )}

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={18} /> Teams Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader fullscreen color="text-orange-500" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-300">No teams yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Rank</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Challenges</TableHead>
                    <TableHead className="text-center">Solves</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.team_id}>
                      <TableCell className="text-center font-mono">{entry.rank}</TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/teams/${encodeURIComponent(entry.team_name)}`} className="hover:underline text-gray-900 dark:text-white">
                          {entry.team_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{entry.score}</TableCell>
                      <TableCell className="text-center">{entry.unique_challenges}</TableCell>
                      <TableCell className="text-center">{entry.total_solves}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
