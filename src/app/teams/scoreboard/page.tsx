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
import { getTeamScoreboard, getTopTeamProgressByNames, getTopTeamUniqueProgressByNames, TeamProgressSeries, TeamScoreboardEntry } from '@/lib/teams'
import { APP } from '@/config'

export default function TeamScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<TeamScoreboardEntry[]>([])
  const [series, setSeries] = useState<TeamProgressSeries[]>([])
  const [showTotalScore, setShowTotalScore] = useState(false)

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

      // Sort berdasarkan mode yang dipilih
      const sortedList = [...list].sort((a, b) => {
        const scoreA = showTotalScore ? a.total_score : a.unique_score
        const scoreB = showTotalScore ? b.total_score : b.unique_score
        return scoreB - scoreA
      })
      setEntries(sortedList)

      const topNames = sortedList.slice(0, 10).map((t) => t.team_name)
      const progressMap = showTotalScore
        ? await getTopTeamProgressByNames(topNames)
        : await getTopTeamUniqueProgressByNames(topNames)
      const orderedSeries = topNames
        .map((name) => progressMap[name])
        .filter(Boolean) as TeamProgressSeries[]
      setSeries(orderedSeries)

      setLoading(false)
    }
    fetchData()
  }, [user, showTotalScore])

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

        {!APP.teams.hidescoreboardTotal && (
          <div className="w-full grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowTotalScore(false)}
              className={`w-full px-3 py-1 text-sm rounded-md transition-colors ${
                !showTotalScore
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Unique Score
            </button>
            <button
              onClick={() => setShowTotalScore(true)}
              className={`w-full px-3 py-1 text-sm rounded-md transition-colors ${
                showTotalScore
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Total Score
            </button>
          </div>
        )}

        {!loading && series.length > 0 && !showTotalScore && (
          <TeamScoreboardChart
            series={series}
            isDark={isDark}
            scoreLabel={showTotalScore ? 'Total Score' : 'Unique Score'}
          />
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
                    <TableHead className="text-right">{showTotalScore ? 'Total Score' : 'Unique Score'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, idx) => (
                    <TableRow key={entry.team_id}>
                      <TableCell className="text-center font-mono">{idx + 1}</TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/teams/${encodeURIComponent(entry.team_name)}`} className="hover:underline text-gray-900 dark:text-white">
                          {entry.team_name}
                        </Link>
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
                          <Users size={14} />
                          {entry.member_count}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                        {showTotalScore ? entry.total_score : entry.unique_score}
                      </TableCell>
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
