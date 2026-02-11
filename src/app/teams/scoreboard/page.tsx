'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Coins, Sparkles, Trophy, Users } from 'lucide-react'
import TitlePage from '@/components/custom/TitlePage'
import Loader from '@/components/custom/loading'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import TeamScoreboardChart from '@/components/teams/TeamScoreboardChart'
import { getTeamScoreboard, getTopTeamProgressByNames, getTopTeamUniqueProgressByNames, TeamProgressSeries, TeamScoreboardEntry } from '@/lib/teams'
import { APP } from '@/config'
import { getEvents, filterStartedEvents } from '@/lib/events'
import EventSelect from '@/components/custom/EventSelect'
import { Event } from '@/types'

export default function TeamScoreboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<TeamScoreboardEntry[]>([])
  const [series, setSeries] = useState<TeamProgressSeries[]>([])
  const [showTotalScore, setShowTotalScore] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setLoading(true)

      // Load events for selector (UI-only; selection applied to RPC now)
      if (events.length === 0) {
        try {
          const ev = await getEvents()
          setEvents(filterStartedEvents(ev || []))
        } catch (err) {
          console.warn('Failed to fetch events:', err)
          setEvents([])
        }
      }
      // map selectedEvent to RPC params for scoreboard + progress
      const p_event_id = selectedEvent === 'all' ? null : selectedEvent === 'main' ? null : selectedEvent
      const p_event_mode = selectedEvent === 'all' ? 'any' : selectedEvent === 'main' ? 'main' : 'event'

      const { entries: data, error: scoreboardError } = await getTeamScoreboard(200, 0, p_event_id, p_event_mode)
      if (scoreboardError) {
        console.warn('Failed to fetch team scoreboard:', scoreboardError)
        setEntries([])
        setSeries([])
        setLoading(false)
        return
      }
      const list = data || []

      // Sort berdasarkan mode yang dipilih
      const sortedList = [...list].sort((a, b) => {
        const scoreA = showTotalScore ? a.total_score : a.unique_score
        const scoreB = showTotalScore ? b.total_score : b.unique_score
        return scoreB - scoreA
      })

      // Filter out teams with zero score so they don't appear on the scoreboard
      const filteredList = sortedList.filter((t) => {
        const score = showTotalScore ? (t.total_score || 0) : (t.unique_score || 0)
        return score > 0
      })

      setEntries(filteredList)

      const topNames = filteredList.slice(0, 10).map((t) => t.team_name)

      // Fetch progress only for top 10 teams with event filter
      const progressData = showTotalScore
        ? await getTopTeamProgressByNames(topNames, p_event_id, p_event_mode)
        : await getTopTeamUniqueProgressByNames(topNames, p_event_id, p_event_mode)

      // Build ordered series maintaining the rank order
      const orderedSeries = topNames
        .map((name) => progressData[name])
        .filter(Boolean) as TeamProgressSeries[]
      setSeries(orderedSeries)

      setLoading(false)
    }
    fetchData()
  }, [user, showTotalScore, selectedEvent])

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
        {/* <TitlePage icon={<Trophy size={30} className="text-yellow-500 dark:text-yellow-300" />}>Team Scoreboard</TitlePage> */}

        <div className="mb-4 flex justify-between items-center">
          <div className="relative">
            {/* Event selector */}
            <div className="inline-block">
              <EventSelect
                value={selectedEvent}
                onChange={setSelectedEvent}
                events={events}
                className="min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm px-3 py-2 rounded"
                getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
              />
            </div>
          </div>

          <span className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowTotalScore(false)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                !showTotalScore
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span
                className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                title="Unique Score"
              >
                <Sparkles size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap block">
                  Unique Score
                </span>
              </span>
            </button>
            {!APP.teams.hidescoreboardTotal && (
              <button
                onClick={() => setShowTotalScore(true)}
                className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                  showTotalScore
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
              <span
                className="flex items-center gap-1 max-w-[90px] md:max-w-none overflow-hidden"
                title="Total Score"
                >
                  <Coins size={16} className="shrink-0" />
                  <span className="truncate whitespace-nowrap block">
                    Total Score
                  </span>
                </span>
              </button>
            )}
          </span>
        </div>

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
